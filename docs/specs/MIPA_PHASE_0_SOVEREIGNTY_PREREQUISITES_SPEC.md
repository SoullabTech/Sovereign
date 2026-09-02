# MIPA Phase 0 — Sovereignty Prerequisites Specification

**Status**: Specification. **Not authorization to implement.**
**Authorized**: 2026-09-02 (founder) — bounded to P1–P6, sequencing, acceptance criteria, migration prerequisites.
**Parent**: `docs/architecture/MAIA_INTELLIGENCE_PARTICIPATION_ARCHITECTURE_v0.1.md` §8
**Lineage**: census → candidates (comparison record) → MIPA v0.1 (adjudicated) → **this document**
**Branch**: `claude/maia-long-term-memory-fda5gf`

### Explicitly not authorized by this document

Repair P1–P6 · add gestures to any UI · promote `buildMaiaRuntimeContext` · activate relevance retrieval · embed conversation history · change prompt composition · alter live return behavior · wire clients · deploy.

---

## 1. What Phase 0 is for

> Turn the constitutional principles into **machine-testable prerequisites** before MAIA becomes better at recollection.

The covenant Phase 0 makes satisfiable:

> **Machine access to memory must not exceed member sovereignty over memory.**

Phase 0 adds **no recall**. It establishes that when recall arrives, the member's authority over it already exists, is already exercisable, and is already provable.

The reason this threshold is drawn here, in the founder's words:

> *We are designing the member's authority over MAIA's capacity to form a history of them. That deserves to be explicit before the system becomes capable of recollecting far more than it can today.*

**Phase 0 is a gate, not a feature.** Its output is a set of properties that either hold or do not, each with a falsification test. Nothing in Phase 1–7 may begin until every P1–P6 row reaches its acceptance grade.

---

## 2. Certification vocabulary

Phase 0 does not invent an acceptance framework. It uses the project's own, from `docs/architecture/REFUSAL_REGISTRY.md`:

| Grade | Authority resides in | Removable without a code diff? |
|---|---|---|
| **A — Structural** | runtime architecture; no code path exists | **No** |
| **B — Guarded** | runtime policy / gate | only by changing guarded code |
| **C — Instructional** | prompt text | **Yes** → **not certifiable** |
| **Proposed** | nowhere yet | n/a |

Two rules carried forward verbatim:

> *"Elevation = move every constitutionally load-bearing refusal C → B → A — authority downward into architecture."*

> *"A refusal you cannot test is a belief, not a property."*

**Phase 0 acceptance means**: each prerequisite is expressed as a Refusal Registry row at **Grade A or B**, with a **falsification test** (the "hostile fork must change" column populated with a concrete, visible diff). **Grade C is not acceptance for any P1–P6 row.**

### 2.1 The two-field provenance model already specified

The registry §"Two-field provenance (the generalizing fix)" specifies:

```
authored_by:      system | member | practitioner
authority_class:  routing_state | observation | recognition | …
```

> *"A consumer may only elevate authority, never reinterpret authorship."*

**This is the same rule as the endorsement adjudication** (MIPA §4.3): endorsement changes permission and framing, never authorship. Phase 0 therefore does not author a new provenance model — it **adopts the registry's**, and the standing classes of MIPA §2.2 become expressible as `(authored_by, authority_class)` pairs rather than a parallel vocabulary.

**Recorded as a convergence, not a coincidence**: MIPA's anti-laundering rule and the registry's upward-only consumer rule are the same constraint reached from two directions.

---

## 3. The three gesture primitives — semantics before schema

**Adjudicated**: these are **product-language primitives**, not database fields. Their semantics must be settled before engineering chooses buttons, schemas, enums, or interaction surfaces.

Each is specified below as: the member's sentence · what it asserts · what it may change · **what it may never change**.

### 3.1 CORRECT / SUPERSEDE

> *"That was true then; this is what is true now."*

| | |
|---|---|
| **Asserts** | a temporal claim about the member's own account — not that the earlier record is *false*, that it is *no longer current* |
| **May change** | `VALIDITY` of the prior object: `current → superseded`; creates a validity edge (prior → successor) authored by the member |
| **May never change** | the prior object's content, its authorship, its standing, or the fact that it was once said. **Correction is not deletion.** The superseded record remains, marked |
| **Standing required** | member act; per the standing rule, may invalidate any object of standing ≤ its own |
| **Distinct from** | *retract* (see §3.4) and *delete* (removal, not supersession) |

