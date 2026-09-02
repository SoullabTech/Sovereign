# MAIA Intelligence Participation Architecture (MIPA) — v0.1

**Status**: Adjudicated architecture. **Not authorization to implement.**
**Adjudicated**: 2026-09-02 (founder ruling — Candidate D approved with refinements)
**Lineage**: `MAIA_LONG_TERM_MEMORY_CURRENT_STATE_CENSUS.md` → `MAIA_LONG_TERM_MEMORY_ARCHITECTURE_CANDIDATES.md` (comparison record) → **this document (operative)**
**Branch**: `claude/maia-long-term-memory-fda5gf`

**Naming**: the founder proposed *MAIA Intelligence Participation Architecture* as the eventual name for the object, memory being one field within it. Used here on that authority. **Name not ratified into canon** — that is a separate act.

**Restraint in force**: no client wired, no semantic retrieval activated, no sovereignty defect repaired, no migration begun, nothing deployed.

---

## 1. What this architecture is

> The constitutional boundary between everything MAIA could know and what is permitted to become present in relationship.

Not a memory loader. Not retrieval. The object is **conditional participation in a present encounter** — and the governing question is not *"what does MAIA know about me?"* but:

> *Of everything MAIA could know, perceive, infer, remember and recognise — what legitimately belongs in this moment between us?*

The lane's original success criterion, restated as the architecture's acceptance test:

> MAIA can recognise relevant continuity across a long human relationship **without confusing similarity with significance, inference with fact, retrieval with permission, or memory with entitlement to speak.**

Four confusions, four structural separations. §2 separates significance from similarity and from validity. §3 separates retrieval from permission. §4 separates permission from entitlement to speak. §5 makes all of it unbypassable.

### 1.1 Two invariants that govern everything below

> **Every stage may reduce; none may add.** Composed material is always a subset of retrieved material. No stage manufactures, synthesises, or promotes standing. Every removal carries a named reason.

> **The default at every stage is withholding.** Passing forward requires a positive reason. This matches the existing atoms loader, whose scope logic already states it: *"Absence = restriction, not widening"* (`memoryAtomsLoader.ts:250`).

---

## 2. The authority lattice

**Adjudicated refinement**: standing is **not** a single vertical ordering. A universal ranking such as *member act > member words > MAIA words > observation > inference* conflates three properties that must stay orthogonal, and it produces a wrong answer to a simple case:

> A member Kept something a year ago and explicitly corrected it yesterday. Under a strict standing hierarchy, the Keep (standing 1) defeats the correction. **That is wrong.** The correction must win.

### 2.1 The five properties

| Property | Question | Authority source |
|---|---|---|
| **STANDING** | What kind of authority does this object possess? | structural — how it came to exist |
| **VALIDITY** | Is it current, superseded, retracted, or unresolved? | **member acts only** |
| **RELEVANCE** | Why is it a candidate for *this* encounter? | computed — similarity, entity, recency, resonance |
| **PERMISSION** | Under what conditions may its content enter cognition? | member-conferred — consent, scope, sanctuary |
| **SPEAKABILITY** | Even if admitted, should MAIA mention it? | relational — warrant, timing, non-intrusion |

**These are orthogonal.** An object may have high standing and be superseded. It may be highly relevant and impermissible. It may be permitted and unspeakable in this moment. **No property substitutes for another, and none is derivable from another.**

### 2.2 What STANDING governs — and what it does not

Standing determines **what an object may overrule or impersonate**. It does *not* determine whether an object wins the encounter.

| Standing | Class | Arises from |
|---|---|---|
| **S1** | Member-Kept atoms · Member-Marked episodes | a member act |
| **S2** | Member's own verbatim words | the member said it |
| **S3** | MAIA's own prior words | MAIA said it, the member heard it |
| **S4** | Practitioner observation | attributed, epistemically framed |
| **S5** | System inference | machine construction |

Standing governs exactly three things:

**(a) Who may write a validity edge.** A supersession claim — *"X is no longer true; Y replaces it"* — may only be authored by an act of standing **≥** the object it invalidates, and for member-authored objects, **only by the member**. This is Covenant 5 made operational: *the system does not author the member's truth.*

