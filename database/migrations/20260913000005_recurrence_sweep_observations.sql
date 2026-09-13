-- BCS-01A · Step 10 — P11/P12 closure. The ONE new cognitive artifact.
--
-- PREDICATES (BCS-M1, stated before the schema is accepted):
--
--   recurrence observation   a durable SYSTEM-AUTHORED claim that an element or
--                            gesture recurs within its explicitly stated
--                            claim-specific coverage, having passed the existing
--                            Step-3 admission law. It asserts nothing about why the
--                            recurrence matters, whether the writer intended it,
--                            whether it is good or bad, or whether MAIA may use it.
--                            Its material identity is OBSERVATION, not job result.
--
--   evidentiary use          this frozen input lineage item is explicitly offered as
--                            evidence for THIS candidate observation. ⛔ Not causal
--                            effect, importance, model attention or semantic weight.
--
--   occurrence               the deterministic candidate asserts the repeated element
--                            occurs in this covered unit. ⛔ Not that the section is
--                            important, nor that the section is "about" the gesture.
--
--   claim_text               the exact system-authored proposition asserted.
--   claim_extent             Step-3's existing extent vocabulary. ⛔ No second scope
--                            vocabulary.
--   created_at               when the durable observation was recorded. ⛔ Not when
--                            the recurrence "occurred".
--
-- ⛔ MATERIAL-SPECIFIC, NOT A GENERIC OUTPUT TABLE. No producer_id, model_id,
-- worker_id, job_type, output_type, result, confidence, meaning or importance — a
-- classification that named machinery would be actor/material collapse (F-J2.3).
CREATE TABLE IF NOT EXISTS recurrence_sweep_observations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id  UUID        NOT NULL
                REFERENCES recurrence_sweep_executions(id) ON DELETE CASCADE,
  claim_text    TEXT        NOT NULL,
  claim_extent  TEXT        NOT NULL CHECK (claim_extent IN ('coverage', 'commissioned_scope')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Each row: this frozen input is explicitly used as evidence for this observation.
-- The FK is to checkpoint_inputs, so an observation can only rest on material whose
-- acquisition lineage is already recoverable (Step 7).
CREATE TABLE IF NOT EXISTS recurrence_sweep_observation_evidence (
  observation_id  UUID    NOT NULL
                  REFERENCES recurrence_sweep_observations(id) ON DELETE CASCADE,
  partition_id    UUID    NOT NULL
                  REFERENCES recurrence_sweep_checkpoint_inputs(partition_id) ON DELETE CASCADE,
  occurrence      BOOLEAN NOT NULL,

  PRIMARY KEY (observation_id, partition_id)
);
