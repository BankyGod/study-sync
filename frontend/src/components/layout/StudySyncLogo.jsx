export function StudySyncLogo({ className = '', light = false }) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <div
        className={
          light
            ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface/15 text-surface'
            : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-surface'
        }
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M4 5.5C4 4.67 4.67 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M13 4h5.5c.83 0 1.5.67 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H13V4Z"
            fill="currentColor"
            opacity="0.55"
          />
        </svg>
      </div>
      <span
        className={
          light
            ? 'truncate font-display text-lg font-semibold tracking-tight text-surface'
            : 'truncate font-display text-lg font-semibold tracking-tight text-ink'
        }
      >
        StudySync
      </span>
    </div>
  )
}
