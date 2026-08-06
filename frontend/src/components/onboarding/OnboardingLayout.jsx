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
  skipTo = ROUTES.STUDENT_DASHBOARD,
  skipLabel = 'Skip for now',
  showSkip = true,
}) {
  const contentWidth = wide ? 'max-w-4xl' : 'max-w-2xl'

  return (
    <div className="min-h-dvh bg-page">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <StudySyncLogo />
          {showSkip ? (
            <Link
              to={skipTo}
              className="text-sm font-medium text-muted transition hover:text-ink"
            >
              {skipLabel}
            </Link>
          ) : (
            <span className="w-16" aria-hidden="true" />
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <OnboardingStepper currentStep={currentStep} />
      </div>

      <main className={cn('mx-auto px-4 py-8 sm:px-6', contentWidth)}>{children}</main>

      <footer
        className={cn(
          'mx-auto flex items-center justify-between gap-4 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] sm:px-6',
          contentWidth,
        )}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className={cn(
            'rounded-lg px-5 py-2.5 text-sm font-semibold transition',
            canGoBack
              ? 'border border-border bg-surface text-ink hover:bg-page'
              : 'cursor-not-allowed bg-page text-border',
          )}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            'rounded-lg px-6 py-2.5 text-sm font-semibold text-surface transition',
            canContinue ? 'bg-brand-600 hover:bg-brand-700' : 'cursor-not-allowed bg-brand-300',
            gradientContinue && canContinue && 'session-start-btn',
          )}
        >
          {continueLabel}
        </button>
      </footer>
    </div>
  )
}
