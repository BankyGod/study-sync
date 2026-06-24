import { Atom, Calculator, Cpu, MoreVertical, Plus } from 'lucide-react'

const courses = [
  {
    id: '1',
    code: 'CS101 - Advanced Algorithms',
    meta: 'Computer Science | Prof. Smith',
    icon: Cpu,
    iconBg: 'bg-sky-50 text-sky-600',
  },
  {
    id: '2',
    code: 'MTH102 - Linear Algebra',
    meta: 'Mathematics | Prof. Johnson',
    icon: Calculator,
    iconBg: 'bg-violet-50 text-violet-600',
  },
  {
    id: '3',
    code: 'PHY103 - Quantum Physics',
    meta: 'Physics | Prof. Davis',
    icon: Atom,
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
]

export function EnrolledCourses() {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Enrolled Courses</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your current enrolled courses.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </header>

      <ul className="divide-y divide-slate-100">
        {courses.map((course) => {
          const Icon = course.icon
          return (
            <li key={course.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${course.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{course.code}</p>
                <p className="text-sm text-slate-500">{course.meta}</p>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Course options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
