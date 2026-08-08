import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, LogOut } from 'lucide-react'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { useAuth } from '@/hooks/useAuth'
import { UNREAD_COUNT_QUERY_KEY } from '@/hooks/useNotificationSocket'
import { fetchUnreadNotificationCount } from '@/services/notificationsService'
import { ROUTES } from '@/utils/constants'
import { isWorkspaceRoute } from '@/utils/studentNav'
import { cn } from '@/utils/cn'

const navLinks = [
  { to: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.FIND_GROUPS, label: 'Find Groups' },
  { to: ROUTES.WORKSPACE_LIST, label: 'Workspace', isWorkspace: true },
  { to: ROUTES.PROFILE, label: 'Profile' },
]

export function StudentNavbar({ className }) {
  const navigate = useNavigate()
  const location = useLocation()
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
    <header className={cn('sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur', className)}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6">
        <StudySyncLogo className="min-w-0 [&_span]:truncate [&_span]:text-base sm:[&_span]:text-lg" />

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map(({ to, label, isWorkspace }) => {
            const isActive = isWorkspace
              ? isWorkspaceRoute(location.pathname)
              : location.pathname === to

            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'relative pb-0.5 text-sm font-medium transition',
                  isActive ? 'text-ink' : 'text-muted hover:text-ink',
                )}
              >
                {label}
                {isActive ? (
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-brand-600" />
                ) : null}
              </NavLink>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to={ROUTES.NOTIFICATIONS}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-lg transition',
              location.pathname === ROUTES.NOTIFICATIONS
                ? 'bg-brand-50 text-brand-700'
                : 'text-muted hover:bg-page hover:text-ink',
            )}
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
            }
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-surface">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </Link>
          <Link
            to={ROUTES.PROFILE}
            className="hidden rounded-full transition hover:opacity-90 lg:block"
            aria-label="Your profile"
          >
            <ProfileAvatar
              userId={user?.id}
              fullName={user?.name ?? ''}
              avatarUrl={user?.avatarUrl}
              size="sm"
              refreshKey={avatarVersion}
            />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted transition hover:bg-page hover:text-ink"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
