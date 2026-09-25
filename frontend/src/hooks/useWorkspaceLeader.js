import { useAuth } from '@/hooks/useAuth'
import { useWorkspace } from '@/context/WorkspaceContext'
import { isCurrentUserLeader } from '@/utils/groupMembers'

/** Current user's pod-leader status for the active workspace. */
export function useWorkspaceLeader() {
  const { user } = useAuth()
  const { leaderId, members } = useWorkspace()
  const isLeader = isCurrentUserLeader(user?.id, { leaderId, members })
  return { isLeader, leaderId, userId: user?.id ?? null }
}
