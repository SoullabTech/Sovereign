# SD-00 — DOCTRINE & SUBSTRATE CENSUS · FINDINGS

```
LANE        JARVIS-SPIRALOGIC-DEVELOPMENTAL-ALIGNMENT-01
MOVEMENT    SD-00 · RUN 2026-09-10 · READ-ONLY
SCOPE DOC   …_SD-00_DOCTRINE_CENSUS_2026-09-10.md
BASE        working tree on claude/nice-mayer-e96lxb
METHOD      static read of repository doctrine + code + migrations
NOT USED    no member data · no production database · no runtime observation
SD-01       REMAINS GATED. This census does not open it.
```

> **No lived phenomenology is inferred anywhere in this document. Nothing here
> establishes that a member experienced Fire, entered Water, achieved alchemy, or
> completed a spiral.**

---

## 0. Headline — five findings dominate

```
1  ⭐⭐⭐ THE ONLY CODE-LEVEL DEFINITION OF SPIRALOGIC IS AN 8-LINE PROMPT STRING
      WITH ZERO IMPORTERS. It defines the elements as DOMAINS, not processes.

2  ⭐⭐⭐ THE ENCODED ARCHITECTURE CORROBORATES THE SD-Q1 RULING. The 12 phases
      are 4 elements × 3 sub-phases. Aether has its own 1/2/3 gradation and is
      NOT in the count of twelve.

3  ⭐⭐⭐ THE MEMBER-NOTICING ASYMMETRY IS REAL AND LARGE. Every "self-awareness"
      construct located belongs to MAIA or is a system-assigned score. No surface
      records the member noticing their own process.

4  ⭐⭐ ONE GF-6 EXPOSURE IS PRECISE AND THE REMEDY IS ALREADY IN SCOPE.
      Elemental evidence scores the member's words against the element MAIA's
      own state already holds. `maiaResponse` sits unused in the same context
      object. Provenance: INDETERMINATE.

5  ⭐⭐ THE COGNITIVE OS IS THE STRONGEST CONSTITUTIONAL SUBSTRATE FOUND — and it
      is also where the rank/recurrence risks concentrate. It carries immutable
      evidence, falsifiability anchors, member annotation including
      `clear_influence`, and an explicit provenance field that is deliberately
      barred from the gates.
```

⛔ **Nothing in §0 is a violation claim.** Classification is conservative: no
semantics that were never constituted are called an offence.

---

## 1. Finding A1 — the canonical code definition is dormant and non-processual

`lib/maia/spiralogicReference.ts` is **8 lines**. CLAUDE.md names it as the
project's Spiralogic reference ("Consciousness framework: Spiralogic (see
`/lib/maia/spiralogicReference.ts`)").

```
AUTHORITY      CODE (a prompt string)
IMPORTERS      ZERO — grep for SPIRALOGIC_REFERENCE returns only its own
               definition line
```

Its content, and its divergence from the charter's frozen formulation:

| | `SPIRALOGIC_REFERENCE` | Charter (SP-FR-01/02) |
|---|---|---|
| Elements are | **domains / faculties** — "Earth (grounding/embodiment), Water (feeling/psyche), Fire (activation/will), Air (perspective/mind)" | **process-events** of interface |
| Order | **Earth → Water → Fire → Air → Aether** | Fire → Water → Earth → Air |
| Movement | "maps inner change through elemental **cycles**" | a **spiral**, not a cycle |
| Aether | "**integration/wholeness**" | ⭐ **agrees with the SD-Q1 ruling** |
| Recurrence | "revisited in spirals (the 'same' themes at deeper **octaves**)" | ⭐ **agrees with SP-FR-05** |

⭐ **Two of five already agree with the charter, and one is the ruled question.**
The divergence is concentrated in **process-vs-domain** and **cycle-vs-spiral**
language, not in the deep structure.

⛔ **Divergence recorded, not reconciled.** Per SD-00's mandate the older text is
neither overwritten nor deferred to.

