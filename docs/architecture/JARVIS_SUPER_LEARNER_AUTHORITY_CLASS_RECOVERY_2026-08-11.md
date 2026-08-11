# JARVIS Super Learner — Authority Class Recovery (§22.20)

**Date:** 2026-08-11 · **Mode:** read-only recovery + specification.
**Not performed:** no knowledge-graph implementation, no DB migration, no Vault ingestion, no ontology, no Differentiation graph build.
**Governing:** `docs/governance/FOUNDER_RULING_SUPER_LEARNER_S22_2026-08-10.md` — *"JARVIS is authorized to become a learner. It is not authorized to become an authority."*

---

# AUTHORITY CLASS RECOVERY

## Existing vocabularies

### 1. Proof ladder
**Question answered:** *How strongly has this capability been demonstrated?*
**Values:** `EXISTS → CORRECT → SECURE → CONNECTED → REACHABLE → EXERCISED → OBSERVABLE → SUSTAINED`
**Source:** ratified; cited in `JARVIS_EPISTEMIC_COHERENCE_CAPABILITY_2026-08-09.md`, Rehabilitation Map.
**Consumers:** human/LLM assessment prose. **No code consumer found** (`grep proof_ladder` across `scripts/`, `lib/` → 0).
**Writers:** authors of audit/evidence documents.
**Persisted:** Markdown only. **Live as discipline; not machine-readable.**

### 2. Rehabilitation disposition
**Question answered:** *What should happen to this capability/artifact during rehabilitation?*
**Values:** `PRESERVE · RECONNECT · REPAIR · RECONCILE · CONSOLIDATE · COMPLETE · DEPRECATE · BUILD · HOLD`
**Source:** Rehabilitation Map / `AIN_SYSTEM_REHABILITATION_DIRECTIVE_2026-08-09.md`.
**Consumers:** rehabilitation planning. **No code consumer.** **Persisted:** Markdown.

### 3. Work Unit lifecycle
**Question answered:** *Where is this governed work in its execution process?*
**Values (17, live in code —** `scripts/builder/work-unit.mjs:96` `LIFECYCLE_VOCABULARY`**):**
`proposed · ready · blocked · needs_founder · claimed · running · verifying · review_required · ready_to_integrate · integrated · deployment_required · deployed · live_verification_required · closed · failed · superseded · contended`
**Consumers:** `work-unit.mjs`, `session.mjs`, JARVIS runtime, O-1 Observer. **Writers:** Builder OS.
**Persisted:** `$AIN_DELEGATION_HOME` packets/session records. **✅ Genuinely operational** — the only one of the five that is.

### 4. CORPUS_WEIGHTING_SCHEMA
**Question answered:** *How much should this material shape MAIA's **voice**?* — stated goal: *"MAIA sounds like Soullab — not like a library"*; Tier 1 *"functions as a voice anchor — it pulls the response register toward presence rather than analysis."*
**Values:** `Tier 1 Voice · Tier 2 Core Frameworks · Tier 3 Teachings/Practice · Tier 4 Research`, **applied at folder level during indexing**.
**Consumers:** ⚠️ **NONE.** `grep -rl "CORPUS_WEIGHTING|corpus_weight|corpusWeight"` across `.ts/.tsx/.mjs/.js/.sql` → **0 files**. The only `Tier 1–4` in code is an unrelated field-safety altitude tier (`app/api/debug/field-safety/route.ts`).
**Status: SPECIFIED (Canon, 2026-02-28), NOT OPERATIONAL.**

### 5. Existing provenance / epistemic status
**Question answered:** fragmented — no single question.
**Values (DB, `database/migrations/*.sql`):** `confidence` ×143 · `provenance` ×59 · `source_type` ×42 · `authority` ×18 · `generated_by` ×8 · `epistemic*` ×7 · `authored_by` ×6 · `attribution` ×6.
⚠️ **`source_type` carries four mutually incompatible enumerations in different tables:**
`('note','capture','consultation','manual')` · `('file','page','note','generated')` · `('pdf','video','audio','link','document','image')` · `('user','tester','dev','auto')`
These are **per-table local vocabularies, not a shared axis.** Known live value: `generated_by = 'unattributed-historical'` on all 142 `member_memory_atoms` (per `CLAUDE.md`).

---

## Overlap matrix

