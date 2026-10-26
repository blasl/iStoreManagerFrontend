import { Pencil, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatDate, formatMoney } from '../utils/formatters'

function RowActions({ phone, onEdit, onDelete }) {
  // Sold phones are locked (sales get their own flow in Phase 4)
  if (phone.status === 'VENDIDO') return null
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onEdit(phone)}
        aria-label={`Editar ${phone.model}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(phone)}
        aria-label={`Eliminar ${phone.model}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

const battery = (phone) => (phone.batteryHealth != null ? `${phone.batteryHealth}%` : '—')

export default function PhoneTable({ phones, onEdit, onDelete }) {
  return (
    <>
      {/* Desktop / tablet: table (md and up) */}
      <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Modelo</th>
              <th className="px-4 py-3">IMEI</th>
              <th className="px-4 py-3">Capacidad</th>
              <th className="px-4 py-3">Batería</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Compra</th>
              <th className="px-4 py-3 text-right">Objetivo</th>
              <th className="hidden px-4 py-3 lg:table-cell">Fecha</th>
              <th className="px-4 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {phones.map((phone) => (
              <tr key={phone.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{phone.model}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{phone.imei}</td>
                <td className="px-4 py-3 text-slate-600">{phone.storage || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{battery(phone)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={phone.status} />
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-800">
                  {formatMoney(phone.purchasePrice)}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{formatMoney(phone.targetPrice)}</td>
                <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                  {formatDate(phone.purchaseDate)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowActions phone={phone} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: compact cards, no horizontal scroll */}
      <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 md:hidden">
        {phones.map((phone) => {
          const details = [
            phone.storage,
            phone.batteryHealth != null && `Bat. ${phone.batteryHealth}%`,
            phone.imei && `IMEI …${phone.imei.slice(-4)}`,
          ]
            .filter(Boolean)
            .join(' · ')

          return (
            <li key={phone.id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">{phone.model}</p>
                <p className="truncate text-xs text-slate-500">{details}</p>
                <div className="mt-1.5">
                  <StatusBadge status={phone.status} />
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <div className="text-right">
                  <p className="font-semibold text-slate-800">{formatMoney(phone.purchasePrice)}</p>
                  {phone.targetPrice != null && (
                    <p className="text-xs text-slate-500">Obj. {formatMoney(phone.targetPrice)}</p>
                  )}
                </div>
                <RowActions phone={phone} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}