⚠️ **The fact that matters most is the zero importers.** Whatever MAIA is told
about Spiralogic at runtime, it is **not this string**. Where the runtime
definition actually comes from is **not established by this census** and is an
SD-01 question.

---

## 2. Finding A2 — the 12-phase architecture is 4 × 3, and Aether sits outside it

Canon carries a complete 3-gradation set per element:

```
Fire 1 · Fire 2 · Fire 3        Water 1 · Water 2 · Water 3
Earth 1 · Earth 2 · Earth 3     Air 1 · Air 2 · Air 3          = TWELVE

Aether 1 · Aether 2 · Aether 3  — present, gradated, NOT in the twelve
  "Aether 1 | Opening — space becomes available"
  "Aether 2 | Dissolution of boundaries — separation softens"
  "Aether 3 | Unity / presence — nothing stands apart"
```

`SpiralogicPhase = 1 | 2 | … | 12` (`lib/types/interpretive-ledger.ts:35`).
`member_spiral_state.phase INTEGER CHECK (phase BETWEEN 1 AND 12)`.

> ⭐⭐⭐ **The encoded architecture independently corroborates the SD-Q1 ruling.**
> Aether has depth without being a rung: it is gradated but uncounted. That is
> exactly "integrative/witnessing dimension, not a fifth co-equal process-event."

Canon also already distinguishes senses of the word, in its own voice:

```
"Aether (abiding awareness / ontological state) are not the same word at th…"
"Aether (Chapter 9) is canonically NOT a doorway: the system refused doorwa…"
"Aether | Quintessentia | holds | coherence"
"AETHER (Stillness, unity, field)"
"Aether | Tao | the unnamed"
```

⭐ **Five framings, kept separate as §2/E requires**: abiding awareness / state ·
**refused as a doorway** · quintessence that *holds coherence* · stillness-unity-**field**
· the unnamed (Daoist). ⛔ **Not reconciled.** The "refused as a doorway" entry is
the most consequential: canon has already declined to treat Aether as an entrance,
which is structurally the same restraint as declining to treat it as a rung.

---

## 3. Finding A3 — ⭐⭐⭐ the member-noticing asymmetry

Census item 14. Searched for any affordance recording **the member noticing their
own process**. Every hit belongs to MAIA or is system-assigned:

```
lib/consciousness/MAIASelfAwareness.ts              MAIA's self-awareness
lib/consciousness/maiaArchitectureContext.ts:261    buildSelfAwareContext() — MAIA's
lib/agents/modules/ResponseGenerator.ts:599         polarisState.selfAwareness += 2
                                                    ← a score the SYSTEM increments
lib/consciousness/memory/MAIAMemoryArchitecture.ts  selfAwarenessLevel: 0.78
                                                    ← a hardcoded literal
lib/field/ResonanceFieldOrchestrator.ts:641         selfAwareness / 100 * 180
```

**Member-voice affordances DO exist — and they are all reactive to MAIA's
interpretations, not records of the member's own noticing:**

```
cogos_annotation_type = contest · clarify · confirm · clear_influence
   → app/api/members/ledger/annotate/route.ts
cogos_contradiction_source.user_correction   weight 0.95 (highest)
atoms is_breakthrough                        member-marked
```

> **The distinction is the finding.** A member can **contest, clarify, confirm or
> clear the influence of MAIA's map**. There is no surface anywhere in which a
> member records *"I notice I went straight from Fire into Air before I let
> myself feel its Water."*

```
AFFORDANCE FOR MAIA NOTICING THE MEMBER      extensive, multi-layered, gated,
                                             confidence-weighted, decayed
AFFORDANCE FOR THE MEMBER NOTICING THEMSELF  ⭐ NONE LOCATED
AFFORDANCE FOR CORRECTING MAIA'S NOTICING    present and unusually strong
```

