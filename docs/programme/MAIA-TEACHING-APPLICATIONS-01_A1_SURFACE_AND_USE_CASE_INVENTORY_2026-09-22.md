# MAIA-TEACHING-APPLICATIONS-01 / A1 — Surface + Use-Case Inventory

> **Programme:** MAIA-TEACHING-APPLICATIONS-01
> **Act:** A1 — SURFACE + USE-CASE INVENTORY
> **Class:** C — documentary census only
> **Opening canonical:** `798718abf326826f922251cda834011404b20a4d`
> **Governing authority:** Founder A1 authorization · canonical A0 (`42f31a48fbf8bae47a669be21e340f94d44b8d35`) · canonical MAIA-TEACHING-INTELLIGENCE-01 T0–T8B · TCF-2
> **Stop boundary:** documentary only. No runtime teaching implementation, teaching act, prompt, model call, provider, routing change, retrieval expansion, learner state, schema, migration, persistence, API, application route, UI control, role change, manuscript mutation, professional action, research execution, T0–T8B or TCF-2 modification, RGR-07, deployment, production mutation, or A2–A7 work is authorized by this census.

---

## 0 · Method and evidence discipline

This census reports **only what canonical evidence at `798718ab…` establishes**. Where the A0 domain list names something that canonical does not establish as a host surface, that is recorded as such rather than invented.

Every claim below is anchored to a file and, where useful, a line. Nothing was executed; no runtime was invoked; no source file was modified.

**Terminological finding carried throughout.** A0 §A0-APP-02 lists its examples as though they were all of one kind. They are not. Canonical distinguishes two different objects:

- a **surface** — a server-adjudicated jurisdiction bound to a route (`TeachingSurface`, `TeachingSurfaceRoute`);
- a **domain key** — a subject area available *within* a surface (`domainKeys`).

Of A0's five named examples, **two are surfaces** (Writer's Studio, practitioner/coaching) and **three are domain keys or bundles of them** (psychology/philosophy/spirituality/consciousness, Soullab framework, research-informed teaching — the last of which is *also* a surface). Treating a domain key as a surface would manufacture host surfaces that do not exist, which §III forbids.

---

## 1 · The canonical teaching substrate

`lib/maia/teaching/` — 4,060 LOC across eleven contract modules, each with a committed test suite.

| Contract | File | LOC |
|---|---|---|
| T1 teaching act | `TeachingActContract.ts` | 334 |
| T2 context/source | `TeachingContextSourceContract.ts` | 245 |
| T3 composition | `TeachingCompositionContract.ts` | 611 |
| T4 knowledge retrieval orchestration | `KnowledgeRetrievalOrchestrationContract.ts` | 558 |
| T5 research citation provenance | `ResearchCitationProvenanceContract.ts` | 698 |
| T6 learner dialogue adaptation | `LearnerDialogueAdaptationContract.ts` | 569 |
| T7 platform binding | `TeachingPlatformBindingContract.ts` | 254 |
| T8 runtime authority | `TeachingRuntimeAuthorityContract.ts` | 126 |
| T8B runtime surface authority | `TeachingRuntimeSurfaceAuthority.ts` | 137 |
| TCF canon fidelity | `TeachingCanonFidelityContract.ts` | 178 |
| runtime bridge | `TeachingRuntimeBridge.ts` | 350 |

### Closed teaching-act grammar (`TeachingActContract.ts:13`)

`ORIENT · EXPLAIN · ILLUSTRATE · CONTRAST · INQUIRE · INVITE_EXPERIENCE · OFFER_PRACTICE · CHECK_UNDERSTANDING · REPAIR_MISUNDERSTANDING · REFRAIN`

Exactly the ten acts A0 §A0-APP-04 names. Also closed: `TEACHING_OCCASIONS` (`explicit_request · present_movement · none`), `SOURCE_STANDINGS`, `PROVENANCE_LAYERS` (`source · maia_paraphrase · maia_synthesis`), `UNCERTAINTY_LEVELS`, `UNCERTAINTY_REASONS`, `TEACHING_RATIONALE_CODES`.

