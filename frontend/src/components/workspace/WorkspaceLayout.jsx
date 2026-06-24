import { Outlet, useParams } from 'react-router-dom'
import { SessionTimerProvider } from '@/context/SessionTimerContext'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'
import {
  WorkspaceScheduleProvider,
  useWorkspaceSchedule,
} from '@/context/WorkspaceScheduleContext'
import {
  WorkspaceTasksProvider,
  useWorkspaceTasks,
} from '@/context/WorkspaceTasksContext'
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar'
import { WorkspaceRightPanel } from '@/components/workspace/WorkspaceRightPanel'
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader'
import { ScheduleSessionModal } from '@/components/workspace/ScheduleSessionModal'
import { AddTaskModal } from '@/components/kanban/AddTaskModal'
import { Spinner } from '@/components/common/Spinner'

function WorkspaceScheduleModal() {
  const { isScheduleModalOpen, closeScheduleModal, scheduleSession } = useWorkspaceSchedule()

  return (
    <ScheduleSessionModal
      open={isScheduleModalOpen}
      onClose={closeScheduleModal}
      onSave={scheduleSession}
    />
  )
}

function WorkspaceAddTaskModal() {
  const { members } = useWorkspace()
  const { isAddTaskModalOpen, closeAddTaskModal, createTask } = useWorkspaceTasks()

  return (
    <AddTaskModal
      open={isAddTaskModalOpen}
      onClose={closeAddTaskModal}
      onSave={createTask}
      members={members}
    />
  )
}

function WorkspaceShell() {
  const { groupId } = useParams()
  const { title, isLoading } = useWorkspace()

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <WorkspaceScheduleProvider groupId={groupId}>
      <WorkspaceTasksProvider groupId={groupId}>
        <div className="flex h-[calc(100vh-4rem)] min-h-0 overflow-hidden">
          <WorkspaceSidebar groupId={groupId} />

          <div className="flex min-h-0 flex-1 gap-6 overflow-hidden p-5 lg:p-6">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <WorkspaceHeader title={title} />
              <div className="flex min-h-0 flex-1 flex-col">
                <Outlet />
              </div>
            </div>

            <WorkspaceRightPanel />
          </div>
        </div>

        <WorkspaceScheduleModal />
        <WorkspaceAddTaskModal />
      </WorkspaceTasksProvider>
    </WorkspaceScheduleProvider>
  )
}

export function WorkspaceLayout() {
  const { groupId } = useParams()

  return (
    <SessionTimerProvider>
      <WorkspaceProvider groupId={groupId}>
        <WorkspaceShell />
      </WorkspaceProvider>
    </SessionTimerProvider>
  )
}
