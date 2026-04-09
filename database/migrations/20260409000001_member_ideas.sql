-- Member Ideas: iterative single-idea workspace
--
-- Purpose: give members a container for staying with one idea over time —
-- iterations, decisions, and changes — something MAIA alone can't do because
-- conversation is ephemeral.
--
-- This is member-scoped and deliberately separate from field_ideas (field/practitioner)
-- and studio_changes / studio_decisions (practitioner tools). Those systems are
-- not unified with this one — that's a future bridge, not a present concern.
--
-- Design constraints (enforced by shape):
--   - No lifecycle state machine (status is just active | parked | integrated)
--   - No tagging UI in v1 (column exists for later)
--   - No parent/child lineage
--   - Three block types only: note | decision | change
--   - Blocks store metadata as jsonb so I Ching / council / tool invocations
--     can attach later WITHOUT schema change or v1 dependency.

CREATE TABLE IF NOT EXISTS member_ideas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  framing           TEXT,                                -- short anchor description
  status            TEXT NOT NULL DEFAULT 'active',      -- active | parked | integrated
  tags              TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_entered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- "when did I last return to this"
  last_decision_at  TIMESTAMPTZ                          -- last decision block added (for active-idea surfacing)
);

CREATE INDEX IF NOT EXISTS idx_member_ideas_member
  ON member_ideas(member_id, last_entered_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_ideas_status
  ON member_ideas(member_id, status, last_entered_at DESC);

CREATE TABLE IF NOT EXISTS member_idea_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id     UUID NOT NULL REFERENCES member_ideas(id) ON DELETE CASCADE,
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  block_type  TEXT NOT NULL CHECK (block_type IN ('note', 'decision', 'change')),
  content     TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_idea_blocks_idea
  ON member_idea_blocks(idea_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_idea_blocks_decisions
  ON member_idea_blocks(idea_id, created_at DESC) WHERE block_type = 'decision';

-- Keep member_ideas.updated_at honest
CREATE OR REPLACE FUNCTION update_member_ideas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_member_ideas_updated_at ON member_ideas;
CREATE TRIGGER trg_member_ideas_updated_at
  BEFORE UPDATE ON member_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_member_ideas_updated_at();

-- When a decision block is added, update parent idea's last_decision_at
CREATE OR REPLACE FUNCTION touch_member_idea_last_decision_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.block_type = 'decision' THEN
    UPDATE member_ideas
       SET last_decision_at = NEW.created_at
     WHERE id = NEW.idea_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_member_idea_blocks_decision ON member_idea_blocks;
CREATE TRIGGER trg_member_idea_blocks_decision
  AFTER INSERT ON member_idea_blocks
  FOR EACH ROW
  EXECUTE FUNCTION touch_member_idea_last_decision_at();
