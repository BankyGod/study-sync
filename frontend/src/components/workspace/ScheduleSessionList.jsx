import { CalendarDays } from 'lucide-react'
import { cn } from '@/utils/cn'

export function ScheduleSessionList({ heading, items, showJoin = false, emptyMessage }) {
  const content = items.length === 0 ? (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
      <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-3 text-sm font-medium text-slate-700">No sessions scheduled yet</p>
      <p className="mt-1 text-sm text-slate-500">
        {emptyMessage ?? 'Use Schedule a Session to plan your next group study.'}
      </p>
    </div>
  ) : (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/70 bg-slate-50/50 px-5 py-4"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
            </div>
          </div>
          {showJoin && (
            <button
              type="button"
              className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Join
            </button>
          )}
        </li>
      ))}
    </ul>
  )

  if (!heading) return content

  return (
    <section>
      <h2 className={cn('mb-4 text-base font-bold text-slate-900')}>{heading}</h2>
      {content}
    </section>
  )
}
