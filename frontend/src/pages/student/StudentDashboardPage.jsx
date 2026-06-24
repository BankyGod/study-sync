import { Plus, Users, CheckCircle2, Clock } from 'lucide-react'
import { CircularProgress } from '@/components/dashboard/CircularProgress'
import { PodCard } from '@/components/dashboard/PodCard'
import { QuickStatCard } from '@/components/dashboard/QuickStatCard'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'

const activePods = [
  {
    id: '1',
    title: 'CS401 - Algorithms',
    progress: 25,
    accent: 'blue',
    members: [
      { initials: 'AO', name: 'Alex Opoku', color: 'bg-sky-500' },
      { initials: 'MO', name: 'Michael Owusu', color: 'bg-violet-500' },
      { initials: 'ED', name: 'Emmanuel Donkor', color: 'bg-emerald-500' },
      { initials: 'SK', name: 'Sarah K.', color: 'bg-amber-500' },
    ],
  },
  {
    id: '2',
    title: 'Linear Algebra',
    progress: 40,
    accent: 'green',
    members: [
      { initials: 'AO', name: 'Alex Opoku', color: 'bg-sky-500' },
      { initials: 'JK', name: 'James K.', color: 'bg-rose-500' },
      { initials: 'LM', name: 'Lisa M.', color: 'bg-indigo-500' },
    ],
  },
  {
    id: '3',
    title: 'Quantum Physics',
    progress: 15,
    accent: 'purple',
    members: [
      { initials: 'MO', name: 'Michael Owusu', color: 'bg-violet-500' },
      { initials: 'ED', name: 'Emmanuel Donkor', color: 'bg-emerald-500' },
      { initials: 'TN', name: 'Tina N.', color: 'bg-cyan-500' },
      { initials: 'RB', name: 'Ryan B.', color: 'bg-orange-500' },
    ],
  },
]

const deadlines = [
  {
    id: '1',
    title: 'Algo Midterm',
    datetime: 'Oct 15, 2023 · 10:00 AM',
    tag: '2 days',
    tagVariant: 'urgent',
  },
  {
    id: '2',
    title: 'Linear Algebra HW',
    datetime: 'Oct 17, 2023 · 11:59 PM',
    tag: '4 days',
    tagVariant: 'soon',
  },
  {
    id: '3',
    title: 'Physics Lab Report',
    datetime: 'Oct 20, 2023 · 5:00 PM',
    tag: '7 days',
    tagVariant: 'later',
  },
  {
    id: '4',
    title: 'Group Project Draft',
    datetime: 'Oct 22, 2023 · 12:00 PM',
    tag: 'Draft',
    tagVariant: 'draft',
  },
]

export function StudentDashboardPage() {
  const firstName = 'Alex'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          {/* Greeting & progress */}
          <section className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Hello, {firstName}! <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-2 text-slate-500">
                Ready to tackle your study goals for today, {firstName}?
              </p>
            </div>
            <CircularProgress value={80} />
          </section>

          {/* Active pods */}
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">Your Active Pods</h2>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />
                Join New Pod
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activePods.map((pod) => (
                <PodCard
                  key={pod.id}
                  title={pod.title}
                  members={pod.members}
                  progress={pod.progress}
                  accent={pod.accent}
                />
              ))}
            </div>
          </section>

          {/* Quick stats */}
          <section className="grid gap-4 sm:grid-cols-3">
            <QuickStatCard icon={Users} value="3" label="Active Pods" accent="purple" />
            <QuickStatCard icon={CheckCircle2} value="12" label="Tasks Completed" accent="green" />
            <QuickStatCard icon={Clock} value="24h" label="Study Time" accent="amber" />
          </section>
        </div>

        {/* Deadlines sidebar */}
        <UpcomingDeadlines deadlines={deadlines} />
      </div>
    </div>
  )
}
