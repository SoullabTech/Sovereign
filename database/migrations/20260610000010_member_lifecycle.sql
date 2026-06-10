-- Migration: Member lifecycle status (Disable / Archive)
-- Created: 2026-06-10
-- Authority: docs/specs/MEMBER_LIFECYCLE_2026-06-10.md
--
-- Purpose: Adds an admin-managed lifecycle state to members so an account can be
-- DISABLED (sign-in blocked, still visible, data preserved) or ARCHIVED (sign-in
-- blocked, hidden from active surfaces, data preserved). Both are reversible.
--
-- HARD DELETE is deliberately NOT a status — it removes the row (Phase 2). Erasure
-- is irreversible and, in this schema, requires a curated transactional purge
-- (see spec §Cascade Reality), so it is a separate operation, not a status value.
--
-- Enforcement: lib/auth/serverSessions.ts::createSession() refuses any member whose
-- status <> 'active' (the single chokepoint for all sign-in / session-mint paths).
-- lib/members/lifecycle.ts revokes live sessions when status leaves 'active'.

BEGIN;

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'disabled', 'archived'));

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;

-- Acting admin's member id. Intentionally NO foreign key: the audit trail of who
-- changed a status must survive even if that admin is later removed.
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS status_changed_by UUID;

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS status_reason TEXT;

-- Partial index: 'active' is the overwhelming common case and is excluded so the
-- index stays tiny and serves the admin management list (disabled/archived only).
CREATE INDEX IF NOT EXISTS members_status_idx ON members (status) WHERE status <> 'active';

COMMENT ON COLUMN members.status IS
'Member lifecycle state. active = normal; disabled = sign-in blocked, still visible, data preserved; archived = sign-in blocked, hidden from active surfaces, data preserved. Both disabled and archived are reversible. Hard delete removes the row and is NOT represented here (see docs/specs/MEMBER_LIFECYCLE_2026-06-10.md).';

COMMENT ON COLUMN members.status_changed_by IS
'member id of the admin who last changed status. No FK by design — the record must survive that admin''s own removal.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260610000010: members.status (+ status_changed_at/_by/_reason) added (default active)';
END $$;
