-- ============================================================
-- DenteSync — community-posts Storage Bucket (007)
-- Supabase SQL Editor'da çalıştır (idempotent)
-- ============================================================

-- Bucket oluştur (varsa public + limit güncelle)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-posts',
  'community-posts',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public            = true,
      file_size_limit   = 5242880,
      allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'];

-- RLS politikaları (varsa atla)
DO $$
BEGIN
  -- Authenticated kullanıcılar kendi klasörüne yükleyebilir
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'community_posts_insert_auth'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "community_posts_insert_auth" ON storage.objects
        FOR INSERT
        WITH CHECK (
          bucket_id = 'community-posts'
          AND auth.role() = 'authenticated'
        )
    $pol$;
  END IF;

  -- Herkes görselleri okuyabilir (public feed)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'community_posts_select_all'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "community_posts_select_all" ON storage.objects
        FOR SELECT
        USING (bucket_id = 'community-posts')
    $pol$;
  END IF;

  -- Kullanıcı yalnızca kendi yüklediği görseli silebilir
  -- Path formatı: {user_id}/{timestamp}.{ext}
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'community_posts_delete_own'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "community_posts_delete_own" ON storage.objects
        FOR DELETE
        USING (
          bucket_id = 'community-posts'
          AND auth.uid()::text = (string_to_array(name, '/'))[1]
        )
    $pol$;
  END IF;
END $$;
