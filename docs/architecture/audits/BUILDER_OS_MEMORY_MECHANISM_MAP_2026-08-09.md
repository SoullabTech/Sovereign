# AIN Builder OS — Deep Memory-Mechanism Map (Step 2)

**Date**: 2026-08-09 · **Mode**: READ-ONLY. No implementation, no restructuring, no generated
state, no hook installation, no change to `CLAUDE.md`.
**Predecessor**: [`BUILDER_OS_DISCOVERY_AUDIT_2026-08-09.md`](./BUILDER_OS_DISCOVERY_AUDIT_2026-08-09.md)

**Governing question**: *How does AIN currently remember, retrieve, privilege, update, supersede
and forget builder knowledge — and where can Claude Code lose necessary context despite that
memory existing?*

---

## 0. Three corrections to Step 1, filed first

Step 1 was wrong in three material ways. Each is corrected here before anything is built on it.

### 0.1 — ⛔ **Step 1 missed an entire live Builder OS investigation authored the same day**

`docs/ops/` contains, all written **2026-08-09**, all **untracked (`??`)**:

| File | What it is |
|---|---|
| `CLAUDE_CODE_ROUTING_AND_COST_AUDIT_2026-08-09.md` | routing + cost audit |
| `SESSION_CONTEXT_BURDEN_AUDIT_2026-08-09.md` | 314 sessions · 94,203 requests · 24.16 B cache-read, measured |
| `CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md` | 11,495 B — the context-control architecture investigation |
| `CONTEXT_CONTROL_EXPERIMENT_PROTOCOL.md` | experimental protocol |
| `AIN_HANDOFF_RECORD_CONTRACT.md` | **a proposed `/continue` contract, with schema and a ≤3,000-token budget** |
| `LOCAL_MODEL_ROUTING_INVENTORY_2026-08-09.md` | model-routing inventory |
| `LOCAL_HARNESS_AB_PROTOCOL_2026-08-09.md` | local-model A/B protocol |
| `LOCAL_LANE_DISABLEMENT_TRACE_2026-08-09.md` | why the local lane is off |
| `KIMI_INTEGRATION_HISTORICAL_TRACE_2026-08-09.md` | prior local-model integration trace |
| `docs/specs/AIN_PORTABLE_EPISTEMIC_RECORD_SPEC_2026-08-09.md` | portable epistemic record spec |

**Step 1 inventoried `.claude/`, `scripts/`, settings and CI — and not `docs/ops/`.** The
consequence is not cosmetic: Step 1's gaps #1 (`/orient` + generated state), #6 (method-as-skills)
and #7 (model routing) were reported as unbuilt when **each already has an authored design
artifact from today**. This is itself a first-class finding — see §7.1, *the newest work is the
least discoverable*.

### 0.2 — ⛔ **"Zero hooks" was wrong; and the context-saving rationale for splitting `CLAUDE.md` is empirically falsified**

**Hooks**: `context-mode`'s `hooks/hooks.json` registers `PreToolUse` (matchers: `Bash`,
`WebFetch`, `Read`, `Grep`), `PostToolUse`, `PreCompact`, and **`SessionStart` context injection**.
Correct statement: **zero *AIN-authored* hooks; the hook mechanism is live, proven, and already
intercepting tool calls in this repo every session.** This *lowers* the cost of Step 1's gap #2 —
the boundary is already instrumented, just not by you.

**`CLAUDE.md`**: the same-day burden audit measured it directly.

```
r(cache_read, initial_context_size) = -0.010   ← starting burden predicts NOTHING
r(cache_read, requests)             = +0.955   ← request count predicts almost everything
```

| component of the 72,434-token p50 session floor | tokens | share |
|---|---|---|
| `MAIA-SOVEREIGN/CLAUDE.md` | 12,657 | 17% |
| `MEMORY.md` | 1,548 | 2% |
| `PROJECT_ORIENTATION.md` | 965 | 1% |
| `~/CLAUDE.md` | 935 | 1% |
| **all authored docs** | **16,106** | **22%** |
| **harness: system prompt + tool schemas + MCP + skill/agent listings** | **~56,431** | **78%** |

Deleting *every document you have ever authored* recovers **6.3%** of cache reads. **Splitting
`CLAUDE.md` to save context is refuted by measurement.** Step 1's gap #3 must be re-argued on
different grounds — and §9 shows those grounds exist and are stronger.

### 0.3 — Scale was under-counted

Step 1 said 51 worktrees. Measured: **101 worktrees · 8 detached HEADs · 1,548 local branches ·
815 already merged into trunk · working tree 10 commits behind trunk · 188 dirty paths.**

---

## 1. Memory topology — the layers that actually exist

Nine layers were proposed. **Ten exist.** The tenth is not a variant of any other and is
load-bearing.

