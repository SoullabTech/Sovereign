# JARVIS Work Unit — `authority_scope` Primitive

**Status:** DRAFT — design authorized 2026-08-11. ⛔ **Implementation NOT authorized.**
**Governing:** Founder ruling 2026-08-11 (corpus weighting + authority scope) · `FOUNDER_RULING_SUPER_LEARNER_S22_2026-08-10.md` §22.3–§22.6 · recovery: `JARVIS_SUPER_LEARNER_AUTHORITY_CLASS_RECOVERY_2026-08-11.md`
**Governance class:** to be assigned at admission.

> **The one-sentence shape:** `authority_scope` answers *where may this claim govern?* — **jurisdiction, not prestige.**

Begins with cases, per the ruling. Schema appears only after §9.

---

## 1. Existing relevant fields

| Field | Where | What it actually carries |
|---|---|---|
| `generated_by` | `member_memory_atoms` (8 schema refs) | producer of a row. Live value: `'unattributed-historical'` on all 142 atoms |
| `authored_by` (6) · `attribution` (6) | schema | authorship, per-table |
| `source_type` (42) | schema | ⚠️ **four mutually incompatible enumerations** — see §13 |
| `authority` (18) | schema | closest existing name; per-table semantics unverified |
| `confidence` (143) · `confidence_band` · `epistemic_mode` (2) | schema | strength/mode, not domain |
| proof ladder | prose | `EXISTS…SUSTAINED` — capability demonstration |
| `LIFECYCLE_VOCABULARY` | `work-unit.mjs:96` | 17 values — governed work state |
| `CORPUS_WEIGHTING` tiers | canon | **voice influence. specified_not_operational (0 consumers).** |

## 2. Exact semantic gap

**None of the above takes a *domain of applicability* as its subject.** Every one describes the claim, the artifact, the work, or the producer. **No field says where a claim's authority stops.**

That boundary is constitutional: §22.6 forbids Soullab canon being authoritative over a member's lived experience, and the architecture currently **cannot enforce it** (Case E, recovery doc). This unit exists to close exactly that, and nothing else.

---

## 3. CASES FIRST

### Case E — member sovereignty (the acceptance case)

```
member:            "This is what I am experiencing."
soullab framework: "This pattern may be understood as X."
practitioner:      "In my read, this looks like Y."
jarvis:            "Both resemble pattern Z."
```

**Required:** four claims coexist; none overwrites another; each maximally authoritative *within its own scope*; JARVIS knows their scopes differ. ⛔ A design in which the framework claim can be applied *as authoritative over* the member claim is **rejected**, regardless of elegance.

⛔ **Practitioner interpretation must not silently become member fact.** Sanctuary remains absolute and is untouched by this primitive.

### Case A — Differentiation (the non-adjudication case)

```
claim 1: charter §4 files Differentiation under RELATIONSHIP
         scope = maia_ain_architecture   (a program-classification act)
claim 2: corpus density is predominantly CONSCIOUSNESS / architectural
         scope = soullab_lineage         (observed authored usage)
claim 3: no canonical explicit definition found in searched canon/architecture
         → ABSENT (see §8), not UNKNOWN
tension: unresolved
```

**Success = representing all four without choosing.** A schema that forces one category is a **failed design**, per the ruling.

### Case B — supersession
§22 declares itself *"Supersedes in part"* `JARVIS_EPISTEMIC_COHERENCE_CAPABILITY_2026-08-09.md`. Works in prose today; not machine-representable. Newer ⇏ more authoritative; older canon must be **explicitly** supersedable by an authored act.

### Case C — implementation vs stale documentation
`CLAUDE.md` Bridge D documents spiral-state persistence as wired; the lane was retired 2026-07-17 and `member_spiral_state` has had **no write since 2026-04-08**.
Required: *documentation asserts X @ `repo_governance` · runtime evidence proves Y @ `runtime`* — both true, neither deleted.

### Case D — trunk vs production
Production `ca43f8ccd` vs trunk `06f5103ef`, 6 behind. **Shipped precedent:** O-1 Observer already holds these as separate Readings with independent freshness. `production` and `repo_governance` are already *de facto* distinct scopes in working code.

---

## 4. Scope inheritance rules

A **source** establishes a *default permitted* scope. A **claim** carries its own, independently.

```
SOURCE  Elemental Alchemy
        provenance: Founder-authored
        default_scope: soullab_lineage

ASSERTION extracted from it
        authority_scope: soullab_lineage        ← inherited default
        ⛔ MUST NOT silently acquire member_lived_reality
```

**Rules.** (1) Inheritance grants **only** the source's default. (2) A claim may **narrow** its scope, never widen it, without an authored act. (3) Widening is an authored act with its own provenance. (4) Extraction by JARVIS is `jarvis_inference` until a human authority confirms it — never Founder canon by virtue of the file it was found in.

## 5. Claim-level overrides
A claim inside a canonical source may be scoped *more narrowly* than the source (e.g. an aside, an example, a superseded passage). Overrides carry provenance and reason.

