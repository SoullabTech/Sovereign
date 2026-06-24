-- Member Organizing Principles: Portable Orientation Statements
--
-- Governed by: docs/canon/AGENCY_THE_FREEDOM_TO_MOVE.md
-- Design law: Expression → Orientation → Agency → Participation → Development → Continuity
--
-- An organizing principle is a portable statement that:
--   - Emerges naturally from a specific situation discussed
--   - Can orient future decisions of a similar nature
--   - Is grounded in concrete evidence from the conversation
--   - Is NOT generic advice — it is specific enough to be useful in exactly
--     the kind of situation that produced it
--
-- Memory rule: MAIA proposes. Member accepts, edits, or rejects.
-- Nothing is written automatically.
-- Constitutional boundary: MAIA says "seems to be emerging" — not "your lesson is."

CREATE TABLE IF NOT EXISTS member_organizing_principles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id          UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- The portable orientation statement
  title              TEXT NOT NULL,  -- short memorable phrase, e.g. "Boundaries before rescue"
  principle          TEXT NOT NULL,  -- full statement, e.g. "Protect the family field before committing generosity outward."
  question_answered  TEXT NOT NULL DEFAULT 'What principle emerged that can guide future situations?',
  evidence           JSONB NOT NULL DEFAULT '[]'::jsonb,  -- string[] from the conversation

  -- Provenance
  conversation_id    TEXT,           -- session/conversation id when it emerged

  -- Lifecycle
  status             TEXT NOT NULL DEFAULT 'accepted'
                       CHECK (status IN ('accepted', 'archived')),

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mop_member_created
  ON member_organizing_principles(member_id, created_at DESC);
