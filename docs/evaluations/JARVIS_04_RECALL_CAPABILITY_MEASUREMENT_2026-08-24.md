# JARVIS-04 — Recall Capability Measurement (substrate side)

> ⚠️ **Companion document, not a replacement.** JARVIS-04 was executed **concurrently by two
> sessions**. The candidate-side evaluation — which located the named candidates and ruled on them
> — is `JARVIS_04_AGENT_MEMORY_EVALUATION_2026-08-24.md` (commit `edde4ff`). **That document is not
> superseded by this one and nothing in it was altered.**
>
> This document covers what that one does not: the **measured recall map of the substrate as it
> stands** — what JARVIS can recall today, what is persisted but unretrievable, unpromotable, or
> unreintroducible, and the apertures that remain. Read the candidate-side document for the
> *verdict on external substrates*; read this one for the *measurement of the existing one*.
>
> ⛔ The collision itself is reported to the founder as a custody event, not resolved here.

**Unit:** JARVIS-04 · **Date:** 2026-08-24 · **Status:** EVALUATION — ⛔ nothing adopted, nothing implemented, nothing migrated.
**Production untouched.** Isolated `AIN_DELEGATION_HOME`, synthetic data, no MAIA memory read or written. Repository changes are documents plus one probe script.
**Evidence:** `jarvis-04-spike/probe.mjs` · `RUN_OUTPUT.txt` — **established 9 · unmet 9**.
**Method note:** this unit measures the substrate that exists **now**. The JARVIS-01 headline *"Nothing yet recalls"* is **not** repeated as present-tense fact; §1 replaces it with a measured map.

---

## 1. Current JARVIS recall capability map

Every row established by executing the real modules, not by reading docs.

| # | Question | Answer | Evidence |
|---|---|---|---|
| 1 | **What can JARVIS recall today?** | Exactly two things: **a run by its id**, and **all runs in creation order**. Both deterministic, both survive restart. | `B1`, `B2`, `B6` |
| 2 | **What can it persist but not retrieve usefully?** | **Everything about a run except its id.** `objective`, `task.capability`, lane, outcome and timestamps are all written and none is queryable — no predicate, no time-range, no content retrieval. Recall requires loading the entire corpus and filtering by hand. | `B3`, `B4`, `B5` |
| 3 | **What can it retrieve but not promote?** | **All of it.** No module reads runs and writes claims. The derivation path from operational experience to adjudicated knowledge **does not exist** — not weak, absent. | `D1` |
| 4 | **What can it promote but not reintroduce into reasoning?** | **Every adjudicated claim.** Worker context accepts only `file` / `lines` / `symbol` selectors. There is no selector type for a claim, run, episode or decision, so even a `PROVEN` claim cannot re-enter a worker's reasoning. | `jarvis-context.mjs:19-20,117` |
| 5 | **What is still effectively write-only?** | `runtime/events.jsonl` — one file names it, in a comment; nothing reads it. Census **A2 remains OPEN**. | `C4` |

⚠️ **A sixth fact, not asked for but load-bearing.** `listRuns` and `loadRun` have **zero callers** anywhere in the repository, and no CLI, API or IPC surface exposes them (`C1`, `C2`, `C3`). The store's own header describes them as *"the run index the API serves"* — **that API was never built.** So recall is not merely narrow; it is currently **unreachable by any operator or agent**. The probe itself was the first caller in the codebase.

**Corrected characterisation.** *JARVIS remembers, and can technically recall two things — but nothing calls the recall path, nothing derives knowledge from what is recalled, and nothing can carry it back into reasoning.* The failure is not storage. **The failure is the return path.**

---

## 2. Exact remaining recall apertures

