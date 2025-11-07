'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Modal'
import { Button } from '@/components/ui/Button'
import { MediaItem } from '@/lib/interface'
import { X, PlayCircle } from 'lucide-react'

interface MediaPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (media: MediaItem[]) => void
}

interface MediaFile {
  file: File
  type: 'image' | 'video'
  previewUrl: string
}

export function MediaPickerModal({
  open,
  onOpenChange,
  onSend,
}: MediaPickerModalProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const mediaFiles: MediaFile[] = []

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        mediaFiles.push({
          file,
          type: 'image',
          previewUrl: URL.createObjectURL(file),
        })
      } else if (file.type.startsWith('video/')) {
        mediaFiles.push({
          file,
          type: 'video',
          previewUrl: URL.createObjectURL(file),
        })
      }
    })

    if (mediaFiles.length === 0) {
      alert('이미지 또는 동영상 파일만 선택할 수 있습니다.')
      return
    }

    setSelectedMedia((prev) => [...prev, ...mediaFiles])
  }

  const handleRemoveMedia = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(selectedMedia[index].previewUrl)
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadAndSend = async () => {
    if (selectedMedia.length === 0) return

    setIsUploading(true)

    try {
      const uploadedMedia: MediaItem[] = []

      for (const mediaFile of selectedMedia) {
        const formData = new FormData()
        formData.append('file', mediaFile.file)

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          },
        )

        if (!response.ok) {
          throw new Error(`Failed to upload ${mediaFile.type}`)
        }

        const data = await response.json()

        if (data.ok && data.url) {
          const mediaItem: MediaItem = {
            type: mediaFile.type,
            url: data.url,
            fileName: mediaFile.file.name,
            fileSize: mediaFile.file.size,
          }

          // Add duration for video files if available
          if (mediaFile.type === 'video') {
            // You could extract video duration here if needed
            // For now, we'll let the backend handle it or set it later
          }

          uploadedMedia.push(mediaItem)
        }
      }

      // Send all uploaded media
      onSend(uploadedMedia)

      // Clean up
      selectedMedia.forEach((media) => URL.revokeObjectURL(media.previewUrl))
      setSelectedMedia([])
      onOpenChange(false)
    } catch (error) {
      console.error('Error uploading media:', error)
      alert('미디어 업로드에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    // Clean up preview URLs
    selectedMedia.forEach((media) => URL.revokeObjectURL(media.previewUrl))
    setSelectedMedia([])
    onOpenChange(false)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">미디어 선택</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Select media button */}
          <Button
            onClick={handleButtonClick}
            variant="outline"
            className="w-full"
            disabled={isUploading}
          >
            이미지/동영상 선택
          </Button>

          {/* Preview selected media */}
          {selectedMedia.length > 0 && (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {selectedMedia.map((media, index) => (
                <div key={index} className="relative">
                  {media.type === 'image' ? (
                    <img
                      src={media.previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="relative w-full h-32 bg-black rounded-lg">
                      <video
                        src={media.previewUrl}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle
                          size={48}
                          className="text-white opacity-80"
                        />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                    disabled={isUploading}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedMedia.length > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              {selectedMedia.filter((m) => m.type === 'image').length}개의
              이미지, {selectedMedia.filter((m) => m.type === 'video').length}
              개의 동영상 선택됨
            </p>
          )}
        </div>

        <div className="flex justify-center gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="min-w-[120px]"
            disabled={isUploading}
          >
            닫기
          </Button>
          <Button
            onClick={handleUploadAndSend}
            className="min-w-[120px]"
            disabled={selectedMedia.length === 0 || isUploading}
          >
            {isUploading ? '업로드 중...' : '전송'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
