import { Calendar, Check, Sparkles, Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { buildWorkspacePath } from '@/utils/workspace'

const METRIC_ICONS = {
  'Schedule Match': Calendar,
  'Learning Style': Users,
  'Avg. Grades': Star,
}

const METRIC_ACCENTS = {
  'Schedule Match': 'bg-violet-50 text-violet-700',
  'Learning Style': 'bg-emerald-50 text-emerald-700',
  'Avg. Grades': 'bg-amber-50 text-amber-700',
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
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-500 shadow-lg shadow-teal-500/30">
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl">Match Found!</h1>
        <p className="mt-3 text-slate-500">
          {courseLabel
            ? `You've been matched with a ${courseLabel} study pod.`
            : "You've been matched with a study group."}
        </p>
      </div>

      <article className="relative mt-10 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md sm:p-8">
        <div className="absolute right-6 top-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-amber-400">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>

        <header className="pr-12">
          <h2 className="text-xl font-bold text-slate-900">{groupTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {courseLabel ? `Course-based pod · ${courseLabel}` : 'Your new study pod'}
          </p>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = METRIC_ICONS[metric.label] ?? Star
            return (
              <div
                key={metric.label}
                className={cn('rounded-xl px-4 py-3', METRIC_ACCENTS[metric.label])}
              >
                <div className="mb-2 flex items-center gap-1.5 opacity-80">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{metric.label}</span>
                </div>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
            )
          })}
        </div>

        {teamMembers.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-800">Your team:</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white',
                      member.color,
                    )}
                  >
                    {member.initials}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.major}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to={workspacePath}
            className="session-start-btn inline-flex flex-1 items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Join Study Group
          </Link>
          <button
            type="button"
            onClick={onFindAnother}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Find Another
          </button>
        </div>
      </article>
    </div>
  )
}