**(b) What frame an object may be rendered in.** An S5 inference may never be rendered as *"you told me"* or *"you said"*. This is the anti-laundering rule, and it is the rule that Case 6 needs.

**(c) Which composition section and budget it receives.** Cross-class order is authored and versioned, never score-derived.

Standing governs **nothing else**. Specifically it does not govern relevance, does not confer admission, and does not by itself defeat a later object.

### 2.3 How the lattice resolves Kelly's case

```
  Kept atom  ── S1 ── kept 2025-09-02 ──┐
                                        ├─► both are member acts (S1/S2)
  Correction ── S2 ── said 2026-09-01 ──┘   → the later may invalidate the earlier
                                            → Keep becomes VALIDITY: superseded
                                            → correction is ADMITTED as current
```

versus the inverse, which the same rule forbids:

```
  Member statement ── S2 ──┐
                           ├─► inference is S5 < S2
  System inference ── S5 ──┘   → S5 may NOT write a validity edge against S2
                               → inference cannot invalidate testimony
                               → inference may itself be invalidated
```

> **STANDING RULE (ratified 2026-09-02).** *Standing determines who may write a validity edge; time resolves among actors with sufficient standing.*
>
> Later member correction → may invalidate an earlier member claim or Keep.
> System inference → cannot invalidate member testimony. Both of Kelly's requirements hold simultaneously: a later member revision invalidates an earlier member Keep, and no computation ever promotes a system inference into greater autobiographical authority than member testimony.

### 2.4 VALIDITY as a resolved value

`VALIDITY ∈ { current · superseded · retracted · contradicted-unresolved }`

**Adjudicated: supersession resolves *before* participation.** The system must not hand cognition three contradictory representations and rely on the language model to adjudicate autobiographical truth. Stage 3 emits at most one `current` representation per resolved claim.

`contradicted-unresolved` is the honest residue: two member-authored representations conflict and no member act settles it. **It may not be ADMITTED as fact.** Two dispositions are architecturally available and the choice is open (§10.2): withhold it, or admit it explicitly *as an open question* with both representations and no resolution asserted.

**Substrate reality**: `valid_to` exists only on `developmental_memories`. `conversation_turns` has no supersession and cannot be honestly retrofitted — nothing records that turn N revises turn M. Therefore:

- **S1 (floor, ships with any retrieval)**: temporal disclosure. Age is surfaced; MAIA holds uncertainty about currency.
- **S2 (the real answer)**: member-declared supersession — a gesture that does not yet exist (§10.1).
- **S3 (rejected on canon)**: inferred contradiction detection. A system that decides which of a member's statements is no longer true has taken authorship of their self-account.

### 2.5 RELEVANCE — computed, and bounded

Relevance is the only computed property, and it is confined:

- **Ranking is intra-class only.** Similarity, entity match, recency and resonance rank candidates *within* a class to decide *which three turns* — never *whether a turn beats an atom*.
- **Relevance never alters standing, validity or permission.** It answers only *"why is this a candidate?"* and its answer is recorded as a reason code, not a score that travels downstream.

> The property this buys: **inversion is unrepresentable, not merely unlikely.** No computation anywhere can place a system inference above a member's own words, because they are never on the same scale, in the same section, or under the same frame.

**Precedent, not invention**: `formatAtomsForPrompt` (`memoryAtomsLoader.ts:414-560`) already partitions member-placed from practitioner atoms into separate sections with different authority language and never sorts one against the other. MIPA generalises a working mechanism to five classes.

---

## 3. Participation states — structural restraint

**Adjudicated definitions.** The controlling idea: restraint cannot depend on instructing the final model not to mention something. **The architecture determines what the speaking model can physically see.**

| State | The adjudication layer | The speaking model receives |
|---|---|---|
| **AVAILABLE** | knows the candidate exists and judged it relevant | **nothing** |
| **OFFERED** | has formed a disclosure-safe doorway | **the doorway envelope only** — never the historical body |
| **ADMITTED** | has cleared provenance, validity, sovereignty, sanctuary, privacy | the memory body + provenance + epistemic status + validity framing |
| **HELD / EXCLUDED** | recorded the exclusion and its reason | **nothing** *(internal disposition, for evidence; not member-facing)* |

### 3.1 The correction that makes this real

