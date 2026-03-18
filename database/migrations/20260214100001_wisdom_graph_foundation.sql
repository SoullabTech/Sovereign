-- ============================================================================
-- Wisdom Graph Foundation
-- ============================================================================
-- The substrate for the Wisdom Explorer and Graph View.
--
-- Three tables:
--   1. wisdom_events  — what happened (retrieved, session_used, saved, starred)
--   2. wisdom_nodes   — member-scoped nodes (sources, themes)
--   3. wisdom_labels  — member-authored meaning ("the grief braid")
--
-- Design principles:
--   - Member-scoped: every row belongs to a member. No global graph.
--   - Event-first: nodes are derived from events, not pre-created.
--   - Authorship layer: labels are ONLY member-created, never computed.
--   - Fire-and-forget writes: event emission never blocks the oracle.
--   - No conversation content stored: only structural references.
-- ============================================================================

-- ─── wisdom_events ──────────────────────────────────────────────────────────
-- Records when Library wisdom touches a member's session.
-- This is the raw signal the graph engine computes over.

CREATE TABLE IF NOT EXISTS wisdom_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES members(id),
  event_type    TEXT NOT NULL CHECK (event_type IN (
    'retrieved',       -- Library chunk surfaced during consultation
    'session_used',    -- Chunk was included in oracle system prompt
    'saved',           -- Member explicitly saved/starred
    'shared'           -- Member shared with another (future)
  )),
  ref_type      TEXT NOT NULL DEFAULT 'library_chunk',  -- what the ref_id points to
  ref_id        TEXT NOT NULL,                          -- chunk or source ID
  source_id     UUID,                                   -- library_sources.id (denormalized for fast joins)
  element       TEXT,                                   -- element at time of event
  phase         SMALLINT,                               -- phase at time of event
  session_id    TEXT,                                   -- conversation session (nullable)
  meta          JSONB DEFAULT '{}',                     -- extra context (query snippet, score, etc.)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes: member lookup + time-range queries
CREATE INDEX IF NOT EXISTS idx_wisdom_events_member
  ON wisdom_events (member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wisdom_events_source
  ON wisdom_events (member_id, source_id)
  WHERE source_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wisdom_events_type
  ON wisdom_events (member_id, event_type);


-- ─── wisdom_nodes ───────────────────────────────────────────────────────────
-- Member-scoped graph nodes. Created lazily from events.
-- A node represents a source or a theme that has appeared in a member's field.

CREATE TABLE IF NOT EXISTS wisdom_nodes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id),
  node_type       TEXT NOT NULL CHECK (node_type IN ('source', 'theme')),
  ref_type        TEXT,            -- 'library_source', 'computed_cluster', etc.
  ref_id          TEXT,            -- the underlying ID this node represents
  title           TEXT NOT NULL,
  element         TEXT,            -- dominant element (nullable)
  phase           SMALLINT,        -- dominant phase (nullable)
  touched_count   INT NOT NULL DEFAULT 0,   -- how often retrieved/used
  last_seen_at    TIMESTAMPTZ,              -- last time this appeared in a session
  waiting_score   FLOAT DEFAULT 0,          -- "high relevance, low touch" heuristic
  meta            JSONB DEFAULT '{}',       -- extra data (cluster_members, centroid, etc.)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique per member + ref: one node per source per member
CREATE UNIQUE INDEX IF NOT EXISTS idx_wisdom_nodes_member_ref
  ON wisdom_nodes (member_id, ref_type, ref_id)
  WHERE ref_type IS NOT NULL AND ref_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wisdom_nodes_member
  ON wisdom_nodes (member_id, node_type);

CREATE INDEX IF NOT EXISTS idx_wisdom_nodes_waiting
  ON wisdom_nodes (member_id, waiting_score DESC)
  WHERE waiting_score > 0;


-- ─── wisdom_labels ──────────────────────────────────────────────────────────
-- Member-authored meaning. MAIA never writes to this table.
-- Only the member names patterns, themes, and significance.

CREATE TABLE IF NOT EXISTS wisdom_labels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id),
  target_node_id  UUID NOT NULL REFERENCES wisdom_nodes(id) ON DELETE CASCADE,
  label           TEXT NOT NULL,          -- "the grief braid", "say yes too fast"
  note            TEXT,                   -- optional personal note
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wisdom_labels_member
  ON wisdom_labels (member_id);

CREATE INDEX IF NOT EXISTS idx_wisdom_labels_node
  ON wisdom_labels (target_node_id);

-- Prevent duplicate identical labels on the same node by the same member.
-- Multiple DIFFERENT labels on one node are allowed ("the grief braid" + "say yes too fast").
CREATE UNIQUE INDEX IF NOT EXISTS idx_wisdom_labels_member_node_label
  ON wisdom_labels (member_id, target_node_id, label);
