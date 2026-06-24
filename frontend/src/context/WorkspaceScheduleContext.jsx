import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  addGroupSession,
  loadGroupSessions,
  toScheduleListItem,
} from '@/services/scheduleSessionService'

const WorkspaceScheduleContext = createContext(null)

export function WorkspaceScheduleProvider({ groupId, children }) {
  const [sessions, setSessions] = useState(() => loadGroupSessions(groupId))
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  useEffect(() => {
    setSessions(loadGroupSessions(groupId))
    setIsScheduleModalOpen(false)
  }, [groupId])

  const openScheduleModal = useCallback(() => setIsScheduleModalOpen(true), [])
  const closeScheduleModal = useCallback(() => setIsScheduleModalOpen(false), [])

  const scheduleSession = useCallback(
    (sessionInput) => {
      const saved = addGroupSession(groupId, sessionInput)
      setSessions(loadGroupSessions(groupId))
      return saved
    },
    [groupId],
  )

  const listItems = useMemo(() => sessions.map(toScheduleListItem), [sessions])

  const value = {
    sessions,
    listItems,
    isScheduleModalOpen,
    openScheduleModal,
    closeScheduleModal,
    scheduleSession,
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
