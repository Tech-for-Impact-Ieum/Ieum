import { Message } from '@/lib/interface'

export function ChatElement({ message }: { message: Message }) {
  const isMyMessage = message.sender == 'me'
  return (
    <div
      key={message.id}
      className={`flex ${
        message.sender === 'me' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex max-w-[75%] flex-col gap-1 ${
          isMyMessage ? 'items-end' : 'items-start'
        }`}
      >
        <SenderElement sender={message.username} isMyMessage={isMyMessage} />
        <TextElement message={message} isMyMessage={isMyMessage} />
        <TimeElement time={message.time} />
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
      className={`rounded-2xl px-4 py-2 ${
        isMyMessage
          ? 'rounded-br-sm bg-[var(--chat-bubble-sent)] text-white'
          : 'rounded-bl-sm bg-[var(--chat-bubble-received)] text-foreground'
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
  return <span className="px-2 font-normal text-xl">{sender}</span>
}

// TODO: do not show time if sender & time are same as previous message
function TimeElement({ time }: { time: string }) {
  return <span className="px-2 text-xs text-muted-foreground">{time}</span>
}
