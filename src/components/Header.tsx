import { ArrowLeft } from 'lucide-react'
import { Button } from './ui/Button'
import Link from 'next/link'

export function MenuHeader({ title }: { title: string }) {
  return (
    <header className="sticky flex justify-center bg-white top-0 z-40 px-4 py-4">
      <h1 className="text-3xl font-bold">{title}</h1>
    </header>
  )
}

export function ChatHeader({ title }: { title: string }) {
  return (
    <header className="bg-kakao-skyblue sticky top-0 z-40 flex items-center gap-3 px-4 py-3">
      <Link href="/">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      <div className="flex-1">
        <h1 className="font-semibold text-3xl">{title}</h1>
      </div>
    </header>
  )
}
