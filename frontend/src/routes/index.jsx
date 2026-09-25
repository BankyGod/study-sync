import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { Spinner } from '@/components/common/Spinner'
import { DEV_BYPASS_AUTH, ROUTES, STAFF_ROLES, ROLES } from '@/utils/constants'

const AppLayout = lazy(() =>
  import('@/components/layout/AppLayout').then((m) => ({ default: m.AppLayout })),
)
const StudentLayout = lazy(() =>
  import('@/components/layout/StudentLayout').then((m) => ({ default: m.StudentLayout })),
)
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const AdminLoginPage = lazy(() =>
  import('@/pages/auth/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
)
const AdminRegisterPage = lazy(() =>
  import('@/pages/auth/AdminRegisterPage').then((m) => ({ default: m.AdminRegisterPage })),
)
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/student/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const OnboardingPage = lazy(() =>
  import('@/pages/onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
)
const StudentDashboardPage = lazy(() =>
  import('@/pages/student/StudentDashboardPage').then((m) => ({
    default: m.StudentDashboardPage,
  })),
)
const FindGroupsPage = lazy(() =>
  import('@/pages/student/FindGroupsPage').then((m) => ({ default: m.FindGroupsPage })),
)
const WorkspaceLayout = lazy(() =>
  import('@/components/workspace/WorkspaceLayout').then((m) => ({
    default: m.WorkspaceLayout,
  })),
)
const WorkspaceBoardPage = lazy(() =>
  import('@/pages/workspace/WorkspaceBoardPage').then((m) => ({
    default: m.WorkspaceBoardPage,
  })),
)
const WorkspaceFilesPage = lazy(() =>
  import('@/pages/workspace/WorkspaceFilesPage').then((m) => ({
    default: m.WorkspaceFilesPage,
  })),
)
const WorkspaceChatPage = lazy(() =>
  import('@/pages/workspace/WorkspaceChatPage').then((m) => ({
    default: m.WorkspaceChatPage,
  })),
)
const WorkspaceCalendarPage = lazy(() =>
  import('@/pages/workspace/WorkspaceCalendarPage').then((m) => ({
    default: m.WorkspaceCalendarPage,
  })),
)
const WorkspacePodsPage = lazy(() =>
  import('@/pages/workspace/WorkspacePodsPage').then((m) => ({
    default: m.WorkspacePodsPage,
  })),
)
const NotificationsPage = lazy(() =>
  import('@/pages/student/NotificationsPage').then((m) => ({
    default: m.NotificationsPage,
  })),
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  })),
)
const CohortManagementPage = lazy(() =>
  import('@/pages/admin/CohortManagementPage').then((m) => ({
    default: m.CohortManagementPage,
  })),
)
const GroupOverviewPage = lazy(() =>
  import('@/pages/admin/GroupOverviewPage').then((m) => ({
    default: m.GroupOverviewPage,
  })),
)
const AdminStudentsPage = lazy(() =>
  import('@/pages/admin/AdminStudentsPage').then((m) => ({
    default: m.AdminStudentsPage,
  })),
)
const AdminReportsPage = lazy(() =>
  import('@/pages/admin/AdminReportsPage').then((m) => ({
    default: m.AdminReportsPage,
  })),
)
const AdminTaskProgressPage = lazy(() =>
  import('@/pages/admin/AdminTaskProgressPage').then((m) => ({
    default: m.AdminTaskProgressPage,
  })),
)

const defaultRoute = DEV_BYPASS_AUTH ? ROUTES.STUDENT_DASHBOARD : ROUTES.LOGIN

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-page">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={defaultRoute} replace />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
        <Route path={ROUTES.ADMIN_REGISTER} element={<AdminRegisterPage />} />
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
            <ProtectedRoute allowedRoles={STAFF_ROLES}>
              <AppLayout variant="admin" />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_COHORTS} element={<CohortManagementPage />} />
          <Route path={ROUTES.ADMIN_GROUPS} element={<GroupOverviewPage />} />
          <Route path={ROUTES.ADMIN_STUDENTS} element={<AdminStudentsPage />} />
          <Route path={ROUTES.ADMIN_TASK_PROGRESS} element={<AdminTaskProgressPage />} />
          <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </Suspense>
  )
}
