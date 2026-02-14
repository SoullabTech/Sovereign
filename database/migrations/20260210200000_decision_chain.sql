-- Decision Chain — Linked Decisions (Spiral Path)
--
-- A decision can spawn child decisions, forming a chain.
-- e.g. "Should I leave my job?" → "How do I negotiate the exit?" → "What does the first month look like?"
--
-- parent_decision_id: the immediate parent in the chain
-- root_decision_id: the original decision that started the chain (for fast queries)

ALTER TABLE studio_decisions
  ADD COLUMN IF NOT EXISTS parent_decision_id UUID REFERENCES studio_decisions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS root_decision_id UUID REFERENCES studio_decisions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_studio_decisions_parent
  ON studio_decisions(parent_decision_id);

CREATE INDEX IF NOT EXISTS idx_studio_decisions_root
  ON studio_decisions(root_decision_id);

COMMENT ON COLUMN studio_decisions.parent_decision_id IS
  'Immediate parent decision in a spiral chain';
COMMENT ON COLUMN studio_decisions.root_decision_id IS
  'Root decision of the chain — for fast ancestry queries';

-- INVARIANT:
-- - Standalone decisions: parent_decision_id = NULL, root_decision_id = NULL
-- - Child decisions: parent_decision_id IS NOT NULL, root_decision_id IS NOT NULL
-- - root_decision_id always points to the chain origin (the first decision that has no parent)
-- - Enforced in application layer (POST /api/studio/decisions)
--
-- Constraint: if parent exists, root must exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_chain_consistency'
      AND conrelid = 'studio_decisions'::regclass
  ) THEN
    ALTER TABLE studio_decisions
      ADD CONSTRAINT chk_chain_consistency
      CHECK (
        (parent_decision_id IS NULL)
        OR (parent_decision_id IS NOT NULL AND root_decision_id IS NOT NULL)
      );
  END IF;
END $$;
