import { cn } from '@/utils/cn'

export function MemberAvatar({
  member,
  size = 'md',
  showOnline = false,
  online = false,
  onClick,
  className,
}) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-[10px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-11 w-11 text-sm',
  }

  const initials = member?.initials ?? '?'
  const color = member?.color ?? 'bg-slate-400'

  const avatar = (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        sizeClasses[size],
        color,
        onClick && 'cursor-pointer transition hover:ring-2 hover:ring-violet-300 hover:ring-offset-2',
        className,
      )}
    >
      {initials}
      {showOnline && online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </div>
  )

  if (!onClick) {
    return avatar
  }

  return (
    <button
      type="button"
      onClick={() => onClick(member)}
      className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
      aria-label={`View ${member?.name ?? 'member'} profile`}
    >
      {avatar}
    </button>
  )
}
