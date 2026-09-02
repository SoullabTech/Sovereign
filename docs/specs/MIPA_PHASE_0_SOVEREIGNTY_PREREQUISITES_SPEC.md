# MIPA Phase 0 — Sovereignty Prerequisites Specification

**Status**: Specification, plus **P2 executed and certified** (§4.P2-E). P1, P3–P6 remain specification only.
**Authorized**: 2026-09-02 (founder) — bounded to P1–P6, sequencing, acceptance criteria, migration prerequisites.
**Semantic adjudication**: 2026-09-02 (founder) — all five blocking questions closed (§6).
**§7 adjudication**: 2026-09-02 (founder) — all eight contradictions resolved (§7); **P2 authorized to execute**, P3 repair class authorized with execution gated behind P2's evidence.
**Parent**: `docs/architecture/MAIA_INTELLIGENCE_PARTICIPATION_ARCHITECTURE_v0.1.md` §8
**Lineage**: census → candidates (comparison record) → MIPA v0.1 (adjudicated) → **this document**
**Branch**: `claude/maia-long-term-memory-fda5gf`

### Explicitly not authorized by this document

Repair P1, P3, P4, P5, P6 · add gestures to any UI · promote `buildMaiaRuntimeContext` · activate relevance retrieval · embed conversation history · change prompt composition · alter live return behavior · wire clients · deploy.

**P2 repair is authorized and complete** (2026-09-02). It changed no live behavior: both gates already existed in schema and were already read every turn — only the location of the gate list changed. See §4.P2-E.

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

## 3. Member authority — four kinds, five primitives

**Adjudicated 2026-09-02.** These are **product-language primitives**, not database fields. Their semantics are settled here so that engineering cannot choose them implicitly through schema design.

### 3.0 The four independent kinds of member authority

> **None may silently mutate another.**

| Authority | The question it answers | Primitive(s) |
|---|---|---|
| **Epistemic** | *What account is accurate?* | `CORRECT` |
| **Developmental** | *What has changed over time?* | `CHANGE / UPDATE` |
| **Participatory** | *What may MAIA continue to use or return?* | `RETRACT` · contextual constraints |
| **Interpretive** | *Does this interpretation belong in our shared understanding?* | `ENDORSE` · `WITHDRAW ENDORSEMENT` |

The reason this separation is load-bearing, in the founder's words:

> *A person's history with MAIA should not become one perpetually rewritten "current truth."* Three sentences can concern the same memory and mean completely different things:
>
> **I was mistaken then. · I was different then. · I no longer consent to this participating.**

And the Spiralogic consequence, which is the reason the developmental kind cannot be folded into the epistemic one:

> *If every later self-description simply overwrites the earlier one, MAIA loses development itself.* She must be able to hold: **this was true of you then, this became true later, and this is how you now understand the movement between them.**

At that point memory is not storage or recall. It is **a temporally faithful account of becoming.**

---

### 3.1 CORRECT — epistemic authority

> *"I said I hated New Orleans then, but that wasn't actually true. I was angry."*

**Asserts**: the earlier representation was **inaccurate for the time or reality it claimed to describe.**

```
   earlier representation
           │
           └──── CORRECTED_BY ────► later member act

   effect: the earlier proposition loses validity
           for the period it claimed to describe
```

| | |
|---|---|
| **May change** | `VALIDITY` of the earlier proposition — including for the past it described |
| **May never change** | the *record* that the member said it, its authorship, its standing, or its occurrence |
| **Standing** | member act; may correct any object of standing ≤ its own |

**CORRECT operates on claims, not on records.** That a member *said* "I hated New Orleans" remains a true record of an utterance even when the proposition was false. The utterance stands; the claim loses validity. This preserves the audit trail and the correction simultaneously — and it is why correction can never be modelled as an edit.

---

### 3.2 CHANGE / UPDATE — developmental authority

> *"I really did want to leave then. I don't anymore."*

**Asserts**: the earlier representation **may have been true then; it is no longer true now.**

```
   earlier representation              later representation
           │                                   │
           └────────── valid until ────────────┘

   effect: the earlier representation REMAINS HISTORICALLY VALID
```

| | |
|---|---|
| **May change** | the earlier representation's *temporal scope* — it becomes bounded, not invalid |
| **May never change** | its truth for the period it held; its content; its authorship |
| **Standing** | member act; same rule as CORRECT |

**This is the primitive Spiralogic depends on.** A CHANGE-superseded representation is not filtered out of history — it is *situated in* it. See §7.4: this makes validity resolution **temporal scoping, not filtering**, which is a genuine refinement to MIPA §2.4.

---

### 3.3 RETRACT — participatory authority

> *"I withdraw this from future participation."*

**Adjudicated: a distinct primitive, not a mode of CORRECT.** Correction makes an epistemic claim (*that was wrong*). Change makes a temporal claim (*that was true then*). Retraction makes a **sovereignty claim** (*I no longer consent to this participating*). These are not interchangeable, and no two of them imply the third.

**`RETRACT` does not mean `DELETE`.** A retracted object may remain historically recorded while becoming ineligible for ordinary future participation. The architecture must distinguish four separate propositions:

```
   This happened in the relationship.
        ≠  This remains an authorized representation.
        ≠  This may participate again.
        ≠  This record should continue to exist at all.
```

