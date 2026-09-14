# PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-03 · NORMALIZED REGISTER — DOMAINS D · E · F

```text
STEP        P1-03 · COMMON EVIDENCE SCHEMA
SLICE       D (field intelligence) · E (Spiralogic / elemental) · F (symbolic systems)
SUBJECT     1a5554300e855d3581085849301a39cbb10ab385
TYPE        RESTATEMENT ONLY — no re-census, no source code read
INPUTS      P1-02/D_field.md · P1-02/E_spiralogic_elemental.md · P1-02/F_symbolic.md
BOUND BY    INF-1 … INF-5 and the eight prohibitions of the P1-03 instrument
```

> ⭐ **P1-03 restates. It does not decide.** Where a source record did not determine a field,
> this register writes **NOT DETERMINED BY SOURCE RECORD** and does not fill the gap.

**Reading the blocks.** Fields appear in the fixed order
`ROW ID / DOMAIN / NAMED OBJECT / ARTIFACT / STATUS / ALTITUDE / COVERAGE / LADDER /
GOVERNANCE GATE / GOVERNING SOURCE / SOURCE RECORD`; two short fields may share a printed line.
Domain D's own labels `D-OBJ-n` are carried inside NAMED OBJECT — ⛔ the enumeration is never
collapsed back into "field". Domain F's three powers (KNOW · SAY · CONCLUDE) are carried in the
LADDER line as a bracketed clause, because F kept them separate and ⛔ a ladder position may not
be invented from them.

⛔ No STATUS was upgraded. ⛔ No contradiction was resolved. ⛔ No row was merged because two
objects share a word. ⛔ No capability appears here that is not in a source record.

---

## DOMAIN D — FIELD INTELLIGENCE (46 rows)

⚠️ D enumerated **40 labelled objects** because "field" names at least 19 code objects in seven
unrelated semantic families, "coherence" six non-convertible quantities and "resonance" five
objects. Rows P3-D-41…46 restate D §9's named-but-unverified artifacts, which D classified.

ROW ID P3-D-01 · DOMAIN D · NAMED OBJECT D-OBJ-1 `FieldContext` seam — `buildFieldContext` / `formatFieldAddendum`
  ARTIFACT  lib/field/fieldOrchestrator.ts:36-62,154,161-165,169,234-242; lib/sovereign/maiaService.ts:1521,1534,1946,1962
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (Sanctuary suppression only; depth thresholds hardcoded :161-165)
  COVERAGE  canonical getMaiaResponse lane (/api/sovereign/app/maia/list) — FAST (:1534) and CORE (:1962). DEEP, oracle, voice, BETWEEN: NOT DETERMINED BY SOURCE RECORD.
  LADDER  CONTRIBUTES (D §6 ans.4, paths (a)+(b))  ·  GOVERNANCE GATE  NONE FOUND — no env flag, no consent row, no in-file canon citation
  GOVERNING SOURCE  NONE LOCATED (P1-D-GOV-01)  ·  SOURCE RECORD  D_field.md §2 D-OBJ-1; §6 ans.4; §7 P1-D-GOV-01

ROW ID P3-D-02 · DOMAIN D · NAMED OBJECT D-OBJ-2 PFI mind state — `generatePFIMindState`
  ARTIFACT  lib/sovereign/pfiMindEntrypoint.ts:1-16,94,247,254; lib/field/fieldOrchestrator.ts:16-20,161-165; lib/sovereign/maiaService.ts:2916
  STATUS  WIRED-BUT-UNOBSERVED (path b) · BLOCKED (path a — source term "BLOCKED-BY-FLAG", default OFF)  ·  ALTITUDE  EXISTS, WIRED, CONFIG-SELECTED (MAIA_PFI_MIND, consulted at exactly one of two call sites)
  COVERAGE  via path (b) the same FAST + CORE coverage as D-OBJ-1; path (a) at maiaService.ts:2916 — tier coverage NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  PARTIAL / DEFEATED IN ONE PATH — `isPFIMindEnabled()` governs (a) and does not govern (b)
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §2 D-OBJ-2; CONTRA-1

ROW ID P3-D-03 · DOMAIN D · NAMED OBJECT D-OBJ-3 `ResonanceFieldGenerator`
  ARTIFACT  lib/maia/resonance-field-system.ts (657 L); invoked from lib/field/fieldOrchestrator.ts:21 (resonance branch)
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (depth ≥ 3, i.e. turn 4+)
  COVERAGE  canonical lane inside D-OBJ-1 where depth ≥ 3; tier mapping NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NONE FOUND
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §2 D-OBJ-3; Q-D3

ROW ID P3-D-04 · DOMAIN D · NAMED OBJECT D-OBJ-4 `UnifiedElementalFieldCalculator`
  ARTIFACT  lib/consciousness/field/UnifiedElementalFieldCalculator.ts (517 L); lib/field/fieldOrchestrator.ts:22-24,161-165
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (depth ≥ 4)
  COVERAGE  canonical lane inside D-OBJ-1 where depth ≥ 4; 6 further importers incl. an unmounted dashboard component
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NONE FOUND
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §2 D-OBJ-4

ROW ID P3-D-05 · DOMAIN D · NAMED OBJECT D-OBJ-5 `routePanconsciousField` → `FieldRoutingDecision`
  ARTIFACT  lib/field/panconsciousFieldRouter.ts:1-30,5-30; lib/sovereign/maiaService.ts:2207,2216
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  canonical getMaiaResponse lane (maiaService.ts:2207); tier coverage NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD (D assigns HAS AUTHORITY to the enforcement object D-OBJ-6, not to the classifier)  ·  GOVERNANCE GATE  PARTIAL — in-source "H2"/"W2" commentary only; per constraint 6 a citation is not a located source
  GOVERNING SOURCE  NONE LOCATED (P1-D-GOV-02)  ·  SOURCE RECORD  D_field.md §2 D-OBJ-5+6 (joint block); §7

