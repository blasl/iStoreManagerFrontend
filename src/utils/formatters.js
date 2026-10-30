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