Deletion remains a separate sovereignty operation, governed by deletion policy.

**Shipped narrow instance**: the atoms `decline` gesture (R07, *decline = release*) is RETRACT scoped to `practitioner_observation` atoms. See §7.3 for a dependency it raises.

---

### 3.4 ENDORSE — interpretive authority

> *"Yes, that interpretation belongs in how we understand this."*

```
   MAIA inference
         │
         └──── ENDORSED_BY_MEMBER ────► member act

   authored_by      = MAIA                          (unchanged)
   authority_class  = member-endorsed interpretation
```

| | |
|---|---|
| **May change** | `PERMISSION` (it may now participate) and `FRAMING` (it may be spoken as agreed-with) |
| **May never change** | `authored_by`. An endorsed inference is a **member-endorsed interpretation**, never a member statement |

```
   MAIA inference ──endorse──► MEMBER-ENDORSED INTERPRETATION     ✅
   MAIA inference ──endorse──► MEMBER STATEMENT                    ✗ prohibited
```

> Otherwise the system launders provenance **at exactly the moment sovereignty is exercised** — and the loss is invisible for years, because the laundered object looks like ordinary member history.

Modelled as an **additive edge on an immutable class**, so laundering is *unrepresentable* rather than forbidden: no code path exists that could perform it. Grade A by construction.

---

### 3.5 WITHDRAW ENDORSEMENT — and the trace it leaves

**Adjudicated: withdrawal closes the edge; it does not erase it.**

```
   MAIA inference
         │
         ├── endorsement  valid_from  t1
         └── endorsement  valid_to    t2      ← withdrawal
```

After withdrawal the object is again an **unendorsed MAIA interpretation**. The historical fact that endorsement once occurred remains part of the relational provenance record.

> **The trace does not itself create ordinary speaking eligibility.** It is provenance and audit history — not conversational content.

This generalizes into an invariant covering *every* validity relation (§7.2), because the edges are precisely the kind of artifact a naive composer would surface as "continuity."

```
   WITHDRAW ENDORSEMENT  ≠  erase endorsement history  ≠  delete underlying material
```

If the member instead exercises DELETE against the underlying material, deletion policy governs separately.

---

### 3.6 The complete Phase 0 gesture vocabulary

```
   CORRECT                epistemic       — that was inaccurate
   CHANGE / UPDATE        developmental   — that was true then, not now
   RETRACT                participatory   — withdraw from future participation
   ENDORSE                interpretive    — that interpretation belongs
   WITHDRAW ENDORSEMENT   interpretive    — it no longer does
```

Plus the standing constraints of CONSTRAIN RETURN (§3.7), which is participatory authority expressed as a *condition* rather than a *withdrawal*.

---

### 3.7 CONSTRAIN RETURN — participatory authority, conditional form

> *"This can be remembered, but only when I ask / only here / not in these contexts."*

| | |
|---|---|
| **May change** | `PERMISSION` — the conditions under which an object may reach AVAILABLE / OFFERED / ADMITTED |
| **May never change** | content, authorship, standing, or validity. **A constraint is not a judgment about truth** |
| **Dimensions** | **invocation** (only when I ask) · **place** (only in this context) · **exclusion** (not in these contexts) · **person/topic** (not about X) |
| **Direction** | constraints **narrow**; never widen. A constraint may not grant participation an object did not otherwise have |

**Generalizes a shipped primitive.** `member_memory_atoms.return_preference` and `member_daily_anchors.surface_preference` are the *invocation* dimension, already live and already enforced (R07, R08). Phase 0 specifies the vocabulary that generalizes them; it does not extend them.

---

### 3.8 What settling the semantics does *not* authorize

No UI. No schema. No enum. No route. No migration. The primitives are specified so that P3 and P4 have a settled vocabulary to be specified *against* — not so they can be built.

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

> ### ✅ P2 CERTIFIED — 2026-09-02 · **Grade A (scoped)** · Refusal **R23**
>
> Certification: `__tests__/mipa-p2-consent-gate-parity.test.ts` — **10/10 passing**, with **all five hostile-fork mutations verified failing** and reverted. Evidence in §4.P2-E.
>
> **⚖️ SCOPE, stated narrowly (founder, 2026-09-02).** R23 certifies (a) every **boolean** column on **`members`** is classified, and (b) every **registered** gate shares one read/write registry. It does **not** certify that all consent mechanisms everywhere are closed-set — consent also lives in enums on other tables (`return_preference`, `surface_preference`), and could live in relation tables or scoped policies. **Do not let the row universalize past the domain the detector closes.**
>
> **⚖️ FULL-TREE VERIFICATION COMPLETE — 2026-09-02.** Dependencies installed and the gate run in order:
>
> | Gate | Result |
> |---|---|
> | `npm run typecheck` | ✅ **No regressions** — 231 errors vs baseline 239 (8 fixed, 0 new); 4121 program files vs baseline 3965 |
> | `npm run preflight` | ⚠️ **Blocked by a pre-existing failure, not by P2** — see below |
> | R23 certification | ✅ **10/10** |
> | Adjacent regression | ✅ **124/125** — the one failure is the pre-existing `sanctuaryGuard` case |
>
> **On preflight.** The chain's *first* check, `check-dark-text-opacity.sh`, fails on three `app/studio/` files (`field/page.tsx:1003,1085`, `layout.tsx:113`) last touched by `37bbf0c`. Verified **pre-existing**: it exits 1 on a clean tree with these changes stashed. Because the chain is `&&`-joined, that one failure prevents every later check from running — so the remaining seven were run individually and **all pass**: `no-supabase`, `no-direct-anthropic`, `no-vendor-voices`, `voice-provenance`, `no-openai`, `member-owned-boundary`, `ci:guard`. (`preflight-compose-config.sh` needs a gitignored `.env.docker` absent from this container — the documented worktree trap, not a result.)
>
> **Finding worth separating from P2**: `npm run preflight` is currently red on the base branch. Until those three files are fixed, "preflight passes" cannot gate any merge — P2's or anyone's. Recorded, not repaired: the files are unrelated to this lane.
>
> The pre-existing `sanctuaryGuard` failure stays **outside** P2 — recorded, never absorbed.

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


