# Sistema de Finanças Pessoais Familiar — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma aplicação web de finanças pessoais familiar com autenticação individual, controle granular de permissões gerenciado pelo admin, lançamento de transações (despesas, receitas e investimentos) e dashboard com resumo individual.

**Architecture:** Monolito Next.js 14 App Router. Server Components lêem dados diretamente via Supabase Server Client com cookies de sessão. Client Components gerenciam interatividade. API Routes protegidas tratam operações privilegiadas de admin. Row Level Security (RLS) no PostgreSQL garante isolamento de dados no banco.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + RLS), `@supabase/ssr`, `@supabase/supabase-js`, React Hook Form, Zod, Recharts, Vitest, React Testing Library.

## Global Constraints

- Todos os valores em BRL (Real Brasileiro).
- Todo texto da interface em Português do Brasil.
- Família pequena: 2–5 membros.
- Permissões são unidirecionais: `viewer_id → target_id`.
- Admin vê transações de todos os membros sem necessidade de registros em `member_permissions`.
- Categorias padrão (`is_default = TRUE`) não podem ser excluídas.
- `member_permissions` exige `viewer_id ≠ target_id` (constraint no banco).
- Node.js 18+. Use `npm` como package manager.

---

## Mapa de Arquivos

```
financas-pessoais/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx              ← tela de login
│   ├── (app)/
│   │   ├── layout.tsx                  ← layout autenticado + sidebar
│   │   ├── dashboard/page.tsx          ← dashboard individual
│   │   ├── transactions/
│   │   │   ├── page.tsx                ← histórico de transações
│   │   │   └── new/page.tsx            ← nova transação
│   │   ├── profile/page.tsx            ← perfil do usuário
│   │   └── admin/
│   │       ├── members/page.tsx        ← gerenciar membros
│   │       └── permissions/page.tsx    ← matriz de permissões
│   ├── api/
│   │   ├── auth/callback/route.ts      ← callback OAuth/convite
│   │   ├── transactions/
│   │   │   ├── route.ts                ← POST /api/transactions
│   │   │   └── [id]/route.ts           ← DELETE /api/transactions/:id
│   │   └── admin/
│   │       ├── invite/route.ts         ← POST /api/admin/invite
│   │       ├── members/[id]/route.ts   ← DELETE /api/admin/members/:id
│   │       └── permissions/route.ts    ← POST /api/admin/permissions
│   ├── layout.tsx                      ← root layout (html, body)
│   └── page.tsx                        ← redireciona para /dashboard
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx
│   ├── dashboard/
│   │   ├── SummaryCards.tsx
│   │   ├── ExpensesChart.tsx
│   │   └── RecentTransactions.tsx
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   └── TransactionList.tsx
│   └── admin/
│       ├── MembersList.tsx
│       ├── InviteModal.tsx
│       └── PermissionsMatrix.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   ← browser client
│   │   ├── server.ts                   ← server client (cookies)
│   │   └── admin.ts                    ← service role client
│   ├── types.ts                        ← tipos TypeScript compartilhados
│   ├── schemas.ts                      ← schemas Zod
│   └── utils.ts                        ← formatadores BRL, datas
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
├── middleware.ts                        ← proteção de rotas
├── __tests__/
│   ├── utils.test.ts
│   └── schemas.test.ts
├── vitest.config.ts
├── vitest.setup.ts
├── .env.local.example
└── tailwind.config.ts
```

---

## Task 1: Setup do Projeto + Clientes Supabase + Tipos

**Files:**
- Create: `package.json` (via `create-next-app`)
- Create: `.env.local.example`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`
- Create: `lib/types.ts`

**Interfaces:**
- Produces: `Profile`, `Category`, `Transaction`, `MemberPermission` (usados em todas as tasks seguintes)
- Produces: `createClient()` browser, `createClient()` server, `createAdminClient()`

- [ ] **Step 1: Criar o projeto Next.js**

```bash
cd c:/Users/ngera/OneDrive/Documentos/ClaudioCode/financas-pessoais
npx create-next-app@14 . --typescript --tailwind --app --src-dir=no --import-alias="@/*" --no-git
```

Quando perguntado sobre ESLint: Yes. Aceite os demais padrões.

- [ ] **Step 2: Instalar dependências**

```bash
npm install @supabase/supabase-js @supabase/ssr recharts react-hook-form zod @hookform/resolvers
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Criar `vitest.config.ts`**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 4: Criar `vitest.setup.ts`**

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Criar `.env.local.example`**

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Copie para `.env.local` e preencha com seus valores do Supabase Dashboard → Settings → API.

