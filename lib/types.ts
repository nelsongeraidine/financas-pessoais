// lib/types.ts
export type UserRole = 'admin' | 'member'
export type TransactionType = 'expense' | 'income' | 'investment'

export interface Profile {
  id: string
  name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon: string
  is_default: boolean
  created_by: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  category_id: string
  amount: number
  description: string | null
  date: string
  created_at: string
  category?: Pick<Category, 'id' | 'name' | 'type' | 'icon'>
  profile?: Pick<Profile, 'id' | 'name'>
}

export interface MemberPermission {
  id: string
  viewer_id: string
  target_id: string
  created_by: string
  created_at: string
}
