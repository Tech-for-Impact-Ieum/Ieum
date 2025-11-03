'use client'

import { use, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ActionButtons, Input } from '@/components/ui/Input'
import { VoiceInputModal } from '@/components/VoiceInputModal'
import { EmojiPickerModal } from '@/components/EmojiPickerModal'
import { QuickResponseModal } from '@/components/QuickResponseModal'
import { chatRooms, danceMessages } from '@/lib/dummy_data'
import { Message } from '@/lib/interface'
import { ChatHeader } from '@/components/Header'
import { ChatElement } from '@/components/Chat'
import { ContextHelper } from '@/components/ContextHelper'
import {
  initSocketClient,
  joinRoom,
  leaveRoom,
  onNewMessage,
} from '@/lib/socket/socket-client'
import React from 'react'

interface User {
  id: string
  name: string
}

interface ChatPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ChatRoomPage({ params }: ChatPageProps) {
  const { id } = use(params)
  const chatTitle = chatRooms.find((room) => room.id === id)?.name || ''
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
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
    if (!currentUserId) return

    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No authentication token found')
      return
    }

    // Initialize socket client with token
    const socket = initSocketClient(token)

    // Join the chat room
    joinRoom(id)
    console.log(`Joined chat room: ${id}`)

    // Listen for new messages from other users
    const unsubscribe = onNewMessage((message: Message) => {
      console.log('Received new message:', message)
      setMessages((prev) => {
        // Avoid duplicate messages
        if (prev.some((msg) => msg.id === message.id)) {
          return prev
        }
        // Determine if message is from current user
        const enrichedMessage = {
          ...message,
          sender:
            message.senderId?.toString() === currentUserId ? 'me' : 'other',
        } as Message
        return [...prev, enrichedMessage]
      })
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
      leaveRoom(id)
      console.log(`Left chat room: ${id}`)
    }
  }, [id, currentUserId])

  const handleSendMessage = async () => {
    console.log('inputMessage', inputMessage)
    if (inputMessage.trim() && !isComposing && !isLoading) {
      setIsLoading(true)
      try {
        await sendMessageToAPI(inputMessage, 'text')
        setInputMessage('')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const sendMessageToAPI = async (content: string, type: string = 'text') => {
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
            roomId: id,
            content,
            type,
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      if (data.ok) {
        // Message will be received via socket, no need to add manually
        console.log('Message sent successfully')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleEmojiSelect = async (emoji: string) => {
    await sendMessageToAPI(emoji, 'emoji')
    setShowEmojiModal(false)
  }

  const handleVoiceInputSelect = async (text: string) => {
    await sendMessageToAPI(text, 'voice')
    setShowVoiceModal(false)
  }

  const handleQuickResponseSelect = async (text: string) => {
    console.log('handleQuickResponseSelect', text)
    await sendMessageToAPI(text, 'text')
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
        <ChatHeader title={chatTitle} />

        {/* User Selector for Testing */}
        <div className="bg-yellow-100 border-b border-yellow-300 p-3">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <label className="font-semibold text-sm text-gray-700">
              🧪 Test Mode - Select User:
            </label>
            <select
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} (ID: {user.id.slice(-6)})
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-600">
              Current:{' '}
              {users.find((u) => u.id === currentUserId)?.name || 'None'}
            </span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto bg-kakao-skyblue p-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {messages.map((message) => (
              <ChatElement key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card">
          <ContextHelper
            messages={messages.map((m) => ({
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
        messages={messages.map((m) => ({ sender: m.sender, text: m.text }))}
        onSelect={handleQuickResponseSelect}
      />
    </>
  )
}
