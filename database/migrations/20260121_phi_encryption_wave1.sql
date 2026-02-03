/**
 * PHI ENCRYPTION - WAVE 1 (client_messages)
 *
 * HIPAA Sprint 7 Phase 2A
 *
 * Adds shadow columns for encrypted PHI:
 * - <col>_enc: Encrypted ciphertext (TEXT)
 * - <col>_enc_meta: Encryption metadata (JSONB)
 *
 * Shadow column pattern allows:
 * - Gradual migration (dual-write, then prefer encrypted)
 * - Easy rollback if issues
 * - Side-by-side verification
 *
 * After backfill complete, Phase 2 will:
 * - NULL plaintext columns
 * - Add CHECK constraint requiring encrypted columns
 */

-- ============================================================================
-- WAVE 1: client_messages
-- ============================================================================

-- Add encrypted columns for body
ALTER TABLE client_messages
  ADD COLUMN IF NOT EXISTS body_enc TEXT,
  ADD COLUMN IF NOT EXISTS body_enc_meta JSONB;

-- Index on encryption metadata for upgrade queries
CREATE INDEX IF NOT EXISTS idx_client_messages_enc_meta
  ON client_messages ((body_enc_meta->>'kid'))
  WHERE body_enc IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN client_messages.body_enc IS
  'AES-256-GCM encrypted message body (base64 ciphertext)';
COMMENT ON COLUMN client_messages.body_enc_meta IS
  'Encryption metadata: {iv, tag, kid, v, encrypted_at}';

-- ============================================================================
-- WAVE 1: practitioner_messages (if table exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'practitioner_messages') THEN
    -- Add encrypted columns for subject
    ALTER TABLE practitioner_messages
      ADD COLUMN IF NOT EXISTS subject_enc TEXT,
      ADD COLUMN IF NOT EXISTS subject_enc_meta JSONB;

    -- Add encrypted columns for body
    ALTER TABLE practitioner_messages
      ADD COLUMN IF NOT EXISTS body_enc TEXT,
      ADD COLUMN IF NOT EXISTS body_enc_meta JSONB;

    COMMENT ON COLUMN practitioner_messages.subject_enc IS
      'AES-256-GCM encrypted message subject (base64 ciphertext)';
    COMMENT ON COLUMN practitioner_messages.body_enc IS
      'AES-256-GCM encrypted message body (base64 ciphertext)';
  END IF;
END $$;

-- ============================================================================
-- PHI ENCRYPTION STATUS TRACKING
-- ============================================================================

-- Create a tracking table for encryption progress
CREATE TABLE IF NOT EXISTS phi_encryption_status (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  total_rows BIGINT DEFAULT 0,
  encrypted_rows BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'enforced')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_processed_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_name, column_name)
);

-- Initialize status for Wave 1 columns
INSERT INTO phi_encryption_status (table_name, column_name, status)
VALUES
  ('client_messages', 'body', 'pending')
ON CONFLICT (table_name, column_name) DO NOTHING;

-- Add practitioner_messages if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'practitioner_messages') THEN
    INSERT INTO phi_encryption_status (table_name, column_name, status)
    VALUES
      ('practitioner_messages', 'subject', 'pending'),
      ('practitioner_messages', 'body', 'pending')
    ON CONFLICT (table_name, column_name) DO NOTHING;
  END IF;
END $$;

COMMENT ON TABLE phi_encryption_status IS
  'Tracks PHI encryption progress per table/column. Used by backfill scripts.';

-- ============================================================================
-- ENFORCEMENT (Phase 2 - run after backfill complete)
-- ============================================================================

-- NOTE: Do NOT run these until backfill is 100% complete
-- These are provided as reference for Phase 2

-- Phase 2 Step 1: NULL plaintext (after verifying encrypted reads work)
-- UPDATE client_messages SET body = NULL WHERE body_enc IS NOT NULL;

-- Phase 2 Step 2: Add CHECK constraint
-- ALTER TABLE client_messages
--   ADD CONSTRAINT require_encrypted_body
--   CHECK (body_enc IS NOT NULL AND body_enc_meta IS NOT NULL);

-- Phase 2 Step 3: Drop plaintext column (final cleanup)
-- ALTER TABLE client_messages DROP COLUMN body;
