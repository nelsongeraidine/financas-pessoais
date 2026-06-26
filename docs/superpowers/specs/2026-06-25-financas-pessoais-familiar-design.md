# Design: Sistema de Finanças Pessoais Familiar

**Data:** 2026-06-25
**Status:** Aprovado

---

## Visão Geral

Sistema web de finanças pessoais para uso familiar com autenticação individual por membro, controle granular de permissões gerenciado pelo admin, lançamento de transações (despesas, receitas e investimentos) e dashboard com resumo individual.

**Público-alvo:** Famílias pequenas (2–5 membros).

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend / Banco | Supabase (PostgreSQL + Auth + RLS) |
| Client | Supabase JS Client (`@supabase/supabase-js`) |
| Deploy Frontend | Vercel |
| Deploy Backend | Supabase Cloud |

---

## Arquitetura

```
[Navegador] → [Next.js App Router]
                ├── Server Components  → lê dados via Supabase Server Client (cookies)
                ├── Client Components  → interações reativas no cliente
                └── API Routes (/api)  → operações de admin (permissões, convites)
```

A autenticação é gerenciada pelo Supabase Auth (e-mail + senha). O token de sessão é armazenado em cookies HTTP-only e repassado para os Server Components via `@supabase/ssr`.

A segurança de dados é garantida por Row Level Security (RLS) no PostgreSQL — as políticas são aplicadas no banco, independentemente do frontend.

---

## Modelo de Dados

### `profiles`
Extende `auth.users` do Supabase com dados de perfil e papel (role).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` | FK → `auth.users.id` |
| `name` | `text` | Nome de exibição do membro |
| `role` | `enum('admin', 'member')` | Papel no sistema |
| `avatar_url` | `text` | URL do avatar (opcional) |
| `created_at` | `timestamp` | Data de criação |

### `categories`
Categorias de transação — pré-definidas e customizáveis pelo admin.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` | PK |
| `name` | `text` | Nome da categoria (ex: "Alimentação") |
| `type` | `enum('expense', 'income', 'investment')` | Tipo da transação |
| `icon` | `text` | Ícone (ex: nome do Lucide icon) |
| `is_default` | `boolean` | Categoria padrão do sistema |
| `created_by` | `uuid` | FK → `profiles.id` (null se padrão) |

### `transactions`
Lançamentos financeiros de cada membro.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `profiles.id` (dono da transação) |
| `type` | `enum('expense', 'income', 'investment')` | Tipo |
| `category_id` | `uuid` | FK → `categories.id` |
| `amount` | `decimal(12,2)` | Valor em BRL |
| `description` | `text` | Descrição opcional |
| `date` | `date` | Data do lançamento |
| `created_at` | `timestamp` | Data de criação do registro |

