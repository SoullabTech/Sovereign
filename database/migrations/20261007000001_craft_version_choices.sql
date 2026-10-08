-- Explicit Save binds settled editorial choices to one immutable writer version.
-- No manuscript, model, or historical version is changed or backfilled.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
CREATE TABLE IF NOT EXISTS writer_craft_version_choices (
  version_id uuid PRIMARY KEY REFERENCES proposal_versions(id) ON DELETE CASCADE,
  schema_version integer NOT NULL DEFAULT 1 CHECK (schema_version = 1),
  kept jsonb NOT NULL CHECK (jsonb_typeof(kept) = 'array'),
  saved_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE writer_craft_version_choices IS
  'Writer-explicit settled choices saved atomically with a member proposal version; ownership derived through version/chain. No implicit Apply.';
COMMIT;
