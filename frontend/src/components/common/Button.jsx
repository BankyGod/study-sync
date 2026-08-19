import { cloneElement, isValidElement } from 'react'
import { cn } from '@/utils/cn'

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm disabled:opacity-50',
  secondary:
    'border border-border bg-surface text-ink hover:bg-page active:bg-brand-50 disabled:opacity-50',
  ghost:
    'bg-transparent text-soft hover:bg-page hover:text-ink disabled:opacity-50',
  danger:
    'bg-danger text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50',
  outline:
    'border border-brand-300 bg-transparent text-brand-700 hover:bg-brand-50 active:bg-brand-100 disabled:opacity-50',
  white:
    'bg-white text-ink hover:bg-gray-50 shadow-sm disabled:opacity-50',
}

const sizes = {
  xs: 'min-h-8 px-3 py-1 text-xs rounded-lg gap-1.5',
  sm: 'min-h-9 px-3.5 py-1.5 text-sm rounded-xl gap-2',
  md: 'min-h-11 px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'min-h-12 px-6 py-3 text-base rounded-xl gap-2',
  icon: 'h-10 w-10 rounded-xl',
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
    'inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed',
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
