-- ============================================================
-- DenteSync — Community Images Bucket Güvence (006)
-- Supabase SQL Editor'da çalıştır (idempotent)
-- ============================================================

-- community-images bucket'ını oluştur veya public yap
INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('community-images', 'community-images', true, 5242880)
  ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

-- Storage politikaları (zaten varsa atla)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'community_images_insert_auth'
  ) THEN
    EXECUTE 'CREATE POLICY "community_images_insert_auth" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = ''community-images'' AND auth.role() = ''authenticated''
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'community_images_select_all'
  ) THEN
    EXECUTE 'CREATE POLICY "community_images_select_all" ON storage.objects
      FOR SELECT USING (bucket_id = ''community-images'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'community_images_delete_own'
  ) THEN
    EXECUTE 'CREATE POLICY "community_images_delete_own" ON storage.objects
      FOR DELETE USING (
        bucket_id = ''community-images'' AND
        auth.uid()::text = (string_to_array(name, ''/'' ))[2]
      )';
  END IF;
END $$;
