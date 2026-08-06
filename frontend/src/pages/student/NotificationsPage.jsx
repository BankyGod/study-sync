import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { NotificationListItem } from '@/components/notifications/NotificationListItem'
import { Spinner } from '@/components/common/Spinner'
import {
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_COUNT_QUERY_KEY,
} from '@/hooks/useNotificationSocket'
import {
  fetchNotifications,
  getNotificationsErrorMessage,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notificationsService'
import { cn } from '@/utils/cn'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
]

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const unreadOnly = filter === 'unread'

  const { data, isLoading, error } = useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, filter],
    queryFn: () => fetchNotifications({ unreadOnly }),
  })

  const unreadCount = data?.unreadCount ?? 0

  useEffect(() => {
    if (!data) return
    setNotifications(data.notifications ?? [])
    setNextCursor(data.nextCursor ?? null)
  }, [data])

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    },
  })

  const handleFilterChange = useCallback((nextFilter) => {
    setFilter(nextFilter)
  }, [])

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const nextPage = await fetchNotifications({ unreadOnly, cursor: nextCursor })
      setNotifications((prev) => [...prev, ...(nextPage.notifications ?? [])])
      setNextCursor(nextPage.nextCursor ?? null)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleMarkRead = (notificationId) => {
    markReadMutation.mutate(notificationId)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Alerts</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-muted">
            Task updates and pod activity from your study groups.
          </p>
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-page disabled:opacity-60 sm:w-auto"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        ) : null}
      </header>

      <div className="mt-6 flex items-center gap-4 border-b border-border">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleFilterChange(item.id)}
            className={cn(
              'relative pb-3 text-sm font-medium transition',
              filter === item.id ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {item.label}
            {item.id === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
            {filter === item.id ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-600" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {getNotificationsErrorMessage(error)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-12">
            <Bell className="h-6 w-6 text-muted" />
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">
              {unreadOnly ? 'No unread notifications' : 'Nothing here yet'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {unreadOnly
                ? 'You are all caught up.'
                : 'When teammates assign tasks or update progress, alerts appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {notifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
              />
            ))}

            {nextCursor ? (
              <div className="border-t border-border px-4 py-3">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="text-sm font-semibold text-brand-700 transition hover:text-brand-800 disabled:opacity-60"
                >
                  {isLoadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
