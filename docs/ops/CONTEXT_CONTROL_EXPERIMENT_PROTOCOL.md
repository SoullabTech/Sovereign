# Context-Control Experiment Protocol

**Status:** design only. Nothing enforced, nothing installed.
**Parent:** [`CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md`](./CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md) §5–7
**Instrument:** `scripts/audit-session-context-cost.py`

---

## The question the experiment must answer

Not *"does episodic working reduce tokens?"* — it trivially does, by ending sessions.

> **Does episodic working reduce context burden per unit of shipped work, after paying the
> reorientation cost?**

The distinction matters because `r(cache_read, requests) = +0.955` is partly tautological: more
requests mechanically means more cache reads. Cutting sessions shorter will always look like a win on
tokens alone. **The denominator is the experiment.**

## Metrics

| metric | definition | source |
|---|---|---|
| **reorientation cost** | requests from session start → first *accepted* edit | transcript |
| **re-derivation events** | fresh session re-runs work the record already contained | manual tag |
| requests per shipped unit | requests ÷ (commits + verified gates) | git + transcript |
| avg context per request | cache_read ÷ requests | audit script |
| peak context | max window observed | audit script |
| tool-result tokens | by tool, main-thread only | audit script |
| continuity errors | wrong branch / stale SHA / lost decision after handoff | manual tag |
| work completed | commits landed, gates passed | git |

`reorientation cost` and `re-derivation events` are the two that decide it. Everything else is
already measurable retrospectively and will move in the obvious direction.

## Arms

- **A — baseline (retrospective).** Already available. 30 d of uninterrupted sessions, computed by the
  audit script. No new work needed.
- **B — episodic (forward).** Same class of work, closed at a semantic boundary with an
  [AIN Continuation Record](./AIN_HANDOFF_RECORD_CONTRACT.md), resumed fresh.
- **C — isolation-only (forward, cheapest).** No handoff at all. Only §"smallest safe experiment"
  changes: Read-for-analysis routed to `ctx_execute_file`, verification work pushed to subagents.

**Run C first.** It is one paragraph of documentation, it targets 31% + ~40% of the tool-result flood,
and it requires no new mechanism. If C alone materially moves avg-context-per-request, B may not be
needed — and B carries all the continuity risk.

Match arms on task category (`implementation`, `ops/deploy`, `ui/browser-verify`), because the audit
shows category dominates efficiency: implementation runs 147× cache-read per output token, ops/deploy
270×. Comparing an ops session to an implementation session measures the category, not the arm.

## Candidate handoff signals — advisory, never blocking

```
request_count       >= 400          # experimental starting point, NOT a rule
peak_context        >= 350_000
tool_result_accum   >= 1_500_000 tok this session
AND (required)      coherent work unit complete
```

The semantic gate is required, not preferred. Heavy sessions concentrate in `ops/deploy` and
`ui/browser-verify` — precisely where a mid-migration or mid-deploy cut does real damage. **The
counter raises a hand; the human closes the episode.**

Thresholds are provisional. Derivation: the 30-day corpus puts p50 session at 32 M cache-read and the
top-25 floor at ~337 M; 400 requests sits near where sessions begin crossing into the top decile. That
is a starting point drawn from distribution shape, not a validated boundary.

## Instrumentation

Read-only, no hooks required to observe:

```bash
python3 scripts/audit-session-context-cost.py --days 1     # daily watch
python3 scripts/audit-session-context-cost.py --days 30    # trend
```

Proposed additions (not built):
- `--live <sessionId>` — current request count, avg context, tool-result accumulation for an active
  session, so the advisory signal can be checked on demand rather than inferred.
- `--by-tool` — promote the tool-result table from ad-hoc analysis into the script, so the Read-share
  metric is tracked rather than re-derived.

Hooks would only be needed to *enforce*. Out of scope for this experiment by design — and §1 of the
parent document is the reason to be cautious about the alternative: **an unenforced instruction
behaves like the Read rule**, which is to say it self-suspends. If week-one shows Read share
unchanged, that is evidence the documentation route does not work here, and the finding is the
enforcement question — not a bigger paragraph.

## Lane B — local tier evidence packet test

Infrastructure exists (`~/bin/maia-code`, `~/.maia-env`, Ollama :11434, `maia-coder:latest`,
`qwen3-coder:30b`, `deepseek-r1:8b`). Nothing to build.

Test: identical tool-heavy task (log triage, build failure diagnosis, repo archaeology) on local tier
vs Claude subagent. Compare:

1. **tokens returned to parent** (target ≤ 500) — the actual objective
2. **evidence completeness** — did it find what a Claude subagent found?
3. **false confidence rate** — compact packets that are *wrong*

Metric 3 is the one that decides Lane B. A bounded return makes errors harder to notice, so a local
tier that returns small, confident, incomplete evidence is worse than an expensive correct one. State
this as the hypothesis to falsify, not a hoped-for result.

## Stopping conditions

Abandon or revise if:
- Arm B reorientation cost exceeds ~15% of a typical session's requests (handoff costs more than it saves)
- Any continuity error causes incorrect work touching production or migrations
- Arm C shows no movement in Read share after a week of use (→ the enforcement question, above)
