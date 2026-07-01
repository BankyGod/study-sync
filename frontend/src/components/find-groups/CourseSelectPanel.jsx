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
    <div className="mx-auto max-w-2xl">
      <header className="mb-8 text-center">
        <p className="mb-3 inline-flex rounded-full bg-violet-50 px-4 py-1.5 text-sm font-semibold text-violet-700">
          Step 1 · Choose your course
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Join a Study Pod
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
          Select a course you are enrolled in, or add one below. We will search for pods on that
          course.
        </p>
      </header>

      {error && (
        <p className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Your courses</h2>
            <p className="mt-1 text-sm text-slate-500">
              {validCourses.length > 0
                ? 'Select a course, or edit and add more below.'
                : 'Add at least one course to search for a pod.'}
            </p>
          </div>
          <button
            type="button"
            onClick={addCourse}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
          >
            <Plus className="h-4 w-4" />
            Add course
          </button>
        </div>

        <ul className="space-y-3">
          {courses.map((course) => {
            const key = courseKey(course)
            const valid = isCourseValid(course)
            const isSelected = selectedCourseId === key

            return (
              <li
                key={course.id}
                className={cn(
                  'rounded-xl border p-3 transition',
                  isSelected && valid
                    ? 'border-violet-300 bg-violet-50/60 ring-2 ring-violet-200'
                    : 'border-slate-100 bg-slate-50/80',
                )}
              >
                <div className="grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center">
                  <button
                    type="button"
                    disabled={!valid}
                    onClick={() => onSelectCourse(key)}
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition',
                      valid
                        ? isSelected
                          ? 'bg-violet-600 text-white'
                          : 'bg-sky-50 text-sky-600 hover:bg-violet-100 hover:text-violet-700'
                        : 'cursor-not-allowed bg-slate-100 text-slate-300',
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
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                  <input
                    type="text"
                    value={course.courseNumber}
                    onChange={(event) =>
                      updateCourse(course.id, 'courseNumber', event.target.value)
                    }
                    placeholder="Course number"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeCourse(course.id)}
                    disabled={courses.length <= 1}
                    className="flex h-10 w-10 items-center justify-center self-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    aria-label="Remove course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {valid && (
                  <p className="mt-2 pl-[3.25rem] text-xs text-slate-500 sm:pl-14">
                    {formatCourseName(course)}
                    {isSelected ? ' · selected for pod search' : ' · click the icon to select'}
                  </p>
                )}
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

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onSearch}
          disabled={!canSubmitSearch}
          className={cn(
            'session-start-btn inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-sm transition',
            canSubmitSearch ? 'hover:opacity-90' : 'cursor-not-allowed opacity-50',
          )}
        >
          <Search className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Search for a pod'}
        </button>
      </div>

      {!canSearch && selectedCourse ? (
        <p className="mt-4 text-center text-sm text-amber-700">
          Complete your study preferences above before searching.
        </p>
      ) : null}

      {canSearch && selectedCourse ? (
        <p className="mt-4 text-center text-sm text-slate-500">
          Searching will look for study pods enrolled in{' '}
          <span className="font-semibold text-slate-700">{formatCourseName(selectedCourse)}</span>.
        </p>
      ) : null}
    </div>
  )
}

export { courseKey }
