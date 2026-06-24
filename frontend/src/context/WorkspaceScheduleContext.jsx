import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  addGroupSession,
  loadGroupSessions,
  toScheduleListItem,
} from '@/services/scheduleSessionService'

const WorkspaceScheduleContext = createContext(null)

export function WorkspaceScheduleProvider({ groupId, children }) {
  const [sessions, setSessions] = useState([])
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const reloadSessions = useCallback(async () => {
    const nextSessions = await loadGroupSessions(groupId)
    setSessions(nextSessions)
    return nextSessions
  }, [groupId])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setIsScheduleModalOpen(false)
      try {
        const nextSessions = await loadGroupSessions(groupId)
        if (!cancelled) {
          setSessions(nextSessions)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [groupId])

  const openScheduleModal = useCallback(() => setIsScheduleModalOpen(true), [])
  const closeScheduleModal = useCallback(() => setIsScheduleModalOpen(false), [])

  const scheduleSession = useCallback(
    async (sessionInput) => {
      await addGroupSession(groupId, sessionInput)
      await reloadSessions()
    },
    [groupId, reloadSessions],
  )

  const listItems = useMemo(() => sessions.map(toScheduleListItem), [sessions])

  const value = {
    sessions,
    listItems,
    isLoading,
    isScheduleModalOpen,
    openScheduleModal,
    closeScheduleModal,
    scheduleSession,
    reloadSessions,
  }

  return (
    <WorkspaceScheduleContext.Provider value={value}>
      {children}
    </WorkspaceScheduleContext.Provider>
  )
}

export function useWorkspaceSchedule() {
  const context = useContext(WorkspaceScheduleContext)
  if (!context) {
    throw new Error('useWorkspaceSchedule must be used within WorkspaceScheduleProvider')
  }
  return context
}
