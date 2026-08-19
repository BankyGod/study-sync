import { Link } from 'react-router-dom'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { ROUTES } from '@/utils/constants'
import { AUTH_BACKGROUND_IMAGE } from '@/utils/auth'

export function AuthLayout({ children, title, subtitle, footer, formClassName = 'w-full max-w-[26rem]' }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1fr_1fr]">
      {/* Left panel */}
      <div
        className="relative hidden min-h-dvh overflow-hidden lg:block"
        style={{ background: 'var(--color-sidebar)' }}
      >
        <img
          src={AUTH_BACKGROUND_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/80 via-[#1a1533]/90 to-[#0f0c1d]" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <StudySyncLogo light />

          <div className="max-w-sm">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-white/70">Smart Study Matching</span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-[1.15] tracking-tight text-white">
              Study smarter<br />with the right<br />group.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/55">
              Match by course, schedule, and learning style — then collaborate in shared workspaces built for university students.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { value: '2.4k+', label: 'Students' },
                { value: '180+', label: 'Study Pods' },
                { value: '94%', label: 'Match Rate' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="font-display text-2xl font-bold text-white">{value}</p>
                  <p className="mt-0.5 text-xs text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/30">
            © 2026 StudySync · Context-aware group formation
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex min-h-dvh flex-col bg-page pb-[env(safe-area-inset-bottom,0px)]">
        <div className="border-b border-border bg-surface/80 px-5 py-4 backdrop-blur-sm lg:hidden">
          <StudySyncLogo />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className={formClassName}>
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-sm leading-relaxed text-soft">{subtitle}</p>
              ) : null}
            </div>

            <div className="space-y-5">{children}</div>
            {footer ? <div className="mt-2">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ prompt, linkText, to = ROUTES.LOGIN }) {
  return (
    <p className="mt-6 text-center text-sm text-muted">
      {prompt}{' '}
      <Link to={to} className="font-semibold text-brand-600 transition hover:text-brand-700">
        {linkText}
      </Link>
    </p>
  )
}
