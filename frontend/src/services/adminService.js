import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { getApiErrorMessage } from '@/utils/apiErrors'

export { getApiErrorMessage as getAdminErrorMessage }

/**
 * Admin API — real Mongo data via /api/admin/*
 * Seed / demo accounts are filtered out on the client.
 */

function asList(payload, keys = []) {
  if (Array.isArray(payload)) return payload
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  return []
}

function displayName(person) {
  const fullName = [person?.firstName, person?.lastName].filter(Boolean).join(' ')
  return String(person?.name ?? person?.fullName ?? fullName ?? person?.email ?? '').trim()
}

/** Seeded staging users: Student N + @studysync.local (and explicit demo flags). */
export function isDemoOrSeedUser(person) {
  if (!person || typeof person !== 'object') return false
  if (person.isDemo === true || person.demo === true || person.seeded === true) return true

  const email = String(person.email ?? '').trim().toLowerCase()
  if (email.endsWith('@studysync.local')) return true
  if (/^student\d+@/.test(email)) return true

  const name = displayName(person)
  if (/^student\s*\d+$/i.test(name)) return true

  const studentId = String(person.studentId ?? person.schoolId ?? '').trim().toLowerCase()
  if (/^seed[-_]?/i.test(studentId) || /^demo[-_]?/i.test(studentId)) return true

  return false
}

export function filterRealUsers(list = []) {
  return list.filter((person) => !isDemoOrSeedUser(person))
}

function isDemoOrSeedGroup(group) {
  if (!group || typeof group !== 'object') return false
  if (group.isDemo === true || group.demo === true || group.seeded === true) return true
  const title = String(group.name ?? group.title ?? '').toLowerCase()
  if (title.includes('demo') || title.includes('seed')) return true
  const id = String(group.id ?? group.groupId ?? '').toLowerCase()
  if (id === 'demo' || id.startsWith('demo-') || id.startsWith('seed-')) return true
  return false
}

export async function fetchAdminDashboard() {
  const { data } = await apiClient.get(endpoints.admin.dashboard)
  const summary = data?.summary ?? {}

  return {
    summary: {
      students: Number(summary.students) || 0,
      pods: Number(summary.pods) || 0,
      cohorts: Number(summary.cohorts) || 0,
      matched: Number(summary.matched) || 0,
    },
    overview: data?.overview ?? null,
    engagement: data?.engagement ?? null,
    recentActivity: data?.recentActivity ?? null,
    stats: [
      { label: 'Students', value: Number(summary.students) || 0 },
      { label: 'Pods', value: Number(summary.pods) || 0 },
      { label: 'Cohorts', value: Number(summary.cohorts) || 0 },
      { label: 'Matched', value: Number(summary.matched) || 0 },
    ],
    raw: data,
  }
}

/** @deprecated Prefer fetchAdminDashboard */
export async function fetchAdminOverview() {
  return fetchAdminDashboard()
}

export async function fetchAdminCohorts() {
  const { data } = await apiClient.get(endpoints.admin.cohorts)
  return asList(data, ['cohorts', 'data'])
}

export async function createAdminCohort(payload) {
  const { data } = await apiClient.post(endpoints.admin.cohorts, {
    name: payload.name,
    term: payload.term,
  })
  return data?.cohort ?? data
}

export async function fetchAdminGroups(params = {}) {
  const { data } = await apiClient.get(endpoints.admin.groups, { params })
  const groups = asList(data, ['groups', 'data', 'pods'])
    .filter((group) => !isDemoOrSeedGroup(group))
    .map((group) => {
      const members = group.members ?? group.students ?? group.users
      if (!Array.isArray(members)) return group
      const realMembers = filterRealUsers(members)
      return {
        ...group,
        members: realMembers,
        students: group.students ? realMembers : group.students,
        users: group.users ? realMembers : group.users,
        memberCount: realMembers.length,
      }
    })

  return { groups, raw: data }
}

export async function fetchAdminStudents(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value != null && String(value).trim() !== ''),
  )
  const { data } = await apiClient.get(endpoints.admin.students, { params: clean })
  const all = asList(data, ['students', 'data', 'users'])
  const students = filterRealUsers(all)
  const removed = all.length - students.length
  const apiTotal = data?.total ?? data?.count ?? null
  const total =
    typeof apiTotal === 'number' ? Math.max(0, apiTotal - removed) : students.length

  return {
    students,
    page: data?.page ?? 1,
    total,
    totalPages: data?.totalPages ?? null,
    filteredDemoCount: removed,
    raw: data,
  }
}
