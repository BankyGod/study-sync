import { NavLink, Link, useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/cn'

const navLinks = [
  { to: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.FIND_GROUPS, label: 'Find Groups' },
  { to: ROUTES.WORKSPACE_LIST, label: 'Workspace', prefix: '/workspace/' },
  { to: ROUTES.PROFILE, label: 'Profile' },
]

export function StudentNavbar() {
  const location = useLocation()
  const { user, avatarVersion } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <StudySyncLogo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label, prefix }) => {
            const isActive = prefix
              ? prefix === '/workspace/'
                ? location.pathname === ROUTES.WORKSPACE_LIST ||
                  /^\/workspace\/[^/]+/.test(location.pathname)
                : location.pathname.startsWith(prefix)
              : location.pathname === to

            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                {label}
              </NavLink>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <Link
            to={ROUTES.PROFILE}
            className="block rounded-full transition hover:opacity-90"
            aria-label="Your profile"
          >
            <ProfileAvatar
              userId={user?.id}
              fullName={user?.name ?? ''}
              size="sm"
              refreshKey={avatarVersion}
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
