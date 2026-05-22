-- 013_store_admin.sql
-- DenteSync — Store Admin Panel: DB + Storage

-- 1. Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Update select policy so admins can see inactive products too
DROP POLICY IF EXISTS "store_products_select_active" ON store_products;

CREATE POLICY "store_products_select_active" ON store_products
  FOR SELECT USING (
    is_active = true
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 3. Admin write policies for store_products
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'store_products'
    AND policyname = 'store_products_insert_admin'
  ) THEN
    EXECUTE 'CREATE POLICY "store_products_insert_admin" ON store_products
      FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'store_products'
    AND policyname = 'store_products_update_admin'
  ) THEN
    EXECUTE 'CREATE POLICY "store_products_update_admin" ON store_products
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'store_products'
    AND policyname = 'store_products_delete_admin'
  ) THEN
    EXECUTE 'CREATE POLICY "store_products_delete_admin" ON store_products
      FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )';
  END IF;
END $$;

-- 4. store-images storage bucket (public, 10MB, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'store-images',
    'store-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
  ON CONFLICT (id) DO UPDATE
    SET public = true, file_size_limit = 10485760;

-- 5. Storage RLS for store-images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects'
    AND schemaname = 'storage' AND policyname = 'store_images_select_all'
  ) THEN
    EXECUTE 'CREATE POLICY "store_images_select_all" ON storage.objects
      FOR SELECT USING (bucket_id = ''store-images'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects'
    AND schemaname = 'storage' AND policyname = 'store_images_insert_admin'
  ) THEN
    EXECUTE 'CREATE POLICY "store_images_insert_admin" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = ''store-images'' AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects'
    AND schemaname = 'storage' AND policyname = 'store_images_delete_admin'
  ) THEN
    EXECUTE 'CREATE POLICY "store_images_delete_admin" ON storage.objects
      FOR DELETE USING (
        bucket_id = ''store-images'' AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
      )';
  END IF;
END $$;

-- ============================================================
-- After running this migration, set yourself as admin:
--
-- UPDATE profiles SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'dentesingcadmarket@gmail.com');
-- ============================================================
