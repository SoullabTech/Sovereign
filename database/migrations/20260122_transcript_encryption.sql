-- Transcript PHI Encryption - Phase 3A Wave 1
-- Adds encrypted columns for transcript segment text (highest PHI exposure surface)
--
-- HIPAA Sprint 7 Phase 3A: Free-Text PHI Encryption
-- See: docs/security/phi-free-text.md

-- ============================================================================
-- SUPERVISION TRANSCRIPT SEGMENTS
-- ============================================================================

-- Add encrypted columns for text
ALTER TABLE supervision_transcript_segments
  ADD COLUMN IF NOT EXISTS text_enc TEXT,
  ADD COLUMN IF NOT EXISTS text_enc_meta JSONB;

-- Index for backfill queries (find unencrypted rows)
CREATE INDEX IF NOT EXISTS idx_supervision_segments_unencrypted
  ON supervision_transcript_segments(session_id, created_at)
  WHERE text_enc IS NULL AND text IS NOT NULL;

COMMENT ON COLUMN supervision_transcript_segments.text_enc IS 'AES-256-GCM encrypted transcript text (base64 ciphertext)';
COMMENT ON COLUMN supervision_transcript_segments.text_enc_meta IS 'Encryption metadata: {iv, tag, kid, v, encrypted_at}';

-- ============================================================================
-- PRACTICE TRANSCRIPT SEGMENTS
-- ============================================================================

-- Add encrypted columns for text
ALTER TABLE practice_transcript_segments
  ADD COLUMN IF NOT EXISTS text_enc TEXT,
  ADD COLUMN IF NOT EXISTS text_enc_meta JSONB;

-- Index for backfill queries (find unencrypted rows)
CREATE INDEX IF NOT EXISTS idx_practice_segments_unencrypted
  ON practice_transcript_segments(session_id, created_at)
  WHERE text_enc IS NULL AND text IS NOT NULL;

COMMENT ON COLUMN practice_transcript_segments.text_enc IS 'AES-256-GCM encrypted transcript text (base64 ciphertext)';
COMMENT ON COLUMN practice_transcript_segments.text_enc_meta IS 'Encryption metadata: {iv, tag, kid, v, encrypted_at}';

-- ============================================================================
-- TRACKING TABLE (extend existing if present, or create)
-- ============================================================================

-- Add Phase 3A entries to tracking table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'phi_encryption_status') THEN
    -- Add stage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phi_encryption_status' AND column_name = 'stage') THEN
      ALTER TABLE phi_encryption_status ADD COLUMN stage TEXT;
    END IF;

    INSERT INTO phi_encryption_status (table_name, column_name, status, stage)
    VALUES
      ('supervision_transcript_segments', 'text', 'in_progress', 'A'),
      ('practice_transcript_segments', 'text', 'in_progress', 'A')
    ON CONFLICT (table_name, column_name) DO UPDATE SET
      status = 'in_progress',
      stage = 'A',
      updated_at = NOW();
  END IF;
END $$;
