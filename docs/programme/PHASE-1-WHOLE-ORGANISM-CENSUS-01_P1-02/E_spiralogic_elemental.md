# P1-02 · DOMAIN E — SPIRALOGIC / ELEMENTAL INTELLIGENCE

```text
STEP        P1-02 · PARALLEL ORGANISM CENSUS
DOMAIN      E — Spiralogic / Elemental
SUBJECT     1a5554300e855d3581085849301a39cbb10ab385
TYPE        RECORD ONLY — evidence, never rulings
AUTHORITY   READ / TRACE / CLASSIFY
```

> ## ⭐⭐ P1-02 asks what the organism does.
> ## It does not infer from doing that the organism is authorized to do it.

## 0 · Subject verification and reading conditions

- Working tree HEAD at capture: `f0279c5b0eee0ae7090df38b67d820923917c58c`.
- `git merge-base --is-ancestor 1a5554300e… HEAD` → **YES**. The named subject is an ancestor.
- `git diff --stat 1a5554300e… HEAD -- lib/ app/ components/ database/` → **EMPTY**. The code tree
  at the subject is byte-identical to the working tree for every path cited below. All `file:line`
  citations are therefore readings at the subject.
- No runtime, no database, no production access. Per the instrument's LIVE calibration, no capability
  below is recorded `LIVE` on a traced path alone.

### ⭐ The core distinction as applied in this record

```text
VOCABULARY     a file, type, constant, comment, doc or UI string containing
               "fire" / "element" / "phase" / "Spiralogic"
EXECUTABLE     a function that computes a value from member input or member
               state AND whose value changes a persisted row, a prompt, or a
               member-visible surface
```

Every capability record below separates them. Where a module is large and elaborately elemental but
no reachable caller consumes its output, it is recorded as **VOCABULARY + DORMANT CODE**, never as
elemental intelligence.

---

## 1 · THE FIVE REQUIRED ANSWERS (summary; evidence in §2–§8)

**Q1 — `lib/maia/spiralogicReference.ts` at the subject.** 8 lines. One export:
`SPIRALOGIC_REFERENCE`, a template-literal string constant. Five element glosses
(Earth/Water/Fire/Air/Aether), a Jungian/alchemical sentence, and a disambiguation sentence
("NOT a Sonic game"). **NO PHASES. NO NUMBERS. NO FUNCTION. NO TYPE.** P1-01's reading is confirmed.
⭐ **Zero importers** — `grep -rn "spiralogicReference\|SPIRALOGIC_REFERENCE" lib app components`
returns only its own declaration plus a *comment* at `lib/soulPortrait/schema.ts:19`. Status:
**ORPHANED** (pure vocabulary, not reachable at all).

**Q2 — computed and persisted?** YES for one substrate, and its only writer is unreachable.
`member_spiral_state` (`database/migrations/20260213200001_member_spiral_state.sql:13-32`) holds
`dominant_element` (CHECK fire|water|earth|air|aether), `phase` (CHECK **1..12**), `motion`,
`intensity`, `relational_phase` (1..4), `autonomy_streak`, `return_count`. Written by
`upsertSpiralState()` (`lib/consciousness/spiralStatePersistence.ts:148`), whose **only call site**
is `app/api/oracle/conversation/route.ts:1611` — **below that route's unconditional HTTP 410 at
`:446-453`**, in a block the file itself labels `// Unreachable below` (`:455`). So the table
survives restart and the rows persist; **nothing at the subject can write a new one.** Reads are
live and multiple (§4.2). A second, different elemental substrate exists in Prisma
(`prisma/schema.prisma:227` `model ElementalState`, per-element floats + `dominantElement`).

**Q3 — does elemental/spiral state influence what MAIA says on a real turn?**
⭐ **YES, on the canonical `getMaiaResponse` lane — by TWO paths, both carrying a keyword-derived
element, neither carrying a Spiralogic phase.**
1. `lib/sovereign/maiaService.ts:1781` builds `context.summary` =
   `` `Conversation: ${conversationContext.profile.dominantElement} element, N turns` `` and that
   string is interpolated into the system prompt at `lib/sovereign/maiaVoice.ts:277` and `:861`.
2. `lib/sovereign/maiaService.ts:1957` passes `element: elementalResult?.dominant` into
   `buildFieldContext()`, whose whole result is JSON-serialized into the prompt as
   `[Field Intelligence]` at `lib/field/fieldOrchestrator.ts:383-391`, appended at
   `maiaService.ts:1534` (FAST) and `:1962` (CORE).
⛔ **And one path that computes element+phase for the prompt and then discards it**: the Talk-mode
block at `maiaService.ts:1079-1112` builds `fieldAwareness` containing `Element detected` and
`Phase detected` — and `maiaService.ts:1198` states `// Note: fieldAwareness intentionally NOT
appended`. `grep -n fieldAwareness` returns exactly three lines (1079, 1094, 1198): **it is never
concatenated into any prompt.** Computed, logged, dropped.
The one prompt block that names *Spiralogic Element / Spiralogic Phase / phase name / central
question* explicitly (`app/api/oracle/conversation/route.ts:2773-2780`) sits below the 410.

**Q4 — does any code assign a member a PHASE / STAGE / LEVEL, and does anything act on it?**
YES, several, of different kinds and different reachability. The strongest are:
`member_spiral_state.phase` (1..12) + `relational_phase` (1..4, glossed in-migration as
`1=orientation, 2=capacity-building, 3=autonomy, 4=seasonal return`) + `autonomy_streak`; a
governance chokepoint **exists** for the inferred subset —
`lib/relational/developmentalStateAdmission.ts:61` (`admitPersistedStateForShaping`) strips
`relational_phase` / `autonomy_streak` before response-shaping (Refusal R16) — but its single caller
(`app/api/oracle/conversation/route.ts:1711`) is below the 410, and the same two fields are returned
**verbatim to the member's own client** by `app/api/members/spiral-state/route.ts:28-29` with no
such strip. Reported as X-19 input; ⛔ not adjudicated here.

**Q5 — per-phase therapeutic-modality selection in code?**
⭐ **YES — it exists, fully specified, and is inert.** `FRAMEWORK_REGISTRY`
(`lib/consciousness/spiralogic-core.ts:1314`) declares `IPP` `:1392`, `CBT` `:1407`, `JUNGIAN`
`:1422`, `SHAMANIC` `:1437`, `SOMATIC` `:1449`, `IFS` `:1464`, `MINDFULNESS` `:1479` — each
`tier: "applied"` with `preferredElements` and `preferredPhases`. `chooseFrameworksForCell()`
(`:1575`) selects an applied framework only when `enabledApplied.includes(fw.id)` **and** the cell's
element **and** the cell's phase match (`:1586-1592`). Both non-test call sites pass **no opts** —
`app/api/oracle/conversation/route.ts:846` (below the 410) and `app/api/maia/spiralogic/route.ts:89`
— so `enabledApplied` defaults to `[]` (`:1579`) and **no applied modality can ever be selected**.
Only the `foundational`/`meta` tier IDs are returned. Per constraint 6, finding this **does not make
it governed**; per the same constraint, its inertness is not a ruling that it is safe.

