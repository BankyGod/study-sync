import { Video } from 'lucide-react'
import { useWorkspaceCall } from '@/context/WorkspaceCallContext'
import { cn } from '@/utils/cn'

export function ActiveCallBanner({ className }) {
  const { activeCall, isBusy, error, startOrJoinCall, endCall } = useWorkspaceCall()

  if (!activeCall && !error) return null

  return (
    <div
      className={cn(
        'rounded-lg border border-brand-200 bg-brand-50 px-3 py-3 sm:px-4',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
            <Video className="h-4 w-4 shrink-0" />
            {activeCall ? 'Live pod call' : 'Call update'}
          </p>
          <p className="mt-0.5 truncate text-xs text-brand-700">
            {activeCall?.title || error || 'A video call is available for this pod.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeCall ? (
            <>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => startOrJoinCall()}
                className="min-h-10 rounded-lg bg-brand-600 px-3 text-sm font-semibold text-surface transition hover:bg-brand-700 disabled:opacity-60"
              >
                Join call
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={endCall}
                className="min-h-10 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-ink transition hover:bg-page disabled:opacity-60"
              >
                End
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
