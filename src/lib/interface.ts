// TODO: add profile image
export interface Friend {
  id: string
  name: string
}

export interface ChatRoom {
  id: string
  name: string
  messages: Message[]
  unread: number
  time: string
}

export interface Message {
  id: string
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
  profileImage?: string
  isOnline: boolean
}