**Semantic subtlety that must be settled before schema**: does a correction assert *"I was wrong then"* or *"I have changed since"*? These are different claims about a life, and collapsing them loses the developmental reading that Spiralogic exists to hold. **Open — §6.1.**

### 3.2 ENDORSE

> *"Yes, that interpretation belongs in how we understand this."*

| | |
|---|---|
| **Asserts** | the member accepts a MAIA-authored interpretation as belonging to the shared account |
| **May change** | `PERMISSION` (it may now participate) and `FRAMING` (it may be spoken as agreed-with) |
| **May never change** | `authored_by`. An endorsed inference becomes a **member-endorsed interpretation**, never a member statement |
| **Standing** | the object's standing class is **immutable**; endorsement is an **additive edge** carrying endorsing member + timestamp |
| **Reversible?** | must be — endorsement without withdrawal is a trap. Withdrawal returns the object to unendorsed, it does not delete it |

```
   MAIA inference ──endorse──► MEMBER-ENDORSED INTERPRETATION     ✅
   MAIA inference ──endorse──► MEMBER STATEMENT                    ✗ prohibited
```

> Otherwise the system launders provenance **at exactly the moment sovereignty is exercised** — and the loss is invisible for years, because the laundered object looks like ordinary member history.

**Modelled so laundering is unrepresentable rather than forbidden**: because the class field never changes, there is no code path that could perform the laundering. This is Grade A by construction, and it is the reason to model endorsement as an edge rather than a state transition.

### 3.3 CONSTRAIN RETURN

> *"This can be remembered, but only when I ask / only here / not in these contexts."*

| | |
|---|---|
| **Asserts** | a standing condition on *when and where* an object may participate |
| **May change** | `PERMISSION` — the conditions under which the object may reach AVAILABLE / OFFERED / ADMITTED |
| **May never change** | content, authorship, standing, or validity. A constraint is not a judgment about truth |
| **Dimensions** | **invocation** (only when I ask) · **place** (only in this room/context) · **exclusion** (not in these contexts) · **person/topic** (not about X) |
| **Direction** | constraints **narrow**; they never widen. A constraint may not grant participation an object did not otherwise have |

**Generalizes an existing, shipped primitive.** `member_memory_atoms.return_preference` and `member_daily_anchors.surface_preference` are the invocation dimension, already live (`member_pulled` / `contextual_doorway` / `ritual_review_opt_in`). Phase 0 specifies the *vocabulary* that generalizes them; it does not extend them.

### 3.4 A fourth primitive the set implies

The three named gestures do not cover: *"I no longer want this held at all."*

**RETRACT** — *"Take that back; it should not be part of how you know me."* — is distinct from CORRECT (which supersedes while preserving) and from account deletion (which removes everything). `VALIDITY ∈ {…retracted}` already anticipates it in MIPA §2.4, and the existing atoms `decline` gesture (R07: *decline = release*) is its narrow, shipped instance.

**Recorded as a gap in the gesture vocabulary, not added to Phase 0 scope.** Whether retraction is a fourth primitive or a mode of CORRECT is a product-language question (§6.2).

### 3.5 What settling the semantics does *not* authorize

No UI. No schema. No enum. No route. The gestures are specified here so that P4 (correction path) and P3 (inference disposition) have a settled vocabulary to be specified *against* — not so they can be built.

---

## 4. The prerequisites

### P1 — Member can obtain their full corpus

**PURPOSE** — Prevents the inversion the covenant forbids: MAIA gaining reach over the member's history that the member does not have over their own. This is the prerequisite that most directly gates the lane, because the Louisiana corpus is precisely what Phase 4–5 would make machine-reachable.

**INVARIANT** — For every table from which MIPA may retrieve, the member can obtain their own rows.
> *No class may be retrieval-eligible that is not export-covered.*

**CURRENT STATE** — `app/api/members/export-data/route.ts:73-102` returns `members`, `member_settings`, `member_sessions`, `developmental_memories`, `google_calendar_credentials`. **Omits** `conversation_turns`, `member_memory_atoms`, `episodic_memories`, `breakthrough_moments`, `member_theme_signals`. (Census §6.3.)

