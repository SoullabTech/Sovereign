# Context-Control Experiment — Week 1 Charter

**Authorized:** 2026-08-09 (founder) · **Window:** 2026-08-09 → 2026-08-16
**Status:** OBSERVATION EXPERIMENT. **Not policy. No automatic adoption.**

**Parents:** [architecture](../CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md) ·
[protocol](../CONTEXT_CONTROL_EXPERIMENT_PROTOCOL.md) ·
[burden audit](../SESSION_CONTEXT_BURDEN_AUDIT_2026-08-09.md)

---

## Frozen for the duration — do not modify

`pretooluse.mjs` · `CLAUDE.md` enforcement rules · session thresholds · `~/bin/maia-code` ·
`~/.maia-env` · Ollama Modelfiles · local/cloud routing architecture.

**Note on where the Read rule lives.** The perceive/manipulate rule below is a *behavioral commitment
recorded in this charter*, deliberately **not** written into CLAUDE.md — because CLAUDE.md enforcement
is frozen, and because §1 of the architecture doc established that an instruction in CLAUDE.md with a
soft carve-out is what produced the 30% Read flood in the first place. Putting the fix in the same
place as the failure would test nothing. The week tests whether the *workflow* completes equivalent
work; only then does the enforcement question get decided.

## The rule under test — Read to perceive vs. Read to manipulate

| | route | examples |
|---|---|---|
| **Perceive** — peripheral investigation | `ctx_execute_file` / `ctx_execute` | "what does this directory collectively establish?", comparison across files, extraction, evidence gathering, surveying an unfamiliar module |
| **Manipulate** — focal work | direct `Read` | `foo.ts:120–180` already identified as the edit target; exact local semantics needed for a close judgment; small local reads around a known anchor |

**"I may edit this later" is not sufficient reason to bypass isolation.** That carve-out is the thing
being replaced — the audit found it swallowed almost the entire rule.

Every direct `Read` that is *not* clearly manipulate-class gets logged in the exceptions table below.
The exceptions are a primary output, not bookkeeping: they answer experiment question 3.

## Interventions (all three, exactly as authorized)

1. **Read-for-analysis → `ctx_execute_file`**, per the perceive/manipulate rule. Exceptions recorded.
2. **Subagent-first verification** — screenshot/browser/iOS verification, build & test investigation,
   deployment inspection, git archaeology. Compact returns: result, identifiers/paths, failures, and
   the minimum evidence needed for independent checking. **No token cap imposed** — measure the
   natural return distribution first.
3. **Daily observation** — `--days 1` snapshot preserved to `snapshots/`.

```bash
python3 scripts/audit-session-context-cost.py --days 1 --top 5 --by-tool --snapshot docs/ops/context-experiment/snapshots
```

## Day 0 baseline — captured 2026-08-09

`snapshots/2026-08-09_d30.json` · 314 sessions · 94,203 requests · 24.16 B cache-read ·
avg **256 k context per request** · median initial context 72,434.

**Perception channels — 43.31 M tool-result tokens entering context over 30 d:**

| channel | calls | Mtok | % | avg | targeted by |
|---|---|---|---|---|---|
| **pixel/browser** | 2,691 | 18.52 | **42.8%** | 6,883 | intervention 2 |
| **direct textual** (`Read`/`Grep`/`Glob`) | 3,626 | 13.09 | **30.2%** | 3,611 | intervention 1 |
| isolated: `ctx_*` | 5,406 | 6.37 | 14.7% | 1,179 | — is the remedy |
| Bash (hook-governed) | 15,134 | 4.00 | 9.2% | 265 | already clean |
| other | 16,271 | 1.18 | 2.7% | 73 | — |
| isolated: subagent | 283 | 0.13 | **0.3%** | 460 | — is the remedy |

**The two interventions target 73.0% of the flood.** Reference points to beat:
`Read` 3,625 calls / 3,612 avg / **167,063 max** · `ctx_execute_file` **84 calls** ·
`control` (iOS) 26,998 avg / **168,390 max** · subagent returns p50 **279**, p90 1,095, max 3,345.

## Work-episode ledger

Capture per meaningful work episode, where recoverable. **Token movement alone does not count as a
result** — an episode with no completion status is not evidence.

| # | date | episode / work unit | reqs | cache-read | peak ctx | direct Read (calls/tok) | ctx_execute_file | subagents (calls/returned) | pixel calls | retries | handoffs | completed? | **rebound?** | regression or missed evidence | reorientation caused by isolation |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | | | | | |

### Perceptual rebound — successful vs. lossy isolation

A subagent returning 279 tokens after seeing 168 k is only a win if those 279 tokens preserved what
the parent actually needed. Otherwise isolation **postponed** focal burden rather than reducing it.

