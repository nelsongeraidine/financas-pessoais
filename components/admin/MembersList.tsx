// components/admin/MembersList.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

    if (response.ok) {
      router.refresh()
    } else {
      const { error } = await response.json()
      alert(error ?? 'Erro ao remover membro.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowInvite(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Convidar Membro
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Papel</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Desde</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-gray-900 font-medium">{member.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      member.role === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {member.role === 'admin' ? 'Admin' : 'Membro'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(member.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  {member.id !== currentUserId && (
                    <button
                      onClick={() => handleRemove(member.id, member.name)}
                      disabled={removing === member.id}
                      className="text-gray-400 hover:text-red-600 text-xs transition-colors disabled:opacity-50"
                    >
                      {removing === member.id ? '...' : 'Remover'}
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
