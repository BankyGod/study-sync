import {
  ArrowLeft,
  Bell,
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  Megaphone,
  MessageSquare,
  Play,
  RotateCcw,
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
    accent: 'bg-brand-50 text-brand-700',
  },
  'task.unassigned': {
    label: 'Unassigned',
    icon: UserMinus,
    accent: 'bg-page text-muted',
  },
  'task.progress_started': {
    label: 'Started',
    icon: Play,
    accent: 'bg-ochre-soft text-ochre',
  },
  'task.completed': {
    label: 'Completed',
    icon: CheckCircle2,
    accent: 'bg-brand-100 text-brand-800',
  },
  'task.regress_requested': {
    label: 'Move-back request',
    icon: ArrowLeft,
    accent: 'bg-ochre-soft text-ochre',
  },
  'task.regress_approved': {
    label: 'Pod update',
    icon: Users,
    accent: 'bg-brand-50 text-brand-700',
  },
  'task.regress_rejected': {
    label: 'Request declined',
    icon: XCircle,
    accent: 'bg-red-50 text-red-800',
  },
  'task.review_requested': {
    label: 'Needs review',
    icon: ClipboardCheck,
    accent: 'bg-sky-50 text-sky-700',
  },
  'task.review_approved': {
    label: 'Work accepted',
    icon: CheckCircle2,
    accent: 'bg-brand-100 text-brand-800',
  },
  'task.changes_requested': {
    label: 'Sent back',
    icon: RotateCcw,
    accent: 'bg-ochre-soft text-ochre',
  },
  'task.nudge': {
    label: 'Reminder from leader',
    icon: BellRing,
    accent: 'bg-ochre-soft text-ochre',
  },
  'announcement.updated': {
    label: 'Announcement',
    icon: Megaphone,
    accent: 'bg-brand-50 text-brand-700',
  },
  'task.deleted': {
    label: 'Task deleted',
    icon: Trash2,
    accent: 'bg-page text-muted',
  },
  'message.new': {
    label: 'Pod chat',
    icon: MessageSquare,
    accent: 'bg-brand-50 text-brand-700',
  },
  'call.started': {
    label: 'Video call',
    icon: MessageSquare,
    accent: 'bg-brand-50 text-brand-700',
  },
}

export function getNotificationMeta(type) {
  return (
    TYPE_META[type] ?? {
      label: 'Update',
      icon: Bell,
      accent: 'bg-brand-100 text-brand-700',
    }
  )
}

export function getNotificationLink(notification) {
  const groupId = notification.groupId ?? notification.data?.groupId
  if (!groupId) return null

  if (notification.type === 'message.new' || notification.type === 'call.started') {
    return `${buildWorkspacePath(groupId)}/chat`
  }

  if (notification.data?.taskId) {
    return `${buildWorkspacePath(groupId)}/board`
  }

  return buildWorkspacePath(groupId)
}

export function isNotificationUnread(notification) {
  return !notification.readAt
}
