import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthEmailField, AuthField, AuthPasswordField } from '@/components/auth/AuthField'
import { AuthFooterLink, AuthLayout } from '@/components/auth/AuthLayout'
import { AuthSection, AuthSelect } from '@/components/auth/AuthFormFields'
import { Button } from '@/components/common/Button'
import { useAuthContext } from '@/context/AuthContext'
import { ACADEMIC_LEVELS, ACADEMIC_PROGRAMS, UNIVERSITIES } from '@/utils/auth'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { ROUTES, ROLES } from '@/utils/constants'

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
    role: z.literal(ROLES.STUDENT),
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
    } catch (error) {
      setAuthError(
        getWorkspaceErrorMessage(error, 'Unable to create your account right now. Please try again.'),
      )
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join course-based study pods at GCTU"
      size="wide"
      formClassName="w-full max-w-2xl"
      brandHeadline="Study together — succeed faster"
      brandBody="Match by course and schedule. Collaborate in focused workspaces built for university cohorts."
      footer={
        <div className="space-y-1">
          <AuthFooterLink
            prompt="Already have an account?"
            linkText="Sign in"
            to={ROUTES.LOGIN}
          />
          <AuthFooterLink
            prompt="Instructor?"
            linkText="Create instructor account"
            to={ROUTES.ADMIN_REGISTER}
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthSection title="Personal information" size="lg">
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="First name"
              autoComplete="given-name"
              placeholder="First name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <AuthField
              label="Last name"
              autoComplete="family-name"
              placeholder="Last name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="Student ID"
              placeholder="e.g. 12345678"
              error={errors.studentId?.message}
              {...register('studentId')}
            />
            <AuthField
              label="Phone number (optional)"
              type="tel"
              autoComplete="tel"
              placeholder="+233..."
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <AuthEmailField
            label="University email"
            autoComplete="email"
            placeholder="you@gctu.edu.gh"
            error={errors.email?.message}
            {...register('email')}
          />
        </AuthSection>

        <AuthSection title="Academic information" size="lg">
          <AuthSelect label="University" size="lg" error={errors.university?.message} {...register('university')}>
            {UNIVERSITIES.map((university) => (
              <option key={university} value={university}>
                {university}
              </option>
            ))}
          </AuthSelect>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthSelect label="Program" size="lg" error={errors.program?.message} {...register('program')}>
              {ACADEMIC_PROGRAMS.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </AuthSelect>

            <AuthSelect label="Level" size="lg" error={errors.level?.message} {...register('level')}>
              {ACADEMIC_LEVELS.map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </AuthSelect>
          </div>
        </AuthSection>

        <AuthSection title="Account security" size="lg">
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        </AuthSection>

        <input type="hidden" value={ROLES.STUDENT} {...register('role')} />

        <label className="flex items-start gap-3 rounded-xl border border-[#d8dde3] bg-page px-4 py-3.5">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
            {...register('agreeToTerms')}
          />
          <span className="text-[13px] leading-relaxed text-soft">
            I agree to StudySync&apos;s terms of use and consent to my profile data being used for
            study group matching and collaborative learning features.
          </span>
        </label>
        {errors.agreeToTerms ? (
          <p className="-mt-3 text-[12px] text-red-600">{errors.agreeToTerms.message}</p>
        ) : null}

        {authError ? <p className="text-[13px] text-red-600">{authError}</p> : null}

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-ink text-[15px] text-white hover:bg-ink/90 active:bg-ink"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account…' : 'Create account & continue'}
        </Button>
      </form>
    </AuthLayout>
  )
}
