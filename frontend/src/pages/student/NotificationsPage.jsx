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
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-2 text-slate-500">
            Task updates, assignments, and pod activity from your study groups.
          </p>
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        ) : null}
      </div>

      <div className="mb-6 flex items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleFilterChange(item.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              filter === item.id
                ? 'bg-violet-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {item.label}
            {item.id === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getNotificationsErrorMessage(error)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Bell className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {unreadOnly ? 'No unread notifications' : 'Nothing here yet'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {unreadOnly
              ? 'You are all caught up.'
              : 'When teammates assign tasks or update progress, you will see alerts here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationListItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}

          {nextCursor ? (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {isLoadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
