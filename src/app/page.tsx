'use client'

import { useState, useEffect } from 'react'
import { MenuHeader } from '../components/Header'
import SearchBar from '../components/SearchBar'
import { ChatRoomElement } from '@/components/ChatRoom'
import { ApiClient } from '@/lib/api-client'
import { Auth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface ChatRoom {
  id: string
  name: string
  unread: number
  time: string
  participants: any[]
  roomType: string
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    if (!Auth.isAuthenticated()) {
      router.push('/login')
      return
    }

    fetchRooms()
  }, [router])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const data = await ApiClient.get('/chat/rooms')
      setRooms(data.rooms)
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex h-full flex-col w-full">
        <MenuHeader title="채팅" />
        <div className="flex-1 flex items-center justify-center">
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col w-full">
      <MenuHeader title="채팅" />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Chat Room List */}
      <div className="flex-1 overflow-y-auto pb-20 px-3 bg-white">
        {filteredRooms.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">채팅방이 없습니다</p>
        ) : (
          filteredRooms.map((room) => (
            <ChatRoomElement
              key={room.id}
              id={room.id}
              name={room.name}
              lastMessage=""
              time={room.time}
              unread={room.unread}
            />
          ))
        )}
      </div>
    </div>
  )
}
