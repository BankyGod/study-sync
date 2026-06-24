import { Link } from 'react-router-dom'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { ROUTES } from '@/utils/constants'
import { AUTH_BACKGROUND_IMAGE } from '@/utils/auth'

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
  formClassName = 'w-full max-w-md',
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden min-h-screen lg:block">
        <img
          src={AUTH_BACKGROUND_IMAGE}
          alt="Students collaborating in a campus study space"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/85 via-violet-900/70 to-teal-800/75" />

        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-0.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-400" />
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-sm bg-violet-300" />
              </div>
              <span className="text-lg font-bold tracking-tight">StudySync</span>
            </div>
          </div>

          <div className="max-w-lg">
            <h1 className="text-4xl font-bold leading-tight">
              Study smarter together with context-aware study pods
            </h1>
            <p className="mt-4 text-base leading-relaxed text-violet-50/90">
              Match with classmates by course, schedule, and learning style — then collaborate
              in shared workspaces built for accountability.
            </p>
          </div>

          <p className="text-sm text-violet-100/80">
            Context-aware group formation for modern university learning
          </p>
        </div>
      </div>

      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-brand-50/40">
        <div className="border-b border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur lg:hidden">
          <StudySyncLogo />
        </div>

        <div
          className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.96)), url(${AUTH_BACKGROUND_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className={formClassName}>
            <div className="mb-6 lg:hidden">
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-sm sm:p-8">
              <div className="mb-6 hidden lg:block">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
              </div>

              {children}
            </div>

            {footer}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ prompt, linkText, to = ROUTES.LOGIN }) {
  return (
    <p className="mt-6 text-center text-sm text-slate-500">
      {prompt}{' '}
      <Link to={to} className="font-semibold text-brand-600 hover:underline">
        {linkText}
      </Link>
    </p>
  )
}
