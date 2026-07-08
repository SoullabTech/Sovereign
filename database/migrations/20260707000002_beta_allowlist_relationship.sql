-- beta_allowlist: add first-class `relationship` column (Kelly, 2026-07-07)
-- Follow-up to 20260707000001. Additive, nullable; no reader depends on it
-- (admin metadata only), so this is migrate-only — no code rebuild required.
--
-- Clean column meanings:
--   email        = who is admitted
--   relationship = why/how they are connected (the relational basis for admission)
--   note         = human context
--   added_by     = who admitted them

ALTER TABLE beta_allowlist ADD COLUMN IF NOT EXISTS relationship TEXT;

-- Backfill known rows. The throwaway test row had its relational basis put in
-- added_by before this column existed — move it to `relationship` and set
-- added_by to who actually admitted it.
UPDATE beta_allowlist
   SET relationship = 'internal_test', added_by = 'founder'
 WHERE LOWER(email) = 'your+throwaway@soullab.life';

UPDATE beta_allowlist
   SET relationship = 'practitioner_pilot'
 WHERE LOWER(email) = 'larry@dynamichappy.com' AND relationship IS NULL;
