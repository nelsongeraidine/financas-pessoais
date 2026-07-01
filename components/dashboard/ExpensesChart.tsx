'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ChartItem {
  name: string
  value: number
}

const COLORS = ['#3264FF', '#7C9FFF', '#B7C4FF', '#FF6B6B', '#FFB347', '#4ade80']

interface ExpensesChartProps {
  data: ChartItem[]
}

export default function ExpensesChart({ data }: ExpensesChartProps) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ background: '#121224', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <h2 className="text-base font-semibold text-starlight mb-4">Despesas por Categoria</h2>
      {data.length === 0 ? (
        <p className="text-[#8d90a1] text-sm text-center py-8">Sem despesas no período</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']}
              contentStyle={{
                background: '#1e2020',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#e2e2e2',
              }}
            />
            <Legend wrapperStyle={{ color: '#8d90a1', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
