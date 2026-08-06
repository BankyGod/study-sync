import { NavLink, useLocation } from 'react-router-dom'
import { CalendarDays, Folder, LayoutGrid, MessageSquare } from 'lucide-react'
import { NavBadge } from '@/components/common/NavBadge'
import { useWorkspaceChatActivity } from '@/context/WorkspaceChatActivityContext'
import { cn } from '@/utils/cn'

export function WorkspaceBottomNav({ groupId }) {
  const { unreadCount: chatUnreadCount } = useWorkspaceChatActivity()
  const location = useLocation()
  const base = `/workspace/${groupId}`

  const items = [
    {
      id: 'board',
      icon: LayoutGrid,
      label: 'Board',
      to: base,
      isActive: () =>
        location.pathname === base || location.pathname === `${base}/board`,
    },
    {
      id: 'chat',
      icon: MessageSquare,
      label: 'Chat',
      to: `${base}/chat`,
      isActive: () => location.pathname.startsWith(`${base}/chat`),
    },
    {
      id: 'files',
      icon: Folder,
      label: 'Files',
      to: `${base}/files`,
      isActive: () => location.pathname.startsWith(`${base}/files`),
    },
    {
      id: 'calendar',
      icon: CalendarDays,
      label: 'Schedule',
      to: `${base}/calendar`,
      isActive: () => location.pathname.startsWith(`${base}/calendar`),
    },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Workspace navigation"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around px-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = item.isActive()

          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={cn(
                'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-[11px] font-semibold transition',
                active ? 'text-brand-700' : 'text-muted',
              )}
            >
              <span className="relative flex h-7 w-7 items-center justify-center">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                {item.id === 'chat' ? (
                  <NavBadge count={chatUnreadCount} className="-right-1.5 -top-1" />
                ) : null}
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
