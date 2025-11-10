import { Message, MediaItem } from '@/lib/interface'
import { Auth } from '@/lib/auth'
import Image from 'next/image'
import { useState } from 'react'
import { ImageLightbox } from './ImageLightbox'
import { AudioPlayer } from './AudioPlayer'

export function ChatElement({
  message,
  memberCount,
}: {
  message: Message
  memberCount: number
}) {
  const currentUser = Auth.getUser()
  const isMyMessage = currentUser ? message.senderId === currentUser.id : false
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Format time from createdAt
  const formattedTime = new Date(message.createdAt).toLocaleTimeString(
    'ko-KR',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  )

  const hasMedia = message.media && message.media.length > 0
  const hasText = message.text && message.text.trim().length > 0

  // Extract only images for lightbox
  const imageMedia = message.media.filter((item) => item.type === 'image')

  // Calculate read status for my messages
  const readCount = message.readBy ? message.readBy.length : 0
  const hasBeenRead = readCount > 1 // Exclude sender themselves

  const handleImageClick = (mediaIndex: number) => {
    // Find the index in imageMedia array
    const imageIndex = imageMedia.findIndex(
      (img) => img === message.media[mediaIndex],
    )
    if (imageIndex !== -1) {
      setLightboxIndex(imageIndex)
      setLightboxOpen(true)
    }
  }

  return (
    <>
      <div
        key={message.id}
        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`flex max-w-[75%] flex-col gap-1 ${
            isMyMessage ? 'items-end' : 'items-start'
          }`}
        >
          <SenderElement
            sender={message.senderName}
            isMyMessage={isMyMessage}
          />
          {hasMedia && (
            <MediaElement
              media={message.media}
              isMyMessage={isMyMessage}
              onImageClick={handleImageClick}
            />
          )}
          {hasText && (
            <TextElement message={message} isMyMessage={isMyMessage} />
          )}
          <div className="flex items-center gap-2">
            <TimeElement time={formattedTime} />
            {isMyMessage && (
              <ReadStatusElement
                memberCount={memberCount}
                readCount={readCount}
                hasBeenRead={hasBeenRead}
              />
            )}
          </div>
        </div>
      </div>

      {/* Lightbox for images */}
      {imageMedia.length > 0 && (
        <ImageLightbox
          images={imageMedia}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

function MediaElement({
  media,
  isMyMessage,
  onImageClick,
}: {
  media: MediaItem[]
  isMyMessage: boolean
  onImageClick?: (index: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {media.map((item, index) => {
        // 백엔드가 자동으로 signed URL을 생성하지만, 없을 경우 대비
        if (!item.url) {
          console.warn('Media item missing URL:', item)
          return null
        }

        return (
          <div key={index} className="overflow-hidden rounded-lg">
            {item.type === 'image' && (
              <div
                className="relative cursor-pointer hover:opacity-90 transition-opacity group"
                onClick={() => onImageClick?.(index)}
              >
                <Image
                  src={item.url}
                  alt={item.fileName || 'Image'}
                  width={item.width || 300}
                  height={item.height || 200}
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxWidth: '300px' }}
                />
                {/* Hover overlay */}
                {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
                </div> */}
              </div>
            )}
            {item.type === 'video' && (
              <video
                src={item.url}
                controls
                className="max-w-full rounded-lg"
                style={{ maxWidth: '300px' }}
              >
                Your browser does not support the video tag.
              </video>
            )}
            {item.type === 'audio' && (
              <AudioPlayer
                src={item.url}
                duration={item.duration}
                fileName={item.fileName}
                variant="compact"
                className={isMyMessage ? 'bg-kakao-yellow' : 'bg-white'}
              />
            )}
            {item.type === 'file' && (
              <div
                className={`rounded-xl px-4 py-3 flex items-center gap-3 ${
                  isMyMessage ? 'bg-kakao-yellow' : 'bg-white'
                }`}
              >
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.fileName}
                  </p>
                  {item.fileSize && (
                    <p className="text-xs text-gray-500">
                      {(item.fileSize / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  다운로드
                </a>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TextElement({
  message,
  isMyMessage,
}: {
  message: Message
  isMyMessage: boolean
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-2 text-foreground ${
        isMyMessage
          ? `rounded-br-sm bg-kakao-yellow `
          : 'rounded-bl-sm bg-white'
      }`}
    >
      <p className="text-lg leading-relaxed">{message.text}</p>
    </div>
  )
}

function SenderElement({
  sender,
  isMyMessage,
}: {
  sender?: string
  isMyMessage: boolean
}) {
  if (isMyMessage || !sender) return null
  return <span className="px-2 font-semibold text-xl">{sender}</span>
}

// TODO: do not show time if sender & time are same as previous message
function TimeElement({ time }: { time: string }) {
  return <span className="px-2 text-xs text-muted-foreground">{time}</span>
}

function ReadStatusElement({
  memberCount,
  readCount,
  hasBeenRead,
}: {
  memberCount: number
  readCount: number
  hasBeenRead: boolean
}) {
  if (!hasBeenRead) {
    return null // Don't show anything if unread
  }

  return (
    <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
      <svg
        className="w-3 h-3"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      {memberCount > 2 ? `${readCount - 1}명 읽음` : '읽음'}
    </span>
  )
}
