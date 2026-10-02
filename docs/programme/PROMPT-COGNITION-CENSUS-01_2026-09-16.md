# PROMPT-COGNITION-CENSUS-01 — Standing Prompt Burden Census

**Status:** ACT 1 COMPLETE · READ-ONLY · NO CODE CHANGED
**Opened:** 2026-09-16, founder act (independent read-only census lane)
**Pinned SHA:** `98542ff06e863ee07c7a5d7f105989a56913dd02` (`98542ff0`), branch `claude/modest-brahmagupta-9r5fes`, clean tree
**Prior observation (cited only):** `JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01.md`
**Not attached to:** `TEMPORAL-MEMORY-CUT1-TRACEABILITY-01`

## Governing question

> Of everything presently injected into MAIA's prompt, what genuinely requires token-resident
> cognition every turn, and what can instead operate structurally without occupying the
> cognitive aperture?

## Constitutional boundary (restated, in force)

This lane does not authorize prompt edits · addenda removal or consolidation · aperture widening ·
L1/A6 changes · memory changes · gestalt generation · conversation summarization · injection of
MAIA-authored impressions · implementation experiments · production acts.

⛔ **The gestalt problem is not solved in this lane.** A derived conversational gestalt would be
MAIA-authored interpretation unless and until a separate law establishes its provenance,
corrigibility, authority, and relationship to member self-report. R7b remains load-bearing:
member statement may stand as present self-report; MAIA's interpretation does not silently
become background fact.

⭐ **A `structural candidate` classification is a census finding, not authorization to remove
anything.** Nothing in §5 is a recommendation to act.

---

## 1. Method and its limits

Source-only census at the pinned SHA. Character counts are measured from the template-literal
bodies in source; token figures are `chars / 4`, an **approximation stated as such** and never
quoted as a measurement. Runtime-variable blocks (member data, recall, atoms) are bounded by
their producers, not measured — ⛔ no production read was performed under this lane.

Two measurement corrections made during the census, recorded rather than silently fixed:

- An initial single-line sample of the FAST template at `maiaService.ts:1613` **missed the first
  five interpolations** on lines 1603–1611. The first pass therefore under-reported FAST's
  standing floor and wrongly listed House Knowledge as absent from FAST. Corrected below.
- `astrologyAddendum` (FAST) and `astrologicalContextAddendum` (`MaiaContext`) are the **same
  object under two names** (`maiaService.ts:1491`, `:1980`), not a tier divergence.

---

## 2. Assembly topology — three tiers, two assemblies

| Tier | Entry | Prompt assembly | Aperture |
|---|---|---|---|
| FAST | `maiaService.ts:826` `fastPathResponse` | **inline template literal** `:1603–1614` | own |
| CORE | `maiaService.ts:1707` `corePathResponse` | `buildMaiaWisePrompt` (`maiaVoice.ts:572`) → `appendAllContextAddenda` (`:530`) | `CORE_PROMPT_HISTORY_APERTURE = 4` |
| DEEP | `maiaService.ts:2215` `deepPathResponse` | `buildMaiaComprehensivePrompt` → `buildComprehensiveVoicePrompt` (`intelligentVoiceAdaptation.ts:224`) → same addenda helper | `DEEP_CONSULTATION_APERTURE = 5` |

⭐ **FINDING T1 — there are two independent prompt assemblies, not one.** CORE and DEEP share
`appendAllContextAddenda`; FAST does not call it and restates its own ordered interpolation list.
The ADDENDA_CHANNEL_DIVERGENCE §II.B repair unified CORE↔DEEP; **FAST was never brought into that
channel.** Every future addendum must be added in two places or it silently applies to two tiers
of three.

---

## 3. Standing burden — what is present on EVERY turn

### 3a. FAST (unconditional, in assembly order)

