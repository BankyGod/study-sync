import { Crown, Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { SessionTimerCard } from '@/components/workspace/SessionTimerCard'
import { MemberAvatarButton } from '@/components/workspace/MemberAvatarButton'
import { Button } from '@/components/common/Button'
import { useMemberProfile } from '@/context/MemberProfileContext'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useWorkspaceSchedule } from '@/context/WorkspaceScheduleContext'

function getWorkspaceView(pathname) {
  if (pathname.includes('/files')) return 'files'
  if (pathname.includes('/chat')) return 'chat'
  if (pathname.includes('/calendar')) return 'calendar'
  return 'board'
}

export function WorkspaceRightPanel() {
  const location = useLocation()
  const view = getWorkspaceView(location.pathname)
  const { members } = useWorkspace()
  const { avatarVersion } = useAuth()
  const { openMemberProfile } = useMemberProfile()
  const { openScheduleModal } = useWorkspaceSchedule()

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-6 border-l border-border pl-6 xl:flex">
      <SessionTimerCard />

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-ink">Members</h3>
          <span className="text-xs text-muted">{members.length}</span>
        </div>

        {members.length === 0 ? (
          <p className="text-sm text-muted">No members loaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => openMemberProfile(member.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-page"
                >
                  <MemberAvatarButton
                    member={member}
                    size="md"
                    refreshKey={avatarVersion}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {member.name}
                  </span>
                  {member.isLeader ? (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-700">
                      <Crown className="h-3 w-3" />
                      Leader
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {view === 'calendar' ? (
        <Button variant="primary" size="md" className="w-full" onClick={openScheduleModal}>
          <Plus className="h-4 w-4" />
          Schedule session
        </Button>
      ) : null}
    </aside>
  )
}
