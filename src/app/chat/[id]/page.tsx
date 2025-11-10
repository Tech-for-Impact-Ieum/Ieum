'use client'

import { use, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ActionButtons, Input } from '@/components/ui/Input'
import { VoiceInputModal } from '@/components/VoiceInputModal'
import { EmojiPickerModal } from '@/components/EmojiPickerModal'
import { QuickResponseModal } from '@/components/QuickResponseModal'
import { MediaUploader } from '@/components/MediaUploader'
import { ChatSummary } from '@/components/ChatSummary'
import { ChatRoom, MediaItem, Message } from '@/lib/interface'
import { ChatHeader } from '@/components/Header'
import { ChatElement } from '@/components/Chat'
import {
  initSocketClient,
  joinRoom,
  leaveRoom,
  onNewMessage,
  onMessagesRead,
} from '@/lib/socket-client'
import { Auth } from '@/lib/auth'
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
  const currentUserId = Auth.getUserId()
  const [inputMessage, setInputMessage] = useState('')
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showEmojiModal, setShowEmojiModal] = useState(false)
  const [showQuickResponseModal, setShowQuickResponseModal] = useState(false)
  const [showMediaUploader, setShowMediaUploader] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [pendingMedia, setPendingMedia] = useState<MediaItem[]>([])
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

  // Load chat room
  useEffect(() => {
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
  }, [id])

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
            // Mark as read - send the last message ID
            if (data.messages.length > 0) {
              const lastMessage = data.messages[data.messages.length - 1]
              console.log(
                `Marking messages in room ${id} as read (last message: ${lastMessage.id})...`,
              )
              try {
                const readResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/chat/rooms/${id}/read`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                      messageId: lastMessage.id,
                    }),
                  },
                )
                const readData = await readResponse.json()
                console.log('Mark as read response:', readData)
                if (!readResponse.ok) {
                  console.error('Failed to mark messages as read:', readData)
                }
              } catch (error) {
                console.error('Error marking messages as read:', error)
              }
            }
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
        if (
          prev.some((msg) => msg.id === message.id) ||
          message.senderId === currentUserId
        ) {
          console.log('  → Duplicate message, ignoring')
          return prev
        }
        console.log('  → Added message to state:', message)
        return [...prev, message]
      })
    })

    // Listen for messages-read events
    const unsubscribeMessagesRead = onMessagesRead((data) => {
      console.log('✓ Messages read event:', data)
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            // Add the user to readBy if not already there
            const alreadyRead = msg.readBy.some((r) => r.userId === data.userId)
            if (!alreadyRead) {
              return {
                ...msg,
                readBy: [
                  ...msg.readBy,
                  { userId: data.userId, readAt: new Date().toISOString() },
                ],
              }
            }
          }
          return msg
        }),
      )
    })

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket subscriptions...')
      unsubscribe()
      unsubscribeMessagesRead()
      leaveRoom(numericRoomId)
    }
  }, [id, currentUserId, chatRoom?.id])

  const handleSendMessage = async () => {
    console.log('inputMessage', inputMessage)
    // Allow sending if there's text OR media
    if (
      (inputMessage.trim() || pendingMedia.length > 0) &&
      !isComposing &&
      !isLoading
    ) {
      setIsLoading(true)
      try {
        await sendMessageToAPI(inputMessage, pendingMedia)
        setInputMessage('')
        setPendingMedia([])
        setShowMediaUploader(false)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const sendMessageToAPI = async (text: string, media: MediaItem[] = []) => {
    if (!currentUserId) {
      alert('Please login first')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/rooms/${id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
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
        // Add message to state
        setMessages((prev) => [...prev, data.message])
        console.log('Message sent successfully')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleEmojiSelect = async (emoji: string) => {
    await sendMessageToAPI(emoji, [])
    setShowEmojiModal(false)
  }

  const handleVoiceInputSelect = async (
    text: string,
    audioMedia?: MediaItem,
  ) => {
    const media = audioMedia ? [audioMedia] : []
    await sendMessageToAPI(text, media)
    setShowVoiceModal(false)
  }

  const handleQuickResponseSelect = async (text: string) => {
    console.log('handleQuickResponseSelect', text)
    await sendMessageToAPI(text, [])
    setShowQuickResponseModal(false)
    setInputMessage('')
  }

  const handleMediaUploadComplete = (media: MediaItem[]) => {
    console.log('Media uploaded:', media)
    setPendingMedia((prev) => [...prev, ...media])
  }

  const handleToggleMediaUploader = () => {
    setShowMediaUploader((prev) => !prev)
  }

  const clearPendingMedia = () => {
    setPendingMedia([])
    setShowMediaUploader(false)
  }

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    console.log(messages)
  }, [messages])

  return (
    <>
      <div className="flex h-full flex-col">
        {chatRoom && (
          <div className="relative">
            <ChatHeader title={chatRoom.name} />
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto bg-kakao-skyblue p-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {messages.map((message: Message) => (
              <ChatElement
                key={message.id}
                message={message}
                memberCount={chatRoom?.participantCount || 2}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card">
          <ActionButtons
            setShowSummaryModal={setShowSummary}
            setShowEmojiModal={setShowEmojiModal}
            setShowVoiceModal={setShowVoiceModal}
            setShowQuickResponseModal={setShowQuickResponseModal}
            onMediaClick={handleToggleMediaUploader}
          />

          {/* Media Uploader */}
          {showMediaUploader && (
            <div className="px-4 py-3 border-t border-gray-200">
              <MediaUploader
                onUploadComplete={handleMediaUploadComplete}
                onUploadStart={() => console.log('Upload started')}
                maxFiles={5}
                acceptTypes="all"
              />
            </div>
          )}

          {/* Pending Media Preview */}
          {pendingMedia.length > 0 && !showMediaUploader && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  📎 {pendingMedia.length}개 파일 첨부됨
                </span>
                <button
                  onClick={clearPendingMedia}
                  className="ml-auto text-xs text-red-600 hover:underline"
                >
                  삭제
                </button>
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="flex items-center gap-2 px-4 py-3">
            <Input
              type="text"
              placeholder="메시지 입력"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
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
              disabled={
                (!inputMessage.trim() && pendingMedia.length === 0) || isLoading
              }
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
          senderName: m.senderName,
          text: m.text || '',
        }))}
        onSelect={handleQuickResponseSelect}
      />
      {/* Summary Modal */}
      {/* 발달장애인용으로 보여주기 */}
      {showSummary && chatRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <ChatSummary
              roomId={
                typeof chatRoom.id === 'string'
                  ? parseInt(chatRoom.id, 10)
                  : chatRoom.id
              }
              onClose={() => setShowSummary(false)}
              autoLoad={true}
            />
          </div>
        </div>
      )}
    </>
  )
}
