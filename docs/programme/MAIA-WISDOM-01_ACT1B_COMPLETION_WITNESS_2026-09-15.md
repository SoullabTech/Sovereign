# MAIA-WISDOM-01 · ACT 1B — Completion Witness

**Status: ACT 1B COMPLETE · READ-ONLY · ⛔ ACT 2 NOT OPENED.**
**Date:** 2026-09-15 · **Repo:** `soullabtech/sovereign` @ `16c35b10`
**Authorization:** founder adjudication of ACT 1 + rulings **R1–R8**.

⛔ No schema designed · no graph · no UI · no embeddings generated · no source moved ·
no runtime rewired · no consolidation · no taxonomy imposed · no element assigned ·
production not mutated and not contacted.

---

## 0. Rulings recorded (R1–R8)

| # | Ruling | Effect on this witness |
|---|---|---|
| **R1** | Existing Soul Corpus governance not superseded; *Canon / Library / Living* are **experience language only** until explicitly mapped | ⛔ No new knowledge-state vocabulary used below |
| **R2** | `library_sources` preserved as a **discovered canonical seam**, falsifiable by later evidence | §D evaluates it as a seam, not as settled |
| **R3** | **RATIFIED** — library knowledge may inform questions, interpretive possibilities, contextualization and synthesis; ⛔ may **not constitute evidence** for a claim about the member's inner state, history, identity, intention, developmental position or lived experience | §E.4 measures existing substrate against it |
| **R4** | **RATIFIED** — explicit rights/use standing before a source is graph-addressable; ingestion ≠ permission; unknown stays unknown | §F.6 |
| **R5** | Three vector substrates ⛔ **not to be consolidated**; same carrier ≠ same epistemic role | §D establishes semantics without merging |
| **R6** | Live-path retrieval absence is a **recorded defect**, ⛔ not repaired here | §F.7; lane named, not opened |
| **R7** | **RATIFIED** — Spiralogic is the organising whole; elements are active environments, ⛔ not folders/exclusive tags; multi-participation permitted; Weather retains field-dynamics possibility. *Epistemic standing ≠ elemental topology* | §C |
| **R8** | **RATIFIED** — living wisdom ecology; four distinguishable provenance streams; **RELATIONAL MEMORY ≠ COLLECTIVE WISDOM**; contradiction/counterexample/uncertainty preserved; learning ≠ model training; ⛔ no model-generated inference becomes collective wisdom merely because a model generated it | §E |

---

## A. External AIN tree — ⛔ UNAVAILABLE

`_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1` **is not present
in this container** and no path to it exists. ⛔ Recorded as **UNAVAILABLE**, not empty.

⭐ **The delivered instrument was validated instead against the in-repository corpus**, so
the founder's local run starts from a proven tool:

```
node scripts/witness/ain-corpus-census.mjs --root data/ain --out <outside the repo>
→ census complete — 739 files, 0.067 GB
  readable now: 739 · needs conversion: 0 · unsuitable: 0
  ratified frontmatter — complete: 0 · partial: 1 · absent: 738
  duplicate clusters: 15 (15 redundant files)
```

⭐ **Every file is immediately machine-readable** — 603 `.md` + 136 `.txt`, zero conversion
burden, zero unsuitable. **The corpus's problem is provenance, not format.** ⭐ And
duplication is *negligible* — **15 redundant files out of 739 (2%)**. ⛔ Deduplication is
not the work here; it was never the bottleneck.

## B. Production population — ⛔ UNKNOWN (recorded, not inferred)

| Probe | Result |
|---|---|
| `DATABASE_URL` | **not set** |
| `psql` binary | present |
| `ssh` binary | **absent** — no route to minisforum |

⛔ **Population of `ain_knowledge_chunks`, `corpus_chunks`, `library_chunks` and
`library_sources` is UNKNOWN.** Per the brief: recorded as UNKNOWN rather than inferred
empty. §8.2 of the ACT 1 record carries the read-only counting query; the founder's run is
the evidence of record.

⚠️ This is the **single largest remaining unknown**, and §D's semantic findings are
correspondingly *structural* claims — what each substrate is **for** — never claims about
what it currently **holds**.

---

## C. ⭐⭐ Spiralogic / elemental substrate — THE LAYER IS NOT UNBUILT

