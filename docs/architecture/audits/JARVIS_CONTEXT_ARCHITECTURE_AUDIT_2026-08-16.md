# JARVIS Context Architecture Audit — Sovereign

**Date:** 2026-08-16 · **Mode:** read-only measurement · **Changes made:** none (this file only)
**Evidence class:** filesystem measurement + transcript measurement. No runtime claim, no product claim.
**Authority:** this document is `DISCOVERED` / `PROPOSED`. It authorizes nothing.

---

## 0. What was measured, and how

| Layer | Method | Confidence |
|---|---|---|
| Startup injection | byte-count of every file known to be injected | **measured** |
| Total startup cost | `input_tokens + cache_creation + cache_read` on the first assistant turn, 39 sessions | **measured** |
| Startup residual | total minus measured components | **measured by subtraction** — composition inferred, not enumerated |
| Per-session tool inflow | `tool_result` bytes attributed to the emitting tool, 40 most-recent transcripts | **measured** |
| Repo retrieval surface | file-size census of the primary checkout | **measured** |
| Memory recall inflow | — | **NOT MEASURED** (see §5) |

Transcript corpus: 40 most-recent of 399 sessions in `~/.claude/projects/-Users-soullab-MAIA-SOVEREIGN/`.

---

## 1. The startup floor

Median first-request input across 39 sessions: **81,213 tokens.** p90 **86,985**. Max **120,924**.

That is the cost of saying "hello" — paid before any work begins, every session.

Decomposition:

| Component | Tokens | Injected |
|---|---:|---|
| `MAIA-SOVEREIGN/CLAUDE.md` (57.6 KB) | **14,248** | always |
| Skill descriptions (83 skills) | **7,059** | always |
| `~/.claude/CLAUDE.md` (JARVIS Core) | 1,559 | always |
| `memory/MEMORY.md` root index | 1,749 | always |
| `~/CLAUDE.md` (context-mode rules) | 935 | always |
| SessionStart hook output | ~600 | always |
| **Measured subtotal** | **~26,150** | |
| **Residual** | **~55,000** | system prompt · tool schemas · deferred-tool listing · MCP server instructions · agent-type listing · recalled memories |

**Finding 1.1 — the residual is the larger half and is currently unenumerated.** ~68% of the
startup floor is not attributable from the filesystem. Tool-schema and deferred-listing cost cannot
be measured from outside the harness; it must be measured by differential (§7, M1) before any claim
is made about it. ⛔ Do not assume it is mostly MCP schemas — that is a hypothesis, not a finding.

**Finding 1.2 — `CLAUDE.md` is the largest *governable* startup cost, and its largest section is
its most perishable.** `## Current priority thread (update each session)` is **17,725 B / 4,431 tok
— 31% of the file**, dated 2026-05-24, and already carries three inline `RECORD CORRECTION` blocks
superseding its own claims. Every session pays 4,431 tokens to load a state description that the
same file then partially retracts.

---

## 2. Where context actually goes during work

Average `tool_result` inflow: **~173,381 tokens per session** — more than double the startup floor.

| Emitter | Calls | ~tokens | avg/call | share |
|---|---:|---:|---:|---:|
| iOS Simulator `control` | 108 | 3,280,488 | **30,374** | **47.3%** |
| Browser `computer` | 212 | 650,428 | 3,068 | 9.4% |
| `Read` | 421 | 589,552 | 1,400 | 8.5% |
| `Bash` | 2,054 | 428,346 | 208 | 6.2% |
| `ctx_batch_execute` | 143 | 428,313 | 2,995 | 6.2% |
| `ctx_execute` | 900 | 375,220 | 416 | 5.4% |
| `computer-use` screenshot | 3 | 231,141 | **77,047** | 3.3% |
| Preview screenshot | 16 | 224,864 | 14,054 | 3.2% |
| `browser_batch` | 15 | 215,775 | 14,385 | 3.1% |
| `computer_batch` | 4 | 174,840 | 43,710 | 2.5% |
| `chrome computer` | 9 | 73,906 | 8,211 | 1.1% |

