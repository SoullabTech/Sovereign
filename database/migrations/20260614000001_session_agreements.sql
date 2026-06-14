-- Session Agreements + Consent Ledger
-- Spec:  docs/specs/SESSION_ROOM_VIDEO_SPEC_2026-06-14.md (§5; §9 ratified)
-- Scope: docs/specs/SESSION_ROOM_VIDEO_PHASE1_SCOPE_2026-06-14.md
--
-- Anchors the Session Room consent flow to durable facts + an append-only ledger.
-- Session Room's session record is scribe_sessions (UUID PK, member_id, client link);
-- the agreement attaches there (reuse-first). The ledger is the spine.
--
-- CORE RULE (enforced at the API, NOT just the UI):
--   video_link must NOT be returned by the join/session API until a client `accept`
--   event exists in session_consent_events for the session's current agreement_version
--   (and no later client refuse/revoke). video_link_reveal_allowed is a denormalized,
--   fail-closed mirror of that check (defaults false) — the API MUST verify the ledger,
--   not trust the flag alone. UI hiding is not sufficient.
--
-- Field-name source: Kelly 2026-06-14. consent_flags / video_provider / room_state added
-- per scope (required to drive the two-statement gate and the room state machine).

-- 1. Session-agreement fields on the existing Session Room record.
ALTER TABLE scribe_sessions
  ADD COLUMN IF NOT EXISTS agreement_mode TEXT
    CHECK (agreement_mode IN ('sanctuary','notes','reflection','learning','custom')),
  ADD COLUMN IF NOT EXISTS agreement_version TEXT,
  ADD COLUMN IF NOT EXISTS agreement_text_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS external_provider_notice_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS consent_flags JSONB,
  ADD COLUMN IF NOT EXISTS consent_practitioner_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_client_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS video_provider TEXT
    CHECK (video_provider IN ('soullab','zoom','meet','doxy','simplepractice','custom')),
  ADD COLUMN IF NOT EXISTS video_link TEXT,
  ADD COLUMN IF NOT EXISTS video_link_reveal_allowed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS room_state TEXT NOT NULL DEFAULT 'pre'
    CHECK (room_state IN ('pre','active','closing','continuity'));

COMMENT ON COLUMN scribe_sessions.agreement_mode IS
  'Session agreement preset: sanctuary|notes|reflection|learning|custom. NULL = not yet chosen (pre-session). UI default selector is notes.';
COMMENT ON COLUMN scribe_sessions.consent_flags IS
  'Resolved retention flags {recording,transcript,summary,memory,video_archive}. Snapshotted per event in session_consent_events.flags.';
COMMENT ON COLUMN scribe_sessions.agreement_text_snapshot IS
  'MAIA retention statement frozen at consent (paired with agreement_version).';
COMMENT ON COLUMN scribe_sessions.external_provider_notice_snapshot IS
  'External provider notice shown at the client gate; NULL for soullab (sovereign media).';
COMMENT ON COLUMN scribe_sessions.video_link_reveal_allowed IS
  'Fail-closed denormalized mirror. Authoritative gate is a client accept event in session_consent_events; the API MUST verify the ledger, not trust this flag alone.';

-- 2. Append-only consent ledger (the spine).
CREATE TABLE IF NOT EXISTS session_consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES scribe_sessions(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('practitioner','client','system')),
  actor_id UUID,  -- polymorphic soft ref: members(id) for practitioner, practitioner_clients(id) for client, NULL for system
  action TEXT NOT NULL CHECK (action IN ('set','accept','refuse','change','revoke')),
  agreement_mode TEXT CHECK (agreement_mode IN ('sanctuary','notes','reflection','learning','custom')),
  agreement_version TEXT,
  flags JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE session_consent_events IS
  'Append-only consent ledger for Session Room. Metadata only — never session content. Records initial practitioner set, client accept/refuse, mid-session change, and revoke. For Sanctuary sessions this ledger + scribe_sessions date/duration are the ONLY records kept.';
COMMENT ON COLUMN session_consent_events.actor_id IS
  'Polymorphic soft reference (no FK by design): members(id) when actor_type=practitioner; practitioner_clients(id) when client; NULL when system.';

-- 3. Indexes.
CREATE INDEX IF NOT EXISTS idx_consent_events_session ON session_consent_events(session_id);
CREATE INDEX IF NOT EXISTS idx_consent_events_gate ON session_consent_events(session_id, actor_type, action, created_at DESC);

-- 4. Canonical reveal check for the join/session API — return video_link ONLY when this is TRUE:
--   WITH s AS (SELECT agreement_version FROM scribe_sessions WHERE id = :session_id)
--   SELECT EXISTS (
--     SELECT 1 FROM session_consent_events e, s
--     WHERE e.session_id = :session_id
--       AND e.actor_type = 'client'
--       AND e.action = 'accept'
--       AND e.agreement_version = s.agreement_version
--       AND NOT EXISTS (
--         SELECT 1 FROM session_consent_events r
--         WHERE r.session_id = :session_id
--           AND r.actor_type = 'client'
--           AND r.action IN ('refuse','revoke')
--           AND r.created_at > e.created_at
--       )
--   );
--   UI hiding is not sufficient. video_link_reveal_allowed mirrors this (default false).
