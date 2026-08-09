# Claude Code Context-Control Architecture — Investigation

**Date:** 2026-08-09 · **Status:** investigation only. No harness change made, no forced handoff implemented, no routing changed.

**Predecessors:** [routing audit](./CLAUDE_CODE_ROUTING_AND_COST_AUDIT_2026-08-09.md) · [session burden audit](./SESSION_CONTEXT_BURDEN_AUDIT_2026-08-09.md)
**Instrument:** `scripts/audit-session-context-cost.py`

Governing finding carried forward: `r(cache_read, requests) = +0.955`, `r(cache_read, initial_context) = -0.010`.
Request density is the operational variable. The knowledge kernel is not.

---

## 1. `ctx_execute` — what it actually is, and why it is under-used

**What it is.** `context-mode@context-mode` v1.0.22, a plugin-provided MCP server at
`~/.claude/plugins/cache/context-mode/context-mode/1.0.22/`. It registers four hook classes
(`hooks/hooks.json`):

| hook | matcher | actual behavior |
|---|---|---|
| PreToolUse | **Bash** | **hard interception** — `curl`/`wget`/inline-HTTP are replaced with an error |
| PreToolUse | **WebFetch** | **hard denial** — URL extracted, redirected to `ctx_fetch_and_index` |
| PreToolUse | **Read** | matcher registered — **but `pretooluse.mjs` contains no Read policy** |
| PostToolUse | all | session capture / indexing |
| PreCompact | — | snapshot |

**Isolation behavior.** Real: code runs in a subprocess, output is indexed into a local FTS5 store,
and only what you `print()` returns to context. Confirmed by the numbers — `ctx_execute` averages
**497 tokens per call across 4,732 calls** against `Read`'s **3,169 across 4,681**.

**Why it is under-used — the causal answer.** It isn't ignored; adoption is climbing
(4.5% of routable tool calls in June-w4 → **26.9% in Aug-w1**). The gap is *which* tool got enforcement:

| tool | governance | calls | avg tok/call | share of all tool-result tokens |
|---|---|---|---|---|
| **Bash** | **mechanical interception** | 17,894 | **258** | 9.7% |
| **Read** | **prose guidance with an explicit carve-out** | 4,681 | **3,169** | **31.0%** |

**The tool with a hook is 12× cleaner per call than the tool with a paragraph.** CLAUDE.md polices
Bash hardest — and Bash is already the best-behaved high-volume tool in the system. Meanwhile the
Read rule ships with its own escape hatch (*"If you are reading a file to Edit it → Read is correct"*),
which is true of nearly every read in an implementation session, so the rule self-suspends. One Read
call put **167,063 tokens** into a window.

**Conclusion: enforcement works, instruction does not.** That is the reusable lesson, and it applies
to whatever we build next — a handoff threshold that is documented but not instrumented will behave
exactly like the Read rule.

## 2. Tool-result flood, ranked — where the 18.4% actually comes from

47.8 M tokens of tool results entered context in 30 days (41.7 M main-thread, 6.1 M sidechain). Each
one is then re-read by every subsequent request in that session — that is the multiplier from 47.8 M
to 4.44 B.

| rank | tool | calls | Mtok | % | avg | max | routable via `ctx_*`? |
|---|---|---|---|---|---|---|---|
| 1 | **Read** | 4,681 | 14.83 | **31.0%** | 3,169 | 167,063 | ✅ `ctx_execute_file` |
| 2 | **iOS `control`** | 375 | 10.12 | **21.2%** | **26,998** | 168,390 | ❌ **images** |
| 3 | **browser `computer`** | 1,646 | 6.78 | 14.2% | 4,116 | 40,174 | ❌ **images** |
| 4 | Bash | 17,894 | 4.62 | 9.7% | 258 | 7,600 | ✅ (mostly already) |
| 5 | ctx_batch_execute | 1,059 | 4.04 | 8.5% | 3,818 | 13,191 | — is the mitigation |
| 6 | ctx_execute | 4,732 | 2.35 | 4.9% | 497 | 12,090 | — is the mitigation |
| 7 | screenshots (3 tools) | 346 | 2.16 | 4.5% | up to 44,376 | 60,219 | ❌ **images** |

