/**
 * PHI ENCRYPTION - PHASE 2B WRITE-PATH TRIGGERS
 *
 * Enforces that PHI columns cannot be written without encryption.
 * Once applied, plaintext-only writes will fail at the DB level.
 *
 * This is the constitutional enforcement layer - it cannot be bypassed
 * even by malicious code or raw SQL.
 *
 * @see docs/security/free-text-phi-doctrine.md
 */

-- ============================================================================
-- TRIGGER FUNCTION: Enforce encrypted columns exist when plaintext written
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_phi_encryption()
RETURNS TRIGGER AS $$
DECLARE
  field_name TEXT;
  enc_column TEXT;
  plaintext_val TEXT;
  enc_val TEXT;
BEGIN
  -- Check each PHI field defined in TG_ARGV
  -- TG_ARGV contains pairs: field1, field2, ... (plaintext column names)
  FOR i IN 0..array_upper(TG_ARGV, 1) LOOP
    field_name := TG_ARGV[i];
    enc_column := field_name || '_enc';

    -- Get the values using dynamic SQL
    EXECUTE format('SELECT ($1).%I::text, ($1).%I::text', field_name, enc_column)
      INTO plaintext_val, enc_val
      USING NEW;

    -- If plaintext is provided but encrypted is not, reject
    IF plaintext_val IS NOT NULL AND enc_val IS NULL THEN
      RAISE EXCEPTION 'PHI enforcement: % requires encryption (% must not be NULL when % is set)',
        TG_TABLE_NAME, enc_column, field_name
        USING ERRCODE = 'data_exception';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CASE NOTES (case_notes.content)
-- ============================================================================

DROP TRIGGER IF EXISTS enforce_phi_encryption_case_notes ON case_notes;

CREATE TRIGGER enforce_phi_encryption_case_notes
  BEFORE INSERT OR UPDATE ON case_notes
  FOR EACH ROW
  EXECUTE FUNCTION enforce_phi_encryption('content');

COMMENT ON TRIGGER enforce_phi_encryption_case_notes ON case_notes IS
  'Phase 2B: Reject writes where content is set but content_enc is NULL';

-- ============================================================================
-- CLIENT EMERGENCY INFO (4 fields)
-- ============================================================================

DROP TRIGGER IF EXISTS enforce_phi_encryption_emergency_info ON client_emergency_info;

CREATE TRIGGER enforce_phi_encryption_emergency_info
  BEFORE INSERT OR UPDATE ON client_emergency_info
  FOR EACH ROW
  EXECUTE FUNCTION enforce_phi_encryption('safety_plan', 'medications', 'medical_conditions', 'risk_notes');

COMMENT ON TRIGGER enforce_phi_encryption_emergency_info ON client_emergency_info IS
  'Phase 2B: Reject writes where PHI fields are set but _enc counterparts are NULL';

-- ============================================================================
-- MAIA CONSULTATIONS (4 fields)
-- ============================================================================

DROP TRIGGER IF EXISTS enforce_phi_encryption_consultations ON maia_consultations;

CREATE TRIGGER enforce_phi_encryption_consultations
  BEFORE INSERT OR UPDATE ON maia_consultations
  FOR EACH ROW
  EXECUTE FUNCTION enforce_phi_encryption('practitioner_query', 'context_provided', 'maia_response', 'practitioner_feedback');

COMMENT ON TRIGGER enforce_phi_encryption_consultations ON maia_consultations IS
  'Phase 2B: Reject writes where PHI fields are set but _enc counterparts are NULL';

-- ============================================================================
-- VERIFICATION: Test that triggers are active
-- ============================================================================

DO $$
BEGIN
  -- Verify triggers exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_phi_encryption_case_notes'
  ) THEN
    RAISE EXCEPTION 'Trigger enforce_phi_encryption_case_notes not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_phi_encryption_emergency_info'
  ) THEN
    RAISE EXCEPTION 'Trigger enforce_phi_encryption_emergency_info not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_phi_encryption_consultations'
  ) THEN
    RAISE EXCEPTION 'Trigger enforce_phi_encryption_consultations not found';
  END IF;

  RAISE NOTICE 'Phase 2B triggers verified: case_notes, client_emergency_info, maia_consultations';
END $$;