---

## 2 · CAPABILITY E-1 · Spiralogic reference constant

```text
CAPABILITY          A prompt-facing gloss of the word "Spiralogic"
DECLARED WHERE      lib/maia/spiralogicReference.ts:2  (8-line file, one export)
COMPUTED WHERE      NONE — it is a constant string
PERSISTED WHERE     NONE
LOADED WHERE        NONE — zero importers at the subject
SURFACED WHERE      NONE
UPDATED WHERE       NONE
CANONICAL CALL PATH NONE FOUND
UPSTREAM DEPS       none
DOWNSTREAM CONSUMERS  none. lib/soulPortrait/schema.ts:19 names the path in a COMMENT only.
MEMBER AUTHORITY    n/a      MAIA AUTHORITY   n/a
PRACTITIONER AUTH   n/a      SYSTEM AUTHORITY n/a
GOVERNANCE GATE     NONE FOUND
FAILURE MODE        none reachable
CURRENT STATUS      ORPHANED  (vocabulary)
```

Exact export, quoted in full for the record:

```ts
export const SPIRALOGIC_REFERENCE = `
SPIRALOGIC (Soullab/MAIA meaning):
Spiralogic is Soullab's consciousness-transformation framework. It maps inner change through elemental cycles:
Earth (grounding/embodiment), Water (feeling/psyche), Fire (activation/will), Air (perspective/mind), and Aether (integration/wholeness).
It's Jungian/alchemical in spirit: dissolution → integration → embodiment, revisited in spirals (the "same" themes at deeper octaves).
IMPORTANT: In this context, "Spiralogic" is NOT a Sonic game, programming term, or generic web concept.
`.trim();
```

⚠️ **Divergence from C-2 input** (`docs/programme/MAIA_WHOLE_ORGANISM_MAP/02_elemental_corpus_callosum.md`,
tree `cf6d9ebf`): that page records it as "imported only by `lib/soulPortrait/schema.ts`". At the
census subject **there is no import** — only a comment. Re-read, not inherited.

---

## 3 · CAPABILITY E-2 · Element detection that reaches the canonical prompt

Three independent element detectors run on the canonical lane. All three are keyword/regex
classifiers over the member's raw text. None computes a Spiralogic phase.

### 3.1 · `ConversationElementalTracker` → `context.summary` → system prompt

```text
CAPABILITY          per-session dominant element, injected into the system prompt
DECLARED WHERE      lib/consciousness/conversation-elemental-tracker.ts:18 (type), :45 (class)
COMPUTED WHERE      processMessage(); profile.dominantElement recomputed :253, :289
PERSISTED WHERE     ⛔ NONE — private Map<string, profile> at :46. In-process only;
                    lost on restart and not shared across instances.
LOADED WHERE        lib/sovereign/maiaService.ts:1773 (CORE), :2198 (DEEP)
SURFACED WHERE      ⭐ the PROMPT. maiaService.ts:1781 sets
                    context.summary = `Conversation: ${dominantElement} element, N turns`
                    → lib/sovereign/maiaVoice.ts:277  "Previous conversation context: ${context.summary}"
                    → lib/sovereign/maiaVoice.ts:861  "Context for this conversation:\n${summary}"
UPDATED WHERE       every turn, in memory
CANONICAL CALL PATH app/api/sovereign/app/maia/list/route.ts:89 → getMaiaResponse()
                    → maiaService.ts:1773 → maiaVoice.ts:277/:861
UPSTREAM DEPS       member message text; effectiveHistory
DOWNSTREAM CONSUMERS  system prompt; MaiaContext.consciousnessInsights.dominantElement (:1785);
                    conversationProfile passed on at :1995, :2035; DEEP :2326-2330, :2427
MEMBER AUTHORITY    ⛔ NONE FOUND — no opt-out, no visibility, no correction path located
MAIA AUTHORITY      consumes it as context; the prompt does not instruct her to state it
PRACTITIONER AUTH   NONE FOUND
SYSTEM AUTHORITY    computes and injects unconditionally on CORE and DEEP
GOVERNANCE GATE     ⭐ NONE FOUND. No env flag, no consent check, no Sanctuary branch at the
                    injection site. (Sanctuary is handled elsewhere in the turn; it does not
                    gate this line.)
FAILURE MODE        none — pure in-memory computation, no try/catch needed
CURRENT STATUS      WIRED-BUT-UNOBSERVED  (executable, prompt-affecting)
```

⭐ **This is the clearest executable Spiralogic/elemental intelligence on the canonical lane: a
member-derived elemental label reaching MAIA's system prompt on every CORE and DEEP turn.** It is
also the least ceremonious — a single interpolated word inside a summary sentence.

### 3.2 · `ElementalOracleBridge` → `elementalResult.dominant` → `[Field Intelligence]` JSON

```text
CAPABILITY          six-voice elemental classification of the member's message
DECLARED WHERE      lib/bridges/elemental-oracle-bridge.ts:205 processAll, :328 processAllFast
COMPUTED WHERE      :333-357 six regex keyword sets — fire, water, earth, air, aether, SHADOW;
                    :373-387 dominant = highest match count, DEFAULT 'earth' when no match;
                    :396 each "voice" is a template string, `[Fast] Fire resonance detected (N signals)`;
                    :399 "symbols" = the first three matched MEMBER WORDS
PERSISTED WHERE     agent_runs / integration_passes via logCorpusCallosumTrace (§5)
LOADED WHERE        maiaService.ts:883-908 (FAST), :1659+:1698 (CORE, inside Promise.all),
                    :2239-2262 (DEEP, under ELEMENTAL_TIMEOUT_MS)
SURFACED WHERE      ⭐ CORE only: maiaService.ts:1957 element: elementalResult?.dominant
                    → buildFieldContext (lib/field/fieldOrchestrator.ts:154, PFI at :205-222)
                    → formatFieldAddendum (:383-391) serializes the WHOLE FieldContext to JSON
                    → maiaService.ts:1962 adaptivePrompt += "\n\n[Field Intelligence]\n{json}"
                    FAST uses (meta as any)?.element instead (maiaService.ts:1532) — a
                    CALLER-SUPPLIED element, not this detector's output.
UPDATED WHERE       per turn
CANONICAL CALL PATH list/route.ts:89 → getMaiaResponse → CORE branch → :1698 → :1957 → :1962
UPSTREAM DEPS       member message text only
DOWNSTREAM CONSUMERS  PFI mind state; the [Field Intelligence] prompt block; the I Ching silent
                    mapping (:1731, :2269); the corpus-callosum trace (§5); VoiceDistinctionScorer
MEMBER AUTHORITY    NONE FOUND
MAIA AUTHORITY      receives the serialized JSON in-prompt; no instruction constrains its use
PRACTITIONER AUTH   NONE FOUND
SYSTEM AUTHORITY    runs unconditionally; failure is swallowed (`catch {}` at :1970)
GOVERNANCE GATE     Sanctuary gates the FieldContext (fieldOrchestrator.ts:168-178 returns
                    meta-only when isSanctuary) — ⭐ that IS a real gate on this path.
                    ⛔ No gate on the element computation itself.
FAILURE MODE        silent; `catch {}` with the comment "Field intelligence must never break the
                    hot path". A failed elemental read is indistinguishable from no element.
CURRENT STATUS      WIRED-BUT-UNOBSERVED  (executable, prompt-affecting on CORE)
```

