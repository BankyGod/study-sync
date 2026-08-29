import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthEmailField, AuthPasswordField } from '@/components/auth/AuthField'
import { AuthFooterLink, AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/common/Button'
import { useAuthContext } from '@/context/AuthContext'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { getHomeRouteForRole, ROUTES } from '@/utils/constants'

const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthContext()
  const [authError, setAuthError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    try {
      setAuthError('')
      const data = await login(values)
      navigate(getHomeRouteForRole(data?.user?.role))
    } catch (error) {
      setAuthError(getWorkspaceErrorMessage(error, 'Unable to sign in. Check your email and password.'))
    }
  }

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Sign in to StudySync"
      brandHeadline="Study together — succeed faster"
      brandBody="Match by course and schedule. Collaborate in focused workspaces built for university cohorts."
      footer={
        <div className="space-y-1">
          <AuthFooterLink
            prompt="Don't have an account?"
            linkText="Sign up to continue"
            to={ROUTES.REGISTER}
          />
          <AuthFooterLink
            prompt="Instructor?"
            linkText="Admin portal"
            to={ROUTES.ADMIN_LOGIN}
          />
        </div>
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
