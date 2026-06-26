// app/api/admin/permissions/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const permissionSchema = z.object({
  viewer_id: z.string().uuid(),
  target_id: z.string().uuid(),
  grant: z.boolean(),
})

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = permissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { viewer_id, target_id, grant } = parsed.data

  if (viewer_id === target_id) {
    return NextResponse.json({ error: 'viewer_id e target_id não podem ser iguais' }, { status: 400 })
  }

  if (grant) {
    const { error } = await supabase
      .from('member_permissions')
      .upsert(
        { viewer_id, target_id, created_by: user.id },
        { onConflict: 'viewer_id,target_id' }
      )
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('member_permissions')
      .delete()
      .eq('viewer_id', viewer_id)
      .eq('target_id', target_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
