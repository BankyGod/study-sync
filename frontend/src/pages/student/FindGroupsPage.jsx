import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { OrbitAnimation } from '@/components/find-groups/OrbitAnimation'
import { MatchingProgress } from '@/components/find-groups/MatchingProgress'
import { MatchFoundView } from '@/components/find-groups/MatchFoundView'
import { CourseSelectPanel, courseKey } from '@/components/find-groups/CourseSelectPanel'
import { CompleteStudyPreferencesBanner } from '@/components/onboarding/CompleteStudyPreferencesBanner'
import { useMatchingProgress } from '@/hooks/useMatchingProgress'
import { Spinner } from '@/components/common/Spinner'
import {
  getOnboardingErrorMessage,
  isOnboardingProfileSaved,
  loadOnboardingProfile,
  mergeOnboardingProfile,
  saveOnboardingProfile,
  setCachedOnboardingProfile,
} from '@/services/onboardingProfileService'
import { fetchCourseGroups } from '@/services/matchingService'
import { ROUTES } from '@/utils/constants'
import { formatCourseName, getValidCourses } from '@/utils/onboarding'
import {
  isOnboardingRequiredMessage,
  ONBOARDING_REQUIRED_MESSAGE,
} from '@/utils/matchingErrors'
import { cn } from '@/utils/cn'

function createEmptyCourse() {
  return { id: crypto.randomUUID(), subject: '', courseNumber: '' }
}

