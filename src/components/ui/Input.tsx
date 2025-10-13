import * as React from 'react'
import { cn } from '../../lib/ui-utils'
import { Button } from './Button'
import { ImageIcon, Mic, Smile } from 'lucide-react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

function Input(
  { className, type, ...props }: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}

const InputWithRef = React.forwardRef(Input)
InputWithRef.displayName = 'Input'

export function ActionButtons({
  setShowEmojiModal,
  setShowVoiceModal,
  setShowQuickResponseModal,
}: {
  setShowEmojiModal: (show: boolean) => void
  setShowVoiceModal: (show: boolean) => void
  setShowQuickResponseModal: (show: boolean) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-border px-4 py-3">
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 gap-2 text-xs cursor-pointer"
        onClick={() => setShowEmojiModal(true)}
      >
        <Smile className="h-4 w-4" />
        이모티콘
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 gap-2 text-xs cursor-pointer"
        onClick={() => setShowVoiceModal(true)}
      >
        <Mic className="h-4 w-4" />
        음성입력
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 gap-2 text-xs cursor-pointer"
        onClick={() => setShowQuickResponseModal(true)}
      >
        <ImageIcon className="h-4 w-4" />
        빠른 답장
      </Button>
    </div>
  )
}

export { InputWithRef as Input }
