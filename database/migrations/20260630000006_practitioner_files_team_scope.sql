-- Practitioner Files: Co-Lab scope
--
-- Principle: a file uploaded inside a Co-Lab context belongs to that workspace.
-- Personal files remain practitioner-private and cross no Co-Lab boundary.
-- Kelly/Soullab files are never visible inside another practitioner's Co-Lab.
--
-- Scope containment model (mirrors memory atoms, migration 20260630000005):
--
--   personal   — owned by the practitioner; no Co-Lab boundary.
--                Default for all existing files.
--
--   colab      — created inside a specific Co-Lab workspace.
--                Only visible when the active team_id matches.
--
--   client     — attached to a specific client relationship.
--                Only visible when viewing that client's context in that Co-Lab.
--
--   encounter  — attached to a specific encounter.
--                Only visible within that encounter's review context.
--
-- Enforcement: GET route reads scope from active Co-Lab cookie; SQL WHERE
-- clauses never surface files outside their declared scope.
--
-- Migration is additive and non-destructive:
--   - All existing files default to file_scope = 'personal'.
--   - team_id / client_id / encounter_id are all nullable.
--   - practitioner_file_folders gains team_id for consistent folder scoping.

-- ── practitioner_files ────────────────────────────────────────────────────────

ALTER TABLE practitioner_files
  ADD COLUMN IF NOT EXISTS file_scope TEXT NOT NULL DEFAULT 'personal'
    CHECK (file_scope IN ('personal', 'colab', 'client', 'encounter'));

ALTER TABLE practitioner_files
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL;

ALTER TABLE practitioner_files
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES studio_people(id) ON DELETE SET NULL;

ALTER TABLE practitioner_files
  ADD COLUMN IF NOT EXISTS encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL;

-- Scope coherence: non-personal files must declare their Co-Lab.
ALTER TABLE practitioner_files DROP CONSTRAINT IF EXISTS file_scope_requires_team;
ALTER TABLE practitioner_files
  ADD CONSTRAINT file_scope_requires_team CHECK (
    file_scope = 'personal' OR team_id IS NOT NULL
  );

ALTER TABLE practitioner_files DROP CONSTRAINT IF EXISTS file_client_scope_requires_client;
ALTER TABLE practitioner_files
  ADD CONSTRAINT file_client_scope_requires_client CHECK (
    file_scope <> 'client' OR client_id IS NOT NULL
  );

ALTER TABLE practitioner_files DROP CONSTRAINT IF EXISTS file_encounter_scope_requires_encounter;
ALTER TABLE practitioner_files
  ADD CONSTRAINT file_encounter_scope_requires_encounter CHECK (
    file_scope <> 'encounter' OR encounter_id IS NOT NULL
  );

-- Indexes for the scoped read paths
CREATE INDEX IF NOT EXISTS idx_files_practitioner_personal
  ON practitioner_files(practitioner_id, file_scope, status)
  WHERE file_scope = 'personal';

CREATE INDEX IF NOT EXISTS idx_files_team_scope
  ON practitioner_files(team_id, file_scope, status)
  WHERE file_scope = 'colab';

CREATE INDEX IF NOT EXISTS idx_files_client_scope
  ON practitioner_files(client_id, file_scope)
  WHERE file_scope = 'client';

CREATE INDEX IF NOT EXISTS idx_files_encounter_scope
  ON practitioner_files(encounter_id, file_scope)
  WHERE file_scope = 'encounter';

COMMENT ON COLUMN practitioner_files.file_scope IS
  'Containment boundary: personal (default) | colab | client | encounter. '
  'Files never surface outside their declared scope.';
COMMENT ON COLUMN practitioner_files.team_id IS
  'Required for colab/client/encounter scope. The Co-Lab that holds this file.';

-- ── practitioner_file_folders ─────────────────────────────────────────────────
-- Folders follow the same scope as the files they contain.

ALTER TABLE practitioner_file_folders
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL;

ALTER TABLE practitioner_file_folders
  ADD COLUMN IF NOT EXISTS file_scope TEXT NOT NULL DEFAULT 'personal'
    CHECK (file_scope IN ('personal', 'colab', 'client', 'encounter'));

CREATE INDEX IF NOT EXISTS idx_folders_practitioner_scope
  ON practitioner_file_folders(practitioner_id, file_scope, team_id);

COMMENT ON COLUMN practitioner_file_folders.file_scope IS
  'Folder scope mirrors file scope. personal folders are practitioner-private.';
