import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  canJoinLiveKit,
  createPodCall,
  endPodCall,
  getLiveKitConnectError,
  joinPodCall,
  leavePodCall,
  loadActiveCall,
  mergeCallState,
} from '@/services/workspaceCallService'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { useWebSocket } from '@/hooks/useWebSocket'
import { DEV_BYPASS_AUTH } from '@/utils/constants'

const WorkspaceCallContext = createContext(null)

export function WorkspaceCallProvider({ groupId, children }) {
  const [activeCall, setActiveCall] = useState(null)
  const [isCallOpen, setIsCallOpen] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  /** LiveKit Room.disconnect — registered by VideoCallPanel */
  const disconnectRoomRef = useRef(null)

  const registerRoomDisconnect = useCallback((disconnectFn) => {
    disconnectRoomRef.current = typeof disconnectFn === 'function' ? disconnectFn : null
  }, [])

  const disconnectLiveKit = useCallback(() => {
    try {
      disconnectRoomRef.current?.()
    } catch {
      // ignore disconnect errors after leave/end
    }
    disconnectRoomRef.current = null
  }, [])

  const refreshActiveCall = useCallback(async () => {
    if (DEV_BYPASS_AUTH) {
      setActiveCall(null)
      setIsLoading(false)
      return null
    }

    try {
      const call = await loadActiveCall(groupId)
      setActiveCall((previous) => {
        if (!call) return null
        // Keep this user's join token/url if active poll omits them.
        return mergeCallState(previous, call)
      })
      if (!call) {
        setIsCallOpen(false)
        setIsJoined(false)
        disconnectLiveKit()
      }
      setError('')
      return call
    } catch (loadError) {
      setError(getWorkspaceErrorMessage(loadError, 'Unable to load active call.'))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [disconnectLiveKit, groupId])

  useEffect(() => {
    setIsLoading(true)
    setIsCallOpen(false)
    setIsJoined(false)
    disconnectLiveKit()
    refreshActiveCall()
  }, [disconnectLiveKit, refreshActiveCall])

  const socketHandlers = useMemo(
    () => ({
      onMessageNew: (payload) => {
        const type = payload?.message?.type
        if (type === 'call' || type === 'call.started' || payload?.call) {
          refreshActiveCall()
        }
      },
      onCallStarted: () => refreshActiveCall(),
      onCallEnded: () => {
        disconnectLiveKit()
        setActiveCall(null)
        setIsCallOpen(false)
        setIsJoined(false)
      },
      onCallUpdated: () => refreshActiveCall(),
    }),
    [disconnectLiveKit, refreshActiveCall],
  )

  useWebSocket(DEV_BYPASS_AUTH ? null : groupId, socketHandlers)

  const startOrJoinCall = useCallback(
    async ({ title } = {}) => {
      setIsBusy(true)
      setError('')
      try {
        let call = await loadActiveCall(groupId)

        if (!call) {
          try {
            // Starter: POST /calls with provider livekit — use returned call.url + call.token.
            call = await createPodCall(groupId, { title, provider: 'livekit' })
          } catch (startError) {
            if (startError?.response?.status === 409) {
              call = await loadActiveCall(groupId)
            } else {
              throw startError
            }
          }

          if (call && canJoinLiveKit(call)) {
            setActiveCall(call)
            setIsJoined(true)
            setIsCallOpen(true)
            return call
          }
        }

        if (!call?.id) {
          throw new Error('No active call available.')
        }

        // Joiners (and starters without credentials): POST .../calls/:id/join
        // Each user gets their own token.
        const joined = await joinPodCall(groupId, call.id)
        const nextCall = mergeCallState(call, joined, {
          provider: joined?.provider || call.provider || 'livekit',
        })

        const connectError = getLiveKitConnectError(nextCall)
        if (connectError) {
          throw new Error(connectError)
        }

        setActiveCall(nextCall)
        setIsJoined(true)
        setIsCallOpen(true)
        return nextCall
      } catch (callError) {
        const message = getWorkspaceErrorMessage(callError, 'Unable to start or join the call.')
        setError(message)
        throw callError
      } finally {
        setIsBusy(false)
      }
    },
    [groupId],
  )

  const leaveCall = useCallback(async () => {
    if (!activeCall?.id) {
      disconnectLiveKit()
      setIsCallOpen(false)
      setIsJoined(false)
      return
    }
    setIsBusy(true)
    try {
      await leavePodCall(groupId, activeCall.id)
      disconnectLiveKit()
      setIsCallOpen(false)
      setIsJoined(false)
      await refreshActiveCall()
    } catch (leaveError) {
      setError(getWorkspaceErrorMessage(leaveError, 'Unable to leave the call.'))
    } finally {
      setIsBusy(false)
    }
  }, [activeCall, disconnectLiveKit, groupId, refreshActiveCall])

  const endCall = useCallback(async () => {
    if (!activeCall?.id) return
    if (!window.confirm('End the video call for everyone in this pod?')) return

    setIsBusy(true)
    try {
      await endPodCall(groupId, activeCall.id)
      disconnectLiveKit()
      setActiveCall(null)
      setIsCallOpen(false)
      setIsJoined(false)
    } catch (endError) {
      setError(getWorkspaceErrorMessage(endError, 'Unable to end the call.'))
    } finally {
      setIsBusy(false)
    }
  }, [activeCall, disconnectLiveKit, groupId])

  const openCallPanel = useCallback(() => {
    if (canJoinLiveKit(activeCall)) {
      setIsCallOpen(true)
      return
    }
    return startOrJoinCall()
  }, [activeCall, startOrJoinCall])

  const closeCallPanel = useCallback(() => {
    setIsCallOpen(false)
  }, [])

  const value = {
    activeCall,
    isCallOpen,
    isJoined,
    isLoading,
    isBusy,
    error,
    refreshActiveCall,
    startOrJoinCall,
    leaveCall,
    endCall,
    openCallPanel,
    closeCallPanel,
    registerRoomDisconnect,
  }

  return (
    <WorkspaceCallContext.Provider value={value}>{children}</WorkspaceCallContext.Provider>
  )
}

export function useWorkspaceCall() {
  const context = useContext(WorkspaceCallContext)
  if (!context) {
    throw new Error('useWorkspaceCall must be used within WorkspaceCallProvider')
  }
  return context
}
