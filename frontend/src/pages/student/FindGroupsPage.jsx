import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { OrbitAnimation } from '@/components/find-groups/OrbitAnimation'
import { MatchingProgress } from '@/components/find-groups/MatchingProgress'
import { MatchFoundView } from '@/components/find-groups/MatchFoundView'
import { useMatchingProgress } from '@/hooks/useMatchingProgress'
import { Spinner } from '@/components/common/Spinner'
import {
  getActiveCourseLabel,
  getActiveMatchingCourse,
  loadOnboardingProfile,
  setCachedOnboardingProfile,
} from '@/services/onboardingProfileService'
import { fetchCourseGroups } from '@/services/matchingService'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/cn'

export function FindGroupsPage() {
  const location = useLocation()
  const [phase, setPhase] = useState('searching')
  const [runKey, setRunKey] = useState(0)
  const [courseLabel, setCourseLabel] = useState(null)
  const [courseGroups, setCourseGroups] = useState([])
  const [isProfileReady, setIsProfileReady] = useState(false)
  const [profileError, setProfileError] = useState('')

  const { progress, steps, match, error, isWaitingForPeers, isComplete, reset } =
    useMatchingProgress({
      active: phase === 'searching',
      profileReady: isProfileReady,
      runKey,
    })

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setIsProfileReady(false)
      setProfileError('')

      try {
        const profile = await loadOnboardingProfile()
        if (cancelled) return

        if (profile) {
          setCachedOnboardingProfile(profile)
          setCourseLabel(getActiveCourseLabel())
          setIsProfileReady(true)

          const activeCourse = getActiveMatchingCourse()
          if (activeCourse) {
            try {
              const courseData = await fetchCourseGroups(activeCourse)
              if (!cancelled) {
                setCourseGroups(courseData?.groups ?? [])
              }
            } catch {
              if (!cancelled) {
                setCourseGroups([])
              }
            }
          }
        } else {
          setProfileError('Complete onboarding and select a course before finding a study group.')
        }
      } catch {
        if (!cancelled) {
          setProfileError('Unable to load your onboarding profile. Please try again.')
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (location.state?.fromOnboarding) {
      setPhase('searching')
      reset()
      setRunKey((key) => key + 1)
    }
  }, [location.state?.fromOnboarding, reset])

  useEffect(() => {
    if (isComplete && phase === 'searching') {
      const timeout = window.setTimeout(() => setPhase('found'), 400)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [isComplete, phase])

  const handleFindAnother = async () => {
    reset()
    setPhase('searching')
    setRunKey((key) => key + 1)

    const activeCourse = getActiveMatchingCourse()
    if (activeCourse) {
      try {
        const courseData = await fetchCourseGroups(activeCourse)
        setCourseGroups(courseData?.groups ?? [])
      } catch {
        setCourseGroups([])
      }
    }
  }

  const openGroupCount = courseGroups.filter((group) => (group.openSlots ?? 0) > 0).length
  const totalOpenSlots = courseGroups.reduce((sum, group) => sum + (group.openSlots ?? 0), 0)

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

  const statusMessage = profileError || error

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        {courseLabel && (
          <p className="mb-3 inline-flex rounded-full bg-violet-50 px-4 py-1.5 text-sm font-semibold text-violet-700">
            Matching for {courseLabel}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Finding Your Perfect Study Group
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500">
          {courseLabel
            ? `We're scanning students enrolled in ${courseLabel} to build a pod that fits your schedule, learning style, and study preferences.`
            : 'Our smart algorithm is searching for the perfect match for your learning style and goals.'}
        </p>
        {isProfileReady && courseGroups.length > 0 && (
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500">
            {openGroupCount > 0
              ? `${openGroupCount} group${openGroupCount === 1 ? '' : 's'} with ${totalOpenSlots} open slot${totalOpenSlots === 1 ? '' : 's'} in ${courseLabel}.`
              : `${courseGroups.length} existing group${courseGroups.length === 1 ? '' : 's'} in ${courseLabel} — we're looking for the best fit.`}
          </p>
        )}
      </header>

      {!isProfileReady && !profileError && (
        <div className="mb-6 flex justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {statusMessage && (
        <div
          className={cn(
            'mb-6 rounded-xl border px-4 py-3 text-center text-sm',
            isWaitingForPeers || profileError
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
          {profileError && (
            <Link
              to={ROUTES.ONBOARDING}
              className="mt-3 inline-flex text-sm font-semibold text-violet-700 hover:text-violet-800"
            >
              Go to onboarding
            </Link>
          )}
        </div>
      )}

      <OrbitAnimation paused={Boolean(statusMessage)} />

      <div className="mt-10">
        <MatchingProgress progress={progress} steps={steps} />
      </div>

      {isWaitingForPeers && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleFindAnother}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Check again
          </button>
        </div>
      )}
    </div>
  )
}
