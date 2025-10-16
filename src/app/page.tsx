'use client'

import { useState } from 'react'
import { chatRooms } from '../lib/dummy_data'
import { MenuHeader } from '../components/Header'
import SearchBar from '../components/SearchBar'
import { ChatRoomElement } from '@/components/ChatRoom'

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
      <div className="flex-1 overflow-y-auto pb-20 px-3 bg-white">
        {filteredRooms.map((room) => (
          <ChatRoomElement
            key={room.id}
            id={room.id}
            name={room.name}
            lastMessage={room.messages.at(-1)?.text || ''}
            time={room.time}
            unread={room.unread}
          />
        ))}
      </div>
    </div>
  )
}
