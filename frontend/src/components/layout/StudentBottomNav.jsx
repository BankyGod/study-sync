import { NavLink, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, Home, LayoutGrid, Search, User } from 'lucide-react'
import { UNREAD_COUNT_QUERY_KEY } from '@/hooks/useNotificationSocket'
import { fetchUnreadNotificationCount } from '@/services/notificationsService'
import { ROUTES } from '@/utils/constants'
import { isInsideWorkspaceGroup, isWorkspaceRoute } from '@/utils/studentNav'
import { cn } from '@/utils/cn'

const tabs = [
  { to: ROUTES.STUDENT_DASHBOARD, label: 'Home', icon: Home, match: (path) => path === ROUTES.STUDENT_DASHBOARD },
  { to: ROUTES.FIND_GROUPS, label: 'Find', icon: Search, match: (path) => path === ROUTES.FIND_GROUPS },
  {
    to: ROUTES.WORKSPACE_LIST,
    label: 'Pods',
    icon: LayoutGrid,
    match: (path) => isWorkspaceRoute(path),
  },
  {
    to: ROUTES.NOTIFICATIONS,
    label: 'Alerts',
    icon: Bell,
    match: (path) => path === ROUTES.NOTIFICATIONS,
    badge: true,
  },
  { to: ROUTES.PROFILE, label: 'Profile', icon: User, match: (path) => path === ROUTES.PROFILE },
]

export function StudentBottomNav() {
  const location = useLocation()
  const { data: unreadData } = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: fetchUnreadNotificationCount,
    refetchInterval: 60_000,
  })
  const unreadCount = unreadData?.unreadCount ?? 0

  if (isInsideWorkspaceGroup(location.pathname)) {
    return null
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/90 bg-white/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-1">
        {tabs.map(({ to, label, icon: Icon, match, badge }) => {
          const isActive = match(location.pathname)

          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition',
                isActive ? 'text-violet-600' : 'text-slate-500 active:text-violet-600',
              )}
            >
              <span
                className={cn(
                  'relative flex h-8 w-8 items-center justify-center rounded-2xl transition',
                  isActive && 'bg-violet-100 text-violet-700',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} />
                {badge && unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </span>
              <span className="truncate">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
