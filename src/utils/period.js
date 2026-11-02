export const PERIODS = [
  { key: 'todo', label: 'Todo el tiempo' },
  { key: 'anho', label: 'Este año' },
  { key: 'mes', label: 'Este mes' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'hoy', label: 'Hoy' },
]

export const DEFAULT_PERIOD = 'todo'

const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Returns { from, to } as 'YYYY-MM-DD' strings (inclusive). Strings compare correctly
// with <= and >=, so we never go through Date objects and timezones can't shift a day.
// The week starts on Monday.
export function getPeriodRange(period, now = new Date()) {
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()

  switch (period) {
    case 'hoy':
      return { from: toISO(now), to: toISO(now) }
    case 'semana': {
      const sinceMonday = (now.getDay() + 6) % 7
      return {
        from: toISO(new Date(y, m, d - sinceMonday)),
        to: toISO(new Date(y, m, d - sinceMonday + 6)),
      }
    }
    case 'mes':
      return { from: `${y}-${pad(m + 1)}-01`, to: toISO(new Date(y, m + 1, 0)) }
    case 'anho':
      return { from: `${y}-01-01`, to: `${y}-12-31` }
    default:
      return { from: null, to: null }
  }
}

export function filterSalesByPeriod(sales, period, now = new Date()) {
  const { from, to } = getPeriodRange(period, now)
  if (!from) return sales
  return sales.filter((s) => s.saleDate >= from && s.saleDate <= to)
}