-- ============================================================
-- DenteSync — Community Posts Eksik Kolonlar & Tablolar (010)
-- Supabase SQL Editor'da çalıştır (idempotent)
-- ============================================================

-- community_posts: migration 002'den gelen comment_count kolonu
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;

-- Realtime publication
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'community_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'community_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE community_comments;
  END IF;
END $$;

-- post_likes tablosu (migration 002'den — yoksa oluştur)
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'post_likes_select_all') THEN
    CREATE POLICY "post_likes_select_all" ON post_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'post_likes_insert_own') THEN
    CREATE POLICY "post_likes_insert_own" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'post_likes_delete_own') THEN
    CREATE POLICY "post_likes_delete_own" ON post_likes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
