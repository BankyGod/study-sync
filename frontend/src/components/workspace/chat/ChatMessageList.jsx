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
      className="h-full min-h-0 min-w-0 w-full overflow-x-clip overflow-y-auto overscroll-contain bg-slate-100 px-3 py-2 lg:bg-white lg:px-5 lg:py-4"
    >
      <div
        className={cn(
          'mx-auto flex w-full min-w-0 max-w-full flex-col',
          hasMessages ? 'min-h-full justify-end' : 'min-h-full justify-center',
        )}
      >
        {!hasMessages ? (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              💬
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-800">No messages yet</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Say hello to your pod — messages are only visible to group members.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-1 lg:space-y-4">
            {groupedMessages.map((group) => (
              <div key={group.label} className="space-y-2 lg:space-y-3">
                <div className="flex items-center justify-center py-1">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm lg:bg-slate-50 lg:shadow-none">
                    {group.label}
                  </span>
                </div>

                <div className="space-y-1 lg:space-y-3">
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
