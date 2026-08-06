import { cn } from '@/utils/cn'

const ORBIT_NODES = [
  { id: 'a', label: 'A', delay: '0s' },
  { id: 's', label: 'S', delay: '-3.6s' },
  { id: 'b', label: 'B', delay: '-7.2s' },
  { id: 'm', label: 'M', delay: '-10.8s' },
  { id: 'k', label: 'K', delay: '-14.4s' },
]

const RING_COUNT = 4

export function OrbitAnimation({ paused = false }) {
  return (
    <div
      className={cn(
        'orbit-scene relative mx-auto aspect-square w-full max-w-[min(100%,20rem)] sm:max-w-[22.5rem]',
        paused && 'opacity-70',
      )}
      style={{
        '--orbit-radius': 'clamp(4.25rem, 28vw, 7.375rem)',
      }}
    >
      {Array.from({ length: RING_COUNT }).map((_, index) => (
        <div
          key={index}
          className="orbit-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-200/40"
          style={{
            width: `${100 - index * 18}%`,
            height: `${100 - index * 18}%`,
          }}
        />
      ))}

      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-brand-200"
        style={{
          width: 'calc(var(--orbit-radius) * 2 + 2.5rem)',
          height: 'calc(var(--orbit-radius) * 2 + 2.5rem)',
        }}
      />

      <div className="absolute inset-0">
        {ORBIT_NODES.map((node) => (
          <div
            key={node.id}
            className="orbit-node absolute left-1/2 top-1/2"
            style={{
              animationDelay: node.delay,
            }}
          >
            <div className="flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-surface shadow-md sm:h-10 sm:w-10 sm:text-sm">
              {node.label}
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-surface shadow-lg sm:h-24 sm:w-24 sm:text-lg">
        You
      </div>
    </div>
  )
}
