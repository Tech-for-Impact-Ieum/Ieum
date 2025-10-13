import { NextResponse } from 'next/server'
import { sampleMessages } from '@/lib/dummy_data'
import { Message } from '@/lib/interface'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: Request, { params }: any) {
  try {
    const { id } = params
    const messages = sampleMessages.filter((m) => m.roomId === id)
    return NextResponse.json({ ok: true, roomId: id, messages })
  } catch (err) {
    console.error('GET /api/chat/rooms/[id]/messages error', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch messages' },
      { status: 500 },
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: Request, { params }: any) {
  try {
    const { id } = params
    const body = await req.json()
    const { content, username } = body

    if (!content) {
      return NextResponse.json(
        { message: 'content는 필수입니다.' },
        { status: 400 },
      )
    }

    const newMessage: Message = {
      id: String(Date.now()),
      text: content,
      sender: username ? 'other' : 'me',
      time: new Date().toLocaleTimeString(),
      username: username ?? undefined,
      roomId: id,
    }

    // In-memory append (dev only)
    sampleMessages.push(newMessage)

    return NextResponse.json({ ok: true, message: newMessage }, { status: 201 })
  } catch (err) {
    console.error('POST /api/chat/rooms/[id]/messages error', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to send message' },
      { status: 500 },
    )
  }
}

// GET /api/chat/rooms/[id]/messages (메시지 목록 조회)
// POST /api/chat/rooms/[id]/messages (메시지 전송)
