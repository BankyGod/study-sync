import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { GraduationCap, LayoutDashboard, LogOut, UserRound, Users } from 'lucide-react'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/cn'

const adminLinks = [
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Overview', icon: LayoutDashboard },
  { to: ROUTES.ADMIN_COHORTS, label: 'Cohorts', icon: GraduationCap },
  { to: ROUTES.ADMIN_GROUPS, label: 'Teams', icon: Users },
  { to: ROUTES.ADMIN_STUDENTS, label: 'Students', icon: UserRound },
]

export function AppLayout({ variant = 'admin' }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const isAdmin = variant === 'admin'

  const handleLogout = () => {
    logout()
    navigate(isAdmin ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN)
  }

  return (
    <div className="flex min-h-dvh bg-page">
      <aside className="hidden w-52 shrink-0 flex-col bg-rail lg:flex">
        <div className="border-b border-rail-line px-3 py-3">
          <StudySyncLogo light size="sm" />
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-rail-muted">
            {isAdmin ? 'Instructor' : 'Student'}
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 p-2">
          {adminLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.ADMIN_DASHBOARD}
              className={({ isActive }) => cn('ss-rail-link', isActive && 'ss-rail-on')}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-rail-line p-2">
          <div className="rounded-md bg-white/5 px-2.5 py-2">
            <p className="truncate text-[12px] font-semibold text-white">{user?.name}</p>
            <p className="truncate text-[10px] capitalize text-rail-muted">{user?.role}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[12px] font-medium text-rail-muted transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-11 items-center justify-between border-b border-border bg-surface px-3 lg:hidden">
          <StudySyncLogo size="sm" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
