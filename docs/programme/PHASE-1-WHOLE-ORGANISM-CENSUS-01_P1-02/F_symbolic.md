# P1-02 · DOMAIN F — SYMBOLIC SYSTEMS

```text
STEP       P1-02 · PARALLEL ORGANISM CENSUS
DOMAIN     F — SYMBOLIC SYSTEMS (non-elemental symbolic machinery)
SUBJECT    1a5554300e855d3581085849301a39cbb10ab385
TYPE       RECORD ONLY — evidence, never rulings
AUTHORITY  READ / TRACE / CLASSIFY
```

> ## ⭐⭐ P1-02 asks what the organism does.
> ## It does not infer from doing that the organism is authorized to do it.

> ⚠️ **Domain-specific restatement:** *Do not infer authority from symbolic sophistication.*
> An elaborate archetypal engine proves an elaborate file exists. This domain contains the
> largest, most internally coherent symbolic corpora in the repository. **Size, fidelity to
> tradition, and internal consistency are not evidence of governance.**

---

## 0 · Census surface verification

The container is checked out at `f0279c5b0eee0ae7090df38b67d820923917c58c`, **not** at the
census subject. Verified rather than assumed:

```text
git merge-base --is-ancestor 1a55543… HEAD   → subject IS ancestor of HEAD
git diff --stat 1a55543… HEAD -- lib/ app/ components/ database/   → EMPTY
```

⭐ The two commits between subject and HEAD are documentation-only. **Every `file:line` citation
below is therefore valid at the census subject**, the code surface being byte-identical.

**E-1 held:** repository depth is 1,098 commits. No claim below rests on history beyond the
current tree.

### Coordination with Domain E

Domain E owns Spiralogic / elemental. This record owns the **other** symbolic machinery. Three
bodies sit on the boundary and are **noted and left to E**, not censused here:

| Material | Why it is E's |
|---|---|
| `lib/consciousness/UnifiedSpiralogicAlchemyMap.ts` + ~10 files carrying `nigredo/albedo/rubedo` | stages ride inside Spiralogic objects (§7) |
| Wu Xing / five-phase material in the live route | elemental, though it shares F's only gate (§3.1) |
| `lib/holoflower/elementOverlays.ts` and element surfaces | elemental surface |

⭐ Where F's findings **depend** on that material (the shared `SYMBOLIC_LENS_BOUNDARY`, the
alchemy-stage location) it is cited, with the dependency named. ⛔ It is not classified.

---

## 1 · The three powers, kept separate

The P1-01 slice-05 instruction is applied as this record's primary axis:

```text
KNOW      what a system puts into MAIA's context / what it stores
SAY       what a system lets MAIA utter, and in what frame
CONCLUDE  what a system lets MAIA assert ABOUT THIS PERSON —
          their situation, their trajectory, what is coming
```

⭐ **These are not degrees of the same thing.** A system can KNOW enormously and CONCLUDE
nothing (the divination recall loader, §3.2). A system can KNOW almost nothing and CONCLUDE
heavily (the interpretation routes, §3.3) — a single hexagram number plus one sentence of member
context is sufficient input to generate `warnings`, `timing`, and *where this is heading*.

⛔ **The finding that matters most is the CONCLUDE column**, and it is reported in §3.3.

---

## 2 · Enumeration — every symbolic system present in code

Classification vocabulary per the task: `informational · interpretive · computational ·
memory-bearing · runtime-participating · member-facing · dormant`. **These are not exclusive.**
Each row states which apply and §3 gives the evidence.

| # | Named object | Classification | Participation status |
|---|---|---|---|
| F-01 | `lib/iching/` (6 files, 1,925 ln) | informational · computational | WIRED-BUT-UNOBSERVED |
| F-02 | `lib/divination/iching/` (4 files, 2,687 ln) | informational · computational · memory-bearing | WIRED-BUT-UNOBSERVED |
| F-03 | `lib/divination/tarot/` (5 files, 1,901 ln) | informational · interpretive · computational | WIRED-BUT-UNOBSERVED |
| F-04 | `lib/divination/runes/` (3 files, 1,252 ln) | informational · interpretive · computational | WIRED-BUT-UNOBSERVED |
| F-05 | `lib/divination/core/oracle-engine.ts` (474 ln) | computational · interpretive | WIRED-BUT-UNOBSERVED |
| F-06 | `lib/maia/divinationRecallLoader.ts` | memory-bearing · runtime-participating · member-facing | WIRED-BUT-UNOBSERVED (§3.2) |
| F-07 | `app/api/changes/[id]/interpret/route.ts` | **interpretive · concluding** · member-facing · memory-bearing | WIRED-BUT-UNOBSERVED |
| F-08 | `app/api/studio/changes/[id]/interpret/route.ts` | **interpretive · concluding** · memory-bearing | WIRED-BUT-UNOBSERVED |
| F-09 | `app/api/studio/changes/[id]/mentor/` (+`/chat`) | interpretive · concluding | WIRED-BUT-UNOBSERVED |
| F-10 | `app/api/oracle/iching/route.ts` | computational · memory-bearing · member-facing | WIRED-BUT-UNOBSERVED |
| F-11 | `app/api/oracle/tarot/route.ts` | interpretive · **concluding** · member-facing | WIRED-BUT-UNOBSERVED · **UNAUTHENTICATED** |
| F-12 | `app/api/oracle/runes/route.ts` | interpretive · member-facing | WIRED-BUT-UNOBSERVED |
| F-13 | `app/api/iching/cast/`, `/search/`, `/hexagram/[number]/` | informational · computational | WIRED-BUT-UNOBSERVED · **UNAUTHENTICATED** (self-declared) |
| F-14 | `lib/services/maiaAstrologyContextService.ts` (1,205 ln) | computational · runtime-participating · member-facing | **WIRED-BUT-UNOBSERVED — in the live turn** (§3.1) |
| F-15 | `lib/astrology/` (~40 files) | informational · computational · interpretive | PARTIAL — see §3.1 / §3.5 |
| F-16 | `lib/story/archetypalNarrativeService.ts` | interpretive · **concluding** | WIRED-BUT-UNOBSERVED |
| F-17 | `lib/astrology/archetypeVoices.ts`, `archetypeLibrary` | informational · interpretive | WIRED-BUT-UNOBSERVED |
| F-18 | `lib/archetypes/MayaArchetypes.ts` + `ArchetypeResponseModifier.ts` | interpretive · computational | **DORMANT** (§3.6) |
| F-19 | `lib/archetypeEvolutionEngine.ts` | interpretive · computational | **ORPHANED — zero importers** (§3.6) |
| F-20 | `lib/symbolic/` (12 files, 3,411 ln) | computational · interpretive | **DORMANT** except debug (§3.7) |
| F-21 | `lib/stellium/` (10 files, 5,554 ln) | computational · interpretive · practitioner-facing | PARTIAL (§3.8) |
| F-22 | `lib/holoflower/facets-interpretation.ts` (616 ln) | interpretive | **DORMANT — zero importers** |
| F-23 | `lib/knowledge/` (24 files) | informational | **DORMANT** (§3.9) |
| F-24 | `lib/wisdom/sacredTexts/` (10 files) | informational · member-facing | WIRED-BUT-UNOBSERVED (§3.10) |
| F-25 | `lib/wisdom/` (QuietWisdoms, WisdomQuotes, WisdomFacets, wisdomGraphService) | informational · memory-bearing | PARTIAL |
| F-26 | `lib/library/` (LibraryService, spiralogicTagger) | informational · memory-bearing | WIRED-BUT-UNOBSERVED |
| F-27 | `lib/astrology/chineseAstrology.ts`, `types/daYun.ts`, `types/vedic.ts`, BaZi | informational · computational | PARTIAL |
| F-28 | `lib/astrology/mayanAstrology` (via F-14) | computational · runtime-participating | WIRED-BUT-UNOBSERVED — in the live turn |
| F-29 | `lib/soulPortrait/generator/` | interpretive · **concluding** | WIRED-BUT-UNOBSERVED |
| F-30 | `lib/divination/iching/wuxing-enhanced-casting.ts` | computational · memory-bearing | WIRED-BUT-UNOBSERVED |

