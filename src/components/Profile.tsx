import { Friend } from '@/lib/interface'
import { CircleUserRound } from 'lucide-react'
import Image from 'next/image'

export function Profile({ id, name, email, setting }: Friend) {
  const imageUrl = setting?.imageUrl
  const displayName = setting?.nickname || name

  return (
    <div
      key={id}
      className="flex items-center gap-4 border-1 border-solid border-gray-400 px-4 py-5 mx-2 my-2 rounded-2xl hover:shadow-md transition-shadow cursor-pointer w-full bg-white"
    >
      {/* Profile Image or Icon */}
      {imageUrl ? (
        <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
          <Image
            src={imageUrl}
            alt={displayName}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <CircleUserRound size={36} className="text-black shrink-0" />
      )}

      {/* User Info */}
      <div className="flex-1 overflow-hidden">
        <h3 className="font-medium text-2xl truncate">{displayName}</h3>
        {email && (
          <p className="text-sm text-muted-foreground truncate">{email}</p>
        )}
      </div>
    </div>
  )
}
