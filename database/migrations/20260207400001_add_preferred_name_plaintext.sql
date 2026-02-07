-- ============================================
-- ADD preferred_name PLAINTEXT COLUMN TO practitioner_clients
-- ============================================
-- The client identity encryption migration (20260120000002) added
-- preferred_name_enc and preferred_name_enc_meta, but never created
-- the plaintext preferred_name column that exists in the dual-write
-- SQL fragments (CLIENT_NAME_JOIN_COLUMNS / CLIENT_NAME_DIRECT_COLUMNS).
--
-- This aligns practitioner_clients with the same dual-write pattern
-- used for the `name` column: plaintext + encrypted coexist until
-- a future migration drops the plaintext columns.

ALTER TABLE practitioner_clients
  ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(255);

COMMENT ON COLUMN practitioner_clients.preferred_name IS 'Plaintext preferred name — dual-write with preferred_name_enc until encryption migration completes';
