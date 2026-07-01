import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { courseToGroupId } from '@/utils/onboarding'
import {
  getMatchingErrorMessage,
  isNoEnrolledStudentsError,
} from '@/utils/matchingErrors'

export { getMatchingErrorMessage, isNoEnrolledStudentsError }

export function buildMatchingRequest(overrides = {}) {
  return {
    course: overrides.course ?? null,
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
    return 'Select a course before searching for a study group.'
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

export function isMatchingRunning(response) {
  return (
    response?.status === 'running' ||
    response?.status === 'pending' ||
    (Boolean(response?.jobId) && !isMatchingComplete(response) && !isMatchingFailed(response))
  )
}

export function isMatchingFailed(response) {
  return response?.status === 'failed'
}
