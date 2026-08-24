# JEM-01 — Existing JARVIS memory and knowledge census

**Unit:** JEM-01 of `docs/programs/JARVIS_AGENT_EXPERIENCE_MEMORY.md`.
**Scope:** **CENSUS ONLY.** Nothing was repaired, consolidated, migrated, deleted, renamed, normalized or redesigned. No source file outside `docs/census/` was modified.
**Date:** 2026-08-24 · **Substrate:** `/home/user/Sovereign` @ `d5d3a15`, resolution `dev-walk`, markers verified.
**Machine-readable artifact:** `docs/census/JEM_01_CENSUS.json` — 42 mechanisms, 18 fields each.
**Verification rule:** every mechanism below is bound to a file, runtime artifact, persisted record, or executable behaviour. What could not be proven is marked **UNKNOWN** and is not argued around.

---

## 0. The headline finding

JARVIS is not missing a memory system. **JARVIS has an unusually sophisticated memory system whose corpus is nearly empty, whose richest layer is unindexed prose, and whose durable parts are mostly write-only.**

Three facts carry that claim:

1. **The epistemic substrate is more advanced than the JEM program assumed it would need to build.** `epistemic-guard.mjs` already implements eight statuses, a promotion rank, twenty-two evidence kinds split into probative and weak, four standing levels, seven guards, and a **seven-rung correction anatomy** whose last three rungs are `general_failure_pattern`, `candidate_recognition_rule`, `future_test`. That is JEM §V (governance envelope), §VIII (correction/supersession) and §X (skill distillation) already specified and executable, adjudicated in CI. **The corpus it governs is one claim and two ledger rows.**

2. **The Work Unit machinery already draws JEM's central distinction.** `work-unit.mjs` separates *"the durable, attempt-invariant definition of bounded intended work"* from *"ONE governed try at that Work Unit"*, and states that a Work Unit *"must survive worker change, retry, escalation, and transcript loss"*. That is JEM §VI.1. It exists.

3. **What is genuinely absent is the return path.** Every mechanism writes forward. Almost nothing reads backward. A packet's `established_facts[]` is hand-authored; the router routes on declared properties and never on prior experience; `attempts.jsonl` only fills if a human remembers to run `record-attempt`; `episodes.jsonl` and `runtime/events.jsonl` have **no located reader at all**.

**JARVIS remembers. Nothing yet recalls.**

---

## 1. Where JARVIS state actually lives

Six homes, with very different properties. This split is load-bearing for every later decision.

| Home | Path | Versioned | Portable | Holds |
|---|---|---|---|---|
| **AIN_HOME** | `$AIN_DELEGATION_HOME`, default `~/.claude/ain-delegation` | ✗ | ✗ | packets · results · logs · sessions · `sessions.jsonl` · `episodes.jsonl` · `concurrency.json` · `runtime/{runs,events.jsonl,runtime.json,binding.json}` |
| **IN-REPO** | `.ain/` | **✓ git-tracked** | **✓** | `claims/*.json` · `epistemic-ledger.jsonl` |
| **APP_SUPPORT** | `<appData>/JARVIS/` | ✗ | ✗ | `config.json` · `first-run-prompted.json` |
| **WORKTREES** | `~/.claude/worktrees/ain-<id>` | ✗ | ✗ | isolated write lanes + PID locks |
| **DOCS** | `docs/**`, `.claude/**`, `CLAUDE.md` | **✓** | **✓** | proofs, rulings, contracts, agents, commands, plans, the session anchor |
| **POSTGRES** | — | — | — | **ABSENT for JARVIS.** `agent_runs` / `integration_passes` are MAIA Corpus Callosum tables. No mechanism in this census reads or writes PostgreSQL. |

⭐ **`.ain/` is the only JARVIS memory that travels between machines.** It holds one claim and two ledger rows.
⛔ Everything in AIN_HOME dies with the machine and is not backed up by anything this census can find.

---

## 2. The nine layers

### Layer 1 — Binding (6 mechanisms) · *settled at JEM-00*
`repo-markers` · `desktop-repo-resolution` · `jarvis-binding` · `repo-config` · `first-run-prompt-ack` · `binding-record`

