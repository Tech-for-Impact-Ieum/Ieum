'use client'

import { use, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ActionButtons, Input } from '@/components/ui/Input'
import { VoiceInputModal } from '@/components/VoiceInputModal'
import { EmojiPickerModal } from '@/components/EmojiPickerModal'
import { QuickResponseModal } from '@/components/QuickResponseModal'
import { ChatRoom, Message, User } from '@/lib/interface'
import { ChatHeader } from '@/components/Header'
import { ChatElement } from '@/components/Chat'
import { ContextHelper } from '@/components/ContextHelper'
import {
  initSocketClient,
  joinRoom,
  leaveRoom,
  onNewMessage,
} from '@/lib/socket-client'
import React from 'react'

interface ChatPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ChatRoomPage({ params }: ChatPageProps) {
  const { id } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showEmojiModal, setShowEmojiModal] = useState(false)
  const [showQuickResponseModal, setShowQuickResponseModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Composition state for IME input
  const [isComposing, setIsComposing] = useState(false)
  const handleCompositionStart = () => {
    setIsComposing(true)
  }
  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  // Load users from database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        )
        if (response.ok) {
          const data = await response.json()
          if (data.ok && data.users) {
            setUsers(data.users)
            // Auto-select first user if not already selected
            if (data.users.length > 0 && !currentUserId) {
              setCurrentUserId(data.users[0].id.toString())
            }
          }
        }
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }
    const loadChatRoom = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/rooms/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        )
        if (response.ok) {
          const data = await response.json()
          if (data.ok && data.room) {
            setChatRoom(data.room)
          }
        }
      } catch (error) {
        console.error('Error loading chat room:', error)
      }
    }

    loadChatRoom()
    loadUsers()
  }, [])

  // Load existing messages from database when currentUserId changes
  useEffect(() => {
    if (!currentUserId) return

    const loadMessages = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/rooms/${id}/messages?currentUserId=${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        )
        if (response.ok) {
          const data = await response.json()
          if (data.ok && data.messages) {
            setMessages(data.messages)
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
  }, [id, currentUserId])

  // Initialize socket connection and join room
  useEffect(() => {
    if (!currentUserId || !chatRoom?.id) return

    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No authentication token found')
      return
    }

    console.log('🔌 Setting up socket connection and room subscription...')

    // Initialize socket client with token
    const socket = initSocketClient(token)

    // Join the chat room (will wait for connection if needed)
    // Convert roomId to number for socket
    const numericRoomId =
      typeof chatRoom.id === 'string' ? parseInt(chatRoom.id, 10) : chatRoom.id
    joinRoom(numericRoomId)

    // Listen for new messages from other users
    const unsubscribe = onNewMessage((message: Message) => {
      console.log('✓ Received new message:', message)
      setMessages((prev) => {
        // Avoid duplicate messages
        if (prev.some((msg) => msg.id === message.id)) {
          console.log('  → Duplicate message, ignoring')
          return prev
        }
        // Determine if message is from current user
        const enrichedMessage = {
          ...message,
          sender:
            message.senderId?.toString() === currentUserId?.toString()
              ? 'me'
              : 'other',
        } as Message
        console.log('  → Added message to state:', enrichedMessage)
        return [...prev, enrichedMessage]
      })
    })

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket subscriptions...')
      unsubscribe()
      leaveRoom(numericRoomId)
    }
  }, [id, currentUserId, chatRoom?.id])

  const handleSendMessage = async () => {
    console.log('inputMessage', inputMessage)
    if (inputMessage.trim() && !isComposing && !isLoading) {
      setIsLoading(true)
      try {
        await sendMessageToAPI(inputMessage, [], 'text')
        setInputMessage('')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const sendMessageToAPI = async (
    text: string,
    media: any[] = [],
    type: string = 'text',
  ) => {
    if (!currentUserId) {
      alert('Please select a user first')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId: parseInt(id, 10), // Convert to number
            text,
            media, // Support for media array
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      if (data.ok && data.message) {
        // Add sender info for display
        const enrichedMessage = {
          ...data.message,
          sender: 'me' as const,
          time: new Date(data.message.createdAt).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          username: Auth.getUser()?.name,
        }
        setMessages((prev) => [...prev, enrichedMessage as Message])
        console.log('Message sent successfully')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleEmojiSelect = async (emoji: string) => {
    await sendMessageToAPI(emoji, [], 'emoji')
    setShowEmojiModal(false)
  }

  const handleVoiceInputSelect = async (text: string) => {
    await sendMessageToAPI(text, [], 'voice')
    setShowVoiceModal(false)
  }

  const handleQuickResponseSelect = async (text: string) => {
    console.log('handleQuickResponseSelect', text)
    await sendMessageToAPI(text, [], 'text')
    setShowQuickResponseModal(false)
    setInputMessage('')
  }

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <>
      <div className="flex h-full flex-col">
        {chatRoom && <ChatHeader title={chatRoom.name} />}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto bg-kakao-skyblue p-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {messages.map((message: Message) => (
              <ChatElement key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card">
          <ContextHelper
            messages={messages.map((m: Message) => ({
              sender: m.sender,
              username: m.username,
              text: m.text,
            }))}
          />
          <ActionButtons
            setShowEmojiModal={setShowEmojiModal}
            setShowVoiceModal={setShowVoiceModal}
            setShowQuickResponseModal={setShowQuickResponseModal}
          />

          {/* Message Input */}
          <div className="flex items-center gap-2 px-4 py-3">
            <Input
              type="text"
              placeholder="메시지 입력"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="pl-10 text-2xl bg-gray-100 py-5 rounded-xl"
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="rounded-xl w-28"
            >
              <div className="text-2xl">
                {isLoading ? '전송중...' : '보내기'}
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <VoiceInputModal
        open={showVoiceModal}
        onOpenChange={setShowVoiceModal}
        onSend={handleVoiceInputSelect}
      />
      <EmojiPickerModal
        open={showEmojiModal}
        onOpenChange={setShowEmojiModal}
        onEmojiSelect={handleEmojiSelect}
      />
      <QuickResponseModal
        open={showQuickResponseModal}
        onOpenChange={setShowQuickResponseModal}
        messages={messages.map((m: Message) => ({
          sender: m.sender,
          text: m.text,
        }))}
        onSelect={handleQuickResponseSelect}
      />
    </>
  )
}
