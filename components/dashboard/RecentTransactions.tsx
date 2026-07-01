import Link from 'next/link'
import { formatBRL, formatDate } from '@/lib/utils'
import type { Transaction, TransactionType } from '@/lib/types'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const typeColors: Record<TransactionType, string> = {
  income: 'text-[#4ade80]',
  expense: 'text-[#ffb4ab]',
  investment: 'text-[#b7c4ff]',
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ background: '#121224', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-starlight">Últimas Transações</h2>
        <Link
          href="/transactions"
          className="text-xs text-[#b7c4ff] hover:text-[#3264FF] transition-colors"
        >
          Ver todas
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="text-[#8d90a1] text-sm text-center py-4">Nenhuma transação no período</p>
      ) : (
        <ul className="space-y-0">
          {transactions.map((tx, i) => (
            <li
              key={tx.id}
              className="flex items-center justify-between py-3"
              style={
                i < transactions.length - 1
                  ? { borderBottom: '1px solid rgba(255,255,255,0.05)' }
                  : {}
              }
            >
              <div>
                <p className="text-sm text-[#e2e2e2]">{tx.category?.name ?? '—'}</p>
                <p className="text-xs text-[#8d90a1] mt-0.5">{formatDate(tx.date)}</p>
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
