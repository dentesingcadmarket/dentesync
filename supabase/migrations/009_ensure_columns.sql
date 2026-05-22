-- ============================================================
-- DenteSync — Eksik Kolonlar & Politikalar (009)
-- Supabase SQL Editor'da çalıştır (idempotent)
-- ============================================================

-- profiles: migration 004'ten gelen istatistik kolonları
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS posts_count     integer DEFAULT 0;

-- profiles: migration 005'ten gelen profil uzantıları
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio       text CHECK (char_length(bio) <= 160);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url text;

-- profiles_select_community (migration 003) — tüm kullanıcılar profil okuyabilir
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'profiles_select_community'
  ) THEN
    CREATE POLICY "profiles_select_community" ON profiles
      FOR SELECT USING (true);
  END IF;
END $$;
