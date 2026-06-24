import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { OrbitAnimation } from '@/components/find-groups/OrbitAnimation'
import { MatchingProgress } from '@/components/find-groups/MatchingProgress'
import { MatchFoundView } from '@/components/find-groups/MatchFoundView'
import { useSimulatedMatchingProgress } from '@/hooks/useSimulatedMatchingProgress'
import { getActiveCourseLabel, getMatchingPayload } from '@/services/onboardingProfileService'
import { buildStudyGroupTitle } from '@/utils/onboarding'

export function FindGroupsPage() {
  const location = useLocation()
  const [phase, setPhase] = useState('searching')
  const matchingContext = useMemo(() => getMatchingPayload(), [location.key])

  const courseLabel = matchingContext.courseLabel ?? getActiveCourseLabel()
  const groupTitle = buildStudyGroupTitle(matchingContext.course)

  const { progress, steps, isComplete, reset } = useSimulatedMatchingProgress({
    targetProgress: 100,
    active: phase === 'searching',
  })

  useEffect(() => {
    if (location.state?.fromOnboarding) {
      setPhase('searching')
      reset()
    }
  }, [location.state?.fromOnboarding, reset])

  useEffect(() => {
    if (isComplete && phase === 'searching') {
      const timeout = window.setTimeout(() => setPhase('found'), 400)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [isComplete, phase])

  const handleFindAnother = () => {
    reset()
    setPhase('searching')
  }

  if (phase === 'found') {
    return (
      <MatchFoundView
        courseLabel={courseLabel}
        groupTitle={groupTitle}
        onFindAnother={handleFindAnother}
      />
    )
  }

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
      </header>

      <OrbitAnimation />

      <div className="mt-10">
        <MatchingProgress progress={progress} steps={steps} />
      </div>
    </div>
  )
}