One definition of "canonical checkout" shared by both planes; one resolution order; explicit founder choice persisted; the runtime refuses rather than defaults. `binding-record` survives restart — **and has no production consumer yet.** It was written for evidence, not yet for behaviour.

### Layer 2 — Work definition and history (6)
`work-packet` · `work-unit-derivation` · `result-record` · `attempts-history` · `episodes-ledger` · `delegate-logs`

The packet is the canonical Work Unit and carries authority (`governing_authority`, `authorized_acts`, `not_authorized_acts`, `autonomy_ceiling`) plus `established_facts[]` — *the one field in all of JARVIS designed to carry prior knowledge into new work, and it is hand-typed.*

### Layer 3 — Runtime run state (4)
`runtime-run-records` · `runtime-events` · `runtime-process-record` · `orphan-reconciliation`

Explicitly built for restart: *"Restarting the process must not destroy durable run history."* Run records **reference** packet/result/log paths rather than copying them, so there is one audit artifact per run and the runtime cannot drift from it. A killed runtime's in-flight runs are reconciled to `FAILED / RUNTIME_STOPPED_MID_RUN` at next start.

### Layer 4 — Capacity, claim and ownership (5)
`builder-session-records` · `builder-session-ledger` · `concurrency-state` · `worktree-claim` · `rate-observability`

Born from a real incident (2026-08-09 allotment exhaustion). It refuses; it never kills. **These are three genuinely distinct concerns and the implementation keeps them apart:** capacity (`concurrency.json`, `rate.mjs`), claim/ownership (`sessions/`, worktree lock), and work state (packet/result). ⛔ Do not collapse them later — the code already proves they are not the same.

### Layer 5 — Evidence and context (5)
`context-materialization` · `evidence-verification` · `packet-guard` · `deterministic-registry` · `run-check`

Sub-file selection with SHA-bound provenance, a leakage lint that runs **before** any worktree claim, and mechanical citation verification that *"never consults the worker's self-assessment — the standing observation across Runs 001–003R is that the self-report is worthless."*
⚠️ Fragments are **ephemeral**: re-derived, never stored. Deterministically reproducible from packet + SHA, but a completed run's context does not persist.

### Layer 6 — Epistemic and provenance (6)
`epistemic-claim-records` · `epistemic-ledger` · `epistemic-guard` · `epistemic-ci` · `desktop-provenance` · `governance-gate`

The most developed layer, and the emptiest corpus. Statuses: `OBSERVATION · PROVEN · CORRECTION · HEURISTIC · INVARIANT · HYPOTHESIS · STALE · SUPERSEDED`. Evidence standing: `PROBATIVE · WEAK · NON_PROBATIVE · STALE`. `governance-gate` gives a worker a structured way to say *"I cannot truthfully continue because this requires authority I do not possess"* — and `PAUSED_FOR_GOVERNANCE` is **non-terminal by design**: the objective stays open.

### Layer 7 — Projection (3) · *explicitly stateless*
`legibility-derivation` · `living-spiral-projection` · `living-spiral-semantic-contract`

`spiral.js` states it plainly: *"not a verifier, not an authority source, not a telemetry source, and not a state store."* It renders an **APERTURE** when it cannot know something. The 679-line semantic contract is ratified; its §9 epistemic grammar and §10 provenance grammar are **not implemented anywhere**.

### Layer 8 — Routing (1)
`router` — C0 deterministic / C1 bounded local / C3 escalate. *Deliberately not an intent classifier.* ⚠️ **It routes on a task's declared properties and never on prior experience.** Nothing consults history to pick a lane.

### Layer 9 — Documentary memory (6)
`ops-proof-records` · `claude-agents` · `claude-commands` · `claude-plans` · `claude-project-memory` · `session-anchor`

⭐ **In practice this is where JARVIS's knowledge actually lives** — ten `docs/ops/JARVIS_*.md` proof records, three Living Spiral documents, a 679-line semantic contract, and a session anchor that overrides default agent behaviour. It is all unindexed prose, retrievable only by filename guess or `grep`, with no machine link to the claim, run, or Work Unit it attests.

---

## 3. Overlap / relationship matrix

