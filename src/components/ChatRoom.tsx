import { Radio } from 'lucide-react'
import Link from 'next/link'

export function ChatRoomElement({
  id,
  name,
  lastMessage,
  time,
  unread,
}: {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
}) {
  return (
    <Link
      key={id}
      href={`/chat/${id}`}
      className="flex items-center gap-3 border-b border-border transition-colors hover:bg-muted/50 px-4 py-4 mx-1 my-1 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
    >
      <Radio className="h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium">{name}</h3>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="truncate text-sm text-muted-foreground">{lastMessage}</p>
      </div>
      {unread > 0 && (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
          {unread}
        </div>
      )}
    </Link>
  )
}