**REQUIRED CAPABILITY** — Export coverage over every retrieval-eligible class, including the class's provenance fields (`authored_by` / `authority_class` where they exist), not only its content.

**ACCEPTANCE EVIDENCE** — Registry row, **Grade A**: *"No retrieval-eligible class is export-omitted"*, enforced by a **closed-set** check — the set of tables read by retrieval loaders, derived from source, must be a subset of the set exported. Per the voice-gate lesson (MIPA §5.3), an enumerated checklist of expected tables is a denylist and fails open on the next class added. **Hostile fork must change**: add a retrieval loader over an unexported table, or remove a table from the export set — both visible diffs.

**FAIL-CLOSED** — A class that cannot be exported is **not retrieval-eligible**. The gate refuses retrieval, never the export.

**DEPENDENCIES** — None. P1 is startable today.

**NOT AUTHORIZED** — Building the export. Adding a download UI. Deciding export format. Touching retrieval.

---

### P2 — Every consent gate that is read is member-writable

**PURPOSE** — Prevents a consent gate that exists in schema and in code but is unreachable by the person it belongs to. A gate the member cannot set is not consent; it is a default with a consent-shaped name.

**INVARIANT** — Every column read as a consent gate on a live path is writable by the member through an authenticated surface.
> *Read implies writable.*

**CURRENT STATE** — `members.episodic_recall_enabled` exists (migration `20260531000001:108`, `NOT NULL DEFAULT TRUE`) and is read on every authenticated turn (`memoryLoaders.ts:325`). It is **absent** from `RECALL_PREFERENCE_COLUMNS` (`app/api/members/recall-preferences/route.ts:43-45`) — documented in that file as *"the single source of truth for which gates exist."* The route header lists it as future work; the loader shipped ahead of the surface. **A member cannot currently disable episodic recall.**

**REQUIRED CAPABILITY** — A closed-set correspondence between gates *read* and gates *writable*, maintained by construction rather than by remembering.

**ACCEPTANCE EVIDENCE** — Registry row, **Grade A**: *"No consent gate is read that the member cannot write"* — the set of gate columns read by loaders, derived from source, equals the set exposed by the preferences surface. **Hostile fork must change**: read a gate column not in the writable set — a visible diff that fails the check.

**FAIL-CLOSED** — A gate read but not writable **fails the check**; the gate is either exposed or the read is removed. Under no circumstance does it default to permissive silently.

**DEPENDENCIES** — None. Startable today. **P2 is the smallest and clearest of the six** and is a good first proof of the Phase 0 method.

**NOT AUTHORIZED** — Exposing the gate. Building preference UI. Adding new gates.

---

### P3 — Inferred layers carry provenance or do not participate

**PURPOSE** — Prevents the highest-consequence failure in the architecture: MAIA's interpretation of a member being presented back to them as their own history. **This is live exposure today, not a future risk.**

**INVARIANT** — No object participates in cognition without an explicit `(authored_by, authority_class)` pair.
> *Unlabelled material is withheld, never guessed.*

**CURRENT STATE** —
- `developmental_memories.content_text` is an LLM distillation stored under the member's `user_id`, carrying no field marking it as inference. It reaches the prompt via `memoryInfluenceAddendum` (`route.ts:936-951`). No consent gate. Grammatically indistinguishable from member speech.
- `member_theme_signals` — automatic, fire-and-forget, per-turn (`participatoryRealityHelper.ts:110-127`), scored `resonance_strength` with no trail to what produced it. No gate, no visibility, no correction, unbounded.
- `breakthrough_moments` — three writers, member-marked and system-inferred rows **not separable at the row level** (unlike `member_memory_atoms.is_breakthrough`, which carries a schema constraint guaranteeing member-only authorship).

**REQUIRED CAPABILITY** — One of two dispositions per class, chosen deliberately:
- **(a) Label** — adopt the registry's two-field provenance, plus a member-writable consent gate (P2's invariant applies), plus the endorse gesture (§3.2) as the only path from inference toward participation.
- **(b) Exclude** — the class is formally not retrieval-eligible, recorded as such, and the exclusion is enforced structurally rather than by omission.

