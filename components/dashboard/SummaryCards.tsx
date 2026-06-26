// components/dashboard/SummaryCards.tsx
import { formatBRL } from '@/lib/utils'

interface SummaryCardsProps {
  totalIncome: number
  totalExpense: number
  totalInvestment: number
  balance: number
}

export default function SummaryCards({
  totalIncome,
  totalExpense,
  totalInvestment,
  balance,
}: SummaryCardsProps) {
  const cards = [
    {
      label: 'Saldo do Mês',
      value: balance,
      color: balance >= 0 ? 'text-green-600' : 'text-red-600',
      bg: balance >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    { label: 'Receitas', value: totalIncome, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Despesas', value: totalExpense, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Investimentos', value: totalInvestment, color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, color, bg }) => (
        <div key={label} className={`rounded-xl border border-gray-200 p-4 ${bg}`}>
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{formatBRL(value)}</p>
        </div>
      ))}
    </div>
  )
}
