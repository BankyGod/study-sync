import { MemberAvatar } from '@/components/workspace/MemberAvatar'

export function MemberAvatarButton({
  member,
  size = 'md',
  showOnline = false,
  online = false,
  className,
  onClick,
  refreshKey = 0,
}) {
  return (
    <MemberAvatar
      member={member}
      size={size}
      showOnline={showOnline}
      online={online}
      className={className}
      refreshKey={refreshKey}
      onClick={onClick ? () => onClick() : undefined}
    />
  )
}
