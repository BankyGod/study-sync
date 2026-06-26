import { NavLink } from 'react-router-dom'
import { DEV_BYPASS_AUTH, ROUTES } from '@/utils/constants'
import { cn } from '@/utils/cn'

const devLinks = [
  { to: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.FIND_GROUPS, label: 'Find Groups' },
  { to: '/workspace', label: 'Workspace' },
  { to: '/workspace/demo', label: 'Demo Pod' },
  { to: '/workspace/demo/chat', label: 'Chat' },
  { to: '/workspace/demo/files', label: 'Files' },
  { to: '/workspace/demo/calendar', label: 'Scheduler' },
  { to: ROUTES.ONBOARDING, label: 'Onboarding' },
  { to: ROUTES.PROFILE, label: 'Profile' },
  { to: ROUTES.LOGIN, label: 'Login' },
  { to: ROUTES.REGISTER, label: 'Register' },
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Admin' },
  { to: ROUTES.ADMIN_COHORTS, label: 'Cohorts' },
  { to: ROUTES.ADMIN_GROUPS, label: 'Teams' },
]

export function DevNavBar() {
  if (!DEV_BYPASS_AUTH) return null

  return (
    <div className="dev-nav-active fixed bottom-0 left-0 right-0 z-[100] border-t border-amber-200 bg-amber-50/95 px-3 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5">
        <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
          Dev nav
        </span>
        {devLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'rounded-md px-2 py-1 text-xs font-medium transition',
                isActive
                  ? 'bg-amber-200 text-amber-900'
                  : 'text-amber-800 hover:bg-amber-100',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
