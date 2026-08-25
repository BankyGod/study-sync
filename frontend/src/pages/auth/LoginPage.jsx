import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthFooterLink, AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
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
      title="Sign in"
      subtitle="Continue to your pods and workspaces."
      footer={
        <div className="space-y-1 text-center">
          <AuthFooterLink
            prompt="New here?"
            linkText="Create account"
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

        {authError ? <p className="text-[12px] text-red-600">{authError}</p> : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
