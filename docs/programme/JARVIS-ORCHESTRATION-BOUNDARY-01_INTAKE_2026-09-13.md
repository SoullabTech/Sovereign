# JARVIS-ORCHESTRATION-BOUNDARY-01 — Intake, Census, and Founder Docket

**Date:** 2026-09-13
⭐ **SUPERSEDED IN PART — founder act 2026-09-13.** D-J1 and D-J5 are RATIFIED; the runtime
name is withheld pending D-J6. Rulings of record:
`JARVIS-ORCHESTRATION-BOUNDARY-01_FOUNDER_RULINGS_2026-09-13.md`. This intake is kept verbatim
as the census and docket it was; ⛔ its §1 candidate wording is no longer the operative text.

**Standing:** ⛔ **LANE NOT OPENED.** Candidate law recorded, census run, docket posed.
No code written · no schema touched · no producer registered · no route changed ·
CMT-01 M3 still explicitly unauthorized.
**Branch:** `claude/bold-bohr-pmtynu` · **Census base:** `e1c6f527`
**Companion:** `WS-EXTERNAL-INTAKE-01_CHAPTER_CENSUS_AND_DOCKET_2026-09-13.md`
**Authority:** founder (Kelly Nezat).

---

## 1 · The founder statement (recorded verbatim as CANDIDATE law)

> **MAIA is the relationship with the writer. Jarvis is the orchestration intelligence
> behind MAIA. The writer should almost never know Jarvis is doing anything.**

and its structural corollary:

```text
ADMITTED                          REFUSED
Writer                            Writer
  ↕                                ├── MAIA
MAIA                               ├── Research Agent
  ↕                                ├── Editor Agent
Jarvis                             ├── Structure Agent
  ↕                                ├── Fact Checker
capabilities / models / agents     ├── Voice Agent
                                   └── Jarvis
```

> **Jarvis absorbs complexity; it does not expose it.**
> **Jarvis carries the multiplicity; MAIA preserves the unity of relationship.**

Status: ⭐ **RATIFIED 2026-09-13 IN AMENDED FORM (FR-J1)** — the boundary is law; the runtime
**name** is explicitly withheld pending D-J6, so that ratifying the law did not ratify its
working title by accident. ⛔ Operative text is FR-J1 in the rulings document, not the wording
above. ⛔ Until D-J6, "Jarvis" may not appear as a runtime identifier — module, type, table,
column, log marker, env var, or member-facing string.

⭐ This is the most consequential item in either intake. It is not a feature; it is a
**boundary condition on every future capability** in Writer's Studio and beyond. A feature
admitted before this is ratified will be built against an unsettled architecture.

---

## 2 · ⭐⭐ Census finding: this boundary is **already partially built and partially live**

The statement above reads as new architecture. It is not. Three substrates already implement
parts of it, and none of them is currently constituted *as* an orchestration boundary.

### 2.1 · CMT-01 Canonical MAIA Turn — **the unity mechanism already exists**

`lib/maia/canonical-turn/` at `e1c6f527`:

```text
producerRegistry.ts   closed registry of producers (38 per CMT-01 census)
adjudicate.ts         adjudicateParticipation() — pure MIPA
types.ts              three axes: authoredBy · participationClass · authority
manifest.ts           content-free [MAIA/manifest] — what was CONSIDERED, not what was said
identity.ts           one identity resolver
render.ts             one renderer
shadow.ts             shadow construction (M2) — legacy still response-producing
policy.ts · floor.ts · partition.ts
```

⭐⭐ **`adjudicateParticipation` IS "Jarvis carries the multiplicity; MAIA preserves the
unity," already expressed in code.** A closed producer registry, a pure adjudication of who
may participate in a turn, one renderer, one identity — that is precisely the admitted
diagram in §1, built. The founder's statement does not require a new architecture; it
requires **extending an existing one into Writer's Studio** and naming it.

