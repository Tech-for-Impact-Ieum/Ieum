/**
 * MediaUploader Component
 * File selection, drag & drop, upload to S3 with progress
 */

'use client'

import React, { useState, useRef, useCallback } from 'react'
import { MediaItem } from '@/lib/interface'
import {
  uploadToS3,
  validateFile,
  formatFileSize,
  createPreviewUrl,
  revokePreviewUrl,
  UploadProgress,
} from '@/lib/media-utils'
import { Button } from './ui/Button'
import { MediaPreview } from './MediaPreview'

interface MediaUploaderProps {
  onUploadComplete: (media: MediaItem[]) => void
  onUploadStart?: () => void
  maxFiles?: number
  acceptTypes?: 'image' | 'audio' | 'video' | 'all'
}

interface PendingFile {
  id: string
  file: File
  previewUrl?: string
  uploading: boolean
  uploadProgress: number
  error?: string
  mediaItem?: MediaItem
}

export function MediaUploader({
  onUploadComplete,
  onUploadStart,
  maxFiles = 5,
  acceptTypes = 'all',
}: MediaUploaderProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Accept attribute for file input
  const getAcceptAttribute = () => {
    switch (acceptTypes) {
      case 'image':
        return 'image/jpeg,image/png,image/gif,image/webp'
      case 'audio':
        return 'audio/mpeg,audio/wav,audio/m4a,audio/mp4'
      case 'video':
        return 'video/mp4,video/quicktime'
      default:
        return '*/*'
    }
  }

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const fileArray = Array.from(files)

      // Check max files limit
      if (pendingFiles.length + fileArray.length > maxFiles) {
        alert(`최대 ${maxFiles}개 파일까지만 업로드할 수 있습니다.`)
        return
      }

      // Validate and add files
      const newPendingFiles: PendingFile[] = []

      for (const file of fileArray) {
        const validation = validateFile(file)

        if (!validation.valid) {
          alert(`${file.name}: ${validation.error}`)
          continue
        }

        // Create preview URL for images
        let previewUrl: string | undefined
        if (file.type.startsWith('image/')) {
          previewUrl = createPreviewUrl(file)
        }

        newPendingFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          previewUrl,
          uploading: false,
          uploadProgress: 0,
        })
      }

      if (newPendingFiles.length > 0) {
        setPendingFiles((prev) => [...prev, ...newPendingFiles])
      }
    },
    [pendingFiles.length, maxFiles],
  )

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      handleFileSelect(files)
    },
    [handleFileSelect],
  )

  // Remove file from pending list
  const removeFile = useCallback((id: string) => {
    setPendingFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.previewUrl) {
        revokePreviewUrl(file.previewUrl)
      }
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  // Upload all pending files
  const uploadAll = useCallback(async () => {
    if (pendingFiles.length === 0) return

    onUploadStart?.()

    const uploadPromises = pendingFiles.map(async (pendingFile) => {
      // Update uploading status
      setPendingFiles((prev) =>
        prev.map((f) =>
          f.id === pendingFile.id
            ? { ...f, uploading: true, error: undefined }
            : f,
        ),
      )

      try {
        const mediaItem = await uploadToS3(pendingFile.file, {
          onProgress: (progress: UploadProgress) => {
            setPendingFiles((prev) =>
              prev.map((f) =>
                f.id === pendingFile.id
                  ? { ...f, uploadProgress: progress.percentage }
                  : f,
              ),
            )
          },
        })

        // Mark as complete
        setPendingFiles((prev) =>
          prev.map((f) =>
            f.id === pendingFile.id
              ? { ...f, uploading: false, uploadProgress: 100, mediaItem }
              : f,
          ),
        )

        return mediaItem
      } catch (error) {
        console.error('Upload failed:', error)
        const errorMessage =
          error instanceof Error ? error.message : '업로드에 실패했습니다.'

        setPendingFiles((prev) =>
          prev.map((f) =>
            f.id === pendingFile.id
              ? { ...f, uploading: false, error: errorMessage }
              : f,
          ),
        )

        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter(
      (item): item is MediaItem => item !== null,
    )

    if (successfulUploads.length > 0) {
      onUploadComplete(successfulUploads)

      // Clean up
      pendingFiles.forEach((file) => {
        if (file.previewUrl) {
          revokePreviewUrl(file.previewUrl)
        }
      })

      setPendingFiles([])
    }
  }, [pendingFiles, onUploadStart, onUploadComplete])

  // Clear all files
  const clearAll = useCallback(() => {
    pendingFiles.forEach((file) => {
      if (file.previewUrl) {
        revokePreviewUrl(file.previewUrl)
      }
    })
    setPendingFiles([])
  }, [pendingFiles])

  return (
    <div className="w-full">
      {/* File Input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptAttribute()}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Drag & Drop Area */}
      {pendingFiles.length === 0 && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8
            text-center cursor-pointer transition-all duration-300 ease-in-out
            ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex flex-col items-center gap-2">
            <svg
              className={`w-12 h-12 transition-all duration-300 ${
                isDragging ? 'text-blue-500 scale-110' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p
              className={`text-sm font-medium transition-colors ${
                isDragging ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {isDragging
                ? '파일을 놓아주세요!'
                : '클릭하거나 파일을 드래그하여 업로드'}
            </p>
            <p className="text-xs text-gray-400">
              최대 {maxFiles}개 파일 (이미지: 5MB, 음성: 10MB, 비디오: 100MB)
            </p>
          </div>
        </div>
      )}

      {/* File List with Animation */}
      {pendingFiles.length > 0 && (
        <div className="space-y-3 animate-fadeIn">
          {/* Add more files button */}
          {pendingFiles.length < maxFiles && (
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-4
                text-center cursor-pointer transition-all duration-300
                ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className={`w-5 h-5 transition-colors ${
                    isDragging ? 'text-blue-500' : 'text-gray-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p
                  className={`text-sm transition-colors ${
                    isDragging ? 'text-blue-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  {isDragging ? '파일을 놓아주세요!' : '파일 추가하기'}
                </p>
              </div>
            </div>
          )}

          {/* File previews */}
          {pendingFiles.map((pendingFile, index) => (
            <div
              key={pendingFile.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow animate-slideIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Preview */}
              {pendingFile.previewUrl ? (
                <img
                  src={pendingFile.previewUrl}
                  alt={pendingFile.file.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {pendingFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(pendingFile.file.size)}
                </p>

                {/* Progress Bar with Animation */}
                {pendingFile.uploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${pendingFile.uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      {pendingFile.uploadProgress}% 업로드 중...
                    </p>
                  </div>
                )}

                {/* Error with Animation */}
                {pendingFile.error && (
                  <div className="flex items-center gap-1 mt-1 animate-shake">
                    <svg
                      className="w-3 h-3 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-red-500">{pendingFile.error}</p>
                  </div>
                )}

                {/* Success with Animation */}
                {pendingFile.mediaItem && !pendingFile.uploading && (
                  <div className="flex items-center gap-1 mt-1 animate-bounce-once">
                    <svg
                      className="w-3 h-3 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-green-600 font-medium">
                      업로드 완료
                    </p>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              {!pendingFile.uploading && (
                <button
                  onClick={() => removeFile(pendingFile.id)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                  aria-label="Remove file"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* Action Buttons with improved styling */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={uploadAll}
              disabled={pendingFiles.some((f) => f.uploading)}
              className="flex-1 relative overflow-hidden group"
            >
              <span className="relative z-10">
                {pendingFiles.some((f) => f.uploading) ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    업로드 중...
                  </span>
                ) : (
                  `${pendingFiles.length}개 파일 업로드`
                )}
              </span>
            </Button>
            <Button
              onClick={clearAll}
              variant="secondary"
              disabled={pendingFiles.some((f) => f.uploading)}
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
