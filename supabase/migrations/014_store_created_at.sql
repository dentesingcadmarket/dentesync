-- 014_store_created_at.sql
-- Add missing created_at column to store_products

ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

UPDATE store_products SET created_at = now() WHERE created_at IS NULL;
