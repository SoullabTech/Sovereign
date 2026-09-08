-- SEL-0 · F-7 ELIGIBILITY AS READING PROVENANCE — founder ruling, 2026-09-08
--
-- CLASS B. ADDITIVE ONLY. Two nullable columns and one INSERT-time trigger.
-- No existing row is read, rewritten, re-validated or backfilled. No existing
-- constraint or trigger function is replaced — 20260904000002's observation
-- check is untouched, so v2's relaxation of `phenomenon` cannot be lost by this
-- migration reinstating an older function body.
--
-- ROLLBACK POSTURE: dropping both columns restores the prior shape exactly,
-- because nothing outside them changed. A reading frozen while they existed
-- would lose its F-7 record, which is why the rollback is stated as available
-- rather than promised.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- WHY A COLUMN AND NOT A FIELD INSIDE EACH OBSERVATION
--
-- The observation object has a CLOSED key set enforced at insert: an unknown
-- key RAISES. Putting the verdict inside an observation would therefore require
-- reopening the ratified observation shape — a third reading contract — to
-- carry something that is not part of what MAIA noticed. F-7 eligibility is a
-- judgement ABOUT an observation under a constitutional rule, made by whoever
-- adjudicated it; it is provenance of the reading, not content of the claim.
-- So it sits beside the observations, keyed by their keys, and the observation
-- contract is left exactly as ratified.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- NULL IS NOT "NO VERDICTS". IT IS "THIS READING PREDATES THE RECORD".
--
-- `f7_eligibility IS NULL` says the reading was frozen before this ruling. A
-- reader must treat every observation of such a reading as `unestablished` —
-- which is NOT eligible — and must never read the absence as permission. That
-- is the same discipline the ruling states for the verdict itself, applied to
-- the record's own absence.
--
-- ⛔ NO BACKFILL, INCLUDING THE FROZEN 19. The founder ruling is explicit: the
-- Step-0 adjudication of the SEL-0 corpus is benchmark evidence and is not a
-- production verdict. Writing it here would convert an instrument's finding into
-- production provenance, which is the direction of authority this programme
-- exists to prevent.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- `reading_contract_version` — REPAIRING A RECORDED DEFECT, NOT COMPOUNDING IT
--
-- `freeze.ts` has always set `provenance.readingContractVersion`, and `store.ts`
-- has always dropped it: it reached no column. The contract identifies v1 by the
-- ABSENCE of that field, so today EVERY row — v1 and v2 alike — is
-- indistinguishable from v1, and the ratified discriminator does not work.
--
-- This column makes the ratified rule true rather than changing it:
--
--     NULL          the reading contract v1, or a v2 reading frozen before this
--                   column existed. Absence remains the evidence, exactly as
--                   20260904000002 states.
--     'DEVELOPMENTAL-READING-CONTRACT-02'   written by new freezes.
--
-- NOT NULL is deliberately NOT asserted, for the reason 20260904000002 already
-- gave: requiring it would invalidate every v1 row.
--
-- ⚠️ A v2 reading frozen BEFORE this migration cannot be distinguished from a v1
-- reading afterwards, and is not made distinguishable by it. That loss is
-- historical and is recorded rather than repaired by inference.
--
-- Authority: docs/programme/sel-0/SEL-0_REDESIGNATION_AND_SELECTOR_CONTRACT_2026-09-08.md
--            + founder ruling 2026-09-08 (F-7 eligibility is reading provenance)

BEGIN;

ALTER TABLE developmental_readings
  ADD COLUMN IF NOT EXISTS f7_eligibility jsonb;

ALTER TABLE developmental_readings
  ADD COLUMN IF NOT EXISTS reading_contract_version text;

-- Shape, enforced only where the record is present. A row without one is a
-- lawful historical row and is not made unlawful by this migration.
ALTER TABLE developmental_readings
  DROP CONSTRAINT IF EXISTS developmental_readings_f7_eligibility_shape;
ALTER TABLE developmental_readings
  ADD CONSTRAINT developmental_readings_f7_eligibility_shape CHECK (
    f7_eligibility IS NULL OR (
      jsonb_typeof(f7_eligibility) = 'object'
      AND f7_eligibility ? 'rule'
      AND f7_eligibility ? 'ruleVersion'
      AND f7_eligibility ? 'adjudicator'
      AND jsonb_typeof(f7_eligibility->'verdicts') = 'object'
      AND jsonb_typeof(f7_eligibility->'adjudicator') = 'object'
      AND length(trim(coalesce(f7_eligibility->>'rule', ''))) > 0
      AND length(trim(coalesce(f7_eligibility->>'ruleVersion', ''))) > 0
    )
  );

-- ONE VERDICT PER OBSERVATION, FROM THE THREE STATES, AND NOTHING ELSE.
--
-- A SEPARATE trigger function from the observation check, so neither can be
-- lost by a future replacement of the other. It fires on INSERT only; the
-- immutability trigger already refuses every UPDATE, so a verdict written at
-- freeze cannot later be revised — which is what makes the record immutable in
-- the sense the ruling requires.
CREATE OR REPLACE FUNCTION developmental_readings_f7_eligibility_check()
RETURNS TRIGGER AS $$
DECLARE
  o jsonb;
  i integer := 0;
  k text;
  v text;
BEGIN
  IF NEW.f7_eligibility IS NULL THEN
    RETURN NEW;
  END IF;

  -- Every observation must carry a verdict. A missing key would be read as
  -- `unestablished` by a correct reader, but silence and a recorded verdict are
  -- different claims, and a record that exists must be complete.
  FOR o IN SELECT * FROM jsonb_array_elements(NEW.observations) LOOP
    i := i + 1;
    k := o->>'key';
    IF NOT (NEW.f7_eligibility->'verdicts') ? k THEN
      RAISE EXCEPTION 'observation % (%) carries no F-7 verdict; a present record must be complete', i, k;
    END IF;
  END LOOP;

  -- No verdict may name something that is not an observation of this reading.
  FOR k IN SELECT jsonb_object_keys(NEW.f7_eligibility->'verdicts') LOOP
    IF NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(NEW.observations) e WHERE e->>'key' = k
    ) THEN
      RAISE EXCEPTION 'F-7 verdict names %, which is not an observation of this reading', k;
    END IF;
    v := NEW.f7_eligibility->'verdicts'->>k;
    IF v NOT IN ('eligible', 'ineligible', 'unestablished') THEN
      RAISE EXCEPTION 'F-7 verdict for % is %, outside the three states', k, v;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS developmental_readings_f7_eligibility ON developmental_readings;
CREATE TRIGGER developmental_readings_f7_eligibility
  BEFORE INSERT ON developmental_readings
  FOR EACH ROW EXECUTE FUNCTION developmental_readings_f7_eligibility_check();

COMMENT ON COLUMN developmental_readings.f7_eligibility IS
  'SEL-0. Immutable per-observation F-7 eligibility (eligible | ineligible | unestablished) with the governing rule, its version, and the adjudicator. NULL means the reading predates this record: read every observation as unestablished, never as eligible. Written at freeze; never updated (the row is insert-only).';

COMMENT ON COLUMN developmental_readings.reading_contract_version IS
  'The reading contract this row was frozen under. NULL is v1, or a v2 reading frozen before this column existed — absence remains the evidence, per 20260904000002. Never backfilled.';

COMMIT;
