# Opus Pulse — System Verification ✅

**Database migration:** ✅ Complete
**Table created:** ✅ opus_axiom_turns with 4 indexes
**Current data:** 0 turns (ready for logging)

---

## Verification Steps

### 1. Check Dev Server Status

Your Next.js dev server should be running:
```bash
cd ~/MAIA-SOVEREIGN
npm run dev
```

**Expected output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in Xms
```

---

### 2. Test Dashboard Loads

Visit: http://localhost:3000/admin/opus-pulse

**Expected:**
- Page loads without errors
- Shows "Opus Pulse Dashboard" header
- Components display (currently with "No data" messages)
- No console errors

---

### 3. Test API Endpoints

**Terminal 1: Summary endpoint**
```bash
curl http://localhost:3000/api/admin/opus-pulse/summary
```

**Expected response:**
```json
{
  "windowDays": 30,
  "counts": {
    "total": 0,
    "gold": 0,
    "edge": 0,
    "rupture": 0
  },
  "percentages": {
    "goldPercent": 0,
    "edgePercent": 0,
    "rupturePercent": 0
  }
}
```

**Terminal 2: Turns endpoint**
```bash
curl http://localhost:3000/api/admin/opus-pulse/turns
```

**Expected response:**
```json
{
  "items": []
}
```

**Terminal 3: Facet heatmap**
```bash
curl http://localhost:3000/api/admin/opus-pulse/facet-heatmap
```

**Expected response:**
```json
{
  "windowDays": 30,
  "cells": []
}
```

---

### 4. Generate Test Data

**Option A: Use Oracle endpoint directly**
```bash
curl -X POST http://localhost:3000/api/oracle/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I keep falling into the same pattern with my father. Every time I think I'\''ve moved past it, it comes back.",
    "userId": "test-user-001",
    "sessionId": "test-session-001",
    "conversationHistory": []
  }'
```

**Option B: Use the actual MAIA interface**
- Navigate to your MAIA chat interface
- Have a real conversation
- Oracle endpoint will automatically log Opus evaluations

---

### 5. Verify Data Logged

**Check database:**
```bash
psql -h localhost -U postgres -d maia_consciousness \
  -c "SELECT id, timestamp, facet, element, is_gold, warnings, violations FROM opus_axiom_turns ORDER BY id DESC LIMIT 5;"
```

**Expected output (after conversations):**
```
 id |         timestamp          |  facet  | element | is_gold | warnings | violations
----+----------------------------+---------+---------+---------+----------+------------
  1 | 2025-12-14 15:30:42.123+00 | WATER_2 | water   | t       |        0 |          0
```

**Check JSONB details:**
```bash
psql -h localhost -U postgres -d maia_consciousness \
  -c "SELECT axioms->'notes' as notes FROM opus_axiom_turns ORDER BY id DESC LIMIT 1;"
```

**Expected:** Array of axiom evaluation notes

---

### 6. Verify Dashboard Shows Data

**After generating conversations:**

Visit: http://localhost:3000/admin/opus-pulse

**You should now see:**

✅ **Global Opus Pulse** shows real percentages
✅ **Facet × Element Grid** shows distribution
✅ **Recent Turns** shows timeline entries

---

## Troubleshooting

### Dashboard loads but shows "No data"
- Generate conversations via Oracle endpoint
- Check database has rows: `SELECT COUNT(*) FROM opus_axiom_turns;`
- Check browser console for fetch errors

### API returns 500 errors
- Check PostgreSQL is running
- Verify connection string in `.env`
- Check Next.js server console for errors

### Conversations not logging to database
- Check server console for `🏛️ [MAIA Opus Axioms]` log messages
- Check for `❌ [OpusAxioms] Logging error` messages
- Verify Oracle endpoint is being used (not other MAIA routes)

### Database permissions error
- Run: `GRANT ALL ON opus_axiom_turns TO postgres;`
- Restart dev server

---

## Quick Health Check

Run all verification commands:

```bash
# 1. Database check
psql -h localhost -U postgres -d maia_consciousness \
  -c "SELECT COUNT(*) FROM opus_axiom_turns;"

# 2. API check
curl -s http://localhost:3000/api/admin/opus-pulse/summary | jq '.counts.total'

# 3. Dashboard check (open in browser)
open http://localhost:3000/admin/opus-pulse
```

---

## Next Steps

Once verification is complete:

**If everything works:**
1. Generate 10-20 conversations to get meaningful data
2. Review dashboard for patterns
3. Share with team for feedback
4. Plan Phase 3 enhancements

**If issues found:**
1. Check troubleshooting section above
2. Review server console logs
3. Verify all files were created correctly
4. Check `/Community-Commons/OPUS_PULSE_LIVE_DASHBOARD_COMPLETE.md` for details

---

**Status:** 🏛️ System ready for testing
**Database:** ✅ Migrated and indexed
**API:** ✅ Endpoints deployed
**Dashboard:** ✅ UI ready

**Generate conversations and watch MAIA's ethical nervous system come alive.** 🌀
