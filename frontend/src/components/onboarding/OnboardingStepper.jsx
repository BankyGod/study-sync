import { Check } from 'lucide-react'
import { ONBOARDING_STEPS } from '@/utils/onboarding'
import { cn } from '@/utils/cn'

export function OnboardingStepper({ currentStep }) {
  return (
    <div className="mx-auto flex max-w-xl items-center justify-between">
      {ONBOARDING_STEPS.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = currentStep > index
        const isCurrent = currentStep === index

        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition',
                  isCompleted && 'bg-emerald-500 text-white',
                  isCurrent && 'bg-violet-600 text-white',
                  !isCompleted && !isCurrent && 'bg-slate-100 text-slate-400',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : stepNumber}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium',
                  isCurrent || isCompleted ? 'text-violet-700' : 'text-slate-400',
                )}
              >
                {step.label}
              </span>
            </div>

            {index < ONBOARDING_STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 mb-5 h-0.5 flex-1',
                  currentStep > index ? 'bg-emerald-500' : 'bg-slate-200',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
