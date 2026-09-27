import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  addGroupSession,
  editGroupSession,
  loadGroupSessions,
  removeGroupSession,
  toScheduleListItem,
} from '@/services/scheduleSessionService'

const WorkspaceScheduleContext = createContext(null)

export function WorkspaceScheduleProvider({ groupId, children }) {
  const [sessions, setSessions] = useState([])
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
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
      setEditingSession(null)
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

  const openScheduleModal = useCallback(() => {
    setEditingSession(null)
    setIsScheduleModalOpen(true)
  }, [])

  const openEditSessionModal = useCallback((session) => {
    setEditingSession(session)
    setIsScheduleModalOpen(true)
  }, [])

  const closeScheduleModal = useCallback(() => {
    setIsScheduleModalOpen(false)
    setEditingSession(null)
  }, [])

  const scheduleSession = useCallback(
    async (sessionInput) => {
      await addGroupSession(groupId, sessionInput)
      await reloadSessions()
    },
    [groupId, reloadSessions],
  )

  const updateSession = useCallback(
    async (sessionId, patch) => {
      await editGroupSession(groupId, sessionId, patch)
      await reloadSessions()
    },
    [groupId, reloadSessions],
  )

  const deleteSession = useCallback(
    async (sessionId) => {
      await removeGroupSession(groupId, sessionId)
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
    editingSession,
    openScheduleModal,
    openEditSessionModal,
    closeScheduleModal,
    scheduleSession,
    updateSession,
    deleteSession,
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
