import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { DEV_BYPASS_AUTH } from '@/utils/constants'

const DEV_RELIABILITY = {
  score: 82,
  tasksScored: 6,
  label: 'Reliable',
  scope: 'global',
}

export function getReliabilityErrorMessage(error, fallback = 'Unable to load reliability score.') {
  const apiError = error?.response?.data?.error
  return apiError?.message || fallback
}

export function formatReliabilityDisplay(reliability) {
  if (!reliability) {
    return { score: null, subtitle: 'Reliability unavailable' }
  }

  if (reliability.score == null) {
    const needed = Math.max(0, 3 - (reliability.tasksScored ?? 0))
    return {
      score: null,
      subtitle:
        needed > 0
          ? `${reliability.tasksScored ?? 0} of 3 tasks scored`
          : 'Score pending',
    }
  }

  return {
    score: reliability.score,
    subtitle: reliability.label || 'Reliability',
  }
}

export async function fetchMyReliability(groupId) {
  if (DEV_BYPASS_AUTH) {
    return groupId
      ? { ...DEV_RELIABILITY, scope: 'group', groupId }
      : { ...DEV_RELIABILITY }
  }

  const params = groupId ? { groupId } : undefined
  const { data } = await apiClient.get(endpoints.users.myReliability, { params })
  return data
}

export async function fetchUserReliability(userId, groupId) {
  if (DEV_BYPASS_AUTH) {
    return groupId
      ? { ...DEV_RELIABILITY, score: 74, label: 'Developing', scope: 'group', groupId }
      : { ...DEV_RELIABILITY, score: 74, label: 'Developing' }
  }

  const params = groupId ? { groupId } : undefined
  const { data } = await apiClient.get(endpoints.users.reliabilityByUser(userId), { params })
  return data
}