**~40% of the flood is pixels, not text.** `ctx_execute` cannot compress an image — this is a hard
limit on your Lane A hypothesis, and it is the strongest argument for subagents over `ctx_execute` for
verification work. A screenshot cannot be summarized by a subprocess; it can only be *looked at by
someone else who then reports*. That is a subagent, by definition.

`ctx_execute_file` — the correct instrument for #1 — has **108 calls against Read's 4,681.**

## 3. Subagents as context-isolation boundaries — measured, and the evidence is strong

| | main thread | subagent (sidechain) |
|---|---|---|
| median **starting** context | 72,434 tok | **22,841 tok** (3.2× lighter) |
| share of all cache-read | 98.3% | **1.7%** |
| **what it returns to parent** | — | **p50 279 tok · mean 696 · p90 1,864 · max 4,010** |

451 `Agent` calls returned **0.32 M tokens total** — 0.7% of tool-result volume. A subagent can burn
50 k tokens reading logs and hand back 279 tokens. The boundary already holds, and it holds *tightly*
— the max return observed in 30 days is 4,010 tokens.

Your reversal is supported by the data. Specialists are a **context isolation mechanism first** and an
organizational convenience second. The rule you proposed is the right one, and the measurement backs
it: *the main session should receive the finding, not the process that produced it.*

**Caveat worth naming:** these 460 returns come from subagents given narrow, well-scoped briefs. The
bound is a property of how they were prompted, not a guarantee the harness enforces. A subagent told
"investigate and report everything" can return 50 k. The discipline has to live in the brief.

## 4. Proposed `/ain-handoff` contract — the Development Continuation Record

Design constraints derived from evidence: must be reconstructable, must be **verifiable against the
repo** (code moves between sessions), must not be prose. Target **≤ 3,000 tokens** — one order of
magnitude below the 22.8 k a fresh subagent already starts with, two below a main session.

Contract drafted at **[`docs/ops/AIN_HANDOFF_RECORD_CONTRACT.md`](./AIN_HANDOFF_RECORD_CONTRACT.md)** —
schema, field rules, the `/ain-resume` verification pass, and worked example. Not installed as a skill.

The load-bearing section is `DO NOT REDISCOVER`. Falsified hypotheses are the most expensive thing a
fresh session can re-derive, and the cheapest thing to write down. This session produced three
(Kimi-in-CC, oversized kernel, Bash-as-flooder) at a cost of ~40 requests; recording them costs 60
tokens.

`/ain-resume` must **verify before trusting**: assert branch, `git rev-parse HEAD` vs recorded SHA,
`git status` cleanliness, and that named files still exist at recorded line anchors. A record that
fails verification is downgraded to a hypothesis, not silently used.

## 5–7. Experiment design, signals, instrumentation

Full protocol at **[`docs/ops/CONTEXT_CONTROL_EXPERIMENT_PROTOCOL.md`](./CONTEXT_CONTROL_EXPERIMENT_PROTOCOL.md)**.

**Candidate signals** (advisory only — warn, never block):

```
request_count      >= 400          # first experimental boundary, not a rule
peak_context       >= 350k
tool_result_accum  >= 1.5M tok in session
AND (preferred)    coherent work unit complete
```

The semantic gate is not optional. The audit shows heavy sessions concentrated in `ops/deploy` and
`ui/browser-verify` — exactly the categories where a mid-migration cut is most dangerous. **The
counter should raise a hand, not pull a lever.**

