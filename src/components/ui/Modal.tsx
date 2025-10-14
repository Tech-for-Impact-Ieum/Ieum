import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/ui-utils'

export const Dialog = DialogPrimitive.Root

export const DialogTrigger = DialogPrimitive.Trigger

export const DialogPortal = DialogPrimitive.Portal

export const DialogClose = DialogPrimitive.Close

function DialogOverlay(
  {
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
  ref: React.ForwardedRef<React.ElementRef<typeof DialogPrimitive.Overlay>>,
) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

const DialogOverlayWithRef = React.forwardRef(DialogOverlay)
DialogOverlayWithRef.displayName = DialogPrimitive.Overlay.displayName

function DialogContent(
  {
    className,
    children,
    ...props
  }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  ref: React.ForwardedRef<React.ElementRef<typeof DialogPrimitive.Content>>,
) {
  return (
    <DialogPortal>
      <DialogOverlayWithRef />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 rounded-lg bg-background p-6 shadow-lg w-[80%] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
          // Backgroudn Layout이 깨져서 animation일단 disable하고 필요한것만 사용
          // 'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg mx-4 sm:mx-0',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

const DialogContentWithRef = React.forwardRef(DialogContent)
DialogContentWithRef.displayName = DialogPrimitive.Content.displayName

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 text-center sm:text-left',
        className,
      )}
      {...props}
    />
  )
}
DialogHeader.displayName = 'DialogHeader'

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className,
      )}
      {...props}
    />
  )
}
DialogFooter.displayName = 'DialogFooter'

function DialogTitle(
  {
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>,
  ref: React.ForwardedRef<React.ElementRef<typeof DialogPrimitive.Title>>,
) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

const DialogTitleWithRef = React.forwardRef(DialogTitle)
DialogTitleWithRef.displayName = DialogPrimitive.Title.displayName

function DialogDescription(
  {
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>,
  ref: React.ForwardedRef<React.ElementRef<typeof DialogPrimitive.Description>>,
) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

const DialogDescriptionWithRef = React.forwardRef(DialogDescription)
DialogDescriptionWithRef.displayName = DialogPrimitive.Description.displayName

export {
  DialogOverlayWithRef as DialogOverlay,
  DialogContentWithRef as DialogContent,
  DialogTitleWithRef as DialogTitle,
  DialogDescriptionWithRef as DialogDescription,
}
