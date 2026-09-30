-- ============================================================================
-- OfferMe — Business Owner Account Deletion Request columns
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
--
-- Extends the EXISTING business_owners table (no new table).
-- Statuses: no_request | requested | rejected | approved
-- ============================================================================

ALTER TABLE business_owners
  ADD COLUMN IF NOT EXISTS deletion_request boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deletion_message text,
  ADD COLUMN IF NOT EXISTS deletion_status text NOT NULL DEFAULT 'no_request',
  ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_admin_response text;

-- Add CHECK constraint only if the project does not already have one.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_owners_deletion_status_check'
      AND conrelid = 'business_owners'::regclass
  ) THEN
    ALTER TABLE business_owners
      ADD CONSTRAINT business_owners_deletion_status_check
      CHECK (deletion_status IN ('no_request', 'requested', 'rejected', 'approved'));
  END IF;
END $$;
