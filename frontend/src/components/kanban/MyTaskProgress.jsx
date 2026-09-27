import { AlertTriangle, UserCheck } from 'lucide-react'
import { cn } from '@/utils/cn'

function Stat({ label, value, tone }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className={cn('text-lg font-semibold tabular-nums text-ink', tone)}>{value}</p>
    </div>
  )
}

export function MyTaskProgress({ summary, showMineOnly, onToggleMineOnly }) {
  const hasTasks = summary.total > 0

  return (
    <section className="mb-4 rounded-lg border border-border bg-surface p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">Your progress</h2>
          <p className="text-xs text-muted">
            {hasTasks
              ? `${summary.completed} of ${summary.total} assigned task${summary.total === 1 ? '' : 's'} done`
              : 'No tasks assigned to you in this pod yet.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleMineOnly}
          aria-pressed={showMineOnly}
          className={cn(
            'inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition',
            showMineOnly
              ? 'border-brand-600 bg-brand-600 text-surface hover:bg-brand-700'
              : 'border-border bg-surface text-ink hover:bg-page',
          )}
        >
          <UserCheck className="h-3.5 w-3.5" />
          {showMineOnly ? 'Showing my tasks' : 'My tasks only'}
        </button>
      </div>

      {hasTasks ? (
        <>
          <div className="mt-3 grid grid-cols-4 gap-3">
            <Stat label="To do" value={summary.todo} />
            <Stat label="In progress" value={summary.inProgress} />
            <Stat label="Done" value={summary.completed} tone="text-brand-700" />
            <Stat
              label="Overdue"
              value={summary.overdue}
              tone={summary.overdue > 0 ? 'text-red-600' : undefined}
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-page">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${summary.percent}%` }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums text-ink">{summary.percent}%</span>
          </div>
          {summary.overdue > 0 ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              {summary.overdue} of your task{summary.overdue === 1 ? ' is' : 's are'} past due.
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
