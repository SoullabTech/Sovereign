# Claude Code — Reset-Window Attribution (2026-08-09)

**Horizon III unit · investigation only.** No routing changed, no models changed, no hooks, no Builder OS
implementation, no Kimi/local execution, no product code. The 30-day context-cost audit
([`CLAUDE_CODE_ROUTING_AND_COST_AUDIT_2026-08-09.md`](./CLAUDE_CODE_ROUTING_AND_COST_AUDIT_2026-08-09.md))
was **not** repeated; its figures are used as baseline only.

**Method.** 125,239 assistant turns parsed from `~/.claude/projects/**/*.jsonl` (including
`*/subagents/*.jsonl`), spanning 2026-06-02 → 2026-08-10T01:12Z. Per-turn fields: timestamp,
`sessionId`, `cwd`, `gitBranch`, `model`, `usage.{input,output,cache_read,cache_creation}`, tool_use
names, tool_result sizes. Read-only. Scripts: session scratchpad `attrib.py`, `attrib2.py` (not committed —
generated evidence, per workspace-provenance discipline).

---

> **Kelly exhausted the apparent Claude Code allowance unusually quickly because fourteen concurrently
> active sessions — thirty-two of thirty-four sharing one worktree on one branch — compressed roughly
> 1.4 days' worth of normal work into a 2.8-hour burst, issuing 4,642 requests inside a 5-hour rolling
> session window at ~11.8× the baseline request rate, while per-request context burden stayed entirely
> normal (0.88× baseline).**

The failure was **rate, not weight**. Nothing was pathological about any individual session.

---

## 1. Reset / start / exhaustion timeline

| event | time (UTC) | time (ET) | source |
|---|---|---|---|
| Weekly allowance reset | 2026-08-09 14:00Z | 10:00am | derived from the Aug 8 limit message *"resets Aug 9 at 10am (America/New_York)"* — the reset instant itself is **not** directly logged |
| First CC activity after reset | 2026-08-09 15:04:41Z | 11:04am | first assistant turn, sid `8ed53c87` |
| Session-limit exhaustion | 2026-08-10 00:48:23Z | 8:48pm | `isApiErrorMessage`: *"You've hit your session limit · resets 10:50pm (America/New_York)"* |
| Stated reset of that bucket | 2026-08-10 02:50Z | 10:50pm | same message |
| **Elapsed, weekly reset → exhaustion** | **10.81 h** | | |
| **Elapsed, inferred 5-h bucket start (21:50Z) → exhaustion** | **2.97 h** | | |

⚠️ **Subscription reset timing is only partially establishable locally.** Reset *instants* are never
logged; they are recoverable only as text inside limit messages. The 21:50Z session-bucket start is
**inferred** by subtracting 5 h from the stated 02:50Z reset — a reasonable but unverified assumption
about bucket length.

⚠️ **What exhausted was the 5-hour rolling *session* bucket, not the weekly allowance.** The weekly
limit had been hit repeatedly Aug 6–8 and reset the morning of Aug 9; no weekly-limit message appears
after the reset. The "half a day" felt duration is the wall-clock gap from the weekly reset; the
*governing* interval is the 2.97 h session bucket.

### Hourly shape (weekly-reset window)

| hourZ | ET | reqs | burden (M tok) | distinct sessions | cumulative |
|---|---|---|---|---|---|
| 15:00 | 11am | 192 | 20 | 12 | 4% |
| 16:00–20:00 | 12–4pm | **0** | 0 | 0 | 4% |
| 21:00 | 5pm | 32 | 6 | 5 | 5% |
| 22:00 | 6pm | 1,323 | 282 | 16 | 32% |
| 23:00 | 7pm | 1,560 | 354 | 15 | 64% |
| 00:00 | 8pm | 1,727 | 501 | 24 | **100%** |

**95% of the window's requests occurred in the final 2.8 hours.** A five-hour idle gap (12pm–5pm ET)
sits in the middle of the "half day."

---

## 2/3. Session concentration — MANY, not ONE

34 sessions in the window (3 subagent transcripts). Burden = cache_read + cache_write + output.

