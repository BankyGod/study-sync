import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchWorkspace } from '@/services/workspaceService'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'
import { buildStudyGroupTitle, courseToGroupId } from '@/utils/onboarding'
import { getActiveMatchingCourse } from '@/services/onboardingProfileService'

const WorkspaceContext = createContext(null)

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

  const value = useMemo(
    () => ({
      groupId,
      title: resolveGroupTitle(groupId, workspace?.title),
      courseLabel: workspace?.courseLabel ?? '',
      members: workspace?.members ?? [],
      isLoading,
      error,
    }),
    [groupId, workspace, isLoading, error],
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