- [ ] **Step 6: Criar `lib/supabase/client.ts`**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 7: Criar `lib/supabase/server.ts`**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorar em Server Components (middleware atualiza a sessão)
          }
        },
      },
    }
  )
}
```

- [ ] **Step 8: Criar `lib/supabase/admin.ts`**

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

- [ ] **Step 9: Criar `lib/types.ts`**

```typescript
// lib/types.ts
export type UserRole = 'admin' | 'member'
export type TransactionType = 'expense' | 'income' | 'investment'

export interface Profile {
  id: string
  name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon: string
  is_default: boolean
  created_by: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  category_id: string
  amount: number
  description: string | null
  date: string
  created_at: string
  category?: Pick<Category, 'id' | 'name' | 'type' | 'icon'>
  profile?: Pick<Profile, 'id' | 'name'>
}

export interface MemberPermission {
  id: string
  viewer_id: string
  target_id: string
  created_by: string
  created_at: string
}
```

- [ ] **Step 10: Verificar que o TypeScript compila**

```bash
npx tsc --noEmit
```

Expected: nenhum erro.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: project setup with Next.js 14, Supabase clients, and shared types"
```

---

## Task 2: Utilitários + Schemas Zod (com testes)

**Files:**
- Create: `lib/utils.ts`
- Create: `lib/schemas.ts`
- Create: `__tests__/utils.test.ts`
- Create: `__tests__/schemas.test.ts`

**Interfaces:**
- Produces: `formatBRL(value: number): string`
- Produces: `formatDate(dateStr: string): string`
- Produces: `getCurrentMonthRange(): { start: string; end: string }`
- Produces: `transactionSchema`, `TransactionFormData`
- Produces: `inviteSchema`, `InviteFormData`

- [ ] **Step 1: Escrever os testes de utils (falharão)**

```typescript
// __tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatBRL, formatDate, getCurrentMonthRange } from '@/lib/utils'

describe('formatBRL', () => {
  it('formata valor positivo', () => {
    expect(formatBRL(1500)).toMatch(/1\.500,00/)
  })
  it('formata zero', () => {
    expect(formatBRL(0)).toMatch(/0,00/)
  })
  it('formata valor decimal', () => {
    expect(formatBRL(99.9)).toMatch(/99,90/)
  })
})

describe('formatDate', () => {
  it('formata data no padrão brasileiro', () => {
    expect(formatDate('2026-01-15')).toBe('15/01/2026')
  })
})

describe('getCurrentMonthRange', () => {
  it('retorna primeiro e último dia do mês atual', () => {
    const { start, end } = getCurrentMonthRange()
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    expect(start).toBe(`${year}-${month}-01`)
    expect(new Date(end).getMonth()).toBe(now.getMonth())
  })
})
```

- [ ] **Step 2: Rodar testes para confirmar falha**

```bash
npx vitest run __tests__/utils.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/utils'`

- [ ] **Step 3: Criar `lib/utils.ts`**

```typescript
// lib/utils.ts
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}
```

- [ ] **Step 4: Rodar testes de utils para confirmar aprovação**

```bash
npx vitest run __tests__/utils.test.ts
```

Expected: 5 testes passando (PASS).

- [ ] **Step 5: Escrever os testes de schemas (falharão)**