An earlier draft defined AVAILABLE as *"a pointer carrying class, age, and coarse subject."* **That leaks.** A pointer reading *"painful event involving Karen, 14 months ago"* has already disclosed the association, the affect, and the person — precisely what the member did not invite.

> **Adjudicated rule: the adjudication layer may know more than the speaking model receives.** Coarse metadata is not assumed safe. AVAILABLE means the body *and its description* stay outside the speaking context.

This is what makes restraint structural rather than instructional: **MAIA cannot speak what she does not have.** The failure mode of prompt-based restraint — the model reads the sensitive material and mentions it anyway — is not discouraged; it is unavailable.

### 3.2 What makes a doorway disclosure-safe

The OFFER envelope is the hardest unsolved surface in this architecture, and the lattice yields a strong constraint on it.

> **A doorway is disclosure-safe only if its disclosing text was authored or reviewed by the member with knowledge that it may resurface.**

Applying that predicate to the actual classes produces a non-obvious and load-bearing result:

| Class | Doorway text available? | May generate a contextual OFFER? |
|---|---|---|
| Kept atom (`spontaneous`) | ✅ member-authored `title` | ✅ **yes**, where `return_preference = contextual_doorway` |
| Kept atom (`idea_block` etc.) | ⚠️ `LEFT(content, 80)` — member's own words, member-reviewed at Keep time (`portfolio.ts:328`) | ⚠️ **conditionally** — see §10.3 |
| Marked episode | ⚠️ verbatim span the member chose; no separate doorway text | ⚠️ **conditionally** — see §10.3 |
| Practitioner observation | ❌ facilitator-authored title, `return_preference` **hardcoded** `contextual_doorway` (`with-me/sessions/[sessionId]/route.ts:139-145`) | ❌ **no** — §3.3 |
| **Conversation history** | ❌ **none exists** | ❌ **no — structurally** |
| System inference | ❌ machine-authored | ❌ **no** |

> **`conversation_turns` cannot generate a *candidate-specific* contextual offer.** There is no consented resurfacing text attached to an ordinary turn, so any candidate description would be system-authored *about* the member's history. A doorway reading *"that painful thing with Karen may be relevant again…"* **has already disclosed the memory** — calling it restraint would be a category error.

**Refined 2026-09-02 — three dispositions, not two.** The leak correction rules out candidate-specific doorways. It does not prove that ordinary history can never participate contextually under any architecture. A **content-free** doorway discloses no person, topic, event, age, sentiment, or inferred meaning:

> *"A prior part of our conversation may be relevant here. Would you like me to look back?"*

That is a different object, and it should not be automatically permitted either — an unprompted ambient nag is its own intrusion. But it may become legitimate under an explicit member opt-in.

```
conversation_turns
    │
    ├── W1 explicit recollection ─────────────► ELIGIBLE
    │
    ├── candidate-specific contextual doorway ► PROHIBITED
    │     (discloses the memory in the act of offering it)
    │
    └── content-free contextual doorway ──────► MEMBER OPT-IN ONLY
          (new preference: historical_recall_doorways)
```

**`historical_recall_doorways`** is a proposed member-level preference, default **off**, distinct from every existing gate: `conversational_recall_enabled` governs whether recent turns *enter the prompt*; this governs whether MAIA may *announce that history exists* without naming any of it. It is not in scope for Phase 0 and is recorded as a design candidate.

**Epistemic note on a claim withdrawn.** An earlier draft asserted that `return_preference` living on atoms and not on turns "was never an oversight." **Source history does not establish that intent.** The migrations (`20260521000001`, `20260523000001`, `20260702000003`) document the consent model and its default flip; none states why turns were excluded. The honest claim is weaker and sufficient: **the omission is *consistent* with this architecture** — a turn has nothing that could carry a consented doorway — but consistency is not evidence of design intent, and the census's own discipline forbids the stronger reading.

### 3.3 A live finding this exposes

The practitioner bridge inserts observation atoms with `return_preference: 'contextual_doorway'` **hardcoded**, alongside a facilitator-authored `title`. The member neither wrote the doorway text nor chose the surfacing preference.

This does **not** violate anything today: `formatAtomsForPrompt` frames practitioner atoms with proportioned epistemic language and explicitly instructs MAIA to invite the member to confirm, reject or refine before carrying them as established context, and a rejection permanently releases the atom.

