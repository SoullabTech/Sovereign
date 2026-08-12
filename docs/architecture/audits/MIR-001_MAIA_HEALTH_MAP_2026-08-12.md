# MIR-001 — MAIA Health Map

**Phase A · READ-ONLY diagnostic · 2026-08-12**
Program owner: JARVIS. This document is execution-worker output, not a ruling.
Nothing was implemented, repaired, migrated, or opened as a PR. All database access was `SELECT` only.

---

## −1. Document provenance and seal history (MIR-001-A)

This document was sealed once, **reopened once**, and re-sealed. That sequence is recorded here
rather than smoothed over, because a seal that is described as unbroken when it was not is exactly
the class of inflation this review was commissioned to detect.

```text
MIR-001-A v1   initial diagnostic return                        SEALED
                     ↓  bounded post-seal inquiry (read-only)
MIR-001-A v2   v1 + §4.8 selection-rule recovery                FINAL / RE-SEALED

diagnostic execution   COMPLETE
post-seal addition     §4.8 only — selection-rule recovery
product mutation       NONE
remediation            NONE
MIR-001-A              CLOSED
```

**Why the seal was reopened.** §4.8 introduced no remediation, no implementation, and no new
hypothesis. It closed a **read-only question the diagnostic had itself left unresolved**: *which
retrieved candidates survive selection, and by what canonical rule?* That inquiry was already inside
MIR-001's authorized diagnostic scope, so it is recorded as a second evidence event within
MIR-001-A rather than split into a separate program.

**⚠️ v1 has no hash, and none can be manufactured.** The v1 map was written to the working tree and
never committed, then edited in place. **No git object, tag, or backup of v1 exists.** I am not going
to invent a referent for it. What *can* be stated and checked: the v2 edit was **purely additive at a
single contiguous insertion point** (§4.8, inserted between §4.7 and §5; +42 lines, 0 removed, 0
modified). **v1 is therefore exactly reconstructible from v2 by deleting §4.8 in full.** That is the
strongest honest provenance claim available, and it is weaker than a commit hash would have been.

**Standing lesson this establishes:** an artifact should be committed *before* being called sealed.
Declaring a seal on an uncommitted working-tree file makes the seal unverifiable by construction —
the same custody failure this document records as **D4** (governing corpora stranded off-trunk).
The review reproduced the defect it was documenting.

---

## 0. Scope boundary (stated first, deliberately)

**MRC-001 ("MAIA High-Fidelity Retrieval, Memory & Continuity") is out of scope and was not read.**
A search of this working copy found **no MRC-001 intake file present** — not at the repo root of
`origin/clean-main-no-secrets`, not on the checked-out branch, and not among untracked root files
(only `PROJECT_ORIENTATION.md` and `context-mode-healed-1.0.22` are untracked at root). Nothing
truncated was opened, and no observation, experiment, or conclusion below was steered by it.
Every finding here is independent evidence with its own provenance. This launch is cold.

---

## 1. Referent binding (bound before any evaluation)

Bare branch names are not used as evidence anywhere in this document. Remote truth was read with
`git ls-remote`; every claim cites the SHA inspected.

| Referent | Value | How established |
|---|---|---|
| Canonical trunk | `clean-main-no-secrets` | named by `CLAUDE.md` (via `orient.mjs`) |
| **Trunk HEAD (remote truth)** | **`969841012`** (`969841012d7e1353ff73e570f00f53c0f7792a2b`) | `git ls-remote origin` — 2026-08-12 |
| **Deployed production SHA** | **`e5f2c5fa2`** | `docker exec maia-sovereign printenv GIT_COMMIT` on minisforum |
| Deployed ↔ trunk | ancestor of trunk, **4 commits behind** | `git merge-base --is-ancestor` → YES; `rev-list --left-right --count` → `0 4` |
| Local `clean-main-no-secrets` | `f9a7326f1` — **18 ahead / 472 behind** `origin/` | `rev-list --left-right --count` |
| This working copy | `feature/labtools-redesign` @ `d41b8b355`, **450 dirty paths** | `orient.mjs`, measured now |

