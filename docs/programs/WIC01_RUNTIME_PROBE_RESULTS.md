# WIC01-RUNTIME-BOUNDARY-PROBES — results

**Program:** `MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01`
**Lane mandate:** factual only. **No fixes, migrations, registry changes, or tier corrections from this lane.**
**Status:** ⛔ **NOT YET RUN** — awaiting execution from a host with LAN access to minisforum

---

## Why this file is empty

The probe lane cannot execute from a Claude Code cloud session. Verified 2026-08-31 in this container:

```
ssh client        : not installed
~/.ssh            : empty (no keys)
minisforum        : no DNS or /etc/hosts entry
```

This is **structural, not incidental** — the cloud session is an isolated sandbox with no path to the LAN host that serves `soullab.life`. The probes must be run from the Mac Studio, or any host that can `ssh soullab@minisforum`.

**Nothing below is guessed.** Every row stays `UNKNOWN` until real output lands here.

## How to run

```bash
bash scripts/wic01-runtime-boundary-probes.sh | tee wic01-probes-$(date +%F).txt
```

Then paste the output into §Raw output below and fill the table. A probe that failed to run is `UNKNOWN` — **not zero, and not absent.**

---

## Facts to settle

| # | Fact | Why it matters | Result |
|---|---|---|---|
| 1 | Production `GIT_COMMIT` | Closes the Phase 0 custody gap. The census ran against `fc66b47`, **never against verified production** — every static finding is currently unconfirmed against what members actually meet | `UNKNOWN` |
| 2 | `DEPLOY_LANE` on the live container | Confirms the running image came through the deploy-lane lock | `UNKNOWN` |
| 3 | Model routing + fallback env | Census row 30. Is a fallback configured in production at all? | `UNKNOWN` |
| 4 | Tier distribution (7d) | Decides what D8 (DEEP memory loss) actually costs members. If DEEP is ~0% of real turns it is a correctness defect but not a lived one — changes P3's **priority**, not its verdict | `UNKNOWN` |
| 5 | `member_relational_signals` write liveness | Finding D16. The write path swallows errors via `.catch()`; rows present = writes landing | `UNKNOWN` |
| 6 | `memory_transition_records` existence + rows | Census row 23 | `UNKNOWN` |
| 7 | `semantic_memory_vectors` exists in deployed DB? | Finding D10. **Existence check only** — feeds the P1 adjudication ladder, authorizes no migration and no deletion | `UNKNOWN` |
| 8 | `lattice_nodes` exists in deployed DB? | Finding D11. Same discipline | `UNKNOWN` |
| 9 | `memoryHealth` log lines (1h) | Finding D1. P1's acceptance test is that a failed dependency reports as failed; today it reports `empty` | `UNKNOWN` |
| 10 | Corpus Callosum emission by tier (24h) | Confirms whether DEEP emits agent_runs rows at all | `UNKNOWN` |

---

## What each outcome unlocks

**Fact 1 (production SHA)** is the one that can invalidate work rather than merely inform it. If production is materially behind `fc66b47`, some census findings describe code members are not running, and the affected rows re-enter `CENSUSING` per the charter's `INVALIDATED → rebind` transition. This is the reason the probe lane is not optional.

**Facts 7 and 8** feed the P1 adjudication ladder and nothing else:

```text
writer + legitimate reader              → register
writer + intended future reader         → explicitly dormant / deferred
writer + no consumer, no purpose        → CANDIDATE for retirement
unknown                                 → stays unknown
```

A table existing in the deployed DB does **not** make it canonical, and a table absent does **not** authorize creating it. Both remain rulings, not inferences.

---

## Raw output

```text
(paste the tee'd probe output here)
```

---

## Adjudication

Left blank until the facts land. **P1 does not open before this section is written.**
