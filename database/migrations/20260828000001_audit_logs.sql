-- Migration: audit_logs — durable substrate for authentication attribution
--
-- AUTH-AUDIT-01. `lib/security/authAudit.ts` has inserted into this table since
-- it was written, across nine call sites. The table did not exist. The insert
-- threw, `logAuthEvent` caught the error and continued, and authentication was
-- unaffected — so the absence was structurally silent. The companion migration
-- 20260114000004_add_audit_metadata.sql is guarded on this table existing and
-- took its skip branch every run, which is why nothing ever surfaced.
--
-- The column set is NOT a fresh design. It is the existing INSERT contract in
-- authAudit.ts, transcribed, so that turning the substrate on cannot change what
-- the callers already write.
--
-- No foreign keys, deliberately. An audit row must survive deletion of whatever
-- it describes, and must never block that deletion. `user_id` and `resource_id`
-- are UUIDs validated at the writer, not references.

CREATE TABLE IF NOT EXISTS audit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Chronology is not optional. An attribution store without time cannot
  -- support registration / use / revocation history, which is the whole point.
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- WHO acted, when the caller actually established that identity.
  -- NULL means "not established", never "nobody". Do not populate this by
  -- copying resource_id: that would replace a hardcoded NULL with a synthesized
  -- attribution, which is worse.
  user_id          UUID,

  -- WHAT was done, and to WHICH object. resource_id is the member, credential
  -- or session acted upon — not necessarily the actor.
  action_type      TEXT NOT NULL,
  resource_type    TEXT,
  resource_id      UUID,

  ip_address       INET,
  user_agent       TEXT,
  action_result    TEXT,
  error_message    TEXT,

  -- Structured context: hashes, redacted hints, failure reasons. Never
  -- plaintext credentials, challenges, public keys or member-authored content.
  metadata         JSONB DEFAULT '{}'::jsonb,

  phi_accessed     BOOLEAN,

  -- Tri-state by design, and NULLABLE with no default:
  --   TRUE  = a defined consent check occurred and passed
  --   FALSE = a defined consent check occurred and failed
  --   NULL  = this path did not establish consent status
  -- Every insert previously hardcoded TRUE, so every row asserted a check that
  -- nothing had performed. Unknown must never become TRUE, and must not become
  -- FALSE either. A default of any kind would reintroduce the fabrication.
  consent_verified BOOLEAN
);

-- Attribution queries: "what happened to this member/credential, in order".
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- Incident queries: "what failed, recently".
CREATE INDEX IF NOT EXISTS idx_audit_action_time ON audit_logs(action_type, created_at DESC);

-- Same name as the index created by 20260114000004_add_audit_metadata.sql, so
-- that migration stays a no-op on a database where this one has run. Migration
-- order makes the reverse safe too: dated 2026-01, it runs first, finds no
-- table, and skips.
CREATE INDEX IF NOT EXISTS idx_audit_metadata ON audit_logs USING gin (metadata);

COMMENT ON TABLE audit_logs IS 'Authentication attribution: who did what to which resource, when. Written by lib/security/authAudit.ts. No credential material.';
COMMENT ON COLUMN audit_logs.user_id IS 'Actor identity, only where the caller established it. NULL = not established, never "nobody".';
COMMENT ON COLUMN audit_logs.consent_verified IS 'TRUE = checked and passed; FALSE = checked and failed; NULL = this path did not establish consent status.';
