import { Calendar, Check, Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { buildWorkspacePath } from '@/utils/workspace'

const METRIC_ICONS = {
  'Schedule Match': Calendar,
  'Learning Style': Users,
  'Avg. Grades': Star,
}

export function MatchFoundView({ match, courseLabel, groupTitle, onFindAnother }) {
  const workspacePath = buildWorkspacePath(match.groupId)

  const metrics = [
    { label: 'Schedule Match', value: `${match.metrics?.scheduleMatch ?? 0}%` },
    { label: 'Learning Style', value: `${match.metrics?.learningStyleMatch ?? 0}%` },
    { label: 'Avg. Grades', value: `${match.metrics?.avgGrades ?? 0}%` },
  ]

  const teamMembers = match.members ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <header className="border-b border-border pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-surface">
          <Check className="h-6 w-6" strokeWidth={3} />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
          Match found
        </h1>
        <p className="mt-2 text-sm text-muted">
          {courseLabel
            ? `You were matched with a ${courseLabel} study pod.`
            : 'You were matched with a study group.'}
        </p>
      </header>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink">{groupTitle}</h2>
        <p className="mt-1 text-sm text-muted">
          {courseLabel ? `Course-based pod · ${courseLabel}` : 'Your new study pod'}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = METRIC_ICONS[metric.label] ?? Star
            return (
              <div key={metric.label} className="rounded-lg border border-border bg-surface px-4 py-3">
                <div className="mb-2 flex items-center gap-1.5 text-muted">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{metric.label}</span>
                </div>
                <p className="font-display text-2xl font-semibold text-ink">{metric.value}</p>
              </div>
            )
          })}
        </div>

        {teamMembers.length > 0 ? (
          <div className="mt-8">
            <p className="text-sm font-semibold text-ink">Your team</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-surface',
                      member.color || 'bg-brand-600',
                    )}
                  >
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{member.name}</p>
                    <p className="truncate text-xs text-muted">{member.major}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            to={workspacePath}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-surface transition hover:bg-brand-700 sm:w-auto sm:flex-1"
          >
            Open workspace
          </Link>
          <button
            type="button"
            onClick={onFindAnother}
            className="min-h-11 w-full rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-page sm:w-auto"
          >
            Find another
          </button>
        </div>
      </section>
    </div>
  )
}
