export default function StatusTabs({ tabs, counts, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 text-xs ${
                isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {counts[tab.key] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}