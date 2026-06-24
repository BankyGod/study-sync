import { Outlet, useParams } from 'react-router-dom'
import { SessionTimerProvider } from '@/context/SessionTimerContext'
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar'
import { WorkspaceRightPanel } from '@/components/workspace/WorkspaceRightPanel'
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader'

const groupTitles = {
  demo: 'CS401 - Algorithms Study Group',
}

export function WorkspaceLayout() {
  const { groupId } = useParams()
  const title = groupTitles[groupId] ?? `Study Group · ${groupId}`

  return (
    <SessionTimerProvider>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <WorkspaceSidebar groupId={groupId} />

        <div className="flex flex-1 gap-6 overflow-auto p-5 lg:p-6">
          <div className="flex min-w-0 flex-1 flex-col">
            <WorkspaceHeader title={title} />
            <Outlet />
          </div>

          <WorkspaceRightPanel />
        </div>
      </div>
    </SessionTimerProvider>
  )
}
