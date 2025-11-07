import { MediaItem, Message } from '@/lib/interface'
import { Auth } from '@/lib/auth'

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
  console.log('Rendering message:', message)

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
        {message.media.length > 0 &&
          message.media.map((mediaItem, index) => (
            <div key={index} className="mb-2">
              <ImageElement mediaItem={mediaItem} />
              <AudioElement
                mediaItem={mediaItem}
                transcript={message.text || ''}
              />
              <Transcript text={message.text || ''} />
            </div>
          ))}
        <TextElement message={message} isMyMessage={isMyMessage} />
        <TimeElement time={formattedTime} />
      </div>
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

function ImageElement({ mediaItem }: { mediaItem: MediaItem }) {
  if (mediaItem.type !== 'image') return null
  return (
    <div>
      {mediaItem.url && (
        <img
          src={mediaItem.url}
          alt="chat image"
          className="max-h-60 w-auto rounded-lg"
        />
      )}
    </div>
  )
}

function AudioElement({
  mediaItem,
  transcript,
}: {
  mediaItem: MediaItem
  transcript: string
}) {
  if (mediaItem.type !== 'audio') return null
  return (
    <div>
      {mediaItem.url && (
        <audio controls className="w-full">
          <source src={mediaItem.url} />
          Your browser does not support the audio element.
        </audio>
      )}
      <Transcript text={transcript} />
    </div>
  )
}

function Transcript({ text }: { text: string }) {
  if (!text) return null
  return <p className="mt-2 text-base text-foreground">{text}</p>
}
