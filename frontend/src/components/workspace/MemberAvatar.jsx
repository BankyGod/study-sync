import { useEffect, useState } from 'react'
import {
  getProfileInitials,
  normalizeAvatarColor,
  readCachedUserAvatar,
  resolveAvatarSrc,
} from '@/services/usersService'
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
  style,
}) {
  const avatarUrl = member?.avatarUrl ?? null
  const resolved = resolveAvatarSrc(avatarUrl, refreshKey)
  const [src, setSrc] = useState(
    () => resolved || (DEV_BYPASS_AUTH ? readCachedUserAvatar(member?.id) : null),
  )
  const [failed, setFailed] = useState(false)

  const initials = member?.initials ?? getProfileInitials(member?.name ?? '')
  const color = normalizeAvatarColor(member?.color)
  const showInitials = !src || failed

  useEffect(() => {
    setFailed(false)

    if (resolved) {
      setSrc(resolved)
      return
    }

    if (DEV_BYPASS_AUTH) {
      setSrc(readCachedUserAvatar(member?.id))
      return
    }

    setSrc(null)
  }, [resolved, member?.id, refreshKey])

  const avatar = (
    <div
      title={member?.name}
      style={style}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white',
        SIZE_CLASSES[size],
        color,
        bordered && 'ring-2 ring-white',
        onClick && 'cursor-pointer transition hover:ring-2 hover:ring-brand-300 hover:ring-offset-1',
        className,
      )}
    >
      {showInitials ? (
        <span className="select-none">{initials || '?'}</span>
      ) : (
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => {
            setFailed(true)
            setSrc(null)
          }}
        />
      )}
      {showOnline && online ? (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
      ) : null}
    </div>
  )

  if (!onClick) {
    return avatar
  }

  return (
    <button
      type="button"
      onClick={() => onClick(member)}
      className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      aria-label={`View ${member?.name ?? 'member'} profile`}
    >
      {avatar}
    </button>
  )
}