> **Backfill warning.** Retroactively assigning `authored_by` / `authority_class` to existing rows **is itself an epistemic act.** These rows were written without a provenance model; asserting one now asserts authority the write path never established. Backfill must be conservative — where authorship is not determinable from the write path, the row is **excluded**, not labelled by inference. *A guessed provenance is worse than no provenance, because it is trusted.*

**ACCEPTANCE EVIDENCE** — Registry row, **Grade A**: *"No unlabelled object reaches cognition"* — the participation adjudicator admits only objects carrying both fields. **Hostile fork must change**: admit an object with a null provenance pair. Plus, per class, either a labelling migration with a stated backfill policy, or an enforced exclusion.

**FAIL-CLOSED** — **Absent provenance → excluded.** Never "assume member," never "assume system," never infer from content.

**DEPENDENCIES** — Disposition (a) depends on the **endorse** semantics (§3.2) being settled — done here — and on P2's invariant for its gate. Disposition (b) has no dependencies.

**NOT AUTHORIZED** — Writing the migration. Backfilling. Adding the endorse gesture. Removing the layers.

---

### P4 — A correction path exists

**PURPOSE** — Prevents a system that can hold a member's history but not their revision of it. Without correction, W1 (explicit recollection) can only return what was *said*, never what is *true* — and Case 4 has no answer beyond temporal disclosure.

**INVARIANT** — For every class the member can author, the member can supersede.
> *Authorship implies revisability.*

**CURRENT STATE** — No correction path exists anywhere. Atoms support **rejection** (`member_response_status = 'rejected'`, R07: *decline = release*) and **set-aside**, both of which release or shelve an object — **neither revises it.** `developmental_memories.valid_to` is the only supersession column in the system and has no member-facing writer. (Census §6.3.)

**REQUIRED CAPABILITY** — The CORRECT/SUPERSEDE primitive (§3.1) expressed as a validity edge whose author is recorded, governed by the standing rule:

> **Standing determines who may write a validity edge; time resolves among actors with sufficient standing.** *(Ratified 2026-09-02.)*

which yields the required asymmetry:

```
   later member correction ──► may invalidate earlier member claim / Keep
   system inference        ──► cannot invalidate member testimony
```

**ACCEPTANCE EVIDENCE** — Registry row, **Grade A**: *"No validity edge exists whose author lacks standing over its target"* — enforced as a database-level constraint on the edge relation, not a service check. **Hostile fork must change**: insert an edge from a lower-standing object to a higher-standing one, or remove the constraint.

**FAIL-CLOSED** — An unauthorized edge is **rejected at write**, not filtered at read. (Contrast with the atoms `PRACTITIONER_ATTRIBUTION_GUARD`, which permits existence and refuses surfacing — that pattern is right for attribution and wrong here: a validity edge with no standing behind it should never come into being.)

**DEPENDENCIES** — §3.1 semantics settled (done here), pending §6.1. Structurally requires P3's provenance pair, since standing is derived from `(authored_by, authority_class)`.

**NOT AUTHORIZED** — Building the gesture, the edge table, or the UI. Backfilling edges. Touching `valid_to`.

---

### P5 — A contextual-constraint substrate exists

**PURPOSE** — Prevents an architecture with a stage that has a name and no substrate. MIPA stage 5 (relational eligibility) currently has nothing to evaluate: a member cannot exclude a topic, a period, or a person from resurfacing.

**INVARIANT** — Every participation decision can consult a member-authored constraint.
> *A member may bound where their history may go.*

**CURRENT STATE** — Only the **invocation** dimension exists, on two classes: `member_memory_atoms.return_preference` and `member_daily_anchors.surface_preference` (`member_pulled` / `contextual_doorway` / `ritual_review_opt_in`; R07, R08 enforce them). **Place, exclusion, and person/topic dimensions do not exist on any class.** Scope constraints exist (`memory_scope` + team/client/encounter) but are structural, not member-authored per object. (Census §6.4.)

**REQUIRED CAPABILITY** — The CONSTRAIN RETURN primitive (§3.3) as a four-dimension vocabulary — invocation · place · exclusion · person/topic — with the direction rule enforced: **constraints narrow, never widen.**

