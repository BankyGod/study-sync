export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  onboarding: {
    profile: '/onboarding/profile',
  },
  admin: {
    cohorts: '/admin/cohorts',
    seedData: '/admin/seed',
    runMatching: '/admin/matching/run',
    groups: '/admin/groups',
    students: '/admin/students',
  },
  workspace: {
    byGroup: (groupId) => `/workspaces/${groupId}`,
    tasks: (groupId) => `/workspaces/${groupId}/tasks`,
    files: (groupId) => `/workspaces/${groupId}/files`,
    messages: (groupId) => `/workspaces/${groupId}/messages`,
  },
  reliability: {
    score: (userId) => `/reliability/${userId}`,
    team: (groupId) => `/reliability/team/${groupId}`,
  },
}
