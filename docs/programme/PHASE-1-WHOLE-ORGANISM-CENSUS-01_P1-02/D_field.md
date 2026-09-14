# P1-02 · DOMAIN D — FIELD INTELLIGENCE

```text
STEP        P1-02 · PARALLEL ORGANISM CENSUS
DOMAIN      D — FIELD INTELLIGENCE
SUBJECT     1a5554300e855d3581085849301a39cbb10ab385
TYPE        RECORD ONLY — evidence, never rulings
AUTHORITY   READ / TRACE / CLASSIFY
```

> **P1-02 asks what the organism does. It does not infer from doing that the organism is
> authorized to do it.**

---

## 0 · Subject verification and container calibration

```text
census subject      1a5554300e855d3581085849301a39cbb10ab385
working tree HEAD   f0279c5b0eee0ae7090df38b67d820923917c58c
ancestry            `git merge-base --is-ancestor 1a55543 HEAD` → YES
code delta          `git diff --stat 1a55543 HEAD -- lib/ app/ database/ components/` → EMPTY
```

⭐ The two commits between subject and HEAD are documentation-only. **Every file:line in this
record is therefore a reading at the census subject**, not merely at the tip.

**No runtime. No database. No production access.** Per the instrument's LIVE calibration, no
object in this domain is reported `LIVE` unless a traced call path AND a dated in-repo
runtime/production witness both exist. **No dated runtime witness for any field object was
located in `docs/**` at the subject.** The honest default here is `WIRED-BUT-UNOBSERVED`.

---

## 1 · THE OBJECT ENUMERATION (done before any status)

⛔ Per the hard vocabulary rule, nothing below is a finding about the *word* "field",
"coherence", "resonance", "RFI" or "UFI". Each row is a concrete artifact.

### 1.1 · Summary of the lexical situation at the subject

| Word | Distinct code objects found | Note |
|---|---|---|
| **field** | **at least 19** distinct code/table objects, in **7 unrelated semantic families** | see §5 |
| **coherence** | **6** distinct numeric quantities, none convertible into another | see §5.2 |
| **resonance** | **5** distinct objects, incl. **two different classes with the identical name** | see §5.3 |
| **RFI** | **0 code objects.** `grep -rn "\bRFI\b" lib/ app/ components/ database/` → **no match** | §5.4 |
| **UFI** | **0 code objects.** One comment mention only | §5.4 |

### 1.2 · The enumerated objects

**Family A — objects on the canonical member cognition path (`lib/sovereign/maiaService.ts`)**

| Label | Object | Path |
|---|---|---|
| D-OBJ-1 | `buildFieldContext` / `formatFieldAddendum` / `FieldContext` | `lib/field/fieldOrchestrator.ts` (391 L) |
| D-OBJ-2 | `generatePFIMindState` (PFI mind state) | `lib/sovereign/pfiMindEntrypoint.ts` |
| D-OBJ-3 | `ResonanceFieldGenerator` | `lib/maia/resonance-field-system.ts` (657 L) |
| D-OBJ-4 | `UnifiedElementalFieldCalculator` | `lib/consciousness/field/UnifiedElementalFieldCalculator.ts` (517 L) |
| D-OBJ-5 | `routePanconsciousField` → `FieldRoutingDecision` | `lib/field/panconsciousFieldRouter.ts` (127 L) |
| D-OBJ-6 | `enforceFieldSafety` → `FieldSafetyDecision` | `lib/field/enforceFieldSafety.ts` (103 L) + `fieldSafetyCopy.ts` (189 L) |
| D-OBJ-7 | `analyzeFieldIntelligence` → `FieldIntelligence` | `lib/maia/talkModeFieldIntelligence.ts` (329 L) |
| D-OBJ-8 | `logFieldOrchestratorTelemetry` + table `field_orchestrator_telemetry` | `lib/field/fieldOrchestratorTelemetry.ts` (115 L) |

**Family B — objects on the second cognition path (`app/api/oracle/conversation/route.ts`)**

| Label | Object | Path |
|---|---|---|
| D-OBJ-9 | `getFieldContext` / `buildFieldContextPromptBlock` (vault-backed) | `lib/maia/fieldContextAdapter.ts` |
| D-OBJ-10 | `coherenceFieldService` + table `coherence_field_readings` | `lib/consciousness/memory/CoherenceFieldService.ts` (403 L) |

**Family C — object on the voice path**

| Label | Object | Path |
|---|---|---|
| D-OBJ-11 | `fireAndForgetFieldMonitor` + table `field_monitor_turns` | `lib/consciousness/fieldMonitorTelemetry.ts` (575 L) |

**Family D — unreached computation bearing field/coherence/resonance names**

| Label | Object | Path (LOC) |
|---|---|---|
| D-OBJ-12 | `QuantumFieldMemory` | `lib/consciousness/memory/QuantumFieldMemory.ts` (810) |
| D-OBJ-13 | `ConsciousnessField` engine | `lib/consciousness/field/ConsciousnessFieldEngine.ts` (466) |
| D-OBJ-14 | `MAIAFieldInterface` | `lib/consciousness/field/MAIAFieldInterface.ts` (575) |
| D-OBJ-15 | `ElementalFieldIntegration` | `lib/consciousness/field/ElementalFieldIntegration.ts` (870) |
| D-OBJ-16 | `ElementalInterferenceMonitor` | `lib/consciousness/field/ElementalInterferenceMonitor.ts` (584) |
| D-OBJ-17 | `QuantumFieldPersistence` | `lib/consciousness/field/QuantumFieldPersistence.ts` (434) |
| D-OBJ-18 | `EnhancedMAIAFieldIntegration` | `lib/consciousness/memory/EnhancedMAIAFieldIntegration.ts` (1096) |
| D-OBJ-19 | `ResonanceFieldOrchestrator` **(A)** | `lib/field/ResonanceFieldOrchestrator.ts` (783) |
| D-OBJ-20 | `ResonanceFieldOrchestrator` **(B)** — same class name, different file | `lib/oracle/ResonanceFieldOrchestrator.ts` (629) |
| D-OBJ-21 | `MaiaFieldOrchestrator` | `lib/maia/MaiaFieldOrchestrator.ts` (571) |
| D-OBJ-22 | `FieldIntelligenceSystem` / `RelationalField` | `lib/field-intelligence-system.ts` (690) |
| D-OBJ-23 | `MAIAFieldAwareness` | `lib/maia-field-intelligence-integration.ts` (559) |
| D-OBJ-24 | `FieldCoherenceTensor` + `fieldIntegrityValidation` | `lib/field/fieldCoherenceTensor.ts` (388), `fieldIntegrityValidation.ts` (591) |
| D-OBJ-25 | `FieldAnalytics` | `lib/field/FieldAnalytics.ts` (277) |
| D-OBJ-26 | `ParallelFieldProcessor` + `fieldProtocol/{validation,storage}` | `lib/fieldProtocol/` (1657 total) |
| D-OBJ-27 | `FieldRecordsService` / `FieldRecordsRepo` + table `field_records` | `lib/field-protocol/` (1061 total) |
| D-OBJ-28 | `neuropodEligibility`, `energyState` | `lib/field/` (564 total) |

**Family E — product surfaces bearing the word, NOT field intelligence**

