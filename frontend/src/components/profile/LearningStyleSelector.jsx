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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <header className="mb-5">
        <h2 className="text-base font-bold text-slate-900">Learning Style</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select the style that suits your learning best.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
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
                'relative rounded-xl border p-4 text-left transition',
                isSelected
                  ? 'border-violet-500 bg-violet-50/50 ring-1 ring-violet-500'
                  : 'border-slate-200 bg-white hover:border-slate-300',
                readOnly && 'cursor-default',
              )}
            >
              {isSelected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
              <div
                className={cn(
                  'mb-3 flex h-10 w-10 items-center justify-center rounded-lg',
                  isSelected ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-900">{style.label}</p>
              <p className="mt-1 text-sm text-slate-500">{style.description}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