### ⭐ Finding A1-F1 — one teacher, confirmed

Both live teaching call sites in canonical invoke the same entry point, `buildTeachingRuntimeBridge`:

1. `app/api/sovereign/app/maia/list/route.ts:937`
2. `lib/manuscript/editorialRuntime/turn.ts:204`

There is **no parallel teacher, no second act grammar, no second learner model**. §VIII.1 is answered affirmatively from evidence: all candidate surfaces can and already do use the same canonical teacher.

---

## 2 · ⭐⭐ Finding A1-F2 — two live teaching call-site paths, two different surface-authority mechanisms

This is the census's principal structural finding and the one A2 must resolve.

### Mechanism A — server adjudication (shared route)

`app/api/sovereign/app/maia/list/route.ts:906–937` resolves surface authority per turn through T8B:

```
requestedTeachingSurface(meta.teachingSurface, surfaceMode)
  → resolveTeachingRuntimeSurfaceAuthority({
      requestedSurface, legacySurface,
      hasActivePractitioner,   // getPractitionerIdForMember(userId)
      serverRoles, adminRole,  // SELECT roles, admin_role FROM members
    })
  → { surface, route, context, audience, authorityBasis,
      deniedRequestedSurface, clientIntentIsAuthority: false,
      mayPersistRoleInference: false,
      standing: 'SERVER_ADJUDICATED_CURRENT_TURN' }
```

A denied elevation **falls back to `general_maia`** and logs; it does not fail the turn. This is A0-APP-02 and C-A0-07 in force, mechanically.

`SHARED_ROUTE_TEACHING_SURFACES` (`TeachingRuntimeSurfaceAuthority.ts:12`) contains exactly four entries — `general_maia · coaching_practice · therapist_practitioner · research_lab` — and the record type pins `route` to `Extract<TeachingSurfaceRoute, 'sovereign_maia_list'>`.

**`writers_studio` is deliberately absent from T8B's adjudicator.** The constant's name says why: it governs the *shared route*, where a client could request an elevated surface.

### Mechanism B — structural route derivation (Writer's Studio)

`lib/manuscript/editorialRuntime/turn.ts:204–212` passes **compile-time literals** and never calls the adjudicator:

```
buildTeachingRuntimeBridge({
  surface: 'writers_studio',
  route:   'writers_studio_editorial',
  context: 'writers_studio',
  audience:'writer',
  domainKey:'writing_rhetoric',
  message: utterance, interactionId: threadId, turnId: input.exchangeId,
})
```

Authority here is **structural**: the only caller is `app/api/writers-studio/editorial/turn/route.ts:29`, and the runtime has already bound the member to the thread by SQL (`AND tu.speaker = 'author' AND th.member_id = $3`, `turn.ts:190`). No client-supplied surface label participates.

### Why this is a question, not yet a defect

Both mechanisms refuse client-claimed elevation, and `writer` confers no authority that `member` lacks — unlike `therapist_practitioner` or `researcher`. On that reading Mechanism B is lawful: the surface is not *requested*, it is *where the code is*.

But A0 §A0-APP-02 states that **"T8B server-adjudicated surface authority remains controlling,"** and Mechanism B obtains its surface authority without consulting T8B at all. Whether route-structural derivation satisfies that sentence, or whether Writer's Studio requires its own adjudicated entry, is **a contract question belonging to A2**. This census does not answer it.

> **GAP G1 — A2:** does A0-APP-02 admit exactly one form of surface authority (T8B adjudication) or two (adjudicated *and* route-structural)? If one, Writer's Studio needs a T8B entry. If two, the second form needs to be named and bounded so that "the route is the authority" cannot later be claimed by a route that did not earn it.

---

## 3 · Surface census

### S1 · `general_maia`

