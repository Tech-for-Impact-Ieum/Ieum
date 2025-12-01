'use client'

import { useState, useEffect } from 'react'
import { MenuHeader } from '../../components/Header'
import SearchBar from '../../components/SearchBar'
import { Profile } from '@/components/Profile'
import { ApiClient } from '@/lib/api-client'
import { Auth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/interface'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [friends, setFriends] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [addSearchQuery, setAddSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    if (!Auth.isAuthenticated()) {
      router.push('/login')
      return
    }

    fetchFriends()
  }, [router])

  const fetchFriends = async () => {
    try {
      setLoading(true)
      const data = await ApiClient.get('/friends')
      setFriends(data.friends)
    } catch (error) {
      console.error('Failed to fetch friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    if (!addSearchQuery.trim() || addSearchQuery.length < 2) {
      return
    }

    try {
      setSearchLoading(true)
      const data = await ApiClient.get(
        `/friends/search?query=${encodeURIComponent(addSearchQuery)}`,
      )
      setSearchResults(data.users)
    } catch (error) {
      console.error('Failed to search users:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const addFriend = async (friendId: number) => {
    try {
      await ApiClient.post('/friends', { friendId })
      alert('친구가 추가되었습니다!')
      setShowAddFriend(false)
      setAddSearchQuery('')
      setSearchResults([])
      fetchFriends()
    } catch (error) {
      console.error('Failed to add friend:', error)
      alert(error instanceof Error ? error.message : '친구 추가에 실패했습니다')
    }
  }

  const removeFriend = async (friendId: number) => {
    if (!confirm('정말 친구를 삭제하시겠습니까?')) {
      return
    }

    try {
      await ApiClient.delete(`/friends/${friendId}`)
      alert('친구가 삭제되었습니다')
      fetchFriends()
    } catch (error) {
      console.error('Failed to remove friend:', error)
      alert('친구 삭제에 실패했습니다')
    }
  }

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <MenuHeader title="친구" />
        <div className="flex-1 flex items-center justify-center">
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-full flex-col ">
        <MenuHeader title="친구" />
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Add Friend Button */}
        <div className="px-5 py-2 bg-gray-50 border-b">
          <Button
            onClick={() => setShowAddFriend(true)}
            className="w-full bg-black text-white font-medium text-2xl rounded-2xl"
          >
            + 친구 추가
          </Button>
        </div>

        {/* Friends List */}
        <div className="flex-1 px-3 pb-20 overflow-y-auto bg-gray-50">
          {filteredFriends.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>친구가 없습니다</p>
              <p className="text-sm mt-2">위의 버튼을 눌러 친구를 추가하세요</p>
            </div>
          ) : (
            filteredFriends.map((friend: User) => (
              <div
                key={friend.id.toString()}
                className="flex items-center justify-between py-3 border-b gap-4"
              >
                <Profile
                  id={friend.id}
                  name={friend.name}
                  email={friend.email}
                  setting={friend.setting}
                />
                <Button
                  variant="outline"
                  onClick={() => removeFriend(friend.id)}
                  className="text-red-500 hover:bg-red-50 text-2xl h-full"
                >
                  삭제
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Friend Modal */}
      <Modal open={showAddFriend} onOpenChange={setShowAddFriend}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">친구 추가</h2>

          <div className="mb-4">
            <Input
              type="text"
              placeholder="이름, 이메일, 전화번호로 검색"
              value={addSearchQuery}
              onChange={(e) => setAddSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchUsers()
                }
              }}
              className="w-full"
            />
            <Button
              onClick={searchUsers}
              disabled={searchLoading || addSearchQuery.length < 2}
              className="w-full mt-2"
            >
              {searchLoading ? '검색 중...' : '검색'}
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                {addSearchQuery.length >= 2
                  ? '검색 결과가 없습니다'
                  : '이름, 이메일 또는 전화번호를 입력하세요'}
              </p>
            ) : (
              <div className="space-y-2">
                {searchResults.map((user: User) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {user.email || user.phone || '정보 없음'}
                      </p>
                    </div>
                    {user.friendshipStatus === 'accepted' ? (
                      <span className="text-sm text-green-600">친구</span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addFriend(user.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        추가
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
