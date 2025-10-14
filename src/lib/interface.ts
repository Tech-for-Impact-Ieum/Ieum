export interface Friend {
  id: string
  name: string
}

export interface ChatRoom {
  id: string
  name: string
  lastMessage: string
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
}
