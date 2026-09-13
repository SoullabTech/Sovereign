-- BCS-01A · Step 7 — frozen input lineage.
--
-- PREDICATE (BCS-M1, stated before the schema is accepted):
--   checkpoint_inputs  durable relation recording the frozen input supplied to the
--                      successful computation whose checkpoint it accompanies;
--                      NOT output, coverage, observation, or causality.
--
-- ⛔ NO IDENTITY IS DUPLICATED HERE. section_id · draft_id · revision_number ·
-- revision_digest · member_id · manuscript_id all resolve through
--   checkpoint → partition → execution → commission.
-- Existing evidence law: the REFERENCE carries no version; the FROZEN STATE carries
-- the version (lib/manuscript/development/readState.ts).
--
-- ⛔ NO PROSE. The immutable revision remains the custody location for the Work.
-- Identity, range and digest only.
--
-- ⛔ `recorded_at`, NOT `read_at`. The database knows when the row was durably
-- written. It does not know the instant the processor inspected the bytes.
--
-- ⛔ NO currency / stale / is_current column, here or anywhere. Currency is a
-- comparison computed now against the Work as it is; a stored value would become
-- false on the next edit.
CREATE TABLE IF NOT EXISTS recurrence_sweep_checkpoint_inputs (
  partition_id   UUID PRIMARY KEY
                 REFERENCES recurrence_sweep_checkpoints(partition_id) ON DELETE CASCADE,

  -- code-point interval of that section INSIDE THE IMMUTABLE REVISION STATE that
  -- was actually supplied. Not an offset into live prose, and not a version.
  range_start    INTEGER     NOT NULL,
  range_end      INTEGER     NOT NULL,

  -- SHA-256 over the exact content the provider returned and validation accepted.
  frozen_digest  TEXT        NOT NULL,

  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT recurrence_sweep_checkpoint_inputs_range_valid
    CHECK (range_start >= 0 AND range_end >= range_start)
);