| Label | Object | Path |
|---|---|---|
| D-OBJ-29 | "Fields" collaborative workspace (`field_ideas`, `field_kanban_cards`, `field_decisions`, `field_people`, `field_programs`, `field_artifacts`, …) | `app/fields/[field]/**`, `app/api/fields/[slug]/**` |
| D-OBJ-30 | "Living Field" (`living_field_affinities`, `personal_living_fields`) | `app/maia/living-field/**`, `components/maia/living-field/**` |
| D-OBJ-31 | "Field Lab" experiment shelf | `app/maia/field-lab/**`, `lib/maia/fieldLab/shelf.ts` |
| D-OBJ-32 | `/field/*` — voice-first MAIA conversation surface | `app/field/layout.tsx`, `app/field/talk/` |
| D-OBJ-33 | "Practice Field" (`practice_fields`, `practice_field_snapshots`) | `app/api/practitioner/practice-field/**` |
| D-OBJ-34 | "Wisdom Field" circles (`wisdom_fields`, `wisdom_field_circles`, …) | schema + `WISDOM_FIELD_MOVES` |
| D-OBJ-35 | **Field Coherence Index dashboard** + `/api/field-analytics/report` | `app/labtools/field-analytics/page.tsx` |
| D-OBJ-36 | "Coherence" breath/HRV protocol tool | `app/labtools/coherence/page.tsx` |
| D-OBJ-37 | `rhythmCoherence` debug overlay inside the member conversation component | `components/OracleConversation.tsx` |
| D-OBJ-38 | "Relational Field" sensing flow | `app/labtools/relational-field/page.tsx` |
| D-OBJ-39 | `/api/maia/field` — "field perception bundle" | `app/api/maia/field/route.ts` |
| D-OBJ-40 | `ResonanceEngine` (elemental probability engine) + `resonanceHysteresis`, `resonance-map` | `lib/resonanceEngine.ts` (140), `lib/resonanceHysteresis.ts` (213), `lib/resonance-map.ts` (373) |

---

## 2 · CAPABILITY RECORDS — Family A (canonical member cognition path)

⚠️ Records in §2 and §3 use the full instrument schema. §4 compresses Families D and E into
schema-complete table rows; the compression is declared, not silent.

### D-OBJ-1 · `FieldContext` seam — `lib/field/fieldOrchestrator.ts`

```text
CAPABILITY        Assemble a JSON "field" object from three engines and append it verbatim
                  to MAIA's system prompt.
DECLARED WHERE    lib/field/fieldOrchestrator.ts:1-14 (header: "the ONLY file that knows how
                  the field engines connect"); type at :36-62
COMPUTED WHERE    lib/field/fieldOrchestrator.ts:154 buildFieldContext()
PERSISTED WHERE   Not itself persisted. Metrics → D-OBJ-8.
LOADED WHERE      n/a — computed per turn, not loaded
SURFACED WHERE    ⭐ INTO THE PROMPT: lib/field/fieldOrchestrator.ts:234-242
                  formatFieldAddendum() returns "\n\n[Field Intelligence]\n" + JSON.stringify(field)
                  appended at lib/sovereign/maiaService.ts:1534 (FAST) and :1962 (CORE)
                  ⛔ NOT surfaced to the member as UI.
UPDATED WHERE     per turn; no stored state
CANONICAL CALL    app/api/sovereign/app/maia/list/route.ts → lib/sovereign/maiaService.ts:1521
PATH              (FAST) / :1946 (CORE) → buildFieldContext → { D-OBJ-2, D-OBJ-3, D-OBJ-4 }
UPSTREAM DEPS     pfiMindEntrypoint (D-OBJ-2), resonance-field-system (D-OBJ-3),
                  UnifiedElementalFieldCalculator (D-OBJ-4), cognitiveProfileService
DOWNSTREAM        baseSystemPrompt (FAST), adaptivePrompt (CORE), D-OBJ-8 telemetry
MEMBER AUTHORITY  ⚠️ NONE FOUND except Sanctuary. isSanctuary → meta-only, sources: []
                  (fieldOrchestrator.ts:169-175). No opt-in, no opt-out, no visibility.
MAIA AUTHORITY    Receives the JSON as unlabelled prompt context; no instruction governs its use.
PRACTITIONER      NONE FOUND.
SYSTEM AUTHORITY  Depth gating is hardcoded, not configured: pfi:true, resonance: depth>=3,
                  unified: depth>=4 (fieldOrchestrator.ts:161-165). Caps: 250ms/module,
                  3000 chars. try/catch swallows all errors (maiaService.ts:1543).
GOVERNANCE GATE   ⛔ NONE FOUND. No env flag, no consent row, no canon citation in the file.
                  ⭐ See CONTRA-1: this path CALLS D-OBJ-2 while bypassing D-OBJ-2's own
                  declared default-OFF feature flag.
FAILURE MODE      Silent. Both the inner catch and the maiaService catch are empty/log-only;
                  a total field failure is indistinguishable from a healthy empty field.
CURRENT STATUS    WIRED-BUT-UNOBSERVED
                  (complete traced path from a real entry point; no dated runtime witness
                  for "[field-orchestrator]" or field_orchestrator_telemetry found in docs/)
SOURCE EVIDENCE   fieldOrchestrator.ts:1,21,24,154,161,169,234; maiaService.ts:101,1521,1534,
                  1537,1946,1962,1965
CONTRADICTIONS    CONTRA-1, CONTRA-4
UNRESOLVED        Q-D1, Q-D2
```

### D-OBJ-2 · PFI mind state — `lib/sovereign/pfiMindEntrypoint.ts`

```text
CAPABILITY        Generate MAIA's "pre-language mind state" (element, coherence, realm,
                  fieldWorkSafe, deepWorkRecommended).
DECLARED WHERE    pfiMindEntrypoint.ts:1-16 — "The ONLY function that generates MAIA's
                  pre-language mind state. All response paths (FAST/CORE/DEEP) call through
                  this." Declared flags: MAIA_PFI_MIND (default OFF),
                  MAIA_PFI_FULL_INTEGRATION (default OFF).
COMPUTED WHERE    pfiMindEntrypoint.ts:94 generatePFIMindState()
PERSISTED WHERE   PFITelemetryRecord type exists (:22-30 import); no write traced in this file.
SURFACED WHERE    Into D-OBJ-1's FieldContext.pfi { element, coherence, fieldWorkSafe, realm,
                  deepWorkRecommended } → prompt. ⛔ No member UI.
CANONICAL CALL    TWO CALLERS WITH DIFFERENT GATING —
PATH              (a) lib/sovereign/maiaService.ts:2916, inside `if (isPFIMindEnabled())`
                  (b) lib/field/fieldOrchestrator.ts (flags.pfi hardcoded `true`, :162),
                      reached from maiaService.ts:1521 and :1946 — ⭐ UNGATED
MEMBER AUTHORITY  NONE FOUND.
SYSTEM AUTHORITY  The declared flag governs (a) and does not govern (b).
GOVERNANCE GATE   ⚠️ PARTIAL / DEFEATED IN ONE PATH. `isPFIMindEnabled()` is defined at
                  :247 and called at exactly one site (maiaService.ts:2916).
                  ⭐ Stated as evidence, not as a ruling: the file declares the capability
                  default-OFF, and one of its two live callers does not consult the flag.
FAILURE MODE      Swallowed by D-OBJ-1's catch.
CURRENT STATUS    WIRED-BUT-UNOBSERVED (via path b) · BLOCKED-BY-FLAG (via path a, default OFF)
SOURCE EVIDENCE   pfiMindEntrypoint.ts:1-16,94,247,254; fieldOrchestrator.ts:16-20,161-165;
                  maiaService.ts:31,2916
CONTRADICTIONS    CONTRA-1
```