---

### P2-E — Execution record and certification evidence

**Bounded repair, as executed.** No behavior change: both gates already existed in schema with `DEFAULT TRUE` and were already read every authenticated turn. What changed is *where the list of gates lives*.

| Change | File |
|---|---|
| **New** — single source of truth: `MEMBER_CONSENT_GATES`, `ConsentGateName`, `readConsentGate()`, plus the two classification buckets | `lib/maia/consentGates.ts` |
| Both gate readers reduced to one-line delegations | `lib/maia/memoryLoaders.ts` |
| Route's private `RECALL_PREFERENCE_COLUMNS` literal replaced by the shared constant | `app/api/members/recall-preferences/route.ts` |
| **New** — certification | `__tests__/mipa-p2-consent-gate-parity.test.ts` |
| **New** — registry row R23 | `docs/architecture/REFUSAL_REGISTRY.md` |

**Why Grade A.** The read-set and the write-set are **the same object**, not two lists asserted to match. `readConsentGate` accepts only `ConsentGateName = keyof typeof MEMBER_CONSENT_GATES`, and the preferences route derives its columns from the same constant. **Reading a gate that is not member-writable is a compile error** — the Phase 0 design target (*invalid states unrepresentable rather than merely discouraged*) applied to P2 itself.

**Where the closed set is drawn, and why not at call sites.** The tempting set — *every SQL read of `members`* — has **~75 sites across ~45 files**, nearly all team notifications and profile reads with nothing to do with consent. A gate that fires on all of them gets switched off; the failure would be social rather than technical, and still failure. So the set is drawn where gates **originate**: the schema. Every boolean column on `members` must classify into exactly one bucket, so a new column fails **because it is unknown** — before any loader that would read it exists.

**Falsification — all five mutations applied, verified failing, reverted:**

| # | Hostile-fork mutation | Result |
|---|---|---|
| F1 | Add `shadow_recall_enabled BOOLEAN` to `members` without classifying it | ❌ **1 failed** / 9 passed |
| F2 | Remove `episodic_recall_enabled` from the registry while its loader names it | ❌ **1 failed** / 8 passed |
| F3 | Add a reader for `recurrence_recall_enabled` (a declared-unread gate) | ❌ **1 failed** / 9 passed |
| F4 | Read `episodic_recall_enabled` in SQL outside `consentGates.ts` | ❌ **1 failed** / 9 passed |
| F5 | Give the preferences route its own gate list again | ❌ **1 failed** / 9 passed |
| — | Restored | ✅ **10/10 passing** |

#### Two findings the certification produced

**(1) A third gate, found by the schema scan and not by reading loaders.**
`members.recurrence_recall_enabled` (migration `20260601000001`, `DEFAULT TRUE`) exists, is **read by nothing**, and is exposed nowhere. It does not violate P2 today — P2's invariant is *read* implies writable. But `lib/maia/recurrenceDetector.ts:25` instructs a future caller that it *"MUST gate this behind `members.recurrence_recall_enabled`"* — which is **exactly how the episodic gate became unreachable**: the intent was recorded in a comment and the surface was never built.

It is placed in `DECLARED_UNREAD_GATES` rather than exposed, because exposing a toggle for a layer that does not surface would be a **UI claim without verified state**, which project doctrine forbids. The bucket carries a falsifiable condition — zero readers — so the next reader trips the gate instead of repeating the defect (proven by F3).

**(2) The detector's own first failure is recorded in the test.**
The initial call-site scan flagged `components/settings/MemoryConsentSection.tsx:72` as a SQL read. It was a React state update — `setPreferences(...)` matched the keyword `SET` without a word boundary. **Fixed in the detector, not in the assertion.** Noted in the test header because it is the same epistemic error the voice gate documents four times: *a gate that fires on things merely shaped like what it hunts is as unsound as one that misses the unknown — and it is the one that gets switched off.*

#### What P2 did **not** do — the remaining half

**`episodic_recall_enabled` is now member-writable via `PATCH /api/members/recall-preferences`. It is not yet member-discoverable.** `components/settings/MemoryConsentSection.tsx` renders one hardcoded toggle, though its own docstring states that future layers *"attach here as additional toggles without UI churn."*

