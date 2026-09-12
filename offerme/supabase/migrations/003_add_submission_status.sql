-- 003_add_submission_status.sql
-- Adds status, rejection_reason, and business_email to sell_your_bussiness
-- for the admin approval workflow

ALTER TABLE sell_your_bussiness ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE sell_your_bussiness ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE sell_your_bussiness ADD COLUMN IF NOT EXISTS business_email text;

-- Set existing rows to 'pending' if status is null
UPDATE sell_your_bussiness SET status = 'pending' WHERE status IS NULL;