| | proof ladder | rehab disposition | WU lifecycle | corpus weighting | DB provenance |
|---|---|---|---|---|---|
| **Question** | how demonstrated | what to do with it | where in execution | how much voice influence | who/what produced this row |
| **Subject** | capability | artifact | work | document | record |
| **Operational** | ❌ prose | ❌ prose | ✅ code | ❌ **none** | ⚠️ partial, fragmented |
| **Has scope?** | no | no | no | no (folder ≈ implicit) | no |

**No pairwise collapse is warranted.** §22.4 holds on the evidence: a claim can simultaneously be `EXERCISED` + `PRESERVE` + `integrated` + Tier 2 — four predicates about four different subjects.

**⭐ The decisive column is the last row: not one of the five can express *scope*.**

---

## Reasoning-authority requirement

*What authority may this source or claim carry when JARVIS reasons about what is true, governing, implemented, experienced, or inferred?*

### Can existing vocabulary express it? **PARTIAL**

- **Provenance (who produced it): PARTIAL.** `generated_by` / `authored_by` / `attribution` exist and can be extended. ⛔ Do not invent a parallel vocabulary (§22.5).
- **Authority type (what kind of standing): PARTIAL.** `authority` appears 18× in schema; `CORPUS_WEIGHTING` tiers are adjacent but answer a **voice** question and are **not operational**.
- **Authority scope (over what domain): ❌ NO.** **No existing vocabulary in the repo can represent it at all.**

---

## Source authority vs claim authority

**Not separable today.** `CORPUS_WEIGHTING` weights at **folder level during indexing** — the coarsest possible granularity. It cannot say *Elemental Alchemy is canonical for Soullab intellectual lineage, and a given proposition inside it is not canonical about a member.*

That is §22.6 stated constitutionally: Soullab works *"are **not** automatically canonical for: a member's lived experience…"* — a rule the architecture **currently has no means of enforcing.** The gap is real and constitutional, not cosmetic.

---

## Authority scope model

Scope is the missing primitive. Required distinguishable domains, all recovered from existing canon rather than invented:

`soullab_lineage · maia_ain_architecture · repo_governance · implementation · runtime · production · practitioner_lens · member_field · external_scholarship · jarvis_inference`

**Invariant:** authority in one scope never implies authority in another. `Founder canon @ soullab_lineage` ⇏ `authority @ member_field`.

## Member sovereignty fit — ⚠️ **DEFECT, not a gap**
The system cannot currently represent *member says X / practitioner interprets Y / framework suggests Z / JARVIS infers W* as four non-merged claims. Per the mandate this is recorded as a **defect to be corrected, not a state to normalize around.** Sanctuary remains absolute and is untouched by anything here.

## Practitioner sovereignty fit — same defect; `practitioner_lens` has no representation.

## Founder canon fit — representable **only** once scope exists; without it, "Founder canon" is an unbounded claim, which §22.6 forbids.

## Implementation / runtime / production fit — **COMPOSE, do not extend.**
*designed → code exists → reachable → test passed → runtime executed → production running* maps onto the **proof ladder** (`EXISTS…SUSTAINED`) plus **scope** (`implementation` / `runtime` / `production`). ✅ **No new authority classes needed here.**

## Temporal / supersession fit — **PARTIAL.** `superseded` exists in `LIFECYCLE_VOCABULARY` (work units) and charter §5 specifies `old → challenged → revised → current` for claims. No mechanism binds a *source* or *claim* to its superseder. **Rule to carry:** newer ⇏ more authoritative; older canon must be explicitly supersedable by an authored act, never by recency.

## Contradiction fit — charter §5 already specifies the record shape. It needs **provenance + authority_type + authority_scope + proof state per side**, held independently. ⛔ A contradiction must never be resolved because one side has higher generic corpus weight — different claims may govern different scopes. ⚠️ Charter §5 also records that **every contradiction ever found in this repo was found by directed human/LLM investigation, never automatically** (J = MISSING). Do not describe automated detection as working.

---

# CASE TESTS

**A — Differentiation.** Charter §4 files it under RELATIONSHIP; corpus density puts dominant use under CONSCIOUSNESS/architecture; no canonical definition exists. **Representable without adjudication?** ⚠️ **Partially.** Both claims can be recorded with provenance, but *why they don't conflict* needs scope (`soullab_lineage` vs `maia_ain_architecture`) — unavailable today. Recording it now would force a premature winner. **This case alone justifies completing scope before the slice.**

**B — Founder ruling vs older architecture doc.** ✅ Works today, in prose: §22 declares itself *"Supersedes in part"* `JARVIS_EPISTEMIC_COHERENCE_CAPABILITY_2026-08-09.md`. Not machine-representable.

