import { useSessionTimer } from '@/context/SessionTimerContext'

export function SessionTimerCard() {
  const { display, isRunning, toggle } = useSessionTimer()

  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        Session Timer
      </p>
      <p className="mt-3 text-center font-mono text-4xl font-bold tracking-wider text-slate-900">
        {display}
      </p>
      <button
        type="button"
        onClick={toggle}
        className="session-start-btn mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
      >
        {isRunning ? 'Pause Session' : 'Start Session'}
      </button>
    </div>
  )
}
