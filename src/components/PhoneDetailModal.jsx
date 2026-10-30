import { useEffect, useState } from 'react'
import { DollarSign, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import Modal from './Modal'
import StatusBadge from './StatusBadge'
import { expenseService } from '../services/expenseService'
import { saleService } from '../services/saleService'
import { formatDate, formatMoney, formatSigned, profitClass, sumMoney } from '../utils/formatters'
import { getErrorMessage } from '../utils/getErrorMessage'
import { inputClass } from '../utils/styles'

function Row({ label, value, strong, className = '' }) {
  return (
    <div className={`flex justify-between text-sm ${strong ? 'font-semibold' : ''}`}>
      <span className={strong ? 'text-slate-800' : 'text-slate-500'}>{label}</span>
      <span className={className || 'text-slate-800'}>{value}</span>
    </div>
  )
}

export default function PhoneDetailModal({ phone, onClose, onEdit, onSell, onExpensesChange }) {
  const isSold = phone.status === 'VENDIDO'

  const [expenses, setExpenses] = useState(null) // null = loading
  const [sale, setSale] = useState(null)
  const [loadError, setLoadError] = useState('')

  const [form, setForm] = useState({ concept: '', amount: '' })
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    let cancelled = false
    const requests = [expenseService.getByPhone(phone.id)]
    if (isSold) requests.push(saleService.getAll())

    Promise.all(requests)
      .then(([exp, sales]) => {
        if (cancelled) return
        setExpenses(exp)
        if (sales) setSale(sales.find((s) => s.phone.id === phone.id) ?? null)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err, 'No se pudo cargar el detalle.'))
      })
    return () => {
      cancelled = true
    }
  }, [phone.id, isSold])

  const totalExpenses = expenses
    ? sumMoney(expenses.map((e) => e.amount))
    : Number(phone.totalExpenses ?? 0)
  const totalCost = sumMoney([phone.purchasePrice, totalExpenses])
  const estimatedProfit = phone.targetPrice != null ? sumMoney([phone.targetPrice, -totalCost]) : null

  const handleAdd = async (e) => {
    e.preventDefault()
    const concept = form.concept.trim()
    const amount = Number(form.amount)
    if (!concept) return setFormError('Ingresa un concepto.')
    if (!form.amount || amount <= 0) return setFormError('Ingresa un monto mayor a 0.')

    setFormError('')
    setAdding(true)
    try {
      const created = await expenseService.add(phone.id, { concept, amount })
      const next = [...expenses, created]
      setExpenses(next)
      onExpensesChange(phone.id, sumMoney(next.map((x) => x.amount)))
      setForm({ concept: '', amount: '' })
    } catch (err) {
      setFormError(getErrorMessage(err, 'No se pudo agregar el gasto.'))
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (id) => {
    setFormError('')
    setRemovingId(id)
    try {
      await expenseService.remove(id)
      const next = expenses.filter((x) => x.id !== id)
      setExpenses(next)
      onExpensesChange(phone.id, sumMoney(next.map((x) => x.amount)))
    } catch (err) {
      setFormError(getErrorMessage(err, 'No se pudo eliminar el gasto.'))
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <Modal title={phone.model} onClose={onClose}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <StatusBadge status={phone.status} />
          {phone.storage && <span>{phone.storage}</span>}
          {phone.batteryHealth != null && <span>Batería {phone.batteryHealth}%</span>}
          <span className="font-mono text-xs">IMEI {phone.imei}</span>
          <span>Comprado el {formatDate(phone.purchaseDate)}</span>
        </div>

        {phone.notes && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{phone.notes}</p>
        )}

        {/* Cost breakdown */}
        <section className="space-y-1.5 rounded-lg border border-slate-200 px-4 py-3">
          <Row label="Precio de compra" value={formatMoney(phone.purchasePrice)} />
          <Row label="Gastos extra" value={`+ ${formatMoney(totalExpenses)}`} />
          <div className="border-t border-slate-200 pt-1.5">
            <Row label="Costo total" value={formatMoney(totalCost)} strong />
          </div>
          {!isSold && estimatedProfit !== null && (
            <>
              <Row label="Precio objetivo" value={formatMoney(phone.targetPrice)} />
              <Row
                label="Ganancia estimada"
                value={formatSigned(estimatedProfit)}
                className={profitClass(estimatedProfit)}
              />
            </>
          )}
        </section>

        {/* Sale info (sold phones) */}
        {isSold && (
          <section className="space-y-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            {sale ? (
              <>
                <Row label="Precio de venta" value={formatMoney(sale.salePrice)} />
                <Row label="Fecha de venta" value={formatDate(sale.saleDate)} />
                <div className="border-t border-emerald-200 pt-1.5">
                  <Row
                    label="Ganancia neta"
                    value={formatSigned(sale.netProfit)}
                    className={profitClass(sale.netProfit)}
                    strong
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">{loadError || 'Cargando venta…'}</p>
            )}
          </section>
        )}

        {/* Expenses */}
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Gastos de acondicionamiento</h3>

          {expenses === null && !loadError && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            </div>
          )}
          {loadError && expenses === null && <p className="text-sm text-red-600">{loadError}</p>}

          {expenses && expenses.length === 0 && (
            <p className="text-sm text-slate-500">Todavía no hay gastos registrados.</p>
          )}

          {expenses && expenses.length > 0 && (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {expenses.map((exp) => (
                <li key={exp.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate text-slate-700">{exp.concept}</span>
                  <span className="font-medium text-slate-800">{formatMoney(exp.amount)}</span>
                  {!isSold && (
                    <button
                      type="button"
                      onClick={() => handleRemove(exp.id)}
                      disabled={removingId === exp.id}
                      aria-label={`Eliminar gasto ${exp.concept}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {removingId === exp.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!isSold && (
            <form onSubmit={handleAdd} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={form.concept}
                onChange={(e) => setForm({ ...form, concept: e.target.value })}
                placeholder="Concepto (ej. cambio de pantalla)"
                className={`${inputClass} sm:flex-1`}
              />
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Monto"
                min="0"
                step="0.01"
                inputMode="decimal"
                className={`${inputClass} sm:w-28`}
              />
              <button
                type="submit"
                disabled={adding || expenses === null}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Agregar
              </button>
            </form>
          )}

          {formError && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
        </section>

        {/* Footer actions */}
        {!isSold && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onEdit(phone)}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => onSell(phone)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <DollarSign className="h-4 w-4" />
              Marcar como vendido
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}