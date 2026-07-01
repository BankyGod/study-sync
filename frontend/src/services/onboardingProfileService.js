import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { DEV_BYPASS_AUTH, STORAGE_KEYS } from '@/utils/constants'
import {
  DEFAULT_AVAILABILITY,
  DEFAULT_COURSES,
  DEFAULT_STUDY_PREFERENCES,
  formatCourseName,
  getPrimaryCourse,
  getValidCourses,
} from '@/utils/onboarding'

let cachedProfile = null

export const DEFAULT_ONBOARDING_PROFILE = {
  learningStyle: 'visual',
  availability: DEFAULT_AVAILABILITY,
  courses: DEFAULT_COURSES,
  studyPreferences: DEFAULT_STUDY_PREFERENCES,
}

export function normalizeOnboardingProfile(profile = {}) {
  const validCourses = getValidCourses(profile.courses ?? []).map((course, index) => ({
    id: course.id || String(index + 1),
    subject: course.subject.trim(),
    courseNumber: course.courseNumber.trim(),
  }))

  return {
    learningStyle: profile.learningStyle,
    availability: (profile.availability ?? []).slice(0, 5),
    courses: validCourses,
    studyPreferences: {
      groupSize: profile.studyPreferences?.groupSize ?? DEFAULT_STUDY_PREFERENCES.groupSize,
      timeCommitment:
        profile.studyPreferences?.timeCommitment ?? DEFAULT_STUDY_PREFERENCES.timeCommitment,
      difficulty: profile.studyPreferences?.difficulty ?? DEFAULT_STUDY_PREFERENCES.difficulty,
    },
  }
}

export function getOnboardingErrorMessage(error) {
  const apiError = error?.response?.data?.error
  if (apiError?.details?.length) {
    return apiError.details.map((item) => item.message).join(' ')
  }
  return apiError?.message || 'Unable to save your onboarding profile. Please try again.'
}

export async function saveOnboardingProfile(profile) {
  const payload = normalizeOnboardingProfile(profile)

  if (!payload.learningStyle) {
    throw new Error('Select a learning style.')
  }
  if (!payload.availability.length) {
    throw new Error('Select at least one availability slot.')
  }
  if (!payload.courses.length) {
    throw new Error('Add at least one course with a subject and course number.')
  }

  if (DEV_BYPASS_AUTH) {
    const saved = { ...payload, savedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_PROFILE, JSON.stringify(saved))
    cachedProfile = saved
    return saved
  }

  const { data } = await apiClient.post(endpoints.onboarding.profile, payload)
  cachedProfile = data
  return data
}

export async function loadOnboardingProfile() {
  if (DEV_BYPASS_AUTH) {
    const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING_PROFILE)
    if (!raw) return null
    try {
      cachedProfile = JSON.parse(raw)
      return cachedProfile
    } catch {
      return null
    }
  }

  try {
    const { data } = await apiClient.get(endpoints.onboarding.profile)
    cachedProfile = data
    return data
  } catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}

export function isOnboardingProfileSaved(profile) {
  return Boolean(profile)
}

export async function hasOnboardingProfile() {
  const profile = await loadOnboardingProfile()
  return isOnboardingProfileSaved(profile) && getValidCourses(profile.courses).length > 0
}

export function getActiveMatchingCourse() {
  return getPrimaryCourse(cachedProfile?.courses ?? [])
}

export function getActiveCourseLabel() {
  const course = getActiveMatchingCourse()
  return course ? formatCourseName(course) : null
}

export function getMatchingPayload() {
  const course = getActiveMatchingCourse()

  return {
    course,
    courseLabel: course ? formatCourseName(course) : null,
    courses: getValidCourses(cachedProfile?.courses ?? []),
    learningStyle: cachedProfile?.learningStyle ?? null,
    availability: cachedProfile?.availability ?? [],
    studyPreferences: cachedProfile?.studyPreferences ?? null,
  }
}

export function setCachedOnboardingProfile(profile) {
  cachedProfile = profile
}

export function mergeOnboardingProfile(profile) {
  if (!profile) return { ...DEFAULT_ONBOARDING_PROFILE }
  return {
    learningStyle: profile.learningStyle ?? DEFAULT_ONBOARDING_PROFILE.learningStyle,
    availability: profile.availability?.length
      ? profile.availability
      : DEFAULT_ONBOARDING_PROFILE.availability,
    courses: profile.courses?.length ? profile.courses : DEFAULT_ONBOARDING_PROFILE.courses,
    studyPreferences: profile.studyPreferences ?? DEFAULT_ONBOARDING_PROFILE.studyPreferences,
  }
}