⛔ **This is an affordance gap relative to the stated purpose, NOT a developmental
failure.** §5's ceiling forbids the stronger claim: this census cannot establish
that members are not developing, only that **if the member's own noticing is the
developmental signal (Amendment G), the substrate does not currently preserve
it.** The founder's formulation is the accurate one: *the system is becoming more
conscious of the member faster than it is supporting the member in becoming more
conscious of themselves.*

⚠️ **Negative result discipline:** this is an absence established by search across
`lib`, `app`, `database` on member/self/notice/recognize/declare vocabulary. A
differently-named affordance could exist. The absence is asserted at the strength
of a keyword census, not of an exhaustive read.

---

## 4. Finding A4 — ⭐⭐ the GF-6 exposure, stated precisely

`lib/consciousness/observationExtractor.ts` → `extractElementalActivation`:

```ts
const text  = ctx.userMessage.toLowerCase();   // ← the MEMBER's words
const el    = ctx.currentElement;              // ← MAIA-side state
const score = scoreElementalAlignment(text, el);
if (score < 0.55) return null;
observation = `${el}-element activation in ${domain} domain`;
```

```
TurnContext = { sessionId, memberId, userMessage, maiaResponse,
                currentElement, currentPhase, currentMode, conversationDepth }
```

**What is good here, and should be credited:** the text signal is the member's
own words. `maiaResponse` is **not** read. This is **not** the crude loop (MAIA
says Water → member echoes "Water" → confirmed).

**What the exposure is:** the element the member's language is scored *against*
is `ctx.currentElement` — conductor state which, per CLAUDE.md's Bridge D
section, is **seeded from `member_spiral_state` when the hysteresis buffer is
empty**, i.e. carried forward from prior turns' determinations. So the shape is:

```
prior turns determine element E
        ↓
member's language scored for alignment with E
        ↓
score ≥ 0.55 → evidence_type 'elemental_activation'
        ↓
recurrence_count++  →  gate_recurrence  →  promotion to ledger
        ↓
target_store 'state_store' = Bridge D = the state that supplied E
```

Whether the member's language in turn *n* was shaped by MAIA's E-inflected
responses in turns *1…n−1* is **not establishable from the substrate.**

```
PROVENANCE STATE:  INDETERMINATE        → GF-6 EXPOSURE
NOT:               MAIA-SEEDED treated as independent confirmation
                                        → would be GF-6 FAILURE, NOT ESTABLISHED
```

⭐ **The remedy is already in scope:** `maiaResponse` is present in `TurnContext`
and unused by this extractor. The channel that would let the substrate answer the
provenance question is already at hand. ⛔ Not authorized; recorded as a finding.

### Recurrence without provenance (founder's test, applied)

`accumulating_hypotheses.recurrence_count` + `gate_recurrence` make recurrence a
**formal promotion gate**. Nothing distinguishes five independent member signals
from five conversations carrying one hypothesis forward.

⭐ **One genuine mitigation exists and must be credited:** `cross_context_count` /
`context_types_seen` / `gate_cross_context` require the pattern to appear across
**different context domains**. That is a real independence proxy — a MAIA-seeded
framing is more likely to recur within a context than across several. ⛔ It is a
proxy, not provenance.

### Evidence types, classified by provenance

| `cogos_evidence_type` | Provenance state |
|---|---|
| `explicit_statement` — direct self-disclosure, **highest weight** | ⭐ **MEMBER-INITIATED** |
| `elemental_activation` — signal from conductor | **INDETERMINATE** (§4) |
| `behavioral_pattern` | INDETERMINATE |
| `emotional_register` | INDETERMINATE |
| `verbal_pattern` — "recurring word choices **or framings**" | ⚠️ **INDETERMINATE, highest risk** — a framing MAIA introduced and the member adopted is indistinguishable here |
| `topic_avoidance` | INDETERMINATE |

⭐ **The weighting is pointed the right way**: member self-disclosure carries the
highest evidence weight and `user_correction` the highest contradiction weight
(0.95). The design already privileges the member's voice. The exposure is in what
happens to the *other five* types.