⛔ **Standing constraint (CLAUDE.md, unchanged):** M0–M2 accepted; **M3 explicitly
unauthorized**; legacy assembly is still response-producing; `[MAIA/shadow]` must show
`zeroDiff` and one non-zero line stops the witness for classification. ⛔ **Nothing in this
intake authorizes M3, and no Writer's Studio producer may be registered while M3 is closed.**

### 2.2 · Corpus Callosum — **the multiplicity is already live in production**

Cat 6 live runtime authority (CLAUDE.md): `agent_runs` / `integration_passes`; eight voices
(MythicAtlas · MaiaVoice · ShadowAgent · Fire/Water/Earth/Air/Aether) emitting same-second
under production traffic; WisdomRouter ~49% integration; default-on; FAST + CORE.

⭐ The founder's "small society of specialized intelligences" under one relationship is
**already generating production rows**. Preserved unknowns stand: BETWEEN path zero rows,
DEEP zero rows, **member-facing experiential effect unmeasured**.

⚠️ **Inverse-drift warning applies** (CLAUDE.md): the risk here is not inflation but
omission — proposing to *build* orchestration that is already emitting rows.

### 2.3 · Context assembly + provenance — **two seams exist, neither is a contract**

| Founder's ask | Existing seam | Status |
|---|---|---|
| "record what was used" / context provenance | `MemoryBundle.selectionTrace` (`lib/memory/MemoryBundle.ts`) | **EXISTS**, named in `TEMPORAL_MEMORY_DIRECTION_2026-09-06` as the answerable trace; not a member-facing contract |
| "which model did what" | `lib/manuscript/structure/readerProvenance.ts` — `provider · model · promptHash · readerVersion · frozenAt`, frozen into the proposal store | **EXISTS for manuscript readings**; deliberately unable to reach the reader it describes |
| "what MAIA considered but did not use" | `canonical-turn/manifest.ts` — content-free, emission-only | **EXISTS**, emission only |

⭐ **Context provenance is the single P0 in the expanded scan with the most existing
substrate and the least constitution.** Three independent traces exist in three subsystems
with three shapes. ⛔ A fourth must not be invented; the gap is a **single provenance
contract**, not a new mechanism.

### 2.4 · What has **no** substrate

```text
🔴 claim ↔ evidence graph (external sources)     ZERO — see companion doc §2 P0-b
🔴 Work entity/ontology graph (people, concepts, places, motifs, questions)   ZERO
🔴 cross-subsystem orchestration contract (the "Jarvis layer" as a named object)  ZERO
🔴 disagreement preservation between producers   ZERO (adjudication admits; it does not
                                                  represent unreconciled disagreement)
```

---

## 3 · Findings

**J-F1 — The boundary is ratifiable today at near-zero cost, and delays are expensive.**
It governs every item in the 21-capability table. Ratifying `D-J1` before any lane opens is
the highest-leverage act available.

**J-F2 — "Jarvis proposes ontology; it does not decree ontology" is already law in general
form.** `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` (Invariant 16): authority moves upward
only through authored experience, never manufacturing higher-order meaning. An inferred
entity graph that becomes authoritative without a member act is exactly a system
manufacturing Recognition. ⭐ The founder's "if the writer says two concepts are not the
same, that distinction becomes authoritative" is the correct and already-constituted shape.
⛔ Request: **bind to Invariant 16 — do not author new doctrine.**

**J-F3 — ⭐ The Novelcrafter "no Codex administration" differentiation carries a sovereignty
cost that must be priced before it is promised.** A member-maintained Codex is *explicit
member authorship of structure*. An automatically inferred graph is *system-authored
structure about a person's Work*. The differentiation is real and desirable — and it moves
work from the member to the system in exactly the direction the invariants scrutinize. It is
admissible **only** if every inferred relation is (i) visibly derived, (ii) refusable, (iii)
overridable with the override becoming authoritative, and (iv) never leverage. These are the
Authority × Time memory rules (`AUTHORITY_X_TIME_2026-09-06.md`) applied to structure, and
they should be reused rather than re-derived.

**J-F4 — Disagreement preservation is a genuinely new requirement and a good one.** The
founder's shape —

