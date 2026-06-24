import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { getMatchingPayload } from '@/services/onboardingProfileService'
import { courseToGroupId } from '@/utils/onboarding'
import {
  getMatchingErrorMessage,
  isNoEnrolledStudentsError,
} from '@/utils/matchingErrors'

export { getMatchingErrorMessage, isNoEnrolledStudentsError }

export function buildMatchingRequest(overrides = {}) {
  const payload = getMatchingPayload()

  return {
    course: overrides.course ?? payload.course,
    learningStyle: overrides.learningStyle ?? payload.learningStyle,
    availability: overrides.availability ?? payload.availability,
    studyPreferences: overrides.studyPreferences ?? payload.studyPreferences,
  }
}

export function getCourseCode(course) {
  if (!course) return null
  if (typeof course === 'string') return course
  return courseToGroupId(course)
}

export function validateMatchingRequest(request = {}) {
  const course = request.course
  if (!course?.subject?.trim() || !course?.courseNumber?.trim()) {
    return 'Select a course in onboarding before finding a study group.'
  }
  return null
}

export async function startMatching(overrides = {}) {
  const body = buildMatchingRequest(overrides)
  const validationError = validateMatchingRequest(body)
  if (validationError) {
    const error = new Error(validationError)
    error.code = 'VALIDATION_ERROR'
    throw error
  }

  const { data } = await apiClient.post(endpoints.matching.findGroup, {
    course: {
      subject: body.course.subject.trim(),
      courseNumber: body.course.courseNumber.trim(),
    },
    learningStyle: body.learningStyle,
    availability: body.availability ?? [],
    studyPreferences: body.studyPreferences,
  })

  return data
}

export async function fetchMatchingJob(jobId) {
  const { data } = await apiClient.get(endpoints.matching.job(jobId))
  return data
}

export async function fetchCourseGroups(course) {
  const courseCode = getCourseCode(course)
  if (!courseCode) {
    return { courseCode: null, groups: [] }
  }

  const { data } = await apiClient.get(endpoints.matching.byCourse(encodeURIComponent(courseCode)))
  return data
}

export function isMatchingWaiting(response) {
  return response?.status === 'waiting' || Boolean(response?.waiting)
}

export function isMatchingComplete(response) {
  return response?.status === 'completed' && Boolean(response?.match)
}

export function isMatchingFailed(response) {
  return response?.status === 'failed'
}