```
isolated perception → compact return → parent continues          = SUCCESS
isolated perception → compact return → parent reopens raw source = REBOUND
```

Record a rebound for any isolated perception the parent had to undo:

| code | rebound event |
|---|---|
| **R1** | parent reopened the same source directly |
| **R2** | parent repeated the same browser/iOS inspection |
| **R3** | parent re-asked the subagent — evidence insufficient |
| **R4** | parent discovered something material the isolated worker omitted |
| **R5** | parent reversed a decision because the compressed report misled |

**perceptual rebound rate = rebound events ÷ isolated perception acts.**

R4 and R5 are the dangerous pair — R1–R3 cost requests, R4–R5 cost correctness. A low rate on R1–R3
with any R5 present is not a success. Report the codes separately, never as a single averaged figure.

Note the detection asymmetry: R1–R3 are self-evident in the transcript, **R4 and R5 are only visible
if something later surfaces the omission.** The measured rate is therefore a floor, not an estimate.

## Exceptions log — direct `Read` used for perceive-class work

| date | file | why direct Read was necessary | could `ctx_execute_file` have served? |
|---|---|---|---|
| | | | |

## Failure cases — isolation cost something

| date | what was isolated | what went wrong | cost (requests / rework) |
|---|---|---|---|
| | | | |

## Cross-episode finding (provisional, not canon)

**[Latent Capability / Default-Path Failure](./CROSS_EPISODE_FINDING_LATENT_CAPABILITY.md)** — three
independent instances observed 2026-08-09 (Kimi delegation · `Read` isolation · local Claude Code
lane): each architecturally sound, each behaviorally inert, each dependent on remembered operator
discipline while the default path stayed free.

Held as a working hypothesis with stated promotion criteria. **It diagnoses; it does not yet
prescribe** — Week 1 is the test of whether the isolated workflow completes equivalent work, and if it
does not, enforcing it would be the wrong move. The advisory-not-blocking posture stands.

## Lane B — postponed by founder decision (2026-08-09)

The `maia-coder` / Qwen local-tier experiment is **deferred until Week 1 closes**. If context isolation
alone materially changes the economics, that effect must be measured cleanly before model substitution
is added as a second variable. Confirmed not running independently: `~/bin/maia-code` is a manual CLI
wrapper with no scheduled or background invocation. Nothing to pause.

## The four questions to answer at week's end

1. Does routing analytical Read outside the main window materially reduce context burden **without
   increasing mistakes or rediscovery**?
2. Does subagent-first visual/verification work reduce pixel accumulation **while preserving
   sufficient evidence**?
3. Which tasks genuinely require direct focal-context access? *(← the exceptions log answers this)*
4. Does reduced context burden **improve, preserve, or degrade completed work per unit of effort**?

## Comparison discipline

Report **context burden per completed work unit**, and where recoverable **main-window perceptual
burden per completed work unit** — not tokens before vs. after.

⚠️ **`r = +0.955` is descriptive, not causal.** Requests and cache-read are mechanically linked: fewer
requests produce fewer cache reads by construction. **Do not claim success because shorter sessions
consumed fewer tokens.** A week that saves 40% of tokens while completing 40% less work has
established nothing. Match episodes on task category where possible — the audit shows category
dominates efficiency (implementation 147× vs ops/deploy 270× cache-read per output token).

## Subagent authorization — founder, 2026-08-09 (resolves a methodological conflict)

A standing session rule ("do not spawn subagents unless the user requests it") made **intervention 2
untestable** — subagent-first verification cannot be measured if subagents can't be spawned. Without
this, week's end would have shown intervention 2 "unused" and read as a result rather than an artifact.

> **Authorized:** subagents may be used for **perceive-class verification and evidence-gathering
> covered by this charter** — browser/iOS inspection, git archaeology, deployment verification, and
> other high-volume perceptual work.
>
> **Limits:** scoped to this experiment. Does **not** authorize autonomous implementation or product
> decisions. The broader standing rule remains in force outside experiment-eligible work.

## Daily log

### Day 1 — 2026-08-09 — ⚠️ NOT EVIDENCE. Confounded baseline day.

13 sessions · 645 requests · 0.10 B cache-read · avg **155 k** context/request (30 d baseline: 256 k).

| channel | Day 1 | 30 d baseline |
|---|---|---|
| isolated `ctx_*` | **83.0%** | 14.7% |
| direct textual | **7.9%** | 30.2% |
| pixel/browser | **3.8%** | 42.8% |