```typescript
// __tests__/schemas.test.ts
import { describe, it, expect } from 'vitest'
import { transactionSchema, inviteSchema } from '@/lib/schemas'

describe('transactionSchema', () => {
  const valid = {
    type: 'expense',
    amount: 150.5,
    category_id: '550e8400-e29b-41d4-a716-446655440000',
    date: '2026-06-25',
    description: 'Supermercado',
  }

  it('aceita dados válidos', () => {
    expect(transactionSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita amount negativo', () => {
    const result = transactionSchema.safeParse({ ...valid, amount: -10 })
    expect(result.success).toBe(false)
  })

  it('rejeita amount zero', () => {
    const result = transactionSchema.safeParse({ ...valid, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita tipo inválido', () => {
    const result = transactionSchema.safeParse({ ...valid, type: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejeita data inválida', () => {
    const result = transactionSchema.safeParse({ ...valid, date: '25/06/2026' })
    expect(result.success).toBe(false)
  })

  it('aceita description vazia', () => {
    const result = transactionSchema.safeParse({ ...valid, description: '' })
    expect(result.success).toBe(true)
  })
})

describe('inviteSchema', () => {
  it('aceita nome e email válidos', () => {
    const result = inviteSchema.safeParse({ name: 'Maria', email: 'maria@email.com' })
    expect(result.success).toBe(true)
  })

  it('rejeita email inválido', () => {
    const result = inviteSchema.safeParse({ name: 'Maria', email: 'nao-e-email' })
    expect(result.success).toBe(false)
  })

  it('rejeita nome vazio', () => {
    const result = inviteSchema.safeParse({ name: '', email: 'a@b.com' })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 6: Rodar para confirmar falha**

```bash
npx vitest run __tests__/schemas.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/schemas'`

- [ ] **Step 7: Criar `lib/schemas.ts`**

```typescript
// lib/schemas.ts
import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'investment']),
  amount: z.coerce
    .number()
    .positive('Valor deve ser maior que zero'),
  category_id: z.string().uuid('Selecione uma categoria válida'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use AAAA-MM-DD)'),
  description: z.string().optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

export const inviteSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
})

export type InviteFormData = z.infer<typeof inviteSchema>
```

- [ ] **Step 8: Rodar todos os testes**

```bash
npx vitest run
```

Expected: todos os testes passando (PASS).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add utility functions and Zod schemas with tests"
```

---

## Task 3: Schema do Banco de Dados + RLS + Seed

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/seed.sql`

**Interfaces:**
- Produces: tabelas `profiles`, `categories`, `transactions`, `member_permissions` no PostgreSQL
- Produces: políticas RLS conforme o design spec

> **Pré-requisito:** Tenha um projeto criado no Supabase Cloud (supabase.com → New Project). Anote a URL e as chaves.

- [ ] **Step 1: Criar `supabase/migrations/001_initial_schema.sql`**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE transaction_type AS ENUM ('expense', 'income', 'investment');

-- ─── Tabelas ───────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       user_role NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  type       transaction_type NOT NULL,
  icon       TEXT NOT NULL DEFAULT 'circle',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        transaction_type NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  amount      DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE member_permissions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viewer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_permission CHECK (viewer_id != target_id),
  UNIQUE (viewer_id, target_id)
);

-- ─── Trigger: criar perfil automaticamente após signup ──────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_permissions ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "usuarios autenticados leem todos os perfis"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "usuario edita proprio perfil"
  ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- categories
CREATE POLICY "usuarios autenticados leem categorias"
  ON categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin cria categorias"
  ON categories FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "admin exclui categorias nao padrao"
  ON categories FOR DELETE TO authenticated
  USING (
    is_default = FALSE AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- transactions
CREATE POLICY "leitura de transacoes com permissao"
  ON transactions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM member_permissions
      WHERE viewer_id = auth.uid() AND target_id = transactions.user_id
    )
  );

CREATE POLICY "usuario insere proprias transacoes"
  ON transactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "usuario atualiza proprias transacoes"
  ON transactions FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "usuario exclui proprias transacoes"
  ON transactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- member_permissions
CREATE POLICY "admin e viewer leem permissoes"
  ON member_permissions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR viewer_id = auth.uid()
  );

CREATE POLICY "admin insere permissoes"
  ON member_permissions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "admin exclui permissoes"
  ON member_permissions FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
