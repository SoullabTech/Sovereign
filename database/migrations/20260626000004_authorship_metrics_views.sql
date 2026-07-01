-- Gate 5 — Authorship metrics (steward-side, READ-ONLY rollup).
--
-- Turns the append-only authorship ledger (member_field_note_events) into the
-- evidence the Recognition Beta's Gate 5 needs:
--   "Does repeated contact with MAIA INCREASE a member's authorship of their own
--    language, meaning, and direction?" — cultivation (a within-member delta),
--   not merely the presence of authored moments.
--
-- HARD BOUNDARY (load-bearing — do not soften): these views are the stewards'
-- read-only ecology. They MUST NEVER be read at request time by the room. The
-- ledger is observed to improve the environment, never to optimize the encounter.
-- Data flow:  member action -> ledger -> steward rollup -> human design review.
-- Never:      ledger -> MAIA behavior.
--
-- Counts only; no content. Consent-safe by construction: nothing reaches the
-- ledger without an explicit member gesture, discards persist no content, and
-- every persisted thread is consent_state='member-confirmed-memory'.
--
-- Encounter grain: per member, per day (a proxy for a Field Lab session; precise
-- per-session attribution would require source_session_ref on the event row — an
-- optional later refinement, not required for the day-grain cultivation delta).
--
-- Spec: docs/research/BETA_RELEASE_GATE_2026-06-26.md (Gate 5)

CREATE OR REPLACE VIEW member_authorship_metrics AS
WITH counts AS (
  SELECT
    e.member_id,
    DATE(e.created_at)                                   AS encounter_day,
    COUNT(*) FILTER (WHERE e.event_type = 'kept')        AS kept,
    COUNT(*) FILTER (WHERE e.event_type = 'revised')     AS revised,
    COUNT(*) FILTER (WHERE e.event_type = 'discarded')   AS discarded,
    COUNT(*) FILTER (WHERE e.event_type = 'created')     AS created,
    COUNT(*) FILTER (WHERE e.event_type = 'released')    AS released,
    COUNT(*) FILTER (WHERE e.event_type = 'split')       AS split
  FROM member_field_note_events e
  GROUP BY e.member_id, DATE(e.created_at)
)
SELECT
  member_id,
  encounter_day,
  kept, revised, discarded, created, released, split,
  (kept + revised + discarded + created)               AS authorship_acts,
  -- reshape ratio — of the proposals the member ACCEPTED, how many did they
  -- reshape rather than rubber-stamp? high = authoring; 0 = accept-unchanged
  -- (rubber-stamp / displacement risk). The core Gate-5 signal.
  ROUND(revised::numeric / NULLIF(kept + revised, 0), 3)                       AS reshape_ratio,
  -- origination ratio — fraction that is the member's OWN language.
  ROUND(created::numeric / NULLIF(kept + revised + discarded + created, 0), 3) AS origination_ratio,
  -- rejection rate — of MAIA's proposals the member crossed, how many rejected.
  ROUND(discarded::numeric / NULLIF(kept + revised + discarded, 0), 3)         AS rejection_rate,
  -- release rate — exit-side authorship.
  ROUND(released::numeric / NULLIF(kept + revised + created, 0), 3)            AS release_rate
FROM counts;

COMMENT ON VIEW member_authorship_metrics IS
  'Gate 5 steward ecology (READ-ONLY, never read at runtime): per-member, per-day authorship rollup from member_field_note_events. reshape_ratio = revised/(kept+revised) is the rubber-stamp-vs-author signal.';

-- Within-member CULTIVATION delta: does authorship INCREASE across repeated
-- encounters? This is what distinguishes "MAIA grew authorship" from
-- "authorship-prone people used MAIA" — the level is not enough; the trend is
-- the gate. Requires >= 2 encounters (no delta without repeated contact).
CREATE OR REPLACE VIEW member_authorship_delta AS
SELECT
  member_id,
  COUNT(*)                                                                  AS encounters,
  MIN(encounter_day)                                                        AS first_encounter,
  MAX(encounter_day)                                                        AS latest_encounter,
  (array_agg(reshape_ratio     ORDER BY encounter_day))[1]                  AS first_reshape_ratio,
  (array_agg(reshape_ratio     ORDER BY encounter_day DESC))[1]             AS latest_reshape_ratio,
  (array_agg(reshape_ratio     ORDER BY encounter_day DESC))[1]
    - (array_agg(reshape_ratio ORDER BY encounter_day))[1]                  AS reshape_ratio_delta,
  (array_agg(origination_ratio ORDER BY encounter_day DESC))[1]
    - (array_agg(origination_ratio ORDER BY encounter_day))[1]              AS origination_ratio_delta
FROM member_authorship_metrics
GROUP BY member_id
HAVING COUNT(*) >= 2;

COMMENT ON VIEW member_authorship_delta IS
  'Gate 5 cultivation signal (READ-ONLY, never read at runtime): within-member change in authorship across repeated encounters. reshape_ratio_delta > 0 across members = evidence MAIA increases authorship, not just hosts it.';
