import * as React from 'react'
import { cn } from '../../lib/ui-utils'
import { Button } from './Button'
import {
  MessageSquarePlus,
  Mic,
  Smile,
  Paperclip,
  FileText,
} from 'lucide-react'

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

export function ActionButton({
  setShowModal,
  children,
  title, // unused
}: {
  setShowModal: (show: boolean) => void
  children: React.ReactNode
  title: string
}) {
  return (
    <Button
      variant="ghost"
      size={null}
      className="gap-2 cursor-pointer w-auto h-16 [&_svg]:size-auto bg-kakao-gray hover:text-white hover:bg-black active:text-white active:bg-black"
      onClick={() => setShowModal(true)}
    >
      {children}
      {/* <div className="whitespace-pre-line">{title}</div> */}
    </Button>
  )
}

export function ActionButtons({
  setShowSummaryModal,
  setShowEmojiModal,
  setShowVoiceModal,
  setShowQuickResponseModal,
  onMediaClick,
}: {
  setShowSummaryModal: (show: boolean) => void
  setShowEmojiModal: (show: boolean) => void
  setShowVoiceModal: (show: boolean) => void
  setShowQuickResponseModal: (show: boolean) => void
  onMediaClick?: () => void
}) {
  return (
    <div className="grid grid-cols-4 items-center justify-center gap-2 divide-x divide-1 divide-gray px-4 py-2">
      <ActionButton setShowModal={setShowSummaryModal} title="요약 보기">
        <FileText size={48} />
      </ActionButton>
      <ActionButton setShowModal={setShowEmojiModal} title="이모티콘">
        <Smile size={48} />
      </ActionButton>
      <ActionButton setShowModal={setShowVoiceModal} title="음성 인식">
        <Mic size={48} />
      </ActionButton>
      <ActionButton setShowModal={setShowQuickResponseModal} title="빠른 답장">
        <MessageSquarePlus size={48} />
      </ActionButton>
      {onMediaClick && (
        <Button
          variant="ghost"
          size={null}
          className="gap-2 cursor-pointer w-auto h-16 [&_svg]:size-auto bg-kakao-gray hover:text-white hover:bg-black active:text-white active:bg-black"
          onClick={onMediaClick}
        >
          <Paperclip size={48} />
        </Button>
      )}
    </div>
  )
}

export { InputWithRef as Input }
