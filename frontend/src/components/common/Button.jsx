import { cn } from '@/utils/cn'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-brand-50 disabled:opacity-50 disabled:cursor-not-allowed',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-50 disabled:opacity-50 disabled:cursor-not-allowed',
  outline: 'border border-brand-200 text-brand-600 hover:bg-brand-50 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-5 py-2.5 text-base rounded-md',
  icon: 'h-10 w-10 rounded-md',
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
  const Component = asChild ? 'span' : 'button'

  return (
    <Component
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none cursor-pointer',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
