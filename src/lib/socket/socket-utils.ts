// Socket.IO 브로드캐스트 유틸리티
// global.socketIO는 socket-server.js에서 설정됩니다
export function broadcastMessage(roomId: string, message: any) {
  try {
    const io = (global as any).socketIO

    if (io) {
      io.to(roomId).emit('new-message', message)
      console.log(`Broadcasted new message to room ${roomId}`)
      return true
    }
  } catch (error) {
    console.error('Failed to broadcast message:', error)
  }
  return false
}

export function broadcastRoomUpdate(roomId: string, room: any) {
  try {
    const io = (global as any).socketIO

    if (io) {
      io.to(roomId).emit('room-updated', room)
      console.log(`Broadcasted room update to room ${roomId}`)
      return true
    }
  } catch (error) {
    console.error('Failed to broadcast room update:', error)
  }
  return false
}
