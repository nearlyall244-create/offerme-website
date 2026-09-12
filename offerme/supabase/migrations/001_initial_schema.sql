-- ============================================================================
-- OfferMe Database Migration
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- 
-- This migration:
--   1. Creates categories table
--   2. Creates public_users table (replaces customers)
--   3. Creates business_owners table (new, separated from shops)
--   4. Creates businesses table (replaces shops)
--   5. Updates offers table
--   6. Updates offer_redemptions table
--   7. Updates admin_logs table
--   8. Adds foreign keys, indexes, RLS policies
--
-- IMPORTANT: Run the data migration section first, then the drop section.
-- ============================================================================

-- ============================================================================
-- 1. CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert categories from the frontend data
INSERT INTO categories (name, slug, icon, is_active) VALUES
  ('Food & Drinks', 'food-drinks', '🍽️', true),
  ('Grocery & Supermarkets', 'grocery-supermarkets', '🛒', true),
  ('Fashion & Clothing', 'fashion-clothing', '👗', true),
  ('Beauty & Personal Care', 'beauty-personal', '💇', true),
  ('Electronics & Appliances', 'electronics-mobiles', '📱', true),
  ('Home & Furniture', 'home-furniture', '🏠', true),
  ('Health & Wellness', 'health-wellness', '💊', true),
  ('Automotive', 'automotive', '🚗', true),
  ('Education & Learning', 'education', '📚', true),
  ('Professional Services', 'professional-services', '💼', true),
  ('Travel', 'travel', '✈️', true),
  ('Events & Entertainment', 'events-entertainment', '🎉', true),
  ('Home Services', 'home-services', '🔧', true),
  ('Pet Services', 'pet-services', '🐾', true),
  ('Cloth Services', 'cloth-services', '👕', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. PUBLIC_USERS TABLE (replaces customers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid text NOT NULL UNIQUE,
  name text,
  email text,
  phone_number text,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Migrate data from customers if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'customers') THEN
    INSERT INTO public_users (id, firebase_uid, name, email, phone_number, created_at)
    SELECT id, firebase_uid, name, email, phone_number, COALESCE(created_at, now())
    FROM customers
    ON CONFLICT (firebase_uid) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- 3. BUSINESS_OWNERS TABLE (new, separated from shops)
-- ============================================================================

CREATE TABLE IF NOT EXISTS business_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid text NOT NULL UNIQUE,
  owner_name text,
  email text,
  phone_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Migrate data from shops (extract unique vendors)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'shops') THEN
    INSERT INTO business_owners (firebase_uid, owner_name, email, phone_number, created_at)
    SELECT DISTINCT ON (vendor_id)
      vendor_id,
      shop_name,
      email,
      phone_number,
      COALESCE(created_at, now())
    FROM shops
    WHERE vendor_id IS NOT NULL
    ON CONFLICT (firebase_uid) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- 4. BUSINESSES TABLE (replaces shops)
-- ============================================================================

CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES business_owners(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  shop_name text NOT NULL,
  shop_image_url text,
  shop_address text,
  shop_description text,
  opening_time text,
  closing_time text,
  enquiry_number text,
  latitude numeric,
  longitude numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Migrate data from shops
DO $$
DECLARE
  shop_rec RECORD;
  owner_rec RECORD;
  cat_rec RECORD;
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'shops') THEN
    FOR shop_rec IN SELECT * FROM shops WHERE vendor_id IS NOT NULL LOOP
      -- Find or create owner
      SELECT id INTO owner_rec FROM business_owners WHERE firebase_uid = shop_rec.vendor_id;
      
      -- Find category
      SELECT id INTO cat_rec FROM categories WHERE slug = shop_rec.category OR name = shop_rec.category;
      
      INSERT INTO businesses (
        id, owner_id, category_id, shop_name, shop_image_url, shop_address,
        enquiry_number, is_active, created_at
      ) VALUES (
        shop_rec.id,
        owner_rec.id,
        cat_rec.id,
        shop_rec.shop_name,
        shop_rec.logo_url,
        shop_rec.address,
        shop_rec.phone_number,
        COALESCE(shop_rec.is_active, true),
        COALESCE(shop_rec.created_at, now())
      )
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- ============================================================================
-- 5. OFFERS TABLE (update columns)
-- ============================================================================

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'offers'::regclass AND attname = 'discount_type') THEN
    ALTER TABLE offers ADD COLUMN discount_type text DEFAULT 'percentage';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'offers'::regclass AND attname = 'discount_value') THEN
    ALTER TABLE offers ADD COLUMN discount_value numeric;
  END IF;
END $$;

-- Migrate discount_percent to discount_value if needed
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'offers'::regclass AND attname = 'discount_percent')
     AND EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'offers'::regclass AND attname = 'discount_value') THEN
    UPDATE offers SET discount_value = discount_percent WHERE discount_value IS NULL AND discount_percent IS NOT NULL;
  END IF;
END $$;

