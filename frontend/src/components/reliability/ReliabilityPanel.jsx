import { ReliabilityScore } from '@/components/reliability/ReliabilityScore'
import { cn } from '@/utils/cn'

export function ReliabilityPanel({ reliability, scopeLabel, className }) {
  if (!reliability) return null

  const scopeText =
    scopeLabel ??
    (reliability.scope === 'group' && reliability.groupId
      ? 'In this pod'
      : 'Across all pods')

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4',
        className,
      )}
    >
      <ReliabilityScore reliability={reliability} size="md" showLabel={false} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">Reliability score</p>
        <p className="mt-0.5 text-sm text-slate-600">
          {reliability.score != null
            ? reliability.label || 'Based on assigned task completion'
            : `Complete at least 3 assigned tasks to unlock (${reliability.tasksScored ?? 0} scored so far)`}
        </p>
        <p className="mt-1 text-xs text-slate-400">{scopeText}</p>
      </div>
    </div>
  )
}
