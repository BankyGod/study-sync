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

function PreferenceSection({ title, options, value, onChange, icons }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const Icon = icons?.[option.id] ?? User
          const isSelected = value === option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                'rounded-lg border p-4 text-left transition sm:text-center',
                isSelected
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-border bg-surface hover:border-brand-300',
              )}
            >
              <div
                className={cn(
                  'mb-3 flex h-9 w-9 items-center justify-center rounded-lg sm:mx-auto',
                  isSelected ? 'bg-brand-100 text-brand-700' : 'bg-page text-muted',
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-ink">{option.label}</p>
              <p className="mt-1 text-xs text-muted">{option.description}</p>
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
    <article>
      <header className="border-b border-border pb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Set your preferences
        </h1>
        <p className="mt-2 text-sm text-muted">
          Tell us how you like to study so we can match you with the right group.
        </p>
      </header>

      <div className="mt-8 space-y-8">
        <PreferenceSection
          title="Preferred group size"
          options={GROUP_SIZE_OPTIONS}
          value={value.groupSize}
          onChange={(groupSize) => update('groupSize', groupSize)}
          icons={groupSizeIcons}
        />

        <PreferenceSection
          title="Weekly time commitment"
          options={TIME_COMMITMENT_OPTIONS}
          value={value.timeCommitment}
          onChange={(timeCommitment) => update('timeCommitment', timeCommitment)}
          icons={{ low: Clock, medium: Clock, high: Clock }}
        />

        <PreferenceSection
          title="Subject matter difficulty"
          options={DIFFICULTY_OPTIONS}
          value={value.difficulty}
          onChange={(difficulty) => update('difficulty', difficulty)}
          icons={difficultyIcons}
        />
      </div>
    </article>
  )
}