### D-OBJ-3 · `ResonanceFieldGenerator` — `lib/maia/resonance-field-system.ts`

```text
CAPABILITY        Generate a per-utterance resonance field: five elemental weights,
                  wordDensity, silenceProbability, fragmentationRate.
COMPUTED WHERE    invoked at fieldOrchestrator.ts (resonance branch) via rfs.generateField(
                  args.text, {userWeather:'',userState:''}, exchangeCount, intimacyLevel)
                  — ⚠️ userWeather and userState are passed as EMPTY STRINGS.
PERSISTED WHERE   NONE FOUND for this instance.
SURFACED WHERE    FieldContext.resonance → "[Field Intelligence]" prompt JSON.
CANONICAL CALL    D-OBJ-1, gated on depth >= 3 (turn 4+ of a conversation).
MEMBER AUTHORITY  NONE FOUND (Sanctuary only, inherited from D-OBJ-1).
SYSTEM AUTHORITY  `intimacyLevel = min(1, exchangeCount/30)` — a monotonic function of turn
                  count, computed and named "intimacy", fed to the generator.
GOVERNANCE GATE   ⛔ NONE FOUND.
CURRENT STATUS    WIRED-BUT-UNOBSERVED
SOURCE EVIDENCE   fieldOrchestrator.ts:21, resonance branch; lib/maia/resonance-field-system.ts
UNRESOLVED        Q-D3 (silenceProbability / fragmentationRate are named as response-shaping
                  quantities; no consumer of them other than the prompt JSON was traced)
```

### D-OBJ-4 · `UnifiedElementalFieldCalculator`

```text
CAPABILITY        Compute elementPressure (5 elements), dominantElement, coherenceLevel
                  (string), interference[] .
COMPUTED WHERE    lib/consciousness/field/UnifiedElementalFieldCalculator.ts (517 L)
SURFACED WHERE    FieldContext.unified → prompt JSON (D-OBJ-1:44-49)
CANONICAL CALL    D-OBJ-1, gated on depth >= 4
OTHER CONSUMERS   6 importers incl. components/consciousness/ElementalPentagramDashboard.tsx:14
                  (see D-OBJ-E table — that component has no traced page mounting it)
GOVERNANCE GATE   ⛔ NONE FOUND.
CURRENT STATUS    WIRED-BUT-UNOBSERVED
SOURCE EVIDENCE   fieldOrchestrator.ts:22-24,161-165
```

### D-OBJ-5 + D-OBJ-6 · Panconscious field routing and field safety

```text
CAPABILITY        (5) Classify the turn into FieldRealm UNDERWORLD | MIDDLEWORLD |
                  UPPERWORLD_SYMBOLIC with fieldWorkSafe / deepWorkRecommended /
                  maxSymbolicIntensity. (6) Convert that into an ALLOW or REFUSE decision.
COMPUTED WHERE    panconsciousFieldRouter.ts:5-30 (types), routePanconsciousField();
                  enforceFieldSafety.ts:25 enforceFieldSafety()
PERSISTED WHERE   NONE FOUND.
SURFACED WHERE    ⭐⭐ DIRECTLY AS MAIA'S ANSWER ON REFUSAL. maiaService.ts:2848 —
                  `const text = fieldSafety.message ?? "Let's take the safest next step
                  together."` returned before the turn reaches a model.
                  Copy source: lib/field/fieldSafetyCopy.ts (189 L).
CANONICAL CALL    maiaService.ts:2207 routePanconsciousField(...) → attached to
PATH              `(meta as any).fieldRouting` (:2216); maiaService.ts:2838 enforceFieldSafety(
                  {cognitiveProfile, element, userName, context:'maia'})
UPSTREAM DEPS     getCognitiveProfile(userId||sessionId) — maiaService.ts:2833. If no
                  cognitiveProfile, the guard does not run at all.
MEMBER AUTHORITY  ⛔ NONE FOUND. The member cannot see, contest, or opt out of the realm
                  classification that can refuse their turn.
MAIA AUTHORITY    ⛔ None — the refusal is produced by the guard, not by MAIA.
SYSTEM AUTHORITY  ⭐ HIGHEST IN THIS DOMAIN: this is the only field object traced at the
                  subject that can substitute its own text for MAIA's response.
