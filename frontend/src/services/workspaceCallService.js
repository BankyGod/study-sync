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

const DEFAULT_PROVIDER = 'livekit'

function pickString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

/**
 * Normalize StudySync call payloads for LiveKit.
 * Backend contract (no API keys in the frontend):
 *   call.id, call.provider === "livekit", call.url, call.token, call.livekitConfigured
 */
export function normalizeCall(payload) {
  if (!payload) return null

  const call = payload.call ?? payload.activeCall ?? payload
  if (!call || typeof call !== 'object') return null

  const id = call.id ?? call.callId
  if (!id) return null

  const provider = pickString(call.provider, payload.provider) || DEFAULT_PROVIDER

  // Prefer call.url / call.token from the nested call object; also accept top-level.
  const url = pickString(call.url, payload.url)
  const token = pickString(call.token, payload.token)

  const livekitConfigured =
    call.livekitConfigured === true || payload.livekitConfigured === true

  return {
    id,
    title: call.title ?? call.name ?? 'Pod video call',
    status: call.status ?? 'active',
    provider,
    roomName: pickString(call.roomName, call.room, payload.roomName),
    url,
    token,
    livekitConfigured,
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
      url: part.url || merged.url,
      token: part.token || merged.token,
      roomName: part.roomName || merged.roomName,
      provider: part.provider || merged.provider,
      title: part.title || merged.title,
      livekitConfigured: part.livekitConfigured || merged.livekitConfigured,
      raw: { ...(merged.raw ?? {}), ...(part.raw ?? {}) },
    }
  }, null)
}

/** Ready to connect in-app via LiveKitRoom (never open browser/Jitsi links). */
export function canJoinLiveKit(call) {
  return (
    call?.provider === 'livekit' &&
    call?.livekitConfigured === true &&
    Boolean(call?.token && call?.url)
  )
}

export function getLiveKitConnectError(call) {
  if (!call) return 'No active call.'
  if (call.provider && call.provider !== 'livekit') {
    return `Unsupported call provider "${call.provider}". Expected livekit.`
  }
  if (call.livekitConfigured !== true) {
    return 'LiveKit is not configured on the backend (livekitConfigured !== true). Redeploy with LIVEKIT_* env vars.'
  }
  if (!call.token || !call.url) {
    return 'Missing LiveKit url/token. Call start or join must return call.url and call.token.'
  }
  return null
}

export async function loadActiveCall(groupId) {
  const data = await fetchActiveWorkspaceCall(groupId)
  return normalizeCall(data)
}

export async function createPodCall(groupId, { title, provider = DEFAULT_PROVIDER } = {}) {
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
