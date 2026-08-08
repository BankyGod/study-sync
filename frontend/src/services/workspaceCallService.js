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

const JITSI_HOST = 'https://meet.jit.si'

function pickString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function buildJitsiUrl(roomName) {
  if (!roomName) return null
  const safeRoom = encodeURIComponent(String(roomName).replace(/\s+/g, '-'))
  return `${JITSI_HOST}/${safeRoom}`
}

export function normalizeCall(payload) {
  if (!payload) return null

  const call = payload.call ?? payload.activeCall ?? payload
  if (!call || typeof call !== 'object') return null

  const id = call.id ?? call.callId
  if (!id) return null

  const provider = pickString(call.provider, payload.provider) || 'webrtc'
  const roomName = pickString(
    call.roomName,
    call.room,
    call.jitsiRoom,
    call.meetingId,
    payload.roomName,
  )

  let roomUrl = pickString(
    call.roomUrl,
    call.joinUrl,
    call.url,
    call.jitsiUrl,
    call.meetingUrl,
    call.embedUrl,
    payload.roomUrl,
    payload.joinUrl,
  )

  if (!roomUrl && (provider === 'jitsi' || roomName)) {
    roomUrl = buildJitsiUrl(roomName || `studysync-${id}`)
  }

  return {
    id,
    title: call.title ?? call.name ?? 'Pod video call',
    status: call.status ?? 'active',
    provider,
    roomName,
    roomUrl,
    startedAt: call.startedAt ?? call.createdAt ?? null,
    startedBy: call.startedBy ?? call.createdBy ?? null,
    participantCount: call.participantCount ?? call.participants?.length ?? null,
    raw: call,
  }
}

export function mergeCallState(...parts) {
  return parts.filter(Boolean).reduce((merged, part) => {
    if (!merged) return part
    return {
      ...merged,
      ...part,
      roomUrl: part.roomUrl || merged.roomUrl,
      roomName: part.roomName || merged.roomName,
      provider: part.provider || merged.provider,
      title: part.title || merged.title,
      raw: { ...(merged.raw ?? {}), ...(part.raw ?? {}) },
    }
  }, null)
}

export function getCallJoinUrl(call) {
  return call?.roomUrl ?? null
}

export async function loadActiveCall(groupId) {
  const data = await fetchActiveWorkspaceCall(groupId)
  return normalizeCall(data)
}

export async function createPodCall(groupId, { title, provider = 'jitsi' } = {}) {
  const data = await startWorkspaceCall(groupId, { title, provider })
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

/** Fallback only — prefer the in-app VideoCallPanel. */
export function openCallInNewTab(call) {
  const url = getCallJoinUrl(call)
  if (!url) {
    throw new Error('This call does not include a join link yet.')
  }
  const opened = window.open(url, '_blank', 'noopener,noreferrer')
  if (!opened) {
    throw new Error('Popup blocked. Allow popups or use the in-app call panel.')
  }
}
