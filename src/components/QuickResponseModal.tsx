'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Modal'
import { QuickResponseButton } from '@/components/ui/Button'
import { X } from 'lucide-react'

interface QuickResponseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages?: { sender: 'me' | 'other'; text: string }[]
  onSelect?: (text: string) => void
}

// FIXME: onOpenChange is not working properly
export function QuickResponseModal({
  open,
  onOpenChange,
  messages = [],
  onSelect,
}: QuickResponseModalProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let aborted = false
    async function fetchSuggestions() {
      if (!open) return
      try {
        setIsLoading(true)
        setSuggestions([])
        const res = await fetch('/api/chat/quick-replies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        })
        const data = await res.json()
        if (!aborted && res.ok && data.ok) {
          setSuggestions(data.suggestions || [])
        }
      } catch (e) {
        console.error('Failed to fetch quick replies', e)
      } finally {
        if (!aborted) setIsLoading(false)
      }
    }
    fetchSuggestions()
    return () => {
      aborted = true
    }
  }, [open, messages])

  const handlePick = (text: string) => {
    onSelect?.(text)
    onOpenChange(false)
  }

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
        <div className="flex min-h-16 flex-wrap gap-2 py-4">
          {isLoading && (
            <div className="text-lg text-muted-foreground">생성 중…</div>
          )}
          {!isLoading && suggestions.length === 0 && (
            <div className="text-lg text-muted-foreground">
              제안이 없습니다.
            </div>
          )}
          {suggestions.map((tag, index) => (
            <QuickResponseButton
              index={index}
              tag={tag}
              key={index}
              onClick={handlePick}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