ACT 1 §10.6 reported *"elemental retrieval: does not exist."* **That was true of the AIN
substrate and false of the Library substrate.** Corrected here.

### C.1 `lib/library/spiralogicTagger.ts` — an operating elemental classifier

| Property | Finding |
|---|---|
| **Location** | `lib/library/spiralogicTagger.ts` |
| **Role** | Scores text per element and assigns elemental participation to library chunks |
| **Runtime-active** | ⚠️ **Batch/ingestion-active, not turn-active.** Runs at ingestion and re-tagging; ⛔ not called during a member turn |
| **Data-bearing** | ⭐ **YES** — writes `library_chunks.meta.element` and `meta.element_secondary` |
| **Governed** | ⚠️ **Deterministic but unratified.** No canon governs its thresholds |
| **Relation to corpus** | Operates on `library_chunks` only. ⛔ Never touches `data/ain/source` or `ain_knowledge_chunks` |
| **Falsifier** | Re-run `scripts/audit-element-distribution.ts`: if `meta->>'element'` is null across all rows, the layer is declared-not-operating |

⭐⭐ **It is rule-based, not model-based.** `scoreElement()` accumulates regex weights —
strong pattern `+3`, secondary `+1`, **soft cue `+0.5`** — against per-element thresholds
deliberately tuned *"Water/Aether use lower thresholds because their language is
subtler."*

**This directly satisfies R8's hardest clause.** ⛔ *No model-generated inference becomes
collective wisdom solely because a model generated it* — the existing elemental
classification involves **no model at all**. It is reproducible, inspectable, re-runnable
and diffable. ⭐ **This is the authority class ACT 2 should treat as the floor, not a
legacy to replace with LLM tagging.**

### C.2 ⭐ Multi-element participation is already implemented

```ts
// lib/library/spiralogicTagger.ts:24
element_secondary: SpiralogicElement | null;
```

`scripts/retag-library-chunks.ts` calls this **"dual-tagging"**, tracks `secondaryAdded`,
and reports a secondary-element distribution. ⭐ **R7's core requirement — a knowledge
object participating in more than one elemental environment without duplication or
exclusive placement — exists in production code today.**

⚠️ **But the shape is `primary + at most one secondary`, not open participation.** R7
permits *multiple* environments with *contextual, relational, developmental* relations;
the substrate permits exactly two, unweighted and unqualified. ⛔ **This is a real
limitation, not a partial win to be reported as a win** — and it is the precise question
ACT 2 inherits: *extend the seam, or is two the falsification of its adequacy under R2?*

### C.3 ⭐⭐ Element **and** phase already co-exist — `facet_tags`

```sql
-- 20260130000001_library_intelligence.sql:93,115
--   facet_tags: ['FIRE_1', 'WATER_2', etc.],
CREATE INDEX idx_library_distillates_facets ON library_distillates USING GIN ((payload->'facet_tags'));
```

⭐ `FIRE_1` is **element + Spiralogic position in one addressable token**, GIN-indexed,
**array-valued** — and therefore openly multi-valued, unlike `element_secondary`.
`library_distillates.payload` is documented as *"summaries, definitions, practices,
warnings, facets, archetypes"*, with practices themselves carrying `element`.

⭐ And `library_search_log.query_type` admits `'facet'` beside `'semantic' | 'fulltext' |
'hybrid'` — **facet-addressed retrieval is a declared query mode.**

> **Clicking Water and having the library reorganise is closer than ACT 1 concluded.**
> An element-scoped and facet-scoped addressing layer exists over `library_chunks` and
> `library_distillates`. ⛔ What does not exist is any of it on the AIN corpus, any
> relationship between concepts, or any path to a member turn.

### C.4 Elemental movement, and the two instruments

| Structure | Finding |
|---|---|
| `collective_breakthroughs.elemental_phase_from` / `_to`, `archetype_from` / `_to` | ⭐ **Movement between elements is already a persisted shape**, with archetypal transition beside it — R7's *developmental movement*, data-bearing, indexed |
| `integration_level` `('emerging','stabilizing','embodied')` | A staged-integration vocabulary already in use |
| `scripts/audit-element-distribution.ts` | ⭐ *"Measures element tagging health"*; counts tagged/untagged per element; `--export` to `artifacts/` |
| `scripts/retag-library-chunks.ts` | Re-classify with tuned thresholds; **`--dry-run`**; *"Metadata only — no embeddings"* |
| `lib/ain-recall/PatternResonanceGraph.ts` | ⛔ **in-memory only**, never met the corpus (ACT 1 §10.4) |
| `lib/consciousness/wuxingBridge.ts`, `spiralogic-core.ts`, `interpretiveCouncil.ts`, `ImplicateOrder.ts` | Correspondence bridges — ⛔ member/voice side, not corpus side |
| `member_spiral_state.dominant_element` | ⭐ **Live, turn-active, singular by design** — the member's structural position, ⛔ not a knowledge object's participation |

