# AIN Development Continuation Record — proposed contract

**Status:** ⚠️ **SUPERSEDED AS A STATUS LINE — the design content below remains valid.**

This document was written as a proposal and said *"Not installed as a skill. No harness
change."* That is **no longer true** and had already stopped being true before this line was
corrected — a documentation/reality drift of exactly the class this corpus calls
`feedback_documentation_as_false_control_surface`.

What is actually installed, verified 2026-08-09:

| claim in the original status line | reality |
|---|---|
| "not installed as a skill" | `.claude/skills/continue/SKILL.md` exists and is invocable |
| "no harness change" | `scripts/builder/continue.mjs` implements `--init` / `--validate` / `--handoff` |
| written to `docs/handoff/<...>` | actual path is **`docs/handoffs/`** (plural); `docs/handoff/` never existed |

The **schema, field rules, and verify-before-trust discipline below remain the governing
design** and were implemented rather than replaced — with two extensions recorded in
`docs/architecture/CLOSED_LOOP_1_DESIGN_AND_PROOF_2026-08-09.md`: `BASELINE` was renamed
**`DRIFT PROBES`** (it exists to be contradicted, not trusted), and `CAPABILITY CONSTRAINTS`
+ `INSTRUMENTS USED` were added. Where this file and the Closed Loop 1 design disagree on
section names, **the design document and the executable validator win.**

Horizon III addition (2026-08-09): a *successful* `--handoff` also releases the session's
write claim and Claude concurrency slot; an *invalid* packet releases neither.
**Parent:** [`CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md`](./CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md) §4

**Purpose:** compress one engineering episode into the minimum sufficient state to reconstruct working
context in a fresh session. **Not** a transcript summary, not a diary, not a status report.

**Budget: ≤ 3,000 tokens.** For scale: a fresh subagent already starts at 22,841 tokens and a main
session at 72,434. A record that exceeds ~5 k has failed its purpose and should be split, with detail
written to a normal doc and *referenced* by path.

**Written to:** `docs/handoff/<branch>_<YYYY-MM-DD>_<slug>.md` — a real file, git-tracked, so the
record is itself evidence rather than chat state.

---

## Schema

```
# CONTINUATION RECORD — <slug>
episode: <what this episode was>   closed: <ISO date>   record-version: 1

## GOAL
One sentence. The goal being served, not the last task performed.

## BASELINE                                   ← every field machine-verifiable
branch:          feature/x
head_sha:        abc1234
worktree:        /Users/soullab/MAIA-SOVEREIGN
dirty:           yes|no  (+ file count)
production_sha:  def5678 | n/a
migrations:      applied through <id> | none

## GOVERNING DECISIONS
Only decisions a successor MUST NOT relitigate. Each: decision — where it is recorded.
- <decision> → docs/canon/X.md
Omit anything already durable in canon; cite the path instead of restating it.

## ESTABLISHED                                ← evidence-backed only
- <finding> — evidence: <command | file:line | measured value>
A claim with no evidence field does not belong here. It belongs in OPEN.

## CHANGED
- path/to/file.ts:LNN — what and why (one line)
- commits: <sha> <subject>

## VERIFIED
- <gate>: PASS|FAIL — <how it was run> — <when>
Name the scope. "typecheck passes" without scope is the failure mode this project already
documented (docs/ops/TYPECHECK_GATE_COVERAGE_AUDIT_2026-07-30.md).

## OPEN
Genuinely unresolved questions only. Not a wishlist, not deferred nice-to-haves.

## DO NOT REDISCOVER                          ← highest value per token
- <hypothesis> — FALSIFIED by <evidence>
- <path> — dead end because <reason>

## NEXT COHERENT ACTION
One action. Specific enough to start without asking a question.
```

## Field rules

- **BASELINE is verifiable or it is absent.** Every field must be checkable by a command.
- **ESTABLISHED requires an evidence field.** No evidence → it is a hypothesis → it goes in OPEN.
- **GOVERNING DECISIONS cite, never restate.** Canon lives in `docs/canon/`; duplicating it into the
  record is exactly the duplication the context audit warns about.
- **DO NOT REDISCOVER is mandatory, even if empty.** Write `- none` rather than dropping the heading.
  Falsified hypotheses are the most expensive thing to re-derive and the cheapest to record. This
  session produced three (Kimi routed into Claude Code; oversized knowledge kernel; Bash as the
  flooder) at a cost of ~40 requests. Recording them costs ~60 tokens.
- **NEXT COHERENT ACTION is singular.** A list means the episode did not actually close.

## `/ain-resume` — verify before trusting

Code moves between sessions. A record is a **claim about the repo**, not the repo. The resume pass
must run before the record is used:

| check | on failure |
|---|---|
| `git rev-parse --abbrev-ref HEAD` == `branch` | STOP — wrong branch, ask |
| `git rev-parse --short HEAD` == `head_sha` | WARN — replay `git log <sha>..HEAD`, record is stale |
| `git status --porcelain` matches `dirty` | WARN — uncommitted work the record did not know about |
| every path in CHANGED exists | DOWNGRADE — record is unreliable, verify each claim |
| every VERIFIED gate re-runnable | do not inherit PASS across a SHA change |
| `production_sha` vs live `GIT_COMMIT` | WARN if drifted (see CLAUDE.md deploy verify) |

**A record that fails verification is downgraded to a hypothesis, never silently used.** Inheriting a
stale PASS is worse than having no record — it launders an unverified claim into a starting premise.

## Open questions on this contract

- Should the record be produced by the closing session (knows the most, may rationalize) or by a
  fresh subagent reading the transcript (independent, may miss tacit state)? **Untested.** The
  subagent variant is cheap to try and worth an arm of the experiment.
- Does a ≤3 k record actually preserve enough to beat re-derivation? That is the reorientation-cost
  measurement in [`CONTEXT_CONTROL_EXPERIMENT_PROTOCOL.md`](./CONTEXT_CONTROL_EXPERIMENT_PROTOCOL.md),
  and it is unanswered.
- Tacit orientation — the shape of the codebase in working memory — is not captured by any field
  above, and may not be capturable in text at all. Named as a known gap, not solved.
