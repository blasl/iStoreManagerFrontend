import { STATUS } from '../utils/phoneStatus'

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, badge: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}>
      {s.label}
    </span>
  )
}