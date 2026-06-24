import { OrbitAnimation } from '@/components/find-groups/OrbitAnimation'
import { MatchingProgress } from '@/components/find-groups/MatchingProgress'
import { useSimulatedMatchingProgress } from '@/hooks/useSimulatedMatchingProgress'

export function FindGroupsPage() {
  const { progress, steps } = useSimulatedMatchingProgress({ targetProgress: 64 })

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Finding Your Perfect Study Group
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500">
          Our smart algorithm is searching through thousands of study groups to find the perfect
          match for your learning style and goals.
        </p>
      </header>

      <OrbitAnimation />

      <div className="mt-10">
        <MatchingProgress progress={progress} steps={steps} />
      </div>
    </div>
  )
}
