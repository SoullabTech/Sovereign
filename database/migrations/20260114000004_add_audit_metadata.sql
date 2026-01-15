-- Add metadata JSONB column to audit_logs for structured audit data
-- This is the proper home for non-UUID identifiers, hashes, and context

ALTER TABLE public.audit_logs
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_audit_metadata ON audit_logs USING gin (metadata);

COMMENT ON COLUMN audit_logs.metadata IS 'Structured audit context: passcode_hash, failure_reason, provider, route, etc.';