⭐ **Two existing instruments already do read-only elemental census work with a dry-run
discipline.** ⛔ ACT 2 should not author a third.

---

## D. Vector-substrate semantics — ⛔ NOT CONSOLIDATED (R5)

| | `ain_knowledge_chunks` | `corpus_chunks` | `library_chunks` |
|---|---|---|---|
| **Writer** | `scripts/embed-ain-knowledge.ts` | `scripts/ingest/commons-corpus.ts` | `lib/library/LibraryService.ts` · `ingest-library.ts` · `backfillEmbeddings.ts` · `retag-library-chunks.ts` |
| **Reader** | `lib/ain/knowledge/RetrievalService.ts` | ⛔ **NO READER FOUND** | 6 scripts (distillation · search · health · element audit) |
| **Source registry** | ⛔ none — `source_file TEXT` | `corpus_documents` + `corpora` | ⭐ `library_sources` |
| **Source identity** | ⚠️ **filename** (drifts) | document row | ⭐ **SHA-256 checksum** |
| **Consent boundary** | ⛔ none | ⛔ none found | ⭐ `consent_required` / `_granted` / `_granted_by → members(id)` |
| **Elemental layer** | ⛔ none | ⛔ none | ⭐ `meta.element` + `element_secondary` + distillate `facet_tags` |
| **Runtime route** | `maiaOrchestrator` → `/api/between/chat` (⛔ not the live member route) | ⛔ **none** | ⛔ **none** — scripts only |
| **Semantic purpose** | AIN teaching corpus, mode-aware | Commons corpus environment | Living Library: sourced works with rights-adjacent + consent metadata |

### ⭐⭐ Answer to *"redundant, overlapping, or distinct?"* — **SEMANTICALLY DISTINCT.**

R5 is **vindicated by evidence, not merely by caution.** Three different epistemic roles:

1. **`ain_knowledge_chunks`** — the *teaching corpus*. Retrieval exists and is called. ⛔ No
   registry, no consent, no rights, no element; identity is a filename.
2. **`corpus_chunks`** — ⚠️ **written and never read.** A full registry (`corpora` →
   `corpus_documents` → `corpus_chunks` → `corpus_ingestions` / `corpus_retrievals`) with
   ⛔ **no reader anywhere in the repository.** ⭐ *The most structurally complete of the
   three is the one nothing consumes.*
3. **`library_chunks`** — the *sourced-works* substrate, and the only one carrying source
   identity, consent, and elemental participation together.

⛔ **Consolidating these would destroy three distinct boundaries** — mode-aware AIN
retrieval, an unconsumed corpus-environment registry, and a consent-gated sourced library.
⚠️ And it would erase the finding that **the only substrate with a live reader is the one
with the weakest provenance**, while **the one with the strongest provenance has no reader
at all.**

---

## E. ⭐ Contribution / learning pathways (R8)

### E.1 The member-to-collective gradient already exists

```sql
-- 20251231_memory_architecture_enhancements.sql:120-131
ALTER TABLE developmental_memories    ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('private', 'shared', 'commons', 'anonymized'));
ALTER TABLE user_relationship_context  ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('private', 'shared', 'commons', 'anonymized'));
```

⭐⭐ **R8's constitutional boundary is already schema-enforced and defaults correctly.**
`DEFAULT 'private'` + `NOT NULL` means ⛔ **participation does not constitute consent** —
movement to `commons` or `anonymized` requires an explicit write. **RELATIONAL MEMORY ≠
COLLECTIVE WISDOM is already true at the storage layer.**

⚠️ **Whether any surface exposes that transition to a member is UNVERIFIED** — a column
with no gesture is a possibility, not a pathway.

### E.2 Distillation-with-privacy already exists