| | |
|---|---|
| **Surface** | shared MAIA conversation |
| **Canonical evidence** | `app/api/sovereign/app/maia/list/route.ts:906–960`; `TeachingPlatformBindingContract.ts:134` |
| **Route** | `sovereign_maia_list` |
| **User job** | understand, compare, examine, clarify anything the member raises in conversation |
| **Bounded teaching object** | the current utterance and current-interaction dialogue |
| **Existing T0–T8B substrate** | full bridge; `domainKeys: ALL_DOMAIN_KEYS`; `sourceClasses: INTERNAL_AND_EXTERNAL_SOURCES` (8 classes) |
| **Surface authority seam** | Mechanism A — T8B adjudicated, `authorityBasis: general_member` |
| **Learner authority owner** | the member |
| **Host custody owner** | the conversation route; Sanctuary refuses before governed retrieval |
| **Source / retrieval standing** | `retrieveGovernedKnowledge(message)` behind `AIN_KNOWLEDGE_GATE_ENABLED === '1'`, sanctuary-gated, emitting `sourceClass: 'governed_library'`, `standing: 'governed_reference'`, locator `sha256:…`, `citationAvailable: true` (`route.ts:872–885`) |
| **Mutation / action boundary** | teaching is an additive prompt addendum only; contract failure closes T8 for the turn and the turn continues (`route.ts:957`) |
| **Existing downstream handoff** | none — this surface has no action seam |
| **Prohibited transfers** | surface presence → elevated surface; interaction → durable learner trait |
| **Gaps** | none blocking; this is the reference implementation of A0-APP-02 |

### S2 · `writers_studio` ⭐ the only surface with a complete action chain

| | |
|---|---|
| **Surface** | Writer's Studio editorial runtime |
| **Canonical evidence** | `lib/manuscript/editorialRuntime/turn.ts:204`; entry `app/api/writers-studio/editorial/turn/route.ts:29`; `app/writers-studio/**` |
| **Route** | `writers_studio_editorial` |
| **User job** | understand how a passage is functioning — development, structure, arc, continuity, voice, coherence, reader effect, craft tradeoffs — in relation to the writer's own manuscript |
| **Bounded teaching object** | the current author utterance within a thread bound to the member; assembled editorial cognition |
| **Existing T0–T8B substrate** | full bridge; `domainKeys: ['writing_rhetoric']` only; `sourceClasses` = 6 (`soullab_canon · governed_library · practitioner_material · external_academic · external_historical_tradition · external_web_general`) |
| **Surface authority seam** | **Mechanism B — structural**, see A1-F2 / G1 |
| **Learner authority owner** | the writer |
| **Host custody owner** | Writer's Studio; teaching enters as **one named candidate block** (`producerId: 'computed.teaching_intelligence'`) alongside existing assembly blocks — it does not replace the cognition, it joins it |
| **Source / retrieval standing** | ⚠️ **the live call site passes no `sources`** — see A1-F3 |
| **Mutation / action boundary** | teaching contributes a directive block only; every state change runs through the seams below |
| **Existing downstream handoff** | ⭐ complete and already lawful: `lib/manuscript/proposalChain/` (proposal) → `lib/manuscript/revisionAuthorization/` (exact authorization) → `editorialRuntime/adoption.ts` (apply) → `editorialRuntime/memberVersion.ts` + `recovery.ts` (version / undo / recovery) → `lib/manuscript/standing/` (member standing). Also present: `editorialScope/`, `editorialDiscourse/`, `developmentalReader/`, `developmentalReading/`, `editorialRuntime/memberAct.ts`, `maiaOutcome.ts` |
| **Prohibited transfers** | example revision → writer consent; explanation → authority to apply; teaching → bypass of version/undo/exact-application |
| **Gaps** | G1 (surface authority form); G2 (source plane) |

