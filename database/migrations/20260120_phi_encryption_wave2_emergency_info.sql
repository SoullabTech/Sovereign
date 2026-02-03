/**
 * PHI ENCRYPTION - WAVE 2 (client_emergency_info)
 *
 * Free-Text PHI Doctrine - Wave 2
 *
 * Adds shadow columns for encrypted PHI fields:
 * - safety_plan_enc, safety_plan_enc_meta
 * - medications_enc, medications_enc_meta
 * - medical_conditions_enc, medical_conditions_enc_meta
 * - risk_notes_enc, risk_notes_enc_meta
 *
 * @see docs/security/free-text-phi-doctrine.md
 */

-- ============================================================================
-- WAVE 2: client_emergency_info
-- ============================================================================

-- Add encrypted columns for safety_plan
ALTER TABLE client_emergency_info
  ADD COLUMN IF NOT EXISTS safety_plan_enc TEXT,
  ADD COLUMN IF NOT EXISTS safety_plan_enc_meta JSONB;

-- Add encrypted columns for medications
ALTER TABLE client_emergency_info
  ADD COLUMN IF NOT EXISTS medications_enc TEXT,
  ADD COLUMN IF NOT EXISTS medications_enc_meta JSONB;

-- Add encrypted columns for medical_conditions
ALTER TABLE client_emergency_info
  ADD COLUMN IF NOT EXISTS medical_conditions_enc TEXT,
  ADD COLUMN IF NOT EXISTS medical_conditions_enc_meta JSONB;

-- Add encrypted columns for risk_notes
ALTER TABLE client_emergency_info
  ADD COLUMN IF NOT EXISTS risk_notes_enc TEXT,
  ADD COLUMN IF NOT EXISTS risk_notes_enc_meta JSONB;

-- Index on encryption metadata for upgrade queries
CREATE INDEX IF NOT EXISTS idx_emergency_info_enc_meta
  ON client_emergency_info ((safety_plan_enc_meta->>'kid'))
  WHERE safety_plan_enc IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN client_emergency_info.safety_plan_enc IS
  'AES-256-GCM encrypted safety plan (base64 ciphertext)';
COMMENT ON COLUMN client_emergency_info.safety_plan_enc_meta IS
  'Encryption metadata: {iv, tag, kid, v, encrypted_at}';

COMMENT ON COLUMN client_emergency_info.medications_enc IS
  'AES-256-GCM encrypted medications (base64 ciphertext)';
COMMENT ON COLUMN client_emergency_info.medications_enc_meta IS
  'Encryption metadata: {iv, tag, kid, v, encrypted_at}';

COMMENT ON COLUMN client_emergency_info.medical_conditions_enc IS
  'AES-256-GCM encrypted medical conditions (base64 ciphertext)';
COMMENT ON COLUMN client_emergency_info.medical_conditions_enc_meta IS
  'Encryption metadata: {iv, tag, kid, v, encrypted_at}';

COMMENT ON COLUMN client_emergency_info.risk_notes_enc IS
  'AES-256-GCM encrypted risk notes (base64 ciphertext)';
COMMENT ON COLUMN client_emergency_info.risk_notes_enc_meta IS
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
      ('client_emergency_info', 'safety_plan', 'pending'),
      ('client_emergency_info', 'medications', 'pending'),
      ('client_emergency_info', 'medical_conditions', 'pending'),
      ('client_emergency_info', 'risk_notes', 'pending')
    ON CONFLICT (table_name, column_name) DO NOTHING;
  END IF;
END $$;
