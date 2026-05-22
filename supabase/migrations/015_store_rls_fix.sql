-- 015_store_rls_fix.sql
-- store_products INSERT / UPDATE / DELETE policy'lerini garantiye al
-- Bu dosyayı Supabase SQL Editor'da çalıştır

-- Eski politikaları temizle (varsa)
DROP POLICY IF EXISTS "store_products_insert_admin" ON store_products;
DROP POLICY IF EXISTS "store_products_update_admin" ON store_products;
DROP POLICY IF EXISTS "store_products_delete_admin" ON store_products;

-- Sadece is_admin=true olan kullanıcılar ürün ekleyebilir / güncelleyebilir / silebilir
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

-- Kendi profilini admin yap (email adresi değiştir)
-- UPDATE profiles SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'dentesingcadmarket@gmail.com');