**⚠️ Referent hazard, confirmed live.** The local trunk ref is **472 commits behind** the remote
trunk. Any lane that reads `clean-main-no-secrets` without the `origin/` prefix is reading a
four-month-stale tree. This is the exact ambiguity the mandate warned produced a false
cross-lane "contradiction." **Every architectural claim in §3–§5 below was read from
`origin/clean-main-no-secrets` (`969841012`) explicitly**, never from the dirty checkout.

**Deployed-vs-trunk delta (4 commits)** touches `lib/maia/maiaRuntimeContext.ts`
(*"inventory the relational-context addendum instead of dropping it"*), `.githooks/dispatch`,
and hook-setup scripts. Production therefore runs **without** the relational-context observability
fix. Materially: an observability gap in production, not a cognition gap.

### 1a. Working copies — live vs stranded

`git worktree list` reports **~100 registered worktrees** across `/Users/soullab/`,
`~/.claude/worktrees/`, `/private/tmp/claude-501/…`, and `MAIA-SOVEREIGN/.claude/worktrees/`.
A large fraction are `/private/tmp/` scratchpad worktrees — these are **stranded by construction**
(tmp-scoped, session-scoped, unreachable after reboot). This is a builder-hygiene finding, not a
MAIA finding, and is recorded only because it is the medium in which MAIA evidence gets lost.

### 1b. Governing corpora — **a stranded-evidence finding**

| Corpus | Location | Status |
|---|---|---|
| EDE-001…005 + freeze-review protocol + closure | **`d41b8b355` (feature branch only)** | ⚠️ **not on trunk** |
| `docs/architecture/audits/m0-memory-map/` | **only commit `c42cfe4a3`** | ⚠️ **not on trunk, not on HEAD** |
| `RELATIONAL_FIELD_FUNCTIONAL_SOVEREIGNTY_AUDIT_2026-08-10.md` | on trunk | reachable |

**The `m0-memory-map` corpus — cited as governing in `CLAUDE.md` for the DEEP-addenda closure and
the spiral-state severance archaeology — does not exist on trunk or on the current branch.** It
survives on a single preservation commit. `CLAUDE.md` on trunk cites rulings that a trunk-only
reader cannot open. Governing evidence is reachable only by knowing a SHA that no document names.
**Classification: STALE/DEAD (custody), not wrong (content).** Cited, not re-derived, per mandate.

---

## 2. Method and instrument order

Deterministic instruments first, as directed: `scripts/builder/orient.mjs` (the repo's own
orientation probe) established the workspace; `git ls-remote` bound remote truth; live PostgreSQL
and the running container on minisforum supplied production evidence. No frontier-model
re-derivation was used where an instrument existed. Two forensic techniques were needed and are
disclosed so they can be checked:

1. **Writer-signature separation** (§4.2) — distinguishing two code paths that write the same table
   with no stage column, by their distinct score-column fingerprints.
2. **Log-retention bounding** (§2a) — bounding what the container log can and cannot witness.

### 2a. ⚠️ Instrument limitation that bounds every log claim below

The `maia-sovereign` container **started 2026-08-11T23:13:33Z** and retains **4,545 log lines
total**. `docker logs --since 24h` and `--since 168h` return *identical* content because **no log
older than the container start exists**.

**Therefore: every log-derived statement in this document describes a ~5.6-hour window containing
9 member turns.** It is a keyhole, not a survey. Log evidence is used below only for *mechanism*
("this code path fires and produces this value"), never for *rate* or *prevalence*. All
rate/prevalence claims come from the database, which spans 2026-01 → now. This distinction is
load-bearing and I have not blurred it.

---

## 3. The memory + intelligence architecture as it exists on trunk

Read from `969841012`. This is what the code does, not what the documents describe.

**Live member conversation route: `app/api/sovereign/app/maia/list/route.ts`.**
It is the only route that calls `MemoryBundleService.build` in the member path (also called by
`lib/consciousness/maiaOrchestrator.ts` and `lib/voice/wisdom/MaiaWisdomProvider.ts`).

