import { BookOpen, Building2, Plus, Trash2 } from 'lucide-react'
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
    <section>
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Enrolled courses</h2>
          <p className="mt-1 text-sm text-muted">Manage the courses you want to study with others.</p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            onClick={addEntry}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface transition hover:bg-brand-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add course
          </button>
        ) : null}
      </header>

      {value.length === 0 ? (
        <p className="py-4 text-sm text-muted">No courses yet. Add one below or finish onboarding.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {value.map((course) => {
            const hasDetails = course.subject?.trim() && course.courseNumber?.trim()
            const label = hasDetails ? formatCourseName(course) : 'New course'

            return (
              <li key={course.id} className="py-4">
                {readOnly || !onChange ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <p className="min-w-0 flex-1 font-semibold text-ink">{label}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <p className="truncate text-sm font-medium text-muted">
                          {hasDetails ? label : `Course ${value.indexOf(course) + 1}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEntry(course.id)}
                        disabled={value.length <= 1}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                        aria-label="Remove course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                          list="profile-course-subjects"
                          type="text"
                          value={course.subject}
                          onChange={(event) => updateEntry(course.id, 'subject', event.target.value)}
                          placeholder="Subject"
                          className="min-h-11 w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                      <input
                        type="text"
                        value={course.courseNumber}
                        onChange={(event) =>
                          updateEntry(course.id, 'courseNumber', event.target.value)
                        }
                        placeholder="Course number"
                        className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                  </div>
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
