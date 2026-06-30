# Design Spec: Celestial Velocity Design System

**Date:** 2026-06-30  
**Scope:** Full visual overhaul of the financas-pessoais Next.js app  
**Approach:** Single-pass full overhaul (Option B)

---

## Overview

Apply the Celestial Velocity design system (defined in `DESIGN.md`) across every page and component of the app. Replace the current light/white theme with a premium dark aesthetic: Space Deep canvas, Electric Blue primary actions, glassmorphic cards, and Hanken Grotesk typography. Use the `NGG-logo2.PNG` asset in both the Sidebar and the Login page.

---

## Section 1 — Foundation

### Tailwind Config (`tailwind.config.ts`)

Extend the theme with all Celestial Velocity tokens:

**Colors:**
```
space-deep: #080816
electric-blue: #3264FF
starlight: #FFFFFF
surface-card: #121224
surface-container: #1e2020
surface-container-low: #1a1c1c
surface-container-high: #282a2b
surface-bright: #37393a
on-surface: #e2e2e2
on-surface-variant: #c3c5d8
outline: #8d90a1
outline-variant: #434655
glass-border: rgba(255,255,255,0.1)
primary: #b7c4ff
error: #ffb4ab
error-container: #93000a
```

**Border radius** (extend existing Tailwind scale):
```
sm: 0.25rem   (4px)
DEFAULT: 0.5rem (8px)
md: 0.75rem   (12px)
lg: 1rem      (16px)
xl: 1.5rem    (24px)
```

### Global CSS (`app/globals.css`)

- Remove `prefers-color-scheme` media query — app is always dark
- Base background: `#080816` (Space Deep)
- Base text: `#e2e2e2`
- Custom scrollbar: track `#1e2020`, thumb `#434655`, hover thumb `#8d90a1`
- CSS variable: `--glass-border: rgba(255,255,255,0.1)`

### Root Layout (`app/layout.tsx`)

- Replace `Inter` with `Hanken Grotesk` via `next/font/google`
- Weights: `400`, `500`, `600`, `700`, `800`
- Subsets: `latin`
- Apply font class to `<body>`

---

## Section 2 — Layout Shell

### App Layout (`app/(app)/layout.tsx`)

- Background: `bg-space-deep` with top radial gradient:  
  `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(50,100,255,0.15), transparent)`
- Maintain `flex min-h-screen` structure

### Sidebar (`components/layout/Sidebar.tsx`)

- Width: `w-64` (256px)
- Background: `#121224` (surface-card)
- Right border: `rgba(255,255,255,0.07)` 1px
- **Header:** `NGG-logo2.PNG` via `next/image`, width 120px, centered, padding 20px top/bottom
- **Navigation icons** via `lucide-react`:
  - Dashboard → `LayoutDashboard`
  - Lançamentos → `ArrowLeftRight`
  - Perfil → `User`
  - Membros → `Users`
  - Permissões → `ShieldCheck`
- **Active link:** left border 2px `#3264FF` + `bg-[rgba(50,100,255,0.15)]` + text `#b7c4ff`
- **Inactive link:** text `#8d90a1`, hover `bg-[rgba(255,255,255,0.05)]`
- **Footer:** user name `text-xs text-[#8d90a1]` + "Sair" button with `LogOut` icon

---

## Section 3 — Login Page (`app/(auth)/login/page.tsx`)

- **Background:** `bg-space-deep` + same radial gradient as app layout
- **Card:** glassmorphic — `bg-[#121224]`, `border border-[rgba(255,255,255,0.08)]`, `backdrop-blur-xl`, `rounded-xl`, padding 40px, `max-w-sm`
- **Logo:** `NGG-logo2.PNG` via `next/image`, width 140px, centered at top of card
- **Title:** `"Bem-vindo de volta"` — 20px semibold, `text-starlight`
- **Subtitle:** `"Entre com sua conta"` — 14px, `text-[#8d90a1]`
- **Inputs:** background `#1e2020`, border `rgba(255,255,255,0.1)`, focus border solid `#3264FF`, text `#e2e2e2`, placeholder `#434655`
- **Labels:** 14px, `text-[#c3c5d8]`
- **Primary button:** solid `#3264FF`, white text, `rounded-lg` (8px), hover `brightness-110` + `shadow-[0_0_20px_rgba(50,100,255,0.3)]`
- **Error text:** `text-[#ffb4ab]`

---

## Section 4 — Dashboard

### Page (`app/(app)/dashboard/page.tsx`)

- Title `"Dashboard"` — 24px bold, `text-starlight`
- Month label — `text-[#8d90a1]`

### SummaryCards (`components/dashboard/SummaryCards.tsx`)

- 4 glassmorphic cards: `bg-[#121224]`, border `rgba(255,255,255,0.07)`, `rounded-xl`, padding 24px
- Label: 12px uppercase tracking-wide, `text-[#8d90a1]`
- Values (semantic colors):
  - Positive balance / Receitas → `#4ade80`
  - Negative balance / Despesas → `#ffb4ab`
  - Investimentos → `#b7c4ff`