⭐⭐ **All three call sites pass `fastMode: true`** — `maiaService.ts:896`, `:1698`, `:2252`, the
last with the inline comment `// Use pattern matching for fast trace data (~50ms vs 30s+)`. The
bridge's LLM path (`processElement` `:463`, `generateElementalWisdom` `:812`, `processSingleElement`
`:853`) is **present and never invoked from the canonical lane**. The "elemental voices" on the
serving lane are regex counters, not model calls.

### 3.3 · Talk-mode field intelligence — ⛔ COMPUTED AND DISCARDED

```text
CAPABILITY          element + phase + user state + spiral scale, formatted for the prompt
DECLARED WHERE      lib/sovereign/maiaService.ts:1079  let fieldAwareness = ''
COMPUTED WHERE      :1084-1094 analyzeFieldIntelligence(input, conversationHistory)
                    from lib/maia/talkModeFieldIntelligence
CONTENT             :1097 "- Element detected: ${fieldIntelligence.element}"
                    :1098 "- Phase detected: ${fieldIntelligence.phase}"  (Intelligence|Intention|Goal)
                    :1101 spiralScale micro|meso|macro|collective
SURFACED WHERE      ⛔ NOWHERE. grep -n fieldAwareness → exactly 1079, 1094, 1198.
                    :1198  // Note: fieldAwareness intentionally NOT appended - too diagnostic
                    for early exchanges
                    It is emitted to the server log at :1112 and dropped.
GATE                mode === 'dialogue' AND process.env.TALK_MODE_FIELD_INTELLIGENCE !== 'false'
CURRENT STATUS      COMPUTED · LOGGED · NOT SURFACED  → recorded as DORMANT at the prompt
                    boundary while remaining LIVE as an observation
```

⭐ **This is the one place in the domain where a Spiralogic-shaped PHASE is computed for the
canonical prompt — and it is the one place the code explicitly refuses to append it.** Its phase
vocabulary (`Intelligence | Intention | Goal`, `getPhaseTheme` at `:1133-1137`) is a **third**
phase vocabulary, agreeing with neither `Phase = 1|2|3` nor `phase 1..12` (§7.1).

---

## 4 · CAPABILITY E-3 · Persisted spiral state (Bridge D)

### 4.1 · The substrate

```text
CAPABILITY          per-member persisted spiral position + relational maturation counters
DECLARED WHERE      database/migrations/20260213200001_member_spiral_state.sql:13-32
                    lib/consciousness/spiralStatePersistence.ts:59 SpiralState, :76 SpiralStateUpdate
COLUMNS             member_id UUID PK → members(id) ON DELETE CASCADE
                    dominant_element TEXT NOT NULL CHECK IN (fire,water,earth,air,aether)   :18
                    phase            INTEGER NOT NULL CHECK BETWEEN 1 AND 12                :19
                    motion           TEXT CHECK IN (ascending,stuck,breakthrough)           :20
                    intensity        NUMERIC(3,2) 0..1                                      :21
                    relational_phase INTEGER NOT NULL DEFAULT 1 CHECK BETWEEN 1 AND 4       :24
                    autonomy_streak  INTEGER NOT NULL DEFAULT 0                             :27
                    return_count     INTEGER NOT NULL DEFAULT 0                             :28
                    (+ facet_id / facet_movement added by innerGuideFieldPersistence.ts:73)
COMPUTED WHERE      lib/voice/conductor.ts:256 createVoiceIntent → element via scoreRoute :160
                    and applyHysteresis :57-108 (switch only after 2 consecutive turns, or
                    immediately when intensity >= 0.8, conductor.ts:40); phase via
                    normalizePhase :24-28 (accepts 1..12, else 1)
PERSISTED WHERE     upsertSpiralState  lib/consciousness/spiralStatePersistence.ts:148
                    ⛔ SOLE CALL SITE: app/api/oracle/conversation/route.ts:1611
                       — which is BELOW the unconditional 410 at :446-453
                       and inside the block the file labels "// Unreachable below" at :455.
SURVIVES RESTART    YES — PostgreSQL table with PK + three indexes (:36-41).
                    The conductor's in-memory hysteresis buffer does NOT (conductor.ts:46-51,
                    "In-memory only — resets on server restart. Bridge D replaces this").
CURRENT STATUS      WRITE PATH: DORMANT (no reachable writer at the subject)
                    READ PATH:  WIRED-BUT-UNOBSERVED (four reachable readers, §4.2)
                    ROWS:       state UNKNOWN — no database access in this container
GOVERNANCE GATE     ⭐ ONE EXISTS, on shaping only — see §4.3
FAILURE MODE        loadSpiralState returns null on error (graceful); upsert is fire-and-forget
                    and returns void (:148 signature) — a failed write is unobservable to callers
```

⛔ **The write path being unreachable does not make the stored rows inert.** Existing rows are still
read by the four consumers below and, in one case, rendered into a prompt.

### 4.2 · The four readers (all reachable; `loadSpiralState` is `:96`)

| # | Reader | file:line | What it does with it | Status |
|---|---|---|---|---|
| 1 | Living Field encounter/refine | `lib/maia/living-field/encounterContext.ts:126` | ⭐ **renders it into the prompt**: `:196-198` `Spiral state: element=…, phase=…, motion=…` inside `gatheredMaterial`; consumed by `app/api/maia/living-field/[fieldKey]/encounter/route.ts:19` and `…/refine/route.ts:9` | WIRED-BUT-UNOBSERVED · **prompt-affecting** |
| 2 | Member Live Context | `lib/memory/MemberLiveContext.ts:319, :383, :418` | loads into `ctx.spiralState`; ⛔ `formatMemberWebForPrompt` (`:436`) contains **no** spiral/element/phase reference — loaded, not rendered | WIRED · not surfaced |
| 3 | Member's own API | `app/api/members/spiral-state/route.ts:15` | returns `currentElement`, `phase`, `motion`, ⚠️ `relationalPhase`, ⚠️ `autonomyStreak` to the authenticated member (`:24-30`) | WIRED-BUT-UNOBSERVED · member-facing |
| 4 | Research metrics | `lib/research/researchMetricRegistry.ts:362-369` | aggregate counts by `dominant_element` and by `phase` | WIRED-BUT-UNOBSERVED |

