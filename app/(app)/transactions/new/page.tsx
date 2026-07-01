import { createClient } from '@/lib/supabase/server'
import TransactionForm from '@/components/transactions/TransactionForm'

export default async function NewTransactionPage() {
  const supabase = createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold text-starlight mb-6">Nova Transação</h1>
      <TransactionForm categories={categories ?? []} />
    </div>
  )
}