Under MIPA's doorway rule it nonetheless needs explicit treatment, because a hardcoded `contextual_doorway` is a consent value the member did not confer. **Recorded, not repaired** (§8 P6).

---

## 4. Warrants — resolving AVAILABLE → OFFERED / ADMITTED

**Adjudicated.** Not one rule. **Two distinct warrants**, plus three constraints that bind both. The prior framing erred by seeking a single rule to cover two different situations.

### 4.1 W1 — Explicit recollection warrant

**Trigger**: the member explicitly asks MAIA to remember, within a stated scope.
*"Do you remember Louisiana?" · "What did I tell you about Karen?" · "What did we discover last year?"*

**Effect**: the request **is** the authorization. Relevant **member-authored** material within the stated scope may proceed directly toward **ADMITTED** after provenance, validity, sovereignty, sanctuary and privacy checks.

> **No redundant permission loop.** MAIA does not coyly ask leave to remember something the member has just explicitly asked her to remember. Asking would be its own failure — a performance of scruple that costs the member the thing they requested.

**Scope is binding.** The warrant authorizes retrieval *within the scope the member stated* — "Louisiana" authorizes Louisiana, not a general history dump. Scope is derived at stage 0 (present meaning) and stage 2 (resolution). Material outside the stated scope is not authorized by W1 and falls back to W2.

**Class limits.** W1 admits **S1–S3** — member acts, member words, MAIA's own prior words. It does **not** admit S5 inference as autobiography (§4.3), and it does not override sanctuary or protection (§4.4).

**This resolves Case 1.** *"Do you remember when I lived in Louisiana?"* is a member-issued recollection warrant. Relevant member-authored history may be retrieved and admitted, correctly framed, with no permission loop and no doorway.

### 4.2 W2 — Contextual doorway warrant

**Trigger**: the present encounter resonates with history the member has **not** invoked.

**Effect**: content may **not** automatically become ADMITTED. An **OFFER** may be generated only where **both** hold:

1. the object's class and `return_preference` permit contextual return (`contextual_doorway` permits an offer — *not* automatic disclosure; `member_pulled` permits nothing until invoked), **and**
2. a disclosure-safe doorway can be formed without leaking protected content (§3.2).

Where either fails, the object remains **AVAILABLE** — known to the adjudication layer, invisible to the speaking model.

**This resolves Case 5.** A semantically relevant painful event the member did not invoke stays AVAILABLE, or becomes a carefully formed OFFER only where its return policy permits that doorway. **Retrieval still does not equal permission.** And because `conversation_turns` can never form a doorway (§3.2), an uninvoked painful conversational disclosure is structurally incapable of ambient resurfacing.

### 4.3 C1 — No autobiographical promotion of inference

Historical MAIA inference **never** silently becomes autobiographical fact through retrieval. Its epistemic class does not change through repeated surfacing, through age, or through having been retrieved before.

An inference may remain **explicitly an inference** — potentially useful for present reasoning, rendered under S5 framing — but it may never be presented as *"something I remember about you."*

**Endorsement does not change class.** *(Adjudicated 2026-09-02.)* When a member endorses something MAIA inferred, the result is a **member-endorsed interpretation** — never a member statement:

```
   MAIA inference  ──member endorses──►  MEMBER-ENDORSED INTERPRETATION
   MAIA inference  ──member endorses──►  MEMBER STATEMENT          ✗ prohibited
```

Modelled so that laundering is **unrepresentable rather than merely forbidden**: the standing class is *immutable*, and endorsement is an **additive edge** carrying the endorsing member and timestamp. It changes **permission and framing**, never **authorship**. An endorsed inference may be spoken as *"an interpretation you've agreed with"*; it may never be spoken as *"you told me."*

> Otherwise the system launders provenance at exactly the moment sovereignty is exercised — and the loss would be invisible for years, because the laundered object looks like ordinary member history.

**Class change is therefore not available at all.** Neither the endorse gesture nor joint establishment exists in the product today (§10.1), which means **the only honest disposition for S5 today is explicit-inference framing or exclusion.**

**This resolves Case 6**, and names why it is currently a *live* exposure: `developmental_memories` reaches the prompt as `memoryInfluenceAddendum` with no field marking it as inference.

