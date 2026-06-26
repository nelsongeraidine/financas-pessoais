// components/dashboard/RecentTransactions.tsx
import Link from 'next/link'
import { formatBRL, formatDate } from '@/lib/utils'
import type { Transaction, TransactionType } from '@/lib/types'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const typeColors: Record<TransactionType, string> = {
  income: 'text-green-600',
  expense: 'text-red-600',
  investment: 'text-blue-600',
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Últimas Transações</h2>
        <Link href="/transactions" className="text-xs text-blue-600 hover:underline">
          Ver todas
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">Nenhuma transação no período</p>
      ) : (
        <ul className="space-y-3">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">{tx.category?.name ?? '—'}</p>
                <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
              </div>
              <span className={`text-sm font-semibold ${typeColors[tx.type]}`}>
                {formatBRL(Number(tx.amount))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
