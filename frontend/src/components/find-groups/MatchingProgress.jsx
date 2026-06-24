import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export const MATCHING_STEPS = [
  { id: 'preferences', label: 'Analyzing your preferences' },
  { id: 'compatibility', label: 'Checking group compatibility' },
  { id: 'searching', label: 'Searching for active teams' },
  { id: 'schedules', label: 'Matching with study schedules' },
  { id: 'finalizing', label: 'Finalizing your best matches' },
]

function StepIcon({ status }) {
  if (status === 'completed') {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    )
  }

  if (status === 'active') {
    return <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
  }

  return <span className="h-6 w-6 rounded-full border-2 border-slate-200" />
}

export function MatchingProgress({ progress, steps }) {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="matching-progress-bar h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-center text-sm font-medium text-slate-600">
          {Math.round(progress)}% Complete
        </p>
      </div>

      <ul className="space-y-3">
        {steps.map((step) => (
          <li
            key={step.id}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3.5 transition-colors',
              step.status === 'completed' && 'bg-emerald-50/80',
              step.status === 'active' && 'bg-violet-50',
              step.status === 'pending' && 'bg-transparent',
            )}
          >
            <StepIcon status={step.status} />
            <span
              className={cn(
                'text-sm font-medium',
                step.status === 'completed' && 'text-emerald-800',
                step.status === 'active' && 'text-violet-800',
                step.status === 'pending' && 'text-slate-400',
              )}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
