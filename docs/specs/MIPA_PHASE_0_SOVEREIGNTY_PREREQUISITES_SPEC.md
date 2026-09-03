# MIPA Phase 0 — Sovereignty Prerequisites Specification

**Status**: **P1a, P1b, P2 and P3a–P3e executed and certified**; **P3-CSC performed (outcome C)**. P3 known surfaces COMPLETE; global Grade A deferred to the canonical seam. P4–P6 and P2b remain specification only.
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

> ### ⚖️ P1 STATUS
>
> | | |
> |---|---|
> | **P1a — Export Truthfulness / Failure Integrity** | ✅ Certified · Grade A (scoped) · 19/19 |
> | **P1b — Sovereign Corpus Classification** | ✅ Certified · Grade A (scoped) · 19/19 |
>
> **P1 is proposed COMPLETE**, with one standing obligation surfaced rather than silently chosen: **26 representations are owed to the member; 4 are reached today.** Closing that is a product decision the covenant permits either way.
>
> ### ✅ P1a — 2026-09-02 · **Grade A (scoped)**
>
> `__tests__/mipa-p1-export-coverage.test.ts` — **19/19**, six mutations verified failing, application witnessed by operative-occurrence delta.
>
> **Scope**: P1 certifies the export **cannot lie**. It does **not** certify that the export is **complete** — see the ledger below.

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

### P1-E — Execution record

#### The defect, worse than the census recorded

My own census stated that `/api/members/export-data` **covers** `developmental_memories`. **It did not.** The query named five columns that do not exist — `event_type`, `cognitive_level`, `intensity`, `content`, `created_at` — so it threw on every call, and a `.catch(() => ({ rows: [] }))` written for a **missing table** silently swallowed a **broken query**.

The member downloaded a file named `maia-data-export-<date>.json` containing `"memories": []`, with no way to tell the section was empty because the read failed rather than because they had nothing.

> **An export that silently omits is worse than one that openly does not cover.** The first is a false claim about the member's own record — in the one surface whose entire purpose is telling the member the truth about what is held.

A **second instance** had a worse shape still: a failed `google_calendar_credentials` read rendered `connected: false`. Not an omission — a **false statement about their account**. Its table and all three columns exist, so that catch guarded nothing while standing ready to convert any failure into a wrong answer.

#### The repair

Columns corrected. Both catches now distinguish **failure** (`null` rows) from **absence** (`[]`) and surface an explicit member-readable error; Google reports `connected: 'unknown'` with a note that it does *not* mean disconnected. A section may be empty; it may never be **silently** empty.

#### The coverage ledger — quantified, not forgotten

A source-derived scan of member-scoped SELECTs across `lib/maia`, `lib/memory`, `lib/anchor` and `lib/psyche`, filtered against the real schema:

| | |
|---|---|
| Member-scoped tables read by memory modules | **37** |
| Tables the export covers | **5** |
| Gap | **32** |

The census recorded five omissions. The derived topology says the gap is an order of magnitude larger — **and that one of the five "covered" tables did not work.**

Pinned as a ledger assertion so the number cannot drift without a deliberate edit. **Closing it is a product decision** between widening export coverage and narrowing retrieval-eligibility — P1's fail-closed rule permits either, and choosing is not this repair's to make.

#### Falsification — six mutations, all verified failing

| # | Mutation | Result |
|---|---|---|
| F1 | Reintroduce a fictional column | ❌ 3 failed |
| F2 | Restore the blanket silent catch | ❌ 2 failed |
| F3 | Remove the memories error branch | ❌ 3 failed |
| F4 | Make the google branch unreachable with a constant guard | ❌ 1 failed |
| F5 | Rename a covered table out of the export | ❌ 1 failed |
| F6 | Swap the memories guard to a constant | ❌ 2 failed |
| — | Restored | ✅ **19/19** |

> **Two of six initially passed, one root.** F4 kept every expected string and made the branch unreachable with `false ? … : …` — **presence of text says nothing about reachability**. The suite now pins the **operative discriminant** rather than its wording. And the application probe reported `APPLIED: False` for a mutation that had applied, because the repair's own docblock contains the identifier it searched for; application is now witnessed by **operative-occurrence delta** over comment-stripped source.
>
> A third instance of the standing hazard also appeared: the silent-catch scan fired on the docblock **quoting the defect it forbids**. Comment-stripping is now a boundary control that asserts both directions — present in prose, absent in code.

---

### P1b-E — Sovereign Corpus Classification · execution record

#### The covenant, ratified

> **MAIA may not have durable participatory access to a representation about the member that the member has neither meaningful access to nor meaningful sovereignty over.**
>
> *MAIA's durable participatory corpus ⊆ member-governable corpus*

Operational/security state and fully regenerable artifacts may be exempt — **exemption never confers additional epistemic or participatory authority.**

#### Not an export specification

The 37-table figure is a **discovery set**. A table is an implementation object; the member is owed an account of the **representations** held about them.

> Data portability is not sovereignty if the machine exports tables the member cannot understand while quietly retaining unexported interpretations that affect the relationship.

#### The classified corpus — 37 discovered, 40 classified

| Class | Count | Disposition |
|---|---|---|
| `CANONICAL_MEMBER_RECORD` | **16** | export required |
| `SYSTEM_REPRESENTATION_ABOUT_MEMBER` | **10** | inspectability required before participation may exceed exclusion |
| `DERIVED_IMPLEMENTATION_ARTIFACT` | **3** | raw export not required |
| `OPERATIONAL_OR_SECURITY` | **1** | never dumped as memory |
| **`UNKNOWN`** | **10** | **fails closed** |

Every entry carries **write-path evidence**. None is classified by name.

#### Representation-sensitive, not table-sensitive

Three sources carry member- and system-authored fields **in one row**:

| Source | member-authored | system-authored |
|---|---|---|
| `member_daily_anchors` | `response` | `prompt_shown` |
| `member_lens_passes` | `member_response` | `prompt`, `lens` |
| `bardic_cues` | `user_words` | `cue_type`, `metadata` |

A table-level verdict on any of them would **either discard the member's own words or launder the system's framing into their record.**

#### UNKNOWN is a verdict, not a gap

Ten sources, including **two with no writer anywhere in source** (`episode_links`, `state_vectors`). *"Nothing writes it"* is evidence that this tree cannot say — **not** evidence that it is empty. UNKNOWN is neither export-required nor export-exempt, and may carry no participation gate.

#### Two findings

**`member_sessions` is exported today and holds a machine-generated summary.** It is owed to the member *and* must not read as their own account. Classification makes that visible; the logical-object contract is where it gets labelled.

**Classification grants nothing.** It is a sovereignty statement, not a gate — the module has no runtime consumer, asserted so it cannot become a filter by accident.

#### The standing obligation

**26 representations owed · 4 reached today.** Surfaced for adjudication rather than chosen silently: the covenant permits widening export *or* narrowing participation.

#### Falsification — seven mutations, all verified failing

| # | Mutation | Result |
|---|---|---|
| **G1** | A **real** new member-scoped source appears unclassified | ❌ 1 failed |
| G2 | Delete a classification while its source is discovered | ❌ 3 failed |
| G3 | Reclassify a machine representation as canonical member record | ❌ 1 failed |
| G4 | Make `UNKNOWN` export-exempt | ❌ 1 failed |
| G5 | Give an `UNKNOWN` source a participation gate | ❌ 1 failed |
| G6 | Classify credentials as exportable memory | ❌ 3 failed |
| G7 | Strip a mixed-authorship annotation | ❌ 1 failed |
| — | Restored | ✅ **19/19** |

> **G1 — the load-bearing one — initially passed.** The probe used `bardic_reentries`, which does not exist in the schema, so the filter correctly ignored it and nothing changed. **The mutation was invalid, not the gate.** Re-run with a real table and witnessed by **discovery-set delta 37 → 38**, it fails. *An `APPLIED: True` measured on text presence is not an application witness* — the meta-invariant applied to itself again.

---

### P1c-E — Sovereign Corpus Disposition · execution record

