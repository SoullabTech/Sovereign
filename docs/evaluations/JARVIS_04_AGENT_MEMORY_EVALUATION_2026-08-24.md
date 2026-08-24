# JARVIS-04 — Agent Memory Evaluation

**Unit:** JARVIS-04 · **Date:** 2026-08-24 · **Type:** EVALUATION. ⛔ Not implementation.
**Production untouched.** Isolated venv outside the repo; synthetic data; no credentials; telemetry explicitly disabled; no MAIA memory read or written. Repository changes are documents only.
**Adversarial record:** `jarvis-04-spike/adversarial.py` — **18 passed · 0 failed · 4 UNKNOWN** (`RUN_OUTPUT.txt`).
**Not evaluated, by directive:** implementation of anything.

---

## 1. The two named candidates — established, not assumed

Before evaluating a class, the named instances had to be located. Both results are findings.

### 1.1 ⛔ TencentDB Agent Memory — withdrawn from the public registry

The npm registry record (`jarvis-04-spike/TENCENTDB_NPM_REGISTRY_RECORD.json`, fetched 2026-08-24):

```json
"time": {
  "created":   "2026-08-05T15:17:05.176Z",
  "0.7.0":     "2026-08-05T15:17:05.552Z",
  "unpublished": { "time": "2026-08-05T15:23:02.664Z", "versions": ["0.7.0"] }
}
```

**Published 15:17:05. Unpublished 15:23:02. It existed for six minutes and six seconds, in one version, and has not returned in the nineteen days since.** No PyPI equivalent exists under any of the five names probed.

⭐ **The substrate that motivated this entire programme is not obtainable.** That is not a verdict on its quality — it may exist as a managed cloud service, which this session cannot reach or evaluate. But as a dependency it currently fails the most basic operational test: *can we get it?* **Availability: NO. Everything else about it: UNKNOWN.**

### 1.2 ⚠️ AIVM — name collision, not an agent-memory system

The only obtainable `aivm` (PyPI 0.5.0, Apache-2.0, `github.com/Erotemic/aivm`) is:

> *"Local libvirt/KVM sandbox VM manager for coding agents"* — Development Status: **1 – Planning**.

That is execution sandboxing, adjacent to JARVIS-02's subject matter, **not memory**. Either the intended referent is something else, or the name collided. **The intended AIVM remains UNKNOWN and was not evaluated.**

### 1.3 ⚠️ Scope of the conclusion — narrowed on founder correction, 2026-08-24

Everything below establishes that this class does not satisfy **JARVIS's governed-recall
requirement**. It does **not** establish that `mem0` is a poor memory product. It is a widely
adopted one that appears to do the job it was built for.

The narrower claim is the stronger one:

```text
MEMORY PRODUCT                    JARVIS RECALL
stores / retrieves        ≠       recovers knowledge
useful recollections              + preserves provenance
                                  + knows evidentiary standing
                                  + handles supersession
                                  + can reintroduce it lawfully into reasoning
```

`mem0` solves the first problem. JARVIS needs the second. **That is an architectural
incompatibility, not a quality judgement**, and the disposition below should be read as
*not suitable as memory-of-record under current JARVIS requirements* — nothing wider.

### 1.4 What was evaluated instead

With both named candidates unobtainable, the unit answers the **central question about the class** using the leading obtainable representative: **`mem0ai 2.0.19`** — *"Long-term memory for AI Agents"*, Apache-2.0, 8 core dependencies. This is a fair test: mem0 is the most widely adopted agent-memory substrate, and if the class helps JARVIS, it should show here.

---

## 2. Answer to the central question

> **Does an agent-memory substrate materially solve the aperture JARVIS-01 established — *JARVIS already remembers, but nothing recalls* — without taking epistemic authority away from the mechanisms that already govern evidence, standing, provenance, correction, supersession, authority, custody, claims, run history and durable project knowledge?**

**No. It solves a different problem, and it takes the authority.**

