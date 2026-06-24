import { STORAGE_KEYS } from '@/utils/constants'
import {
  formatCourseName,
  getPrimaryCourse,
  getValidCourses,
} from '@/utils/onboarding'

export function saveOnboardingProfile(profile) {
  const payload = {
    ...profile,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_PROFILE, JSON.stringify(payload))

  const primaryCourse = getPrimaryCourse(profile.courses)
  if (primaryCourse) {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_MATCHING_COURSE,
      JSON.stringify(primaryCourse),
    )
  }

  return payload
}

export function loadOnboardingProfile() {
  const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING_PROFILE)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getActiveMatchingCourse() {
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_MATCHING_COURSE)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      // fall through to profile
    }
  }

  const profile = loadOnboardingProfile()
  return getPrimaryCourse(profile?.courses ?? [])
}

export function getActiveCourseLabel() {
  const course = getActiveMatchingCourse()
  return course ? formatCourseName(course) : null
}

export function getMatchingPayload() {
  const profile = loadOnboardingProfile()
  const course = getActiveMatchingCourse()

  return {
    course,
    courseLabel: course ? formatCourseName(course) : null,
    courses: getValidCourses(profile?.courses ?? []),
    learningStyle: profile?.learningStyle ?? null,
    availability: profile?.availability ?? [],
    studyPreferences: profile?.studyPreferences ?? null,
  }
}
