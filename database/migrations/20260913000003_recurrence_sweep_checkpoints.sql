-- BCS-01A · Step 6 — checkpoint resume.
--
-- A checkpoint is DURABLE EXECUTION PROGRESS. It is not a finding, observation,
-- coverage, lineage, output or authority. Nothing in these two tables says what
-- the Work means.
--
-- WHY THE PARTITION SET IS PERSISTED, not just an ordinal: a checkpoint recorded
-- as "partition 2 completed" is meaningless if "partition 2" can mean something
-- different after a restart or a code change. These rows freeze the execution
-- plan against the commission that authorized it.

-- ── the frozen execution plan ────────────────────────────────────────────────
-- Derived from commission.body_scope_section_ids, in frozen order, at execution
-- creation. Never supplied by a caller: execution may SUBDIVIDE authority, never
-- enlarge or rewrite it.
--
-- A partition is an EXECUTION CONVENIENCE. That one proving partition maps to one
-- body-scope section does not establish that a section is inherently a cognition
-- partition, nor that a section boundary is a developmental boundary.
CREATE TABLE IF NOT EXISTS recurrence_sweep_partitions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id  UUID    NOT NULL
                REFERENCES recurrence_sweep_executions(id) ON DELETE CASCADE,
  ordinal       INTEGER NOT NULL CHECK (ordinal >= 0),
  section_id    TEXT    NOT NULL,

  CONSTRAINT recurrence_sweep_partitions_ordinal_unique UNIQUE (execution_id, ordinal),
  -- partitions are disjoint: one commissioned section cannot occur twice. A scope
  -- that cannot satisfy this makes the execution refuse rather than silently drop,
  -- add, or deduplicate a section to obtain a plan.
  CONSTRAINT recurrence_sweep_partitions_section_unique UNIQUE (execution_id, section_id)
);

-- ── the checkpoint ───────────────────────────────────────────────────────────
-- EXECUTION-LEVEL, NOT ATTEMPT-LEVEL. A checkpoint survives worker claims; that
-- survival is the whole point of P6. The claim generation authorizes the WRITE;
-- it is not part of the checkpoint's durable identity.
--
-- DELIBERATELY ABSENT: occurrence data · prose · evidence refs · coverage ·
-- lineage · model output · observation · result · currency · producer · progress
-- percentage · next_partition · payload/blob.
CREATE TABLE IF NOT EXISTS recurrence_sweep_checkpoints (
  partition_id  UUID PRIMARY KEY
                REFERENCES recurrence_sweep_partitions(id) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
