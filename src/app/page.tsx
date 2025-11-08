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
import { Message } from '@/lib/interface'
import {
  initSocketClient,
  onUnreadCountUpdate,
  onNewMessage,
  joinRoom,
} from '@/lib/socket-client'

interface ChatRoom {
  id: number
  name: string
  imageUrl?: string
  participantCount: number
  roomType: 'direct' | 'group'
  unreadCount: number
  lastMessage?: {
    id: string
    text?: string
    senderId: number
    senderName: string
    createdAt: string
  }
  lastMessageAt?: string
  // participants: any[]
  isPinned?: boolean
  isMuted?: boolean
  // Legacy
  unread?: number
  time?: string
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

    // Initialize socket for real-time updates
    const token = localStorage.getItem('token')
    if (token) {
      initSocketClient(token)

      // Listen for new messages to update lastMessage
      const unsubscribeNewMessage = onNewMessage((message) => {
        console.log('📨 New message in room list:', message)
        setRooms((prev) => {
          const updated = prev.map((room) => {
            if (room.id === message.roomId) {
              return {
                ...room,
                unreadCount: room.unreadCount + 1,
                lastMessage: {
                  id: message.id,
                  text: message.text,
                  senderId: message.senderId,
                  senderName: message.senderName,
                  createdAt: message.createdAt,
                },
                lastMessageAt: message.createdAt,
              }
            }
            return room
          })

          // Sort by lastMessageAt (most recent first)
          return updated.sort((a, b) => {
            const timeA = new Date(
              a.lastMessage?.createdAt || a.lastMessageAt || 0,
            ).getTime()
            const timeB = new Date(
              b.lastMessage?.createdAt || b.lastMessageAt || 0,
            ).getTime()
            return timeB - timeA
          })
        })
      })

      return () => {
        unsubscribeNewMessage()
      }
    }
  }, [router])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const data = await ApiClient.get('/chat/rooms')
      setRooms(data.rooms || [])
      for (const room of data.rooms) {
        joinRoom(room.id)
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Helper to format time
  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR')
  }

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
                lastMessage={room.lastMessage?.text || ''}
                time={formatTime(
                  room.lastMessage?.createdAt || room.lastMessageAt,
                )}
                unread={room.unreadCount}
                imageUrl={room.imageUrl}
                roomType={room.roomType}
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
