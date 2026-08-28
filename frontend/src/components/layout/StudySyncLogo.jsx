export function StudySyncLogo({ className = '', light = false, size = 'md', showWordmark = true }) {
  const box = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7'
  const mark = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const word = size === 'sm' ? 'text-[13px]' : 'text-sm'

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <div
        className={`${box} flex shrink-0 items-center justify-center rounded-md ${
          light ? 'bg-white/10 text-white' : 'bg-ink text-white'
        }`}
      >
        <svg viewBox="0 0 24 24" className={mark} fill="none" aria-hidden="true">
          <path
            d="M5 6.5h6.5v11H7A2 2 0 0 1 5 15.5v-9Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path
            d="M12.5 6.5H19v9a2 2 0 0 1-2 2h-4.5v-11Z"
            fill="currentColor"
            opacity="0.55"
          />
        </svg>
      </div>
      {showWordmark ? (
        <span
          className={`truncate font-display ${word} font-semibold tracking-tight ${
            light ? 'text-white' : 'text-ink'
          }`}
        >
          StudySync
        </span>
      ) : null}
    </div>
  )
}
