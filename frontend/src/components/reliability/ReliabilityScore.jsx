import { cn } from '@/utils/cn'
import { formatReliabilityDisplay } from '@/services/reliabilityService'

export function ReliabilityScore({
  score,
  reliability,
  size = 'md',
  showLabel = true,
  className,
}) {
  const resolvedScore = reliability?.score ?? score
  const display = formatReliabilityDisplay(
    reliability ?? (resolvedScore != null ? { score: resolvedScore } : null),
  )
  const normalized =
    display.score != null ? Math.max(0, Math.min(100, display.score)) : null

  const color =
    normalized == null
      ? 'text-slate-400'
      : normalized >= 80
        ? 'text-emerald-600'
        : normalized >= 50
          ? 'text-amber-600'
          : 'text-red-600'

  const ring =
    normalized == null
      ? 'border-slate-200'
      : normalized >= 80
        ? 'border-emerald-200'
        : normalized >= 50
          ? 'border-amber-200'
          : 'border-red-200'

  const dimensions = size === 'lg' ? 'h-20 w-20 text-lg' : size === 'sm' ? 'h-10 w-10 text-xs' : 'h-14 w-14 text-sm'

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full border-4 bg-white font-bold',
          dimensions,
          ring,
          color,
        )}
      >
        {normalized != null ? `${normalized}%` : '—'}
      </div>
      {showLabel && (
        <span className="max-w-[8rem] text-center text-xs font-medium text-slate-500">
          {display.subtitle}
        </span>
      )}
    </div>
  )
}
