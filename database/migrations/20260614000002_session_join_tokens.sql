-- Session Room — client join tokens (scoped consent invitations)
-- Design: docs/specs/SESSION_ROOM_JOIN_TOKEN_DESIGN_2026-06-14.md
-- Spec/scope: SESSION_ROOM_VIDEO_SPEC_2026-06-14.md / SESSION_ROOM_VIDEO_PHASE1_SCOPE_2026-06-14.md
--
-- A scoped, single-purpose invitation token (NOT a login/session). Bound to
-- (session_id, client_id, agreement_version). Opaque token; only sha256(token) is stored.
--
-- IMPORTANT: token validity (this table) is NOT the link-reveal authority. The reveal
-- authority is the session_consent_events ledger query (latest client event for the current
-- agreement_version must equal 'accept'). This table governs who may decide and identifies
-- the session/client; the ledger governs whether the video link is revealed.

CREATE TABLE IF NOT EXISTS session_join_tokens (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        uuid NOT NULL REFERENCES scribe_sessions(id) ON DELETE CASCADE,
  client_id         uuid NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  agreement_version text NOT NULL,
  token_hash        text NOT NULL UNIQUE,
  status            text NOT NULL DEFAULT 'active' CHECK (status IN ('active','used','refused','revoked')),
  expires_at        timestamptz NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  decided_at        timestamptz
);

COMMENT ON TABLE session_join_tokens IS
  'Scoped client consent invitations for Session Room. Opaque token; only sha256 stored. Bound to (session_id, client_id, agreement_version). New agreement version => new token (prior active ones revoked). Token validity != link reveal — the reveal authority is the session_consent_events ledger query.';

CREATE INDEX IF NOT EXISTS idx_join_tokens_session ON session_join_tokens(session_id, agreement_version);
CREATE INDEX IF NOT EXISTS idx_join_tokens_active ON session_join_tokens(session_id) WHERE status = 'active';
