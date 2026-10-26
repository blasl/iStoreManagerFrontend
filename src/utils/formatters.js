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