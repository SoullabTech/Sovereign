-- Integrity trigger for practice_insights cross-table sessions
-- Ensures session_id exists in either practice_sessions OR supervision_sessions

CREATE OR REPLACE FUNCTION enforce_practice_insights_session_exists()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM practice_sessions WHERE id = NEW.session_id)
     OR EXISTS (SELECT 1 FROM supervision_sessions WHERE id = NEW.session_id)
  THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'practice_insights.session_id % not found in practice_sessions or supervision_sessions', NEW.session_id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_practice_insights_session_exists ON practice_insights;

CREATE TRIGGER trg_practice_insights_session_exists
BEFORE INSERT OR UPDATE OF session_id ON practice_insights
FOR EACH ROW EXECUTE FUNCTION enforce_practice_insights_session_exists();

-- Helper function to clean orphaned insights (call during retention purge)
CREATE OR REPLACE FUNCTION cleanup_orphaned_practice_insights()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM practice_insights pi
  WHERE NOT EXISTS (SELECT 1 FROM practice_sessions ps WHERE ps.id = pi.session_id)
    AND NOT EXISTS (SELECT 1 FROM supervision_sessions ss WHERE ss.id = pi.session_id);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_orphaned_practice_insights() IS 'Call after purging old sessions to remove orphaned insights';
