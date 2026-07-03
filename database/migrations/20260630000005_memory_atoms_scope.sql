-- Memory Atoms: Scope fields
--
-- Principle: memory continuity must never become memory leakage.
--
-- Every atom now carries an explicit scope that determines which context
-- may surface it. The four scopes form a strict containment hierarchy:
--
--   personal   — belongs to the member's own inner life; no Co-Lab boundary.
--                Default for all existing atoms. MAIA's personal-mode context.
--
--   colab      — created in the context of a specific Co-Lab workspace.
--                Surfaces only when the active Co-Lab matches team_id.
--
--   client     — created in the context of a specific practitioner↔client
--                relationship. Surfaces only when viewing that client.
--                team_id records which Co-Lab holds the relationship.
--
--   encounter  — attached to a specific encounter/session. Surfaces only
--                within that encounter's review context.
--                team_id records the Co-Lab; encounter_id records the event.
--
-- Enforcement: the loader enforces these boundaries in SQL WHERE clauses.
-- Client scope is never accessible from another client's context.
-- Co-Lab scope is never accessible across Co-Lab boundaries.
-- The crossing_must_be_false constraint remains in force.
--
-- Migration is additive and non-destructive:
--   - All existing atoms default to memory_scope = 'personal'.
--   - team_id, client_id, encounter_id are all nullable (NULL for personal).
--   - No existing atoms are modified beyond adding scope = 'personal'.

-- ── Step 1: add columns ────────────────────────────────────────────────────

ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS memory_scope TEXT NOT NULL DEFAULT 'personal'
    CHECK (memory_scope IN ('personal', 'colab', 'client', 'encounter'));

ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL;

ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES studio_people(id) ON DELETE SET NULL;

ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL;

-- ── Step 2: scope coherence constraints ───────────────────────────────────

-- Non-personal atoms must declare their Co-Lab.
ALTER TABLE member_memory_atoms DROP CONSTRAINT IF EXISTS atom_scope_requires_team;
ALTER TABLE member_memory_atoms
  ADD CONSTRAINT atom_scope_requires_team CHECK (
    memory_scope = 'personal' OR team_id IS NOT NULL
  );

-- Client-scope atoms must name the client relationship.
ALTER TABLE member_memory_atoms DROP CONSTRAINT IF EXISTS atom_client_scope_requires_client;
ALTER TABLE member_memory_atoms
  ADD CONSTRAINT atom_client_scope_requires_client CHECK (
    memory_scope <> 'client' OR client_id IS NOT NULL
  );

-- Encounter-scope atoms must name the encounter.
ALTER TABLE member_memory_atoms DROP CONSTRAINT IF EXISTS atom_encounter_scope_requires_encounter;
ALTER TABLE member_memory_atoms
  ADD CONSTRAINT atom_encounter_scope_requires_encounter CHECK (
    memory_scope <> 'encounter' OR encounter_id IS NOT NULL
  );

-- ── Step 3: indexes for the scoped read paths ─────────────────────────────

-- Personal context (MAIA personal mode — most frequent path)
CREATE INDEX IF NOT EXISTS idx_atoms_member_personal
  ON member_memory_atoms(member_id, memory_scope, status, last_touched_at DESC)
  WHERE memory_scope = 'personal';

-- Co-Lab context
CREATE INDEX IF NOT EXISTS idx_atoms_team_scope
  ON member_memory_atoms(team_id, memory_scope, status)
  WHERE memory_scope = 'colab';

-- Client context
CREATE INDEX IF NOT EXISTS idx_atoms_client_scope
  ON member_memory_atoms(client_id, memory_scope)
  WHERE memory_scope = 'client';

-- Encounter context
CREATE INDEX IF NOT EXISTS idx_atoms_encounter_scope
  ON member_memory_atoms(encounter_id, memory_scope)
  WHERE memory_scope = 'encounter';

COMMENT ON COLUMN member_memory_atoms.memory_scope IS
  'Containment boundary: personal (default) | colab | client | encounter. '
  'The loader enforces this in SQL — atoms never surface outside their scope.';
COMMENT ON COLUMN member_memory_atoms.team_id IS
  'Required for colab/client/encounter scope. The Co-Lab that holds this atom.';
COMMENT ON COLUMN member_memory_atoms.client_id IS
  'Required for client scope. The studio_people record for this relationship.';
COMMENT ON COLUMN member_memory_atoms.encounter_id IS
  'Required for encounter scope. The encounter this atom is attached to.';
