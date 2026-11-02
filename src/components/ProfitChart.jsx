import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact, formatMoney } from '../utils/formatters'

export default function ProfitChart({ data }) {
  const empty = data.every((d) => d.profit === 0)

  if (empty) {
    return <p className="py-10 text-center text-sm text-slate-500">Sin ventas en los últimos 6 meses.</p>
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis
            width={44}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={formatCompact}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            formatter={(value) => [formatMoney(value), 'Ganancia neta']}
          />
          <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.key} fill={d.profit < 0 ? '#dc2626' : '#059669'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}