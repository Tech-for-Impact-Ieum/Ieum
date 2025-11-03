// TODO: add profile image
export interface Friend {
  id: number
  name: string
}

export interface ChatRoom {
  id: number
  name: string
  messages: Message[]
  unread: number
  time: string
}

export interface Message {
  id: number
  text: string
  sender: 'me' | 'other'
  time: string
  username?: string
  roomId?: string
  senderId?: string
  type?: string
}

export interface User {
  id: number
  name: string
  email?: string
  phoneNumber?: string
  profileImage?: string
  isOnline: boolean
  lastSeenAt?: string
  friendshipStatus?: 'none' | 'pending' | 'accepted' | 'blocked'
}
