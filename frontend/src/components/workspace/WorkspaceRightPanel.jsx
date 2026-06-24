import { Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { SessionTimerCard } from '@/components/workspace/SessionTimerCard'
import { cn } from '@/utils/cn'

const boardMembers = [
  { id: '1', name: 'Alex', initials: 'A', color: 'bg-sky-500', online: true },
  { id: '2', name: 'Sarah', initials: 'S', color: 'bg-violet-500', online: true },
  { id: '3', name: 'Mike P.', initials: 'M', color: 'bg-emerald-500', online: false },
  { id: '4', name: 'Emma J.', initials: 'E', color: 'bg-amber-500', online: false },
]

const groupMembers = [
  { id: '1', name: 'Alex', initials: 'A', color: 'bg-sky-500', role: 'Admin', online: true },
  { id: '2', name: 'Jordan', initials: 'J', color: 'bg-violet-500', role: 'Member', online: true },
  { id: '3', name: 'Mia P.', initials: 'M', color: 'bg-emerald-500', role: 'Member', online: false },
  { id: '4', name: 'Taylor', initials: 'T', color: 'bg-amber-500', role: 'Member', online: false },
]

const schedulerMembers = [
  { id: '1', name: 'Abe', initials: 'A', color: 'bg-sky-500', role: 'Admin', online: true },
  { id: '2', name: 'Isabella', initials: 'I', color: 'bg-violet-500', role: 'Tutor', online: true },
  { id: '3', name: 'Marcus', initials: 'M', color: 'bg-emerald-500', role: 'Member', online: false },
  { id: '4', name: 'Zaynab', initials: 'Z', color: 'bg-amber-500', role: 'Member', online: false },
]

function getWorkspaceView(pathname) {
  if (pathname.includes('/files')) return 'files'
  if (pathname.includes('/chat')) return 'chat'
  if (pathname.includes('/calendar')) return 'calendar'
  return 'board'
}

export function WorkspaceRightPanel() {
  const location = useLocation()
  const view = getWorkspaceView(location.pathname)

  const panelConfig = {
    board: {
      members: boardMembers,
      membersTitle: 'Members Online',
      showRoles: false,
      action: { type: 'plan', label: 'Generate a Study Plan' },
    },
    files: {
      members: groupMembers,
      membersTitle: 'Group Members',
      showRoles: true,
      action: { type: 'invite', label: 'Invite to Group' },
    },
    calendar: {
      members: schedulerMembers,
      membersTitle: "Who's online",
      showRoles: true,
      action: { type: 'schedule', label: 'Schedule a Session' },
    },
    chat: {
      members: boardMembers,
      membersTitle: 'Members Online',
      showRoles: false,
      action: { type: 'plan', label: 'Generate a Study Plan' },
    },
  }

  const config = panelConfig[view]

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-5">
      <SessionTimerCard />

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">{config.membersTitle}</h3>
        <ul className="mt-4 space-y-3">
          {config.members.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white',
                    member.color,
                  )}
                >
                  {member.initials}
                </div>
                {member.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">{member.name}</p>
                {config.showRoles && member.role && (
                  <p className="text-xs text-slate-400">{member.role}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
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
          className="session-start-btn inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {config.action.label}
        </button>
      )}
    </aside>
  )
}