- Remove `bg-green-50` / `bg-red-50` backgrounds — single dark card for all

### ExpensesChart (`components/dashboard/ExpensesChart.tsx`)

- Glassmorphic card wrapper, title `"Despesas por Categoria"` — 16px semibold, `text-starlight`
- Chart color palette: `['#3264FF', '#7C9FFF', '#B7C4FF', '#FF6B6B', '#FFB347', '#4ade80']`
- Tooltip: background `#1e2020`, text `#e2e2e2`, border `rgba(255,255,255,0.1)`

### RecentTransactions (`components/dashboard/RecentTransactions.tsx`)

- Glassmorphic card wrapper, title `"Transações Recentes"`
- Each row: category icon + description `text-[#e2e2e2]` + semantic value color + date `text-[#8d90a1]`
- Row separators: `border-[rgba(255,255,255,0.05)]`

---

## Section 5 — Transações

### TransactionList (`components/transactions/TransactionList.tsx`)

- Glassmorphic card container
- Header: title + `"+ Novo"` Electric Blue button
- Table rows:
  - Columns: Data | Descrição | Categoria | Tipo | Valor
  - Type badge: `bg-[rgba(50,100,255,0.1)]` + border matching color + 12px text
  - Semantic value colors
  - Row hover: `bg-[rgba(255,255,255,0.03)]`
  - Separators: `border-[rgba(255,255,255,0.05)]`
- Action icons: `Pencil`, `Trash2` from `lucide-react`, `text-[#8d90a1]` hover `text-starlight`

### TransactionForm (`components/transactions/TransactionForm.tsx`)

- Glassmorphic card
- Inputs/selects: background `#1e2020`, border `rgba(255,255,255,0.1)`, focus `#3264FF`
- Labels: `text-[#c3c5d8]` 14px
- Primary button: Electric Blue; secondary "Cancelar": outlined `border-[#3264FF]` transparent bg
- Error messages: `text-[#ffb4ab]`

---

## Section 6 — Admin + Perfil

### MembersList (`components/admin/MembersList.tsx`)

- Glassmorphic card, header with `"Convidar"` Electric Blue button
- Member row: avatar circle `bg-[rgba(50,100,255,0.15)]` + initial letter `text-[#b7c4ff]` + name + email `text-[#8d90a1]`
- Admin badge: `bg-[rgba(50,100,255,0.15)]` border `#3264FF` text `#b7c4ff`
- Remove button: `Trash2` icon `text-[#8d90a1]` hover `text-[#ffb4ab]`

### InviteModal (`components/admin/InviteModal.tsx`)

- Overlay: `bg-[rgba(0,0,0,0.6)]` + `backdrop-blur-sm`
- Modal: `bg-[#1e2020]`, border `rgba(255,255,255,0.1)`, `rounded-xl`, padding 32px
- Inputs and buttons follow established patterns

### PermissionsMatrix (`components/admin/PermissionsMatrix.tsx`)

- Glassmorphic card with toggle table
- Toggle on: `bg-[#3264FF]`, off: `bg-[#434655]`, smooth transition
- Member names: `text-[#e2e2e2]`, column headers: `text-[#8d90a1]`

### ProfileForm (`app/(app)/profile/ProfileForm.tsx`)

- Glassmorphic card with sections `"Informações Pessoais"` and `"Alterar Senha"`
- Same inputs, labels, buttons as established pattern
- Electric Blue save button per section

---

## Dependencies

- `lucide-react` — install if not present (`npm install lucide-react`)
- `next/font/google` with `Hanken_Grotesk` — built into Next.js, no extra install
- `NGG-logo2.PNG` at `assets/NGG-logo2.PNG` — copy to `public/` for `next/image` access

---

## Implementation Order

1. Install `lucide-react` if needed; copy logo to `public/`
2. Update `tailwind.config.ts`
3. Update `app/globals.css`
4. Update `app/layout.tsx` (font swap)
5. Update `app/(app)/layout.tsx` (background)
6. Update `components/layout/Sidebar.tsx` (logo + icons + dark theme)
7. Update `app/(auth)/login/page.tsx` (glassmorphic card + logo)
8. Update `components/dashboard/SummaryCards.tsx`
9. Update `components/dashboard/ExpensesChart.tsx`
10. Update `components/dashboard/RecentTransactions.tsx`
11. Update `app/(app)/dashboard/page.tsx`
12. Update `components/transactions/TransactionList.tsx`
13. Update `components/transactions/TransactionForm.tsx`
14. Update `app/(app)/transactions/page.tsx` and `new/page.tsx`
15. Update `components/admin/MembersList.tsx`
16. Update `components/admin/InviteModal.tsx`
17. Update `components/admin/PermissionsMatrix.tsx`
18. Update `app/(app)/admin/members/page.tsx` and `permissions/page.tsx`
19. Update `app/(app)/profile/ProfileForm.tsx` and `profile/page.tsx`