The aperture JARVIS-01 named is **recall of adjudicated knowledge**. What this class provides is **persistence of model-authored assertion**. Those are not the same thing, and the difference is not a gap that can be closed by configuration — it is absent from the schema.

### The decisive result

The adversarial harness ran identical cases against both substrates. The candidate's history table has ten columns:

```
id · memory_id · old_memory · new_memory · event · created_at · updated_at · is_deleted · actor_id · role
```

There is **no column for source, evidence class, standing, supersession, or integrity**. So:

- a memory with no support is stored **identically** to a supported one (B5);
- missing provenance cannot even be **flagged** as missing (B6);
- the same text from two different authorities is **indistinguishable** by standing (B4).

Run the same cases against JARVIS's existing guard and every one is separated:

| Case | Candidate | JARVIS `epistemic-guard.mjs` |
|---|---|---|
| No-evidence assertion | stored, indistinguishable | **REFUSED** (exit 1 — a verdict, not an error) |
| Model-authored recollection | stored as a memory | **REFUSED** — `project_memory` is a declared **WEAK** evidence kind that cannot carry `OBSERVATION` |
| Same assertion, probative evidence | stored identically to the above | **PERMITTED** (exit 0) |
| Incomplete correction | not representable | **REFUSED** — all seven rungs required |

⭐ **The load-bearing finding: JARVIS has already adjudicated this exact question, in code, before it was asked.** `project_memory` is one of the eight declared `WEAK_KINDS` in `epistemic-guard.mjs` — *"an assertion about the system, not an observation of it."* The project's own epistemics already classify agent memory as evidence that cannot carry standing on its own. **Adopting an agent-memory substrate as canonical memory would install, as the memory of record, exactly the evidence class JARVIS refuses.**

### Both established failure classes reproduce

The directive required carrying forward two negative controls. The candidate reproduces **both**:

1. **Deep Agents `MemoryMiddleware`** — model-authored recollection with no evidence class, provenance, standing, supersession or correction anatomy. ✅ reproduced: the schema has none of these fields.
2. **`semantica.context`** — model-authored decision/reasoning/confidence with governance verdicts. ✅ reproduced, and **escalated**: mem0's `DEFAULT_UPDATE_MEMORY_PROMPT` makes an LLM *"a smart memory manager which controls the memory of a system"*, emitting `ADD` / `UPDATE` / `DELETE` / `NONE` over existing memory, and `FACT_RETRIEVAL_PROMPT` decides what becomes a fact in the first place.

⛔ **Per the ruling's own test, that settles it: a candidate reproducing either pattern is not a canonical JARVIS memory authority.** This one reproduces both.

---

### 2.1 ⭐ The positive form of this finding

Stated as a prohibition rather than a product verdict, because the prohibition is what generalises:

> **Do not let retrieval create epistemic standing.**

Making model-authored recollection the canonical record would **invert** JARVIS's epistemic
architecture — the derivative recollection would become more operationally privileged than the
evidence it was derived from. That is the incompatibility, in one sentence.

It also leaves a clean future architecture in which vector search *can* exist — just never as the
authority layer:

```text
DURABLE SOURCE MATERIAL
        ↓
RETRIEVAL / INDEX                    ← similarity may live here
        ↓
candidate relevant material          ← NOT yet knowledge
        ↓
MECHANICAL PROVENANCE BINDING
        ↓
EXISTING EPISTEMIC ADJUDICATION      ← epistemic-guard.mjs; standing is assigned HERE
        ↓
governed claim / knowledge object
        ↓
CONTEXT REINTRODUCTION
        ↓
present reasoning
```

Two different functions, never merged: similarity answers *"what resembles this question?"*; the
guard separately answers *"what is this, where did it come from, what standing does it have, and
may it influence this decision?"*

---

## 3. Capability-by-capability disposition