### ⭐⭐ The sharpest single fact in the census

```sql
-- Source audit trail — archival only, never used for routing
originating_agent   TEXT NOT NULL DEFAULT '',
originating_model   TEXT NOT NULL DEFAULT '',
original_language   TEXT NOT NULL DEFAULT '',

COMMENT ON COLUMN accumulating_hypotheses.original_language IS
  'Archival only. Never used for routing, gate evaluation, or promotion.';
```

**A provenance field exists and is explicitly barred from influencing
confidence.** ⚠️ Read honestly: this bar was almost certainly written for a
*different and good* reason — keeping a specific agent's or model's authorship
from acquiring routing authority, which is itself an anti-capture discipline. It
is **not** evidence of a GF-6 failure. But it means the one provenance channel
the substrate has is constitutionally prevented from answering the GF-6 question.
⛔ Whether that is the right trade is a founder question, not a census verdict.

---

## 5. Finding A5 — `phase` classified P · C · R · O (SD-Q2)

### The name `phase` carries at least seven incompatible ontologies

| Site | Semantics | Class |
|---|---|---|
| `member_spiral_state.phase` 1–12 | Spiralogic position | **P/C** — see below |
| `agent_runs.phase` | 'intake, process, integrate' — **MAIA's own** pipeline | P · **SP-FR-07 relevant** |
| `state_vectors.primary_phase` | 'entering / in / exiting' | P |
| `member_spiral_state.relational_phase` 1–4 | orientation→capacity→autonomy→seasonal return | ⚠️ **ordinal maturation** |
| `prompt_library.refinement_phase` | **'emergence / deepening / mastery'** | ⚠️ **R-shaped vocabulary** (of a *prompt*, not a member) |
| `event_arc.phase` | 'pre / during / post' | P |
| breathwork / regulation-minute `phaseState.phase` | breath-cycle timing | unrelated |

⛔ **Different columns, so not a single overloaded field — but one word teaching
seven ontologies across the codebase is itself a legibility collision**, and
`refinement_phase`'s *emergence → deepening → mastery* is rank vocabulary living
one import away from member-facing developmental language.

### `member_spiral_state.phase` — classification

```
P  PROCESS ADDRESS      ✓ 1–12 = 4 elements × 3 sub-phases (Finding A2)
C  CONTINUITY CURSOR    ✓ Bridge D's stated purpose is anti-regression continuity,
                          "NOT personalization. NOT psychometrics." (CLAUDE.md)
R  DEVELOPMENTAL RANK   ⛔ NOT ESTABLISHED from this census — no comparison,
                          ordering, gate, eligibility or threshold on phase value
                          was located
O  OVERLOADED           ⚠️ PARTIAL — see the referent problem below
```

### ⚠️ The referent problem is real: `phase` is globalized

`member_spiral_state` is **one row per member**, holding one `phase`, one
`dominant_element`, one `motion`, one `intensity`. There is **no thread, process,
encounter or scope column.**

> Per the SD-Q2 ruling, *a phase value must not silently mean "where the member
> is."* **Structurally, this row can only mean that.** The referent is the member.

⭐ **Mitigating fact, and it matters: `phase` 1–12 is NOT surfaced to members.**
Searched `app`, `components`, `lib` for phase interpolation into member-facing
strings. Hits were breath-cycle phase (unrelated) and `spiralogic_phase` on a
**community event** (a property of an event, not a claim about a person). **No
"You are in Phase 7" surface was found.** The globalized referent is currently
**interior**, which is where GF-4 is not yet in contact with a member.

⛔ Classified **P + C, with a globalized referent and no scope channel** — an
architectural exposure rather than a rank collision. Per SD-Q2: *the schema
admitting a use does not settle what it means; hierarchy is the issue, not order.*
**No hierarchy on phase was found.**

---

