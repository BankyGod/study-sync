import { cn } from '@/utils/cn'

function getStrokeColor(value) {
  if (value == null) return '#cbd5e1'
  if (value >= 80) return '#059669'
  if (value >= 50) return '#d97706'
  return '#dc2626'
}

export function CircularProgress({
  value = 0,
  label,
  size = 88,
  strokeWidth = 8,
  className,
}) {
  const hasValue = value != null && !Number.isNaN(value)
  const normalized = hasValue ? Math.max(0, Math.min(100, Math.round(value))) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = hasValue ? circumference - (normalized / 100) * circumference : circumference
  const strokeColor = getStrokeColor(hasValue ? normalized : null)

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
        title={label}
      >
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute text-lg font-bold text-slate-900">
          {hasValue ? `${normalized}%` : '—'}
        </span>
      </div>
      {label ? <span className="text-xs font-medium text-slate-500">{label}</span> : null}
    </div>
  )
}