| # | Capability | What the candidate does | JARVIS today | Disposition |
|---|---|---|---|---|
| **A** | **Storage** | Vector store + SQLite history | `.ain/`, AIN_HOME, packets, results, runs, sessions, claims, ledger | ⛔ **REJECT** — JARVIS-01 found persistence is not the aperture |
| **B** | **Retrieval** | Embedding similarity | ⚠️ **nothing — aperture A1** | **EXPERIMENT** — the one genuine gap, but see §4 |
| **C** | **Derivation** | ⛔ none — memories carry no edges | nothing (aperture A1); Semantica offers this (JARVIS-03) | ⛔ **REJECT** — the candidate is strictly weaker here than JARVIS-03's finding |
| **D** | **Provenance** | ⛔ **no source column at all** | `ProvenanceEntry`-class fields in packets, SHA-bound fragments, `source_document`/`source_quote` in claims | ⛔ **REJECT** |
| **E** | **Standing** | ⛔ no status/standing field | 8 statuses · 4 standings · 22 evidence kinds, CI-adjudicated | ⛔ **KEEP JARVIS** |
| **F** | **Correction** | ⚠️ partial — `old_memory`/`new_memory`/`event`, soft `is_deleted`. ⛔ But an **LLM** issues the DELETE | 7-rung correction anatomy; `SUPERSEDED`; ledger | ⛔ **KEEP JARVIS** |
| **G** | **Promotion** | ⛔ none — no boundary between raw and adjudicated | `.ain/` (versioned, CI-adjudicated) vs AIN_HOME (raw) — the boundary exists, unautomated | ⛔ **REJECT** |
| **H** | **Recall** | Similarity search over stored text | ⚠️ nothing — aperture A1 | **EXPERIMENT** (with B) |
| **I** | **Selection** | ⛔ **an LLM decides what becomes memory and what is deleted** | deterministic: SHA-bound selectors, `budget()`, `verifyEvidence` | ⛔ **REJECT** — this is the vow-level failure |
| **J** | **Duplication** | Duplicates AIN_HOME + `.ain/` + claims + episodes + session records | — | ⛔ **REJECT** |
| **K** | **Dependency cost** | 8 core deps · **`openai` mandatory** · **`posthog` telemetry ON by default** · 35 packages / 207 MB | Node + bash + SQLite/JSONL | ⛔ **REJECT** — see §5 |
| **L** | **Authority** | ⛔ Would become an authority JARVIS obeys — it decides what is true enough to keep | JARVIS adjudicates | ⛔ **KEEP JARVIS** |

**Tally:** `REJECT` 7 · `KEEP JARVIS` 3 · `EXPERIMENT` 2 · `WRAP` 0 · `ADAPT` 0 · `UNKNOWN` 0.

Per the ruling, no blanket `USE <candidate>` disposition is offered.

---

## 4. The two `EXPERIMENT` rows are the whole story

**B (Retrieval)** and **H (Recall)** are the only rows where the candidate touches a real JARVIS gap. They deserve care, because they are also where the temptation lives.

What the candidate offers there is **semantic similarity over stored text**. What JARVIS-01 asked for is *"has this failed before, and what did we conclude?"* — retrieval of **adjudicated** knowledge, with its standing and evidence intact.

Similarity search returns text that *resembles* the query. It has no notion of whether the resembling text was ever established. So it would answer *"here is something that sounds relevant"* where JARVIS needs *"here is a PROVEN claim, with its evidence, that bears on this."* ⚠️ **Retrieval that cannot carry standing does not close aperture A1 — it creates a faster path to unadjudicated material**, which is worse than the current silence.

⭐ **The JARVIS-01 hypothesis survives this unit intact and strengthened:**

> JARVIS may not need a new memory system. It may need a **retrieval, derivation, promotion and recall path** over mechanisms that already exist.

Nothing in JARVIS-04 disconfirms it. The `AIN_HOME → .ain/` promotion reading also survives: the candidate has **no promotion boundary at all** (row G), which makes the existing split look more principled, not less. ⛔ Both remain **hypotheses** — JARVIS-04 did not test them, it merely failed to break them.