> ### ✅ P1 COMPLETE — 2026-09-03 · founder closure
>
> ```text
> P1a  Export truthfulness / failure integrity     ✅
> P1b  Sovereign corpus classification             ✅
> P1c  Enforceable corpus disposition              ✅
> ───────────────────────────────────────────────────
> P1    COMPLETE
> ```
>
> **The claim is bounded and stays bounded.** P1 is complete *within the
> source-derived member-memory corpus*: 40/40 logical representations carry an
> enforceable disposition. It does **not** mean every piece of member-related
> data anywhere in the repository has been classified.
>
> Operative ledger: **27 EXPORT · 13 EXCLUDE · 1 INSPECT · 2 EXEMPT · 0
> unresolved blockers.** A representation may carry more than one disposition,
> so these counts are not expected to sum to 40.
>
> **Accepted with the closure:** the field-level classifications; the
> `state_vectors` correction (widened write-path discovery changes the CURRENT
> classification, while the earlier P1b witness remains historically true for the
> tree it ran on); the refusal of exemption for `conversation_memory_uses` and
> `memory_links`; and the safe-direction reachability rule — *proven
> non-reachability may support EXCLUDE; mere presence in a dependency closure is
> never proof of participation.*

> ### ✅ P1c CERTIFIED — 2026-09-02 · **Grade A (scoped)** · Refusal **R28**
>
> Certification: `__tests__/mipa-p1c-sovereign-disposition.test.ts` — **52/52 passing**, with **ten hostile mutations verified failing**, each application confirmed by a structural witness, each reverted, and the restored suite re-run green.

#### What P1b left open

```text
CLASSIFIED  ≠  MEMBER-ACCESSIBLE  ≠  MEMBER-GOVERNABLE  ≠  PARTICIPATION-EXCLUDED
```

P1b said what the 40 representations are and deliberately had no runtime authority. P1c assigns each one an **enforceable** disposition and makes the export a function of that ledger.

#### The policy — derived, not inherited from the class counts

P1b's preliminary arithmetic was *"16 canonical + 10 system = 26 owed."* That is a class count. The obligation is derived instead:

| Class | Rule applied |
|---|---|
| `CANONICAL_MEMBER_RECORD` | `EXPORT`, always |
| `SYSTEM_REPRESENTATION_ABOUT_MEMBER` | `EXCLUDE` alone suffices **only** where every reader inside the live composition closure is covered by a certified exclusion. Otherwise the covenant closes on the **access** side: `EXPORT`, with authorship and epistemic class stated |
| `DERIVED_IMPLEMENTATION_ARTIFACT` | `EXEMPT` requires **all three** proofs. A historical log is not regenerable, so two of the three do not qualify |
| `OPERATIONAL_OR_SECURITY` | `EXEMPT` from MAIA-memory export; truthful connection **state**, never the secret |
| `UNKNOWN` | no permissive default — certified non-participation, or an unresolved P1 blocker |

#### The real obligation, after policy

| | |
|---|---|
| Representations disposed | **40 / 40** |
| `EXPORT` | **27** — 23 newly wired as logical objects · 4 served by the pre-existing sections |
| `EXCLUDE` | **13** — 11 by reachability · 2 by certified gate |
| `INSPECT` | **1** |
| `EXEMPT` | **2** |
| Unresolved P1 blockers | **0** |

**The standing obligation is now 27 owed · 27 reached**, replacing *"26 owed · 4 reached."* The preliminary figure was a class count used as policy; this one is the obligation the policy actually produces.

#### How non-participation is proven, and where the ceiling is

Exactly two bases are accepted:

- **`certified_gate`** — a named refusal whose certification suite exists on disk and covers the reader.
- **`not_reachable`** — no module reading the representation lies in the import closure of the declared live composition entry points. Sound in the **safe** direction: with no import path, there can be no call. The closure is recomputed by the suite, so adding one import flips the verdict.

`not_reachable` is an over-approximation the other way: **a module being in the closure is not proof that it composes.** That is the P3-CSC ceiling (outcome C) restated, and P1c never converts in-closure into an exclusion claim. Such a representation is closed on the access side instead.

#### Three findings

**1 — `breakthrough_moments` had a third composer.** R25 closed the `MemoryBundle` path and P1c closes the `RelationshipMemoryService` path; `lib/memory/MemoryOrchestrator.ts` composes a `RECENT BREAKTHROUGHS` block from `BreakthroughStore` and is imported by `lib/sovereign/maiaService.ts`. Neither prior claim was wrong — both were correctly scoped per-path — but **the representation kept participating**. This is why disposition attaches per representation and not per path. Non-participation is therefore not claimable for it, and the covenant closes on the access side.

**2 — `state_vectors` was misclassified, and the defect was in the instrument.** P1b recorded it as UNKNOWN on the evidence *"NO WRITER FOUND in source."* The writer search matched `INSERT INTO <table>`; the table is written through the `insertOne('state_vectors', row)` helper. **Thirty-four tables are written by that helper family and were invisible to the scan.** The real path is fully establishable — MAIA emits a fenced `STATE_VECTOR` block in its own response, `parseStateVector` reads it back, `storeStateVector` persists it — so it is a MAIA-authored inference and is reclassified `SYSTEM_REPRESENTATION_ABOUT_MEMBER`. The widened search was then applied to the whole UNKNOWN set, not only to the entry that improved the numbers: `episode_links` remains genuinely writer-less and its UNKNOWN verdict stands on corrected evidence. **Revised distribution: CANONICAL 16 · SYSTEM 11 · DERIVED 3 · OPERATIONAL 1 · UNKNOWN 9.** The P1b execution record above stands as written for the base it ran against; this is a correction recorded, not a rewrite.