`20260115000001_collective_breakthrough_system.sql` — header:
*"Individual breakthroughs → Anonymized patterns → Collective wisdom"*, keyed by a
**SHA-256 hash of userId + salt**, carrying `catalyst_type`, `transformation_type`,
`archetype_from/to`, `elemental_phase_from/to`, `integration_level`, `follow_through`,
plus a pattern-cluster table.

⭐ **This is R8's *"collective field receives the distilled learning, not the member's
story"* — already built as a shape.** ⛔ Population UNKNOWN (§B).

`library_distillates` is the same move on the inherited side: structured wisdom extracted
from a source, addressable by `facet_tags`, ⛔ never the source text itself.

### E.3 Contribution substrate exists — ⚠️ and carries a known hazard

- `commons_contributions` — *"Member-contributed content for the shared commons. Not a
  content platform — a shared offering space."* ⭐ The intent is already right.
- ⛔ **`contribution_levels` (0|1|2, `accepted_count`, `endorsed_by`) is the status economy
  the Circles I0 census flagged as barred by FR-08.7**, alongside
  `community_user_stats.contribution_tier` / `contribution_points` and
  `community_territories.min_cognitive_level`.

⚠️ **R8 authorizes a contribution lifecycle. It does not authorize inheriting this one.**
⛔ Reusing `contribution_levels` as the wisdom-contribution substrate would import a
ranking economy into the wisdom field on day one — the exact distortion the Circles lane
refused. **Named here so ACT 2 cannot adopt it by convenience.**

### E.4 ⛔ What R8 requires and the substrate does **not** have

| R8 requirement | Substrate |
|---|---|
| Four distinguishable provenance streams (inherited · founder · member · emergent) | ⛔ **No provenance-class field on any knowledge object.** `library_sources.type` describes *form* (`book`,`transcript`,`article`…), never *stream* |
| Founder gradient — note · teaching · hypothesis · ruling · ratified canon | ⛔ **Absent for wisdom.** ⭐ The **shape exists elsewhere**: `CLAIM_STATE_AUTHORITY.md` governs movement between claim states, and `.ain/epistemic-ledger.jsonl` is an append-only adjudicated-claim ledger with an explicit genesis refusing retroactive backfill. **Precedent to compose with, ⛔ not to clone** |
| Counterexample · contradiction · minority pattern · uncertainty | ⛔ **No table anywhere preserves a counterexample against a pattern.** `calculate_decayed_confidence` exists for member patterns with ⚠️ two divergent implementations (2026-09-06 audit) — ⛔ not a field-wisdom evidence model |
| Revision / challenge — *new wisdom may challenge old* | ⛔ **Absent.** `supersedes` exists in the frozen temporal-memory direction for **member assertions**, ⛔ never for wisdom objects |
| Steward review before integration | ⛔ **Absent.** `endorsed_by` on `contribution_levels` is endorsement-as-status, ⛔ not stewardship |
| Learning ≠ model training | ⭐ **Already structurally true** — no training pipeline consumes member conversation; all elemental classification is deterministic (§C.1) |

⭐⭐ **THE SHARPEST GAP: the substrate can accumulate agreement and cannot record
disagreement.** Every existing structure counts support — `accepted_count`, affinity
scores, confirmation terms, breakthrough clusters. ⛔ **Nothing anywhere holds a
counterexample against a claim.** R8 names contradiction, counterexample, minority pattern
and uncertainty as things the field must preserve, and **that is the requirement with zero
precedent in the entire repository.** *A system that can only accumulate support is an
archive with momentum, not an intelligence* — and it is the one place ACT 2 genuinely
builds from nothing.

---

## F. Required answers

**1. What remains UNKNOWN after ACT 1B?**
⛔ The external AIN tree (unreachable). ⛔ All four population counts. ⛔ Whether any member
surface exposes the `visibility` transition. ⛔ Rights standing of every source. ⛔ Whether
`corpus_chunks` holds anything, given it has no reader. ⛔ Whether the elemental tagging on
`library_chunks` is populated or merely implemented.

