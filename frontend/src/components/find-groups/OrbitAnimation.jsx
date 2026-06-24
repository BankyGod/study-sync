const ORBIT_NODES = [
  { id: 'a', label: 'A', delay: '0s' },
  { id: 's', label: 'S', delay: '-3.6s' },
  { id: 'b', label: 'B', delay: '-7.2s' },
  { id: 'm', label: 'M', delay: '-10.8s' },
  { id: 'k', label: 'K', delay: '-14.4s' },
]

const RING_COUNT = 4
const ORBIT_RADIUS = 118

export function OrbitAnimation() {
  return (
    <div className="orbit-scene relative mx-auto flex h-[320px] w-[320px] items-center justify-center sm:h-[360px] sm:w-[360px]">
      {Array.from({ length: RING_COUNT }).map((_, index) => (
        <div
          key={index}
          className="orbit-ring absolute rounded-full border border-teal-200/40"
          style={{
            width: `${100 - index * 18}%`,
            height: `${100 - index * 18}%`,
          }}
        />
      ))}

      <div
        className="absolute rounded-full border border-dashed border-teal-300/50"
        style={{ width: ORBIT_RADIUS * 2 + 48, height: ORBIT_RADIUS * 2 + 48 }}
      />

      <div className="absolute inset-0">
        {ORBIT_NODES.map((node) => (
          <div
            key={node.id}
            className="orbit-node absolute left-1/2 top-1/2"
            style={{
              '--orbit-radius': `${ORBIT_RADIUS}px`,
              animationDelay: node.delay,
            }}
          >
            <div className="flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal-500 text-sm font-semibold text-white shadow-md shadow-teal-500/30">
              {node.label}
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-teal-500 text-lg font-bold text-white shadow-lg shadow-sky-500/30">
        You
      </div>
    </div>
  )
}
