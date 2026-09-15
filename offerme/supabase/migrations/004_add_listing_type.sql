-- 004_add_listing_type.sql
-- Adds listing_type to offers_post to distinguish between
-- business listing posts and offer/deal posts

ALTER TABLE offers_post ADD COLUMN IF NOT EXISTS listing_type text DEFAULT 'no offer';

-- Mark existing sell-business posts (those linked to a sell_your_bussiness entry)
UPDATE offers_post SET listing_type = 'sell-business'
WHERE business_id IS NOT NULL AND listing_type IS NULL;
