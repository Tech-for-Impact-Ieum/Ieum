'use client'

import { useState } from 'react'
import { friends } from '../../lib/dummy_data'
import { MenuHeader } from '../../components/Header'
import SearchBar from '../../components/SearchBar'
import { Profile } from '@/components/Profile'

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-full flex-col">
      <MenuHeader title="친구" />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Friends List */}
      <div className="flex-1 px-3 pb-20 overflow-y-auto bg-white ">
        {filteredFriends.map((friend) => (
          <Profile key={friend.id} id={friend.id} name={friend.name} />
        ))}
      </div>
    </div>
  )
}
