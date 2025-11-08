/**
 * Media Upload Utilities
 * S3 presigned URL upload, file validation, image processing
 */

import { MediaItem } from './interface'

// ============================================
// File Validation
// ============================================

const MAX_FILE_SIZE = {
  image: 5 * 1024 * 1024, // 5MB
  audio: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  file: 10 * 1024 * 1024, // 10MB
}

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/m4a',
    'audio/mp4',
    'audio/x-m4a',
    'audio/webm',
  ],
  video: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  file: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
}

export interface FileValidationResult {
  valid: boolean
  error?: string
  mediaType?: 'image' | 'audio' | 'video' | 'file'
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): FileValidationResult {
  // Determine media type
  let mediaType: 'image' | 'audio' | 'video' | 'file' | undefined

  for (const [type, mimeTypes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimeTypes.includes(file.type)) {
      mediaType = type as 'image' | 'audio' | 'video' | 'file'
      break
    }
  }

  if (!mediaType) {
    return {
      valid: false,
      error: `지원하지 않는 파일 형식입니다: ${file.type}`,
    }
  }

  // Check file size
  const maxSize = MAX_FILE_SIZE[mediaType]
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0)
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 업로드 가능합니다.`,
    }
  }

  return { valid: true, mediaType }
}

// ============================================
// Image Processing
// ============================================

/**
 * Get image dimensions from file
 */
export function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Get video dimensions and duration
 */
export function getVideoDimensions(
  file: File,
): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Math.round(video.duration),
      })
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video'))
    }

    video.src = url
  })
}

/**
 * Get audio duration
 */
export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    const url = URL.createObjectURL(file)

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(Math.round(audio.duration))
    }

    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio'))
    }

    audio.src = url
  })
}

// ============================================
// S3 Upload
// ============================================

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadToS3Options {
  onProgress?: (progress: UploadProgress) => void
}

/**
 * Upload file to S3 using presigned URL
 * Returns MediaItem with metadata
 */
export async function uploadToS3(
  file: File,
  options?: UploadToS3Options,
): Promise<MediaItem> {
  // 1. Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const mediaType = validation.mediaType!

  // 2. Get presigned URL from backend
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.')
  }

  const presignedResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/media/upload-url`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        mediaType,
        fileSize: file.size,
      }),
    },
  )

  if (!presignedResponse.ok) {
    const errorData = await presignedResponse.json()
    throw new Error(errorData.error || 'Presigned URL 요청에 실패했습니다.')
  }

  const { uploadUrl, fileKey } = await presignedResponse.json()

  // 3. Upload to S3 with progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // Track upload progress
    if (options?.onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          options.onProgress?.({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          })
        }
      })
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve()
      } else {
        reject(new Error(`S3 업로드 실패: ${xhr.statusText}`))
      }
    })

    xhr.addEventListener('error', (e) => {
      console.error('S3 업로드 중 네트워크 오류가 발생했습니다.', e)
      reject(new Error('S3 업로드 중 네트워크 오류가 발생했습니다.'))
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('업로드가 취소되었습니다.'))
    })

    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })

  // 4. Get metadata based on media type
  const mediaItem: MediaItem = {
    type: mediaType,
    key: fileKey, // Store S3 key for database
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  }

  try {
    if (mediaType === 'image') {
      const dimensions = await getImageDimensions(file)
      mediaItem.width = dimensions.width
      mediaItem.height = dimensions.height
    } else if (mediaType === 'video') {
      const metadata = await getVideoDimensions(file)
      mediaItem.width = metadata.width
      mediaItem.height = metadata.height
      mediaItem.duration = metadata.duration
    } else if (mediaType === 'audio') {
      const duration = await getAudioDuration(file)
      mediaItem.duration = duration
    }
  } catch (error) {
    console.warn('Failed to extract media metadata:', error)
    // Continue without metadata
  }

  return mediaItem
}

/**
 * Upload multiple files in parallel
 */
export async function uploadMultipleToS3(
  files: File[],
  options?: UploadToS3Options,
): Promise<MediaItem[]> {
  const promises = files.map((file) => uploadToS3(file, options))
  return Promise.all(promises)
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Create object URL for file preview
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revoke object URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}
