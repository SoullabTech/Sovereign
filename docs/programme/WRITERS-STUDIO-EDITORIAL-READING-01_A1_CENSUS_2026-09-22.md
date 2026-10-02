# `WRITERS-STUDIO-EDITORIAL-READING-01 / A1` — EXISTING-SUBSTRATE + SIBLING-LAW CENSUS

**2026-09-22 · READ-ONLY · DOCUMENTARY ONLY**

Against current canonical `578e5ee10d747846f6d4fe54e116e5b131cdbe30`.

⛔ No runtime · ⛔ no schema · ⛔ no migration · ⛔ no route · ⛔ no prompt · ⛔ no UI ·
⛔ no deployment. No file outside `docs/programme/` is touched by this act.

A0 (`fa5274fd9c8761bed4d07e8437bdd1fc36e13a9a`, corrected head
`345fc6a1005d49d8c19cb29a341739d744a885d9`) charges A1 with two questions and no
others:

1. What observation, coverage, revision, provenance, persistence and synthesis
   substrate already exists that an Editorial Reading can lawfully reuse — and
   what genuinely does not exist?
2. Which ratified constraints from sibling programmes bind an Editorial Reading,
   and at which seam?

⛔ This census proposes no contract, no object shape, no storage and no
implementation. Where it names a gap, naming is not authorization to fill it.

---

## 1 · Verdict in one line

> ⭐ **Everything an Editorial Reading needs to be *licensed* already exists.
> Nothing that would *compose* one exists. And the one thing in the repository
> already called an editorial synthesis is produced by the exact path A0
> falsifier 3 forbids.**

---

## 2 · ⭐⭐ THE FINDING — "editorial synthesis" already denotes something else, and its generation path is the forbidden one

`lib/manuscript/structure/maiaReader.ts` already produces an object named
**`editorialSynthesis`** (`interpret.ts` type `EditorialSynthesis`, schema at
`maiaReader.ts:317`, instruction text at `:177-183`):

| field | instruction as rendered to the model |
|---|---|
| `thesis` | *"what you think this Work is doing, in one or two sentences"* |
| `strongestFindings` | *"the few things you would stand behind"* |
| `questionsForAuthor` | *"what you would ask the author if you could"* |

⭐ It is whole-Work-shaped, author-addressed, coverage-recording
(`coverage.bodies.sectionIds`), and adopted by nothing — *"This is commentary,
not structure. Nothing in it is adopted … none of it decides anything."* In its
own lane it is lawful, and this census does not disturb it.

⛔⛔ **But it is produced by a single model call over headings plus requested
prose — not from admitted developmental observations.** That is A0 §XIII
falsifier 3, *raw-prose bypass*, already built and already green in a different
domain. ⭐ **It is therefore the single most likely thing an implementer reaches
for at A5**, because it is the nearest working code with the closest name.

Three separable hazards, ⛔ none repaired here:

- **Name.** Two objects would be called an editorial synthesis in one product.
  *(The precedent is the Circles census finding that "Commons" denoted three
  different existing things; the resolution there was to build fresh rather than
  reuse the nearest-named substrate.)*
- **Domain.** `maiaReader` reads **structural grammar** (`whole-work-grammar`,
  `evidence.ts:29`). A developmental observation is a different epistemic object
  with a different closed non-conclusion vocabulary. ⛔ They are not two depths
  of one reading.
- **Path.** Its thesis is licensed by the model's fluency over prose. A0 §IV
  licenses a whole-Work claim by **recorded coverage over admitted
  observations**. ⛔ The two licences are not interchangeable and must never be
  conflated by reuse.

⚠️ Open for A2, ⛔ not decided: whether `EDITORIAL-READING-01`'s primitive should
carry a name that does not collide at all.

---

## 3 · What EXISTS — and is lawfully reusable

### 3.1 Observation · ⭐ complete

`lib/manuscript/developmentalReading/contract.ts:136` — `DevelopmentalObservation`
carries, per admitted observation:

- `observation` — the reader's claim text **VERBATIM** (founder ruling: 07C does
  not rewrite);
