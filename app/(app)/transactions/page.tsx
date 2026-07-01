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
    .select('*, category:categories(id, name, type, icon), profile:profiles!user_id(id, name)')
    .order('date', { ascending: false })

  if (searchParams.type && ['expense', 'income', 'investment'].includes(searchParams.type)) {
    query = query.eq('type', searchParams.type)
  }
  if (searchParams.start) query = query.gte('date', searchParams.start)
  if (searchParams.end) query = query.lte('date', searchParams.end)

  const { data: transactions } = await query

  const selectClass =
    'rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors'
  const selectStyle = { background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-starlight">Lançamentos</h1>
        <Link
          href="/transactions/new"
          className="bg-electric-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] transition-all"
        >
          + Nova Transação
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="type"
          defaultValue={searchParams.type ?? ''}
          className={selectClass}
          style={selectStyle}
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
          className={selectClass}
          style={selectStyle}
        />
        <input
          type="date"
          name="end"
          defaultValue={searchParams.end ?? ''}
          className={selectClass}
          style={selectStyle}
        />
        <button type="submit" className={selectClass} style={selectStyle}>
          Filtrar
        </button>
        <Link
          href="/transactions"
          className="text-[#8d90a1] text-sm py-2 hover:text-[#e2e2e2] transition-colors"
        >
          Limpar
        </Link>
      </form>

      <TransactionList transactions={transactions ?? []} currentUserId={user.id} />
    </div>
  )
}
