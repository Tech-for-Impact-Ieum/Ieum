'use client'

import { useState } from 'react'
import { Radio } from 'lucide-react'
import { friends } from '../../lib/dummy_data'
import { MenuHeader } from '../../components/Header'
import SearchBar from '../../components/SearchBar'

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <MenuHeader title="친구" />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto">
        {filteredFriends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 border-b border-border px-4 py-4"
          >
            <Radio className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <h3 className="font-medium">{friend.name}</h3>
              <p className="text-sm text-muted-foreground">{friend.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
