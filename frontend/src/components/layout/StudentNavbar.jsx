import { Link, useLocation, useNavigate } from 'react-router-dom'
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
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-surface/95 shadow-xs backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <StudySyncLogo />

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map(({ to, label, isWorkspace }) => {
            const isActive = isWorkspace
              ? isWorkspaceRoute(location.pathname)
              : location.pathname === to

            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-soft hover:bg-page hover:text-ink',
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            to={ROUTES.NOTIFICATIONS}
            className={cn(
              'relative flex h-10 w-10 items-center justify-center rounded-xl transition',
              location.pathname === ROUTES.NOTIFICATIONS
                ? 'bg-brand-600 text-white'
                : 'text-muted hover:bg-page hover:text-ink',
            )}
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
            }
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </Link>

          <Link
            to={ROUTES.PROFILE}
            className="hidden rounded-full ring-2 ring-transparent transition hover:ring-brand-200 lg:block"
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
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold text-muted transition hover:bg-page hover:text-ink"
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