- `evidenceRefs` — `NonEmptyArray<EvidenceRef>`, re-bound against the reading's
  own evidence before the freeze (INV-5, INV-8);
- `doesNotEstablish` — `NonEmptyArray<DevelopmentalNonConclusion>` from the
  **closed eight-member** vocabulary (`developmentalReader/contract.ts:92`);
- `lens` — copied from the commission, never inferred (INV-10);
- `phenomenon` — **optional** from contract v2; omission is the only
  representation of *no taxonomy claim*;
- `structureDependency` — derived from refs (INV-16);
- `key` (`o1…oN`), `observationId`, `admissionIndex`, `basisFingerprint`,
  `position`.

⭐ **The admission seam is single and guarded.** `freezeReading()`
(`freeze.ts:104`, mint at `:163`) is *the only call site of `mintObservationId`
in `lib/**`* — named `singleAdmissionSeam` in the seam's own comment
(`freeze.ts:161`) and enforced as `L0-single-admission-seam` at
`tests/constitutional/writers-studio/liveMatrix.ts:239`, whose defeat candidate
`SIBLING_ADMISSION_PATH` it kills. An Editorial Reading therefore
inherits a record in which every observation came into existence at one point.

⚠️ `position` is **nullable by design**: an observation citing only structural
evidence names authored divisions and has no place in the prose; such
observations sort after every positioned one and ⛔ a position is never invented
for them. **See §5.4 — this is a real gap against A0 §XI.**

### 3.2 Coverage · ⭐ sufficient to decide the A0 §IV warrant, per reading

`lib/manuscript/development/readState.ts:119-124`:

```
type ReadDepth = 'position' | 'body';
interface DevelopmentalCoverage { sections: Readonly<Record<string, ReadDepth>>; }
```

⭐ **Every section in the topology appears, with the depth it was read at**, and
unread spans are **DERIVED, never stored** (INV-9). So *"body-depth across every
in-scope authored section"* — A0 §IV's complete whole-Work warrant — is a
decidable predicate over this record **for one reading**, today, with no new
storage.

⛔ What does not exist: any union of coverage **across** readings. See §4.2.

### 3.3 Revision binding · ⭐ exact

