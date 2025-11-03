'use client'

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initSocketClient(token?: string) {
  if (socket?.connected) {
    return socket
  }

  // Get token from localStorage if not provided
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('token') || undefined
  }

  const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4001'

  socket = io(url, {
    path: '/socket.io/',
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  })

  socket.on('connect', () => {
    console.log('✓ Socket connected:', socket?.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('⊖ Socket disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('✗ Socket connection error:', error.message)
  })

  socket.on('error', (error) => {
    console.error('✗ Socket error:', error)
  })

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function joinRoom(roomId: string) {
  if (socket && socket.connected) {
    socket.emit('join-room', roomId)
    console.log(`Joined room: ${roomId}`)
  }
}

export function leaveRoom(roomId: string) {
  if (socket && socket.connected) {
    socket.emit('leave-room', roomId)
    console.log(`Left room: ${roomId}`)
  }
}

export function onNewMessage(callback: (message: any) => void) {
  if (socket) {
    socket.on('new-message', callback)
  }

  return () => {
    if (socket) {
      socket.off('new-message', callback)
    }
  }
}

export function onRoomUpdate(callback: (room: any) => void) {
  if (socket) {
    socket.on('room-updated', callback)
  }

  return () => {
    if (socket) {
      socket.off('room-updated', callback)
    }
  }
}

export function onUserStatusChanged(callback: (data: any) => void) {
  if (socket) {
    socket.on('user-status-changed', callback)
  }

  return () => {
    if (socket) {
      socket.off('user-status-changed', callback)
    }
  }
}

export function onUserJoined(callback: (data: any) => void) {
  if (socket) {
    socket.on('user-joined', callback)
  }

  return () => {
    if (socket) {
      socket.off('user-joined', callback)
    }
  }
}

export function onUserLeft(callback: (data: any) => void) {
  if (socket) {
    socket.on('user-left', callback)
  }

  return () => {
    if (socket) {
      socket.off('user-left', callback)
    }
  }
}

export function sendMessage(
  roomId: string,
  content: string,
  type: string = 'text',
) {
  if (socket && socket.connected) {
    socket.emit('send-message', { roomId, content, type })
  }
}