**Count: 30 named symbolic objects/groups.**

⭐ **`LIVE` is used zero times in this table.** Per the binding calibration, `LIVE` requires a
traced path **and** a dated runtime/production witness. Exactly one system has a dated production
witness (F-06, §3.2) and **that witness recorded absence, not participation** — so it does not
license `LIVE` either. ⛔ No softer synonym was substituted.

---

## 3 · Capability records

### 3.1 · F-14 / F-28 — ASTROLOGY IN THE LIVE MEMBER TURN

**CAPABILITY** — Natal chart, current transits, Mayan profile and "cosmic weather" are computed
per member and injected into the prompt of the ordinary conversational route.

```text
DECLARED WHERE   lib/services/maiaAstrologyContextService.ts:1-90 (interface AstrologyContext :70)
COMPUTED WHERE   lib/astrology/ephemerisCalculator.ts (1,064 ln) · mayanAstrology ·
                 celestialEvents · transitInterpretation · astrologyPayload
PERSISTED WHERE  member birth data read via query() at maiaAstrologyContextService.ts:12
LOADED WHERE     app/api/sovereign/app/maia/list/route.ts:109 (import) · :695 (call)
SURFACED WHERE   route.ts:732 → :1235 (meta) · :1290 (shadow legacyAddenda) · :1419 (prompt)
UPDATED WHERE    not found in this path (read-only per turn)
```

**CANONICAL CALL PATH** — traced end to end:

```text
POST /api/sovereign/app/maia/list
  → route.ts:695   getAstrologyContextForUser(effectiveUserId)   [inside Promise.all :552]
  → route.ts:726   const astrologyContext: AstrologyContext | null
  → route.ts:729   contextDetail capped at 3000 chars
  → route.ts:732   astrologyAddendum = SYMBOLIC_LENS_BOUNDARY + '\n\n' + contextHeader + detail
  → route.ts:1419  astrologyAddendum passed into generation
```

⭐ This is the **live conversational route** named by the session anchor as the route that
receives member traffic. Astrology is not a side surface; it is in the ordinary turn.

**MEMBER AUTHORITY** — the member supplies birth data; `hasBirthData` (:73) gates the detail.
⛔ No opt-out flag for astrological context was found on this path — unlike
`conversational_recall_enabled` / `episodic_recall_enabled`, which exist at route.ts:122 for the
memory blocks. **The member can withhold birth data; no evidence was found that they can consent
to holding it and decline its use in the prompt.**

**MAIA AUTHORITY** — KNOW: yes, ~3,250 chars/turn. SAY: constrained by the prompt wrapper.
CONCLUDE: **constrained only by that same wrapper.**

**GOVERNANCE GATE** — ⭐ **FOUND, and it is the only real one in this domain.**

`SYMBOLIC_LENS_BOUNDARY` is defined at `app/api/sovereign/app/maia/list/route.ts:282-283`. It is
a **prompt string**, declared inline in a route file. Its text (:283) separates all three powers
explicitly:

> "These are traditional interpretive lenses — NOT facts, NOT predictions, NOT evidence about
> this member's actual life. Possessing a framework gives you NO grounds to assert anything about
> who they are, what phase they are in, or where they are heading. You still know only what they
> have actually told you. … when a lens conflicts with their lived experience, their experience
> wins."

It is **canon-bound**: `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md:245` (Invariant 13, Claim-Type
Floor) names it — *"Operationalized as the deployed `SYMBOLIC_LENS_BOUNDARY` wrapper"* — and
Invariant 13 enumerates the traditions it governs, including I Ching and Tarot, and adds a Tier-2
hard refusal for consequential forecasts (`:246`).

⚠️ **Three properties of this gate, recorded without repair:**

1. **It is applied at exactly two call sites**, both in this one file: `:646` (Wu Xing) and
   `:732` (astrology). ⛔ Grep across `lib app components` returns **no third application**.
   Invariant 13 names I Ching and Tarot; the wrapper does not reach them (§3.3, §3.4).
2. **It is a model-compliance instruction, not a structural refusal.** Nothing measures whether
   the model obeyed it. No test, no falsifier, no post-generation check was found.
   `grep -rln SYMBOLIC_LENS_BOUNDARY` over `*.test.ts` returns nothing.
3. **Its declared scope exceeds its wiring.** Its own first line claims to govern "astrology,
   Mayan, Chinese/Wu Xing, elements, cycles, archetypes" — six families. It is attached to two.

⛔ Per constraint 6, finding this gate does not make the path governed beyond what the gate
covers; finding the gap does not authorize closing it.

**FAILURE MODE** — `.catch()` at `:695` swallows the error and yields `null`; the turn proceeds
without astrology. ⭐ Fails open toward *less* symbolic content, which is the safer direction.

