-- Transcript PHI Encryption - Phase 3B Enforcement
-- Adds trigger-based enforcement for encrypted-only writes
--
-- PREREQUISITES:
-- 1. Phase 3A migration applied (text_enc columns exist)
-- 2. PHI_ENCRYPTION_KEY configured
-- 3. Backfill complete (all existing rows have text_enc)
--
-- HIPAA Sprint 7 Phase 3B
-- See: docs/security/phi-free-text.md

-- ============================================================================
-- ENFORCEMENT TRIGGER FUNCTION
-- ============================================================================

-- Trigger function to enforce text_enc on INSERT
-- Allows existing NULL rows (for backward compat) but requires new rows to have text_enc
CREATE OR REPLACE FUNCTION enforce_transcript_encryption()
RETURNS TRIGGER AS $$
BEGIN
  -- Only enforce on INSERT (not UPDATE of legacy rows)
  IF TG_OP = 'INSERT' THEN
    -- Require text_enc when writing new transcripts
    IF NEW.text_enc IS NULL THEN
      RAISE EXCEPTION 'PHI enforcement: text_enc required for new transcript segments. Set PHI_ENCRYPTION_KEY and ensure encryption is enabled.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SUPERVISION TRANSCRIPT SEGMENTS
-- ============================================================================

-- Drop existing trigger if any (idempotent)
DROP TRIGGER IF EXISTS enforce_supervision_transcript_enc ON supervision_transcript_segments;

-- Create enforcement trigger
CREATE TRIGGER enforce_supervision_transcript_enc
  BEFORE INSERT ON supervision_transcript_segments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_transcript_encryption();

COMMENT ON TRIGGER enforce_supervision_transcript_enc ON supervision_transcript_segments
  IS 'Phase 3B: Enforces text_enc on new inserts (HIPAA compliance)';

-- ============================================================================
-- PRACTICE TRANSCRIPT SEGMENTS
-- ============================================================================

-- Drop existing trigger if any (idempotent)
DROP TRIGGER IF EXISTS enforce_practice_transcript_enc ON practice_transcript_segments;

-- Create enforcement trigger
CREATE TRIGGER enforce_practice_transcript_enc
  BEFORE INSERT ON practice_transcript_segments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_transcript_encryption();

COMMENT ON TRIGGER enforce_practice_transcript_enc ON practice_transcript_segments
  IS 'Phase 3B: Enforces text_enc on new inserts (HIPAA compliance)';

-- ============================================================================
-- UPDATE STATUS TRACKING
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'phi_encryption_status') THEN
    UPDATE phi_encryption_status
    SET status = 'enforced', stage = 'B', updated_at = NOW()
    WHERE table_name IN ('supervision_transcript_segments', 'practice_transcript_segments')
      AND column_name = 'text';
  END IF;
END $$;

-- ============================================================================
-- OPTIONAL: Make plaintext text column nullable (after backfill)
-- ============================================================================

-- Uncomment these lines ONLY after confirming:
-- 1. All existing rows have text_enc populated
-- 2. All code paths use Stage B (encrypted-only writes)

-- ALTER TABLE supervision_transcript_segments ALTER COLUMN text DROP NOT NULL;
-- ALTER TABLE practice_transcript_segments ALTER COLUMN text DROP NOT NULL;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================

-- To disable enforcement without data loss:
-- DROP TRIGGER enforce_supervision_transcript_enc ON supervision_transcript_segments;
-- DROP TRIGGER enforce_practice_transcript_enc ON practice_transcript_segments;
-- UPDATE phi_encryption_status SET status = 'migrating', stage = 'A' WHERE table_name IN (...);