### 4.4 C2 — Sensitivity raises the threshold; it never lowers it

W1 is a strong warrant. It is not a master key. Sanctuary, `sacred_protected`, scope boundaries and privacy rules **constrain W1's scope** and are never overridden by it.

**Contextual resonance alone is never sufficient to expose sensitive historical content.** The asymmetry is deliberate: warrants may be narrowed by protection, never widened by relevance.

### 4.5 C3 — Supersession resolves before participation

Per §2.4. Cognition receives at most one `current` representation per resolved claim. **The final language model is never asked to adjudicate the member's autobiographical truth.**

---

## 5. The canonical seam

**Approved**: promote the existing `buildMaiaRuntimeContext` contract toward mandatory assembler. Do not introduce a parallel abstraction.

**Adjudicated strengthening**: *mandatory* must mean **unbypassable by construction**, not documented in a README.

### 5.1 The invariant chain

```
        No getMaiaResponse()
        without canonical turn construction.
                    │
        No canonical turn construction
        without participation adjudication.
                    │
        No participation
        without provenance + policy evidence.
```

**Target invariant**: no live `getMaiaResponse()` caller can independently assemble a materially different MAIA intelligence field.

### 5.2 What the census found, and why this is the right seam

Cognition has converged: `getMaiaResponse` has three callers; `/api/oracle/conversation` is retired (410); the addenda channel reaches FAST/CORE/DEEP; and VOICE-CANONICAL-CONVERGENCE-02 structurally removed the divergent voice mind — *"It was not a thinner call into canonical cognition. It was a SECOND MIND"* — which was also the **default**.

**Context assembly has not converged.** Three live routes assemble different fields; a member reaching `sovereign/app/maia` receives canonical cognition with a fraction of the field, and nothing announces it. Clients converge on `/list` **by convention, not construction**.

`buildMaiaRuntimeContext` is already the *"required contract for all `getMaiaResponse()` callers"*, already carries a governed route registry, already emits per-turn observability — and explicitly declares *"does NOT modify the meta… the caller does that."*

> **It sits exactly at the boundary between "which door" and "which MAIA."** Promotion, not invention.

### 5.3 Enforcement must be closed-set

`__tests__/voice-non-degradation.test.ts` documents **four failed gate designs**, all failing the same way: *"Every version asked 'does this look like something we thought of?' and answered no. A denylist fails open on the unknown, and narrowing WHERE it is applied does not change that."*

The working version enumerates compiler-derived closed sets, so that *"an unknown call fails BECAUSE IT IS UNKNOWN, without the gate ever learning its name."*

**Three closed sets for the seam:**

1. **Assembly call sites** — the complete set of sites that construct MAIA context. A new assembler fails because a new site appeared.
2. **Seam inputs** — the complete set of fields the seam reads. A route slipping in a client-supplied context field fails because the input set changed. *This is the load-bearing half: it is where client-determined MAIA would actually enter.*
3. **Cognition entry** — `getMaiaResponse` is reachable only through the seam.

**A checklist that enumerates expected intelligence systems is a denylist wearing a different hat.** It passes the day someone adds one it never heard of.

---

## 6. Turn Participation Manifest

**Adjudicated: first-class.** This is where the governing standard — *not "does it exist?" but "can we prove it participated?"* — becomes architecture rather than investigative discipline.

```
IDENTITY & POLICY
  turn_id · member_ref · session_ref · surface · tier
  member_identity_status          ← credential source, parity state
  runtime_context_version
  participation_policy_version

CANDIDATES (per class)
  classes_considered[] · candidate_count
  relevance_reason_codes[]

DISPOSITIONS (per class)
  available_count · offered_count · admitted_count · held_count
  transition_reason_codes[]

ADJUDICATION
  supersession_decisions[]         ← resolved / unresolved, edge authors
  sovereignty_gates_applied[]      ← consent, scope, sanctuary, protection
  warrant_invoked                  ← W1 explicit · W2 contextual · none

COMPOSITION
  intelligence_fields_composed[]   ← memory, relational, symbolic, KG, …
  canonical_cognition_path
  assembler_version
```

### 6.1 The three fields that carry the standard