```

- [ ] **Step 2: Criar `supabase/seed.sql`**

```sql
-- supabase/seed.sql
INSERT INTO categories (name, type, icon, is_default) VALUES
  ('Alimentação',      'expense',    'utensils',    TRUE),
  ('Transporte',       'expense',    'car',         TRUE),
  ('Moradia',          'expense',    'home',        TRUE),
  ('Saúde',            'expense',    'heart',       TRUE),
  ('Educação',         'expense',    'book',        TRUE),
  ('Lazer',            'expense',    'gamepad-2',   TRUE),
  ('Vestuário',        'expense',    'shirt',       TRUE),
  ('Outros',           'expense',    'circle',      TRUE),
  ('Salário',          'income',     'briefcase',   TRUE),
  ('Freelance',        'income',     'laptop',      TRUE),
  ('Aluguel Recebido', 'income',     'building',    TRUE),
  ('Outros',           'income',     'circle',      TRUE),
  ('Renda Fixa',       'investment', 'trending-up', TRUE),
  ('Ações',            'investment', 'bar-chart-2', TRUE),
  ('FIIs',             'investment', 'landmark',    TRUE),
  ('Criptomoedas',     'investment', 'bitcoin',     TRUE),
  ('Poupança',         'investment', 'piggy-bank',  TRUE),
  ('Outros',           'investment', 'circle',      TRUE);
```

- [ ] **Step 3: Aplicar o schema no Supabase**

Acesse o **Supabase Dashboard → SQL Editor** e execute o conteúdo de `001_initial_schema.sql` completo.

Em seguida, execute o conteúdo de `seed.sql` no SQL Editor.

- [ ] **Step 4: Criar o primeiro usuário admin manualmente**

No Supabase Dashboard → Authentication → Users → Invite User:
- Informe seu e-mail
- Depois de criar a conta, execute no SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<seu-uuid>';
```

Substitua `<seu-uuid>` pelo UUID exibido na lista de usuários.

- [ ] **Step 5: Verificar no SQL Editor**

```sql
SELECT * FROM profiles;
SELECT * FROM categories ORDER BY type, name;
```

Expected: 1 perfil com `role = 'admin'` e 18 categorias.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add database schema, RLS policies, and seed data"
```

---

## Task 4: Autenticação — Login + Callback + Middleware

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/api/auth/callback/route.ts`
- Create: `middleware.ts`
- Modify: `app/layout.tsx`
- Create: `app/page.tsx`

**Interfaces:**
- Consumes: `createClient()` de `lib/supabase/client.ts` e `lib/supabase/server.ts`
- Produces: sessão autenticada via cookie; redirecionamento `/` → `/dashboard`; proteção de `/admin/*`

- [ ] **Step 1: Criar `app/page.tsx`**

```typescript
// app/page.tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 2: Criar `app/layout.tsx`**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finanças Familiar',
  description: 'Controle financeiro para toda a família',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Criar `app/(auth)/login/page.tsx`**

```typescript
// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Finanças Familiar</h1>
        <p className="text-gray-500 text-sm mb-6">Entre com sua conta</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Criar `app/api/auth/callback/route.ts`**

```typescript
// app/api/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
```

- [ ] **Step 5: Criar `middleware.ts`**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
```

- [ ] **Step 6: Configurar Supabase Auth — URL de Callback**

No Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** `http://localhost:3000/api/auth/callback`

- [ ] **Step 7: Testar manualmente o fluxo de login**

```bash
npm run dev
```

