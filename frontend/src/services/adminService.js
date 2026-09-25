import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { normalizeGroupMembers } from '@/utils/groupMembers'

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

export async function assignAdminGroupLeader(groupId, userId) {
  const body = { userId, leaderId: userId }
  try {
    const { data } = await apiClient.put(endpoints.admin.groupLeader(groupId), body)
    return data?.group ?? data
  } catch (error) {
    if (error?.response?.status !== 404 && error?.response?.status !== 405) {
      throw error
    }
    const { data } = await apiClient.patch(endpoints.admin.groupLeader(groupId), body)
    return data?.group ?? data
  }
}

function groupTitle(group) {
  return group?.name ?? group?.title ?? `Pod ${String(group?.id ?? '').slice(0, 8)}`
}

function groupCourse(group) {
  return (
    group?.courseCode ??
    group?.course?.code ??
    [group?.subject, group?.courseNumber].filter(Boolean).join(' ')
  )
}

/**
 * Assemble printable admin report from existing admin endpoints.
 * Falls back gracefully when dedicated /admin/reports is unavailable.
 */
export async function fetchAdminReportBundle() {
  try {
    const { data } = await apiClient.get(endpoints.admin.reports)
    if (data) {
      return {
        source: 'api',
        generatedAt: data.generatedAt ?? new Date().toISOString(),
        summary: data.summary ?? {},
        cohorts: asList(data, ['cohorts']),
        groups: asList(data, ['groups', 'pods']),
        students: filterRealUsers(asList(data, ['students', 'users'])),
        taskProgress: asList(data, ['taskProgress', 'progress']),
        raw: data,
      }
    }
  } catch (error) {
    if (error?.response?.status !== 404) {
      // continue to compose from existing endpoints
    }
  }

  const [dashboard, cohorts, groupsResult, studentsResult] = await Promise.all([
    fetchAdminDashboard().catch(() => null),
    fetchAdminCohorts().catch(() => []),
    fetchAdminGroups().catch(() => ({ groups: [] })),
    fetchAdminStudents().catch(() => ({ students: [] })),
  ])

  const groups = (groupsResult.groups ?? []).map((group) => {
    const members = normalizeAdminMembers(group)
    const leader = members.find((m) => m.isLeader) ?? null
    const progress = Number(group.progress ?? group.completionPercent ?? 0) || 0
    return {
      id: group.id ?? group.groupId,
      title: groupTitle(group),
      course: groupCourse(group),
      cohortId: group.cohortId ?? group.cohort_id ?? null,
      cohortName: group.cohortName ?? null,
      memberCount: members.length || group.memberCount || 0,
      members,
      leader,
      progress,
      hasLeader: Boolean(leader),
    }
  })

  const students = studentsResult.students ?? []
  const podsWithoutLeader = groups.filter((g) => !g.hasLeader).length
  const avgProgress =
    groups.length === 0
      ? 0
      : Math.round(groups.reduce((sum, g) => sum + g.progress, 0) / groups.length)

  return {
    source: 'composed',
    generatedAt: new Date().toISOString(),
    summary: {
      students: dashboard?.summary?.students ?? students.length,
      pods: dashboard?.summary?.pods ?? groups.length,
      cohorts: dashboard?.summary?.cohorts ?? cohorts.length,
      matched: dashboard?.summary?.matched ?? groups.reduce((n, g) => n + g.memberCount, 0),
      podsWithoutLeader,
      avgProgress,
    },
    cohorts,
    groups,
    students,
    taskProgress: groups.map((group) => ({
      groupId: group.id,
      title: group.title,
      course: group.course,
      progress: group.progress,
      memberCount: group.memberCount,
      leaderName: group.leader?.name ?? 'Unassigned',
    })),
    raw: { dashboard, cohorts, groups: groupsResult, students: studentsResult },
  }
}

function normalizeAdminMembers(group) {
  const members = group.members ?? group.students ?? group.users ?? []
  return normalizeGroupMembers(members, group)
}

export async function fetchAdminTaskProgress() {
  try {
    const { data } = await apiClient.get(endpoints.admin.taskProgress)
    if (data) {
      return {
        source: 'api',
        items: asList(data, ['items', 'groups', 'progress', 'data']),
        summary: data.summary ?? {},
        raw: data,
      }
    }
  } catch (error) {
    if (error?.response?.status !== 404) {
      // fall through
    }
  }

  const report = await fetchAdminReportBundle()
  return {
    source: 'composed',
    items: report.taskProgress,
    summary: {
      pods: report.summary.pods,
      avgProgress: report.summary.avgProgress,
      podsWithoutLeader: report.summary.podsWithoutLeader,
    },
    raw: report,
  }
}

export function downloadCsv(filename, rows) {
  if (!rows?.length) return
  const headers = Object.keys(rows[0])
  const escape = (value) => {
    const text = value == null ? '' : String(value)
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
    return text
  }
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((key) => escape(row[key])).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