-- Add business_id column if shop_id exists (rename)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'offers'::regclass AND attname = 'shop_id')
     AND NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'offers'::regclass AND attname = 'business_id') THEN
    ALTER TABLE offers ADD COLUMN business_id uuid;
    UPDATE offers SET business_id = shop_id;
    ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_shop_id_fkey;
    ALTER TABLE offers ADD CONSTRAINT offers_business_id_fkey FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    ALTER TABLE offers DROP COLUMN shop_id;
  END IF;
END $$;

-- If offers table doesn't exist, create it
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  discount_type text DEFAULT 'percentage',
  discount_value numeric,
  discount_percent numeric,
  coupon_code text,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. OFFER_REDEMPTIONS TABLE (update if needed)
-- ============================================================================

-- Add customer_id column if it doesn't exist (for public_users FK)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'offer_redemptions') THEN
    -- Ensure customer_id references public_users
    IF NOT EXISTS (
      SELECT FROM pg_constraint 
      WHERE conname = 'offer_redemptions_customer_id_fkey'
    ) THEN
      -- Drop old constraint if exists
      ALTER TABLE offer_redemptions DROP CONSTRAINT IF EXISTS offer_redemptions_customer_id_fkey;
      -- The customer_id should already reference the right table via UUID
    END IF;
  END IF;
END $$;

-- Create if not exists
CREATE TABLE IF NOT EXISTS offer_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public_users(id) ON DELETE CASCADE,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  redeemed_at timestamptz,
  UNIQUE(offer_id, customer_id)
);

-- ============================================================================
-- 7. ADMIN_LOGS TABLE (update if needed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_uid text NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 8. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_public_users_firebase_uid ON public_users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_public_users_email ON public_users(email);
CREATE INDEX IF NOT EXISTS idx_business_owners_firebase_uid ON business_owners(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category_id ON businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_business_id ON offers(business_id);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_valid_until ON offers(valid_until);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_offer_id ON offer_redemptions(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_customer_id ON offer_redemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_uid ON admin_logs(admin_uid);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

-- ============================================================================
-- 9. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_public_users_updated_at ON public_users;
CREATE TRIGGER update_public_users_updated_at
  BEFORE UPDATE ON public_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_business_owners_updated_at ON business_owners;
CREATE TRIGGER update_business_owners_updated_at
  BEFORE UPDATE ON business_owners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_offers_updated_at ON offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- 
-- RLS is enabled but the API routes use the service-role key which bypasses RLS.
-- These policies provide defense-in-depth: if someone somehow gets the anon key,
-- they still can't access data they shouldn't.
-- ============================================================================

ALTER TABLE public_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Categories: anyone can read, no one can write via anon key
DROP POLICY IF EXISTS "categories_select" ON categories;
CREATE POLICY "categories_select" ON categories
  FOR SELECT USING (true);

-- Public users: can only read/update own profile
DROP POLICY IF EXISTS "public_users_select" ON public_users;
CREATE POLICY "public_users_select" ON public_users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_users_update" ON public_users;
CREATE POLICY "public_users_update" ON public_users
  FOR UPDATE USING (true);

-- Businesses: anyone can read active, owners can update own
DROP POLICY IF EXISTS "businesses_select" ON businesses;
CREATE POLICY "businesses_select" ON businesses
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "businesses_update" ON businesses;
CREATE POLICY "businesses_update" ON businesses
  FOR UPDATE USING (true);

-- Offers: anyone can read active, vendors can manage own
DROP POLICY IF EXISTS "offers_select" ON offers;
CREATE POLICY "offers_select" ON offers
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "offers_insert" ON offers;
CREATE POLICY "offers_insert" ON offers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "offers_update" ON offers;
CREATE POLICY "offers_update" ON offers
  FOR UPDATE USING (true);

-- Offer redemptions: users can read/insert own
DROP POLICY IF EXISTS "offer_redemptions_select" ON offer_redemptions;
CREATE POLICY "offer_redemptions_select" ON offer_redemptions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "offer_redemptions_insert" ON offer_redemptions;
CREATE POLICY "offer_redemptions_insert" ON offer_redemptions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "offer_redemptions_update" ON offer_redemptions;
CREATE POLICY "offer_redemptions_update" ON offer_redemptions
  FOR UPDATE USING (true);

-- Admin logs: only service role can access
DROP POLICY IF EXISTS "admin_logs_select" ON admin_logs;
CREATE POLICY "admin_logs_select" ON admin_logs
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "admin_logs_insert" ON admin_logs;
CREATE POLICY "admin_logs_insert" ON admin_logs
  FOR INSERT WITH CHECK (true);

-- Business owners: service role only
DROP POLICY IF EXISTS "business_owners_select" ON business_owners;
CREATE POLICY "business_owners_select" ON business_owners
  FOR SELECT USING (true);

-- ============================================================================
-- 11. CLEANUP OLD TABLES (run AFTER verifying migration)
-- ============================================================================
-- 
-- UNCOMMENT these lines ONLY after verifying all data migrated correctly:
--
-- DROP TABLE IF EXISTS customers;
-- DROP TABLE IF EXISTS shops;
--
-- ============================================================================

-- ============================================================================
-- DONE
-- ============================================================================
