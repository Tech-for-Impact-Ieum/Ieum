'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ActionButtons, Input } from '@/components/ui/Input'
import { VoiceInputModal } from '@/components/VoiceInputModal'
import { EmojiPickerModal } from '@/components/EmojiPickerModal'
import { QuickResponseModal } from '@/components/QuickResponseModal'
import { sampleMessages } from '@/lib/dummy_data'
import { Message } from '@/lib/interface'
import { ChatHeader } from '@/components/Header'
import { ChatElement } from '@/components/Chat'
import { ContextHelper } from '@/components/ContextHelper'

export default function ChatRoomPage() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [inputMessage, setInputMessage] = useState('')
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showEmojiModal, setShowEmojiModal] = useState(false)
  const [showQuickResponseModal, setShowQuickResponseModal] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Composition state for IME input
  const [isComposing, setIsComposing] = useState(false)
  const handleCompositionStart = () => {
    setIsComposing(true)
  }
  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  const handleSendMessage = () => {
    console.log('inputMessage', inputMessage)
    if (inputMessage.trim() && !isComposing) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: 'me',
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setMessages([...messages, newMessage])
      setInputMessage('')
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        text: emoji,
        sender: 'me',
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
    setShowEmojiModal(false)
  }

  const handleVoiceInputSelect = (text: string) => {
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        text: text,
        sender: 'me',
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
    setShowVoiceModal(false)
  }

  const handleQuickResponseSelect = (text: string) => {
    console.log('handleQuickResponseSelect', text)
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        text: text,
        sender: 'me',
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
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
        <ChatHeader title="이음톡방" />

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
              disabled={!inputMessage.trim()}
              className="rounded-xl w-28"
            >
              <div className="text-2xl">보내기</div>
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
