import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/common/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { DEV_BYPASS_AUTH, ROUTES } from '@/utils/constants'

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!DEV_BYPASS_AUTH && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (
    !DEV_BYPASS_AUTH &&
    allowedRoles &&
    user?.role &&
    !allowedRoles.includes(user.role)
  ) {
    const fallback =
      user.role === 'instructor' ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD
    return <Navigate to={fallback} replace />
  }

  return children || <Outlet />
}
