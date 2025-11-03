import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ChatRoom from '@/lib/models/ChatRoom'
import mongoose from 'mongoose'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: Request, { params }: any) {
  try {
    await dbConnect()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid room ID' },
        { status: 400 }
      )
    }

    const room = await ChatRoom.findById(id)
      .populate('participants', 'name')
      .populate('lastMessage')
      .lean()
      .exec()

    if (!room) {
      return NextResponse.json(
        { ok: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    const roomData: any = room

    const formattedRoom = {
      id: roomData._id.toString(),
      name: roomData.name,
      messages: [],
      unread: roomData.unreadCount || 0,
      time: roomData.lastMessageAt ? new Date(roomData.lastMessageAt).toISOString() : new Date().toISOString(),
      participants: roomData.participants || [],
    }

    return NextResponse.json({ ok: true, room: formattedRoom })
  } catch (err) {
    console.error('GET /api/chat/rooms/[id] error', err)
    return NextResponse.json({ ok: false, error: 'Failed to fetch room' }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: Request, { params }: any) {
  try {
    await dbConnect()
    const { id } = params
    const body = await req.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid room ID' },
        { status: 400 }
      )
    }

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      id,
      { 
        name: body.name,
        participants: body.participantIds,
        unreadCount: body.unreadCount,
      },
      { new: true }
    )
      .populate('participants', 'name')
      .populate('lastMessage')
      .lean()
      .exec()

    if (!updatedRoom) {
      return NextResponse.json(
        { ok: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    const roomData: any = updatedRoom

    const formattedRoom = {
      id: roomData._id.toString(),
      name: roomData.name,
      messages: [],
      unread: roomData.unreadCount || 0,
      time: roomData.lastMessageAt ? new Date(roomData.lastMessageAt).toISOString() : new Date().toISOString(),
      participants: roomData.participants || [],
    }

    return NextResponse.json({ ok: true, room: formattedRoom })
  } catch (err) {
    console.error('PUT /api/chat/rooms/[id] error', err)
    return NextResponse.json({ ok: false, error: 'Failed to update room' }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: Request, { params }: any) {
  try {
    await dbConnect()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid room ID' },
        { status: 400 }
      )
    }

    const deletedRoom = await ChatRoom.findByIdAndDelete(id).exec()

    if (!deletedRoom) {
      return NextResponse.json(
        { ok: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true, message: 'Room deleted successfully' })
  } catch (err) {
    console.error('DELETE /api/chat/rooms/[id] error', err)
    return NextResponse.json({ ok: false, error: 'Failed to delete room' }, { status: 500 })
  }
}

// GET: /api/chat/rooms/[id] (채팅방 상세 조회)
// PUT: /api/chat/rooms/[id] (채팅방 수정)
// DELETE: /api/chat/rooms/[id] (채팅방 삭제)
