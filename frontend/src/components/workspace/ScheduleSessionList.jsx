export function ScheduleSessionList({ heading, items }) {
  return (
    <section>
      <h2 className="mb-4 text-base font-bold text-slate-900">{heading}</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-sky-50/70 px-5 py-4"
          >
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Join
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
