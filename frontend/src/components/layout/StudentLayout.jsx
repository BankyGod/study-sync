import { Outlet, useLocation } from 'react-router-dom'
import { StudentNavbar } from '@/components/layout/StudentNavbar'
import { StudentSidebar } from '@/components/layout/StudentSidebar'
import { StudentBottomNav } from '@/components/layout/StudentBottomNav'
import { SidebarProvider } from '@/context/SidebarContext'
import { useNotificationSocket } from '@/hooks/useNotificationSocket'
import { isInsideWorkspaceGroup, isWorkspaceChatRoute } from '@/utils/studentNav'
import { cn } from '@/utils/cn'

export function StudentLayout() {
  useNotificationSocket()
  const location = useLocation()
  const inWorkspaceGroup = isInsideWorkspaceGroup(location.pathname)
  const isMobileChat = isWorkspaceChatRoute(location.pathname)

  return (
    <SidebarProvider>
    <div className="flex min-h-dvh min-w-0 overflow-x-clip bg-page">
      {!inWorkspaceGroup ? <StudentSidebar /> : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <StudentNavbar className={cn(isMobileChat && 'max-lg:hidden')} />
        <main
          className={cn(
            'min-w-0 flex-1 overflow-x-clip',
            !inWorkspaceGroup && 'pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0',
          )}
        >
          <Outlet />
        </main>
        <StudentBottomNav />
      </div>
    </div>
    </SidebarProvider>
  )
}