A gate reachable only by `curl` is writable in the API sense and not in the sense the member lives in. **The standing not-authorized list forbids adding member gestures to any UI**, so this was left undone rather than taken as implied. Recommended as **P2b** — a bounded change rendering the toggles from `MEMBER_CONSENT_GATES` so the third surface cannot drift from the other two either.

#### Regression check

`m15-memory-observability-contract`, `memoryCanonGuard`, `breakthroughLogContainment`, `turnMemoryProvenance` — **all pass**.
`app/api/sovereign/episodes/mark/__tests__/sanctuaryGuard.test.ts` has **one failing test** (*"every refusal log carries metadata only, never the member content"*). **Pre-existing** — it fails identically on a clean tree with these changes stashed. Reported, not fixed: out of P2's scope.

**Not run**: `npm run typecheck` and `npm run preflight` — this container has only a minimal dependency set installed (jest, ts-jest, typescript, pg), not the full tree. The three touched TypeScript files should be typechecked in a full environment before the change is considered merge-ready.

---
### P2b — Member Exercise Surface

> **Recorded 2026-09-02. NOT authorized to implement. This is not UI authorization.**

**PURPOSE** — Prevents treating a gate as sovereign because an API can mutate it. Mechanical writability and lived exercisability are **different properties**, and only the second is what the member actually has.

**INVARIANT** *(founder-authored)* —

> **A live member-governable participation gate must be both mechanically writable AND discoverably exercisable by the member before the corresponding intelligence layer may be considered sovereignly available.**

**CURRENT STATE** — P2 established:

```
   gate can be read  ⇅  same canonical registry  ⇅  gate can be written through API
```

It did **not** establish:

```
   member can discover and exercise the sovereignty control
```

`members.episodic_recall_enabled` is writable via `PATCH /api/members/recall-preferences` and absent from `components/settings/MemoryConsentSection.tsx`, which renders one hardcoded toggle.

**REQUIRED CAPABILITY** — Toggles rendered from `MEMBER_CONSENT_GATES` so the member-facing surface cannot drift from the read and write surfaces either.

**EXPLICIT NON-REQUIREMENT** — `recurrence_recall_enabled` **stays unexposed** while its layer has no verified live participation. A control over behavior that does not participate is **sovereignty theater: a switch over nothing.** This is the same doctrine that keeps it out of `MEMBER_CONSENT_GATES` — and it is a *reason not to build*, not a defect to fix.

**ACCEPTANCE EVIDENCE** — deferred with the prerequisite.

**DEPENDENCIES** — P2 complete (it is, pending full-tree verification).

**NOT AUTHORIZED** — All of it. Recorded so the gap is not mistaken for closed, and so it is not silently folded into P2 or reopened as an R23 defect. **It is neither.**

---

### P3 — Inferred layers carry provenance or do not participate

**PURPOSE** — Prevents the highest-consequence failure in the architecture: MAIA's interpretation of a member being presented back to them as their own history. **This is live exposure today, not a future risk.**

**INVARIANT** — No object participates in cognition without an explicit `(authored_by, authority_class)` pair.
> *Unlabelled material is withheld, never guessed.*

**CURRENT STATE** —
- `developmental_memories.content_text` is an LLM distillation stored under the member's `user_id`, carrying no field marking it as inference. It reaches the prompt via `memoryInfluenceAddendum` (`route.ts:936-951`). No consent gate. Grammatically indistinguishable from member speech.
- `member_theme_signals` — automatic, fire-and-forget, per-turn (`participatoryRealityHelper.ts:110-127`), scored `resonance_strength` with no trail to what produced it. No gate, no visibility, no correction, unbounded.
- `breakthrough_moments` — three writers, member-marked and system-inferred rows **not separable at the row level** (unlike `member_memory_atoms.is_breakthrough`, which carries a schema constraint guaranteeing member-only authorship).

> **⚖️ P3 REPAIR CLASS AUTHORIZED 2026-09-02 — AND IT IS EXCLUSION, NOT RELABELLING.**
>
> The obvious repair — attach `authored_by: MAIA` to the existing developmental prime and leave it in the prompt — **is not a repair.** Under the ratified lattice, unendorsed S5 inference has **no entitlement to participate** merely because its provenance is now accurately labelled. Labelling it would improve provenance while still violating participation.
>
> The target invariant is stronger:
>
> > **Uncertified or insufficiently authorized inferred developmental material does not enter canonical live composition.**
>
> P3 is therefore authorized in principle to establish a certified participation gate **that may reduce existing developmental influence**. Execution remains gated behind P2's evidence.
>
> **Authorized when its turn arrives**: provenance certification necessary for P3 · participation exclusion necessary to attain Grade A/B · regression tests proving uncertified/unendorsed inference cannot enter canonical composition · hostile-fork evidence.
>
> **Not authorized**: redesigning developmental intelligence · generating new developmental memories · endorsement UI · historical semantic retrieval · modifying unrelated memory classes · seam promotion · contextual doorways · client wiring · deployment beyond a separately authorized test environment.

