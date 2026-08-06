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
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-display text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-brand-700">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                Active · {members.length} member{members.length === 1 ? '' : 's'}
              </p>
            </div>
            {to ? <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted" /> : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex -space-x-2">
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
            <div className="min-w-[5.5rem] text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Progress</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{safeProgress}%</p>
            </div>
          </div>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border/70">
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
    'block border-b border-border bg-surface px-4 py-4 transition last:border-b-0',
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
