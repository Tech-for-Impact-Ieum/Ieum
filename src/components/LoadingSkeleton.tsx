/**
 * LoadingSkeleton Component
 * Skeleton loaders for various components
 */

'use client'

import React from 'react'

export function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 animate-pulse">
      {/* Message 1 - Received */}
      <div className="flex justify-start">
        <div className="flex flex-col gap-1 max-w-[75%]">
          <div className="h-4 w-16 bg-gray-300 rounded" />
          <div className="h-20 w-64 bg-gray-200 rounded-2xl rounded-bl-sm" />
          <div className="h-3 w-12 bg-gray-300 rounded" />
        </div>
      </div>

      {/* Message 2 - Sent */}
      <div className="flex justify-end">
        <div className="flex flex-col gap-1 max-w-[75%] items-end">
          <div className="h-20 w-56 bg-yellow-100 rounded-2xl rounded-br-sm" />
          <div className="h-3 w-12 bg-gray-300 rounded" />
        </div>
      </div>

      {/* Message 3 - Received with image */}
      <div className="flex justify-start">
        <div className="flex flex-col gap-1 max-w-[75%]">
          <div className="h-4 w-16 bg-gray-300 rounded" />
          <div className="h-48 w-64 bg-gray-200 rounded-lg" />
          <div className="h-3 w-12 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  )
}

export function ChatRoomListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3 p-3 bg-white rounded-lg">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="h-5 w-32 bg-gray-300 rounded" />
              <div className="h-4 w-12 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MediaUploadSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-white animate-pulse">
      <div className="w-16 h-16 bg-gray-300 rounded" />
      <div className="flex-1">
        <div className="h-4 w-32 bg-gray-300 rounded mb-2" />
        <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-blue-400 h-1.5 rounded-full w-1/3" />
        </div>
      </div>
    </div>
  )
}

export function ImageSkeleton({
  width = 300,
  height = 200,
}: {
  width?: number
  height?: number
}) {
  return (
    <div
      className="bg-gray-200 rounded-lg animate-pulse flex items-center justify-center"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <svg
        className="w-12 h-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  )
}
