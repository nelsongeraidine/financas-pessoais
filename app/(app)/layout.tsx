// app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div
      className="flex min-h-screen bg-space-deep"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(50,100,255,0.15), transparent)',
      }}
    >
      <Sidebar profile={profile} />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
