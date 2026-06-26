// components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface SidebarProps {
  profile: Profile
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Lançamentos' },
  { href: '/profile', label: 'Perfil' },
]

const adminLinks = [
  { href: '/admin/members', label: 'Membros' },
  { href: '/admin/permissions', label: 'Permissões' },
]

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function linkClass(href: string) {
    return `block px-3 py-2 rounded-lg text-sm transition-colors ${
      pathname === href
        ? 'bg-blue-50 text-blue-700 font-medium'
        : 'text-gray-600 hover:bg-gray-50'
    }`
  }

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-200">
        <p className="font-bold text-gray-900 text-sm">Finanças Familiar</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map(({ href, label }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            {label}
          </Link>
        ))}
        {profile.role === 'admin' && (
          <>
            <p className="text-xs text-gray-400 uppercase font-medium px-3 pt-4 pb-1 tracking-wide">
              Admin
            </p>
            {adminLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>
      <div className="p-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 px-3 mb-2 truncate">{profile.name}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