Acesse `http://localhost:3000`. Deve redirecionar para `/login`. Faça login com o usuário admin criado no Task 3. Deve ir para `/dashboard` (que ainda não existe — você verá um 404, o que é esperado).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add authentication with login page, callback route, and middleware"
```

---

## Task 5: Layout Autenticado + Sidebar

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: `Profile` de `lib/types.ts`
- Consumes: `createClient()` de `lib/supabase/server.ts`
- Produces: layout com sidebar visível em todas as rotas `(app)/*`

- [ ] **Step 1: Criar `app/(app)/layout.tsx`**

```typescript
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar profile={profile} />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Criar `components/layout/Sidebar.tsx`**

```typescript
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
```

- [ ] **Step 3: Criar placeholder para dashboard (para testar o layout)**

```typescript
// app/(app)/dashboard/page.tsx
export default function DashboardPage() {
  return <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
}
```

- [ ] **Step 4: Testar manualmente**

Com `npm run dev` rodando: faça login e verifique se a sidebar aparece corretamente com os links de admin visíveis apenas para o usuário admin.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add authenticated app layout with sidebar navigation"
```

---

## Task 6: Formulário de Transação + API de Criação

**Files:**
- Create: `app/api/transactions/route.ts`
- Create: `components/transactions/TransactionForm.tsx`
- Create: `app/(app)/transactions/new/page.tsx`

**Interfaces:**
- Consumes: `transactionSchema`, `TransactionFormData` de `lib/schemas.ts`
- Consumes: `Category`, `TransactionType` de `lib/types.ts`
- Consumes: `createClient()` de `lib/supabase/server.ts`
- Produces: `POST /api/transactions` → `{ id, user_id, type, ... }` (201) ou `{ error }` (400/401/500)

- [ ] **Step 1: Criar `app/api/transactions/route.ts`**

```typescript
// app/api/transactions/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transactionSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = transactionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 2: Criar `components/transactions/TransactionForm.tsx`**

```typescript
// components/transactions/TransactionForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionFormData } from '@/lib/schemas'
import type { Category, TransactionType } from '@/lib/types'

interface TransactionFormProps {
  categories: Category[]
}

const typeLabels: Record<TransactionType, string> = {
  expense: 'Despesa',
  income: 'Receita',
  investment: 'Investimento',
}

export default function TransactionForm({ categories }: TransactionFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'expense', date: today },
  })

  const selectedType = watch('type')
  const filteredCategories = categories.filter((c) => c.type === selectedType)

  async function onSubmit(data: TransactionFormData) {
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
      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
        <div className="flex gap-2">
          {(['expense', 'income', 'investment'] as TransactionType[]).map((t) => (
            <label key={t} className="flex-1">
              <input type="radio" value={t} {...register('type')} className="sr-only" />
              <span
                className={`block text-center py-2 px-3 rounded-lg text-sm border cursor-pointer transition-colors ${
                  selectedType === t
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {typeLabels[t]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Valor */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Valor (R$)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          {...register('amount')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0,00"
        />
        {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount.message}</p>}
      </div>

      {/* Categoria */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <select
          id="category_id"
          {...register('category_id')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Selecione uma categoria</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="text-red-600 text-xs mt-1">{errors.category_id.message}</p>
        )}
      </div>

      {/* Data */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Data
        </label>
        <input
          id="date"
          type="date"
          {...register('date')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>}
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição <span className="text-gray-400">(opcional)</span>
        </label>
        <input
          id="description"
          type="text"
          {...register('description')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Supermercado Extra"
        />
      </div>

      {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Criar `app/(app)/transactions/new/page.tsx`**

```typescript
// app/(app)/transactions/new/page.tsx
import { createClient } from '@/lib/supabase/server'
import TransactionForm from '@/components/transactions/TransactionForm'

export default async function NewTransactionPage() {
  const supabase = createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nova Transação</h1>
      <TransactionForm categories={categories ?? []} />
    </div>
  )
}
```

- [ ] **Step 4: Testar manualmente**

Acesse `http://localhost:3000/transactions/new`. Preencha o formulário e salve. Verifique no Supabase Dashboard → Table Editor → transactions que o registro foi criado.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add transaction form and POST /api/transactions route"
```

---

## Task 7: Histórico de Transações + API de Exclusão

**Files:**
- Create: `app/api/transactions/[id]/route.ts`
- Create: `components/transactions/TransactionList.tsx`
- Create: `app/(app)/transactions/page.tsx`

**Interfaces:**
- Consumes: `Transaction` de `lib/types.ts`
- Consumes: `formatBRL`, `formatDate` de `lib/utils.ts`
- Produces: `DELETE /api/transactions/:id` → 204 ou `{ error }` (401/403/500)
- Produces: página listando transações com filtros e ação de exclusão

- [ ] **Step 1: Criar `app/api/transactions/[id]/route.ts`**

```typescript
// app/api/transactions/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 2: Criar `components/transactions/TransactionList.tsx`**

```typescript
// components/transactions/TransactionList.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL, formatDate } from '@/lib/utils'
import type { Transaction, TransactionType } from '@/lib/types'

interface TransactionListProps {
  transactions: Transaction[]
  currentUserId: string
}

const typeColors: Record<TransactionType, string> = {
  income: 'text-green-600',
  expense: 'text-red-600',
  investment: 'text-blue-600',
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

    if (response.ok) {
      router.refresh()
    } else {
      alert('Erro ao excluir. Tente novamente.')
    }
  }

  if (transactions.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-8 text-center">
        Nenhuma transação encontrada.
      </p>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Categoria</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Descrição</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Valor</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">{formatDate(tx.date)}</td>
              <td className="px-4 py-3">
                <span className={`font-medium ${typeColors[tx.type]}`}>
                  {typeLabels[tx.type]}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">{tx.category?.name ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500">{tx.description ?? '—'}</td>
              <td className={`px-4 py-3 text-right font-medium ${typeColors[tx.type]}`}>
                {formatBRL(Number(tx.amount))}
              </td>
              <td className="px-4 py-3">
                {tx.user_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deleting === tx.id}
                    className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 text-xs"
                  >
                    {deleting === tx.id ? '...' : 'Excluir'}
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

- [ ] **Step 3: Criar `app/(app)/transactions/page.tsx`**

```typescript
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
    .select('*, category:categories(id, name, type, icon)')
    .order('date', { ascending: false })

  if (searchParams.type && ['expense', 'income', 'investment'].includes(searchParams.type)) {
    query = query.eq('type', searchParams.type)
  }
  if (searchParams.start) query = query.gte('date', searchParams.start)
  if (searchParams.end) query = query.lte('date', searchParams.end)

  const { data: transactions } = await query

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
        <Link
          href="/transactions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nova Transação
        </Link>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="type"
          defaultValue={searchParams.type ?? ''}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          name="end"
          defaultValue={searchParams.end ?? ''}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          Filtrar
        </button>
        <Link
          href="/transactions"
          className="text-gray-500 text-sm py-2 hover:text-gray-700"
        >
          Limpar
        </Link>
      </form>

      <TransactionList transactions={transactions ?? []} currentUserId={user.id} />
    </div>
  )
}
```

- [ ] **Step 4: Testar manualmente**

Acesse `/transactions`. Verifique listagem e filtros. Crie uma transação em `/transactions/new` e confirme que aparece. Teste exclusão.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add transaction history page and DELETE /api/transactions/:id"
```

---

## Task 8: Dashboard Individual

**Files:**
- Modify: `app/(app)/dashboard/page.tsx` (substitui placeholder)
- Create: `components/dashboard/SummaryCards.tsx`
- Create: `components/dashboard/ExpensesChart.tsx`
- Create: `components/dashboard/RecentTransactions.tsx`

**Interfaces:**
- Consumes: `formatBRL`, `formatDate`, `getCurrentMonthRange` de `lib/utils.ts`
- Consumes: `Transaction`, `TransactionType` de `lib/types.ts`
- Produces: dashboard com cards de resumo, gráfico de despesas e lista das últimas 5 transações

- [ ] **Step 1: Criar `components/dashboard/SummaryCards.tsx`**

```typescript
// components/dashboard/SummaryCards.tsx
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
      color: balance >= 0 ? 'text-green-600' : 'text-red-600',
      bg: balance >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    { label: 'Receitas', value: totalIncome, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Despesas', value: totalExpense, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Investimentos', value: totalInvestment, color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, color, bg }) => (
        <div key={label} className={`rounded-xl border border-gray-200 p-4 ${bg}`}>
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{formatBRL(value)}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Criar `components/dashboard/ExpensesChart.tsx`**

```typescript
// components/dashboard/ExpensesChart.tsx
'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ChartItem {
  name: string
  value: number
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

interface ExpensesChartProps {
  data: ChartItem[]
}

export default function ExpensesChart({ data }: ExpensesChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Despesas por Categoria</h2>
        <p className="text-gray-400 text-sm text-center py-8">Sem despesas no período</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Despesas por Categoria</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 3: Criar `components/dashboard/RecentTransactions.tsx`**

```typescript
// components/dashboard/RecentTransactions.tsx
import Link from 'next/link'
import { formatBRL, formatDate } from '@/lib/utils'
import type { Transaction, TransactionType } from '@/lib/types'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const typeColors: Record<TransactionType, string> = {
  income: 'text-green-600',
  expense: 'text-red-600',
  investment: 'text-blue-600',
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Últimas Transações</h2>
        <Link href="/transactions" className="text-xs text-blue-600 hover:underline">
          Ver todas
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">Nenhuma transação no período</p>
      ) : (
        <ul className="space-y-3">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">{tx.category?.name ?? '—'}</p>
                <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
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

- [ ] **Step 4: Substituir `app/(app)/dashboard/page.tsx`**

```typescript
// app/(app)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getCurrentMonthRange } from '@/lib/utils'
import SummaryCards from '@/components/dashboard/SummaryCards'
import ExpensesChart from '@/components/dashboard/ExpensesChart'
import RecentTransactions from '@/components/dashboard/RecentTransactions'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { start, end } = getCurrentMonthRange()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, category:categories(id, name, type, icon)')
    .eq('user_id', user.id)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })

  const txs = transactions ?? []

  const totalIncome = txs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = txs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalInvestment = txs
    .filter((t) => t.type === 'investment')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  const expensesByCategory = txs
    .filter((t) => t.type === 'expense')
    .reduce(
      (acc, t) => {
        const name = t.category?.name ?? 'Outros'
        acc[name] = (acc[name] ?? 0) + Number(t.amount)
        return acc
      },
      {} as Record<string, number>
    )

  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </div>
      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        totalInvestment={totalInvestment}
        balance={balance}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpensesChart data={chartData} />
        <RecentTransactions transactions={txs.slice(0, 5)} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Testar manualmente**

