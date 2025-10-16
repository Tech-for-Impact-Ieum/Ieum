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

// NOTE: roomId needed?
export interface Message {
  id: string
  text: string
  sender: 'me' | 'other'
  time: string
  username?: string
  roomId?: string
}
