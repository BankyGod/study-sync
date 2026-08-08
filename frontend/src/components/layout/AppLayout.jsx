import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { GraduationCap, LayoutDashboard, LogOut, UserRound, Users, Workflow } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/cn'

const studentLinks = [
  { to: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.WORKSPACE_LIST, label: 'Workspaces', icon: Workflow },
  { to: ROUTES.ONBOARDING, label: 'Profile', icon: GraduationCap },
]

const adminLinks = [
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Overview', icon: LayoutDashboard },
  { to: ROUTES.ADMIN_COHORTS, label: 'Cohorts', icon: GraduationCap },
  { to: ROUTES.ADMIN_GROUPS, label: 'Teams', icon: Users },
  { to: ROUTES.ADMIN_STUDENTS, label: 'Students', icon: UserRound },
]

export function AppLayout({ variant = 'student' }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const links = variant === 'admin' ? adminLinks : studentLinks
  const isAdmin = variant === 'admin'

  const handleLogout = () => {
    logout()
    navigate(isAdmin ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN)
  }

  return (
    <div className="flex min-h-screen bg-page">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-5 py-6">
          <div className="flex items-center gap-3">
            <StudySyncLogo className="h-10 w-auto" />
            <div>
              <p className="font-semibold text-ink">StudySync</p>
              <p className="text-xs text-muted">
                {isAdmin ? 'Instructor portal' : 'Learning Platform'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.ADMIN_DASHBOARD}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-muted hover:bg-page hover:text-ink',
                )
              }
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-page">
                <Icon className="h-4 w-4" />
              </div>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
          <p className="truncate text-xs capitalize text-muted">{user?.role}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