`⊃` contains-or-supersedes · `≈` apparent duplicate, **needs adjudication** · `→` feeds · `∥` deliberately parallel, must stay separate · `✗` no relationship though names suggest one

| | binding | work | runtime | claim | evidence | epistemic | projection |
|---|---|---|---|---|---|---|---|
| **binding** | `jarvis-binding` ≈ `desktop-repo-resolution` (**shared order+markers since JEM-00; two ladders remain**) | `jarvis-binding` → `work-packet` (gates routing) | `binding-record` ∥ `runtime-process-record` | — | — | `desktop-provenance` ⊃ RESOLUTION vocabulary used by `jarvis-binding` | — |
| **work** | | `work-packet` ⊃ `work-unit-derivation`; `result-record` ≈ `attempts-history` (**latest vs history of the same object**) | `result-record` ≈ `runtime-run-records` (**two records of one execution**) | `work-packet` ∥ `builder-session-records` (**definition vs attempt — explicitly preserved, do not merge**) | `work-packet` → `context-materialization` | `work-packet.established_facts[]` ≈ what a claim corpus would supply | — |
| **runtime** | | | `runtime-events` ≈ `episodes-ledger` ≈ `builder-session-ledger` (**three append-only logs of overlapping events**) | `runtime-run-records` → `worktree-claim` | `runtime-run-records` ⊃ `evidence-verification` verdict | `governance-gate` → run state | `legibility` reads status derived from here |
| **claim** | | | | `concurrency-state` ∥ `builder-session-records` ∥ `worktree-claim` (**capacity ∥ ownership ∥ lane — keep apart**) | — | — | — |
| **evidence** | | | | | `packet-guard` → `context-materialization` → `evidence-verification` (pipeline, not overlap) | `evidence-verification` ≈ `epistemic-guard` (**both adjudicate evidence; different objects, different vocabularies**) | — |
| **epistemic** | | | | | | `epistemic-guard` → `epistemic-ledger` → `epistemic-ci` | `epistemic-guard` 8 statuses ≈ semantic contract §9 7 states (**two epistemic vocabularies**) |
| **projection** | | | | | | | `legibility` → `living-spiral-projection` (input, not duplicate) |

**Cross-cutting `✗` — names that suggest a relationship that does not exist:**

- `episodes.jsonl` **✗** a JEM Work Episode. It is a run log: `ts`, `work_unit_id`, `lane`, `escalation_required`, `test_results`, `exit_code`, `duration_s`. No objective, no starting state, no actions, no evidence references.
- `agent_runs` (PostgreSQL) **✗** JARVIS. Those are MAIA Corpus Callosum rows.
- `.claude/agents/*.md` and `.claude/commands/*.md` **✗** JARVIS mechanisms. Harness-level; **no JARVIS runtime reads either**.
- `spiral.js` **✗** a state store, despite "Living Spiral" naming.

---

## 4. Genuine apertures

Ordered by how much they block the JEM program. Each is bound to evidence.

