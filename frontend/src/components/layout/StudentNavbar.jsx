import { Link, NavLink, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
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
  const location = useLocation()
  const { user, avatarVersion } = useAuth()
  const { data: unreadData } = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: fetchUnreadNotificationCount,
    refetchInterval: 60_000,
  })
  const unreadCount = unreadData?.unreadCount ?? 0

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur',
        className,
      )}
    >
      <div className="mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:max-w-[1600px] lg:px-8">
        <StudySyncLogo className="[&_span]:text-base sm:[&_span]:text-lg" />

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ to, label, isWorkspace }) => {
            const isActive = isWorkspace
              ? isWorkspaceRoute(location.pathname)
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

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to={ROUTES.NOTIFICATIONS}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-full transition',
              location.pathname === ROUTES.NOTIFICATIONS
                ? 'bg-violet-50 text-violet-700'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
            )}
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
            }
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
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
        </div>
      </div>
    </header>
  )
}
