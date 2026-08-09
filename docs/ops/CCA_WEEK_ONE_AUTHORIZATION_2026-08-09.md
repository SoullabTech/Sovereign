# CCA Week-One Experiment — Founder Authorization

**Date**: 2026-08-09 · **Status**: AUTHORIZED (founder), with modifications below.
**Parent**: `CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md` §"Smallest safe experiment" ·
`CONTEXT_CONTROL_EXPERIMENT_PROTOCOL.md`.
**Independent lane** (Ruling 4/5): not blocked by, and not blocking, Builder OS memory work.

## Authorized items

### 1. Read-for-analysis routing — with explicit compliance instrumentation

`ctx_execute_file` becomes the stated default for analysis-heavy Read operations (CLAUDE.md
carve-out amended accordingly). **Measure, not merely instruct:**

- eligible Reads (file not subsequently edited in-session)
- routed Reads (`ctx_execute_file` calls)
- bypassed Reads (eligible but Read anyway)
- context / tool-result volume (existing per-tool tables in `audit-session-context-cost.py`)
- correctness failures attributable to routing

**⛔ Do not interpret low adoption as failure of the routing strategy** — distinguish *policy
failure* (routing was wrong for the work) from *enforcement failure* (instruction was ignored).
Baseline compliance proxy available today: daily `Read` vs `ctx_execute_file` call counts from the
existing audit instrument (30-day baseline: 4,681 vs 108). Finer eligible/bypassed classification
requires Read→Edit correlation per session — an instrument extension, authorized as part of this
experiment.

### 2. Image-heavy verification — subagent-first

For browser / simulator / screenshot verification: the subagent looks; the parent receives ≤500
tokens of findings. This addresses the ~40% of tool-result flood that is pixels and structurally
unroutable through `ctx_*`. Measure context reduction **and verification quality**.

### 3. Daily observe-only audit

```bash
python3 scripts/audit-session-context-cost.py --days 1
```

Run daily for the week. **No automatic remediation, no thresholds enforced, no forced handoff.**

## End-of-week decision rule (founder-set)

Distinguish **instruction effectiveness** from **mechanism effectiveness**. If instruction-only
routing again materially underperforms mechanically enforced routing (the 12× precedent:
hook-governed Bash at 258 tok/call vs prose-governed Read at 3,169), **bring back a hook design —
do not add stronger prose.** The empty PreToolUse/Read matcher in context-mode is the natural
attachment point; designing its policy is *not* authorized by this document.

## Week-one log

| day | Read calls | ctx_execute_file calls | notes |
|---|---|---|---|
| 2026-08-09 (baseline set) | — | — | authorization; CLAUDE.md amended |
