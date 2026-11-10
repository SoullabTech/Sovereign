-- WS-DEVELOP-STUDIO · M4 — a development plan: MAIA's grounded steps for the writer's Work, edited by the writer.
--
-- Founder ruling 2026-11-09: plan steps become proposals through the EXISTING passage desk; no new change path. So a plan never changes the manuscript:
-- a step is a direction anchored to an exact passage the writer can open. The plan is the writer's working document: they may edit a step's wording,
-- set its status, or remove it. Every change keeps the previous version in an append-only history.
--
-- ⛔⛔ CANDIDATE ON A NON-CANONICAL BRANCH. Merging this file is latent schema-deploy authorization (2026-09-07 finding). Additive.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS development_plans (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,
  manuscript_id  UUID NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  -- the WRITER's own sentence that asked for the plan
  ask            TEXT NOT NULL CHECK (length(ask) BETWEEN 1 AND 1000),
  summary        TEXT NOT NULL DEFAULT '' CHECK (length(summary) <= 1200),
  -- [{ id, chapterId, anchor, direction, why, status }]
  steps          JSONB NOT NULL CHECK (jsonb_typeof(steps) = 'array' AND jsonb_array_length(steps) <= 8),
  -- [{ sectionId, digest }] — the saved text each step was made against; a changed digest marks a step stale
  basis          JSONB NOT NULL CHECK (jsonb_typeof(basis) = 'array'),
  -- SHA-256 of the writer's settled decisions as MAIA was given them for this plan (the empty string's digest when none).
  decisions_digest TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS development_plans_member_manuscript_idx ON development_plans (member_id, manuscript_id, created_at DESC);

ALTER TABLE development_plans ADD COLUMN IF NOT EXISTS decisions_digest TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS development_plan_history (
  plan_id  UUID NOT NULL REFERENCES development_plans(id) ON DELETE CASCADE,
  rev      INTEGER NOT NULL,
  steps    JSONB NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (plan_id, rev)
);

-- The previous version is kept on every edit; the history itself is never edited.
CREATE OR REPLACE FUNCTION development_plans_keep_history() RETURNS trigger AS $$
BEGIN
  IF NEW.member_id IS DISTINCT FROM OLD.member_id OR NEW.living_work_id IS DISTINCT FROM OLD.living_work_id
     OR NEW.manuscript_id IS DISTINCT FROM OLD.manuscript_id OR NEW.ask IS DISTINCT FROM OLD.ask OR NEW.basis IS DISTINCT FROM OLD.basis OR NEW.decisions_digest IS DISTINCT FROM OLD.decisions_digest THEN
    RAISE EXCEPTION '[PLAN] only a plan''s steps and summary may change';
  END IF;
  -- A step's anchor and chapter are fixed at creation, and no step is ever added afterwards: the writer edits wording, status or removes.
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(NEW.steps) n
     WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(OLD.steps) o
                        WHERE o->>'id' = n->>'id' AND o->>'anchor' = n->>'anchor' AND o->>'chapterId' = n->>'chapterId')
  ) THEN RAISE EXCEPTION '[PLAN] a step''s anchor and chapter cannot change, and steps cannot be added after the plan is made'; END IF;
  INSERT INTO development_plan_history (plan_id, rev, steps)
    SELECT OLD.id, COALESCE((SELECT MAX(rev) FROM development_plan_history WHERE plan_id = OLD.id), 0) + 1, OLD.steps;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS development_plans_keep_history_trigger ON development_plans;
CREATE TRIGGER development_plans_keep_history_trigger BEFORE UPDATE ON development_plans
  FOR EACH ROW EXECUTE FUNCTION development_plans_keep_history();

CREATE OR REPLACE FUNCTION development_plan_history_no_edit() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' AND NOT EXISTS (SELECT 1 FROM development_plans WHERE id = OLD.plan_id) THEN RETURN OLD; END IF;
  RAISE EXCEPTION '[PLAN] development_plan_history is append-only';
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS development_plan_history_no_edit_trigger ON development_plan_history;
CREATE TRIGGER development_plan_history_no_edit_trigger BEFORE UPDATE OR DELETE ON development_plan_history
  FOR EACH ROW EXECUTE FUNCTION development_plan_history_no_edit();


-- ── Step ↔ desk link (M4c). A step NEVER stores "applied". It links to the desk's own authorization record, and
--    applied / undone are read from manuscript_revision_authorizations + manuscript_application_recovery every time.
--    The route inserts a link only when the authorization is the member's, accepted, on this plan's manuscript,
--    on the step's own section, and accepted after the plan was made. One authorization links to at most one step.
--    Append-only. Derivative of the desk's record, so it never blocks that record's governed erasure (CASCADE).
CREATE TABLE IF NOT EXISTS development_plan_step_links (
  authorization_id uuid PRIMARY KEY REFERENCES manuscript_revision_authorizations(id) ON DELETE CASCADE,
  plan_id          uuid NOT NULL REFERENCES development_plans(id) ON DELETE CASCADE,
  step_id          text NOT NULL CHECK (length(step_id) BETWEEN 1 AND 100),
  member_id        uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  linked_at        timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS development_plan_step_links_plan ON development_plan_step_links(plan_id, step_id);

CREATE OR REPLACE FUNCTION development_plan_step_links_no_edit() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' AND (NOT EXISTS (SELECT 1 FROM development_plans WHERE id = OLD.plan_id)
                           OR NOT EXISTS (SELECT 1 FROM manuscript_revision_authorizations WHERE id = OLD.authorization_id)) THEN RETURN OLD; END IF;
  RAISE EXCEPTION '[PLAN] development_plan_step_links is append-only';
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS development_plan_step_links_no_edit_trigger ON development_plan_step_links;
CREATE TRIGGER development_plan_step_links_no_edit_trigger BEFORE UPDATE OR DELETE ON development_plan_step_links
  FOR EACH ROW EXECUTE FUNCTION development_plan_step_links_no_edit();

COMMENT ON TABLE development_plans IS
'The writer''s working plan for their Work: MAIA''s grounded steps, each anchored to an exact passage in the writer''s own text, edited by the writer. A plan never changes the manuscript; a step is opened in the existing passage desk.';

COMMIT;
DO $$ BEGIN RAISE NOTICE 'Migration 20261108000004: development_plans, development_plan_history, development_plan_step_links'; END $$;