| ID | Aperture | Class | Status |
|---|---|---|---|
| **R1** | No query surface over runs — id-or-everything only | retrieval | **OPEN** |
| **R2** | Recall API has zero callers and no operator surface | reachability | **OPEN** — newly measured here |
| **R3** | No derivation: run → candidate claim | promotion | **OPEN** — *the centre* |
| **R4** | No context selector for adjudicated knowledge | reintroduction | **OPEN** — newly measured here |
| **R5** | `runtime/events.jsonl` unread | write-only | **OPEN** (census A2) |
| **R6** | Retrieval cannot expose contradiction — two runs asserting incompatible facts about one subject are returned as equally valid, unflagged | selection | **OPEN** (`NC5`) |
| **R7** | `AIN_HOME` machine-local, unversioned, unportable | continuity | **OPEN** (census A8) |
| **R8** | Adjudicated corpus is **1 claim** | corpus | **OPEN** — a return path over an empty corpus returns nothing |

⭐ **R3 is the aperture.** R1/R2/R4 are plumbing around it. Fixing retrieval without derivation produces faster access to material nothing can act on.

---

## 3. Agent-memory candidate evaluation

### Candidate: `mem0ai` 2.0.19 — the reference OSS agent-memory substrate

Established by installing the package and reading its source and metadata. ⚠️ **Not executed** — its runtime requires `httpx`/`openai`, absent here. Same "read, not exercised" discipline JARVIS-03 applied to numpy-coupled modules; claims below are source-grade, not runtime-grade.

| Dimension | Finding |
|---|---|
| API | `add` · `search` · `get_all` · `update` · `delete` · `history` |
| **Memory authorship** | ⛔ **`add(infer: bool = True)`** — *by default an LLM extracts "key facts" from messages and those become the memories.* |
| **Retrieval** | `search()` over `qdrant-client` — vector similarity |
| **Declared dependencies** | `httpx`, **`openai`**, **`posthog`**, `protobuf`, `pydantic`, `pytz`, `qdrant-client`, `sqlalchemy` |
| **Telemetry** | ⛔ `mem0/memory/telemetry.py` → `posthog`, `HOST = "https://us.i.posthog.com"` |
| Standing / evidence class | ⛔ **None.** No status, no standing, no evidence kind |
| Provenance | ⛔ None beyond `user_id`/`agent_id`/`run_id` scoping |
| Supersession / correction | ⛔ `history()` is a mutation changelog, not adjudicated supersession. No correction anatomy |

**Three independent disqualifications, any one of which is sufficient:**

1. ⛔ **`infer=True` is the JARVIS-02 `MemoryMiddleware` failure class, third occurrence.** Model-authored recollection promoted to memory with no evidence class, no provenance, no adjudication. Deep Agents had it. `semantica.context` had it. mem0 makes it the **default code path**.
2. ⛔ **Sovereignty violation, twice.** `openai` is a required dependency — the project invariant is *"Never use OpenAI or other cloud AI providers."* `posthog` ships outbound telemetry to a third-party host. Both are disqualifying for a self-hosted system before any capability argument is reached.
3. ⛔ **Negative control 3 goes live.** `search()` is similarity retrieval. In the current substrate NC3 is *vacuous* — there is no similarity surface to abuse (`NC3`). Adopting mem0 would **create** the failure mode the control exists to forbid, and it would arrive as the primary retrieval path.

**Disposition: ⛔ REJECT.** Not "wrong shape for JARVIS" — actively adversarial to three of JARVIS's canonical invariants.

### Candidate: TencentDB Agent Memory

⛔ **Not obtainable.** This unit did not establish that itself — it is carried from the concurrent
candidate-side evaluation (`JARVIS_04_AGENT_MEMORY_EVALUATION_2026-08-24.md` §1.1, with the npm
registry record preserved at `jarvis-04-spike/TENCENTDB_NPM_REGISTRY_RECORD.json`), which found the
package **published and unpublished within six minutes on 2026-08-05** and absent since, with no
PyPI equivalent under five probed names.

**Availability: NO. Everything else: UNKNOWN.** ⚠️ Attributed, not independently re-derived
here — recorded as a citation, not as this unit's own evidence.

### The structural finding across candidates

Every external agent-memory substrate examined across JARVIS-02, -03 and -04 offers **storage plus similarity retrieval, and authors its own content with a model.** None carries adjudicated standing. That is not a coincidence of sampling — it is what "agent memory" currently means as a product category.

