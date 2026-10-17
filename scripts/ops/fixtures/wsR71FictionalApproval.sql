-- R71. FICTIONAL-ONLY local contract. This migration is NOT a production release.
-- One server-issued opaque approval is spent in the SAME PG transaction as an
-- existing section-native Save. No proposal prose is copied into this ledger.
BEGIN;
CREATE TABLE IF NOT EXISTS ws_r71_fixture_author_approvals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 token_hash char(64) UNIQUE NOT NULL,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
 draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id) ON DELETE CASCADE,
 section_id uuid NOT NULL REFERENCES manuscript_draft_sections(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK (kind IN ('apply','undo')),
 base_version bigint NOT NULL CHECK (base_version >= 1),
 section_hash char(64) NOT NULL,
 passage_start integer CHECK (passage_start >= 0),
 passage_end integer,
 selection_hash char(64),
 alternative_id uuid,
 parent_apply_id uuid REFERENCES ws_r71_fixture_author_approvals(id) ON DELETE CASCADE,
 pre_apply_revision integer,
 post_apply_revision integer,
 resulting_version bigint,
 consumed_at timestamptz,
 undone_at timestamptz,
 restored_version bigint,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 minutes'),
 CONSTRAINT ws_r71_shape CHECK (
  (kind='apply' AND passage_start IS NOT NULL AND passage_end>passage_start
   AND selection_hash IS NOT NULL AND alternative_id IS NOT NULL AND parent_apply_id IS NULL)
  OR
  (kind='undo' AND parent_apply_id IS NOT NULL AND passage_start IS NULL
   AND passage_end IS NULL AND selection_hash IS NULL AND alternative_id IS NULL)
 ),
 CONSTRAINT ws_r71_spend_whole CHECK (
  (consumed_at IS NULL AND resulting_version IS NULL) OR
  (consumed_at IS NOT NULL AND resulting_version IS NOT NULL)
 )
);
CREATE INDEX IF NOT EXISTS ws_r71_fixture_member_ms
 ON ws_r71_fixture_author_approvals(member_id,manuscript_id,consumed_at DESC);
-- No general member endpoint may create or alter this test-only table.
COMMIT;
