-- ============================================================================
-- OfferMe — Enquiry (Contact Us) messages table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
--
-- This migration:
--   1. Creates enquiry table for Contact Us form submissions
--   2. Adds index on created_at
--   3. Enables RLS with no public policies (service-role API access only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS enquiry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone_number text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enquiry_created_at
  ON enquiry (created_at DESC);

ALTER TABLE enquiry ENABLE ROW LEVEL SECURITY;

-- Browser clients do not access this table directly. All reads/writes go
-- through API routes using the service role key.
