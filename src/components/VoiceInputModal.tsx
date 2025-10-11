'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Modal'
import { Button } from '@/components/ui/button'
import { Mic } from 'lucide-react'

interface VoiceInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoiceInputModal({ open, onOpenChange }: VoiceInputModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  useEffect(() => {
    if (open) {
      setIsRecording(true)
    } else {
      setIsRecording(false)
      setRecordingTime(0)
    }
  }, [open])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRetry = () => {
    setRecordingTime(0)
    setIsRecording(true)
  }

  const handleSend = () => {
    setIsRecording(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">음성입력</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Mic
              className={`h-12 w-12 text-primary ${
                isRecording ? 'animate-pulse' : ''
              }`}
            />
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {formatTime(recordingTime)}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="min-w-[100px] bg-transparent"
            >
              다시하기
            </Button>
            <Button onClick={handleSend} className="min-w-[100px]">
              보내기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
