import { NavLink, useLocation } from 'react-router-dom'
import { CalendarDays, Folder, LayoutGrid, MessageSquare } from 'lucide-react'
import { cn } from '@/utils/cn'

export function WorkspaceBottomNav({ groupId }) {
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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/90 bg-white/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Workspace navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = item.isActive()

          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition',
                active ? 'text-violet-600' : 'text-slate-500 active:text-violet-600',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-2xl transition',
                  active && 'bg-violet-100 text-violet-700',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
