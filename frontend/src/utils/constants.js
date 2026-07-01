export const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
}

/** Set VITE_DEV_BYPASS_AUTH=true in .env to skip login during local UI work. */
export const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

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
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  STUDENT_DASHBOARD: '/dashboard',
  FIND_GROUPS: '/find-groups',
  WORKSPACE: '/workspace/:groupId',
  WORKSPACE_LIST: '/workspace',
  MY_GROUPS: '/my-groups',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_COHORTS: '/admin/cohorts',
  ADMIN_GROUPS: '/admin/groups',
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'studysync_token',
  USER: 'studysync_user',
  ONBOARDING_PROFILE: 'studysync_onboarding_profile',
  ACTIVE_MATCHING_COURSE: 'studysync_active_matching_course',
  USER_PROFILE: 'studysync_user_profile',
  USER_AVATAR: 'studysync_user_avatar',
  GROUP_SCHEDULES: 'studysync_group_schedules',
  GROUP_TASKS: 'studysync_group_tasks',
  GROUP_CHAT: 'studysync_group_chat',
  GROUP_FILES: 'studysync_group_files',
  PENDING_REGISTRATION: 'studysync_pending_registration',
  NOTIFICATIONS: 'studysync_notifications',
  CHAT_UNREAD: 'studysync_chat_unread',
  SPA_PATH_RECOVERY: 'studysync_spa_path',
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
