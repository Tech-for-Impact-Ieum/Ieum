'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Modal'
import { Button } from '@/components/ui/Button'
import { Mic } from 'lucide-react'

interface VoiceInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (text: string, audioBlob: Blob | null) => void
}

export function VoiceInputModal({
  open,
  onOpenChange,
  onSend,
}: VoiceInputModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recordedChunksRef = useRef<BlobPart[]>([])

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
      // Reset previous session state
      setTranscript('')
      setRecordingTime(0)
      setIsRecording(false)
      setAudioBlob(null)
    } else {
      stopRecording()
    }
  }, [open])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRetry = () => {
    setRecordingTime(0)
    setTranscript('')
    setAudioBlob(null)
    startRecording().catch((e) => console.error(e))
  }

  const handleStart = () => {
    startRecording().catch((e) => console.error('Failed to start recording', e))
  }

  const handleTranscribe = async () => {
    try {
      setIsTranscribing(true)
      const blob = await stopRecording()
      if (!blob) return

      // Store the audio blob for later upload (regardless of transcription success)
      setAudioBlob(blob)

      const form = new FormData()
      // Use .webm since MediaRecorder default in Chrome produces webm/opus
      form.append(
        'file',
        new File([blob], 'audio.webm', { type: blob.type || 'audio/webm' }),
      )
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        console.error('Transcription failed', data)
        // Don't return - allow user to send audio without transcript
        setTranscript('')
        return
      }
      setTranscript(data.text || '')
    } catch (e) {
      console.error('Failed to send transcription', e)
      // Still allow sending the audio even if transcription fails
      setTranscript('')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleSend = () => {
    onSend(transcript, audioBlob)
    onOpenChange(false)
  }

  async function startRecording() {
    // Request mic access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaStreamRef.current = stream
    recordedChunksRef.current = []

    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
    recorder.start()
    setIsRecording(true)
  }

  async function stopRecording(): Promise<Blob | null> {
    if (!mediaRecorderRef.current) {
      setIsRecording(false)
      return null
    }
    const recorder = mediaRecorderRef.current
    if (recorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => {
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop())
            mediaStreamRef.current = null
          }
          resolve()
        }
        recorder.stop()
      })
    }
    setIsRecording(false)
    const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
    recordedChunksRef.current = []
    setRecordingTime(0)
    return blob
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

          {/* Transcript preview */}
          {!isRecording && isTranscribing && (
            <div className="text-lg text-muted-foreground">처리 중…</div>
          )}
          {!isRecording && audioBlob && transcript && (
            <div className="w-full rounded-md border p-3 text-lg text-muted-foreground">
              {transcript}
            </div>
          )}
          {!isRecording && audioBlob && !transcript && !isTranscribing && (
            <div className="w-full rounded-md border p-3 text-lg text-muted-foreground text-center">
              {/* FIXME: minimize text if needed */}
              <div>음성 인식에 실패했습니다.</div>
              <div>오디오만 전송합니다.</div>
            </div>
          )}

          <div className="flex gap-3">
            {/* Initial state: show start button */}
            {!isRecording && !audioBlob && (
              <Button onClick={handleStart} className="min-w-[120px]">
                녹음 시작
              </Button>
            )}

            {/* Recording state: show finish button */}
            {isRecording && (
              <Button
                onClick={handleTranscribe}
                className="min-w-[120px]"
                disabled={isTranscribing}
              >
                {isTranscribing ? '처리 중…' : '녹음 완료'}
              </Button>
            )}

            {/* After transcription: show retry and send */}
            {!isRecording && audioBlob && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="min-w-[120px] bg-transparent"
                >
                  다시 녹음
                </Button>
                <Button
                  onClick={handleSend}
                  className="min-w-[120px]"
                  disabled={!audioBlob}
                >
                  보내기
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
