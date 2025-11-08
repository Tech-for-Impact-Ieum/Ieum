import { Message, MediaItem } from '@/lib/interface'
import { Auth } from '@/lib/auth'
import Image from 'next/image'

export function ChatElement({ message }: { message: Message }) {
  const currentUser = Auth.getUser()
  const isMyMessage = currentUser ? message.senderId === currentUser.id : false

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

  return (
    <div
      key={message.id}
      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex max-w-[75%] flex-col gap-1 ${
          isMyMessage ? 'items-end' : 'items-start'
        }`}
      >
        <SenderElement sender={message.senderName} isMyMessage={isMyMessage} />
        {hasMedia && (
          <MediaElement media={message.media} isMyMessage={isMyMessage} />
        )}
        {hasText && <TextElement message={message} isMyMessage={isMyMessage} />}
        <TimeElement time={formattedTime} />
      </div>
    </div>
  )
}

function MediaElement({
  media,
  isMyMessage,
}: {
  media: MediaItem[]
  isMyMessage: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      {media.map((item, index) => (
        <div key={index} className="overflow-hidden rounded-lg">
          {item.type === 'image' && (
            <div className="relative">
              <Image
                src={item.url}
                alt={item.fileName || 'Image'}
                width={item.width || 300}
                height={item.height || 200}
                className="max-w-full h-auto rounded-lg"
                style={{ maxWidth: '300px' }}
              />
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
            <div
              className={`rounded-xl px-4 py-3 ${
                isMyMessage ? 'bg-kakao-yellow' : 'bg-white'
              }`}
            >
              <audio src={item.url} controls className="w-full max-w-sm">
                Your browser does not support the audio element.
              </audio>
              {item.duration && (
                <p className="text-xs text-gray-500 mt-1">
                  {Math.floor(item.duration / 60)}:
                  {(item.duration % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>
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
                <p className="text-sm font-medium truncate">{item.fileName}</p>
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
      ))}
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
