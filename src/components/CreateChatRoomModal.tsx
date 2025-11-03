'use client'

import { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { ApiClient } from '@/lib/api-client'
import { User } from '@/lib/interface'

interface CreateChatRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoomCreated?: () => void
}

export function CreateChatRoomModal({
  open,
  onOpenChange,
  onRoomCreated,
}: CreateChatRoomModalProps) {
  const [roomName, setRoomName] = useState('')
  const [friends, setFriends] = useState<User[]>([])
  const [selectedFriends, setSelectedFriends] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [friendsLoading, setFriendsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchFriends()
    }
  }, [open])

  const fetchFriends = async () => {
    try {
      setFriendsLoading(true)
      const data = await ApiClient.get('/friends')
      setFriends(data.friends)
    } catch (error) {
      console.error('Failed to fetch friends:', error)
    } finally {
      setFriendsLoading(false)
    }
  }

  const toggleFriend = (friendId: number) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    )
  }

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert('채팅방 이름을 입력하세요')
      return
    }

    if (selectedFriends.length === 0) {
      alert('최소 한 명의 친구를 선택하세요')
      return
    }

    try {
      setLoading(true)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const participantIds = [...selectedFriends, currentUser.id]

      await ApiClient.post('/chat/rooms', {
        name: roomName,
        participantIds,
      })

      alert('채팅방이 생성되었습니다!')
      setRoomName('')
      setSelectedFriends([])
      onOpenChange(false)
      onRoomCreated?.()
    } catch (error: any) {
      console.error('Failed to create room:', error)
      alert(error.message || '채팅방 생성에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">새 채팅방 만들기</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">채팅방 이름</label>
          <Input
            type="text"
            placeholder="채팅방 이름을 입력하세요"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            친구 선택 ({selectedFriends.length}명 선택됨)
          </label>

          {friendsLoading ? (
            <p className="text-center text-gray-500 py-4">로딩 중...</p>
          ) : friends.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              친구가 없습니다. 먼저 친구를 추가하세요.
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              {friends.map((friend) => (
                <label
                  key={friend.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend.id)}
                    onChange={() => toggleFriend(friend.id)}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <p className="font-medium">{friend.name}</p>
                    {friend.email && (
                      <p className="text-sm text-gray-500">{friend.email}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={handleCreateRoom}
            disabled={
              loading ||
              !roomName.trim() ||
              selectedFriends.length === 0 ||
              friendsLoading
            }
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? '생성 중...' : '생성'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
