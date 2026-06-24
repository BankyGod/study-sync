import apiClient from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { resolveApiUrl } from '@/utils/apiUrl'
import { getWorkspaceErrorMessage } from '@/utils/workspaceErrors'

export { getWorkspaceErrorMessage }

export async function fetchWorkspace(groupId) {
  const { data } = await apiClient.get(endpoints.workspace.byGroup(groupId))
  return data
}

export async function fetchWorkspaceTasks(groupId) {
  const { data } = await apiClient.get(endpoints.workspace.tasks(groupId))
  return data
}

export async function createWorkspaceTask(groupId, { title, dueDate, assigneeId }) {
  const { data } = await apiClient.post(endpoints.workspace.tasks(groupId), {
    title: title?.trim(),
    dueDate: dueDate || undefined,
    assigneeId: assigneeId || undefined,
  })
  return data
}

export async function updateWorkspaceTask(groupId, taskId, patch) {
  const { data } = await apiClient.patch(endpoints.workspace.task(groupId, taskId), patch)
  return data
}

export async function deleteWorkspaceTask(groupId, taskId) {
  await apiClient.delete(endpoints.workspace.task(groupId, taskId))
}

export async function reorderWorkspaceTasks(groupId, tasks) {
  try {
    const { data } = await apiClient.put(endpoints.workspace.taskReorder(groupId), { tasks })
    return data
  } catch (error) {
    const status = error.response?.status
    if (status !== 404 && status !== 405) {
      throw error
    }
  }

  await Promise.all(
    tasks.map(({ id, status, position }) =>
      apiClient.patch(endpoints.workspace.task(groupId, id), { status, position }),
    ),
  )

  return fetchWorkspaceTasks(groupId)
}

export async function fetchWorkspaceMessages(groupId, params = {}) {
  const { data } = await apiClient.get(endpoints.workspace.messages(groupId), { params })
  return data
}

export async function sendWorkspaceTextMessage(groupId, content) {
  const { data } = await apiClient.post(endpoints.workspace.messages(groupId), {
    type: 'text',
    content: content.trim(),
  })
  return data
}

export async function sendWorkspaceAttachmentMessage(groupId, file) {
  const formData = new FormData()
  formData.append('type', 'attachment')
  formData.append('file', file)

  const { data } = await apiClient.post(endpoints.workspace.messages(groupId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function sendWorkspaceVoiceMessage(groupId, { file, durationSec }) {
  const formData = new FormData()
  formData.append('type', 'voice')
  formData.append('file', file)
  formData.append('durationSec', String(durationSec))

  const { data } = await apiClient.post(endpoints.workspace.messages(groupId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteWorkspaceMessage(groupId, messageId) {
  try {
    await apiClient.delete(endpoints.workspace.message(groupId, messageId))
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 405) {
      throw new Error('Message deletion is not supported yet.')
    }
    throw error
  }
}

export async function fetchWorkspaceFiles(groupId) {
  const { data } = await apiClient.get(endpoints.workspace.files(groupId))
  return data
}

export async function uploadWorkspaceFile(groupId, file) {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await apiClient.post(endpoints.workspace.files(groupId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteWorkspaceFile(groupId, fileId) {
  try {
    await apiClient.delete(endpoints.workspace.file(groupId, fileId))
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 405) {
      throw new Error('File deletion is not supported yet.')
    }
    throw error
  }
}

export function buildFileDownloadUrl(groupId, file) {
  if (file?.downloadUrl) {
    return resolveApiUrl(file.downloadUrl)
  }

  const path = endpoints.workspace.fileDownload(groupId, file.id)
  return resolveApiUrl(path)
}

export async function fetchWorkspaceSessions(groupId) {
  const { data } = await apiClient.get(endpoints.workspace.sessions(groupId))
  return data
}

export async function createWorkspaceSession(groupId, sessionInput) {
  const { data } = await apiClient.post(endpoints.workspace.sessions(groupId), sessionInput)
  return data
}

export async function updateWorkspaceSession(groupId, sessionId, patch) {
  try {
    const { data } = await apiClient.patch(endpoints.workspace.session(groupId, sessionId), patch)
    return data
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 405) {
      throw new Error('Session updates are not supported yet.')
    }
    throw error
  }
}

export async function deleteWorkspaceSession(groupId, sessionId) {
  try {
    await apiClient.delete(endpoints.workspace.session(groupId, sessionId))
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 405) {
      throw new Error('Session deletion is not supported yet.')
    }
    throw error
  }
}
