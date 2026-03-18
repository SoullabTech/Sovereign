# Phase 24 — Daily Monitoring Routine

> 5 minutes, once or twice a day. Observe, don't tune.

---

## Once (after merge)

1. Confirm migrations applied and smoke test passes (see `phase-24-production-monitoring.md`)
2. Trigger 1–2 real oracle calls
3. Verify `/api/debug/symbolic-telemetry` shows non-zero in both live and DB modes

That's the only "setup" task.

---

## Daily rhythm (days 1–7)

### Use MAIA normally

The most valuable thing is varied, authentic traffic:
- Different modes (fire, water, earth, air)
- Emotionally complex conversations, not just neutral ones
- Some sessions where you have astrology context loaded
- Some without

Don't stress-test. Just use it.

---

### Quick panel check (5 min)

Open `/studio/metrics?symbolic=1`, switch to **24h DB mode**.

Look at four numbers:

| What | Flag if |
|------|---------|
| Fallback rate | > ~40% |
| Blocked rate | > ~20% |
| Memory yield vs prompt yield | Memory ≈ prompt (too permissive) or memory near zero |
| Mode breakdown | One mode looks wildly different from others |

You don't need to understand why yet. Just notice.

---

### Jot down anything that felt off

If a conversation felt strange, note:
- What mode you were in
- What kind of conversation (emotional, planning, depth, casual)
- What felt mismatched

One line is enough. You're building a comparison set for later.

---

## What not to do this week

- Don't tweak thresholds
- Don't rewrite guardrails
- Don't fix small oddities
- Don't interpret too early

The pattern needs time to reveal itself.

---

## End of days 3–7

Collect your notes and write a short memo (Phase 25 input):
1. What did the telemetry show? (authority mix, role mix, top block reasons)
2. What felt off in real use?
3. Where did felt experience and telemetry diverge or align?
4. 2–3 hypotheses — not fixes, just observations

That memo becomes the calibration starting point.