Client consumer located for (3): `components/consciousness/ContinuityView.tsx:143`.

### 4.3 · ⭐ The one real governance gate in this domain — Refusal R16

```text
OBJECT              lib/relational/developmentalStateAdmission.ts
LAW (quoted :5-8)   "No response-shaping subsystem may consume persisted inferred developmental
                     state unless the source is explicitly member-marked, or produced within the
                     active encounter under an authorized interpretation boundary."
MECHANISM           :31-39 INFERRED_DEVELOPMENTAL_FIELDS = relational_phase, autonomy_streak,
                    development_level, integration_score, awakening_phase,
                    attachment_style_estimate  ⭐ (the list guards the RULE, not today's two fields)
                    :61 admitPersistedStateForShaping(persisted, auth = {kind:'none'})
                        → deletes every class field unless an explicit authorization is presented
CARVE-OUT (:19-21)  behavioural FACTS pass through: return_count is "an observation, not an
                    inference about who the person is"
SOLE CALLER         app/api/oracle/conversation/route.ts:1711 — ⛔ BELOW THE 410
WHAT IT DOES NOT COVER
                    ⛔ dominant_element and phase are NOT in the class and are NOT stripped.
                    ⛔ It is a SHAPING boundary only. app/api/members/spiral-state/route.ts:28-29
                       returns relationalPhase and autonomyStreak to the member's client with no
                       equivalent admission step.
CURRENT STATUS      PRESENT · CORRECTLY SCOPED TO ITS OWN CLAIM · ITS ONLY CALL SITE IS UNREACHABLE
```

⭐ This is the single instance in Domain E of a named, tested constitutional refusal attached to a
developmental-state field. ⛔ Its existence governs shaping; per constraint 6 it confers nothing on
the disclosure path, the persistence path, or the element/phase fields it does not name.

---

## 5 · CAPABILITY E-4 · Corpus Callosum (elemental parallel-processing trace)

```text
CAPABILITY          persist a per-turn record of "parallel knowing" — one row per voice
DECLARED WHERE      lib/services/corpusCallosumService.ts
                    :111 logAgentRun   :172 logIntegrationPass   :317 logCorpusCallosumTrace
COMPUTED WHERE      voices are NOT computed here. The elemental ones arrive from
                    elemental-oracle-bridge processAllFast (§3.2 — regex counters).
PERSISTED WHERE     agent_runs (INSERT :120), integration_passes (INSERT :180)
                    schema: database/baseline/0001_baseline_2026-09-01.sql;
                    database/migrations/20260122000002_fix_agent_runs_schema.sql;
                    …/20260112000010_add_origin_route_and_processing_profile.sql;
                    …/20260123_agent_runs_session_id.sql
LOADED WHERE        ⛔ NOT loaded back into any turn. No reader of agent_runs feeds cognition.
                    Readers found: lib/ai/agentMonitorQueries.ts (monitoring),
                    lib/research/* (aggregate), admin surfaces.
SURFACED WHERE      ⛔ NONE member-facing.
UPDATED WHERE       once per turn, after the answer text exists
CANONICAL CALL PATH lib/sovereign/maiaService.ts:3967 logCorpusCallosumTrace(...)
                    — inside the learning-integration block, AFTER `text` is produced (:3948)
GATE                maiaService.ts:3950  CORPUS_CALLOSUM_ENABLED = process.env.CORPUS_CALLOSUM_ENABLED !== '0'
                    ⭐ DEFAULT ON. Plus turnId must exist.
                    Sanctuary refused inside the service (contentWritable checks at :115, :175).
THE VOICES ACTUALLY WRITTEN (corpusCallosumService.ts)
                    :334 / :356  MythicAtlas
                    :371 / :390  MaiaVoice   ⚠️ carries MAIA's own response text
                    :404 / :420  WisdomRouter
                    :435 / :460  one row per elemental agent, agentName from the bridge
                                 (fire, water, earth, air, aether, shadow — :229)
                    :462+        one integration_passes row
MEMBER AUTHORITY    NONE FOUND beyond Sanctuary
MAIA AUTHORITY      none — she never reads these rows back
PRACTITIONER AUTH   NONE FOUND
SYSTEM AUTHORITY    writes by default
FAILURE MODE        swallowed: maiaService.ts:4022 "[CorpusCallosum] Trace failed (non-blocking)"
CURRENT STATUS      WIRED-BUT-UNOBSERVED (write); ⛔ NOT participating in cognition
```

### 5.1 · ⭐ Does Corpus Callosum output reach a member-facing response? — **NO, at the subject.**

Three independent structural facts, each sufficient:
1. **Ordering.** The trace block begins at `maiaService.ts:3948`, inside the learning-integration
   section, and the response `text` already exists (it is passed *into* the trace at `:3978`).
2. **No reader.** No code path loads `agent_runs` or `integration_passes` into prompt assembly.
3. **Scorer is explicitly inert.** `VoiceDistinctionScorer.scoreFirewallIntegrity`
   (`maiaService.ts:4015`, class at `lib/spiralogic/VoiceDistinctionScorer.ts`) is introduced by its
   own comment at `:4001-4005`: *"observability-only collapse detector … No behavior / prompt /
   schema impact"*, and its result is emitted only as a `console.log` at `:4017` marked
   `status=…(uncalibrated) … scope=lexical-only(not-generativity)`.

⚠️ **What the elemental "dominant" DOES influence is separate and upstream** (§3.2): on CORE it
enters `[Field Intelligence]`. That is the bridge's classification reaching the prompt — **not** the
corpus-callosum trace reaching a response.

### 5.2 · ⚠️ CLAUDE.md's "eight voices" versus the code

```text
CLAUDE.md (anchor)  "8 voices — MythicAtlas + MaiaVoice + ShadowAgent + Fire/Water/Earth/Air/Aether"
CODE at subject     MythicAtlas + MaiaVoice + WisdomRouter  (corpusCallosumService.ts:334/:371/:404)
                    + up to SIX elemental rows (fire water earth air aether SHADOW, :229)
                    → 'shadow' is an ELEMENT VALUE in the bridge, not a separate "ShadowAgent"
                    → WisdomRouter is a voice the anchor does not name
```
Both sides preserved. Per D-P1-06 the anchor is operational evidence and may not amend the code
reading; per constraint 7 the anchor's runtime claim (*"2,382 lifetime turns per elemental voice",
"~49 % WisdomRouter", "8 voices firing same-second", 2026-05-24/25*) is **evidence-input only** and
is **not** re-asserted here — no database was read.

