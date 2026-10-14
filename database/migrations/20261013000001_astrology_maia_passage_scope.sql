-- ASTRO-R4F: isolated review-candidate migration, NEVER applied to production.
-- One-use issuance, member ownership and persistent conversation-only origin.
-- No natal record, birth date, chat passage or bearer token is stored here.
-- Passage digests use HMAC-SHA256 with a server-only secret outside the backup.
-- Historical/untagged turns are deliberately NOT inferred or backfilled.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS astro_maia_transfer_grants (
  id uuid PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  session_id text NOT NULL UNIQUE,
  token_sha256 char(64) NOT NULL UNIQUE,
  text_hmac_sha256 char(64) NOT NULL,
  scope text NOT NULL DEFAULT 'conversation_only'
    CHECK (scope = 'conversation_only'),
  status text NOT NULL DEFAULT 'issued'
    CHECK (status IN ('issued', 'consumed', 'revoked')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  revoked_at timestamptz,
  CONSTRAINT astro_r4f_state_time CHECK (
    (status = 'issued' AND consumed_at IS NULL AND revoked_at IS NULL)
    OR (status = 'consumed' AND consumed_at IS NOT NULL AND revoked_at IS NULL)
    OR (status = 'revoked' AND revoked_at IS NOT NULL)
  ),
  CONSTRAINT astro_r4f_short_validity CHECK (expires_at > issued_at AND expires_at <= issued_at + interval '5 minutes')
);

CREATE INDEX IF NOT EXISTS astro_r4f_member_session_idx
  ON astro_maia_transfer_grants (member_id, session_id);
CREATE INDEX IF NOT EXISTS astro_r4f_expiring_pending_idx
  ON astro_maia_transfer_grants (expires_at)
  WHERE status = 'issued';

COMMENT ON TABLE astro_maia_transfer_grants IS
 'One-use chart-sharing authorization; every listed session remains conversation-only even after expiry or revocation. Presence here forbids implicit cross-session recall. R20 deletion and historical treatment require separate acceptance.';

COMMIT;
