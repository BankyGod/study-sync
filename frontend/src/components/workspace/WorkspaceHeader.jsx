import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MemberAvatarButton } from '@/components/workspace/MemberAvatarButton'
import { SessionTimerCard } from '@/components/workspace/SessionTimerCard'
import { useAuth } from '@/hooks/useAuth'
import { useMemberProfile } from '@/context/MemberProfileContext'
import { useWorkspace } from '@/context/WorkspaceContext'
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
  const { members } = useWorkspace()
  const { avatarVersion } = useAuth()
  const { openMemberProfile } = useMemberProfile()

  const view = location.pathname.includes('/files')
    ? 'files'
    : location.pathname.includes('/chat')
      ? 'chat'
      : location.pathname.includes('/calendar')
        ? 'calendar'
        : 'board'

  return (
    <header
      className={cn(
        'shrink-0 border-b border-border pb-4',
        view === 'chat' ? 'mb-0' : 'mb-4 sm:mb-5',
      )}
    >
      <Link
        to={ROUTES.WORKSPACE_LIST}
        className="inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All pods
      </Link>

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