**CURRENT STATUS** — `WIRED-BUT-UNOBSERVED`. Complete traced path from a real entry point; **no
dated runtime witness of this block firing was found in-repo.** ⛔ Not `LIVE`.

**SOURCE EVIDENCE** — route.ts:109, 282-283, 552, 695, 726-738, 1235, 1290, 1419;
maiaAstrologyContextService.ts:1-90; MAIA_SOVEREIGNTY_INVARIANTS.md:241-252.

**CONTRADICTIONS** — `maiaAstrologyContextService.ts:1` carries `// @ts-nocheck`. A 1,205-line
module feeding the live member prompt is **excluded from type checking**. Recorded, not repaired.

---

### 3.2 · F-06 — DIVINATION RECALL INTO THE LIVE TURN ⭐ the best-governed system in this domain

**CAPABILITY** — A member's own durable I Ching readings are made available to the ordinary
`/list` conversation.

```text
DECLARED WHERE   lib/maia/divinationRecallLoader.ts:1-50 (header states the full authority chain)
PERSISTED WHERE  database/migrations/20260130000001_bazi_iching_tables.sql:80
                 (divination_iching_readings; :177 COMMENT "Audit log of all I Ching readings")
                 + 20260201000001_divination_readings.sql (member_notes / is_archived)
LOADED WHERE     app/api/sovereign/app/maia/list/route.ts:143 (import) · :1103 (call)
SURFACED WHERE   route.ts:1105-1111 — three separate addenda + [MAIA] divination-block marker
UPDATED WHERE    writers are elsewhere: lib/services/divinationService.saveIChingReading and
                 lib/divination/iching/wuxing-enhanced-casting.persistReading (:186)
```

**CANONICAL CALL PATH**

```text
POST /api/sovereign/app/maia/list
  → route.ts:1103  loadRecentIChingReadings(userId)      [inside allowCrossSessionMemory && userId]
  → route.ts:1105  formatDivinationForPrompt(readings, { sanctuary: isSanctuary || false })
  → route.ts:1106-1108  intent / cast / interpretation addenda — THREE, never merged
```

**MAIA AUTHORITY — the three powers, separated by construction:**

- **KNOW** — yes, bounded: the member's own un-archived readings, last `DEFAULT_LIMIT` within
  `DEFAULT_WINDOW_DAYS` (loader header :39-41).
- **SAY** — gated. The loader header (:50) records a block-level discipline line, and the lane
  record confirms it is *"pinned in every block"*:
  `JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01.md:73` — *"Do NOT raise a reading unprompted…
  answer from the record when the member refers to a reading."*
- **CONCLUDE** — ⭐⭐ **structurally refused.** Loader header :48-49: *"Does NOT re-interpret the
  cast, synthesize across readings, or rank by salience."* The text it carries is **house corpus
  text copied at write time** from `lib/divination/iching/hexagrams.ts` (`soulInterpretation` /
  `guidance`) — explicitly *"NOT model-generated, NOT the member's words"* (:30-33).

⭐ **The three-block split is the governance.** Header :34-36: the member's words, the computed
cast and house-authored corpus text *"do not share an author"*; one merged block *"would collapse
three authorships into one scalar — the exact conflation pdc-1 forbids."* Each is registered
separately in `lib/maia/canonical-turn/producerRegistry.ts:196-215` with its own provenance and
`consentBasis: 'memory mode continuity'`.

**GOVERNANCE GATE — MULTIPLE, and they are structural:**

| Gate | Where |
|---|---|
| Sanctuary suppression | route.ts:1105 passes `sanctuary`; loader header :47 — "Does NOT render anything under Sanctuary (defense-in-depth; MIPA holds it again)" |
| Cross-session memory mode | route.ts:1103 sits inside the `allowCrossSessionMemory && userId` gate |
| Member scoping | loader header :46 — "user_id is a bound parameter on every query" |
| No-write pin | loader header :45 — "No INSERT / UPDATE / DELETE exists in this file (**pinned by test**)" — `lib/maia/__tests__/divinationRecallLoader.test.ts:102` reads its own source |
| Producer registry | producerRegistry.ts:196-215, three entries |
| Participation test | `lib/maia/canonical-turn/__tests__/divinationParticipation.test.ts:21` |

⭐ This is the only symbolic system in domain F whose gates are **tested rather than asserted**.

**CURRENT STATUS** — `WIRED-BUT-UNOBSERVED`, and the reason is unusually well documented.

⚠️ A **dated production witness exists** (founder-run 2026-09-03, lane record §6, lines 88-103)
— and **it recorded absence, not participation**:

- `divination_iching_readings` held **5 rows all-time** for the censused member, newest
  `2026-06-11`.
- The lane record's own note (line ~105): *"all five existing readings are older than 60 days, so
  on today's production data `[MAIA] divination-block` would report `candidateCount: 0`… That is
  the window working, not a defect."*
- Acceptance 9 (*member asks about a prior reading → MAIA answers from it*) is marked
  **"production witness only. Not claimable from BUILD."** (:76) and the record does not show it
  discharged.

⭐⭐ **So the calibration binds in the strict direction:** a dated production record exists, a
complete path is traced, and the witness says the block produced **nothing**. ⛔ That is not
`LIVE`. It is a traced wire with a witness of zero output.

⚠️ **A separate witnessed defect is recorded in that same census and is preserved here without
repair:** at 22:42 production, MAIA said *"I don't have the I Ching reading in front of me"*
while `[MAIA] conversational-block { candidateCount: 6, surfacedCount: 6 }` fired on those exact
turns — the record calls it a **"Witnessed false negative at PRESENTED/USED."** (§6 table).
⛔ `REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.`

---

### 3.3 · F-07 / F-08 / F-09 — ⭐⭐ THE CONCLUDING LAYER · GOVERNANCE GATE: NONE FOUND

**This is the finding that matters most in domain F.**

Two near-identical routes generate model-authored I Ching interpretations *about a specific
person's specific situation* and persist them. One is **member-facing**.

```text
F-07  app/api/changes/[id]/interpret/route.ts         (173 ln)  MEMBER-facing
F-08  app/api/studio/changes/[id]/interpret/route.ts  (186 ln)  PRACTITIONER-facing
```

**CANONICAL CALL PATH (F-07, member)**

