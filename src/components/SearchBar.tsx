import { Search } from 'lucide-react'
import { Input } from './ui/Input'

export default function SearchBar({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string
  setSearchQuery: (query: string) => void
}) {
  return (
    <div className="px-4 py-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-2xl bg-gray-100 py-5 rounded-3xl"
        />
      </div>
    </div>
  )
}
