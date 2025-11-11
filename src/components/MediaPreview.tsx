/**
 * MediaPreview Component
 * Enhanced preview for uploaded media with better UI
 */

'use client'

import React from 'react'
import { MediaItem } from '@/lib/interface'
import { formatFileSize, formatDuration } from '@/lib/media-utils'
import Image from 'next/image'

interface MediaPreviewProps {
  media: MediaItem[]
  onRemove?: (index: number) => void
  onImageClick?: (index: number) => void
  showRemoveButton?: boolean
  maxWidth?: string
}

export function MediaPreview({
  media,
  onRemove,
  onImageClick,
  showRemoveButton = true,
  maxWidth = '100%',
}: MediaPreviewProps) {
  if (media.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2" style={{ maxWidth }}>
      {media.map((item, index) => (
        <MediaPreviewItem
          key={index}
          item={item}
          index={index}
          onRemove={onRemove}
          onImageClick={onImageClick}
          showRemoveButton={showRemoveButton}
        />
      ))}
    </div>
  )
}

interface MediaPreviewItemProps {
  item: MediaItem
  index: number
  onRemove?: (index: number) => void
  onImageClick?: (index: number) => void
  showRemoveButton: boolean
}

function MediaPreviewItem({
  item,
  index,
  onRemove,
  onImageClick,
  showRemoveButton,
}: MediaPreviewItemProps) {
  return (
    <div className="relative group">
      {/* Remove Button */}
      {showRemoveButton && onRemove && (
        <button
          onClick={() => onRemove(index)}
          className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Remove"
        >
          <svg
            className="w-4 h-4"
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

      {/* Image Preview */}
      {item.type === 'image' && (
        <div
          className="relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick?.(index)}
          style={{ width: '120px', height: '120px' }}
        >
          <Image
            src={item.url || ''}
            alt={item.fileName || 'Image'}
            fill
            className="object-cover"
          />
          {/* Image Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-xs truncate">{item.fileName}</p>
            {item.fileSize && (
              <p className="text-white text-xs">
                {formatFileSize(item.fileSize)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Video Preview */}
      {item.type === 'video' && (
        <div
          className="relative rounded-lg overflow-hidden bg-gray-100"
          style={{ width: '120px', height: '120px' }}
        >
          <video src={item.url} className="w-full h-full object-cover" muted />
          {/* Play Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <svg
              className="w-12 h-12 text-white opacity-80"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          {/* Duration Badge */}
          {item.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(item.duration)}
            </div>
          )}
        </div>
      )}

      {/* Audio Preview */}
      {item.type === 'audio' && (
        <div
          className="relative rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 p-4 flex flex-col items-center justify-center"
          style={{ width: '120px', height: '120px' }}
        >
          <svg
            className="w-12 h-12 text-purple-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          {item.duration && (
            <p className="text-purple-700 text-xs font-medium">
              {formatDuration(item.duration)}
            </p>
          )}
        </div>
      )}

      {/* File Preview */}
      {item.type === 'file' && (
        <div
          className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 p-4 flex flex-col items-center justify-center"
          style={{ width: '120px', height: '120px' }}
        >
          <svg
            className="w-12 h-12 text-gray-600 mb-2"
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
          {item.fileName && (
            <p className="text-gray-700 text-xs text-center truncate w-full px-2">
              {item.fileName.split('.').pop()?.toUpperCase()}
            </p>
          )}
        </div>
      )}

      {/* File Name & Size */}
      <div className="mt-1 max-w-[120px]">
        <p className="text-xs text-gray-700 truncate" title={item.fileName}>
          {item.fileName}
        </p>
        {item.fileSize && (
          <p className="text-xs text-gray-500">
            {formatFileSize(item.fileSize)}
          </p>
        )}
      </div>
    </div>
  )
}