### 5.3 · The second Corpus Callosum lane

`lib/consciousness/maiaOrchestrator.ts` writes four differently-named agent rows —
`gebser-analysis` `:627`, `elemental-field` `:677`, `elemental-field-summary` `:722`,
`conversational-elemental` `:773` — plus `logIntegrationPass` `:805`. Sole importer:
`app/api/between/chat/route.ts:18`. Status **WIRED-BUT-UNOBSERVED** at the subject. C-2 input (prior
census page and `docs/specs/FIELD_TRANSITION_RECORD_PROPOSAL_2026-08-04.md:239-243`) asserts zero
BETWEEN rows in production; ⛔ not verified here, recorded as an inherited claim only.

### 5.4 · The live canonical route's own `logAgentRun`

`app/api/sovereign/app/maia/list/route.ts:19` imports `logAgentRun`; its **only** call is `:1638`
with `agentName: 'interruption-ledger'` — ⛔ **not an elemental voice.** The elemental rows on this
route arrive via `logCorpusCallosumTrace` inside `maiaService` (§5), not from the route.

---

## 6 · CAPABILITY E-5 · Per-phase framework / therapeutic-modality selection

```text
CAPABILITY          choose which interpretive or therapeutic framework is active for a member
                    given their detected element and phase
DECLARED WHERE      lib/consciousness/spiralogic-core.ts:1314 FRAMEWORK_REGISTRY
                    foundational/meta:  ARCHETYPAL_KERNEL, ARCH_ASTROLOGY, DEPTH_PSYCHOLOGY,
                                        SPIRALOGIC_META, ALCHEMICAL_OPERATIONS
                    applied:            IPP :1392  CBT :1407  JUNGIAN :1422  SHAMANIC :1437
                                        SOMATIC :1449  IFS :1464  MINDFULNESS :1479
                    each carries preferredElements[] and preferredPhases[]
                    (e.g. CBT → Fire/Air, phases [1,2];  IFS → Water/Air, phases [2,3];
                          SHAMANIC → Fire/Water, phases [1,2])
COMPUTED WHERE      :1575 chooseFrameworksForCell(cell, opts?)
                    :1581-1584 foundational+meta ALWAYS included ("the water MAIA swims in")
                    :1586-1592 applied included ONLY IF
                         enabledApplied.includes(fw.id)
                      && fw.preferredElements.includes(cell.element)
                      && fw.preferredPhases.includes(cell.phase)
                      && contexts match
                    :1579 const enabledApplied = opts?.enabledApplied ?? []
PERSISTED WHERE     NONE
LOADED WHERE        two non-test call sites, BOTH WITHOUT opts:
                      app/api/oracle/conversation/route.ts:846   ⛔ below the 410
                      app/api/maia/spiralogic/route.ts:89        no in-repo client found
SURFACED WHERE      in the retired route only: activeFrameworks flows to the prompt builder at
                    :1088 and into memory/telemetry at :1339, :1347, :1449, :1481, :1509
SUPPLY OF enabledApplied
                    ⭐ getAppliedFrameworkIdsForApproach() exists at :1504 and its ONLY references
                    are its own doc-comment :1502 and an internal validator :1519 — ⛔ no caller
                    anywhere supplies enabledApplied to chooseFrameworksForCell.
MEMBER AUTHORITY    ⛔ NONE FOUND. The doc-comment at :1502 suggests a member_settings-derived
                    "approach" would drive it; no wiring exists.
MAIA AUTHORITY      would receive framework IDs in-prompt on the retired route
PRACTITIONER AUTH   NONE FOUND
SYSTEM AUTHORITY    would select silently
GOVERNANCE GATE     ⭐ NONE FOUND. There is no consent gate, no disclosure, no refusal surface on
                    modality selection. The empty default is a code default, ⛔ not a gate.
FAILURE MODE        n/a (inert)
CURRENT STATUS      DORMANT — fully specified, structurally unreachable in its applied tier
```

⭐⭐ **The highest-consequence finding in this domain, and it is a finding about a CAPABILITY, not
about an incident.** The mapping *element + phase → clinical modality* exists as executable code
with named modalities. It cannot fire today because one optional argument is never supplied. ⛔ Per
constraint 6, locating it does not make it governed; ⛔ per the worker boundary, its inertness is not
a ruling that it is safe, and **REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED**.

Adjacent, and different: `detectInterventionTriggers(message, spiralogicCell, activeFrameworks)`
at `app/api/oracle/conversation/route.ts:881` — also below the 410.

---

## 7 · THE SHARPEST QUESTION — which SHAPE does the code implement?

P1-01 slice 05 recorded an undated, unstatused document asserting per-life-domain phase,
`dominantSpiral`, `crossSpiralTensions` and a *"consciousness GPS"*, against two dated canon sources
that refuse that shape. **Determination at the subject:**

### 7.1 · What the code implements: a UNITARY element, and THREE incompatible phase vocabularies

| Vocabulary | Where | Shape |
|---|---|---|
| `Phase = 1 \| 2 \| 3` | `lib/consciousness/spiralogic-core.ts:17`; `SpiralogicCell` `:68-75` | 4 elements × 3 phases = a **12-cell grid**; phase names at `:1553-1566` (`Fire-1 … Air-3`) |
| `phase INTEGER 1..12` | `database/migrations/20260213200001_member_spiral_state.sql:19`; `lib/voice/conductor.ts:24-28 normalizePhase` | a **12-valued scalar** |
| `Intelligence \| Intention \| Goal` | `lib/sovereign/maiaService.ts:1134-1137 getPhaseTheme`; from `lib/maia/talkModeFieldIntelligence` | a **3-valued triad** |

⚠️ The first two collide directly: the conductor writes `normalizePhase(cell?.phase)`
(`conductor.ts:340`) — a value the type system constrains to 1|2|3 — into a column whose CHECK
admits 1..12. **A 12-cell grid and a 12-value integer are not the same object**, and the column
comment (`migration :47`, "Current dominant element from conductor hysteresis") documents the
element but not the phase's intended range. Preserved as a contradiction; ⛔ not reconciled.

### 7.2 · The S-16 shape (per-domain phase, `dominantSpiral`, `crossSpiralTensions`)

```text
dominantSpiral          docs/MAIA_12_PHASE_AWARENESS_SYSTEM.md:47
                        docs/CANONICAL_SPIRALOGIC_12_PHASE_REFERENCE.md:107
crossSpiralTensions     docs/CANONICAL_SPIRALOGIC_12_PHASE_REFERENCE.md:108
"consciousness GPS"     docs/CANONICAL_SPIRALOGIC_12_PHASE_REFERENCE.md:162
                        docs/pitch/MAIA-Sovereign-Origins-Vision.md:47
IN CODE (lib app components):
  dominantSpiral         ⛔ 0 hits
  crossSpiralTensions    ⛔ 0 hits
  overallTorusMovement   ⛔ 0 hits
  emergentSynergies      ⛔ 0 hits
```

