// components/admin/PermissionsMatrix.tsx
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
      <p className="text-gray-500 text-sm py-8 text-center">
        São necessários pelo menos 2 membros (além do admin) para configurar permissões.
      </p>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[140px]">
              Quem visualiza ↓ / De quem →
            </th>
            {nonAdminMembers.map((target) => (
              <th key={target.id} className="px-4 py-3 font-medium text-gray-600 text-center">
                {target.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nonAdminMembers.map((viewer) => (
            <tr key={viewer.id} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 text-gray-700 font-medium">{viewer.name}</td>
              {nonAdminMembers.map((target) => {
                if (viewer.id === target.id) {
                  return (
                    <td key={target.id} className="px-4 py-3 text-center">
                      <span className="text-gray-300 text-xs">—</span>
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
                      className={`w-10 h-6 rounded-full transition-colors relative disabled:opacity-50 ${
                        isGranted ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      title={isGranted ? 'Remover permissão' : 'Conceder permissão'}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          isGranted ? 'left-5' : 'left-1'
                        }`}
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
