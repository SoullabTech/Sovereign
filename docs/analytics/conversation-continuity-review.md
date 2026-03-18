# Conversation Continuity Review

Queries for measuring whether the continuity layer is holding the thread.

**Tables:** `ain_shape_telemetry` (has `continuity_data` JSONB column after migration `20260317000001`)

---

## 1. Correction Signal Rate

How often users tell MAIA it dropped the thread.

```sql
SELECT
  COUNT(*) AS turns,
  SUM(CASE WHEN continuity_data->>'hadCorrectionSignal' = 'true' THEN 1 ELSE 0 END) AS corrections,
  ROUND(100.0 * AVG(CASE WHEN continuity_data->>'hadCorrectionSignal' = 'true' THEN 1 ELSE 0 END), 1) AS correction_rate_pct,
  COUNT(DISTINCT session_id) AS sessions
FROM ain_shape_telemetry
WHERE formed_at > NOW() - INTERVAL '7 days'
  AND continuity_data IS NOT NULL;
```

**Interpretation:**
- `< 3%` — healthy
- `3–8%` — watch for patterns
- `> 8%` — thread-holding is failing; review correction_type distribution

---

## 2. Correction Type Breakdown

```sql
SELECT
  continuity_data->>'correctionType' AS correction_type,
  COUNT(*) AS count
FROM ain_shape_telemetry
WHERE formed_at > NOW() - INTERVAL '7 days'
  AND continuity_data->>'hadCorrectionSignal' = 'true'
GROUP BY 1
ORDER BY 2 DESC;
```

**Types:** `repeat` (asked again), `misread` (wrong interpretation), `thread_loss` (lost the thread), `general`

---

## 3. Average Active Thread Confidence

Confidence reflects how clearly the thread is recoverable from recent turns.
Low confidence = MAIA is guessing at the thread, increasing drift risk.

```sql
SELECT
  ROUND(AVG((continuity_data->>'activeThreadConfidence')::float), 3) AS avg_thread_confidence,
  ROUND(MIN((continuity_data->>'activeThreadConfidence')::float), 3) AS min_confidence,
  COUNT(*) AS turns
FROM ain_shape_telemetry
WHERE formed_at > NOW() - INTERVAL '7 days'
  AND continuity_data IS NOT NULL
  AND continuity_data->>'hadActiveThread' = 'true';
```

**Interpretation:**
- `> 0.65` — thread signal is clear
- `0.45–0.65` — thread is recoverable but thin
- `< 0.45` — conversation structure is too vague for heuristic detection; consider prompt refinement

---

## 4. AIN Shape Scores Alongside Continuity

Does higher thread confidence correlate with better shape scores?

```sql
SELECT
  CASE
    WHEN (continuity_data->>'activeThreadConfidence')::float >= 0.70 THEN 'high'
    WHEN (continuity_data->>'activeThreadConfidence')::float >= 0.45 THEN 'medium'
    ELSE 'low'
  END AS thread_confidence_band,
  COUNT(*) AS turns,
  ROUND(100.0 * AVG(CASE WHEN pass THEN 1 ELSE 0 END), 1) AS pass_rate_pct,
  ROUND(AVG(score), 2) AS avg_shape_score,
  ROUND(100.0 * AVG(CASE WHEN bridge THEN 1 ELSE 0 END), 1) AS bridge_rate_pct
FROM ain_shape_telemetry
WHERE formed_at > NOW() - INTERVAL '7 days'
  AND continuity_data IS NOT NULL
GROUP BY 1
ORDER BY 1;
```

---

## 5. Turn Survival by Conversation Depth

Approximate engagement retention. Join on session to count how many turns sessions reach.

```sql
SELECT
  CASE
    WHEN turn_depth <= 2  THEN '1-2'
    WHEN turn_depth <= 5  THEN '3-5'
    WHEN turn_depth <= 12 THEN '6-12'
    ELSE '13+'
  END AS depth_bucket,
  COUNT(*) AS sessions
FROM (
  SELECT session_id, COUNT(*) AS turn_depth
  FROM ain_shape_telemetry
  WHERE formed_at > NOW() - INTERVAL '30 days'
  GROUP BY session_id
) depth_counts
GROUP BY 1
ORDER BY MIN(turn_depth);
```

**Interpretation:**
- If most sessions end at `3-5`, thread drops are cutting conversations short.
- A shift toward `6-12` after deploying the continuity layer suggests it's working.
- `1-2` turns may be one-shot queries — acceptable baseline.

---

## 6. Correction Rate by Mode / Route

```sql
SELECT
  route,
  COUNT(*) AS turns,
  ROUND(100.0 * AVG(CASE WHEN continuity_data->>'hadCorrectionSignal' = 'true' THEN 1 ELSE 0 END), 1) AS correction_rate_pct
FROM ain_shape_telemetry
WHERE formed_at > NOW() - INTERVAL '7 days'
  AND continuity_data IS NOT NULL
GROUP BY route
ORDER BY correction_rate_pct DESC;
```

---

## Review Cadence

| Cadence | Query | Action threshold |
|---------|-------|-----------------|
| After deploy | Queries 1 + 3 | correction_rate > 8% → investigate |
| Weekly | All queries | Look for depth bucket shift |
| Monthly | Query 4 | Confirm thread confidence ↔ shape score correlation |

---

## Assumptions

- `ain_shape_telemetry.continuity_data` JSONB column exists (migration `20260317000001`)
- `formed_at` is the existing timestamp column on `ain_shape_telemetry`
- `session_id` is the conversation session identifier
- `maiaService` path populates `continuity_data`; oracle route logs to console only (separate telemetry path)
