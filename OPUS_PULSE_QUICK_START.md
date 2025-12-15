# Opus Pulse — Quick Start Guide

**The Opus Pulse nervous system is now wired.** Here's how to get it running.

---

## Step 1: Run Database Migration

Create the `opus_axiom_turns` table:

```bash
cd ~/MAIA-SOVEREIGN

psql -h localhost -U postgres -d maia_consciousness \
  -f lib/database/maia-opus-axioms-schema.sql
```

**Expected output:**
```
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
```

---

## Step 2: Verify Logging Is Working

**Talk to MAIA via the Oracle endpoint:**

The logging happens automatically every time someone uses the Oracle conversation endpoint.

**Check the database:**

```bash
psql -h localhost -U postgres -d maia_consciousness \
  -c "SELECT id, timestamp, facet, element, is_gold, warnings, violations, rupture_detected FROM opus_axiom_turns ORDER BY id DESC LIMIT 5;"
```

**You should see rows like:**
```
 id |         timestamp          |  facet  | element | is_gold | warnings | violations | rupture_detected
----+----------------------------+---------+---------+---------+----------+------------+------------------
  1 | 2025-12-14 10:30:15.123+00 | WATER_2 | water   | t       |        0 |          0 | f
  2 | 2025-12-14 10:25:42.456+00 | FIRE_1  | fire    | t       |        0 |          0 | f
```

**View full Opus evaluation:**

```bash
psql -h localhost -U postgres -d maia_consciousness \
  -c "SELECT axioms FROM opus_axiom_turns ORDER BY id DESC LIMIT 1;" \
  | jq
```

---

## Step 3: Access the Dashboard Skeleton

**Navigate to:**
```
http://localhost:3000/admin/opus-pulse
```

**Current status:**
- ✅ Layout and components rendered
- 🔜 Data wiring (needs API endpoints)

The dashboard skeleton is ready. Component placeholders show where data will appear once API endpoints are created.

---

## Step 4: Next Implementation Phase

To make the dashboard live, create these API endpoints:

**`/app/api/admin/opus-pulse/summary/route.ts`**
```typescript
// Query last 30 days, return Gold/Warning/Rupture percentages
```

**`/app/api/admin/opus-pulse/axiom-heatmap/route.ts`**
```typescript
// Aggregate by axiom → pass/warning/violation counts
```

**`/app/api/admin/opus-pulse/facet-heatmap/route.ts`**
```typescript
// Aggregate by facet+element → Gold/Warning/Rupture counts
```

**`/app/api/admin/opus-pulse/turns/route.ts`**
```typescript
// Recent turns with filters
```

---

## Architecture Summary

**What's flowing:**
```
User ↔ MAIA (Oracle)
   ↓
Opus Axioms Evaluation (8 axioms)
   ↓
logOpusAxiomsForTurn() (non-blocking)
   ↓
opus_axiom_turns table (PostgreSQL)
   ↓
[API endpoints - TODO]
   ↓
Admin Dashboard (/admin/opus-pulse)
   ↓
Stewards see MAIA's ethical alignment
```

**What's logging:**
- Facet (e.g., `FIRE_1`, `WATER_2`)
- Element (fire, water, earth, air, aether)
- Gold status (all 8 axioms passed)
- Warning count (axioms stretched)
- Violation count (axioms broken)
- Rupture detection flag
- Full evaluation JSONB (all notes, per-axiom status)

---

## Troubleshooting

**No rows in `opus_axiom_turns`?**
- Check if Oracle endpoint is being used (not other MAIA endpoints)
- Check console for `🏛️ [MAIA Opus Axioms]` logs
- Check for `❌ [OpusAxioms] Logging error` in console

**Table doesn't exist?**
- Run the schema migration again
- Check connection to `maia_consciousness` database
- Verify PostgreSQL is running

**Dashboard shows "No data"?**
- Expected! API endpoints not created yet
- Component TODOs show what needs to be wired

---

## Files Reference

**Backend:**
- `/lib/database/maia-opus-axioms-schema.sql` — DB schema
- `/lib/learning/opusAxiomLoggingService.ts` — Logging function
- `/app/api/oracle/conversation/route.ts` — Integrated logging call

**Frontend:**
- `/app/admin/opus-pulse/page.tsx` — Main dashboard
- `/components/admin/opus-pulse/*.tsx` — Component stubs

**Documentation:**
- `/Community-Commons/OPUS_PULSE_WIRING_COMPLETE.md` — Full details
- `/Community-Commons/OPUS_PULSE_IMPLEMENTATION_COMPLETE.md` — Phase 1 summary
- `/OPUS_PULSE_QUICK_START.md` — This file

---

**Status:** 🏛️ Wired and logging ✅
**Next:** API endpoints + live dashboard data 🚀
