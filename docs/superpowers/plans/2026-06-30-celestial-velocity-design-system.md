# Celestial Velocity Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Celestial Velocity dark design system across every page and component, replacing the current light theme with Space Deep canvas, Electric Blue accents, glassmorphic cards, Hanken Grotesk typography, and the NGG logo in Sidebar + Login.

**Architecture:** Pure visual overhaul — no business logic changes. All Tailwind tokens defined once in `tailwind.config.ts`, CSS variables in `globals.css`, then applied component by component. Each task is independently reviewable in the browser.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS v3, `next/font/google` (Hanken Grotesk), `next/image`, `lucide-react` (to install), Recharts (already installed).

## Global Constraints

- All UI text stays in Brazilian Portuguese — do not translate any labels
- `lucide-react` icons: always use `size={16}` and `strokeWidth={1.8}` unless noted
- Glass card pattern: `bg-[#121224]` + `style={{ border: '1px solid rgba(255,255,255,0.07)' }}` + `rounded-xl`
- Input pattern: `bg-[#1e2020]` + `style={{ border: '1px solid rgba(255,255,255,0.1)' }}` + focus ring `focus:ring-[#3264FF]`
- Primary button: `bg-electric-blue text-white hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] transition-all`
- Semantic colors: income `#4ade80`, expense `#ffb4ab`, investment `#b7c4ff`
- Logo file: `public/NGG-logo2.PNG` (must be in `public/`, not `assets/`)

---

### Task 1: Setup — lucide-react + logo

**Files:**
- Run: `npm install lucide-react`
- Copy: `assets/NGG-logo2.PNG` → `public/NGG-logo2.PNG`

- [ ] **Step 1: Install lucide-react**

```bash
npm install lucide-react
```

Expected output includes `added 1 package` and no errors.

