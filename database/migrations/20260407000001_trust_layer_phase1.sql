-- =============================================================================
-- TRUST LAYER PHASE 1
-- Meeting provider abstraction, privacy envelopes, memory contracts,
-- secure artifact sharing
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1A. Meeting Provider on rl_sessions
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE meeting_provider AS ENUM (
    'none',
    'livekit',
    'jitsi',
    'zoom',
    'google_meet',
    'proton_meet',
    'microsoft_teams',
    'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE rl_sessions
  ADD COLUMN IF NOT EXISTS meeting_provider meeting_provider NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS meeting_url TEXT,
  ADD COLUMN IF NOT EXISTS meeting_id TEXT,
  ADD COLUMN IF NOT EXISTS meeting_meta JSONB;

COMMENT ON COLUMN rl_sessions.meeting_provider IS 'External meeting platform. Relevant when location = video.';
COMMENT ON COLUMN rl_sessions.meeting_url IS 'Join URL for the meeting. Null for in_person/phone.';
COMMENT ON COLUMN rl_sessions.meeting_meta IS 'Provider-specific config: {passcode?, waitingRoom?, e2ee?, recordingConsent?}';

-- ---------------------------------------------------------------------------
-- 1B. Privacy Envelope on rl_sessions
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE privacy_mode AS ENUM (
    'private',
    'standard',
    'sensitive',
    'confidential'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE consent_level AS ENUM (
    'none',
    'verbal',
    'written',
    'digital'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE visibility_scope AS ENUM (
    'member_only',
    'member_and_practitioner',
    'care_team'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE rl_sessions
  ADD COLUMN IF NOT EXISTS privacy_mode privacy_mode NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS consent_level consent_level NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS visibility_scope visibility_scope NOT NULL DEFAULT 'member_only',
  ADD COLUMN IF NOT EXISTS allow_ai_distillation BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allow_export BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN rl_sessions.privacy_mode IS 'Session privacy level. private = most restrictive default.';
COMMENT ON COLUMN rl_sessions.allow_ai_distillation IS 'FALSE = no MAIA summaries, no pattern extraction.';
COMMENT ON COLUMN rl_sessions.allow_export IS 'FALSE = no export of session content permitted.';

-- ---------------------------------------------------------------------------
-- 1C. Memory Contracts
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE memory_disposition AS ENUM (
    'keep_private',
    'share_with_practitioner',
    'allow_maia_summary',
    'allow_anonymized_patterns'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE memory_contract_status AS ENUM (
    'active',
    'revoked',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS memory_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_id UUID REFERENCES rl_sessions(id) ON DELETE SET NULL,
  container_id UUID REFERENCES rl_containers(id) ON DELETE SET NULL,

  disposition memory_disposition NOT NULL DEFAULT 'keep_private',
  status memory_contract_status NOT NULL DEFAULT 'active',
  applies_to TEXT NOT NULL DEFAULT 'session'
    CHECK (applies_to IN ('session', 'transcript', 'artifact', 'journal_entry')),

  consent_method consent_level NOT NULL DEFAULT 'digital',
  consent_given_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_contracts_member
  ON memory_contracts(member_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_memory_contracts_session
  ON memory_contracts(session_id) WHERE session_id IS NOT NULL AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_memory_contracts_container
  ON memory_contracts(container_id) WHERE container_id IS NOT NULL AND status = 'active';

COMMENT ON TABLE memory_contracts IS 'Member-controlled data disposition contracts. Members choose what happens with their session data.';

-- ---------------------------------------------------------------------------
-- 1D. Artifact Shares
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS artifact_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES session_artifacts(id) ON DELETE CASCADE,

  share_scope TEXT NOT NULL DEFAULT 'link'
    CHECK (share_scope IN ('link', 'named_recipient', 'member_and_practitioner')),

  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  password_hash TEXT,
  expires_at TIMESTAMPTZ,

  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  created_by UUID NOT NULL,
  revoked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artifact_shares_artifact
  ON artifact_shares(artifact_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_artifact_shares_token
  ON artifact_shares(share_token) WHERE revoked_at IS NULL;

COMMENT ON TABLE artifact_shares IS 'Controlled sharing of session artifacts via revocable tokens.';
COMMENT ON COLUMN artifact_shares.share_token IS 'Unique token for link-based access. 32 random bytes, hex-encoded.';
COMMENT ON COLUMN artifact_shares.password_hash IS 'Optional bcrypt password protection. NULL = no password required.';

-- Add share tracking to session_artifacts
ALTER TABLE session_artifacts
  ADD COLUMN IF NOT EXISTS share_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_shared_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trust_layer_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS memory_contracts_updated_at ON memory_contracts;
CREATE TRIGGER memory_contracts_updated_at
  BEFORE UPDATE ON memory_contracts
  FOR EACH ROW EXECUTE FUNCTION trust_layer_set_updated_at();

DROP TRIGGER IF EXISTS artifact_shares_updated_at ON artifact_shares;
CREATE TRIGGER artifact_shares_updated_at
  BEFORE UPDATE ON artifact_shares
  FOR EACH ROW EXECUTE FUNCTION trust_layer_set_updated_at();
