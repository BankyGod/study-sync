import { cn } from '@/utils/cn'

export function MemberAvatarButton({
  member,
  size = 'md',
  showOnline = false,
  online = false,
  className,
  onClick,
}) {
  const sizeClass =
    size === 'sm' ? 'h-8 w-8 text-[10px]' : size === 'lg' ? 'h-11 w-11 text-xs' : 'h-9 w-9 text-xs'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!member?.id || !onClick}
      className={cn(
        'relative shrink-0 rounded-full transition hover:ring-2 hover:ring-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-default disabled:hover:ring-0',
        !onClick && 'pointer-events-none',
        className,
      )}
      aria-label={member?.name ? `View ${member.name}'s profile` : 'View member profile'}
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-full font-semibold text-white',
          sizeClass,
          member?.color ?? 'bg-slate-400',
        )}
      >
        {member?.initials ?? '?'}
      </span>
      {showOnline && online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </button>
  )
}
