import { NextResponse } from 'next/server'
import { chatRooms } from '@/lib/dummy_data'

export async function GET() {
  try {
    return NextResponse.json({ ok: true, rooms: chatRooms })
  } catch (err) {
    console.error('GET /api/chat/rooms error', err)
    return NextResponse.json({ ok: false, error: 'Failed to fetch rooms' }, { status: 500 })
  }
}
//GET: /api/chat/rooms (채팅방 목록 조회)