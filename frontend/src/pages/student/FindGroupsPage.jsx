import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { OrbitAnimation } from '@/components/find-groups/OrbitAnimation'
import { MatchingProgress } from '@/components/find-groups/MatchingProgress'
import { MatchFoundView } from '@/components/find-groups/MatchFoundView'
import { CourseSelectPanel, courseKey } from '@/components/find-groups/CourseSelectPanel'
import { OpenCoursePodsPanel } from '@/components/find-groups/OpenCoursePodsPanel'
import { CompleteStudyPreferencesBanner } from '@/components/onboarding/CompleteStudyPreferencesBanner'
import { useMatchingProgress } from '@/hooks/useMatchingProgress'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import {
  getOnboardingErrorMessage,
  isOnboardingProfileSaved,
  loadOnboardingProfile,
  mergeOnboardingProfile,
  saveOnboardingProfile,
  setCachedOnboardingProfile,
} from '@/services/onboardingProfileService'
import { fetchCourseGroups, fetchOpenPodsForCourses } from '@/services/matchingService'
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
  const [openPods, setOpenPods] = useState([])
  const [isLoadingOpenPods, setIsLoadingOpenPods] = useState(false)
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

  const validCourses = useMemo(() => getValidCourses(courses), [courses])
  const validCoursesKey = useMemo(
    () =>
      validCourses
        .map((c) => `${c.subject.trim().toLowerCase()}|${c.courseNumber.trim()}`)
        .sort()
        .join(','),
    [validCourses],
  )

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

        const nextValid = getValidCourses(merged.courses)
        setCourses(nextValid.length > 0 ? merged.courses : [createEmptyCourse()])

        const preselectedId =
          location.state?.preselectedCourseId ??
          (nextValid.length === 1 ? courseKey(nextValid[0]) : null)

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
    if (phase !== 'select-course' || !hasSavedProfile || !validCoursesKey) {
      setOpenPods([])
      return undefined
    }

    let cancelled = false
    setIsLoadingOpenPods(true)

    fetchOpenPodsForCourses(validCourses)
      .then((pods) => {
        if (!cancelled) setOpenPods(pods)
      })
      .catch(() => {
        if (!cancelled) setOpenPods([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOpenPods(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- validCoursesKey tracks course identity
  }, [phase, hasSavedProfile, validCoursesKey])

  useEffect(() => {
    if (isComplete && phase === 'searching') {
      const timeout = window.setTimeout(() => setPhase('found'), 400)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [isComplete, phase])

  useEffect(() => {
    if (!selectedCourseId && validCourses.length === 1) {
      setSelectedCourseId(courseKey(validCourses[0]))
    }
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
      <PageShell>
        {!isProfileReady && !profileError ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Matching"
              title="Find your study group"
              description="Join an open pod for your courses, or search to get matched if none have space."
            />
            {showOnboardingPrompt ? (
              <CompleteStudyPreferencesBanner returnTo={ROUTES.FIND_GROUPS} />
            ) : null}

            {!showOnboardingPrompt ? (
              <OpenCoursePodsPanel
                pods={openPods}
                isLoading={isLoadingOpenPods}
                canJoin={hasSavedProfile}
              />
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
      </PageShell>
    )
  }

  const statusMessage = error
  const openGroupCount = courseGroups.filter((group) => (group.openSlots ?? 0) > 0).length
  const totalOpenSlots = courseGroups.reduce((sum, group) => sum + (group.openSlots ?? 0), 0)

  return (
    <PageShell>
      <PageHeader
        eyebrow={courseLabel ? `Searching · ${courseLabel}` : 'Searching'}
        title="Finding your study group"
        description={
          courseLabel
            ? `Scanning students in ${courseLabel} for schedule, learning style, and preference fit.`
            : 'Matching classmates by course and study preferences.'
        }
      />
      {courseGroups.length > 0 ? (
        <div className="-mt-2 mb-4 space-y-3">
          <p className="text-sm text-muted">
            {openGroupCount > 0
              ? `${openGroupCount} open group${openGroupCount === 1 ? '' : 's'} · ${totalOpenSlots} slot${totalOpenSlots === 1 ? '' : 's'}`
              : `${courseGroups.length} existing group${courseGroups.length === 1 ? '' : 's'} found`}
          </p>
          {openGroupCount > 0 ? (
            <OpenCoursePodsPanel
              pods={courseGroups.map((group) => ({
                ...group,
                courseLabel: courseLabel ?? group.courseLabel,
              }))}
              canJoin={hasSavedProfile}
            />
          ) : null}
        </div>
      ) : null}

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
          <Button variant="secondary" onClick={handleCheckAgain}>
            Check again
          </Button>
        )}
        <Button variant="secondary" onClick={handleChangeCourse}>
          Change course
        </Button>
      </div>
    </PageShell>
  )
}
