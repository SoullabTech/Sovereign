-- Soullab Press — Working Draft layer (Author Environment R1 foundation)
--
-- CONSTITUTIONAL POSITION (load-bearing):
--   - Source stays immutable: manuscript_sections are never edited, here or
--     anywhere. The working draft is a SEPARATE member-editable copy,
--     initialized VERBATIM from the source sections, so "this is where your
--     manuscript lives" can become true without the original ever being at
--     risk.
--   - Only the author writes the draft: rows are created and updated solely
--     through member-scoped routes; no system path mutates draft content.
--   - Checkpoints are preserved: working_draft_revisions is append-only
--     against modification (UPDATE is trigger-refused). Restore writes a NEW
--     revision — history is never rewritten. DELETE is deliberately NOT
--     refused: it remains reachable only via the manuscript's own cascade, so
--     a member deleting their manuscript takes the whole tree with it —
--     member deletion sovereignty outranks archival completeness.
--   - base_source_hash records exactly which source sections the draft began
--     from (sha256, see lib/manuscript/render/renderMemberBook.ts
--     computeSourceHash) — provenance, never interpretation.
--   - No interpretive columns, by construction.
--
-- Authority: docs/press/MANUSCRIPT_AUTHOR_READY_PHASE1.md (Source vs Working
--            Draft separation)

BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_working_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL UNIQUE REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  content text NOT NULL,
  base_source_hash text NOT NULL CHECK (length(base_source_hash) > 0),
  revision_count int NOT NULL DEFAULT 0 CHECK (revision_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manuscript_working_drafts_member
  ON manuscript_working_drafts(member_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS working_draft_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id) ON DELETE CASCADE,
  revision_number int NOT NULL CHECK (revision_number > 0),
  content text NOT NULL,
  saved_by uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (draft_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_working_draft_revisions_draft
  ON working_draft_revisions(draft_id, revision_number DESC);

-- Append-only against modification: UPDATE refused structurally. DELETE is
-- intentionally allowed so the manuscript-deletion cascade can pass through
-- (see constitutional position above); no route exposes revision deletion.
CREATE OR REPLACE FUNCTION working_draft_revisions_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'working_draft_revisions is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS working_draft_revisions_no_update ON working_draft_revisions;
CREATE TRIGGER working_draft_revisions_no_update
  BEFORE UPDATE ON working_draft_revisions
  FOR EACH ROW EXECUTE FUNCTION working_draft_revisions_immutable();

COMMIT;

-- ROLLBACK (manual):
--   DROP TRIGGER IF EXISTS working_draft_revisions_no_update ON working_draft_revisions;
--   DROP FUNCTION IF EXISTS working_draft_revisions_immutable();
--   DROP TABLE IF EXISTS working_draft_revisions;
--   DROP TABLE IF EXISTS manuscript_working_drafts;