## 6. Finding A6 — `dominant_element`, two uses, opposite verdicts

### ⭐ LAWFUL — the live path scopes it to a process

`lib/consciousness/participatoryReality.ts:67` — `dominant_element` is a field of
**`ThemeRecurrence`**, computed in `participatoryRealityHelper.ts` as the most
frequent element *across the occurrences of one theme*.

```
REFERENT   a theme / thread — NOT the member
SCOPE      ⭐ process-scoped, exactly as SD-Q2 requires
LIVENESS   LIVE — imported by lib/sovereign/maiaService.ts (the FAST/CORE path)
           and app/api/between/chat/route.ts
```

⭐ **And its prompt injection is written in the charter's own spirit**, before the
charter existed:

```
"[Participatory lens — soft signal only]: The theme of "X" has appeared N times
 recently. You may hold this as background context, but do not impose it.
 Bridge only if the member's language calls toward it."
```

**That is a return-to-encounter instruction** — *bridge only if the member's
language calls toward it* — and the nearest thing to an SP-FR-03 mechanism found
anywhere in this census. ⚠️ It is a **prompt instruction, not an enforced
constraint**; whether MAIA obeys it is unmeasured and unmeasurable from code.

⚠️ It is also a GF-6 surface by construction: a recurrence count is injected into
the prompt, and nothing downstream distinguishes a theme the member raised from a
theme MAIA bridged to. Provenance: **INDETERMINATE**.

### ⚠️ COLLISION — element as *nature*, in a dormant chain

`lib/consciousness/maia-synchronistic-wisdom.ts:434`:

```
`This speaks to your ${memberProfile.dominant_element} nature and your current
 work in phase ${memberProfile.current_spiral_phase} of your spiral journey.`
```

This is **element-as-identity** ("your X **nature**") plus **phase-as-location**
("your current work in phase N"), asserted to the member — the exact shape SD-Q2
named as *GF-4 through the back door*. It is additionally **selected at random
from three alternatives** (`Math.floor(Math.random() * …)`), so no reasoning
stands behind the attribution at all.

```
⛔ LIVENESS: maia-synchronistic-wisdom is imported ONLY by
   lib/consciousness/maia-master-oracle.ts — which has ZERO importers.
   The chain is DORMANT. No member-facing path to this string was found.
```

⛔ **Classified: COLLISION IN DORMANT CHAIN — not a live defect, and not an
offence.** Recorded because *a dormant possessive cartography is a design
disposition the lane must name before it becomes live* (charter SD-04d).

Also located, not characterized: `awareness-levels.ts` and
`consciousness-evolution-types.ts` carry `dominant_element` in member-profile
shapes. ⛔ Not traced in this census.

---

## 7. Finding A7 — the one rank surface found, and it is not phase-driven

`lib/consciousness/awareness-levels.ts` → `calculateAwarenessLevel`:

```
LEVELS   1 Newcomer · 2 Explorer · 3 Practitioner · 4 Student · 5 Integrator
DRIVER   relationshipPhase ('new'|'developing'|'established'|'deep')
         + totalEncounters, with Math.max floors at 5 / 20 / 50 / 100 encounters
```

```
⚠️ CORRECTION TO AN IN-FLIGHT READ DURING THIS CENSUS: this is NOT driven by
   Spiralogic phase 1–12. The driver is ENGAGEMENT VOLUME and relationship
   duration. An earlier reading in this run treated `relationshipPhase` as the
   12-phase field; it is a four-valued relationship descriptor.
```

So: **an ordinal, named, monotonically non-decreasing attainment rank about a
person, driven by encounter count.** "Integrator" is reached at 100 encounters.

⛔ **Not an SD-Q2 finding** (phase is not its input). It is a **measured-attribute
rank** of the family the Circles I0 census already flagged (`contribution_tier`,
`min_cognitive_level`). ⭐ **Whether time-served rank is better or worse than
phase rank is not a question this census answers** — but *it is a rank, and its
vocabulary is developmental attainment.* Carried to SD-04a/SD-04d.

