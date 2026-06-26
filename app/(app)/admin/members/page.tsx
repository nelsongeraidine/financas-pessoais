// app/(app)/admin/members/page.tsx
import { createClient } from '@/lib/supabase/server'
import MembersList from '@/components/admin/MembersList'

export default async function AdminMembersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Membros</h1>
      <MembersList members={members ?? []} currentUserId={user.id} />
    </div>
  )
}
