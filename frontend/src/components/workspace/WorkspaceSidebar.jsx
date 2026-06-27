import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGrid, MessageSquare, Folder, CalendarDays } from 'lucide-react'
import { cn } from '@/utils/cn'

export function WorkspaceSidebar({ groupId }) {
  const location = useLocation()
  const base = `/workspace/${groupId}`

  const items = [
    { id: 'board', icon: LayoutGrid, label: 'Board', to: base },
    { id: 'chat', icon: MessageSquare, label: 'Chat', to: `${base}/chat` },
    { id: 'files', icon: Folder, label: 'Files', to: `${base}/files` },
    { id: 'calendar', icon: CalendarDays, label: 'Scheduler', to: `${base}/calendar` },
  ]

  const isActive = (item) => {
    if (item.id === 'board') {
      return (
        location.pathname === base ||
        location.pathname === `${base}/board`
      )
    }
    return location.pathname.startsWith(item.to)
  }

  return (
    <aside className="hidden w-16 shrink-0 flex-col items-center gap-2 border-r border-slate-200 bg-white py-4 lg:flex">
      {items.map((item) => {
        const Icon = item.icon
        const active = isActive(item)

        return (
          <NavLink
            key={item.id}
            to={item.to}
            title={item.label}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl transition',
              active
                ? 'bg-violet-50 text-violet-600'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600',
            )}
          >
            <Icon className="h-5 w-5" />
          </NavLink>
        )
      })}
    </aside>
  )
}
