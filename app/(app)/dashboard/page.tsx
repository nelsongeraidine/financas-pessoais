// app/(app)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getCurrentMonthRange } from '@/lib/utils'
import SummaryCards from '@/components/dashboard/SummaryCards'
import ExpensesChart from '@/components/dashboard/ExpensesChart'
import RecentTransactions from '@/components/dashboard/RecentTransactions'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { start, end } = getCurrentMonthRange()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, category:categories(id, name, type, icon)')
    .eq('user_id', user.id)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })

  const txs = transactions ?? []

  const totalIncome = txs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = txs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalInvestment = txs
    .filter((t) => t.type === 'investment')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  const expensesByCategory = txs
    .filter((t) => t.type === 'expense')
    .reduce(
      (acc, t) => {
        const name = t.category?.name ?? 'Outros'
        acc[name] = (acc[name] ?? 0) + Number(t.amount)
        return acc
      },
      {} as Record<string, number>
    )

  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value: value as number }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </div>
      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        totalInvestment={totalInvestment}
        balance={balance}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpensesChart data={chartData} />
        <RecentTransactions transactions={txs.slice(0, 5)} />
      </div>
    </div>
  )
}
