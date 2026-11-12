-- WS-RELATIONAL-ARCHITECTURE step 4 repair — erasure must not be blocked by the append-only run log.
--
-- Defect (found 2026-11-11 while drafting the deploy's migration review): 20261111000002 declares
-- editorial_pass_run_events.letter_id REFERENCES work_editorial_letters(id) ON DELETE SET NULL, and the same table's
-- BEFORE UPDATE trigger (ws_pass_run_append_only) refuses every UPDATE — including the UPDATE ... SET letter_id = NULL
-- that PostgreSQL issues for that foreign key. Once a pass had recorded its letter, deleting the letter, the manuscript
-- (erasure) or the member's account failed with "editorial_pass_run_events is append-only".
--
-- Repair: the events table gets its own trigger function. It admits exactly one UPDATE — the foreign key's own action:
-- issued from within another trigger (pg_trigger_depth() > 1), letter_id going from a value to NULL, and every other
-- column unchanged. Every other UPDATE is still refused. editorial_pass_runs keeps ws_pass_run_append_only unchanged.
--
-- ⛔ Merging this file is latent schema-deploy authorization (2026-09-07 finding). Additive: no table, column or row changes.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE OR REPLACE FUNCTION ws_pass_run_event_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF pg_trigger_depth() > 1
     AND OLD.letter_id IS NOT NULL
     AND NEW.letter_id IS NULL
     AND (to_jsonb(NEW) - 'letter_id') = (to_jsonb(OLD) - 'letter_id') THEN
    RETURN NEW; -- the ON DELETE SET NULL action of letter_id, and nothing else
  END IF;
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END $$;

DROP TRIGGER IF EXISTS editorial_pass_run_events_no_update ON editorial_pass_run_events;
CREATE TRIGGER editorial_pass_run_events_no_update BEFORE UPDATE ON editorial_pass_run_events
  FOR EACH ROW EXECUTE FUNCTION ws_pass_run_event_append_only();

COMMIT;