GOVERNANCE GATE   ⚠️ PARTIAL. maiaService.ts:2844-2847 and :2856+ carry in-source constitutional
                  commentary ("H2 · Field safety MAY legitimately refuse a turn", "W2 · A
                  PRE-HANDOFF REFUSAL MUST LEAVE NO RESPONSE BEHIND"). ⭐ Per constraint 6,
                  in-source commentary citing an obligation is NOT a located governing source;
                  no ratified document authorizing realm-based refusal was located (§7).
FAILURE MODE      Fails OPEN — wrapped in try, and skipped entirely when cognitiveProfile is null.
CURRENT STATUS    WIRED-BUT-UNOBSERVED
SOURCE EVIDENCE   panconsciousFieldRouter.ts:1-30; enforceFieldSafety.ts:1-28;
                  maiaService.ts:26,27,2200-2220,2830-2860
UNRESOLVED        Q-D4
```

### D-OBJ-7 · `analyzeFieldIntelligence` — Talk Mode field intelligence

```text
CAPABILITY        Detect element, phase, userState, spiralScale, complexity, confidence from
                  the current input + history; select a WISDOM_FIELD_MOVES entry.
COMPUTED WHERE    lib/maia/talkModeFieldIntelligence.ts:287 analyzeFieldIntelligence();
                  :327 getFieldIntelligenceSummary()
SURFACED WHERE    ⭐ INTO THE PROMPT as a labelled block: maiaService.ts:1094-1110
                  "🎯 TALK MODE FIELD INTELLIGENCE (Reference Context)" listing element,
                  phase, user state, spiral scale, complexity and a confidence percentage,
                  closing "Your response emerges from your own intelligence, informed by this
                  field sensing." ⛔ Not shown to the member.
CANONICAL CALL    maiaService.ts:1082 — dynamic import inside Talk Mode assembly.
PATH              ⚠️ maiaService.ts:1198 — "fieldAwareness intentionally NOT appended - too
                  diagnostic for early exchanges": the block is suppressed on early turns.
MEMBER AUTHORITY  NONE FOUND.
GOVERNANCE GATE   ⛔ NONE FOUND.
FAILURE MODE      maiaService.ts:1114 — console.warn, continue without.
CURRENT STATUS    WIRED-BUT-UNOBSERVED
CONTRADICTIONS    CONTRA-3 (fieldMonitorTelemetry.ts:165 calls this module "DORMANT")
SOURCE EVIDENCE   talkModeFieldIntelligence.ts:27,287,327; maiaService.ts:1079-1114,1198
```

### D-OBJ-8 · Field orchestrator telemetry

```text
CAPABILITY        Persist FieldContext metrics per turn for the admin Command Center.
PERSISTED WHERE   lib/field/fieldOrchestratorTelemetry.ts:45 INSERT INTO
                  field_orchestrator_telemetry; table at database/baseline/...sql:9815
LOADED WHERE      fieldOrchestratorTelemetry.ts:91; app/api/admin/command-center/overview/
                  route.ts:67,230; app/api/admin/command-center/field-engines/route.ts:38,44
SURFACED WHERE    Admin Command Center only. ⛔ Not member-facing.
CALL PATH         maiaService.ts:1537 (FAST) / :1965 (CORE), fire-and-forget
MEMBER AUTHORITY  ⛔ NONE FOUND — no consent gate on the write, no member read path.
GOVERNANCE GATE   ⛔ NONE FOUND.
CURRENT STATUS    WIRED-BUT-UNOBSERVED
```

---

## 3 · CAPABILITY RECORDS — Families B and C (other cognition paths)

### D-OBJ-9 · `fieldContextAdapter` — vault-backed field context

```text
CAPABILITY        Read-only Spiralogic-engine field context, injected as a prompt block.
DECLARED WHERE    lib/maia/fieldContextAdapter.ts:1-22 — explicitly does NOT call
                  SpiralogicEngine.enterSpiral ("would mutate user spiral state").
GOVERNANCE GATE   ⭐ PRESENT AND NAMED: app/api/oracle/conversation/route.ts:853
                  `if (process.env.MAIA_FIELD_CONTEXT_ENABLED === 'true')`.
                  Failure is announced, not swallowed: lib/sovereignty/driftAlarm.ts:11
                  emits `field_context_unavailable` when the flag is true and the source is
                  absent. ⭐ This is the ONLY field object in Domain D found with a named
                  flag, a named absence event, and a declared non-mutation boundary.
UPSTREAM DEPS     OBSIDIAN_VAULT_PATH → /app/data/ain-vault, a READ-ONLY host bind of
                  /home/soullab/AIN (docker-compose.production.yml:197-202).
CURRENT STATUS    WIRED-BUT-UNOBSERVED · flag state at runtime UNKNOWN in this container
SOURCE EVIDENCE   fieldContextAdapter.ts:1-40,100-128; oracle/conversation/route.ts:127,853;
                  spiralogic-engine.ts:643; docker-compose.production.yml:197-202
```

### D-OBJ-10 · `coherenceFieldService` + `coherence_field_readings`

```text
CAPABILITY        Record and read an elemental coherence reading per member
                  (coherenceScore, fire/water/earth/air/aether levels, balanceQuality).
COMPUTED WHERE    lib/consciousness/memory/CoherenceFieldService.ts
PERSISTED WHERE   CoherenceFieldService.ts:80 INSERT INTO coherence_field_readings;
                  table at database/baseline/0001_baseline_2026-09-01.sql:6926
                  (migration 20260115000005_coherence_field_readings.sql, manifest:104)
LOADED WHERE      CoherenceFieldService.ts:125,148,170,210
SURFACED WHERE    ⭐ INTO THE PROMPT: MemoryPalaceOrchestrator.ts:337-346 emits an
                  "ELEMENTAL COHERENCE" block —
                  `Balance: ${c.balanceQuality} (${(c.coherenceScore*100).toFixed(0)}%)`
                  plus five per-element percentages — injected at
                  app/api/oracle/conversation/route.ts:2787.
                  ⛔ Not shown to the member.
UPDATED WHERE     MemoryPalaceOrchestrator.ts:188, :249 recordReading()
CANONICAL CALL    app/api/oracle/conversation/route.ts:46,902,1499 →
PATH              memoryPalaceOrchestrator → CoherenceFieldService
SYSTEM AUTHORITY  ⚠️ MemoryPalaceOrchestrator.ts:255-264 — `if (coherenceScore >= 0.9)` an
                  achievement is unlocked with `unlockConditions: [{type:'coherence_score',
                  value: coherenceScore, met:true}]`. A computed coherence number crosses a
                  hardcoded threshold and produces a durable award record.
MEMBER AUTHORITY  ⛔ NONE FOUND — no consent gate, no member read, no opt-out traced.
GOVERNANCE GATE   ⛔ NONE FOUND.
CURRENT STATUS    WIRED-BUT-UNOBSERVED
CONTRADICTIONS    ⭐ CONTRA-2 — lib/maia/substrateMap.ts:383-391 declares this object
                  `consumers: []` and "Service preserved; no live consumer wired."
SOURCE EVIDENCE   CoherenceFieldService.ts:80,125,402; MemoryPalaceOrchestrator.ts:14,74-75,
                  186-188,249-264,337-346,405; oracle/conversation/route.ts:46,902,1499,2787
```

### D-OBJ-11 · `fieldMonitorTelemetry` + `field_monitor_turns`

```text
CAPABILITY        Per-turn field-monitor record; header (:1-10) states it "activates"
                  talkModeFieldIntelligence for observation.
COMPUTED WHERE    lib/consciousness/fieldMonitorTelemetry.ts:29 imports analyzeFieldIntelligence
PERSISTED WHERE   table field_monitor_turns (baseline:9738); referenced for truncation at
                  app/api/admin/command-center/actions/route.ts:65
CALL PATH         app/api/voice/stream-conversation/route.ts:82 fireAndForgetFieldMonitor
                  — ⭐ the VOICE path, not the canonical text path.
MEMBER AUTHORITY  ⛔ NONE FOUND.
GOVERNANCE GATE   ⛔ NONE FOUND.
CURRENT STATUS    WIRED-BUT-UNOBSERVED
CONTRADICTIONS    CONTRA-3
```

---

## 4 · CAPABILITY RECORDS (compressed) — Families D and E

⚠️ **Compression declared.** These objects were traced with the same questions; the answers are
short enough to tabulate. `M-AUTH` = member authority. `GATE` = governance gate.

### 4.1 · Family D — computation without a traced consumer

| Obj | Computed? | Persisted? | Read on a real turn? | Surfaced to member? | GATE | Status |
|---|---|---|---|---|---|---|
| D-OBJ-12 `QuantumFieldMemory` | Yes (810 L) | ⛔ **NO — in-process `Map` only**: `:90-94` incl. a field literally named `persistentFieldStates` that is `new Map()`. No `query(`/`INSERT`/`SELECT` anywhere in the file; only `crypto.createHash` imported (`:9`). | Only via `app/api/maia/enhanced-consciousness/route.ts:22`, which has **0 in-repo callers** | NO | NONE FOUND | **DORMANT** (module resolvable; no reachable entry point) |
| D-OBJ-13 `ConsciousnessFieldEngine` | Yes | not traced | Type-only in most of its 12 importers; value-importers `app/api/maia/memory-enhanced-response/route.ts` (0 callers) and `route.enhanced.backup.ts` | NO | NONE FOUND | DORMANT |
| D-OBJ-14 `MAIAFieldInterface` | Yes | n/a | 10 importers; the two route importers have 0 callers; `lib/agents/PersonalOracleAgent.ts:42` and `lib/platform-adapters/web-adapter.ts:41` are value imports | NO | NONE FOUND | DORMANT (PersonalOracleAgent reachability → Domain A) |
| D-OBJ-15 `ElementalFieldIntegration` | Yes | n/a | 6 importers, all inside the same dormant cluster or 0-caller routes | NO | NONE FOUND | DORMANT |
| D-OBJ-16 `ElementalInterferenceMonitor` | Yes | n/a | 2 importers, both intra-cluster | NO | NONE FOUND | DORMANT |
| D-OBJ-17 `QuantumFieldPersistence` | Yes | name asserts persistence; only importers are the two 0-caller routes | NO | NO | NONE FOUND | DORMANT |
| D-OBJ-18 `EnhancedMAIAFieldIntegration` | Yes (1096 L) | n/a | 3 importers: `spiral-aware-response.ts`, `enhanced-consciousness/route.ts` (0 callers), backup file | NO | NONE FOUND | DORMANT |
| D-OBJ-19 `ResonanceFieldOrchestrator` **(lib/field)** | Yes (783 L) | n/a | ⛔ **0 external importers** — `getResonanceOrchestrator()` (`:779`) is never called outside the file | NO | NONE FOUND | **ORPHANED** |
| D-OBJ-20 `ResonanceFieldOrchestrator` **(lib/oracle)** | Yes (629 L) | n/a | imported only by `lib/oracle/HybridSystemToggle.ts:7,43,49`, which itself has **0 importers**, and by a test | NO | NONE FOUND | **ORPHANED** |
| D-OBJ-21 `MaiaFieldOrchestrator` | Yes (571 L) | n/a | only `lib/integration/MaiaCrystalBridge.ts:11,83`, which has 1 importer | NO | NONE FOUND | DORMANT |
| D-OBJ-22 `FieldIntelligenceSystem` | Yes (690 L) | n/a | 4 value importers, all within the dormant `maia-consciousness-lattice` cluster | NO | NONE FOUND | DORMANT |
| D-OBJ-23 `MAIAFieldAwareness` | Yes (559 L) | n/a | single importer `lib/maia-consciousness-lattice.ts:10`, itself with no route consumer | NO | NONE FOUND | DORMANT |
| D-OBJ-24 `FieldCoherenceTensor` | Yes (388 L) | n/a | ⛔ **type-only import** by `fieldIntegrityValidation.ts:13`; that file has **0 importers** | NO | NONE FOUND | **ORPHANED** |
| D-OBJ-25 `FieldAnalytics` | Yes (277 L) | n/a | ⛔ **0 importers** | NO | NONE FOUND | **ORPHANED** |
| D-OBJ-26 `ParallelFieldProcessor` | Yes (717 L) | `fieldProtocol/storage.ts` (467 L) | 4 importers (`BrainTrustOrchestrator` 0 importers; `InitiationProtocol` 2; `CrystalObserverCore` 1; `MaiaCrystalBridge` 1) — no route reached | NO | NONE FOUND | DORMANT |
| D-OBJ-27 `FieldRecordsService` / `Repo` + `field_records` | Yes | Yes — `field_records` (baseline:9946); `app/api/field/records/route.ts:57 FieldRecordsRepo.upsert` | ⭐ Yes — **one** caller: `app/oracle/iching/page.tsx:326` POSTs `/api/field/records`. `fieldRecordsService` itself has **0 importers**; only `lib/research/ResearchDataPipeline.ts:11` names it and that file has 0 importers. | Indirectly (I Ching surface writes a record; no field display) | NONE FOUND | **PARTIAL** — repo path WIRED-BUT-UNOBSERVED; service layer ORPHANED |
| D-OBJ-28 `neuropodEligibility` / `energyState` | Yes | n/a | `neuropodEligibility` **0 importers**; `energyState` 1 | NO | NONE FOUND | ORPHANED / DORMANT |

### 4.2 · Family E — surfaces bearing the vocabulary

| Obj | What it actually is | Member-facing? | Shows a field/coherence quantity? | GATE | Status |
|---|---|---|---|---|---|
| D-OBJ-29 "Fields" workspace | Project/decision/kanban workspace. 15+ `field_*` tables (baseline:9551-9969) are **this**, not field intelligence | Yes (`app/fields/[field]`) | NO | per-slug route auth (not read here) | out of D's substantive scope; enumerated to prevent conflation |
| D-OBJ-30 "Living Field" | Interest/affinity commons. `living_field_affinities` written fire-and-forget by `lib/maia/living-field/indexAtom.ts:62` | ⭐ **Yes — `/maia/living-field`**, 13 in-repo call sites | NO field-intelligence number found | `living_field_participant_consents` table exists (baseline:10957) — its enforcement NOT traced here | WIRED (Domain B/C overlap) |
| D-OBJ-31 "Field Lab" | Experiment shelf; header (`page.tsx:1-24`) is an explicit anti-gamification invariant | Yes (`/maia/field-lab`) | NO | shelf validation `getShelfExperiments()` | WIRED-BUT-UNOBSERVED |
| D-OBJ-32 `/field/*` | Voice-first MAIA conversation shell; `layout.tsx:11` title "MAIA Field" | Yes | NO | — | naming collision only |
| D-OBJ-33 Practice Field | Accompaniment context; `practiceFieldAddendum` read at `maiaService.ts:1367` | practitioner/member | NO | not traced (Domain I) | noted, not censused here |
| D-OBJ-34 Wisdom Field | `WISDOM_FIELD_MOVES` consumed at `maiaService.ts:1083,1091`; 9 `wisdom_field*` tables | partly | NO | NONE FOUND | noted |
| D-OBJ-35 **FCI dashboard** | ⭐⭐ Renders a **Field Coherence Index** as a percentage arc + interpretation + four component percentages (`page.tsx:231-286`) | ⛔ **NO — gated.** `app/labtools/layout.tsx` calls `requireLabAccess()`; founder + founding members only; the file states "⛔ Lab Tools is NOT a member surface." | **YES** | requireLabAccess() | ⚠️ **PARTIAL / FABRICATED-SOURCE** — see §4.3 |
| D-OBJ-36 `/labtools/coherence` | Breath/HRV protocol tool, `lib/somatic/*`; self-report + optional Apple Watch | NO (lab-gated) | shows a **somatic** shift, unrelated to any other "coherence" here | requireLabAccess() | WIRED-BUT-UNOBSERVED |
| D-OBJ-37 rhythm overlay | ⚠️ See §4.4 — a `Coherence: N%` readout inside the member conversation component | **mounted on `/maia`** | **YES** (`rhythmCoherence`) | ⛔ NONE FOUND | ⚠️ see §4.4 |
| D-OBJ-38 `/labtools/relational-field` | Relational sensing flow; header "Not analysis. Perception." | NO (lab-gated) | NO | requireLabAccess() | WIRED-BUT-UNOBSERVED |
| D-OBJ-39 `/api/maia/field` | "field perception bundle" — relationship context, patterns, breakthroughs | API | NO | ⭐ self-only; header documents a 2026-08-16 repair of an unauthenticated read | ⚠️ **0 in-repo callers** — ORPHANED by its own header's determination |
| D-OBJ-40 `ResonanceEngine` | Elemental probability/transition engine | NO | NO | NONE FOUND | ⚠️ 13 importers, but **11 import only the `Element` type**; value importers: `lib/integrationBridge.ts:8`, `lib/voice/IntegratedEmotionalResonance.ts:7` |

### 4.3 · D-OBJ-35 — the FCI number's actual provenance

`app/api/field-analytics/report/route.ts:19` resolves its data from
`COLLECTIVE_FIELD_SERVICE_URL || 'http://localhost:3010'`. **That variable appears nowhere else
in the repository** — not in `docker-compose.production.yml`, not in any `.env.example`. On
failure the route falls through (`:70-76`) to `getFallbackFieldData()`, which returns **hardcoded
constants**: `fci: 0.5`, all four components `0.5`, `active_souls: 0`, `dominant_element:
'earth'`, and the string `'Field observation initializing - building baseline coherence'`.

`app/labtools/field-analytics/page.tsx:81-95` fetches that endpoint and renders the result
directly. `grep -n "fallback\|success\|simulated\|placeholder"` on that page → **no match**. The
page therefore renders `0.5 → "50%"` with the interpretation string and a refresh loop labelled
"live field observation" (`page.tsx:100-102`), with nothing distinguishing the fallback from a
measurement. **Recorded as evidence. ⛔ No repair proposed; no ruling made.**

### 4.4 · D-OBJ-37 — a coherence readout inside the member conversation component

```text
components/OracleConversation.tsx:10734   {rhythmMetrics && (
components/OracleConversation.tsx:10737     animate={{ opacity: showRhythmDebug ? 0.9 : 0 }}
components/OracleConversation.tsx:10738     className="fixed top-4 right-4 ... pointer-events-none"
components/OracleConversation.tsx:10744     <button onClick={...} className="... pointer-events-auto">
components/OracleConversation.tsx:10753     <div>Coherence: {(rhythmMetrics.rhythmCoherence*100).toFixed(0)}%</div>
```

Facts, in order:
1. `OracleConversation` is mounted on the member surface `/maia` (`app/maia/page.tsx:17`), on
   `app/field/talk/page.tsx:20`, and on `app/studio/maia/page.tsx:15`.
2. The overlay's **mount condition is `rhythmMetrics` being truthy**, not a debug flag.
   `rhythmMetrics` is set by the `ConversationalRhythm` callback at `:1745`.
3. `showRhythmDebug` (`:1569`, `useState(false)`) controls **opacity only** — the element and its
   toggle button are in the DOM either way.
4. The container carries `pointer-events-none`; the toggle button inside carries
   `pointer-events-auto` (`:10746`).
5. `rhythmMetrics.rhythmCoherence` is a **sixth** distinct "coherence" (conversational rhythm),
   unrelated to D-OBJ-1's `pfi.coherence`, D-OBJ-4's `coherenceLevel`, D-OBJ-10's
   `coherenceScore`, D-OBJ-35's `fci`, or D-OBJ-36's somatic coherence.

⛔ This record does not assert that a member sees it, and does not assert the code is
unauthorized. It records what the code does. **Whether an opacity-0, pointer-events-auto control
rendering a coherence percentage on a member surface falls inside or outside the
"no chrome, no pill" prohibition in §7 is a P1-04 question, not a worker's.**

Adjacent, same file: `:6147` `setCoherenceLevel(responseData.metadata?.fieldState?.depth || 0.85)`.
`grep -rn "fieldState" app/api/sovereign/app/maia/list/route.ts` returns **one** match — `:1683`
`fieldState: { depth: 0.7 }`, a hardcoded literal passed into an anamnesis essence write, **not**
into the response `metadata`. The client read therefore resolves to the `0.85` literal on every
turn. ⚠️ A `coherenceLevel` that never reflects anything computed.

---

## 5 · THE COLLISIONS, SHOWN EXPLICITLY

### 5.1 · "field" — seven unrelated semantic families, same word

| Family | Representative object | Path |
|---|---|---|
| 1. prompt-context assembly | `FieldContext` | `lib/field/fieldOrchestrator.ts:36` |
| 2. safety/realm classification | `FieldRoutingDecision` | `lib/field/panconsciousFieldRouter.ts:17` |
| 3. consciousness simulation substrate | `ConsciousnessField` | `lib/consciousness/field/ConsciousnessFieldEngine.ts` |
| 4. project workspace | `field_ideas`, `field_kanban_cards` | `database/baseline/...sql:9681,9718`; `app/fields/[field]` |
| 5. interest/affinity commons | `living_field_affinities` | `...sql:10941`; `app/maia/living-field` |
| 6. experiment shelf | Field Lab | `app/maia/field-lab/page.tsx:3` |
| 7. voice conversation surface | "MAIA Field" | `app/field/layout.tsx:11` |

Plus `practice_field*`, `wisdom_field*`, `field_records`, `relationship_field_state`,
`studio_field_signals`, `community_field_state`, `member_field_note_*`, `field_state_snapshots`
— each a further distinct object.

⭐ **The sharpest instance:** `lib/field-protocol/` and `lib/fieldProtocol/` are **two different
directories** with **no shared code**, differing only in casing.
- `lib/field-protocol/FieldRecordsService.ts` → `field_records`, consumed by
  `app/api/field/records/route.ts:14`.
- `lib/fieldProtocol/ParallelFieldProcessor.ts` → consumed by `lib/consciousness/*`, types from
  `types/fieldProtocol` (`lib/consciousness/CrystalObserverCore.ts:26-27`).

### 5.2 · "coherence" — six distinct quantities

| # | Quantity | Range / kind | Defined at |
|---|---|---|---|
| 1 | `FieldContext.pfi.coherence` | number | `lib/field/fieldOrchestrator.ts:40` |
| 2 | `FieldContext.unified.coherenceLevel` | **string** | `lib/field/fieldOrchestrator.ts:47` |
| 3 | `coherenceScore` (elemental) | 0–1, persisted | `CoherenceFieldService.ts:80`; threshold at `MemoryPalaceOrchestrator.ts:255` |
| 4 | `fci` — Field Coherence Index | 0–1, external/fallback | `app/api/field-analytics/report/route.ts` fallback |
| 5 | somatic/breath coherence | protocol outcome | `app/labtools/coherence/page.tsx` + `lib/somatic/*` |
| 6 | `rhythmCoherence` | 0–1 | `components/OracleConversation.tsx:1748,10753` |

⛔ None of the six is derived from, calibrated against, or reconcilable with any other. A
sentence of the form *"MAIA's coherence is X"* is unevaluable at the subject.

### 5.3 · "resonance" — including one exact class-name duplication

```text
class ResonanceFieldOrchestrator   lib/field/ResonanceFieldOrchestrator.ts:97    (783 L)
class ResonanceFieldOrchestrator   lib/oracle/ResonanceFieldOrchestrator.ts:40   (629 L)
```

Two classes, identical name, different files, different bodies, **neither reachable**. Neither is
the resonance object actually used by the canonical path — that is `ResonanceFieldGenerator` in
`lib/maia/resonance-field-system.ts` (`fieldOrchestrator.ts:21`). A fourth, `ResonanceEngine`
(`lib/resonanceEngine.ts:25`), is an elemental probability engine unrelated to all three; a fifth,
`resonance_events` (`baseline:15843`), is a table.

### 5.4 · RFI and UFI

```text
grep -rn "\bRFI\b" lib/ app/ components/ database/ --include=*.ts --include=*.tsx --include=*.sql
  → NO MATCH

grep -rn "\bUFI\b" (same scope)
  → exactly ONE hit, a comment:
    lib/orientation/spiralOrientation.ts:31   " *   UFI         = field assembly (not used here)"
```

**Finding: at the census subject, neither RFI nor UFI names any code object.** UFI's single
appearance is a comment in an architecture-layer legend that explicitly excludes it. Both terms
are **DOCUMENTATION-ONLY**. The P1-01 hypothesis that UFI has no definitional document is
consistent with the code side: there is nothing to define.

⭐ This is precisely the vocabulary rule's point: *"RFI is built"* and *"RFI is not built"* were
both unevaluable. Once the referent is demanded, the question dissolves — **there is no referent
in code.** What exists are D-OBJ-1 through D-OBJ-28, none of which is named RFI or UFI anywhere.

---

## 6 · THE FIVE REQUIRED ANSWERS

**1 · Enumeration** — §1.2. **40 labelled objects**: 8 on the canonical cognition path, 2 on the
oracle path, 1 on the voice path, 17 unreached, 12 product surfaces bearing the vocabulary.

**2 · Per object** — §2–§4. In participation vocabulary: **0 LIVE** (no dated runtime witness
exists in-repo for any of them) · **11 WIRED-BUT-UNOBSERVED** (D-OBJ-1…11, 31, 36, 38) ·
**1 BLOCKED-BY-FLAG in one of two paths** (D-OBJ-2 path (a)) · **~11 DORMANT** ·
**5 ORPHANED** (D-OBJ-19, 20, 24, 25, 39, and `neuropodEligibility`) · **1 PARTIAL**
(D-OBJ-27) · **RFI/UFI DOCUMENTATION-ONLY**.

**3 · Does any member-facing field/coherence/RFI/UFI surface exist in code?**

```text
SEARCHED   app/**/page.tsx and app/**/layout.tsx by name (find -iname *field*/*coherence*
           /*resonance*/*rfi*/*ufi*) · all app/api/**/route.ts under those names ·
           components/**/*.tsx for "coherence" (52 files) · importer trace on every
           coherence-rendering component · gating layout for each hit
```

- **No dedicated member-facing field-intelligence or coherence page exists.** There is no
  `/maia/field` route; `app/field/*` is a voice conversation shell (D-OBJ-32) and
  `app/maia/field-lab` is an experiment shelf (D-OBJ-31). Neither displays a field value.
- Every surface that *renders* a field/coherence quantity — D-OBJ-35 (FCI), D-OBJ-36
  (somatic) — sits behind `app/labtools/layout.tsx` → `requireLabAccess()`, which states in
  source: *"⛔ Lab Tools is NOT a member surface."*
- ⚠️ **ONE EXCEPTION, NAMED: D-OBJ-37.** `components/OracleConversation.tsx:10734-10753` mounts a
  `Coherence: N%` readout inside the component rendered on `/maia`, conditioned on
  `rhythmMetrics` and hidden by opacity rather than by mount. §4.4 states the five facts.
- **Governance status of that exception is a governance-absence finding, per constraint 6.** Its
  existence is not evidence that it is governed; see §7.

**4 · Does any field object influence what MAIA says on a real turn? — YES. Five traced paths.**

```text
(a) lib/sovereign/maiaService.ts:1521 → buildFieldContext → :1534
      baseSystemPrompt += "\n\n[Field Intelligence]\n" + JSON  ............ FAST
(b) lib/sovereign/maiaService.ts:1946 → buildFieldContext → :1962
      adaptivePrompt += same ............................................. CORE
(c) lib/sovereign/maiaService.ts:1082 → analyzeFieldIntelligence → :1094
      "🎯 TALK MODE FIELD INTELLIGENCE (Reference Context)" prompt block .. Talk Mode
(d) app/api/oracle/conversation/route.ts:902 → memoryPalaceOrchestrator →
      CoherenceFieldService → MemoryPalaceOrchestrator.ts:337-346
      "ELEMENTAL COHERENCE / Balance: X (N%)" → injected at route.ts:2787 . oracle path
(e) ⭐⭐ lib/sovereign/maiaService.ts:2838 enforceFieldSafety → :2848
      if (!fieldSafety.allowed) the turn RETURNS fieldSafety.message
      BEFORE reaching any model ......................................... canonical path
```

(a)–(d) **CONTRIBUTE** to what MAIA says. (e) is categorically different: it **DECIDES**, and its
text **replaces** MAIA's. Against the preserved distinctions: (a)–(d) sit at CONTRIBUTES;
(e) is the only object in Domain D at HAS AUTHORITY.

**5 · Collisions** — §5, with both file paths shown for each.

---

## 7 · UNLOCATED GOVERNANCE

```text
P1-D-GOV-01   The canonical field seam (D-OBJ-1) has no governance gate of any kind.
              No env flag, no consent row, no canon citation in-file, no member visibility,
              no member opt-out. Only Sanctuary suppresses it (fieldOrchestrator.ts:169).

P1-D-GOV-02   Field safety (D-OBJ-6) can REFUSE a member's turn and substitute its own text
              (maiaService.ts:2848). No ratified source authorizing realm-based refusal was
              located. The in-source "H2"/"W2" commentary is a citation, not a located source.

P1-D-GOV-03   D-OBJ-10 crosses a hardcoded coherence threshold (>= 0.9) into a durable
              achievement record (MemoryPalaceOrchestrator.ts:255-264). No source ruling that
              a computed coherence score may confer an award was located.

P1-D-GOV-04   D-OBJ-8 and D-OBJ-11 write per-turn telemetry rows with no consent gate traced
              and no member read path.

P1-D-GOV-05   The one prohibition P1-01 slice 04 located —
              "No member-facing surface — no chrome, no pill, no /maia/field, no admin panel"
              (04_field_governance.md:340, quoting COHERENCE_FIELD_WIRE_UP_SPEC §7 L276) —
              is scoped to the Coherence/Field wire-up (S-1), whose subject is the layer
              corresponding to D-OBJ-10. ⚠️ Whether it reaches D-OBJ-1, D-OBJ-7, D-OBJ-35 or
              D-OBJ-37 is a scope question this worker may not answer.
```

⭐ Per constraint 6: every traced behaviour above is **ungoverned until a source is located** —
finding the code does not make it governed. **REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.**

---

## 8 · CONTRADICTIONS (both sides, unreconciled)

**CONTRA-1 · A default-OFF flag that one of its two callers does not consult.**
- Side A: `lib/sovereign/pfiMindEntrypoint.ts:14` — *"MAIA_PFI_MIND=true: Enable PFI mind
  entrypoint (default: OFF)"*; `isPFIMindEnabled()` at `:247`; consulted at
  `maiaService.ts:2916`.
- Side B: `lib/field/fieldOrchestrator.ts:161-165` sets `pfi: true` unconditionally and calls
  `generatePFIMindState` (`:16-20`); reached from `maiaService.ts:1521` and `:1946` with no flag
  check (`:1512-1543`, `:1940-1968`).
- ⛔ Not reconciled.

**CONTRA-2 · The substrate map says "no live consumer"; the import graph says otherwise.**
- Side A: `lib/maia/substrateMap.ts:383-391` — *"Resonant field memory … consumers: [] …
  Service preserved; no live consumer wired"*, listing `QuantumFieldMemory.ts` and
  `CoherenceFieldService.ts`. `:230` also marks CoherenceFieldService *"unmapped"*.
- Side B: `CoherenceFieldService` is imported at `MemoryPalaceOrchestrator.ts:14`, called at
  `:75`, `:188`, `:249`, and reaches the prompt at `oracle/conversation/route.ts:2787`.
  (For `QuantumFieldMemory`, side A holds: its only route importer has 0 callers.)
- ⛔ Not reconciled. The map's claim is correct for one named module and not for the other.

**CONTRA-3 · "DORMANT" as a label on an object that is on the canonical path.**
- Side A: `lib/consciousness/fieldMonitorTelemetry.ts:165` — *"Field Intelligence (activates
  DORMANT talkModeFieldIntelligence …)"*.
- Side B: `analyzeFieldIntelligence` is dynamically imported and used at
  `maiaService.ts:1082-1112`, producing a prompt block on the canonical member path.
- ⛔ Not reconciled.

**CONTRA-4 · "The ONLY file that knows how the field engines connect."**
- Side A: `fieldOrchestrator.ts:3` asserts sole-seam status.
- Side B: at least four other seams connect field engines into cognition —
  `maiaService.ts:1082` (D-OBJ-7), `maiaService.ts:2838` (D-OBJ-6),
  `oracle/conversation/route.ts:853` (D-OBJ-9), `oracle/conversation/route.ts:902` (D-OBJ-10),
  `voice/stream-conversation/route.ts:82` (D-OBJ-11).
- ⛔ Not reconciled.

**CONTRA-5 · `persistentFieldStates` is not persistent.**
- Side A: `QuantumFieldMemory.ts:2-6` — *"maintaining persistent field states"*; field name
  `persistentFieldStates` at `:91`.
- Side B: `:91` is `new Map()`; the file's only import is `crypto` (`:9`); no `query`, `INSERT`
  or `SELECT` occurs anywhere in its 810 lines.
- ⛔ Not reconciled. (This **verifies** the CLAUDE.md claim: 810 LOC, 0 persistence.)

**CONTRA-6 · Two `calculate_decayed_confidence` definitions and one TS helper — verified.**
- Side A (SQL, both copies identical): `database/baseline/0001_baseline_2026-09-01.sql:711-737`
  and `database/migrations/20251231_memory_architecture_enhancements.sql:178-214` —
  `decay_factor := POWER(2, -days_elapsed/half_life_days)`, floor `GREATEST(0.3, …)`,
  reference `COALESCE(last_confirmed, formed_at)`. ⭐ **No confirmed-memory bonus of any kind.**
- Side B (TypeScript): `lib/memory/confidenceDecay.ts:78-79` —
  `const effectiveHalfLife = confirmedByUser ? halfLifeDays * 1.5 : halfLifeDays;`
- The SQL function is what actually runs in retrieval: `lib/memory/MemoryBundle.ts:266` and
  `lib/memory/stores/PreferenceConfirmationStore.ts:211` call it by name.
- ⚠️ **The CLAUDE.md claim of two divergent implementations is CONFIRMED.** ⛔ The CLAUDE.md
  detail *"the SQL confirmation term caps at 0.0225"* is **NOT confirmed** — no confirmation
  term of any form exists in either SQL copy at the subject. Both sides preserved.
- (Decay is Domain B/C substrate; recorded here only because Domain D was tasked to verify it.)

---

## 9 · NAMED-BUT-UNVERIFIED ARTIFACTS

| Named | Named where | Status at subject |
|---|---|---|
| `RFI` | `docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md:70` (as a claim **not** to make), CLAUDE.md Cat 1 | **NO CODE OBJECT** |
| `UFI` | CLAUDE.md Cat 1; `lib/orientation/spiralOrientation.ts:31` comment | **NO CODE OBJECT** |
| `FIS Field State Primitive` | `docs/canon/FIS_FIELD_STATE_PRIMITIVE.md` — self-declared *"interface target — no runtime authority yet"* | Document exists. No code object implements its six-dimension shape. `lib/sovereign/pfiMindEntrypoint.ts` is the nearest artifact and does **not** match it (`:36-45` of the canon lists emotional weather, semantic landscape, connection dynamics, sacred markers, somatic intelligence, temporal dynamics; PFIMindState carries none of these names). **DOCUMENTATION-ONLY.** |
| `COLLECTIVE_FIELD_SERVICE_URL` service on :3010 | `app/api/field-analytics/report/route.ts:19` | **NOT FOUND.** Appears in exactly one file repo-wide; absent from `docker-compose.production.yml`. D-OBJ-35's real source is the hardcoded fallback. |
| `maia-mcp/server.ts` (`get_member_field`) | `app/api/maia/field/route.ts` header | Header itself records the artifact as absent from this repository. Unchanged at the subject. |
| `field_state_snapshots` table | `database/baseline/...sql:9969` | Table exists. **No writer or reader traced in `lib/**` or `app/**`.** |

---

## 10 · OPEN QUESTIONS FOR P1-04

```text
Q-D1   D-OBJ-1 appends an unlabelled 3000-char JSON blob to MAIA's system prompt with no
       instruction telling MAIA what it is or how much weight it carries. What does the
       organism intend a model to do with "[Field Intelligence]\n{...}"?

Q-D2   D-OBJ-1's FieldContext and D-OBJ-9's fieldContextAdapter are BOTH called "field
       context", run on different routes, and are gated differently (none vs
       MAIA_FIELD_CONTEXT_ENABLED). Is this one capability with two implementations, or two
       capabilities that share a name? ⛔ A worker may not choose.

Q-D3   D-OBJ-3 computes silenceProbability and fragmentationRate — quantities whose names
       assert authority over MAIA's speech. No consumer other than the prompt JSON was
       traced. Do they shape anything, or are they decorative?

Q-D4   D-OBJ-6 is the only field object with authority to replace MAIA's turn. Its authority
       depends entirely on a cognitiveProfile that may be null (maiaService.ts:2833), in
       which case it does not run at all. Is fail-open the intended posture for a safety
       guard?

Q-D5   D-OBJ-37: an opacity-hidden, pointer-events-auto coherence readout is mounted on the
       member surface. Which is the finding — that it is there, or that nothing in the corpus
       rules on whether it may be?

Q-D6   D-OBJ-35 renders fabricated constants as a measured index with no fallback indicator,
       behind a lab gate. Does the "no chrome, no pill" prohibition reach lab-gated surfaces?

Q-D7   ~7,500 lines across D-OBJ-12…28 compute field/coherence/resonance quantities that
       reach nothing. 5 objects are ORPHANED outright, including two classes sharing the
       name ResonanceFieldOrchestrator. What is the organism's disposition toward
       computation it does not consume? ⛔ REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.

Q-D8   "field" names seven unrelated semantic families and two directories differing only in
       casing. At what point does vocabulary collision become a structural finding rather
       than a naming one?
```

---

## 11 · WHAT THIS RECORD DOES NOT CLAIM

- ⛔ It does not claim any object is LIVE. No runtime, no database, no production access.
- ⛔ It does not claim any traced behaviour is authorized. Constraint 6 governs every row.
- ⛔ It does not reconcile CONTRA-1…6, nominate a correct reading, or propose a repair.
- ⛔ It does not rule on whether D-OBJ-37 or D-OBJ-35 violates §7's prohibition.
- ⛔ It does not carry forward any predecessor-census claim that was not re-read here
  (constraint 7). CLAUDE.md claims about QuantumFieldMemory and decay were re-verified at the
  subject and are reported with their confirmations **and** their one disconfirmation.
