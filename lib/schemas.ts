import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'investment']),
  amount: z.coerce
    .number()
    .positive('Valor deve ser maior que zero'),
  category_id: z.string().uuid('Selecione uma categoria válida'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use AAAA-MM-DD)'),
  description: z.string().optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

export const inviteSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
})

export type InviteFormData = z.infer<typeof inviteSchema>
