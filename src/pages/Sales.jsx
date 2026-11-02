import { useCallback, useEffect, useMemo, useState } from 'react'
import { Receipt } from 'lucide-react'
import { saleService } from '../services/saleService'
import { PERIODS, filterSalesByPeriod } from '../utils/period'
import { usePeriod } from '../utils/usePeriod'
import { formatDate, formatMoney, formatSigned, profitClass, sumMoney } from '../utils/formatters'
import { getErrorMessage } from '../utils/getErrorMessage'
import PeriodTabs from '../components/PeriodTabs'
import StatCard from '../components/StatCard'
import { CardsSkeleton, ListSkeleton } from '../components/Skeleton'

export default function Sales() {
  const [period, setPeriod] = usePeriod()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setSales(await saleService.getAll())
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar las ventas.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const retry = () => {
    setLoading(true)
    load()
  }

  const filtered = useMemo(() => filterSalesByPeriod(sales, period), [sales, period])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.saleDate.localeCompare(a.saleDate) || b.id - a.id),
    [filtered]
  )

  const totals = useMemo(
    () => ({
      revenue: sumMoney(filtered.map((s) => s.salePrice)),
      cost: sumMoney(filtered.map((s) => s.totalCost)),
      profit: sumMoney(filtered.map((s) => s.netProfit)),
    }),
    [filtered]
  )

  const periodLabel = PERIODS.find((p) => p.key === period)?.label.toLowerCase()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Ventas</h1>
        <p className="text-sm text-slate-500">
          {loading
            ? 'Cargando…'
            : `${filtered.length} ${filtered.length === 1 ? 'venta' : 'ventas'} · ${periodLabel}`}
        </p>
      </div>

      <PeriodTabs value={period} onChange={setPeriod} />

      {loading ? (
        <>
          <CardsSkeleton />
          <ListSkeleton />
        </>
      ) : error ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            Reintentar
          </button>
        </div>
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <Receipt className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">Aún no hay ventas</p>
          <p className="text-sm text-slate-500">Marca un teléfono como vendido desde el inventario.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <Receipt className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">No hay ventas en este período</p>
          <button
            type="button"
            onClick={() => setPeriod('todo')}
            className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
          >
            Ver todo el tiempo
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Ventas" value={filtered.length} />
            <StatCard label="Total vendido" value={formatMoney(totals.revenue)} />
            <StatCard label="Costo total" value={formatMoney(totals.cost)} />
            <StatCard
              label="Ganancia neta"
              value={formatSigned(totals.profit)}
              className={profitClass(totals.profit)}
            />
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Precio de venta</th>
                  <th className="px-4 py-3 text-right">Costo total</th>
                  <th className="px-4 py-3 text-right">Ganancia neta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{s.phone.model}</p>
                      <p className="text-xs text-slate-500">
                        {[s.phone.storage, `IMEI ${s.phone.imei}`].filter(Boolean).join(' · ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(s.saleDate)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{formatMoney(s.salePrice)}</td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-slate-800">{formatMoney(s.totalCost)}</p>
                      {s.totalExpenses > 0 && (
                        <p className="text-xs text-slate-400">
                          {formatMoney(s.phone.purchasePrice)} + {formatMoney(s.totalExpenses)}
                        </p>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${profitClass(s.netProfit)}`}>
                      {formatSigned(s.netProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 md:hidden">
            {sorted.map((s) => (
              <li key={s.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-800">{s.phone.model}</p>
                  <p className="truncate text-xs text-slate-500">
                    {[s.phone.storage, formatDate(s.saleDate)].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-xs text-slate-400">Costo {formatMoney(s.totalCost)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-slate-800">{formatMoney(s.salePrice)}</p>
                  <p className={`text-sm font-semibold ${profitClass(s.netProfit)}`}>{formatSigned(s.netProfit)}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}