⭐ **DETERMINATION: the canonical serving lane implements NEITHER shape's phase model.** It carries a
unitary element (§3) and, on that lane, **no Spiralogic phase at all** — stated twice, in the code's
own words, at `lib/sovereign/maiaService.ts:1727` (*"Phase defaults to 1 (this route does not track
Spiralogic phase)"*) and `:1737` (`phaseSource: 'default (stream-conversation has no phase)'`), with
the same at `:2275` for DEEP.

### 7.3 · ⚠️ But a PARTIAL S-16 implementation exists off the canonical lane

```text
lib/services/spiral-constellation.ts
  :20  LifeDomain (per-domain spirals)     :26 SpiralPhase
  :33  SpiralSummary                        :57 ⚠️ CrossSpiralPattern
  :69  ConstellationTheme                   :79 MemberSpiralConstellation
  :714 exported singleton spiralConstellationService
lib/consciousness/spiral-aware-response.ts:21 imports it; :272 primaryDomain; :447 createNewSpiral
EXPOSED BY      app/api/spirals/constellation/route.ts:12 (auth-gated, getSessionUserId :28)
                app/api/consciousness/spiral-aware/route.ts:17
⛔ BACKING       spiral-constellation.ts:137 calls prisma.spiralProcess.findMany
                prisma/schema.prisma has 53 models and ⛔ NO model matching /Spiral/.
                → the model the service queries is not declared.
CLIENTS         /api/spirals/constellation ← components/debug/ConstellationDebugOverlay.tsx:100 only
                /api/consciousness/spiral-aware ← ⛔ no in-repo caller found
CURRENT STATUS  ORPHANED (declared consumer — the Prisma model — does not exist)
```

⭐ So the S-16 *vocabulary* (`CrossSpiralPattern`, per-domain spirals) **is** present as executable
TypeScript, behind authenticated routes, and is **structurally unable to return real data** because
its datastore model is undeclared. ⛔ Whether these routes error, return empty, or are dead at
runtime is **UNKNOWN** — no runtime in this container. ⛔ Its existence establishes nothing about
whether the shape is authorized.

Also present and orphaned: `lib/spiralogic/CrossSpiralPatternRecognizer.ts` (1 importer,
`lib/ain/AINSpiralogicBridge.ts:23`, types only) and `lib/spiralogic/TriadicPhaseDetector.ts`
(1 importer, same file, `:22`).

---

## 8 · INVENTORY — what exists, and what is reachable

### 8.1 · `lib/spiralogic/` (12 top-level files + 7 subdirectories), importers counted at the subject

| File | Importers outside `lib/spiralogic/` | Status |
|---|---|---|
| `VoiceDistinctionScorer.ts` | 1 — `lib/sovereign/maiaService.ts:99`, used `:4015` | **WIRED-BUT-UNOBSERVED · log-only by its own declaration** |
| `PhaseDetector.ts` | 8 — see §8.2 | WIRED (element-named "phase") |
| `core/spiralogic-engine.ts` | `app/api/spiralogic/route.ts:5`; `lib/voice/consciousness/*` ×2; backend routes | WIRED-BUT-UNOBSERVED |
| `core/spiralProcess.ts` | `lib/ain/elemental-alchemy-integration.ts:8`, `lib/ain/awareness-adjustment.ts:7` (types) | VOCABULARY |
| `types/` | `lib/maia/{modules,types,services}/*` ×3 (types only) | VOCABULARY |
| `TriadicPhaseDetector.ts`, `CrossSpiralPatternRecognizer.ts`, `integration/SpiralogicOrchestrator.ts` | 1 each | DORMANT |
| `SpiralogicDataModel.ts` (33 KB), `CollectiveWisdomLayer.ts` (14 KB), `RitualEngine.ts`, `Aether.ts`, `Agents.ts`, `SpiralogicIntelligenceLayer.ts`, `SpiralogicOrchestrator.ts` (root), `pathwayData.ts` (20 KB), `spiralogic-interface.ts` (13 KB), `Separator.ts`, `modes/gameplay-modes.ts`, `config/`, `agents/MaiaAgent.ts` | **0** | **DORMANT** (vocabulary; ~110 KB) |
| `registration/` (6 files + test) | self-contained | the one chart-to-elemental grammar with ratified backing (P1-01) |

### 8.2 · `PhaseDetector` — ⚠️ a naming trap, recorded as vocabulary-not-phase

```text
lib/spiralogic/PhaseDetector.ts:8   export type SpiralogicPhase = "Fire"|"Water"|"Earth"|"Air"|"Aether"
```
⭐ **`SpiralogicPhase` is an ELEMENT NAME, not a phase.** `detectSpiralogicPhase()` (`:94`) counts
keyword hits per element and returns `{phase, confidence, matchedKeywords}` where `phase` is an
element. `getNextPhase` (`:170`) cycles Fire→Water→Earth→Air→Aether. `detectTransition` (`:180`)
declares a transition whenever `confidence < 0.6`.

Consumers: `lib/agents/PersonalOracleAgent.ts:49` (value), `lib/memory/SymbolicPredictor.ts:17`
(value), `lib/memory/MemoryUpdater.ts:18` (value); type-only in `lib/voice/VoicePromptFromMemory.ts:14`,
`lib/voice/LanguageStylizer.ts:19`, `lib/voice/VoiceStyleMatrix.ts:14`,
`lib/memory/AINMemoryPayload.ts:11`, `lib/memory/ElementalState.ts:16`.
⛔ `VoicePromptFromMemory`, `LanguageStylizer` and `VoiceStyleMatrix` have **zero importers** →
DORMANT. `lib/agents/PersonalOracleAgent.ts` has 10+ importers but ⛔ none on the
`getMaiaResponse` lane.

### 8.3 · Elemental agent families

| Family | Path | Importers | Status |
|---|---|---|---|
| Cognitive-architecture agents (SOAR/MicroPsi/ACT-R/LIDA/POET), ~95 KB | `lib/elemental-agents/{fire,water,earth,air,aether}-agent.ts` | `lib/consciousness/VoiceCognitiveArchitecture.ts:16-20`, `lib/maia/cognitiveVoiceAnalysis.ts`, `lib/sacred-oracle-constellation.ts` — ⛔ none on the canonical lane | DORMANT |
| Elemental alchemy | `lib/elemental-alchemy/practices.ts` (24 KB), `assessmentQuestions.ts`, `journalService.ts` | `maiaService.ts:113` imports `getAllPractices` | WIRED (practice content, not phase logic) |
| Elemental oracle blueprint | `lib/elemental-oracle/blueprint-integration.ts` | — | DORMANT |
| Aether facets | `lib/aether-facets.ts` | ⛔ **0** | ORPHANED |

