import { PERIODS } from '../utils/period'

export default function PeriodTabs({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Período">
      {PERIODS.map((p) => {
        const active = value === p.key
        return (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(p.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              active
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}