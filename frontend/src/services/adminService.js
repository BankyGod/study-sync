import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { getApiErrorMessage } from '@/utils/apiErrors'

export { getApiErrorMessage as getAdminErrorMessage }

function asList(payload, keys = []) {
  if (Array.isArray(payload)) return payload
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  return []
}

export async function fetchAdminDashboard() {
  const { data } = await apiClient.get(endpoints.admin.dashboard)
  return data
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
    groups: asList(data, ['groups', 'items', 'data']),
    raw: data,
  }
}

export async function fetchAdminGroup(groupId) {
  const { data } = await apiClient.get(endpoints.admin.group(groupId))
  return data?.group ?? data
}

export async function fetchAdminStudents(params = {}) {
  const { data } = await apiClient.get(endpoints.admin.students, { params })
  return {
    students: asList(data, ['students', 'items', 'data']),
    page: data?.page ?? 1,
    total: data?.total ?? data?.count ?? null,
    raw: data,
  }
}

export async function fetchAdminStudent(userId) {
  const { data } = await apiClient.get(endpoints.admin.student(userId))
  return data?.student ?? data
}

export async function fetchAdminReport(name, params = {}) {
  const path = endpoints.admin.reports?.[name]
  if (!path) throw new Error(`Unknown report: ${name}`)
  const { data } = await apiClient.get(path, { params })
  return data
}

function asDisplayValue(value, fallback = '—') {
  if (value == null) return fallback
  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
    return value
  }
  if (Array.isArray(value)) return value.length
  if (typeof value === 'object') {
    if (typeof value.total === 'number' || typeof value.total === 'string') return value.total
    if (typeof value.count === 'number' || typeof value.count === 'string') return value.count
    if (typeof value.value === 'number' || typeof value.value === 'string') return value.value
    if (Array.isArray(value.memberships)) return value.memberships.length
    if (Array.isArray(value.items)) return value.items.length
  }
  return fallback
}

export function getDashboardStats(dashboard) {
  const overview = dashboard?.overview ?? dashboard?.totals ?? dashboard ?? {}
  return [
    {
      label: 'Students',
      value: asDisplayValue(
        overview.students ?? overview.studentCount ?? overview.totalStudents,
      ),
    },
    {
      label: 'Pods',
      value: asDisplayValue(
        overview.groups ?? overview.pods ?? overview.groupCount ?? overview.totalGroups,
      ),
    },
    {
      label: 'Cohorts',
      value: asDisplayValue(
        overview.cohorts ?? overview.cohortCount ?? overview.totalCohorts,
      ),
    },
    {
      label: 'Matched',
      value: asDisplayValue(
        overview.matchedStudents ??
          overview.studentsMatched ??
          overview.matched ??
          overview.activeSessions ??
          overview.memberships,
      ),
    },
  ]
}
