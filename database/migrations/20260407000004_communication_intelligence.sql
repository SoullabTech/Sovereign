-- Communication Intelligence + Scheduling Privacy (Phase 2)
--
-- Adds message intent/sensitivity classification to comms_messages
-- and scheduling disclosure controls to rl_sessions.
--
-- Message intelligence classifies relational purpose and privacy weight.
-- Scheduling disclosure controls what external calendars and viewers see.
--
-- All columns have safe defaults and are additive — no data migration needed.

-- ── Message Intelligence ───────────────────────────────────────────────

ALTER TABLE comms_messages
  ADD COLUMN IF NOT EXISTS intent TEXT DEFAULT 'logistics'
    CHECK (intent IN ('care', 'instruction', 'reflection', 'logistics', 'safety_followup')),
  ADD COLUMN IF NOT EXISTS sensitivity TEXT DEFAULT 'normal'
    CHECK (sensitivity IN ('normal', 'sensitive', 'highly_sensitive'));

COMMENT ON COLUMN comms_messages.intent IS
  'Relational purpose: care (emotional support), instruction (directive), '
  'reflection (mirroring), logistics (scheduling/admin), safety_followup (crisis response).';

COMMENT ON COLUMN comms_messages.sensitivity IS
  'Privacy weight: normal (standard delivery), sensitive (restricted visibility), '
  'highly_sensitive (maximum restriction, minimal metadata).';

-- ── Scheduling Disclosure ──────────────────────────────────────────────

ALTER TABLE rl_sessions
  ADD COLUMN IF NOT EXISTS exposure_level TEXT DEFAULT 'session_type'
    CHECK (exposure_level IN ('free_busy_only', 'session_type', 'full_details')),
  ADD COLUMN IF NOT EXISTS display_title_mode TEXT DEFAULT 'generic'
    CHECK (display_title_mode IN ('hidden', 'generic', 'full'));

COMMENT ON COLUMN rl_sessions.exposure_level IS
  'Controls what external calendars and viewers see: '
  'free_busy_only (just "Busy"), session_type (service type only), '
  'full_details (client name, notes, location).';

COMMENT ON COLUMN rl_sessions.display_title_mode IS
  'Controls event title visibility: hidden (no title), '
  'generic ("Session"), full (actual service + client name).';

-- Partial index for non-default exposure lookups
CREATE INDEX IF NOT EXISTS idx_rl_sessions_exposure
  ON rl_sessions(exposure_level) WHERE exposure_level != 'session_type';