## 6. Multi-scope behaviour
Scopes are a **set**, not a single value — a claim may legitimately govern in more than one domain. ⛔ The set is **not** ordered. **Prefer composability over a large brittle enumeration** (ruling §5): model scope as composable domain tags, and test during recovery whether some candidates are better expressed as *dimensions* of a domain than as sibling enum members.

## 7. Conflict behaviour
Two claims conflict **only if their scope sets intersect.** Disjoint scopes ⇒ **not a contradiction** — that is Case A's whole resolution.
⛔ Never resolve a contradiction because one side has higher corpus weight — corpus weight is not operational and does not answer this question in any case.
Where scopes do intersect, record per side: provenance · authority_type · authority_scope · proof state (charter §5). ⚠️ Charter §5 also records that **all contradictions in this repo were found by directed investigation, never automatically** — do not describe automated detection as working.

## 8. Temporal / supersession
Reuse charter §5 lineage `old → challenged → revised → current`. A superseding act binds source-or-claim → superseder, with authorship. **Recency alone confers nothing.**

---

## 8b. Absence as knowledge (formal invariant)

Distinguish, where evidence permits:

```
ABSENT        searched the relevant domain; it is not there
UNKNOWN       not established
NOT_SEARCHED  no search performed
UNAVAILABLE   source could not be reached
STALE         observed, past its freshness bound
```

Established instances: no canonical Differentiation definition in searched canon/architecture · `member_daily_anchors` 0 rows · `is_breakthrough=true` on 0 of 142 atoms · `CORPUS_WEIGHTING` 0 consumers.

**Rationale:** a learner that can only say *"here is what I found"* and never *"I looked in the relevant domain and it is not there"* will repeatedly hallucinate architectural completeness. `ABSENT` requires a recorded search domain and freshness — an absence claim without a stated search is `UNKNOWN`.

⭐ O-1 Observer already implements the operative half of this distinction (`UNAVAILABLE` ≠ `UNKNOWN`, per-family freshness). **Reuse that vocabulary; do not invent a second one.**

---

## 9. Candidate representation

Four orthogonal fields — ⛔ **never one enum** (§22.4):

| Field | Disposition |
|---|---|
| `provenance` | **RECOVER + EXTEND** existing `generated_by`/`authored_by` |
| `authority_type` | **EXTEND** existing `authority`; values recovered from cases, not fixed here |
| **`authority_scope`** | ⭐ **NEW** — composable domain set; the only new primitive |
| `epistemic_status` | **COMPOSE** — reference proof ladder; do not restate |

**First scopes to be capable of distinguishing** (naming to be recovered from existing architecture where possible; ⛔ not a final ontology):

`member_own_experience · practitioner_lens · soullab_lineage · maia_ain_architecture · repo_governance · implementation · runtime · production · external_scholarship · jarvis_inference`

### ⛔ Scope is not rank
There is **no** ordering. `FOUNDER > PRACTITIONER > MEMBER > EXTERNAL` is **forbidden** — it would invert the sovereignty boundary this primitive exists to protect. A member-authored claim is *maximally* authoritative within `member_own_experience`. A Founder framework has no standing there at all. **Jurisdiction, not prestige.**

## 10. Storage fit
Self-hosted PostgreSQL. Claims + a scope join table (set-valued) + provenance columns. ⛔ **No graph database. No generalized knowledge graph.** Reuse existing provenance columns rather than adding parallel ones.

## 11. Migration requirement
**Design unit — none.** Any future migration is a separate authorized act. Existing rows would default to their source's permitted scope, never to a widened one.

## 12. Governance class
To be assigned at admission. Touches provenance semantics and a constitutional sovereignty boundary → expect elevated classification and founder review.

## 13. Out of scope — routed, not solved
`source_type` carries **four incompatible per-table vocabularies**: `('note','capture','consultation','manual')` · `('file','page','note','generated')` · `('pdf','video','audio','link','document','image')` · `('user','tester','dev','auto')`.

⛔ **Do not fix this here.** Inventory it and state interoperability requirements only. If shared provenance normalization is needed, route it as **its own later unit** — `authority_scope` must not become a catch-all field.

---

## 14. Implementation gate — all eight must be proven

| # | Gate |
|---|---|
| 1 | orthogonal to provenance |
| 2 | orthogonal to proof strength |
| 3 | orthogonal to corpus weighting |
| 4 | establishes **no** global hierarchy of persons or sources |
| 5 | protects member **and** practitioner sovereignty (Case E) |
| 6 | represents unresolved cross-domain tension (Case A) |
| 7 | composes with existing primitives rather than replacing them |
| 8 | requires **no** generalized knowledge graph |

⛔ Implementation remains unauthorized until all eight are demonstrated against Cases A–E.

## 15. Held
Differentiation **concept-layer build: HELD.** Read-only corpus recovery: authorized and may continue.

*The knowledge layer must first learn where a claim is allowed to speak, before learning how to connect thousands of claims together.*
