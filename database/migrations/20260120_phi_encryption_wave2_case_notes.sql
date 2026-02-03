/**
 * PHI ENCRYPTION - WAVE 2 (case_notes)
 *
 * Free-Text PHI Doctrine - Wave 2
 *
 * Adds shadow columns for encrypted PHI:
 * - content_enc: Encrypted ciphertext (TEXT)
 * - content_enc_meta: Encryption metadata (JSONB)
 *
 * Shadow column pattern allows:
 * - Gradual migration (dual-write, then prefer encrypted)
 * - Easy rollback if issues
 * - Side-by-side verification
 *
 * @see docs/security/free-text-phi-doctrine.md
 */

-- ============================================================================
-- WAVE 2: case_notes
-- ============================================================================

-- Add encrypted columns for content (main note body)
ALTER TABLE case_notes
  ADD COLUMN IF NOT EXISTS content_enc TEXT,
  ADD COLUMN IF NOT EXISTS content_enc_meta JSONB;

-- Index on encryption metadata for upgrade queries
CREATE INDEX IF NOT EXISTS idx_case_notes_enc_meta
  ON case_notes ((content_enc_meta->>'kid'))
  WHERE content_enc IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN case_notes.content_enc IS
  'AES-256-GCM encrypted note content (base64 ciphertext)';
COMMENT ON COLUMN case_notes.content_enc_meta IS
  'Encryption metadata: {iv, tag, kid, v, encrypted_at}';

-- ============================================================================
-- PHI ENCRYPTION STATUS TRACKING
-- ============================================================================

-- Initialize status for Wave 2 columns (only if tracking table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'phi_encryption_status') THEN
    INSERT INTO phi_encryption_status (table_name, column_name, status)
    VALUES ('case_notes', 'content', 'pending')
    ON CONFLICT (table_name, column_name) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- ENFORCEMENT (Phase 2B - run after backfill complete)
-- ============================================================================

-- NOTE: Do NOT run these until backfill is 100% complete
-- These are provided as reference for Phase 2B

-- Phase 2B Step 1: NULL plaintext (after verifying encrypted reads work)
-- UPDATE case_notes SET content = NULL WHERE content_enc IS NOT NULL;

-- Phase 2B Step 2: Add CHECK constraint
-- ALTER TABLE case_notes
--   ADD CONSTRAINT require_encrypted_content
--   CHECK (content_enc IS NOT NULL AND content_enc_meta IS NOT NULL);

-- Phase 2B Step 3: Drop plaintext column (final cleanup)
-- ALTER TABLE case_notes DROP COLUMN content;