**REQUIRED CAPABILITY** — One of two dispositions per class, chosen deliberately:
- **(a) Label** — adopt the registry's two-field provenance, plus a member-writable consent gate (P2's invariant applies), plus the endorse gesture (§3.2) as the only path from inference toward participation.
- **(b) Exclude** — the class is formally not retrieval-eligible, recorded as such, and the exclusion is enforced structurally rather than by omission.

> **BACKFILL POLICY — adjudicated 2026-09-02.**
>
> Legacy provenance may be assigned **only** where authorship and authority class can be established **from evidence in the historical write path** with sufficient certainty.
>
> Where provenance cannot be established:
> - **Do not** infer it from content, tone, field names, probable caller, or present-day architecture.
> - **Do not** manufacture `(authored_by, authority_class)` values merely to make old rows MIPA-compatible.
> - Such rows **remain stored** and are **excluded from MIPA participation** until they can be certified.
> - If the provenance vocabulary supports an explicit *uncertified / unknown* state, it may be used. If it does not, **absence from the certified participation set is preferable to inventing a provenance claim during Phase 0.**
>
> **Governing principle**: *Unknown provenance is an epistemic limitation. **Guessed provenance is false provenance.** The latter is worse.*

> ### ⚠️ P3 IS THE ONLY PREREQUISITE WHOSE REPAIR IS NOT BEHAVIOR-NEUTRAL
>
> P1, P2, P4, P5 and P6 add member capability without changing what MAIA receives. **P3 does not.**
>
> `developmental_memories` reaches the live prompt **today**, as content: `buildMemoryPromptBlock` interpolates the distilled cue verbatim — `` `- Prior developmental direction: ${dm.directional_cue}.` `` (`memoryOrchestrator.ts:143-146`). Under P3, an unlabelled class is excluded, so satisfying P3 requires **either** labelling that class **or** removing a live prompt influence.
>
> Sharper still: the sole current protection against Case 6 on this path is the adjacent instruction *"Use as a background prime only, not as content to reference"* — **Grade C, which the registry defines as not certifiable.** That is precisely P3's purpose and precisely why it cannot be satisfied by documentation.
>
> **Consequence**: P3's *repair* requires authorization beyond "Phase 0 approved," because it necessarily alters what MAIA receives. Recorded as a dependency (§7.5), not resolved here.

**ACCEPTANCE EVIDENCE** — *(founder-specified 2026-09-02.)* Grade A or B evidence proving **four** things:

| # | Must prove |
|---|---|
| **1** | The existing ungoverned `directional_cue` composition path is **structurally gone or guarded at Grade A/B** — not merely accompanied by stronger instructions |
| **2** | Uncertified legacy material is **excluded**, never guessed |
| **3** | MAIA-authored inference **cannot acquire autobiographical authority** by having existed a long time or appeared in prompts repeatedly |
| **4** | A hostile fork that **directly reintroduces uncertified developmental material into canonical composition fails certification** |

**Required falsification mutation** — an effect-equivalent of:

```
   composer += developmentalMemory.directional_cue
```

> **If that mutation passes, P3 is not certified.** This is the acceptance test, not an illustration of one.

**Expected behavior change, authorized in advance**: since the member has no endorsement gesture, MAIA-authored developmental inference **ordinarily terminates at EXCLUDED** under the presently reachable architecture. *That reduction in live influence is expected, not a regression* — the present influence survives only through Grade-C instructional restraint, which the registry defines as not certifiable.

**FAIL-CLOSED** — **Absent provenance → excluded.** Never "assume member," never "assume system," never infer from content.

**DEPENDENCIES** — Disposition (a) depends on the **endorse** semantics (§3.2) being settled — done here — and on P2's invariant for its gate. Disposition (b) has no dependencies.

**NOT AUTHORIZED** — Writing the migration. Backfilling. Adding the endorse gesture. Removing the layers.

---

### P4 — A correction path exists

**PURPOSE** — Prevents a system that can hold a member's history but not their revision of it. Without correction, W1 (explicit recollection) can only return what was *said*, never what is *true* — and Case 4 has no answer beyond temporal disclosure.

**INVARIANT** — For every class the member can author, the member can supersede.
> *Authorship implies revisability.*

**CURRENT STATE** — No correction path exists anywhere. Atoms support **rejection** (`member_response_status = 'rejected'`, R07: *decline = release*) and **set-aside**, both of which release or shelve an object — **neither revises it.** `developmental_memories.valid_to` is the only supersession column in the system and has no member-facing writer. (Census §6.3.)

**REQUIRED CAPABILITY** — **Two** validity relations, not one (§6 adjudication 1):

| Relation | Kind | Effect on the earlier object |
|---|---|---|
| `CORRECTED_BY` | epistemic | loses validity **for the period it claimed to describe** |
| `SUPERSEDED_BY` (CHANGE) | developmental | **remains historically valid**; becomes temporally bounded |

Plus `RETRACTED_BY` (participatory, §3.3), which alters participation eligibility without touching validity at all.

**Three structural requirements follow, and each contradicts a natural implementation instinct:**

1. **Edges live in their own relation, never as columns on the objects** (§7.1). A `valid_to` column can express CHANGE for `developmental_memories` and cannot express it for `conversation_turns` — a turn is already temporally scoped by its own `created_at` and asserts nothing about the present. The edge must therefore be an object in its own right, carrying source, target, kind, author, and time.
2. **Edges target claims, not records** (§3.1). That the member *said* X remains true even when X was false. Phase 0 adopts the conservative reading: an edge targets the whole object and is interpreted as scoping its *propositional content*, never its *occurrence*. See §7.6 for the limitation this accepts.
3. **Authorship of the edge is itself provenance-bearing** and governed by the standing rule:

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

