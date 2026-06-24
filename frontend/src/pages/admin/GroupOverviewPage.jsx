import { Card } from '@/components/common/Card'
import { ReliabilityScore } from '@/components/reliability/ReliabilityScore'

const demoTeams = [
  {
    id: 'team-alpha',
    name: 'Team Alpha',
    members: [
      { name: 'Alex Opoku', reliability: 92 },
      { name: 'Michael Owusu', reliability: 85 },
      { name: 'Emmanuel Donkor', reliability: 38, flagged: true },
      { name: 'Student Four', reliability: 71 },
    ],
  },
]

export function GroupOverviewPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Team overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          All clustered teams with reliability flags for at-risk participants.
        </p>
      </header>

      {demoTeams.map((team) => (
        <Card key={team.id} title={team.name} description={`${team.members.length} members`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 font-medium">Student</th>
                  <th className="py-2 font-medium">Reliability</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {team.members.map((member) => (
                  <tr key={member.name} className="border-b border-slate-100">
                    <td className="py-3 font-medium text-slate-800">{member.name}</td>
                    <td className="py-3">
                      <ReliabilityScore score={member.reliability} size="sm" showLabel={false} />
                    </td>
                    <td className="py-3">
                      {member.flagged ? (
                        <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                          Low reliability
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          On track
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  )
}