| # | Object | Source | Chars | ~Tok |
|---|---|---|---|---|
| 1 | `MEMORY_AUTHORITY_BLOCK` | `maiaService.ts:203` | 1,553 | 388 |
| 2 | `MAIA_RELATIONAL_SPEC` | `MAIA_RUNTIME_PROMPT.ts:27` | 1,614 | 404 |
| 3 | `MAIA_LINEAGES_AND_FIELD` | `:68` | 2,828 | 707 |
| 4 | `MAIA_CENTER_OF_GRAVITY` | `:113` | 401 | 100 |
| 5 | `PLATFORM_KNOWLEDGE_ADDENDUM` (6 blocks) | `platformKnowledge.ts:191` | 14,554 | 3,639 |
| 6 | `MAIA_RUNTIME_PROMPT` | `:123` | 16,202 | 4,051 |
| 6a | ↳ `${AIN_INTEGRATIVE_ALCHEMY_PROMPT}` | `ainIntegrativeAlchemy.ts:12` | 4,696 | 1,174 |
| 6b | ↳ `${MEMORY_CANON_GUARD_PROMPT}` | `memoryCanonGuard.ts:47` | 2,117 | 529 |
| | **FAST standing total** | | **≈ 43,907** | **≈ 10,977** |

`PLATFORM_KNOWLEDGE_ADDENDUM` = IDENTITY 1,119 + AREAS 5,144 + RELATIONSHIPS 1,480 +
MEMORY_CONSTITUTION 3,311 + ORIENTATION 2,385 + LIMITS 1,115. (`PLATFORM_PUBLIC_CONTEXT` and
`PLATFORM_DIRECTION_PUBLIC` are the public-visitor surface and do **not** enter the member prompt.)

### 3b. CORE (unconditional)

| # | Object | Source | Chars | ~Tok |
|---|---|---|---|---|
| 1 | `MAIA_RELATIONAL_SPEC` | `MAIA_RUNTIME_PROMPT.ts:27` | 1,614 | 404 |
| 2 | `MAIA_LINEAGES_AND_FIELD` | `:68` | 2,828 | 707 |
| 3 | `MAIA_CENTER_OF_GRAVITY` | `:113` | 401 | 100 |
| 4 | complexity voice block (1 of 4) | `maiaVoice.ts:614–693` | ~300–600 | ~75–150 |
| 5 | temporal context | `maiaVoice.ts:168–204` | ~600–900 | ~150–225 |
| 6 | awareness language block | `awarenessLanguageAdapter.generatePromptBlock` | variable | — |
| 7 | `PLATFORM_KNOWLEDGE_ADDENDUM` | `platformKnowledge.ts:191` | 14,554 | 3,639 |
| 8 | `MEMORY_SPEECH_ACT_BOUNDARY` | `maiaVoice.ts:520` | 1,300 | 325 |
| 9 | `PLATFORM_KNOWLEDGE_BOUNDARY` | `maiaVoice.ts:483` | 1,225 | 306 |
| 10 | `INTERFACE_HUMILITY_GUARDRAIL` | `maiaVoice.ts:507` | 834 | 209 |
| | **CORE standing total** | | **≈ 23,800** | **≈ 5,950** |

### ⭐⭐ FINDING T2 — the two tiers do not share a standing floor, in BOTH directions

- **`MAIA_RUNTIME_PROMPT` (≈22,957 ch with its two interpolations) is FAST-ONLY.**
  `maiaVoice.ts:608` destructures only `MAIA_RELATIONAL_SPEC`, `MAIA_LINEAGES_AND_FIELD`,
  `MAIA_CENTER_OF_GRAVITY` from that module. CORE and DEEP never load the runtime prompt,
  and therefore never load `AIN_INTEGRATIVE_ALCHEMY_PROMPT` or `MEMORY_CANON_GUARD_PROMPT`.
- **`MEMORY_SPEECH_ACT_BOUNDARY`, `PLATFORM_KNOWLEDGE_BOUNDARY` and
  `INTERFACE_HUMILITY_GUARDRAIL` are CORE/DEEP-ONLY.** They are appended inside
  `appendAllContextAddenda`, which FAST does not call. This **confirms at this SHA** the
  CMT-01 census finding *"FAST tier missing three standing guardrails (D1)"*.

FAST's standing floor is ≈1.85× CORE's, and the two floors carry **different constitutional
material**. ⛔ This census does not rule on which floor is correct.

---

## 4. The aperture, measured against the floor

`maiaVoice.ts:886–898` (CORE):

