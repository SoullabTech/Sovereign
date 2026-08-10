---
name: jarvis
description: Show Builder OS / JARVIS operational state — Claude capacity, local request rate, write claims, read observers, queued units, collisions, and what needs the founder. Use when asked "what's going on", "what needs me", "is anything running", "how many Claude lanes are active", "are we near the limit", or before starting writable work in a shared checkout.
---

# /jarvis — what is going on right now

Horizon III founder status surface. One command, two control axes.

```bash
node scripts/builder/session.mjs status
```

Add `--json` for machine-readable output.

## What it answers

| Section | Question |
|---|---|
| **Claude sessions active** | How much scarce reasoning capacity is committed, out of what budget, and where that budget came from |
| **LOCAL REQUEST RATE** | 5m / 30m / 60m / 5h request counts, ratio to local baseline, band, distinct sessions |
| **Active** | Each governed session: work unit, model, mode, branch, worktree, duration, owner |
| **Collisions** | Sessions whose artifact moved underneath them (`CONTENDED`) |
| **Waiting for founder** | Stale claims needing explicit recovery, queued units, unresolved collisions |
| **Founder overrides** | Any concurrency override in effect, with its reason and author |

## Reading the rate bands

`NORMAL` < 2× baseline · `ELEVATED` 2–4× · `HIGH` 4–8× · `ANOMALOUS` ≥ 8×.

The 2026-08-09 exhaustion measured ~11.8× — it registers ANOMALOUS. At ANOMALOUS the
surface **recommends handoff**; it never throttles, queues, or kills a session. Acting
on the reading is a human decision.

⛔ **These are LOCAL REQUEST-RATE OBSERVABILITY figures — transcript-derived counts, not
Anthropic quota counters, not subscription units, not a model of any allowance formula.**
Anthropic does not expose quota state locally. Treat them as early warning about *shape*,
never as a balance.

## The UNGOVERNED line — read it first

The budget governs only sessions that called `session.mjs open`. When transcripts show
more distinct sessions than the registry knows about, the surface says so explicitly:

```
⚠ 27 distinct sessions observed in transcripts vs 0 Builder-governed — 27 lane(s) are UNGOVERNED.
```

A governor reporting `1 / 1` while 27 lanes run would be the most dangerous possible
output, so this line exists to make the limit of its own authority visible. **It is not
a bug; it is the honest boundary.** A lane becomes governed by opening through Builder,
not by being noticed.

## Related commands

```bash
node scripts/builder/rate.mjs                    # rate axis alone
node scripts/builder/session.mjs report --json   # observability record over time
node scripts/builder/orient.mjs                  # /orient — includes governance state
```

## Proof

```bash
node scripts/builder/__tests__/session-proof.mjs           # 54 — capacity + ownership + collision + recovery
node scripts/builder/__tests__/rate-proof.mjs              # 24 — bands, burst, caveats, mutation controls
node scripts/builder/__tests__/loop-governance-proof.mjs    # 28 — /orient + /continue integration
node scripts/builder/__tests__/incident-scenario-proof.mjs  # 18 — the 2026-08-09 shape, refused
```

Evidence basis: `docs/ops/CLAUDE_CODE_RESET_WINDOW_ATTRIBUTION_2026-08-09.md`
(*"it was rate, not weight"*).