**ACCEPTANCE EVIDENCE** — Registry row, **Grade B minimum, A preferred**: *"No constraint widens participation"* — the adjudicator applies constraints only as filters; there is no code path by which a constraint grants participation an object did not otherwise have. **Hostile fork must change**: make a constraint value admissive rather than restrictive.

**FAIL-CLOSED** — An unreadable or malformed constraint is treated as **maximally restrictive**, matching the existing atoms convention: *"Absence = restriction, not widening"* (`memoryAtomsLoader.ts:250`).

**DEPENDENCIES** — §3.3 semantics settled (done here). **P5 is the least urgent of the six**: stage 5 is not reached until Phase 6.

**NOT AUTHORIZED** — Designing the constraint UI. Extending `return_preference`. Building the vocabulary.

---

### P6 — Doorway consent is member-conferred

**PURPOSE** — Prevents a consent value the member did not confer from functioning as consent. Surfaced by the MIPA §3.2 doorway analysis; **not previously recorded.**

**INVARIANT** — A `contextual_doorway` value is member-conferred, and the doorway's disclosing text is member-authored or member-reviewed with knowledge that it may resurface.

**CURRENT STATE** — The practitioner bridge inserts observation atoms with `return_preference: 'contextual_doorway'` **hardcoded** and a **facilitator-authored** `title` (`app/api/studio/with-me/sessions/[sessionId]/route.ts:139-145`). The member neither wrote the doorway text nor chose the surfacing preference.

**This does not violate anything today.** `formatAtomsForPrompt` frames practitioner atoms with proportioned epistemic language (`epistemicFraming`, `memoryAtomsLoader.ts:550-560`), explicitly instructs MAIA to invite the member to confirm/reject/refine before carrying them as established context, and R07 guarantees a rejection permanently releases the atom. The exposure is **structural, not behavioural**: the consent value is asserted rather than conferred, and nothing prevents a future reader from treating it as conferred.

**REQUIRED CAPABILITY** — Either (a) the write defaults to `member_pulled` and the member confers the doorway, or (b) practitioner atoms carry a distinct preference vocabulary whose semantics do not claim member consent.

**ACCEPTANCE EVIDENCE** — Registry row, **Grade A**: *"No `contextual_doorway` value exists that a member did not confer"* — enforced by the write path plus a constraint, not by convention. **Hostile fork must change**: hardcode a member-consent value at a non-member write site.

**FAIL-CLOSED** — A doorway whose consent provenance cannot be established is treated as `member_pulled` — the object remains reachable when the member asks, and never surfaces ambiently.

**DEPENDENCIES** — None structurally. Conceptually clarified by §3.3.

**NOT AUTHORIZED** — Changing the bridge. Migrating existing rows. Altering live return behavior for any existing atom.

---

## 5. Sequencing

```
                        ┌──────────────────────────────────┐
   no dependencies      │  P1  export coverage             │
   startable today      │  P2  gate writability            │
                        │  P6  doorway consent             │
                        └────────────────┬─────────────────┘
                                         │
                        ┌────────────────▼─────────────────┐
                        │  P3  provenance or exclusion     │
                        │      (needs P2's gate invariant  │
                        │       for disposition (a))       │
                        └────────────────┬─────────────────┘
                                         │
                        ┌────────────────▼─────────────────┐
                        │  P4  correction path             │
                        │      (standing derives from P3's │
                        │       provenance pair)           │
                        └────────────────┬─────────────────┘
                                         │
                        ┌────────────────▼─────────────────┐
                        │  P5  constraint substrate        │
                        │      (least urgent — stage 5     │
                        │       is not reached until Ph.6) │
                        └──────────────────────────────────┘
```

**Recommended order: P2 → P1 → P6 → P3 → P4 → P5.**

- **P2 first** — smallest, clearest, fully independent. A good first proof that the Phase 0 method (closed-set check → Grade A registry row → falsification test) actually produces certifiable properties rather than documentation.
- **P1 second** — largest sovereignty gain, no dependencies, and it is the row that most directly gates Phases 4–5.
- **P6 third** — narrow, independent, and it closes the one finding this lane discovered rather than inherited.
- **P3 fourth** — the highest-consequence row and the one with a genuine research component (the backfill policy). It should not be first: the method should be proven on simpler rows before it is applied where guessing is most tempting.
- **P4 fifth** — structurally depends on P3's provenance pair.
- **P5 last** — not on the critical path until Phase 6.

