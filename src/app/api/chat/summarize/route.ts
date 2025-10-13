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
      messages?: { sender: 'me' | 'other'; username?: string; text: string }[]
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'messages array is required' },
        { status: 400 },
      )
    }

    const text = messages
      .slice(-50)
      .map(
        (m) =>
          `${m.username ?? (m.sender === 'me' ? '나' : '상대')}: ${m.text}`,
      )
      .join('\n')

    const system =
      'You are a helpful assistant that summarizes Korean chats briefly. Keep it concise and clear, 1-2 sentences.'

    const user = `다음 대화의 맥락을 한국어로 1-2문장으로 간단히 요약해 주세요. 핵심 주제, 결정 사항, 다음 액션이 있다면 포함해 주세요.\n\n${text}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
    })

    const summary = response.choices?.[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ ok: true, summary })
  } catch (err) {
    console.error('POST /api/chat/summarize error', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to summarize chat' },
      { status: 500 },
    )
  }
}
