import { useState } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Send } from 'lucide-react'

export function ChatPanel({ messages = [] }) {
  const [draft, setDraft] = useState('')

  return (
    <Card title="Team Chat" description="Messages are visible only to your group members.">
      <div className="flex h-72 flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-500">No messages yet. Start the conversation.</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium text-brand-700">{message.sender}</p>
                <p className="text-sm text-slate-800">{message.content}</p>
              </div>
            ))
          )}
        </div>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setDraft('')
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <Button type="submit" size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
