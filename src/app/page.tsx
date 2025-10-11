'use client'

import { useState } from 'react'
import { Radio } from 'lucide-react'
import Link from 'next/link'
import { chatRooms } from '../lib/dummy_data'
import { MenuHeader } from '../components/Header'
import SearchBar from '../components/SearchBar'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRooms = chatRooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-full flex-col w-full">
      <MenuHeader title="채팅" />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Chat Room List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.map((room) => (
          <Link
            key={room.id}
            href={`/chat/${room.id}`}
            className="flex items-center gap-3 border-b border-border px-4 py-4 transition-colors hover:bg-muted/50"
          >
            <Radio className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{room.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {room.time}
                </span>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {room.lastMessage}
              </p>
            </div>
            {room.unread > 0 && (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                {room.unread}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
