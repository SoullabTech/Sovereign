-- WS-ATMOSPHERE-01 — the light a writer chooses to work in.
--
-- Founder ruling 2026-09-07: the Studio ships one authored environment
-- (Atelier) and the writer may switch among a small set of others. The choice
-- persists, carries through every room, and means nothing.
--
-- ── What this table may never become ───────────────────────────────────────
-- An atmosphere is NOT a mood, a state, a phase, an element, or a signal. It
-- is a room. Nothing may read this column to infer anything about the member,
-- and nothing may write it except the member's own act:
--
--   * no detector, scheduler, or background job sets it (there is no
--     `set_by` column because there is only ever one setter — the member);
--   * MAIA does not read it and must not branch on it;
--   * it carries no timestamp of "when they felt like this", because it is not
--     about how they felt. `updated_at` exists to make the row idempotent to
--     write, not to build a history of choices — there is deliberately no
--     append-only log of atmosphere changes anywhere in this migration.
--
-- Storing the id as TEXT with no CHECK is intentional and mirrors
-- living_work_expressions.expression_type: an unknown value must degrade to
-- the default in code, not fail a member's page load, and a future authored
-- environment must not require a migration to exist. The validating authority
-- is app/writers-studio/atmosphere/atmospheres.ts, which is where the rooms
-- are actually defined.
--
-- ADDITIVE. No existing table is touched. Reversal:
--   DROP TABLE IF EXISTS member_studio_atmosphere;

BEGIN;

CREATE TABLE IF NOT EXISTS member_studio_atmosphere (
  member_id  UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,

  -- The id of an authored environment. Absence of a row means Atelier: a
  -- member who has never chosen is not recorded as having chosen the default.
  atmosphere TEXT NOT NULL CHECK (length(trim(atmosphere)) > 0),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE member_studio_atmosphere IS
  'The Writer''s Studio environment a member chose. Written only by the member''s own act. Non-semantic: nothing may infer anything about the member from this value, and no history of changes is kept.';

COMMENT ON COLUMN member_studio_atmosphere.atmosphere IS
  'Authored environment id (atelier | night-study | forest | cloud | midnight). Unvalidated in SQL on purpose: an unknown id degrades to the default in code rather than breaking a page, and a new room needs no migration.';

COMMIT;
