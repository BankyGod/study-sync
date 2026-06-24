import { BookOpen, Building2, MoreVertical, Plus, Trash2 } from 'lucide-react'
import { COURSE_SUBJECTS, formatCourseName } from '@/utils/onboarding'

function createCourseEntry(subject = '', courseNumber = '') {
  return {
    id: crypto.randomUUID(),
    subject,
    courseNumber,
  }
}

export function EnrolledCourses({ value = [], onChange, readOnly = false }) {
  const updateEntry = (id, field, fieldValue) => {
    if (!onChange) return
    onChange(value.map((entry) => (entry.id === id ? { ...entry, [field]: fieldValue } : entry)))
  }

  const removeEntry = (id) => {
    if (!onChange || value.length <= 1) return
    onChange(value.filter((entry) => entry.id !== id))
  }

  const addEntry = () => {
    if (!onChange) return
    onChange([...value, createCourseEntry()])
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Enrolled Courses</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your current enrolled courses.</p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addEntry}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </button>
        )}
      </header>

      {value.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No courses added yet. Complete onboarding or add a course below.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {value.map((course) => {
            const hasDetails = course.subject?.trim() && course.courseNumber?.trim()
            const label = hasDetails ? formatCourseName(course) : 'New course'

            return (
              <li key={course.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <BookOpen className="h-5 w-5" />
                </div>

                {readOnly || !onChange ? (
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{label}</p>
                  </div>
                ) : (
                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        list="profile-course-subjects"
                        type="text"
                        value={course.subject}
                        onChange={(event) => updateEntry(course.id, 'subject', event.target.value)}
                        placeholder="Subject"
                        className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                    <input
                      type="text"
                      value={course.courseNumber}
                      onChange={(event) => updateEntry(course.id, 'courseNumber', event.target.value)}
                      placeholder="Course number"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                )}

                {!readOnly && onChange && (
                  <button
                    type="button"
                    onClick={() => removeEntry(course.id)}
                    disabled={value.length <= 1}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    aria-label="Remove course"
                  >
                    {value.length > 1 ? <Trash2 className="h-4 w-4" /> : <MoreVertical className="h-4 w-4" />}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <datalist id="profile-course-subjects">
        {COURSE_SUBJECTS.map((subject) => (
          <option key={subject} value={subject} />
        ))}
      </datalist>
    </section>
  )
}