| # | sid | reqs | burden (M) | % burden | span (Z) | lane |
|---|---|---|---|---|---|---|
| 1 | `c5fd2f20` | 524 | 162 | 13.9% | 15:05–00:48 | shared repo |
| 2 | `84819d65` | 333 | 124 | 10.6% | 22:27–00:48 | shared repo |
| 3 | `7a6f332d` | 339 | 106 | 9.1% | 15:05–00:36 | shared repo |
| 4 | `8fe849ce` | 298 | 105 | 9.0% | 15:05–00:06 | shared repo |
| 5 | `b3d4c4b7` | 252 | 93 | 8.0% | 15:05–00:45 | shared repo |
| 6 | `a74a5a21` | 311 | 85 | 7.3% | 23:10–00:47 | shared repo |
| 7 | `fe8560e0` | 279 | 70 | 6.0% | 23:54–00:48 | shared repo |
| 8 | `4cecd795` | 191 | 41 | 3.6% | 23:53–00:46 | shared repo |
| 9 | `e75dfc3d` | 146 | 38 | 3.3% | 23:58–00:48 | shared repo |
| 10 | `48407fee` | 191 | 36 | 3.1% | 00:05–00:48 | shared repo |

| slice | share of burden | share of requests |
|---|---|---|
| top 1 | 13.9% | 10.8% |
| top 3 | 33.6% | 24.7% |
| top 5 | 50.6% | 36.1% |
| top 10 | 73.8% | 59.2% |

**Answer: MANY CONCURRENT SESSIONS.** No single session exceeds 14% of burden. A one-pathological-session
hypothesis is falsified — the distribution is broad and flat-shouldered.

---

## 4. Concurrency timeline

Measured from request timestamps in 5-minute buckets, not worktree existence.

- **Maximum simultaneous distinct sessions in one 5-min bucket: 18** (00:45Z).
- **Sustained genuine concurrency (≥5 requests in the hour): 14 sessions**, held across three
  consecutive hours (22:00Z, 23:00Z, 00:00Z).
- Bucket concurrency distribution: `{3:1, 5:2, 6:7, 7:6, 8:4, 9:3, 10:7, 11:7, 18:1}` — the modal
  state is 6–11 concurrent sessions, never 1.
- **100.0% of requests (4,834) and 100.0% of burden (1,164 M) occurred during ≥2-session overlap.**
  There is no single-lane period in the window at all.

**Lane distribution — the load-bearing finding:**

| lane | reqs | burden (M) | sessions |
|---|---|---|---|
| `~repo` (shared main checkout) | 4,605 | 1,125 | **32** |
| `~repo/.claude/worktrees/mystifying-sutherland-05674d` | 179 | 31 | 1 |
| `~repo/.claude/worktrees/rehab-provenance` | 35 | 6 | 1 |
| `~repo/.claude/worktrees/gc-verify` | 13 | 3 | 1 |

**Branch distribution:** 4,607 of 4,834 requests (95%) on `feature/labtools-redesign`, across **32
distinct sessions in one writable checkout**. Isolation was effectively absent: worktrees existed but
carried 4.7% of the load.

**Yes — multiple active lanes materially contributed.** They are the entire mechanism.

---

## 5. Request density

| measure | value |
|---|---|
| weekly-window req/h | 447.3 |
| baseline 30-day req/h | 131.8 |
| **ratio (whole window)** | **3.39×** |
| final-3h req/h (session bucket) | 1,561.4 |
| **ratio (session bucket)** | **≈11.8×** |
| densest 30 min | **1,188 reqs** (00:18–00:48Z) |
| densest 60 min | **2,031 reqs** (23:48–00:48Z) |

The densest 60 minutes alone carry 42% of the entire post-reset window's requests.

---

## 6. Context shape

| sid | reqs | ctx start | peak | end | ≥50% context drops |
|---|---|---|---|---|---|
| `c5fd2f20` | 524 | 0k | 578k | 578k | 9 |
| `84819d65` | 333 | 29k | 567k | 567k | 3 |
| `7a6f332d` | 339 | 29k | 511k | 29k | 7 |
| `8fe849ce` | 298 | 0k | 504k | 504k | 6 |
| `b3d4c4b7` | 252 | 29k | 479k | 479k | 4 |
| `a74a5a21` | 311 | 29k | 393k | 357k | 2 |

Sessions did grow to near-full windows (393k–578k cache-read). But they did **not** start larger, grow
faster, or compact less than baseline — per-request cache-read was actually **12% *below*** baseline
(228k vs 258k). Context resets were frequent (2–9 per major session), i.e. compaction was working.

**Determination: today's sessions simply issued many more requests.** Not bigger contexts — more of them,
in parallel.

---

## 7. Perception burden (window only)

2,316 tool_use calls over 4,834 turns = 0.48/turn (baseline 0.46 — **1.04×**, unremarkable).

| tool | calls | share |
|---|---|---|
| `ctx_execute` | 795 | 34.3% |
| `Edit` | 432 | 18.7% |
| `Bash` | 402 | 17.4% |
| `Write` | 230 | 9.9% |
| `Read` | 168 | 7.3% |
| `ctx_batch_execute` | 113 | 4.9% |
| all other (search, browser, Agent, …) | 176 | 7.5% |

