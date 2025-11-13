/**
 * ChatSummary Component
 * Display chat summary with TTS audio
 */

'use client'

import React, { useState, useEffect } from 'react'
import { AudioPlayer } from './AudioPlayer'
import { Button } from './ui/Button'
import { ChatSummary as ChatSummaryType } from '@/lib/interface'

interface ChatSummaryProps {
  roomId: number
  onClose?: () => void
  autoLoad?: boolean
  onSummaryComplete: () => void
}

export function ChatSummary({
  roomId,
  onClose,
  autoLoad = true,
  onSummaryComplete,
}: ChatSummaryProps) {
  const [summary, setSummary] = useState<ChatSummaryType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSummary = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/rooms/${roomId}/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setError('아직 생성된 요약이 없습니다.')
          console.log('No summary found, generating new one')
          await generateSummary()
        } else {
          setError(data.error || '요약을 불러오는데 실패했습니다.')
          onSummaryComplete()
        }
      }

      if (data.ok) {
        // Summary can be null if there aren't enough messages
        if (data.summary) {
          setSummary(data.summary)
        } else {
          // No summary available (not enough messages or disabled)
          setSummary(null)
        }
      }

      // Summary loaded successfully, notify parent to mark messages as read
      onSummaryComplete()
    } catch (e) {
      console.error('Failed to load summary:', e)
      setError('네트워크 오류가 발생했습니다.')
      // Call callback even on error so messages can be marked as read
      onSummaryComplete()
    } finally {
      setIsLoading(false)
    }
  }

  const generateSummary = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/rooms/${roomId}/summary`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '요약 생성에 실패했습니다.')
        onSummaryComplete()
        return
      }

      if (data.ok && data.summary) {
        setSummary(data.summary)
      }

      onSummaryComplete()
    } catch (e) {
      console.error('Failed to generate summary:', e)
      setError('네트워크 오류가 발생했습니다.')
      onSummaryComplete()
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (autoLoad) {
      loadSummary()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, autoLoad, onSummaryComplete])

  /* error or no summary*/
  if ((error && !isLoading) || (!summary && !isLoading && !error)) {
    return null
  }

  // unused for 1st user test
  const closeButton = onClose && (
    <button
      onClick={onClose}
      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Close"
    >
      <svg
        className="w-5 h-5 text-gray-500"
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
  )

  // unused for 1st user test
  const regenerateButton = (
    <Button
      onClick={generateSummary}
      disabled={isGenerating}
      variant="outline"
      className="w-full"
    >
      {isGenerating ? (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
          새 요약 생성 중...
        </span>
      ) : (
        '새 요약 생성하기'
      )}
    </Button>
  )

  if (error && !isLoading) {
    return null
  }

  return (
    <div className="bg-white rounded-b-lg shadow-lg p-4 space-y-4">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-28">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="w-10 h-10 text-purple-600 animate-spin"
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
            <p className="text-sm text-gray-600">요약을 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* Error State, never reach here */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Content */}
      {summary && !isLoading && (
        <div className="flex items-center gap-2">
          {/* Summary Text */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 w-full">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              <p className="text-gray-800 leading-relaxed">{summary.text}</p>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>📊 {summary.messageCount}개 메시지</span>
              <span>
                🕐{' '}
                {new Date(summary.createdAt).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* TTS Audio Player */}
          {summary.audioUrl && (
            <div>
              <AudioPlayer src={summary.audioUrl} variant="full" />
            </div>
          )}
        </div>
      )}

      {/* No Summary - Generate Button */}
      {!summary && !isLoading && !error && (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto"
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
          <p className="text-gray-600 mb-4">아직 요약이 없습니다</p>
          <Button onClick={generateSummary} disabled={isGenerating}>
            {isGenerating ? (
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
                요약 생성 중...
              </span>
            ) : (
              '요약 생성하기'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