⭐ **JARVIS's aperture is derivation and adjudication. The category's offering is storage and similarity.** They do not intersect.

---

## 4. Adversarial proof record

⚠️ **The probe was wrong four times before it was right.** Each false positive is preserved, because they are evidence about how easily a recall audit flatters itself.

| # | False positive | Cause | Correction |
|---|---|---|---|
| 1 | `C1`/`C2`/`C3` — "recall API has callers, operator surface exists" | The probe lives **inside** `JARVIS_ROOT`; its grep found **itself** | Exclude the probe and `docs/evaluations/` from the search |
| 2 | `C4` — "`events.jsonl` has a reader" | `jarvis-binding.mjs` names the log **in a comment** and calls `readFileSync` on `binding.json`. Proximity read as usage | Strip comments; require `EVENTS_LOG` import or a read whose target is the events log |
| 3 | `NC5` — "retrieval exposes contradiction" | Test fixtures were named `conflict-1`/`conflict-2`; the probe matched **its own vocabulary** in the record | Neutral ids (`subj-a1/a2`); assert on a real conflict field |
| 4 | `D1` — "derivation path exists" | Same self-inclusion as #1 | Same fix |

Score before correction: **15 established / 3 unmet.** After: **9 / 9.** ⛔ **A third of the "capabilities" this audit first reported were artifacts of the audit.**

**The generalisable lesson, and it bears directly on R3:** every one of these was *presence-of-a-name* mistaken for *presence-of-a-capability* — the same `representational completion` failure class the JARVIS README names, and the same class as JARVIS-03's `source=` heuristic manufacturing a derivation edge. **A retrieval system that scores by name-similarity would make this mistake structurally, on every query.** The probe made it four times by hand.

### Negative controls carried forward

| # | Control | Result |
|---|---|---|
| 1 | Deep Agents `MemoryMiddleware` class | ✅ Held. `NC1` — guard **REFUSED** a `PROVEN` claim citing `model_recollection`. Recurs in mem0 as `infer=True` |
| 2 | `semantica.context` class — reasoning + policy-as-boolean | ✅ Held. `NC2` — governance returned **3 refusals with `rule` + `required_test`**, never a boolean |
| 3 | Irrelevant-but-similar recall | ✅ **Vacuous today** — no similarity surface exists to abuse. ⛔ Adopting any vector substrate creates it |
| 4 | Stale-but-valid history | ✅ Held. `STALE` and `SUPERSEDED` in vocabulary; G5 forbids revival; `STALE → PROVEN` requires re-derivation at current SHA |
| 5 | Conflicting records | ⛔ **FAILED — in JARVIS, not in a candidate.** Two runs asserting `green` and `red` about one subject were returned as **equally valid with no conflict signal** (`NC5`). Recorded as aperture **R6** |

---

## 5. Capability-by-capability disposition matrix

| | Capability | Existing JARVIS mechanism | Disposition |
|---|---|---|---|
| **A** | Storage | `jarvis-runtime-store` — atomic, durable, restart-proven | ⛔ **KEEP JARVIS** — storage is solved |
| **B** | Retrieval | id + enumerate only | **EXPERIMENT** — narrow native predicate/time index (R1) |
| **C** | Selection | none; contradiction unflagged | **EXPERIMENT** — conflict exposure (R6). ⛔ REJECT similarity ranking |
| **D** | Provenance preservation | `ProvenanceEntry` semantics via JARVIS-03 wrapper candidate; claim `evidence[].ref` | ⛔ **KEEP JARVIS** (adjudication) · **WRAP** (graph — JARVIS-03) |
| **E** | Standing preservation | `epistemic-guard` — 8 statuses, evidence classes, G1–G5 | ⛔ **KEEP JARVIS** — no external candidate has an equivalent |
| **F** | Correction / supersession | `STALE`, `SUPERSEDED` (terminal), `correction` verb, 7-rung anatomy | ⛔ **KEEP JARVIS** |
| **G** | Promotion | ⛔ **absent** (R3) | **EXPERIMENT** — native derivation; ⛔ REJECT model-authored extraction |
| **H** | Restart recall | proven at JARVIS-00 | ⛔ **KEEP JARVIS** |
| **I** | Cross-session continuity | `AIN_HOME` machine-local | **EXPERIMENT** — promotion to `.ain/` (R7) |
| **J** | Project portability | `.ain/` versioned, in-repo, CI-adjudicated | ⛔ **KEEP JARVIS** — already portable |
| **K** | Context reintroduction | `file`/`lines`/`symbol` selectors only | **EXPERIMENT** — a claim selector (R4) |
| **L** | Dependency cost | Node-only, zero runtime deps | ⛔ **KEEP JARVIS** — see §6 |
| **M** | Duplication with JARVIS | — | ⛔ **REJECT** mem0: duplicates storage, conflicts on authorship |
| **N** | Failure modes | guard fails **closed** with reasons | ⛔ **KEEP JARVIS** — candidates fail open |
| **O** | Authority boundaries | authority never derived from persistence | ⛔ **KEEP JARVIS** — non-negotiable |

