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
      {/* Dark sidebar */}
      <aside
        className="hidden w-60 shrink-0 flex-col lg:flex xl:w-64"
        style={{ background: 'var(--color-sidebar)' }}
      >
        {/* Logo */}
        <div className="px-5 py-6">
          <StudySyncLogo light />
          <div className="mt-4 rounded-xl bg-white/5 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
              {isAdmin ? 'Instructor Portal' : 'Student Workspace'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3">
          {adminLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.ADMIN_DASHBOARD}
              className={({ isActive }) =>
                cn('sidebar-link', isActive && 'sidebar-link-active')
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0 opacity-80" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div
          className="mx-3 mb-4 rounded-2xl p-3"
          style={{ background: 'var(--color-sidebar-hover)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              {(user?.name ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="truncate text-xs capitalize" style={{ color: 'var(--color-sidebar-text)' }}>
                {user?.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-sidebar-text)' }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header
          className="flex items-center justify-between px-4 py-3 lg:hidden"
          style={{ background: 'var(--color-sidebar)' }}
        >
          <StudySyncLogo light size="sm" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
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
