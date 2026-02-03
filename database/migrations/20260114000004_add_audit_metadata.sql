-- Add metadata JSONB column to audit_logs for structured audit data
-- This is the proper home for non-UUID identifiers, hashes, and context
-- Only runs if audit_logs table exists (graceful skip otherwise)

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
    CREATE INDEX IF NOT EXISTS idx_audit_metadata ON audit_logs USING gin (metadata);
    COMMENT ON COLUMN audit_logs.metadata IS 'Structured audit context: passcode_hash, failure_reason, provider, route, etc.';
  ELSE
    RAISE NOTICE 'audit_logs table does not exist, skipping metadata column addition';
  END IF;
END $$;
