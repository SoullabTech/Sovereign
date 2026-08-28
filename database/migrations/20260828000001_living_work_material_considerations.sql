-- Living Work material considerations — the member weighed a thing and did not
-- declare belonging (WS2-SUBSTRATE-01, Repair 2; founder-ruled 2026-08-28).
--
-- Design: docs/programmes/writers-studio-v2/WS2-SUBSTRATE-01-DESIGN.md
-- Packet: docs/programmes/writers-studio-v2/WS2-SUBSTRATE-01.md
--
-- WHY THIS IS A SEPARATE TABLE.
-- A living_work_materials row IS the declaration that a thing feeds a Work.
-- Putting `maybe` on that row would make the database say "this belongs, but
-- maybe" — which asserts belonging and doubt in one statement. So the four
-- truthful states of a material/Work pair live across two tables:
--
--   no declaration, no consideration        untouched · never considered
--   consideration, state = 'maybe'          considered, unresolved
--   consideration, state = 'not_now'        considered, declined or deferred
--   living_work_materials row exists        BELONGS
--
-- `belongs` is deliberately NOT a state in the enum below. Belonging is
-- represented by the declaration row's existence and nowhere else.
--
-- 'not_now' is a real answer, not an absence. A member who has considered a
-- material and set it aside has told the Studio something; that is different
-- from a material they have never looked at, and the difference must survive.
--
-- NO HISTORY. This table holds the member's CURRENT stance. maybe → not_now
-- updates the row and moves acted_by/acted_at to the latest act. The reference
-- pack promises the member's present relationship to a material, not a
-- chronology of every reconsideration, and an append-only relationship ledger
-- that nothing consumes would be a second ontology invented on the grounds
-- that timestamps happened to be available. If "how has my relationship to
-- this changed?" is ever asked, that is the trigger for a proper
-- relationship-event model — not a reason to smuggle one in here.
--
-- ROLLBACK:
--   DROP TRIGGER IF EXISTS living_work_materials_no_consideration ON living_work_materials;
--   DROP TRIGGER IF EXISTS living_work_material_considerations_no_declaration
--     ON living_work_material_considerations;
--   DROP FUNCTION IF EXISTS refuse_material_relationship_conflict();
--   DROP TABLE IF EXISTS living_work_material_considerations;

CREATE TABLE IF NOT EXISTS living_work_material_considerations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  living_work_id   UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,

  -- Mirrors living_work_materials' polymorphic pair EXACTLY, including its
  -- TEXT material_id. Diverging would create two addressing schemes for one
  -- material, and the guard below has to compare them.
  material_type    TEXT NOT NULL,
  material_id      TEXT NOT NULL,

  -- Two states, and neither asserts belonging.
  state            TEXT NOT NULL CHECK (state IN ('maybe', 'not_now')),

  -- The row is a member act; it cannot exist without saying who and when.
  -- Same grammar as living_work_expressions.declared_by, whose FK is real.
  -- (living_work_materials.declared_by is a bare UUID — a known independent
  -- integrity gap, recorded as LIVING-WORK-MATERIALS-ACTOR-FK-01 and NOT
  -- repaired here. No adjacent cleanup.)
  acted_by         UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  acted_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One current stance per pair.
  UNIQUE (living_work_id, material_type, material_id)
);

CREATE INDEX IF NOT EXISTS living_work_material_considerations_work_idx
  ON living_work_material_considerations (living_work_id, acted_at DESC);

COMMENT ON TABLE living_work_material_considerations IS
  'A member considered a material for a Living Work and did not declare that it belongs. Current stance only, never a history. ''belongs'' is not a state here — belonging is a living_work_materials row.';
