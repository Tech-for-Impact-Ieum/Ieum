import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ChatRoom from '@/lib/models/ChatRoom'

export async function GET() {
  try {
    await dbConnect()
    
    // 채팅방 목록 조회 (최신 순으로 정렬)
    const rooms = await ChatRoom.find({})
      .populate('participants', 'name')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .lean()
      .exec()
    
    // MongoDB 문서를 프론트엔드 형식으로 변환
    const formattedRooms = rooms.map((room: any) => ({
      id: room._id.toString(),
      name: room.name,
      messages: [], // 메시지는 별도 조회
      unread: room.unreadCount || 0,
      time: room.lastMessageAt ? new Date(room.lastMessageAt).toISOString() : new Date().toISOString(),
      participants: room.participants || [],
    }))
    
    return NextResponse.json({ ok: true, rooms: formattedRooms })
  } catch (err) {
    console.error('GET /api/chat/rooms error', err)
    return NextResponse.json({ ok: false, error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

// POST: 채팅방 생성
export async function POST(req: Request) {
  try {
    await dbConnect()
    const body = await req.json()
    const { name, participantIds } = body

    if (!name || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { message: '채팅방 이름과 참가자 목록은 필수입니다.' },
        { status: 400 }
      )
    }

    const newRoom = new ChatRoom({
      name,
      participants: participantIds,
    })

    const savedRoom = await newRoom.save()
    
    // 참가자 정보와 함께 반환
    const populatedRoom = await ChatRoom.findById(savedRoom._id)
      .populate('participants', 'name')
      .lean()
      .exec()

    if (!populatedRoom) {
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch created room' },
        { status: 500 }
      )
    }

    const room: any = populatedRoom

    return NextResponse.json({ 
      ok: true, 
      room: {
        id: room._id.toString(),
        name: room.name,
        messages: [],
        unread: 0,
        time: new Date().toISOString(),
        participants: room.participants || [],
      }
    }, { status: 201 })
  } catch (err) {
    console.error('POST /api/chat/rooms error', err)
    return NextResponse.json({ ok: false, error: 'Failed to create room' }, { status: 500 })
  }
}
//GET: /api/chat/rooms (채팅방 목록 조회)
//POST: /api/chat/rooms (채팅방 생성)