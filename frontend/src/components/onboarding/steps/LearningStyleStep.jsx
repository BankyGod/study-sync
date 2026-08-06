import { BookOpen, Eye, Hand, Volume2 } from 'lucide-react'
import { LEARNING_STYLE_OPTIONS } from '@/utils/onboarding'
import { cn } from '@/utils/cn'

const styleIcons = {
  visual: Eye,
  auditory: Volume2,
  reading: BookOpen,
  kinesthetic: Hand,
}

export function LearningStyleStep({ value, onChange }) {
  return (
    <article>
      <header className="border-b border-border pb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          What&apos;s your learning style?
        </h1>
        <p className="mt-2 text-sm text-muted">
          This helps us match you with pods that study the way you do.
        </p>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {LEARNING_STYLE_OPTIONS.map((style) => {
          const Icon = styleIcons[style.id]
          const isSelected = value === style.id

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className={cn(
                'rounded-lg border p-4 text-left transition',
                isSelected
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-border bg-surface hover:border-brand-300',
              )}
            >
              <div
                className={cn(
                  'mb-3 flex h-9 w-9 items-center justify-center rounded-lg',
                  isSelected ? 'bg-brand-100 text-brand-700' : 'bg-page text-muted',
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="font-semibold text-ink">{style.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{style.description}</p>
            </button>
          )
        })}
      </div>
    </article>
  )
}
