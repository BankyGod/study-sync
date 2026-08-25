import { Link } from 'react-router-dom'
import { ArrowUpRight, Users } from 'lucide-react'
import { MemberAvatar } from '@/components/workspace/MemberAvatar'
import { CircularProgress } from '@/components/dashboard/CircularProgress'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

const accents = [
  'from-[#136b63] to-[#1fa396]',
  'from-[#0b1220] to-[#1c2538]',
  'from-[#0f766e] to-[#34d3ad]',
  'from-[#145650] to-[#148579]',
]

export function PodCard({ title, members = [], progress = 0, to, compact = false, index = 0 }) {
  const { avatarVersion } = useAuth()
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0))
  const accent = accents[index % accents.length]

  const body = (
    <>
      <div className={cn('h-1.5 w-full bg-gradient-to-r', accent)} />
      <div className={cn('flex gap-3 p-4', compact && 'p-3')}>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink">
              {title}
            </h3>
            {to ? (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-page text-muted">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {members.slice(0, 3).map((member) => (
                <MemberAvatar
                  key={member.id ?? member.initials}
                  member={member}
                  size="sm"
                  bordered
                  refreshKey={avatarVersion}
                />
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <Users className="h-3 w-3" />
              {members.length}
            </span>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-muted">Progress</span>
              <span className="font-semibold tabular-nums text-ink">{safeProgress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-page">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r', accent)}
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>
        </div>

        {!compact ? (
          <CircularProgress
            value={safeProgress}
            size={56}
            strokeWidth={5}
            showLabel={false}
            className="shrink-0"
          />
        ) : null}
      </div>
    </>
  )

  const className =
    'dash-card block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md'

  if (to) {
    return (
      <Link to={to} className={className}>
        {body}
      </Link>
    )
  }

  return <article className={className}>{body}</article>
}
