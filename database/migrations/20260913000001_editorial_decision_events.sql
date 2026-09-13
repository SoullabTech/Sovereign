-- EDITORIAL-DECISION-01 — what the writer decides about the WORK.
--
--   Standing records what you decide about an observation.
--   Editorial decisions record what you decide about the Work.
--
-- A SIBLING CHAIN, NOT A WIDER STANDING TABLE. An editorial decision can govern
-- several observations, which need not share sections, so it cannot belong to
-- one observation's event spine. `developmental_observation_standing_events`
-- is unchanged by this migration.
--
-- ⭐ SCOPE IS PART OF THE EVENT. The governed set is the meaning of the ruling
-- at that moment. Moving {o1} to {o1, o4} is not "editing an edge"; it is a new
-- member-authored state of the decision, so it is a SUCCESSOR EVENT that
-- restates the whole set. Scope therefore inherits supersession, and no edge
-- retraction lifecycle has to be invented.
--
-- ⛔ THE COUPLING LAW: recording a decision writes NO standing, and a standing
-- implies no decision. Neither is ever inferred from the other.

BEGIN;

CREATE TABLE IF NOT EXISTS editorial_decision_events (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The DECISION's identity, stable across every revision of it.
  -- ⛔ MINTED BY THE SERVER for a new chain. The member authors the decision;
  -- the server mints its record identity. A client that could manufacture a
  -- stable identity could also collide with one.
  decision_chain_id     uuid NOT NULL,
  -- ⭐ Successor-carried time. current = MAX(event_index). No superseded_by:
  -- a derived fact stored is a fact that can disagree with its own source.
  event_index           integer NOT NULL CHECK (event_index >= 0),

  member_id             uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  work_id               uuid NOT NULL,

  -- ⭐ D2 · THE BODY. Small and non-executable.
  statement             text NOT NULL CHECK (length(btrim(statement)) > 0),
  intent                text,
  principle             text,

  -- Which state of the Work the ruling was made against. Provenance, never a
  -- snapshot of the prose.
  working_draft_id      uuid,
  working_draft_version integer,

  -- ⛔ AUTHORITY IS MEMBER IN BOTH CASES. MAIA may draft the wording; nothing
  -- exists as an editorial decision until the member records it.
  authorship            text NOT NULL CHECK (
                          authorship IN ('member_authored',
                                         'member_confirmed_maia_proposal')),

  recorded_at           timestamptz NOT NULL DEFAULT now(),

  UNIQUE (decision_chain_id, event_index),
  CONSTRAINT ede_draft_pair CHECK (
    (working_draft_id IS NULL) = (working_draft_version IS NULL))
);

CREATE INDEX IF NOT EXISTS idx_ede_current
  ON editorial_decision_events (decision_chain_id, event_index DESC);
CREATE INDEX IF NOT EXISTS idx_ede_work
  ON editorial_decision_events (member_id, work_id);

-- ⭐ THE `governs` RELATION — explicit, never inferred from shared sections.
--
-- ⛔ `relation` is a ONE-VALUE CHECK on purpose. `refines`, `depends_on` and the
-- rest are not invented now; they are added when real manuscript work
-- demonstrates the need. A one-value CHECK is a door somebody has to open
-- deliberately; an enum with room is an ontology invented before its evidence.
CREATE TABLE IF NOT EXISTS editorial_decision_event_observations (
  decision_chain_id uuid NOT NULL,
  event_index       integer NOT NULL,

  -- ⛔ RESTRICT, NOT CASCADE — founder ruling D3, 2026-09-13.
  -- Under CASCADE an ordinary reading deletion would silently remove historical
  -- scope, and event 1 would afterwards appear to have governed less than the
  -- member said it governed. That is rewriting member authority without a
  -- successor. A constitutional erasure purge is a SEPARATE authority and must
  -- not masquerade as editorial succession.
  reading_id        uuid NOT NULL REFERENCES developmental_readings(id) ON DELETE RESTRICT,
  observation_key   text NOT NULL CHECK (length(observation_key) > 0),
  relation          text NOT NULL DEFAULT 'governs' CHECK (relation = 'governs'),

  PRIMARY KEY (decision_chain_id, event_index, reading_id, observation_key),
  FOREIGN KEY (decision_chain_id, event_index)
    REFERENCES editorial_decision_events (decision_chain_id, event_index)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_edeo_observation
  ON editorial_decision_event_observations (reading_id, observation_key);

-- ⭐⭐ APPEND-ONLY, ENFORCED ON BOTH TABLES — founder ruling D3.
--
-- The design said the governed set "is immutable with the event", but only the
-- parent carried a trigger, so the database still permitted:
--
--   event 1 governs {o1, o4}  →  DELETE the o4 row  →  event 1 now reads {o1}
--
-- ⛔ That rewrites member authority with no successor and no trace. THIS TRIGGER
-- IS WHAT MAKES THE SCOPE-ON-EVENT RULING TRUE. Without it the ruling is a
-- comment.
CREATE OR REPLACE FUNCTION editorial_decision_append_only() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'editorial decisions are append-only: a changed ruling or a changed scope is a SUCCESSOR EVENT restating the whole governed set, never an edit to what was already recorded (table %)', TG_TABLE_NAME
    USING ERRCODE = 'restrict_violation';
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ede_append_only_trg ON editorial_decision_events;
CREATE TRIGGER ede_append_only_trg
  BEFORE UPDATE OR DELETE ON editorial_decision_events
  FOR EACH ROW EXECUTE FUNCTION editorial_decision_append_only();

DROP TRIGGER IF EXISTS edeo_append_only_trg ON editorial_decision_event_observations;
CREATE TRIGGER edeo_append_only_trg
  BEFORE UPDATE OR DELETE ON editorial_decision_event_observations
  FOR EACH ROW EXECUTE FUNCTION editorial_decision_append_only();

COMMIT;
