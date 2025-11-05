import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Modal'

export function ContextHelper({
  messages,
}: {
  messages: { senderName: string; text: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')

  useEffect(() => {
    let aborted = false
    async function run() {
      if (!open) return
      try {
        setLoading(true)
        setSummary('')
        const res = await fetch('/api/chat/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        })
        const data = await res.json()
        if (!aborted && res.ok && data.ok) {
          setSummary(data.summary || '')
        }
      } catch (e) {
        if (!aborted) setSummary('요약을 가져오지 못했습니다.')
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    run()
    return () => {
      aborted = true
    }
  }, [open, messages])

  return (
    <div className="w-full">
      <div
        className="px-4 py-2 border-b border-border bg-muted/40 flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="flex justify-end items-end gap-2">
          <span className="text-lg">? 대화 요약 보기</span>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">대화 요약</DialogTitle>
          </DialogHeader>
          <div className="min-h-24 whitespace-pre-wrap text-lg text-muted-foreground mt-8">
            {loading ? '요약 중…' : summary || '요약이 없습니다.'}
          </div>
          <div className="flex justify-center pt-2">
            <Button className="min-w-[100px]" onClick={() => setOpen(false)}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
