-- Migration: Bardic Links - generic relationship graph
-- Created: 2025-12-30
-- Purpose: Generic edge model for bardic entities (episodes, cues, embeddings, artifacts)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS bardic_links (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL,              -- User scope (TEXT to match existing user_id convention)

  -- Generic "graph edge" model
  from_kind    TEXT NOT NULL,              -- e.g. 'episode' | 'cue' | 'embedding' | 'artifact'
  from_id      TEXT NOT NULL,              -- Source entity ID

  to_kind      TEXT NOT NULL,              -- Target entity type
  to_id        TEXT NOT NULL,              -- Target entity ID

  relation     TEXT NOT NULL,              -- e.g. 'echoes' | 'contrasts' | 'fulfills' | 'co_occurs'
  strength     REAL NOT NULL DEFAULT 0.5,  -- 0..1 link strength
  reasoning    TEXT,                       -- Why this link was created

  meta         JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicates (same edge, same user)
CREATE UNIQUE INDEX IF NOT EXISTS bardic_links_unique_edge
  ON bardic_links (user_id, from_kind, from_id, to_kind, to_id, relation);

CREATE INDEX IF NOT EXISTS bardic_links_user_from
  ON bardic_links (user_id, from_kind, from_id);

CREATE INDEX IF NOT EXISTS bardic_links_user_to
  ON bardic_links (user_id, to_kind, to_id);

CREATE INDEX IF NOT EXISTS bardic_links_relation
  ON bardic_links (user_id, relation);

CREATE INDEX IF NOT EXISTS bardic_links_strength
  ON bardic_links (strength DESC);

-- Event log for provenance
CREATE TABLE IF NOT EXISTS bardic_link_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL,
  link_id      UUID,
  event_type   TEXT NOT NULL,              -- 'created' | 'updated' | 'deleted' | 'reinforced'
  payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bardic_link_events_user
  ON bardic_link_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS bardic_link_events_link
  ON bardic_link_events (link_id, created_at DESC);

-- Also ensure episodes table has updated_at
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

COMMIT;
