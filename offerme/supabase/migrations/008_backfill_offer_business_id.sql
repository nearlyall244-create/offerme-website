-- 008_backfill_offer_business_id.sql
-- Repair orphaned offers (business_id IS NULL) so they join to their shop
-- in /api/shops and get activated on admin approval.
--
-- Only backfills when unambiguous: the offer creator owns exactly ONE shop.

UPDATE offers_post o
SET business_id = s.id
FROM business_owners bo
JOIN sell_your_bussiness s ON s.owner_id = bo.id
WHERE o.business_id IS NULL
  AND o.created_by_uid = bo.firebase_uid
  AND NOT EXISTS (
    SELECT 1
    FROM sell_your_bussiness s2
    WHERE s2.owner_id = bo.id
      AND s2.id <> s.id
  );
