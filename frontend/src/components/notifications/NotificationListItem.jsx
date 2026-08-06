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
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          meta.accent,
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn('line-clamp-2 text-sm font-semibold text-ink', unread && 'text-brand-800')}>
              {notification.title}
            </p>
            {notification.body ? (
              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">
                {notification.body}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              {meta.label ? ` · ${meta.label}` : ''}
            </p>
          </div>
          {unread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" /> : null}
        </div>
      </div>
    </>
  )

  const className = cn(
    'flex w-full gap-3 border-b border-border px-4 py-4 text-left transition last:border-b-0',
    unread ? 'bg-brand-50/40 hover:bg-brand-50/70' : 'bg-surface hover:bg-page',
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
