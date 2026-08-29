import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { courseToGroupId, formatCourseName } from '@/utils/onboarding'
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

export function getOpenPods(groups = []) {
  return groups.filter((group) => (group.openSlots ?? 0) > 0)
}

/** Only create another pod when none exist or every existing pod is full. */
export function canCreatePodForCourse(groups = []) {
  return getOpenPods(groups).length === 0
}

export function nextPodNumber(groups = []) {
  const numbers = groups
    .map((group) => {
      if (typeof group.podNumber === 'number' && group.podNumber > 0) return group.podNumber
      const match = String(group.title ?? group.groupId ?? '').match(/(?:pod|group)\s*[-#]?\s*(\d+)/i)
      return match ? Number(match[1]) : null
    })
    .filter((n) => typeof n === 'number' && !Number.isNaN(n))

  if (numbers.length > 0) return Math.max(...numbers) + 1
  return groups.length + 1
}

export function formatPodTitle(courseLabel, podNumber) {
  const label = String(courseLabel || 'Study').trim()
  return `${label} · Pod ${podNumber}`
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
  const groups = normalizeCourseGroups(data)
  return {
    courseCode: data?.courseCode ?? courseCode,
    groups,
    raw: data,
  }
}

export function normalizeCourseGroups(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.groups)
      ? payload.groups
      : Array.isArray(payload?.items)
        ? payload.items
        : []

  return list
    .map((group) => {
      const groupId = group.groupId ?? group.id ?? group.slug
      if (!groupId) return null

      const memberCount = Number(group.memberCount ?? group.members?.length ?? 0) || 0
      const maxSize = Number(group.maxSize ?? group.capacity ?? group.targetSize) || null
      let openSlots = group.openSlots
      if (openSlots == null && maxSize != null) {
        openSlots = Math.max(0, maxSize - memberCount)
      }
      openSlots = Number(openSlots) || 0

      let podNumber = group.podNumber
      if (podNumber == null) {
        const match = String(group.title ?? group.name ?? groupId).match(
          /(?:pod|group)\s*[-#]?\s*(\d+)/i,
        )
        podNumber = match ? Number(match[1]) : null
      }

      return {
        groupId: String(groupId),
        title: group.title ?? group.name ?? 'Study group',
        memberCount,
        maxSize,
        openSlots,
        podNumber: typeof podNumber === 'number' && !Number.isNaN(podNumber) ? podNumber : null,
        courseCode: group.courseCode ?? payload?.courseCode ?? null,
        courseLabel: group.courseLabel ?? null,
      }
    })
    .filter(Boolean)
}

/** Load open pods across the student's enrolled courses. */
export async function fetchOpenPodsForCourses(courses = []) {
  const unique = []
  const seen = new Set()

  for (const course of courses) {
    const code = getCourseCode(course)
    if (!code || seen.has(code)) continue
    seen.add(code)
    unique.push(course)
  }

  const results = await Promise.allSettled(
    unique.map(async (course) => {
      const data = await fetchCourseGroups(course)
      const label =
        course.subject && course.courseNumber
          ? `${course.subject.trim()} ${course.courseNumber.trim()}`
          : data.courseCode
      return (data.groups ?? []).map((group) => ({
        ...group,
        courseCode: group.courseCode ?? data.courseCode,
        courseLabel: group.courseLabel ?? label,
        subject: course.subject?.trim() ?? '',
        courseNumber: course.courseNumber?.trim() ?? '',
      }))
    }),
  )

  return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
}

/**
 * Create a new course pod when none exist or all existing pods are full.
 * Backend must reject duplicates while an open pod still has seats.
 */
export async function createStudyPod(course) {
  const validationError = validateMatchingRequest({ course })
  if (validationError) {
    const error = new Error(validationError)
    error.code = 'VALIDATION_ERROR'
    throw error
  }

  const subject = course.subject.trim()
  const courseNumber = course.courseNumber.trim()
  const courseLabel = formatCourseName({ subject, courseNumber })

  // Client-side guard: never create while an open pod still has seats.
  const existing = await fetchCourseGroups({ subject, courseNumber })
  const groups = existing.groups ?? []
  if (!canCreatePodForCourse(groups)) {
    const error = new Error(
      'An open pod already exists for this course. Join it instead of creating another.',
    )
    error.code = 'OPEN_POD_EXISTS'
    error.openGroups = getOpenPods(groups)
    throw error
  }

  const podNumber = nextPodNumber(groups)
  const title = formatPodTitle(courseLabel, podNumber)

  try {
    const { data } = await apiClient.post(endpoints.matching.createGroup, {
      course: { subject, courseNumber },
      title,
      podNumber,
    })

    return {
      groupId: data?.groupId ?? data?.id ?? data?.slug,
      title: data?.title ?? title,
      courseLabel: data?.courseLabel ?? courseLabel,
      podNumber: data?.podNumber ?? podNumber,
      memberCount: data?.memberCount ?? 1,
      maxSize: data?.maxSize ?? data?.capacity ?? null,
      openSlots: data?.openSlots ?? null,
      created: true,
      raw: data,
    }
  } catch (apiError) {
    const errBody = apiError?.response?.data?.error
    if (errBody?.code === 'OPEN_POD_EXISTS' || apiError?.response?.status === 409) {
      const error = new Error(
        errBody?.message ||
          'An open pod already exists for this course. Join it instead of creating another.',
      )
      error.code = errBody?.code || 'OPEN_POD_EXISTS'
      error.openGroups = errBody?.openGroups ?? getOpenPods(groups)
      throw error
    }
    throw apiError
  }
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

export async function joinStudyGroup(groupId) {
  const { data } = await apiClient.post(endpoints.matching.joinGroup(groupId))
  return data
}

export async function leaveStudyGroup(groupId) {
  const { data } = await apiClient.delete(endpoints.matching.leaveGroup(groupId))
  return data
}
