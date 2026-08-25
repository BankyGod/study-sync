import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  Home,
  LayoutGrid,
  LogOut,
  Search,
  User,
} from 'lucide-react'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { useAuth } from '@/hooks/useAuth'
import { UNREAD_COUNT_QUERY_KEY } from '@/hooks/useNotificationSocket'
import { fetchUnreadNotificationCount } from '@/services/notificationsService'
import { ROUTES } from '@/utils/constants'
import { isWorkspaceRoute } from '@/utils/studentNav'
import { cn } from '@/utils/cn'

const navLinks = [
  { to: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard', icon: Home, match: (p) => p === ROUTES.STUDENT_DASHBOARD },
  { to: ROUTES.FIND_GROUPS, label: 'Find groups', icon: Search, match: (p) => p === ROUTES.FIND_GROUPS },
  {
    to: ROUTES.WORKSPACE_LIST,
    label: 'Workspace',
    icon: LayoutGrid,
    match: (p) => isWorkspaceRoute(p),
  },
  { to: ROUTES.NOTIFICATIONS, label: 'Alerts', icon: Bell, match: (p) => p === ROUTES.NOTIFICATIONS, badge: true },
  { to: ROUTES.PROFILE, label: 'Profile', icon: User, match: (p) => p === ROUTES.PROFILE },
]

export function StudentSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, avatarVersion, logout } = useAuth()
  const { data: unreadData } = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: fetchUnreadNotificationCount,
    refetchInterval: 60_000,
  })
  const unreadCount = unreadData?.unreadCount ?? 0

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <aside className="hidden w-[15.5rem] shrink-0 flex-col bg-rail lg:flex">
      <div className="border-b border-rail-line px-4 py-4">
        <StudySyncLogo light size="sm" />
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-rail-muted">
          Student workspace
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navLinks.map(({ to, label, icon: Icon, match, badge }) => {
          const active = match(location.pathname)
          return (
            <Link key={to} to={to} className={cn('ss-rail-link', active && 'ss-rail-on')}>
              <Icon className="h-4 w-4 shrink-0 opacity-90" />
              <span className="flex-1">{label}</span>
              {badge && unreadCount > 0 ? (
                <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-rail-line p-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/5 px-2.5 py-2.5">
          <ProfileAvatar
            userId={user?.id}
            fullName={user?.name ?? ''}
            avatarUrl={user?.avatarUrl}
            size="sm"
            refreshKey={avatarVersion}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-white">{user?.name}</p>
            <p className="truncate text-[10px] text-rail-muted">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium text-rail-muted transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