**A0 §IV custody relationship, as it already exists** — manuscript → teaching/explanation → observation/editorial evidence → discussion → optional proposal → exact authorization → revision/apply → version/undo/recovery. Every link has a canonical module. A1 identifies these as suitable for later teaching application and **alters, bypasses, duplicates and implements none of them**. `WRITERS-STUDIO-EDITORIAL-READING-01` and `WRITERS-STUDIO-NEXT-01` remain independent governing programmes and are untouched here.

> ⚠️ **Finding A1-F3 / GAP G2 — A2.** `SURFACE_LAW.writers_studio` admits six source classes, but the live call site supplies **no `sources` argument at all**. Writer's Studio teaching therefore operates today with an **empty governed source plane**, while the shared route has a populated one. The declared capability and the wired capability differ. A2 must decide whether Writer's Studio teaching is source-bearing; if it is, that is a *retrieval* question requiring its own grant, not something an application contract may assume.

### S3 · `coaching_practice` · S4 · `therapist_practitioner`

| | |
|---|---|
| **Surface** | practitioner/coach learning, reached through the shared MAIA conversation |
| **Canonical evidence** | `route.ts:911–913`; `TeachingRuntimeSurfaceAuthority.ts:50–51`; `TeachingPlatformBindingContract.ts:159,166`; `lib/studio/getPractitionerIdForMember.ts`; host routes `app/practitioners`, `app/practitioner`, `app/now-what/coaching`, `app/api/studio/practitioner-observations` |
| **Route** | `sovereign_maia_list` (**not** a practitioner-specific teaching route) |
| **User job** | learn conceptual models, frameworks, distinctions, methods and their limitations |
| **Bounded teaching object** | the current utterance; educational material — **not a client** |
| **Existing T0–T8B substrate** | `COACHING_DOMAINS` (7 keys) / `PRACTITIONER_DOMAINS` (14 keys incl. `philosophy`, `spirituality_contemplative_traditions`, `consciousness_studies`, `relational_geometry`, `ain`, `maia_constitutional_architecture`) |
| **Surface authority seam** | Mechanism A — elevation requires `getPractitionerIdForMember(userId)` to resolve; otherwise denied to `general_maia` |
| **Learner authority owner** | the practitioner |
| **Host custody owner** | the practitioner surfaces; the practitioner retains all case, ethical, clinical and intervention judgment |
| **Source / retrieval standing** | shared-route governed knowledge as S1 |
| **Mutation / action boundary** | **CASE LEARNING ≠ CASE AUTHORITY.** No diagnosis, assessment, treatment planning, intervention choice, or client-directed action |
| **Existing downstream handoff** | ⚠️ **none established for teaching.** `app/api/studio/practitioner-observations` exists but this census does not establish it as a lawful teaching→action seam |
| **Prohibited transfers** | practitioner role → clinical authority; case discussion → client diagnosis; client metadata → role authority |
| **Gaps** | G3 |

> **GAP G3 — A2 / host.** Practitioner teaching has an adjudicated surface but **no downstream action seam**, unlike Writer's Studio. A0 §VII.7 expects teaching to hand outward rather than acquire authority; here there is nothing to hand to. A2 must decide whether practitioner teaching is deliberately terminal (explanation only, which is the safest reading of C-A0-05) or whether a host-side seam is owed — a **host-surface problem**, not a teaching problem.

### S5 · `research_lab`

