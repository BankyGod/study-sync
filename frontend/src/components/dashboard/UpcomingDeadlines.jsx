import { CalendarDays } from 'lucide-react'
import { cn } from '@/utils/cn'

const tagStyles = {
  urgent: 'bg-red-50 text-red-800',
  soon: 'bg-ochre-soft text-ochre',
  later: 'bg-page text-muted',
  due: 'bg-red-50 text-red-800',
  upcoming: 'bg-ochre-soft text-ochre',
  draft: 'bg-brand-50 text-brand-700',
}

export function UpcomingDeadlines({ deadlines = [] }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">Deadlines</h2>
        <p className="text-xs text-muted">From your pods</p>
      </div>

      {deadlines.length === 0 ? (
        <div className="flex items-start gap-3 border-t border-border py-4">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Nothing due yet</p>
            <p className="mt-0.5 text-sm text-muted">
              Task due dates from your pods will show up here.
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {deadlines.map((deadline) => (
            <li key={deadline.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{deadline.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{deadline.course}</p>
                </div>
                {deadline.tag ? (
                  <span
                    className={cn(
                      'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium',
                      tagStyles[deadline.tagVariant] ?? tagStyles.later,
                    )}
                  >
                    {deadline.tag}
                  </span>
                ) : null}
              </div>
              {deadline.datetime ? (
                <p className="mt-1 text-xs text-muted">{deadline.datetime}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