```text
Agent A: likely contradiction
Agent B: likely intentional development
Evidence: Ch 3 §2 / Ch 9 §4
Confidence: mixed
```

— has **no current representation**. `adjudicateParticipation` decides *who participates*,
not *what to do when participants disagree*. WisdomRouter integrates (~49%) but the
non-integrated remainder is not represented to the member. ⭐ Preserving unreconciled
disagreement is the anti-collapse move (`DISCIPLINED_NON_COLLAPSE.md`) and is likely the
single most MAIA-distinctive item in both intakes.

**J-F5 — Model routing is a sovereignty surface, not an optimization.** Routing "private /
sensitive task → sovereign local model" is a **consent-relevant** decision. Today
`readerProvenance` records which model read a Work *after the fact*; nothing constitutes
*which classes of material may reach which class of model, decided before the call*. ⛔ That
rule must be constituted before any routing table is built, or routing becomes a silent data
boundary.

**J-F6 — "The writer should almost never know Jarvis is doing anything" and "context
provenance" are in tension, and the tension is the design.** Invisible orchestration plus
answerable-on-request provenance is coherent; invisible orchestration plus *unanswerable*
provenance is not. Proposed resolution shape (founder to rule, **D-J5**): **Jarvis is
invisible by default and fully answerable on request. Nothing Jarvis does may be
unanswerable.**

**J-F7 — Naming.** "Jarvis" is currently a *programme/lane* word in this repository
(`JARVIS-CIRCLES-01`, `JARVIS-RD-…`) meaning *the governed build intelligence*. Admitting it
as a *runtime layer name* gives one word two referents in one repo. ⛔ Cheap to settle now
(**D-J6**).

---

## 4 · Founder docket

| # | Question |
|---|---|
| ~~**D-J1**~~ | ⭐ **RATIFIED (amended), 2026-09-13** — boundary ratified; runtime name withheld. See FR-J1 |
| **D-J2** | Is the Writer's Studio Jarvis layer an **extension of CMT-01's producer/participation model**, or a separate orchestration object? (Jarvis recommends extension; ⛔ still gated on M3, which this does not open) |
| **D-J3** | Is there **one provenance contract** across `selectionTrace` · `readerProvenance` · `canonical-turn/manifest`, or do the three remain subsystem-local? |
| **D-J4** | Is **disagreement between producers** representable to the member (J-F4), and under whose authority is it resolved — never MAIA's alone? |
| ~~**D-J5**~~ | ⭐ **RATIFIED, 2026-09-13**, bound as sibling to FR-J1 — *not surfaced by default; never concealed when asked*. "Unanswerable orchestration" is a named refusal. ⚠️ *materially participated* still needs definition, routed to D-J3 |
| **D-J6** | ⭐ **NEXT ACT (founder sequencing, FR-J-SEQ).** Naming: does "Jarvis" become a runtime layer name, or does the runtime layer get a different name to protect the programme word? Settle before the word reaches runtime code |
| **D-J7** | Model routing: what **classes of material** may reach what **classes of model**, and is that rule constituted *before* any routing table exists? (J-F5) |
| **D-J8** | Inferred ontology: ratify the four conditions in J-F3 (visibly derived · refusable · member override authoritative · never leverage) by binding to Invariant 16 + Authority × Time, authoring no new doctrine? |

---

## 5 · What this document does not do

```text
⛔ does not open a lane                  ⛔ does not authorize CMT-01 M3
⛔ does not register any producer         ⛔ does not authorize an entity/ontology graph
⛔ does not build a routing table         ⛔ does not promise invisibility to any member
⛔ does not ratify any candidate law      ⛔ does not touch schema, routes, or canon
```

> The founder's instinct is right, and the census sharpens it: **Writer's Studio is the
> proving ground for Jarvis because it is the place where multiplicity is unavoidable and
> unity is non-negotiable.** But the proving ground already has a half-built floor — CMT-01
> and Corpus Callosum. The work is to name the boundary, unify three provenance traces into
> one contract, and learn to represent disagreement without collapsing it. Everything else in
> the expanded scan is a feature that will be easier, or unnecessary, once those three are settled.

---

