import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../shared/utils/cn'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'lg-btn-primary font-bold': variant === 'default',
            'lg-btn-destructive font-bold': variant === 'destructive',
            'lg-btn-ghost text-slate-800 font-semibold border-white/70': variant === 'outline',
            'lg-btn-ghost text-slate-900 font-semibold': variant === 'secondary',
            'hover:bg-white/50 text-slate-700 hover:text-[#001941]': variant === 'ghost',
            'text-[#001941] underline-offset-4 hover:underline font-semibold': variant === 'link',
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-xl px-3': size === 'sm',
            'h-11 rounded-2xl px-8': size === 'lg',
            'h-10 w-10 rounded-xl': size === 'icon',
          },
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'