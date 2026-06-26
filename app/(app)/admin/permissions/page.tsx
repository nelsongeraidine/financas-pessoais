// app/(app)/admin/permissions/page.tsx
import { createClient } from '@/lib/supabase/server'
import PermissionsMatrix from '@/components/admin/PermissionsMatrix'

export default async function AdminPermissionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: members }, { data: permissions }] = await Promise.all([
    supabase.from('profiles').select('*').order('name'),
    supabase.from('member_permissions').select('*'),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Permissões</h1>
      <p className="text-gray-500 text-sm mb-6">
        Ative o toggle para permitir que um membro visualize as transações de outro.
      </p>
      <PermissionsMatrix
        members={members ?? []}
        permissions={permissions ?? []}
        currentUserId={user.id}
      />
    </div>
  )
}
