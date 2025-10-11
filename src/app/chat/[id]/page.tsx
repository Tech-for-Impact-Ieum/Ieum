'use client'

import { useState } from 'react'
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

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [inputMessage, setInputMessage] = useState('')
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showEmojiModal, setShowEmojiModal] = useState(false)
  const [showQuickResponseModal, setShowQuickResponseModal] = useState(false)

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
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
    setInputMessage((prev) => prev + emoji)
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <ChatHeader title="이음톡방" />

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {messages.map((message) => (
              <ChatElement key={message.id} message={message} />
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card">
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
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <VoiceInputModal open={showVoiceModal} onOpenChange={setShowVoiceModal} />
      <EmojiPickerModal
        open={showEmojiModal}
        onOpenChange={setShowEmojiModal}
        onEmojiSelect={handleEmojiSelect}
      />
      <QuickResponseModal
        open={showQuickResponseModal}
        onOpenChange={setShowQuickResponseModal}
      />
    </>
  )
}