There are **two independent memory channels reaching the prompt**, which is the single most
important structural fact in this review and is not clearly represented in existing documentation:

**Channel A — the Memory Bundle** (`lib/memory/MemoryBundle.ts`)
Parallel retrieval from **exactly three buckets**: `conversation_turns`, `developmental_memories`
(semantic), `breakthrough_moments`; plus a relationship snapshot. → rank → dedupe → **top 5
bullets** → `formatForPrompt()` → `memoryContext` (route line 686) → passed in `meta` (line 1197)
→ consumed in `maiaService.ts:857-859`, where the FAST prompt is literally
`${memoryContext}\n\n${recentThreadBlock}…\n\nUser: ${input}`.

**Channel B — the addenda channel** (`appendAllContextAddenda`, `lib/sovereign/maiaVoice.ts`)
Carries Wu Xing, astrology, Studio/practitioner, knowledge-gate, memory-orchestrator, conversational
recall, **episodic**, and **atoms**. Observed firing on both FAST and CORE in production.

**Channel A does not retrieve** `episodic_memories`, `member_memory_atoms`, `reflection_capsules`,
`member_daily_anchors`, or `member_spiral_state`. Those classes depend entirely on Channel B.

A **fallback** exists and is real: `maiaService.ts:800` — if the route supplies no `memoryContext`,
FAST fetches from `MemoryOrchestrator` independently. Memory has a second chance to arrive.

---

## 4. Production evidence

All counts are exact (`count(*)`), read 2026-08-12 against production `maia_consciousness`.
`pg_stat_user_tables.n_live_tup` was found to be badly stale (reported `maia_turns`=1,791 vs actual
**173,342**) and was discarded as an instrument.

### 4.1 Substrate census

| Table | Exact rows | Latest write | Reading |
|---|---:|---|---|
| `maia_turns` | 173,342 | 2026-08-12 02:40 | live |
| `conversation_memory_uses` | 73,893 | 2026-08-12 02:40 | **live, writing this hour** |
| `conversation_turns` | 39,707 | 2026-08-12 02:40 | live |
| `agent_runs` | 34,555 | 2026-08-12 02:40 | live (Corpus Callosum) |
| `integration_passes` | 2,872 | 2026-08-12 02:40 | live |
| `developmental_memories` | 1,491 | *(no timestamp column)* | live via ledger |
| `reflection_capsules` | 371 | 2026-08-11 21:27 | live |
| `episodic_memories` | 122 | 2026-08-12 00:38 | **written, not surfaced — see §4.4** |
| `member_memory_atoms` | 142 | **2026-06-27** | **frozen 6 weeks** |
| `member_daily_anchors` | **0** | — | empty (confirms the 2026-08-09 correction) |
| `member_spiral_state` | 9 | **2026-04-08** | **frozen 4 months (confirms severance ruling)** |

`agent_runs`, `integration_passes`, `conversation_turns`, `maia_turns` and
`conversation_memory_uses` all carry writes in the **same second** — they fire on one turn.

### 4.2 ⭐ The consumer-boundary instrument, and what it actually proves

`conversation_memory_uses` looks like proof that memory *was used*. Its name says "uses"; its column
says `used_as`. **It is not that.** Two different code paths write it, at two different stages, with
no column distinguishing them:

- `MemoryBundle.ts:106` → `recordRetrievedCandidates(...)` — whose own docstring reads:
  *"Call this right after the retriever returns candidates, **BEFORE compression**."*
  This records **all ~23 candidates**, including the ~18 that ranking discards.
- `maiaService.ts:3148` → `recordBatch(...)` — records `memoryBundle.memoryBullets`, i.e. the
  **top-5 that actually reached the prompt**.

