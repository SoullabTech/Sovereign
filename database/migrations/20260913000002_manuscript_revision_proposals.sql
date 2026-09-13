-- EDITORIAL-WRITE-01 — the exact change a member is asked to authorize.
--
--   Editorial decision  — the Work should be handled this way.
--   RevisionProposal    — here is the exact change I am asking permission to make.
--   Accepted mutation   — the member authorized this exact change.
--
-- ⛔ THIS TABLE BUILDS NO MUTATION. `saveSectionInTransaction` already owns the
-- draft lock, the stale-base refusal, the content derivation and the one version
-- increment. This is the AUTHORIZATION in front of that mutation. A second
-- UPDATE path against manuscript_draft_sections is forbidden.

BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_revision_proposals (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id          uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  work_id            uuid NOT NULL,

  -- ⭐ EXACTLY WHAT STATE THIS WAS BUILT AGAINST. A proposal is permission to
  -- make ONE EXACT CHANGE to ONE EXACT STATE of the Work — never general
  -- permission to achieve the same editorial intention somehow.
  draft_id           uuid NOT NULL,
  base_version       integer NOT NULL,

  -- ⛔ ONE OPERATION. `replace`, `move`, `merge`, `split`, `reorder` and
  -- `rename` are not invented here; the vocabulary is discovered from real
  -- manuscript work. A one-value CHECK is a door somebody must open on purpose.
  operation          text NOT NULL CHECK (operation = 'delete_exact_text'),
  target_section_id  uuid NOT NULL,

  -- ⭐⭐ THE LAW. Acceptance re-reads the Work and requires these characters, at
  -- this target, occurring EXACTLY ONCE.
  --
  -- ⛔ NOT REDUNDANT WITH base_version. Every write path today advances the
  -- version, so "the text is unchanged" would rest entirely on every present and
  -- future path remembering to. That is the FOCUS-W7 shape — a guarantee holding
  -- because a different subsystem happens to refuse first — seen in advance
  -- instead of afterwards. Expected text is the law; the version is defence in
  -- depth; either may refuse and neither may be the only thing that does.
  expected_text      text NOT NULL CHECK (length(expected_text) > 0),
  replacement_text   text NOT NULL,

  -- Which ruling this implements, when it implements one.
  decision_chain_id  uuid,

  created_at         timestamptz NOT NULL DEFAULT now(),

  -- ⭐⭐ THERE IS NO DURABLE "CLAIMED BUT NOT WRITTEN" STATE. Both columns are
  -- written together, in the same statement, at the END of the transaction that
  -- performed the mutation. A proposal marked accepted whose write failed would
  -- tell the member their change was made when the Work never moved.
  --
  -- ⛔ A CHECK is NOT DEFERRED, so an earlier draft that set accepted_at first
  -- and resulting_version later would have violated this constraint at the very
  -- first statement. The constraint is what forces the correct order.
  accepted_at        timestamptz,
  resulting_version  integer,

  CONSTRAINT mrp_acceptance_whole CHECK (
    (accepted_at IS NULL) = (resulting_version IS NULL))
);

CREATE INDEX IF NOT EXISTS idx_mrp_member_work
  ON manuscript_revision_proposals (member_id, work_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mrp_open
  ON manuscript_revision_proposals (member_id, id) WHERE accepted_at IS NULL;

COMMIT;
