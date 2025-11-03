import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Message from '@/lib/models/Message'
import ChatRoom from '@/lib/models/ChatRoom'
import mongoose from 'mongoose'
import { broadcastMessage } from '@/lib/socket/socket-utils'
import { initSocketServer } from '@/lib/socket/socket-server'

export async function POST(req: Request) {
  try {
    // ensure socket server is initialized
    try {
      initSocketServer()
    } catch (e) {
      console.warn('socket server init failed or already running', e)
    }
    await dbConnect()
    const body = await req.json()
    const { roomId, content, senderId, type } = body

    if (!roomId || !content || !senderId) {
      return NextResponse.json(
        { message: 'roomId, content, senderId는 필수입니다.' },
        { status: 400 },
      )
    }

    if (!mongoose.Types.ObjectId.isValid(roomId) || !mongoose.Types.ObjectId.isValid(senderId)) {
      return NextResponse.json(
        { message: 'Invalid roomId or senderId' },
        { status: 400 },
      )
    }

    const newMessage = new Message({
      roomId,
      content,
      sender: senderId,
      type: type || 'text',
    })

    const savedMessage = await newMessage.save()


    await ChatRoom.findByIdAndUpdate(roomId, {
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


    broadcastMessage(msg.roomId.toString(), formattedMessage)

    return NextResponse.json({ ok: true, message: formattedMessage }, { status: 201 })
  } catch (err) {
    console.error('POST /api/chat/messages error', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to send message' },
      { status: 500 },
    )
  }
}
// POST : /api/chat/messages (메시지 전송)