**Tally:** `KEEP JARVIS` 9 · `EXPERIMENT` 5 · `WRAP` 1 · `REJECT` 2 · `UNKNOWN` 1 · **`USE` 0 · `ADAPT` 0.**

⭐ **`USE` is zero for the third consecutive unit** — and for the first time, so is `ADAPT`. JARVIS-03 found one genuinely useful external module. JARVIS-04 found none.

---

## 6. Dependency / coupling map

| | JARVIS today | + mem0 |
|---|---|---|
| Runtime | Node only | Node **+ Python** |
| Runtime deps | **zero** | 8 declared, incl. `openai`, `qdrant-client` |
| Network egress | **none** | ⛔ `posthog` telemetry + OpenAI API |
| Cloud provider | **none** | ⛔ OpenAI required |
| Vector store | none | ⛔ Qdrant |
| Data custody | local files, in-repo or `AIN_HOME` | ⛔ vector DB + third-party analytics |
| Model in the write path | **none** | ⛔ LLM authors memories by default |

⚠️ **Coupling and governance coincide again** — the same pattern JARVIS-03 found in Semantica, where the ML-coupled modules were exactly the ungoverned ones. In mem0 the coupling is not separable: `infer=True` is the default path, and `openai` is a required dependency, not an extra.

---

## 7. Required answer — recall, or another place to store?

> **Does this give JARVIS a new ability to recall, or merely another place to store?**

⛔ **Merely another place to store — and a worse-governed one.**

JARVIS's storage is already durable, atomic, restart-proven and zero-dependency. mem0 adds a second store, a second runtime, a cloud LLM dependency, outbound telemetry, and a vector index — and **still cannot answer the question JARVIS actually needs answered**, because it has no notion of standing, evidence class, supersession or correction. It would supply *retrieval* while leaving *derivation*, *adjudication* and *promotion* exactly as absent as they are now, and would additionally introduce the similarity-manufactures-relevance failure mode that NC3 currently forbids for free.

⭐ **The decisive asymmetry:** JARVIS's gap is between **retrieval and knowledge**. Every candidate examined operates entirely **below** that line.

---

## 8. Required answer — the smallest architecture that closes the aperture

> **What is the smallest architecture that closes the remaining recall aperture?**

⛔ **Not a memory system.** Four small pieces over mechanisms that already exist. Stated as a **JARVIS-05 input**, not authorised here:

```text
1. INDEX      a derived, rebuildable index over runs/            → closes R1, R2
              (subject · capability · outcome · time · objective)
              rebuildable from runs/ ⇒ not a second source of truth

2. DERIVE     run(s) ─► CANDIDATE claim, mechanically            → closes R3  ⭐ the centre
              a run that failed twice the same way ⇒ candidate HEURISTIC
              ⛔ mechanical derivation only. No model authorship.
              The guard already refuses what this must never emit.

3. ADJUDICATE (exists — epistemic-guard, unchanged)              → already closed
              candidate ─► OBSERVATION / PROVEN / HEURISTIC ─► .ain/   closes R7, R8

4. REINTRODUCE a `claim` context selector alongside file/lines/symbol → closes R4
              adjudicated knowledge re-enters worker reasoning
              carrying its status and evidence with it
```

