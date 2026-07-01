import { cn } from '@/utils/cn'

export function NavBadge({ count, className }) {
  if (!count || count <= 0) return null

  return (
    <span
      className={cn(
        'absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold leading-none text-white',
        className,
      )}
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}
