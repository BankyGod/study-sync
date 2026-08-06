import { useSessionTimer } from '@/context/SessionTimerContext'
import { cn } from '@/utils/cn'

export function SessionTimerCard({ compact = false }) {
  const { display, isRunning, toggle } = useSessionTimer()

  if (compact) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Session
          </p>
          <p className="mt-0.5 font-mono text-lg font-semibold tracking-wider text-ink">{display}</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          className="min-h-10 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface transition hover:bg-brand-700"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
      </section>
    )
  }

  return (
    <section className={cn('border-b border-border pb-5')}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Session timer
      </p>
      <p className="mt-2 font-mono text-3xl font-semibold tracking-wider text-ink">{display}</p>
      <button
        type="button"
        onClick={toggle}
        className="mt-3 min-h-11 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-surface transition hover:bg-brand-700"
      >
        {isRunning ? 'Pause session' : 'Start session'}
      </button>
    </section>
  )
}
