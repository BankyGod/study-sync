import { Check, Monitor, Headphones, BookOpen, Hand } from 'lucide-react'
import { LEARNING_STYLE_OPTIONS } from '@/utils/onboarding'
import { cn } from '@/utils/cn'

const styleIcons = {
  visual: Monitor,
  auditory: Headphones,
  reading: BookOpen,
  kinesthetic: Hand,
}

export function LearningStyleSelector({ value, onChange, readOnly = false }) {
  return (
    <section>
      <header className="mb-4">
        <h2 className="font-display text-lg font-semibold text-ink">Learning style</h2>
        <p className="mt-1 text-sm text-muted">Choose the style that fits how you study best.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {LEARNING_STYLE_OPTIONS.map((style) => {
          const Icon = styleIcons[style.id] ?? Monitor
          const isSelected = value === style.id

          return (
            <button
              key={style.id}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(style.id)}
              className={cn(
                'relative min-h-[5.5rem] rounded-lg border p-3.5 text-left transition sm:p-4',
                isSelected
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-border bg-surface hover:border-brand-300',
                readOnly && 'cursor-default',
              )}
            >
              {isSelected ? (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-surface">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              ) : null}
              <div
                className={cn(
                  'mb-3 flex h-9 w-9 items-center justify-center rounded-lg',
                  isSelected ? 'bg-brand-100 text-brand-700' : 'bg-page text-muted',
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="font-semibold text-ink">{style.label}</p>
              <p className="mt-1 text-sm text-muted">{style.description}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
