-- SOURCE-CUSTODY-DB-01 / CANDIDATE ONLY — not applied to production or shared test.
-- The old application must be source-write fenced before this can be deployed.
-- A reservation must commit before ANY source bytes are written. Pending
-- reservations prevent an acknowledged Sanctuary transition, even on crash.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS workbench_source_custody_ops (
  operation_id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES auth_sessions(id) ON DELETE RESTRICT,
  arranger_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  upload_id UUID NOT NULL UNIQUE,
  state TEXT NOT NULL DEFAULT 'reserved'
    CHECK (state IN ('reserved', 'writing', 'recovering', 'committed', 'aborted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workbench_custody_pending_session
  ON workbench_source_custody_ops (session_id)
  WHERE state IN ('reserved', 'writing', 'recovering');

-- This database-side check protects against a future caller forgetting to
-- lock the session explicitly. It serializes reservations and transitions on
-- the same auth_sessions row, without trusting a browser-supplied posture.
CREATE OR REPLACE FUNCTION workbench_custody_require_ordinary_session()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  s RECORD;
BEGIN
  IF NEW.state <> 'reserved' THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='SOURCE_CUSTODY_STATE_REFUSED';
  END IF;
  SELECT member_id, source_persistence_posture, revoked, expires_at
    INTO s FROM auth_sessions WHERE id = NEW.session_id FOR UPDATE;
  IF NOT FOUND
     OR s.member_id IS DISTINCT FROM NEW.arranger_id
     OR s.revoked IS DISTINCT FROM FALSE
     OR s.expires_at <= clock_timestamp()
     OR s.source_persistence_posture IS DISTINCT FROM 'ordinary' THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='SOURCE_CUSTODY_RESERVATION_REFUSED';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_workbench_custody_reservation ON workbench_source_custody_ops;
CREATE TRIGGER trg_workbench_custody_reservation
  BEFORE INSERT ON workbench_source_custody_ops
  FOR EACH ROW EXECUTE FUNCTION workbench_custody_require_ordinary_session();

-- Immutable ownership and one-way state progression. In particular, an
-- abandoned or recovering write cannot be silently called committed.
CREATE OR REPLACE FUNCTION workbench_custody_check_transition()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.operation_id IS DISTINCT FROM OLD.operation_id
     OR NEW.session_id IS DISTINCT FROM OLD.session_id
     OR NEW.arranger_id IS DISTINCT FROM OLD.arranger_id
     OR NEW.upload_id IS DISTINCT FROM OLD.upload_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='SOURCE_CUSTODY_IMMUTABLE';
  END IF;
  IF NEW.state = OLD.state THEN
    RETURN NEW;
  END IF;
  IF NOT (
      (OLD.state = 'reserved' AND NEW.state IN ('writing', 'recovering', 'aborted'))
      OR (OLD.state = 'writing' AND NEW.state IN ('committed', 'recovering', 'aborted'))
      OR (OLD.state = 'recovering' AND NEW.state = 'aborted')
  ) THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='SOURCE_CUSTODY_BAD_TRANSITION';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_workbench_custody_transition ON workbench_source_custody_ops;
CREATE TRIGGER trg_workbench_custody_transition
  BEFORE UPDATE ON workbench_source_custody_ops
  FOR EACH ROW EXECUTE FUNCTION workbench_custody_check_transition();

-- The guard fires only on actual privacy-mode transitions. Existing sessions
-- with an unresolved reservation cannot acknowledge Sanctuary until a governed
-- recovery process proves and finishes cleanup. There is NO automatic TTL
-- sweep that could delete a writer's admitted original.
CREATE OR REPLACE FUNCTION workbench_custody_block_posture_transition()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.source_persistence_posture IS DISTINCT FROM OLD.source_persistence_posture
     AND EXISTS (
       SELECT 1 FROM workbench_source_custody_ops
       WHERE session_id = NEW.id
         AND state IN ('reserved', 'writing', 'recovering')
     ) THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='SOURCE_CUSTODY_PENDING';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_workbench_custody_block_posture ON auth_sessions;
CREATE TRIGGER trg_workbench_custody_block_posture
  BEFORE UPDATE OF source_persistence_posture ON auth_sessions
  FOR EACH ROW EXECUTE FUNCTION workbench_custody_block_posture_transition();
COMMIT;