### `member_permissions`
Controla quem pode visualizar as transações de quem. Gerenciado exclusivamente pelo admin.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` | PK |
| `viewer_id` | `uuid` | FK → `profiles.id` (quem vai visualizar) |
| `target_id` | `uuid` | FK → `profiles.id` (cujas transações serão visíveis) |
| `created_by` | `uuid` | FK → `profiles.id` (admin que criou) |
| `created_at` | `timestamp` | Data de criação |

**Restrição:** `viewer_id ≠ target_id` (não é necessário registrar que o usuário vê a si mesmo).

---

## Políticas de Row Level Security (RLS)

### Tabela `transactions`

**Política de leitura (`SELECT`):**
```sql
-- Admin vê todas as transações.
-- Membro vê suas próprias transações OU transações de membros
-- para os quais tem permissão explícita concedida pelo admin.
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
OR
(user_id = auth.uid())
OR
EXISTS (
  SELECT 1 FROM member_permissions
  WHERE viewer_id = auth.uid()
    AND target_id = transactions.user_id
)
```

**Política de escrita (`INSERT`, `UPDATE`, `DELETE`):**
```sql
-- Usuário só pode criar/editar/excluir suas próprias transações.
user_id = auth.uid()
```

### Tabela `member_permissions`

**Leitura:** Somente admin (`role = 'admin'`) ou o próprio `viewer_id` (para saber o que pode ver).
**Escrita:** Somente admin.

### Tabela `profiles`

**Leitura:** Todo usuário autenticado pode ler perfis (para exibir nomes no admin).
**Escrita:** Cada usuário edita somente o próprio perfil; admin edita qualquer um.

---

## Fluxos de Autenticação

### Convite de novo membro
1. Admin acessa "Membros" → clica em "Convidar membro"
2. Informa nome e e-mail
3. Sistema chama `supabase.auth.admin.inviteUserByEmail()` via API Route protegida
4. Supabase envia e-mail com link de ativação
5. Membro clica no link, define senha e acessa o sistema
6. Um trigger no Supabase cria automaticamente o registro em `profiles` com `role = 'member'`

### Login
1. Tela de login com e-mail + senha
2. `supabase.auth.signInWithPassword()`
3. Sessão armazenada em cookie HTTP-only via `@supabase/ssr`
4. Redirecionamento para `/dashboard`

### Logout
- `supabase.auth.signOut()` + redirecionamento para `/login`

---

## Estrutura de Navegação

```
/login                    ← pública
/dashboard                ← resumo individual do mês
/transactions             ← histórico com filtros
/transactions/new         ← formulário de novo lançamento
/admin/members            ← lista de membros + convites (somente admin)
/admin/permissions        ← matriz de permissões (somente admin)
/profile                  ← dados pessoais + troca de senha
```

Rotas `/admin/*` são protegidas por middleware Next.js que verifica `role = 'admin'`.

---

## Telas

### Dashboard (`/dashboard`)
- **Cards de resumo:** Total Receitas | Total Despesas | Total Investido (mês atual)
- **Saldo do mês:** receitas − despesas
- **Gráfico de despesas por categoria** (gráfico de pizza ou barras horizontais)
- **Últimas 5 transações** com tipo, categoria, valor e data
- Filtro de período (mês/ano) no topo da página

### Histórico de Transações (`/transactions`)
- Tabela paginada com todas as transações do usuário
- Filtros: tipo (despesa/receita/investimento), categoria, período (data início e fim)
- Botão "Nova transação" → `/transactions/new`
- Ação de exclusão por linha (com confirmação)

### Formulário de Transação (`/transactions/new`)
- Campo: **Tipo** — toggle entre Despesa / Receita / Investimento
- Campo: **Valor** (numérico, BRL)
- Campo: **Categoria** — select filtrado pelo tipo selecionado
- Campo: **Data** — date picker, padrão = hoje
- Campo: **Descrição** — texto livre, opcional
- Botão: Salvar

### Admin — Membros (`/admin/members`)
- Lista de membros com nome, e-mail, papel e status (ativo/pendente)
- Botão "Convidar membro" → modal com formulário de nome + e-mail
- Ação de remover membro (revoga acesso, mantém histórico de transações)

### Admin — Permissões (`/admin/permissions`)
- **Matriz visual:**
  - Linhas: membros que poderão visualizar (viewers)
  - Colunas: membros cujas transações poderão ser vistas (targets)
  - Célula: toggle (checkbox) para liberar/revogar
- Diagonal (membro × ele mesmo) fica desabilitada — cada um já vê a si mesmo por padrão
- Salvar em tempo real ao clicar no toggle (sem botão de submit separado)

---

## Categorias Padrão

| Tipo | Categorias |
|------|-----------|
| Despesa | Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Vestuário, Outros |
| Receita | Salário, Freelance, Aluguel Recebido, Outros |
| Investimento | Renda Fixa, Ações, FIIs, Criptomoedas, Poupança, Outros |

---

## Regras de Negócio

1. Todo usuário vê apenas suas próprias transações por padrão.
2. Somente o admin pode conceder ou revogar permissões de visualização entre membros.
3. A permissão é unidirecional: se João pode ver Maria, isso não implica que Maria pode ver João.
4. O admin pode ver as transações de todos os membros sem necessidade de registros em `member_permissions` (via política RLS com verificação de `role`).
5. Ao remover um membro, suas transações são mantidas no banco mas seu acesso é revogado.
6. Categorias padrão não podem ser excluídas. O admin pode criar categorias customizadas para a família.
7. Valores são sempre em BRL.

---

## Considerações de Segurança

- RLS é a linha de defesa principal — políticas aplicadas no banco, não no frontend.
- API Routes de admin validam `role = 'admin'` no servidor antes de executar qualquer operação privilegiada.
- Convites de membros são enviados via Supabase Auth (link de ativação com expiração).
- Senhas gerenciadas pelo Supabase Auth (bcrypt, sem acesso direto).
- Middleware Next.js redireciona rotas `/admin/*` para `/dashboard` se o usuário não for admin.

---

## Fora do Escopo (v1)

- Metas financeiras ou orçamento por categoria
- Relatórios exportáveis (PDF/CSV)
- Integração com APIs de cotação de investimentos
- App mobile nativo
- Notificações ou alertas automáticos
- Suporte a múltiplas moedas