`DevelopmentalReadState` (`readState.ts:93`) carries `draftId`, `revisionNumber`
("the ONE immutable revision this reading was taken from"), **`revisionDigest`**
(SHA-256 over that revision's whole content, UTF-8), `sectionTopology`,
per-section location and digest, and `inputFingerprint` over the exact inputs
used for this reading.

⭐ *Revision-bound* in A0 §II is therefore not aspirational: the binding is
already exact and already frozen, and `revisionDigest` makes
**cross-revision composition a decidable refusal** rather than a judgement call.

### 3.4 Provenance · ⭐ complete, and multi-dimensional

`DevelopmentalReadingProvenance` (`contract.ts:248`) — reader identity;
classifier identity or `null` **iff classification was not invoked** (INV-25);
`readingContractVersion` (`DEVELOPMENTAL-READING-CONTRACT-03`); `frozenAt`
server-stamped, never accepted from a caller.

⭐ The contract version is an **independent** provenance dimension, ⛔ never
inferred from reader or classifier version, and ⛔ **never backfilled** — a v1/v2
row's missing identity *is* the evidence it was admitted under a contract that
had none.

### 3.5 Persistence · ⭐ table + ⭐ the enumeration seam already exists

`lib/manuscript/developmentalReading/store.ts` over table
`developmental_readings` (migrations `20260904000001`, v2 `20260904000002`,
identity compatibility `20260921000001`):

- `freezeAndStore(memberId, reading)` — `:65`
- `loadReading(id, memberId)` — `:118`
- ⭐ **`listReadings(manuscriptId, memberId) → ReadingSummary[]`** — `:133`

⭐⭐ **The seam that would let something stand above individual readings is
already built and already member-scoped.** Nothing in `lib/**` consumes its
output to compose anything. *The enumeration exists; the object that would use
it does not.*

Also present: `assertNoProseKeys(payload)` (`:33`) — a durable guard that the
persisted payload carries no prose keys.

### 3.6 Member standing · ⭐ exists, on a different address

`database/migrations/20260906000001_developmental_observation_standing.sql` —
`developmental_observation_standing_events`, keyed
`(member_id, reading_id, observation_key, event_index)`.

Three of its ratified laws bind anything built above it:

- ⛔ **there is no default standing — the governed default is NO ROW**;
- ⛔ absence is not a value (no NULL-standing event);
- ⛔ **standing never transfers to a successor observation**;
- ⚠️ `observation_key` **cannot be foreign-keyed** — observations live inside the
  reading payload.

### 3.7 Observation address · ⭐ resolver built, ⚠️ lane not closed

`lib/manuscript/developmentalReading/observationAddress.ts` —
`OBSERVATION-ADDRESS-01 / A1`, a **read-only** resolver
`observationId → member-owned frozen reading → stored observationKey`. Green
PostgreSQL witness, seven defeat candidates killed, ⛔ 0 rows written.

⚠️⚠️ **What the database does not guarantee, and an Editorial Reading must
inherit:** the I1A validator refuses a *partial* identity group (0 or 4, never
1–3) but enforces ⛔ **NO UNIQUENESS on `observationId`**, within a reading or
across readings. ⭐ **A duplicate identity is representable in the durable
record.** The resolver detects and **refuses**; ⛔ it never picks one. Any
synthesis that joins, dedupes or counts by `observationId` must inherit that
refusal rather than assume the problem away.

⛔ Per the A1 packet: *"Steps 2–4 not started. Standing-write integration is a
later act, if it is needed at all."* **The lane is open, not closed.**

### 3.8 The hand-off target for A0 §VII · ⭐ exists and is explicit

`lib/manuscript/editorialWorkspace/ontology.ts` (W5-1, pure contract) names five
objects and exactly one that can be authorized:

```
Insight        MAIA-authored observation   ⛔ never wording
Direction      an authored instruction     ⛔ never wording, governs nothing
Discourse      ask_threads / ask_turns     ⛔ never wording
Suggestion     ProposalVersion             ⭐ THE ONLY AUTHORIZABLE CONTENT
Authorization  RevisionAuthorization       unchanged
```

⭐ A0 §VII's *"a later revision act must enter the existing governed
editorial/revision substrate"* has a real, named target. ⭐ And the durable
protection is structural, not a flag: an Insight is **not in `proposal_versions`**,
so `authorizeVersion` can identify none of these as candidate wording.

### 3.9 Read ceiling · ⭐ unchanged and binding

`DEVELOPMENTAL_READ_CEILING_CODE_POINTS = 500_000`
(`developmentalReader/contract.ts:229`), per invocation, in Unicode **code
points**. Convergence step 7 holds it unchanged — *refused whole, nothing
trimmed*.

---

## 4 · What DOES NOT EXIST

⭐ Stated as absences established by search, ⛔ not as a backlog.

### 4.1 No object above a reading

Nothing in `lib/**` consumes more than one `DevelopmentalReading`. `listReadings`
has no composing consumer. There is no type, no table, no function and no route
whose subject is a set of readings.

### 4.2 ⚠️ No cross-reading coverage union — and the rule it would need does not exist either

Coverage is per reading, over the topology **of one revision**. To earn A0 §IV's
whole-Work warrant from several bounded readings (A0 §XIV/A3), something must
compose coverage across readings. That composition is undefined today, and the
undefined part is not the arithmetic:

- readings on **different `revisionNumber`/`revisionDigest`** describe different
  Works, and ⭐ the digest makes that a **decidable refusal** — but nothing
  implements the refusal because nothing composes;
- `sectionTopology` may differ between revisions, so a section id present in one
  reading's coverage may be absent from another's;
- ⛔ whether a body-depth read at revision *n* can license a whole-Work claim
  about revision *n+1* is a **constitutional question, not an implementation
  detail**, and A0 does not answer it.

⭐ **This is A3's actual subject**, and it is larger than "multi-pass".

### 4.3 No synthesis over observations, anywhere

No function in `lib/manuscript/**` or `lib/writersStudio/**` takes admitted
observations and produces a claim about the Work. The only synthesis-shaped
object in the repository is the structure reader's (§2), and it is produced from
prose.

### 4.4 No persistence, no provenance and no identity for an Editorial Reading

No table, no contract version, no freeze, no admission seam, no address. ⛔ None
of these may be inferred from the developmental reading's — an Editorial
Reading's provenance must name **which readings** licensed it, which the
developmental provenance shape has no field for.

### 4.5 No whole-Work warrant predicate

The inputs exist (§3.2). The predicate that turns them into *"this claim is
licensed"* does not.

---

## 5 · Where the existing substrate and A0 do not yet meet

⭐ Five seams found by reading the code against the ratified constitution. ⛔
None is a defect in A0; each is a question A2/A3 must answer explicitly.

### 5.1 ⭐⭐ A0 §III traceability lands on two addresses, and the member's acts hang off the older one

A0 §III: *"Every material claim … must remain traceable to the observations and
coverage that license it."* The Observation Address Law
(`OBSERVATION-ADDRESS-01 §VIII`) holds that `observation_id` is the **canonical
member-facing identity for all new facet and convergence work**, while existing
standing keyed `(member_id, reading_id, observation_key)` **remains
authoritative until separately reconciled**.

**Consequence, binding on A2:** an Editorial Reading may *cite* `observationId`;
⛔ it may **not** create member actions against it while the address lane is
open (§3.7). ⛔ Do not migrate standing · ⛔ do not duplicate standing keyed by
`observationId` · ⛔ do not silently change standing's keys.

### 5.2 ⚠️ Duplicate identity is representable — a synthesis must refuse, never pick

§3.7. Stated separately because the natural shape of a synthesis layer
(*group observations by identity across readings*) is exactly the operation the
durable record does not guarantee is well-defined.

### 5.3 ⭐ Standing absence is not agreement

There is **no default standing; the governed default is NO ROW** (§3.6). An
Editorial Reading that reports *"concerns the writer has not disagreed with"*
would convert an absence into a position. ⛔ Standing is a separate axis from
synthesis and A0 grants no authority over it.

### 5.4 ⚠️ A0 §XI's "section-precise return" is undefined for null-position observations

A0 §XI requires *section-precise return to the Work*. An observation citing only
structural evidence has `position: null` **by ratified design** (§3.1) — it names
authored divisions, not a place in the prose. ⛔ Inventing a position to satisfy
the interface would breach `OBSERVATION-IDENTITY-01 §5`. ⭐ What "return to the
Work" means for a structural observation is unanswered and belongs to A6.

### 5.5 ⚠️ A0 §V's "not an ungoverned second reader" already has a precedent in force

`WS-EDITORIAL-SCOPE-01 §5`: MAIA *"is judged against exactly the words she was
shown. ⛔ Never re-read."* ⭐ A0 §V is the same law one level up. A2 should
inherit that precedent's discipline explicitly — including its refusal shape:
**the whole turn is refused, never repaired**, and *a refusal is not an occasion
to disclose*.

---

## 6 · Question 2 — which sibling law binds, and at which seam

| Ratified law | Binds | At which seam |
|---|---|---|
| `DEVELOPMENTAL_NON_CONCLUSIONS` — closed 8, meanings rendered verbatim to the model | A0 §VI | **Inheritance at composition.** Every synthesized claim inherits the union of its sources' `doesNotEstablish`; only `whole-work-pattern` · `across-unread-span` · `outside-coverage` are dischargeable, and only on complete body-depth coverage. `author-intent` · `reader-effect` permanent; `editorial-consequence` bars defect, importance, priority, or that anything should change. |
| CONVERGENCE-01 §4 — unranked, **all reachable** | A0 §VIII, §IX | **Presentation and selection.** Presentation order is not a ranking; the lawful cut is manuscript order. ⛔ *most severe / most confident / most actionable* are ranking under other names. |
| CONVERGENCE-01 step 7 — 500k ceiling unchanged, *refused whole, nothing trimmed* | A0 §XII, A3 | **Per invocation** (§3.9). Synthesis runs over observations, not prose — so the ceiling constrains the readings that feed it, ⛔ never trimmed to make a whole-Work pass fit. |
| CONVERGENCE-01 L8 — coverage is the ground of trust, ⛔ never behind *Show editorial detail* | A0 §IV, §IX | **Presentation.** Coverage limits are part of the reading. |
| CONVERGENCE-01 — EA acceptance precondition | A0 §IV | **Whole-Work claims.** EA-as-governed-knowledge (1,238 SHA-pinned chunks) must be **proved unreachable** while EA-as-manuscript is under review, ⛔ not assumed — otherwise no whole-Work claim is falsifiable and a reading is indistinguishable from a recollection. |
| CONVERGENCE-01 §10.3 — the Work Compass licenses nothing about the text | A0 §V, §VI | **Reader and synthesis inputs.** A declaration may orient attention; ⛔ it is never evidence, ⛔ never discharges coverage, ⛔ may never be restated as an observation. `readScope.ts:23` already rules the Work is interpreted **as written, not authorial intention reconstructed from auxiliary material**, and the Compass is auxiliary material. |
| OBSERVATION-IDENTITY-01 — one admission seam; identity never derived from text or basis; basis is an integrity witness only | A0 §III | **Citation.** A synthesis cites admitted identities; ⛔ it mints none, and ⛔ a basis fingerprint is never used for deduplication or semantic sameness. |
| OBSERVATION-ADDRESS-01 §VIII — two valid addresses, ⛔ never casually collapsed | A0 §III, §VII | **Member action.** §5.1. Gate live until that lane closes. |
| FACETS-01 / A0 §X — GUIDED · LEARNING · DIRECT | A0 §X, falsifier 9 | **Rendering, after synthesis.** A facet changes how much MAIA translates and explains; ⛔ never how much MAIA writes; ⛔ never which observations are reachable. |
| WS-EDITORIAL-SCOPE-01 §5 — never re-read; whole turn refused, never repaired | A0 §V | **Input assembly** (§5.5). |
| `editorialWorkspace` ontology — only `ProposalVersion` is authorizable | A0 §VII | **Hand-off** (§3.8). ⛔ No second mutation substrate. |

---

## 7 · What A1 did not do

⛔ No contract proposed · ⛔ no object named · ⛔ no storage designed · ⛔ no
coverage-union rule chosen · ⛔ no ruling on the naming collision · ⛔ no
falsifier authored · ⛔ no code read into authority it does not have.

⚠️ **This census is repository truth only.** ⛔ No live or shadow database was
read; the 245 legacy observations reported in the ADDRESS-01 A1 packet are cited
as that packet's finding, ⛔ not re-measured here.

⚠️ **Gates not run in this container** — no project `node_modules`. ⛔ Nothing in
this act requires them: no source file is modified.

---

## 8 · Owed before A2 can be written

Four questions the census raises and ⛔ does not answer:

1. ⭐⭐ **The name.** Does the primitive keep *Editorial Reading* alongside the
   structure reader's `editorialSynthesis`, or take a non-colliding name? (§2)
2. ⭐ **Cross-revision composition.** May readings at different `revisionDigest`
   compose at all — and if not, what does a Work that has moved since its last
   reading present? (§4.2) *This is constitutional, and it is A3's subject.*
3. ⭐ **Traceability address.** Does an Editorial Reading cite `observationId`
   only, and does A2 wait on the address lane closing? (§5.1)
4. ⚠️ **Structural observations.** What does *return to the Work* mean when
   `position` is null by ratified design? (§5.4)

---

## 9 · Standing

```
WRITERS-STUDIO-EDITORIAL-READING-01 / A1
CENSUS COMPLETE · READ-ONLY
SUBSTRATE: LICENSING COMPLETE · COMPOSITION ABSENT
⭐ NAMING + PATH COLLISION FOUND (structure reader `editorialSynthesis`)
⛔ A2 NOT OPENED · ⛔ NO CONTRACT · ⛔ NO IMPLEMENTATION
⛔ NO RUNTIME · NO SCHEMA · NO ROUTE · NO PROMPT · NO UI · NO DEPLOY
PRODUCTION UNTOUCHED
```

> A0's governing sentence, restated as what the census measured:
> **the evidence that would earn the right to say more already exists; the object
> that would say it does not.**
