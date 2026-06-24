export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  users: {
    profile: '/users/me/profile',
    groups: '/users/me/groups',
  },
  onboarding: {
    profile: '/onboarding/profile',
  },
  matching: {
    findGroup: '/matching/find-group',
    job: (jobId) => `/matching/jobs/${jobId}`,
    byCourse: (courseCode) => `/matching/course/${courseCode}`,
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
    task: (groupId, taskId) => `/workspaces/${groupId}/tasks/${taskId}`,
    taskReorder: (groupId) => `/workspaces/${groupId}/tasks/reorder`,
    files: (groupId) => `/workspaces/${groupId}/files`,
    file: (groupId, fileId) => `/workspaces/${groupId}/files/${fileId}`,
    fileDownload: (groupId, fileId) => `/workspaces/${groupId}/files/${fileId}/download`,
    messages: (groupId) => `/workspaces/${groupId}/messages`,
    message: (groupId, messageId) => `/workspaces/${groupId}/messages/${messageId}`,
    messageAttachment: (groupId, messageId) =>
      `/workspaces/${groupId}/messages/${messageId}/attachment`,
    messageVoice: (groupId, messageId) => `/workspaces/${groupId}/messages/${messageId}/voice`,
    sessions: (groupId) => `/workspaces/${groupId}/sessions`,
    session: (groupId, sessionId) => `/workspaces/${groupId}/sessions/${sessionId}`,
  },
  reliability: {
    score: (userId) => `/reliability/${userId}`,
    team: (groupId) => `/reliability/team/${groupId}`,
  },
}