## 6 · Scaling intake (founder, same day) — census and findings

The founder's third input states the multi-member shape: **shared capability layer, private
member field**, with five proposed laws. Census against `e1c6f527`:

### 6.1 · The five proposed laws — status

| # | Proposed law | Census |
|---|---|---|
| **L1** | Never use enormous context as memory | ⭐ Already programme doctrine in substance — the whole memory lane exists because context is not memory (`MEMORY_EXPANSION_PLAN`, `AUTHORITY_X_TIME`). **Unstated as a law.** Candidate |
| **L2** | Persist understanding outside the model | ⭐ Already built: frozen readings, revision store, structure store, standing events, evidence refs. **The most thoroughly implemented of the five** |
| **L3** | Recompute incrementally, not repeatedly | ⚠️ **Primitives exist, mechanism does not.** `canonicalFingerprint.ts` · `structureDigest.ts` · `draftStateDigest.ts` give change detection. Nothing consumes them to invalidate dependent understanding |
| **L4** | Route each task to the least expensive capable system | 🔴 No routing layer. `readerProvenance` records the model *after* the call. See D-J7 — routing is a **consent boundary before it is an economics one** |
| **L5** | Structural isolation of member Work, shared capability | ⭐⭐ **Already structural, not prompt-level.** Every manuscript read carries an ownership predicate — e.g. `WHERE id = $1 AND member_id = $2` (`app/api/sovereign/manuscripts/[id]/render/route.ts`). Isolation is enforced at the query boundary today |

⭐ **Three of five are substantially true already. L3 has primitives without a mechanism, and
L4 does not exist.** This is a narrower and more tractable picture than the intake implies.

### 6.2 · ⭐⭐ Finding J-F8 — "two cognitive speeds" already exists, under a different meaning

MAIA already has **FAST (<2s) · CORE (2-6s) · DEEP (6-20s)** — but those are **response
latency tiers within one turn**, not the founder's *immediate vs deep* distinction, which is
**turn-synchronous vs bounded background job**.

🔴 **There is no job substrate** in `lib/` — no queue, no worker abstraction, no bounded-job
model. `maia-comms-worker` is a deployed container for comms, not a general cognition lane.

⛔ **Do not overload FAST/CORE/DEEP with the new meaning.** A Whole Work contradiction sweep
is not a slower DEEP turn; it is a different object with a different lifecycle (commissioned ·
resumable · reportable · cancellable). Naming it DEEP would make the Deep-Intelligence Gate
vocabulary ambiguous. **This is the largest genuinely-absent piece of scaling substrate.**

### 6.3 · ⚠️ Finding J-F9 — "Corpus" is already a canon word, meaning something else

`docs/canon/MAIA_SOUL_CORPUS.md` · `CORPUS_DISCIPLINE_PROTOCOL_v1.0.md` ·
`CORPUS_WEIGHTING_SCHEMA_v1.0.md` · `ORACLE_CORPUS_DESIGN_v1.0.md` — in canon, **corpus =
MAIA's own knowledge corpus**, with weighting and discipline rules attached.

The proposed `MEMBER → CORPUS → WORK → MATERIAL` hierarchy would give one canon word two
referents, one of which is *MAIA's knowledge* and the other *a member's private life work* —
the two things the sovereignty model most needs kept apart. ⛔ **Rename before the layer is
built** (**D-J10**).

The *hierarchy itself* is sound and partially real: `member_manuscripts` already permits many
Works per member; what is missing is the **layer between member and Work** that can hold
material not yet belonging to any Work, and the **invitation boundary** (material moves from
that layer into a Work by a member act). ⭐ That boundary is the scaling expression of a rule
Writer's Studio already has — *belongs to the Work* vs *belongs around the Work*
(`lib/manuscript/source/custody.ts`, arrivals, omission).

### 6.4 · ⭐ Finding J-F10 — the invocation envelope is a sovereignty object, not a plumbing struct

