import { ScheduleSessionList } from '@/components/workspace/ScheduleSessionList'

const groupScheduleItems = [
  {
    id: '1',
    title: 'Study Session - Dynamic Programming',
    meta: '12 January 2024 | 12:00 PM - 2:00 PM | 12 members',
  },
  {
    id: '2',
    title: 'Quiz preparation',
    meta: '20 February 2024 | 10:00 AM - 1:00 PM | 10 members',
  },
  {
    id: '3',
    title: 'Group Presentation Rehearsal',
    meta: '15 March 2024 | 3:00 PM - 5:00 PM | 15 members',
  },
]

export function WorkspaceCalendarPage() {
  return <ScheduleSessionList heading="Group Schedule" items={groupScheduleItems} />
}
