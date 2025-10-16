import { NextResponse } from 'next/server'
import { chatRooms } from '@/lib/dummy_data'
import { Message } from '@/lib/interface'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { roomId, content, username } = body

    if (!roomId || !content) {
      return NextResponse.json(
        { message: 'roomId와 content는 필수입니다.' },
        { status: 400 },
      )
    }

    // (in-memory)
    const newMessage: Message = {
      id: String(Date.now()),
      text: content,
      sender: username ? 'other' : 'me',
      time: new Date().toLocaleTimeString(),
      username: username ?? undefined,
      roomId: roomId,
    }

    // (dev only)
    chatRooms.find((room) => room.id === roomId)?.messages.push(newMessage)

    return NextResponse.json({ ok: true, message: newMessage }, { status: 201 })
  } catch (err) {
    console.error('POST /api/chat/messages error', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to send message' },
      { status: 500 },
    )
  }
}
// POST : /api/chat/messages (메시지 전송)
