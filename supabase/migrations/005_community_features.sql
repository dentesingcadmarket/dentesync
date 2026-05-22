-- ============================================================
-- DenteSync — Community Features (005)
-- Supabase SQL Editor'da çalıştır
-- ============================================================

-- ── 1. profiles genişletme ───────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text CHECK (char_length(bio) <= 160);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url text;

-- ── 2. hashtags ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  post_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hashtags' AND policyname='hashtags_select_all') THEN
    CREATE POLICY "hashtags_select_all" ON hashtags FOR SELECT USING (true);
  END IF;
END $$;

-- ── 3. post_hashtags (junction) ──────────────────────────────
CREATE TABLE IF NOT EXISTS post_hashtags (
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  hashtag_id uuid REFERENCES hashtags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, hashtag_id)
);
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_hashtags' AND policyname='post_hashtags_select_all') THEN
    CREATE POLICY "post_hashtags_select_all" ON post_hashtags FOR SELECT USING (true);
  END IF;
END $$;

-- ── 4. hashtag post_count trigger ────────────────────────────
CREATE OR REPLACE FUNCTION update_hashtag_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE hashtags SET post_count = post_count + 1 WHERE id = NEW.hashtag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE hashtags SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.hashtag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_hashtag_change ON post_hashtags;
CREATE TRIGGER on_post_hashtag_change
  AFTER INSERT OR DELETE ON post_hashtags
  FOR EACH ROW EXECUTE FUNCTION update_hashtag_post_count();

-- ── 5. notifications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('like','comment','follow','mention','reply')) NOT NULL,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Duplicate beğeni bildirimi önleme
CREATE UNIQUE INDEX IF NOT EXISTS idx_notif_like_unique
  ON notifications(user_id, actor_id, type, post_id)
  WHERE type = 'like';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='notifications_select_own') THEN
    CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── 6. saved_posts ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_posts (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_posts' AND policyname='saved_posts_select_own') THEN
    CREATE POLICY "saved_posts_select_own" ON saved_posts FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "saved_posts_insert_own" ON saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "saved_posts_delete_own" ON saved_posts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── 7. Full-text search: community_posts (Turkish) ───────────
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('turkish', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_search_update ON community_posts;
CREATE TRIGGER on_post_search_update
  BEFORE INSERT OR UPDATE OF content ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_post_search_vector();

UPDATE community_posts
SET search_vector = to_tsvector('turkish', COALESCE(content, ''))
WHERE search_vector IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON community_posts USING GIN(search_vector);

-- ── 8. Full-text search: profiles (simple) ───────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION update_profile_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple',
    COALESCE(NEW.username, '') || ' ' || COALESCE(NEW.full_name, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_search_update ON profiles;
CREATE TRIGGER on_profile_search_update
  BEFORE INSERT OR UPDATE OF username, full_name ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_search_vector();

UPDATE profiles
SET search_vector = to_tsvector('simple',
  COALESCE(username, '') || ' ' || COALESCE(full_name, ''))
WHERE search_vector IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_search_vector ON profiles USING GIN(search_vector);

-- ── 9. Storage buckets (avatars + covers) ─────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('avatars', 'avatars', true, 2097152)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('covers', 'covers', true, 5242880)
  ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='avatars_insert_auth') THEN
    EXECUTE 'CREATE POLICY "avatars_insert_auth" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''avatars'' AND auth.role() = ''authenticated'')';
    EXECUTE 'CREATE POLICY "avatars_select_all" ON storage.objects FOR SELECT USING (bucket_id = ''avatars'')';
    EXECUTE 'CREATE POLICY "covers_insert_auth" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''covers'' AND auth.role() = ''authenticated'')';
    EXECUTE 'CREATE POLICY "covers_select_all" ON storage.objects FOR SELECT USING (bucket_id = ''covers'')';
  END IF;
END $$;

-- ── 10. Realtime ──────────────────────────────────────────────
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;
