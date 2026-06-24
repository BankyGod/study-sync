import { Outlet, useParams } from 'react-router-dom'
import { SessionTimerProvider } from '@/context/SessionTimerContext'
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
import { getActiveMatchingCourse } from '@/services/onboardingProfileService'
import { buildStudyGroupTitle, courseToGroupId } from '@/utils/onboarding'

const groupTitles = {
  demo: 'CS401 - Algorithms Study Group',
  'linear-algebra': 'Linear Algebra Study Group',
  'quantum-physics': 'Quantum Physics Study Group',
}

function resolveGroupTitle(groupId) {
  if (groupTitles[groupId]) return groupTitles[groupId]

  const activeCourse = getActiveMatchingCourse()
  if (activeCourse && courseToGroupId(activeCourse) === groupId) {
    return buildStudyGroupTitle(activeCourse)
  }

  const parts = groupId.split('-')
  if (parts.length >= 2) {
    const courseNumber = parts[parts.length - 1]
    const subject = parts
      .slice(0, -1)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    return `${subject} ${courseNumber.toUpperCase()} Study Group`
  }

  return `Study Group · ${groupId}`
}

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
  const { isAddTaskModalOpen, closeAddTaskModal, createTask } = useWorkspaceTasks()

  return (
    <AddTaskModal
      open={isAddTaskModalOpen}
      onClose={closeAddTaskModal}
      onSave={createTask}
    />
  )
}

export function WorkspaceLayout() {
  const { groupId } = useParams()
  const title = resolveGroupTitle(groupId)

  return (
    <SessionTimerProvider>
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
    </SessionTimerProvider>
  )
}