### L1 · Constitutional memory
`docs/canon/` (~90 files), `MAIA_OATH.md`, `MAIA_CANON_v1.1.md`,
`MAIA_SOVEREIGNTY_INVARIANTS.md`, `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`, dated
`FOUNDER_RULING_*` documents. Owns **what may be**. Amendment-only; ratification is an explicit
act with a date and a named ruler.

### L2 · Architectural memory
`docs/architecture/` (+ `audits/`), `docs/design/`, `docs/specs/`. Owns **what shape a thing takes
and why**. Append-heavy, dated-filename convention, weak supersession.

### L3 · Project / lane memory — the governed memory tree
`~/.claude/projects/-Users-soullab-MAIA-SOVEREIGN/memory/` · **1,429 files · 12 MB**. Owns **what
happened, what was learned, what is standing**. Analyzed in depth in §2.

### L4 · Executable memory
`database/migrations/`, `lib/`, `app/`, `__tests__/`, ~30 `check-*`/`certify-*` gates, 9 CI
workflows, 3 git hooks, `Dockerfile`, `docker-compose.production.yml`. Owns **what the system
actually does**.

### L5 · Git / history memory
101 worktrees, 1,548 branches, PRs, merge state, commit provenance. Owns **what was actually
done**, and — per the memory tree's own standing rule — ***a commit is the only durable act***.

### L6 · Claude / session memory
`CLAUDE.md` (51,415 B) · `~/CLAUDE.md` · `PROJECT_ORIENTATION.md` (3,860 B) ·
`.claude/agents/` (6) · `.claude/skills/` (1) · `.claude/settings.local.json` (489 allow / 6 deny).
Owns **what Claude is told before it acts**.

### L7 · Retrieval / index memory
`MEMORY.md` root routing index + 15 linked sub-indexes (38 index files exist) · `context-mode`
FTS5 store · `npm run memory:audit`. Owns **how the other layers are found**.

### L8 · Operational memory
`GIT_COMMIT` in the running container · `docker inspect` · `/api/health` · deploy-lane `flock` ·
`DEPLOY_LANE_TOKEN` · `agent_runs` / `runtime_events` rows · production `psql` counts. Owns
**what is true in production right now**. Uniquely: **not on disk anywhere** — it must be probed.

### L9 · Human-authored continuity
Founder rulings, `⛔`/`⚠️⚠️`/`🔴` markers, "record, do not absorb", "AWAITING FOUNDER RULING",
`docs/governance/FOUNDER_DECISION_DOCKET_*`. Owns **what is deliberately unresolved**.

### L10 · **Instrument memory** — *not in the proposed taxonomy; add it*
Re-runnable measuring devices that regenerate truth on demand rather than storing it:
`scripts/memory/audit-memory.py` (`npm run memory:audit`) ·
`scripts/audit-session-context-cost.py` · `scripts/verify-colab-boundaries.ts` (31/31 gate) ·
`scripts/check-continuity.sh` · `scripts/certify-*`.

This layer is distinct because **its output is dated, disposable, and reproducible**, whereas
L1–L9 persist. It is also the layer where AIN is strongest and where Builder OS should reach
first: *an instrument that can be re-run is a stronger witness than a record of having run it.*

---

## 2. The 1,429-file memory tree — structural findings

*Investigated before recommending any retrieval strategy, as instructed.*

### 2.1 It is far more structured than prose

| property | measurement |
|---|---|
| files | **1,429** (1,428 `.md` + 1 `.bak`), 12 MB |
| YAML frontmatter present | **1,416 / 1,429 = 99.1%** |
| `name:` field | 1,416 · `type:` 1,410 · `description:` 1,409 |
| `originSessionId:` | **1,323 — provenance to the originating session** |
| `modified:` timestamp | 332 |
| naming prefixes | `project_` 1,020 · `feedback_` 341 · `reference_` 39 · `index_` 9 · `user_` 8 |
| resolving cross-links | 4,980 (avg **3.49** outbound per file) |
| link depth from root | up to **7** hops (1 → 19 → 376 → 466 → 219 → 80 → 31 → 11) |

**Finding 2.1 — the corpus already carries enough structured metadata for deterministic
narrowing.** Type, name, description, origin session, and a hand-curated 4-level index hierarchy
exist on ~99% of files. **Embeddings are not required to narrow this corpus, and global semantic
search would discard exactly the structure that makes it governable.** Your instinct in the brief
is confirmed by measurement, not preference.

### 2.2 …but the metadata schema has drifted

`type:` appears at two nesting levels with two vocabularies:

```
metadata.node_type: memory  (1,127 files)
type: project (218) · feedback (65) · user (4) · reference (2)
```

1,127 files say `node_type: memory` — a value that classifies nothing, because *everything* in the
corpus is memory. The **discriminating** signal is the filename prefix (`project_`/`feedback_`/
`reference_`), not the declared type. Deterministic retrieval today would key on **filenames**,
which is fragile.

### 2.3 Reachability: 15.6% of the corpus is unreachable from the canonical entry point