Acesse `/dashboard`. Verifique os cards de resumo e o gráfico com os dados do mês atual.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add individual dashboard with summary cards and expenses chart"
```

---

## Task 9: Admin — Gerenciamento de Membros

**Files:**
- Create: `app/api/admin/invite/route.ts`
- Create: `app/api/admin/members/[id]/route.ts`
- Create: `components/admin/InviteModal.tsx`
- Create: `components/admin/MembersList.tsx`
- Create: `app/(app)/admin/members/page.tsx`

**Interfaces:**
- Consumes: `inviteSchema`, `InviteFormData` de `lib/schemas.ts`
- Consumes: `Profile` de `lib/types.ts`
- Consumes: `createAdminClient()` de `lib/supabase/admin.ts`
- Produces: `POST /api/admin/invite` → 201 ou erro; `DELETE /api/admin/members/:id` → 204 ou erro

- [ ] **Step 1: Criar `app/api/admin/invite/route.ts`**

```typescript
// app/api/admin/invite/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { inviteSchema } from '@/lib/schemas'

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
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: { name: parsed.data.name, role: 'member' },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/auth/callback`,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Convite enviado com sucesso' }, { status: 201 })
}
```

- [ ] **Step 2: Criar `app/api/admin/members/[id]/route.ts`**