**3 — Two "derived artifacts" do not qualify for exemption.** `conversation_memory_uses` (which memories were retrieved into which turn) and `memory_links` (an assertion that two of the member's memories are related) are historical records: not regenerable from a sovereign source, and the second is an independent claim. `EXEMPT` is refused for both and they are exported. Only `living_field_affinities` satisfies all three conditions.

#### Capability contraction, quantified

`formatRelationshipMemoryForPrompt` composed four things on the live FAST path — and more at DEEP, which loads `includePatterns: true`, `maxThemes: 10`, `maxBreakthroughs: 5`:

| Composed before | Source | After |
|---|---|---|
| `summary` — raw recurrence fact + member's name | member encounter record | **kept** |
| `themes` | `conversation_themes` (machine-detected) | removed |
| `recentBreakthrough` | `breakthrough_moments` (machine-extracted, verbatim) | removed |
| `emergingPatterns` | `relationship_patterns` (machine-inferred) | removed |

It is a **partition, not a removal**. The 2026-08-14 founder ruling already disciplined the summary — the raw recurrence fact may be stated, the derived relational label may not — and that ruling is untouched. The formatter now takes `CertifiedRelationshipMemory`, so reaching a machine inference from it is a **type error**, not an omission a reviewer must notice.

#### Falsification — ten mutations, all verified failing, each with a structural witness

| # | Mutation | Witness (before → after) | Result |
|---|---|---|---|
| M1 | A new representation added to the census, never disposed | corpus entries 40 → 41 | ❌ 2 failed |
| M2 | `EXEMPT` claimed with an empty regenerability proof | exemption-proof chars 468 → 369 | ❌ 1 failed |
| M3 | A canonical member record dropped from `EXPORT` | `not_reachable` claims 12 → 13 | ❌ 2 failed |
| M4 | Exclusion cites a certification suite that does not exist | suites existing 2 → 1 | ❌ 1 failed |
| M5 | The certified view regains a machine-detected field | certified-interface fields 3 → 4 | ❌ 1 failed |
| M6 | An `UNKNOWN` representation relabelled as member testimony | `authorityClass: 'unresolved'` 1 → 0 | ❌ 2 failed |
| M7 | A credential column added to an export spec | forbidden columns 1 → 2 | ❌ 2 failed |
| M8 | A failed read returns `[]` instead of `null` | null-on-failure 1 → 0 | ❌ 1 failed |
| M9 | A fictional column enters an export spec | spec select columns 205 → 206 | ❌ 1 failed |
| **M10** | A `not_reachable` module imported into a live composer | **closure size 391 → 393, contains `SelfletChain` false → true** | ❌ 2 failed |
| — | Restored | content-identical to snapshot | ✅ **52/52** |

Every run reported a nonzero test total, so none is the R26 failure mode where a suite that did not compile is mistaken for a falsification result.

> **An instrument defect found in the harness, not the gate.** The first falsification run restored mutated files with `git checkout --`. Two of the P1c artifacts are new and untracked, so the restore both failed *and* silently reverted an unrelated tracked file to `HEAD`, discarding the corpus correction. The next run's baseline showed four failures with no mutation applied — the tell. Restoration is now **content-snapshot based and verified by content**, because a restore that cannot see part of the tree is not a restore.

#### What P1c did NOT prove

- It does not prove that any in-closure representation composes, only that non-participation is not claimable for it. That asymmetry is the P3-CSC ceiling and it is stated rather than worked around.
- It does not build correction, endorsement or retraction. Where those are absent, Phase 0's standard is access plus appropriate exclusion, and that is what was delivered.
- `INSPECT` is claimed for exactly **one** representation, because exactly one has an authenticated member-scoped route serving it. The rest satisfy the covenant by export, not by a surface that does not exist.

---

### P3f-E — BreakthroughStore / MemoryOrchestrator composition exclusion · execution record

> ### ✅ P3f CERTIFIED — 2026-09-03 · **Grade A (scoped)** · Refusal **R29**
>
> Certification: `__tests__/mipa-p3f-breakthrough-orchestrator.test.ts` — **34/34 passing**, with **ten hostile mutations verified failing**, each application confirmed by a structural witness, each reverted by content snapshot, and the restored suite re-run green.

#### Why P3 reopened, and why this is not a resumed hunt

P1c's authorized work established a live composition path for a representation whose epistemic status was already settled:

```text
breakthrough_moments → BreakthroughStore → lib/memory/MemoryOrchestrator.ts
    → "RECENT BREAKTHROUGHS" → MAIA cognition
```

R25 was never wrong. It gated `MemoryBundle` and **scoped its claim to that reader**. The lesson is structural and generalizes past breakthroughs: *a gate placed inside one reader can be walked around by opening a second one.*

```text
known/enumerable surfaces COMPLETE AS OF P3e
        ↓
new exposure discovered during P1c
        ↓
P3f — repaired and certified
        ↓
known/enumerable exposures complete as of the current tree
```

The global architectural ceiling is unchanged and general exposure hunting was not resumed.

#### The three rights this record keeps apart

```text
I CAN SEE THAT MAIA HOLDS THIS       ← P1   breakthrough_moments: EXPORT
             ≠
MAIA IS ENTITLED TO THINK WITH THIS  ← P3   this record: EXCLUDED
             ≠
MAIA IS ENTITLED TO SAY THIS         ← MIPA speaking eligibility
```

P1c made every recorded breakthrough visible to the member. That closed the covenant on the access side and conferred **no** participation authority.

#### The repair — one boundary, no new policy

The rule is R25's, unchanged: *machine-detected · machine-extracted · unendorsed system inference → EXCLUDED.* What moved is its **location**. `lib/memory/breakthroughParticipation.ts` now holds the union and the adjudication; `MemoryBundle` re-exports it rather than declaring a rival; every reader consumes it.

| Reader | Before | After |
|---|---|---|
| `MemoryBundle.getBreakthroughs` | adjudicated locally (R25) | delegates to the shared boundary |
| `BreakthroughStore` × **3 methods** | raw `insight` | certified union — **including the two with no caller today** |
| `MemoryOrchestrator.formatRecallForPrompt` | composed verbatim | composes only through `admittedBreakthroughs` |
| `SignificantMomentsService` | raw `insight` → `## Breakthrough Moments` | adjudicated; `extractThemes` takes admitted only |
| `RelationshipMemoryService` | raw `insight` → summary | adjudicated |

The excluded arm of the union carries no `insight` and no `element`. Not a filter and not a flag — **the string never leaves the boundary**, so a downstream composer has nothing to render, rename, reformat, cast or summarise.

#### Two further findings

**1 — Two more live composers, found by P3f's own alternate-reader proof.** `SignificantMomentsService` emitted `## Breakthrough Moments` with the insight quoted verbatim (reached from `app/api/between/chat/route.ts`), and its `extractThemes` derived keywords from those insights — a derivation inheriting authority it could not have. Both are now adjudicated. These came from the proof obligation, not from resumed hunting.

**2 — A hole in P1c's own repair.** P1c partitioned `recentBreakthrough` out of the composed relationship block and **kept `summary`** as composition-eligible, on the 2026-08-14 ruling that the raw recurrence fact may be stated. But `generateRelationshipSummary` *builds* that summary, and it was interpolating `Recent insight: "<machine-extracted insight>"` directly into it. The representation P1c excluded from one field was travelling into the prompt inside another. Closed here.

#### Where the load-bearing gate is, and why not in the composer

`lib/memory/MemoryOrchestrator.ts` carries `// @ts-nocheck`. A type-level gate placed there would be **decorative** — the compiler is not reading the file. Removing the suppression would introduce four pre-existing diagnostics and fail the no-regression gate, which is scope beyond this repair boundary. So the gate sits at `breakthroughParticipation.ts`, which **is** type-checked, and the composer's behaviour is a consequence of that boundary rather than a promise made locally. Stated rather than glossed.

#### Falsification — ten mutations, all verified failing, each structurally witnessed

| # | Mutation | Witness (before → after) | Result |
|---|---|---|---|
| **N1** | `composer += rawBreakthrough.insight` — the direct read restored | orchestrator raw reads 1 → 3 | ❌ 5 failed |
| N2 | Alternate spelling — the same object under a different heading | orchestrator raw reads 1 → 3 | ❌ 1 failed |
| N3 | Cast-based bypass | orchestrator raw reads 1 → 2 | ❌ 1 failed |
| N4 | A derived COUNT over the excluded material | orchestrator raw reads 1 → 3 | ❌ 2 failed |
| N5 | The store hands out raw rows again | store adjudications 3 → 2 | ❌ 1 failed |
| N6 | An alternate reader un-adjudicated and self-admitted | `SignificantMoments` adjudications 1 → 0 | ❌ 2 failed |
| N7 | The excluded arm regains an `insight` field | excluded-arm fields 2 → 3 | ❌ 1 failed |
| N8 | A brand-new un-adjudicated reader of the representation | raw-insight readers 5 → 6 | ❌ 1 failed |
| N9 | The rule forked — a rival union beside the shared one | local unions 0 → 1 | ❌ 1 failed |
| **N10** | The P1c summary hole reopened | unsanctioned raw reads 0 → 2 | ❌ 2 failed |
| — | Restored | content-identical to snapshot | ✅ **34/34** |

> **N10 initially PASSED, and the defect was in the gate.** The mutation left the `admittedBreakthroughs(...)` line standing and simply read the raw array beside it — so a proximity check would have passed too. The repair had been made in the code and **never certified**: the single-read-path assertion was written for the orchestrator and not for the other two composers. *A repair without a gate is a state, not a property.* Both missing assertions were added, plus one that pins the summary builder's insight read to an accessor-bound identifier.
>
> A second instrument defect surfaced with them: the function-body slicer took `indexOf('{')` from the declaration and landed inside an **inline parameter object type**, reading a type annotation as executable code. It now balances the parameter list first.

#### What P3f did NOT prove

- It does not certify a codebase-global non-participation claim for `breakthrough_moments`. It certifies that every reader **in this tree** consumes the shared boundary, and that a new one fails **because it is new**.
- `app/api/maia/field/route.ts` still reads the raw insight. It is an **access** surface, not a composition path. *Founder correction, 2026-09-03:* "nothing imports it" is **not** evidence that an API route is unreachable — routes are externally addressable by construction. What the absence of importers establishes is narrower, and is all the claim needs: **no source module consumes its output**, so nothing re-enters MAIA cognition through an in-tree path. Participation would require evidence that it does. Its truthfulness, provenance framing and member-access semantics belong to **P1/access governance**, and P3 is not reopened on it without participation evidence.
- The global architectural ceiling (P3-CSC, outcome C) is untouched.

---

### P6-E — Doorway Consent Integrity · execution record

> ### ✅ P6 CERTIFIED — 2026-09-03 · **Grade A construction · Grade B on the cast arm** · Refusal **R30**
>
> Certification: `__tests__/mipa-p6-doorway-consent-integrity.test.ts` — **38/38 passing**, with **ten hostile mutations verified failing**, each application confirmed by a structural witness, each restored by content snapshot, and the restored suite re-run green.

#### The three properties this separates

```text
CONTENT AUTHORSHIP     Who said or wrote this?
         ≠
EPISTEMIC AUTHORITY    What kind of claim is it?
         ≠
RETURN AUTHORITY       Who authorized MAIA to resurface it?
```

> **A `contextual_doorway` return policy requires certifiable member-conferred return authority.** Not practitioner intent. Not system inference. Not "this seems useful". Not participation in the original session. Not absence of an objection. Not a column default.

#### Topology, derived from source before any repair

`return_preference` is a discrete persisted field on **one** table, `member_memory_atoms`, row-wide, `CHECK ∈ {member_pulled, contextual_doorway, ritual_review_opt_in}`. That makes the certification boundary every **assignment** of the permission — a far cleaner closed set than the P3 prompt problem.

| Writer | Actor | Before |
|---|---|---|
| `lib/psyche/portfolio.ts` — Keep `INSERT` | the member | **omitted the column** → inherited the DEFAULT |
| `app/api/studio/with-me/…/route.ts` — practitioner bridge | the facilitator, on a **different** person's material | **hardcoded `'contextual_doorway'`** |
| `lib/psyche/portfolio.ts` — `set_return_preference` | the member | the one member-conferred path |

Readers: the ambient loader (`return_preference IN ('contextual_doorway','ritual_review_opt_in')` — the participation gate), the affinity index, the member's own portfolio and workbench views. `member_pulled` means, in the schema's own words, *"only when member asks directly (most restrictive)"* (`20260521000001`). A member-facing assignment path **does** exist: the Sealed ↔ May return toggle on `/maia/keep-capture`. No copy, import or migration path reproduces the preference.

#### Two violations, not one

**1 — The known one.** The practitioner bridge collapsed *facilitator authored → system stores → MAIA may resurface* into a single hardcoded value. `facilitatorId` is the authenticated caller; the subject is `session.member_id` — a different person.

**2 — The one the topology pass found.** Migration `20260523000001` set the **column DEFAULT** to `contextual_doorway`. A column default does not know who is writing: *any* INSERT omitting the column inherited member-scale consent, whoever the actor was. A permissive default is a consent decision made by whoever wrote the schema and applied to everyone who ever writes a row.

#### The repair — the permission is unconstructable, not merely discouraged

`lib/psyche/returnAuthority.ts` holds a branded `AuthorizedReturnPreference` whose brand symbol is **not exported**: a module that cannot name the key cannot build the value. Two constructors, and only two:

- `memberConferredReturn(preference, evidence)` — **throws** unless `actingMemberId === subjectMemberId`. The check is on **identity, not role**, because a role allowlist is a thing that grows.
- `noContextualReturn(reason)` → `member_pulled`, and refuses an unstated reason.

`returnPreferenceValue()` is the only way out of the branded type, so a writer that wants a permission must hold an authorization to get one. **Grade B, stated:** a deliberate `as unknown as` cast can still forge one; that escape hatch is **detected** by the suite rather than claimed impossible.

The keep doctrine is preserved exactly. Member keeps still confer contextual return — now **stated at the write site** and constructed from the member's own identity, rather than inherited by omission:

```text
before: omit the column → contextual_doorway, whoever you are
after:  omit the column → member_pulled; the permission must be constructed
```

Migration `20260903000001` flips the default to `member_pulled` and backfills the practitioner-written rows.

#### The one decision with production-data consequences

The backfill resets `return_preference` to `member_pulled` for rows matching `source_type='practitioner_observation' AND generated_by='practitioner-observation' AND return_preference='contextual_doorway'`. These carry a live ambient permission no member conferred.

Could such a row instead reflect a member act? From the practitioner-written state the member's only available move is **Reseal** — and a resealed row is no longer in this set. The one indistinguishable case is a member who resealed and then re-allowed, and **no source-derived discriminator separates it**: `last_touched_at` is `NOT NULL DEFAULT now()`, so it does not record whether a gesture ever ran. The asymmetry decides it: leaving the rows keeps an unauthorized permission live and ambient; an over-broad reseal costs that member **one click** on an affordance that already exists — the same member-driven path `20260523000001` named for pre-existing material. Reversible by the member, never fabricating authority. Fail-closed, so it runs.

**Authorship is untouched.** `source_type`, `facilitator_id`, `provenance`, `epistemological_status` and `generated_by` are not modified by any statement in the migration, and the suite proves it against the `SET` clause specifically.

#### Anti-laundering, both directions

```text
authored_by = practitioner        may coexist with
return_authorized_by = member
```

Return authority is never inferred from authorship; authorship is never rewritten from return authority. The boundary type carries **no authorship field at all** — a datum it cannot see is a rule it cannot be tuned to break.

#### Capability contraction, quantified

| | Before | After |
|---|---|---|
| Practitioner observations | written with contextual doorway | written, attributed, epistemically framed — **no contextual return** |
| Any INSERT omitting the column | contextual doorway | `member_pulled` |
| Member Keep | contextual doorway (by default) | contextual doorway (**by member identity, explicitly**) |
| Member reseal / allow-return | worked | works, through the same boundary |

#### Falsification — ten mutations, all verified failing, each structurally witnessed

| # | Mutation | Witness (before → after) | Result |
|---|---|---|---|
| **Q1** | The practitioner hardcoding restored | bridge doorway literals 0 → 1 | ❌ 4 failed |
| Q2 | The Keep INSERT drops the column and inherits the default | column named 1 → 0; bound sites 3 → 2 | ❌ 2 failed |
| Q3 | The permissive default restored — every new atom gets doorway | resolved default `member_pulled` → `contextual_doorway` | ❌ 3 failed |
| Q4 | The identity check made unreachable (`false &&`) | guard expression changed | ❌ 2 failed |
| Q5 | A role allowlist added beside the identity check | guard expression changed | ❌ 2 failed |
| Q6 | A third constructor manufacturing member authority | exported constructors 4 → 5 | ❌ 1 failed |
| Q7 | A brand-new unclassified writer | assigners 3 → 4 | ❌ 2 failed |
| Q8 | A doorway flag copied from another object with no evidence | bridge doorway literals 0 → 1 | ❌ 3 failed |
| Q9 | The backfill widened, and it rewrites authorship | SET columns 1 → 2; predicates 2 → 0 | ❌ 2 failed |
| **Q11** | `undefined` treated as a contextual doorway | bound sites 3 → 2 | ❌ 2 failed |
| — | Restored | content-identical to snapshot | ✅ **38/38** |

> **Q11 initially PASSED, and it is the N10 lesson arriving a second time.** The binding check was written at FILE scope — *does `returnPreferenceValue` appear in this module* — and the mutation left the Keep site untouched so the name still appeared, while swapping the gesture site for `gesture.preference ?? 'contextual_doorway'`. **A repair present at one site and a check written at file scope certify nothing about the other sites.** Replaced with a per-site binding assertion covering all three, plus the generalizing rule that a permission literal may appear in executable code only as the argument a member's gesture hands to `memberConferredReturn`.
>
> Four detector defects were caught by the suite's own controls before the mutation pass: the assignment scan read `WHERE return_preference IN (…)` in the ambient loader as an assignment — **a reader classified as a writer**, which would have made the closed set meaningless, and the §7 innocent-negative control is what caught it; and the migration check's `SET[^;]*` ran through the `WHERE` clause and read a row **selector** as a mutation of authorship.
>
> One further observation: the pre-existing `__tests__/studio/with-me-complete.test.ts` asserts the register, the primary register and `crossing_allowed` on that same INSERT — **and never asserted `return_preference`.** The hardcoded permission shipped inside a well-tested statement.

#### What P6 did NOT do

- It did not create the member-facing doorway-consent gesture for practitioner material. Until the member has a way to say *"you may bring this back"*, nobody says it for them.
- It did not touch `member_daily_anchors.surface_preference`, which mirrors this vocabulary under **R08** and is a separate representation.
- It did not implement P4/P5. Their three gestures — correction/change, endorsement, contextual constraint — are product primitives whose interaction design is adjudicated before they become database mechanics.

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

> ### ⚖️ P3 STATUS — 2026-09-02
>
> | Sub-prerequisite | State |
> |---|---|
> | **P3a — Memory Orchestrator Inference Exclusion** | ✅ Certified · **Grade A (scoped)** · **R24** |
> | **P3b — Breakthrough Provenance / Participation** | ✅ Certified · **Grade A** (B for cast-bypass) · **R25** |
> | **P3c — MemoryBundle Developmental Bucket** | ✅ Certified · **Grade A** (B for cast-bypass) · **R26** |
> | **P3d — Member Web pattern / session-essence inference** | ✅ Certified · **Grade A** · **R27** · 26/26 · 6 mutations |
> | **P3-CSC — Closed-Set Certification** | ⚖️ **PERFORMED · OUTCOME C** (architectural ceiling), with a **B finding** (P3e) |
> | **P3e — continuity-summary topic derivation** | ✅ Certified · **Grade A** · 17/17 · 6 mutations |
>
> ### 🔴 P3 REMAINS OPEN. P3a's certification discovered a second live instance of its own failure class — `breakthrough_moments`, mixed authority, different composer — and that could not be demoted to an "upgrade path" merely because R24's detector did not cover it. P3's claim is not *"this one composer no longer leaks inference"*; it is:
>
> > **Material whose authorship/authority cannot be certified may not acquire participation merely by travelling through a memory composer.**
>
> ### ⚖️ P3 FINAL STATE — known/enumerable surfaces complete; global certification deferred
>
> ```
>    P3a  R24  certified          P3d  R27  certified
>    P3b  R25  certified          P3e       certified
>    P3c  R26  certified
>    ─────────────────────────────────────────────────
>    P3 known/enumerable surfaces        COMPLETE
>    P3 global Grade A                   ARCHITECTURAL CEILING
>                                        pending canonical seam
> ```
>
> **This is not an unresolved defect requiring endless manual census, and it is not a global Grade A.** Manual hunting for P3f, P3g, P3h is explicitly stopped: P3-CSC established *why* it cannot produce constitutional closure — another trace might find another defect, but the absence of a further discovery would still not prove absence.
>
> The remaining dependency is architectural: **canonical turn construction must make the full composition producer set structurally enumerable.** At seam promotion, P3 global certification is rerun against that new boundary.
>
> **Discovery enlarges the obligation; it does not shrink the claim.** Marking P3 complete while a discovered live path in its own failure class remains unadjudicated would collapse the distinction between *certifying a detector's scope* and *certifying a prerequisite's property* — the distinction this program exists to hold.

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

### P3a-E — Memory Orchestrator Inference Exclusion · execution record

**The repair is exclusion, not labelling** — as adjudicated. Attaching `authored_by: maia` to the developmental prime and leaving it in the prompt would have improved provenance while still violating participation.

| Change | File |
|---|---|
| **New** — the adjudicator: two-field provenance × endorsement → verdict | `lib/maia/participationGate.ts` |
| `DevelopmentalMemorySnapshot` / `ThemeSignalSnapshot` become **discriminated unions**; `directional_cue` exists only on the admitted arm | `lib/maia/types/memoryOrchestrator.ts` |
| Loaders adjudicate each row; claim is explicitly `null` | `lib/maia/memoryLoaders.ts` |
| Source selection admits only `participation: 'admitted'`; the one cue read sits behind the discriminant | `lib/maia/memoryOrchestrator.ts` |
| **New** — certification | `__tests__/mipa-p3-participation-gate.test.ts` |
| **New** — registry row R24 | `docs/architecture/REFUSAL_REGISTRY.md` |

#### The four required proofs

| # | Required | How it is met |
|---|---|---|
| **1** | The ungoverned `directional_cue` path is **structurally gone or Grade A/B guarded** | **Grade A.** The excluded arm of the union declares no `directional_cue`. Reading it without narrowing does not fail review — **it fails to compile** |
| **2** | Uncertified legacy material is **excluded, never guessed** | `developmental_memories` and `member_theme_signals` carry no provenance columns, so the loaders assert `ProvenanceClaim = null`. It is *very likely* MemoryWriteback authored every developmental row — **inferring that from the probable writer is exactly the guess the backfill policy forbids.** The gate excludes on absence of evidence, not on a supposition about authorship |
| **3** | Inference **cannot gain authority from age or repetition** | `ParticipationInput` has no `formed_at`, `recall_count`, `surfaced_count`, `last_recalled_at`, or `significance` field. A datum the adjudicator cannot see is a rule it cannot be tuned to break. Asserted by test §3 |
| **4** | A hostile fork reintroducing uncertified material **fails certification** | Verified below — at compile time *and* in the suite |

#### Falsification — six mutations applied, verified failing, reverted

| # | Mutation | Result |
|---|---|---|
| **M1** | **The mandated one** — `composer += developmentalMemory.directional_cue` | ❌ **`TS2339: Property 'directional_cue' does not exist on type 'DevelopmentalMemorySnapshot'`** *and* 1 test failed |
| M2 | Loader asserts `authoredBy: 'maia'` instead of leaving it uncertified | ❌ 1 failed |
| M3 | Add `formed_at` / `recall_count` to `ParticipationInput` | ❌ 1 failed |
| M4 | Drop the admitted-only filter in source selection | ❌ 1 failed |
| M5 | Read `directional_cue` from another module | ❌ 1 failed |
| M6 | Make the gate admit `provenance: null` | ❌ 2 failed |
| — | Restored | ✅ **18/18** |

**M1 is the acceptance test, and it fails harder than required.** The mandate asked that the mutation fail certification. It also fails the compiler — which is the difference between a gate that detects the violation and an architecture in which the violation cannot be written.

#### The behavior change, stated precisely

Authorized in advance, and **larger than the cue line alone**. Measured per call site:

| Route | Sources it could select | After P3 |
|---|---|---|
| **`/api/sovereign/app/maia/list`** (canonical live) | `developmental_memory`, `theme_signals` only — it passes `conversationHistory: []`, no `spiralState`, both context flags `false` | **both excluded → `selectedSources` empty → `shouldUseMemory: false` → the entire `## MEMORY INFLUENCE (runtime plan)` block no longer reaches the prompt** |
| `/api/sovereign/app/maia` | same shape | same — block gone |
| `/api/between/chat` | also `conversation_history`, `relationship_anamnesis`, `member_live_context` | block survives, **minus** the two inference sources and the cue line |

> ### ⚖️ AUTHORIZED CAPABILITY CONTRACTION (founder, 2026-09-02)
>
> **Canonical MAIA routes may temporarily exhibit less implicit developmental continuity, because previously participating inference lacks certifiable participation authority.**
>
> This is **not a MIPA regression.** Those routes were receiving their memory influence solely from sources now determined not to be constitutionally entitled to participate. Preserving the block so MAIA *"still feels remembering"* would preserve precisely the behavior P3 exists to prohibit.
>
> **Recorded so a future developer cannot legitimately restore the old block as a regression repair** — and the restoration is itself a hostile-fork case, pinned at `__tests__/mipa-p3-participation-gate.test.ts` §6, which reproduces the exact live-route input shape and asserts the block stays empty.

**Not touched**, per the mandate: developmental intelligence is not redesigned, no new developmental memory is generated, no endorsement UI, no P2b, no seam promotion, no historical retrieval, no unrelated memory class, no client wiring, no deployment.

#### Scope, stated narrowly (R23 precedent)

R24 closes the **memory-orchestrator** composition path. It does **not** cover `breakthrough_moments` — the third class named in P3's current state, which mixes member-marked and system-inferred rows with no separating column and travels a **different composer** (`MemoryBundle` → `formatForPrompt`), nor MemoryBundle's own developmental bucket. Applying the gate there is named in R24's upgrade path. **P3 is not "all inference is gated"; it is "this path is gated."**

#### Verification

> **Verification vocabulary (founder correction, 2026-09-02).** Do not describe repository-wide typecheck or preflight as *globally green* where the base branch itself is red. The accurate claim is **no-regression against the current dirty repository baseline** — which is sufficient evidence for a scoped repair, and is a different claim from a clean gate.
>
> ```
>   TYPECHECK DIFFERENTIAL          PREFLIGHT
>     baseline      239               overall            RED on base
>     branch        231               P2/P3-caused       NONE FOUND
>     new errors      0               remaining checks   PASS individually
>     regressions     0
> ```
>
> That distinction will matter when the baseline debt is repaired.

#### One detector note, again

The suite's first run failed on its own explanation: the check for *"the excluded arm declares no `directional_cue`"* sliced from the interface to the next export and swept in the docblock **describing** the property. Fixed in the detector, not the assertion — the same imprecision that made P2's scan read `setPreferences(` as a SQL write. **Two for two: the instruments needed falsifying before the properties did.**

---

### P3b-E — Breakthrough Provenance / Participation · execution record

**Discovered by P3a's own scope statement**, and adjudicated inside P3 rather than deferred: a second live path carrying the identical constitutional failure class.

#### Topology, established from source before any change

**Schema** — `breakthrough_moments` has **no provenance column of any kind**: `id`, `user_id`, `timestamp`, `insight`, `element`, `integrated`, `related_themes`, `conversation_id`, `created_at`, `updated_at`. Row-level authorship is therefore **not certifiable at read time**, whatever wrote the row.

**Writers** — three exist; exactly **one** is live:

| Writer | Callers | Character |
|---|---|---|
| `BreakthroughStore.addBreakthrough` | **0** | dead |
| `RelationshipMemoryService.saveBreakthroughMoment` | **0** (tests only) | dead |
| `MemoryWriteback.writeBreakthroughMoment` | **1** — `MemoryWriteback.ts:384-390` | **system inference end to end** |

The live one fires on `significance >= 0.5 \|\| isBreakthroughPattern(userMessage, assistantResponse)` and stores a machine-`extractInsight`ed string. **A computed threshold and a heuristic decide that a member had a breakthrough, and the machine writes the insight text.** No member act anywhere in the path.

**Composers** — three channels reached the prompt, not one:

| # | Channel | What it emitted |
|---|---|---|
| 1 | `breakthroughsToCandidate` → memory bullets | `• [breakthrough] <insight>` — verbatim |
| 2 | `recentBreakthroughs` → `⭐ RECENT BREAKTHROUGHS` | verbatim again, second channel |
| 3 | `breakthroughCount` + `dominantElement` | `N breakthroughs recorded (water dominant)` — an **aggregate claim** |

Channel 3 is the subtle one. An aggregate over uncertified inference is still uncertified inference — arguably worse, because a count reads as established fact while carrying no provenance a reader could interrogate. It is gated with the other two.

#### The five required proofs

| # | Required | How it is met |
|---|---|---|
| **1** | Ambiguous provenance cannot silently compose | Discriminated union; `insight`/`element` exist only on the admitted arm |
| **2** | Certifiable member-marked material is not collapsed into the inferred class | **Nothing member-authored is excluded, because no member-authored class exists here.** No writer in the repository can express member marking for this table; the member-marked breakthrough class is `member_memory_atoms.is_breakthrough` — schema-constrained member-only, on the atoms path, **untouched**. Pinned at §3 of the suite |
| **3** | No heuristic or default provenance backfill | The claim is `null`. Suite §2 asserts no `authoredBy: 'member'`, no `'testimony'`, and no derivation from content, wording, timestamps or writer identity anywhere in the gate region |
| **4** | Direct raw-composer bypass fails certification | Verified — and the *honest* bypass does not compile |
| **5** | Defaulting unknown provenance to member authority fails **hard** | Verified — mutation N2 |

#### Why the exclusion is robust rather than resting on the ambiguity

Both branches converge:

```
   live writer      → would be maia/inference even WITH a provenance column
                      → excluded as unendorsed
   legacy rows      → indeterminate
                      → excluded rather than guessed
```

The verdict does not depend on resolving which is which — which is what makes it safe to apply without knowing.

#### Falsification — five mutations, verified failing, reverted

| # | Mutation | Result |
|---|---|---|
| **N1** | **Mandated** — raw bypass, feed breakthroughs straight to the composer | ❌ the honest form is **`TS2339: Property 'insight' does not exist on type 'BreakthroughSnapshot'`**; forcing it needs an explicit `as any[]`, and then **2 tests fail** |
| **N2** | **Mandated** — unknown provenance defaults to `authoredBy: 'member'` | ❌ 2 failed |
| N3 | Snapshot counts excluded rows again | ❌ 5 failed |
| N4 | Prompt asserts `0 breakthroughs recorded` instead of omitting | ❌ 1 failed |
| N5 | Derive provenance heuristically from insight text | ❌ 3 failed |
| — | Restored | ✅ **18/18**, 0 `MemoryBundle` type errors |

**Grade, stated precisely**: **A** for the honest path (it does not compile); **B** for the cast-bypass (`as any[]` compiles, and the suite catches it). Not claimed as unqualified A.

#### Behavior change

On `/api/sovereign/app/maia/list` FAST and `/api/voice/stream-conversation`, the `⭐ RECENT BREAKTHROUGHS` block and every `[breakthrough]` memory bullet stop reaching the prompt, and the `🧠 RELATIONSHIP:` line loses its breakthrough clause entirely — **omitted, not zeroed.** Same authorized contraction as P3a, same anti-restoration reasoning.

#### Scope, stated narrowly

R25 closes the `breakthrough_moments` → MemoryBundle path. It does **not** close MemoryBundle's **developmental** bucket (`getSemanticMemories`, selecting from `developmental_memories` into the same `formatForPrompt`) — **a third live instance of P3's failure class**, recorded as open obligation in R25's upgrade path per the precedent this sub-prerequisite just set. Naming it here rather than discovering it later is the point.

---

### P3c-E — MemoryBundle Developmental Bucket · execution record

#### Topology, established from source before any change

| | |
|---|---|
| **Storage** | `developmental_memories` — **the same table as P3a** |
| **Column** | `content_text` — **the same column** P3a's `directional_cue` came from |
| **Reader** | `MemoryBundle.getSemanticMemories`, sole caller `build()` (`:222`) |
| **Live?** | **Yes** — `build()` runs on `/api/sovereign/app/maia/list`; its `formatForPrompt` output reaches the **FAST** tier as `memoryContext` |
| **Composition** | `• [developmental] <content_text truncated to 150>` — **verbatim** |
| **Provenance** | none at write time, none at read time |
| **Class** | **not** a second inference class — an **alternate reader** to material R24 already excluded |

> **The finding: R24's capability contraction was partially undone by a second reader on the same rows** — and reaching the prompt *more* directly than the prime R24 removed, since a bullet is verbatim content where the prime was a directional hint. This is exactly why "certify the detector's scope" and "certify the prerequisite's property" had to stay separate.

#### Repair: convergence, not a parallel mechanism

`adjudicateDevelopmentalRow` calls **the same `adjudicateParticipation`** P3a and P3b use. No second provenance model, no second adjudicator — an alternate reader must reach the *same* boundary, or the boundary is decorative. Pinned by §2 of the suite.

Both branches are gated, **including the doubly-dead vector branch** (unreachable when the non-vector branch returns rows; empty because `MemoryWriteback` writes `vector_embedding` NULL). Gated rather than deleted so that if embeddings ever appear the material cannot walk back in ungoverned.

#### Why the invariant is enforced at composition, not at read

The tempting form of *"no composer may bypass the certified representation and reread the backing store"* is a closed set over **readers** of `developmental_memories`. There are **~32 SQL touch-points across 13 files**, most legitimately non-composing: export, the patterns UI, feedback routes, stale-preference review. Gating all of them is the overbroad-detector failure that ends in a disabled gate.

The enforceable boundary is **composition**: every site constructing a `source: 'developmental'` candidate. That set has **exactly one** member, and §4 pins it — a second construction site fails *because it is new*, whatever it does.

> **Answer to the standing question**: the alternate-reader invariant belongs to P3 **locally**, in its composition-boundary form. Its read-boundary form is not enforceable at acceptable cost and would belong to the later canonical-seam work if ever.

#### Out of class, and why it matters

`turnsToCandidate` filters `role === 'user'` — the member's own words. Authorship is **structurally certifiable from the schema's `role` column**, not guessed. Member testimony is S2 under the lattice and legitimately composes. §5 pins that boundary so a future over-correction cannot sweep the member's own speech into the exclusion — which would be a constitutional failure in the opposite direction.

#### Falsification — five mutations, verified failing, reverted

| # | Mutation | Result |
|---|---|---|
| **C1** | Honest bypass — map `content` straight into a candidate | ❌ **`TS2339: Property 'content' does not exist on type 'DevelopmentalRowSnapshot'`**; forcing it needs a cast, then **2 tests fail** |
| **C2** | **Alternate reader** — a second composer builds developmental candidates | ❌ 1 failed (composition closed set) |
| **C3** | Parallel adjudicator instead of convergence | ❌ 4 failed |
| **C4** | Unknown provenance defaults to `authoredBy: 'member'` | ❌ 4 failed |
| **C5** | Ungate the dead vector branch | ❌ 1 failed |
| — | Restored | ✅ **25/25**, 0 `MemoryBundle` type errors |

*Recorded honestly*: C5's first attempt produced `Tests: 0 total` — the suite failed to compile, which is **not** a falsification result. Re-run as a compiling mutation before being accepted as evidence.

#### The fourth instrument defect

The suite's own `methodBody` extractor matched a bare method name and **never found `async getSemanticMemories`** — so every assertion about that method's body would have passed **vacuously**. False-green class again. The boundary controls written for R25 did not catch it because every method they exercised was synchronous. Fixed in the extractor, and `async` added to the boundary corpus in both R25's and R26's suites.

> **A control corpus is only as good as its coverage of modifiers, ordering and syntax variants.** Recorded in the registry's instrument rule.

---

### P3-SWEEP — the closing closed-set question

Per the adjudication, P3 may be marked complete only when the evidence supports the claim that **no further live path in its failure class remains.** The sweep was run over live memory composers. **It does not support that claim.**

| Composer | Material | Status |
|---|---|---|
| `buildMemoryPromptBlock` (orchestrator) | `developmental_memories`, `member_theme_signals` | ✅ R24 |
| `formatForPrompt` — breakthroughs | `breakthrough_moments` | ✅ R25 |
| `formatForPrompt` — developmental bullets | `developmental_memories` | ✅ R26 |
| `formatForPrompt` — turn bullets | `conversation_turns`, `role='user'` | ✅ out of class — authorship structurally certifiable |
| `formatAtomsForPrompt` | `member_memory_atoms` | ✅ out of class — member act, epistemic status carried |
| `formatPriorExchangesForPrompt` | `conversation_turns` verbatim | ✅ out of class — member/MAIA words, provenance rendered |
| `formatMarkedEpisodesForPrompt` | `episodic_memories`, `marked_by_member` | ✅ out of class — member act, R18-provenanced |
| **`formatMemberWebForPrompt`** | **`pattern_ledger` + session summaries + recurring themes** | 🔴 **IN CLASS — OPEN (P3d)** |

**P3d — the Member Web / Living Context composer.** Live on the canonical route at `app/api/sovereign/app/maia/list/route.ts:738` (`memberWebAddendum`). `formatMemberWebForPrompt` (`lib/memory/MemberLiveContext.ts:436`) composes:

```
  P1 [87% | personal | 2026-05-12]: <machine-inferred pattern statement>
```

Machine-inferred statements about the member **carrying a rendered confidence percentage** — which reads as measurement while carrying no provenance a reader could interrogate. It also composes machine-summarized session essences (`rem.essence`) and recurring themes. This is P3's failure class, and arguably its most exposed instance: the confidence number is precisely the "sounds statistical and settled" problem identified for breakthrough aggregates, made explicit.

**Not repaired here.** Recorded as the open obligation that keeps P3 open, per the precedent P3b and P3c set.

**Honest limit of this sweep**: it enumerated composers reachable from the canonical route's addenda and the MemoryBundle. It is a *survey*, not a compiler-derived closed set. A closed set over "everything that composes member-derived material into a prompt" would be the right instrument and does not exist yet. Until it does, *"no further path remains"* is **not a claim this evidence can support** — which is itself a reason P3 stays open.

---

### P3d-E — Member Web · execution record

#### Topology, established before repair

`formatMemberWebForPrompt` is live on the canonical route as `memberWebAddendum`. It composed **five** sections:

| Section | Material | Verdict |
|---|---|---|
| Active Patterns | `pattern_ledger` → `P1 [87% \| scope \| date]: <statement>` | 🔴 machine detects, machine authors, machine scores |
| Recent Session Arcs | summary pipeline → `<essence> → <nextStep>` | 🔴 machine-authored interpretation |
| Recent Journal | `quick_journal_entries` / `elemental_journal_entries` | ✅ **member-authored** |
| Candidate recurrence | `member_theme_signals` (R24-excluded) | 🔴 derivation over excluded |
| Field condition | `deriveFieldState(journal, themes, patterns, sessions)` + `confidence=0.87` | 🔴 derivation, least-certified governs |

#### The partition

**Solving P3d by deleting the formatter would have removed the member's own journal alongside MAIA's inferences about them** — a constitutional failure in the opposite direction. `formatMemberWebForPrompt` now takes `CertifiedMemberWeb`, a type that **structurally does not contain** the excluded classes. Reaching them is a compile error.

Journal authorship is structurally certifiable: those tables hold only member-supplied content written through authenticated member gestures, exactly as `conversation_turns.role='user'` is certifiable. Its **`themes` annotation does not survive** — nothing establishes who authored those tags, and never-guess applies at field granularity.

#### The two rulings this implements

**Transformation creates a newly authored object.**

```
   member testimony --machine summarizes--> MAIA-AUTHORED SUMMARY
                                       NOT  MEMBER TESTIMONY
```

Every sentence a session essence summarizes may have been the member's. The summary is not. **Authorship attaches to the representation, not merely to the raw material it was derived from** — which is what prevents intelligent synthesis from quietly becoming autobiographical authority.

**The derivation rule**, now a gate function (`adjudicateDerivation`) rather than a per-site check:

> A derived representation cannot acquire greater participation authority than the material required to produce it.

A confidence percentage does not elevate epistemic standing. It only makes the inference sound as though it had been measured.

#### Falsification — six mutations, all verified failing, reverted

| # | Mutation | Result |
|---|---|---|
| D1 | Declare a renamed pattern field on `CertifiedMemberWeb` | ❌ 1 failed |
| **D2** | **Mandated laundering** — *"Your strongest recurring pattern is water, with 0.87 confidence"* | ❌ 1 failed |
| D3 | Derivation rule admits despite an excluded input | ❌ 2 failed |
| D4 | Reclassify session essences as member testimony | ❌ 1 failed |
| D5 | Sweep the member's journal into the exclusion | ❌ 3 failed |
| D6 | Route passes the raw context through an `as any` cast | ❌ 1 failed |
| — | Restored | ✅ **26/26** |

> ### ⚠️ THREE OF THESE SIX INITIALLY PASSED
>
> **D1** — the check was name-based and knew only `activePatterns`; a field named `patterns` walked through. Replaced with a closed set over declared fields.
> **D4** — nothing composed sessions either way, so the *classification* went unpinned even though it is load-bearing for the derivation rule. Now pinned directly.
> **D6** — the check denied one *spelling* of the bypass (`formatMemberWebForPrompt(memberLiveCtx)`) and missed `(memberLiveCtx as any)`. Replaced by pinning the call **argument**.
>
> And a fourth reported a pass because **the mutation never applied** — the false-green class again. Every mutation is now confirmed applied before its result is recorded.
>
> **All four were detector gaps, not property gaps.** This is hostile mutations earning their keep by failing to fail, and it is the strongest argument yet for the instrument rule.

#### Capability contraction, quantified

On the canonical route, `memberWebAddendum` loses four of its five sections. For a member with patterns and session summaries, the block shrinks from roughly a dozen composed lines — pattern statements with confidence scores, session essences with next-steps, candidate recurrence, and a field-condition line — to **their own journal entries alone**, or to **nothing at all** if they have not journalled.

Authorized, and not to be restored to preserve prior conversational behavior. The removed material survived only through Grade-C instructional restraint (*"use as background awareness, do not recite"*), plus one epistemic caveat added by ruling in July.

---

### P3-CSC — Closed-Set Certification · outcome and evidence

**Outcome: C — architectural ceiling, with a B finding attached.** Reporting both is not evasion: **C** is the architectural determination the exercise was authorized to make, and **P3e** is a specimen found while making it. Both need adjudication.

#### What was built, and what it certifies

Discovery is **compiler-derived**, not regex — after four detector defects, regex had stopped being an honest instrument for parsing. The TypeScript AST is walked for template spans in the FAST system-prompt template and for `field:` properties of `ADDENDA_SPECS`. **45 producers** discovered; every one must carry an explicit class in `lib/maia/promptProducerClassification.ts`, with `UNKNOWN` failing closed and exemptions requiring a stated reason.

**The two lists are not asserted equal.** The derived set is the authority on *what exists*; the table supplies only *treatment*. A new producer changes the derived set, finds no treatment, and fails — the R23 pattern done right rather than its defect shape repeated.

**Six hostile mutations verified failing**, each confirmed applied: a new unclassified producer on either path, an inference reclassified as member testimony, a dropped gate, member testimony swept into inference, and a **meta-invariant** case that renames the discovery anchor and correctly fails **red on zero discovery** rather than passing vacuously.

#### Why the outcome is C

The anchor set of assembly sites **cannot itself be derived**, and the reason is structural rather than a limitation of effort:

> `lib/sovereign/maiaService.ts` alone contains **142 template expressions**, and **no source-level property distinguishes a template that becomes prompt text from one that becomes a console line.** Both are `TemplateExpression` nodes interpolating member-derived identifiers. Telling them apart requires following the string to the model call — dataflow that the canonical seam would make structural and that no parser can supply today.

Two demonstrations, in **opposite** directions, both from this exercise:

| Heuristic | Failure | Consequence |
|---|---|---|
| `spans > 8` | **excluded** `${memoryContext}` (6 spans) and `${recentContext}` (5 spans) | false negatives — and on exactly the material P3 governs |
| `spans > 8` | **included** `fieldIntelligence` / `wisdomMove` from a prompt-shaped block at `:1030` rendering *"Detection confidence: 87%"* | false positive — `fieldAwareness` is assigned and **never used**, dead since the note at `:1134` |

Establishing which was true required **tracing uses by hand, in both directions**. That is the ceiling, demonstrated rather than asserted.

> **P3 cannot receive a global Grade A under the present architecture.** Per the adjudication, this is recorded as an architectural finding — not closed with a brittle detector manufactured so P3 could carry a green badge.

**What the certification does establish** is real and worth keeping: **CLOSED within** the two named registries — drift inside them fails, on either path — and **OPEN across** the codebase.

#### A divergence worth naming separately

The two assembly paths carry **materially different** context: 23 producers reach FAST only, 7 reach CORE/DEEP only — including **`journalContextAddendum`** and **`captureContextAddendum`**, which are member-history material composed on CORE/DEEP and absent from FAST. Pinned by the certification. Whether tiers *may* differ in composed member material is the open question already recorded at §C5 of the architecture document.

#### P3e — the B finding

`MemoryBundle.buildContinuitySummary` composes, into `formatForPrompt` via `recentContinuity`:

```
  • User: "<verbatim 60 chars>" → MAIA responded about <extractTopicHint(...)>
```

The member's words are testimony and compose legitimately. **`extractTopicHint` is a machine-derived topic label**, composed with no adjudication — a `SYSTEM_DERIVATION` inside a member-authored container. It is the exact field-level analogue of P3d's journal `themes` case, and it falls under the rule ratified there:

> **Authority follows the smallest representation whose authorship can actually be certified.** The container does not confer authorship on everything inside it.

Live on the canonical route (FAST, via `memoryContext`). **Named, not repaired.**

---

### P3e-E — Continuity-summary derivation · execution record

One composed bullet held **two representations of different authorship**:

```
   • User: "<verbatim>" → MAIA responded about <extractTopicHint(...)>
     └── member testimony ──┘  └── machine-derived label ──┘
```

**The member's authorship of the quotation does not confer authority on the derived label beside it.** Applied through the **shared** `adjudicateDerivation` boundary — no P3e-specific exception. `TopicHintSnapshot` is a discriminated union; `hint` exists only on the admitted arm.

**The verbatim quotation keeps its `MEMBER_AUTHORED` standing and still composes.** Excluding it because it once shared a container with a derivation would discard the member's own words — the over-correction in the opposite direction.

**`extractTopicHint` is deliberately left intact.** It was never the defect; composing its output ungoverned was. Deleting it would hide the derivation rather than govern it, and would make a future reintroduction look like new work instead of a restoration the gate must refuse.

#### Falsification — six mutations, all verified failing, application confirmed by call-site delta

| # | Mutation | Result |
|---|---|---|
| E1 | Direct restoration of `extractTopicHint` into the prompt | ❌ 3 failed |
| E2 | Renamed restoration — `[subject: <hint>]` | ❌ 2 failed |
| E3 | Classify the derived label as member testimony | ❌ 3 failed |
| E4 | Construct an admitted snapshot inline, wrapping the derivation | ❌ 3 failed |
| E5 | Bypass `adjudicateDerivation` | ❌ 4 failed |
| E6 | Transform to `category: <first word>, confidence 0.8` | ❌ 1 failed |
| — | Restored | ✅ **17/17** |

> ### ⚠️ TWO OF SIX INITIALLY PASSED — ONE ROOT
>
> **E2 and E6 both restored the same derived object under different wording**, and both walked through a suite that checked **output strings**. A wording check is defeated by rewording.
>
> Replaced with a **call-site closed set**: `extractTopicHint` may be invoked from exactly one place — the adjudicator. That check does not care how the result is phrased, and a new call site fails *because it is new*. It catches E1, E2 and E6 uniformly.
>
> A third assertion compared the hint of the **untruncated** assistant content while the composer sees a 60-char snippet, so the values never matched.
>
> And the **mutation-application probe itself** reported `APPLIED: False` for three mutations that had in fact applied — it inspected a slice the docblock also matched. Application is now confirmed by **call-site delta**. *An application probe needs the same scrutiny as the gate it serves.*

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

**P1a + P1b certified. P1 proposed COMPLETE. P2 and P3a–P3e certified.**

| | |
|---|---|
| **P1a** | ✅ export truthfulness / failure integrity |
| **P1b** | ✅ sovereign corpus classification |
| **P1** | ✅ **proposed complete** — one obligation surfaced, not chosen |
| **P2** | ✅ **R23** |
| **P3a–P3e** | ✅ **R24 · R25 · R26 · R27** + P3e |
| **P3 global** | ⚖️ architectural ceiling — rerun at seam |
| **P4, P5, P6, P2b** | Specification only |

**Verification**: typecheck 231 vs baseline 239, 0 new, 0 regressions. Whole-repo suite **identical to a clean tree** — 34 suites / 92 tests fail on both, all pre-existing; my changes add **+19 passing**. MIPA suites: **180/180 across 9**.

**Presented for adjudication:**

1. **The classified sovereign corpus** — 37 discovered, 40 classified, all with write-path evidence. Three sources are field-mixed, which is why table-level verdicts were refused.
2. **10 UNKNOWN, failing closed** — including two with no writer in source. Resolving them needs write-path evidence that does not exist yet, not a better guess.
3. **26 owed · 4 reached.** The choice between widening export and narrowing participation is yours; the covenant permits either.
4. **`member_sessions` is a machine summary already in the export** — owed, but requiring a label the current raw-row export cannot give it.

**Recommended next: P6** (doorway-consent integrity) — a live inconsistency in existing behavior, ahead of the product-heavy P4/P5. Not started.
