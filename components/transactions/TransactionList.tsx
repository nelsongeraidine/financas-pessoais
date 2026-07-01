'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { formatBRL, formatDate } from '@/lib/utils'
import type { Transaction, TransactionType } from '@/lib/types'

interface TransactionListProps {
  transactions: Transaction[]
  currentUserId: string
}

const typeColors: Record<TransactionType, string> = {
  income: 'text-[#4ade80]',
  expense: 'text-[#ffb4ab]',
  investment: 'text-[#b7c4ff]',
}

const typeBadgeStyles: Record<TransactionType, string> = {
  income: 'bg-[rgba(74,222,128,0.1)] border border-[#4ade80] text-[#4ade80]',
  expense: 'bg-[rgba(255,180,171,0.1)] border border-[#ffb4ab] text-[#ffb4ab]',
  investment: 'bg-[rgba(183,196,255,0.1)] border border-[#b7c4ff] text-[#b7c4ff]',
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
    if (response.ok) router.refresh()
    else alert('Erro ao excluir. Tente novamente.')
  }

  if (transactions.length === 0) {
    return (
      <p className="text-[#8d90a1] text-sm py-8 text-center">Nenhuma transação encontrada.</p>
    )
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#121224', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Data</th>
            <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Tipo</th>
            <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Categoria</th>
            <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Descrição</th>
            <th className="text-right px-4 py-3 font-medium text-[#8d90a1]">Valor</th>
            <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Membro</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="transition-colors hover:bg-[rgba(255,255,255,0.03)]"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <td className="px-4 py-3 text-[#8d90a1]">{formatDate(tx.date)}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${typeBadgeStyles[tx.type]}`}>
                  {typeLabels[tx.type]}
                </span>
              </td>
              <td className="px-4 py-3 text-[#e2e2e2]">{tx.category?.name ?? '—'}</td>
              <td className="px-4 py-3 text-[#8d90a1]">{tx.description ?? '—'}</td>
              <td className={`px-4 py-3 text-right font-medium ${typeColors[tx.type]}`}>
                {formatBRL(Number(tx.amount))}
              </td>
              <td className="px-4 py-3 text-[#8d90a1] text-xs">
                {tx.user_id !== currentUserId
                  ? (tx.profile as { name: string } | undefined)?.name ?? '—'
                  : null}
              </td>
              <td className="px-4 py-3">
                {tx.user_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deleting === tx.id}
                    className="text-[#8d90a1] hover:text-[#ffb4ab] transition-colors disabled:opacity-50"
                    title="Excluir"
                  >
                    {deleting === tx.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <Trash2 size={14} />
                    )}
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