**Finding 2.1 — the governing model in `CLAUDE.md` is aimed at the wrong bucket.**
The context-mode routing rules are written as though **Bash** is the flood. Bash is **6.2%** of
inflow at **208 tokens per call** — the cheapest thing in the table. Meanwhile
**image-producing verification is ~70%** (47.3 + 9.4 + 3.3 + 3.2 + 3.1 + 2.5 + 1.1). A single iOS
simulator screenshot averages **30,374 tokens** — *37% of the entire startup floor, per call.*
2,054 Bash calls cost less than 15 simulator screenshots.

**Finding 2.2 — the rule that addresses the real bucket exists and is not being followed.**
`CLAUDE.md` already carries *"Verification that produces images → subagent-first … isolation is the
only compression."* At 30k tok/call × 108 calls in the main loop, that rule is **written but not
enforced**. This is an enforcement gap, not a policy gap. ⛔ Do not author a new rule for it.

**Finding 2.3 — context-mode carries 12.0% of result bytes.** That is real routing, and it is
working on the bucket it was aimed at. It is not a failure; it is correctly scoped to a small bucket.

---

## 3. Retrieval surface — where symbol retrieval could replace file retrieval

Primary checkout (worktrees excluded): **6,332 `.ts/.tsx`, 62.8 MB, ~15.7 M tokens.**
Median file 7,200 B (~1,800 tok) — *cheap*. p90 20,412 B.
**97 files >40 KB · 16 files >100 KB.**

| File | Tokens if Read whole |
|---|---:|
| `components/OracleConversation.tsx` | **126,506** |
| `lib/community-library/manifest.generated.ts` | 61,236 |
| `lib/sovereign/maiaService.ts` | 43,082 |
| `components/astrology/SacredHouseWheel.tsx` | 38,849 |
| `components/voice/ContinuousConversation.tsx` | 35,871 |
| `app/api/oracle/conversation/route.ts` | 34,362 |

`docs/`: 1,298 markdown files, 25.4 MB (~6.3 M tok).

**Finding 3.1 — the tail, not the median, is the hazard.** Whole-file `Read` averages 1,400 tokens
and is fine for the median file. But one `Read` of `OracleConversation.tsx` costs **1.56× the entire
startup floor**. That file holds **10,872 lines / 22 top-level symbols** — a symbol index of it is
~330 tokens, a **99.7% reduction**. The transcripts show it read **8× in one session** (and 9× more
from a sibling worktree).

**Finding 3.2 — symbol retrieval should be *targeted*, not global.** Applying symbol indexing to all
6,332 files buys little; applying it to the **97 files >40 KB** captures nearly all the tail risk.
This is a bounded, ~97-file intervention, not an architecture-wide replacement of file reads.

**Finding 3.3 — 21 worktrees on disk is a referent hazard, not just a size one.**
`components/OracleConversation.tsx` exists at 8+ paths with **different content and different sizes**
(506,023 B in the primary checkout vs 480,402 B in four worktrees). A symbol index keyed on repo-
relative path would bind the wrong referent. Any index must key on **worktree root + path + blob SHA**.
(Governing: JARVIS Core §C — *names are not identity*.)

---

## 4. Repeated re-reads

421 `Read` calls / 259 distinct paths → repeat ratio **1.63**. Not pathological in aggregate.
Concentrated where it matters:

- `memory/MEMORY.md` — **39 reads across 13 sessions** (~3× per session that touches it), on top of
  being injected at startup. This is the single clearest re-read defect: a file already in context,
  re-read to resolve routing.
- Large components re-read 6–9× within a single session (`OracleConversation.tsx`, `MaiaShell.tsx`,
  `NowWhatRoom.tsx`) — the same file, whole, repeatedly, because a slice was not available.

**Finding 4.1 — re-reads cluster on (a) the routing index and (b) files too large to slice.**
Both are addressable; neither is a discipline problem.

---

## 5. What was NOT measured — and must not be guessed

