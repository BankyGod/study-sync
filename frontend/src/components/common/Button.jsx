import { cloneElement, isValidElement } from 'react'
import { cn } from '@/utils/cn'

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:opacity-45',
  secondary:
    'border border-border bg-surface text-ink hover:bg-page active:bg-page disabled:opacity-45',
  ghost: 'bg-transparent text-soft hover:bg-page hover:text-ink disabled:opacity-45',
  danger: 'bg-danger text-white hover:bg-red-700 disabled:opacity-45',
  outline:
    'border border-brand-700/25 bg-transparent text-brand-800 hover:bg-brand-50 disabled:opacity-45',
}

const sizes = {
  xs: 'h-7 gap-1 px-2 text-[11px] rounded-lg',
  sm: 'h-9 gap-1.5 px-3 text-xs rounded-lg',
  md: 'h-10 gap-1.5 px-3.5 text-[13px] rounded-lg',
  lg: 'h-11 gap-2 px-4 text-sm rounded-xl',
  icon: 'h-9 w-9 rounded-lg',
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  asChild = false,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center whitespace-nowrap font-semibold transition focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className,
  )

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: cn(classes, children.props.className),
    })
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
