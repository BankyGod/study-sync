import { Link } from 'react-router-dom'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { ROUTES } from '@/utils/constants'
import { AUTH_BACKGROUND_IMAGE } from '@/utils/auth'

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
  formClassName = 'w-full max-w-[26rem]',
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative hidden min-h-dvh overflow-hidden lg:block">
        <img
          src={AUTH_BACKGROUND_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-brand-900/30" />

        <div className="relative flex h-full flex-col justify-between p-12 text-surface">
          <StudySyncLogo light />

          <div className="max-w-xl">
            <p className="font-display text-5xl font-semibold leading-[1.1] tracking-tight">
              StudySync
            </p>
            <p className="mt-5 max-w-md text-base leading-relaxed text-surface/80">
              Match with classmates by course, schedule, and learning style — then collaborate
              in shared workspaces built for accountability.
            </p>
          </div>

          <p className="text-sm text-surface/55">
            Context-aware group formation for modern university learning
          </p>
        </div>
      </div>

      <div className="flex min-h-dvh flex-col bg-page pb-[env(safe-area-inset-bottom,0px)]">
        <div className="border-b border-border px-5 py-4 lg:hidden">
          <StudySyncLogo />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 sm:py-10">
          <div className={formClassName}>
            <div className="mb-6 sm:mb-8">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
              ) : null}
            </div>

            <div className="space-y-5">{children}</div>
            {footer}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ prompt, linkText, to = ROUTES.LOGIN }) {
  return (
    <p className="mt-8 text-center text-sm text-muted">
      {prompt}{' '}
      <Link to={to} className="font-semibold text-brand-700 transition hover:text-brand-800">
        {linkText}
      </Link>
    </p>
  )
}
