# Phase 24 — Production Monitoring Checklist

> Verify stability, observe patterns, resist the urge to tune.

---

## 1. Deployment verification (first hour after merge)

### Apply migrations
```bash
# From Mac Studio (production host)
docker exec maia-postgres psql -U soullab maia_consciousness \
  -f /path/to/database/migrations/20260317000001_symbolic_telemetry.sql \
  -f /path/to/database/migrations/20260318000001_symbolic_telemetry_attribution.sql
```

### Confirm schema
```bash
docker exec maia-postgres psql -U soullab maia_consciousness -c "
SELECT column_name FROM information_schema.columns
WHERE table_name='symbolic_telemetry_events'
ORDER BY ordinal_position;"

docker exec maia-postgres psql -U soullab maia_consciousness -c "
SELECT indexname FROM pg_indexes
WHERE tablename='symbolic_telemetry_events';"
```

Expected indexes: `created_at DESC`, `domain+authority`, `render_blocked` (partial), `session_id`, `member_id`, `mode`.

### Smoke test
Trigger 1–2 real oracle calls, then verify both horizons have data:
```
GET /api/debug/symbolic-telemetry              # memory — should show eventCount ≥ 1
GET /api/debug/symbolic-telemetry?source=db&window=1   # DB — should show totalEvents ≥ 1
```

---

## 2. Daily checks (days 1–7)

### A. Authority distribution
**Endpoint:** `?source=db&window=24`

| Domain | Healthy pattern |
|--------|----------------|
| astrology (with birth data) | `authoritative` + `derived` present |
| field / pattern_ledger | mostly `derived` |
| fallback items | present but not dominant |

**Flag if:**
- fallback > ~40% overall
- `authoritative` nearly absent where expected (birth data exists but no natal item)

---

### B. Prompt role mix
**Endpoint:** `?source=db&window=24`

| Role | Expectation |
|------|-------------|
| `interpretation` | dominant |
| `uncertainty` | some present |
| `question_seed` | visible (especially from fallback items) |
| `excluded` | low |

**Flag if:**
- `question_seed ≈ 0` (fallback not converting to question seeds as intended)
- `excluded` unusually high (governance may be over-blocking)

---

### C. Blocked reasons
**Endpoint:** `?source=db&window=24`

**Healthy:** low but non-zero, mostly edge cases (relative_time, vague causal claims).

**Flag if:**
- One rule spikes suddenly (e.g., `identity_claim`, `relative_time`)
- Blocked rate > ~20% overall

---

### D. Memory yield vs prompt yield
**Endpoint:** `?source=db&window=24` (summary cards)

| Signal | Expectation |
|--------|-------------|
| memory yield | lower than prompt yield (strict filter working) |
| prompt yield | higher (items reach model but not long-term memory) |

**Flag if:**
- memory ≈ prompt (memory filter too permissive)
- memory near zero (overly restrictive)

---

## 3. Mode comparison (quick scan, every 2 days)

**Endpoint:** `?source=db&window=48&byMode=1`

Look for:
- Major fallback imbalance across modes (e.g., Fire >> Water)
- One mode producing unusually high blocked counts
- Role distribution differences that seem anomalous

> Do not tune yet. Just note patterns.

---

## 4. Trend check (every 1–2 days)

**Endpoint:** `?source=db&window=72&trend=1`

Look for:
- Spikes correlated with deploys
- Slow drift in fallback or blocked rates
- Sudden drops (ingestion failure)

---

## 5. Hard failure signals — investigate immediately

| Signal | Likely cause |
|--------|-------------|
| Telemetry drops to zero | Ingestion broken — check oracle route wiring |
| All items become fallback | Authority detection failure |
| Blocked reasons spike all domains | Rule misfire — check governance contracts |
| Memory yield jumps unexpectedly | Prompt ingress bug |

---

## 6. What NOT to do yet

- Change guardrails or block rules
- Tune thresholds
- Rebalance domain weights
- Adjust `promptRole` logic

You don't have enough data yet. Intuition is not calibration.

---

## 7. Phase 24 output (end of day 3–7)

Produce a short memo covering:
1. Authority distribution snapshot (overall + by domain)
2. Role distribution snapshot (overall + by mode)
3. Top 3 block reasons
4. Any anomalies by domain or mode
5. 2–3 hypotheses (not fixes)

That memo becomes the input to **Phase 25 (calibration)**.

---

## Reference endpoints

| Purpose | URL |
|---------|-----|
| Live inspection | `/api/debug/symbolic-telemetry` |
| 24h summary | `?source=db&window=24` |
| 72h trend | `?source=db&window=72&trend=1` |
| Mode breakdown | `?source=db&window=48&byMode=1` |
| Domain filter | `&domain=astrology` (or field, pattern_ledger, journal) |
| Panel | `/studio/metrics?symbolic=1` |

Panel requires: `MAIA_DEBUG_PANEL_ENABLED=true` in environment.
