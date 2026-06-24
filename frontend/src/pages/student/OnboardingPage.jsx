import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { DAYS_OF_WEEK, SKILL_AREAS } from '@/utils/constants'

export function OnboardingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Profile onboarding</h1>
        <p className="mt-1 text-sm text-slate-500">
          Share your availability, skills, and peer preferences for group matching.
        </p>
      </header>

      <Card title="Weekly availability" description="Select days and times you can collaborate.">
        <div className="grid gap-3 sm:grid-cols-2">
          {DAYS_OF_WEEK.map((day) => (
            <label
              key={day}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm"
            >
              <input type="checkbox" className="rounded border-slate-300" />
              <span className="font-medium text-slate-800">{day}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card title="Academic capabilities" description="Self-assessed skill ratings (1–5).">
        <div className="space-y-4">
          {SKILL_AREAS.map((skill) => (
            <div key={skill} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-700">{skill}</span>
              <input type="range" min="1" max="5" defaultValue="3" className="w-40" />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Peer preferences" description="Optional inclusion or exclusion constraints.">
        <textarea
          rows={4}
          placeholder="e.g. Prefer to work with Alex; avoid pairing with..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </Card>

      <div className="flex justify-end">
        <Button>Save profile</Button>
      </div>
    </div>
  )
}
