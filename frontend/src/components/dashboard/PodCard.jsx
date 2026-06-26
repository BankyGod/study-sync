import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { cn } from '@/utils/cn'

const accentStyles = {
  blue: {
    icon: 'bg-sky-50 text-sky-600',
    bar: 'bg-sky-500',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600',
    bar: 'bg-emerald-500',
  },
  purple: {
    icon: 'bg-violet-50 text-violet-600',
    bar: 'bg-violet-500',
  },
}

export function PodCard({ title, members, progress, accent = 'blue', to }) {
  const styles = accentStyles[accent]

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', styles.icon)}>
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex -space-x-2">
        {members.map((member) => (
          <div
            key={member.id ?? member.initials}
            title={member.name}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white',
              member.color,
            )}
          >
            {member.initials}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-slate-500">Progress</span>
          <span className="font-semibold text-slate-700">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn('h-full rounded-full transition-all', styles.bar)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  )

  const cardClassName = cn(
    'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md',
    to && 'hover:border-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500',
  )

  if (to) {
    return (
      <Link to={to} className={cn('block', cardClassName)}>
        {content}
      </Link>
    )
  }

  return <article className={cardClassName}>{content}</article>
}
