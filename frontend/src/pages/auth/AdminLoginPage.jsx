import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthFooterLink, AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuthContext } from '@/context/AuthContext'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { isStaffRole, ROUTES } from '@/utils/constants'

const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, logout, isAuthenticated, user } = useAuthContext()
  const [authError, setAuthError] = useState(
    location.state?.staffRequired
      ? 'Instructor account required. Sign in below to open the admin portal.'
      : '',
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  // Only auto-enter admin when the current session is already staff.
  if (isAuthenticated && isStaffRole(user?.role)) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
  }

  const onSubmit = async (values) => {
    try {
      setAuthError('')
      // Replace any student session so the instructor login can take over.
      if (isAuthenticated) logout()
      const data = await login(values)
      if (!isStaffRole(data?.user?.role)) {
        logout()
        setAuthError('This portal is for instructors only. Use the student sign-in instead.')
        return
      }
      const destination = location.state?.from?.pathname?.startsWith('/admin')
        ? location.state.from.pathname
        : ROUTES.ADMIN_DASHBOARD
      navigate(destination, { replace: true })
    } catch (error) {
      setAuthError(
        getWorkspaceErrorMessage(error, 'Unable to sign in. Check your email and password.'),
      )
    }
  }

  return (
    <AuthLayout
      title="Instructor portal"
      subtitle="Manage cohorts, matching, and pods."
      footer={
        <div className="space-y-1 text-center">
          <AuthFooterLink prompt="Student?" linkText="Student sign in" to={ROUTES.LOGIN} />
          <p className="text-[12px] text-muted">
            Need access?{' '}
            <Link to={ROUTES.ADMIN_REGISTER} className="font-semibold text-brand-700 hover:underline">
              Register
            </Link>
          </p>
        </div>
      }
    >
      {isAuthenticated && !isStaffRole(user?.role) ? (
        <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[12px] text-amber-900">
          Signed in as a student. Use an instructor account below.
        </p>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input
          label="University email"
          type="email"
          autoComplete="email"
          placeholder="you@gctu.edu.gh"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {authError && <p className="text-sm text-red-600">{authError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in to admin'}
        </Button>
      </form>
    </AuthLayout>
  )
}
