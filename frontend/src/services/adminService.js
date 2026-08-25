import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { getApiErrorMessage } from '@/utils/apiErrors'

export { getApiErrorMessage as getAdminErrorMessage }

/**
 * Admin API (instructor only) — matches docs/BACKEND_API_SPEC.md §15:
 * GET/POST /admin/cohorts, POST /admin/seed, POST /admin/matching/run,
 * GET /admin/groups, GET /admin/students
 */

function asList(payload, keys = []) {
  if (Array.isArray(payload)) return payload
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  return []
}

function asNumber(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value)
  }
  if (Array.isArray(value)) return value.length
  if (value && typeof value === 'object') {
    if (typeof value.total === 'number') return value.total
    if (typeof value.count === 'number') return value.count
  }
  return fallback
}

export async function fetchAdminCohorts() {
  const { data } = await apiClient.get(endpoints.admin.cohorts)
  return asList(data, ['cohorts', 'items', 'data'])
}

export async function createAdminCohort(payload) {
  const { data } = await apiClient.post(endpoints.admin.cohorts, payload)
  return data?.cohort ?? data
}

export async function seedAdminCohort(payload) {
  const { data } = await apiClient.post(endpoints.admin.seedData, payload)
  return data
}

export async function runAdminMatching(payload = {}) {
  const { data } = await apiClient.post(endpoints.admin.runMatching, payload)
  return data
}

export async function fetchAdminGroups(params = {}) {
  const { data } = await apiClient.get(endpoints.admin.groups, { params })
  return {
    groups: asList(data, ['groups', 'items', 'data', 'pods']),
    raw: data,
  }
}

export async function fetchAdminStudents(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value != null && String(value).trim() !== ''),
  )
  const { data } = await apiClient.get(endpoints.admin.students, { params: clean })
  return {
    students: asList(data, ['students', 'items', 'data', 'users']),
    page: data?.page ?? 1,
    total: data?.total ?? data?.count ?? null,
    raw: data,
  }
}

/** Build overview KPIs from the three list endpoints (no /admin/dashboard in the API). */
export async function fetchAdminOverview() {
  const [cohorts, groupsResult, studentsResult] = await Promise.all([
    fetchAdminCohorts(),
    fetchAdminGroups(),
    fetchAdminStudents({ page: 1 }),
  ])

  const groups = groupsResult.groups
  const students = studentsResult.students
  const matchedFromStudents = students.filter(
    (s) => s.groupId || s.group?.id || s.groupName || s.assignedGroupId,
  ).length

  const studentTotal =
    typeof studentsResult.total === 'number'
      ? studentsResult.total
      : cohorts.reduce((sum, c) => sum + asNumber(c.studentCount ?? c.students), 0) ||
        students.length

  const groupTotal =
    groups.length ||
    cohorts.reduce((sum, c) => sum + asNumber(c.groupCount ?? c.groups), 0)

  const matchedTotal =
    matchedFromStudents ||
    groups.reduce(
      (sum, g) => sum + asNumber(g.memberCount ?? g.members?.length ?? g.students?.length),
      0,
    )

  return {
    cohorts,
    groups,
    students,
    stats: [
      { label: 'Students', value: studentTotal },
      { label: 'Pods', value: groupTotal },
      { label: 'Cohorts', value: cohorts.length },
      { label: 'Matched', value: matchedTotal },
    ],
  }
}
