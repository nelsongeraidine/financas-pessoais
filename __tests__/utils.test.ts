import { describe, it, expect } from 'vitest'
import { formatBRL, formatDate, getCurrentMonthRange } from '@/lib/utils'

describe('formatBRL', () => {
  it('formata valor positivo', () => {
    expect(formatBRL(1500)).toMatch(/1\.500,00/)
  })
  it('formata zero', () => {
    expect(formatBRL(0)).toMatch(/0,00/)
  })
  it('formata valor decimal', () => {
    expect(formatBRL(99.9)).toMatch(/99,90/)
  })
})

describe('formatDate', () => {
  it('formata data no padrão brasileiro', () => {
    expect(formatDate('2026-01-15')).toBe('15/01/2026')
  })
})

describe('getCurrentMonthRange', () => {
  it('retorna primeiro e último dia do mês atual no formato YYYY-MM-DD', () => {
    const { start, end } = getCurrentMonthRange()
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    expect(start).toBe(`${year}-${month}-01`)
    expect(end).toBe(`${year}-${month}-${String(lastDay).padStart(2, '0')}`)
  })
})