- last **4** exchanges (`CORE_PROMPT_HISTORY_APERTURE`, `maiaVoice.ts:427`, applied `:888`);
- the member's message is carried **whole**;
- ⭐ **MAIA's own prior response is truncated to 120 characters** (`maiaMsg.substring(0, 120)`).

### ⭐⭐ FINDING A1 — the ratio

MAIA's own prior words occupy **at most ~480 characters** of a **≈23,800-character** CORE
standing floor — **≈2%**. The instruction-to-own-voice ratio is **≈50:1**.

This is the census's direct answer to the premise in the lane's opening: *we are consuming the
space continuity needs.* ⛔ It is not a finding that the aperture should be widened — that is
explicitly outside this lane, and A6's own R5 forbids A6 from doing it.

### FINDING A2 — A6 and L1 are small and are not the burden

`formatSessionContinuityForPrompt` (`sessionContinuity.ts:100–130`) emits ~4–6 lines. L1
(`sessionRecovery.ts`) emits only when `retrospectiveDemand > 0`, which the module's own header
declares is the no-echo guarantee. **Neither instrument is a significant consumer of the
aperture, and neither can carry gestalt without violating its own ratified law.**

---

## 5. Classification table

Categories as specified. `structural candidate` = the obligation *appears* enforceable by
code/state/routing on this evidence. **Not authorization.**

### 5a. Standing floor

| Object | Tier | Chars | Class | Basis |
|---|---|---|---|---|
| `MAIA_RELATIONAL_SPEC` | all | 1,614 | **cognition-required** | defines who is speaking; no structural substitute exists |
| `MAIA_CENTER_OF_GRAVITY` | all | 401 | **cognition-required** | orientation the generation must carry |
| `INTERFACE_HUMILITY_GUARDRAIL` | CORE/DEEP | 834 | **cognition-required** | governs *how* every signal above is held; shapes generation, not surface form |
| `PLATFORM_KNOWLEDGE_BOUNDARY` | CORE/DEEP | 1,225 | **cognition-required** | feature-vs-account-state distinction must be known before a claim is formed |
| `MAIA_LINEAGES_AND_FIELD` | all | 2,828 | **uncertain** | no falsifier in source establishes what fails without it |
| `MAIA_RUNTIME_PROMPT` (+2) | FAST only | ≈22,957 | **uncertain** | tier-conditional presence is itself unexplained in source; see Q1 |
| `PLATFORM_KNOWLEDGE_ADDENDUM` | all | 14,554 | **structural candidate** | an authored, static *map* — the largest standing object CORE carries; reference material, not behavioural law. Retrieval-shaped on its face. ⛔ See H1 |
| `MEMORY_AUTHORITY_BLOCK` | FAST only | 1,553 | **duplicative / conflicting** | see D1, X1 |
| `MEMORY_SPEECH_ACT_BOUNDARY` | CORE/DEEP | 1,300 | **validator/post-generation candidate** | a forbidden-phrase list over *output*; an enforcement precedent already exists (§5c) |
| `MEMORY_CANON_GUARD_PROMPT` | FAST only | 2,117 | **duplicative** | see D1 |
| `AIN_INTEGRATIVE_ALCHEMY_PROMPT` | FAST only | 4,696 | **uncertain** | not reached by CORE/DEEP at all |

### 5b. Conditional

| Object | Source | Class |
|---|---|---|
| 28 × `ADDENDA_SPECS` | `maiaVoice.ts:434–462` | **conditional cognition** — each gated on a `MaiaContext` field being populated |
| Talk mode block (2,183 ch) | `maiaVoice.ts:~788` | **conditional cognition** |
| Care mode block (1,077 ch) | same | **conditional cognition** |
| Note mode block (457 ch) | same | **conditional cognition** |
| `sessionContinuityAddendum` (A6) | `sessionContinuity.ts:100` | **cognition-required when absent > 0** |
| L1 recovery block | `sessionRecovery.ts` | **conditional cognition** (gated, by design) |
| history aperture | `maiaVoice.ts:886` | **cognition-required** |
| `stateVectorContract` | `maiaService.ts:1593` | **conditional cognition** (check-in only) |
| `youthPromptAddendum` | `maiaService.ts:1597` | **conditional cognition** |
| `sanctuaryInstruction` | `maiaService.ts:1401` | **cognition-required when sanctuary** |

