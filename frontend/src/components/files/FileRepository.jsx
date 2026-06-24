import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Upload } from 'lucide-react'

export function FileRepository({ files = [] }) {
  return (
    <Card
      title="File Repository"
      description="Upload and share project assets with your team."
      action={
        <Button size="sm" variant="secondary">
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      }
    >
      {files.length === 0 ? (
        <p className="text-sm text-slate-500">No files uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium text-slate-800">{file.name}</span>
              <span className="text-xs text-slate-500">{file.size}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