- **`held_count` + `transition_reason_codes[]`** make **restraint observable**. Every existing instrument records what happened; none records what was declined. Without this, a restrained turn and a broken turn are indistinguishable in production and the architecture's central claim is unfalsifiable.
- **`available_count`** distinguishes *"MAIA had nothing"* from *"MAIA had something and did not bring it."*
- **`member_identity_status`** is the clean bridge to the identity-continuity lane without merging it. **The manifest would have answered the 2026-09-02 question directly** — the census had to record that turn's server identity as UNKNOWN precisely because no such record exists.

### 6.2 Privacy constraint — non-negotiable

Counts, class labels, reason codes, versions and digests **only**. Never content, never titles, never entity names. Existing `memberRef()` / `digest()` discipline throughout.

> **An observability layer that records what MAIA declined to say must not become the place that says it.**

### 6.3 What it makes possible

Parity moves from promise to production query: same member, materially equivalent encounter, two surfaces, two manifests, compared field by field. **An iOS parity failure is no longer diagnosed by asking whether some code exists somewhere.**

**Precedents built on**: `MemorySelectionTraceEntry` (derived strictly after the cutoff, documented as unable to influence it); `emitTurnMemoryProvenance` with `bundleConsulted: false` (naming an absence as a first-class record); `MEMORY_SELECTION_POLICY_VERSION` (policy travels with the record); `runtime_events` + `deriveStatus`.

---

## 7. Cross-surface parity

**Adjudicated definition:**

> Given the same authenticated member, a materially equivalent encounter, and the same participation-policy version, iOS, PWA and Desktop invoke the same canonical turn-construction and intelligence-participation architecture. **Surface modality may differ; MAIA's available intelligence field may not silently differ by route.**

| May vary by surface | May **never** vary by surface |
|---|---|
| capture path (mic, keyboard, transcript) | class membership |
| modality and rendering | standing, validity, permission |
| device-local cache, UI state, preferences | sovereignty gates |
| session id shape (`session_*`, `desktop-*`) | epistemic framing |
| latency budget *(§10.4 — open)* | which intelligence fields participate |

**Encounter equivalence excludes** surface, client version, transport, session-id shape and modality. **It includes** member identity, present input, mode, and consent state.

**Restates the lesson already learned**: one MAIA, many modalities. iOS, PWA, desktop, text and voice do not each *have* memory. They all arrive at the same server-side turn constructor.

---

## 8. Sovereignty prerequisites — Phase 0, blocking

Covenant: **machine access to memory must not exceed member sovereignty over memory.**

| # | Defect | Requirement | Evidence |
|---|---|---|---|
| **P1** | Export omits `conversation_turns`, atoms, episodes, breakthroughs, theme signals | member can obtain their full corpus | census §6.3 |
| **P2** | `episodic_recall_enabled` read every turn, exposed nowhere | gate is member-writable | census §6.1 |
| **P3** | `developmental_memories` + `member_theme_signals`: no consent gate, no epistemic status | gate + status, or formal exclusion from participation | census §6.1, §4 |
| **P4** | No correction path anywhere (rejection ≠ revision) | required by W1's validity checks and by S2 supersession | census §6.3 |
| **P5** | No contextual-constraint substrate | stage 5 has a name and no substrate | census §6.4 |
| **P6** | Practitioner atoms: `contextual_doorway` hardcoded, facilitator-authored title | doorway consent must be member-conferred | §3.3 |

**P1 most directly gates the lane.** Making the Louisiana corpus machine-reachable while it remains member-unreachable is exactly the inversion the covenant forbids. It is also the plain reading of the growth-obligation check in `CLAUDE.md`: *every increase in capability must produce a matching increase in provenance, restraint, and transparency.* **P1–P6 are that matching increase.**

**Not repaired here**, per mandate.

---

## 9. Migration sequence — approved in principle

| # | Phase | Member-visible recall |
|---|---|---|
| **0** | Sovereignty prerequisites (§8) | none |
| **1** | Canonical seam — assembler promotion, closed-set parity contract | none |
| **2** | Participation evidence — Turn Participation Manifest (§6) | none |
| **3** | Epistemic + validity representation — standing, status, supersession | none |
| **4** | Query-conditioned candidate retrieval — intra-class only | none *(candidates only; no admission rule yet)* |
| **5** | **Explicit member-invoked recollection (W1)** | ✅ **Case 1, Case 2** |
| **6** | **Contextual doorway participation (W2)** | ✅ Case 5 handled correctly |
| **7** | Broader intelligence-field participation | ✅ beyond memory |