**Do not read this as intervention effect.** Day 1 *was* the audit — work that is inherently
`ctx_*`-heavy. The pixel channel collapsed because no browser or iOS verification happened today, not
because it was isolated. **Zero subagent calls (sidechain 0.0%), so intervention 2 is entirely
untested.** Zero completed work units recorded. `ctx_execute_file`: 2 calls against `Read`'s 19 —
intervention 1 is barely exercised.

The correct reading: Day 1 shows what a *pure investigation* session mix looks like. It is a useful
reference point for that category and nothing more.

### Episode 1 — 2026-08-09 — Kimi historical trace ✅ FIRST REAL INTERVENTION-1 OBSERVATION

Naturally occurring work (founder-directed archaeology), not manufactured for the experiment.

| measure | value |
|---|---|
| work unit | Kimi integration history — promised / implemented / tested / where it stopped |
| completed? | **yes** — [trace delivered](../KIMI_INTEGRATION_HISTORICAL_TRACE_2026-08-09.md), all three hypotheses resolved |
| direct `Read` calls | **0** |
| `ctx_execute` / `ctx_search` | 6 calls, all perceive-class (git pickaxe, transcript scan, config/wire inspection) |
| subagents | 0 — *not permitted at the time; see authorization above* |
| pixel calls | 0 |
| **rebound (R1–R5)** | **none** |

**Rebound detail.** The conclusion was reached without reopening a single raw file directly.
Every evidence class — git history, shell backups, `~/.kimi-code` session wire logs, transcripts —
was read inside the sandbox and returned as summary. No R1 (no source reopened), no R2 (no pixel
work), no R3 (no re-query for insufficient evidence), no R4 or R5 surfaced.

**Honest limits on that claim.** (a) R4/R5 are lower-bound by construction — an omission in the
archaeology would not be visible yet. (b) This episode is **exploration**, the category the 30-day
baseline shows is *already* the cheapest (15× cache-read per output token, n=1). It is a favorable
case for intervention 1, not a representative one. (c) One follow-up query was needed when a batch
timed out — logged below as a near-miss rather than a rebound, since it was an execution failure, not
compressed evidence proving insufficient.

**Also produced:** one genuine finding that direct `Read` would likely have surfaced *worse* — the
9-key credential exposure was found by hashing inside the sandbox, so key values never needed to enter
context at all. Isolation had a security benefit distinct from cost. Recorded because it is not a
benefit the experiment was designed to look for.

### Instrument defect found on first daily run

**In short windows, session-derived metrics are unreliable.** `--days 1` truncates sessions that began
earlier, so `initCtx` reported **0** for three of the top five (resumed sessions whose first
usage-bearing request falls outside the window). This propagated: `r(cache_read, initial)` read
**+0.667** on Day 1 against **−0.010** over 30 days — an artifact of truncation, not a finding.

Affected in short windows: `initial`, `peak`, `growth`, `compactions`, `hours`, and every correlation
derived from them. **Unaffected:** the perception-channel table, the by-tool table, and subagent return
sizes — these count events, not session shapes.

**For the week, trust the channel and by-tool tables. Ignore short-window session correlations.**
The 30-day snapshot remains the session-shape reference. Not fixed during the experiment — changing
the instrument mid-week would break comparability.

Also noted: `MAIA-SOVEREIGN/CLAUDE.md` measured 12,993 tok today vs 12,657 at Day 0 baseline (+336).
The file carries uncommitted modifications predating this experiment. Enforcement rules untouched.

## Known measurement limits

- Task categories are keyword/tool heuristics, not ground truth.
- Compaction detection is inferred from context drops; no explicit transcript marker exists.
- Token estimates from byte counts use a flat 4 chars/token — fine for ratios, wrong in detail.
- "Completed work unit" has no automatic measure; it must be recorded by hand or it will be missing.
- The Aug-9 daily snapshot includes this experiment's own setup activity.

## Decision tree at week's end

```
                    WEEK 1
                       │
              burden per completed
                 work unit down?
                  /            \
                NO              YES
                │                │
      isolation insufficient   rebound rate low?
      (revisit the workflow,   /            \
       not the enforcement)  NO              YES
                             │                │
                    improve evidence      candidate for
                    return contract       enforcement
                                               │
                                    ┌──────────┴──────────┐
                                    ▼                     ▼
                             textual Read              pixels
                            ctx isolation         subagent isolation
```

Only at the far-right leaf does the mechanism question open — hook, skill, subagent policy,
`ctx_execute` routing change, or something else. **Not before.**

## Deliverables at week's end

1. Measured comparison (per completed work unit, not raw tokens)
2. Exceptions — what genuinely required focal context
3. Failure cases — where isolation cost something
4. Evidence about work completion
5. **The smallest enforcement change justified by the data** — and nothing beyond it

**No automatic adoption.** The week establishes which policy is worth enforcing; it does not enforce one.