⭐ Talk mode is the **largest mode block by 2×** and is the tier default. Its content
(`maiaVoice.ts:788–790`: *"Sacred mirror through conversational inquiry"*, *"Elegant questions
that open awareness"*) is **cognition-required** — it shapes generation and has no structural
analogue. ⛔ This census makes no finding about whether its content is correct.

### 5c. Post-generation — obligations ALREADY enforced structurally

`finalizeMemberFacingText` (`maiaService.ts:2847`) and the validator path:

| Mechanism | Source | Operates on |
|---|---|---|
| `validateAndRepairResponse` (Socratic) | `maiaService.ts:696` | output; **can trigger a second generation** (`regenerated: boolean`, `:703`) |
| `sanitizeMaiaOutput` / `BLOCKED_PATTERNS` | `maiaVoice.ts:942–961` | output |
| `stripStateVectorBlocks` | `maiaService.ts:2856` | output |
| `enforcePresenceConstraints` | `maiaService.ts:2861` | output |
| `enforceIdentityPredicateConstraint` | `maiaService.ts:2870` | output |
| `filterModeLanguage` | `maiaService.ts:339` | output |
| `applySelfletDeliveryGuard` | `maiaService.ts:420` | output |
| `scrubIdentityDisclaimers` | `maiaService.ts:271` | output |

⭐⭐ **FINDING S1 — the structural pattern is not hypothetical; it is already load-bearing here.**
Eight obligations are enforced on output rather than by standing prompt text. `sanitizeMaiaOutput`
and `enforceIdentityPredicateConstraint` police **exactly the same obligations** that
`MEMORY_AUTHORITY_BLOCK`'s FORBIDDEN PHRASES list polices in prose. The repository has therefore
already demonstrated, in production code, that at least part of this class of instruction can
leave the prompt. ⛔ That is an observation about precedent, not a proposal.

⚠️ **Cost note, recorded because it cuts the other way:** the Socratic validator can cause a
**second full model call** per turn. A structural mechanism that regenerates is not free of
cognition — it relocates it. Any future architecture must count regeneration, not only tokens.

---

## 6. Duplication and interaction findings

### ⭐ D1 — the memory-posture obligation is stated in FOUR separate objects

| Object | Tier | Chars |
|---|---|---|
| `MEMORY_AUTHORITY_BLOCK` (MEMORY section + FORBIDDEN PHRASES) | FAST | within 1,553 |
| `PLATFORM_MEMORY_CONSTITUTION` (inside House Knowledge) | all | 3,311 |
| `MEMORY_CANON_GUARD_PROMPT` (inside `MAIA_RUNTIME_PROMPT`) | FAST | 2,117 |
| `MEMORY_SPEECH_ACT_BOUNDARY` | CORE/DEEP | 1,300 |

**FAST carries three of the four simultaneously. CORE carries two.** No tier carries all four,
and **no tier carries the same set as any other tier.**

### ⭐⭐ X1 — FAST's first instruction and FAST's A6 block pull in opposite directions

`MEMORY_AUTHORITY_BLOCK` is placed **first** in the FAST system prompt, headed
*"MEMORY AUTHORITY (NON-NEGOTIABLE — READ THIS FIRST)"*, and states:

> - NEVER say: "I don't have memory", "I'm starting fresh", "I can't recall."
> - FORBIDDEN PHRASES (NEVER USE THESE): … "I don't have memory of earlier conversations"

A6 reaches FAST **not** through the system prompt but as a prefix on the **user message**
(`fastContinuityPrefix`, `maiaService.ts:1136`, applied at `:1164/:1168/:1171` into
`contextPrompt`, passed as `userInput` at `:1669`), and states:

> Guidance: if the member refers to something from this conversation that you cannot find above,
> say plainly that you do not have that part in front of you and ask them to ground it…

⭐ **These are not formally contradictory** — the block bans claiming *no memory faculty*; A6 asks
her to report *this specific material is not in view*. A careful reading holds both. But the
asymmetry is structural and one-directional:

| | `MEMORY_AUTHORITY_BLOCK` | A6 block |
|---|---|---|
| channel | **system** prompt | **user** message |
| position | **first**, before everything | inside turn content |
| force | "NON-NEGOTIABLE", "NEVER", forbidden-phrase list | "Guidance:" |

**The prohibition is louder, earlier, and in the more authoritative channel than the truthfulness
obligation it constrains.** ⛔ This census does not rule on which should yield. It records that
A6's FAST-path effectiveness is a **live empirical question**, not a settled property — and that
A6's own F1a witness was run before this interaction was named.

### D2 — `getTemporalContext` duplicates its own body

`maiaVoice.ts:168–176` and `:196–204` carry near-identical astrology/timing instruction in the
with-timezone and without-timezone branches. **Only one fires per turn**, so this is a maintenance
duplication, **not** a per-turn burden. Recorded to prevent it being counted twice.

### D3 — the FAST/CORE addendum lists have drifted

Present in `ADDENDA_SPECS` and absent from the FAST template: `bridgeSnapshotAddendum`,
`captureContextAddendum`, `consultationAddendum`, `guestContextAddendum`,
`journalContextAddendum`, `relationshipModeAddendum`, `sessionContinuityAddendum` (FAST
substitutes its own user-message channel — see X1). Present in FAST and absent from
`ADDENDA_SPECS`: `knowledgeFieldAddendum`, `memoryInfluenceAddendum`, `forwardReadinessAddendum`,
`practiceFieldAddendum`, `stateVectorContract`, `youthPromptAddendum`, `cognitiveScaffolding`,
`wisdomInjection`, `modeAdaptation`, `timeAwareness`, `userIdentification`,
`sanctuaryInstruction`, `relationshipContext`, `selfletPromptBlock`. (`astrologyAddendum` is an
alias, not drift — see §1.)

### O1 — a structural alternative already exists, in shadow

`lib/maia/canonical-turn/` carries a **closed producer registry** with explicit `provenance` and
`consentBasis` per producer (`producerRegistry.ts:78–90`) and a standing floor assembled in code
(`floor.ts:23–26`, ordered `position: 'last'`). Per the project anchor, CMT-01 M0–M2 landed as a
**shadow** construction; legacy assembly remains response-producing and M3 is unauthorized.
⭐ **The question this lane asks already has a partially-built instrument.** ⛔ Recorded as a fact
about the repository; this lane does not authorize advancing it.

---

## 7. Smallest set the source supports as requiring every-turn cognition

On this evidence only, and stated conservatively:

1. `MAIA_RELATIONAL_SPEC` — 1,614 ch
2. `MAIA_CENTER_OF_GRAVITY` — 401 ch
3. `INTERFACE_HUMILITY_GUARDRAIL` — 834 ch
4. `PLATFORM_KNOWLEDGE_BOUNDARY` — 1,225 ch
5. the active mode block (Talk 2,183 / Care 1,077 / Note 457)
6. the history aperture + A6 facts when `absent > 0`

**≈ 6,257 characters (≈1,564 tokens) of standing instruction**, against a measured CORE floor of
≈23,800 ch and a FAST floor of ≈43,907 ch.

⚠️ **This is a lower bound derived from absence of contrary evidence, not a proof of
sufficiency.** Nine objects are classified `uncertain` or `structural candidate` precisely because
source alone cannot establish what fails without them. **⛔ This set is not a proposal, not a
target, and not authorization to reduce anything toward it.** The correct reading is: *the gap
between 6,257 and 23,800 is the size of the open question*, not the size of an available saving.

---

## 8. Unresolved questions

- **Q1** Why is `MAIA_RUNTIME_PROMPT` FAST-only? Source carries no comment explaining the
  asymmetry. Deliberate tier policy, or drift from the two-assembly split (T1)?
- **Q2** Which floor is constitutionally correct — FAST's (runtime prompt, no guardrails) or
  CORE's (guardrails, no runtime prompt)? They cannot both be.
- **Q3** Does A6 survive X1 on the FAST path in production? Unanswerable from source.
- **Q4** What observable failure follows from omitting `MAIA_LINEAGES_AND_FIELD` or
  `AIN_INTEGRATIVE_ALCHEMY_PROMPT`? No falsifier exists for either.
- **Q5** Is House Knowledge (14,554 ch, every turn, every tier) load-bearing for generation, or
  reference material that a retrieval boundary would serve? **H1 below is the hazard.**
- **Q6** Does the Socratic validator's regeneration path re-enter with the same standing floor?
  Not traced in this census.

## 9. Falsifiers for any successor

- **F-C1** A candidate claiming an object is a `structural candidate` must exhibit the observable
  member-visible failure that occurs when it is absent from prompt cognition. Absence of a
  falsifier is **not** evidence of dispensability. (Directly answers Q4.)
- **F-C2** Any change to the standing floor must be applied to **both** assemblies (T1) or
  demonstrate why a tier-conditional floor is correct. A change landing in one assembly only is a
  **failed** candidate, not a partial one.
- **F-C3** ⭐ A candidate that resolves X1 by weakening A6 fails. A6's purpose is truthfulness
  about absence; a repair that restores fluency by reducing truthfulness is the defect, not the fix.
- **F-C4** A candidate reducing standing tokens while increasing regeneration rate has **not**
  reduced cognition. Both must be measured.
- **F-C5** ⛔ **H1 — THE STANDING HAZARD.** Moving House Knowledge (or any authored map) behind a
  retrieval boundary converts an *always-true* statement into a *sometimes-retrieved* one. MAIA
  would then be able to speak about the house while holding an incomplete map, **without knowing
  the map was incomplete** — the exact defect class A6 exists to prevent at the conversational
  layer. Any retrieval candidate must carry its own A6-equivalent: it must be able to state what
  it does not currently have in view. A retrieval design without that property fails.

---

## 10. Inbound research direction — RECORDED, NOT ADOPTED

A founder research message received mid-census proposes a relational-geometric substrate for
gestalt (typed graph + selective hyperedges for higher-order configuration; temporal geometry for
trajectory/recurrence; sheaf-like local-to-global consistency yielding an explicit *no global
section* rather than forced synthesis), with four proposed falsifiers (Silver Cedar/gestalt,
Correction, Return, Freedom/LC-20).

**Disposition:** ⛔ **OUT OF SCOPE FOR THIS LANE** by its own charter. Recorded here only so it is
not lost, and so its relationship to this census is stated:

- ⭐ **The census is an INPUT to that question, not a competitor.** §5's `structural candidate` and
  `duplicative` classifications are the empirical form of *"which instructions could become
  properties of the substrate"*. §6/D1 and §6/X1 are concrete instances.
- ⭐ The message's own fourth point — that lifting data into higher-order topology does not help
  unless the induced structure is meaningful for the task — is **the same discipline this census
  applies**, and it cuts both ways: `structural candidate` is a hypothesis about an obligation, not
  a licence to build a substrate for it.
- ⚠️ **The cited literature is UNVERIFIED in this lane.** No network read was performed; the
  citations arrived with third-party tracking parameters. They are recorded as *claims to be
  verified by the successor lane*, ⛔ not as established evidence.
- ⛔ **The governing hazard is preserved unchanged.** A hypergraph, a sheaf section, and a prose
  summary are the same constitutional object when MAIA authored them: derived interpretation.
  Mathematical structure does not by itself confer provenance, standing, or corrigibility —
  those remain a **separate law**, not a property of the data structure.

---

## 11. Standing

**PROMPT-COGNITION-CENSUS-01 · ACT 1 COMPLETE · READ-ONLY.**

Census complete · burden measured at `98542ff0` · classification table delivered · T1/T2/A1/D1/X1/
S1/O1 recorded · smallest every-turn set stated as a LOWER BOUND with its hazard · six open
questions · five falsifiers · H1 standing hazard named.

⛔ NO PROMPT EDIT · ⛔ NO ADDENDA REMOVAL · ⛔ NO APERTURE CHANGE · ⛔ NO L1/A6 CHANGE · ⛔ NO MEMORY
CHANGE · ⛔ NO GESTALT DESIGN · ⛔ NO SUMMARIZATION · ⛔ NO IMPLEMENTATION · ⛔ NO SUCCESSOR LANE
OPENED · PRODUCTION UNTOUCHED.

**Sequence protected:** census → architectural finding → governance of gestalt → only then
implementation. This record is step one and stops here.

⭐ *The aperture is not small because memory is missing. It is small because the room was already
full when the conversation arrived.*
