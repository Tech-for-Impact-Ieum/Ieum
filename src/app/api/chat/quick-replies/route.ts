import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { ok: false, error: 'Server missing OPENAI_API_KEY' },
        { status: 500 },
      )
    }

    const body = await req.json()
    const { messages } = body as {
      messages?: { sender: string; text: string }[]
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'messages array is required' },
        { status: 400 },
      )
    }

    const lastTurns = messages.slice(-12)
    const chatText = lastTurns
      .map((m) => `${m.sender === 'me' ? 'User' : 'Other'}: ${m.text}`)
      .join('\n')

    const system =
      'You are a concise assistant that suggests short, natural Korean quick replies (1 short sentence or phrase each). Return only a JSON array of 3-4 strings, no extra text.'

    const user = `Recent chat:\n${chatText}\n\nGenerate 3-4 short, natural Korean quick replies that the user might send next. Output JSON array only.`

    console.log(system)
    console.log(user)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 120,
    })

    const content = response.choices?.[0]?.message?.content?.trim() || '[]'

    let suggestions: string[] = []
    try {
      suggestions = JSON.parse(content)
      if (!Array.isArray(suggestions)) suggestions = []
      suggestions = suggestions.filter((s) => typeof s === 'string').slice(0, 4)
    } catch {
      suggestions = []
    }

    return NextResponse.json({ ok: true, suggestions })
  } catch (err) {
    console.error('POST /api/chat/quick-replies error', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to generate quick replies' },
      { status: 500 },
    )
  }
}
