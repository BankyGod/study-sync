import { Upload } from 'lucide-react'
import { ScheduleSessionList } from '@/components/workspace/ScheduleSessionList'

const courseScheduleItems = [
  {
    id: '1',
    title: 'Study Session - Dynamic Programming',
    meta: '12 October, 2023 | 12:00 PM - 2:00 PM | Online Meeting',
  },
  {
    id: '2',
    title: 'File Submission',
    meta: '15 October, 2023 | 11:59 PM | Online File Submission',
  },
  {
    id: '3',
    title: 'Group Presentation Session',
    meta: '18 October, 2023 | 3:00 PM - 5:00 PM | Online Meeting',
  },
]

export function WorkspaceFilesPage() {
  return (
    <>
      <ScheduleSessionList heading="Course Schedule" items={courseScheduleItems} />
      <FileRepositorySection />
    </>
  )
}

function FileRepositorySection() {
  return (
    <section className="mt-8 flex min-h-[280px] flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Shared Files</h2>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
          <Upload className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-700">No files uploaded yet</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Upload project assets, notes, and submissions for your team to access.
        </p>
      </div>
    </section>
  )
}