**Phases 0–4 deliberately produce no member-visible recall improvement.** Adjudicated as correct and not to be treated as an apology:

> **This is what prevents making MAIA more powerful before making that power governable.**

**Retrieval must not be activated before the seam, sovereignty and participation evidence are in place.** Adding retrieval first means adding it to `sovereign/app/maia/list` alone — deepening the divergence rather than closing it. **The parity problem gets worse with every capability added upstream of the seam.**

### 9.1 On members experiencing "less memory"

Members may initially experience MIPA as remembering less than an unrestrained retrieval system would. **This is a design principle, not a regression to apologise for:**

> MAIA is not supposed to demonstrate memory by constantly displaying what she knows.

The system that recalls the most is not the system that recollects best. A companion that surfaces every semantically adjacent thing it holds is performing possession, not relationship. What W1 buys is that when the member *does* ask, the answer is there — which is the form of memory that actually matters between people.

---

## 10. Open after adjudication

**Could still change the architecture**

1. **The member gestures MIPA depends on do not exist.** Three are required and none is built: *declare supersession* (§2.4 S2), *endorse an inference* (§4.3), *constrain by context* (P5). Each is a product-design question, not engineering. **Until they exist, S5 inference has no path out of exclusion, and Case 4 has only the temporal-disclosure floor.** This is now the largest single dependency in the architecture.
2. **`contradicted-unresolved` disposition.** Withhold, or admit explicitly as an open question with both representations and no resolution asserted? The second is more honest and more complex; the first is safer and loses real material.
3. **Doorway safety for the conditional classes** (§3.2). `idea_block` atoms carry `LEFT(content, 80)` as title — the member's own words, reviewed at Keep time, but not authored *as a doorway*. Marked episodes carry a member-chosen verbatim span with no separate doorway text. Is member-reviewed sufficient, or must doorway text be member-authored *as* a doorway?
4. **May tier vary the field?** (§7) `memoryContext` reaches FAST only; CORE declares the absence in code. If tier may vary the field, parity must say precisely what it may vary and what it may never vary — otherwise the contract is vacuous.
5. **Does stage 2 resolution require model inference?** *"That relationship I told you about"* may not be structurally resolvable. If a model is needed, machine judgment enters *before* epistemic adjudication, inverting MIPA's own ordering — requiring either a reordering or an explicit bounded exception.
6. **Is there a latency budget?** Unmeasured. FAST targets <2s and already parallelises MemoryBundle, WuXing and astrology. If MIPA does not fit, either tiering changes or the architecture does.

**Could change the estimate, not the shape**

7. Corpus scale across the member base (one member: 446 turns / 24 sessions / 7 days; distribution unknown).
8. Ollama reachability from `maia-sovereign`; query-time embedding vs. corpus backfill profiles.
9. Whether `developmental_memories` rows mostly pass or fail `isValidDistilledSignal` — determines the real size of the S5 exposure.
10. Whether `breakthrough_moments` contains member-marked rows at all — salvage vs. exclusion.
11. What `member_theme_signals` contains at volume — ungated, unbounded, per-turn, unaudited.

**Governance**

12. Who may author standing order, class budgets and participation policy? `MEMORY_SELECTION_POLICY_VERSION` establishes the versioning convention, not who may bump it.
13. Does MIPA become canon? Its covenants generalise Right to Remain Unpossessed, Interface Humility, Recognition Integrity and Constitutional Direction of Authority. Whether they belong in `MAIA_SOVEREIGNTY_INVARIANTS.md` or a separate instrument is a founder act.
14. Is the MIPA name ratified?

---

## STOP

**Architecture only. Nothing implemented.**

No client wired. Semantic retrieval not activated. Sovereignty defects P1–P6 recorded as blocking and **not repaired**. Seam not promoted. Manifest not built. Migration not begun.

**The next artifact, if authorized, is a Phase 0 specification** — the six sovereignty prerequisites, specified and sequenced. It is the only phase whose dependencies are all satisfied today, and it is blocking for everything after it.

Awaiting authorization.