```typescript
// app/api/admin/members/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
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

  if (params.id === user.id) {
    return NextResponse.json({ error: 'Admin não pode remover a si mesmo' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 3: Criar `components/admin/InviteModal.tsx`**

```typescript
// components/admin/InviteModal.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inviteSchema, type InviteFormData } from '@/lib/schemas'

interface InviteModalProps {
  onClose: () => void
}

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
    setTimeout(() => {
      onClose()
      router.refresh()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Convidar Membro</h2>
        {success ? (
          <p className="text-green-600 text-sm text-center py-4">
            Convite enviado com sucesso!
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Maria Silva"
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="maria@email.com"
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>
            {serverError && <p className="text-red-600 text-sm">{serverError}</p>}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
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

- [ ] **Step 4: Criar `components/admin/MembersList.tsx`**

```typescript
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
```

- [ ] **Step 5: Criar `app/(app)/admin/members/page.tsx`**

```typescript
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
```

- [ ] **Step 6: Adicionar `NEXT_PUBLIC_SITE_URL` ao `.env.local.example`**

```bash
# .env.local.example (adicionar)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

E adicionar ao seu `.env.local` também.

- [ ] **Step 7: Testar manualmente**

Acesse `/admin/members`. Verifique a lista de membros. Teste o botão "Convidar Membro". Verifique que o e-mail de convite é enviado (verifique o Supabase Dashboard → Authentication → Users para ver o usuário pendente).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add admin members management with invite and remove functionality"
```

---

## Task 10: Admin — Matriz de Permissões

**Files:**
- Create: `app/api/admin/permissions/route.ts`
- Create: `components/admin/PermissionsMatrix.tsx`
- Create: `app/(app)/admin/permissions/page.tsx`

**Interfaces:**
- Consumes: `Profile`, `MemberPermission` de `lib/types.ts`
- Produces: `POST /api/admin/permissions` com `{ viewer_id, target_id, grant: boolean }` → `{ ok: true }` ou erro
- Produces: matriz visual onde admin concede/revoga permissões por toggle

- [ ] **Step 1: Criar `app/api/admin/permissions/route.ts`**

```typescript
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
```

- [ ] **Step 2: Criar `components/admin/PermissionsMatrix.tsx`**

```typescript
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
```

- [ ] **Step 3: Criar `app/(app)/admin/permissions/page.tsx`**

```typescript
// app/(app)/admin/permissions/page.tsx
import { createClient } from '@/lib/supabase/server'
import PermissionsMatrix from '@/components/admin/PermissionsMatrix'

export default async function AdminPermissionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: members }, { data: permissions }] = await Promise.all([
    supabase.from('profiles').select('*').order('name'),
    supabase.from('member_permissions').select('*'),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Permissões</h1>
      <p className="text-gray-500 text-sm mb-6">
        Ative o toggle para permitir que um membro visualize as transações de outro.
      </p>
      <PermissionsMatrix
        members={members ?? []}
        permissions={permissions ?? []}
        currentUserId={user.id}
      />
    </div>
  )
}
```

- [ ] **Step 4: Testar manualmente**

Acesse `/admin/permissions`. Com ao menos 2 membros ativos, a matriz deve aparecer. Ative um toggle e verifique no Supabase Dashboard → Table Editor → member_permissions que o registro foi criado. Desative e verifique que foi removido.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add admin permissions matrix with real-time toggle"
```

---

## Task 11: Perfil do Usuário

**Files:**
- Create: `app/(app)/profile/page.tsx`

**Interfaces:**
- Consumes: `createClient()` de `lib/supabase/server.ts` e `lib/supabase/client.ts`
- Produces: formulário para editar nome e senha

- [ ] **Step 1: Criar `app/(app)/profile/page.tsx`**

```typescript
// app/(app)/profile/page.tsx
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil</h1>
      <ProfileForm profile={profile} email={user.email ?? ''} />
    </div>
  )
}
```

- [ ] **Step 2: Criar `app/(app)/profile/ProfileForm.tsx`**

```typescript
// app/(app)/profile/ProfileForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface ProfileFormProps {
  profile: Profile
  email: string
}

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
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400"
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <hr className="border-gray-200" />
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        Alterar Senha <span className="normal-case font-normal">(deixe em branco para manter)</span>
      </p>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Nova Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar Senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Testar manualmente**

Acesse `/profile`. Altere o nome e salve. Verifique que o nome na sidebar atualizou. Teste alteração de senha.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add user profile page with name and password update"
```

---

## Task 12: Verificação Final

- [ ] **Step 1: Rodar todos os testes automatizados**

```bash
npx vitest run
```

Expected: todos passando.

- [ ] **Step 2: Build de produção**

```bash
npm run build
```

Expected: build bem-sucedido sem erros de TypeScript.

- [ ] **Step 3: Checklist de fluxos manuais**

Teste cada fluxo abaixo:

- [ ] Login com e-mail e senha
- [ ] Redirecionamento de `/login` quando já autenticado
- [ ] Redirecionamento de `/admin/*` para membro sem role admin
- [ ] Criar transação (despesa, receita, investimento)
- [ ] Visualizar histórico de transações com filtros
- [ ] Excluir transação própria
- [ ] Dashboard mostra totais corretos do mês atual
- [ ] Admin convida novo membro
- [ ] Admin remove membro
- [ ] Admin ativa permissão na matriz
- [ ] Membro com permissão vê transações do target em `/transactions`
- [ ] Membro sem permissão não vê transações de outros
- [ ] Atualizar nome no perfil
- [ ] Logout

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "chore: complete implementation — all tasks done"
```