---

## 5. Dependency / coupling map — and a vow-level finding

| Property | Measured |
|---|---|
| Core dependencies | 8 |
| Installed footprint | **35 packages, 207 MB** |
| **`openai>=1.90.0`** | ⛔ **mandatory core dependency** |
| **`posthog>=7.14.0`** | ⛔ **mandatory core dependency**; `MEM0_TELEMETRY` defaults to `"True"`, host `https://us.i.posthog.com` |
| Import coupling | `import mem0` fails without `httpx`, `requests`, `posthog`, `qdrant_client` — established by four successive `ModuleNotFoundError`s. **The telemetry client is required to import the library at all** |
| Cloud coupling | `mem0/__init__.py` eagerly imports `MemoryClient`/`AsyncMemoryClient` — the **hosted-service client loads even for local-only use** |
| License | Apache-2.0 |
| Runtime | Python — a second runtime beside JARVIS's Node (same cost charged in JARVIS-02) |

⛔ **Two of these are not architecture preferences — they are project-vow violations**, and they would be disqualifying regardless of the epistemics:

- `CLAUDE.md`: *"Never use OpenAI or other cloud AI providers."* `openai` is a **mandatory core dependency**.
- `CLAUDE.md`: *"No third party sits between users and their data."* Telemetry to a third-party analytics host is **on by default** and its client is **required to import the package**.

Telemetry was explicitly disabled (`MEM0_TELEMETRY=False`) throughout this evaluation.

---

## 6. Direct comparison against the existing JARVIS substrate

| Question | JARVIS today | Candidate |
|---|---|---|
| Can it store durable knowledge? | ✅ six homes (JARVIS-01 §1) | ✅ |
| Can it record *where knowledge came from*? | ✅ `source_document`, `source_quote`, SHA-bound fragments | ⛔ no source column |
| Can it say *how well established* something is? | ✅ 8 statuses, 4 standings, 22 evidence kinds | ⛔ no standing field |
| Can it refuse an unsupported claim? | ✅ exit 1, by name | ⛔ nothing to refuse with |
| Can it correct without deleting? | ✅ 7-rung anatomy + ledger | ⚠️ soft-delete history, but **LLM-issued** |
| Can it supersede? | ✅ `SUPERSEDED` + ledger | ⛔ no supersession pointer |
| Is selection deterministic? | ✅ SHA-bound selectors, `budget()`, `verifyEvidence` | ⛔ LLM-mediated |
| **Can it retrieve relevant prior knowledge?** | ⛔ **NO — aperture A1** | ✅ by similarity, without standing |
| Can it verify history was not rewritten? | ⚠️ `.ain/` via git; no hash chain (Semantica offers one — JARVIS-03) | ⛔ no integrity chain |

**One row favours the candidate.** It is the row JARVIS-01 already named, and the candidate answers it in a currency JARVIS cannot accept.

---

## 7. The two required explicit answers

> **What capability does this add that JARVIS does not already possess?**

**One: similarity-based retrieval over stored text.** Everything else it offers, JARVIS already has in a stronger form — and the retrieval it adds arrives stripped of the standing, provenance and evidence class that make JARVIS's knowledge usable. It also adds two things JARVIS does not want: an LLM deciding what is worth remembering, and a third-party telemetry client.

> **Does this help JARVIS recall, or merely give it another place to store?**

**Neither, cleanly — and that is the sharpest way to put it.** It is *not* merely another place to store; it genuinely does retrieval JARVIS lacks. But it does not help JARVIS **recall** in the sense JARVIS-01 meant, because recall of *adjudicated* knowledge requires carrying the adjudication, and the schema cannot. **It would give JARVIS a fast path to unadjudicated recollection — the failure mode `epistemic-guard.mjs` exists to prevent.**

---

## 8. Inputs for JARVIS-05

Stated as inputs, not as a recommendation. **JARVIS-05 is not begun.**

