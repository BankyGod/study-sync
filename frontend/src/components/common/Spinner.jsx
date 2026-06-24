import { cn } from '@/utils/cn'

export function Spinner({ className, size = 'md' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-brand-200 border-t-brand-600',
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
