'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  User,
  Users,
  ShieldCheck,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface SidebarProps {
  profile: Profile
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Lançamentos', icon: ArrowLeftRight },
  { href: '/profile', label: 'Perfil', icon: User },
]

const adminLinks = [
  { href: '/admin/members', label: 'Membros', icon: Users },
  { href: '/admin/permissions', label: 'Permissões', icon: ShieldCheck },
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
    const active = pathname === href
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
      active
        ? 'bg-[rgba(50,100,255,0.15)] border-l-2 border-[#3264FF] text-[#b7c4ff] font-medium pl-[10px]'
        : 'text-[#8d90a1] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e2e2e2]'
    }`
  }

  return (
    <aside
      className="w-64 flex flex-col shrink-0"
      style={{
        background: '#121224',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        className="flex justify-center items-center px-5 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Image
          src="/NGG-logo2.PNG"
          alt="NGG"
          width={120}
          height={60}
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </Link>
        ))}
        {profile.role === 'admin' && (
          <>
            <p className="text-xs text-[#434655] uppercase font-medium px-3 pt-5 pb-1.5 tracking-widest">
              Admin
            </p>
            {adminLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                <Icon size={16} strokeWidth={1.8} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs text-[#8d90a1] px-3 mb-1.5 truncate">{profile.name}</p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#8d90a1] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e2e2e2] rounded-lg transition-all"
        >
          <LogOut size={16} strokeWidth={1.8} />
          Sair
        </button>
      </div>
    </aside>
  )
}
