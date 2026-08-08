import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  createPodCall,
  endPodCall,
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

  const refreshActiveCall = useCallback(async () => {
    if (DEV_BYPASS_AUTH) {
      setActiveCall(null)
      setIsLoading(false)
      return null
    }

    try {
      const call = await loadActiveCall(groupId)
      setActiveCall((previous) => mergeCallState(previous, call))
      if (!call) {
        setIsCallOpen(false)
        setIsJoined(false)
      }
      setError('')
      return call
    } catch (loadError) {
      setError(getWorkspaceErrorMessage(loadError, 'Unable to load active call.'))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    setIsLoading(true)
    setIsCallOpen(false)
    setIsJoined(false)
    refreshActiveCall()
  }, [refreshActiveCall])

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
        setActiveCall(null)
        setIsCallOpen(false)
        setIsJoined(false)
      },
      onCallUpdated: () => refreshActiveCall(),
    }),
    [refreshActiveCall],
  )

  useWebSocket(DEV_BYPASS_AUTH ? null : groupId, socketHandlers)

  const startOrJoinCall = useCallback(
    async ({ title } = {}) => {
      setIsBusy(true)
      setError('')
      try {
        let call = activeCall
        if (!call) {
          try {
            call = await createPodCall(groupId, { title, provider: 'jitsi' })
          } catch (startError) {
            if (startError?.response?.status === 409) {
              call = await loadActiveCall(groupId)
            } else {
              throw startError
            }
          }
        }

        if (!call?.id) {
          throw new Error('No active call available.')
        }

        const joined = await joinPodCall(groupId, call.id)
        const nextCall = mergeCallState(call, joined, {
          roomUrl:
            joined?.roomUrl ||
            call.roomUrl ||
            (call.id ? `https://meet.jit.si/studysync-${call.id}` : null),
          provider: joined?.provider || call.provider || 'jitsi',
        })

        if (!nextCall.roomUrl) {
          throw new Error('Call started, but no meeting room URL was returned.')
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
    [activeCall, groupId],
  )

  const leaveCall = useCallback(async () => {
    if (!activeCall?.id) {
      setIsCallOpen(false)
      setIsJoined(false)
      return
    }
    setIsBusy(true)
    try {
      await leavePodCall(groupId, activeCall.id)
      setIsCallOpen(false)
      setIsJoined(false)
      await refreshActiveCall()
    } catch (leaveError) {
      setError(getWorkspaceErrorMessage(leaveError, 'Unable to leave the call.'))
    } finally {
      setIsBusy(false)
    }
  }, [activeCall, groupId, refreshActiveCall])

  const endCall = useCallback(async () => {
    if (!activeCall?.id) return
    if (!window.confirm('End the video call for everyone in this pod?')) return

    setIsBusy(true)
    try {
      await endPodCall(groupId, activeCall.id)
      setActiveCall(null)
      setIsCallOpen(false)
      setIsJoined(false)
    } catch (endError) {
      setError(getWorkspaceErrorMessage(endError, 'Unable to end the call.'))
    } finally {
      setIsBusy(false)
    }
  }, [activeCall, groupId])

  const openCallPanel = useCallback(() => {
    if (activeCall?.roomUrl) {
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
