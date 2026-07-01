'use client'

import { useState } from 'react'
import type { Profile, MemberPermission } from '@/lib/types'

interface PermissionsMatrixProps {
  members: Profile[]
  permissions: MemberPermission[]
  currentUserId: string
}

function permissionKey(viewerId: string, targetId: string) {
  return `${viewerId}:${targetId}`
}

export default function PermissionsMatrix({
  members,
  permissions,
  currentUserId,
}: PermissionsMatrixProps) {
  const [granted, setGranted] = useState<Set<string>>(
    () => new Set(permissions.map((p) => permissionKey(p.viewer_id, p.target_id)))
  )
  const [loading, setLoading] = useState<Set<string>>(new Set())

  async function toggle(viewerId: string, targetId: string) {
    const key = permissionKey(viewerId, targetId)
    const grant = !granted.has(key)
    setLoading((prev) => new Set(prev).add(key))

    const response = await fetch('/api/admin/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewer_id: viewerId, target_id: targetId, grant }),
    })

    setLoading((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })

    if (response.ok) {
      setGranted((prev) => {
        const next = new Set(prev)
        if (grant) next.add(key)
        else next.delete(key)
        return next
      })
    } else {
      alert('Erro ao atualizar permissão.')
    }
  }

  const nonAdminMembers = members.filter((m) => m.id !== currentUserId)

  if (nonAdminMembers.length < 2) {
    return (
      <p className="text-[#8d90a1] text-sm py-8 text-center">
        São necessários pelo menos 2 membros (além do admin) para configurar permissões.
      </p>
    )
  }

  return (
    <div
      className="rounded-xl overflow-auto"
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
            <th className="text-left px-4 py-3 font-medium text-[#8d90a1] min-w-[140px]">
              Quem visualiza ↓ / De quem →
            </th>
            {nonAdminMembers.map((target) => (
              <th key={target.id} className="px-4 py-3 font-medium text-[#8d90a1] text-center">
                {target.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nonAdminMembers.map((viewer) => (
            <tr key={viewer.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td className="px-4 py-3 text-[#e2e2e2] font-medium">{viewer.name}</td>
              {nonAdminMembers.map((target) => {
                if (viewer.id === target.id) {
                  return (
                    <td key={target.id} className="px-4 py-3 text-center">
                      <span className="text-[#434655] text-xs">—</span>
                    </td>
                  )
                }
                const key = permissionKey(viewer.id, target.id)
                const isGranted = granted.has(key)
                const isLoading = loading.has(key)
                return (
                  <td key={target.id} className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(viewer.id, target.id)}
                      disabled={isLoading}
                      className="w-10 h-6 rounded-full transition-all relative disabled:opacity-50"
                      style={{ background: isGranted ? '#3264FF' : '#434655' }}
                      title={isGranted ? 'Remover permissão' : 'Conceder permissão'}
                    >
                      <span
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                        style={{ left: isGranted ? '1.25rem' : '0.25rem' }}
                      />
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