export function FindGroupsPage() {
  const location = useLocation()
  const [phase, setPhase] = useState('select-course')
  const [runKey, setRunKey] = useState(0)
  const [courses, setCourses] = useState([createEmptyCourse()])
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseLabel, setCourseLabel] = useState(null)
  const [courseGroups, setCourseGroups] = useState([])
  const [isProfileReady, setIsProfileReady] = useState(false)
  const [hasSavedProfile, setHasSavedProfile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectError, setSelectError] = useState('')
  const [profileError, setProfileError] = useState('')

  const { progress, steps, match, error, isWaitingForPeers, isComplete, reset } =
    useMatchingProgress({
      active: phase === 'searching',
      profileReady: isProfileReady,
      runKey,
      selectedCourse,
    })

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setIsProfileReady(false)
      setProfileError('')

      try {
        const profile = await loadOnboardingProfile()
        if (cancelled) return

        setHasSavedProfile(isOnboardingProfileSaved(profile))

        const merged = mergeOnboardingProfile(profile)
        setCachedOnboardingProfile(profile ?? merged)

        const validCourses = getValidCourses(merged.courses)
        setCourses(validCourses.length > 0 ? merged.courses : [createEmptyCourse()])

        const preselectedId =
          location.state?.preselectedCourseId ??
          (validCourses.length === 1 ? courseKey(validCourses[0]) : null)

        if (preselectedId) {
          setSelectedCourseId(preselectedId)
        }

        setIsProfileReady(true)
      } catch {
        if (!cancelled) {
          setProfileError('Unable to load your profile. Please try again.')
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [location.state?.preselectedCourseId, location.state?.fromOnboarding])

  useEffect(() => {
    if (isComplete && phase === 'searching') {
      const timeout = window.setTimeout(() => setPhase('found'), 400)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [isComplete, phase])

  const validCourses = useMemo(() => getValidCourses(courses), [courses])

  useEffect(() => {
    validCourses.forEach((course) => {
      const key = courseKey(course)
      if (!selectedCourseId && validCourses.length === 1) {
        setSelectedCourseId(key)
      }
    })
  }, [validCourses, selectedCourseId])

  const handleStartSearch = async () => {
    if (!hasSavedProfile) {
      setSelectError(ONBOARDING_REQUIRED_MESSAGE)
      return
    }

    const course = validCourses.find((item) => courseKey(item) === selectedCourseId)
    if (!course) {
      setSelectError('Select a course with a subject and course number.')
      return
    }

    setIsSaving(true)
    setSelectError('')

    try {
      const existing = await loadOnboardingProfile()
      const baseProfile = mergeOnboardingProfile(existing)
      const saved = await saveOnboardingProfile({ ...baseProfile, courses })
      setCachedOnboardingProfile(saved)
      setHasSavedProfile(true)

      setSelectedCourse({
        subject: course.subject.trim(),
        courseNumber: course.courseNumber.trim(),
      })
      setCourseLabel(formatCourseName(course))
      setPhase('searching')
      reset()
      setRunKey((key) => key + 1)

      try {
        const courseData = await fetchCourseGroups(course)
        setCourseGroups(courseData?.groups ?? [])
      } catch {
        setCourseGroups([])
      }
    } catch (saveError) {
      setSelectError(
        saveError.message?.includes('Select') || saveError.message?.includes('Add')
          ? saveError.message
          : getOnboardingErrorMessage(saveError),
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangeCourse = () => {
    reset()
    setPhase('select-course')
    setSelectedCourse(null)
    setCourseGroups([])
  }

  const handleFindAnother = () => {
    handleChangeCourse()
  }

  const handleCheckAgain = async () => {
    reset()
    setRunKey((key) => key + 1)

    if (selectedCourse) {
      try {
        const courseData = await fetchCourseGroups(selectedCourse)
        setCourseGroups(courseData?.groups ?? [])
      } catch {
        setCourseGroups([])
      }
    }
  }

  if (phase === 'found' && match) {
    return (
      <MatchFoundView
        match={match}
        courseLabel={match.courseLabel ?? courseLabel}
        groupTitle={match.groupTitle}
        onFindAnother={handleFindAnother}
      />
    )
  }

  if (phase === 'select-course') {
    const showOnboardingPrompt =
      !hasSavedProfile ||
      isOnboardingRequiredMessage(profileError || selectError) ||
      isOnboardingRequiredMessage(error)

    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        {!isProfileReady && !profileError ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {showOnboardingPrompt ? (
              <CompleteStudyPreferencesBanner returnTo={ROUTES.FIND_GROUPS} />
            ) : null}
            <CourseSelectPanel
              courses={courses}
              selectedCourseId={selectedCourseId}
              onSelectCourse={setSelectedCourseId}
              onCoursesChange={setCourses}
              onSearch={handleStartSearch}
              isSaving={isSaving}
              canSearch={hasSavedProfile}
              error={
                showOnboardingPrompt && isOnboardingRequiredMessage(profileError || selectError)
                  ? ''
                  : profileError || selectError
              }
            />
          </div>
        )}
      </div>
    )
  }

  const statusMessage = error
  const openGroupCount = courseGroups.filter((group) => (group.openSlots ?? 0) > 0).length
  const totalOpenSlots = courseGroups.reduce((sum, group) => sum + (group.openSlots ?? 0), 0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          {courseLabel ? `Searching · ${courseLabel}` : 'Searching'}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Finding your study group
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {courseLabel
            ? `Scanning students in ${courseLabel} for schedule, learning style, and preference fit.`
            : 'Matching classmates by course and study preferences.'}
        </p>
        {courseGroups.length > 0 ? (
          <p className="mt-2 text-sm text-muted">
            {openGroupCount > 0
              ? `${openGroupCount} open group${openGroupCount === 1 ? '' : 's'} · ${totalOpenSlots} slot${totalOpenSlots === 1 ? '' : 's'}`
              : `${courseGroups.length} existing group${courseGroups.length === 1 ? '' : 's'} found`}
          </p>
        ) : null}
      </header>

      {statusMessage && (
        <div
          className={cn(
            'mb-6 rounded-xl border px-4 py-3 text-left text-sm',
            isWaitingForPeers
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-red-100 bg-red-50 text-red-600',
          )}
        >
          <p>{statusMessage}</p>
          {isWaitingForPeers && (
            <p className="mt-2 text-xs text-amber-700">
              We&apos;ll keep checking as more students join {courseLabel ?? 'your course'}.
            </p>
          )}
        </div>
      )}

      {isOnboardingRequiredMessage(statusMessage) ? (
        <div className="mb-6">
          <CompleteStudyPreferencesBanner returnTo={ROUTES.FIND_GROUPS} />
        </div>
      ) : null}

      <div className="mt-6 overflow-x-clip">
        <OrbitAnimation paused={Boolean(statusMessage)} />
      </div>

      <div className="mt-8 sm:mt-10">
        <MatchingProgress progress={progress} steps={steps} />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {isWaitingForPeers && (
          <button
            type="button"
            onClick={handleCheckAgain}
            className="min-h-11 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-page"
          >
            Check again
          </button>
        )}
        <button
          type="button"
          onClick={handleChangeCourse}
          className="min-h-11 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-page"
        >
          Change course
        </button>
      </div>
    </div>
  )
}
