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
        'flex h-10 w-full rounded-3xl border border-input bg-gray-100 px-3 py-5 text-2xl  ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
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
    <div className="grid grid-cols-3 items-center justify-center gap-2 divide-x divide-1 divide-gray px-4 py-2">
      <Button
        variant="ghost"
        size={null}
        className=" gap-2 cursor-pointer text-2xl w-auto"
        onClick={() => setShowEmojiModal(true)}
      >
        <Smile size={24} />
        <div className="whitespace-pre-line">{`이모
        티콘`}</div>
      </Button>
      <Button
        variant="ghost"
        size={null}
        className="flex-1 gap-2 cursor-pointer text-2xl w-auto"
        onClick={() => setShowVoiceModal(true)}
      >
        <Mic size={24} />
        <div className="whitespace-pre-line">{`음성
        인식`}</div>
      </Button>
      <Button
        variant="ghost"
        size={null}
        className="flex-1 gap-2 cursor-pointer text-2xl w-auto"
        onClick={() => setShowQuickResponseModal(true)}
      >
        <ImageIcon size={24} />
        <div className="whitespace-pre-line">{`빠른
        답장`}</div>
      </Button>
    </div>
  )
}

export { InputWithRef as Input }
