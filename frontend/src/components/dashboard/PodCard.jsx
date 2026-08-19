import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import { MemberAvatar } from '@/components/workspace/MemberAvatar'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

export function PodCard({ title, members = [], progress = 0, to, compact = false }) {
  const { avatarVersion } = useAuth()
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0))

  const body = (
    <div className="flex min-w-0 items-center gap-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
        style={{ background: 'linear-gradient(135deg, #7c6af4, #6c4de8)' }}
      >
        <BookOpen className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            'font-semibold text-ink',
            compact ? 'text-sm' : 'text-[15px]',
            to ? 'line-clamp-1' : 'line-clamp-2',
          )}>
            {title}
          </h3>
          {to ? <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" /> : null}
        </div>

        <div className="mt-2 flex items-center gap-3">
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
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-page text-[10px] font-bold text-muted">
                +{members.length - 4}
              </div>
            ) : null}
          </div>
          <span className="text-xs text-muted">{members.length} member{members.length === 1 ? '' : 's'}</span>
        </div>

        {!compact && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted mb-1">
              <span>Progress</span>
              <span className="font-semibold text-ink">{safeProgress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-page">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${safeProgress}%`,
                  background: 'linear-gradient(90deg, #7c6af4, #6c4de8)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const className = cn(
    'block min-w-0 border-b border-border px-5 py-4 transition last:border-b-0',
    to && 'hover:bg-brand-50/40',
    compact && 'px-4 py-3',
  )

  if (to) {
    return <Link to={to} className={className}>{body}</Link>
  }

  return <article className={className}>{body}</article>
}
