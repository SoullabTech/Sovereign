-- ─── Studio Protocol Assignments ──────────────────────────────────
--
-- Persists the practitioner's active protocol selection and stage position
-- across page reloads and sessions.
--
-- A protocol assignment has a scope — one of: client, decision, or change.
-- Exactly one assignment may be active per practitioner per scope.
-- Switching protocol replaces the existing assignment (no history yet).
--
-- Scope priority in lookups (most specific wins):
--   change_id → decision_id → client_id (with no decision/change)
--
-- stage advancement is intentionally manual. The practitioner decides when
-- a stage is complete — the system tracks, but does not auto-advance.
--
-- Applied: 2026-03-13

CREATE TABLE IF NOT EXISTS studio_protocol_assignments (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id     UUID        NOT NULL,
  client_id           UUID        REFERENCES practitioner_clients(id) ON DELETE SET NULL,
  decision_id         UUID        REFERENCES studio_decisions(id)     ON DELETE CASCADE,
  change_id           UUID        REFERENCES studio_changes(id)       ON DELETE CASCADE,
  protocol_id         TEXT        NOT NULL,
  active_stage_number INT         NOT NULL DEFAULT 1,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_occupancy    INT,
  status              TEXT        NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active', 'paused', 'complete', 'abandoned')),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Scope uniqueness ────────────────────────────────────────────────────────
-- One active assignment per scope. Switching protocol replaces the row.

-- Client-level scope (no decision or change attached)
CREATE UNIQUE INDEX spa_client_scope_uidx
  ON studio_protocol_assignments (practitioner_id, client_id)
  WHERE client_id IS NOT NULL
    AND decision_id IS NULL
    AND change_id IS NULL;

-- Decision-level scope (no change attached)
CREATE UNIQUE INDEX spa_decision_scope_uidx
  ON studio_protocol_assignments (practitioner_id, decision_id)
  WHERE decision_id IS NOT NULL
    AND change_id IS NULL;

-- Change-level scope (most specific)
CREATE UNIQUE INDEX spa_change_scope_uidx
  ON studio_protocol_assignments (practitioner_id, change_id)
  WHERE change_id IS NOT NULL;

-- ─── Supporting indexes ──────────────────────────────────────────────────────
CREATE INDEX spa_practitioner_idx    ON studio_protocol_assignments (practitioner_id);
CREATE INDEX spa_client_idx          ON studio_protocol_assignments (client_id) WHERE client_id IS NOT NULL;
CREATE INDEX spa_decision_idx        ON studio_protocol_assignments (decision_id) WHERE decision_id IS NOT NULL;
CREATE INDEX spa_change_idx          ON studio_protocol_assignments (change_id) WHERE change_id IS NOT NULL;
CREATE INDEX spa_status_idx          ON studio_protocol_assignments (status);
