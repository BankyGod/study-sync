import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthEmailField, AuthPasswordField } from '@/components/auth/AuthField'
import { AuthFooterLink, AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/common/Button'
import { useAuthContext } from '@/context/AuthContext'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { isStaffRole, ROUTES } from '@/utils/constants'

const schema = z
  .object({
    email: z.email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function AdminRegisterPage() {
  const navigate = useNavigate()
  const { registerInstructor, isAuthenticated, user } = useAuthContext()
  const [authError, setAuthError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  if (isAuthenticated && isStaffRole(user?.role)) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
  }

  const onSubmit = async (values) => {
    try {
      setAuthError('')
      await registerInstructor({
        email: values.email,
        password: values.password,
      })
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true })
    } catch (error) {
      setAuthError(
        getWorkspaceErrorMessage(error, 'Unable to create instructor account. Please try again.'),
      )
    }
  }

  return (
    <AuthLayout
      title="Create instructor account"
      subtitle="Only an email and password are required"
      brandHeadline="Lead cohorts — guide pods"
      brandBody="Manage matching, cohorts, and study groups from one compact instructor workspace."
      footer={
        <AuthFooterLink
          prompt="Already have an instructor account?"
          linkText="Sign in"
          to={ROUTES.ADMIN_LOGIN}
        />
      }
    >
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
          autoComplete="new-password"
          placeholder="Create a password"
          error={errors.password?.message}
          {...register('password')}
        />
        <AuthPasswordField
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Confirm password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {authError ? <p className="text-[13px] text-red-600">{authError}</p> : null}

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-ink text-[15px] text-white hover:bg-ink/90 active:bg-ink"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
