/**
 * Interface definitions for Ieum Chat Application
 * Updated to match new backend schema
 */

// ============================================
// User Types
// ============================================

export interface UserSetting {
  nickname?: string
  imageUrl?: string
  isSpecial: boolean // 발달장애인 인터페이스
  isTest: boolean // 테스트 계정
  enableNotifications: boolean
  enableSummary: boolean
  isOnline?: boolean
  lastSeenAt?: string
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  setting?: UserSetting
  createdAt?: string
  friendshipStatus?: 'none' | 'pending' | 'accepted' | 'blocked'
}

export interface Friend {
  id: number
  name: string
  email?: string
  setting?: UserSetting
}

// ============================================
// Message Types
// ============================================

export interface MediaItem {
  type: 'audio' | 'image' | 'video' | 'file'
  url: string
  fileName?: string
  fileSize?: number
  duration?: number // 음성/비디오
  width?: number // 이미지/비디오
  height?: number
}

export interface ReadByUser {
  userId: number
  readAt: string
}

export interface Message {
  id: string // MongoDB ObjectId
  roomId: number // MySQL Room.id (number)
  senderId: number
  senderName: string
  senderImageUrl?: string
  text?: string
  media: MediaItem[]
  readBy: ReadByUser[]
  createdAt: string
  updatedAt?: string
  isDeleted?: boolean
  deletedAt?: string
  // Legacy fields for compatibility
  sender?: 'me' | 'other'
  time?: string
  username?: string
}

// ============================================
// Chat Room Types
// ============================================

export interface LastMessage {
  id: string
  text?: string
  senderId: number
  senderName: string
  createdAt: string
}

export interface ChatRoom {
  id: number // MySQL Room.id (number)
  name: string
  imageUrl?: string
  participantCount: number
  roomType: 'direct' | 'group'
  unreadCount: number
  lastMessage?: LastMessage
  lastMessageAt?: string
  participants: User[]
  isPinned?: boolean
  isMuted?: boolean
  // Legacy fields
  messages?: Message[]
  unread?: number
  time?: string
}

// ============================================
// Summary Types
// ============================================

export interface ChatSummary {
  id: number
  text: string
  audioUrl: string
  messageCount: number
  createdAt: string
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  ok: boolean
  error?: string
  [key: string]: any
}

export interface RoomsResponse extends ApiResponse {
  rooms: ChatRoom[]
}

export interface MessagesResponse extends ApiResponse {
  messages: Message[]
  hasMore?: boolean
}

export interface RoomResponse extends ApiResponse {
  room: ChatRoom
}

export interface MessageResponse extends ApiResponse {
  message: Message
}
