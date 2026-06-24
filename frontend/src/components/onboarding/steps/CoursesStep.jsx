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
    <article className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <BookOpen className="h-7 w-7" />
      </div>

      <h1 className="mt-6 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
        What Courses Are You Taking?
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm text-slate-500 sm:text-base">
        Add courses to find students who are in the same classes as you.
      </p>

      <div className="mt-8 space-y-3">
        {value.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:flex-nowrap"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
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
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
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
                placeholder="Course Number"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <button
              type="button"
              onClick={() => removeEntry(entry.id)}
              disabled={value.length <= 1}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
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
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
      >
        <Plus className="h-4 w-4" />
        Add another course
      </button>
    </article>
  )
}
