import { Check } from 'lucide-react'
import { ONBOARDING_STEPS } from '@/utils/onboarding'
import { cn } from '@/utils/cn'

export function OnboardingStepper({ currentStep }) {
  return (
    <div className="mx-auto flex max-w-xl items-start justify-between gap-1">
      {ONBOARDING_STEPS.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = currentStep > index
        const isCurrent = currentStep === index

        return (
          <div key={step.id} className="flex min-w-0 flex-1 items-start">
            <div className="flex min-w-0 flex-col items-center text-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition sm:h-9 sm:w-9 sm:text-sm',
                  isCompleted && 'bg-brand-600 text-surface',
                  isCurrent && 'bg-brand-600 text-surface',
                  !isCompleted && !isCurrent && 'bg-page text-muted',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : stepNumber}
              </div>
              <span
                className={cn(
                  'mt-1.5 max-w-[4.5rem] text-[10px] font-medium leading-tight sm:mt-2 sm:max-w-none sm:text-xs',
                  isCurrent || isCompleted ? 'text-brand-700' : 'text-muted',
                )}
              >
                {step.label}
              </span>
            </div>

            {index < ONBOARDING_STEPS.length - 1 ? (
              <div
                className={cn(
                  'mx-1 mt-4 h-0.5 min-w-[0.5rem] flex-1 sm:mx-2',
                  currentStep > index ? 'bg-brand-600' : 'bg-border',
                )}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
