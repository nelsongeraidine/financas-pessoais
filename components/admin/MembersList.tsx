'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, UserPlus } from 'lucide-react'
import type { Profile } from '@/lib/types'
import InviteModal from './InviteModal'

interface MembersListProps {
  members: Profile[]
  currentUserId: string
}

export default function MembersList({ members, currentUserId }: MembersListProps) {
  const router = useRouter()
  const [showInvite, setShowInvite] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  async function handleRemove(id: string, name: string) {
    if (!confirm(`Remover ${name}? O acesso será revogado, mas as transações serão mantidas.`))
      return
    setRemoving(id)
    const response = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' })
    setRemoving(null)
    if (response.ok) router.refresh()
    else {
      const { error } = await response.json()
      alert(error ?? 'Erro ao remover membro.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-electric-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] transition-all"
        >
          <UserPlus size={15} strokeWidth={1.8} />
          Convidar Membro
        </button>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: '#121224', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Papel</th>
              <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Desde</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-[#b7c4ff] shrink-0"
                      style={{ background: 'rgba(50,100,255,0.15)' }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[#e2e2e2] font-medium">{member.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                      member.role === 'admin'
                        ? 'bg-[rgba(50,100,255,0.15)] border border-[#3264FF] text-[#b7c4ff]'
                        : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#8d90a1]'
                    }`}
                  >
                    {member.role === 'admin' ? 'Admin' : 'Membro'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#8d90a1]">
                  {new Date(member.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  {member.id !== currentUserId && (
                    <button
                      onClick={() => handleRemove(member.id, member.name)}
                      disabled={removing === member.id}
                      className="text-[#8d90a1] hover:text-[#ffb4ab] transition-colors disabled:opacity-50"
                      title="Remover membro"
                    >
                      {removing === member.id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <Trash2 size={14} strokeWidth={1.8} />
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}
