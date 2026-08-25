import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { NotificationListItem } from '@/components/notifications/NotificationListItem'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell, SurfacePanel } from '@/components/layout/PageShell'
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
    <PageShell width="5xl">
      <PageHeader
        eyebrow="Alerts"
        title="Notifications"
        description="Task updates and pod activity from your study groups."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="secondary"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          ) : null
        }
      />

      <div className="mt-4 flex items-center gap-3 border-b border-border">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleFilterChange(item.id)}
            className={cn(
              'relative pb-2 text-[13px] font-medium transition',
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

      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">
            {getNotificationsErrorMessage(error)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="ui-empty">
            <Bell className="mx-auto h-5 w-5 text-muted" />
            <h2 className="mt-2 text-[13px] font-semibold text-ink">
              {unreadOnly ? 'No unread notifications' : 'Nothing here yet'}
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted">
              {unreadOnly
                ? 'You are all caught up.'
                : 'Task and pod updates will show here.'}
            </p>
          </div>
        ) : (
          <SurfacePanel>
            {notifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
              />
            ))}

            {nextCursor ? (
              <div className="border-t border-border px-3 py-2">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="text-[12px] font-semibold text-brand-700 transition hover:text-brand-800 disabled:opacity-60"
                >
                  {isLoadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            ) : null}
          </SurfacePanel>
        )}
      </div>
    </PageShell>
  )
}
