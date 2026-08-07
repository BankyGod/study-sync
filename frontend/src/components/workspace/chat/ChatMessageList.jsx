import { useEffect, useRef } from 'react'
import { ChatMessage } from '@/components/workspace/chat/ChatMessage'
import { groupMessagesByDate } from '@/services/workspaceChatService'
import { cn } from '@/utils/cn'

export function ChatMessageList({ messages, currentUserId, onDeleteMessage }) {
  const listRef = useRef(null)
  const isNearBottomRef = useRef(true)
  const groupedMessages = groupMessagesByDate(messages)

  const scrollToBottom = (behavior = 'auto') => {
    const element = listRef.current
    if (!element) return
    element.scrollTo({ top: element.scrollHeight, behavior })
  }

  const handleScroll = () => {
    const element = listRef.current
    if (!element) return
    isNearBottomRef.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < 96
  }

  useEffect(() => {
    scrollToBottom('auto')
    isNearBottomRef.current = true
  }, [])

  useEffect(() => {
    if (!isNearBottomRef.current) return
    scrollToBottom('smooth')
  }, [messages])

  const hasMessages = groupedMessages.length > 0

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="h-full min-h-0 min-w-0 w-full overflow-x-clip overflow-y-auto overscroll-contain bg-page px-4 py-4 sm:px-5 sm:py-5 lg:bg-surface lg:px-6 lg:py-6"
    >
      <div
        className={cn(
          'mx-auto flex w-full min-w-0 max-w-3xl flex-col',
          hasMessages ? 'min-h-full justify-end' : 'min-h-full justify-center',
        )}
      >
        {!hasMessages ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-2xl shadow-sm ring-1 ring-border">
              💬
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">No messages yet</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              Say hello to your pod — messages are only visible to group members.
            </p>
          </div>
        ) : (
          <div className="space-y-5 pb-3 sm:space-y-6 sm:pb-4">
            {groupedMessages.map((group) => (
              <div key={group.label} className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center py-2">
                  <span className="rounded-full border border-border bg-surface px-3.5 py-1 text-[11px] font-medium text-muted">
                    {group.label}
                  </span>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  {group.messages.map((message, index) => {
                    const previous = group.messages[index - 1]
                    const next = group.messages[index + 1]
                    const isOwnMessage = message.senderId === currentUserId
                    const showSender =
                      !isOwnMessage &&
                      (!previous ||
                        previous.senderId !== message.senderId ||
                        previous.senderId === currentUserId)
                    const isGroupedWithPrevious = previous?.senderId === message.senderId
                    const isGroupedWithNext = next?.senderId === message.senderId

                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isOwnMessage={isOwnMessage}
                        showSender={showSender}
                        isGroupedWithPrevious={isGroupedWithPrevious}
                        isGroupedWithNext={isGroupedWithNext}
                        onDelete={onDeleteMessage}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
