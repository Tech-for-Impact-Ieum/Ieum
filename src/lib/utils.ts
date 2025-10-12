import { ChatRoom, Friend, Message } from "./interface";

const BASE_URL = "http://localhost:3000/api";

// 채팅방 목록 조회 — API returns { ok: true, rooms }
export async function fetchChatRooms(): Promise<ChatRoom[]> {
    const response = await fetch(`${BASE_URL}/chat/rooms`)
    if (!response.ok) {
        throw new Error("Failed to fetch chat rooms.")
    }
    const data = await response.json()
    return data.rooms ?? []
}

// 메시지 목록 조회 — API returns { ok: true, roomId, messages }
export async function fetchMessages(roomId: string): Promise<Message[]> {
    const response = await fetch(`${BASE_URL}/chat/rooms/${roomId}/messages`)
    if (!response.ok) {
        throw new Error(`Failed to fetch messages for room ${roomId}.`)
    }
    const data = await response.json()
    return data.messages ?? []
}

// 메시지 전송(POST) — API returns { ok: true, message }
export async function sendMessage(roomId: string, content: string, username?: string): Promise<Message> {
    const response = await fetch(`${BASE_URL}/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, username }),
    })

    if (!response.ok) {
        throw new Error("Failed to send message.")
    }
    const data = await response.json()
    return data.message
}