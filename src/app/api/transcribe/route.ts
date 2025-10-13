import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { toFile } from 'openai/uploads'

export const runtime = 'nodejs'

// SERVER RUNTIME CONFIGURATION
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: 'No audio file provided' },
        { status: 400 },
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { ok: false, error: 'Server missing OPENAI_API_KEY' },
        { status: 500 },
      )
    }

    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: await toFile(file, file.name || 'audio.webm'),
    })

    return NextResponse.json({ ok: true, text: transcription.text ?? '' })
  } catch (err) {
    console.error('POST /api/transcribe error', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to transcribe audio' },
      { status: 500 },
    )
  }
}