```text
POST /api/changes/[id]/interpret
  → :47  getMemberIdFromRequest(request)     — authenticated; 401 if absent (:48-49)
  → :56  SELECT * FROM studio_changes WHERE id = $1 AND member_id = $2   — member-scoped
  → :12  getLLMProvider()  with INTERPRETATION_SYSTEM_PROMPT (:17-40)
  → :15  getHexagram() from lib/iching/lookup
  → :159 UPDATE studio_changes …            — the model's conclusion is PERSISTED
```

**MAIA AUTHORITY — CONCLUDE: yes, and instructed to.** The system prompt (`:17-40`, identical in
both files) requires a JSON object whose fields are conclusions about the person:

| Field | Prompt text (`:33-38`) | Power |
|---|---|---|
| `reading` | "Your interpretation of the primary hexagram **in the context of their change**" | CONCLUDE |
| `guidance` | "What the hexagram suggests **they do** or pay attention to" | CONCLUDE (directive) |
| `warnings` | "Specific things to **watch for or avoid**" | CONCLUDE (directive) |
| `timing` | "What the hexagram says about **timing and readiness**" | CONCLUDE (temporal) |
| `relatingReading` | "what it shows about **where this is heading**" | ⚠️ CONCLUDE (**trajectory**) |

⭐⭐ **Two instructions in this prompt run directly opposite to the gate that exists elsewhere in
the same repository:**

```text
:21  "Do not explain the I Ching tradition — SPEAK FROM WITHIN IT.
      The hexagram is alive, present, relevant."
:40  "SPEAK AS IF THE HEXAGRAM ITSELF IS ADDRESSING THE PERSON."
```

Set beside `SYMBOLIC_LENS_BOUNDARY` (route.ts:283), which requires MAIA to *"frame it explicitly
as a traditional association"* and forbids announcing *"you are entering / this means / your chart
shows"* as fact — and beside Invariant 13's Tier-1 rule that a lens may be offered **only** as
*"this tradition associates…"* (`MAIA_SOVEREIGNTY_INVARIANTS.md:245`, which names I Ching
explicitly) — **these two files instruct the precise inverse.** *Speak from within it* is an
instruction **not** to frame it as a traditional association.

⛔ **I do not reconcile this.** Both sides are recorded in §8.

**GOVERNANCE GATE** — ⭐ **`NONE FOUND`.**

```text
grep -n "SYMBOLIC_LENS\|lens\|tradition\|not a prediction\|refuse"
      app/api/changes/[id]/interpret/route.ts
      app/api/studio/changes/[id]/interpret/route.ts
  → no match in either file
```

- ⛔ No `SYMBOLIC_LENS_BOUNDARY` import or application.
- ⛔ No Tier-2 consequential-forecast refusal, though `timing` and *"where this is heading"* are
  forecast-shaped fields.
- ⛔ No test file found for either route.
- ✅ **Authentication and member-scoping ARE present** (`:47-49`, `:56`) and are real gates — but
  they gate *who may invoke*, never *what may be claimed*. Per the instrument's preserved
  distinctions: authentication establishes `PARTICIPATES`, not `HAS AUTHORITY`.

**PERSISTED** — `:159 UPDATE studio_changes`. ⚠️ The conclusion is not ephemeral: it is written
back to the member's record. ⛔ No provenance column distinguishing *model-authored conclusion*
from *house corpus text* was found on this path — the exact separation F-06 was built to preserve
(§3.2) is absent here.

**F-09 — the mentor routes** (`mentor/route.ts`, 222 ln, plus `/chat`) sit on the same substrate
but carry their **own inline restraint** at `:32` — *"You never diagnose, prescribe, or claim
authority over the person's process."* ⭐ The one **self-authored** restraint found outside the
canonical wrapper. ⛔ Not `SYMBOLIC_LENS_BOUNDARY`, not canon-bound — and present in the mentor
route while the adjacent *interpret* route in the same directory has none.

**CURRENT STATUS** — all `WIRED-BUT-UNOBSERVED`. Paths complete and authenticated; no runtime
witness found. **⛔ `REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.`**

---

### 3.4 · F-11 / F-03 — ⭐ TAROT · P1-01's HYPOTHESIS IS FALSIFIED

**P1-01 slice 05 recorded tarot as named in three canon documents with ZERO files. Verified at
the census subject: this is false. Tarot has substantial code.**

```text
lib/divination/tarot/major-arcana.ts    364 ln
lib/divination/tarot/minor-arcana.ts    533 ln
lib/divination/tarot/spreads.ts         574 ln
lib/divination/tarot/drawing.ts         410 ln
lib/divination/tarot/index.ts            20 ln
                                      ------
                                      1,901 ln
```

Plus ~20 further files referencing tarot, incl. `lib/maia/oracle-intent.ts:35` (tarot keyword
detector), `lib/services/divinationService.ts`, `lib/oracle/MaiaSystemPrompt.ts`.

```text
POST /api/oracle/tarot   app/api/oracle/tarot/route.ts
  → :4-10  performReading, threeCardReading, celticCrossReading, getSpread
  → :24    export async function POST   → :38-48 switch: single | three-card | celtic-cross
```

**MEMBER AUTHORITY / GOVERNANCE GATE** — ⭐ **`NONE FOUND`, on both axes.**

```text
grep -n "getCurrentPractitioner|requireAuth|resolveMemberIdentity|getSession|auth|
         SYMBOLIC_LENS|memberId|userId"  app/api/oracle/tarot/route.ts
  → ZERO matches across all 111 lines
```

⛔ **No authentication. No member scoping. No symbolic-lens wrapper.** The route accepts
`{ query, spreadType }` (`:19-22`) and returns a reading. Compare F-13 (`app/api/iching/cast/`),
which is also unauthenticated but **says so deliberately** at `:8`: *"Does not require
authentication — the oracle is available to all."* ⭐ The tarot route carries no such statement —
its openness is undeclared rather than declared.

**CONCLUDE** — the spread definitions are forecast-shaped by construction:

```text
lib/divination/tarot/spreads.ts:27   "Three Card Spread - Past/Present/Future"
                              :31   "Classic past, present, and future timeline reading"
                              :45-46 position "Future" — "Likely outcome based on current trajectory"
                              :291   "Best possible outcome, conscious goals"
                              :295   position "Near Future"
                              :315   position "Outcome"
```

⚠️ Invariant 13 Tier 2 (`MAIA_SOVEREIGNTY_INVARIANTS.md:246`) names **Tarot explicitly** among
the sources that may not forecast consequential outcomes. ⭐ A `Likely outcome based on current
trajectory` position is a forecast **slot in the data structure**, not merely a possible model
output. ⛔ Whether any given draw crosses the Tier-2 line is a claim-type judgement this census
does not make; what is recorded is that **no mechanism was found that could make that judgement**
on this path.