| | |
|---|---|
| **Surface** | research-informed teaching, reached through the shared conversation |
| **Canonical evidence** | `route.ts:914–920`; `TeachingRuntimeSurfaceAuthority.ts:52`; `TeachingPlatformBindingContract.ts:173`; host routes `app/research`, `app/labtools`, `app/admin/research` |
| **Route** | `sovereign_maia_list` |
| **User job** | understand research concepts, methods, source standing, competing interpretations, limitations, open questions |
| **Bounded teaching object** | a claim, method, or research programme |
| **Existing T0–T8B substrate** | `RESEARCH_DOMAINS` (7 keys incl. `relational_geometry`, `soullab_research`); T5 provenance 698 LOC |
| **Surface authority seam** | Mechanism A — `members.roles` / `admin_role` adjudicated server-side |
| **Learner authority owner** | the researcher |
| **Host custody owner** | RGR programme governance; TCF-2 |
| **Source / retrieval standing** | T4/T5 + TCF-2; **H-RT1 remains empirically unestablished**; RGR-06 freezes confirmatory machinery and constitutes no benchmark evidence |
| **Mutation / action boundary** | **TEACHING A RESEARCH PROGRAMME ≠ EXECUTING IT.** No study execution, preregistration change, outcome selection, benchmark materialization, model training, TEST or REPLICATION |
| **Existing downstream handoff** | none — and correctly so |
| **Prohibited transfers** | research constitution → empirical result; implementation lock → benchmark evidence; canonical standing → external scientific validation |
| **Gaps** | none blocking A2; the membrane is the point |

---

## 4 · Domain keys that are **not** surfaces

Recorded per §III so that no surface is manufactured.

**Psychology · philosophy · spirituality · consciousness studies.**
`NO SEPARATE HOST SURFACE ESTABLISHED — SERVED BY EXISTING SURFACES.` These are domain keys (`psychology_psychotherapy_models`, `philosophy`, `spirituality_contemplative_traditions`, `consciousness_studies`), reachable on `general_maia` (via `ALL_DOMAIN_KEYS`), on `therapist_practitioner`, and — for `consciousness_studies` and `philosophy` — on `research_lab`. Note `philosophy` and `spirituality_contemplative_traditions` are **absent from `COACHING_DOMAINS`**. Creating a surface for these would violate §III.

**Soullab framework teaching.**
`NO SEPARATE HOST SURFACE ESTABLISHED — SERVED BY EXISTING SURFACES.` Domain keys `soullab_canon`, `elemental_alchemy`, `spiralogic`, `relational_geometry`, `ain`, `maia_constitutional_architecture`. Available in full on `general_maia` and `therapist_practitioner`; `COACHING_DOMAINS` carries `soullab_canon`, `elemental_alchemy`, `spiralogic` but **not** `relational_geometry`, `ain`, or `maia_constitutional_architecture`.

A0 §VIII's non-reduction law (Elemental Alchemy, Spiralogic and RGR are distinct, ontologically foundational, interdependent — functional differentiation allowed, hierarchical reduction not) is a **composition/fidelity constraint on teaching content**, carried by `TeachingCanonFidelityContract.ts`. It is not a surface requirement.

> **GAP G4 — A2.** The three domain-key subsets are not nested: a coach may not reach `relational_geometry` or `philosophy` while a therapist may. Whether that asymmetry is intended pedagogy or incidental is not established by canonical evidence and is a contract question.

---

## 5 · Required cross-surface findings (§VIII)

**1 · Same canonical teacher across all surfaces?** ✅ **Yes, already.** One `buildTeachingRuntimeBridge`, one act grammar, one composition law. No parallel teacher exists or is needed.

