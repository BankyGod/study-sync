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
      subtitle="Sign in with an instructor account to manage cohorts, matching, and study pods."
      footer={
        <div className="space-y-2 text-center">
          <AuthFooterLink prompt="Student account?" linkText="Student sign in" to={ROUTES.LOGIN} />
          <p className="text-sm text-slate-500">
            Need an instructor account?{' '}
            <Link to={ROUTES.ADMIN_REGISTER} className="font-medium text-brand-700 hover:underline">
              Register with email & password
            </Link>
          </p>
        </div>
      }
    >
      {isAuthenticated && !isStaffRole(user?.role) ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          You are signed in as a student ({user?.email || user?.name}). Sign in with an instructor
          account below to continue.
        </p>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
