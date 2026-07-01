# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
npm test             # Vitest (watch mode)
npm run test:run     # Vitest (single run, for CI)
```

## Environment Variables

Copy `.env.local` (gitignored). Required keys:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Server-only — never expose to client
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Architecture

Next.js 14 App Router + Supabase (PostgreSQL + Auth). All UI text is in Brazilian Portuguese.

### Route structure

- `app/(auth)/login/` — public, client component with `signInWithPassword`
- `app/(app)/` — protected layout; fetches session + profile, renders `<Sidebar>`
  - `dashboard/` — server component, aggregates monthly transactions
  - `transactions/` — list + `new/` form
  - `admin/members/` — member management (admin only)
  - `admin/permissions/` — toggle which members can see each other's data
  - `profile/` — name + password update

`middleware.ts` handles three redirect rules: unauthenticated → `/login`, authenticated on `/login` → `/dashboard`, non-admin on `/admin/*` → `/dashboard`.

### Supabase clients

Three clients, each with a distinct purpose — never mix them:

| File | When to use |
|------|-------------|
| `lib/supabase/client.ts` | Client components (`'use client'`) |
| `lib/supabase/server.ts` | Server components and Route Handlers (cookie-based SSR) |
| `lib/supabase/admin.ts` | Route Handlers that need service-role access (bypasses RLS) |

### API routes (`app/api/`)

All mutation logic lives here (not in Server Actions):
- `auth/callback/` — Supabase OAuth callback
- `transactions/` — CRUD for transactions
- `admin/invite/` — creates a new user via `createAdminClient()` (service role)
- `admin/members/[id]/` — remove member
- `admin/permissions/` — grant/revoke cross-member visibility

### Database schema (`supabase/migrations/001_initial_schema.sql`)

Four tables: `profiles`, `categories`, `transactions`, `member_permissions`.

Key design decisions:
- `profiles.id` = `auth.users.id` (1-to-1, created by the `handle_new_user` trigger)
- `user_role` enum: `admin` | `member`. Only one admin (the first user) manages everything.
- `member_permissions` controls which members can read each other's transactions. Admins see all.
- RLS is enabled on all tables. The `handle_new_user` trigger function must include `SET search_path = public` and use `public.profiles` / `public.user_role` (schema-qualified) to avoid a `relation "profiles" does not exist` error in the auth schema context.

### Shared utilities

- `lib/types.ts` — TypeScript interfaces mirroring the DB schema
- `lib/schemas.ts` — Zod schemas for forms (`transactionSchema`, `inviteSchema`)
- `lib/utils.ts` — `getCurrentMonthRange()` and formatting helpers
- `components/` — co-located with feature: `dashboard/`, `transactions/`, `admin/`, `layout/`

---

## Design System — Celestial Velocity

Full spec: `docs/superpowers/specs/2026-06-30-celestial-velocity-design-system.md`

The app uses a premium dark theme. **Never add light mode or `prefers-color-scheme`.**

### Color tokens (`tailwind.config.ts`)

Only three named Tailwind color tokens are active — use them as class names:

| Token | Hex | Usage |
|-------|-----|-------|
| `space-deep` | `#080816` | Page backgrounds (`bg-space-deep`) |
| `electric-blue` | `#3264FF` | Primary buttons (`bg-electric-blue`) |
| `starlight` | `#FFFFFF` | High-contrast headings (`text-starlight`) |

All other colors use Tailwind arbitrary values:

| Purpose | Value | Class example |
|---------|-------|---------------|
| Glass card background | `#121224` | `bg-[#121224]` or inline `style` |
| Input / container background | `#1e2020` | inline `style` |
| Muted text / icons | `#8d90a1` | `text-[#8d90a1]` |
| Subtle text / placeholders | `#434655` | `text-[#434655]` |
| Primary accent (income / investment) | `#b7c4ff` | `text-[#b7c4ff]` |
| Error / expense | `#ffb4ab` | `text-[#ffb4ab]` |
| Success / income | `#4ade80` | `text-[#4ade80]` |
| Label text | `#c3c5d8` | `text-[#c3c5d8]` |

**RGBA values** (borders, overlays) must always use inline `style={{}}` or Tailwind arbitrary `border-[rgba(...)]` — never as named tokens.

### Key patterns

**Glass card:**
```tsx
<div className="rounded-xl" style={{ background: '#121224', border: '1px solid rgba(255,255,255,0.07)' }}>
```

**Input field:**
```tsx
<input
  className="rounded-lg text-[#e2e2e2] focus:outline-none focus:ring-1 focus:ring-[#3264FF]"
  style={{ background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }}
/>
```

**Primary button:**
```tsx
<button className="bg-electric-blue text-white rounded-lg hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)]">
```

**Semantic transaction type colors:**
- Income → `#4ade80` (neon green)
- Expense → `#ffb4ab` (error pink)
- Investment → `#b7c4ff` (primary blue)

### Typography

Font: **Hanken Grotesk** via `next/font/google`, CSS variable `--font-hanken`, applied via `font-sans` on `<body>`.

### Logo

`public/NGG-logo2.PNG` — served via `next/image` in `Sidebar.tsx` (width 120) and `app/(auth)/login/page.tsx` (width 140).

### Icons

`lucide-react` — sidebar uses `LayoutDashboard`, `ArrowLeftRight`, `User`, `Users`, `ShieldCheck`, `LogOut`. Delete actions use `Trash2`. Invite button uses `UserPlus`.
