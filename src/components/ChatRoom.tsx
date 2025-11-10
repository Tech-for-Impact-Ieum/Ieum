import { UsersRound } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function ChatRoomElement({
  id,
  name,
  lastMessage,
  time,
  unread,
  imageUrl,
  roomType,
}: {
  id: number | string
  name: string
  lastMessage: string
  time: string
  unread: number
  imageUrl?: string
  roomType?: 'direct' | 'group'
}) {
  return (
    <Link
      key={id}
      href={`/chat/${id}`}
      className={`flex items-center gap-5 border-1 border-solid border-gray-400 transition-colors hover:kakao-yellow-dark px-4 py-4 mx-2 my-3 rounded-2xl hover:shadow-md transition-shadow cursor-pointer ${
        unread > 0 ? 'bg-kakao-yellow' : 'bg-white'
      }`}
    >
      {/* Room Image or Icon */}
      {imageUrl ? (
        <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
      ) : (
        <UsersRound size={28} className="shrink-0 text-muted-foreground" />
      )}

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-2xl truncate">{name}</h3>
            {roomType === 'group' && (
              <span className="text-xs text-muted-foreground">그룹</span>
            )}
          </div>
          <span className="text-m text-muted-foreground shrink-0">{time}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-lg text-muted-foreground flex-1">
            {lastMessage}
          </p>
          {unread > 0 && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unread > 99 ? '99+' : unread}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
