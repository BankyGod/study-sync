import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthFooterLink, AuthLayout } from '@/components/auth/AuthLayout'
import { AuthSection, AuthSelect } from '@/components/auth/AuthFormFields'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuthContext } from '@/context/AuthContext'
import { ACADEMIC_LEVELS, ACADEMIC_PROGRAMS, UNIVERSITIES } from '@/utils/auth'
import { ROUTES, ROLES } from '@/utils/constants'
import { cn } from '@/utils/cn'

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    studentId: z.string().min(4, 'Student ID is required'),
    email: z.email('Enter a valid university email'),
    phone: z.string().optional(),
    university: z.string().min(2, 'Select your university'),
    program: z.string().min(2, 'Select your program'),
    level: z.enum(['100', '200', '300', '400']),
    role: z.enum([ROLES.STUDENT, ROLES.INSTRUCTOR]),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((value) => value === true, {
      message: 'You must accept the terms to create an account',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuthContext()
  const [authError, setAuthError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      studentId: '',
      email: '',
      phone: '',
      university: UNIVERSITIES[0],
      program: ACADEMIC_PROGRAMS[0],
      level: '400',
      role: ROLES.STUDENT,
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  })

  const onSubmit = async (values) => {
    try {
      setAuthError('')
      await registerUser(values)
      navigate(ROUTES.ONBOARDING)
    } catch {
      setAuthError('Unable to create your account right now. Please try again.')
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register with your academic details to join course-based study pods at GCTU."
      formClassName="w-full max-w-2xl"
      footer={
        <AuthFooterLink
          prompt="Already have an account?"
          linkText="Sign in"
          to={ROUTES.LOGIN}
        />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <AuthSection title="Personal information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last name"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Student ID"
              placeholder="e.g. 12345678"
              error={errors.studentId?.message}
              {...register('studentId')}
            />
            <Input
              label="Phone number (optional)"
              type="tel"
              autoComplete="tel"
              placeholder="+233..."
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <Input
            label="University email"
            type="email"
            autoComplete="email"
            placeholder="you@gctu.edu.gh"
            error={errors.email?.message}
            {...register('email')}
          />
        </AuthSection>

        <AuthSection title="Academic information">
          <AuthSelect label="University" error={errors.university?.message} {...register('university')}>
            {UNIVERSITIES.map((university) => (
              <option key={university} value={university}>
                {university}
              </option>
            ))}
          </AuthSelect>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthSelect label="Program" error={errors.program?.message} {...register('program')}>
              {ACADEMIC_PROGRAMS.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </AuthSelect>

            <AuthSelect label="Level" error={errors.level?.message} {...register('level')}>
              {ACADEMIC_LEVELS.map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </AuthSelect>
          </div>

          <AuthSelect label="Account type" error={errors.role?.message} {...register('role')}>
            <option value={ROLES.STUDENT}>Student</option>
            <option value={ROLES.INSTRUCTOR}>Instructor / Supervisor</option>
          </AuthSelect>
        </AuthSection>

        <AuthSection title="Account security">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
        </AuthSection>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            {...register('agreeToTerms')}
          />
          <span className="text-sm text-slate-600">
            I agree to StudySync&apos;s terms of use and consent to my profile data being used for
            study group matching and collaborative learning features.
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="-mt-4 text-xs text-red-600">{errors.agreeToTerms.message}</p>
        )}

        {authError && <p className="text-sm text-red-600">{authError}</p>}

        <Button type="submit" className={cn('w-full')} disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account & continue'}
        </Button>
      </form>
    </AuthLayout>
  )
}
