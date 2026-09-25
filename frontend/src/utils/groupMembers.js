/**
 * Group membership helpers — entity role on group_members (member | leader).
 */

export const MEMBER_ROLES = {
  MEMBER: 'member',
  LEADER: 'leader',
}

export function normalizeMemberRole(role) {
  const value = typeof role === 'string' ? role.trim().toLowerCase() : ''
  if (value === MEMBER_ROLES.LEADER || value === 'group_leader' || value === 'admin') {
    return MEMBER_ROLES.LEADER
  }
  return MEMBER_ROLES.MEMBER
}

export function isGroupLeader(member) {
  if (!member) return false
  if (member.isLeader === true) return true
  return normalizeMemberRole(member.role) === MEMBER_ROLES.LEADER
}

function displayName(person) {
  const fullName = [person?.firstName, person?.lastName].filter(Boolean).join(' ')
  return String(person?.name ?? person?.fullName ?? fullName ?? person?.email ?? 'Member').trim()
}

/**
 * Normalize workspace/admin member lists and resolve the group leader.
 * Prefer explicit leaderId / role from API; otherwise leave leader unset.
 */
export function normalizeGroupMembers(members = [], group = {}) {
  const list = Array.isArray(members) ? members : []
  const leaderId =
    group?.leaderId ??
    group?.leader_id ??
    group?.leaderUserId ??
    group?.leader?.id ??
    group?.leader?.userId ??
    null

  const normalized = list.map((raw, index) => {
    const id = raw?.id ?? raw?.userId ?? raw?.user_id ?? `member-${index}`
    const roleFromApi = raw?.role ?? raw?.memberRole ?? raw?.member_role
    const matchedLeader =
      leaderId != null && String(id) === String(leaderId)
    const role = normalizeMemberRole(
      matchedLeader || raw?.isLeader === true ? MEMBER_ROLES.LEADER : roleFromApi,
    )

    return {
      ...raw,
      id,
      name: displayName(raw),
      email: raw?.email ?? '',
      initials: raw?.initials ?? null,
      color: raw?.color ?? raw?.avatarColor ?? raw?.avatar_color ?? 'bg-sky-700',
      avatarUrl: raw?.avatarUrl ?? raw?.avatar_url ?? null,
      role,
      isLeader: role === MEMBER_ROLES.LEADER,
      joinedAt: raw?.joinedAt ?? raw?.joined_at ?? null,
    }
  })

  // If API sent multiple leaders, keep the first as canonical.
  let seenLeader = false
  return normalized.map((member) => {
    if (!member.isLeader) return member
    if (seenLeader) {
      return { ...member, role: MEMBER_ROLES.MEMBER, isLeader: false }
    }
    seenLeader = true
    return member
  })
}

export function getGroupLeader(members = []) {
  return normalizeGroupMembers(members).find((member) => member.isLeader) ?? null
}

export function withTransferredLeader(members = [], nextLeaderId) {
  return normalizeGroupMembers(members).map((member) => {
    const isLeader = String(member.id) === String(nextLeaderId)
    return {
      ...member,
      role: isLeader ? MEMBER_ROLES.LEADER : MEMBER_ROLES.MEMBER,
      isLeader,
    }
  })
}