Also: `relational_phase` 1–4 (orientation → capacity → autonomy → seasonal
return) is ordinal by construction. ⭐ Its fourth value is a **return**, which is
spiral-shaped rather than ladder-shaped — a point in its favour. Not classified.

---

## 8. Finding A8 — the Cognitive OS is the strongest constitutional substrate found

Recorded because the charter's inverse-drift discipline requires it: *live or
built infrastructure that behaves well must be named, not only what fails.*

```
⭐ IMMUTABLE EVIDENCE        hypothesis_evidence_events cannot be modified once
                            written — "interpretations built on evidence are
                            revisable; the evidence itself is not"
⭐ HYPOTHESES, NOT FACTS     status accumulating → eligible → worthy → promoted,
                            with discarded and expired as first-class outcomes
⭐ FALSIFIABILITY ANCHORS    contradiction_conditions[] and decay_conditions[]
                            REQUIRED for ledger admission
⭐ CONTRADICTION AS A TYPE   user_correction weighted 0.95 — highest of any signal
⭐ MEMBER ANNOTATION         contest · clarify · confirm · clear_influence
⭐ LINEAGE NOT REPLACEMENT   parent_hypothesis_id — "refinement of an earlier
                            hypothesis (not replacement)"
⭐ BOUNDED INFLUENCE         routing_influence_weight DEFAULT 0.05
⭐ EPHEMERAL AS A TARGET     'interesting but not worth storing' is a legal outcome
```

⭐⭐ **`clear_influence` is the strongest GF-4 mitigation located in the
codebase**: the member can remove an interpretation's influence, not merely
disagree with it. **That is map-corrigibility implemented, not just declared.**

⛔ **Liveness: the Cognitive OS reaches exactly one route** —
`app/api/members/ledger/route.ts` (plus `…/annotate`). It was **not found** in
`lib/sovereign/maiaService.ts`, `lib/maia/**`, or the live MAIA conversation
paths. **Built substrate, narrowly wired.** Cat-3 in the anchor's typology.
⚠️ Not asserted beyond the grep: SD-01 must establish its actual call graph.

---

## 9. Six falsifier exposures — current state from code alone

