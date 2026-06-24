import { Link } from 'react-router-dom'
import { StudySyncLogo } from '@/components/layout/StudySyncLogo'
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/cn'

export function OnboardingLayout({
  currentStep,
  children,
  onBack,
  onContinue,
  canGoBack = false,
  canContinue = true,
  continueLabel = 'Continue',
  wide = false,
  gradientContinue = false,
}) {
  const contentWidth = wide ? 'max-w-4xl' : 'max-w-2xl'

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6 sm:px-6">
        <StudySyncLogo />
        <Link
          to={ROUTES.STUDENT_DASHBOARD}
          className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          Skip for now
        </Link>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <OnboardingStepper currentStep={currentStep} />
      </div>

      <main className={cn('mx-auto px-4 py-8 sm:px-6 sm:py-10', contentWidth)}>{children}</main>

      <footer
        className={cn(
          'mx-auto flex items-center justify-between gap-4 px-4 pb-10 sm:px-6',
          contentWidth,
        )}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className={cn(
            'rounded-xl px-6 py-2.5 text-sm font-semibold transition',
            canGoBack
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'cursor-not-allowed bg-slate-50 text-slate-300',
          )}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            'rounded-xl px-8 py-2.5 text-sm font-semibold text-white transition',
            gradientContinue && canContinue && 'session-start-btn hover:opacity-90',
            !gradientContinue && canContinue && 'bg-violet-600 hover:bg-violet-700',
            !canContinue && 'cursor-not-allowed bg-violet-300',
          )}
        >
          {continueLabel}
        </button>
      </footer>
    </div>
  )
}
