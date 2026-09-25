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
import { STAFF_ROLE_OPTIONS, STAFF_ROLE_TYPES } from '@/utils/staffPermissions'

const schema = z
  .object({
    email: z.email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    staffRole: z.string().min(1, 'Select a staff role'),
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
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      staffRole: STAFF_ROLE_TYPES.INSTRUCTOR,
    },
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
        staffRole: values.staffRole,
      })
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true })
    } catch (error) {
      setAuthError(
        getWorkspaceErrorMessage(error, 'Unable to create staff account. Please try again.'),
      )
    }
  }

  return (
    <AuthLayout
      title="Create staff account"
      subtitle="Choose a role, then set email and password"
      brandHeadline="Lead cohorts — guide pods"
      brandBody="Manage matching, cohorts, reports, and study groups with role-based staff access."
      footer={
        <AuthFooterLink
          prompt="Already have a staff account?"
          linkText="Sign in"
          to={ROUTES.ADMIN_LOGIN}
        />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="staffRole" className="block text-[13px] font-semibold text-soft">
            Staff role
          </label>
          <select
            id="staffRole"
            className="h-12 w-full rounded-xl border border-[#d8dde3] bg-white px-3.5 text-[15px] text-ink"
            {...register('staffRole')}
          >
            {STAFF_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.staffRole?.message ? (
            <p className="text-[12px] font-medium text-red-600">{errors.staffRole.message}</p>
          ) : null}
        </div>
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
