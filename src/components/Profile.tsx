import { Friend } from '@/lib/interface'
import { CircleUserRound } from 'lucide-react'

export function Profile({ id, name }: Friend) {
  return (
    <div
      key={id}
      className="flex items-center gap-4 border-1 border-solid border-black px-4 py-6 mx-1 my-2 rounded-2xl hover:shadow-md transition-shadow cursor-pointer"
    >
      <CircleUserRound size={36} className="text-black" />
      <div className="flex-1">
        <h3 className="font-medium text-2xl">{name}</h3>
      </div>
    </div>
  )
}