**2. Which existing substrate should ACT 2 preserve?**
⭐ `library_sources` (checksum identity · consent gate · lineage) — R2 seam ·
⭐ `lib/library/spiralogicTagger.ts` (deterministic, R8-compliant authority class) ·
⭐ `facet_tags` + its GIN index (element+phase, array-valued) ·
⭐ `visibility` gradient defaulting private ·
⭐ collective-breakthrough distillation shape ·
⭐ `PatternResonanceGraph` typed field-map vocabulary ·
⭐ `audit-element-distribution` / `retag-library-chunks` instruments (dry-run discipline) ·
⭐ `CLAIM_STATE_AUTHORITY` + `.ain` ledger as the founder-gradient precedent.
⛔ **Do not preserve:** `contribution_levels` and the `community_*` status economy.

**3. What elemental / Spiralogic structures already exist?**
A deterministic per-element scorer with tuned thresholds and soft cues; primary +
secondary element on library chunks ("dual-tagging"); array-valued `FIRE_1`-style
`facet_tags` on distillates with a GIN index; `'facet'` as a declared query type;
elemental phase transitions with archetypal from/to; an in-memory field-map graph with
typed `'elemental'` and `'transformation'` edges; 84 migrations touching
element/spiralogic/facet; live singular member elemental state.
⛔ **None of it touches the 739-file AIN corpus, and none of it reaches a member turn.**

**4. Redundant, overlapping, or distinct?** ⭐ **SEMANTICALLY DISTINCT** — see §D. R5 upheld
on evidence. ⚠️ The one with a live reader has the weakest provenance; the one with the
strongest provenance has no reader; the most complete registry has no reader at all.

**5. Which corpus is actually populated?** ⛔ **UNKNOWN — not inferred.** §B.
Code-path inference alone suggests `library_chunks` is most likely populated (four writers,
six readers, two audit instruments built against real distributions) and `corpus_chunks`
least likely (one writer, ⛔ zero readers) — ⚠️ **this is inference, explicitly not
evidence, and must not be cited as population truth.**

**6. What rights/provenance gaps block safe retrieval?**
⛔ **No rights field exists on any source table, anywhere.** Third-party clinical and
copyrighted works sit in `data/ain/source` with filename-only identity and no registry.
`library_sources.type` carries form, ⛔ never permission. Under **R4** this means **no AIN
source is currently graph-addressable as usable wisdom**, and ingestion history confers
nothing. ⚠️ `library_sources.meta` JSONB and the `.skiplist` precedent are the two places
rights standing could compose without a new invention — ⛔ ACT 2's call, not this act's.

**7. Is there enough evidence to open architecture design?**
⭐ **For the source/provenance/elemental-participation model: YES**, conditional on §B
population truth, because the seams are identified and their limits named.
⛔ **For the concept-relationship and contribution-lifecycle model: NO.** Concepts,
relationships, provenance streams, counterexamples and stewardship have **zero precedent**;
and R8's contradiction requirement (§E.4) has no substrate at all. Designing those against
UNKNOWN population would be designing against an imagined corpus.

⭐ **Recommendation, ⛔ not a decision: ACT 2 splits.** `2A` — source identity, rights
standing and elemental participation, composing with `library_sources` +
`spiralogicTagger`, opening on §B. `2B` — concept/relationship/contribution/field-pattern
model, ⛔ blocked until 2A establishes what a knowledge object *is*.
⛔ **The runtime defect (`MAIA-WISDOM-RUNTIME-01`) opens after neither** — per R6,
*disconnected is currently safer than indiscriminately connected*, and with §F.6 unanswered
connecting it would expose production MAIA to rights-unknown sources.

---

## G. Standing

**ACT 1B COMPLETE · R1–R8 RECORDED · ⛔ EXTERNAL AIN TREE UNAVAILABLE · ⛔ POPULATION
UNKNOWN · ⛔ THREE VECTOR SUBSTRATES NOT CONSOLIDATED · ⛔ NO TAXONOMY IMPOSED · ⛔ NO
ELEMENT ASSIGNED · ⛔ NO RIGHTS SCHEMA DESIGNED · ⛔ `MAIA-WISDOM-RUNTIME-01` RECORDED,
NOT OPENED · ⛔ ACT 2 NOT OPENED · PRODUCTION UNTOUCHED AND UNCONTACTED.**

**STOP. Returned for founder adjudication.**

> *The elemental layer was not missing either. It was built over the wrong corpus, by an
> honest classifier nobody ratified, and read only by scripts. The one thing genuinely
> absent is the capacity to be wrong: nothing in this system can hold a counterexample.*
