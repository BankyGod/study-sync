import { Clock } from 'lucide-react'
import { cn } from '@/utils/cn'

const tagStyles = {
  urgent: 'bg-red-50 text-red-600',
  soon: 'bg-amber-50 text-amber-600',
  later: 'bg-slate-100 text-slate-600',
  due: 'bg-red-50 text-red-600',
  upcoming: 'bg-amber-50 text-amber-600',
  draft: 'bg-sky-50 text-sky-600',
}

export function UpcomingDeadlines({ deadlines }) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
          <Clock className="h-4 w-4" />
        </div>
        <h2 className="font-semibold text-slate-900">Upcoming Deadlines</h2>
      </div>

      <ul className="space-y-4">
        {deadlines.map((deadline) => (
          <li
            key={deadline.id}
            className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-slate-900">{deadline.title}</p>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  tagStyles[deadline.tagVariant],
                )}
              >
                {deadline.tag}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{deadline.datetime}</p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-5 w-full text-center text-sm font-medium text-violet-600 transition hover:text-violet-700"
      >
        View All Deadlines
      </button>
    </aside>
  )
}