**Forensic separation (this review's own technique).** The two writers leave disjoint fingerprints:
`recordRetrievedCandidates` sets `semantic_score` and distinct `retrieval`/`confidence` scores;
`recordBatch` leaves `semantic_score` NULL and sets `retrieval_score = confidence_score`. The test
partitions all 73,893 rows with **zero overlap**:

| Stage | Fingerprint | Rows | Share |
|---|---|---:|---:|
| Retrieval-stage (candidates, pre-compression) | `semantic_score` NOT NULL | **56,681** | 76.7% |
| Injection-stage (bullets that reached the prompt) | `semantic_score` NULL ∧ scores equal | **17,212** | 23.3% |

A second independent confirmation: `recordBatch` mislabels breakthroughs as
`memory_table='conversation_turns'` while `used_as='breakthrough'` — a combination
`recordRetrievedCandidates` can never emit (it maps them to `breakthrough_moments`). Those 3,458
rows are injection-stage by construction. The two methods agree.

**So the boundary IS measurable — but only by forensic inference, never by design.** ~77% of the
rows in a table named "uses" record memories that were retrieved and then *discarded*. Any query,
dashboard, or claim that reads `conversation_memory_uses` as a use-ledger **overstates MAIA's
memory participation by roughly 4×**. This is the single most consequential finding in this review.

### 4.3 Retrieval health — measured, and better than expected

Production, since container start: **9/9 turns** attempted retrieval; **9/9 succeeded**;
`MemoryBundleService.build ok in 16–85 ms`; **0 timeouts, 0 build failures, 0 empty contexts**
(`grep -c 'memoryContext is EMPTY'` → 0, `'Build failed'` → 0). Against a 5,000 ms budget, actual
cost is ~0.5%. Prompt reach is directly witnessed on FAST:

```
🧠 [FAST/MemoryDebug] memoryContext.length=1179, recentContext.length=652, hasMemoryBundle=true
🧠 [FAST/MemoryDebug] Using MEMORY BUNDLE + recent thread (bundle=1179 chars, recent=652 chars)
```

I initially suspected the nine `MemoryBundleService.build` log lines were timeouts. They are timing
lines reading `ok in Nms`. **The retrieval spine is healthy.** Correction recorded rather than
quietly dropped, because a defect that isn't there would have mis-set the roadmap.

**Also not a defect:** every log line reads `same-session: 0, cross: 12`. This is **by design** —
`getRecentTurns` under `scope='cross_session'` executes `AND session_id <> $2`, deliberately
excluding the current session (the current session arrives via `recentContext`/`conversationHistory`
instead). Reported here explicitly because the invariant looks alarming and would otherwise be
"found" as a bug by a later lane.

### 4.4 Episodic — written, and demonstrably not arriving

`episodic_memories` holds 122 rows and is **actively written** (12 in the last 7 days, latest
2026-08-12 00:38). Production emits the block, and it emits false:

```
[MAIA] episodic-block {
    episodic: false,
```

Meanwhile sibling addenda on the same turns succeed: `[CORE] Wu Xing addendum applied`,
`[CORE] Astrology addendum applied`, `[CORE] Studio addendum applied`,
`[FAST] Memory orchestrator addendum applied (411 chars)`,
`[FAST] Conversational recall addendum applied (2023 chars)`.

So the addenda channel works; **episodic specifically is not populating it.** Episodic is the layer
`CLAUDE.md` names as the threshold at which "MAIA remembers a life unfolding" becomes testable.
It is being written and is not being read into cognition.

`atoms loaded` appears **0 times** in the retained window, consistent with `member_memory_atoms`
frozen since 2026-06-27.

### 4.5 Corrigibility — the sharpest single result

`conversation_memory_uses` carries `user_feedback` and `feedback_note` columns.
`ConversationMemoryUsesStore` exposes `recordFeedback()` and `getProblematicMemories()`.

- **`user_feedback` is NULL on 73,893 of 73,893 rows.** Not one correction, ever.
- `recordFeedback` / `getProblematicMemories` have **zero callers** anywhere in the codebase
  outside their own definitions. (Grep hits on `recordFeedback` elsewhere are unrelated
  same-named methods in `BetaMonitoring`, `PromptTestTracking`, `interactionFeedbackService`.)

**A member cannot say "that's not what happened" and have it propagate. There is no route, no UI
gesture, and no reader.** The schema and the API were built; the path was never connected.

### 4.6 Model substrate

```
CLAUDE_MODEL=claude-opus-4-5-20251101      DISABLE_CLAUDE=false
ALLOW_ANTHROPIC_CHAT=true                  ALLOW_ANTHROPIC_CONSCIOUSNESS=false
OLLAMA_MODEL_FAST/GENERAL=qwen2.5:7b       OLLAMA_MODEL_DEEP=qwen2.5:14b-instruct
```

Sovereignty posture holds (Anthropic primary, local Ollama fallback, no third-party cloud).
Two facts for the Founder, neither a defect: MAIA runs on a **prior-generation model**
(Claude Opus 4.5; the current family is Claude 5), and **`ALLOW_ANTHROPIC_CONSCIOUSNESS=false`**
gates a capability lane off in production. Whether either should change is a Founder call, not mine.

### 4.7 Scale of lived use

16 distinct members in `conversation_turns` over 30 days; 13 distinct members in the memory ledger;
664 turns in 7 days. **MAIA is in real but small-cohort use.** Sample-size honesty: findings about
*mechanism* are strong; findings about *member experience* rest on ~16 people.

### 4.8 The selection rule — *which five survive, and by what rule*

Read from `lib/memory/MemoryBundle.ts` @ `969841012`. The rule is short enough to state in full:

```
compositeScore = ( 0.40·similarity + 0.30·significance + 0.20·recencyScore + 0.10 ) · facetMatch
recencyScore   = exp(−ageDays / 30)
facetMatch     = 1.2 if candidate.facet === facet, else 1.0
```

then `sort desc` → `deduplicate` → `slice(0, 5)`.

Four structural properties follow, each verifiable from the source:

1. **Two incommensurable scoring regimes are sorted into one list.** The mapper opens with
   `if (c.compositeScore) return c;` — candidates arriving with a pre-computed score (the semantic
   path) are **never re-scored**, then ranked head-to-head against candidates scored by the formula
   above. The comparison assumes a shared scale that is never established.
2. **`facetMatch` is inert in production.** The live route's `build({...})` call passes
   `userId, currentInput, sessionId, traceId, scope, maxBullets` — **no `facet`**. The 20%
   relevance boost cannot fire on the member path. A designed relevance signal, dead in the live lane.
3. **Recency decays hard.** `exp(−days/30)`: a 90-day-old memory contributes `0.0498 × 0.20 ≈ 0.01`
   to its score. Anything older than roughly a season is, on the recency term, invisible.
4. **`significance` defaults to `0.5` when absent** — so an unmarked memory and a genuinely
   mid-significance one are indistinguishable to the ranker.

**What the rule contains:** semantic similarity, a significance scalar, recency.
**What it contains no term for:** corrections, supersession, decisions, unfinished threads,
member-marked breakthroughs (`is_breakthrough` is not a ranking input), commitments, or relational
load-bearing-ness.

**Dedupe is a second, quieter loss channel.** `deduplicate` hashes **the first 100 characters,
lowercased**. Distinct memories sharing a templated opening collapse to one; the lower-scored twin
is dropped silently. It runs *after* sort, so the survivor is the higher-scored one — but the loss
is never counted.

⚠️ **Discipline note — what this does NOT establish.** This proves the selection rule is *thin
relative to what continuity requires*. It does **not** prove that load-bearing memories are in fact
being discarded on real turns. No instrument compares "what the member needed" against "what
survived." **Classification: PROVEN DEFECT (rule composition) · UNKNOWN (member-facing consequence).**
The distinction must survive into any remediation brief.

---

## 5. Nine dimensions — proof status

| # | Dimension | Question | Status | Evidence |
|---|---|---|---|---|
| 1 | **Memory custody** | Is what's stored governed, scoped, deletable? | **PROVEN HEALTHY** | Sanctuary gates checked at every write site (`maiaService.ts:3113-3140`); `containsSensitiveData` guard; per-table deletion in `delete-account/route.ts`; per-member isolation tested |
| 2 | **Retrieval** | Does retrieval run and succeed? | **PROVEN HEALTHY** | 9/9 attempts, 16–85 ms, 0 timeouts / 0 failures / 0 empty (§4.3) |
| 3 | **Context assembly** | Do retrieved memories become a prompt block? | **PROVEN HEALTHY (FAST)** · **UNKNOWN (CORE/DEEP)** | FAST witnessed at 1,179 chars (§4.3). CORE/DEEP emit no equivalent marker — **instrumentation missing, not a defect** |
| 4 | **Continuity** | Does MAIA carry a member across sessions? | **PARTIAL** | Cross-session recall proven live (12 cross-session turns/turn). But `member_spiral_state` frozen since 2026-04-08, atoms since 2026-06-27, anchors empty |
| 5 | **Relational intelligence** | Is the relationship represented? | **PARTIAL** | `relationshipSnapshot` (encounters, breakthroughs, dominant element) reaches the prompt via `formatForPrompt`. Depth beyond counts unverified |
| 6 | **Wisdom / reasoning** | Is multi-voice cognition real? | **PROVEN HEALTHY (substrate)** · **UNKNOWN (effect)** | 34,555 `agent_runs` + 2,872 `integration_passes`, writing same-second as turns. Whether it changes what the member receives is **unmeasured** |
| 7 | **Model substrate** | What actually thinks? | **PROVEN HEALTHY** | §4.6. Sovereignty posture intact; generation and one gate are Founder decisions |
| 8 | **Member experience** | Does it land as continuity? | **UNKNOWN** | No instrument exists. `maia_turn_feedback` = **0 rows**. Not a defect — an absence of measurement, and I decline to promote it |
| 9 | **Corrigibility** | Can a member correct MAIA? | **PROVEN DEFECT** | 73,893/73,893 `user_feedback` NULL; `recordFeedback` has zero callers (§4.5) |

---

## 6. Memory-class path table

`EXISTS → ELIGIBLE → RETRIEVED → ASSEMBLED → REACHES PROMPT → USED → OBSERVABLE → PERSISTS/CORRECTS`
✅ proven · ⚠️ partial · ❌ proven negative · ? unknown (no instrument)

| Class | EX | ELIG | RETR | ASSM | PROMPT | USED | OBS | CORR | Verdict |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| `conversation_turns` (cross-session) | ✅ | ✅ | ✅ | ✅ | ✅ | ? | ⚠️ | ❌ | **PARTIAL** — best-proven path; stops at "used" |
| `developmental_memories` | ✅ | ✅ | ✅ | ✅ | ✅ | ? | ⚠️ | ❌ | **PARTIAL** — largest ledger share (34,267) |
| `breakthrough_moments` | ✅ | ✅ | ✅ | ✅ | ✅ | ? | ⚠️ | ❌ | **PARTIAL** — 3,458 injection-stage rows |
| `episodic_memories` | ✅ | ✅ | ? | ❌ | ❌ | ❌ | ✅ | ❌ | **PROVEN DEFECT** — written; `episodic: false` (§4.4) |
| `member_memory_atoms` | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **STALE** — 142 rows, frozen since 2026-06-27, `atoms loaded` absent |
| `member_spiral_state` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | **STALE/DEAD** — write severed since 2026-04-08 (ruled; cited, not re-derived) |
| `member_daily_anchors` | ✅(schema) | ✅ | — | — | — | — | ✅ | — | **DESIGNED BUT UNUSED** — 0 rows |
| `reflection_capsules` | ✅ | ? | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **UNKNOWN** — 371 rows, live writes, absent from both channels |
| Semantic / embeddings | ✅ | ✅ | ✅ | ✅ | ✅ | ? | ⚠️ | ❌ | **PARTIAL** — `semantic_score` populated on 56,681 rows |

**The `USED` column is `?` for every single class.** No instrument in this system observes whether a
memory that reached the prompt participated in the cognition that produced the response. That is the
consumer boundary the mandate defines, and **nothing currently measures it.** This is the honest
headline: MAIA's memory is proven to *arrive*, and is nowhere proven to be *used*.

---

## 7. Critical defects, ranked

**D1 — The use-ledger is a retrieval-ledger. (PROVEN DEFECT · epistemic, highest severity)**
77% of `conversation_memory_uses` rows are discarded candidates. Any downstream claim about
"memories used" is inflated ~4×. Separable only by forensic fingerprint, not by design. This
corrupts the evidence base every future lane will reason from — including any successor mandate.

**D2 — Corrigibility is unreachable. (PROVEN DEFECT)**
73,893/73,893 feedback NULL; `recordFeedback` zero callers. A member cannot correct MAIA's memory of
them. This is a *sovereignty* defect, not merely a feature gap: memory held about a person that the
person cannot amend inverts the direction of authority.

**D3 — Episodic is written but never read. (PROVEN DEFECT)**
122 rows, actively growing, `episodic: false` on live turns while sibling addenda succeed.
The layer designated as the threshold for continuity claims is not participating.

**D4 — Governing evidence is stranded off-trunk. (STALE/DEAD, custody)**
`m0-memory-map` exists only on `c42cfe4a3`; the EDE corpus only on a feature branch. `CLAUDE.md` on
trunk cites rulings a trunk-only reader cannot open.

**D5 — Local trunk ref is 472 commits stale. (PROVEN DEFECT, process)**
Already demonstrated to produce a false cross-lane contradiction. Structural, and it will recur.

**D6 — CORE/DEEP prompt-reach is uninstrumented. (UNKNOWN — listed because it blocks proof)**
Only FAST emits a prompt-reach marker. Most turns are not FAST.

**D7 — Log retention ≈ container lifetime. (PROVEN DEFECT, observability)**
4,545 lines, ~5.6 hours. Any production question older than the last restart is **unanswerable**.
Every log-based claim any lane has ever made about "the last 7 days" was bounded by this.

---

## 8. Open unknowns (explicitly not promoted to defects)

1. **Does any memory change the response?** The consumer boundary is unmeasured for all nine classes.
2. **Member experience.** `maia_turn_feedback` = 0 rows. No instrument.
3. **Corpus Callosum effect.** 34,555 `agent_runs` prove emission, not influence.
4. **`reflection_capsules`** (371 rows, live) — belongs to no observed channel. Purpose unresolved.
5. **CORE/DEEP assembly** — see D6.
6. **`developmental_memories` provenance** — 1,491 rows, no timestamp column; origin unestablished.
7. **Memory-record supersession** — `orient.mjs` declares this structurally undecidable; not solved here.

---

## 9. Proposed 30-day roadmap — **requires Founder ruling; no Phase B authority exists**

Ordered so that *measurement precedes remediation* — the alternative is repairing what we cannot yet
prove is broken.

**Week 1 — make the evidence trustworthy (no member-facing change)**
1. Add a **stage discriminator column** to `conversation_memory_uses` (`retrieved` vs `injected`).
   Backfill is *derivable* from the §4.2 fingerprints. Retires D1 at the root. **⚠️ schema change —
   material consequence, Founder call (§10).**
2. Raise container log retention (D7). Pure ops; unblocks every future production question.
3. Restore `m0-memory-map` + EDE corpora onto trunk (D4). Custody only, no content change.

**Week 2 — close the instrumentation gap before touching behavior**
4. Emit a prompt-reach marker on CORE and DEEP matching FAST's (D6). Converts dimension 3 from
   UNKNOWN to measurable.
5. Diagnose D3 (`episodic: false`) — **diagnose only**; the fix is a separate authorization.

**Week 3 — the consumer boundary**
6. Design (not build) an instrument answering *"did this memory participate in this response?"*
   This is the mandate's actual acceptance question and nothing today answers it.

**Week 4 — corrigibility**
7. Bring D2 to the Founder as a **design question, not a ticket.** A correction gesture changes
   consent semantics and member-facing philosophy; it is explicitly a §10 stop.

**Deliberately NOT proposed:** reviving `member_spiral_state` or atoms. Historical existence is
evidence of prior capability, **not authorization** (founder ruling 2026-08-09). Capability
preservation binds: nothing here reads "unused" as "unwanted," and nothing here authorizes retiring
KEEP, anchors, or spiral state.

---

## 10. Stops — returned to the Founder, not decided here

Per mandate, these are evidence, not failure:

- **D2 / corrigibility** — a member-correction path changes **consent and privacy semantics** and
  touches product philosophy (what it means for MAIA to hold a memory a member disputes). **STOP.**
- **Roadmap item 1** — schema change + backfill of 73,893 rows on a live production table.
  **Data migration with material consequence. STOP.**
- **§4.6 model substrate** — prior-generation model and `ALLOW_ANTHROPIC_CONSCIOUSNESS=false`.
  Competing designs are plausible; not a defect. **STOP.**
- **D3 episodic** — before repair, the Founder should rule whether episodic *should* reach the
  prompt. Documentation holds episodic under a freeze posture; making it live may be a governed
  act, not a bug fix. **STOP.**

---

## 11. Final acceptance criterion — answered from evidence

> *Can we explain why MAIA sometimes feels deeply knowing, and why on other turns she suddenly
> seems to know nothing?*

**Yes — and the explanation is not the expected one.**

The intuitive hypothesis is failure: retrieval timing out, erroring, coming back empty. **The
evidence refutes this.** Retrieval ran on 9/9 observed turns in 16–85 ms, with zero timeouts, zero
failures, zero empty contexts, against a 5,000 ms budget. When MAIA "knows nothing," it is almost
never because retrieval broke.

**Why she feels deeply knowing:** on a FAST turn, a real and substantial context reaches the model —
1,179 characters of memory bundle plus 652 characters of recent thread, carrying a relationship
snapshot (turn counts, breakthroughs, dominant element), up to 5 ranked memory bullets drawn from
12 cross-session turns, layered with Wu Xing, astrology, Studio and conversational-recall addenda.
That is genuine substrate, and the turns where it lands are the turns that feel knowing.

**Why she suddenly seems to know nothing — four mechanisms, all structural, none a crash:**

1. **Aggressive compression.** ~23 candidates are retrieved; **5** survive. ~78% of what MAIA
   found about the member is discarded *every turn*. When the discarded 18 contained the thing that
   mattered, MAIA has no way to know it ever existed. This is the dominant mechanism.
2. **Whole classes never arrive.** Episodic (`episodic: false`), atoms (frozen 6 weeks), spiral
   state (frozen 4 months), anchors (0 rows) contribute nothing. Continuity that a member believes
   was recorded is genuinely absent from cognition.
3. **Deliberate current-session exclusion.** `scope='cross_session'` executes `session_id <> $2`.
   By design — but it means the bundle's knowing is always about *other* sessions, and within-session
   depth rests on a separate, thinner channel (in FAST, prior responses truncated to **80
   characters**).
4. **Tier asymmetry.** Prompt reach is proven only on FAST. On CORE/DEEP it is **unknown** — so
   asking MAIA for *more* depth may route to a tier where memory arrival has never been verified.

**And the finding underneath all four:** the system cannot currently tell the difference between
"MAIA didn't have it" and "MAIA had it and didn't use it." Every class in §6 is `?` at the USED
column. That is why this question has felt unanswerable — not because the answer was hidden, but
because **the instrument that appeared to answer it (`conversation_memory_uses`) was measuring
retrieval and calling it use.**

The variance is real, it is explainable, and it is structural rather than broken.

---

*MIR-001 Phase A · read-only · no code, schema, or production state modified.
Trunk `969841012` · deployed `e5f2c5fa2` · database read 2026-08-12.
File written uncommitted on branch `feature/labtools-redesign` — it is not on trunk and, per D4,
should be relocated deliberately rather than left where this review found its own evidence stranded.*