COMMENT ON COLUMN living_work_material_considerations.state IS
  '''maybe'' = considered, unresolved. ''not_now'' = considered and declined or deferred, which is an answer rather than an absence. Never inferred; set only by a member gesture.';

-- ── Mutual exclusion, enforced in the database ──────────────────────────────
--
-- A cross-table CHECK is not expressible in PostgreSQL, so the invariant is a
-- pair of triggers over a pair-scoped lock. They REFUSE; they never silently
-- clear the counterpart.
--
-- That is the point. A trigger that quietly deleted the consideration when a
-- declaration arrived would make the transition a hidden side effect, and the
-- member's act would stop being visible in the code that performs it. The
-- routes do the transition explicitly and transactionally (DELETE one, INSERT
-- the other, one transaction); these triggers exist so that a FUTURE writer
-- that forgets cannot create contradictory state.
-- ── WHY A LOCK, AND WHY IT LIVES IN THE TRIGGER ─────────────────────────────
--
-- Checking the counterpart is not enough on its own. Under READ COMMITTED two
-- transitions that start with neither row present each see an empty
-- counterpart and both commit:
--
--   T1 POST consideration            T2 POST belongs
--   DELETE materials    → none       DELETE considerations → none
--   trigger reads materials → none   trigger reads considerations → none
--   INSERT consideration             INSERT declaration
--   COMMIT                           COMMIT        → Belongs AND Maybe
--
-- The route transactions make each transition atomic; they do not serialize
-- two competing transitions. So the pair is locked BEFORE the counterpart is
-- read, and the lock is transaction-scoped — released at COMMIT or ROLLBACK,
-- never leaked.
--
-- The lock is taken here rather than in the two routes on purpose. In a route
-- it would protect today's callers and leave the "a future writer cannot
-- create contradictory state" guarantee false, which is the whole reason these
-- triggers exist.
--
-- The key is the PAIR, not the Work: locking the Work would serialize every
-- material in it against every other. A hashtext collision serializes two
-- unrelated pairs — slower, never wrong.
CREATE OR REPLACE FUNCTION refuse_material_relationship_conflict()
RETURNS TRIGGER AS $$
DECLARE
  counterpart INTEGER;
BEGIN
  -- FIRST, and identically in both branches: whichever table fired, the same
  -- pair yields the same two keys, so a consideration and a declaration for
  -- one material contend for one lock.
  PERFORM pg_advisory_xact_lock(
    hashtext(NEW.living_work_id::text),
    hashtext(NEW.material_type || ':' || NEW.material_id)
  );

  IF TG_TABLE_NAME = 'living_work_material_considerations' THEN
    SELECT count(*) INTO counterpart
      FROM living_work_materials
     WHERE living_work_id = NEW.living_work_id
       AND material_type  = NEW.material_type
       AND material_id    = NEW.material_id;
    IF counterpart > 0 THEN
      RAISE EXCEPTION
        'material_relationship_conflict: this material already belongs to that '
        'work. Withdraw the belonging in the same transaction before recording '
        'a consideration.'
        USING ERRCODE = 'restrict_violation';
    END IF;
  ELSE
    SELECT count(*) INTO counterpart
      FROM living_work_material_considerations
     WHERE living_work_id = NEW.living_work_id
       AND material_type  = NEW.material_type
       AND material_id    = NEW.material_id;
    IF counterpart > 0 THEN
      RAISE EXCEPTION
        'material_relationship_conflict: this material is under consideration '
        'for that work. Remove the consideration in the same transaction '
        'before declaring belonging.'
        USING ERRCODE = 'restrict_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS living_work_material_considerations_no_declaration
--     ON living_work_material_considerations;
--   DROP FUNCTION IF EXISTS refuse_material_relationship_conflict();
--   DROP TABLE IF EXISTS living_work_material_considerations;

CREATE TABLE IF NOT EXISTS living_work_material_considerations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  living_work_id   UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,

  -- Mirrors living_work_materials' polymorphic pair EXACTLY, including its
  -- TEXT material_id. Diverging would create two addressing schemes for one
  -- material, and the guard below has to compare them.
  material_type    TEXT NOT NULL,
  material_id      TEXT NOT NULL,

  -- Two states, and neither asserts belonging.
  state            TEXT NOT NULL CHECK (state IN ('maybe', 'not_now')),

  -- The row is a member act; it cannot exist without saying who and when.
  -- Same grammar as living_work_expressions.declared_by, whose FK is real.
  -- (living_work_materials.declared_by is a bare UUID — a known independent
  -- integrity gap, recorded as LIVING-WORK-MATERIALS-ACTOR-FK-01 and NOT
  -- repaired here. No adjacent cleanup.)
  acted_by         UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  acted_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One current stance per pair.
  UNIQUE (living_work_id, material_type, material_id)
);

CREATE INDEX IF NOT EXISTS living_work_material_considerations_work_idx
  ON living_work_material_considerations (living_work_id, acted_at DESC);

COMMENT ON TABLE living_work_material_considerations IS
  'A member considered a material for a Living Work and did not declare that it belongs. Current stance only, never a history. ''belongs'' is not a state here — belonging is a living_work_materials row.';
COMMENT ON COLUMN living_work_material_considerations.state IS
  '''maybe'' = considered, unresolved. ''not_now'' = considered and declined or deferred, which is an answer rather than an absence. Never inferred; set only by a member gesture.';

-- ── Mutual exclusion, enforced in the database ──────────────────────────────
--
-- A cross-table CHECK is not expressible in PostgreSQL, so the invariant is a
-- pair of triggers over a pair-scoped lock. They REFUSE; they never silently
-- clear the counterpart.
--
-- That is the point. A trigger that quietly deleted the consideration when a
-- declaration arrived would make the transition a hidden side effect, and the
-- member's act would stop being visible in the code that performs it. The
-- routes do the transition explicitly and transactionally (DELETE one, INSERT
-- the other, one transaction); these triggers exist so that a FUTURE writer
-- that forgets cannot create contradictory state.
CREATE OR REPLACE FUNCTION refuse_material_relationship_conflict()
RETURNS TRIGGER AS $$
DECLARE
  counterpart INTEGER;
BEGIN
  IF TG_TABLE_NAME = 'living_work_material_considerations' THEN
    SELECT count(*) INTO counterpart
      FROM living_work_materials
     WHERE living_work_id = NEW.living_work_id
       AND material_type  = NEW.material_type
       AND material_id    = NEW.material_id;
    IF counterpart > 0 THEN
      RAISE EXCEPTION
        'material_relationship_conflict: this material already belongs to that '
        'work. Withdraw the belonging in the same transaction before recording '
        'a consideration.'
        USING ERRCODE = 'restrict_violation';
    END IF;
  ELSE
    SELECT count(*) INTO counterpart
      FROM living_work_material_considerations
     WHERE living_work_id = NEW.living_work_id
       AND material_type  = NEW.material_type
       AND material_id    = NEW.material_id;
    IF counterpart > 0 THEN
      RAISE EXCEPTION
        'material_relationship_conflict: this material is under consideration '
        'for that work. Remove the consideration in the same transaction '
        'before declaring belonging.'
        USING ERRCODE = 'restrict_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS living_work_material_considerations_no_declaration
  ON living_work_material_considerations;
CREATE TRIGGER living_work_material_considerations_no_declaration
  BEFORE INSERT OR UPDATE ON living_work_material_considerations
  FOR EACH ROW EXECUTE FUNCTION refuse_material_relationship_conflict();

DROP TRIGGER IF EXISTS living_work_materials_no_consideration
  ON living_work_materials;
CREATE TRIGGER living_work_materials_no_consideration
  BEFORE INSERT OR UPDATE ON living_work_materials
  FOR EACH ROW EXECUTE FUNCTION refuse_material_relationship_conflict();
