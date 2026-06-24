import { useEffect, useRef } from 'react'
import { ChatMessage } from '@/components/workspace/chat/ChatMessage'
import { groupMessagesByDate } from '@/services/workspaceChatService'

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

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="h-full min-h-0 overflow-y-auto overscroll-contain px-5 py-5"
    >
      <div className="space-y-6">
        {groupedMessages.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-700">No messages yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Start the conversation with your study group.
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.label} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400">{group.label}</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="space-y-4">
                {group.messages.map((message, index) => {
                  const previous = group.messages[index - 1]
                  const isOwnMessage = message.senderId === currentUserId
                  const showSender =
                    !isOwnMessage &&
                    (!previous ||
                      previous.senderId !== message.senderId ||
                      previous.senderId === currentUserId)

                  return (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      showSender={showSender}
                      onDelete={onDeleteMessage}
                    />
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
