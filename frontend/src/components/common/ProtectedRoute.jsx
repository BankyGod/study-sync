import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/common/Spinner'
import { useAuth } from '@/hooks/useAuth'
import {
  DEV_BYPASS_AUTH,
  getHomeRouteForRole,
  isStaffRole,
  normalizeRole,
  ROUTES,
} from '@/utils/constants'

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!DEV_BYPASS_AUTH && !isAuthenticated) {
    return (
      <Navigate
        to={isAdminPath ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    )
  }

  if (!DEV_BYPASS_AUTH && allowedRoles && user?.role) {
    const role = normalizeRole(user.role)
    const allowed = allowedRoles.map(normalizeRole)
    if (!allowed.includes(role)) {
      // Keep students on the instructor portal entry instead of bouncing to /dashboard.
      if (isAdminPath && !isStaffRole(role)) {
        return (
          <Navigate
            to={ROUTES.ADMIN_LOGIN}
            state={{ from: location, staffRequired: true }}
            replace
          />
        )
      }
      return <Navigate to={getHomeRouteForRole(role)} replace />
    }
  }

  return children || <Outlet />
}
