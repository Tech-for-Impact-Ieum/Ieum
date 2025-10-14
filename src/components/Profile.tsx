import { Friend } from '@/lib/interface'
import { Radio } from 'lucide-react'

export function Profile({ id, name }: Friend) {
  return (
    <div
      key={id}
      className="flex items-center gap-3 border-1 border-solid border-black px-4 py-6 mx-1 my-2 rounded-2xl hover:shadow-md transition-shadow cursor-pointer"
    >
      <Radio className="h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="flex-1">
        <h3 className="font-medium text-2xl">{name}</h3>
      </div>
    </div>
  )
}
