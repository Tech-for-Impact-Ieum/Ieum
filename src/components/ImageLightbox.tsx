/**
 * ImageLightbox Component
 * Full-screen image viewer with zoom and navigation
 */

'use client'

import React, { useEffect, useState } from 'react'
import { MediaItem } from '@/lib/interface'
import Image from 'next/image'
import { Modal } from './ui/Modal'

interface ImageLightboxProps {
  images: MediaItem[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export function ImageLightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, images.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setIsZoomed(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setIsZoomed(false)
  }

  const currentImage = images[currentIndex]

  if (!isOpen || !currentImage) return null

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
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

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
            aria-label="Previous image"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
            aria-label="Next image"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Zoom Toggle */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
          aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
        >
          {isZoomed ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          )}
        </button>

        {/* Download Button */}
        <a
          href={currentImage.url}
          download={currentImage.fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
          aria-label="Download image"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </a>

        {/* Main Image */}
        <div
          className={`relative transition-all duration-300 ${
            isZoomed ? 'w-full h-full' : 'max-w-4xl max-h-[80vh] w-auto h-auto'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <Image
            src={currentImage.url || ''}
            alt={currentImage.fileName || 'Image'}
            width={currentImage.width || 1200}
            height={currentImage.height || 800}
            className={`w-full h-full transition-all duration-300 ${
              isZoomed
                ? 'object-contain cursor-zoom-out'
                : 'object-contain cursor-zoom-in'
            }`}
            priority
          />
        </div>

        {/* Image Info */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg max-w-md">
          <p className="text-sm font-medium truncate">
            {currentImage.fileName}
          </p>
          {currentImage.width && currentImage.height && (
            <p className="text-xs text-gray-300">
              {currentImage.width} × {currentImage.height}
            </p>
          )}
        </div>

        {/* Thumbnail Strip (for multiple images) */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg max-w-xl overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsZoomed(false)
                }}
                className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 transition-all ${
                  index === currentIndex
                    ? 'ring-2 ring-white scale-110'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.url || ''}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
