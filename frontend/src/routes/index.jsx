import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ProfilePage } from '@/pages/student/ProfilePage'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage'
import { FindGroupsPage } from '@/pages/student/FindGroupsPage'
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout'
import { WorkspaceBoardPage } from '@/pages/workspace/WorkspaceBoardPage'
import { WorkspaceFilesPage } from '@/pages/workspace/WorkspaceFilesPage'
import { WorkspaceChatPage } from '@/pages/workspace/WorkspaceChatPage'
import { WorkspaceCalendarPage } from '@/pages/workspace/WorkspaceCalendarPage'
import { WorkspacePodsPage } from '@/pages/workspace/WorkspacePodsPage'
import { NotificationsPage } from '@/pages/student/NotificationsPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { CohortManagementPage } from '@/pages/admin/CohortManagementPage'
import { GroupOverviewPage } from '@/pages/admin/GroupOverviewPage'
import { DEV_BYPASS_AUTH, ROUTES, ROLES } from '@/utils/constants'

const defaultRoute = DEV_BYPASS_AUTH ? ROUTES.STUDENT_DASHBOARD : ROUTES.LOGIN

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Navigate to={defaultRoute} replace />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      <Route
        path={ROUTES.ONBOARDING}
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
        <Route path={ROUTES.STUDENT_DASHBOARD} element={<StudentDashboardPage />} />
        <Route path={ROUTES.FIND_GROUPS} element={<FindGroupsPage />} />
        <Route path={ROUTES.MY_GROUPS} element={<Navigate to={ROUTES.STUDENT_DASHBOARD} replace />} />
        <Route path={ROUTES.WORKSPACE_LIST} element={<Outlet />}>
          <Route index element={<WorkspacePodsPage />} />
          <Route path=":groupId" element={<WorkspaceLayout />}>
            <Route index element={<WorkspaceBoardPage />} />
            <Route path="board" element={<WorkspaceBoardPage />} />
            <Route path="files" element={<WorkspaceFilesPage />} />
            <Route path="chat" element={<WorkspaceChatPage />} />
            <Route path="calendar" element={<WorkspaceCalendarPage />} />
          </Route>
        </Route>
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
            <AppLayout variant="admin" />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
        <Route path={ROUTES.ADMIN_COHORTS} element={<CohortManagementPage />} />
        <Route path={ROUTES.ADMIN_GROUPS} element={<GroupOverviewPage />} />
      </Route>

      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  )
}
