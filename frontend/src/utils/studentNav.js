import { ROUTES } from '@/utils/constants'

export function isWorkspaceRoute(pathname) {
  return pathname === ROUTES.WORKSPACE_LIST || /^\/workspace\/[^/]+/.test(pathname)
}

export function isInsideWorkspaceGroup(pathname) {
  return /^\/workspace\/[^/]+/.test(pathname)
}

export function isWorkspaceChatRoute(pathname) {
  return /^\/workspace\/[^/]+\/chat/.test(pathname)
}
