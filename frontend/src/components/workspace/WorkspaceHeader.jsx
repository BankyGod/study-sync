import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, LogOut, Video } from 'lucide-react'
import { MemberAvatarButton } from '@/components/workspace/MemberAvatarButton'
import { SessionTimerCard } from '@/components/workspace/SessionTimerCard'
import { ActiveCallBanner } from '@/components/workspace/ActiveCallBanner'
import { useAuth } from '@/hooks/useAuth'
import { useMemberProfile } from '@/context/MemberProfileContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useWorkspaceCall } from '@/context/WorkspaceCallContext'
import { leaveStudyGroup } from '@/services/matchingService'
import { getMatchingErrorMessage } from '@/utils/matchingErrors'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/utils/constants'

const subtitles = {
  board: 'Tasks and progress for this pod',
  files: 'Shared resources and attachments',
  chat: 'Group conversation',
  calendar: 'Sessions and study times',
}

export function WorkspaceHeader({ title, courseLabel }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { groupId } = useParams()
  const { members } = useWorkspace()
  const { avatarVersion } = useAuth()
  const { openMemberProfile } = useMemberProfile()
  const { activeCall, isBusy, startOrJoinCall } = useWorkspaceCall()
  const [isLeaving, setIsLeaving] = useState(false)

  const view = location.pathname.includes('/files')
    ? 'files'
    : location.pathname.includes('/chat')
      ? 'chat'
      : location.pathname.includes('/calendar')
        ? 'calendar'
        : 'board'

  const handleLeavePod = async () => {
    if (!groupId) return
    if (
      !window.confirm(
        'Leave this study pod? You can search again later if there is still space.',
      )
    ) {
      return
    }

    setIsLeaving(true)
    try {
      await leaveStudyGroup(groupId)
      navigate(ROUTES.WORKSPACE_LIST)
    } catch (error) {
      window.alert(getMatchingErrorMessage(error) || 'Unable to leave this pod.')
    } finally {
      setIsLeaving(false)
    }
  }

  return (
    <header
      className={cn(
        'shrink-0 border-b border-border pb-4',
        view === 'chat' ? 'mb-0' : 'mb-4 sm:mb-5',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          to={ROUTES.WORKSPACE_LIST}
          className="inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All pods
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => startOrJoinCall({ title: `${title || 'Pod'} study call` })}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition hover:bg-page disabled:opacity-60"
          >
            <Video className="h-3.5 w-3.5" />
            {activeCall ? 'Join call' : 'Start call'}
          </button>
          <button
            type="button"
            disabled={isLeaving}
            onClick={handleLeavePod}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted transition hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
            aria-label="Leave pod"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isLeaving ? 'Leaving…' : 'Leave'}</span>
          </button>
        </div>
      </div>

      <div className="mt-2 flex min-w-0 flex-wrap items-end justify-between gap-3 sm:mt-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {courseLabel ? `${courseLabel} · ` : ''}
            {subtitles[view]}
          </p>
        </div>
      </div>

      <ActiveCallBanner className="mt-4" />

      {view !== 'chat' ? (
        <div className="mt-4 space-y-4 xl:hidden">
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Members
              </p>
              <span className="text-xs text-muted">{members.length}</span>
            </div>
            {members.length === 0 ? (
              <p className="text-sm text-muted">No members loaded yet.</p>
            ) : (
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => openMemberProfile(member.id)}
                    className="flex min-w-[4.25rem] max-w-[5.5rem] flex-col items-center gap-1.5 rounded-lg px-1 py-1 text-center transition hover:bg-page"
                  >
                    <MemberAvatarButton
                      member={member}
                      size="md"
                      refreshKey={avatarVersion}
                    />
                    <span className="w-full truncate text-[11px] font-medium text-ink">
                      {member.name?.split(' ')[0] ?? 'Member'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <SessionTimerCard compact />
        </div>
      ) : null}
    </header>
  )
}