- **Memory recall inflow.** 1,543 memory files, 10.8 MB. How much enters context per session via
  recall is **not visible** in the transcript format examined. ⛔ No optimization of the memory
  corpus is justified by this audit. It requires instrumentation first (§7, M2).
- **Tool-schema / deferred-listing cost.** Inside the ~55,000-token residual, unenumerated (§1.1).
- **Cache economics.** `cache_read` tokens are counted at full weight above. The *billed* cost of
  the startup floor is materially lower than 81,213 on a warm cache. **The 81k figure is a context-
  window occupancy measure, not a cost measure.** Occupancy is the constraint this audit addresses.
- **jCodeMunch / RTK / Headroom / Needle capabilities.** Not inspected. See §8.

---

## 6. Proposed architecture — JARVIS Context Governor

Not a tool. A **four-tier admission policy** with one enforcement seam per tier. The organizing
principle: *the main loop is a decision surface, not a data surface.*

```
                      ┌─────────────────────────────────────────────┐
   T0  CONSTITUTION   │ always resident · HARD CEILING ~6,000 tok    │
       (identity,     │ vows · authority boundary · stop conditions  │
        authority)    │ routing table — WHERE, never WHAT HAPPENED   │
                      └─────────────────────────────────────────────┘
                      ┌─────────────────────────────────────────────┐
   T1  ADMITTED       │ loaded on match · lane rules, traps, gates   │
       (conditional)  │ trigger: path glob · lane · tool about to run │
                      └─────────────────────────────────────────────┘
                      ┌─────────────────────────────────────────────┐
   T2  RETRIEVED      │ pulled on demand · symbols before files      │
       (addressable)  │ symbol index → slice → whole file (last)     │
                      └─────────────────────────────────────────────┘
                      ┌─────────────────────────────────────────────┐
   T3  ISOLATED       │ NEVER enters main loop · images, bulk output │
       (quarantined)  │ subagent looks; parent receives ≤500 tok     │
                      └─────────────────────────────────────────────┘
```

### T0 — Constitution (hard ceiling ~6,000 tok)
Survives: project vows · non-negotiables · authority-boundary test · stop conditions · infrastructure
single-source-of-truth · the routing table. **Everything that is *state* leaves.**
The existing `MEMORY.md` root doctrine ("routing only, never an encyclopedia", founder-ruled
2026-08-05) is **already the correct law** — it has simply never been applied to `CLAUDE.md`.
T0 is that ruling, generalized. It requires no new governance instrument.

### T1 — Admitted rules (0 tok until triggered)
`## Known recurring traps`, `## Bridge D`, `## Onboarding Flow`, `## Members System`,
`## Co-Lab Release Gate`, `## Inhabitable Architecture`, deploy mechanics — each becomes a rule file
with a declared trigger (path glob, lane, or imminent tool call), loaded by hook at the moment it
governs. A trap about Capacitor cookies costs nothing in a session that never touches iOS.

### T2 — Retrieved (symbols before files)
A symbol index over the **97 files >40 KB**, keyed on **worktree root + path + blob SHA** (§3.3).
Read order: symbol index → named slice → whole file, with whole-file reads of indexed files
requiring an explicit reason. Median files (~1,800 tok) keep reading normally — **do not index the
whole repo.**

### T3 — Isolated (the 70%)
Every image-producing tool — iOS simulator, browser/preview/computer-use screenshots — runs **in a
subagent**, which returns findings, never pixels. Enforced by `PreToolUse` hook denying those tools
in the main loop with a message naming the subagent path. This is `CLAUDE.md`'s existing
subagent-first rule given a mechanical seam — the same pattern as
`scripts/governance/escalation-guard.py`, which already proves the enforcement shape works here.

**Governor invariant:** *a tier may be crossed downward freely and upward only by declared trigger.*
Nothing in T1–T3 may promote itself into T0 by being important. (This is the `MEMORY.md` review
test — *the burden of proof sits on the line, never on the reviewer* — applied to context.)

---

## 7. Ranked migration sequence

Ranked by **measured tokens recovered ÷ reversibility risk**. Each step is independently shippable
and independently revertible.

