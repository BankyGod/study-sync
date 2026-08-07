import { CalendarDays } from 'lucide-react'
import { cn } from '@/utils/cn'

export function ScheduleSessionList({
  heading,
  items,
  showJoin = false,
  onJoin,
  emptyMessage,
}) {
  const content =
    items.length === 0 ? (
      <div className="border-y border-border py-8 text-center">
        <CalendarDays className="mx-auto h-6 w-6 text-muted" />
        <p className="mt-3 text-sm font-medium text-ink">No sessions scheduled yet</p>
        <p className="mt-1 text-sm text-muted">
          {emptyMessage ?? 'Use Schedule a Session to plan your next group study.'}
        </p>
      </div>
    ) : (
      <ul className="divide-y divide-border border-y border-border">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 py-4"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.meta}</p>
              </div>
            </div>
            {showJoin ? (
              <button
                type="button"
                onClick={() => onJoin?.(item)}
                className="min-h-10 shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface transition hover:bg-brand-700"
              >
                Join call
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    )

  if (!heading) return content

  return (
    <section>
      <h2 className={cn('mb-4 font-display text-base font-semibold text-ink')}>{heading}</h2>
      {content}
    </section>
  )
}
