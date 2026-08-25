import { Link } from 'react-router-dom'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { ROUTES } from '@/utils/constants'
import { AUTH_BACKGROUND_IMAGE } from '@/utils/auth'

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
  formClassName = 'w-full max-w-[22rem]',
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="relative hidden min-h-dvh overflow-hidden bg-rail lg:block">
        <img
          src={AUTH_BACKGROUND_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rail via-rail/80 to-rail/40" />

        <div className="relative flex h-full flex-col justify-between p-8 text-white">
          <StudySyncLogo light size="sm" />

          <div className="max-w-md">
            <p className="font-display text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
              StudySync
            </p>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/70">
              Match by course and schedule. Collaborate in compact workspaces built for
              university cohorts.
            </p>
          </div>

          <p className="text-[11px] text-white/40">Group formation for modern learning</p>
        </div>
      </div>

      <div className="flex min-h-dvh flex-col border-l border-border bg-surface pb-[env(safe-area-inset-bottom,0px)]">
        <div className="border-b border-border px-4 py-3 lg:hidden">
          <StudySyncLogo size="sm" />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8">
          <div className={formClassName}>
            <div className="mb-5">
              <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-[13px] leading-snug text-muted">{subtitle}</p>
              ) : null}
            </div>

            <div className="space-y-3">{children}</div>
            {footer ? <div className="mt-1">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ prompt, linkText, to = ROUTES.LOGIN }) {
  return (
    <p className="mt-5 text-center text-[12px] text-muted">
      {prompt}{' '}
      <Link to={to} className="font-semibold text-brand-700 transition hover:text-brand-800">
        {linkText}
      </Link>
    </p>
  )
}
