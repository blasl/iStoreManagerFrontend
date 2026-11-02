const currency = new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' })

export const formatMoney = (value) =>
  value === null || value === undefined ? '—' : currency.format(value)


export const formatDate = (iso) => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export const todayISO = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export const sumMoney = (values) =>
  Math.round(values.reduce((acc, v) => acc + Number(v || 0), 0) * 100) / 100

export const profitClass = (value) =>
  value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-600' : 'text-slate-600'

export const formatSigned = (value) =>
  value > 0 ? `+${formatMoney(value)}` : formatMoney(value)

export const daysSince = (iso) => {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  const [ty, tm, td] = todayISO().split('-').map(Number)
  return Math.max(0, Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(y, m - 1, d)) / 86400000))
}

export const formatPercent = (value) => (Number.isFinite(value) ? `${value.toFixed(1)}%` : '—')

export const formatCompact = (value) =>
  new Intl.NumberFormat('es-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)