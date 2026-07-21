-- Migration: member_reflections
-- Constitutional function: SUBSTRATE for the Developmental Reflection Experience (beta v0)
-- Grounding: docs/architecture/EA_WORLD_CLASS_ASSESSMENT_FOUNDATIONS_2026-07-21.md §11 (prototype spec)
--            docs/architecture/EA_AMENDMENT_DESIGN_BRIEF_2026-07-21.md (doctrines + refusals)
--            docs/architecture/ELEMENTAL_E0_RULINGS_2026-07-21.md (E0.1 authorship grammar)
--
-- A reflection is the member's own words about their present season, kept
-- verbatim. It is a MIRROR record, not a profile:
--   * No scoring columns exist BY DESIGN. Nothing is computed about the person.
--   * No element, type, or category columns exist BY DESIGN.
--   * answers are stored verbatim as the member wrote them; skipped questions
--     are simply absent. "I'd rather not say" is an honored answer, never a
--     stored inference.
--   * prior_reflection_id links a RETURN to the reflection the member chose to
--     revisit — continuity the member authors, never a system-built profile.
--   * return_intent_at is the member's own stated intention to return.
--     No reminders are implied by this column; any future reminder is a
--     separate, opt-in member act. No streaks, no completion state — by design.
--
-- Deletion: members own the archive. ON DELETE CASCADE from members; the
-- member-facing delete path removes rows fully (no soft-delete shadow copy).

CREATE TABLE IF NOT EXISTS member_reflections (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Verbatim Q&A: [{ "question": "...", "answer": "..." }, ...]
  -- Only answered questions appear. Never rewritten, summarized, or labeled.
  answers              JSONB NOT NULL,

  -- The member's own experiment, in their words (optional), and its if-then.
  experiment           TEXT,
  experiment_if_then   TEXT,

  -- The member's stated intention to return (optional). Informational only.
  return_intent_at     DATE,

  -- If this reflection is a return, the earlier reflection the member revisited.
  prior_reflection_id  UUID REFERENCES member_reflections(id) ON DELETE SET NULL,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_reflections_member
  ON member_reflections (member_id, created_at DESC);

COMMENT ON TABLE member_reflections IS
  'Developmental Reflection Experience (beta v0): member-authored, verbatim season reflections. Mirror record, not profile — no scoring, no categories, by design.';
