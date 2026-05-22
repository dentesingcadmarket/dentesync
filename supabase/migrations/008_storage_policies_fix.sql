-- ============================================================
-- DenteSync — Storage Buckets & RLS Fix (008)
-- Supabase SQL Editor'da çalıştır (idempotent)
-- ============================================================

-- 1. avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 2097152,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 2097152,
      allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp'];

-- 2. covers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers', 'covers', true, 5242880,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp'];

-- 3. community-posts INSERT policy — service_role dahil
DROP POLICY IF EXISTS "community_posts_insert_auth" ON storage.objects;
CREATE POLICY "community_posts_insert_auth" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'community-posts'
    AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  );

-- 4. avatars policies
DROP POLICY IF EXISTS "avatars_insert_auth"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_select_all"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own"   ON storage.objects;

CREATE POLICY "avatars_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  );
CREATE POLICY "avatars_select_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND (auth.uid()::text = (string_to_array(name, '/'))[1] OR auth.role() = 'service_role')
  );
CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND (auth.uid()::text = (string_to_array(name, '/'))[1] OR auth.role() = 'service_role')
  );

-- 5. covers policies
DROP POLICY IF EXISTS "covers_insert_auth"  ON storage.objects;
DROP POLICY IF EXISTS "covers_select_all"   ON storage.objects;
DROP POLICY IF EXISTS "covers_update_own"   ON storage.objects;
DROP POLICY IF EXISTS "covers_delete_own"   ON storage.objects;

CREATE POLICY "covers_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'covers'
    AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  );
CREATE POLICY "covers_select_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "covers_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'covers'
    AND (auth.uid()::text = (string_to_array(name, '/'))[1] OR auth.role() = 'service_role')
  );
CREATE POLICY "covers_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'covers'
    AND (auth.uid()::text = (string_to_array(name, '/'))[1] OR auth.role() = 'service_role')
  );