**Why this is the smallest.** Steps 1 and 4 are additive and local — an index that can be deleted and rebuilt, and one new selector type. Step 3 is already built and proven. **Only step 2 is genuinely new**, and it must be *mechanical*, because the moment derivation becomes model-authored it collapses into the failure class rejected in three consecutive units.

R6 (conflict exposure) is deliberately **excluded** from the minimum: contradiction detection is valuable but is not on the critical path from *stored* to *recalled*, and JARVIS-03 recorded `semantica.conflicts` as `EXPERIMENT` already.

⚠️ **Honest counter-consideration, for JARVIS-05 and not settled here.** Step 2 is the *only* piece nothing external supplies, and step 3 already exists. That is a real argument that the whole return path should be native. It is **not** an argument that it is cheap: mechanical derivation rules are where correctness actually lives, and this unit did not prototype one.

---

## 9. Inputs for JARVIS-05

| Option | Closes R1/R2 | Closes **R3** | Closes R4 | New runtime | Egress | Governance risk |
|---|---|---|---|---|---|---|
| **Native JARVIS** (§8) | ✅ | ✅ | ✅ | none | none | ⭐ lowest — nothing authors content |
| **Narrow Semantica provenance wrapper** (JARVIS-03 `WRAP`) | partial — lineage, not predicate query | ⛔ no | ⛔ no | Python | none | low, **if** `context` stays out and §5 fail-opens are closed |
| **External memory wrapper** (mem0-class) | ✅ via similarity | ⛔ no | ⛔ no | Python | ⛔ OpenAI + telemetry | ⛔ highest — model authorship default |
| **Hybrid** (native derivation + Semantica graph) | ✅ | ✅ | ✅ | Python | none | moderate — two substrates, one authority |
| **No new substrate** | ⛔ | ⛔ | ⛔ | none | none | none — ⛔ but the aperture stays open |

**Carried to JARVIS-05 as the actual question:** R3 is closed by **native derivation in every option that closes it at all**. So the external-substrate decision is *not* about the aperture — it is about whether the **lineage graph** underneath (JARVIS-03's `WRAP`) is worth a second runtime once derivation is native either way. ⚠️ JARVIS-03 explicitly left open whether that graph should be ~400 lines of native SQLite instead; **this unit does not settle it and its evidence does not favour either side.**

---

## 10. Known / held

⚠️ **`README.md` on `SoullabTech/JARVIS` main still carries the historical 2026-08-16 `WITHHELD` block**, while current authority is the 2026-08-24 crossing recorded on `claude/jarvis-self-learning-build-uizovx`. **KNOWN — HELD FOR JARVIS-05.** ⛔ Not edited. Branch-level canon reconciliation not opened. No `JCR-*` record touched.

## 11. What this establishes and does not

**PROVEN:** the recall map in §1, by execution against the real modules; the four apertures newly measured (R2, R3, R4, R6); that the guard refuses model-authored recollection and answers with reasons; that mem0 authors memories with an LLM by default and requires OpenAI plus telemetry egress.

**NOT PROVEN — and not to be inferred:**
- mem0 **runtime** behaviour. Read, not executed. Source-grade only.
- TencentDB Agent Memory — **UNKNOWN**, not examined.
- That the §8 architecture is correct. It is a *sketch sized to the measured aperture*, unprototyped. Whether mechanical derivation rules can carry real cases is **untested**.
- Behaviour at corpus scale. The probe used 7 synthetic runs and 1 real claim.
- Anything about MAIA memory. Not read, not written, not evaluated.

**Carried forward unchanged:** `headOf()` divergence (JARVIS-02 §6); `spawnSync git ENOENT` (JARVIS-01 A10); JARVIS-00..05 ↔ JCR relationship remains **UNADJUDICATED**.

⛔ **JARVIS-04 is complete. Nothing adopted. STOP. JARVIS-05 is not begun.**
