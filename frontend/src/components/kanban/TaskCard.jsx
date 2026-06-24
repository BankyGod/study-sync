import { cn } from '@/utils/cn'

export function TaskCard({ title, footer, assignee, variant = 'default' }) {
  return (
    <article
      className={cn(
        'rounded-xl border p-4 shadow-sm transition',
        variant === 'highlight' && 'border-amber-200 bg-amber-50/80',
        variant === 'completed' && 'border-emerald-200 bg-emerald-50/70',
        variant === 'default' && 'border-slate-200/80 bg-white',
      )}
    >
      <p className="text-sm font-medium leading-snug text-slate-900">{title}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{footer}</span>
        {assignee && (
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white',
              assignee.color,
            )}
            title={assignee.name}
          >
            {assignee.initials}
          </div>
        )}
      </div>
    </article>
  )
}