**By injected volume** — 6,167,097 chars of tool_result (~1.54 M tokens approx) across 2,312 results:

| tool | chars | share | n | avg |
|---|---|---|---|---|
| `ctx_batch_execute` | 2,224,340 | 36.1% | 113 | **19,684** |
| `ctx_execute` | 1,944,697 | 31.5% | 794 | 2,449 |
| `Read` | 774,345 | 12.6% | 168 | 4,609 |
| `Bash` | 565,390 | 9.2% | 399 | 1,417 |
| `ctx_search` | 277,173 | 4.5% | 34 | 8,152 |
| `Edit` / `Write` | 139,379 | 2.3% | 662 | ~210 |

Largest individual injections (all `ctx_batch_execute`): 51,898 · 51,318 · 47,724 · 43,368 · 42,554 chars.

⚠️ **Notable, and not a routing failure:** context-mode *was* used heavily (74% of injected volume runs
through `ctx_*`), which is compliance with the CCA week-one authorization. But `ctx_batch_execute`
averages ~19.7k chars (~5k tokens) per return — it compresses raw output, it does not make perception
free. Direct `Read` was a minor contributor (12.6%).

---

## 8. Shared-worktree rework

**Structurally present, magnitude NOT measured — deliberately not estimated.**

What is established: 32 sessions wrote into one checkout on one branch; `/orient` measured 296 dirty
paths at window close; the branch sat 15 ahead of trunk with cache artifacts (`tsconfig.ship.tsbuildinfo`,
`.next/cache`) newer than HEAD.

What is **not** established: which requests were rework. Separating a re-orientation caused by another
lane's HEAD movement from a legitimate first orientation requires per-turn causal reading that this pass
did not perform. Any number here would be fabricated. **Filed as an open measurement, not an attribution.**

---

## 9. Model mix

| model | window reqs | window burden | window % | baseline % |
|---|---|---|---|---|
| `claude-opus-5` | 3,768 | 996 M | **85.5%** | 36.4% |
| `claude-fable-5` | 968 | 157 M | 13.5% | 31.4% |
| `claude-sonnet-5` | 70 | 11 M | 1.0% | 5.5% |
| `claude-opus-4-8` | 0 | 0 | 0% | 26.7% |
| `kimi-k2.7-code` | 14 | ~0 | 0.0% | 0% |
| `maia-coder` | 2 | ~0 | 0.0% | 0% |

- **Opus burden share 85.5% vs 63.1% baseline = 1.36× escalation.** The mix shifted toward the most
  expensive tier; `opus-4-8` (a quarter of baseline burden) is absent entirely.
- **No unexpected retries or subagent-model anomalies observed.** Subagents were a rounding error
  (3 of 34 transcripts, 19 `Agent` calls).
- 16 non-Anthropic turns appear (`kimi-k2.7-code` ×14, `maia-coder` ×2) — the first ever recorded, from
  the isolated Kimi lane's acceptance proofs. Zero burden impact.

---

## 10. Today vs baseline — ratios

| metric | window | baseline 30d | ratio |
|---|---|---|---|
| requests/hour | 447.3 | 131.8 | **3.39×** |
| requests/hour (session bucket) | 1,561.4 | 131.8 | **11.85×** |
| cache-read / request | 228,444 | 258,240 | **0.88×** |
| cache-write / request | 10,968 | 11,679 | **0.94×** |
| output / request | 1,431 | 1,269 | 1.13× |
| tool_use / request | 0.48 | 0.46 | 1.04× |
| opus share of burden | 85.5% | 63.1% | **1.36×** |
| sustained concurrency | 14 lanes | not measured for baseline | — |
| context growth per session | 393k–578k peak | 258k avg/req | comparable |
| compaction | 2–9 resets/session | not measured for baseline | — |

**Every per-request metric is at or below baseline. Only rate, concurrency and model tier are elevated.**

---

## 11. Accounting caution

Local evidence measures **compute/context burden**, not Anthropic subscription accounting. Cache-token
volume is **not** assumed to map to quota units; the 30-day audit already established that list-price
arithmetic overstates the real bill by ~24×, so token volume is used here as *relative* attribution only.

**Classification: EXPLAINED BY LOCAL USAGE.**

Rationale: 4,642 requests inside a ~3-hour span, against a rolling 5-hour session bucket, at 11.8× the
established baseline rate, is a sufficient explanation on its own. No anomaly needs to be invoked. The
observed exhaustion is what this usage pattern would be expected to produce.