**CURRENT STATUS** — `WIRED-BUT-UNOBSERVED` · **UNAUTHENTICATED**.

**F-12 runes** (`app/api/oracle/runes/route.ts`, 180 ln) — same shape, same zero auth matches,
`lib/divination/runes/` 1,252 ln.

---

### 3.5 · F-16 / F-29 — ARCHETYPAL NARRATIVE AND SOUL PORTRAIT

**F-16 `lib/story/archetypalNarrativeService.ts`** — "Uses Claude to generate personalized soul
stories from birth chart data" (`:1-9`). Its own header disclaims: *"Not prediction, but mythic
framework for understanding one's journey"* (`:5`).

```text
CANONICAL CALL PATH
  POST /api/astrology/narrative   app/api/astrology/narrative/route.ts:13 (import)
    → :15  getCurrentSession from lib/auth/serverSessions     — AUTHENTICATED
    → :59  query bound to [serverSession.memberId]            — member-scoped
  also wrapped by lib/astrology/engines/narrativeEngine.ts:3,11
```

**CONCLUDE** — yes. It generates a narrative *about this member's journey* from their chart.
**GOVERNANCE GATE** — authentication and member scoping present; ⛔ **no `SYMBOLIC_LENS_BOUNDARY`,
no Invariant-13 claim-type check found in the route or the service.** The in-header disclaimer
(`:5`) is a **comment addressed to developers**, not an instruction in the model's prompt.
⭐ That distinction is preserved deliberately: a comment constrains a reader, a prompt constrains
a generation.

**F-29 `lib/soulPortrait/generator/`** — `portraitPrompt.ts` and `generatePortrait.ts` both import
`lib/astrology`. Interpretive and concluding in shape. `WIRED-BUT-UNOBSERVED`.

---

### 3.6 · F-18 / F-19 — ARCHETYPE ENGINES · THE SOPHISTICATION TRAP

⭐ **This is where the domain-specific warning bites, and it is recorded as a positive finding.**

**F-19 `lib/archetypeEvolutionEngine.ts`** — self-described as *"Maya learns to recognize both
eternal patterns and emerging novelty"* (`:1-7`). It declares `ArchetypalSignature` with
`confidence`, `noveltyFactor`, `evolutionPhase` (`:10-17`) and `EmergentPattern` with
`possibleName?: string  // Maya's attempt to name the unnamed` (`:19-27`).

```text
grep -rln "archetypeEvolutionEngine" lib app components   →  0 importers outside itself
```

**CURRENT STATUS: `ORPHANED`.** ⭐⭐ A file that names itself the engine by which MAIA recognises
a soul's archetypal signature and names the unnamed **is called by nothing.** Its interfaces
promise `confidence` scores about a person; no code path consumes them.

⛔ **Per the domain warning: this proves an elaborate file exists.** It is evidence of neither
capability nor authority.

**F-18 `lib/archetypes/`** — `MayaArchetypes.ts` (467 ln, `MAYA_ARCHETYPES` + `ArchetypeDetector`
+ `ArchetypeBlender`) and `ArchetypeResponseModifier.ts` (245 ln). **Exactly one importer**, and
it is a component, not a turn path:

```text
components/maya/PersonalityMatrix.tsx:5
```

⛔ No route, no service, no conversational path imports either. `ArchetypeDetector` —
concluding-shaped by name — has **no traced path to a member turn**. **`DORMANT`.**

**F-22 `lib/holoflower/facets-interpretation.ts`** (616 ln) — `grep` for its consumers returns
**zero**. **`DORMANT`.**

---

### 3.7 · F-20 — `lib/symbolic/` · THE GOVERNANCE LIBRARY THAT NOTHING CALLS

⚠️ This finding deserves its own record because of what the files are *named*.

```text
symbolicAuthorityContracts 244 · crossDomainGovernance 379 · promptIngressGovernance 390
journalInterpretationContracts 373 · patternLedgerContracts 394 · fieldSensingContracts 480
symbolicTelemetry 407 · symbolicTelemetryPersistence 293 · telemetryStore 103 · presence/ 348
                                                                      TOTAL 3,411 ln
```

**Importers outside the directory — exactly two, both diagnostic:**

```text
app/api/debug/symbolic-telemetry/route.ts
components/dev/SymbolicTelemetryPanel.tsx
```

⭐⭐ **A 3,411-line library whose filenames are `symbolicAuthorityContracts`,
`crossDomainGovernance` and `promptIngressGovernance` is reachable only from a debug route and a
dev panel.** ⛔ The names are not evidence that symbolic authority is governed. Per constraint 2,
the finding attaches to the named objects and their zero production importers — **not** to the
word "governance" in their filenames.

⚠️ One internal edge: `lib/symbolic/symbolicAuthorityContracts.ts` imports `lib/astrology`. That
is a dependency **into** the dormant library, not a path out of it.

**CURRENT STATUS: `DORMANT`** (diagnostic-reachable only).

---

### 3.8 · F-21 — `lib/stellium/` · practitioner-facing chart machinery

5,554 ln across 10 files; **63 importers** — by far the widest-reaching symbolic body.
`chartAnalysis.ts` (431 ln) imports `lib/astrology`. Consumers include
`lib/auth/practitionerAuth.tsx`, `lib/practitioner/sessionPrep.ts`, `lib/practitioner/messages.ts`,
`lib/maia/context/buildMaiaContext.ts`, and ~10 `app/stellium/*` pages.

⚠️ **`lib/maia/context/buildMaiaContext.ts` importing `lib/stellium` is a potential second
symbolic entry into MAIA context**, distinct from §3.1. ⛔ I did not trace it to a turn — the
`buildMaiaContext` lineage is Domain A/B territory and tracing it here would risk a
cross-domain claim this worker cannot support. **Flagged for P1-04 (§11).**

⭐⭐ **P1-GOV-ACCESS-01 applies directly.** `lib/practitioner/sessionPrep.ts` consuming chart
analysis is a practitioner seeing symbolic material derived about a member. Per D-P1-08, I trace
that this path exists and ⛔ **do not treat it as legitimate merely because it exists.** The
member-consent question on practitioner-visible chart derivation is **not answered by any
artifact found in this domain.** Domain I owns the access model; this record contributes the
symbolic half of the exposure.

