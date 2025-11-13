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
  const [playbackRate, setPlaybackRate] = useState(0.8)
  const audioRef = useRef<HTMLAudioElement>(null)
  const speedOptions = [0.8, 1.0, 1.2]
  const speedLabels: { [key: number]: string } = {
    0.8: '느리게',
    1.0: '보통',
    1.2: '빠르게',
  }
  const handleSpeedChange = (increment: boolean) => {
    const currentIndex = speedOptions.indexOf(playbackRate)

    if (increment && currentIndex < speedOptions.length - 1) {
      setPlaybackRate(speedOptions[currentIndex + 1])
    } else if (!increment && currentIndex > 0) {
      setPlaybackRate(speedOptions[currentIndex - 1])
    }
  }

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

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = playbackRate
  }, [playbackRate])

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

  const speedControlRelative = (
    <div className="flex flex-col items-center gap-1">
      {/* <div className="text-sm">속도 조절</div> */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full px-2 py-1 shadow-sm">
        {/* Slower Button */}
        <button
          onClick={() => handleSpeedChange(false)}
          disabled={isLoading || playbackRate <= 0.6}
          className="p-1.5 rounded-full bg-white text-gray-600 hover:bg-purple-100 hover:text-purple-600 active:bg-purple-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 transition-all"
          aria-label="느리게"
          title="느리게"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            {/* Double triangle pointing left (rewind/slower) */}
            <path d="M11 6v12l-8.5-6L11 6z" />
            <path d="M21.5 6v12l-8.5-6 8.5-6z" />
          </svg>
        </button>

        {/* Current Speed Display
        <span className="text-xs font-medium text-gray-700 min-w-[2.5rem] text-center">
          {playbackRate}x
        </span> */}

        {/* Faster Button */}
        <button
          onClick={() => handleSpeedChange(true)}
          disabled={isLoading || playbackRate >= 1.4}
          className="p-1.5 rounded-full bg-white text-gray-600 hover:bg-blue-100 hover:text-blue-600 active:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 transition-all"
          aria-label="빠르게"
          title="빠르게"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            {/* Double triangle pointing right (fast-forward/faster) */}
            <path d="M2.5 6v12l8.5-6-8.5-6zm10.5 0v12l8.5-6-8.5-6z" />
          </svg>
        </button>
      </div>
    </div>
  )

  const speedControlDropdown = (
    <div className="relative">
      <select
        value={playbackRate}
        onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
        disabled={isLoading}
        className="text-sm px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
        aria-label="Playback speed"
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem',
        }}
      >
        {speedOptions.map((speed) => (
          <option key={speed} value={speed}>
            {speedLabels[speed]}
          </option>
        ))}
      </select>
    </div>
  )

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
      </div>
    )
  }

  // Full variant
  return (
    <div className="flex flex-col items-center gap-3">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Speed Control */}
      {speedControlDropdown}

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
  )
}
