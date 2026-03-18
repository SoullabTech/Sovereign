-- Migration: pending_review_candidates + case_memories provenance columns
-- Sprint 1 Session Review — Prompt 5 (save/promote)
--
-- Adds:
--   1. pending_review_candidates — ephemeral holding table for analyze output
--   2. case_memories.source_session_id — which scribe session originated the memory
--   3. case_memories.review_lens_id    — which lens generated it
--   4. case_memories.evidence_refs     — JSONB evidence anchor (textRef and/or structured)
--   5. case_memories.source_candidate_id — soft link back to pending record (no FK)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Pending review candidates
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pending_review_candidates (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID        NOT NULL REFERENCES scribe_sessions(id) ON DELETE CASCADE,
  practitioner_id     UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  lens_id             VARCHAR(30) NOT NULL,
  memory_type         VARCHAR(30) NOT NULL,
  content             TEXT        NOT NULL,
  significance        NUMERIC(3,2) NOT NULL DEFAULT 0.50
                      CHECK (significance >= 0 AND significance <= 1),
  facet_code          VARCHAR(20),
  element_tags        VARCHAR(20)[],
  evidence_ref        TEXT,                     -- textual ref string from candidate
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  promoted_at         TIMESTAMPTZ,
  promoted_memory_id  UUID                      -- soft ref to case_memories.id
);

CREATE INDEX IF NOT EXISTS idx_prc_session
  ON pending_review_candidates(session_id);

CREATE INDEX IF NOT EXISTS idx_prc_practitioner
  ON pending_review_candidates(practitioner_id);

-- Used by sweeper / expiry queries
CREATE INDEX IF NOT EXISTS idx_prc_expires
  ON pending_review_candidates(expires_at)
  WHERE promoted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Extend case_memories with provenance columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE case_memories
  ADD COLUMN IF NOT EXISTS source_session_id    UUID,
  ADD COLUMN IF NOT EXISTS review_lens_id       VARCHAR(30),
  ADD COLUMN IF NOT EXISTS evidence_refs        JSONB,
  ADD COLUMN IF NOT EXISTS source_candidate_id  UUID;           -- no FK; candidate may expire

CREATE INDEX IF NOT EXISTS idx_case_memories_session
  ON case_memories(source_session_id)
  WHERE source_session_id IS NOT NULL;