**C — Implementation vs stale documentation.** ✅ **Real, verified case:** `CLAUDE.md`'s Bridge D section documents spiral-state persistence wired into `app/api/oracle/conversation/route.ts`; that lane was retired 2026-07-17 and `member_spiral_state` has had **no write since 2026-04-08**. The doc is retained as design record with a correction. JARVIS must be able to say *documentation asserts X @ repo_governance; runtime evidence proves Y @ runtime* — **needs scope; expressible with it.**

**D — Trunk vs production.** ✅ **Live case from this program:** production `ca43f8ccd` vs trunk `06f5103ef`, 6 commits behind. O-1 Observer already keeps these as separate Readings with independent freshness. Maps cleanly to `production` vs `repo_governance` scope. **Precedent exists in shipped code.**

**E — Member field vs Soullab canon.** ❌ **FAILS today.** Nothing prevents canon from being applied as authoritative over member-authored experience. §22.6 forbids it constitutionally; the architecture cannot yet enforce it.

---

# CLASSIFICATION: **C — a distinct reasoning-authority axis is required**

**Not chosen because a new enum is easier.** The argument is Case E and the overlap matrix's final row: **five vocabularies, none capable of expressing scope**, and scope is exactly what §22.6 makes constitutional. B (narrowly extend one existing vocabulary) was tested and rejected — `CORPUS_WEIGHTING` answers a voice question, weights at folder granularity, has zero code consumers, and covers only Soullab corpus (no member, practitioner, runtime, or external material).

## New primitive required: **YES — one**

## Minimum proposed primitive

Four orthogonal fields, **not** one enum (per Phase 12):

| Field | Disposition | Note |
|---|---|---|
| `provenance` | **RECOVER + EXTEND** | build on `generated_by`/`authored_by`; ⛔ no parallel vocabulary |
| `authority_type` | **EXTEND** | build on existing `authority`; values recovered during implementation, not fixed here |
| **`authority_scope`** | ⭐ **NEW — the only genuinely new primitive** | the 10 domains above; no existing representation |
| `epistemic_status` | **COMPOSE** | reference the proof ladder; do not restate it |

**Non-overlap argument.** `authority_scope` answers *over what domain does this claim have standing?* Proof ladder answers *how demonstrated* (subject: capability). Rehab disposition answers *what to do with it* (subject: artifact). Lifecycle answers *where in execution* (subject: work). Corpus weighting answers *how much voice influence* (subject: document, folder-granular, inoperative). **None takes a domain of applicability as its subject.** Scope is orthogonal to all four and is the only one whose absence produces a **constitutional** failure (Case E) rather than an inconvenience.

---

## Founder decision required: **YES — one**

`CORPUS_WEIGHTING_SCHEMA_v1.0` is **Canon** but has **zero consumers**. It therefore creates an authority expectation the system does not honor. Three options — **activate · retire · retain-as-designed-with-a-status-correction** — and this is a canon disposition, not an engineering call. ⛔ Do not silently build the new axis *around* a canon document whose standing is unresolved.

## Can the Differentiation vertical slice proceed safely: **NO**

Case A fails without scope: the graph would have to choose between RELATIONSHIP and CONSCIOUSNESS, which is precisely the adjudication the layer exists to avoid. **Read-only corpus walking may continue.** Graph construction may not.

---

## Recommended next unit

**Specify `authority_scope` + recover `provenance`/`authority_type` values from real cases A–E** — as its own Work Unit with governance classification (§22.1). It should ship the scope vocabulary and the non-overlap argument, and **nothing else**. The Differentiation slice follows it, not the reverse.

Carry the founder decision above into that unit as a blocking input.

---

## ⭐ Design invariant established by this recovery — absence as knowledge

**"~240 mentions, zero canonical definitions" is a first-class epistemic object, not a null result.**

The Super Learner must be able to represent `LOAD_BEARING_BUT_UNDEFINED` — a concept in heavy authoritative use, instantiated in shipped code, with no authored definition — **without** synthesizing a definition nobody wrote. Synthesis here would manufacture Founder canon out of JARVIS inference, which §22 forbids in one sentence: *authorized to become a learner, not an authority.*

The same shape recurs across this program: `member_daily_anchors` at 0 rows, `is_breakthrough` true on 0 of 142 atoms, `CORPUS_WEIGHTING` at 0 consumers. **Each is a finding.** A retrieval system that returns only what exists would report all four as silence.

---

**STOP.** No implementation, migration, ingestion, ontology, or graph build was performed.
