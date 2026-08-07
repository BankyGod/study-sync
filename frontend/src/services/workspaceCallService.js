import {
  endWorkspaceCall,
  fetchActiveWorkspaceCall,
  fetchWorkspaceCall,
  joinWorkspaceCall,
  leaveWorkspaceCall,
  startWorkspaceCall,
} from '@/services/workspaceService'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'

export { getWorkspaceErrorMessage }

export function normalizeCall(payload) {
  if (!payload) return null

  const call = payload.call ?? payload.activeCall ?? payload
  if (!call || typeof call !== 'object') return null

  const id = call.id ?? call.callId
  if (!id) return null

  const roomUrl =
    call.roomUrl ??
    call.joinUrl ??
    call.url ??
    call.jitsiUrl ??
    call.meetingUrl ??
    payload.roomUrl ??
    payload.joinUrl ??
    null

  return {
    id,
    title: call.title ?? call.name ?? 'Pod video call',
    status: call.status ?? 'active',
    roomUrl,
    startedAt: call.startedAt ?? call.createdAt ?? null,
    startedBy: call.startedBy ?? call.createdBy ?? null,
    participantCount: call.participantCount ?? call.participants?.length ?? null,
    raw: call,
  }
}

export function getCallJoinUrl(call) {
  return call?.roomUrl ?? null
}

export async function loadActiveCall(groupId) {
  const data = await fetchActiveWorkspaceCall(groupId)
  return normalizeCall(data)
}

export async function createPodCall(groupId, { title } = {}) {
  const data = await startWorkspaceCall(groupId, { title })
  return normalizeCall(data)
}

export async function loadCall(groupId, callId) {
  const data = await fetchWorkspaceCall(groupId, callId)
  return normalizeCall(data)
}

export async function joinPodCall(groupId, callId) {
  const data = await joinWorkspaceCall(groupId, callId)
  return normalizeCall(data)
}

export async function leavePodCall(groupId, callId) {
  const data = await leaveWorkspaceCall(groupId, callId)
  return normalizeCall(data)
}

export async function endPodCall(groupId, callId) {
  const data = await endWorkspaceCall(groupId, callId)
  return normalizeCall(data)
}

export function openCallInNewTab(call) {
  const url = getCallJoinUrl(call)
  if (!url) {
    throw new Error('This call does not include a join link yet.')
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
