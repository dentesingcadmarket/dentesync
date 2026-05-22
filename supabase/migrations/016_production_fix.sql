-- 016_production_fix.sql
-- Supabase SQL Editor'da çalıştır

-- created_at kolonu ekle (yoksa)
ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
UPDATE store_products SET created_at = now() WHERE created_at IS NULL;

-- profiles tablosuna is_admin ekle (yoksa)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- SELECT politikasını güncelle (admin tüm ürünleri görsün)
DROP POLICY IF EXISTS "store_products_select_active" ON store_products;
CREATE POLICY "store_products_select_active" ON store_products
  FOR SELECT USING (
    is_active = true
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- INSERT / UPDATE / DELETE politikalarını garantiye al
DROP POLICY IF EXISTS "store_products_insert_admin" ON store_products;
DROP POLICY IF EXISTS "store_products_update_admin" ON store_products;
DROP POLICY IF EXISTS "store_products_delete_admin" ON store_products;

CREATE POLICY "store_products_insert_admin" ON store_products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "store_products_update_admin" ON store_products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "store_products_delete_admin" ON store_products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- store-images storage bucket (yoksa oluştur)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('store-images', 'store-images', true, 10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp'])
  ON CONFLICT (id) DO UPDATE
    SET public = true, file_size_limit = 10485760;

-- Storage politikaları
DROP POLICY IF EXISTS "store_images_select_all" ON storage.objects;
DROP POLICY IF EXISTS "store_images_insert_admin" ON storage.objects;
DROP POLICY IF EXISTS "store_images_delete_admin" ON storage.objects;

CREATE POLICY "store_images_select_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-images');
CREATE POLICY "store_images_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'store-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "store_images_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'store-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Kendi hesabını admin yap
UPDATE profiles SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'dentesingcadmarket@gmail.com');
