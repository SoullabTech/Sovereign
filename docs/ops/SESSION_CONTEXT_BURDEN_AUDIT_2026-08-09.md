# Per-Session Context Burden Audit — 2026-08-09

**Companion to** [`CLAUDE_CODE_ROUTING_AND_COST_AUDIT_2026-08-09.md`](./CLAUDE_CODE_ROUTING_AND_COST_AUDIT_2026-08-09.md).
**Re-runnable instrument:** `scripts/audit-session-context-cost.py` (reads local transcripts only; reports tokens, never dollars).

```bash
python3 scripts/audit-session-context-cost.py --days 30 --top 25
```

**Question:** *What causes AIN development sessions to carry so much context, and what is the minimum
context architecture that preserves continuity without repeatedly loading irrelevant state?*

**Corpus:** 314 sessions · 94,203 requests · 24.16 B cache-read · 1,092 M cache-write · 119.4 M output.

---

## Headline: the orientation bundle is *not* the driver. Session length is.

The audit **falsifies hypothesis 2** ("oversized automatically loaded memory/orientation") as a
significant cost driver, and **confirms hypotheses 1 and 3** (long-lived sessions, ineffective
compaction) as dominant.

The single most decisive number:

```
r(cache_read, initial_context_size) = -0.010     ← starting burden predicts NOTHING
r(cache_read, requests)             = +0.955     ← request count predicts almost everything
r(cache_read, turns)                = +0.955
r(cache_read, tool_uses)            = +0.938
r(cache_read, peak_context)         = +0.878
r(cache_read, tool_result_tokens)   = +0.652
r(cache_read, subagents)            = +0.386
r(cache_read, wall_clock_hours)     = +0.320     ← duration barely matters
```

Sessions do not start heavy. **They start remarkably uniform and then grow.**

| initial (first-request) context | tokens |
|---|---|
| p10 | 60,641 |
| p50 | **72,434** |
| p90 | 83,480 |
| max | 93,774 |
| sessions starting above 150k | **0 of 370** |

Every session in 30 days began between ~60 k and ~94 k. By mid-session the top 25 are averaging
**354 k–489 k tokens per request**. The growth is the cost, not the seed.

`hours` correlating at only +0.32 while `requests` correlates at +0.955 refines your point 3: **it is
not long-lived sessions that are pathological — it is request-dense ones.** Session #11 ran 495.9
wall-clock hours and ranks 11th. Session #10 ran 5.4 hours with 1,000 requests and ranks 10th. A
session idle for three days costs nothing; a session that fires 1,000 requests costs the same whether
it takes five hours or five hundred.

---

## What the 72 k floor is actually made of

| component | est. tokens | share of floor |
|---|---|---|
| MAIA-SOVEREIGN/CLAUDE.md | 12,657 | 17% |
| MEMORY.md (routing index) | 1,548 | 2% |
| PROJECT_ORIENTATION.md | 965 | 1% |
| ~/CLAUDE.md | 935 | 1% |
| **your authored docs, total** | **16,106** | **22%** |
| **harness: system prompt + tool schemas + MCP servers + skills/agents listings** | **~56,431** | **78%** |

**The civilization you thought you were carrying is 16 k tokens.** The MEMORY.md root-routing
discipline (founder ruling 2026-08-05) worked exactly as designed — the index is 1,548 tokens, and the
2.5 M tokens sitting in `memory/*.md` are *not* auto-loaded; they are retrieved on demand. That
architecture is already the one you sketched, and it is already correct.

Arithmetic on the actual saving available: 16,106 tok × 94,203 requests = **1.52 B = 6.3% of all cache
reads.** Deleting every project doc you have written — CLAUDE.md, MEMORY.md, orientation, canon
pointers, all of it — recovers 6.3%. That is the entire prize for attacking hypothesis 2.

Meanwhile the harness floor is 56 k × 94,203 = **5.3 B = 22%** — over three times larger, and it is
tool/MCP schemas, not knowledge. Trimming rarely-used MCP servers per project is a larger lever than
any editing of canon.

⚠️ The 56 k figure is derived by subtraction (p50 initial − measured doc bytes at ~4 chars/token),
not by direct measurement of the system prompt. Treat it as an estimate with an unverified internal
breakdown.

---

## Causal taxonomy — the real percentages

| share | tokens | cause |
|---|---|---|
| **44.6%** | 10.77 B | **long request-dense sessions, no effective compaction** |
| **29.3%** | 7.08 B | orientation kernel re-read every request (78% of which is harness, not your docs) |
| **18.4%** | 4.44 B | **tool-result accumulation inside the window** |
| 5.7% | 1.38 B | ordinary transcript growth |
| 2.0% | 0.48 B | post-compaction regrowth |

Concentration: **top 10% of sessions (31) hold 46.4% of all cache reads.** p50 session = 32 M;
max = 995 M. A 31× spread. This is not a diffuse tax — it is a small number of runaway sessions.

---

## Compaction is not working