The proposed envelope — `member_id · work_id · authorization_scope · task ·
permitted_sources · context_manifest · model_route · provenance_record` — is where four
existing constitutional concerns converge: consent scope, source custody, provenance, and
model routing. ⛔ It must not be introduced as an internal convenience type and later
retrofitted with authority. **If it is built, it is constituted first** (D-J11).

`permitted_sources` in particular is the structural answer to Sanctuary and to source custody:
it makes "what may this task read" **declarable and auditable per invocation**, rather than
implicit in whatever the caller happened to pass.

### 6.5 · ⭐⭐⭐ Finding J-F11 — the network-effect principle is the strongest candidate law in all three intakes

> **We improve the instrument, not by consuming the corpus.**
> *The system becomes better at accompanying writing without consuming writers.*

This is directly ratifiable, falsifiable, and already consistent with the architecture (no
cloud training pipeline, self-hosted models, Sanctuary's absolute boundary). It also converts
the competitive privacy point (companion doc §6) from a **comparative claim about a third
party** into a **claim about our own architecture** — which is the only form claim discipline
admits. ⭐ Recommended for early ratification (**D-J12**); it costs nothing to state and
constrains a great deal.

⚠️ One edge must be named in the ruling, or the law will be quietly broken by ordinary work:
*improving the instrument from usage* still requires deciding **what signal may leave a
member's field** — aggregate instrument telemetry is not automatically exempt merely because
it is not the member's prose. The law's teeth are in that boundary, not in the slogan.

### 6.6 · Member tiers — ⛔ not a Jarvis question

Writer · Serious Author · Scholar · Professional · Practitioner · Literary Estate is a
**packaging and pricing** proposal. It does not change the architecture (correctly observed
in the intake) and therefore must not enter this lane, which governs orchestration and
sovereignty. ⛔ Recorded here only so it is not lost, and explicitly **out of scope**.

⭐ One exception worth carrying forward: **lifetime corpus / literary estate** is not a tier —
it is a *temporal* claim about MAIA understanding the evolution of a person's life work, and
it lands squarely in the temporal-memory direction (`TEMPORAL_MEMORY_DIRECTION_2026-09-06`,
Episodic Phase 2). It should be routed there, not sold as a plan.

---

## 7 · Scaling docket (additional)

| # | Question |
|---|---|
| **D-J9** | Ratify **L1-L5** as named architecture laws (L2, L5 largely descriptive of what is already true; L3, L4 prescriptive of what is not)? |
| **D-J10** | Rename the proposed member layer — "corpus" is taken by canon (J-F9). Until renamed, ⛔ do not build it |
| **D-J11** | Is the **invocation envelope** constituted as a sovereignty object before any implementation (J-F10)? |
| **D-J12** | ⭐ Ratify **"we improve the instrument, not by consuming the corpus"**, including the signal boundary named in §6.5? |
| **D-J13** | Is **bounded deep cognition** (commissioned · resumable · reportable · cancellable jobs) opened as its own substrate lane, with a name that is **not** DEEP (J-F8)? |
| **D-J14** | Is **incremental invalidation** (L3) built on the three existing digests, or does it require a dependency representation that does not yet exist? |

---

## 8 · Standing (all three intakes)

```text
LANE                    NOT OPENED
CANDIDATE LAWS          §1 boundary · L1-L5 · instrument-not-corpus · invisible-but-answerable
                        ALL UNRATIFIED
ALREADY BUILT           CMT-01 canonical turn · Corpus Callosum (live) · query-boundary member
                        isolation · frozen understanding outside the model · three digests ·
                        three provenance traces · PDF/EPUB render route
GENUINELY ABSENT        claim↔evidence graph · Work entity graph · orchestration contract ·
                        disagreement representation · model routing · bounded-job substrate ·
                        incremental invalidation · member-layer above Work
DOCKET OPEN             D-J1 … D-J14 (here) · D-01 … D-08 (companion)
CODE WRITTEN            NONE
```

> The three intakes together do not describe twenty-one new capabilities. They describe
> **eight absent objects, four naming collisions, and a boundary that is already half-built
> and unnamed.** Naming the boundary is the cheapest act with the largest downstream effect;
> everything else should wait behind it.