**CURRENT STATUS: `PARTIAL`** — pages and services wired; no runtime witness.

---

### 3.9 · F-23 — `lib/knowledge/` · the wisdom corpus with no live consumer

24 loader files (~6,400 ln): `JungWisdomLoader`, `ShamanicArchetypesWisdom`,
`DepthPsychologyWisdom`, `DreamConversationWisdom`, `FamilyConstellationWisdom`,
`SacredTextsLoader`, `PDFKnowledgeLoader`, `MaiaSelfKnowledge`, others.

**Importers outside the directory — two:**

```text
lib/agents/PersonalOracleAgent.ts
lib/multi-tenant/TenantMAIA.ts
```

⛔ `lib/agents/PersonalOracleAgent.ts` has **no importer under `app/`**. The `app/` references to
"PersonalOracleAgent" resolve to a **different file**, `app/api/_backend/src/agents/
PersonalOracleAgent`, reached from `app/api/oracle/trust/route.ts:11` and
`app/api/oracle/memory/route.ts:5`. ⭐ Two distinct objects share one name — a **vocabulary
collision** of exactly the kind the hard census rule targets. The `lib/knowledge` consumer is the
`lib/agents` one, and it is unreached.

⚠️ Further, `app/api/maia/chat/route.ts:7,26` records that the `PersonalOracleAgent` path was
**retired**: *"contains external API calls which are forbidden" / "used external APIs which
violate MAIA sovereignty."*

**CURRENT STATUS: `DORMANT`.** ⛔ Recorded without inferring that the corpus *should* be wired.

---

### 3.10 · F-24 / F-25 / F-26 — SACRED TEXTS, WISDOM, LIBRARY

**F-24 sacred texts** — `lib/wisdom/sacredTexts/` holds Zohar, Quran, Tao, Gita plus
`SacredTextRegistry`, `selectSacredPassage`, `SacredEncounterService`.

```text
CANONICAL CALL PATH
  app/api/oracle/conversation/route.ts:30   import { evaluateEncounter }
  components/OracleConversation.tsx:65      import { SacredPassageBlock }
                                    :9723   <SacredPassageBlock … />  (rendered)
```

⭐ **Member-facing and rendered.** `evaluateEncounter` (`SacredEncounterService.ts:170`) returns
`EncounterResult | null` — it **decides whether a sacred passage meets the member**.

**GOVERNANCE GATE** — ⛔ `grep` for `consent|optIn|enabled` in `SacredEncounterService.ts`
returns **no match**. No member opt-in for sacred-text encounter was found. The only found
control is the null return of `evaluateEncounter` itself — i.e. **the system's own judgement is
the gate**.

⚠️ **Preserved as operational evidence only, per D-P1-06:** the session anchor states that
`app/api/oracle/conversation/route.ts` *"receives ~zero live traffic; wire was operationally
null."* ⛔ `CLAUDE.md` is operational/session evidence and **may not amend a governing source or
settle a participation status by assertion.** Recorded on both sides in §8; status stays
`WIRED-BUT-UNOBSERVED`.

**F-25 / F-26** — `lib/wisdom/` has 7 external importers incl. `app/intro/page.tsx`;
`wisdomGuidePersistence.ts` + `wisdomGraphService.ts` make it memory-bearing. `lib/library/` has 9,
incl. `app/api/library/ask-jeeves/route.ts` and `spiralogicTagger.ts` (513 ln — ⚠️ Domain E
boundary, noted not classified).

---

## 4 · Answer to Q4 — content-suppression and refusal primitives

### ⭐⭐ `safe_for_retrieval` HAS NO IMPLEMENTATION

P1-01 slice 05:91 records `safe_for_retrieval` as *"the only content-suppression primitive found
anywhere in this slice."* **Verified at the census subject:**

```text
grep -rn "safe_for_retrieval" lib database app --include=*.ts --include=*.sql
  →  ZERO matches
```

Every hit in the repository is in prose:

```text
docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md:31, 100, 104, 132, 149, 169
docs/programme/PHASE-1-WHOLE-ORGANISM-CENSUS-01_P1-01/05_spiralogic_symbolic.md:87,88,91,311
```

⛔ **No TypeScript field. No SQL column. No index. No query. No filter.** The canon text at
`CORPUS_DISCIPLINE_PROTOCOL_v1.0.md:104` — *"A document with `safe_for_retrieval: false` is
indexed but never retrieved"* — describes a mechanism that **does not exist in code at this
subject.**

⭐ P1-01 already noted (05:88) that enforcement is *"procedural"* and nothing *refuses* an
unmetadata'd document. This census strengthens that from *unenforced* to **unimplemented**.

**Classification: `DOCUMENTATION-ONLY`.**

### The complete inventory of refusal/suppression primitives actually found in domain F

| Primitive | Location | Kind | What it actually gates |
|---|---|---|---|
| `SYMBOLIC_LENS_BOUNDARY` | route.ts:282-283 | prompt string | Wu Xing (`:646`) + astrology (`:732`) **only** |
| Invariant 13 Tier 1/Tier 2 | MAIA_SOVEREIGNTY_INVARIANTS.md:241-252 | canon prose | names I Ching, Tarot, Vedic, Mayan — ⛔ no code implements Tier 2 |
| Sanctuary flag | route.ts:1105 → loader | runtime boolean | divination recall only |
| `allowCrossSessionMemory` gate | route.ts:~1100 | runtime boolean | divination recall only |
| No-write source pin | divinationRecallLoader.test.ts:102 | **test** | the loader cannot acquire a write |
| Producer registry | producerRegistry.ts:196-215 | structural | divination three-way provenance |
| Mentor restraint line | mentor/route.ts:32 | prompt string | mentor route only |
| `is_archived` / `member_notes` | 20260201000001_divination_readings.sql | schema | member-controlled archival of readings |
| Auth + member scoping | F-07:47-56, F-10:71, F-16:15,59 | structural | **who invokes**, never **what is claimed** |
| `hasBirthData` | maiaAstrologyContextService.ts:73 | data presence | astrology detail volume |

### ⭐ Where a concluding-capable system has no refusal surface

```text
GOVERNANCE GATE: NONE FOUND
  F-07  app/api/changes/[id]/interpret/route.ts          MEMBER-facing · persisted · concluding
  F-08  app/api/studio/changes/[id]/interpret/route.ts   persisted · concluding
  F-11  app/api/oracle/tarot/route.ts                    unauthenticated · forecast-shaped spreads
  F-12  app/api/oracle/runes/route.ts                    unauthenticated
  F-16  lib/story/archetypalNarrativeService.ts          concluding · auth only
  F-29  lib/soulPortrait/generator/                      concluding
```

