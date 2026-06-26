// components/transactions/TransactionForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema } from '@/lib/schemas'
import type { Category, TransactionType } from '@/lib/types'
import { z } from 'zod'

type TransactionFormInput = z.input<typeof transactionSchema>
type TransactionFormData = z.output<typeof transactionSchema>

interface TransactionFormProps {
  categories: Category[]
}

const typeLabels: Record<TransactionType, string> = {
  expense: 'Despesa',
  income: 'Receita',
  investment: 'Investimento',
}

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
      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
        <div className="flex gap-2">
          {(['expense', 'income', 'investment'] as TransactionType[]).map((t) => (
            <label key={t} className="flex-1">
              <input type="radio" value={t} {...register('type')} className="sr-only" />
              <span
                className={`block text-center py-2 px-3 rounded-lg text-sm border cursor-pointer transition-colors ${
                  selectedType === t
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {typeLabels[t]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Valor */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Valor (R$)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          {...register('amount')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0,00"
        />
        {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount.message}</p>}
      </div>

      {/* Categoria */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <select
          id="category_id"
          {...register('category_id')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Selecione uma categoria</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="text-red-600 text-xs mt-1">{errors.category_id.message}</p>
        )}
      </div>

      {/* Data */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Data
        </label>
        <input
          id="date"
          type="date"
          {...register('date')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>}
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição <span className="text-gray-400">(opcional)</span>
        </label>
        <input
          id="description"
          type="text"
          {...register('description')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Supermercado Extra"
        />
      </div>

      {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