| | count |
|---|---|
| reachable from `MEMORY.md` by link | **1,203 / 1,428** |
| **orphaned (on disk, no path from root)** | **225** |
| zero inbound links | 223 (15.6%) |
| orphan indexes | 2 — `project_open_source_orientation_index.md`, `_archive_index_history_2026-08-02.md` |

Orphans are **not** all archival. The most recently written include
`project_relationship_scope_boundary_992.md` (08-06), `feedback_ci_cancelled_is_not_ci_failed.md`
(08-06), `project_relationships_as_first_class_primitive.md` (08-05),
`feedback_context_may_not_acquire_authority.md` (08-03).

**Finding 2.3 — active, recent, load-bearing memories are invisible to link-based routing.** The
root index's own growth invariant ("no substantive entry may be added here") is working as
designed — and its side effect is that a memory written without a sub-index hook is *written and
lost in the same act*.

### 2.4 Broken links: 1,018 references, and 78% are one mechanical bug

| category | targets | refs |
|---|---|---|
| total broken | 473 | **1,018** |
| **resolvable by hyphen→underscore normalization** | **304** | **790 (78%)** |
| genuinely absent (never written / deleted) | 169 | 228 |

The frontmatter `name:` field uses **hyphens** (`feedback-merged-verified-accepted-states`), the
filenames use **underscores** (`feedback_merged_verified_accepted_states.md`), and `[[wikilinks]]`
are written from the `name:` — so they resolve to nothing. 790 references point at files that
**exist on disk right now**.

**Finding 2.4 — the single largest retrieval defect in the memory system is a naming-convention
collision, not a search-quality problem.** No embedding model fixes this. `memory:audit` already
classifies "link-convention drift" as a WARN.

### 2.5 Supersession is **prose, not structure** — the stale-masquerade surface

| representation | count |
|---|---|
| hard markers in body (`SUPERSEDED`/`RETIRED`/`OBSOLETE`/`VOID`/`overturned`) | **61 files** |
| soft markers (`stale` 440 occ / `no longer` 295 occ / `CORRECTION` 83 occ) | 219 / 190 / 57 files |
| **structural supersession in frontmatter** | **37 files (2.6%)** |
| files carrying a hard marker **that an index still links as current** | **44** |

