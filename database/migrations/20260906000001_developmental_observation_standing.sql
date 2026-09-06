-- WS2-07 · BUILD-07F — DEVELOPMENTAL DECISIONS · the standing event stream.
--
-- Design of record: docs/programme/WS2-07-BUILD-07F_DESIGN_2026-09-05.md
-- (accepted 2026-09-05, canonical). Adjudication: WS2-07-BUILD-07F_ADJUDICATION.
-- This migration implements that design; it does not extend it.
--
-- WHAT THIS IS. A writer's standing toward one frozen developmental observation,
-- stored as APPEND-ONLY EVENTS with "current" derived. Both shapes considered
-- could be made transactional; only this one stores the fact once. A current row
-- plus a history table stores it twice and creates a permanent synchronisation
-- invariant every future writer must honour.
--
--   D3 (history immutable) and D7 (exactly one current) stop being two
--   invariants that must be kept in agreement and become consequences of one
--   representation.
--
-- WHAT IS ABSENT BY CONSTRUCTION, each for a reason:
--   unset value            UNSET is ZERO EVENTS. A value would make it writable.
--   default standing       there is no default; the governed default is NO ROW.
--   NULL-standing event    absence is not a value.
--   investigate            a different axis (adjudication Q4), not a standing.
--   is_current flag        derivable state that can drift from the stream.
--   cleared_at             clearing is not an operation.
--   successor observation  standing never transfers.
--   actor column           there is no system actor to record. NOTE: an absent
--                          column makes a system write UNSAYABLE, not
--                          UNWRITABLE — D6's guarantee is the module graph, not
--                          this schema. Stated so the omission is not misread
--                          as evidence.

BEGIN;

CREATE TABLE IF NOT EXISTS developmental_observation_standing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- OWNERSHIP. Physically present although redundant under today's
  -- single-member Work model: deriving the standing owner from the reading
  -- owner would make correctness depend on a fact Co-Lab may change, and the
  -- day any sharing reaches a Work one person's dismissal would read as
  -- another's. RESTRICT follows ask_threads: a member is not deleted out from
  -- under their own record.
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- THE ADDRESS, normalised — never a generic anchor jsonb. This makes the
  -- 05B `concern` anchor and every other Ask shape literally unrepresentable
  -- here rather than merely unexpected.
  --
  -- CASCADE is the deletion ruling's second side: standing history is immutable
  -- WHILE THE WORK EXISTS, and deleting the Work deletes the history with it.
  -- Readings already cascade from member_manuscripts, so the path is
  --   manuscript → reading → standing events.
  reading_id uuid NOT NULL REFERENCES developmental_readings(id) ON DELETE CASCADE,

  -- `observation_key` CANNOT be foreign-keyed: observations live inside the
  -- reading's jsonb and there is no row to reference. The write boundary — not
  -- a constraint — must establish that this key resolves in this frozen
  -- reading. No weaker pattern check is added here, because a second, weaker
  -- guard beside the real one invites false confidence in it.
  observation_key text NOT NULL CHECK (length(observation_key) > 0),

  -- Monotonic within the identity triple. Allocated INSIDE the insert
  -- statement, never read-then-written; the UNIQUE below refuses the loser of
  -- a race rather than letting one act overwrite another.
  event_index integer NOT NULL CHECK (event_index >= 0),

  -- Three values, mutually exclusive. `investigate` is a DIFFERENT AXIS and is
  -- not a standing: keep-and-investigate, dismiss-and-investigate and
  -- unresolved-and-investigate are all coherent, so an enum containing it would
  -- make mutually compatible states falsely exclusive.
  standing text NOT NULL CHECK (standing IN ('keep', 'dismiss', 'unresolved')),

  -- Server-stamped. Never accepted from a caller.
  recorded_at timestamptz NOT NULL DEFAULT now(),

  -- D7. Exactly one greatest event_index per identity is possible, so "current"
  -- is a projection that cannot be ambiguous. This is also the SIMULTANEITY
  -- guard: two writers computing the same next index cannot both be accepted.
  UNIQUE (member_id, reading_id, observation_key, event_index)
);

-- The projection query: newest event for one identity.
CREATE INDEX IF NOT EXISTS idx_dose_current
  ON developmental_observation_standing_events
     (member_id, reading_id, observation_key, event_index DESC);

-- D3, first half — a recorded act is never rewritten.
CREATE OR REPLACE FUNCTION dose_no_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'standing event % is immutable: a standing is changed by appending a later event, never by rewriting an earlier one',
    OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dose_no_update_check ON developmental_observation_standing_events;
CREATE TRIGGER dose_no_update_check
  BEFORE UPDATE ON developmental_observation_standing_events
  FOR EACH ROW EXECUTE FUNCTION dose_no_update();

-- D3, second half — and the harder one.
--
-- The ruling has TWO sides and both must be PROVED, not one proved and the
-- other left to the absence of a route:
--
--   per-event erasure   refused while the Work exists
--   whole-Work cascade  still permitted
--
-- Absence of an HTTP DELETE route does not satisfy D3. UPDATE refusal here is
-- enforced at the row; single-event deletion is held to the same standard.
--
-- HOW THE TWO CASES ARE TOLD APART. PostgreSQL's ON DELETE CASCADE removes the
-- parent row first and then the referencing children, so inside this BEFORE
-- DELETE trigger the parent reading is ALREADY GONE during a cascade and still
-- present during a direct delete. That difference is the discriminator, and it
-- was established empirically against a live cluster before this trigger was
-- written — not assumed from the documentation.
CREATE OR REPLACE FUNCTION dose_no_single_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM developmental_readings WHERE id = OLD.reading_id) THEN
    RAISE EXCEPTION
      'standing event % cannot be deleted while its Work exists: a standing is withdrawn by taking another standing, and history is not erased piecemeal',
      OLD.id;
  END IF;
  -- The reading is gone: a cascade from the member's own deletion of the Work.
  -- That is the member's sovereign act, not a rewrite of their history.
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dose_no_single_delete_check ON developmental_observation_standing_events;
CREATE TRIGGER dose_no_single_delete_check
  BEFORE DELETE ON developmental_observation_standing_events
  FOR EACH ROW EXECUTE FUNCTION dose_no_single_delete();

COMMENT ON TABLE developmental_observation_standing_events IS
  'BUILD-07F. Append-only stream of a member''s standing toward one frozen developmental observation. Current standing = greatest event_index per (member_id, reading_id, observation_key). UNSET = zero events. Never updated; never deleted individually while the Work exists; cascades away with the Work.';

COMMIT;

-- ROLLBACK (manual, EMPTY TABLE ONLY):
--   If the stream has ever received an event, leave it inert: a standing is a
--   member's recorded act, and dropping the table would erase acts the member
--   took. A destructive DROP is not promised as rollback.
--
--   DROP TRIGGER IF EXISTS dose_no_single_delete_check ON developmental_observation_standing_events;
--   DROP TRIGGER IF EXISTS dose_no_update_check ON developmental_observation_standing_events;
--   DROP FUNCTION IF EXISTS dose_no_single_delete();
--   DROP FUNCTION IF EXISTS dose_no_update();
--   DROP TABLE IF EXISTS developmental_observation_standing_events;