## 6. Semantic adjudications — closed

All five blocking questions were adjudicated 2026-09-02. Recorded here as settled, with what each closes.

| # | Question | Adjudication | Closes |
|---|---|---|---|
| **1** | Does CORRECT mean *"I was wrong"* or *"I have changed"*? | **Both — as two distinct relations.** `CORRECT` (epistemic) invalidates the earlier proposition for the period it described. `CHANGE` (developmental) bounds it temporally and preserves its historical validity | P4's edge semantics (§3.1–3.2) |
| **2** | Is RETRACT a fourth primitive or a mode of CORRECT? | **A distinct primitive.** A sovereignty claim, not an epistemic or temporal one. `RETRACT ≠ DELETE` | the gesture vocabulary (§3.3, §3.6) |
| **3** | P3 backfill policy | **Never guess.** *Unknown provenance is an epistemic limitation; guessed provenance is false provenance — and the latter is worse* | P3's required capability |
| **4** | Is `historical_recall_doorways` in scope? | **No.** Retained in MIPA as a future policy candidate. Phase 0 decides one thing only: **default — no automatic historical doorway.** The first recall capability is member-invoked recollection, not proactive resurfacing | P5's scope boundary |
| **5** | Does endorsement withdrawal leave a trace? | **Yes.** The edge is closed (`valid_to`), never erased. The trace is provenance, not conversational content, and creates no speaking eligibility | P3 disposition (a), §3.5 |

### 6.1 Design target carried forward

> **A sovereignty property should remain true even when a future developer misunderstands its purpose.**
> Where practical, invalid states should be **unrepresentable rather than merely discouraged.**

This is why endorsement is an edge on an immutable class rather than a state transition (§3.4), why validity edges live in their own relation rather than as columns (§7.1), and why every P1–P6 acceptance is a closed-set check rather than an enumerated list.

## 7. Contradictions and dependencies — adjudicated

> **⚖️ All eight resolved 2026-09-02.** Rulings recorded inline below.

| § | Ruling |
|---|---|
| 7.1 | **Approved.** Validity is a relation with its own provenance, never a property column |
| 7.2 | **Approved as a new Grade-A target invariant.** Validity edges govern participation; they are not participants |
| 7.3 | **Resolved.** RETRACT is reversible by member act; DECLINE stays permanent. They are two gestures |
| 7.4 | **Approved.** Amends MIPA §2.4. Temporal scoping, not filtering |
| 7.5 | **P3 repair authorized in principle**, execution gated behind P2 — and the repair is **exclusion, not relabelling** |
| 7.6 | **Limitation accepted.** No automatic proposition extraction |
| 7.7–7.8 | Carried into migration prerequisites (§9) |

### 7.0 The derived separation

Five layers, none of which may be collapsed into another:

```
   CONTENT                 what was said / inferred / established
   VALIDITY RELATIONS      how its truth or temporal standing changes
   PARTICIPATION RELATIONS whether it may enter future MAIA cognition
   PROVENANCE              who authored each object and each relation
   TIME                    when each was valid or operative
```

> **The history of the member's sovereignty over memory must not itself become an involuntary source of conversational intimacy.**

---

### 7.1 Validity edges cannot be columns — they must be their own relation

**Contradicts**: the natural implementation instinct, and the one existing precedent.

`developmental_memories.valid_to` is the system's only supersession mechanism, and it is a column. That works for one table and **cannot generalize**:

- A `valid_to` on `conversation_turns` is meaningless. A turn is already temporally scoped by its own `created_at` and asserts nothing about the present — *"the member said X at T"* does not expire.
- CORRECT and CHANGE have **different effects on the same field**, so one column cannot carry both.
- An edge has an **author**, and the standing rule (P4) makes that author load-bearing. A column has no author.

**Requirement**: validity is an **edge relation** — `{source, target, kind ∈ {corrected_by, superseded_by, retracted_by}, authored_by, authority_class, valid_from, valid_to}`. `developmental_memories.valid_to` becomes a legacy expression to reconcile, not the pattern to extend.

### 7.2 Validity edges are provenance, never content

**Generalizes** the endorsement-trace rule (§3.5) to every relation.

MAIA must not say *"you corrected yourself about New Orleans in March."* The edges are exactly the artifact a naive composer would surface as "continuity," and doing so would turn the member's exercise of sovereignty into conversational material.

> **INVARIANT — Validity edges govern participation; they are not themselves participants.**

**Registry-shaped**: *"No validity edge reaches cognition"* — **Grade A**, enforced by absence of any reader piping the edge relation into a composer. Structurally identical to R02 (`integration_passes` / `agent_runs` have no readers). **Hostile fork must change**: add such a reader.