| # | Move | Tier | Recovers | Basis | Risk |
|---|---|---|---:|---|---|
| **1** | `PreToolUse` hook: image tools → subagent-only | T3 | **~121,000 tok/session** | measured 70% of 173,381 | low — hook denial is reversible; the rule already exists |
| **2** | `CLAUDE.md` split → T0 core + T1 rule files | T0/T1 | **~11,700 tok/session** | 14,248 → ~2,500 | low — content moved byte-exact, nothing rewritten |
| **3** | Retire `## Current priority thread` from T0 → session state file | T0 | *(included in #2)* **4,431 tok** | measured section size | low — it is already self-superseded |
| **4** | Scope skill descriptions to project-relevant set | T0 | **~3,000 tok/session** | 7,059 across 83 skills | low — descriptions only, bodies unaffected |
| **5** | Symbol index over 97 files >40 KB, SHA-keyed | T2 | **tail risk: up to 126,506 tok/incident** | measured | medium — referent binding must be right (§3.3) |
| **6** | Stop re-reading `MEMORY.md` (already resident) | T2 | ~5,200 tok/session | 39 reads / 13 sessions × 1,749 | low |
| **M1** | *Measure* the ~55,000-tok residual by differential | — | **unlocks 68% of startup** | — | none — measurement only |
| **M2** | *Instrument* memory-recall inflow | — | unknown | — | none — measurement only |

**Sequencing rationale:** #1 alone is larger than everything else combined and touches no content.
#2–#4 are relocation, not rewriting — the same discipline the 2026-08-05 `MEMORY.md` split used
(**0 entries lost · 96/101 byte-exact**), and it should be held to the same verification standard.
**M1 must run before anything is proposed for the residual** — that is 68% of the startup floor
about which this audit has no findings, only a subtraction.

**Projected startup floor after #2–#4:** ~81,200 → ~66,000 tok (−19%).
**Projected per-session inflow after #1:** ~173,400 → ~52,000 tok (−70%).
**Combined, per session: ~254,600 → ~118,000 tok (−54%).**
⚠️ These are projections from measured inputs, not results. They become claims only after a
before/after differential on real sessions.

---

## 8. Fit-test for jCodeMunch / RTK / Headroom / Needle

⛔ **This audit did not inspect these tools.** No recommendation is made about any of them, and
none should be inferred. What the audit produces instead is the **decision instrument** — the
question each candidate must now answer:

| Bucket | Measured size | What a tool must do to win it | Can home-grown do it? |
|---|---:|---|---|
| **Image isolation** | ~121k tok/session | keep pixels out of the parent loop | **Yes** — a `PreToolUse` hook + existing subagents. A third-party tool has to beat *free*. |
| **T0/T1 rule tiering** | ~15k tok/session | trigger-scoped rule admission | **Yes** — hooks + skills, both already in use |
| **Symbol retrieval** | up to 126k tok/incident | SHA-keyed symbol index across 21 worktrees | **Probably not cheaply** — this is real infrastructure (parser, index, invalidation, referent binding). **The strongest candidate for buying rather than building.** |
| **Startup residual** | ~55k tok/session | *unknown until M1* | **Undetermined — do not evaluate tools against this bucket yet** |

**Decision rule this audit recommends:** evaluate no external tool against buckets 1, 2, or 4.
Bucket 1 and 2 are enforcement gaps in rules that already exist and are winnable with hooks that
already run in this repo. Bucket 4 has no findings yet. **Only bucket 3 — symbol retrieval — has a
measured problem that plausibly exceeds home-grown effort**, and that is the only bucket against
which an external tool should be scored.

---

## 9. Stop conditions honored

- No file was changed except this one. No hook, rule, skill, or index was created.
- No claim is made about billed cost (§5), memory recall (§5), or the residual's composition (§1.1).
- No external tool was evaluated (§8).
- The `## Current priority thread` findings describe **cost of loading**, not correctness of content.
  ⛔ This audit does **not** authorize editing, retiring, or correcting that section's substance —
  only relocating it out of T0. Its record corrections are governed elsewhere.
