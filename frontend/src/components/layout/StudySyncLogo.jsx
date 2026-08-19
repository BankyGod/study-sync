export function StudySyncLogo({ className = '', light = false, size = 'md' }) {
  const sz = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const text = size === 'sm' ? 'text-base' : 'text-lg'

  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <div
        className={`${sz} shrink-0 flex items-center justify-center rounded-xl`}
        style={{
          background: light
            ? 'rgba(255,255,255,0.15)'
            : 'linear-gradient(135deg, #7c6af4 0%, #6c4de8 100%)',
        }}
      >
        <svg viewBox="0 0 24 24" className={icon} fill="none" aria-hidden="true">
          <path d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7l-8-4z" fill="white" opacity="0.9" />
          <path d="M9.5 11.5l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      <span
        className={`truncate ${text} font-semibold tracking-tight`}
        style={{ color: light ? '#ffffff' : 'var(--color-ink)' }}
      >
        StudySync
      </span>
    </div>
  )
}
