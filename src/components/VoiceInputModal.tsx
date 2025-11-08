'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mic } from 'lucide-react'
import { uploadToS3 } from '@/lib/media-utils'
import { MediaItem } from '@/lib/interface'
import { AudioPlayer } from './AudioPlayer'

interface VoiceInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (text: string, audioMedia?: MediaItem) => void
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
  const [isUploading, setIsUploading] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioMedia, setAudioMedia] = useState<MediaItem | null>(null)
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
      setAudioUrl(null)
      setAudioMedia(null)
      setIsUploading(false)
    } else {
      stopRecording()
      // Clean up audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
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
    setAudioMedia(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
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

      // Save blob for preview and upload
      setAudioBlob(blob)
      const previewUrl = URL.createObjectURL(blob)
      setAudioUrl(previewUrl)

      // Transcribe audio to text
      const form = new FormData()
      form.append(
        'file',
        new File([blob], 'audio.webm', { type: blob.type || 'audio/webm' }),
      )

      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        console.error('Transcription failed', data)
        setTranscript('음성을 텍스트로 변환할 수 없습니다.')
        return
      }
      setTranscript(data.text || '')
    } catch (e) {
      console.error('Failed to transcribe audio', e)
      setTranscript('음성을 텍스트로 변환하는 중 오류가 발생했습니다.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleUploadAndSend = async () => {
    if (!audioBlob || !transcript) return

    try {
      setIsUploading(true)

      // Upload audio to S3
      const audioFile = new File([audioBlob], 'voice-message.webm', {
        type: 'audio/webm',
      })

      const uploadedMedia = await uploadToS3(audioFile)
      setAudioMedia(uploadedMedia)

      // Send message with text and audio
      onSend(transcript, uploadedMedia)
      onOpenChange(false)
    } catch (e) {
      console.error('Failed to upload audio', e)
      alert('음성 업로드에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSendTextOnly = () => {
    onSend(transcript)
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

          {/* Transcription loading */}
          {!isRecording && isTranscribing && (
            <div className="flex items-center gap-2 text-lg text-muted-foreground">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              텍스트 변환 중...
            </div>
          )}

          {/* Audio preview */}
          {!isRecording && audioUrl && (
            <div className="w-full">
              <AudioPlayer src={audioUrl} variant="compact" />
            </div>
          )}

          {/* Editable transcript */}
          {!isRecording && transcript && (
            <div className="w-full">
              <label className="text-sm text-gray-600 mb-1 block">
                변환된 텍스트 (수정 가능)
              </label>
              <Input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="변환된 텍스트를 수정하세요"
                className="w-full text-lg"
              />
            </div>
          )}

          <div className="flex gap-3">
            {/* Initial state: show start button */}
            {!isRecording && !transcript && (
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

            {/* After transcription: show retry and send options */}
            {!isRecording && transcript && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="min-w-[120px] bg-transparent"
                  disabled={isUploading}
                >
                  다시 녹음
                </Button>
                {audioBlob ? (
                  <Button
                    onClick={handleUploadAndSend}
                    className="min-w-[120px]"
                    disabled={!transcript || isUploading}
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        업로드 중...
                      </span>
                    ) : (
                      '음성 + 텍스트 전송'
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSendTextOnly}
                    className="min-w-[120px]"
                    disabled={!transcript}
                  >
                    텍스트만 전송
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
