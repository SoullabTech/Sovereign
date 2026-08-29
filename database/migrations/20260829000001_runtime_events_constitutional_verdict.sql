-- MAIA Behavioral Portability — P1: runtime verdict persistence
--
-- Closes the evidence join identified by P0: the constitutional adjudicator
-- already runs on every generated turn, but its verdict was console-only while
-- runtime_events carried the substrate. Until verdict and substrate share a
-- row, no invariant can be resolved per substrate from production evidence,
-- however deterministic the adjudicator is.
--
-- ADDITIVE ONLY. Every column is nullable; existing rows remain valid and are
-- read as "not observable", never as a passing turn.
--
-- Columns:
--   turn_id                     identity minted at context-build time, so the
--                               verdict (which only exists after generation)
--                               can be attached to the row written before it
--   stance_mode                 'boundary' | 'relational' = stance retained;
--                               'captured' = operational over-reach
--   auth_slip                   ratified the diagnosis / directed the next move
--   stance_adjudicator_version  WHICH CONTRACT produced the verdict. Detectors
--                               improve; without this, a verdict recorded under
--                               an older contract is indistinguishable from one
--                               recorded under a newer one and longitudinal
--                               comparison silently becomes contaminated by
--                               detector evolution rather than substrate
--                               difference. Evidence may only be compared
--                               within a single contract version.
--   verdict_provider            the substrate that ACTUALLY generated the
--                               adjudicated text. Distinct from `provider`,
--                               which resolveProviderConfig() reads from the
--                               environment at context-build time and is the
--                               CONFIGURED provider. They diverge exactly when
--                               fallback fires — which is the case portability
--                               most needs to measure correctly.
--
-- SANCTUARY: stance_mode / auth_slip / stance_adjudicator_version /
-- verdict_provider are suppressed (left NULL) for sanctuary turns. The live
-- egress guard still adjudicates them — MAIA needs that protection on every
-- turn — but the verdict dies with the turn rather than becoming durable
-- evidence. `provider` follows existing policy and is unchanged here.
--
-- Canon: docs/canon/MAIA_BEHAVIORAL_PORTABILITY.md · CLAUDE.md § Sanctuary Mode

ALTER TABLE runtime_events
  ADD COLUMN IF NOT EXISTS turn_id                    uuid,
  ADD COLUMN IF NOT EXISTS stance_mode                text,
  ADD COLUMN IF NOT EXISTS auth_slip                  boolean,
  ADD COLUMN IF NOT EXISTS stance_adjudicator_version text,
  ADD COLUMN IF NOT EXISTS verdict_provider           text;

-- stance_mode is a closed enum from lib/sovereign/stanceDetector.ts.
-- NULL stays legal: it is the "not observable" state (sanctuary, historical
-- rows, or a turn whose adjudication threw).
ALTER TABLE runtime_events
  DROP CONSTRAINT IF EXISTS runtime_events_stance_mode_check;
ALTER TABLE runtime_events
  ADD CONSTRAINT runtime_events_stance_mode_check
  CHECK (stance_mode IS NULL OR stance_mode IN ('boundary', 'relational', 'captured'));

-- A verdict is only interpretable with its adjudicator contract. Refuse a row
-- that records an outcome without the provenance needed to compare it.
ALTER TABLE runtime_events
  DROP CONSTRAINT IF EXISTS runtime_events_verdict_provenance_check;
ALTER TABLE runtime_events
  ADD CONSTRAINT runtime_events_verdict_provenance_check
  CHECK (
    (stance_mode IS NULL AND auth_slip IS NULL)
    OR stance_adjudicator_version IS NOT NULL
  );

-- The verdict UPDATE addresses turn_id; unique so it can never touch two rows.
CREATE UNIQUE INDEX IF NOT EXISTS runtime_events_turn_id_key
  ON runtime_events (turn_id) WHERE turn_id IS NOT NULL;

-- Portability evidence is always read grouped by substrate and contract.
CREATE INDEX IF NOT EXISTS runtime_events_portability_idx
  ON runtime_events (verdict_provider, stance_adjudicator_version, built_at DESC)
  WHERE stance_mode IS NOT NULL;