Two residual uncertainties that do **not** change the classification: the 5-hour bucket length is
inferred, and daily total burden (1,164 M) is only ~1.4× a baseline day — meaning the *quantity* of work
was ordinary and the *rate* was not. The rate is the explanation.

---

## 12. Counterfactual (from observed events only)

Computed by re-aggregating actually-observed sessions. **Serializing lanes does not delete work — it
redistributes it across rolling windows.** That is the entire mechanism, and the counterfactual is
stated as *rate relief*, not *work reduction*.

| scenario | reqs | % of observed | burden | % of observed |
|---|---|---|---|---|
| observed (34 sessions, 14 concurrent) | 4,834 | 100% | 1,164 M | 100% |
| single largest lane only | 524 | 11% | 162 M | 14% |
| top-3 lanes, run sequentially | 1,196 | 25% | 391 M | 34% |
| eliminating the tail (15 sessions <100 reqs) | −276 | −6% | −46 M | −4% |

Readings:

- **One primary lane at a time** would have kept peak rate near ~180 req/h — below the ~447 req/h window
  average and far below the 1,561 req/h burst. The same work would still be done, spread across more
  rolling windows, and would likely not have tripped a 5-hour bucket.
- **Isolated worktrees**: 4.7% of load ran in worktrees. Isolation's benefit here is correctness
  (eliminating the §8 rework class), not token reduction — **no savings claimed**.
- **Bounded handoffs**: sessions peaked at 393k–578k context. A ≤3k-token continuation packet plus a
  fresh session substitutes ~29k starting context for a ~500k carried one. Real, but it attacks
  per-request weight, which was already **below** baseline — so it is not the lever for *this* failure.
- **`ctx_*` for textual perception**: already in force (74% of injected volume). No further headroom
  claimed; `ctx_batch_execute`'s ~19.7k-char average returns are the residual.
- **Subagents for visual perception**: browser tools contributed 28k chars total. Negligible here.
- **Kimi / Qwen savings: NOT estimated.** The window's work was constitutional reconciliation,
  governance audit and architecture — the escalation contract's own excluded classes. Transferability
  is not demonstrated, so no saving is claimed.

**Honest counterfactual summary:** the single intervention supported by this evidence is **concurrency
discipline**. Handoff bounding, ctx routing and worker delegation each address a variable that was
already normal or already controlled on this day.

---

## Confidence

| claim | confidence | basis |
|---|---|---|
| Many concurrent sessions, not one pathological session | **High** | top-1 = 13.9%; 34 sessions; 14 sustained-active |
| Burn compressed into final ~2.8 h | **High** | hourly counts, 95% cumulative |
| Per-request burden normal or below baseline | **High** | 0.88× / 0.94× / 1.04× |
| Opus escalation contributed | **Medium** | 1.36× burden share; contribution to quota units unquantified |
| Shared-worktree rework contributed | **Low / unmeasured** | structurally present, magnitude not attributable (§8) |
| Local usage explains exhaustion | **Medium-High** | sufficient without anomaly; bucket length inferred |
| Concurrency discipline is the effective lever | **Medium-High** | follows from rate-vs-weight finding |

---

## Immediate Horizon III implication

The Horizon III exit condition — *"JARVIS actively manages its own context and model expenditure without
sacrificing reasoning quality"* — has been measured against the wrong variable. Both prior audits framed
expenditure as **context weight per request**. This window shows weight was already controlled
(0.88× baseline) while **request rate across concurrent lanes** was uncontrolled and 11.8× baseline.

**Implication: Horizon III needs a concurrency/rate dimension alongside its context dimension.** The
existing week-one context experiment remains valid and should not be reopened; what is missing is any
observation of *how many lanes are live at once*. No instrument in the Instrument Registry measures it.

This also supplies the first evidence-grounded justification for the **one-unit → one-branch →
one-worktree → one-owner** invariant, which the gap analysis had classified GENUINELY MISSING: its
value here is not correctness alone but **rate governance**.

⛔ **Nothing is optimized by this document.** No concurrency limit is proposed, designed, or implemented.
Attribution stops here, per the authorizing directive.

---

## Open / not established

1. 5-hour session-bucket length is **inferred**, not verified.
2. Rework magnitude from shared-worktree contention — §8, unmeasured by design.
3. Mapping from local token/request volume to subscription quota units — unknown, and deliberately not modelled.
4. Why the mix shifted to 85.5% opus with `opus-4-8` absent — not investigated (config? availability? selection?).
5. Baseline concurrency and baseline compaction rate were not computed; today's figures have no baseline counterpart.
6. Whether the 12pm–5pm ET zero-activity gap reflects absence or an unlogged constraint.
