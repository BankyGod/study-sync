export const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
}

/** Skip login until the backend auth API is connected (dev only). */
export const DEV_BYPASS_AUTH = import.meta.env.DEV

export const DEV_MOCK_USER = {
  id: 'dev-user-1',
  name: 'Alex Opoku',
  email: 'alex.opoku@gctu.edu.gh',
  role: ROLES.STUDENT,
}

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
  STUDENT_DASHBOARD: '/dashboard',
  FIND_GROUPS: '/find-groups',
  WORKSPACE: '/workspace/:groupId',
  MY_GROUPS: '/my-groups',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_COHORTS: '/admin/cohorts',
  ADMIN_GROUPS: '/admin/groups',
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'studysync_token',
  USER: 'studysync_user',
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const SKILL_AREAS = [
  'Programming',
  'Research',
  'Writing',
  'Design',
  'Presentation',
  'Project Management',
]
