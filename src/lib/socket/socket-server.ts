import { createServer } from 'http'
import { Server as IOServer } from 'socket.io'

const DEFAULT_PORT = Number(process.env.SOCKET_PORT || 3001)

export function initSocketServer(port: number = DEFAULT_PORT) {
  try {
    // reuse existing global instance if present
    if ((global as any).socketIO) {
      return (global as any).socketIO as IOServer
    }

    const httpServer = createServer()

    const io = new IOServer(httpServer, {
      path: '/socket.io/',
      cors: {
        origin: process.env.NEXT_PUBLIC_SOCKET_ORIGIN || '*',
        methods: ['GET', 'POST'],
      },
    })

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id)

      socket.on('join-room', (roomId: string) => {
        if (roomId) {
          socket.join(roomId)
          console.log(`Socket ${socket.id} joined room ${roomId}`)
        }
      })

      socket.on('leave-room', (roomId: string) => {
        if (roomId) {
          socket.leave(roomId)
          console.log(`Socket ${socket.id} left room ${roomId}`)
        }
      })

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', socket.id, reason)
      })
    })

    httpServer.listen(port, () => {
      console.log(`Socket server listening on port ${port}`)
    })

    ;(global as any).socketIO = io
    return io
  } catch (err) {
    console.error('Failed to init socket server', err)
    throw err
  }
}

export function getSocketServer() {
  return (global as any).socketIO as IOServer | undefined
}