| # | Aperture | Bound to | Why it blocks |
|---|---|---|---|
| **A1** | **No retrieval path exists anywhere.** Every durable mechanism writes forward; none is read to inform new work. `established_facts[]` is hand-typed, `router` routes on declared properties only, `binding-record` has no production consumer. | `work-unit.mjs:1-70` · `router.mjs:1-14` · `jarvis-binding.mjs recordBinding` | JEM §XI/§XII (retrieval, Context Packet) have **nothing to read from**. This is the program's actual centre. |
| **A2** | **`episodes.jsonl` and `runtime/events.jsonl` have no located reader.** Write-only as far as this census can prove. `appendEvent` even swallows write failures — *"telemetry is never load-bearing."* | `ain-delegate.sh:40,364` · `jarvis-runtime-store.mjs:83-88` | The two longest event histories cannot currently be used as evidence, by their own design. |
| **A3** | **`attempts.jsonl` requires a manual call.** Nothing in the delegate or runtime path invokes `record-attempt`. | `work-unit.mjs:69,87,170` | Attempt history — the raw material for "has this failed before" — is empty unless someone remembers. |
| **A4** | **No code graph, no symbol index, no dependency index.** Selectors are `lines` / `symbol` / `file`; there is no caller/callee/import/test relation anywhere. | grep across `scripts/builder/`, `jarvis-desktop/src/` returns only `import_graph` *as an evidence-kind name* | JEM §VI.6 has no substrate at all. The one genuinely new build. |
| **A5** | **No Skill primitive.** `.claude/commands/*.md` is the closest thing and is a prompt: no triggers, prerequisites, authority requirements, hazards, STOP conditions, validation, expected evidence, version or provenance. | `git ls-files .claude/commands` | JEM §VI.4. **But** the correction anatomy's `candidate_recognition_rule` + `future_test` is the seed of exactly this, already executable. |
| **A6** | **The claim corpus is one record.** The adjudication machinery is proven (49/49) and governs almost nothing. | `.ain/claims/` (1 file) · `.ain/epistemic-ledger.jsonl` (2 rows) | The most valuable existing asset is unused, not missing. |
| **A7** | **Documentary memory is unindexed and unlinked.** Ten `JARVIS_*.md` proof records with no machine link to any claim, run or Work Unit; `.claude/plans/` uses random slugs (`dreamy-drifting-brook.md`) that name no subject. | `ls docs/ops/JARVIS_*.md` · `ls .claude/plans` | JEM §VI.5 (Wiki) already has content — it has no addressing. |
| **A8** | **AIN_HOME is unversioned, unportable, unbacked-up.** All run history, sessions, results and packets die with the machine. | census §1 | Any continuity claim spanning machines is currently false except for `.ain/` and `docs/`. |
| **A9** | **No Project Scene.** Nothing assembles current objective + blockers + relevant decisions + affected subsystem. `work-unit status` answers for *one unit*; `legibility` answers for *one Desktop launch*. | `work-unit.mjs` · `legibility.js:160` | JEM §VI.7. |
| **A10** | **`spawnSync git ENOENT`** in `delegate-workspace-convergence-proof.mjs` — pre-existing, environmental to this container, reproduced on base `be5b3b8`. | JEM-00 evidence §4 | **Carried forward unchanged as a known environmental aperture.** Not authorization to act. |

---

## 5. Apparent duplicates requiring later adjudication

⛔ **None of these is being adjudicated here.** Each is recorded with the reason it might *not* be a duplicate, because the JEM-01 directive forbids assuming that similarly named things are the same.

| # | Pair | Case for duplicate | Case for genuinely distinct |
|---|---|---|---|
| **D1** | `epistemic-guard` 8 statuses **vs** semantic contract §9 7 states | Both are epistemic standing vocabularies for JARVIS assertions; `SUPERSEDED` and `unknown` appear in both. | The guard adjudicates **a claim's promotion**; §9 types **a rendered assertion's display standing**. `contradicted` has no guard equivalent; `HEURISTIC`/`INVARIANT` have no §9 equivalent. Possibly two correct vocabularies for two objects. |
| **D2** | `epistemic-guard` 22 evidence kinds **vs** §9 five `evidence_class` values (code-read · runtime trace · custody witness · member/operator witness · authority record) | Both classify evidence strength. | The 22 are *shapes with required fields*; the 5 are *provenance classes*. May be orthogonal axes rather than rival lists. |
| **D3** | `result-record` **vs** `runtime-run-records` | Two persisted records of one execution. | `results/` is the delegate's contract (latest attempt, single file); `runtime/runs/` is the runtime's state machine and **references** rather than copies. The 2026 design note says exactly this was intentional. |
| **D4** | `episodes.jsonl` **vs** `runtime/events.jsonl` **vs** `sessions.jsonl` | Three append-only logs over overlapping events. | Different writers, scopes and authorities: delegate runs · runtime transitions · Builder session lifecycle. One is explicitly non-load-bearing telemetry. |
| **D5** | `result-record` **vs** `attempts-history` | Same object shape. | Latest-vs-history is a legitimate pair; the note is explicit that attempts are *"ADDITIVE alongside, never instead of."* |
| **D6** | `jarvis-binding` ladder **vs** `findRepoRootPackagedMode` ladder | Both env→config; markers, order and config reader are now shared. | Deliberate divergence at the last rung: Desktop ends at DEGRADED default (a viewer should show something), runtime ends at refusal (a writer must not guess). **Documented in JEM-00; re-adjudicate only if that reasoning is rejected.** |
| **D7** | `evidence-verification` **vs** `epistemic-guard` | Both adjudicate evidence and both can refuse. | Different objects: citation-inside-shown-context vs claim-status-supportable-by-cited-evidence. Neither subsumes the other. |
| **D8** | `binding-record` **vs** `runtime-process-record` | Both singleton JSON in `runtime/`, both about "the current runtime". | One records *which repository*, the other *which process*. Distinct failure modes. |
| **D9** | `claude-agents` **vs** `claude-commands` **vs** a future JEM Skill | All three are "a reusable way of doing something". | The first two are harness prompt/role artifacts read by Claude Code; a JEM Skill is a JARVIS asset with authority requirements, STOP conditions and provenance. ⛔ **The census found no JARVIS runtime that reads `.claude/` at all** — treating them as the same is the most likely wrong merge in this program. |

