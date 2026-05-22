-- ============================================================
-- 011_missing_columns.sql
-- Topluluk bölümü için eksik sütunlar ve tablolar
-- Bu dosyayı Supabase Dashboard > SQL Editor'da çalıştırın
-- ============================================================

-- community_posts: eksik kolonlar
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS post_type text
  CHECK (post_type IN ('consultation','error_solution','material_review','step_by_step','showcase','critique_request'))
  DEFAULT 'showcase';
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS metadata jsonb;

-- community_comments: eksik kolonlar
ALTER TABLE community_comments ADD COLUMN IF NOT EXISTS technical_note text;
ALTER TABLE community_comments ADD COLUMN IF NOT EXISTS suggestion text;
ALTER TABLE community_comments ADD COLUMN IF NOT EXISTS helpful_count integer NOT NULL DEFAULT 0;
ALTER TABLE community_comments ADD COLUMN IF NOT EXISTS is_best_answer boolean NOT NULL DEFAULT false;

-- profiles: eksik kolonlar
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialty text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_years integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS technical_score integer NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS solution_score integer NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS teaching_score integer NOT NULL DEFAULT 0;

-- user_badges tablosu
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_key text NOT NULL,
  badge_label text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE (user_id, badge_key)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'badges_select_all'
  ) THEN
    CREATE POLICY "badges_select_all" ON user_badges FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'badges_insert_service'
  ) THEN
    CREATE POLICY "badges_insert_service" ON user_badges FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'badges_update_service'
  ) THEN
    CREATE POLICY "badges_update_service" ON user_badges FOR UPDATE USING (true);
  END IF;
END $$;

-- comment_helpful_votes tablosu
CREATE TABLE IF NOT EXISTS comment_helpful_votes (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comment_id uuid REFERENCES community_comments(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

ALTER TABLE comment_helpful_votes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comment_helpful_votes' AND policyname = 'chv_select_own'
  ) THEN
    CREATE POLICY "chv_select_own" ON comment_helpful_votes FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comment_helpful_votes' AND policyname = 'chv_insert_own'
  ) THEN
    CREATE POLICY "chv_insert_own" ON comment_helpful_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comment_helpful_votes' AND policyname = 'chv_delete_own'
  ) THEN
    CREATE POLICY "chv_delete_own" ON comment_helpful_votes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_best ON community_comments(post_id, is_best_answer) WHERE is_best_answer = true;
CREATE INDEX IF NOT EXISTS idx_comments_helpful ON community_comments(helpful_count DESC);
