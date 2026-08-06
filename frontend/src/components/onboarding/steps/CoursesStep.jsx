import { BookOpen, Building2, Plus, Trash2 } from 'lucide-react'
import { COURSE_SUBJECTS } from '@/utils/onboarding'

function createCourseEntry(subject = '', courseNumber = '') {
  return {
    id: crypto.randomUUID(),
    subject,
    courseNumber,
  }
}

export function CoursesStep({ value, onChange }) {
  const updateEntry = (id, field, fieldValue) => {
    onChange(value.map((entry) => (entry.id === id ? { ...entry, [field]: fieldValue } : entry)))
  }

  const removeEntry = (id) => {
    if (value.length <= 1) return
    onChange(value.filter((entry) => entry.id !== id))
  }

  const addEntry = () => {
    onChange([...value, createCourseEntry()])
  }

  return (
    <article>
      <header className="border-b border-border pb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          What courses are you taking?
        </h1>
        <p className="mt-2 text-sm text-muted">
          Add courses to find students in the same classes.
        </p>
      </header>

      <div className="mt-6 space-y-3">
        {value.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-wrap items-center gap-3 border-b border-border py-3 sm:flex-nowrap"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Building2 className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor={`subject-${entry.id}`}>
                Subject
              </label>
              <input
                id={`subject-${entry.id}`}
                list="course-subjects"
                type="text"
                value={entry.subject}
                onChange={(event) => updateEntry(entry.id, 'subject', event.target.value)}
                placeholder="Select a subject"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor={`course-${entry.id}`}>
                Course number
              </label>
              <input
                id={`course-${entry.id}`}
                type="text"
                value={entry.courseNumber}
                onChange={(event) => updateEntry(entry.id, 'courseNumber', event.target.value)}
                placeholder="Course number"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <button
              type="button"
              onClick={() => removeEntry(entry.id)}
              disabled={value.length <= 1}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-border"
              aria-label="Remove course"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <datalist id="course-subjects">
        {COURSE_SUBJECTS.map((subject) => (
          <option key={subject} value={subject} />
        ))}
      </datalist>

      <button
        type="button"
        onClick={addEntry}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
      >
        <Plus className="h-4 w-4" />
        Add another course
      </button>
    </article>
  )
}
