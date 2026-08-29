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
  formClassName = 'w-full max-w-[22rem]',
  size = 'default',
  brandHeadline = 'Study together — succeed faster',
  brandBody = 'Match by course and schedule. Collaborate in focused workspaces built for university cohorts.',
}) {
  const isWide = size === 'wide'

  return (
    <div className="flex min-h-dvh bg-[#0c3d36]">
      {/* Brand panel — dominant left side */}
      <div className="relative hidden min-h-dvh flex-1 overflow-hidden lg:block">
        <img
          src={AUTH_BACKGROUND_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c3d36] via-[#0c3d36]/75 to-[#0c3d36]/45" />

        <div className="relative flex h-full flex-col justify-between px-10 py-9 text-white xl:px-14">
          <StudySyncLogo light size="sm" />

          <div className="max-w-lg">
            <h2 className="font-display text-4xl font-bold uppercase leading-[1.1] tracking-tight xl:text-5xl">
              {brandHeadline}
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/75">
              {brandBody}
            </p>
          </div>

          <p className="text-[12px] text-white/40">Group formation for modern learning</p>
        </div>
      </div>

      {/* Form panel — white card with rounded left edge */}
      <div
        className={cn(
          'relative flex min-h-dvh w-full flex-col bg-white pb-[env(safe-area-inset-bottom,0px)]',
          'lg:my-0 lg:min-h-dvh lg:rounded-l-[1.75rem] lg:shadow-[-12px_0_40px_rgba(0,0,0,0.18)]',
          isWide ? 'lg:max-w-[48rem] xl:max-w-[52rem]' : 'lg:max-w-[26rem] xl:max-w-[28rem]',
        )}
      >
        <div className="border-b border-border px-5 py-4 lg:hidden">
          <StudySyncLogo size="sm" />
        </div>

        <div
          className={cn(
            'flex flex-1 justify-center px-6 py-10 sm:px-10',
            isWide ? 'items-start overflow-y-auto lg:py-12' : 'items-center',
          )}
        >
          <div className={formClassName}>
            <div className="mb-8">
              <h1 className="font-display text-[1.75rem] font-bold tracking-tight text-ink sm:text-[2rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>
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

export function AuthFooterLink({ prompt, linkText, to = ROUTES.LOGIN, align = 'center' }) {
  return (
    <p
      className={cn(
        'mt-6 text-[13px] text-muted',
        align === 'left' ? 'text-left' : 'text-center',
      )}
    >
      {prompt}{' '}
      <Link to={to} className="font-semibold text-brand-700 transition hover:text-brand-800">
        {linkText}
      </Link>
    </p>
  )
}
