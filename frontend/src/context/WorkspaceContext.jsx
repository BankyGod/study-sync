import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchWorkspace, saveWorkspaceAnnouncement } from '@/services/workspaceService'
import { getStoredUser } from '@/services/authService'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { buildStudyGroupTitle, courseToGroupId } from '@/utils/onboarding'
import { getActiveMatchingCourse } from '@/services/onboardingProfileService'
import { DEV_BYPASS_AUTH, DEV_MOCK_USER, STORAGE_KEYS } from '@/utils/constants'

const WorkspaceContext = createContext(null)

function normalizeAnnouncement(value) {
  if (!value) return null
  if (typeof value === 'string') return value.trim() ? { text: value.trim() } : null
  const text = String(value.text ?? value.message ?? '').trim()
  if (!text) return null
  return { ...value, text }
}

function readLocalAnnouncements() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GROUP_ANNOUNCEMENTS) ?? '{}')
  } catch {
    return {}
  }
}

function writeLocalAnnouncement(groupId, announcement) {
  const all = readLocalAnnouncements()
  if (announcement) all[groupId] = announcement
  else delete all[groupId]
  localStorage.setItem(STORAGE_KEYS.GROUP_ANNOUNCEMENTS, JSON.stringify(all))
}

const groupTitles = {}

function resolveGroupTitle(groupId, apiTitle) {
  if (apiTitle) return apiTitle
  if (groupTitles[groupId]) return groupTitles[groupId]

  const activeCourse = getActiveMatchingCourse()
  if (activeCourse && courseToGroupId(activeCourse) === groupId) {
    return buildStudyGroupTitle(activeCourse)
  }

  const parts = groupId.split('-')
  if (parts.length >= 2) {
    const courseNumber = parts[parts.length - 1]
    const subject = parts
      .slice(0, -1)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    return `${subject} ${courseNumber.toUpperCase()} Study Group`
  }

  return `Study Group · ${groupId}`
}

export function WorkspaceProvider({ groupId, children }) {
  const [workspace, setWorkspace] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchWorkspace(groupId)
        if (!cancelled) {
          setWorkspace(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(getWorkspaceErrorMessage(err, 'Unable to load workspace.'))
          setWorkspace({
            groupId,
            title: resolveGroupTitle(groupId),
            members: [],
          })
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

  const announcement = useMemo(() => {
    if (DEV_BYPASS_AUTH) {
      return normalizeAnnouncement(workspace?.announcement ?? readLocalAnnouncements()[groupId])
    }
    return normalizeAnnouncement(workspace?.announcement)
  }, [groupId, workspace])

  const saveAnnouncement = useCallback(
    async (text) => {
      const trimmed = String(text ?? '').trim()
      let next = null

      if (DEV_BYPASS_AUTH) {
        const user = getStoredUser() ?? DEV_MOCK_USER
        next = trimmed
          ? {
              text: trimmed,
              updatedAt: new Date().toISOString(),
              author: { id: user.id, name: user.name },
            }
          : null
        writeLocalAnnouncement(groupId, next)
      } else {
        next = normalizeAnnouncement(await saveWorkspaceAnnouncement(groupId, trimmed))
      }

      setWorkspace((prev) => ({ ...(prev ?? { groupId }), announcement: next }))
      return next
    },
    [groupId],
  )

  const value = useMemo(
    () => ({
      groupId,
      title: resolveGroupTitle(groupId, workspace?.title),
      courseLabel: workspace?.courseLabel ?? '',
      members: workspace?.members ?? [],
      leader: workspace?.leader ?? null,
      leaderId: workspace?.leaderId ?? null,
      announcement,
      saveAnnouncement,
      setWorkspace,
      isLoading,
      error,
      refresh: async () => {
        const data = await fetchWorkspace(groupId)
        setWorkspace(data)
        return data
      },
    }),
    [groupId, workspace, announcement, saveAnnouncement, isLoading, error],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}

export function useWorkspaceMember(senderId) {
  const { members } = useWorkspace()
  return members.find((member) => member.id === senderId) ?? null
}