> **⚖️ APPROVED as a Grade-A target invariant.** The relation layer may determine what is valid, as of when, under whose authority, what is eligible, what has been superseded, retracted, or endorsed — and **none of that automatically becomes material available to the speaking model.**
>
> The certified structural shape:
>
> ```
>    validity store  →  resolution / adjudication  →  ✗ no general composition reader
> ```
>
> A future developer wishing to conversationalize validity history must introduce a new reader and cross an explicit architectural boundary. A member-facing history/audit surface may later make these relations **deliberately** inspectable — that is a different act from making them ordinary MAIA context.

### 7.3 Is RETRACT reversible — and does that conflict with R07?

**Dependency, unresolved.**

RETRACT is a sovereignty claim (§3.3), and sovereignty ordinarily includes changing one's mind. But its shipped narrow instance is **permanent**: R07 certifies that *"a declined practitioner observation never resurfaces (decline = release),"* and `declineObservation` is COALESCE-idempotent — the census recorded that a rejection **permanently releases** the atom.

Two readings, and they are not compatible:

- **Permanence is the protection.** A member who declines must be able to trust that declining ends it. Reversibility weakens R07 from A toward B and reintroduces the pressure the release was designed to remove.
- **Permanence is a trap.** A member who retracts something and later wants it back has no path, and the system has made an irreversible decision on their behalf out of an abundance of caution.

> **⚖️ RESOLVED — the recommended distinction is adopted. They are two gestures.**
>
> **DECLINE** — *"do not retain this offered participation opportunity."* Narrow, permanent, idempotent. R07's semantics stand unchanged; a declined offer does not resurrect automatically.
>
> **RETRACT** — *"this existing object may no longer participate."* Reversible, but **only through another explicit member act**:
>
> ```
>    object
>       ├── RETRACTED_BY ──► member act at t1
>       └── RESTORED_BY  ──► member act at t2
> ```
>
> Restoration does not erase the retraction. Both acts remain in provenance history; participation eligibility resolves **temporally**, exactly as validity does (§7.4).
>
> ```
>    DECLINE ≠ RETRACT     RETRACT ≠ DELETE     RESTORE ≠ recreate
> ```
>
> **The member may change their mind about participation without rewriting what happened.**

### 7.4 Validity resolution is temporal scoping, not filtering — refines MIPA §2.4

**Changes something previously specified.**

MIPA §2.4 states that stage 3 *"emits at most one `current` representation per resolved claim."* Under the CHANGE relation that is **correct for present-tense questions and wrong for past-tense ones.**

A CHANGE-superseded representation is not invalid — it *remains historically valid* for the period it held. So:

```
   "Do I still want to leave?"        → the current representation
   "What did I think a year ago?"     → the SUPERSEDED representation is the correct answer
   "How have I changed about this?"   → both, plus the relation between them
```

The third is the Spiralogic case, and it is unreachable if validity is a filter.

> **Requirement**: stage 3 resolves validity **as of a time**, defaulting to now. A W1 warrant may carry a temporal scope alongside its subject scope, and CORRECT-invalidated material is excluded at every time while CHANGE-superseded material is excluded only from the present.

> **⚖️ APPROVED — amends MIPA §2.4.** The resolver answers: *what representation is valid for the temporal scope of the present question?* Default scope is NOW. The "emit one current representation" rule is replaced: correct for present-tense questions, insufficient for historical and developmental ones, where multiple temporally situated representations may be required.

This is the mechanism behind the founder's closing observation — *this was true of you then, this became true later, and this is how you now understand the movement between them.*

**And it is not merely a memory feature. It is what prevents "growth" from becoming historical falsification.** The wrong model is `old self → replaced by new self`. The right one:

```
              ┌─ wrong then ───── CORRECT
   old state ─┤
              └─ true then ────── CHANGE ─────► new state
```

That is what gives MAIA the possibility of **distinguishing error from transformation.**

### 7.5 P3's repair is not behavior-neutral

**Dependency requiring separate authorization.** Detailed in P3 above.

Every other prerequisite adds member capability without altering what MAIA receives. P3 cannot: `developmental_memories` reaches the live prompt today as interpolated content, protected only by a Grade-C instruction. Satisfying P3 means labelling the class or removing a live prompt influence.

**Consequence for sequencing**: P3's *specification* is in scope now; P3's *repair* needs an authorization that Phase 0 approval does not by itself confer.

### 7.6 There is no proposition layer — CORRECT is coarse

**Accepted limitation, recorded so it is not discovered later.**

CORRECT operates on claims (§3.1), but MIPA has no mechanism that extracts claims from objects. A single turn may contain several. Correcting *"I said I hated New Orleans"* when the turn also said three other things means the edge targets the whole turn.

Building a proposition-extraction layer would be **interpretive machinery about the member's speech** — the exact category MIPA constrains everywhere else, and it would require MAIA to decide what the member's claims *were*.

**Phase 0 accepts the coarse form**: edges target whole objects, interpreted as scoping propositional content, never occurrence. Finer granularity, if ever needed, must come from a **member act** ("correct this part"), never from extraction.

### 7.7 Two mechanisms will briefly express participatory authority

**Dependency, benign but must not be forgotten.**

`member_memory_atoms.member_response_status = 'rejected'` (R07) expresses participatory withdrawal **as a column on the object**. §7.1 requires the general form to be an **edge**. Until a later phase reconciles them, two mechanisms express one authority.