ROW ID P3-D-06 · DOMAIN D · NAMED OBJECT D-OBJ-6 `enforceFieldSafety` → `FieldSafetyDecision` (+ `fieldSafetyCopy.ts`)
  ARTIFACT  lib/field/enforceFieldSafety.ts:1-28,25; lib/field/fieldSafetyCopy.ts (189 L); lib/sovereign/maiaService.ts:2830-2860, esp. :2838,:2848
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (skipped entirely when cognitiveProfile is null — fails OPEN)
  COVERAGE  canonical getMaiaResponse lane (maiaService.ts:2838); tier coverage NOT DETERMINED BY SOURCE RECORD
  LADDER  HAS AUTHORITY (D §6 ans.4 path (e) — "the only object in Domain D at HAS AUTHORITY"; its text REPLACES MAIA's before any model is reached)  ·  GOVERNANCE GATE  PARTIAL — in-source constitutional commentary only
  GOVERNING SOURCE  NONE LOCATED (P1-D-GOV-02: no ratified document authorizing realm-based refusal)  ·  SOURCE RECORD  D_field.md §2 D-OBJ-5+6; §6 ans.4(e); §7; Q-D4

ROW ID P3-D-07 · DOMAIN D · NAMED OBJECT D-OBJ-7 `analyzeFieldIntelligence` (Talk Mode field intelligence)
  ARTIFACT  lib/maia/talkModeFieldIntelligence.ts:27,287,327; lib/sovereign/maiaService.ts:1079-1114,1094-1110,1198
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (suppressed on early exchanges per :1198)
  COVERAGE  canonical getMaiaResponse lane, Talk Mode assembly (dynamic import at :1082); other families NOT DETERMINED BY SOURCE RECORD
  LADDER  CONTRIBUTES (D §6 ans.4 path (c))  ·  GOVERNANCE GATE  NONE FOUND
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §2 D-OBJ-7; CONTRA-3  ⚠️ see cross-record contradiction X-DEF-1 below (E records the same module's block as never appended)

ROW ID P3-D-08 · DOMAIN D · NAMED OBJECT D-OBJ-8 `logFieldOrchestratorTelemetry` + table `field_orchestrator_telemetry`
  ARTIFACT  lib/field/fieldOrchestratorTelemetry.ts:45,91,115L; database/baseline/...sql:9815; app/api/admin/command-center/{overview,field-engines}/route.ts; maiaService.ts:1537,1965
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  write on the canonical lane FAST (:1537) + CORE (:1965), fire-and-forget; read surface is admin only, not member-facing
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NONE FOUND — no consent gate on the write, no member read path
  GOVERNING SOURCE  NONE LOCATED (P1-D-GOV-04)  ·  SOURCE RECORD  D_field.md §2 D-OBJ-8; §7

ROW ID P3-D-09 · DOMAIN D · NAMED OBJECT D-OBJ-9 `getFieldContext` / `buildFieldContextPromptBlock` (vault-backed field context adapter)
  ARTIFACT  lib/maia/fieldContextAdapter.ts:1-40,100-128; app/api/oracle/conversation/route.ts:127,853; lib/sovereignty/driftAlarm.ts:11; docker-compose.production.yml:197-202
  STATUS  WIRED-BUT-UNOBSERVED · flag state at runtime UNKNOWN  ·  ALTITUDE  EXISTS, WIRED, CONFIG-SELECTED (MAIA_FIELD_CONTEXT_ENABLED === 'true')
  COVERAGE  the oracle conversation path as D names it (app/api/oracle/conversation/route.ts:853); ⚠️ E records that route as carrying an unconditional 410 — see X-DEF-2
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  PRESENT AND NAMED — env flag + named absence event `field_context_unavailable` + declared non-mutation boundary (the only D object with all three)
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §3 D-OBJ-9; Q-D2

ROW ID P3-D-10 · DOMAIN D · NAMED OBJECT D-OBJ-10 `coherenceFieldService` + table `coherence_field_readings`
  ARTIFACT  lib/consciousness/memory/CoherenceFieldService.ts:80,125,402; MemoryPalaceOrchestrator.ts:14,186-188,249-264,337-346; app/api/oracle/conversation/route.ts:46,902,1499,2787; baseline:6926
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  the oracle conversation path (route.ts:902 → prompt injection at :2787); ⚠️ see X-DEF-2 (E's 410 finding) and CONTRA-2 (substrate map says no live consumer)
  LADDER  CONTRIBUTES (D §6 ans.4 path (d))  ·  GOVERNANCE GATE  NONE FOUND — no consent gate, no member read, no opt-out traced
  GOVERNING SOURCE  NONE LOCATED (P1-D-GOV-03: no ruling that a computed coherence score ≥ 0.9 may confer a durable achievement)  ·  SOURCE RECORD  D_field.md §3 D-OBJ-10; §7; CONTRA-2

ROW ID P3-D-11 · DOMAIN D · NAMED OBJECT D-OBJ-11 `fireAndForgetFieldMonitor` + table `field_monitor_turns`
  ARTIFACT  lib/consciousness/fieldMonitorTelemetry.ts:1-10,29,165 (575 L); baseline:9738; app/api/voice/stream-conversation/route.ts:82; app/api/admin/command-center/actions/route.ts:65
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  the VOICE path (/api/voice/stream-conversation), not the canonical text path
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NONE FOUND
  GOVERNING SOURCE  NONE LOCATED (P1-D-GOV-04)  ·  SOURCE RECORD  D_field.md §3 D-OBJ-11; CONTRA-3

ROW ID P3-D-12 · DOMAIN D · NAMED OBJECT D-OBJ-12 `QuantumFieldMemory`
  ARTIFACT  lib/consciousness/memory/QuantumFieldMemory.ts:2-6,9,90-94 (810 L); app/api/maia/enhanced-consciousness/route.ts:22 (0 in-repo callers)
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE — no reachable entry point on any MAIA-claiming cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NONE FOUND
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.1; CONTRA-5 (`persistentFieldStates` is an in-process Map)

ROW ID P3-D-13 · DOMAIN D · NAMED OBJECT D-OBJ-13 `ConsciousnessField` engine
  ARTIFACT  lib/consciousness/field/ConsciousnessFieldEngine.ts (466 L); value-importers app/api/maia/memory-enhanced-response/route.ts (0 callers) + route.enhanced.backup.ts
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE — type-only in most importers; no reachable cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NONE FOUND
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.1

ROW ID P3-D-14 · DOMAIN D · NAMED OBJECT D-OBJ-14 `MAIAFieldInterface`
  ARTIFACT  lib/consciousness/field/MAIAFieldInterface.ts (575 L); lib/agents/PersonalOracleAgent.ts:42; lib/platform-adapters/web-adapter.ts:41
  STATUS  DORMANT (PersonalOracleAgent reachability referred to Domain A)  ·  ALTITUDE  EXISTS
  COVERAGE  NOT DETERMINED BY SOURCE RECORD — the two route importers have 0 callers; the PersonalOracleAgent question is handed to Domain A
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NONE FOUND
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.1

ROW ID P3-D-15 · DOMAIN D · NAMED OBJECT D-OBJ-15 `ElementalFieldIntegration`
  ARTIFACT  lib/consciousness/field/ElementalFieldIntegration.ts (870 L); 6 importers, all intra-cluster or 0-caller routes
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1

ROW ID P3-D-16 · DOMAIN D · NAMED OBJECT D-OBJ-16 `ElementalInterferenceMonitor`
  ARTIFACT  lib/consciousness/field/ElementalInterferenceMonitor.ts (584 L); 2 importers, both intra-cluster
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1

ROW ID P3-D-17 · DOMAIN D · NAMED OBJECT D-OBJ-17 `QuantumFieldPersistence`
  ARTIFACT  lib/consciousness/field/QuantumFieldPersistence.ts (434 L); only importers are the two 0-caller routes
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1 (⚠️ "name asserts persistence"; persistence not traced)

ROW ID P3-D-18 · DOMAIN D · NAMED OBJECT D-OBJ-18 `EnhancedMAIAFieldIntegration`
  ARTIFACT  lib/consciousness/memory/EnhancedMAIAFieldIntegration.ts (1096 L); 3 importers incl. a 0-caller route and a backup file
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1

ROW ID P3-D-19 · DOMAIN D · NAMED OBJECT D-OBJ-19 `ResonanceFieldOrchestrator` **(A) lib/field**
  ARTIFACT  lib/field/ResonanceFieldOrchestrator.ts:97,779 (783 L) — 0 external importers
  STATUS  ORPHANED  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1; §5.3 (⛔ not merged with P3-D-20 despite the identical class name)

ROW ID P3-D-20 · DOMAIN D · NAMED OBJECT D-OBJ-20 `ResonanceFieldOrchestrator` **(B) lib/oracle**
  ARTIFACT  lib/oracle/ResonanceFieldOrchestrator.ts:40 (629 L); imported only by lib/oracle/HybridSystemToggle.ts:7,43,49 (itself 0 importers) and a test
  STATUS  ORPHANED  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1; §5.3 — ⭐ same class name as P3-D-19, different file, different body, neither reachable

ROW ID P3-D-21 · DOMAIN D · NAMED OBJECT D-OBJ-21 `MaiaFieldOrchestrator`
  ARTIFACT  lib/maia/MaiaFieldOrchestrator.ts (571 L); only lib/integration/MaiaCrystalBridge.ts:11,83 (1 importer)
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1

ROW ID P3-D-22 · DOMAIN D · NAMED OBJECT D-OBJ-22 `FieldIntelligenceSystem` / `RelationalField`
  ARTIFACT  lib/field-intelligence-system.ts (690 L); 4 value importers inside the dormant maia-consciousness-lattice cluster
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1

ROW ID P3-D-23 · DOMAIN D · NAMED OBJECT D-OBJ-23 `MAIAFieldAwareness`
  ARTIFACT  lib/maia-field-intelligence-integration.ts (559 L); single importer lib/maia-consciousness-lattice.ts:10, no route consumer
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1

ROW ID P3-D-24 · DOMAIN D · NAMED OBJECT D-OBJ-24 `FieldCoherenceTensor` + `fieldIntegrityValidation`
  ARTIFACT  lib/field/fieldCoherenceTensor.ts (388 L) — type-only import by lib/field/fieldIntegrityValidation.ts:13 (591 L), which has 0 importers
  STATUS  ORPHANED  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1

ROW ID P3-D-25 · DOMAIN D · NAMED OBJECT D-OBJ-25 `FieldAnalytics`
  ARTIFACT  lib/field/FieldAnalytics.ts (277 L) — 0 importers
  STATUS  ORPHANED  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1

ROW ID P3-D-26 · DOMAIN D · NAMED OBJECT D-OBJ-26 `ParallelFieldProcessor` + `fieldProtocol/{validation,storage}`
  ARTIFACT  lib/fieldProtocol/ (1657 L total; processor 717 L, storage 467 L); 4 importers (BrainTrustOrchestrator, InitiationProtocol, CrystalObserverCore, MaiaCrystalBridge) — no route reached
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1; §5.1 (⛔ distinct from P3-D-27 — the two directories differ only in casing and share no code)

ROW ID P3-D-27 · DOMAIN D · NAMED OBJECT D-OBJ-27 `FieldRecordsService` / `FieldRecordsRepo` + table `field_records`
  ARTIFACT  lib/field-protocol/ (1061 L); app/api/field/records/route.ts:14,57; app/oracle/iching/page.tsx:326; baseline:9946
  STATUS  PARTIAL — repo path WIRED-BUT-UNOBSERVED; service layer ORPHANED (0 importers)  ·  ALTITUDE  EXISTS, WIRED (repo path only)
  COVERAGE  NOT APPLICABLE as a cognition-family capability — one caller is the I Ching surface POSTing a record; no field display, no traced cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NONE FOUND
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.1; §5.1

ROW ID P3-D-28 · DOMAIN D · NAMED OBJECT D-OBJ-28 `neuropodEligibility`, `energyState`
  ARTIFACT  lib/field/ (564 L total) — `neuropodEligibility` 0 importers; `energyState` 1 importer
  STATUS  ORPHANED / DORMANT (as recorded, both terms kept)  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NONE FOUND  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.1

ROW ID P3-D-29 · DOMAIN D · NAMED OBJECT D-OBJ-29 "Fields" collaborative workspace (`field_ideas`, `field_kanban_cards`, `field_decisions`, `field_people`, `field_programs`, `field_artifacts`, …)
  ARTIFACT  app/fields/[field]/**, app/api/fields/[slug]/**; 15+ `field_*` tables at baseline:9551-9969
  STATUS  (D: "out of D's substantive scope; enumerated to prevent conflation") — STATUS NOT DETERMINED BY SOURCE RECORD  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE — a project/decision/kanban workspace, not field intelligence and not a cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  per-slug route auth (not read by D)
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.2; §5.1 family 4

ROW ID P3-D-30 · DOMAIN D · NAMED OBJECT D-OBJ-30 "Living Field" (`living_field_affinities`, `personal_living_fields`)
  ARTIFACT  app/maia/living-field/**, components/maia/living-field/**, lib/maia/living-field/indexAtom.ts:62; baseline:10941,10957
  STATUS  WIRED (Domain B/C overlap)  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  NOT APPLICABLE as a field-intelligence quantity (D found none); member-facing surface with 13 in-repo call sites
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  `living_field_participant_consents` table exists — ⛔ its enforcement NOT traced by D
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.2

ROW ID P3-D-31 · DOMAIN D · NAMED OBJECT D-OBJ-31 "Field Lab" experiment shelf
  ARTIFACT  app/maia/field-lab/** (page.tsx:1-24 anti-gamification invariant), lib/maia/fieldLab/shelf.ts
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  NOT APPLICABLE — member surface, displays no field value
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  shelf validation `getShelfExperiments()`
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.2

ROW ID P3-D-32 · DOMAIN D · NAMED OBJECT D-OBJ-32 `/field/*` — voice-first MAIA conversation surface
  ARTIFACT  app/field/layout.tsx:11 (title "MAIA Field"), app/field/talk/
  STATUS  (D: "naming collision only") — STATUS NOT DETERMINED BY SOURCE RECORD  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE — a conversation shell; displays no field value
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.2; §5.1 family 7

ROW ID P3-D-33 · DOMAIN D · NAMED OBJECT D-OBJ-33 "Practice Field" (`practice_fields`, `practice_field_snapshots`)
  ARTIFACT  app/api/practitioner/practice-field/**; `practiceFieldAddendum` read at lib/sovereign/maiaService.ts:1367
  STATUS  (D: "noted, not censused here") — STATUS NOT DETERMINED BY SOURCE RECORD  ·  ALTITUDE  EXISTS, WIRED (addendum read on the canonical lane)
  COVERAGE  an addendum read at maiaService.ts:1367 on the canonical lane; scope and tiers NOT DETERMINED BY SOURCE RECORD (D deferred it to Domain I)
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD (not traced; Domain I)
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.2

ROW ID P3-D-34 · DOMAIN D · NAMED OBJECT D-OBJ-34 "Wisdom Field" circles (`wisdom_fields`, `wisdom_field_circles`, …) + `WISDOM_FIELD_MOVES`
  ARTIFACT  schema (9 `wisdom_field*` tables); `WISDOM_FIELD_MOVES` consumed at lib/sovereign/maiaService.ts:1083,1091
  STATUS  (D: "noted") — STATUS NOT DETERMINED BY SOURCE RECORD  ·  ALTITUDE  EXISTS, WIRED (move selection on the canonical lane)
  COVERAGE  canonical lane Talk Mode assembly (maiaService.ts:1083,1091), via D-OBJ-7's selection of a move; other families NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NONE FOUND
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.2

ROW ID P3-D-35 · DOMAIN D · NAMED OBJECT D-OBJ-35 Field Coherence Index dashboard + `/api/field-analytics/report`
  ARTIFACT  app/labtools/field-analytics/page.tsx:81-95,100-102,231-286; app/api/field-analytics/report/route.ts:19,70-76; app/labtools/layout.tsx (`requireLabAccess()`)
  STATUS  PARTIAL / FABRICATED-SOURCE (D §4.3: the rendered `fci: 0.5` and its four components are hardcoded fallback constants; the page shows nothing distinguishing fallback from measurement)  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (`requireLabAccess()`)
  COVERAGE  NOT APPLICABLE — lab-gated surface, explicitly "NOT a member surface"; not a cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  `requireLabAccess()` (access gate; ⛔ no gate on the claim the number makes)
  GOVERNING SOURCE  NONE LOCATED — ⚠️ P1-D-GOV-05 records that the one located prohibition ("no chrome, no pill, no /maia/field, no admin panel") is scoped to the S-1 wire-up and whether it reaches this object is a scope question a worker may not answer  ·  SOURCE RECORD  D_field.md §4.2, §4.3, §7, Q-D6

ROW ID P3-D-36 · DOMAIN D · NAMED OBJECT D-OBJ-36 `/labtools/coherence` — breath/HRV protocol tool
  ARTIFACT  app/labtools/coherence/page.tsx + lib/somatic/*
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (`requireLabAccess()`)
  COVERAGE  NOT APPLICABLE — lab-gated; shows a somatic shift unrelated to any other "coherence" in this register
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  `requireLabAccess()`
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.2; §5.2 quantity 5

ROW ID P3-D-37 · DOMAIN D · NAMED OBJECT D-OBJ-37 `rhythmCoherence` debug overlay inside the member conversation component
  ARTIFACT  components/OracleConversation.tsx:1569,1745,1748,10734-10753 (:10753 renders `Coherence: N%`); mounted via app/maia/page.tsx:17, app/field/talk/page.tsx:20, app/studio/maia/page.tsx:15; adjacent :6147
  STATUS  ⚠️ as recorded in D §4.4 — five facts stated, no status word assigned; STATUS NOT DETERMINED BY SOURCE RECORD  ·  ALTITUDE  EXISTS, WIRED (mount condition is `rhythmMetrics` truthy, not a debug flag; `showRhythmDebug` controls opacity only)
  COVERAGE  NOT APPLICABLE — a member-surface UI overlay, not a cognition-family capability
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  ⛔ NONE FOUND
  GOVERNING SOURCE  NONE LOCATED — P1-D-GOV-05 scope question expressly left open  ·  SOURCE RECORD  D_field.md §4.4; §6 ans.3 ("ONE EXCEPTION, NAMED"); Q-D5

ROW ID P3-D-38 · DOMAIN D · NAMED OBJECT D-OBJ-38 `/labtools/relational-field` sensing flow
  ARTIFACT  app/labtools/relational-field/page.tsx (header "Not analysis. Perception.")
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (`requireLabAccess()`)
  COVERAGE  NOT APPLICABLE — lab-gated; shows no field/coherence quantity
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  `requireLabAccess()`
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.2

ROW ID P3-D-39 · DOMAIN D · NAMED OBJECT D-OBJ-39 `/api/maia/field` — "field perception bundle"
  ARTIFACT  app/api/maia/field/route.ts (header documents a 2026-08-16 repair of an unauthenticated read)
  STATUS  ORPHANED — ⚠️ 0 in-repo callers, "orphaned by its own header's determination"  ·  ALTITUDE  EXISTS, RUNTIME-GATED (self-only)
  COVERAGE  NOT APPLICABLE — no in-repo caller on any cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  self-only access gate (per the route header)
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.2; §9 (named `maia-mcp/server.ts` absent — see P3-D-45)

ROW ID P3-D-40 · DOMAIN D · NAMED OBJECT D-OBJ-40 `ResonanceEngine` + `resonanceHysteresis`, `resonance-map`
  ARTIFACT  lib/resonanceEngine.ts:25 (140 L), lib/resonanceHysteresis.ts (213 L), lib/resonance-map.ts (373 L); value importers lib/integrationBridge.ts:8, lib/voice/IntegratedEmotionalResonance.ts:7 (11 of 13 importers take only the `Element` type)
  STATUS  (D: "⚠️ 13 importers, but 11 import only the Element type") — STATUS NOT DETERMINED BY SOURCE RECORD  ·  ALTITUDE  EXISTS, WIRED (two value importers)
  COVERAGE  NOT DETERMINED BY SOURCE RECORD — no cognition family traced from either value importer
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NONE FOUND
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §4.2; §5.3 (a fourth distinct "resonance" object)

ROW ID P3-D-41 · DOMAIN D · NAMED OBJECT `RFI` (named term)
  ARTIFACT  ⛔ NO CODE OBJECT — `grep -rn "\bRFI\b" lib/ app/ components/ database/` → no match. Named at docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md:70 (as a claim NOT to make) and in CLAUDE.md Cat 1
  STATUS  DOCUMENTATION-ONLY  ·  ALTITUDE  (none — no code object exists)
  COVERAGE  NOT APPLICABLE — no referent in code
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT APPLICABLE (no code object)
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §5.4; §9

ROW ID P3-D-42 · DOMAIN D · NAMED OBJECT `UFI` (named term)
  ARTIFACT  ⛔ NO CODE OBJECT — exactly one hit repo-wide, a comment: lib/orientation/spiralOrientation.ts:31 "UFI = field assembly (not used here)"
  STATUS  DOCUMENTATION-ONLY  ·  ALTITUDE  (none — no code object exists)
  COVERAGE  NOT APPLICABLE — no referent in code
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT APPLICABLE (no code object)
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  D_field.md §5.4; §9

ROW ID P3-D-43 · DOMAIN D · NAMED OBJECT `FIS Field State Primitive`
  ARTIFACT  docs/canon/FIS_FIELD_STATE_PRIMITIVE.md (self-declared "interface target — no runtime authority yet"); nearest artifact lib/sovereign/pfiMindEntrypoint.ts does NOT match its six-dimension shape
  STATUS  DOCUMENTATION-ONLY  ·  ALTITUDE  (none — no implementing code object)
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT APPLICABLE (no code object)  ·  GOVERNING SOURCE  the canon document itself, which declares it has no runtime authority
  SOURCE RECORD  D_field.md §9

ROW ID P3-D-44 · DOMAIN D · NAMED OBJECT `COLLECTIVE_FIELD_SERVICE_URL` service on :3010
  ARTIFACT  app/api/field-analytics/report/route.ts:19 — the variable appears in exactly one file repo-wide; absent from docker-compose.production.yml and every .env.example
  STATUS  (D: "NOT FOUND") — recorded as UNKNOWN: D determined the variable's absence, not the service's existence outside the repo  ·  ALTITUDE  (none located)
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT APPLICABLE (artifact not found)  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §4.3; §9

ROW ID P3-D-45 · DOMAIN D · NAMED OBJECT `maia-mcp/server.ts` (`get_member_field`)
  ARTIFACT  named only by the header of app/api/maia/field/route.ts, which itself records the artifact as absent from this repository
  STATUS  UNKNOWN (absent from this repository; D makes no claim about elsewhere)  ·  ALTITUDE  (none located)
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT APPLICABLE (artifact absent)  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §9

ROW ID P3-D-46 · DOMAIN D · NAMED OBJECT table `field_state_snapshots`
  ARTIFACT  database/baseline/...sql:9969 — table exists; ⛔ no writer or reader traced in lib/** or app/**
  STATUS  DORMANT (table present, no traced reader or writer)  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  D_field.md §9

---

## DOMAIN E — SPIRALOGIC / ELEMENTAL (29 rows)

⚠️ Domain E assigns no ladder positions anywhere in its record (it uses the *vocabulary vs
executable* axis instead, and asks in Q1 whether *EXISTS ≠ PARTICIPATES* holds at its scale).
Every E row therefore carries **LADDER NOT DETERMINED BY SOURCE RECORD** — ⛔ a position is not
manufactured from the fact that a value reaches a prompt.

ROW ID P3-E-01 · DOMAIN E · NAMED OBJECT `SPIRALOGIC_REFERENCE` constant (E-1)
  ARTIFACT  lib/maia/spiralogicReference.ts:2 (8-line file, one export); lib/soulPortrait/schema.ts:19 names the path in a COMMENT only
  STATUS  ORPHANED (vocabulary) — zero importers at the subject  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE — never loaded, never surfaced, no cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NONE FOUND
  GOVERNING SOURCE  NONE LOCATED (UG-E7: the only Spiralogic artifact with ratified backing is the `registration/` grammar — see P3-E-29)  ·  SOURCE RECORD  E §1 Q1; §2; C-E5

ROW ID P3-E-02 · DOMAIN E · NAMED OBJECT `ConversationElementalTracker` → `context.summary` → system prompt (E-2, §3.1)
  ARTIFACT  lib/consciousness/conversation-elemental-tracker.ts:18,45,46,253,289; lib/sovereign/maiaService.ts:1773,1781,1785,2198; lib/sovereign/maiaVoice.ts:277,861
  STATUS  WIRED-BUT-UNOBSERVED (executable, prompt-affecting)  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  canonical getMaiaResponse lane — CORE (:1773) and DEEP (:2198), every turn. FAST: NOT DETERMINED BY SOURCE RECORD. Other families: NOT DETERMINED BY SOURCE RECORD.
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  ⭐ NONE FOUND — no env flag, no consent check, no Sanctuary branch at the injection site
  GOVERNING SOURCE  NONE LOCATED (UG-E2)  ·  SOURCE RECORD  E §3.1; §10 UG-E2; §13

ROW ID P3-E-03 · DOMAIN E · NAMED OBJECT `ElementalOracleBridge` → `elementalResult.dominant` → `[Field Intelligence]` JSON (E-2, §3.2)
  ARTIFACT  lib/bridges/elemental-oracle-bridge.ts:205,328,333-357,373-387,396,399,463,812,853; lib/sovereign/maiaService.ts:883-908,1659,1698,1957,1962,1970,2239-2262
  STATUS  WIRED-BUT-UNOBSERVED (executable, prompt-affecting on CORE)  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (Sanctuary gates the FieldContext at fieldOrchestrator.ts:168-178)
  COVERAGE  computed on FAST, CORE and DEEP; ⭐ SURFACED on CORE only (:1957 → :1962). FAST instead uses a CALLER-SUPPLIED `(meta as any)?.element` at :1532 — a different input, ⛔ not this detector's output.
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  PARTIAL — Sanctuary on the FieldContext is a real gate; ⛔ NONE FOUND on the element computation itself
  GOVERNING SOURCE  NONE LOCATED (UG-E2)  ·  SOURCE RECORD  E §3.2; §10 UG-E2

ROW ID P3-E-04 · DOMAIN E · NAMED OBJECT Talk-mode `fieldAwareness` block (element + phase), from `lib/maia/talkModeFieldIntelligence` (E-2, §3.3)
  ARTIFACT  lib/sovereign/maiaService.ts:1079,1084-1094,1097,1098,1101,1112,1133-1137,1198 — `grep -n fieldAwareness` returns exactly 1079, 1094, 1198
  STATUS  verbatim from E §3.3: "COMPUTED · LOGGED · NOT SURFACED → recorded as DORMANT at the prompt boundary while remaining LIVE as an observation"  ·  ALTITUDE  EXISTS, WIRED, CONFIG-SELECTED (`TALK_MODE_FIELD_INTELLIGENCE !== 'false'`), RUNTIME-GATED (`mode === 'dialogue'`)
  COVERAGE  canonical getMaiaResponse lane, Talk Mode; ⛔ zero prompt coverage — never concatenated into any prompt
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  the env flag + mode condition select the computation (INF-3: selection authorizes nothing); no further gate recorded
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  E §1 Q3; §3.3; C-E2; C-E3  ⚠️ X-DEF-1 below: D records the same module's block as reaching the prompt

ROW ID P3-E-05 · DOMAIN E · NAMED OBJECT `member_spiral_state` substrate + `upsertSpiralState` write path (E-3)
  ARTIFACT  database/migrations/20260213200001_member_spiral_state.sql:13-32,36-41,47; lib/consciousness/spiralStatePersistence.ts:59,76,96,148; sole writer call site app/api/oracle/conversation/route.ts:1611, below the unconditional 410 at :446-453 in the block labelled "// Unreachable below" (:455)
  STATUS  WRITE PATH: DORMANT (no reachable writer) · READ PATH: WIRED-BUT-UNOBSERVED · ROWS: UNKNOWN  ·  ALTITUDE  EXISTS, WIRED (read side)
  COVERAGE  NOT APPLICABLE for the write path (unreachable); read coverage is carried by P3-E-06…09 — ⭐ stored rows are still read, and one reader renders them into a prompt
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  PARTIAL — one exists, on SHAPING only (Refusal R16, P3-E-10), and it does not name `dominant_element` or `phase`
  GOVERNING SOURCE  NONE LOCATED (UG-E3: no ratified definition of what integer 1..12 denotes)  ·  SOURCE RECORD  E §1 Q2, Q4; §4.1; C-E1; C-E6

ROW ID P3-E-06 · DOMAIN E · NAMED OBJECT reader 1 — Living Field encounter/refine context (`loadSpiralState` → `gatheredMaterial`)
  ARTIFACT  lib/maia/living-field/encounterContext.ts:126,196-198 ("Spiral state: element=…, phase=…, motion=…"); app/api/maia/living-field/[fieldKey]/encounter/route.ts:19; …/refine/route.ts:9
  STATUS  WIRED-BUT-UNOBSERVED · prompt-affecting  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  the Living Field encounter/refine routes; ⛔ NOT the canonical getMaiaResponse lane. Coverage on other families: NOT DETERMINED BY SOURCE RECORD.
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  E §4.2 row 1; §12 Q5 (stale rows read as current)

ROW ID P3-E-07 · DOMAIN E · NAMED OBJECT reader 2 — `MemberLiveContext.spiralState`
  ARTIFACT  lib/memory/MemberLiveContext.ts:319,383,418; `formatMemberWebForPrompt` (:436) contains NO spiral/element/phase reference
  STATUS  WIRED · not surfaced  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  loaded into member context; ⛔ zero prompt coverage — loaded, not rendered. Cognition-family reach NOT DETERMINED BY SOURCE RECORD.
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  E §4.2 row 2

ROW ID P3-E-08 · DOMAIN E · NAMED OBJECT reader 3 — `GET /api/members/spiral-state` (member's own disclosure surface)
  ARTIFACT  app/api/members/spiral-state/route.ts:15,24-30 — returns `currentElement`, `phase`, `motion`, ⚠️ `relationalPhase`, ⚠️ `autonomyStreak`; client consumer components/consciousness/ContinuityView.tsx:143
  STATUS  WIRED-BUT-UNOBSERVED · member-facing  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (authenticated member)
  COVERAGE  NOT APPLICABLE — a disclosure route, not a MAIA-claiming cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  ⛔ NONE FOUND for the disclosure act — the two inferred fields are returned with no admission step equivalent to R16
  GOVERNING SOURCE  NONE LOCATED (UG-E4)  ·  SOURCE RECORD  E §4.2 row 3; §4.3; C-E7; UG-E4

ROW ID P3-E-09 · DOMAIN E · NAMED OBJECT reader 4 — research metric aggregates over `dominant_element` / `phase`
  ARTIFACT  lib/research/researchMetricRegistry.ts:362-369
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  NOT APPLICABLE — aggregate research counts, not a cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  E §4.2 row 4

ROW ID P3-E-10 · DOMAIN E · NAMED OBJECT `admitPersistedStateForShaping` — Refusal R16 developmental-state admission boundary
  ARTIFACT  lib/relational/developmentalStateAdmission.ts:5-8 (law quoted), :19-21 (behavioural-fact carve-out), :31-39 (INFERRED_DEVELOPMENTAL_FIELDS), :61; sole caller app/api/oracle/conversation/route.ts:1711 — below the 410
  STATUS  PRESENT · CORRECTLY SCOPED TO ITS OWN CLAIM · ITS ONLY CALL SITE IS UNREACHABLE  ·  ALTITUDE  EXISTS, WIRED (to an unreachable caller), CI-GATED (E: "named, tested constitutional refusal")
  COVERAGE  response-shaping subsystems only; ⛔ does not reach the disclosure path (P3-E-08), the persistence path, or the fields it does not name (`dominant_element`, `phase`)
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  ⭐ IT IS THE GATE — the single named, tested refusal attached to a developmental-state field in Domain E
  GOVERNING SOURCE  Refusal R16, law quoted in-file at :5-8; ⛔ no external ratified document cited by E — NONE LOCATED  ·  SOURCE RECORD  E §1 Q4; §4.3; C-E7

ROW ID P3-E-11 · DOMAIN E · NAMED OBJECT `lib/voice/conductor.ts` — hysteresis, `scoreRoute`, `createVoiceIntent`, `normalizePhase`
  ARTIFACT  lib/voice/conductor.ts:24-28,40,46-51,57-108,160,256,340 — in-memory hysteresis buffer, "resets on server restart. Bridge D replaces this"
  STATUS  DORMANT (E §13 roll-up)  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE — its write target (P3-E-05) has no reachable caller
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  E §4.1; §13; C-E1 (writes a 1|2|3 value into a 1..12 column)

ROW ID P3-E-12 · DOMAIN E · NAMED OBJECT Corpus Callosum trace — `corpusCallosumService` + `agent_runs` / `integration_passes` (E-4)
  ARTIFACT  lib/services/corpusCallosumService.ts:111,115,120,172,175,180,229,317,334,356,371,376,390,404,420,435,460,462; lib/sovereign/maiaService.ts:3948,3950,3967,3978,4022
  STATUS  WIRED-BUT-UNOBSERVED (write); ⛔ NOT participating in cognition  ·  ALTITUDE  EXISTS, WIRED, CONFIG-SELECTED (`CORPUS_CALLOSUM_ENABLED !== '0'`, default ON), RUNTIME-GATED (Sanctuary refused at :115/:175)
  COVERAGE  reached from `getMaiaResponse` on all tiers per the code (no tier restriction found); ⛔ zero read-back coverage — no reader feeds any cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  PARTIAL — Sanctuary refusal is a real gate; ⛔ no further governance located for the non-Sanctuary default-on write of MAIA's own response text (first 500 chars, :376)
  GOVERNING SOURCE  NONE LOCATED (UG-E6)  ·  SOURCE RECORD  E §5, §5.1, §5.2, §5.4; UG-E6; C-E4

ROW ID P3-E-13 · DOMAIN E · NAMED OBJECT second Corpus Callosum lane — `maiaOrchestrator` agent rows (`gebser-analysis`, `elemental-field`, `elemental-field-summary`, `conversational-elemental`)
  ARTIFACT  lib/consciousness/maiaOrchestrator.ts:627,677,722,773,805; sole importer app/api/between/chat/route.ts:18
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  the BETWEEN path (/api/between/chat) only. ⚠️ An inherited claim of zero BETWEEN rows in production is recorded by E as UNVERIFIED — ⛔ not re-asserted here.
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  E §5.3

ROW ID P3-E-14 · DOMAIN E · NAMED OBJECT canonical route's own `logAgentRun` — `agentName: 'interruption-ledger'`
  ARTIFACT  app/api/sovereign/app/maia/list/route.ts:19,1638 — ⛔ not an elemental voice
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  canonical /list lane; ⛔ carries no elemental content — enumerated to prevent conflation with P3-E-12
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  E §5.4

ROW ID P3-E-15 · DOMAIN E · NAMED OBJECT `VoiceDistinctionScorer.scoreFirewallIntegrity`
  ARTIFACT  lib/spiralogic/VoiceDistinctionScorer.ts; lib/sovereign/maiaService.ts:99,4001-4005,4015,4017 — "observability-only collapse detector … No behavior / prompt / schema impact"; console.log marked "(uncalibrated) … scope=lexical-only(not-generativity)"
  STATUS  WIRED-BUT-UNOBSERVED · log-only by its own declaration  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  canonical getMaiaResponse lane, after the answer exists; ⛔ zero influence on any cognition family by its own declaration
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  E §5.1 fact 3; §8.1; §12 Q7

ROW ID P3-E-16 · DOMAIN E · NAMED OBJECT per-phase therapeutic-modality selection — `FRAMEWORK_REGISTRY` + `chooseFrameworksForCell` (E-5)
  ARTIFACT  lib/consciousness/spiralogic-core.ts:1314,1392 (IPP),1407 (CBT),1422 (JUNGIAN),1437 (SHAMANIC),1449 (SOMATIC),1464 (IFS),1479 (MINDFULNESS),1502-1519 (`getAppliedFrameworkIdsForApproach`, no caller),1575,1579,1581-1592,1651 (`inferSpiralogicCell`, "Simplified implementation"); call sites app/api/oracle/conversation/route.ts:846 (below the 410) and app/api/maia/spiralogic/route.ts:89, BOTH without opts
  STATUS  DORMANT — fully specified, structurally unreachable in its applied tier (`enabledApplied` defaults to `[]`)  ·  ALTITUDE  EXISTS, WIRED (to two callers that supply no opts)
  COVERAGE  NOT APPLICABLE at the subject — no applied modality can be selected on any family; ⛔ inertness is NOT a ruling that it is safe
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  ⭐ NONE FOUND — no consent gate, no disclosure, no refusal surface on modality selection; the empty default is a code default, ⛔ not a gate
  GOVERNING SOURCE  NONE LOCATED (UG-E1 — P1-01 named this the highest-consequence unlocated gap)  ·  SOURCE RECORD  E §1 Q5; §6; UG-E1; §12 Q4

ROW ID P3-E-17 · DOMAIN E · NAMED OBJECT `spiralConstellationService` — the partial S-16 cross-spiral shape
  ARTIFACT  lib/services/spiral-constellation.ts:20,26,33,57 (`CrossSpiralPattern`),69,79,137 (`prisma.spiralProcess.findMany`),714; lib/consciousness/spiral-aware-response.ts:21,272,447; app/api/spirals/constellation/route.ts:12,28; app/api/consciousness/spiral-aware/route.ts:17; client components/debug/ConstellationDebugOverlay.tsx:100
  STATUS  ORPHANED — the declared datastore model does not exist (no `model Spiral*` among 53 Prisma models)  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (routes auth-gated via `getSessionUserId`)
  COVERAGE  NOT APPLICABLE — auth-gated routes, no cognition family; ⛔ whether they error, return empty, or are dead at runtime is UNKNOWN
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  auth on the routes; governance of the shape NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  E §7.2, §7.3; C-E8

ROW ID P3-E-18 · DOMAIN E · NAMED OBJECT `CrossSpiralPatternRecognizer` + `TriadicPhaseDetector`
  ARTIFACT  lib/spiralogic/CrossSpiralPatternRecognizer.ts, lib/spiralogic/TriadicPhaseDetector.ts — 1 importer each, lib/ain/AINSpiralogicBridge.ts:22,23 (types only)
  STATUS  DORMANT / orphaned as recorded  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  E §7.3; §8.1

ROW ID P3-E-19 · DOMAIN E · NAMED OBJECT `PhaseDetector` / type `SpiralogicPhase` (⚠️ an ELEMENT name, not a phase)
  ARTIFACT  lib/spiralogic/PhaseDetector.ts:8,94,170,180; value consumers lib/agents/PersonalOracleAgent.ts:49, lib/memory/SymbolicPredictor.ts:17, lib/memory/MemoryUpdater.ts:18; type-only in 5 further files, three of which have zero importers
  STATUS  WIRED (element-named "phase")  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  ⛔ none of its consumers is on the `getMaiaResponse` lane; cognition-family coverage NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  E §8.1; §8.2

ROW ID P3-E-20 · DOMAIN E · NAMED OBJECT `lib/spiralogic/` zero-importer mass (`SpiralogicDataModel`, `CollectiveWisdomLayer`, `RitualEngine`, `Aether`, `Agents`, `SpiralogicIntelligenceLayer`, `SpiralogicOrchestrator`, `pathwayData`, `spiralogic-interface`, `Separator`, `modes/gameplay-modes`, `config/`, `agents/MaiaAgent`)
  ARTIFACT  lib/spiralogic/** — ~110 KB, 0 importers each (E §8.1 table)
  STATUS  DORMANT (vocabulary)  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  E §8.1  (⛔ grouped exactly as the source grouped it; ⛔ not split to tidy a status)

ROW ID P3-E-21 · DOMAIN E · NAMED OBJECT `lib/spiralogic/core/spiralogic-engine.ts` (+ `core/spiralProcess.ts`)
  ARTIFACT  imported by app/api/spiralogic/route.ts:5, lib/voice/consciousness/* ×2, backend routes; `spiralProcess` types-only in lib/ain/elemental-alchemy-integration.ts:8 and lib/ain/awareness-adjustment.ts:7. Also referenced by the vault adapter at lib/maia/fieldContextAdapter.ts (spiralogic-engine.ts:643) which declares it does NOT call `enterSpiral`
  STATUS  WIRED-BUT-UNOBSERVED (engine) · VOCABULARY (`spiralProcess`)  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  NOT DETERMINED BY SOURCE RECORD  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  E §8.1

ROW ID P3-E-22 · DOMAIN E · NAMED OBJECT `lib/elemental-agents/{fire,water,earth,air,aether}-agent.ts` (SOAR/MicroPsi/ACT-R/LIDA/POET, ~95 KB)
  ARTIFACT  importers lib/consciousness/VoiceCognitiveArchitecture.ts:16-20, lib/maia/cognitiveVoiceAnalysis.ts, lib/sacred-oracle-constellation.ts — ⛔ none on the canonical lane
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  E §8.3

ROW ID P3-E-23 · DOMAIN E · NAMED OBJECT `lib/elemental-alchemy/` practices (`getAllPractices`, `assessmentQuestions`, `journalService`)
  ARTIFACT  lib/elemental-alchemy/practices.ts (24 KB) + siblings; imported by lib/sovereign/maiaService.ts:113
  STATUS  WIRED (practice content, not phase logic)  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  canonical getMaiaResponse lane (import at maiaService.ts:113); tier and surfacing NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  E §8.3

ROW ID P3-E-24 · DOMAIN E · NAMED OBJECT `lib/aether-facets.ts` (and `lib/elemental-oracle/blueprint-integration.ts`)
  ARTIFACT  lib/aether-facets.ts — ⛔ 0 importers; lib/elemental-oracle/blueprint-integration.ts — no importer recorded
  STATUS  ORPHANED (aether-facets) · DORMANT (elemental-oracle blueprint)  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  E §8.3

ROW ID P3-E-25 · DOMAIN E · NAMED OBJECT `bead_events.spiralogic_element` → `getConsciousnessPolicy` → awareness-level guidance
  ARTIFACT  database/baseline/0001_baseline_2026-09-01.sql:5863 (index :28493) — ⛔ no migration file declares the column; read at lib/sovereign/maiaService.ts:443-506,455-461 (30-day window), logged :801
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  canonical getMaiaResponse lane — a 30-day elemental aggregate carried into awareness-level guidance; tier coverage NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  ⛔ NONE FOUND
  GOVERNING SOURCE  NONE LOCATED (UG-E5)  ·  SOURCE RECORD  E §8.4; UG-E5

ROW ID P3-E-26 · DOMAIN E · NAMED OBJECT Prisma `model ElementalState` + `model ElementalEvolution`
  ARTIFACT  prisma/schema.prisma:227, :253 — per-element floats + `dominantElement`; ⚠️ a third elemental persistence shape, on a client the project's own doctrine does not name as its database access path
  STATUS  (E: "Preserved as a finding; ⛔ not adjudicated") — STATUS NOT DETERMINED BY SOURCE RECORD  ·  ALTITUDE  EXISTS
  COVERAGE  NOT DETERMINED BY SOURCE RECORD  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  E §1 Q2; §8.4; §12 Q9

ROW ID P3-E-27 · DOMAIN E · NAMED OBJECT `member_spiral_state.facet_id` / `facet_movement` (inner-guide field persistence)
  ARTIFACT  lib/consciousness/innerGuideFieldPersistence.ts:73,82 — UPDATE only ("We don't create rows"), so it depends on a writer that no longer runs
  STATUS  DORMANT in effect (UPDATE-only against a table with no reachable writer)  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  NOT DETERMINED BY SOURCE RECORD  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  E §4.1; §8.4

ROW ID P3-E-28 · DOMAIN E · NAMED OBJECT the S-16 12-phase document vocabulary — `dominantSpiral`, `crossSpiralTensions`, `emergentSynergies`, `overallTorusMovement`, per-life-domain `PhaseState`, "consciousness GPS"
  ARTIFACT  docs/MAIA_12_PHASE_AWARENESS_SYSTEM.md:47; docs/CANONICAL_SPIRALOGIC_12_PHASE_REFERENCE.md:107,108,162; docs/pitch/MAIA-Sovereign-Origins-Vision.md:47 — ⛔ 0 code hits for four of them in lib/app/components
  STATUS  DOCUMENTATION-ONLY  ·  ALTITUDE  (none — no code object)
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT APPLICABLE (no code object)  ·  GOVERNING SOURCE  the naming documents carry no status (UG-E7)
  SOURCE RECORD  E §7.2; §11; §13

ROW ID P3-E-29 · DOMAIN E · NAMED OBJECT `lib/spiralogic/registration/` — the chart-to-elemental grammar
  ARTIFACT  lib/spiralogic/registration/ (6 files + test), self-contained
  STATUS  (E §8.1: "the one chart-to-elemental grammar with ratified backing") — participation STATUS NOT DETERMINED BY SOURCE RECORD  ·  ALTITUDE  EXISTS, CI-GATED (a test accompanies it), GOVERNED (ratified backing per P1-01, as E records)
  COVERAGE  NOT DETERMINED BY SOURCE RECORD  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  ⭐ the only Spiralogic artifact E found with ratified backing (P1-01; UG-E7)
  SOURCE RECORD  E §8.1; UG-E7

---

## DOMAIN F — SYMBOLIC SYSTEMS (36 rows)

⭐ **F kept three powers separate and this register keeps them separate.** `KNOW` = what enters
MAIA's context or store · `SAY` = what MAIA may utter and in what frame · `CONCLUDE` = what MAIA
may assert **about this person**. They are carried in the LADDER line as a bracketed clause.
⛔ Concluding-capability is **not** a ladder position; F established a ladder position for exactly
two rows (F-07, F-08, via its own sentence *"authentication establishes PARTICIPATES, not HAS
AUTHORITY"*). Everything else is **NOT DETERMINED BY SOURCE RECORD**. ⭐ `LIVE` is used zero times
in F, and the one dated production witness recorded **absence** — ⛔ which licenses nothing.

ROW ID P3-F-01 · DOMAIN F · NAMED OBJECT F-01 `lib/iching/` (6 files, 1,925 ln)
  ARTIFACT  lib/iching/** ; used by F-07/F-08 via `getHexagram()`
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED  ·  Classification: informational · computational
  COVERAGE  NOT APPLICABLE — corpus consumed by non-turn routes (P3-F-07/08); no MAIA-claiming cognition family traced
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: corpus data · SAY: n/a · CONCLUDE: n/a]  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  F §2 F-01; §11 Q2 (⚠️ which I Ching corpus is canonical is UNDECIDED)

ROW ID P3-F-02 · DOMAIN F · NAMED OBJECT F-02 `lib/divination/iching/` (4 files, 2,687 ln)
  ARTIFACT  lib/divination/iching/** incl. hexagrams.ts (`soulInterpretation`/`guidance` house corpus copied at write time by F-06)
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED  ·  Classification: informational · computational · memory-bearing
  COVERAGE  its house text reaches the canonical /list lane only through P3-F-06's copy-at-write-time; ⛔ the corpus itself is not a cognition-family participant
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: house corpus · SAY: via F-06's blocks · CONCLUDE: no]  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  F §2 F-02; §3.2; §10 (two independent I Ching corpora, no artifact declares which is canonical)

ROW ID P3-F-03 · DOMAIN F · NAMED OBJECT F-03 `lib/divination/tarot/` (5 files, 1,901 ln)
  ARTIFACT  major-arcana.ts 364 · minor-arcana.ts 533 · spreads.ts 574 (:27,:31,:45-46,:291,:295,:315) · drawing.ts 410 · index.ts 20
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED  ·  Classification: informational · interpretive · computational
  COVERAGE  NOT APPLICABLE — reached from the unauthenticated tarot route (P3-F-11), not from a cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: spread + card data · SAY: unconstrained here · ⚠️ CONCLUDE: forecast-shaped BY DATA STRUCTURE — a `Future` position defined as "Likely outcome based on current trajectory" is a forecast SLOT, not merely a possible output]  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD (the route's gate is NONE FOUND — P3-F-11)
  GOVERNING SOURCE  MAIA_SOVEREIGNTY_INVARIANTS.md:246 names Tarot in Tier 2 — ⛔ no implementing mechanism found (P3-F-34)  ·  SOURCE RECORD  F §2 F-03; §3.4; C-F3

ROW ID P3-F-04 · DOMAIN F · NAMED OBJECT F-04 `lib/divination/runes/` (3 files, 1,252 ln)
  ARTIFACT  lib/divination/runes/**
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED  ·  Classification: informational · interpretive · computational
  COVERAGE  NOT APPLICABLE — reached from the unauthenticated runes route (P3-F-12)
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: rune corpus · SAY: unconstrained here · CONCLUDE: NOT DETERMINED BY SOURCE RECORD]  ·  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  F §2 F-04; §3.4

ROW ID P3-F-05 · DOMAIN F · NAMED OBJECT F-05 `lib/divination/core/oracle-engine.ts` (474 ln)
  ARTIFACT  lib/divination/core/oracle-engine.ts
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED  ·  Classification: computational · interpretive
  COVERAGE  NOT DETERMINED BY SOURCE RECORD  ·  LADDER  NOT DETERMINED BY SOURCE RECORD [three powers NOT DETERMINED BY SOURCE RECORD]
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §2 F-05

ROW ID P3-F-06 · DOMAIN F · NAMED OBJECT F-06 `divinationRecallLoader` — member's own I Ching readings into the live turn
  ARTIFACT  lib/maia/divinationRecallLoader.ts:1-50 (:30-33,:34-36,:39-41,:45,:46,:47,:48-49,:73); app/api/sovereign/app/maia/list/route.ts:143,1103,1105-1111; lib/maia/canonical-turn/producerRegistry.ts:196-215; lib/maia/__tests__/divinationRecallLoader.test.ts:102; lib/maia/canonical-turn/__tests__/divinationParticipation.test.ts:21; migrations 20260130000001:80,:177 + 20260201000001
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (Sanctuary; `allowCrossSessionMemory && userId`), CI-GATED (no-write source pin + participation test), OBSERVED — ⚠️ a dated founder-run production witness (2026-09-03) exists and **recorded ABSENCE**: 5 rows all-time, newest 2026-06-11, the block "would report candidateCount: 0". ⛔ INF-1 holds: this is a traced wire with a witness of zero output, ⛔ not LIVE.
  COVERAGE  canonical getMaiaResponse lane (/api/sovereign/app/maia/list:1103), inside the cross-session-memory gate; other families NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD [⭐ KNOW: bounded — member's own un-archived readings within a window · SAY: gated by a block-level discipline line, "do not raise a reading unprompted" · ⭐⭐ CONCLUDE: **STRUCTURALLY REFUSED** — "does NOT re-interpret the cast, synthesize across readings, or rank by salience"; the text is house corpus copied at write time, NOT model-generated, NOT the member's words; three authorships kept in three separate blocks]
  GOVERNANCE GATE  MULTIPLE AND STRUCTURAL — Sanctuary suppression · cross-session memory mode · member scoping as a bound parameter · no-write source pin (pinned by test) · producer registry with `consentBasis: 'memory mode continuity'` · participation test. ⭐ The only symbolic system in F whose gates are TESTED rather than asserted.
  GOVERNING SOURCE  the loader header's declared authority chain and the pdc-1 conflation prohibition it cites; ⛔ no P1-01 governing source named — NONE LOCATED  ·  SOURCE RECORD  F §3.2; §4 table; §6; §11 Q6,Q9

ROW ID P3-F-07 · DOMAIN F · NAMED OBJECT F-07 `POST /api/changes/[id]/interpret` — member-facing I Ching interpretation
  ARTIFACT  app/api/changes/[id]/interpret/route.ts (173 ln): :12,:15,:17-40 (INTERPRETATION_SYSTEM_PROMPT incl. :21 "speak from within it", :33-38 fields, :40 "SPEAK AS IF THE HEXAGRAM ITSELF IS ADDRESSING THE PERSON"), :47-49 auth, :56 member-scoped SELECT, :159 UPDATE studio_changes
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (authenticated, member-scoped)
  COVERAGE  NOT APPLICABLE — a member-authenticated non-turn route, not a MAIA-claiming cognition family (F §6)
  LADDER  ⭐ PARTICIPATES — established by F §3.3: "authentication establishes PARTICIPATES, not HAS AUTHORITY" [KNOW: the member's change record + hexagram · SAY: instructed to speak from within the tradition · ⭐⭐ CONCLUDE: YES AND INSTRUCTED TO — `reading`, `guidance`, `warnings`, `timing`, and `relatingReading` ("where this is heading") are conclusions about the person, and the conclusion is PERSISTED at :159 with no author-class column]
  GOVERNANCE GATE  ⭐ NONE FOUND — no `SYMBOLIC_LENS_BOUNDARY`, no Tier-2 refusal, no test file; auth and member-scoping gate WHO MAY INVOKE, never WHAT MAY BE CLAIMED
  GOVERNING SOURCE  NONE LOCATED — ⚠️ MAIA_SOVEREIGNTY_INVARIANTS.md:245 names I Ching under Tier 1 and this prompt instructs the precise inverse (C-F1)  ·  SOURCE RECORD  F §3.3; §4; §6; §9.6; §11 Q1

ROW ID P3-F-08 · DOMAIN F · NAMED OBJECT F-08 `POST /api/studio/changes/[id]/interpret` — practitioner-facing I Ching interpretation
  ARTIFACT  app/api/studio/changes/[id]/interpret/route.ts (186 ln) — the same INTERPRETATION_SYSTEM_PROMPT (:17-40, identical in both files); persists its conclusion
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (auth + scoping present per F §3.3)
  COVERAGE  NOT APPLICABLE — practitioner-facing non-turn route, not a cognition family
  LADDER  PARTICIPATES (same F §3.3 sentence) [KNOW: the change record · SAY: "speak from within it" · CONCLUDE: YES AND INSTRUCTED TO — same five fields, persisted]
  GOVERNANCE GATE  ⭐ NONE FOUND (identical grep result to P3-F-07: no lens, no tradition-framing, no refusal, no test)
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  F §3.3; §4; C-F1

ROW ID P3-F-09 · DOMAIN F · NAMED OBJECT F-09 `app/api/studio/changes/[id]/mentor/` (+ `/chat`)
  ARTIFACT  mentor/route.ts (222 ln) :32 — "You never diagnose, prescribe, or claim authority over the person's process"
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED  ·  Classification: interpretive · concluding
  COVERAGE  NOT APPLICABLE — non-turn route on the same substrate as P3-F-07/08
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: same substrate · SAY: constrained by its own inline restraint · CONCLUDE: classified concluding in F §2; no refusal mechanism beyond the inline line]
  GOVERNANCE GATE  an inline self-authored restraint at :32 — ⭐ the only self-authored restraint found outside the canonical wrapper; ⛔ not `SYMBOLIC_LENS_BOUNDARY`, ⛔ not canon-bound
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  F §3.3; §4 table

ROW ID P3-F-10 · DOMAIN F · NAMED OBJECT F-10 `app/api/oracle/iching/route.ts` — cast + persist
  ARTIFACT  app/api/oracle/iching/route.ts:71 (member scoping); the I Ching surface app/oracle/iching/page.tsx:326 also POSTs to `/api/field/records` (see P3-D-27)
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (member scoping)  ·  Classification: computational · memory-bearing · member-facing
  COVERAGE  NOT APPLICABLE — non-turn route; its written readings are what P3-F-06 later recalls
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: the cast · SAY: house corpus · ⛔ CONCLUDE: NO — house corpus text, per F §6]
  GOVERNANCE GATE  member scoping (:71)  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §2 F-10; §6

ROW ID P3-F-11 · DOMAIN F · NAMED OBJECT F-11 `POST /api/oracle/tarot` — ⚠️ UNAUTHENTICATED
  ARTIFACT  app/api/oracle/tarot/route.ts:4-10,19-22,24,38-48 (111 ln) — grep for auth/member/session/SYMBOLIC_LENS returns ZERO matches across all 111 lines
  STATUS  WIRED-BUT-UNOBSERVED · UNAUTHENTICATED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  NOT APPLICABLE — non-turn route, no member identity at all
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: the submitted query only · SAY: unconstrained — no wrapper · ⚠️ CONCLUDE: forecast-shaped by the spread definitions; ⛔ no mechanism was found that COULD make the Tier-2 claim-type judgement on this path]
  GOVERNANCE GATE  ⭐ NONE FOUND on both axes — no authentication, no member scoping, no symbolic-lens wrapper; ⚠️ and unlike F-13 its openness is **undeclared**
  GOVERNING SOURCE  MAIA_SOVEREIGNTY_INVARIANTS.md:246 names Tarot in Tier 2 — ⛔ unimplemented (P3-F-34)  ·  SOURCE RECORD  F §3.4; §4; §6; §11 Q4

ROW ID P3-F-12 · DOMAIN F · NAMED OBJECT F-12 `POST /api/oracle/runes` — ⚠️ UNAUTHENTICATED
  ARTIFACT  app/api/oracle/runes/route.ts (180 ln) — same shape, same zero auth matches
  STATUS  WIRED-BUT-UNOBSERVED · UNAUTHENTICATED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  NOT APPLICABLE — non-turn route, no member identity
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: submitted query · SAY: unconstrained · CONCLUDE: F §2 classifies it interpretive · member-facing (⛔ not "concluding"), while F §4's NONE-FOUND list includes it — both preserved, see the CONCLUDE inventory]
  GOVERNANCE GATE  ⭐ NONE FOUND (F §4 list) — no auth, no wrapper
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  F §3.4; §4; §6

ROW ID P3-F-13 · DOMAIN F · NAMED OBJECT F-13 `app/api/iching/cast/`, `/search/`, `/hexagram/[number]/`
  ARTIFACT  app/api/iching/cast/route.ts:8 — "Does not require authentication — the oracle is available to all"
  STATUS  WIRED-BUT-UNOBSERVED · UNAUTHENTICATED (self-declared)  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  NOT APPLICABLE — non-turn informational/computational routes
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: hexagram data · SAY: informational · CONCLUDE: not classified concluding by F]
  GOVERNANCE GATE  openness DECLARED deliberately at :8 — ⭐ the only unauthenticated symbolic route in F that says so; a claim-type gate is NOT DETERMINED BY SOURCE RECORD
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  F §2 F-13; §3.4; §6; §11 Q4

ROW ID P3-F-14 · DOMAIN F · NAMED OBJECT F-14 `maiaAstrologyContextService` — natal chart, transits, cosmic weather in the live member turn
  ARTIFACT  lib/services/maiaAstrologyContextService.ts:1 (`// @ts-nocheck`),:12,:70,:73,:1-90 (1,205 ln); app/api/sovereign/app/maia/list/route.ts:109,552,695,726-738,732,1235,1290,1419; lib/astrology/ephemerisCalculator.ts (1,064 ln)
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (`hasBirthData` gates detail volume; `.catch()` at :695 fails open toward LESS symbolic content), GOVERNED (at this call site only)
  COVERAGE  ⭐ the canonical getMaiaResponse lane (/api/sovereign/app/maia/list:695 → :1419), ~3,250 chars per turn; tier coverage NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: yes, ~3,250 chars/turn · SAY: constrained by the wrapper · ⚠️ CONCLUDE: constrained ONLY by that same wrapper — a model-compliance instruction, ⛔ not a structural refusal; nothing measures obedience and no test or falsifier exists]
  GOVERNANCE GATE  ⭐ `SYMBOLIC_LENS_BOUNDARY` applied at route.ts:732 (see P3-F-31) — the only real gate in Domain F. ⛔ No opt-out for astrological context was found on this path, unlike the recall preferences at route.ts:122.
  GOVERNING SOURCE  MAIA_SOVEREIGNTY_INVARIANTS.md:241-252 — Invariant 13 (Claim-Type Floor) names the wrapper as its operationalization  ·  SOURCE RECORD  F §3.1; §6; §9.3, §9.8; C-F4

ROW ID P3-F-15 · DOMAIN F · NAMED OBJECT F-15 `lib/astrology/` (~40 files)
  ARTIFACT  lib/astrology/** — the computation corpus behind F-14, F-16, F-21, F-29
  STATUS  PARTIAL  ·  ALTITUDE  EXISTS, WIRED  ·  Classification: informational · computational · interpretive
  COVERAGE  reaches the canonical lane only through P3-F-14; its other consumers are non-turn or practitioner surfaces
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: chart computation · SAY/CONCLUDE: determined by each consumer, not by the library]
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §2 F-15; §3.1, §3.5, §3.8

ROW ID P3-F-16 · DOMAIN F · NAMED OBJECT F-16 `lib/story/archetypalNarrativeService.ts` — model-authored soul story from birth chart
  ARTIFACT  lib/story/archetypalNarrativeService.ts:1-9,:5 (header disclaimer "Not prediction, but mythic framework"); app/api/astrology/narrative/route.ts:13,15,59; lib/astrology/engines/narrativeEngine.ts:3,11
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, RUNTIME-GATED (authenticated, member-scoped)
  COVERAGE  NOT APPLICABLE — a member-authenticated non-turn route
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: the member's chart · SAY: unconstrained by any prompt-level wrapper · ⭐ CONCLUDE: YES — a narrative about this member's journey; ⚠️ the disclaimer at :5 is a COMMENT addressed to developers, ⛔ not an instruction in the model's prompt — "a comment constrains a reader, a prompt constrains a generation"]
  GOVERNANCE GATE  auth + member scoping present (who invokes); ⭐ claim-type gate NONE FOUND — no `SYMBOLIC_LENS_BOUNDARY`, no Invariant-13 check in route or service
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  F §3.5; §4; §6

ROW ID P3-F-17 · DOMAIN F · NAMED OBJECT F-17 `lib/astrology/archetypeVoices.ts`, `archetypeLibrary`
  ARTIFACT  lib/astrology/archetypeVoices.ts + archetypeLibrary
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED  ·  Classification: informational · interpretive
  COVERAGE  NOT DETERMINED BY SOURCE RECORD  ·  LADDER  NOT DETERMINED BY SOURCE RECORD [three powers NOT DETERMINED BY SOURCE RECORD]
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD — ⚠️ C-F4 records that the wrapper's declared scope names "archetypes" while its wiring does not reach them
  GOVERNING SOURCE  NONE LOCATED  ·  SOURCE RECORD  F §2 F-17; C-F4

ROW ID P3-F-18 · DOMAIN F · NAMED OBJECT F-18 `lib/archetypes/MayaArchetypes.ts` (467 ln) + `ArchetypeResponseModifier.ts` (245 ln)
  ARTIFACT  `MAYA_ARCHETYPES` + `ArchetypeDetector` + `ArchetypeBlender`; exactly one importer, components/maya/PersonalityMatrix.tsx:5
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE — no route, service or conversational path imports either
  LADDER  NOT DETERMINED BY SOURCE RECORD [⚠️ `ArchetypeDetector` is concluding-SHAPED by name; ⛔ no traced path to a member turn, and the name is not evidence of capability]
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §3.6

ROW ID P3-F-19 · DOMAIN F · NAMED OBJECT F-19 `lib/archetypeEvolutionEngine.ts`
  ARTIFACT  lib/archetypeEvolutionEngine.ts:1-7,:10-17 (`ArchetypalSignature` with `confidence`, `noveltyFactor`, `evolutionPhase`), :19-27 (`EmergentPattern.possibleName` — "Maya's attempt to name the unnamed") — ⛔ 0 importers outside itself
  STATUS  ORPHANED  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE — called by nothing
  LADDER  NOT DETERMINED BY SOURCE RECORD [⭐⭐ its interfaces promise confidence scores ABOUT A PERSON; no code path consumes them — per the domain warning this proves an elaborate file exists, ⛔ evidence of neither capability nor authority]
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §3.6; §6; §11 Q8

ROW ID P3-F-20 · DOMAIN F · NAMED OBJECT F-20 `lib/symbolic/` (12 files, 3,411 ln) — `symbolicAuthorityContracts`, `crossDomainGovernance`, `promptIngressGovernance`, `journalInterpretationContracts`, `patternLedgerContracts`, `fieldSensingContracts`, `symbolicTelemetry`(+persistence, store), `presence/`
  ARTIFACT  lib/symbolic/** ; importers outside the directory are exactly two, both diagnostic: app/api/debug/symbolic-telemetry/route.ts and components/dev/SymbolicTelemetryPanel.tsx
  STATUS  DORMANT (diagnostic-reachable only)  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE — no production importer on any cognition family
  LADDER  NOT DETERMINED BY SOURCE RECORD [⭐⭐ filenames naming "authority", "governance" and "prompt ingress" are ⛔ NOT evidence that symbolic authority is governed; the finding attaches to the objects and their zero production importers, never to the word in the filename]
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §3.7; §11 Q7

ROW ID P3-F-21 · DOMAIN F · NAMED OBJECT F-21 `lib/stellium/` (10 files, 5,554 ln) — practitioner-facing chart machinery
  ARTIFACT  lib/stellium/** incl. chartAnalysis.ts (431 ln); 63 importers incl. lib/auth/practitionerAuth.tsx, lib/practitioner/sessionPrep.ts, lib/practitioner/messages.ts, lib/maia/context/buildMaiaContext.ts, ~10 app/stellium/* pages
  STATUS  PARTIAL — pages and services wired; no runtime witness  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  ⚠️ `lib/maia/context/buildMaiaContext.ts` importing `lib/stellium` is flagged by F as a POSSIBLE second symbolic entry into MAIA context, ⛔ NOT traced to a turn (Domain A/B territory) — coverage NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: chart derivations about a member, visible to a practitioner · SAY/CONCLUDE: NOT DETERMINED BY SOURCE RECORD]
  GOVERNANCE GATE  ⭐ NONE FOUND for member consent to practitioner-visible chart derivation (F §9.5); route-level gates NOT DETERMINED BY SOURCE RECORD. ⛔ Existing visibility is not treated as legitimate merely because it exists.
  GOVERNING SOURCE  NONE LOCATED — P1-GOV-ACCESS-01 territory; Domain I owns the access model  ·  SOURCE RECORD  F §3.8; §9.5; §11 Q3

ROW ID P3-F-22 · DOMAIN F · NAMED OBJECT F-22 `lib/holoflower/facets-interpretation.ts` (616 ln)
  ARTIFACT  lib/holoflower/facets-interpretation.ts — ⛔ zero consumers
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD [interpretive by classification; no traced consumer]
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §2 F-22; §3.6; §6

ROW ID P3-F-23 · DOMAIN F · NAMED OBJECT F-23 `lib/knowledge/` (24 loader files, ~6,400 ln — Jung, shamanic, depth psychology, dream, family constellation, sacred texts, PDF, MaiaSelfKnowledge)
  ARTIFACT  lib/knowledge/** ; two importers — lib/agents/PersonalOracleAgent.ts (no importer under app/) and lib/multi-tenant/TenantMAIA.ts; app/api/maia/chat/route.ts:7,26 records the PersonalOracleAgent path as RETIRED for external API calls
  STATUS  DORMANT  ·  ALTITUDE  EXISTS
  COVERAGE  NOT APPLICABLE — its consumer is unreached from app/; ⛔ recorded without inferring the corpus SHOULD be wired
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: a large wisdom corpus with no live consumer · SAY/CONCLUDE: n/a]
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §3.9; C-F6 (two distinct objects named `PersonalOracleAgent`)

ROW ID P3-F-24 · DOMAIN F · NAMED OBJECT F-24 `lib/wisdom/sacredTexts/` — Zohar, Quran, Tao, Gita + `SacredTextRegistry`, `selectSacredPassage`, `SacredEncounterService`
  ARTIFACT  lib/wisdom/sacredTexts/** incl. SacredEncounterService.ts:170 `evaluateEncounter`; app/api/oracle/conversation/route.ts:30; components/OracleConversation.tsx:65,9723 `<SacredPassageBlock />`
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  the oracle conversation path + a rendered member-facing component; ⚠️ C-F5 preserves both sides of the "~zero live traffic" claim, and ⚠️ X-DEF-2 (E's 410 finding) bears on the same route
  LADDER  NOT DETERMINED BY SOURCE RECORD [⭐ KNOW/SAY: it DECIDES whether a sacred passage meets the member (`EncounterResult | null`) · CONCLUDE: not classified concluding by F]
  GOVERNANCE GATE  ⭐ NONE FOUND — grep for consent/optIn/enabled in SacredEncounterService.ts returns no match; the only control found is the system's own judgement (the null return)
  GOVERNING SOURCE  NONE LOCATED (F §9.4)  ·  SOURCE RECORD  F §3.10; §9.4; C-F5

ROW ID P3-F-25 · DOMAIN F · NAMED OBJECT F-25 `lib/wisdom/` — QuietWisdoms, WisdomQuotes, WisdomFacets, `wisdomGraphService`, `wisdomGuidePersistence`
  ARTIFACT  lib/wisdom/** ; 7 external importers incl. app/intro/page.tsx
  STATUS  PARTIAL  ·  ALTITUDE  EXISTS, WIRED  ·  Classification: informational · memory-bearing
  COVERAGE  NOT DETERMINED BY SOURCE RECORD  ·  LADDER  NOT DETERMINED BY SOURCE RECORD [three powers NOT DETERMINED BY SOURCE RECORD]
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §2 F-25; §3.10

ROW ID P3-F-26 · DOMAIN F · NAMED OBJECT F-26 `lib/library/` — `LibraryService`, `spiralogicTagger` (513 ln)
  ARTIFACT  lib/library/** ; 9 importers incl. app/api/library/ask-jeeves/route.ts. ⚠️ `spiralogicTagger` is a Domain E boundary object, noted by F and ⛔ not classified there
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  NOT DETERMINED BY SOURCE RECORD  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §2 F-26; §3.10

ROW ID P3-F-27 · DOMAIN F · NAMED OBJECT F-27 `lib/astrology/chineseAstrology.ts`, `types/daYun.ts`, `types/vedic.ts`, BaZi
  ARTIFACT  lib/astrology/chineseAstrology.ts + type modules; BaZi tables via migration 20260130000001
  STATUS  PARTIAL  ·  ALTITUDE  EXISTS  ·  Classification: informational · computational
  COVERAGE  NOT DETERMINED BY SOURCE RECORD  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD — ⚠️ Invariant 13 names Vedic among the traditions it governs; the wrapper reaches two call sites only (C-F4)
  GOVERNING SOURCE  MAIA_SOVEREIGNTY_INVARIANTS.md:245 names Vedic; no implementing binding located  ·  SOURCE RECORD  F §2 F-27; C-F4

ROW ID P3-F-28 · DOMAIN F · NAMED OBJECT F-28 `mayanAstrology` (Mayan profile, via F-14)
  ARTIFACT  lib/astrology/mayanAstrology, computed inside maiaAstrologyContextService and carried in the same addendum at route.ts:732
  STATUS  WIRED-BUT-UNOBSERVED — in the live turn  ·  ALTITUDE  EXISTS, WIRED, GOVERNED (by the same wrapper application at :732)
  COVERAGE  the canonical getMaiaResponse lane, inside P3-F-14's addendum; tiers NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: yes, inside the ~3,250-char block · SAY: wrapper-constrained · CONCLUDE: wrapper-constrained only]
  GOVERNANCE GATE  `SYMBOLIC_LENS_BOUNDARY` at route.ts:732  ·  GOVERNING SOURCE  MAIA_SOVEREIGNTY_INVARIANTS.md:245 (Invariant 13 names Mayan)
  SOURCE RECORD  F §2 F-28; §3.1

ROW ID P3-F-29 · DOMAIN F · NAMED OBJECT F-29 `lib/soulPortrait/generator/` — `portraitPrompt.ts`, `generatePortrait.ts`
  ARTIFACT  lib/soulPortrait/generator/** , both importing lib/astrology
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED
  COVERAGE  NOT DETERMINED BY SOURCE RECORD — no turn path traced
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: chart data · SAY: NOT DETERMINED BY SOURCE RECORD · ⭐ CONCLUDE: classified interpretive AND concluding in shape by F §2 and listed in F §4's no-refusal-surface set]
  GOVERNANCE GATE  ⭐ NONE FOUND (F §4 list)  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §2 F-29; §3.5; §4

ROW ID P3-F-30 · DOMAIN F · NAMED OBJECT F-30 `lib/divination/iching/wuxing-enhanced-casting.ts`
  ARTIFACT  wuxing-enhanced-casting.ts:186 `persistReading` — one of the writers behind the readings P3-F-06 recalls
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED  ·  Classification: computational · memory-bearing
  COVERAGE  NOT DETERMINED BY SOURCE RECORD — ⚠️ the Wu Xing material in the live route (route.ts:646, the wrapper's other call site) is elemental and was left to Domain E by F §0
  LADDER  NOT DETERMINED BY SOURCE RECORD [KNOW: the cast it persists · SAY/CONCLUDE: NOT DETERMINED BY SOURCE RECORD]
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §2 F-30; §0; §3.2

ROW ID P3-F-31 · DOMAIN F · NAMED OBJECT `SYMBOLIC_LENS_BOUNDARY` (the wrapper itself)
  ARTIFACT  app/api/sovereign/app/maia/list/route.ts:282-283 — an inline `const` prompt string in a single route file; applied at exactly two call sites, :646 (Wu Xing) and :732 (astrology)
  STATUS  WIRED-BUT-UNOBSERVED  ·  ALTITUDE  EXISTS, WIRED, GOVERNED (named by Invariant 13 as its operationalization) — ⛔ NOT CI-GATED: no test, falsifier or post-generation compliance check exists
  COVERAGE  ⭐ two call sites on the canonical /list lane. ⛔ It does not reach the I Ching or Tarot that Invariant 13 names, nor archetypes or cycles, though its own first line claims six families — declared scope exceeds its wiring (C-F4).
  LADDER  NOT DETERMINED BY SOURCE RECORD [it is the one instrument in F that separates all three powers in its own text: a lens is "NOT facts, NOT predictions, NOT evidence"; "possessing a framework gives you NO grounds to assert anything about who they are, what phase they are in, or where they are heading"; "when a lens conflicts with their lived experience, their experience wins"]
  GOVERNANCE GATE  it IS the gate — ⚠️ a model-compliance instruction, ⛔ not a structural refusal; and ⛔ NONE FOUND governing the wrapper itself: no artifact states who may edit it or requires new symbolic paths to apply it
  GOVERNING SOURCE  MAIA_SOVEREIGNTY_INVARIANTS.md:245-246 (Invariant 13, Claim-Type Floor; Tier 2 hard refusal)  ·  SOURCE RECORD  F §3.1; §4; §9.7; C-F1; C-F4

ROW ID P3-F-32 · DOMAIN F · NAMED OBJECT `safe_for_retrieval`
  ARTIFACT  ⛔ ZERO matches in lib/ database/ app/ (*.ts, *.sql). Every occurrence is prose: docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md:31,100,104,132,149,169
  STATUS  DOCUMENTATION-ONLY  ·  ALTITUDE  (none — no TypeScript field, no SQL column, no index, no query, no filter)
  COVERAGE  NOT APPLICABLE — ⭐ P1-01 recorded it as the only content-suppression primitive in its slice; this census strengthens "unenforced" to **unimplemented**
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  NOT APPLICABLE (nothing to gate); ⚠️ "who may set it" remains unsettled in prose (F §9.2)
  GOVERNING SOURCE  CORPUS_DISCIPLINE_PROTOCOL_v1.0.md:104 asserts a mechanism the code does not contain (C-F2)  ·  SOURCE RECORD  F §4; §5; C-F2

ROW ID P3-F-33 · DOMAIN F · NAMED OBJECT `facetToHexagram` seed map
  ARTIFACT  ⛔ zero matches in lib/ app/ components/ database/ — it exists only as illustrative TypeScript inside docs/canon/ICHING_STRUCTURAL_ENGINE.md:134
  STATUS  DOCUMENTATION-ONLY  ·  ALTITUDE  (none)
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT APPLICABLE (no code object)  ·  GOVERNING SOURCE  NONE LOCATED — ⭐ there is no seed map in code TO have provenance; the P1-01 provenance question is now upstream of itself
  SOURCE RECORD  F §5

ROW ID P3-F-34 · DOMAIN F · NAMED OBJECT Invariant 13 Tier-2 consequential-forecast refusal
  ARTIFACT  MAIA_SOVEREIGNTY_INVARIANTS.md:246 — hard refusal for forecasts of death, illness, marriage, legal/financial outcomes "regardless of source"; ⛔ no implementing code found anywhere in Domain F
  STATUS  DOCUMENTATION-ONLY  ·  ALTITUDE  (none — canon prose only)
  COVERAGE  NOT APPLICABLE as an implemented mechanism; ⚠️ meanwhile spreads.ts:45-46 defines a `Future` position as "Likely outcome based on current trajectory"
  LADDER  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNANCE GATE  ⭐ NONE FOUND — the refusal Invariant 13 requires has no implementing mechanism
  GOVERNING SOURCE  MAIA_SOVEREIGNTY_INVARIANTS.md:246 (the governing source exists; the implementation does not)  ·  SOURCE RECORD  F §4; §5; §9.1

ROW ID P3-F-35 · DOMAIN F · NAMED OBJECT "Symbolic Guidance Layer Doctrine"
  ARTIFACT  named as a companion document at MAIA_SOVEREIGNTY_INVARIANTS.md:245 — ⛔ no file of that name found
  STATUS  UNKNOWN — named by canon, not located  ·  ALTITUDE  (none located)
  COVERAGE  NOT APPLICABLE  ·  LADDER  NOT DETERMINED BY SOURCE RECORD
  GOVERNANCE GATE  NOT APPLICABLE (artifact not located)  ·  GOVERNING SOURCE  NOT LOCATED
  SOURCE RECORD  F §10

ROW ID P3-F-36 · DOMAIN F · NAMED OBJECT alchemical stage vocabulary — `nigredo` / `albedo` / `rubedo`
  ARTIFACT  ≥10 files, ALL under lib/types/elemental/ or lib/consciousness/ (ElementalFramework, soulVocabulary, spiralogic-core, pattern-database, UnifiedSpiralogicAlchemyMap, cmPractitionerEnvironment, therapeuticFrameworks, consciousness-translation-engine, HolographicFieldIntegration, QualiaMeasurementEngine); ⛔ `lib/alchemy/` does not exist (verified by `ls`)
  STATUS  NOT DETERMINED BY SOURCE RECORD — ⛔ F deliberately did not classify it ("classifying them here would be a cross-domain claim"); reachability and governance belong to Domain E  ·  ALTITUDE  EXISTS
  COVERAGE  NOT DETERMINED BY SOURCE RECORD
  LADDER  NOT DETERMINED BY SOURCE RECORD [⭐ the finding is the LOCATION: alchemy is not an independent symbolic system at this subject, it is vocabulary embedded in elemental objects]
  GOVERNANCE GATE  NOT DETERMINED BY SOURCE RECORD  ·  GOVERNING SOURCE  NONE LOCATED
  SOURCE RECORD  F §7; §10
