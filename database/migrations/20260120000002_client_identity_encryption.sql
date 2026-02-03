-- ============================================
-- CLIENT IDENTITY ENCRYPTION
-- ============================================
-- Phase 1: Add encrypted columns to practitioner_clients
-- Enables dual-write migration path from plaintext to encrypted names
--
-- Migration strategy:
-- 1. Add shadow columns (this migration)
-- 2. Dual-write on all INSERT/UPDATE (app code)
-- 3. Backfill existing records (script)
-- 4. Verify all rows have encrypted values
-- 5. Remove plaintext column (future migration)

-- Add encrypted name column and metadata
ALTER TABLE practitioner_clients
  ADD COLUMN IF NOT EXISTS name_enc TEXT,
  ADD COLUMN IF NOT EXISTS name_enc_meta JSONB,
  ADD COLUMN IF NOT EXISTS name_safe_label TEXT,
  ADD COLUMN IF NOT EXISTS encryption_key_version INTEGER DEFAULT 1;

-- Add encrypted preferred_name columns (also PII)
ALTER TABLE practitioner_clients
  ADD COLUMN IF NOT EXISTS preferred_name_enc TEXT,
  ADD COLUMN IF NOT EXISTS preferred_name_enc_meta JSONB;

-- Index for searching by safe label during migration
CREATE INDEX IF NOT EXISTS idx_practitioner_clients_safe_label
  ON practitioner_clients(practitioner_id, name_safe_label)
  WHERE name_safe_label IS NOT NULL;

-- Index for finding records that need backfill
CREATE INDEX IF NOT EXISTS idx_practitioner_clients_needs_encryption
  ON practitioner_clients(practitioner_id)
  WHERE name_enc IS NULL AND name IS NOT NULL;

-- Index for key rotation queries
CREATE INDEX IF NOT EXISTS idx_practitioner_clients_key_version
  ON practitioner_clients(practitioner_id, encryption_key_version);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON COLUMN practitioner_clients.name_enc IS 'AES-256-GCM encrypted client name (base64 ciphertext)';
COMMENT ON COLUMN practitioner_clients.name_enc_meta IS 'Encryption metadata: {iv, tag, kid, v, encrypted_at}';
COMMENT ON COLUMN practitioner_clients.name_safe_label IS 'Practitioner-chosen display label (e.g., initials, pseudonym) - not derived from real name';
COMMENT ON COLUMN practitioner_clients.encryption_key_version IS 'Key version used for encryption, enables key rotation';
COMMENT ON COLUMN practitioner_clients.preferred_name_enc IS 'AES-256-GCM encrypted preferred name';
COMMENT ON COLUMN practitioner_clients.preferred_name_enc_meta IS 'Encryption metadata for preferred_name';

-- ============================================
-- HELPER FUNCTION: Check encryption status
-- ============================================
CREATE OR REPLACE FUNCTION check_client_encryption_status(p_practitioner_id UUID)
RETURNS TABLE (
  total_clients BIGINT,
  encrypted_clients BIGINT,
  plaintext_only BIGINT,
  encryption_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_clients,
    COUNT(*) FILTER (WHERE name_enc IS NOT NULL) as encrypted_clients,
    COUNT(*) FILTER (WHERE name_enc IS NULL AND name IS NOT NULL) as plaintext_only,
    ROUND(
      COUNT(*) FILTER (WHERE name_enc IS NOT NULL)::NUMERIC /
      NULLIF(COUNT(*), 0) * 100, 2
    ) as encryption_percentage
  FROM practitioner_clients
  WHERE practitioner_id = p_practitioner_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_client_encryption_status IS 'Returns encryption migration progress for a practitioner';
