'use client'

import { useState, useEffect } from 'react'
import { MenuHeader } from '../components/Header'
import SearchBar from '../components/SearchBar'
import { ChatRoomElement } from '@/components/ChatRoom'
import { ApiClient } from '@/lib/api-client'
import { Auth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CreateChatRoomModal } from '@/components/CreateChatRoomModal'

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
  const [showCreateRoom, setShowCreateRoom] = useState(false)
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
    <>
      <div className="flex h-full flex-col w-full">
        <MenuHeader title="채팅" />
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Create Room Button */}
        <div className="px-3 py-2 bg-gray-50 border-b">
          <Button
            onClick={() => setShowCreateRoom(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            + 새 채팅방 만들기
          </Button>
        </div>

        {/* Chat Room List */}
        <div className="flex-1 overflow-y-auto pb-20 px-3 bg-white">
          {filteredRooms.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>채팅방이 없습니다</p>
              <p className="text-sm mt-2">위의 버튼을 눌러 채팅방을 만드세요</p>
            </div>
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

      <CreateChatRoomModal
        open={showCreateRoom}
        onOpenChange={setShowCreateRoom}
        onRoomCreated={fetchRooms}
      />
    </>
  )
}
