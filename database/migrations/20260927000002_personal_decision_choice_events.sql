-- DECISIONS-UX-08 — member-authored Personal Decision resolution substrate.
--
-- A Personal Decision is not resolved merely because a council finished or a
-- status flag changed. The member's actual choice is a distinct authored act.
--
-- This table is append-only history for that act:
--   choice_recorded -> reopened -> choice_recorded ...
--
-- studio_decisions.status remains a compatibility mirror for existing queries.
-- No existing rows are backfilled: legacy complete Personal Decisions remain
-- truthfully "complete without recorded choice" until the member acts.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'studio_decisions_id_personal_member_key'
       AND conrelid = 'studio_decisions'::regclass
  ) THEN
    ALTER TABLE studio_decisions
      ADD CONSTRAINT studio_decisions_id_personal_member_key
      UNIQUE (id, personal_member_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS personal_decision_choice_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL,
  member_id UUID NOT NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('choice_recorded', 'reopened')),
  choice_text TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_order BIGINT GENERATED ALWAYS AS IDENTITY,

  CONSTRAINT personal_decision_choice_event_shape CHECK (
    (event_type = 'choice_recorded'
      AND choice_text IS NOT NULL
      AND btrim(choice_text) <> '')
    OR
    (event_type = 'reopened' AND choice_text IS NULL)
  ),

  CONSTRAINT personal_decision_choice_owner_fk
    FOREIGN KEY (decision_id, member_id)
    REFERENCES studio_decisions(id, personal_member_id)
    ON DELETE CASCADE
);

ALTER TABLE personal_decision_choice_events
  ADD COLUMN IF NOT EXISTS event_order BIGINT GENERATED ALWAYS AS IDENTITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_personal_decision_choice_events_order
  ON personal_decision_choice_events(event_order);

DROP INDEX IF EXISTS idx_personal_decision_choice_events_decision;
CREATE INDEX idx_personal_decision_choice_events_decision
  ON personal_decision_choice_events(decision_id, event_order ASC);

CREATE INDEX IF NOT EXISTS idx_personal_decision_choice_events_member
  ON personal_decision_choice_events(member_id, recorded_at DESC);

COMMENT ON TABLE personal_decision_choice_events IS
  'Append-only member-authored resolution history for Personal Decisions. Council output never populates this table.';

COMMENT ON COLUMN personal_decision_choice_events.choice_text IS
  'Exact member-authored choice for choice_recorded events. NULL for reopened events.';

COMMENT ON COLUMN personal_decision_choice_events.recorded_at IS
  'When Soullab recorded the member act; not a claim about when the choice was made in life.';

COMMENT ON COLUMN personal_decision_choice_events.event_order IS
  'Database-assigned append order used only to preserve exact event chronology when timestamps collide.';

COMMIT;
