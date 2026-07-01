'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema } from '@/lib/schemas'
import type { Category, TransactionType } from '@/lib/types'
import { z } from 'zod'

type TransactionFormInput = z.input<typeof transactionSchema>

interface TransactionFormProps {
  categories: Category[]
}

const typeLabels: Record<TransactionType, string> = {
  expense: 'Despesa',
  income: 'Receita',
  investment: 'Investimento',
}

const typeActiveStyles: Record<TransactionType, string> = {
  expense: 'bg-[rgba(255,180,171,0.15)] border-[#ffb4ab] text-[#ffb4ab]',
  income: 'bg-[rgba(74,222,128,0.15)] border-[#4ade80] text-[#4ade80]',
  investment: 'bg-[rgba(183,196,255,0.15)] border-[#b7c4ff] text-[#b7c4ff]',
}

const inputCls =
  'w-full rounded-lg px-3 py-2.5 text-sm text-[#e2e2e2] placeholder-[#434655] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors'
const inputSty = { background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }
const labelCls = 'block text-sm font-medium text-[#c3c5d8] mb-1.5'

export default function TransactionForm({ categories }: TransactionFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'expense', date: today },
  })

  const selectedType = watch('type')
  const filteredCategories = categories.filter((c) => c.type === selectedType)

  async function onSubmit(data: TransactionFormInput) {
    setServerError(null)
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      setServerError('Erro ao salvar. Tente novamente.')
      return
    }
    router.push('/transactions')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div>
        <label className={labelCls}>Tipo</label>
        <div className="flex gap-2">
          {(['expense', 'income', 'investment'] as TransactionType[]).map((t) => (
            <label key={t} className="flex-1">
              <input type="radio" value={t} {...register('type')} className="sr-only" />
              <span
                className={`block text-center py-2 px-3 rounded-lg text-sm border cursor-pointer transition-all ${
                  selectedType === t
                    ? typeActiveStyles[t]
                    : 'border-[rgba(255,255,255,0.1)] text-[#8d90a1] hover:border-[rgba(255,255,255,0.2)]'
                }`}
                style={selectedType !== t ? { background: '#1e2020' } : {}}
              >
                {typeLabels[t]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="amount" className={labelCls}>Valor (R$)</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          {...register('amount')}
          className={inputCls}
          style={inputSty}
          placeholder="0,00"
        />
        {errors.amount && <p className="text-[#ffb4ab] text-xs mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <label htmlFor="category_id" className={labelCls}>Categoria</label>
        <select id="category_id" {...register('category_id')} className={inputCls} style={inputSty}>
          <option value="">Selecione uma categoria</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.category_id && (
          <p className="text-[#ffb4ab] text-xs mt-1">{errors.category_id.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className={labelCls}>Data</label>
        <input id="date" type="date" {...register('date')} className={inputCls} style={inputSty} />
        {errors.date && <p className="text-[#ffb4ab] text-xs mt-1">{errors.date.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>
          Descrição <span className="text-[#434655] font-normal">(opcional)</span>
        </label>
        <input
          id="description"
          type="text"
          {...register('description')}
          className={inputCls}
          style={inputSty}
          placeholder="Ex: Supermercado Extra"
        />
      </div>

      {serverError && <p className="text-[#ffb4ab] text-sm">{serverError}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 rounded-lg text-sm text-[#3264FF] hover:bg-[rgba(50,100,255,0.08)] transition-all"
          style={{ border: '1px solid #3264FF' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-electric-blue text-white py-2.5 rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] disabled:opacity-50 transition-all"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
