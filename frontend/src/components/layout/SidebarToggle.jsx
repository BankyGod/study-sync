import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'
import { cn } from '@/utils/cn'

export function SidebarToggle({ className, collapsedLabel = 'Expand sidebar', expandedLabel = 'Collapse sidebar' }) {
  const { collapsed, toggle } = useSidebar()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={!collapsed}
      aria-label={collapsed ? collapsedLabel : expandedLabel}
      title={collapsed ? collapsedLabel : expandedLabel}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-rail-muted transition',
        'hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
        className,
      )}
    >
      {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
    </button>
  )
}