| | Exposure | Basis |
|---|---|---|
| **GF-1** spiral | ⛔ **NOT ANSWERABLE AT SD-00.** Requires tracing whether a completed passage changes later affordance — SD-02's work. | — |
| **GF-2** classification for alchemy | ⚠️ **EXPOSURE, dormant.** §6's element-as-*nature* string tells the member what they are; chain dormant. No live instance found. | §6 |
| **GF-3** emissary as Master | ⭐ **PARTIAL MITIGATION FOUND, unenforced.** The participatory hint explicitly instructs *do not impose · bridge only if the member's language calls toward it.* A prompt instruction, not a constraint. `shouldPromptForConfirmation` — the memory layer's one ask-the-member mechanism — has **zero callers** (confirmed: one grep hit, its own definition; CLAUDE.md concurs). | §6 |
| **GF-4** map replaces terrain | ⚠️ **EXPOSURE, interior.** `member_spiral_state` globalizes element+phase to the person with no scope channel; **not surfaced to members**. `clear_influence` is a real counterweight on the ledger side. | §5 · §6 · §8 |
| **GF-5** MAIA's process as the member's | ⚠️ **STRUCTURAL EXPOSURE.** `agent_runs.phase` (MAIA's pipeline) and `member_spiral_state.phase` (a claim about a person) are both `phase`; `lib/agents/elemental/*` (MAIA's) and `dominant_element` (the member's) are both elemental. **No merge point was located.** Owner is recoverable from producing code, **not carried in the representation.** | §5 · SD-Q3 |
| **GF-6** manufactured evidence | ⚠️ **EXPOSURE, precise.** Provenance INDETERMINATE for five of six evidence types; recurrence is a promotion gate with no provenance test; the one provenance field is barred from the gates; `cross_context_count` is a genuine partial proxy. **No witnessed failure.** | §4 |

⛔ **No GF was found to have FAILED.** Every entry above is an exposure, an
absence, or a collision in a dormant chain. Per the founder's precision:
*the vulnerability exists before the failure is witnessed* — and naming a
vulnerability is not naming a failure.

---

## 10. Outputs owed by the scope document

```
A  doctrine register, authority-classified      §1 · §2 (partial — see §11)
B  divergence list                              §1 table
C  referent inventory                           §5 · §6 · §12
D  phase classified P·C·R·O                     §5
E  Aether framings enumerated, kept separate    §2 (five framings)
F  evidence for SD-Q3 — EVIDENCE ONLY           §9 GF-5 · §12
F2 does a provenance channel exist?             §4 — YES, and it is barred
F3 is member noticing recorded?                 §3 — NONE LOCATED
G  what this census could not establish         §11
```

## 11. ⛔ What this census did NOT establish

```
· any lived phenomenology whatsoever
· that any member experienced any elemental process
· that any manufacture loop has closed
· whether MAIA obeys the "do not impose" prompt instruction
· what definition of Spiralogic actually reaches MAIA's prompt at runtime
  (SPIRALOGIC_REFERENCE has zero importers; the live source is UNTRACED)
· the Cognitive OS's true call graph beyond one route
· whether `member_spiral_state`'s globalized referent causes any harm
· the semantics of awareness-levels / consciousness-evolution member profiles
· SD-Q3 — whose process lib/agents/elemental/* represents (NOT RESOLVED;
  the elemental agents' code was NOT read in this run)
· any production data — no database was touched
· prose doctrine beyond keyword census; no canon file was read end to end
```

⚠️ **The doctrine register (output A) is partial by keyword census, not by full
reading.** 23 canon files mention Spiralogic and 23 carry elemental vocabulary;
none was read in full. **A complete authority-classified register of canon prose
remains owed** and is the honest residue of this run.

## 12. Referent inventory — consolidated

| Field | Referent | Scope | Owner | Class |
|---|---|---|---|---|
| `member_spiral_state.dominant_element` | **the member** | ⚠️ global | member (inferred) | foreground-or-whole **UNRESOLVED** |
| `member_spiral_state.phase` 1–12 | **the member** | ⚠️ global, no scope column | member (inferred) | **P + C**, interior |
| `member_spiral_state.relational_phase` 1–4 | the member | global | relationship | ordinal, 4th value is a return |
| `ThemeRecurrence.dominant_element` | ⭐ **a theme** | ⭐ process-scoped | member's themes | **LAWFUL** |
| `agent_runs.phase` | ⭐ **MAIA's pipeline** | per run | **MAIA** | P · GF-5 name collision |
| `accumulating_hypotheses.element/phase_at_creation` | context of an inference | per hypothesis | MAIA's inference | ⭐ correctly framed as hypothesis |
| `hypothesis_evidence_events.context_element` | an observation | per event | mixed by `evidence_type` | ⚠️ provenance INDETERMINATE |
| `AwarenessLevel` 1–5 | **the member** | global | system-assigned | ⚠️ **RANK** (encounter-count driven) |
| `prompt_library.refinement_phase` | a prompt | per prompt | system | rank vocabulary, non-member |
| `lib/agents/elemental/*Agent` | ⛔ **UNRESOLVED** | — | ⛔ **SD-Q3** | not read this run |

---

## Stage log

- **2026-09-10 — SD-00 RUN.** Read-only static census of repository doctrine,
  code and migrations. No member data, no production database, no runtime
  observation. Findings A1–A8, six falsifier exposures, referent inventory,
  and §11 residue recorded. **No GF found failed. SD-Q3 not resolved. SD-01
  remains gated.** One in-flight misreading (awareness level as phase-driven) is
  corrected in place at §7 rather than removed.
