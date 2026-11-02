-- Writer Source unclaimed-arrival retention support.
-- Additive only. The partial index keeps the bounded expiry scan from walking
-- claimed manuscript custody rows.
CREATE INDEX IF NOT EXISTS idx_manuscript_source_arrivals_unclaimed_created
  ON manuscript_source_arrivals(created_at ASC, id ASC)
  WHERE manuscript_id IS NULL;

COMMENT ON INDEX idx_manuscript_source_arrivals_unclaimed_created IS
  'Supports bounded 24-hour unclaimed Source-arrival retention sweeps; claimed manuscript custody is excluded.';
