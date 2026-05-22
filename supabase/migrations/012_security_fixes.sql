-- Fix 1: user_badges - replace overly permissive policies with service_role-only
-- The previous policies used WITH CHECK (true) / USING (true) which allowed any
-- authenticated user to insert/update badges for any user via the REST API.
-- Badge awarding is only done via server actions using adminDb (service_role),
-- so restricting to service_role is safe and correct.

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'badges_insert_service'
  ) THEN
    DROP POLICY "badges_insert_service" ON user_badges;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'badges_update_service'
  ) THEN
    DROP POLICY "badges_update_service" ON user_badges;
  END IF;
END $$;

CREATE POLICY "badges_insert_service" ON user_badges
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "badges_update_service" ON user_badges
  FOR UPDATE USING (auth.role() = 'service_role');

-- Fix 2: Add missing performance indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag_id ON post_hashtags(hashtag_id);
