import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Message from '@/lib/models/Message'
import ChatRoom from '@/lib/models/ChatRoom'
import mongoose from 'mongoose'
import { broadcastMessage } from '@/lib/socket/socket-utils'
import { initSocketServer } from '@/lib/socket/socket-server'


export async function GET(req: Request, { params }: any) {
  try {
    await dbConnect()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid room ID' },
        { status: 400 },
      )
    }

  
    const room = await ChatRoom.findById(id).exec()
    if (!room) {
      return NextResponse.json(
        { ok: false, error: 'Room not found' },
        { status: 404 },
      )
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

 
    const messages = await Message.find({ roomId: id })
      .populate('sender', 'name')
      .sort({ sentAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec()

    const formattedMessages = messages
      .reverse()
      .map((msg: any) => ({
        id: msg._id.toString(),
        text: msg.content,
        sender: 'me', // TODO: 실제 로그인 사용자와 비교하여 설정
        time: new Date(msg.sentAt).toLocaleTimeString(),
        username: msg.sender?.name,
        roomId: msg.roomId.toString(),
        type: msg.type || 'text',
      }))

    return NextResponse.json({ ok: true, roomId: id, messages: formattedMessages })
  } catch (err) {
    console.error('GET /api/chat/rooms/[id]/messages error', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch messages' },
      { status: 500 },
    )
  }
}


export async function POST(req: Request, { params }: any) {
  try {
    try {
      initSocketServer()
    } catch (e) {
      console.warn('socket server init failed or already running', e)
    }
    await dbConnect()
    const { id } = params
    const body = await req.json()
    const { content, senderId, type } = body

    if (!content || !senderId) {
      return NextResponse.json(
        { message: 'content와 senderId는 필수입니다.' },
        { status: 400 },
      )
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(senderId)) {
      return NextResponse.json(
        { message: 'Invalid room ID or sender ID' },
        { status: 400 },
      )
    }

    // 채팅방 존재 여부 확인
    const room = await ChatRoom.findById(id).exec()
    if (!room) {
      return NextResponse.json(
        { ok: false, error: 'Room not found' },
        { status: 404 },
      )
    }

  
    const newMessage = new Message({
      roomId: id,
      content,
      sender: senderId,
      type: type || 'text',
    })

    const savedMessage = await newMessage.save()

    
    await ChatRoom.findByIdAndUpdate(id, {
      lastMessage: savedMessage._id,
      lastMessageAt: savedMessage.sentAt,
      $inc: { unreadCount: 1 },
    })

  
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'name')
      .lean()
      .exec()

    if (!populatedMessage) {
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch saved message' },
        { status: 500 },
      )
    }

    const msg: any = populatedMessage

    const formattedMessage = {
      id: msg._id.toString(),
      text: msg.content,
      sender: 'me', // TODO: 실제 로그인 사용자와 비교하여 설정
      time: new Date(msg.sentAt).toLocaleTimeString(),
      username: msg.sender?.name,
      roomId: msg.roomId.toString(),
      type: msg.type,
    }

    // Socket을 통해 실시간으로 메시지 브로드캐스트
    broadcastMessage(msg.roomId.toString(), formattedMessage)

    return NextResponse.json({ ok: true, message: formattedMessage }, { status: 201 })
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
