'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL, formatDate } from '@/lib/utils'
import type { Transaction, TransactionType } from '@/lib/types'

interface TransactionListProps {
  transactions: Transaction[]
  currentUserId: string
}

const typeColors: Record<TransactionType, string> = {
  income: 'text-green-600',
  expense: 'text-red-600',
  investment: 'text-blue-600',
}

const typeLabels: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
  investment: 'Investimento',
}

export default function TransactionList({ transactions, currentUserId }: TransactionListProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta transação?')) return
    setDeleting(id)

    const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    setDeleting(null)

    if (response.ok) {
      router.refresh()
    } else {
      alert('Erro ao excluir. Tente novamente.')
    }
  }

  if (transactions.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-8 text-center">
        Nenhuma transação encontrada.
      </p>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Categoria</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Descrição</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Valor</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Membro</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">{formatDate(tx.date)}</td>
              <td className="px-4 py-3">
                <span className={`font-medium ${typeColors[tx.type]}`}>
                  {typeLabels[tx.type]}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">{tx.category?.name ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500">{tx.description ?? '—'}</td>
              <td className={`px-4 py-3 text-right font-medium ${typeColors[tx.type]}`}>
                {formatBRL(Number(tx.amount))}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {tx.user_id !== currentUserId
                  ? (tx.profile as { name: string } | undefined)?.name ?? '—'
                  : null}
              </td>
              <td className="px-4 py-3">
                {tx.user_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deleting === tx.id}
                    className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 text-xs"
                  >
                    {deleting === tx.id ? '...' : 'Excluir'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
