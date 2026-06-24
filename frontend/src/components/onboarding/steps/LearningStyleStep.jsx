import { BookOpen, Eye, Hand, Lightbulb, Volume2 } from 'lucide-react'
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
    <article className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
        <Lightbulb className="h-7 w-7" />
      </div>

      <h1 className="mt-6 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
        What&apos;s Your Learning Style?
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm text-slate-500 sm:text-base">
        This helps us match you with the right study groups and resources.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {LEARNING_STYLE_OPTIONS.map((style) => {
          const Icon = styleIcons[style.id]
          const isSelected = value === style.id

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className={cn(
                'rounded-xl border p-4 text-left transition',
                isSelected
                  ? 'border-violet-500 bg-violet-50/40 ring-1 ring-violet-500'
                  : 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              <div
                className={cn(
                  'mb-3 flex h-10 w-10 items-center justify-center rounded-lg',
                  isSelected ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-900">{style.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{style.description}</p>
            </button>
          )
        })}
      </div>
    </article>
  )
}
