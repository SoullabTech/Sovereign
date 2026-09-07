-- Circle membership removals — append-only record of a boundary/safety act
--
-- CIRCLE-04 · R2, implementing FR-05 (founder ruling 2026-09-06).
--
-- FR-05: removal is a BOUNDARY OR SAFETY ACTION, never an interpretive judgment.
-- It must record who enacted it and on what grounds, and the removed member must
-- have a route to request review by someone other than the person who enacted it.
-- That review workflow is NOT built here (CA-10, open) — but the evidence it will
-- need must exist from the first removal, or the history has to be reconstructed
-- later, which is exactly what an accountable record is meant to prevent.
--
-- WHY A SEPARATE TABLE, not columns on circle_memberships
--
-- The nearest established governance pattern in this repo is
-- 20260618000002_team_message_deletion_audit.sql: actor + reason columns on the
-- acted-upon row. That pattern does not survive here. circle_memberships is
-- upserted by joinWithInvite() on ON CONFLICT (circle_id, member_id), so a
-- removed member who later rejoins with a valid invite would OVERWRITE the row
-- carrying their own removal record. Governance evidence that a subsequent
-- ordinary action can silently erase is not evidence.
--
-- audit_logs was also considered and rejected: it is scoped to authentication
-- attribution (AUTH-AUDIT-01), and its own contract states metadata must never
-- carry member-authored content. `grounds` is member-authored text.
--
-- So this is the founder-named fallback: the smallest representation preserving
-- circle · removed member · acting facilitator · grounds · timestamp · resulting
-- membership state.
--
-- APPEND-ONLY BY APPLICATION CONTRACT — and no stronger claim than that.
-- No code path updates or deletes these rows, and there is deliberately no
-- updated_at column and no updated_at trigger. That is enough for what FR-05
-- needs: ordinary product actions, rejoining included, cannot overwrite removal
-- history. It is NOT cryptographic immutability and NOT protection from a
-- database administrator. Do not describe it as either.
--
-- NO FOREIGN KEYS, following the reasoning already established for audit_logs
-- (20260828000001): a record must survive deletion of whatever it describes, and
-- must never block that deletion. Every circles_commons table cascades from
-- circles(id); a removal record that cascaded away with the Circle would destroy
-- the review evidence at exactly the moment it might be needed. IDs are UUIDs
-- validated at the writer.
--
-- NOT RECORDED, deliberately: IP, user agent, device. Same reasoning as the team
-- message deletion audit — a sovereignty-first system does not accumulate
-- speculative surveillance data with no current consumer.

CREATE TABLE IF NOT EXISTS circle_membership_removals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- WHERE. Not a reference; see the no-foreign-keys note above.
  circle_id         UUID NOT NULL,

  -- WHO was removed, and WHO enacted it. Distinct by construction: a member
  -- leaving of their own accord uses leaveCircle(), which is a different act
  -- with different authority and is not recorded here.
  removed_member_id UUID NOT NULL,
  removed_by        UUID NOT NULL,

  -- WHY. FR-05 requires grounds sufficient for later independent review.
  -- NOT NULL and non-empty: an unexplained removal is precisely the
  -- interpretive judgment FR-05 forbids.
  grounds           TEXT NOT NULL,

  -- The membership state the act produced, so the row is self-describing
  -- without joining back to a table that may have moved on since.
  resulting_status  TEXT NOT NULL DEFAULT 'removed'
                    CHECK (resulting_status IN ('removed')),

  -- WHEN.
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT circle_membership_removals_grounds_not_blank
    CHECK (length(btrim(grounds)) > 0),

  -- A facilitator cannot remove themselves. Self-departure is leaveCircle().
  CONSTRAINT circle_membership_removals_not_self
    CHECK (removed_member_id <> removed_by)
);

CREATE INDEX IF NOT EXISTS idx_circle_removals_circle
  ON circle_membership_removals(circle_id, created_at DESC);

-- The review route (CA-10) is per removed member: "show me my removals".
CREATE INDEX IF NOT EXISTS idx_circle_removals_member
  ON circle_membership_removals(removed_member_id, created_at DESC);

COMMENT ON TABLE circle_membership_removals IS
  'Append-only record of Circle removals (FR-05). Never updated, never deleted. Survives deletion of the Circle it describes so review evidence cannot vanish with it.';
COMMENT ON COLUMN circle_membership_removals.grounds IS
  'Facilitator-supplied grounds. Required by FR-05 so a removal can be independently reviewed; an unexplained removal is the interpretive judgment FR-05 forbids.';
COMMENT ON COLUMN circle_membership_removals.removed_by IS
  'The facilitator who enacted the removal. The review route required by FR-05 must be served by someone OTHER than this member.';

INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260906000003_circle_membership_removals.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
