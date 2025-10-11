'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Modal'
import { Button, QuickResponseButton } from '@/components/ui/Button'
import { tags } from '@/lib/response_options'
import { X } from 'lucide-react'

interface QuickResponseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// FIXME: onOpenChange is not working properly
export function QuickResponseModal({
  open,
  onOpenChange,
}: QuickResponseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">빠른 답장</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 py-4">
          {tags.map((tag, index) => (
            <QuickResponseButton index={index} tag={tag} key={index} />
          ))}
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={() => onOpenChange(false)} className="min-w-[100px]">
            보내기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
