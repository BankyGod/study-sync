import { Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { SessionTimerCard } from '@/components/workspace/SessionTimerCard'
import { MemberAvatarButton } from '@/components/workspace/MemberAvatarButton'
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

  const panelConfig = {
    board: {
      membersTitle: 'Pod Members',
      showRoles: false,
      action: { type: 'plan', label: 'Generate a Study Plan' },
    },
    files: {
      membersTitle: 'Group Members',
      showRoles: false,
      action: { type: 'invite', label: 'Invite to Group' },
    },
    calendar: {
      membersTitle: "Who's in this pod",
      showRoles: false,
      action: { type: 'schedule', label: 'Schedule a Session' },
    },
    chat: {
      membersTitle: 'Pod Members',
      showRoles: false,
      action: { type: 'plan', label: 'Generate a Study Plan' },
    },
  }

  const config = panelConfig[view]

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-5 xl:flex">
      <SessionTimerCard />

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">{config.membersTitle}</h3>
        {members.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No members loaded yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {members.map((member) => (
              <li key={member.id} className="flex items-center gap-3">
                <MemberAvatarButton
                  member={member}
                  size="lg"
                  refreshKey={avatarVersion}
                  onClick={() => openMemberProfile(member.id)}
                />
                <button
                  type="button"
                  onClick={() => openMemberProfile(member.id)}
                  className="min-w-0 text-left transition hover:text-violet-700"
                >
                  <p className="text-sm font-medium text-slate-700">{member.name}</p>
                  {config.showRoles && member.role && (
                    <p className="text-xs text-slate-400">{member.role}</p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {config.action.type === 'plan' && (
        <button
          type="button"
          className="w-full rounded-xl bg-teal-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600"
        >
          {config.action.label}
        </button>
      )}

      {(config.action.type === 'invite' || config.action.type === 'schedule') && (
        <button
          type="button"
          onClick={config.action.type === 'schedule' ? openScheduleModal : undefined}
          className="session-start-btn inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {config.action.label}
        </button>
      )}
    </aside>
  )
}
