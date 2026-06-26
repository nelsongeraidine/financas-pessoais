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
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- NOTE: If the initial migration was already applied, run the following in Supabase SQL Editor:
-- DROP POLICY "usuario edita proprio perfil" ON profiles;
-- CREATE POLICY "usuario edita proprio perfil" ON profiles FOR UPDATE TO authenticated
--   USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

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