Reconciling them **would alter live return behavior** and is therefore out of scope. **Requirement**: any edge relation must treat the existing column as authoritative where it is set, so the two can never disagree about the same atom. Recorded as a migration prerequisite (§9).

### 7.8 The four authority kinds have one column between them

**Observation, not yet a contradiction.**

The current schema expresses participatory authority (`member_response_status`, `return_preference`) and nothing else. Epistemic, developmental and interpretive authority have **no representation at all** — which is consistent, since the gestures do not exist.

The risk is a schema that grows one column per gesture and re-collapses the four kinds by accident. **Requirement**: the authority kind is a first-class field on the edge relation, not implied by which column was written.

---

## 8. Phase 0 exit criteria

Phase 0 is complete when **all six** hold:

1. P1–P6 each have a Refusal Registry row at **Grade A or B**.
2. Each row's **"hostile fork must change"** column names a concrete, visible diff.
3. Each row has a **falsification test** that fails when that diff is applied. *(A refusal you cannot test is a belief, not a property.)*
4. The **five** gesture primitives (§3.6) and the four authority kinds (§3.0) have settled semantics. ✅ **Adjudicated 2026-09-02.**
5. Each class is **either** provenance-labelled **or** formally excluded from retrieval eligibility. No class is in an undetermined state.
6. The **fail-closed behavior** of every row is exercised by a test, not only its success path.
7. The validity-edge invariant (§7.2) — *edges govern participation, they are not participants* — has a Grade-A registry row.
8. §7.3 (RETRACT reversibility) is settled, and §7.5 (P3 repair authorization) has been separately granted or P3 is dispositioned as exclusion.

**Only then does Phase 1 (canonical seam) become authorized.**

> **Nothing in Phases 1–7 may begin while any P1–P6 row is below its acceptance grade.** The parity problem worsens with every capability added upstream of the seam, and the sovereignty problem worsens with every increase in reach — so the ordering is not a preference.

---

## 9. Migration prerequisites

Conceptual only. No migration is authorized, written, or named.

| Concern | Requirement |
|---|---|
| **Ordering** | Any P3 provenance columns must land **before** any reader. The census records the inverse failure twice: `episodic_recall_enabled` shipped a reader ahead of its surface (P2), and the atoms `member_response_status` migration header warns *"Schema + reader ship together — never deploy this loader ahead of that migration."* |
| **Idempotency** | Per PR #559 precedent — migrations in this repo must be re-runnable. |
| **Backfill** | Any P3 backfill is a **separate, reversible, auditable** step from the schema change, with its policy (§6.3) stated in the migration header. **Never bundled into the DDL.** |
| **Fail-closed on missing column** | A reader whose column is absent must fail to **empty**, matching existing loader convention (`memoryLoaders.ts` catch → `[]`), never to permissive. |
| **Gate coupling** | Any new consent column is added to the writable set **in the same release** as its reader — this is P2's invariant applied to its own implementation. |
| **Release gate** | P1–P6 touch member content, atoms, episodes and consent surfaces. The Co-Lab Release Gate applies: `verify-colab-boundaries.ts` must pass **31/31** in production before any tester wave. |
| **Dual-mechanism safety** | Any validity-edge relation must treat `member_memory_atoms.member_response_status` as authoritative where set, so the column and the edge can never disagree about one atom (§7.7). |
| **Edge relation, not columns** | Validity is a relation with an author, not a column (§7.1). `developmental_memories.valid_to` is a legacy expression to reconcile, never the pattern to extend. |
| **Deploy lane** | Immutable-SHA path only (`docs/ops/IMMUTABLE_SHA_DEPLOY.md`). Not authorized here; recorded so it is not rediscovered. |

---

## STOP

**P2 is complete and certified. Nothing else has been touched.**

| | |
|---|---|
| **P2** | ✅ Executed · **Grade A** · Refusal **R23** · 10/10 with five verified hostile-fork failures |
| **P1, P3, P4, P5, P6** | Specification only — not repaired |
| Member gestures | Not added to any UI |
| `historical_recall_doorways` | Not created |
| Runtime-context seam | Not promoted |
| Semantic retrieval / history embedding | Not activated |
| Prompt composition · live return behavior | Unchanged |
| Clients · deployment | Untouched |

**Presented for review before P3:**

1. **P2's certification evidence** (§4.P2-E) — the method Kelly asked P2 to prove: a closed set drawn where the defect originates, a Grade-A structural property, and five falsification mutations each verified failing.
2. **A third gate found by the method, not by inspection** — `recurrence_recall_enabled`, parked in `DECLARED_UNREAD_GATES` under a falsifiable zero-readers condition rather than exposed, because a toggle for an unwired layer would be a UI claim without verified state.
3. **P2b, recommended and deliberately not taken** — `episodic_recall_enabled` is writable by API and still not discoverable in the settings surface. Adding the toggle would have crossed the standing not-authorized line, so it was left for explicit authorization.
4. **Two verification gaps stated plainly** — `npm run typecheck` and `npm run preflight` could not run here (minimal dependency set); one adjacent test fails **pre-existing**, verified identical on a clean tree.

**P3 remains authorized in class and gated on this evidence.** Awaiting review before it executes — and per §7.5, its repair is **exclusion from canonical composition**, not a better label on the same live prime.
