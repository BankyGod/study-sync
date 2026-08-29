import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthEmailField, AuthPasswordField } from '@/components/auth/AuthField'
import { AuthFooterLink, AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/common/Button'
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

  if (isAuthenticated && isStaffRole(user?.role)) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
  }

  const onSubmit = async (values) => {
    try {
      setAuthError('')
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
      title="Welcome back!"
      subtitle="Sign in to the instructor portal"
      brandHeadline="Lead cohorts — guide pods"
      brandBody="Manage matching, cohorts, and study groups from one compact instructor workspace."
      footer={
        <div className="space-y-1">
          <AuthFooterLink prompt="Student?" linkText="Student sign in" to={ROUTES.LOGIN} />
          <p className="mt-1 text-center text-[13px] text-muted">
            Need access?{' '}
            <Link to={ROUTES.ADMIN_REGISTER} className="font-semibold text-brand-700 hover:underline">
              Register
            </Link>
          </p>
        </div>
      }
    >
      {isAuthenticated && !isStaffRole(user?.role) ? (
        <p className="mb-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900">
          Signed in as a student. Use an instructor account below.
        </p>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthEmailField
          label="Email address"
          autoComplete="email"
          placeholder="you@gctu.edu.gh"
          error={errors.email?.message}
          {...register('email')}
        />
        <AuthPasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Enter password"
          error={errors.password?.message}
          {...register('password')}
        />

        {authError ? <p className="text-[13px] text-red-600">{authError}</p> : null}

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-ink text-[15px] text-white hover:bg-ink/90 active:bg-ink"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
