import { DollarSign, Pencil, Receipt, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatDate, formatMoney, sumMoney } from '../utils/formatters'

const cost = (p) => sumMoney([p.purchasePrice, p.totalExpenses ?? 0])

function RowActions({ phone, onOpen, onSell, onEdit, onDelete }) {
  const sold = phone.status === 'VENDIDO'
  const base = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 md:h-9 md:w-9 '

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => onOpen(phone)}
        aria-label={sold ? 'Ver detalle' : `Gastos de ${phone.model}`}
        title={sold ? 'Ver detalle' : 'Gastos'}
        className={base + 'hover:bg-slate-100 hover:text-indigo-600'}
      >
        <Receipt className="h-4 w-4" />
      </button>

      {!sold && (
        <>
          <button
            type="button"
            onClick={() => onSell(phone)}
            aria-label={`Vender ${phone.model}`}
            title="Marcar como vendido"
            className={base + 'hover:bg-emerald-50 hover:text-emerald-600'}
          >
            <DollarSign className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(phone)}
            aria-label={`Editar ${phone.model}`}
            title="Editar"
            className={base + 'hover:bg-slate-100 hover:text-indigo-600'}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(phone)}
            aria-label={`Eliminar ${phone.model}`}
            title="Eliminar"
            className={base + 'hover:bg-red-50 hover:text-red-600'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  )
}

export default function PhoneTable({ phones, onOpen, onSell, onEdit, onDelete }) {
  const actions = { onOpen, onSell, onEdit, onDelete }

  return (
    <>
      {/* Desktop / tablet: table (md and up) */}
      <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Modelo</th>
              <th className="hidden px-4 py-3 lg:table-cell">IMEI</th>
              <th className="px-4 py-3">Batería</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Costo total</th>
              <th className="px-4 py-3 text-right">Objetivo</th>
              <th className="hidden px-4 py-3 lg:table-cell">Fecha</th>
              <th className="px-4 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {phones.map((phone) => (
              <tr key={phone.id} onClick={() => onOpen(phone)} className="cursor-pointer hover:bg-slate-50">
                <td className="px-4 py-3">
                  <button type="button" onClick={() => onOpen(phone)} className="text-left font-medium text-slate-800">
                    {phone.model}
                  </button>
                  {phone.storage && <p className="text-xs text-slate-500">{phone.storage}</p>}
                </td>
                <td className="hidden px-4 py-3 font-mono text-xs text-slate-600 lg:table-cell">{phone.imei}</td>
                <td className="px-4 py-3 text-slate-600">
                  {phone.batteryHealth != null ? `${phone.batteryHealth}%` : '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={phone.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-medium text-slate-800">{formatMoney(cost(phone))}</p>
                  {phone.totalExpenses > 0 && (
                    <p className="text-xs text-slate-400">
                      {formatMoney(phone.purchasePrice)} + {formatMoney(phone.totalExpenses)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{formatMoney(phone.targetPrice)}</td>
                <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{formatDate(phone.purchaseDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowActions phone={phone} {...actions} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: compact cards */}
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
            <li key={phone.id} onClick={() => onOpen(phone)} className="flex cursor-pointer items-center gap-3 p-3">
              <button type="button" onClick={() => onOpen(phone)} className="min-w-0 flex-1 text-left">
                <p className="truncate font-semibold text-slate-800">{phone.model}</p>
                <p className="truncate text-xs text-slate-500">{details}</p>
                <div className="mt-1.5">
                  <StatusBadge status={phone.status} />
                </div>
              </button>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <div className="text-right">
                  <p className="font-semibold text-slate-800">{formatMoney(cost(phone))}</p>
                  <p className="text-xs text-slate-500">
                    {phone.targetPrice != null ? `Obj. ${formatMoney(phone.targetPrice)}` : 'Costo total'}
                  </p>
                </div>
                <RowActions phone={phone} {...actions} />
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}