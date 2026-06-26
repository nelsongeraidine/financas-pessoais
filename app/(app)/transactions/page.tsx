// app/(app)/transactions/page.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TransactionList from '@/components/transactions/TransactionList'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { type?: string; start?: string; end?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let query = supabase
    .from('transactions')
    .select('*, category:categories(id, name, type, icon)')
    .order('date', { ascending: false })

  if (searchParams.type && ['expense', 'income', 'investment'].includes(searchParams.type)) {
    query = query.eq('type', searchParams.type)
  }
  if (searchParams.start) query = query.gte('date', searchParams.start)
  if (searchParams.end) query = query.lte('date', searchParams.end)

  const { data: transactions } = await query

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
        <Link
          href="/transactions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nova Transação
        </Link>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="type"
          defaultValue={searchParams.type ?? ''}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os tipos</option>
          <option value="expense">Despesas</option>
          <option value="income">Receitas</option>
          <option value="investment">Investimentos</option>
        </select>
        <input
          type="date"
          name="start"
          defaultValue={searchParams.start ?? ''}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          name="end"
          defaultValue={searchParams.end ?? ''}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          Filtrar
        </button>
        <Link
          href="/transactions"
          className="text-gray-500 text-sm py-2 hover:text-gray-700"
        >
          Limpar
        </Link>
      </form>

      <TransactionList transactions={transactions ?? []} currentUserId={user.id} />
    </div>
  )
}
