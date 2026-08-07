import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import { MemberAvatar } from '@/components/workspace/MemberAvatar'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

export function PodCard({ title, members = [], progress = 0, to, compact = false }) {
  const { avatarVersion } = useAuth()
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0))

  const body = (
    <>
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <BookOpen className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-ink sm:truncate sm:text-base">
                {title}
              </h3>
              <p className="mt-1 text-xs font-medium text-brand-700">
                Active · {members.length} member{members.length === 1 ? '' : 's'}
              </p>
            </div>
            {to ? (
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            ) : null}
          </div>

          <div className="mt-3 flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 flex-1 -space-x-2 overflow-hidden">
              {members.slice(0, 4).map((member) => (
                <MemberAvatar
                  key={member.id ?? member.initials}
                  member={member}
                  size="sm"
                  bordered
                  refreshKey={avatarVersion}
                />
              ))}
              {members.length > 4 ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-page text-xs font-semibold text-muted">
                  +{members.length - 4}
                </div>
              ) : null}
            </div>

            <p className="shrink-0 text-xs font-semibold tabular-nums text-ink">
              {safeProgress}%
              <span className="ml-1 font-medium text-muted">done</span>
            </p>
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/70">
            <div
              className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>
      </div>
    </>
  )

  const className = cn(
    'block min-w-0 border-b border-border bg-surface px-3 py-3.5 transition last:border-b-0 sm:px-4 sm:py-4',
    to && 'hover:bg-page/80',
    compact && 'px-3 py-3',
  )

  if (to) {
    return (
      <Link to={to} className={className}>
        {body}
      </Link>
    )
  }

  return <article className={className}>{body}</article>
}
