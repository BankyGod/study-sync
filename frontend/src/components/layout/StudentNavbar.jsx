import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, LogOut } from 'lucide-react'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { useAuth } from '@/hooks/useAuth'
import { UNREAD_COUNT_QUERY_KEY } from '@/hooks/useNotificationSocket'
import { fetchUnreadNotificationCount } from '@/services/notificationsService'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/cn'

/** Mobile-only top bar. Desktop uses StudentSidebar. */
export function StudentNavbar({ className }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const { data: unreadData } = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: fetchUnreadNotificationCount,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
  })
  const unreadCount = unreadData?.unreadCount ?? 0

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-surface lg:hidden',
        className,
      )}
    >
      <div className="flex h-12 items-center justify-between gap-3 px-3">
        <StudySyncLogo size="sm" />
        <div className="flex items-center gap-0.5">
          <Link
            to={ROUTES.NOTIFICATIONS}
            className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded-lg transition',
              location.pathname === ROUTES.NOTIFICATIONS
                ? 'bg-ink text-white'
                : 'text-muted hover:bg-page hover:text-ink',
            )}
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
            }
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand-500" />
            ) : null}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-page hover:text-ink"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
