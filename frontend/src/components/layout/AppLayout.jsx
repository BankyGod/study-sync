import { NavLink, Outlet } from 'react-router-dom'
import { GraduationCap, LayoutDashboard, LogOut, Users, Workflow } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/cn'

const studentLinks = [
  { to: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.WORKSPACE_LIST, label: 'Workspace', icon: Workflow },
  { to: ROUTES.ONBOARDING, label: 'Profile Setup', icon: GraduationCap },
]

const adminLinks = [
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Overview', icon: LayoutDashboard },
  { to: ROUTES.ADMIN_COHORTS, label: 'Cohorts', icon: GraduationCap },
  { to: ROUTES.ADMIN_GROUPS, label: 'Teams', icon: Users },
]

export function AppLayout({ variant = 'student' }) {
  const { user, logout } = useAuth()
  const links = variant === 'admin' ? adminLinks : studentLinks

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              SS
            </div>
            <div>
              <p className="font-semibold text-slate-900">StudySync</p>
              <p className="text-xs text-slate-500">GCTU</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
          <p className="truncate text-xs capitalize text-slate-500">{user?.role}</p>
          <Button variant="ghost" size="sm" className="mt-3 w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
