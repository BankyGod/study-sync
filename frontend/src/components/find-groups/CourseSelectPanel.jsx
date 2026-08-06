import { BookOpen, Check, Plus, Search, Trash2 } from 'lucide-react'
import { COURSE_SUBJECTS, formatCourseName, getValidCourses } from '@/utils/onboarding'
import { cn } from '@/utils/cn'

function createCourseEntry(subject = '', courseNumber = '') {
  return {
    id: crypto.randomUUID(),
    subject,
    courseNumber,
  }
}

function courseKey(course) {
  return course.id ?? `${course.subject}-${course.courseNumber}`
}

export function CourseSelectPanel({
  courses,
  selectedCourseId,
  onSelectCourse,
  onCoursesChange,
  onSearch,
  isSaving = false,
  canSearch = true,
  error = '',
}) {
  const validCourses = getValidCourses(courses)
  const selectedCourse = validCourses.find((course) => courseKey(course) === selectedCourseId)
  const canSubmitSearch = Boolean(selectedCourse) && !isSaving && canSearch

  const addCourse = () => {
    onCoursesChange([...courses, createCourseEntry()])
  }

  const updateCourse = (id, field, value) => {
    onCoursesChange(
      courses.map((course) => (course.id === id ? { ...course, [field]: value } : course)),
    )
  }

  const removeCourse = (id) => {
    if (courses.length <= 1) return
    onCoursesChange(courses.filter((course) => course.id !== id))
    if (selectedCourseId === id) {
      onSelectCourse(null)
    }
  }

  const isCourseValid = (course) =>
    Boolean(course.subject?.trim() && course.courseNumber?.trim())

  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Find groups</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
          Join a study pod
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
          Select a course you are enrolled in. We will search for pods on that course.
        </p>
      </header>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Your courses</h2>
            <p className="mt-1 text-sm text-muted">
              {validCourses.length > 0
                ? 'Select one course to search.'
                : 'Add at least one course with subject and number.'}
            </p>
          </div>
          <button
            type="button"
            onClick={addCourse}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:bg-page"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        <ul className="overflow-hidden rounded-lg border border-border bg-surface">
          {courses.map((course, index) => {
            const key = courseKey(course)
            const valid = isCourseValid(course)
            const isSelected = selectedCourseId === key

            return (
              <li
                key={course.id}
                className={cn(
                  'border-b border-border p-3 last:border-b-0',
                  isSelected && valid && 'bg-brand-50/50',
                )}
              >
                <div className="grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center">
                  <button
                    type="button"
                    disabled={!valid}
                    onClick={() => onSelectCourse(key)}
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition',
                      valid
                        ? isSelected
                          ? 'bg-brand-600 text-surface'
                          : 'bg-page text-brand-700 hover:bg-brand-100'
                        : 'cursor-not-allowed bg-page text-border',
                    )}
                    aria-label={
                      valid
                        ? `Select ${formatCourseName(course)}`
                        : 'Complete course details to select'
                    }
                  >
                    {isSelected && valid ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}
                  </button>

                  <input
                    list="find-groups-course-subjects"
                    type="text"
                    value={course.subject}
                    onChange={(event) => updateCourse(course.id, 'subject', event.target.value)}
                    placeholder="Subject"
                    className="rounded-lg border border-border bg-page px-3 py-2 text-sm text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                  <input
                    type="text"
                    value={course.courseNumber}
                    onChange={(event) =>
                      updateCourse(course.id, 'courseNumber', event.target.value)
                    }
                    placeholder="Course number"
                    className="rounded-lg border border-border bg-page px-3 py-2 text-sm text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeCourse(course.id)}
                    disabled={courses.length <= 1}
                    className="flex h-10 w-10 items-center justify-center self-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                    aria-label={`Remove course ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        <datalist id="find-groups-course-subjects">
          {COURSE_SUBJECTS.map((subject) => (
            <option key={subject} value={subject} />
          ))}
        </datalist>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={onSearch}
          disabled={!canSubmitSearch}
          className={cn(
            'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-surface transition sm:w-auto',
            canSubmitSearch ? 'hover:bg-brand-700' : 'cursor-not-allowed opacity-50',
          )}
        >
          <Search className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Search for a pod'}
        </button>
        {selectedCourse ? (
          <p className="text-sm text-muted">
            Searching pods for{' '}
            <span className="font-semibold text-ink">{formatCourseName(selectedCourse)}</span>
          </p>
        ) : null}
      </div>

      {!canSearch && selectedCourse ? (
        <p className="mt-3 text-sm text-ochre">Complete your study preferences before searching.</p>
      ) : null}
    </div>
  )
}

export { courseKey }
