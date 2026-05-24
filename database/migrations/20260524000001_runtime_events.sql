-- Migration: runtime_events
-- Purpose:   Durable transport for the substrate monitor's per-turn observability.
-- Doctrine:  See memory/project_substrate_monitor_three_layer_architecture.md
--            (The monitor must not depend on the same kind of invisibility it is meant to detect.)
--
-- Replaces an in-memory ring buffer that proved unsharable across Next.js
-- route-handler module boundaries. One row per MAIA runtime turn. Read by
-- /api/admin/maia/substrate.
--
-- Sanctuary-safe: no message content; member_id_prefix is NULL for sanctuary
-- and anonymous turns; only structural runtime state is retained.

CREATE TABLE IF NOT EXISTS runtime_events (
  id                          BIGSERIAL PRIMARY KEY,
  built_at                    TIMESTAMPTZ NOT NULL,
  route_id                    TEXT        NOT NULL,
  route_known                 BOOLEAN     NOT NULL,
  registry_status             TEXT,        -- canonical-live / live-secondary / dormant / reference / NULL
  member_id_prefix            TEXT,        -- first 8 chars of userId; NULL when sanctuary or anonymous
  is_sanctuary                BOOLEAN     NOT NULL,
  provider                    TEXT        NOT NULL, -- 'anthropic' / 'local' / 'unknown'
  provider_model              TEXT,
  provider_configured         BOOLEAN     NOT NULL,
  provider_fallback_active    BOOLEAN     NOT NULL,
  prompt_block_chars          INTEGER     NOT NULL,
  prompt_block_layers         JSONB       NOT NULL, -- { memoryInfluence: bool, atoms: bool, ... }
  memory_continuity_confidence TEXT       NOT NULL, -- 'high' / 'medium' / 'low'
  memory_layers               JSONB       NOT NULL, -- { recentTurns: 'ok'|'empty'|'error', ...12 keys }
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_runtime_events_built_at ON runtime_events (built_at DESC);
CREATE INDEX IF NOT EXISTS idx_runtime_events_route_id ON runtime_events (route_id);

COMMENT ON TABLE runtime_events IS
  'Append-only per-turn runtime observability. Substrate monitor transport. Sanctuary-safe (no content).';
