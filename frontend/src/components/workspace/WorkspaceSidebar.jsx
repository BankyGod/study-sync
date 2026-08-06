import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGrid, MessageSquare, Folder, CalendarDays } from 'lucide-react'
import { NavBadge } from '@/components/common/NavBadge'
import { useWorkspaceChatActivity } from '@/context/WorkspaceChatActivityContext'
import { cn } from '@/utils/cn'

export function WorkspaceSidebar({ groupId }) {
  const { unreadCount: chatUnreadCount } = useWorkspaceChatActivity()
  const location = useLocation()
  const base = `/workspace/${groupId}`

  const items = [
    { id: 'board', icon: LayoutGrid, label: 'Board', to: base },
    { id: 'chat', icon: MessageSquare, label: 'Chat', to: `${base}/chat` },
    { id: 'files', icon: Folder, label: 'Files', to: `${base}/files` },
    { id: 'calendar', icon: CalendarDays, label: 'Schedule', to: `${base}/calendar` },
  ]

  const isActive = (item) => {
    if (item.id === 'board') {
      return location.pathname === base || location.pathname === `${base}/board`
    }
    return location.pathname.startsWith(item.to)
  }

  return (
    <aside className="hidden w-[4.25rem] shrink-0 flex-col items-center gap-1 border-r border-border bg-surface py-4 lg:flex">
      {items.map((item) => {
        const Icon = item.icon
        const active = isActive(item)

        return (
          <NavLink
            key={item.id}
            to={item.to}
            title={item.label}
            className={cn(
              'relative flex h-11 w-11 flex-col items-center justify-center rounded-lg transition',
              active ? 'bg-brand-50 text-brand-700' : 'text-muted hover:bg-page hover:text-ink',
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.15 : 1.75} />
            {item.id === 'chat' ? (
              <NavBadge count={chatUnreadCount} className="-right-0.5 -top-0.5" />
            ) : null}
          </NavLink>
        )
      })}
    </aside>
  )
}
