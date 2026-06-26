import { describe, it, expect } from 'vitest'
import { transactionSchema, inviteSchema } from '@/lib/schemas'

describe('transactionSchema', () => {
  const valid = {
    type: 'expense',
    amount: 150.5,
    category_id: '550e8400-e29b-41d4-a716-446655440000',
    date: '2026-06-25',
    description: 'Supermercado',
  }

  it('aceita dados válidos', () => {
    expect(transactionSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita amount negativo', () => {
    const result = transactionSchema.safeParse({ ...valid, amount: -10 })
    expect(result.success).toBe(false)
  })

  it('rejeita amount zero', () => {
    const result = transactionSchema.safeParse({ ...valid, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita tipo inválido', () => {
    const result = transactionSchema.safeParse({ ...valid, type: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejeita data inválida', () => {
    const result = transactionSchema.safeParse({ ...valid, date: '25/06/2026' })
    expect(result.success).toBe(false)
  })

  it('aceita description vazia', () => {
    const result = transactionSchema.safeParse({ ...valid, description: '' })
    expect(result.success).toBe(true)
  })
})

describe('inviteSchema', () => {
  it('aceita nome e email válidos', () => {
    const result = inviteSchema.safeParse({ name: 'Maria', email: 'maria@email.com' })
    expect(result.success).toBe(true)
  })

  it('rejeita email inválido', () => {
    const result = inviteSchema.safeParse({ name: 'Maria', email: 'nao-e-email' })
    expect(result.success).toBe(false)
  })

  it('rejeita nome vazio', () => {
    const result = inviteSchema.safeParse({ name: '', email: 'a@b.com' })
    expect(result.success).toBe(false)
  })
})
