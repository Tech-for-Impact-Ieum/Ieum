'use client'

import { emojis } from '@/lib/response_options'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Modal'
import { Button, EmojiButton } from '@/components/ui/Button'

interface EmojiPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPickerModal({
  open,
  onOpenChange,
  onEmojiSelect,
}: EmojiPickerModalProps) {
  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">이모티콘</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 py-4">
          {emojis.map((emoji, index) => (
            <EmojiButton
              emoji={emoji}
              index={index}
              handleEmojiClick={handleEmojiClick}
              key={index}
            />
          ))}
        </div>
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-w-[120px]"
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