### 8.4 · Additional elemental persistence substrates found (beyond `member_spiral_state`)

```text
bead_events.spiralogic_element        database/baseline/0001_baseline_2026-09-01.sql:5863
                                      index :28493
  READ by lib/sovereign/maiaService.ts:455-461 (getConsciousnessPolicy, 30-day window)
  → policy.dominantElement logged :801 and carried into awareness-level guidance
  ⛔ NO migration file declares this column; it appears only in the baseline. Recorded as-is.
prisma model ElementalState          prisma/schema.prisma:227 — per-element floats + dominantElement
prisma model ElementalEvolution      prisma/schema.prisma:253
  ⚠️ a THIRD elemental persistence shape, on a client (Prisma) the project's own doctrine does not
  name as its database access path. Preserved as a finding; ⛔ not adjudicated.
member_spiral_state.facet_id/facet_movement   lib/consciousness/innerGuideFieldPersistence.ts:73
  (UPDATE only; ":82 We don't create rows" — depends on a writer that no longer runs)
```

---

## 9 · CONTRADICTIONS (both sides, unreconciled)

**C-E1 · Phase is 1–3, and phase is 1–12.**
`lib/consciousness/spiralogic-core.ts:17` — `export type Phase = 1 | 2 | 3`, giving a 12-**cell**
grid of 4 elements × 3 phases (`:1545-1566`).
`database/migrations/20260213200001_member_spiral_state.sql:19` — `phase INTEGER CHECK BETWEEN 1 AND
12`, and `lib/voice/conductor.ts:24-28` normalizes to 1..12.
The conductor writes the former into the latter (`conductor.ts:340` → `route.ts:1612`). Both stand.

**C-E2 · And phase is `Intelligence | Intention | Goal`.**
`lib/sovereign/maiaService.ts:1134-1137`. A third vocabulary, on the canonical lane, computed and
then deliberately not appended (`:1198`). Both stand alongside C-E1.

**C-E3 · The canonical route both "does not track Spiralogic phase" and injects a phase.**
`maiaService.ts:1727` / `:1737` / `:2275` state in code that the route has no phase and default to
1. `maiaService.ts:1098` computes `Phase detected: …` for the same route's prompt. Reconciled by
`:1198` refusing to append it — ⛔ but the two statements are made by the same file about the same
turn and are recorded as they stand.

**C-E4 · CLAUDE.md's "8 voices" vs. the code's MythicAtlas + MaiaVoice + WisdomRouter + ≤6 elemental.**
§5.2. Under D-P1-06 the anchor does not amend the code reading; both are preserved.

**C-E5 · C-2's "spiralogicReference imported only by soulPortrait/schema" vs. zero importers.**
§2. Re-read at the subject: `lib/soulPortrait/schema.ts:19` is a comment. Both preserved; the
subject reading governs this record.

**C-E6 · `member_spiral_state` is described as the anti-regression continuity substrate, and has no
writer.** Migration `:1-5` — *"prevents treating returning members like new people"*; CLAUDE.md's
Bridge D section documents a live wire into `app/api/oracle/conversation/route.ts`. That route
refuses at `:446-453`. Both preserved; ⛔ no repair implied.

**C-E7 · R16 strips inferred developmental state from shaping; the member API returns it unstripped.**
`lib/relational/developmentalStateAdmission.ts:31-39, :61` vs.
`app/api/members/spiral-state/route.ts:28-29`. Two different boundaries, one field class. Preserved
as an asymmetry, ⛔ not adjudicated — the shaping law does not claim the disclosure surface.

**C-E8 · `spiral-constellation.ts` implements the S-16 cross-spiral shape against a nonexistent
Prisma model.** §7.3. Code present and route-exposed; datastore model absent.

---

## 10 · UNLOCATED GOVERNANCE

| # | Capability | What is missing |
|---|---|---|
| **UG-E1** | **Per-phase therapeutic-modality selection** (§6) | ⛔ NONE FOUND — no consent gate, no disclosure, no refusal surface, no member authority, no ratified source locating IPP/CBT/JUNGIAN/SHAMANIC/SOMATIC/IFS in a phase grid. P1-01 named this the highest-consequence unlocated gap; **the code exists**, and per constraint 6 that changes nothing about its governance. |
| **UG-E2** | **Element injected into MAIA's system prompt** (§3.1, §3.2) | ⛔ NONE FOUND. A member-derived elemental classification enters the prompt on every CORE and DEEP turn with no consent gate, no member visibility, no opt-out and no correction path. Sanctuary gates the `[Field Intelligence]` block (`fieldOrchestrator.ts:168-178`); nothing gates `context.summary`. |
| **UG-E3** | **`phase` 1..12 as a persisted member attribute** | ⛔ NO ratified definition of what integer 1..12 denotes was located; the migration comments the element column and not the phase range. R16 does not cover `phase`. |
| **UG-E4** | **Disclosure of `relationalPhase` / `autonomyStreak` to the member's client** | ⛔ NONE FOUND for the disclosure act, though a shaping refusal exists for the same fields (§4.3). |
| **UG-E5** | **`bead_events.spiralogic_element` → `getConsciousnessPolicy` → awareness-level guidance** | ⛔ No migration declares the column; no governance located for a 30-day elemental aggregate influencing MAIA's awareness-level posture (`maiaService.ts:443-506`, `:801`). |
| **UG-E6** | **Corpus Callosum default-on write of MAIA's own response text** into `agent_runs` (`corpusCallosumService.ts:376`, first 500 chars) | Sanctuary is refused at `:115`/`:175` — ⭐ a real gate. ⛔ No further governance located for the non-Sanctuary default-on case. |
| **UG-E7** | **Interpretive / conversational Spiralogic as ratified canon** | Confirmed at the subject: the only Spiralogic artifact with ratified backing is the chart-to-elemental `registration/` grammar. The prompt-facing gloss (§2) is orphaned. The 12-phase documents carry no status. |

⭐ Per the instrument, `GOVERNANCE GATE: NONE FOUND` is a finding. ⛔ None of the above is a repair
proposal. **REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.**

---

## 11 · NAMED-BUT-UNVERIFIED ARTIFACTS

