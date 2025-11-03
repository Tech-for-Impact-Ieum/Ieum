'use client'

import { useState, useEffect } from 'react'
import { MenuHeader } from '../../components/Header'
import SearchBar from '../../components/SearchBar'
import { Profile } from '@/components/Profile'
import { ApiClient } from '@/lib/api-client'
import { Auth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/interface'

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    if (!Auth.isAuthenticated()) {
      router.push('/')
      return
    }

    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await ApiClient.get('/users')
      setUsers(data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFriends = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
    <div className="flex h-full flex-col">
      <MenuHeader title="친구" />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Friends List */}
      <div className="flex-1 px-3 pb-20 overflow-y-auto bg-white ">
        {filteredFriends.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">친구가 없습니다</p>
        ) : (
          filteredFriends.map((user: User) => (
            <Profile
              key={user.id.toString()}
              id={user.id.toString()}
              name={user.name}
            />
          ))
        )}
      </div>
    </div>
  )
}