---

## 6. Proposed JEM-02 question

*Not an implementation plan. One question, with the sub-questions that make it answerable.*

> **Given that JARVIS already records work, adjudicates evidence, governs authority and survives restart — is the missing capability a new memory system, or a retrieval-and-derivation path over the substrate that already exists?**

The census makes the second reading far more likely, but JEM-02 must decide it rather than inherit it. Four sub-questions determine the answer:

1. **Is the empty corpus a design gap or an authoring gap?** The epistemic machinery governs one claim. If work already completed *could* have produced claims and did not, the missing thing is a **derivation step** (run → claim), not a schema. If those runs genuinely could not produce adjudicable claims, the envelope needs extending. **Test:** take three completed JARVIS units from `docs/ops/JARVIS_*.md` and attempt to author claim records for them against the existing guard. What refuses, and why?

2. **Which existing record is the Work Episode?** Candidates: `work-packet` + `result-record`, `runtime-run-records`, or `episodes.jsonl`. **Test:** for one completed run, try to answer JEM §VI.1's fields (objective, starting state, actions, files, decisions, result, evidence, validation, failures, unresolved, completion) from each candidate alone. Whichever answers most is the substrate; the shortfall is the delta.

3. **Is the correction anatomy already the Skill primitive?** `general_failure_pattern` + `candidate_recognition_rule` + `future_test` is a recognition rule with a test. **Test:** take a real JARVIS failure that recurred (the JOP-04 binding class is one; JEM-00's runtime instance is arguably a second occurrence of it) and see whether a correction record expresses it as well as a JEM Skill would.

4. **What is the smallest thing that would let a new worker start smarter?** Named concretely: the ability to answer *"has this failed before, and what did we conclude?"* before authoring a packet's `established_facts[]`. **Test:** would that be served by indexing what already exists, or does it require a new asset class?

**A prior question JEM-02 should also settle, because it constrains everything after it:** *should the JARVIS memory corpus live in `.ain/` (versioned, portable, reviewable, adjudicated in CI) or in AIN_HOME (unversioned, machine-local, already holding all run history)?* Today it is split, and the split is not obviously principled — it may simply be where each mechanism happened to land.

---

## 7. Standing

Every mechanism in `JEM_01_CENSUS.json` is bound to a file, artifact, record or executable behaviour. Marked **UNKNOWN** and not argued around:

- **Readers of `episodes.jsonl` and `runtime/events.jsonl`** — none located; absence of a reader is not proof no reader exists.
- **The full Claude Code project-memory store** — `CLAUDE.md` cites keys (`project_anchor_consent_gate_live`, `project_corpus_callosum_substrate_cat6`, `project_six_category_artifact_typology`) not present under `.claude/projects/`. The rest of that store is outside this checkout and unproven here.
- **Runtime effect of the Living Spiral semantic contract** — `spiral.js` implements the operational-element vocabulary only; whether §9/§10 have effect anywhere else is unproven.
- **Live AIN_HOME contents** — this container has no `~/.claude/ain-delegation`. Every AIN_HOME mechanism is bound to its **writer code**, not to observed rows. On a founder workstation the corpus may be substantial; this census cannot say.

**JEM-01 is complete. Per §XIX the unit STOPS here. JEM-02 is not begun.**
