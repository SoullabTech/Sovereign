-- WS-RELATIONAL-ARCHITECTURE step 4 — an editorial pass that survives closing the page.
-- Founder ruling 2026-11-11: "Let it run on its own" (the run continues on the server with no page open).
-- A run is created only by the member's request (keep gate). It advances on the server one lens at a time; every reading it makes is
-- the ordinary frozen reading. Before each reading the server re-checks the member's whole-Work read permission and their account's
-- Sanctuary default, and stops if either fails. Events are append-only: the newest state is current.
--
-- ⛔⛔ CANDIDATE ON A NON-CANONICAL BRANCH. Merging this file is latent schema-deploy authorization (2026-09-07 finding). Additive.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS editorial_pass_runs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  manuscript_id  UUID NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  draft_revision INTEGER NOT NULL CHECK (draft_revision >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS editorial_pass_runs_member_ms_idx ON editorial_pass_runs (member_id, manuscript_id, created_at DESC);

CREATE TABLE IF NOT EXISTS editorial_pass_run_events (
  id          BIGSERIAL PRIMARY KEY,
  run_id      UUID NOT NULL REFERENCES editorial_pass_runs(id) ON DELETE CASCADE,
  state       TEXT NOT NULL CHECK (state IN ('queued', 'reading', 'lens_done', 'lens_refused', 'synthesizing', 'done', 'failed', 'stopped', 'cancelled')),
  lens        TEXT,
  reading_id  UUID,
  refusal     TEXT CHECK (refusal IS NULL OR length(refusal) <= 200),
  letter_id   UUID REFERENCES work_editorial_letters(id) ON DELETE SET NULL,
  at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS editorial_pass_run_events_run_idx ON editorial_pass_run_events (run_id, id);

CREATE OR REPLACE FUNCTION ws_pass_run_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END $$;
DROP TRIGGER IF EXISTS editorial_pass_runs_no_update ON editorial_pass_runs;
CREATE TRIGGER editorial_pass_runs_no_update BEFORE UPDATE ON editorial_pass_runs FOR EACH ROW EXECUTE FUNCTION ws_pass_run_append_only();
DROP TRIGGER IF EXISTS editorial_pass_run_events_no_update ON editorial_pass_run_events;
CREATE TRIGGER editorial_pass_run_events_no_update BEFORE UPDATE ON editorial_pass_run_events FOR EACH ROW EXECUTE FUNCTION ws_pass_run_append_only();

COMMIT;