| Option | What JARVIS-02/03/04 established |
|---|---|
| **Native JARVIS implementation** | The needed surface is now well bounded: nodes, typed edges, two traversals, invalidation-with-history, a promotion boundary, and standing-aware retrieval. JARVIS already owns the vocabulary (8 statuses, 22 evidence kinds, 7-rung corrections) and a versioned CI-adjudicated `.ain/` ledger. ⚠️ Cost unestimated — **that estimate is JARVIS-05's first task.** |
| **Narrow external wrapper** | Only one candidate survived to `WRAP`: `semantica.provenance` (JARVIS-03) — 12 packages, 86 MB, SQLite, hash chain, PROV-O export, assigns no standing of its own. ⚠️ Carries two fail-open defects and untyped edges. |
| **Hybrid** | Plausible shape: `semantica.provenance` for the derivation graph, JARVIS for standing/adjudication/promotion, **nothing** from the agent-memory class. Retrieval would still have to be built. |
| **No new substrate** | Not disproven. Aperture A1 is real and unclosed, but nothing evaluated closes it *in JARVIS's currency*. |

**Three constraints JARVIS-05 should treat as settled by evidence:**

1. Retrieval must carry **standing**, or it makes things worse rather than better.
2. Selection must be **deterministic or inspectable** — no LLM silently deciding what becomes reality.
3. The `AIN_HOME → .ain/` promotion boundary is the only promotion mechanism any evaluated system has. **It is JARVIS's, and it remains a hypothesis awaiting proof.**

---

## 9. Standing

**PROVEN:** the candidate's history schema cannot express source, evidence class, standing, supersession or integrity (10 columns, enumerated); JARVIS's guard separates all four adversarial cases the candidate cannot; `project_memory` is already a declared WEAK evidence kind; `openai` and `posthog` are mandatory core dependencies; telemetry defaults on; `tencentdb-agent-memory` was unpublished six minutes after publication. 18/18, reproducible.

**UNKNOWN — 4 cases, deliberately not simulated:** model-authored unsupported recollection; irrelevant-but-similar retrieval; stale-memory/correction cascade; restart recall quality and portability. All four are **model-mediated**, and in this unit the model *is* the mechanism under test — stubbing it would have authored the verdict rather than measured it. ⚠️ This is a deliberate methodological departure from JARVIS-02, where a stub was correct precisely because the *seam*, not the model, was under test.

**UNKNOWN — candidates:** TencentDB Agent Memory as a managed cloud service (unreachable here); the intended referent of "AIVM"; every other member of the class (`letta`, `cognee`, `graphiti-core`, `zep` were located but not evaluated). ⚠️ **A single class representative is not the class.** The findings about *schema shape* and *LLM-mediated selection* are characteristic of the category, but that generalisation is reasoning, not measurement.

**Carried forward unchanged:** the `headOf()` divergence (JARVIS-02 §6); the `spawnSync git ENOENT` aperture (JARVIS-01 A10). Neither prevented truthful JARVIS-04 evidence.

### ⚠️ Programme-horizon statement — STALE

This report originally closed *"JARVIS-05 is not begun."* **That was true of this lane and false of
the programme**, and it must not become canonical programme state. Verified on
`SoullabTech/JARVIS` `main` 2026-08-24: `JARVIS-05` (`98c4576`) and `JARVIS-06` (`28f5ee0`) are
both **COMPLETE**, authored concurrently in another lane, and the JCR relationship this report's
map entry called `UNADJUDICATED` has since been **adjudicated** in JARVIS-05 §1.

⛔ Corrected rather than deleted — the original line records what this lane could see when it
wrote it, which is the honest reading of a chronology defect.

```text
JARVIS-04 evaluation           COMPLETE
observations                   VALID
programme-horizon statement    STALE — superseded by JARVIS-05 / JARVIS-06
```

**JARVIS-04 is complete. STOP. ⛔ No further unit is launched from this lane** — see the
concurrent-writer hazard recorded in the programme map.
