import { Link } from 'react-router-dom'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { ROUTES } from '@/utils/constants'
import { AUTH_BACKGROUND_IMAGE } from '@/utils/auth'
import { cn } from '@/utils/cn'

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
  formClassName = 'w-full max-w-md',
  size = 'default',
}) {
  const isWide = size === 'wide'

  return (
    <div
      className={cn(
        'min-h-dvh',
        isWide
          ? 'lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(30rem,1.15fr)] xl:grid-cols-[minmax(0,1fr)_minmax(36rem,48rem)]'
          : 'lg:grid lg:grid-cols-[minmax(0,1fr)_26rem] xl:grid-cols-[minmax(0,1fr)_28rem]',
      )}
    >
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

        <div
          className={cn(
            'flex flex-1 justify-center px-4 py-8 sm:px-6 lg:px-8',
            isWide ? 'items-start overflow-y-auto lg:py-10' : 'items-center',
          )}
        >
          <div className={formClassName}>
            <div className={cn('mb-5', isWide && 'mb-6')}>
              <h1
                className={cn(
                  'font-display font-semibold tracking-tight text-ink',
                  isWide ? 'text-2xl sm:text-3xl' : 'text-xl',
                )}
              >
                {title}
              </h1>
              {subtitle ? (
                <p
                  className={cn(
                    'mt-1 leading-snug text-muted',
                    isWide ? 'text-sm sm:text-[15px]' : 'text-[13px]',
                  )}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className={cn(isWide ? 'space-y-4' : 'space-y-3')}>{children}</div>
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