⛔ Per constraint 6, this list is a finding. It is **not** softened, and it does not become a
repair list.

---

## 5 · Answer to Q5 — DOCUMENTATION-ONLY (named, zero code)

| Named artifact | Named where | Verified at subject |
|---|---|---|
| `facetToHexagram` | `docs/canon/ICHING_STRUCTURAL_ENGINE.md:134` (a TS snippet **inside a doc**) | ⛔ **zero** matches in `lib app components database` |
| `safe_for_retrieval` | `CORPUS_DISCIPLINE_PROTOCOL_v1.0.md:31,100,104,132,149,169` | ⛔ **zero** matches in code or SQL (§4) |
| Tier-2 consequential-forecast refusal | `MAIA_SOVEREIGNTY_INVARIANTS.md:246` | ⛔ no implementing mechanism found |
| I Ching ↔ Spiralogic elemental alignment table | P1-01 05:67 citing S-2:53-59 | ⛔ no code binding found (⚠️ Domain E may hold the elemental half) |

⭐ **`facetToHexagram` is the sharpest case.** P1-01 (05:347) already asked after its
**provenance** — who authored the 15-entry seed map and against what source. This census answers a
prior question: **there is no seed map in code to have provenance.** The map exists only as
illustrative TypeScript inside a canon markdown file. ⛔ Its provenance remains `UNKNOWN`, and the
question is now *upstream* of provenance.

⚠️ **Tarot is NOT on this list** — see §3.4. P1-01's hypothesis that tarot is documentation-only
is **falsified**: 1,901 lines across 5 files plus a live route.

---

## 6 · Answers to Q2 and Q3 — reachability and the three powers

### Reachable from a real member turn (path traced)

| System | Entry point | KNOW | SAY | CONCLUDE |
|---|---|---|---|---|
| F-14 astrology + F-28 Mayan | `/api/sovereign/app/maia/list` :695 | ✅ | ✅ gated :732 | ⚠️ gated by prompt only |
| F-06 divination recall | same route :1103 | ✅ | ✅ gated | ⛔ **structurally refused** |
| F-24 sacred texts | `/api/oracle/conversation` :30 + component :9723 | ✅ | ✅ | — |

### Reachable from a member-authenticated non-turn route

| System | Entry | CONCLUDE | Gate |
|---|---|---|---|
| F-07 I Ching interpret | `/api/changes/[id]/interpret` | ✅ **yes, instructed** | **NONE FOUND** |
| F-10 I Ching cast+persist | `/api/oracle/iching` :71 | ⛔ no (house corpus copied) | member scoping |
| F-16 archetypal narrative | `/api/astrology/narrative` | ✅ yes | auth only |

### Reachable with NO authentication

`F-11` tarot · `F-12` runes · `F-13` `/api/iching/cast`, `/search`, `/hexagram/[number]`.
⭐ Only F-13 **declares** its openness (`cast/route.ts:8`).

### DORMANT / ORPHANED

`F-19` archetypeEvolutionEngine (**zero importers**) · `F-18` archetypes (component only) ·
`F-20` `lib/symbolic/` (debug only) · `F-22` facets-interpretation (**zero importers**) ·
`F-23` `lib/knowledge/` (unreached consumer).

### ⭐⭐ The CONCLUDE column, stated plainly

**Six systems can produce a statement about a member's situation or trajectory. One of them
refuses to (F-06, by construction and by test). The other five have no mechanism that could
refuse.** The one system that structurally cannot conclude is the only one carrying tests,
a producer registry, a Sanctuary gate and a dated production witness.

⛔ I do not draw the inference that suggests itself here. That is P1-04's to make.

---

## 7 · Alchemy stages — located, and handed to Domain E

`nigredo|albedo|rubedo` appear in ≥10 files, **all under `lib/types/elemental/` or
`lib/consciousness/`**:

```text
lib/types/elemental/ElementalFramework.ts · lib/vocabulary/soulVocabulary.ts
lib/consciousness/: spiralogic-core · pattern-database · UnifiedSpiralogicAlchemyMap
  cmPractitionerEnvironment · therapeuticFrameworks · consciousness-translation-engine
  HolographicFieldIntegration · QualiaMeasurementEngine
```

⭐ **The finding is the location itself:** the alchemical stage vocabulary lives **inside the
Spiralogic/elemental substrate**, not in a standalone alchemy module. `lib/alchemy/` does not
exist (verified: `ls` → no such directory). ⛔ Reachability and governance of these files belong
to Domain E; classifying them here would be a cross-domain claim.

**Carried to P1-04:** *alchemy is not an independent symbolic system at this subject; it is
vocabulary embedded in elemental objects.*

---

## 8 · CONTRADICTIONS — both sides, unreconciled

**C-F1 · The I Ching interpretation prompt versus the symbolic lens boundary**

```text
SIDE A   app/api/changes/[id]/interpret/route.ts:21, 40 (and the identical studio route)
         "Do not explain the I Ching tradition — speak from within it."
         "Speak as if the hexagram itself is addressing the person."

SIDE B   app/api/sovereign/app/maia/list/route.ts:283
         "…frame it explicitly as a traditional association…"
         "Do not lead with a lens or announce 'you are entering / this means' as fact"
         docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md:245 — Tier 1 names I Ching explicitly:
         may be offered "only as a lens: 'this tradition associates…'"
```

⛔ Not reconciled. Both are present at the subject. Side B is canon-bound; Side A is deployed on a
member-authenticated, persisting route.

**C-F2 · `safe_for_retrieval` — canon asserts a mechanism that code does not contain**

Canon (`CORPUS_DISCIPLINE_PROTOCOL_v1.0.md:104`): *"indexed but never retrieved."*
Code: zero occurrences. ⛔ Preserved; ⛔ not resolved by deciding which is "really" true.

**C-F3 · P1-01 slice 05 versus the code on tarot**

P1-01: tarot named in three canon docs, **zero files**. Subject: 1,901 ln + a live route.
⛔ Per constraint 7, the predecessor claim is evidence-input only; the re-read at the subject
governs. Both recorded.

**C-F4 · `SYMBOLIC_LENS_BOUNDARY`'s declared scope versus its wiring**