**2 · Where surface-specific authority differs though semantics are shared.** ⭐ Two axes:
- *Authority acquisition* — Mechanism A (adjudicated, four shared surfaces) vs Mechanism B (structural, Writer's Studio). **A1-F2 / G1.**
- *Authority consequence* — `general_maia` and `writers_studio` require no elevation; `coaching_practice`/`therapist_practitioner` require a resolved practitioner identity; `research_lab` requires a server role. Elevation failure degrades to `general_maia` rather than refusing the turn.

**3 · Which surfaces already possess lawful downstream action seams?** **Writer's Studio only** — proposal → authorization → apply → version/undo/recovery → standing. S1 and S5 have none by design. S3/S4 have none established (**G3**).

**4 · Retrieval.** `general_maia`, `coaching_practice`, `therapist_practitioner`, `research_lab` operate on **inherited** retrieval (shared-route governed knowledge, flag-gated, sanctuary-refused). `writers_studio` declares six source classes and **receives none at runtime** (**G2**) — the one place where an application would require separately governed retrieval rather than inheritance.

**5 · Where cross-domain movement could accidentally accumulate authority.** The shared route hosts four of five surfaces on **one route** with surface resolved **per turn**. The structural protections are real and worth naming: `standing: 'SERVER_ADJUDICATED_CURRENT_TURN'`, `mayPersistRoleInference: false`, `clientIntentIsAuthority: false`, re-adjudication every turn, and fallback-to-`general_maia` on denial. The residual risk is not authority *persistence* but authority *bleed within a turn* — a member moving from `soullab_canon` to `relational_geometry` to `psychology_psychotherapy_models` inside one elevated surface. A2 must confirm that C-A0-12 (no authority by accumulation) is enforced by the composition contract and not merely by per-turn re-resolution.

**6 · Any use case that cannot be an application because it needs T0–T8B or TCF-2 change?** **None identified.** Every user job censused above is expressible through the existing ten-act grammar. G1–G4 are all contract, host-surface, or retrieval questions — **none requires changing core teaching semantics**, so nothing is classified `ROUTE OUTWARD — NOT AN APPLICATION FEATURE` by this census.

**7 · Which gaps belong to A2 versus elsewhere.**

| Gap | Classification | Owner |
|---|---|---|
| G1 · form of surface authority for Writer's Studio | application-contract problem | **A2** |
| G2 · Writer's Studio source plane declared but unwired | retrieval problem | **A2 to scope; a separately governed retrieval grant to fill** |
| G3 · no downstream action seam for practitioner teaching | host-surface problem | **A2 to decide terminality; host programme to build if owed** |
| G4 · non-nested domain-key subsets | application-contract problem | **A2** |

---

## 6 · A2 implications

Questions the future contract must resolve. **A1 answers none of them and implements nothing.**

1. Does A0-APP-02 admit route-structural surface authority alongside T8B adjudication, and if so under what bounded conditions? (G1)
2. Is Writer's Studio teaching source-bearing, and if so by what separately governed retrieval authority? (G2)
3. Is practitioner teaching deliberately terminal, or is a host-side handoff owed? (G3)
4. Are the domain-key subsets intended pedagogy? (G4)
5. How does the contract express the handoff from a teaching act to Writer's Studio's existing proposal→authorization→apply chain such that **explanation of a possible revision never becomes authority to apply it**?
6. What mechanically enforces C-A0-12 across domain movement inside a single elevated turn?

---

## 7 · Standing

Per §XII, this census states from canonical evidence: what real teaching surfaces exist (five, two live call sites); what user jobs belong to each; what authority seam governs each (two distinct mechanisms); what host custody law binds each; what Teaching Intelligence substrate is reusable (all of it, unchanged); what retrieval/source law binds each; what downstream action seams already exist (Writer's Studio only); what gaps remain (G1–G4); which belong to A2 (G1, G4; G2 and G3 scoped by A2, filled elsewhere); and which requests must route outside the programme (none).

> **MAIA-TEACHING-APPLICATIONS-01 / A1 — SURFACES CENSUSED · USE CASES MAPPED · AUTHORITY SEAMS IDENTIFIED · HOST CUSTODY CONSTRAINTS MAPPED · REUSE BOUNDARIES ESTABLISHED · GAPS CLASSIFIED · DOCUMENTARY ONLY · READY FOR FOUNDER ADJUDICATION**

⛔ A2 is not opened. ⛔ No implementation, retrieval, persistence, schema, route, UI, role, manuscript mutation, professional action, research execution, deployment or production effect. ⛔ `WRITERS-STUDIO-EDITORIAL-READING-01`, `WRITERS-STUDIO-NEXT-01`, T0–T8B, TCF-2 and RGR standing are untouched.

> **THE TEACHER MAY HELP THE PERSON SEE MORE CLEARLY. THE TEACHER DOES NOT TAKE OVER THE PERSON'S WORK.**