- [ ] **Step 2: Copy logo to public/**

```bash
cp assets/NGG-logo2.PNG public/NGG-logo2.PNG
```

- [ ] **Step 3: Verify**

```bash
ls public/NGG-logo2.PNG && node -e "require('lucide-react')" && echo OK
```

Expected: prints the path and `OK`.

- [ ] **Step 4: Commit**

```bash
git add public/NGG-logo2.PNG package.json package-lock.json
git commit -m "chore: install lucide-react and add logo to public/"
```

---

### Task 2: Foundation — Tailwind tokens + globals.css + font

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: Tailwind classes `bg-space-deep`, `bg-electric-blue`, `text-starlight`, `bg-surface-card`, `bg-surface-container`, `text-on-surface`, `text-cv-outline`, `text-on-surface-variant`, `text-cv-primary`, `text-cv-error`, `text-neon-green`, `font-sans` (Hanken Grotesk), CSS variable `--font-hanken`

- [ ] **Step 1: Replace tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-deep': '#080816',
        'electric-blue': '#3264FF',
        'starlight': '#FFFFFF',
        'surface-card': '#121224',
        'surface-container': '#1e2020',
        'surface-container-low': '#1a1c1c',
        'surface-bright': '#37393a',
        'on-surface': '#e2e2e2',
        'on-surface-variant': '#c3c5d8',
        'cv-outline': '#8d90a1',
        'outline-variant': '#434655',
        'cv-primary': '#b7c4ff',
        'cv-error': '#ffb4ab',
        'neon-green': '#4ade80',
      },
      fontFamily: {
        sans: ['var(--font-hanken)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Replace app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #080816;
  --foreground: #e2e2e2;
}

body {
  color: var(--foreground);
  background: var(--background);
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #1e2020; }
::-webkit-scrollbar-thumb { background: #434655; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #8d90a1; }

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1) opacity(0.4);
}

select option {
  background: #1e2020;
  color: #e2e2e2;
}

@layer utilities {
  .text-balance { text-wrap: balance; }
}
```

- [ ] **Step 3: Replace app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { Hanken_Grotesk } from 'next/font/google'
import './globals.css'

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-hanken',
})

export const metadata: Metadata = {
  title: 'Finanças Familiar',
  description: 'Controle financeiro para toda a família',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${hanken.variable} font-sans`}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Verify build compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: no TypeScript or Tailwind errors.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css app/layout.tsx
git commit -m "feat: add Celestial Velocity tokens, Hanken Grotesk font, dark globals"
```

---

### Task 3: App Shell — layout background + Sidebar

**Files:**
- Modify: `app/(app)/layout.tsx`
- Modify: `components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: `bg-space-deep`, `bg-electric-blue`, `text-cv-outline`, `text-cv-primary` (Task 2), `/NGG-logo2.PNG` (Task 1), `lucide-react` (Task 1)

- [ ] **Step 1: Replace app/(app)/layout.tsx**

```tsx
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
```

- [ ] **Step 2: Replace components/layout/Sidebar.tsx**

```tsx
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
```

- [ ] **Step 3: Start dev server and verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000/dashboard`. Verify: dark Space Deep background with blue radial glow, sidebar shows NGG logo at top, nav links have icons, active link has left blue border, footer shows user name + logout icon.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/layout.tsx components/layout/Sidebar.tsx
git commit -m "feat: apply dark shell layout with Sidebar logo and lucide icons"
```

---

### Task 4: Login Page

**Files:**
- Modify: `app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: `bg-space-deep`, `bg-electric-blue`, `text-starlight` (Task 2), `/NGG-logo2.PNG` (Task 1)

- [ ] **Step 1: Replace app/(auth)/login/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-space-deep"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(50,100,255,0.15), transparent)',
      }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-10 backdrop-blur-xl"
        style={{ background: '#121224', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex justify-center mb-6">
          <Image
            src="/NGG-logo2.PNG"
            alt="NGG"
            width={140}
            height={70}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <h1 className="text-xl font-semibold text-starlight mb-1 text-center">
          Bem-vindo de volta
        </h1>
        <p className="text-[#8d90a1] text-sm mb-6 text-center">Entre com sua conta</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#c3c5d8] mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-[#e2e2e2] placeholder-[#434655] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors"
              style={{ background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#c3c5d8] mb-1.5">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-[#e2e2e2] placeholder-[#434655] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors"
              style={{ background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-[#ffb4ab] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-electric-blue text-white py-2.5 rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] disabled:opacity-50 transition-all mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/login`. Verify: dark Space Deep background with blue glow, glassmorphic card with NGG logo at top, dark inputs with blue focus ring, Electric Blue button.

- [ ] **Step 3: Commit**

```bash
git add "app/(auth)/login/page.tsx"
git commit -m "feat: apply Celestial Velocity design to login page with logo"
```

---

### Task 5: Dashboard Components

**Files:**
- Modify: `components/dashboard/SummaryCards.tsx`
- Modify: `components/dashboard/ExpensesChart.tsx`
- Modify: `components/dashboard/RecentTransactions.tsx`
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Replace components/dashboard/SummaryCards.tsx**

```tsx
import { formatBRL } from '@/lib/utils'

interface SummaryCardsProps {
  totalIncome: number
  totalExpense: number
  totalInvestment: number
  balance: number
}

export default function SummaryCards({
  totalIncome,
  totalExpense,
  totalInvestment,
  balance,
}: SummaryCardsProps) {
  const cards = [
    {
      label: 'Saldo do Mês',
      value: balance,
      color: balance >= 0 ? 'text-[#4ade80]' : 'text-[#ffb4ab]',
    },
    { label: 'Receitas', value: totalIncome, color: 'text-[#4ade80]' },
    { label: 'Despesas', value: totalExpense, color: 'text-[#ffb4ab]' },
    { label: 'Investimentos', value: totalInvestment, color: 'text-[#b7c4ff]' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, color }) => (
        <div
          key={label}
          className="rounded-xl p-6"
          style={{ background: '#121224', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs text-[#8d90a1] mb-2 uppercase tracking-widest font-medium">
            {label}
          </p>
          <p className={`text-2xl font-bold ${color}`}>{formatBRL(value)}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Replace components/dashboard/ExpensesChart.tsx**

```tsx
'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ChartItem {
  name: string
  value: number
}

const COLORS = ['#3264FF', '#7C9FFF', '#B7C4FF', '#FF6B6B', '#FFB347', '#4ade80']

interface ExpensesChartProps {
  data: ChartItem[]
}

export default function ExpensesChart({ data }: ExpensesChartProps) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ background: '#121224', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <h2 className="text-base font-semibold text-starlight mb-4">Despesas por Categoria</h2>
      {data.length === 0 ? (
        <p className="text-[#8d90a1] text-sm text-center py-8">Sem despesas no período</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']}
              contentStyle={{
                background: '#1e2020',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#e2e2e2',
              }}
            />
            <Legend wrapperStyle={{ color: '#8d90a1', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Replace components/dashboard/RecentTransactions.tsx**

```tsx
import Link from 'next/link'
import { formatBRL, formatDate } from '@/lib/utils'
import type { Transaction, TransactionType } from '@/lib/types'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const typeColors: Record<TransactionType, string> = {
  income: 'text-[#4ade80]',
  expense: 'text-[#ffb4ab]',
  investment: 'text-[#b7c4ff]',
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ background: '#121224', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-starlight">Últimas Transações</h2>
        <Link
          href="/transactions"
          className="text-xs text-[#b7c4ff] hover:text-[#3264FF] transition-colors"
        >
          Ver todas
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="text-[#8d90a1] text-sm text-center py-4">Nenhuma transação no período</p>
      ) : (
        <ul className="space-y-0">
          {transactions.map((tx, i) => (
            <li
              key={tx.id}
              className="flex items-center justify-between py-3"
              style={
                i < transactions.length - 1
                  ? { borderBottom: '1px solid rgba(255,255,255,0.05)' }
                  : {}
              }
            >
              <div>
                <p className="text-sm text-[#e2e2e2]">{tx.category?.name ?? '—'}</p>
                <p className="text-xs text-[#8d90a1] mt-0.5">{formatDate(tx.date)}</p>
              </div>
              <span className={`text-sm font-semibold ${typeColors[tx.type]}`}>
                {formatBRL(Number(tx.amount))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update app/(app)/dashboard/page.tsx heading colors**

Change only these two lines (the heading and date label):

```tsx
// Line 55 — was: <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
<h1 className="text-2xl font-bold text-starlight">Dashboard</h1>

// Line 56 — was: <p className="text-sm text-gray-500">
<p className="text-sm text-[#8d90a1]">
```

- [ ] **Step 5: Verify in browser**

Open `http://localhost:3000/dashboard`. Verify: 4 dark glassmorphic summary cards with semantic colors, pie chart with dark tooltip and Electric Blue palette, recent transactions card with separator lines.

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/ "app/(app)/dashboard/page.tsx"
git commit -m "feat: apply Celestial Velocity design to dashboard components"
```

---

### Task 6: Transactions

**Files:**
- Modify: `app/(app)/transactions/page.tsx`
- Modify: `components/transactions/TransactionList.tsx`
- Modify: `components/transactions/TransactionForm.tsx`
- Modify: `app/(app)/transactions/new/page.tsx`

- [ ] **Step 1: Replace app/(app)/transactions/page.tsx**

```tsx
// app/(app)/transactions/page.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TransactionList from '@/components/transactions/TransactionList'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { type?: string; start?: string; end?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let query = supabase
    .from('transactions')
    .select('*, category:categories(id, name, type, icon), profile:profiles!user_id(id, name)')
    .order('date', { ascending: false })

  if (searchParams.type && ['expense', 'income', 'investment'].includes(searchParams.type)) {
    query = query.eq('type', searchParams.type)
  }
  if (searchParams.start) query = query.gte('date', searchParams.start)
  if (searchParams.end) query = query.lte('date', searchParams.end)

  const { data: transactions } = await query

  const selectClass =
    'rounded-lg px-3 py-2 text-sm text-[#e2e2e2] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors'
  const selectStyle = { background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-starlight">Lançamentos</h1>
        <Link
          href="/transactions/new"
          className="bg-electric-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] transition-all"
        >
          + Nova Transação
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="type"
          defaultValue={searchParams.type ?? ''}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">Todos os tipos</option>
          <option value="expense">Despesas</option>
          <option value="income">Receitas</option>
          <option value="investment">Investimentos</option>
        </select>
        <input
          type="date"
          name="start"
          defaultValue={searchParams.start ?? ''}
          className={selectClass}
          style={selectStyle}
        />
        <input
          type="date"
          name="end"
          defaultValue={searchParams.end ?? ''}
          className={selectClass}
          style={selectStyle}
        />
        <button type="submit" className={selectClass} style={selectStyle}>
          Filtrar
        </button>
        <Link
          href="/transactions"
          className="text-[#8d90a1] text-sm py-2 hover:text-[#e2e2e2] transition-colors"
        >
          Limpar
        </Link>
      </form>

      <TransactionList transactions={transactions ?? []} currentUserId={user.id} />
    </div>
  )
}
```

- [ ] **Step 2: Replace components/transactions/TransactionList.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { formatBRL, formatDate } from '@/lib/utils'
import type { Transaction, TransactionType } from '@/lib/types'

interface TransactionListProps {
  transactions: Transaction[]
  currentUserId: string
}

const typeColors: Record<TransactionType, string> = {
  income: 'text-[#4ade80]',
  expense: 'text-[#ffb4ab]',
  investment: 'text-[#b7c4ff]',
}

const typeBadgeStyles: Record<TransactionType, string> = {
  income: 'bg-[rgba(74,222,128,0.1)] border border-[#4ade80] text-[#4ade80]',
  expense: 'bg-[rgba(255,180,171,0.1)] border border-[#ffb4ab] text-[#ffb4ab]',
  investment: 'bg-[rgba(183,196,255,0.1)] border border-[#b7c4ff] text-[#b7c4ff]',
}

const typeLabels: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
  investment: 'Investimento',
}

export default function TransactionList({ transactions, currentUserId }: TransactionListProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta transação?')) return
    setDeleting(id)
    const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    setDeleting(null)
    if (response.ok) router.refresh()
    else alert('Erro ao excluir. Tente novamente.')
  }

  if (transactions.length === 0) {
    return (
      <p className="text-[#8d90a1] text-sm py-8 text-center">Nenhuma transação encontrada.</p>
    )
  }

  return (
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
            <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Data</th>
            <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Tipo</th>
            <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Categoria</th>
            <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Descrição</th>
            <th className="text-right px-4 py-3 font-medium text-[#8d90a1]">Valor</th>
            <th className="text-left px-4 py-3 font-medium text-[#8d90a1]">Membro</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="transition-colors hover:bg-[rgba(255,255,255,0.03)]"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <td className="px-4 py-3 text-[#8d90a1]">{formatDate(tx.date)}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${typeBadgeStyles[tx.type]}`}>
                  {typeLabels[tx.type]}
                </span>
              </td>
              <td className="px-4 py-3 text-[#e2e2e2]">{tx.category?.name ?? '—'}</td>
              <td className="px-4 py-3 text-[#8d90a1]">{tx.description ?? '—'}</td>
              <td className={`px-4 py-3 text-right font-medium ${typeColors[tx.type]}`}>
                {formatBRL(Number(tx.amount))}
              </td>
              <td className="px-4 py-3 text-[#8d90a1] text-xs">
                {tx.user_id !== currentUserId
                  ? (tx.profile as { name: string } | undefined)?.name ?? '—'
                  : null}
              </td>
              <td className="px-4 py-3">
                {tx.user_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deleting === tx.id}
                    className="text-[#8d90a1] hover:text-[#ffb4ab] transition-colors disabled:opacity-50"
                    title="Excluir"
                  >
                    {deleting === tx.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: Replace components/transactions/TransactionForm.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema } from '@/lib/schemas'
import type { Category, TransactionType } from '@/lib/types'
import { z } from 'zod'

type TransactionFormInput = z.input<typeof transactionSchema>

interface TransactionFormProps {
  categories: Category[]
}

const typeLabels: Record<TransactionType, string> = {
  expense: 'Despesa',
  income: 'Receita',
  investment: 'Investimento',
}

const typeActiveStyles: Record<TransactionType, string> = {
  expense: 'bg-[rgba(255,180,171,0.15)] border-[#ffb4ab] text-[#ffb4ab]',
  income: 'bg-[rgba(74,222,128,0.15)] border-[#4ade80] text-[#4ade80]',
  investment: 'bg-[rgba(183,196,255,0.15)] border-[#b7c4ff] text-[#b7c4ff]',
}

const inputCls =
  'w-full rounded-lg px-3 py-2.5 text-sm text-[#e2e2e2] placeholder-[#434655] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors'
const inputSty = { background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }
const labelCls = 'block text-sm font-medium text-[#c3c5d8] mb-1.5'

export default function TransactionForm({ categories }: TransactionFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'expense', date: today },
  })

  const selectedType = watch('type')
  const filteredCategories = categories.filter((c) => c.type === selectedType)

  async function onSubmit(data: TransactionFormInput) {
    setServerError(null)
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      setServerError('Erro ao salvar. Tente novamente.')
      return
    }
    router.push('/transactions')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div>
        <label className={labelCls}>Tipo</label>
        <div className="flex gap-2">
          {(['expense', 'income', 'investment'] as TransactionType[]).map((t) => (
            <label key={t} className="flex-1">
              <input type="radio" value={t} {...register('type')} className="sr-only" />
              <span
                className={`block text-center py-2 px-3 rounded-lg text-sm border cursor-pointer transition-all ${
                  selectedType === t
                    ? typeActiveStyles[t]
                    : 'border-[rgba(255,255,255,0.1)] text-[#8d90a1] hover:border-[rgba(255,255,255,0.2)]'
                }`}
                style={selectedType !== t ? { background: '#1e2020' } : {}}
              >
                {typeLabels[t]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="amount" className={labelCls}>Valor (R$)</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          {...register('amount')}
          className={inputCls}
          style={inputSty}
          placeholder="0,00"
        />
        {errors.amount && <p className="text-[#ffb4ab] text-xs mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <label htmlFor="category_id" className={labelCls}>Categoria</label>
        <select id="category_id" {...register('category_id')} className={inputCls} style={inputSty}>
          <option value="">Selecione uma categoria</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.category_id && (
          <p className="text-[#ffb4ab] text-xs mt-1">{errors.category_id.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className={labelCls}>Data</label>
        <input id="date" type="date" {...register('date')} className={inputCls} style={inputSty} />
        {errors.date && <p className="text-[#ffb4ab] text-xs mt-1">{errors.date.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>
          Descrição <span className="text-[#434655] font-normal">(opcional)</span>
        </label>
        <input
          id="description"
          type="text"
          {...register('description')}
          className={inputCls}
          style={inputSty}
          placeholder="Ex: Supermercado Extra"
        />
      </div>

      {serverError && <p className="text-[#ffb4ab] text-sm">{serverError}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 rounded-lg text-sm text-[#3264FF] hover:bg-[rgba(50,100,255,0.08)] transition-all"
          style={{ border: '1px solid #3264FF' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-electric-blue text-white py-2.5 rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] disabled:opacity-50 transition-all"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Update app/(app)/transactions/new/page.tsx**

```tsx
import { createClient } from '@/lib/supabase/server'
import TransactionForm from '@/components/transactions/TransactionForm'

export default async function NewTransactionPage() {
  const supabase = createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold text-starlight mb-6">Nova Transação</h1>
      <TransactionForm categories={categories ?? []} />
    </div>
  )
}
```

- [ ] **Step 5: Verify in browser**

Open `http://localhost:3000/transactions`. Verify: dark filter bar with dark selects, transaction table with glassmorphic card, colored type badges (green/red/blue), Trash2 icon on delete. Open `/transactions/new` and verify dark form with semantic type selectors.

- [ ] **Step 6: Commit**

```bash
git add "app/(app)/transactions/" components/transactions/
git commit -m "feat: apply Celestial Velocity design to transactions pages and components"
```

---

### Task 7: Admin Components

**Files:**
- Modify: `components/admin/MembersList.tsx`
- Modify: `components/admin/InviteModal.tsx`
- Modify: `components/admin/PermissionsMatrix.tsx`
- Modify: `app/(app)/admin/members/page.tsx`
- Modify: `app/(app)/admin/permissions/page.tsx`

- [ ] **Step 1: Replace components/admin/MembersList.tsx**

```tsx
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
```

- [ ] **Step 2: Replace components/admin/InviteModal.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inviteSchema, type InviteFormData } from '@/lib/schemas'

interface InviteModalProps {
  onClose: () => void
}

const inputCls =
  'w-full rounded-lg px-3 py-2.5 text-sm text-[#e2e2e2] placeholder-[#434655] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors'
const inputSty = { background: '#1a1c1c', border: '1px solid rgba(255,255,255,0.1)' }
const labelCls = 'block text-sm font-medium text-[#c3c5d8] mb-1.5'

export default function InviteModal({ onClose }: InviteModalProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({ resolver: zodResolver(inviteSchema) })

  async function onSubmit(data: InviteFormData) {
    setServerError(null)
    const response = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const { error } = await response.json()
      setServerError(error ?? 'Erro ao enviar convite.')
      return
    }
    setSuccess(true)
    setTimeout(() => { onClose(); router.refresh() }, 1500)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-6"
        style={{ background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-starlight">Convidar Membro</h2>
          <button
            onClick={onClose}
            className="text-[#8d90a1] hover:text-[#e2e2e2] transition-colors"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>
        {success ? (
          <p className="text-[#4ade80] text-sm text-center py-4">Convite enviado com sucesso!</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelCls}>Nome</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={inputCls}
                style={inputSty}
                placeholder="Maria Silva"
              />
              {errors.name && (
                <p className="text-[#ffb4ab] text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className={labelCls}>E-mail</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={inputCls}
                style={inputSty}
                placeholder="maria@email.com"
              />
              {errors.email && (
                <p className="text-[#ffb4ab] text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            {serverError && <p className="text-[#ffb4ab] text-sm">{serverError}</p>}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg text-sm text-[#3264FF] hover:bg-[rgba(50,100,255,0.08)] transition-all"
                style={{ border: '1px solid #3264FF' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-electric-blue text-white py-2.5 rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Convite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Replace components/admin/PermissionsMatrix.tsx**

```tsx
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
```

- [ ] **Step 4: Update admin page headings**

In `app/(app)/admin/members/page.tsx`, change:
```tsx
// was:
<h1 className="text-2xl font-bold text-gray-900 mb-6">Membros</h1>
// becomes:
<h1 className="text-2xl font-bold text-starlight mb-6">Membros</h1>
```

In `app/(app)/admin/permissions/page.tsx`, change:
```tsx
// was:
<h1 className="text-2xl font-bold text-gray-900 mb-2">Permissões</h1>
<p className="text-gray-500 text-sm mb-6">
// becomes:
<h1 className="text-2xl font-bold text-starlight mb-2">Permissões</h1>
<p className="text-[#8d90a1] text-sm mb-6">
```

- [ ] **Step 5: Verify in browser**

Open `http://localhost:3000/admin/members`. Verify: dark table with avatar initials circle, Electric Blue admin badge, Trash2 delete icon. Click "Convidar Membro" — verify dark blurred overlay modal. Open `/admin/permissions` — verify dark toggle switches (blue when on, gray when off).

- [ ] **Step 6: Commit**

```bash
git add components/admin/ "app/(app)/admin/"
git commit -m "feat: apply Celestial Velocity design to admin components"
```

---

### Task 8: Profile

**Files:**
- Modify: `app/(app)/profile/ProfileForm.tsx`
- Modify: `app/(app)/profile/page.tsx`

- [ ] **Step 1: Replace app/(app)/profile/ProfileForm.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface ProfileFormProps {
  profile: Profile
  email: string
}

const inputCls =
  'w-full rounded-lg px-3 py-2.5 text-sm text-[#e2e2e2] placeholder-[#434655] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors'
const inputSty = { background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }
const labelCls = 'block text-sm font-medium text-[#c3c5d8] mb-1.5'

export default function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter()
  const [name, setName] = useState(profile.name)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', profile.id)

    if (profileError) {
      setMessage({ type: 'error', text: 'Erro ao salvar nome.' })
      setLoading(false)
      return
    }

    if (password) {
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não coincidem.' })
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setMessage({ type: 'error', text: 'A senha deve ter ao menos 6 caracteres.' })
        setLoading(false)
        return
      }
      const { error: pwError } = await supabase.auth.updateUser({ password })
      if (pwError) {
        setMessage({ type: 'error', text: 'Erro ao atualizar senha.' })
        setLoading(false)
        return
      }
    }

    setMessage({ type: 'success', text: 'Perfil atualizado com sucesso.' })
    setPassword('')
    setConfirmPassword('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-md">
      <div>
        <label className={labelCls}>E-mail</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-lg px-3 py-2.5 text-sm text-[#434655]"
          style={{
            background: '#1a1c1c',
            border: '1px solid rgba(255,255,255,0.05)',
            cursor: 'not-allowed',
          }}
        />
      </div>
      <div>
        <label htmlFor="name" className={labelCls}>Nome</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputCls}
          style={inputSty}
        />
      </div>
      <hr style={{ borderColor: 'rgba(255,255,255,0.07)' }} />
      <p className="text-xs text-[#8d90a1] font-medium uppercase tracking-widest">
        Alterar Senha{' '}
        <span className="normal-case font-normal text-[#434655]">(deixe em branco para manter)</span>
      </p>
      <div>
        <label htmlFor="password" className={labelCls}>Nova Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          style={inputSty}
          placeholder="••••••••"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className={labelCls}>Confirmar Senha</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputCls}
          style={inputSty}
          placeholder="••••••••"
        />
      </div>
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-[#4ade80]' : 'text-[#ffb4ab]'}`}>
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="bg-electric-blue text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] disabled:opacity-50 transition-all"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Update app/(app)/profile/page.tsx heading**

```tsx
// was:
<h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil</h1>
// becomes:
<h1 className="text-2xl font-bold text-starlight mb-6">Perfil</h1>
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/profile`. Verify: dark inputs, disabled email field dimmed, divider line in dark, success message in green, error in red/pink, Electric Blue save button.

- [ ] **Step 4: Final build check**

```bash
npm run build 2>&1 | tail -30
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/(app)/profile/"
git commit -m "feat: apply Celestial Velocity design to profile page — design system complete"
```
