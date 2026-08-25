import { CalendarDays } from 'lucide-react'
import { cn } from '@/utils/cn'

const tagStyles = {
  urgent: 'bg-red-50 text-red-700',
  soon: 'bg-amber-50 text-amber-800',
  later: 'bg-page text-muted',
  due: 'bg-red-50 text-red-700',
  upcoming: 'bg-amber-50 text-amber-800',
  draft: 'bg-brand-50 text-brand-800',
}

export function UpcomingDeadlines({ deadlines = [], className }) {
  return (
    <section className={cn('dash-card flex h-full flex-col p-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-semibold text-ink">Deadlines</h2>
        <span className="ss-chip">{deadlines.length}</span>
      </div>

      {deadlines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-page px-3 py-6 text-center">
          <CalendarDays className="h-5 w-5 text-muted" />
          <p className="mt-2 text-[12px] font-semibold text-ink">Nothing due</p>
          <p className="mt-0.5 text-[11px] text-muted">Pod task dates show up here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {deadlines.map((deadline) => (
            <li key={deadline.id} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium text-ink">{deadline.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{deadline.course}</p>
                </div>
                {deadline.tag ? (
                  <span
                    className={cn(
                      'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                      tagStyles[deadline.tagVariant] ?? tagStyles.later,
                    )}
                  >
                    {deadline.tag}
                  </span>
                ) : null}
              </div>
              {deadline.datetime ? (
                <p className="mt-0.5 text-[11px] text-muted">{deadline.datetime}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
