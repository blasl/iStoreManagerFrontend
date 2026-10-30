import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from './Modal'
import { saleService } from '../services/saleService'
import { formatMoney, formatSigned, profitClass, sumMoney, todayISO } from '../utils/formatters'
import { getErrorMessage } from '../utils/getErrorMessage'
import { inputClass } from '../utils/styles'

export default function SellModal({ phone, onClose, onSold }) {
  const [price, setPrice] = useState(phone.targetPrice ?? '')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const cost = sumMoney([phone.purchasePrice, phone.totalExpenses ?? 0])
  const hasPrice = price !== '' && !Number.isNaN(Number(price))
  const profit = hasPrice ? sumMoney([Number(price), -cost]) : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hasPrice || Number(price) < 0) return setError('Ingresa un precio de venta válido.')
    if (!date) return setError('Selecciona la fecha de venta.')
    if (date > todayISO()) return setError('La fecha de venta no puede ser futura.')
    if (phone.purchaseDate && date < phone.purchaseDate)
      return setError('La fecha de venta no puede ser anterior a la fecha de compra.')

    setError('')
    setSubmitting(true)
    try {
      const sale = await saleService.register(phone.id, { salePrice: Number(price), saleDate: date })
      onSold(sale)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo registrar la venta.'))
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Marcar como vendido" onClose={submitting ? () => {} : onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <p className="font-semibold text-slate-800">{phone.model}</p>
          <p className="text-xs text-slate-500">
            {[phone.storage, `IMEI …${phone.imei.slice(-4)}`].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Precio de venta <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              inputMode="decimal"
              autoFocus
              className={`${inputClass} mt-1`}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Fecha de venta</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={phone.purchaseDate || undefined}
              max={todayISO()}
              className={`${inputClass} mt-1`}
            />
          </label>
        </div>

        {/* Live profit preview */}
        <div className="space-y-1.5 rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Precio de venta</span>
            <span>{hasPrice ? formatMoney(Number(price)) : '—'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Costo total (compra + gastos)</span>
            <span>− {formatMoney(cost)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1.5 font-semibold">
            <span className="text-slate-800">Ganancia neta</span>
            <span className={profit === null ? 'text-slate-400' : profitClass(profit)}>
              {profit === null ? '—' : formatSigned(profit)}
            </span>
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar venta
          </button>
        </div>
      </form>
    </Modal>
  )
}