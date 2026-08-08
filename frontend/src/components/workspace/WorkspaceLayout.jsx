import { SessionTimerProvider } from '@/context/SessionTimerContext'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'
import { WorkspaceChatActivityProvider } from '@/context/WorkspaceChatActivityContext'
import { MemberProfileProvider } from '@/context/MemberProfileContext'
import {
  WorkspaceScheduleProvider,
  useWorkspaceSchedule,
} from '@/context/WorkspaceScheduleContext'
import {
  WorkspaceTasksProvider,
  useWorkspaceTasks,
} from '@/context/WorkspaceTasksContext'
import { WorkspaceCallProvider } from '@/context/WorkspaceCallContext'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar'
import { WorkspaceBottomNav } from '@/components/workspace/WorkspaceBottomNav'
import { WorkspaceRightPanel } from '@/components/workspace/WorkspaceRightPanel'
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader'
import { VideoCallPanel } from '@/components/workspace/VideoCallPanel'
import { ScheduleSessionModal } from '@/components/workspace/ScheduleSessionModal'
import { AddTaskModal } from '@/components/kanban/AddTaskModal'
import { Spinner } from '@/components/common/Spinner'
import { cn } from '@/utils/cn'

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

function WorkspaceEditTaskModal() {
  const { members } = useWorkspace()
  const { editingTask, closeEditTaskModal, updateTask } = useWorkspaceTasks()

  return (
    <AddTaskModal
      open={Boolean(editingTask)}
      task={editingTask}
      onClose={closeEditTaskModal}
      onSave={(values) => {
        if (!editingTask) return
        return updateTask(editingTask.id, values)
      }}
      members={members}
    />
  )
}

function WorkspaceShell() {
  const { groupId } = useParams()
  const location = useLocation()
  const isChatView = location.pathname.includes('/chat')
  const { title, courseLabel, isLoading, members } = useWorkspace()

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          isChatView
            ? 'h-[calc(100dvh-4rem-env(safe-area-inset-bottom,0px))] lg:h-[calc(100dvh-3.5rem)]'
            : 'h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-bottom,0px))] lg:h-[calc(100dvh-3.5rem)]',
        )}
      >
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <WorkspaceScheduleProvider groupId={groupId}>
      <WorkspaceTasksProvider groupId={groupId} members={members}>
        <WorkspaceCallProvider groupId={groupId}>
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-col overflow-hidden bg-page',
            isChatView
              ? 'h-[calc(100dvh-4rem-env(safe-area-inset-bottom,0px))] lg:h-[calc(100dvh-3.5rem)]'
              : 'h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-bottom,0px))] lg:h-[calc(100dvh-3.5rem)]',
          )}
        >
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <WorkspaceSidebar groupId={groupId} />

            <div
              className={cn(
                'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
                isChatView ? 'p-0' : 'px-3 py-3 sm:px-5 sm:py-4 lg:flex-row lg:gap-0 lg:px-6 lg:py-5',
              )}
            >
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className={cn(isChatView ? 'hidden' : 'px-0')}>
                  <WorkspaceHeader title={title} courseLabel={courseLabel} />
                </div>
                <div
                  className={cn(
                    'flex min-h-0 flex-1 flex-col overflow-hidden',
                    !isChatView && 'overflow-y-auto',
                  )}
                >
                  <Outlet />
                </div>
              </div>

              {!isChatView && <WorkspaceRightPanel />}
            </div>
          </div>
        </div>

        <WorkspaceBottomNav groupId={groupId} />

        <WorkspaceScheduleModal />
        <WorkspaceAddTaskModal />
        <WorkspaceEditTaskModal />
        <VideoCallPanel />
        </WorkspaceCallProvider>
      </WorkspaceTasksProvider>
    </WorkspaceScheduleProvider>
  )
}

export function WorkspaceLayout() {
  const { groupId } = useParams()

  return (
    <SessionTimerProvider>
      <WorkspaceProvider groupId={groupId}>
        <MemberProfileProvider>
          <WorkspaceChatActivityProvider>
            <WorkspaceShell />
          </WorkspaceChatActivityProvider>
        </MemberProfileProvider>
      </WorkspaceProvider>
    </SessionTimerProvider>
  )
}
