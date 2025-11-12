/**
 * AudioPlayer Component
 * Custom audio player with waveform visualization
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { formatDuration } from '@/lib/media-utils'

interface AudioPlayerProps {
  src: string
  duration?: number
  fileName?: string
  className?: string
  variant?: 'compact' | 'full'
}

export function AudioPlayer({
  src,
  duration,
  fileName,
  className = '',
  variant = 'compact',
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setAudioDuration(Math.round(audio.duration))
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(Math.round(audio.currentTime))
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleError = () => {
      setIsLoading(false)
      console.error('Audio loading error')
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [src])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseInt(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0

  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm ${className}`}
      >
        <audio ref={audioRef} src={src} preload="metadata" />

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <svg
              className="w-5 h-5 text-white animate-spin"
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
          ) : isPlaying ? (
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 min-w-0">
          <input
            type="range"
            min="0"
            max={audioDuration}
            value={currentTime}
            onChange={handleSeek}
            disabled={isLoading}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {formatDuration(currentTime)}
            </span>
            <span className="text-xs text-gray-500">
              {formatDuration(audioDuration)}
            </span>
          </div>
        </div>

        {/* Waveform Icon */}
        <div className="flex-shrink-0">
          <svg
            className={`w-6 h-6 text-blue-500 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 3v18M8 6v12M16 6v12M4 9v6M20 9v6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    )
  }

  // Full variant
  return (
    <div>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* File Name */}
      {fileName && (
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-purple-600"
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
          <span className="text-sm font-medium text-gray-700 truncate">
            {fileName}
          </span>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 flex items-center justify-center transition-all shadow-lg"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <svg
              className="w-6 h-6 text-white animate-spin"
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
          ) : isPlaying ? (
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
