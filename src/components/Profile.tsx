import { Radio } from 'lucide-react'

export function Profile({
  id,
  name,
  status,
}: {
  id: string
  name: string
  status: string
}) {
  return (
    <div
      key={id}
      className="flex items-center gap-3 border-b border-border px-4 py-4 mx-1 my-1 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
    >
      <Radio className="h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="flex-1">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}
