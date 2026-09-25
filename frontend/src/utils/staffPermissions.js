import { ROLES, normalizeRole } from '@/utils/constants'

/**
 * Fine-grained staff roles (stored as user.staffRole / staff_role).
 * Auth `users.role` remains student | instructor | admin for portal access.
 */
export const STAFF_ROLE_TYPES = {
  SUPER_ADMIN: 'super_admin',
  COHORT_MANAGER: 'cohort_manager',
  STUDENT_OFFICER: 'student_officer',
  REPORTS_VIEWER: 'reports_viewer',
  INSTRUCTOR: 'instructor',
}

export const STAFF_ROLE_LABELS = {
  [STAFF_ROLE_TYPES.SUPER_ADMIN]: 'Super admin',
  [STAFF_ROLE_TYPES.COHORT_MANAGER]: 'Cohort manager',
  [STAFF_ROLE_TYPES.STUDENT_OFFICER]: 'Student officer',
  [STAFF_ROLE_TYPES.REPORTS_VIEWER]: 'Reports viewer',
  [STAFF_ROLE_TYPES.INSTRUCTOR]: 'Instructor',
}

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_COHORTS: 'manage_cohorts',
  MANAGE_GROUPS: 'manage_groups',
  VIEW_STUDENTS: 'view_students',
  VIEW_REPORTS: 'view_reports',
  PRINT_REPORTS: 'print_reports',
  ASSIGN_LEADERS: 'assign_leaders',
  MANAGE_STAFF: 'manage_staff',
  VIEW_TASK_PROGRESS: 'view_task_progress',
}

const ROLE_PERMISSIONS = {
  [STAFF_ROLE_TYPES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [STAFF_ROLE_TYPES.COHORT_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_COHORTS,
    PERMISSIONS.MANAGE_GROUPS,
    PERMISSIONS.ASSIGN_LEADERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.PRINT_REPORTS,
    PERMISSIONS.VIEW_TASK_PROGRESS,
  ],
  [STAFF_ROLE_TYPES.STUDENT_OFFICER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.PRINT_REPORTS,
  ],
  [STAFF_ROLE_TYPES.REPORTS_VIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.PRINT_REPORTS,
    PERMISSIONS.VIEW_TASK_PROGRESS,
  ],
  [STAFF_ROLE_TYPES.INSTRUCTOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_COHORTS,
    PERMISSIONS.MANAGE_GROUPS,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.PRINT_REPORTS,
    PERMISSIONS.ASSIGN_LEADERS,
    PERMISSIONS.VIEW_TASK_PROGRESS,
  ],
}

export function normalizeStaffRoleType(value) {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (Object.values(STAFF_ROLE_TYPES).includes(raw)) return raw
  if (raw === 'admin' || raw === 'superadmin') return STAFF_ROLE_TYPES.SUPER_ADMIN
  return STAFF_ROLE_TYPES.INSTRUCTOR
}

export function resolveStaffRoleType(user) {
  if (!user) return null
  const authRole = normalizeRole(user.role)
  if (authRole === ROLES.ADMIN) return STAFF_ROLE_TYPES.SUPER_ADMIN
  if (authRole !== ROLES.INSTRUCTOR && authRole !== ROLES.ADMIN) return null

  return normalizeStaffRoleType(
    user.staffRole ?? user.staff_role ?? user.adminRole ?? user.admin_role ?? STAFF_ROLE_TYPES.INSTRUCTOR,
  )
}

export function getStaffPermissions(user) {
  const staffRole = resolveStaffRoleType(user)
  if (!staffRole) return []
  return ROLE_PERMISSIONS[staffRole] ?? ROLE_PERMISSIONS[STAFF_ROLE_TYPES.INSTRUCTOR]
}

export function hasPermission(user, permission) {
  return getStaffPermissions(user).includes(permission)
}

export function hasAnyPermission(user, permissions = []) {
  return permissions.some((permission) => hasPermission(user, permission))
}

export const STAFF_ROLE_OPTIONS = Object.entries(STAFF_ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}))
