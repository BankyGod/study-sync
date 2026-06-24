import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { LearningStyleStep } from '@/components/onboarding/steps/LearningStyleStep'
import { AvailabilityStep } from '@/components/onboarding/steps/AvailabilityStep'
import { CoursesStep } from '@/components/onboarding/steps/CoursesStep'
import { PreferencesStep } from '@/components/onboarding/steps/PreferencesStep'
import {
  DEFAULT_AVAILABILITY,
  DEFAULT_COURSES,
  DEFAULT_STUDY_PREFERENCES,
  ONBOARDING_STEPS,
} from '@/utils/onboarding'
import { ROUTES } from '@/utils/constants'
import { saveOnboardingProfile } from '@/services/onboardingProfileService'

function hasValidCourses(courses) {
  return courses.some((entry) => entry.subject.trim() && entry.courseNumber.trim())
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [preferences, setPreferences] = useState({
    learningStyle: 'visual',
    availability: DEFAULT_AVAILABILITY,
    courses: DEFAULT_COURSES,
    studyPreferences: DEFAULT_STUDY_PREFERENCES,
  })

  const currentStep = ONBOARDING_STEPS[stepIndex]
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1

  const handleContinue = () => {
    if (isLastStep) {
      saveOnboardingProfile(preferences)
      navigate(ROUTES.FIND_GROUPS, { state: { fromOnboarding: true } })
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

  const continueLabel = isLastStep ? 'Continue to sync' : 'Continue'

  return (
    <OnboardingLayout
      currentStep={stepIndex}
      onBack={handleBack}
      onContinue={handleContinue}
      canGoBack={stepIndex > 0}
      canContinue={canContinue()}
      continueLabel={continueLabel}
      wide={currentStep.id === 'preferences'}
      gradientContinue={isLastStep}
    >
      {renderStep()}
    </OnboardingLayout>
  )
}
