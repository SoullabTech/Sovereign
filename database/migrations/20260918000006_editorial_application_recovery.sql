-- Exact section snapshots for explicit, single-use reversal of new applications.
-- Existing applications have no invented recovery snapshot.
BEGIN;
CREATE TABLE IF NOT EXISTS manuscript_application_recovery (
  authorization_id uuid PRIMARY KEY REFERENCES manuscript_revision_authorizations(id) ON DELETE RESTRICT,
  before_body text NOT NULL,
  after_body text NOT NULL,
  undone_at timestamptz,
  resulting_version integer,
  CHECK ((undone_at IS NULL) = (resulting_version IS NULL))
);

CREATE OR REPLACE FUNCTION protect_application_recovery() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'application recovery is historical'; END IF;
  IF NEW.authorization_id IS DISTINCT FROM OLD.authorization_id
    OR NEW.before_body IS DISTINCT FROM OLD.before_body
    OR NEW.after_body IS DISTINCT FROM OLD.after_body
    OR OLD.undone_at IS NOT NULL
    OR NEW.undone_at IS NULL OR NEW.resulting_version IS NULL THEN
    RAISE EXCEPTION 'only one complete undo receipt may be added';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER application_recovery_immutable BEFORE UPDATE OR DELETE ON manuscript_application_recovery
FOR EACH ROW EXECUTE FUNCTION protect_application_recovery();

COMMIT;
-- Rollback after disabling recovery: DROP TABLE manuscript_application_recovery; DROP FUNCTION protect_application_recovery();