**P1, P2 and P6 are parallelizable.** P3 → P4 is a hard sequence.

---

## 6. Open before Phase 0 can be considered settled

These are **semantic**, not engineering, and each blocks the row it names.

1. **Does CORRECT assert *"I was wrong then"* or *"I have changed since"*?** (§3.1) Different claims about a life. Collapsing them loses the developmental reading Spiralogic exists to hold. **Blocks P4's edge semantics** — the edge either carries an error claim or a change claim, and the two are not interchangeable downstream.
2. **Is RETRACT a fourth primitive or a mode of CORRECT?** (§3.4) `VALIDITY ∈ {…retracted}` anticipates it; the atoms `decline` gesture is its shipped narrow case. **Blocks the completeness of the gesture vocabulary**, not P4 itself.
3. **P3 backfill policy.** For rows whose authorship is not determinable from the write path: exclude (safe, loses real material) or label conservatively (risks asserting authority the write never established). This document recommends **exclude**; the decision is a founder act.
4. **Is `historical_recall_doorways` in scope?** (MIPA §3.2) The content-free contextual doorway for conversation history, member opt-in, default off. **Recorded as a design candidate; not in Phase 0.** It would attach to P5's vocabulary if authorized.
5. **Does endorsement withdrawal restore the prior state exactly?** (§3.2) An endorsement edge that can be withdrawn but leaves a trace is honest; one that vanishes is cleaner for the member. These conflict, and the sovereignty reading is not obvious.

---

## 7. Phase 0 exit criteria

Phase 0 is complete when **all six** hold:

1. P1–P6 each have a Refusal Registry row at **Grade A or B**.
2. Each row's **"hostile fork must change"** column names a concrete, visible diff.
3. Each row has a **falsification test** that fails when that diff is applied. *(A refusal you cannot test is a belief, not a property.)*
4. The three gesture primitives have **settled semantics** — §6.1–6.2 resolved.
5. Each class is **either** provenance-labelled **or** formally excluded from retrieval eligibility. No class is in an undetermined state.
6. The **fail-closed behavior** of every row is exercised by a test, not only its success path.

**Only then does Phase 1 (canonical seam) become authorized.**

> **Nothing in Phases 1–7 may begin while any P1–P6 row is below its acceptance grade.** The parity problem worsens with every capability added upstream of the seam, and the sovereignty problem worsens with every increase in reach — so the ordering is not a preference.

---

## 8. Migration prerequisites

Conceptual only. No migration is authorized, written, or named.

| Concern | Requirement |
|---|---|
| **Ordering** | Any P3 provenance columns must land **before** any reader. The census records the inverse failure twice: `episodic_recall_enabled` shipped a reader ahead of its surface (P2), and the atoms `member_response_status` migration header warns *"Schema + reader ship together — never deploy this loader ahead of that migration."* |
| **Idempotency** | Per PR #559 precedent — migrations in this repo must be re-runnable. |
| **Backfill** | Any P3 backfill is a **separate, reversible, auditable** step from the schema change, with its policy (§6.3) stated in the migration header. **Never bundled into the DDL.** |
| **Fail-closed on missing column** | A reader whose column is absent must fail to **empty**, matching existing loader convention (`memoryLoaders.ts` catch → `[]`), never to permissive. |
| **Gate coupling** | Any new consent column is added to the writable set **in the same release** as its reader — this is P2's invariant applied to its own implementation. |
| **Release gate** | P1–P6 touch member content, atoms, episodes and consent surfaces. The Co-Lab Release Gate applies: `verify-colab-boundaries.ts` must pass **31/31** in production before any tester wave. |
| **Deploy lane** | Immutable-SHA path only (`docs/ops/IMMUTABLE_SHA_DEPLOY.md`). Not authorized here; recorded so it is not rediscovered. |

---

## STOP

**Specification only. Nothing implemented.**

P1–P6 not repaired. No gesture added to any UI. `buildMaiaRuntimeContext` not promoted. Relevance retrieval not activated. No conversation history embedded. Prompt composition unchanged. Live return behavior unchanged. No client wired. Nothing deployed.

Awaiting founder resolution of **§6.1–6.5** — the five semantic questions — and authorization to begin P1–P6 repair.
