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
    <div className={cn('flex items-center gap-4 border-b border-border pb-4', className)}>
      <ReliabilityScore reliability={reliability} size="md" showLabel={false} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">Reliability score</p>
        <p className="mt-0.5 text-sm text-muted">
          {reliability.score != null
            ? reliability.label || 'Based on assigned task completion'
            : `Complete at least 3 assigned tasks to unlock (${reliability.tasksScored ?? 0} scored so far)`}
        </p>
        <p className="mt-1 text-xs text-muted">{scopeText}</p>
      </div>
    </div>
  )
}
