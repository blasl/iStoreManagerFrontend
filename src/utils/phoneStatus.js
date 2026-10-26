export const STATUS = {
  DISPONIBLE: { label: 'Disponible', badge: 'bg-emerald-100 text-emerald-700' },
  EN_REPARACION: { label: 'En reparación', badge: 'bg-amber-100 text-amber-700' },
  RESERVADO: { label: 'Reservado', badge: 'bg-sky-100 text-sky-700' },
  VENDIDO: { label: 'Vendido', badge: 'bg-slate-200 text-slate-700' },
}

// Statuses the user can pick in the form (VENDIDO only comes from registering a sale)
export const EDITABLE_STATUSES = ['DISPONIBLE', 'EN_REPARACION', 'RESERVADO']

export const FILTER_TABS = [
  { key: 'ALL', label: 'Todos' },
  { key: 'DISPONIBLE', label: 'Disponibles' },
  { key: 'EN_REPARACION', label: 'En reparación' },
  { key: 'RESERVADO', label: 'Reservados' },
  { key: 'VENDIDO', label: 'Vendidos' },
]