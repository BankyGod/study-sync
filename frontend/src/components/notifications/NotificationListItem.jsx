import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import {
  getNotificationLink,
  getNotificationMeta,
  isNotificationUnread,
} from '@/utils/notifications'
import { cn } from '@/utils/cn'

export function NotificationListItem({ notification, onMarkRead }) {
  const meta = getNotificationMeta(notification.type)
  const Icon = meta.icon
  const link = getNotificationLink(notification)
  const unread = isNotificationUnread(notification)

  const content = (
    <>
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          meta.accent,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn('text-sm font-semibold text-slate-900', unread && 'text-violet-900')}>
              {notification.title}
            </p>
            {notification.body ? (
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{notification.body}</p>
            ) : null}
            <p className="mt-2 text-xs text-slate-400">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              {meta.label ? ` · ${meta.label}` : ''}
            </p>
          </div>
          {unread ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" /> : null}
        </div>
      </div>
    </>
  )

  const className = cn(
    'flex w-full gap-4 rounded-2xl border px-4 py-4 text-left transition',
    unread
      ? 'border-violet-200 bg-violet-50/70 hover:bg-violet-50'
      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
  )

  const handleClick = () => {
    if (unread) {
      onMarkRead(notification.id)
    }
  }

  if (link) {
    return (
      <Link to={link} className={className} onClick={handleClick}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {content}
    </button>
  )
}