**Finding 2.5 — this is the most dangerous property of the memory system.** To learn that a
memory is retired you must **read its body**. An index hook — the thing a session actually reads
under context pressure — can present retired truth as current, and does so in **44 measured
cases**. The root index anticipates exactly this ("*a hook that reads settled when the topic file
says otherwise is the failure this index exists to prevent*") and mitigates it **by instruction
to the reader**, which is the weakest available control.

### 2.6 Temporal structure is by mtime, not by content

Only **16 / 1,429** filenames carry a date. Writes by month: Mar 31 · Apr 74 · May 243 · Jun 423 ·
Jul 479 · Aug 179 (partial). There is no `valid_from` / `valid_until` / `asserted_at` field, so
**"is this still true?" cannot be answered without reading**.

### 2.7 Generated vs authored, canonical vs working

Every file in the tree is **authored**. Nothing is generated. The `_`-prefixed files
(`_snapshot_*`, `_migration_record_*`, `_referent_pass_report_*`, `_archive_index_history_*`) are
**deliberate archival provenance** and correctly orphaned — the split of 2026-08-05 is
byte-verified (96/101 byte-exact, 0 entries lost, 0 duplicate homes). **Provenance discipline at
the migration layer is exemplary; provenance discipline at the individual-memory layer is absent.**

---

## 3. Authority topology — which memory can overrule which

### 3.1 What is actually governed

AIN has **many** ratified authority instruments — more than most engineering organizations:

| instrument | what it orders |
|---|---|
| `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` | authority moves **upward only** through authored experience |
| North Star Hierarchy (`PROJECT_ORIENTATION.md`) | Purpose > Human > Transformation > Loop > **Capabilities**; nothing lower may compete with something higher (**PROPOSED**, not ratified) |
| `feedback_no_ladder_above_unsettled_floor` | **Ruled → Designed → Built → Wired → Surfacing → Verified → Operational** |
| `feedback_merged_verified_accepted_states` | Merged ≠ Activated ≠ Verified ≠ Accepted — three independent authorities |
| `feedback_measurement_governance_implementation` | Measurement ⊥ Governance ⊥ Implementation — *"most errors are answering one with another"* |
| `EVIDENCE_SCOPE_RULE_2026-08-06.md` | absence claims ⇄ presence claims |
| `EVIDENCE_BELONGS_TO_ITS_ARCHITECTURE_2026-08-06.md` | evidence is **not fungible** |
| `feedback_instrument_referent_matching` | an instrument measures **its own checkout**, not the deployed referent |
| CLAUDE.md standing rule | *"LIVE = code + schema deployed and exercised; not in use by members"* |

### 3.2 The gap — named, not filled

**There is no single ratified rule ordering the witnesses.** A direct search for a precedence
ordering across `ratified ruling ↔ documentation ↔ schema/migration ↔ source ↔ runtime ↔
production evidence` returns **nothing** in `docs/canon/`, `docs/governance/`, `docs/ops/`, or the
memory tree.

What exists instead are **four partial orderings on different axes**:

1. *Constitutional* (Direction of Authority) — vertical, about member experience, **not** about
   which artifact wins a factual dispute.
2. *Maturity* (the 7-rung ladder) — how far a capability has come, **not** which witness to
   believe.
3. *Independence* (Merged ≠ Verified ≠ Accepted) — explicitly refuses to let one imply another.
4. *Category* (Measurement ⊥ Governance ⊥ Implementation) — **the closest thing to a precedence
   rule**, and it is an orthogonality rule: it forbids substituting categories rather than ranking
   witnesses within one.

The corpus contains repeated *instances* of the missing rule being applied ad hoc — "migration
files are not measurements", "repository declarations ≠ deployed reality", "`--verify` measures
the observer's checkout", the 2026-08-09 anchor correction where a production `count(*)`
overturned a documented LIVE claim. **The rule is being practised without being written.**

⛔ **This document does not propose the ordering.** It records that the practice is consistent
enough to be ratifiable, and that ratification is a founder act.

---

## 4. Read paths — how Claude reaches each layer today

| layer | discovery mode | auto-loaded? | queryable? |
|---|---|---|---|
| L1 constitutional | instructed (CLAUDE.md names ~8 of ~90 canon files) | **partially — pointers only** | grep only |
| L2 architectural | accidental (grep/glob, or named by a memory hook) | no | grep only |
| L3 memory tree | **routed** via `MEMORY.md` → sub-index → topic file | index only (1,548 tok) | link-walk + FTS5 |
| L4 executable | searched (Grep/Read/tests) | no | yes |
| L5 git | instructed (session-start `gitStatus` snapshot) | **yes — and STALE by standing rule** | yes |
| L6 session | **automatic** (CLAUDE.md + PROJECT_ORIENTATION + ~/CLAUDE.md) | **yes** | n/a |
| L7 retrieval | automatic (`MEMORY.md`) + `context-mode` SessionStart injection | yes | yes |
| L8 operational | **probed only — never automatic** | **no** | yes, via ssh/psql |
| L9 human continuity | accidental — embedded inside L1/L2/L3 prose | no | grep only |
| L10 instruments | accidental — **no register of instruments exists** | no | must be known by name |

**Finding 4.1** — The two layers with the **strongest** epistemic standing (L8 operational, L10
instruments) have the **weakest** discovery. Production truth is never loaded and must be
remembered-to-be-probed; there is no list of the measuring devices that exist.

**Finding 4.2** — `gitStatus` is injected at session start and is **known-stale** by a standing
memory rule (*"session-start `gitStatus` is STALE — `rev-parse` first"*). The audit confirms it:
the snapshot in this session's own prompt lists a truncated status against a working tree with 188
dirty paths, 10 commits behind trunk.

---

## 5. Write paths — how durable state enters

| layer | writer | mode | provenance kept? |
|---|---|---|---|
| L1 | founder (ratification) | amendment, dated | ✅ strong — named ruler + date |
| L2 | Claude, session-authored | append, new dated file | ⚠️ file date only |
| L3 | Claude, per the memory protocol in the system prompt | append (new file) + **mutate** (index hooks) | ✅ `originSessionId` on 1,323 files |
| L4 | Claude + CI + deploy | mutation under gates | ✅ strongest — git |
| L5 | git | append-only | ✅ by construction |
| L6 | Claude + founder | **mutation, ungated** | ❌ none — `CLAUDE.md` has no changelog |
| L7 | Claude | mutation of shared index | ⚠️ snapshots at migrations only |
| L8 | the deploy | replacement | ✅ `GIT_COMMIT` + lane token |
| L9 | founder | append | ✅ dated |
| L10 | instrument run | regeneration | ✅ **binds to `index_sha256` + `corpus_manifest_sha256`** |

**Finding 5.1 — `MEMORY.md` is a shared mutable surface with no lock**, across ~101 worktrees.
`reference_memory_index_write_contention.md` documents two live collisions (2026-07-10): a
full-file Write shrank the index 19,292 → 18,813 B mid-flight, and *"modified-since-read only
catches the second writer"* — the first writer's clobber was caught by **human observation, not by
any guard**. The deploy layer solved the identical problem with `flock`; the memory layer runs on
**inference and restraint**. A claim-note convention is a *held direction, explicitly not built*.

**Finding 5.2 — the memory directory is not under version control.** Per the 2026-07-28 ruling:
no nested git repo; reviewability comes from timestamped reports and corpus hashes; **Time Machine
is its only backup**. Correct as a ruling, but it means L3 is the one layer where a bad write has
no `git revert`.

**Finding 5.3 — `CLAUDE.md` is the least-governed write path in the system.** Everything it
governs is gated; it is gated by nothing. 39 embedded dates spanning 2026-05-23 → 2026-08-09 in
one always-loaded file, with no record of who changed what when.

---

## 6. Supersession model

| layer | how old truth stops being current | history preserved? |
|---|---|---|
| L1 | new dated ruling + explicit "supersedes" prose | ✅ |
| L2 | **usually nothing** — a newer dated file simply exists alongside | ✅ (both survive) |
| L3 | ⚠️ **prose markers in the body**; structural in only 37/1,429 | ✅ |
| L4 | migration / commit | ✅ |
| L5 | merge, revert | ✅ |
| L6 | ⚠️ **in-place edit** — old text vanishes | ❌ |
| L7 | index hook rewrite + `_snapshot_*` at migrations | ✅ at migrations only |
| L8 | the next deploy | ❌ (previous runtime state unrecoverable) |
| L9 | founder ruling closes the question | ✅ |
| L10 | re-run | ✅ (reports are timestamped and hash-bound) |

**Finding 6.1 — supersession is strongest where loss is cheapest (git) and weakest where loss is
most expensive (L6 session memory, L2 architecture).** `CLAUDE.md`'s own 2026-08-09 anchor
correction is a *good* example done the hard way: rather than editing the false claim away, a ⚠️
CORRECTION block was appended under it — preserving both. That is the right pattern, applied by
hand, with no mechanism requiring it.

---

## 7. Continuity reconstruction — what a fresh session can actually recover

| question | recoverable unaided? | from where | reliability |
|---|---|---|---|
| What project am I in? | ✅ | `CLAUDE.md` + `PROJECT_ORIENTATION.md` | high |
| What branch/worktree? | ⚠️ | injected `gitStatus` | **known-stale by standing rule** |
| What is being worked on? | ❌ | `CLAUDE.md` "Current priority thread" | **dated 2026-05-24 — 11 weeks stale** |
| Last ratified decision affecting this? | ⚠️ | canon by grep, if you know the name | needs the right noun |
| What is explicitly unresolved? | ❌ | scattered across L1/L3/L9; no register | **no single surface** |
| What must I not change? | ✅ | canon + vows + forbidden drift | high — the strongest answer |
| What implementation already exists? | ❌ | 101 worktrees, 1,548 branches, 188 dirty paths | **effectively unanswerable** |
| What has production proved? | ❌ | must ssh + psql; never loaded | probe-only |
| Which prior assumptions are stale? | ❌ | prose supersession, 44 known masquerades | **structurally undetectable** |
| What to read before touching subsystem X? | ⚠️ | `MEMORY.md` routing, if hooked | 15.6% orphaned |

**Four of ten are effectively unanswerable without founder assistance. Two more are actively
misleading.**

### 7.1 The worktree condition is continuity evidence, not cleanup debt

101 worktrees · 8 detached · 1,548 branches · 815 already merged · 188 dirty paths. The memory
tree already names the consequences: *"`--verify` measures the observer's checkout, not the
deployed referent"* · *"~100 worktrees, one DB → shared dev DB breaks repeatable evidence"* ·
*"PR collision check is BLIND to never-committed lanes"* · *"a commit is the only durable act"*
(filed after a 592-line test suite was **lost**) · *"falsely reported unguarded TWICE from working
tree"*.

**Finding 7.1 — the question "what implementation already exists?" is not hard because memory is
missing. It is hard because work exists in ~101 places, most of which no memory layer indexes.**
The 10 untracked `docs/ops/` Builder OS documents from today are this failure caught live: the
newest, most relevant work was the least discoverable, and Step 1 missed it.

### 7.2 Prior art for `/continue` already exists — authored today, uninstalled

`docs/ops/AIN_HANDOFF_RECORD_CONTRACT.md` proposes an *AIN Development Continuation Record*:
≤3,000 tokens · written to `docs/handoff/<branch>_<date>_<slug>.md` as a **git-tracked file so the
record is itself evidence rather than chat state** · sections BASELINE / ESTABLISHED / OPEN /
GOVERNING DECISIONS / DO NOT REDISCOVER, with field rules:

> *BASELINE is verifiable or it is absent* · *ESTABLISHED requires an evidence field — no evidence
> → hypothesis → OPEN* · *GOVERNING DECISIONS cite, never restate* · *DO NOT REDISCOVER is
> mandatory, even if empty.*

Status: **"proposal. Not installed as a skill. No harness change."** — and untracked.

### 7.3 Prior art for the orientation layer also exists — at the member level

`project_jeeves_orientation_layer.md` records a 2026-07-16 discovery pass whose conclusion was
**"MOST ALREADY EXISTS; one broken seam"** — the orientation layer existed in disconnected pieces,
four live surfaces were unintroduced, and the fix was *"one string, zero new systems."*

**Finding 7.3 — the same shape has now been found twice, at two altitudes.** Member orientation
(July) and builder orientation (today) both resolve to: *the pieces exist, disconnected, and the
missing part is content and connection, not code.* This is a repeating structural signature of
this codebase and should be assumed true of the next layer as well.

---

## 8. Duplication and contradiction map

| # | duplication | assessment |
|---|---|---|
| D1 | `~/CLAUDE.md` context-mode rules reproduced **verbatim** inside project `CLAUDE.md` | ~2,900 B loaded twice every session; pure waste |
| D2 | `CLAUDE.md` restates deploy procedure that `docs/ops/IMMUTABLE_SHA_DEPLOY.md` + `DEPLOY_LANE_TOKEN.md` own (7,432 B = 14.5%) | **contradiction risk** — two homes for one procedure |
| D3 | `CLAUDE.md` "Current priority thread" (15,716 B = 30.6%) restates L3 memory hooks (`project_anchor_consent_gate_live`, `project_six_category_artifact_typology`, `project_corpus_callosum_substrate_cat6`) | **already contradicted itself once** — the 2026-08-09 correction |
| D4 | 38 index files, 15 linked from root; 2 orphan indexes | routing ambiguity |
| D5 | `MAIA_CURRENT_STATE_v1.0.md` (canon) vs `CLAUDE.md` priority thread vs `PROJECT_ORIENTATION.md` "Current phase" | **three "current state" surfaces, three update cadences** |
| D6 | `docs/orientation/REENTRY.md` — a re-entry doc describing a *different* current state (sovereign inference routing) | stale parallel orientation surface |
| D7 | `feedback_methodology_index` · `feedback_controls_and_referents_index` · `index_method_and_evidence` · `project_active_threads_index` | four method-ish indexes with overlapping claims |

**Finding 8 — D3/D5 are the live danger. Three surfaces claim to answer "what is true now",
none is generated, and the largest is 11 weeks stale.** This is precisely the failure mode the
brief anticipates for `.ain/current-state.md` — and it has *already happened*, twice, without
Builder OS being built. **The risk is not hypothetical; it is the current state.**

---

## 9. Context-pressure analysis

### 9.1 The measured picture

Sessions start uniformly (p10 60,641 · p50 72,434 · p90 83,480 · max 93,774; **0 of 370 sessions
started above 150 k**) and then grow to 354 k–489 k per request in the top 25. `r(requests)=+0.955`
vs `r(initial_context)=-0.010`.

### 9.2 What this means for `CLAUDE.md`

**The cost argument for splitting is dead.** Two *other* arguments survive, and neither depends on
tokens:

- **(a) Correctness.** 30.6% of the always-loaded file is dated narrative that has already been
  wrong once in a way requiring a founder correction. Size is irrelevant; **staleness in
  always-loaded context is a correctness defect**, because it is the one layer a session cannot
  fail to read.
- **(b) Conditionality.** iOS traps, onboarding flow, Bridge D wiring, and members-system schema
  load in full for a docs-only session. Not expensive — **noisy**, and noise in always-on context
  competes with the invariants that must never be missed.

### 9.3 Proving the loading boundary (as instructed — not assumed)

Applying the test *"what must be true before the first tool call?"*:

| content | bytes | share | must be pre-tool-call? | why |
|---|---|---|---|---|
| Orientation gate → `PROJECT_ORIENTATION.md` | 467 | 0.9% | ✅ | governs whether the task is legitimate |
| Non-negotiables / vows | 799 | 1.6% | ✅ | refusal boundaries |
| Infrastructure "what we do NOT use" | 331 | 0.6% | ✅ | **prevents a wrong first action** (EC2/Nginx/Supabase) |
| Database & Backend (no Supabase) | 491 | 1.0% | ✅ | same |
| context-mode routing rules | ~2,900 | 5.6% | ✅ | governs the **first tool call itself** |
| Known recurring traps | 2,198 | 4.3% | ⚠️ | only for debugging lanes |
| Architecture snapshot | 2,387 | 4.6% | ⚠️ | pointer list; conditional |
| Inhabitable Architecture | 2,004 | 3.9% | ⚠️ | **UI lanes only** — but unsafe to move if a UI lane could start without it |
| Before Making Changes (gates) | 3,158 | 6.1% | ⚠️ | needed before *writes*, not before *reads* |
| Production Deployment | 7,432 | **14.5%** | ❌ | deploy lanes only; owned by `docs/ops/` |
| Onboarding / Members / Bridge D / Sanctuary UI copy | ~5,000 | 9.7% | ❌ | feature reference |
| **Current priority thread** | **15,716** | **30.6%** | ❌ | **and is stale** |

**Finding 9.3 — the defensible always-on core is roughly 5–6 KB (≈11% of the file).** The
boundary that survives scrutiny is not "split into `.claude/rules/` because the directory is in
the proposal" — it is **"always-on = what makes a *first action* wrong if absent."** Everything
that answers "how do I do X once I've decided to do X" is conditional by that test. ⛔ Note the
asymmetry: moving a *prohibition* out of always-on context is unsafe in a way that moving a
*procedure* is not.

---

## 10. Retrieval diagnosis — with evidence

**The problem is not retrieval quality.** Ranked by measured evidence:

| # | diagnosis | evidence | verdict |
|---|---|---|---|
| 1 | **Routing integrity** | 790 refs broken by hyphen/underscore drift; 225 orphans; 2 orphan indexes | **dominant, and mechanically fixable** |
| 2 | **Stale-state detection** | supersession is prose; 37/1,429 structural; **44 retired files still index-linked as current** | **dominant, and structurally unsolved** |
| 3 | **Failure to invoke retrieval** | Step 1 missed 10 `docs/ops/` files written today; 4/10 continuity questions unanswerable | **dominant, and a discipline problem** |
| 4 | Authority resolution | no witness-ordering rule (§3.2) | real, ungoverned |
| 5 | Ranking | index hooks are hand-ranked ⭐/⭐⭐/⭐⭐⭐ and work well | **not a problem** |
| 6 | Context-window pressure | `r(initial_context) = -0.010` | **falsified as a driver** |
| 7 | Semantic retrieval absence | 99.1% frontmatter, 4-level index, 4,980 links, FTS5 present | **not the bottleneck** |

**Finding 10 — introducing embeddings now would optimize the one dimension that measurement shows
is not the constraint, while leaving 790 broken links, 225 orphans and 44 stale-masquerading hooks
untouched.** The evidence-led order is: **fix routing integrity → represent supersession
structurally → guarantee invocation → then, if a measured gap remains, semantic retrieval *inside*
a deterministically narrowed corpus.**

`npm run memory:audit` **already detects categories 1 and part of 2** (ERROR: broken index
links, duplicate homes; WARN: link-convention drift, size/complexity drift; binds findings to
`index_sha256` + `corpus_manifest_sha256`). It reports only, never modifies, per the 2026-07-28
ruling. **The instrument for the dominant defect exists and its findings have not been acted on.**

---

## 11. Builder OS implications

*Implications only. ⛔ No implementation is proposed, authorized, or designed here.*

- **I1** — `.ain/current-state.md` would be the **fourth** "current state" surface (D5). Two of the
  existing three are stale; one has already required a founder correction. The brief's caution is
  confirmed by measurement: **any such file must be a view with a generation timestamp and a
  provenance line per claim, or it becomes the highest-authority stale artifact in the system** —
  because generated files read as fresh even when their inputs are not.
- **I2** — Orientation's hardest questions (*what exists? what has production proved?*) are
  answered by **L8 + L10**, not L3. An `/orient` that reads documents and not instruments would
  reproduce the exact error the corpus keeps naming: *repository declarations ≠ deployed reality.*
- **I3** — The hook boundary is **already instrumented** by `context-mode` (`PreToolUse` on
  Bash/Read/Grep/WebFetch, `SessionStart` injection). Step 1's gap #2 is a **content** gap, not an
  infrastructure gap.
- **I4** — The memory layer has an unresolved **write-contention** problem across ~101 worktrees,
  with a held-but-unbuilt claim-note convention. Any Builder OS component that writes to memory
  inherits this, and would be the load that finally forces it.
- **I5** — `AIN_HANDOFF_RECORD_CONTRACT.md` is a nearly-complete `/continue`. It is a proposal,
  uninstalled and **untracked**. Its field rules already encode the discipline Builder OS needs.
- **I6** — The corpus is deterministically narrowable **today** (§2.1). Retrieval architecture
  should start there, not at embeddings.
- **I7** — **L10 has no register.** A Builder OS that knows which instruments exist and can re-run
  them is strictly stronger than one that reads records of past runs. This is the highest-leverage
  implication in this document and it was not in the Step 1 ranking at all.

### Revision to the Step 1 ranking (evidence-led)

| was | now | item | why changed |
|---|---|---|---|
| 1 | **2** | `/orient` + generated state | must be a *view*, and must read instruments (I1/I2); depends on new #1 |
| 2 | **4** | tool-boundary hooks | infrastructure already exists (I3) — cheaper than assessed |
| 3 | **7** | `CLAUDE.md` split | **cost rationale falsified**; survives only as correctness/conditionality (§9) |
| 4 | **5** | Evidence Auditor agent | unchanged in value; needs §3.2 ordering first |
| 5 | **6** | semantic retrieval | **demoted** — not the measured bottleneck (§10) |
| 6 | **8** | method-as-skills | prior art exists (I5), lower urgency |
| 7 | **9** | model routing | 4 untracked design docs already exist |
| — | **1** | **memory routing integrity** (790 broken refs · 225 orphans · 44 stale-masquerading hooks) | **new #1** — measured, mechanical, detector already built |
| — | **3** | **instrument register (L10)** | **new** — highest-leverage layer, zero discoverability |
| — | **10** | **commit the 10 untracked `docs/ops/` Builder OS docs** | *a commit is the only durable act* |

---

## 12. Unknowns requiring further audit

1. **`CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md` (11,495 B) was not read in full** — only its
   §4 child and predecessors. It may already contain the Builder OS architecture. **Read before
   any Step 8 design work.**
2. Same for `CLAUDE_CODE_ROUTING_AND_COST_AUDIT_2026-08-09.md`,
   `CONTEXT_CONTROL_EXPERIMENT_PROTOCOL.md`, and the four local-model documents.
3. **`memory:audit` has never been run in this audit** (read-only constraint — it writes
   timestamped reports). Its ERROR/WARN counts against the live corpus are unknown and would
   sharpen §2.4/§2.5 from estimate to measurement.
4. **The 169 genuinely-absent link targets** (228 refs) were not triaged: never-written vs deleted
   vs renamed. Deleted-with-inbound-links would be actual memory loss.
5. **`~/Obsidian Vaults` was not opened** — size, structure, and overlap with L3 unknown.
6. **The 78% harness floor (~56,431 tok) is derived by subtraction, not measured** — flagged as an
   estimate in the source audit; the MCP/tool-schema share is unverified.
7. **101 worktrees were not inventoried** for uncommitted work. Given 188 dirty paths in *one*
   checkout and the "lost 592-line suite" precedent, unmeasured work almost certainly exists.
8. **No mapping of which of the ~90 canon files are actually cited** anywhere. `CLAUDE.md` names
   ~8. The reachability of L1 is unmeasured — the same orphan analysis run on L3 should be run
   on canon.
9. **Whether `_`-prefixed archival files are excluded from any retrieval path**, or whether a
   search can surface a pre-split snapshot as current truth. **Untested, and it is the same
   masquerade class as §2.5.**

---

## Compact matrix

| memory layer | owns | authority | writer | reader | retrieval mechanism | freshness | provenance | supersession | failure mode |
|---|---|---|---|---|---|---|---|---|---|
| **L1 Constitutional** `docs/canon/` | what may be | **highest** — ratified | founder | instructed | grep / named pointer | durable | ✅ dated + named ruler | amendment | ~90 files, ~8 cited; unmeasured reachability |
| **L2 Architectural** `docs/architecture,design,specs` | what shape, why | high (design) | Claude | accidental | grep / glob | decays silently | ⚠️ file date only | **none — files accrete** | dated files coexist; no current-version signal |
| **L3 Memory tree** 1,429 files / 12 MB | what happened / standing | high (practice) | Claude | **routed** | index → sub-index → topic + FTS5 | mixed | ✅ `originSessionId` ×1,323 | ⚠️ **prose only (37/1,429 structural)** | **225 orphans · 790 broken refs · 44 stale masquerades** |
| **L4 Executable** code/schema/gates/CI | what it does | **high — behavioural** | Claude + CI | searched | Grep/Read/test/gate | exact at HEAD | ✅ git | migration/commit | HEAD ≠ deployed; 101 checkouts disagree |
| **L5 Git/history** 101 wt · 1,548 br | what was done | high — *"a commit is the only durable act"* | git | injected + queried | `git`/`gh` | **injected snapshot is STALE** | ✅ by construction | merge/revert | 8 detached · 188 dirty · never-committed lanes invisible |
| **L6 Session** `CLAUDE.md`+orientation | what Claude is told | **operationally highest — always read** | Claude + founder | **automatic** | preloaded | **30.6% is 11 weeks stale** | ❌ **none** | ❌ **in-place edit** | stale always-on context; least-governed write path |
| **L7 Retrieval** `MEMORY.md`+38 indexes | how memory is found | routing only (⛔ never canon) | Claude | automatic (index only) | link-walk + FTS5 | index current, hooks lag | ⚠️ snapshots at migrations | hook rewrite | **shared mutable, no lock; ceiling truncation observed** |
| **L8 Operational** container/DB/health | what production proved | **highest for "is it real"** | the deploy | **probe-only, never auto** | ssh · psql · `GIT_COMMIT` | **only layer always current** | ✅ lane token + SHA | next deploy overwrites | never loaded; must be remembered-to-be-probed |
| **L9 Human continuity** rulings/docket/⛔ | what is unresolved | **highest — only founder closes** | founder | accidental | grep for markers | durable | ✅ dated | ruling closes | **no unresolved-questions register** |
| **L10 Instruments** `memory:audit`, `verify-colab`, cost audit | how to re-derive truth | **strongest witness when run** | instrument | **accidental — no register** | must be known by name | regenerates on demand | ✅ **hash-bound to corpus** | re-run | **exists, undiscoverable, findings unacted** |

---

## Status

Read-only mechanism map. **No architecture is ratified, and no implementation is authorized, by
this document.** Steps 3–7 of the proposed sequence (Obsidian · existing agents/skills/hooks/MCP
in depth · scripts/automation · token/model routing · duplication-and-gap synthesis) remain open.
Design (Step 8) must not begin until unknown #1 is closed — **`CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md`
may already contain part of the Step 8 answer.**
