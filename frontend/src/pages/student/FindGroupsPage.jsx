import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { OrbitAnimation } from '@/components/find-groups/OrbitAnimation'
import { MatchingProgress } from '@/components/find-groups/MatchingProgress'
import { MatchFoundView } from '@/components/find-groups/MatchFoundView'
import { CourseSelectPanel, courseKey } from '@/components/find-groups/CourseSelectPanel'
import { OpenCoursePodsPanel } from '@/components/find-groups/OpenCoursePodsPanel'
import { CreatePodPrompt } from '@/components/find-groups/CreatePodPrompt'
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
import {
  canCreatePodForCourse,
  fetchCourseGroups,
  fetchOpenPodsForCourses,
  getCourseCode,
  getOpenPods,
} from '@/services/matchingService'
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
  const [selectedCourseGroups, setSelectedCourseGroups] = useState([])
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

  const selectedValidCourse = useMemo(
    () => validCourses.find((item) => courseKey(item) === selectedCourseId) ?? null,
    [validCourses, selectedCourseId],
  )

  const openGroupsForSearch = useMemo(() => getOpenPods(courseGroups), [courseGroups])
  const canCreateForSearch = canCreatePodForCourse(courseGroups)

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

  // Load all pods (including full) for the selected course so we can offer create safely.
  useEffect(() => {
    if (phase !== 'select-course' || !hasSavedProfile || !selectedValidCourse) {
      setSelectedCourseGroups([])
      return undefined
    }

    let cancelled = false
    fetchCourseGroups(selectedValidCourse)
      .then((data) => {
        if (!cancelled) setSelectedCourseGroups(data?.groups ?? [])
      })
      .catch(() => {
        if (!cancelled) setSelectedCourseGroups([])
      })

    return () => {
      cancelled = true
    }
  }, [phase, hasSavedProfile, selectedValidCourse])

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

      const label = formatCourseName(course)
      setSelectedCourse({
        subject: course.subject.trim(),
        courseNumber: course.courseNumber.trim(),
      })
      setCourseLabel(label)

      let groups = []
      try {
        const courseData = await fetchCourseGroups(course)
        groups = courseData?.groups ?? []
        setCourseGroups(groups)
      } catch {
        groups = []
        setCourseGroups([])
      }

      // If an open pod already exists, show join UI first — do not create a duplicate.
      if (getOpenPods(groups).length > 0) {
        setPhase('browse')
        reset()
        return
      }

      setPhase('searching')
      reset()
      setRunKey((key) => key + 1)
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
        const groups = courseData?.groups ?? []
        setCourseGroups(groups)
        if (getOpenPods(groups).length > 0) {
          setPhase('browse')
        }
      } catch {
        setCourseGroups([])
      }
    }
  }

  const handleOpenPodsFound = (groups) => {
    if (!groups?.length) return
    setCourseGroups((prev) => {
      const byId = new Map(prev.map((g) => [g.groupId, g]))
      for (const group of groups) {
        byId.set(group.groupId, group)
      }
      return [...byId.values()]
    })
    setOpenPods((prev) => {
      const byId = new Map(prev.map((g) => [g.groupId, g]))
      for (const group of groups) {
        byId.set(group.groupId, { ...group, courseLabel: group.courseLabel ?? courseLabel })
      }
      return [...byId.values()]
    })
    setPhase('browse')
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

    const selectedCode = selectedValidCourse ? getCourseCode(selectedValidCourse) : null
    const openForSelected = selectedCode
      ? openPods.filter(
          (pod) =>
            pod.courseCode === selectedCode ||
            (pod.subject &&
              pod.courseNumber &&
              getCourseCode({ subject: pod.subject, courseNumber: pod.courseNumber }) ===
                selectedCode),
        )
      : []
    const showCreateForSelected =
      Boolean(selectedValidCourse) &&
      hasSavedProfile &&
      !isLoadingOpenPods &&
      canCreatePodForCourse(selectedCourseGroups)

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
              description="Join an open pod when one has seats. If none exist — or all are full — create the next numbered pod for that course."
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

            {!showOnboardingPrompt && showCreateForSelected && openForSelected.length === 0 ? (
              <CreatePodPrompt
                course={{
                  subject: selectedValidCourse.subject.trim(),
                  courseNumber: selectedValidCourse.courseNumber.trim(),
                }}
                courseLabel={formatCourseName(selectedValidCourse)}
                existingGroups={selectedCourseGroups}
                canCreate={hasSavedProfile}
                onOpenPodsFound={handleOpenPodsFound}
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

  if (phase === 'browse') {
    return (
      <PageShell>
        <PageHeader
          eyebrow={courseLabel ? `Available · ${courseLabel}` : 'Available pods'}
          title="Open pods found"
          description="Join a pod with free seats. A new pod for this course can only be created when every existing one is full."
          actions={
            <Button variant="secondary" onClick={handleChangeCourse}>
              Change course
            </Button>
          }
        />
        <OpenCoursePodsPanel
          pods={openGroupsForSearch.map((group) => ({
            ...group,
            courseLabel: courseLabel ?? group.courseLabel,
          }))}
          canJoin={hasSavedProfile}
          createCourse={selectedCourse}
          createCourseLabel={courseLabel}
          createExistingGroups={courseGroups}
          onOpenPodsFound={handleOpenPodsFound}
        />
      </PageShell>
    )
  }

  const statusMessage = error
  const openGroupCount = openGroupsForSearch.length
  const totalOpenSlots = openGroupsForSearch.reduce(
    (sum, group) => sum + (group.openSlots ?? 0),
    0,
  )
  const showCreatePrompt =
    Boolean(selectedCourse) && canCreateForSearch && (isWaitingForPeers || courseGroups.length === 0 || openGroupCount === 0)

  return (
    <PageShell>
      <PageHeader
        eyebrow={courseLabel ? `Searching · ${courseLabel}` : 'Searching'}
        title="Finding your study group"
        description={
          courseLabel
            ? `Looking for open pods in ${courseLabel}. If none exist, you can create one.`
            : 'Matching classmates by course and study preferences.'
        }
      />
      {courseGroups.length > 0 ? (
        <div className="-mt-2 mb-4 space-y-3">
          <p className="text-sm text-muted">
            {openGroupCount > 0
              ? `${openGroupCount} open group${openGroupCount === 1 ? '' : 's'} · ${totalOpenSlots} slot${totalOpenSlots === 1 ? '' : 's'}`
              : `${courseGroups.length} existing group${courseGroups.length === 1 ? '' : 's'} — all full`}
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

      {showCreatePrompt ? (
        <div className="mb-6">
          <CreatePodPrompt
            course={selectedCourse}
            courseLabel={courseLabel}
            existingGroups={courseGroups}
            canCreate={hasSavedProfile}
            onOpenPodsFound={handleOpenPodsFound}
          />
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
              Or create a pod for {courseLabel ?? 'this course'} so others can join when they search.
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
        <OrbitAnimation paused={Boolean(statusMessage) || showCreatePrompt} />
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
