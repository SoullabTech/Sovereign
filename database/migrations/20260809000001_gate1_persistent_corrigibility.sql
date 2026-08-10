-- Migration: 20260809000001_gate1_persistent_corrigibility.sql
--
-- GATE 1 — Persistent corrigibility (founder ruling
-- docs/governance/FOUNDER_RULING_PERSISTENT_CORRIGIBILITY_GATE1_2026-08-09.md,
-- evidence record docs/architecture/audits/MAIA_PERSISTENT_CORRIGIBILITY_RECONCILIATION_2026-08-09.md).
--
-- Piece A: member_corrections (first-class member-authored correction record)
--          + recall eligibility on conversation_turns.
-- Piece B: authority-by-member-act on interpretive_ledger
--          (recurrence may establish evidence; only a member act confers authority).
--
-- Constitutional invariants enforced HERE, in the database, not in application
-- discipline (same idiom as episodic_member_marked_requires_verbatim):
--   * turns_supersession_coherent  — a turn cannot be superseded without a
--     member correction attached; an eligible turn cannot carry one.
--   * ledger_authority_requires_member_act — a ledger row with no member act
--     cannot carry routing weight.
--
-- F2: supersession never deletes. No row is removed or rewritten by this
-- migration or by the runtime it supports.
-- Production data ruling: existing turns default to 'eligible'. No retroactive
-- correction inference; no bulk detector pass. Prospective only.
-- Idempotency per the #559 pattern.

-- ─── Piece A: the member's correction as a first-class authored object ────────

CREATE TABLE IF NOT EXISTS member_corrections (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- conversation_turns.user_id is TEXT (015_conversation_turns.sql) — match it.
  member_id             TEXT NOT NULL,
  session_id            TEXT,
  -- F1/F5: the correction is the member's own words. The system never writes
  -- a correction on the member's behalf (mirrors episodic verbatim rule).
  verbatim_text         TEXT NOT NULL CHECK (length(btrim(verbatim_text)) > 0),
  -- F6: detection/classification provenance — inspectable, distinct from the
  -- member's act itself ("system classified utterance as correction" is
  -- system metadata; "member said correction" is the verbatim above).
  correction_type       TEXT NOT NULL CHECK (correction_type IN ('repeat', 'misread', 'thread_loss', 'general')),
  matched_phrase        TEXT,
  detection_confidence  NUMERIC(4,3) NOT NULL CHECK (detection_confidence >= 0 AND detection_confidence <= 1),
  detector_version      TEXT NOT NULL DEFAULT 'phrase-v1',
  -- The referent this correction superseded, when a deterministic referent
  -- existed (the immediately preceding assistant turn in the same session).
  -- NULL = correction recorded without supersession (ambiguity fails toward
  -- non-supersession, F5).
  superseded_turn_id    UUID REFERENCES conversation_turns(id),
  -- F6: corrigibility of the corrigibility mechanism — a correction may
  -- reverse a prior correction (restoring eligibility). The reversed
  -- correction row REMAINS; history is never erased.
  reverses_correction_id UUID REFERENCES member_corrections(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_corrections_member
  ON member_corrections(member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_corrections_superseded_turn
  ON member_corrections(superseded_turn_id) WHERE superseded_turn_id IS NOT NULL;

COMMENT ON TABLE member_corrections IS
  'First-class member-authored correction acts (Gate 1, founder ruling 2026-08-09). '
  'The member authors the correction; the system registers its consequence. '
  'Rows are immutable history — reversal adds a row, never removes one.';

-- ─── Piece A: recall eligibility on conversation_turns ────────────────────────

ALTER TABLE conversation_turns
  ADD COLUMN IF NOT EXISTS recall_eligibility TEXT NOT NULL DEFAULT 'eligible',
  ADD COLUMN IF NOT EXISTS superseded_by_correction_id UUID REFERENCES member_corrections(id);

ALTER TABLE conversation_turns
  DROP CONSTRAINT IF EXISTS turns_recall_eligibility_valid;
ALTER TABLE conversation_turns
  ADD CONSTRAINT turns_recall_eligibility_valid
  CHECK (recall_eligibility IN ('eligible', 'superseded'));

-- The whole of F2/A3 in one line: superseded requires an attached member act;
-- eligible forbids one. The DB refuses ungoverned supersession.
ALTER TABLE conversation_turns
  DROP CONSTRAINT IF EXISTS turns_supersession_coherent;
ALTER TABLE conversation_turns
  ADD CONSTRAINT turns_supersession_coherent
  CHECK (
    (recall_eligibility = 'eligible'   AND superseded_by_correction_id IS NULL)
    OR
    (recall_eligibility = 'superseded' AND superseded_by_correction_id IS NOT NULL)
  );

-- Hot-path partial index: every recall read now filters on eligibility.
CREATE INDEX IF NOT EXISTS idx_conversation_turns_recall_eligible
  ON conversation_turns(user_id, created_at DESC)
  WHERE recall_eligibility = 'eligible';

COMMENT ON COLUMN conversation_turns.recall_eligibility IS
  'Gate 1: superseded = a member correction removed this turn''s eligibility for '
  'unqualified current recall. The row is historical evidence, never deleted. '
  'superseded ≠ deleted; historical ≠ currently assertable (F2).';

-- ─── Piece B: authority on interpretive_ledger arises only from a member act ──

ALTER TABLE interpretive_ledger
  ADD COLUMN IF NOT EXISTS authority_source TEXT,
  ADD COLUMN IF NOT EXISTS authority_granted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS superseded_by_correction_id UUID REFERENCES member_corrections(id);

ALTER TABLE interpretive_ledger
  DROP CONSTRAINT IF EXISTS ledger_authority_source_valid;
ALTER TABLE interpretive_ledger
  ADD CONSTRAINT ledger_authority_source_valid
  CHECK (authority_source IS NULL OR authority_source IN ('member_confirmed', 'member_authored', 'member_qualified'));

-- The design in one line: a row with no member act cannot carry routing
-- weight — enforced by the database, not by application discipline.
-- (0 production rows at migration time: constraint cannot break existing data.)
ALTER TABLE interpretive_ledger
  DROP CONSTRAINT IF EXISTS ledger_authority_requires_member_act;
ALTER TABLE interpretive_ledger
  ADD CONSTRAINT ledger_authority_requires_member_act
  CHECK (
    (authority_source IS NULL     AND routing_influence_weight = 0)
    OR
    (authority_source IS NOT NULL AND authority_granted_at IS NOT NULL)
  );

COMMENT ON COLUMN interpretive_ledger.authority_source IS
  'Gate 1 (F7): epistemic authority arises from an attributable member act — '
  'never from recurrence, inference, silence, statistical confidence, or '
  'system repetition. NULL = no authority, ever, regardless of evidence volume.';

-- ─── Piece B: member gesture vocabulary gains confirm / qualify ───────────────
-- cogos_annotation_type is an enum (20260311000003). ALTER TYPE ... ADD VALUE
-- cannot run inside a transaction on older PG; use the guarded DO block form.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'cogos_annotation_type' AND e.enumlabel = 'confirm'
  ) THEN
    ALTER TYPE cogos_annotation_type ADD VALUE 'confirm';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'cogos_annotation_type' AND e.enumlabel = 'qualify'
  ) THEN
    ALTER TYPE cogos_annotation_type ADD VALUE 'qualify';
  END IF;
END$$;
