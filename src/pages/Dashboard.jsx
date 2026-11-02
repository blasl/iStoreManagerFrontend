import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PackageOpen } from 'lucide-react'
import { phoneService } from '../services/phoneService'
import { saleService } from '../services/saleService'
import { filterSalesByPeriod } from '../utils/period'
import { usePeriod } from '../utils/usePeriod'
import {
  daysSince,
  formatDate,
  formatMoney,
  formatPercent,
  formatSigned,
  profitClass,
  sumMoney,
} from '../utils/formatters'
import { getErrorMessage } from '../utils/getErrorMessage'
import PeriodTabs from '../components/PeriodTabs'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import ProfitChart from '../components/ProfitChart'
import { CardsSkeleton, Skeleton } from '../components/Skeleton'

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Net profit per month for the last 6 months (current month included)
function buildMonthlySeries(sales, now = new Date()) {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const profit = sumMoney(sales.filter((s) => s.saleDate.startsWith(key)).map((s) => s.netProfit))
    return { key, label: MONTHS[d.getMonth()], profit }
  })
}

const phoneCost = (p) => sumMoney([p.purchasePrice, p.totalExpenses ?? 0])

function Panel({ title, action, children }) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const [period, setPeriod] = usePeriod()
  const [phones, setPhones] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([phoneService.getActive(), saleService.getAll()])
      setPhones(p)
      setSales(s)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo cargar el resumen.'))
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

  // --- sales metrics (depend on the selected period) ---
  const periodSales = useMemo(() => filterSalesByPeriod(sales, period), [sales, period])

  const salesStats = useMemo(() => {
    const revenue = sumMoney(periodSales.map((s) => s.salePrice))
    const profit = sumMoney(periodSales.map((s) => s.netProfit))
    return { revenue, profit, count: periodSales.length, margin: revenue > 0 ? (profit / revenue) * 100 : NaN }
  }, [periodSales])

  const recentSales = useMemo(
    () => [...periodSales].sort((a, b) => b.saleDate.localeCompare(a.saleDate) || b.id - a.id).slice(0, 5),
    [periodSales]
  )

  // --- stock metrics (independent of the period) ---
  const stock = useMemo(() => {
    const inStock = phones.filter((p) => p.status !== 'VENDIDO')
    const byStatus = { DISPONIBLE: 0, EN_REPARACION: 0, RESERVADO: 0 }
    inStock.forEach((p) => {
      if (byStatus[p.status] !== undefined) byStatus[p.status]++
    })
    return {
      count: inStock.length,
      byStatus,
      tiedUp: sumMoney(inStock.map(phoneCost)),
      invested: sumMoney(phones.map(phoneCost)),
      oldest: [...inStock]
        .sort((a, b) => (a.purchaseDate || '').localeCompare(b.purchaseDate || ''))
        .slice(0, 5),
    }
  }, [phones])

  const monthly = useMemo(() => buildMonthlySeries(sales), [sales])

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40" />
        <CardsSkeleton />
        <CardsSkeleton count={3} />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  if (phones.length === 0 && sales.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <PackageOpen className="h-10 w-10 text-slate-300" />
        <p className="mt-3 font-medium text-slate-700">Bienvenido a iStoreManager</p>
        <p className="text-sm text-slate-500">Agrega tu primer teléfono para ver tus métricas aquí.</p>
        <Link
          to="/inventario"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Ir al inventario
        </Link>
      </div>
    )
  }

  const salesLink = period === 'todo' ? '/ventas' : `/ventas?periodo=${period}`

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Resumen</h1>

      {/* Sales (period) */}
      <section className="space-y-3">
        <PeriodTabs value={period} onChange={setPeriod} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Ganancia neta"
            value={formatSigned(salesStats.profit)}
            className={profitClass(salesStats.profit)}
          />
          <StatCard label="Total vendido" value={formatMoney(salesStats.revenue)} />
          <StatCard label="Ventas" value={salesStats.count} />
          <StatCard label="Margen" value={formatPercent(salesStats.margin)} hint="ganancia / venta" />
        </div>
      </section>

      {/* Stock (always current) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Stock actual</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard
            label="Capital inmovilizado"
            value={formatMoney(stock.tiedUp)}
            hint="compra + gastos del stock"
          />
          <StatCard
            label="Teléfonos en stock"
            value={stock.count}
            hint={`${stock.byStatus.DISPONIBLE} disp. · ${stock.byStatus.EN_REPARACION} rep. · ${stock.byStatus.RESERVADO} res.`}
          />
          <div className="col-span-2 lg:col-span-1">
            <StatCard label="Inversión total" value={formatMoney(stock.invested)} hint="compras + gastos, todos" />
          </div>
        </div>
      </section>

      <Panel title="Ganancia neta por mes (últimos 6 meses)">
        <ProfitChart data={monthly} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Últimas ventas"
          action={
            <Link to={salesLink} className="text-sm font-medium text-indigo-600 hover:underline">
              Ver todas
            </Link>
          }
        >
          {recentSales.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">No hay ventas en este período.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentSales.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{s.phone.model}</p>
                    <p className="text-xs text-slate-500">{formatDate(s.saleDate)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-slate-800">{formatMoney(s.salePrice)}</p>
                    <p className={`text-xs font-semibold ${profitClass(s.netProfit)}`}>
                      {formatSigned(s.netProfit)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Stock más antiguo"
          action={
            <Link to="/inventario" className="text-sm font-medium text-indigo-600 hover:underline">
              Ver inventario
            </Link>
          }
        >
          {stock.oldest.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">No tienes teléfonos en stock.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stock.oldest.map((p) => {
                const days = daysSince(p.purchaseDate)
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{p.model}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <StatusBadge status={p.status} />
                        <span className="text-xs text-slate-500">
                          {days === null ? '—' : `${days} ${days === 1 ? 'día' : 'días'}`}
                        </span>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-slate-800">{formatMoney(phoneCost(p))}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}