'use client'

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initSocketClient(userId?: string) {
  if (socket?.connected) {
    return socket
  }

  const defaultPort = Number(process.env.NEXT_PUBLIC_SOCKET_PORT || 3001)
  const url = process.env.NEXT_PUBLIC_SOCKET_URL || `${typeof window !== 'undefined' ? window.location.protocol + '//' + window.location.hostname : 'http://localhost'}:${defaultPort}`

  socket = io(url, {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
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

