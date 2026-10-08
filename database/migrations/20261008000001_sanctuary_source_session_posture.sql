-- Proposed, NOT APPLIED. Legacy sessions fail closed until explicitly initialized.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE auth_sessions
  ADD COLUMN IF NOT EXISTS source_persistence_posture text NOT NULL DEFAULT 'unresolved'
    CHECK (source_persistence_posture IN ('unresolved','sanctuary','ordinary'));
ALTER TABLE auth_sessions
  ADD COLUMN IF NOT EXISTS source_persistence_revision bigint NOT NULL DEFAULT 0
    CHECK (source_persistence_revision >= 0);
COMMIT;
