import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquare, Users } from 'lucide-react'
import { ChatComposer } from '@/components/workspace/chat/ChatComposer'
import { ChatMessageList } from '@/components/workspace/chat/ChatMessageList'
import {
  CURRENT_CHAT_USER_ID,
  deleteGroupMessage,
  loadGroupMessages,
  sendGroupAttachment,
  sendGroupMessage,
  sendGroupVoiceMessage,
} from '@/services/workspaceChatService'
import { WORKSPACE_MEMBERS } from '@/services/workspaceTaskService'

export function WorkspaceChatPanel() {
  const { groupId } = useParams()
  const [messages, setMessages] = useState(() => loadGroupMessages(groupId))

  useEffect(() => {
    setMessages(loadGroupMessages(groupId))
  }, [groupId])

  const handleSend = (content) => {
    const nextMessages = sendGroupMessage(groupId, {
      senderId: CURRENT_CHAT_USER_ID,
      content,
    })
    setMessages(nextMessages)
  }

  const handleSendAttachment = async (file) => {
    const nextMessages = sendGroupAttachment(groupId, {
      senderId: CURRENT_CHAT_USER_ID,
      file,
    })
    setMessages(nextMessages)
  }

  const handleSendVoice = async (file, durationSec) => {
    const nextMessages = await sendGroupVoiceMessage(groupId, {
      senderId: CURRENT_CHAT_USER_ID,
      file,
      durationSec,
    })
    setMessages(nextMessages)
  }

  const handleDeleteMessage = (messageId) => {
    const nextMessages = deleteGroupMessage(groupId, messageId)
    setMessages(nextMessages)
  }

  const onlineCount = WORKSPACE_MEMBERS.length

  return (
    <section className="grid h-full min-h-[calc(100vh-8.5rem)] flex-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Group Chat</h2>
            <p className="text-sm text-slate-500">Messages are visible only to your pod members.</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <Users className="h-3.5 w-3.5" />
          {onlineCount} members
        </div>
      </header>

      <ChatMessageList messages={messages} onDeleteMessage={handleDeleteMessage} />
      <ChatComposer
        onSend={handleSend}
        onSendAttachment={handleSendAttachment}
        onSendVoice={handleSendVoice}
      />
    </section>
  )
}
