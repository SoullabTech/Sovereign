-- relational_signal_movement_cue
--
-- [Relational Layer — Phase 4]
-- Adds `movement_cue` to `member_relational_signals` so the new
-- Relational Field entry flow can persist the "what feels most active"
-- answer alongside tone and rupture state.
--
-- Movement cue vocabulary (from the Phase 4 spec):
--   - 'moving_toward'
--   - 'pulling_away'
--   - 'trying_to_fix'
--   - 'feeling_blamed'
--   - 'repeating_something'
--   - 'not_sure'
--
-- The column is nullable: older signals have no movement cue, and the
-- background detector from Phase 2 does not populate it (labtool_manual
-- only, for now).
--
-- Sovereignty invariants preserved:
--   - movement cue is descriptive ("what feels most active"), not
--     diagnostic ("you are pursuing")
--   - the six options are member-chosen from a small neutral set,
--     never inferred by the system in v1
--   - additive change — zero effect on existing signals or read paths
--   - idempotent (IF NOT EXISTS) for safe reapplication

ALTER TABLE member_relational_signals
  ADD COLUMN IF NOT EXISTS movement_cue TEXT;

-- Constrain the vocabulary. Kept as a CHECK so future cues can be
-- added via a follow-up migration without data rewrites.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'member_relational_signals_movement_cue_check'
  ) THEN
    ALTER TABLE member_relational_signals
      ADD CONSTRAINT member_relational_signals_movement_cue_check
      CHECK (
        movement_cue IS NULL
        OR movement_cue IN (
          'moving_toward',
          'pulling_away',
          'trying_to_fix',
          'feeling_blamed',
          'repeating_something',
          'not_sure'
        )
      );
  END IF;
END $$;

COMMENT ON COLUMN member_relational_signals.movement_cue IS
  'Member-selected movement cue from Relational Field entry flow. Descriptive, never diagnostic.';