Declared (`:282`): governs "astrology, Mayan, Chinese/Wu Xing, elements, cycles, archetypes."
Applied: two call sites (`:646`, `:732`). Archetypes, cycles and the I Ching/Tarot that
Invariant 13 adds are not reached. ⛔ Both stated.

**C-F5 · The oracle/conversation route's traffic**

`CLAUDE.md` (session anchor): the route *"receives ~zero live traffic."*
Code: `app/api/oracle/conversation/route.ts:30` imports `evaluateEncounter`;
`components/OracleConversation.tsx:9723` renders `SacredPassageBlock`.
⛔ Per D-P1-06 the anchor may not settle this by assertion. Status stays `WIRED-BUT-UNOBSERVED`.

**C-F6 · Two objects named `PersonalOracleAgent`**

`lib/agents/PersonalOracleAgent.ts` (consumes `lib/knowledge`, unreached from `app/`) versus
`app/api/_backend/src/agents/PersonalOracleAgent` (reached from two routes; declared
sovereignty-violating and retired at `app/api/maia/chat/route.ts:7,26`). ⛔ Not merged.

---

## 9 · UNLOCATED GOVERNANCE

1. **Tier-2 consequential-forecast refusal** — `MAIA_SOVEREIGNTY_INVARIANTS.md:246` requires hard
   refusal for forecasts of death, illness, marriage, legal/financial outcomes "regardless of
   source." ⛔ **No implementing code found anywhere in domain F.** Meanwhile `spreads.ts:45-46`
   defines a `Future` position as *"Likely outcome based on current trajectory."*
2. **Who may set `safe_for_retrieval`** — P1-01 05:88 flagged this unsettled. It is now moot in
   code (§4) and remains unsettled in prose.
3. **Member consent to astrological context in the prompt** — the member supplies birth data; no
   artifact was found governing its **use** in a turn, unlike the recall prefs at route.ts:122.
4. **Member consent to sacred-text encounter** — `SacredEncounterService.ts` contains no consent
   or opt-in term.
5. **Practitioner visibility of member chart derivations** — `lib/practitioner/sessionPrep.ts` ←
   `lib/stellium/chartAnalysis.ts` ← `lib/astrology`. ⭐ **P1-GOV-ACCESS-01 territory**; no ruled
   model found. ⛔ Existing visibility not treated as legitimate merely because it exists.
6. **Provenance of model-authored conclusions persisted to `studio_changes`** — F-07:159 writes a
   model conclusion with no found author-class column, where F-06 separates three authorships.
7. **`SYMBOLIC_LENS_BOUNDARY`'s own authority** — it is an inline `const` in a route file. No
   artifact was found stating who may edit it, or requiring new symbolic paths to apply it.
   Invariant 13 calls it "deployed" but does not bind its location or enforce its application.
8. **`@ts-nocheck` on a live-prompt module** — `maiaAstrologyContextService.ts:1`. No governing
   record found for excluding a live-turn contributor from type checking.

---

## 10 · NAMED-BUT-UNVERIFIED ARTIFACTS

| Named | By | Status at subject |
|---|---|---|
| `facetToHexagram` seed map | `ICHING_STRUCTURAL_ENGINE.md:134` | **DOCUMENTATION-ONLY** |
| `safe_for_retrieval` | `CORPUS_DISCIPLINE_PROTOCOL_v1.0.md` | **DOCUMENTATION-ONLY** |
| "Symbolic Guidance Layer Doctrine" | `MAIA_SOVEREIGNTY_INVARIANTS.md:245` ("companion to…") | ⛔ **not located** — no file of that name found |
| I Ching ↔ elemental alignment table | P1-01 05:67 | ⛔ not located in code (Domain E may hold it) |
| Acceptance 9, divination | lane record :76, :88 | ⛔ **not discharged** — "production witness only" |
| `lib/alchemy/` | task starting points | ⛔ **does not exist** (§7) |
| `lib/iching` ↔ `lib/divination/iching` relationship | — | ⚠️ **two independent I Ching corpora** (1,925 ln / 2,687 ln), different hexagram data files, different casting modules, no shared import. ⛔ No artifact found declaring which is canonical. |

---

## 11 · OPEN QUESTIONS FOR P1-04

1. ⭐⭐ **Five concluding-capable symbolic systems have `GOVERNANCE GATE: NONE FOUND`, and one —
   F-07 — is member-facing, authenticated, and persists the conclusion.** What layer owns the
   claim-type check that Invariant 13 requires, and why is the one deployed instrument
   (`SYMBOLIC_LENS_BOUNDARY`) an inline `const` in a single route file?
2. **Which I Ching corpus is canonical** — `lib/iching/` or `lib/divination/iching/`? Both are
   reachable; F-07/F-08 use the former, F-10 and the recall loader lineage the latter.
3. **Does `lib/maia/context/buildMaiaContext.ts` → `lib/stellium` constitute a second symbolic
   entry into MAIA's context**, independent of §3.1? (Domain A/B boundary — flagged, not traced.)
4. **Tarot and runes accept unauthenticated requests.** Is that intended (as F-13 declares) or
   undeclared drift? Q for P1-04, ⛔ not a repair item.
5. **`safe_for_retrieval` is unimplemented.** Is the corpus discipline protocol aspirational, or
   does an implementation live outside this repository?
6. ⭐ **Why does the only structurally-refusing symbolic system (F-06) also carry the only tests,
   the only producer registry and the only dated production witness?** The correlation is
   recorded; the inference is P1-04's.
7. **`lib/symbolic/` — 3,411 lines of governance-named code reachable only from a debug route.**
   Was it superseded, never wired, or is its consumer elsewhere?
8. **F-19 `archetypeEvolutionEngine` has zero importers.** ORPHANED or pre-wiring?
9. **What is the relationship between the "Witnessed false negative at PRESENTED/USED"**
   (lane record §6) and the symbolic layer's governance? A system that cannot conclude also did
   not recall. ⛔ `REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.`
10. **P1-01's tarot finding was falsified by direct verification.** Does any other slice-05
    "zero files" claim need the same re-read? (Constraint 7 in practice.)

---

```text
DOMAIN F · COMPLETE
30 symbolic systems enumerated · 0 classified LIVE · 6 concluding-capable
1 concluding-capable system with a structural refusal · 5 with GOVERNANCE GATE: NONE FOUND
2 named primitives DOCUMENTATION-ONLY · 1 P1-01 hypothesis falsified
EVIDENCE ONLY — NO RULINGS · NO REPAIR PROPOSED · NO FILE EDITED BUT THIS ONE
```