| group | n | median avg context | median peak | median cache-read |
|---|---|---|---|---|
| sessions **with** compaction | 27 | 262 k | 463 k | 116 M |
| sessions **without** (>20 req) | 274 | 155 k | 248 k | 32 M |

Only **27 of 314 sessions compacted at all**, and those that did still averaged 262 k per request with
a 463 k peak. Compaction fires near the ceiling, after the expensive stretch has already been paid
for. It is a late symptom marker, not a control. Post-compaction regrowth is only 2.0%, so the
mechanism itself is not leaking — **it simply arrives too late to matter.**

## Subagents are currently cheap — and the data argues *for* your specialist plan

| | median starting context |
|---|---|
| main-thread session | **72,434 tok** |
| sidechain (subagent) | **22,841 tok** |

Sidechains account for **0.41 B of 24.16 B — 1.7%** across 7,733 requests. Subagents already receive a
**3.2× lighter kernel** than main sessions, empirically.

This inverts your point 4 rather than confirming it. The risk you named — replicating the giant
orientation bundle across ten specialists — is real but **not currently realized**; the harness already
gives subagents a narrow context. Persistent specialists are not the danger. *Main-thread sessions
that never end* are.

## Category efficiency — and why cheap-model routing targets the wrong work

| category | sessions | cache-read | % | output | **cRead per output token** |
|---|---|---|---|---|---|
| implementation | 103 | 7.10 B | 29.4% | 48.2 M | **147×** |
| ops/deploy | 73 | 5.91 B | 24.5% | 21.9 M | **270×** |
| audit/review | 47 | 4.52 B | 18.7% | 19.5 M | 232× |
| ui/browser-verify | 33 | 4.21 B | 17.4% | 16.7 M | 251× |
| architecture/design | 38 | 2.37 B | 9.8% | 12.5 M | 190× |

**Implementation — the work you proposed handing to Kimi — is the *most* context-efficient category in
the system at 147×.** The expensive categories are ops/deploy (270×) and browser verification (251×):
long Bash/browser loops that generate little text while dragging a full window behind every call.

Session #1 is the archetype: 2,034 requests, 995 M cache-read, **7.14 M tokens of retained tool
results**, driven by `Bash=598, iOS-control=234, browser-computer=150`. It started life as a keyboard
layout fix on an iPhone screenshot.

---

## What this means for the plan

Your five-point strategy survives, with two amendments:

1. **Point 2 (separate durable knowledge from working context) is already done, and it worked.** The
   retrieval architecture you described is what MEMORY.md's routing discipline already implements. Do
   not spend effort re-architecting a 16 k-token kernel to save 6.3%. If you want floor reduction, cut
   MCP tool schemas (22%), not canon.
2. **Point 3 (intentional session boundaries) is the whole game — 44.6% + 18.4% = 63%.** But the
   trigger should be **request count, not elapsed time.** The data says a session crossing roughly
   400–600 requests, or a peak context past ~400 k, is where the money goes. A governed handoff at
   ~500 requests would have truncated all 25 of the top sessions.
3. **Point 4 (fix inflation before adding agents) can be relaxed.** Subagents are 1.7% and already
   start 3.2× lighter. Adding specialists is safe *provided each keeps its own narrow kernel* —
   which the harness currently enforces by default.
4. **Point 5 (cheap-model routing) should be re-aimed.** Not at implementation (147×, the efficient
   part) but at the two things that actually generate the 18.4% tool-result bucket: **Bash/browser
   verification loops and repository search**. Their value is not cheaper tokens — it is that a
   subagent's tool output never enters the main window at all. `context-mode`'s `ctx_execute` already
   does exactly this, and it appears in the tool mix of the heavy sessions, so the pattern is proven;
   it is under-used, not unproven.
5. **Your caution on caching is correct and the data supports it.** The pathology is a 256 k average
   window, not the cache. Without caching those same 24.16 B tokens would have been billed as fresh
   input at 10× the rate. Cache is the mitigation, not the disease.

---

## What was NOT established

- **The 56 k harness floor is derived by subtraction**, not measured. Its internal split (system
  prompt vs tool schemas vs MCP vs skills listings) is unverified.
- **Compaction detection is heuristic** — inferred from a >40% context drop off a running peak above
  50 k, because transcripts carry no explicit compaction marker. The count of 27 may be low.
- **Token estimates from file sizes use a flat 4 chars/token.** Fine for ratios, wrong in detail.
- **Task categories are keyword/tool heuristics**, not ground truth. `ops/deploy` in particular
  absorbs any Bash-heavy session, which likely over-counts it.
- **No causal test that shorter sessions would have completed the same work.** The correlation is
  strong, but a forced handoff has a re-orientation cost this audit does not measure — the compact
  continuation record has to be good enough, and that is untested.

## Recommended next step (not taken)

Instrument, don't guess: add a session-boundary discipline at ~500 requests / ~400 k peak and measure
whether total cache-read per unit of shipped work falls. That is a controlled comparison this corpus
cannot provide retrospectively — and it is the one number that would prove the architecture, rather
than merely describing the pathology.
