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
      color: balance >= 0 ? 'text-[#4ade80]' : 'text-[#ffb4ab]',
    },
    { label: 'Receitas', value: totalIncome, color: 'text-[#4ade80]' },
    { label: 'Despesas', value: totalExpense, color: 'text-[#ffb4ab]' },
    { label: 'Investimentos', value: totalInvestment, color: 'text-[#b7c4ff]' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, color }) => (
        <div
          key={label}
          className="rounded-xl p-6"
          style={{ background: '#121224', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs text-[#8d90a1] mb-2 uppercase tracking-widest font-medium">
            {label}
          </p>
          <p className={`text-2xl font-bold ${color}`}>{formatBRL(value)}</p>
        </div>
      ))}
    </div>
  )
}
