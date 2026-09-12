-- 006_fix_category_id_type.sql
-- Fix category_id type mismatch: categories.id is TEXT but sell_your_bussiness.category_id is UUID
-- This causes the sell-business UPDATE to fail silently, so no form data gets saved

ALTER TABLE sell_your_bussiness
  ALTER COLUMN category_id TYPE text USING category_id::text;
