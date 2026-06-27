import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Play,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import { buildWorkspacePath } from '@/utils/workspace'

const TYPE_META = {
  'task.assigned': {
    label: 'Assignment',
    icon: UserPlus,
    accent: 'bg-sky-100 text-sky-700',
  },
  'task.unassigned': {
    label: 'Unassigned',
    icon: UserMinus,
    accent: 'bg-slate-100 text-slate-600',
  },
  'task.progress_started': {
    label: 'Started',
    icon: Play,
    accent: 'bg-amber-100 text-amber-700',
  },
  'task.completed': {
    label: 'Completed',
    icon: CheckCircle2,
    accent: 'bg-emerald-100 text-emerald-700',
  },
  'task.regress_requested': {
    label: 'Move-back request',
    icon: ArrowLeft,
    accent: 'bg-orange-100 text-orange-700',
  },
  'task.regress_approved': {
    label: 'Pod update',
    icon: Users,
    accent: 'bg-violet-100 text-violet-700',
  },
  'task.regress_rejected': {
    label: 'Request declined',
    icon: XCircle,
    accent: 'bg-rose-100 text-rose-700',
  },
  'task.deleted': {
    label: 'Task deleted',
    icon: Trash2,
    accent: 'bg-slate-100 text-slate-600',
  },
}

export function getNotificationMeta(type) {
  return (
    TYPE_META[type] ?? {
      label: 'Update',
      icon: Bell,
      accent: 'bg-violet-100 text-violet-700',
    }
  )
}

export function getNotificationLink(notification) {
  const groupId = notification.groupId ?? notification.data?.groupId
  if (!groupId) return null

  if (notification.data?.taskId) {
    return `${buildWorkspacePath(groupId)}/board`
  }

  return buildWorkspacePath(groupId)
}

export function isNotificationUnread(notification) {
  return !notification.readAt
}
