import { useEffect, useState } from 'react'
import { getProfileInitials, readCachedUserAvatar } from '@/services/usersService'
import { DEV_BYPASS_AUTH } from '@/utils/constants'
import { cn } from '@/utils/cn'

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
}

export function MemberAvatar({
  member,
  size = 'md',
  showOnline = false,
  online = false,
  onClick,
  className,
  refreshKey = 0,
  bordered = false,
}) {
  const avatarUrl = member?.avatarUrl ?? null
  const [src, setSrc] = useState(
    () => avatarUrl || (DEV_BYPASS_AUTH ? readCachedUserAvatar(member?.id) : null),
  )

  const initials = member?.initials ?? getProfileInitials(member?.name ?? '')
  const color = member?.color ?? 'bg-sky-500'
  const showInitials = !src

  useEffect(() => {
    if (avatarUrl) {
      setSrc(avatarUrl)
      return
    }

    if (DEV_BYPASS_AUTH) {
      setSrc(readCachedUserAvatar(member?.id))
      return
    }

    setSrc(null)
  }, [avatarUrl, member?.id, refreshKey])

  const avatar = (
    <div
      title={member?.name}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white',
        SIZE_CLASSES[size],
        showInitials && color,
        bordered && 'border-2 border-white',
        onClick && 'cursor-pointer transition hover:ring-2 hover:ring-violet-300 hover:ring-offset-2',
        className,
      )}
    >
      {showInitials ? initials : <img src={src} alt="" className="h-full w-full object-cover" />}
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
