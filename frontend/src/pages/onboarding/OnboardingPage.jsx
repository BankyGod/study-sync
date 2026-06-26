import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { LearningStyleStep } from '@/components/onboarding/steps/LearningStyleStep'
import { AvailabilityStep } from '@/components/onboarding/steps/AvailabilityStep'
import { CoursesStep } from '@/components/onboarding/steps/CoursesStep'
import { PreferencesStep } from '@/components/onboarding/steps/PreferencesStep'
import { Spinner } from '@/components/common/Spinner'
import { ONBOARDING_STEPS, getValidCourses } from '@/utils/onboarding'
import { ROUTES } from '@/utils/constants'
import {
  getOnboardingErrorMessage,
  loadOnboardingProfile,
  mergeOnboardingProfile,
  saveOnboardingProfile,
  setCachedOnboardingProfile,
} from '@/services/onboardingProfileService'

function hasValidCourses(courses) {
  return courses.some((entry) => entry.subject.trim() && entry.courseNumber.trim())
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [preferences, setPreferences] = useState(mergeOnboardingProfile(null))

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')

      try {
        const profile = await loadOnboardingProfile()
        if (!cancelled && profile) {
          setCachedOnboardingProfile(profile)
          setPreferences(mergeOnboardingProfile(profile))
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getOnboardingErrorMessage(loadError))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const currentStep = ONBOARDING_STEPS[stepIndex]
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1

  const handleContinue = async () => {
    if (isLastStep) {
      setIsSaving(true)
      setError('')
      try {
        const saved = await saveOnboardingProfile(preferences)
        setCachedOnboardingProfile(saved)
        const primaryCourse = getValidCourses(saved.courses ?? [])[0]
        navigate(ROUTES.FIND_GROUPS, {
          state: {
            fromOnboarding: true,
            preselectedCourseId: primaryCourse ? primaryCourse.id : null,
          },
        })
      } catch (saveError) {
        setError(
          saveError.message?.includes('Select') || saveError.message?.includes('Add')
            ? saveError.message
            : getOnboardingErrorMessage(saveError),
        )
      } finally {
        setIsSaving(false)
      }
      return
    }
    setStepIndex((index) => index + 1)
  }

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((index) => index - 1)
  }

  const renderStep = () => {
    switch (currentStep.id) {
      case 'style':
        return (
          <LearningStyleStep
            value={preferences.learningStyle}
            onChange={(learningStyle) => setPreferences((prev) => ({ ...prev, learningStyle }))}
          />
        )
      case 'availability':
        return (
          <AvailabilityStep
            value={preferences.availability}
            onChange={(availability) => setPreferences((prev) => ({ ...prev, availability }))}
          />
        )
      case 'courses':
        return (
          <CoursesStep
            value={preferences.courses}
            onChange={(courses) => setPreferences((prev) => ({ ...prev, courses }))}
          />
        )
      case 'preferences':
        return (
          <PreferencesStep
            value={preferences.studyPreferences}
            onChange={(studyPreferences) =>
              setPreferences((prev) => ({ ...prev, studyPreferences }))
            }
          />
        )
      default:
        return null
    }
  }

  const canContinue = () => {
    if (isSaving) return false

    switch (currentStep.id) {
      case 'style':
        return Boolean(preferences.learningStyle)
      case 'availability':
        return preferences.availability.length > 0
      case 'courses':
        return hasValidCourses(preferences.courses)
      case 'preferences':
        return Boolean(
          preferences.studyPreferences.groupSize &&
            preferences.studyPreferences.timeCommitment &&
            preferences.studyPreferences.difficulty,
        )
      default:
        return true
    }
  }

  const continueLabel = isLastStep ? (isSaving ? 'Saving...' : 'Continue to sync') : 'Continue'

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <OnboardingLayout
      currentStep={stepIndex}
      onBack={handleBack}
      onContinue={handleContinue}
      canGoBack={stepIndex > 0 && !isSaving}
      canContinue={canContinue()}
      continueLabel={continueLabel}
      wide={currentStep.id === 'preferences'}
      gradientContinue={isLastStep}
    >
      {error && (
        <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {renderStep()}
    </OnboardingLayout>
  )
}
