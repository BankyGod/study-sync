import {
  BookOpen,
  Clock,
  GraduationCap,
  Lightbulb,
  User,
  Users,
  UsersRound,
} from 'lucide-react'
import {
  DIFFICULTY_OPTIONS,
  GROUP_SIZE_OPTIONS,
  TIME_COMMITMENT_OPTIONS,
} from '@/utils/onboarding'
import { cn } from '@/utils/cn'

const groupSizeIcons = {
  small: User,
  medium: Users,
  large: UsersRound,
}

const accentStyles = {
  purple: {
    selected: 'border-violet-500 bg-violet-50 ring-1 ring-violet-500',
    icon: 'bg-violet-100 text-violet-600',
  },
  green: {
    selected: 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500',
    icon: 'bg-emerald-100 text-emerald-600',
  },
  amber: {
    selected: 'border-amber-500 bg-amber-50 ring-1 ring-amber-500',
    icon: 'bg-amber-100 text-amber-600',
  },
}

function PreferenceSection({ title, options, value, onChange, accent, icons }) {
  const styles = accentStyles[accent]
  const defaultIcon = accent === 'green' ? Clock : accent === 'amber' ? Lightbulb : User

  return (
    <section>
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const Icon = icons?.[option.id] ?? defaultIcon
          const isSelected = value === option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                'rounded-xl border p-4 text-center transition',
                isSelected ? styles.selected : 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              <div
                className={cn(
                  'mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg',
                  isSelected ? styles.icon : 'bg-slate-100 text-slate-500',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-900">{option.label}</p>
              <p className="mt-1 text-xs text-slate-500">{option.description}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

const difficultyIcons = {
  beginner: Lightbulb,
  intermediate: BookOpen,
  advanced: GraduationCap,
}

export function PreferencesStep({ value, onChange }) {
  const update = (field, fieldValue) => {
    onChange({ ...value, [field]: fieldValue })
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
      <h1 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
        Set Your Preferences
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-center text-sm text-slate-500 sm:text-base">
        Tell us how you like to study so we can match you with the right group.
      </p>

      <div className="mt-8 space-y-8">
        <PreferenceSection
          title="Preferred Group Size"
          options={GROUP_SIZE_OPTIONS}
          value={value.groupSize}
          onChange={(groupSize) => update('groupSize', groupSize)}
          accent="purple"
          icons={groupSizeIcons}
        />

        <PreferenceSection
          title="Weekly Time Commitment"
          options={TIME_COMMITMENT_OPTIONS}
          value={value.timeCommitment}
          onChange={(timeCommitment) => update('timeCommitment', timeCommitment)}
          accent="green"
          icons={{ low: Clock, medium: Clock, high: Clock }}
        />

        <PreferenceSection
          title="Subject Matter Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={value.difficulty}
          onChange={(difficulty) => update('difficulty', difficulty)}
          accent="amber"
          icons={difficultyIcons}
        />
      </div>
    </article>
  )
}