| Named in | Named artifact | Verification at the subject |
|---|---|---|
| CLAUDE.md, Bridge D section | *"Wire points in `app/api/oracle/conversation/route.ts` … 1. Load early (line ~415) 2. Pass to conductor (line ~1049) 3. Upsert late (line ~1067)"* | The calls exist at `:648`, `:1592`, `:1611` — ⛔ all below the unconditional 410 at `:446-453`. The described behaviour cannot occur. |
| CLAUDE.md, Corpus Callosum Cat 6 entry | 8 named voices; *"2,382 lifetime turns per elemental voice"*; *"WisdomRouter ~49 %"*; *"DEEP zero rows, BETWEEN zero rows"* | Voice names diverge (§5.2). All row counts are **UNKNOWN** — no database access. Recorded as evidence-input only (constraint 7). |
| CLAUDE.md | *"live on `/api/sovereign/app/maia` FAST + CORE"* for Corpus Callosum | The trace block is reached from `getMaiaResponse` on all tiers (`maiaService.ts:3948-4022`) and gated only by `CORPUS_CALLOSUM_ENABLED !== '0'` and `turnId`. No tier restriction found in code. |
| `docs/CANONICAL_SPIRALOGIC_12_PHASE_REFERENCE.md`, `docs/MAIA_12_PHASE_AWARENESS_SYSTEM.md` | `dominantSpiral`, `crossSpiralTensions`, `emergentSynergies`, `overallTorusMovement`, per-life-domain `PhaseState`, *"consciousness GPS"* | ⛔ **0 code hits** for four of them. `CrossSpiralPattern` exists at `lib/services/spiral-constellation.ts:57` against a missing Prisma model (§7.3). |
| `lib/consciousness/spiralogic-core.ts:1502` | `getAppliedFrameworkIdsForApproach(guideId)` as the supplier of `enabledApplied` | The function exists at `:1504`; ⛔ no caller supplies its output to `chooseFrameworksForCell`. |
| `lib/services/spiral-constellation.ts:137` | `prisma.spiralProcess` | ⛔ No `model Spiral*` in `prisma/schema.prisma` (53 models scanned). |
| `app/admin/platform-overview/page.tsx:508` | *"Determines: Element + Phase (1-3) + Arc + Frameworks (IPP, CBT, Jungian, etc.)"* as a live flow node | Describes the retired lane (§6). ⚠️ An admin surface depicts as current a pipeline that returns 410. |
| `lib/consciousness/spiralogic-core.ts:1651` | `inferSpiralogicCell` — header comment *"TODO: Implement with LLM classification or keyword heuristics"*, body *"Simplified implementation"* | Present; both non-test callers are §6's two routes. |

---

## 12 · OPEN QUESTIONS FOR P1-04

1. **The domain's real footprint is one interpolated word.** Of ~200 KB of Spiralogic/elemental code,
   what actually reaches MAIA's canonical prompt is `dominantElement` inside a summary sentence
   (§3.1) and the same value inside a JSON blob (§3.2) — both from keyword regexes over one message.
   Does *EXISTS ≠ PARTICIPATES* hold here at the scale P1-04 needs to record?
2. **`[Field Intelligence]` is an unbounded serialization into the prompt.**
   `fieldOrchestrator.ts:387` does `JSON.stringify(field)` on the entire context object. Whatever is
   added to `FieldContext` in future reaches the prompt automatically, with no allowlist. Is that a
   Domain D question, a Domain E question, or a cross-domain one?
3. **Which object is `phase`?** Three vocabularies (C-E1, C-E2), one persisted column, no ratified
   definition (UG-E3). P1-04 cannot evaluate *"MAIA assigns a phase"* until the referent is named —
   the vocabulary rule applied to this domain's own central word.
4. **A capability that is one argument away from firing.** §6's modality selector needs only
   `enabledApplied` to become live. Does P1-04's framework distinguish *dormant* from *dormant behind
   a single optional parameter*, and should it?
5. **Frozen developmental rows.** `member_spiral_state` has readers, one prompt-rendering reader
   (§4.2 #1), and no writer. Rows written before the oracle lane's retirement are being read today as
   if current. Is *stale persisted developmental state still shaping a prompt* an X-19 matter, a
   memory-domain matter, or its own class?
6. **R16's scope.** The admission boundary names a field CLASS and explicitly invites extension
   (`developmentalStateAdmission.ts:31-39`). `dominant_element` and `phase` are not in it, and the
   member-facing disclosure route bypasses it entirely (C-E7). Is the class under-drawn, or is
   disclosure correctly outside a shaping law? ⛔ Not answerable at census authority.
7. **Corpus Callosum's claim.** Six regex counters producing template strings are written to
   `agent_runs` as "voices", and a lexical scorer measures their "distinction". The code labels both
   honestly (`fast_pattern_match`, `(uncalibrated)`, `scope=lexical-only(not-generativity)`). Does
   the *record* — rows named `FireAgent`/`WaterAgent` with a `wisdom` column — carry a stronger claim
   than the computation? A representation question for P1-04, ⛔ not adjudicated here.
8. **Two live elemental detectors, one turn.** `ConversationElementalTracker` (§3.1, in-memory) and
   `ElementalOracleBridge` (§3.2, per-message) can disagree on the same turn, and both reach the same
   prompt by different routes. Nothing reconciles them. Which is "the member's element"?
9. **Three persistence substrates for one concept** (§8.4): `member_spiral_state`,
   `bead_events.spiralogic_element`, Prisma `ElementalState`. Overlapping or distinct? (Domain C's
   question, raised from E's evidence.)

---

## 13 · STATUS ROLL-UP

```text
LIVE                    ⛔ NONE — no runtime or production witness available in this container
WIRED-BUT-UNOBSERVED    E-2 element→prompt (ConversationElementalTracker; ElementalOracleBridge→
                        [Field Intelligence] on CORE) · E-4 Corpus Callosum writes ·
                        member_spiral_state READ path (4 readers, 1 prompt-rendering) ·
                        bead_events elemental policy · VoiceDistinctionScorer (log-only)
COMPUTED-NOT-SURFACED   Talk-mode fieldAwareness (element + phase), maiaService.ts:1079/:1094/:1198
DORMANT                 per-phase modality selection (§6) · member_spiral_state WRITE path ·
                        conductor.ts (hysteresis, scoreRoute, createVoiceIntent) ·
                        relationalStance via R16 · lib/elemental-agents/* ·
                        ~110 KB of lib/spiralogic/* with zero importers ·
                        PhaseDetector's voice consumers · elemental-oracle-bridge LLM path
ORPHANED                lib/maia/spiralogicReference.ts (0 importers) ·
                        lib/aether-facets.ts (0 importers) ·
                        lib/services/spiral-constellation.ts (prisma.spiralProcess undeclared)
DOCUMENTATION-ONLY      dominantSpiral · crossSpiralTensions · emergentSynergies ·
                        overallTorusMovement · per-life-domain PhaseState · "consciousness GPS"
UNKNOWN                 every row count · every production behaviour · whether the exposed
                        constellation routes error or return empty at runtime
```

⭐ *A traced import chain proves wiring. It does not prove participation, and it never proves
authorization.*

⛔ **No repair proposed. No contradiction reconciled. No minimum repair set.
REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.**