**Reorientation cost** — the thing no audit so far has measured — gets a defined metric:
`requests from session start → first accepted edit`, plus `re-derivation events` (a fresh session
re-running work the record already contained). Baseline is measurable retrospectively from existing
transcripts; the handoff arm is not, and must be run forward.

**Instrumentation** is read-only and already possible: `scripts/audit-session-context-cost.py --days N`
plus a proposed `--live <sessionId>` mode for in-session request/context reporting. No new hooks
needed to *observe*; hooks would only be needed to *enforce*, which is out of scope.

---

## Lane B — local tier, reframed

**Infrastructure is already complete and working.** `~/bin/maia-code` sources `~/.maia-env`, which sets
`ANTHROPIC_BASE_URL=http://localhost:11434`, `ANTHROPIC_MODEL=maia-coder`,
`CLAUDE_CODE_SUBAGENT_MODEL=deepseek-r1:8b`, and force-blanks `ANTHROPIC_API_KEY`. Ollama is live on
:11434. Available: `maia-coder:latest` (18 GB), `qwen3-coder:30b`, `qwen3:32b`, `qwen2.5:7b`,
`deepseek-r1:8b`.

Nothing needs building for Lane B. The question changes, per your directive, from *"can it write code
cheaply"* to:

> **Can the local tier absorb tool-heavy work and return a compact evidence packet without any of
> that tool output entering Claude's main window?**

The measurable form: run the same verification task on both tiers and compare **tokens returned to
parent**, not tokens generated. Success is a small, correct packet — not a fast one. Note the local
tier's plausible ceiling: `deepseek-r1:8b` as subagent model against tasks that currently produce
167 k-token Reads is a real risk of *silently incomplete* evidence, which is worse than expensive
evidence. That risk is the experiment's primary finding to establish.

---

## Risks

1. **The strongest correlation may be tautological.** `requests` and `cache_read` are mechanically
   linked — more requests means more cache reads *by construction*. `r = +0.955` proves the cost is
   incurred per-request; it does **not** prove those requests were avoidable. The experiment must
   compare *work completed*, not just tokens saved, or we will "optimize" by doing less.
2. **Handoff can lose tacit state.** Much of what makes a long session productive is unrecorded —
   dead ends, hunches, the shape of the codebase in working memory. The record captures decisions,
   not orientation. Unmeasured.
3. **Cutting mid-migration.** A request threshold firing during a deploy or schema change is a real
   failure mode. Hence advisory-only, plus the semantic gate.
4. **Subagent bounds are prompt-dependent**, not harness-enforced (§3).
5. **Local tier may return confidently incomplete evidence.** The worst outcome in this whole
   architecture: a compact packet that is wrong. Bounded output makes errors *harder to notice*.
6. **~40% of the flood is images and cannot be routed** — any plan resting mainly on `ctx_execute`
   caps out well below the 18.4%.
7. **Instruction-without-enforcement predictably fails** (§1). If we write the threshold into
   CLAUDE.md and stop there, expect Read-rule behavior.

## Smallest safe experiment

One week, three changes, all reversible, none enforced:

1. **Fix the actual #1: route Read-for-analysis.** Amend the CLAUDE.md carve-out so `ctx_execute_file`
   is the default for any file you are not about to `Edit`. Zero infrastructure. Addresses 31% of the
   flood — the largest single routable line item.
2. **Subagent-first for verification.** Standing brief for browser/simulator/log/build work: the
   subagent looks, the parent receives ≤ 500 tokens. Addresses the ~40% that `ctx_execute` cannot.
3. **Observe only.** Run the audit script daily with `--days 1`. Watch whether Read tokens fall and
   whether session cache-read per unit of shipped work moves. **No threshold enforced, no handoff
   forced, no routing changed.**

If Read's share drops materially in week one, that alone is a larger win than any model substitution
discussed so far — and it costs one paragraph of documentation.

**Decision requested:** approve the three-item week-one experiment, or amend. Nothing above has been
applied to the harness.
