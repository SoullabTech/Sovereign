/**
 * PHI ENCRYPTION - WAVE 2 (maia_consultations)
 *
 * Free-Text PHI Doctrine - Wave 2
 *
 * Adds shadow columns for encrypted PHI fields:
 * - practitioner_query_enc, practitioner_query_enc_meta
 * - context_provided_enc, context_provided_enc_meta
 * - maia_response_enc, maia_response_enc_meta
 * - practitioner_feedback_enc, practitioner_feedback_enc_meta
 *
 * @see docs/security/free-text-phi-doctrine.md
 */

-- ============================================================================
-- WAVE 2: maia_consultations
-- ============================================================================

-- Add encrypted columns for practitioner_query
ALTER TABLE maia_consultations
  ADD COLUMN IF NOT EXISTS practitioner_query_enc TEXT,
  ADD COLUMN IF NOT EXISTS practitioner_query_enc_meta JSONB;

-- Add encrypted columns for context_provided
ALTER TABLE maia_consultations
  ADD COLUMN IF NOT EXISTS context_provided_enc TEXT,
  ADD COLUMN IF NOT EXISTS context_provided_enc_meta JSONB;

-- Add encrypted columns for maia_response
ALTER TABLE maia_consultations
  ADD COLUMN IF NOT EXISTS maia_response_enc TEXT,
  ADD COLUMN IF NOT EXISTS maia_response_enc_meta JSONB;

-- Add encrypted columns for practitioner_feedback
ALTER TABLE maia_consultations
  ADD COLUMN IF NOT EXISTS practitioner_feedback_enc TEXT,
  ADD COLUMN IF NOT EXISTS practitioner_feedback_enc_meta JSONB;

-- Index on encryption metadata for upgrade queries
CREATE INDEX IF NOT EXISTS idx_maia_consultations_enc_meta
  ON maia_consultations ((practitioner_query_enc_meta->>'kid'))
  WHERE practitioner_query_enc IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN maia_consultations.practitioner_query_enc IS
  'AES-256-GCM encrypted practitioner query (base64 ciphertext)';
COMMENT ON COLUMN maia_consultations.practitioner_query_enc_meta IS
  'Encryption metadata: {iv, tag, kid, v, encrypted_at}';

COMMENT ON COLUMN maia_consultations.context_provided_enc IS
  'AES-256-GCM encrypted context JSON (base64 ciphertext)';
COMMENT ON COLUMN maia_consultations.context_provided_enc_meta IS
  'Encryption metadata: {iv, tag, kid, v, encrypted_at}';

COMMENT ON COLUMN maia_consultations.maia_response_enc IS
  'AES-256-GCM encrypted MAIA response (base64 ciphertext)';
COMMENT ON COLUMN maia_consultations.maia_response_enc_meta IS
  'Encryption metadata: {iv, tag, kid, v, encrypted_at}';

COMMENT ON COLUMN maia_consultations.practitioner_feedback_enc IS
  'AES-256-GCM encrypted practitioner feedback (base64 ciphertext)';
COMMENT ON COLUMN maia_consultations.practitioner_feedback_enc_meta IS
  'Encryption metadata: {iv, tag, kid, v, encrypted_at}';

-- ============================================================================
-- PHI ENCRYPTION STATUS TRACKING
-- ============================================================================

-- Initialize status for Wave 2 columns (if tracking table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'phi_encryption_status') THEN
    INSERT INTO phi_encryption_status (table_name, column_name, status)
    VALUES
      ('maia_consultations', 'practitioner_query', 'pending'),
      ('maia_consultations', 'context_provided', 'pending'),
      ('maia_consultations', 'maia_response', 'pending'),
      ('maia_consultations', 'practitioner_feedback', 'pending')
    ON CONFLICT (table_name, column_name) DO NOTHING;
  END IF;
END $$;
