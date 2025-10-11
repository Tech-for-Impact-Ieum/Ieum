import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '../../lib/utils'

function Avatar(
  {
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
  ref: React.ForwardedRef<React.ElementRef<typeof AvatarPrimitive.Root>>,
) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  )
}

const AvatarWithRef = React.forwardRef(Avatar)
AvatarWithRef.displayName = AvatarPrimitive.Root.displayName

function AvatarImage(
  {
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>,
  ref: React.ForwardedRef<React.ElementRef<typeof AvatarPrimitive.Image>>,
) {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn('aspect-square h-full w-full', className)}
      {...props}
    />
  )
}

const AvatarImageWithRef = React.forwardRef(AvatarImage)
AvatarImageWithRef.displayName = AvatarPrimitive.Image.displayName

function AvatarFallback(
  {
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>,
  ref: React.ForwardedRef<React.ElementRef<typeof AvatarPrimitive.Fallback>>,
) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className,
      )}
      {...props}
    />
  )
}

const AvatarFallbackWithRef = React.forwardRef(AvatarFallback)
AvatarFallbackWithRef.displayName = AvatarPrimitive.Fallback.displayName

export {
  AvatarWithRef as Avatar,
  AvatarImageWithRef as AvatarImage,
  AvatarFallbackWithRef as AvatarFallback,
}
