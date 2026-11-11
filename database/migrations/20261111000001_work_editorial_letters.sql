-- WS-RELATIONAL-ARCHITECTURE step 2 — MAIA's letter (the editorial pass) and the writer's decisions on each place, kept per Work.
-- Design: docs/programme/WS-RELATIONAL-ARCHITECTURE_DESIGN_CONCEPT_DRAFT_2026-11-11.md §10; founder ruling §6a (4) "in direction".
--
-- A letter is written ONLY by the server, at synthesis, from frozen readings; a client never supplies one. A decision is written ONLY
-- by the member's own request (intended | later | cleared). Both are append-only: the newest row is current, and earlier ones remain
-- as the record. A letter of an older draft is kept and labelled by its draft_revision; it is never presented as current.
-- Sanctuary: writes are refused at the route (keep gate).
--
-- ⛔⛔ CANDIDATE ON A NON-CANONICAL BRANCH. Merging this file is latent schema-deploy authorization (2026-09-07 finding). Additive.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS work_editorial_letters (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  manuscript_id  UUID NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  draft_revision INTEGER NOT NULL CHECK (draft_revision >= 0),
  -- the synthesized map: { manuscriptId, revisionNumber, commissionedAt, readingIds, items[] } (frozen observation text only)
  map            JSONB NOT NULL CHECK (jsonb_typeof(map) = 'object' AND jsonb_typeof(map->'items') = 'array'),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS work_editorial_letters_member_ms_idx ON work_editorial_letters (member_id, manuscript_id, created_at DESC);

CREATE TABLE IF NOT EXISTS work_place_decision_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  manuscript_id  UUID NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  letter_id      UUID NOT NULL REFERENCES work_editorial_letters(id) ON DELETE CASCADE,
  place_id       TEXT NOT NULL CHECK (length(place_id) BETWEEN 1 AND 200),
  decision       TEXT NOT NULL CHECK (decision IN ('intended', 'later', 'cleared')),
  decided_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS work_place_decision_events_letter_idx ON work_place_decision_events (member_id, letter_id, place_id, decided_at DESC);

-- Append-only: neither table may be rewritten.
CREATE OR REPLACE FUNCTION ws_letter_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END $$;
DROP TRIGGER IF EXISTS work_editorial_letters_no_update ON work_editorial_letters;
CREATE TRIGGER work_editorial_letters_no_update BEFORE UPDATE ON work_editorial_letters FOR EACH ROW EXECUTE FUNCTION ws_letter_append_only();
DROP TRIGGER IF EXISTS work_place_decision_events_no_update ON work_place_decision_events;
CREATE TRIGGER work_place_decision_events_no_update BEFORE UPDATE ON work_place_decision_events FOR EACH ROW EXECUTE FUNCTION ws_letter_append_only();

COMMIT;
