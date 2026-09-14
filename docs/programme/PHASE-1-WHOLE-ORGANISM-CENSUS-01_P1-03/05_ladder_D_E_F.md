# P1-03 · BOUNDED LADDER-DERIVATION PASS — DOMAINS D · E · F (111 rows)

```text
STEP        P1-03 · ladder recovery, Amendment 2 Ruling 1, refined by Amendment 3
SLICE       D 46 · E 29 · F 36
INPUTS      02_normalized_D_E_F.md · P1-02/D_field.md · E_spiralogic_elemental.md · F_symbolic.md
BOUND BY    INF-1…INF-6 · quote-or-UNKNOWN · Amendment 3 (orthogonal axes, renamed inventory)
⛔ NOT READ  source code · governing documents · tests · runtime witnesses · sibling evidence
```

## 0 · How to read a row (Amendment 3 §4 return shape)

```text
ROW             row id · named object as the register carries it
PARTICIPATION   EXISTS · PARTICIPATES · KNOWS · CONSIDERS · CONTRIBUTES · DECIDES · UNKNOWN
BASIS           the exact sentence or clause, quoted, + the record file it comes from
AUTHORITY       GOVERNED · NONE LOCATED · UNKNOWN   (⭐ a SECOND axis, never a rung)
```

⛔ `HAS AUTHORITY` is **not** assigned anywhere in this pass. Per Amendment 3 §2 it has left the
ladder; authority is read from authorization text or not at all.

### 0a · ⭐ The two assignment criteria, declared so they can be subtracted

```text
EXPLICIT    the record used ladder vocabulary about that object.
            Sources: D_field.md §6 ans.4 · F_symbolic.md §3.3.

CRITERION   the record states in its own words that the object's value is appended to /
            interpolated into / injected into MAIA's prompt on a real turn.
            The rung name comes from D's own equation, quoted once here and not re-derived:
            ⭐ "(a)–(d) CONTRIBUTE to what MAIA says … (a)–(d) sit at CONTRIBUTES"
            — D_field.md §6 ans.4.
```

⭐ `EXISTS` is assigned **only** where a record explicitly states the object exists **and**
explicitly determines it does not reach cognition or a member surface — the record's own
participation status (`DORMANT` / `ORPHANED`, F §2's column is headed *"Participation status"*;
D §6 ans.2 says *"In participation vocabulary: … ~11 DORMANT · 5 ORPHANED"*). ⛔ It is never a
default for "a file is there."

⛔ Where two records disagree, both sides are preserved in §Disagree and the row is `UNKNOWN`.

---

## DOMAIN D — FIELD INTELLIGENCE (46 rows)

ROW P3-D-01 · D-OBJ-1 `FieldContext` seam
  PARTICIPATION CONTRIBUTES (explicit)
  BASIS "(a)–(d) **CONTRIBUTE** to what MAIA says … (a)–(d) sit at CONTRIBUTES" — D_field.md §6 ans.4, paths (a) `maiaService.ts:1521 → :1534` FAST and (b) `:1946 → :1962` CORE
  AUTHORITY NONE LOCATED — "P1-D-GOV-01 The canonical field seam (D-OBJ-1) has no governance gate of any kind" (D §7)

ROW P3-D-02 · D-OBJ-2 PFI mind state `generatePFIMindState`
  PARTICIPATION CONTRIBUTES (criterion) — via path (b) only; path (a) is flag-blocked
  BASIS "SURFACED WHERE Into D-OBJ-1's FieldContext.pfi { element, coherence, fieldWorkSafe, realm, deepWorkRecommended } → prompt." — D_field.md §2 D-OBJ-2
  AUTHORITY NONE LOCATED — "PARTIAL / DEFEATED IN ONE PATH" (D §2); GOVERNING SOURCE NONE LOCATED

ROW P3-D-03 · D-OBJ-3 `ResonanceFieldGenerator`
  PARTICIPATION CONTRIBUTES (criterion)
  BASIS "SURFACED WHERE FieldContext.resonance → \"[Field Intelligence]\" prompt JSON." — D_field.md §2 D-OBJ-3
  AUTHORITY NONE LOCATED — "GOVERNANCE GATE ⛔ NONE FOUND" (D §2 D-OBJ-3)

ROW P3-D-04 · D-OBJ-4 `UnifiedElementalFieldCalculator`
  PARTICIPATION CONTRIBUTES (criterion)
  BASIS "SURFACED WHERE FieldContext.unified → prompt JSON (D-OBJ-1:44-49)" — D_field.md §2 D-OBJ-4
  AUTHORITY NONE LOCATED — "GOVERNANCE GATE ⛔ NONE FOUND"

ROW P3-D-05 · D-OBJ-5 `routePanconsciousField` → `FieldRoutingDecision`
  PARTICIPATION UNKNOWN — the record expressly places the position on the enforcement object, not the classifier
  BASIS "(e) is the only object in Domain D at HAS AUTHORITY" names D-OBJ-6; D-OBJ-5's own output is "attached to `(meta as any).fieldRouting` (:2216)" — D_field.md §6 ans.4, §2 D-OBJ-5+6. AMBIGUOUS
  AUTHORITY NONE LOCATED — "P1-D-GOV-02 … no ratified document authorizing realm-based refusal was located" (D §7)

ROW P3-D-06 · D-OBJ-6 `enforceFieldSafety` → `FieldSafetyDecision` ⭐⭐ THE SHARPEST INF-6 TEST IN THIS SLICE
  PARTICIPATION DECIDES (explicit)
  BASIS "(e) is categorically different: it **DECIDES**, and its text **replaces** MAIA's." — D_field.md §6 ans.4. Mechanism quoted: "SURFACED WHERE ⭐⭐ DIRECTLY AS MAIA'S ANSWER ON REFUSAL. maiaService.ts:2848 — `const text = fieldSafety.message ?? …` returned before the turn reaches a model." — D §2 D-OBJ-5+6
  AUTHORITY NONE LOCATED — "P1-D-GOV-02 Field safety (D-OBJ-6) can REFUSE a member's turn and substitute its own text (maiaService.ts:2848). **No ratified source authorizing realm-based refusal was located.** The in-source \"H2\"/\"W2\" commentary is a citation, not a located source." (D §7)
  ⭐ INF-6 PREVENTION, RECORDED
      DECIDES established
      HAS AUTHORITY not established
      INF-6 prevents promotion
  ⚠️ THE RECORD ITSELF MADE THE PROHIBITED PROMOTION, AND IT IS PRESERVED, NOT CARRIED:
      D_field.md §6 ans.4 continues "(e) is the only object in Domain D at HAS AUTHORITY."
      ⛔ That sentence derives authority from the effect it had just described, with the same
      record's §7 recording that no authorizing source was located. Per INF-6 and Amendment 3 §2
      it is quoted here as evidence and ⛔ is NOT carried as an authority standing.
      ⛔ And "no authorization located" is ⛔ NOT "proved unauthorized" (Amendment 3 §1).

ROW P3-D-07 · D-OBJ-7 `analyzeFieldIntelligence` (Talk Mode field intelligence)
  PARTICIPATION UNKNOWN — RECORDS DISAGREE (X-DEF-1; both sides quoted in §Disagree)
  BASIS D assigns "(c) … CONTRIBUTES"; E states "SURFACED WHERE ⛔ NOWHERE." ⛔ Not derived across.
  AUTHORITY NONE LOCATED — "GOVERNANCE GATE ⛔ NONE FOUND" (D §2 D-OBJ-7)

ROW P3-D-08 · D-OBJ-8 `logFieldOrchestratorTelemetry` + `field_orchestrator_telemetry`
  PARTICIPATION UNKNOWN — SILENT on any participation position; the record states only a write and an admin read
  BASIS "SURFACED WHERE Admin Command Center only. ⛔ Not member-facing." — D_field.md §2 D-OBJ-8
  AUTHORITY NONE LOCATED — "P1-D-GOV-04 … no consent gate traced and no member read path" (D §7)

ROW P3-D-09 · D-OBJ-9 `getFieldContext` / `buildFieldContextPromptBlock` (vault-backed)
  PARTICIPATION UNKNOWN — RECORDS DISAGREE (X-DEF-2, the status of `app/api/oracle/conversation/route.ts`)
  BASIS D treats that route as "the second cognition path"; E records "an unconditional HTTP 410 at `:446-453`". ⛔ Not derived across.
  AUTHORITY NONE LOCATED as a governing source; ⭐ the gate itself is "PRESENT AND NAMED: … `MAIA_FIELD_CONTEXT_ENABLED === 'true'`" (D §3) — INF-3: selection authorizes nothing

ROW P3-D-10 · D-OBJ-10 `coherenceFieldService` + `coherence_field_readings`
  PARTICIPATION UNKNOWN — RECORDS DISAGREE twice (X-DEF-2 route status; CONTRA-2 "no live consumer wired")
  BASIS D assigns "(d) … CONTRIBUTES" via `route.ts:2787`; E's 410 finding and `substrateMap.ts:383-391` "consumers: [] … Service preserved; no live consumer wired" stand against it. ⛔ Not derived across.
  AUTHORITY NONE LOCATED — "P1-D-GOV-03 … No source ruling that a computed coherence score may confer an award was located" (D §7)

ROW P3-D-11 · D-OBJ-11 `fireAndForgetFieldMonitor` + `field_monitor_turns`
  PARTICIPATION UNKNOWN — SILENT; a per-turn write on the voice path, no participation statement
  BASIS "CALL PATH app/api/voice/stream-conversation/route.ts:82 … ⭐ the VOICE path, not the canonical text path." — D_field.md §3 D-OBJ-11
  AUTHORITY NONE LOCATED (P1-D-GOV-04)

ROW P3-D-12 · D-OBJ-12 `QuantumFieldMemory`
  PARTICIPATION EXISTS
  BASIS "**DORMANT** (module resolvable; no reachable entry point)" — D_field.md §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-13 · D-OBJ-13 `ConsciousnessField` engine
  PARTICIPATION EXISTS
  BASIS "value-importers `app/api/maia/memory-enhanced-response/route.ts` (0 callers) and `route.enhanced.backup.ts` … DORMANT" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-14 · D-OBJ-14 `MAIAFieldInterface`
  PARTICIPATION UNKNOWN — AMBIGUOUS: a status word is given but reachability is expressly referred elsewhere, and C-F6 records two different objects bearing the deciding importer's name
  BASIS "DORMANT (PersonalOracleAgent reachability → Domain A)" — D §4.1; "⛔ which of the two objects those citations mean is NOT DETERMINED BY SOURCE RECORD" — register, vocabulary collisions
  AUTHORITY NONE LOCATED

ROW P3-D-15 · D-OBJ-15 `ElementalFieldIntegration`
  PARTICIPATION EXISTS
  BASIS "6 importers, all inside the same dormant cluster or 0-caller routes … DORMANT" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-16 · D-OBJ-16 `ElementalInterferenceMonitor`
  PARTICIPATION EXISTS
  BASIS "2 importers, both intra-cluster … DORMANT" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-17 · D-OBJ-17 `QuantumFieldPersistence`
  PARTICIPATION EXISTS
  BASIS "only importers are the two 0-caller routes … DORMANT" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-18 · D-OBJ-18 `EnhancedMAIAFieldIntegration`
  PARTICIPATION EXISTS
  BASIS "3 importers: `spiral-aware-response.ts`, `enhanced-consciousness/route.ts` (0 callers), backup file … DORMANT" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-19 · D-OBJ-19 `ResonanceFieldOrchestrator` (A) lib/field
  PARTICIPATION EXISTS
  BASIS "⛔ **0 external importers** — `getResonanceOrchestrator()` (`:779`) is never called outside the file … **ORPHANED**" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-20 · D-OBJ-20 `ResonanceFieldOrchestrator` (B) lib/oracle
  PARTICIPATION EXISTS
  BASIS "imported only by `lib/oracle/HybridSystemToggle.ts:7,43,49`, which itself has **0 importers**, and by a test … **ORPHANED**" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-21 · D-OBJ-21 `MaiaFieldOrchestrator`
  PARTICIPATION EXISTS
  BASIS "only `lib/integration/MaiaCrystalBridge.ts:11,83`, which has 1 importer … DORMANT" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-22 · D-OBJ-22 `FieldIntelligenceSystem` / `RelationalField`
  PARTICIPATION EXISTS
  BASIS "4 value importers, all within the dormant `maia-consciousness-lattice` cluster … DORMANT" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-23 · D-OBJ-23 `MAIAFieldAwareness`
  PARTICIPATION EXISTS
  BASIS "single importer `lib/maia-consciousness-lattice.ts:10`, itself with no route consumer … DORMANT" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-24 · D-OBJ-24 `FieldCoherenceTensor` + `fieldIntegrityValidation`
  PARTICIPATION EXISTS
  BASIS "⛔ **type-only import** by `fieldIntegrityValidation.ts:13`; that file has **0 importers** … **ORPHANED**" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-25 · D-OBJ-25 `FieldAnalytics`
  PARTICIPATION EXISTS
  BASIS "⛔ **0 importers** … **ORPHANED**" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-26 · D-OBJ-26 `ParallelFieldProcessor` + `fieldProtocol/{validation,storage}`
  PARTICIPATION EXISTS
  BASIS "4 importers … — no route reached … DORMANT" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-27 · D-OBJ-27 `FieldRecordsService` / `FieldRecordsRepo` + `field_records`
  PARTICIPATION UNKNOWN — AMBIGUOUS: the row carries two statuses and no participation position
  BASIS "**PARTIAL** — repo path WIRED-BUT-UNOBSERVED; service layer ORPHANED" — D §4.1
  AUTHORITY NONE LOCATED

ROW P3-D-28 · D-OBJ-28 `neuropodEligibility`, `energyState`
  PARTICIPATION EXISTS
  BASIS "`neuropodEligibility` **0 importers**; `energyState` 1 … ORPHANED / DORMANT" — D §4.1 (⛔ the pair is kept as the record kept it)
  AUTHORITY NONE LOCATED

ROW P3-D-29 · D-OBJ-29 "Fields" collaborative workspace
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION
  BASIS "out of D's substantive scope; enumerated to prevent conflation" — D §4.2; "Project/decision/kanban workspace … **this**, not field intelligence"
  AUTHORITY UNKNOWN — "per-slug route auth (not read here)"

ROW P3-D-30 · D-OBJ-30 "Living Field"
  PARTICIPATION UNKNOWN — SILENT on cognition participation; D found no field-intelligence quantity
  BASIS "NO field-intelligence number found" — D §4.2 (status "WIRED (Domain B/C overlap)")
  AUTHORITY UNKNOWN — "`living_field_participant_consents` table exists … its enforcement NOT traced here"

ROW P3-D-31 · D-OBJ-31 "Field Lab" experiment shelf
  PARTICIPATION UNKNOWN — SILENT; a member surface that displays no field value
  BASIS "Experiment shelf; header … an explicit anti-gamification invariant | Yes (`/maia/field-lab`) | NO" — D §4.2
  AUTHORITY NONE LOCATED

ROW P3-D-32 · D-OBJ-32 `/field/*` voice-first conversation surface
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION
  BASIS "naming collision only" — D §4.2
  AUTHORITY NONE LOCATED

ROW P3-D-33 · D-OBJ-33 "Practice Field"
  PARTICIPATION UNKNOWN — the record expressly defers
  BASIS "noted, not censused here"; gate "not traced (Domain I)" — D §4.2
  AUTHORITY UNKNOWN

ROW P3-D-34 · D-OBJ-34 "Wisdom Field" circles + `WISDOM_FIELD_MOVES`
  PARTICIPATION UNKNOWN — its only traced consumption sits inside the block whose surfacing is disputed (X-DEF-1)
  BASIS "`WISDOM_FIELD_MOVES` consumed at `maiaService.ts:1083,1091`" — D §4.2; those lines are inside D-OBJ-7's Talk-Mode assembly, which E records as "SURFACED WHERE ⛔ NOWHERE"
  AUTHORITY NONE LOCATED

ROW P3-D-35 · D-OBJ-35 Field Coherence Index dashboard + `/api/field-analytics/report`
  PARTICIPATION UNKNOWN — SILENT on cognition; the record's finding is about the number's provenance
  BASIS "⛔ **NO — gated.** … the file states \"⛔ Lab Tools is NOT a member surface.\"" — D §4.2; §4.3 "renders `0.5 → \"50%\"` … with nothing distinguishing the fallback from a measurement"
  AUTHORITY NONE LOCATED — "P1-D-GOV-05 … whether it reaches this object is a scope question a worker may not answer"

ROW P3-D-36 · D-OBJ-36 `/labtools/coherence` breath/HRV tool
  PARTICIPATION UNKNOWN — SILENT
  BASIS "NO (lab-gated) | shows a **somatic** shift, unrelated to any other \"coherence\" here" — D §4.2
  AUTHORITY NONE LOCATED (the gate found is `requireLabAccess()`, an access gate)

ROW P3-D-37 · D-OBJ-37 `rhythmCoherence` overlay in the member conversation component
  PARTICIPATION UNKNOWN — the record states five facts and expressly withholds the determination
  BASIS "⛔ This record does not assert that a member sees it, and does not assert the code is unauthorized. It records what the code does." — D §4.4
  AUTHORITY NONE LOCATED — "⛔ NONE FOUND"; P1-D-GOV-05's scope question "is a P1-04 question, not a worker's"

ROW P3-D-38 · D-OBJ-38 `/labtools/relational-field`
  PARTICIPATION UNKNOWN — SILENT
  BASIS "NO (lab-gated) | NO" — D §4.2
  AUTHORITY NONE LOCATED

ROW P3-D-39 · D-OBJ-39 `/api/maia/field` "field perception bundle"
  PARTICIPATION EXISTS
  BASIS "⚠️ **0 in-repo callers** — ORPHANED by its own header's determination" — D §4.2
  AUTHORITY NONE LOCATED (a self-only access gate is recorded, not an authorization)

ROW P3-D-40 · D-OBJ-40 `ResonanceEngine` + `resonanceHysteresis`, `resonance-map`
  PARTICIPATION UNKNOWN — the record withheld a status word
  BASIS "⚠️ 13 importers, but **11 import only the `Element` type**" — D §4.2
  AUTHORITY NONE LOCATED

ROW P3-D-41 · `RFI` (named term)
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION (no code object to place)
  BASIS "**Finding: at the census subject, neither RFI nor UFI names any code object.**" — D §5.4
  AUTHORITY NONE LOCATED

ROW P3-D-42 · `UFI` (named term)
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION
  BASIS "exactly ONE hit, a comment … \" *   UFI = field assembly (not used here)\"" — D §5.4
  AUTHORITY NONE LOCATED

ROW P3-D-43 · `FIS Field State Primitive`
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION (no implementing code object)
  BASIS self-declared "interface target — no runtime authority yet"; "nearest artifact … does NOT match its six-dimension shape" — D §9
  AUTHORITY NONE LOCATED — ⭐ the canon document is located and itself declares no runtime authority

ROW P3-D-44 · `COLLECTIVE_FIELD_SERVICE_URL` service on :3010
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION (artifact not found)
  BASIS "**That variable appears nowhere else in the repository**" — D §4.3
  AUTHORITY NONE LOCATED

ROW P3-D-45 · `maia-mcp/server.ts` (`get_member_field`)
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION (artifact absent from this repository)
  BASIS named only by a route header "which itself records the artifact as absent from this repository" — register, D §9
  AUTHORITY NONE LOCATED

ROW P3-D-46 · table `field_state_snapshots`
  PARTICIPATION EXISTS
  BASIS "table exists; ⛔ no writer or reader traced in lib/** or app/**" — D §9
  AUTHORITY NONE LOCATED

---

## DOMAIN E — SPIRALOGIC / ELEMENTAL (29 rows)

⚠️ **E assigns no ladder position anywhere** (it uses a *vocabulary vs executable* axis and asks in
Q1 whether *EXISTS ≠ PARTICIPATES* even holds at its scale). Every position below is therefore
CRITERION-based or an EXISTS drawn from E's own explicit non-participation determination.
⛔ Nothing here is manufactured from a status word alone.

ROW P3-E-01 · `SPIRALOGIC_REFERENCE` constant
  PARTICIPATION EXISTS
  BASIS "SURFACED WHERE NONE … CURRENT STATUS ORPHANED (vocabulary)"; "⭐ **Zero importers**" — E §2, §1 Q1
  AUTHORITY NONE LOCATED (UG-E7)

ROW P3-E-02 · `ConversationElementalTracker` → `context.summary` → system prompt
  PARTICIPATION CONTRIBUTES (criterion)
  BASIS "SURFACED WHERE ⭐ the PROMPT. maiaService.ts:1781 sets context.summary = `Conversation: ${dominantElement} element, N turns` → lib/sovereign/maiaVoice.ts:277 \"Previous conversation context: ${context.summary}\"" — E §3.1; and "a member-derived elemental label reaching MAIA's system prompt on every CORE and DEEP turn"
  AUTHORITY NONE LOCATED — "GOVERNANCE GATE ⭐ NONE FOUND. No env flag, no consent check, no Sanctuary branch at the injection site." (E §3.1; UG-E2)

ROW P3-E-03 · `ElementalOracleBridge` → `elementalResult.dominant` → `[Field Intelligence]`
  PARTICIPATION CONTRIBUTES (criterion) — CORE only
  BASIS "SURFACED WHERE ⭐ CORE only: maiaService.ts:1957 element: elementalResult?.dominant → … → maiaService.ts:1962 adaptivePrompt += \"\\n\\n[Field Intelligence]\\n{json}\"" — E §3.2
  AUTHORITY NONE LOCATED for the computation — "⛔ No gate on the element computation itself" (E §3.2); the Sanctuary gate on the FieldContext is recorded and is not an authorization

ROW P3-E-04 · Talk-mode `fieldAwareness` block
  PARTICIPATION UNKNOWN — RECORDS DISAGREE (X-DEF-1)
  BASIS E: "SURFACED WHERE ⛔ NOWHERE. grep -n fieldAwareness → exactly 1079, 1094, 1198." vs D: "SURFACED WHERE ⭐ INTO THE PROMPT as a labelled block". ⛔ Not derived across.
  AUTHORITY NONE LOCATED — the env flag and mode condition "select the computation (INF-3: selection authorizes nothing)"

ROW P3-E-05 · `member_spiral_state` substrate + `upsertSpiralState`
  PARTICIPATION UNKNOWN — the record splits the row and one half is disputed (X-DEF-2)
  BASIS E: the sole writer sits "BELOW the unconditional 410 at :446-453"; D treats the same route as "the second cognition path". The read half's prompt-reach is carried by P3-E-06, not by this row. AMBIGUOUS + RECORDS DISAGREE
  AUTHORITY NONE LOCATED (UG-E3: "no ratified definition of what integer 1..12 denotes")

ROW P3-E-06 · reader 1 — Living Field encounter/refine context
  PARTICIPATION CONTRIBUTES (criterion)
  BASIS "⭐ **renders it into the prompt**: `:196-198` `Spiral state: element=…, phase=…, motion=…` inside `gatheredMaterial`" — E §4.2 row 1 (routes `…/encounter/route.ts:19`, `…/refine/route.ts:9`; ⛔ not the disputed route)
  AUTHORITY NONE LOCATED
  ⚠️ CARRIED, NOT RESOLVED: E §12 Q5 — "Rows written before the oracle lane's retirement are being read today as if current."

ROW P3-E-07 · reader 2 — `MemberLiveContext.spiralState`
  PARTICIPATION EXISTS
  BASIS "loads into `ctx.spiralState`; ⛔ `formatMemberWebForPrompt` (`:436`) contains **no** spiral/element/phase reference — loaded, not rendered" — E §4.2 row 2
  AUTHORITY UNKNOWN — gate NOT DETERMINED BY SOURCE RECORD

ROW P3-E-08 · reader 3 — `GET /api/members/spiral-state`
  PARTICIPATION UNKNOWN — a disclosure route; the record states no participation position in cognition
  BASIS "returns `currentElement`, `phase`, `motion`, ⚠️ `relationalPhase`, ⚠️ `autonomyStreak` to the authenticated member" — E §4.2 row 3
  AUTHORITY NONE LOCATED — "the two inferred fields are returned with no admission step equivalent to R16" (UG-E4; C-E7)

ROW P3-E-09 · reader 4 — research metric aggregates
  PARTICIPATION UNKNOWN — SILENT
  BASIS "aggregate counts by `dominant_element` and by `phase`" — E §4.2 row 4
  AUTHORITY UNKNOWN

ROW P3-E-10 · `admitPersistedStateForShaping` — Refusal R16
  PARTICIPATION UNKNOWN — RECORDS DISAGREE (X-DEF-2: its sole caller's reachability)
  BASIS E: "SOLE CALLER app/api/oracle/conversation/route.ts:1711 — ⛔ BELOW THE 410"; D treats that route as a live cognition path. ⛔ Not derived across.
  AUTHORITY NONE LOCATED — ⭐ but note the asymmetry the register recorded: "Refusal R16, law quoted in-file at :5-8; ⛔ no external ratified document cited by E". A named, tested refusal whose ratified source is not located.

ROW P3-E-11 · `lib/voice/conductor.ts` hysteresis / `scoreRoute` / `normalizePhase`
  PARTICIPATION UNKNOWN — its recorded dormancy rests on the disputed 410 (X-DEF-2)
  BASIS "NOT APPLICABLE — its write target (P3-E-05) has no reachable caller" — register; that claim is E's, and D disputes the route's status
  AUTHORITY UNKNOWN

ROW P3-E-12 · Corpus Callosum trace — `corpusCallosumService` + `agent_runs` / `integration_passes`
  PARTICIPATION EXISTS
  BASIS "CURRENT STATUS WIRED-BUT-UNOBSERVED (write); ⛔ **NOT participating in cognition**" and "LOADED WHERE ⛔ NOT loaded back into any turn. No reader of agent_runs feeds cognition." — E §5
  AUTHORITY NONE LOCATED (UG-E6) — the Sanctuary refusal is a gate, ⛔ not an authorization; `CORPUS_CALLOSUM_ENABLED` is config selection (INF-3)

ROW P3-E-13 · second Corpus Callosum lane — `maiaOrchestrator` agent rows
  PARTICIPATION UNKNOWN — SILENT; an inherited zero-rows claim is expressly left unverified
  BASIS "Sole importer: `app/api/between/chat/route.ts:18`. Status **WIRED-BUT-UNOBSERVED** at the subject." — E §5.3
  AUTHORITY UNKNOWN

ROW P3-E-14 · canonical route's own `logAgentRun` (`interruption-ledger`)
  PARTICIPATION UNKNOWN — SILENT
  BASIS "its **only** call is `:1638` with `agentName: 'interruption-ledger'` — ⛔ **not an elemental voice.**" — E §5.4
  AUTHORITY UNKNOWN

ROW P3-E-15 · `VoiceDistinctionScorer.scoreFirewallIntegrity`
  PARTICIPATION EXISTS
  BASIS "\"observability-only collapse detector … No behavior / prompt / schema impact\", and its result is emitted only as a `console.log`" — E §5.1 fact 3
  AUTHORITY NONE LOCATED

ROW P3-E-16 · per-phase modality selection — `FRAMEWORK_REGISTRY` + `chooseFrameworksForCell`
  PARTICIPATION EXISTS
  BASIS "Both non-test call sites pass **no opts** … so `enabledApplied` defaults to `[]` (`:1579`) and **no applied modality can ever be selected**." — E §1 Q5. ⭐ This basis is independent of X-DEF-2: it holds at BOTH call sites, one of which (`app/api/maia/spiralogic/route.ts:89`) is not the disputed route.
  AUTHORITY NONE LOCATED — "⭐ NONE FOUND — no consent gate, no disclosure, no refusal surface on modality selection; the empty default is a code default, ⛔ not a gate" (UG-E1, named by P1-01 the highest-consequence unlocated gap)
  ⚠️ "per the same constraint, its inertness is not a ruling that it is safe" (E §1 Q5)

ROW P3-E-17 · `spiralConstellationService`
  PARTICIPATION UNKNOWN — the record states the runtime outcome is unknown
  BASIS "⛔ whether they error, return empty, or are dead at runtime is UNKNOWN" — register/E §7.2-7.3; "`prisma.spiralProcess` has no declared model among 53" (C-E8)
  AUTHORITY UNKNOWN

ROW P3-E-18 · `CrossSpiralPatternRecognizer` + `TriadicPhaseDetector`
  PARTICIPATION EXISTS
  BASIS "1 importer each, `lib/ain/AINSpiralogicBridge.ts:22,23` (types only) … DORMANT / orphaned as recorded" — E §7.3, §8.1
  AUTHORITY NONE LOCATED

ROW P3-E-19 · `PhaseDetector` / type `SpiralogicPhase`
  PARTICIPATION UNKNOWN — the record determines only canonical-lane absence
  BASIS "⛔ none of its consumers is on the `getMaiaResponse` lane" — E §8.1-8.2 (⚠️ and `SpiralogicPhase` "is **an ELEMENT NAME, not a phase at all**")
  AUTHORITY UNKNOWN

ROW P3-E-20 · `lib/spiralogic/` zero-importer mass
  PARTICIPATION EXISTS
  BASIS "~110 KB, 0 importers each" — E §8.1 table; status "DORMANT (vocabulary)"
  AUTHORITY UNKNOWN

ROW P3-E-21 · `lib/spiralogic/core/spiralogic-engine.ts` (+ `core/spiralProcess.ts`)
  PARTICIPATION UNKNOWN — SILENT on any prompt or member reach
  BASIS "WIRED-BUT-UNOBSERVED (engine) · VOCABULARY (`spiralProcess`)"; the vault adapter "declares it does NOT call `enterSpiral`" — E §8.1
  AUTHORITY UNKNOWN

ROW P3-E-22 · `lib/elemental-agents/{fire,water,earth,air,aether}-agent.ts`
  PARTICIPATION EXISTS
  BASIS "importers … — ⛔ none on the canonical lane … DORMANT" — E §8.3
  AUTHORITY UNKNOWN

ROW P3-E-23 · `lib/elemental-alchemy/` practices
  PARTICIPATION UNKNOWN — an import is traced; surfacing is not stated
  BASIS "WIRED (practice content, not phase logic)"; "tier and surfacing NOT DETERMINED BY SOURCE RECORD" — E §8.3 / register
  AUTHORITY UNKNOWN

ROW P3-E-24 · `lib/aether-facets.ts` (+ `lib/elemental-oracle/blueprint-integration.ts`)
  PARTICIPATION EXISTS
  BASIS "lib/aether-facets.ts — ⛔ 0 importers … ORPHANED (aether-facets) · DORMANT (elemental-oracle blueprint)" — E §8.3 (⛔ the pair is kept as the record kept it)
  AUTHORITY UNKNOWN

ROW P3-E-25 · `bead_events.spiralogic_element` → `getConsciousnessPolicy`
  PARTICIPATION UNKNOWN — AMBIGUOUS: "carried into awareness-level guidance" names neither a prompt nor a member surface
  BASIS "READ by lib/sovereign/maiaService.ts:455-461 (getConsciousnessPolicy, 30-day window) → policy.dominantElement logged :801 and carried into awareness-level guidance" — E §8.4
  AUTHORITY NONE LOCATED — "⛔ NONE FOUND" (UG-E5)

ROW P3-E-26 · Prisma `model ElementalState` + `model ElementalEvolution`
  PARTICIPATION UNKNOWN — the record expressly declines
  BASIS "Preserved as a finding; ⛔ not adjudicated." — E §8.4
  AUTHORITY UNKNOWN

ROW P3-E-27 · `member_spiral_state.facet_id` / `facet_movement`
  PARTICIPATION UNKNOWN — its recorded dormancy depends on the disputed writer claim (X-DEF-2)
  BASIS "(UPDATE only; \":82 We don't create rows\" — depends on a writer that no longer runs)" — E §8.4
  AUTHORITY UNKNOWN

ROW P3-E-28 · the S-16 12-phase document vocabulary
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION (no code object)
  BASIS "⛔ **0 code hits** for four of them" — E §11 table
  AUTHORITY NONE LOCATED — "the naming documents carry no status" (UG-E7)

ROW P3-E-29 · `lib/spiralogic/registration/` — the chart-to-elemental grammar
  PARTICIPATION UNKNOWN — the record determines backing, not participation
  BASIS "the one chart-to-elemental grammar with ratified backing" — E §8.1; coverage "NOT DETERMINED BY SOURCE RECORD"
  AUTHORITY ⭐ GOVERNED — "the only Spiralogic artifact E found with ratified backing (P1-01; UG-E7)"
  ⭐ This is Amendment 3 §2's third coherent combination, present in this slice: PARTICIPATION UNKNOWN + AUTHORITY GOVERNED. ⛔ Not a hole to be filled.

---

## DOMAIN F — SYMBOLIC SYSTEMS (36 rows)

⛔ **KNOW / SAY / CONCLUDE are NOT ladder positions** (Amendment 3 §3). `CONCLUDING-CAPABLE = yes`
establishes none of DECIDES, CONTRIBUTES, MEMBER-FACING, PERSISTED or AUTHORIZED. Where F
established only an F-power, PARTICIPATION is `UNKNOWN` and the F-power is recorded in the BASIS
line and again in the F-POWER section below.

ROW P3-F-01 · F-01 `lib/iching/`
  PARTICIPATION UNKNOWN — F-POWER ONLY (KNOW: corpus data)
  BASIS "informational · computational | WIRED-BUT-UNOBSERVED" — F §2
  AUTHORITY UNKNOWN

ROW P3-F-02 · F-02 `lib/divination/iching/`
  PARTICIPATION UNKNOWN — F-POWER ONLY (KNOW: house corpus, reaching a turn only via F-06's copy-at-write-time)
  BASIS "informational · computational · memory-bearing | WIRED-BUT-UNOBSERVED" — F §2
  AUTHORITY UNKNOWN

ROW P3-F-03 · F-03 `lib/divination/tarot/`
  PARTICIPATION UNKNOWN — F-POWER ONLY (⚠️ CONCLUDE: forecast-shaped BY DATA STRUCTURE)
  BASIS "a `Future` position defined as \"Likely outcome based on current trajectory\" is a forecast SLOT, not merely a possible output" — register/F §3.4, C-F3
  AUTHORITY NONE LOCATED — "MAIA_SOVEREIGNTY_INVARIANTS.md:246 names Tarot in Tier 2 — ⛔ no implementing mechanism found"

ROW P3-F-04 · F-04 `lib/divination/runes/`
  PARTICIPATION UNKNOWN — F-POWER ONLY (KNOW: rune corpus; CONCLUDE not determined)
  BASIS "informational · interpretive · computational | WIRED-BUT-UNOBSERVED" — F §2
  AUTHORITY UNKNOWN

ROW P3-F-05 · F-05 `lib/divination/core/oracle-engine.ts`
  PARTICIPATION UNKNOWN — SILENT
  BASIS "computational · interpretive | WIRED-BUT-UNOBSERVED" — F §2
  AUTHORITY UNKNOWN

ROW P3-F-06 · F-06 `divinationRecallLoader`
  PARTICIPATION CONTRIBUTES (criterion)
  BASIS "SURFACED WHERE route.ts:1105-1111 — three separate addenda + [MAIA] divination-block marker"; "A member's own durable I Ching readings are made available to the ordinary `/list` conversation." — F §3.2
  AUTHORITY NONE LOCATED — "the loader header's declared authority chain and the pdc-1 conflation prohibition it cites; ⛔ no P1-01 governing source named" (register). ⭐ Gates are multiple, structural and TESTED — ⛔ a gate is not an authorization.
  ⚠️ INF-1 HELD: "a dated production record exists, a complete path is traced, and the witness says the block produced **nothing**. ⛔ That is not `LIVE`" (F §3.2). CONTRIBUTES here names the traced prompt-reach, ⛔ not observed output.
  F-POWER carried: KNOW bounded · SAY gated · ⭐⭐ CONCLUDE "structurally refused"

ROW P3-F-07 · F-07 `POST /api/changes/[id]/interpret`
  PARTICIPATION ⭐ PARTICIPATES (explicit)
  BASIS "Per the instrument's preserved distinctions: authentication establishes `PARTICIPATES`, not `HAS AUTHORITY`." — F_symbolic.md §3.3
  AUTHORITY NONE LOCATED — "**GOVERNANCE GATE** — ⭐ **`NONE FOUND`** … they gate *who may invoke*, never *what may be claimed*" (F §3.3)
  ⭐ INF-6 PREVENTION, RECORDED
      PARTICIPATES established
      HAS AUTHORITY not established — ⭐ the record says so in the same sentence
      INF-6 prevents promotion
  F-POWER carried: ⭐⭐ CONCLUDE "yes, and instructed to" (`reading` · `guidance` · `warnings` · `timing` · `relatingReading`), and the conclusion is PERSISTED at `:159` with no author-class column. ⛔ None of that is a ladder position.

ROW P3-F-08 · F-08 `POST /api/studio/changes/[id]/interpret`
  PARTICIPATION PARTICIPATES (explicit — same F §3.3 sentence, same prompt in both files)
  BASIS "authentication establishes `PARTICIPATES`, not `HAS AUTHORITY`" — F §3.3
  AUTHORITY NONE LOCATED — "⭐ NONE FOUND (identical grep result to P3-F-07: no lens, no tradition-framing, no refusal, no test)"
  ⭐ INF-6 PREVENTION, RECORDED: PARTICIPATES established / HAS AUTHORITY not established / INF-6 prevents promotion
  F-POWER carried: CONCLUDE yes-and-instructed, persisted

ROW P3-F-09 · F-09 `app/api/studio/changes/[id]/mentor/` (+ `/chat`)
  PARTICIPATION UNKNOWN — F-POWER ONLY (classified "interpretive · concluding")
  BASIS "interpretive · concluding | WIRED-BUT-UNOBSERVED" — F §2; the only restraint is inline at `:32` — "You never diagnose, prescribe, or claim authority over the person's process"
  AUTHORITY NONE LOCATED — "⛔ Not `SYMBOLIC_LENS_BOUNDARY`, not canon-bound"

ROW P3-F-10 · F-10 `app/api/oracle/iching/route.ts`
  PARTICIPATION UNKNOWN — SILENT on participation in a turn
  BASIS "computational · memory-bearing · member-facing | WIRED-BUT-UNOBSERVED" — F §2; its written readings are what F-06 later recalls
  AUTHORITY NONE LOCATED (member scoping at `:71` is an access gate)
  F-POWER carried: ⛔ CONCLUDE: NO — house corpus text

ROW P3-F-11 · F-11 `POST /api/oracle/tarot` — UNAUTHENTICATED
  PARTICIPATION UNKNOWN — F-POWER ONLY
  BASIS "interpretive · **concluding** · member-facing | WIRED-BUT-UNOBSERVED · **UNAUTHENTICATED**" — F §2
  AUTHORITY NONE LOCATED — "⭐ NONE FOUND on both axes — no authentication, no member scoping, no symbolic-lens wrapper"; "⛔ no mechanism was found that COULD make the Tier-2 claim-type judgement on this path"

ROW P3-F-12 · F-12 `POST /api/oracle/runes` — UNAUTHENTICATED
  PARTICIPATION UNKNOWN — F-POWER ONLY, and ⚠️ F's two enumerations disagree about it (both preserved)
  BASIS F §2 classifies it "interpretive · member-facing" (⛔ not concluding); F §4's no-refusal-surface list includes it. ⛔ Not reconciled.
  AUTHORITY NONE LOCATED

ROW P3-F-13 · F-13 `app/api/iching/cast/`, `/search/`, `/hexagram/[number]/`
  PARTICIPATION UNKNOWN — SILENT
  BASIS "\"Does not require authentication — the oracle is available to all\"" — F §2 / `cast/route.ts:8`; "not classified concluding by F"
  AUTHORITY NONE LOCATED — openness is DECLARED; a claim-type gate is not determined

ROW P3-F-14 · F-14 `maiaAstrologyContextService` in the live member turn
  PARTICIPATION CONTRIBUTES (criterion)
  BASIS "Natal chart, current transits, Mayan profile and \"cosmic weather\" are computed per member and **injected into the prompt of the ordinary conversational route**"; "→ :1419 passed into generation"; "⭐ This is the **live conversational route** … Astrology is not a side surface; it is in the ordinary turn." — F §3.1
  AUTHORITY ⭐ GOVERNED — "`SYMBOLIC_LENS_BOUNDARY` applied at route.ts:732"; governing source "MAIA_SOVEREIGNTY_INVARIANTS.md:241-252 — Invariant 13 (Claim-Type Floor) names the wrapper as its operationalization"
  ⚠️ CARRIED: the wrapper is "a model-compliance instruction, ⛔ not a structural refusal; nothing measures obedience and no test or falsifier exists." GOVERNED names a located authorization, ⛔ not an enforced one.

ROW P3-F-15 · F-15 `lib/astrology/`
  PARTICIPATION UNKNOWN — the record makes SAY/CONCLUDE a property of each consumer, not the library
  BASIS "SAY/CONCLUDE: determined by each consumer, not by the library" — register/F §3.1,3.5,3.8; status PARTIAL
  AUTHORITY UNKNOWN

ROW P3-F-16 · F-16 `lib/story/archetypalNarrativeService.ts`
  PARTICIPATION UNKNOWN — F-POWER ONLY (⭐ CONCLUDE: yes — a narrative about this member's journey)
  BASIS "interpretive · **concluding**" — F §2; "the disclaimer at `:5` is a COMMENT addressed to developers, ⛔ not an instruction in the model's prompt"
  AUTHORITY NONE LOCATED — "claim-type gate NONE FOUND — no `SYMBOLIC_LENS_BOUNDARY`, no Invariant-13 check in route or service"

ROW P3-F-17 · F-17 `archetypeVoices.ts`, `archetypeLibrary`
  PARTICIPATION UNKNOWN — SILENT
  BASIS "informational · interpretive | WIRED-BUT-UNOBSERVED" — F §2
  AUTHORITY UNKNOWN — ⚠️ C-F4: "the wrapper's declared scope names \"archetypes\" while its wiring does not reach them"

ROW P3-F-18 · F-18 `MayaArchetypes.ts` + `ArchetypeResponseModifier.ts`
  PARTICIPATION EXISTS
  BASIS "**DORMANT** … no route, service or conversational path imports either" — F §3.6 / register
  AUTHORITY UNKNOWN
  ⛔ "`ArchetypeDetector` is concluding-SHAPED by name; ⛔ no traced path to a member turn, and the name is not evidence of capability."

ROW P3-F-19 · F-19 `lib/archetypeEvolutionEngine.ts`
  PARTICIPATION EXISTS
  BASIS "**ORPHANED — zero importers**" — F §2, §3.6
  AUTHORITY UNKNOWN
  ⛔ "its interfaces promise confidence scores ABOUT A PERSON; no code path consumes them … evidence of neither capability nor authority."

ROW P3-F-20 · F-20 `lib/symbolic/` (12 files)
  PARTICIPATION EXISTS
  BASIS "**DORMANT** except debug"; "importers outside the directory are exactly two, both diagnostic" — F §2, §3.7
  AUTHORITY UNKNOWN
  ⛔⛔ "filenames naming \"authority\", \"governance\" and \"prompt ingress\" are ⛔ NOT evidence that symbolic authority is governed."

ROW P3-F-21 · F-21 `lib/stellium/`
  PARTICIPATION UNKNOWN — a possible second symbolic entry into MAIA context is flagged and expressly NOT traced
  BASIS "flagged by F as a POSSIBLE second symbolic entry into MAIA context, ⛔ NOT traced to a turn (Domain A/B territory)" — register/F §3.8
  AUTHORITY NONE LOCATED — "⭐ NONE FOUND for member consent to practitioner-visible chart derivation … ⛔ Existing visibility is not treated as legitimate merely because it exists."

ROW P3-F-22 · F-22 `lib/holoflower/facets-interpretation.ts`
  PARTICIPATION EXISTS
  BASIS "**DORMANT — zero importers**" — F §2
  AUTHORITY UNKNOWN

ROW P3-F-23 · F-23 `lib/knowledge/` (24 loader files)
  PARTICIPATION EXISTS
  BASIS "**DORMANT**"; "its consumer is unreached from `app/`" — F §2, §3.9 (⛔ recorded without inferring the corpus SHOULD be wired)
  AUTHORITY UNKNOWN

ROW P3-F-24 · F-24 `lib/wisdom/sacredTexts/` + `SacredEncounterService`
  PARTICIPATION DECIDES
  BASIS "`evaluateEncounter` (`SacredEncounterService.ts:170`) returns `EncounterResult | null` — it **decides whether a sacred passage meets the member**." — F_symbolic.md §3.10. ⚠️ The verb is the record's own, in ordinary prose; F did not use ladder vocabulary here.
  AUTHORITY NONE LOCATED — "⛔ `grep` for `consent|optIn|enabled` … returns **no match**. No member opt-in for sacred-text encounter was found. The only found control is the null return of `evaluateEncounter` itself — i.e. **the system's own judgement is the gate**."
  ⭐ INF-6 PREVENTION, RECORDED
      DECIDES established
      HAS AUTHORITY not established
      INF-6 prevents promotion
  ⚠️ SCOPE OF THE ASSIGNMENT, STATED: the quoted sentence is about what the function does when it
  runs. X-DEF-2 disputes the reachability of the route that imports it (`route.ts:30`), and that
  dispute is ⛔ NOT resolved here; the position is ⛔ not a claim that it ran on a live turn.

ROW P3-F-25 · F-25 `lib/wisdom/`
  PARTICIPATION UNKNOWN — SILENT
  BASIS "informational · memory-bearing | PARTIAL" — F §2
  AUTHORITY UNKNOWN

ROW P3-F-26 · F-26 `lib/library/` — `LibraryService`, `spiralogicTagger`
  PARTICIPATION UNKNOWN — SILENT
  BASIS "informational · memory-bearing | WIRED-BUT-UNOBSERVED" — F §2 (⚠️ `spiralogicTagger` noted as Domain E boundary, ⛔ not classified)
  AUTHORITY UNKNOWN

ROW P3-F-27 · F-27 `chineseAstrology.ts`, `types/daYun.ts`, `types/vedic.ts`, BaZi
  PARTICIPATION UNKNOWN — SILENT
  BASIS "informational · computational | PARTIAL" — F §2
  AUTHORITY NONE LOCATED for an implementing binding — ⭐ a governing TEXT is located: "MAIA_SOVEREIGNTY_INVARIANTS.md:245 names Vedic; no implementing binding located" (C-F4)

ROW P3-F-28 · F-28 `mayanAstrology` (via F-14)
  PARTICIPATION CONTRIBUTES (criterion) — inside F-14's addendum
  BASIS "computed inside maiaAstrologyContextService and carried in the same addendum at route.ts:732" — register/F §3.1, which traces `:732 → :1419 passed into generation`
  AUTHORITY GOVERNED — "`SYMBOLIC_LENS_BOUNDARY` at route.ts:732"; "MAIA_SOVEREIGNTY_INVARIANTS.md:245 (Invariant 13 names Mayan)"

ROW P3-F-29 · F-29 `lib/soulPortrait/generator/`
  PARTICIPATION UNKNOWN — F-POWER ONLY (⭐ CONCLUDE, by classification and by F §4's list)
  BASIS "interpretive · **concluding** | WIRED-BUT-UNOBSERVED" — F §2; "no turn path traced"
  AUTHORITY NONE LOCATED — "⭐ NONE FOUND (F §4 list)"

ROW P3-F-30 · F-30 `wuxing-enhanced-casting.ts`
  PARTICIPATION UNKNOWN — SILENT
  BASIS "computational · memory-bearing | WIRED-BUT-UNOBSERVED"; `:186 persistReading` is one of the writers behind the readings F-06 recalls — F §2, §3.2
  AUTHORITY UNKNOWN

ROW P3-F-31 · `SYMBOLIC_LENS_BOUNDARY` (the wrapper itself)
  PARTICIPATION CONTRIBUTES (criterion) — ⭐ the wrapper's own text is prepended into the prompt
  BASIS "→ :732 astrologyAddendum = SYMBOLIC_LENS_BOUNDARY + '\\n\\n' + contextHeader + detail → :1419 passed into generation" — F §3.1
  AUTHORITY GOVERNED — "MAIA_SOVEREIGNTY_INVARIANTS.md:245-246 (Invariant 13, Claim-Type Floor)", which "names the wrapper as its operationalization"
  ⚠️ TWO THINGS CARRIED, ⛔ NOT RESOLVED: it is "a model-compliance instruction, ⛔ not a structural
  refusal", ⛔ NOT CI-GATED; and "⛔ NONE FOUND governing the wrapper itself: no artifact states who
  may edit it or requires new symbolic paths to apply it." ⭐ A gate that contributes to the prompt
  is still only a contribution — ⛔ being a gate is not a position on the participation axis above
  CONTRIBUTES, and is not authority over the paths it does not reach (C-F4).

ROW P3-F-32 · `safe_for_retrieval`
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION (no code object: "no TypeScript field, no SQL column, no index, no query, no filter")
  BASIS "⭐⭐ `safe_for_retrieval` HAS NO IMPLEMENTATION … **Verified at the census subject**" — F §4
  AUTHORITY NONE LOCATED for an implementation — the cited text "asserts a mechanism the code does not contain" (C-F2)

ROW P3-F-33 · `facetToHexagram` seed map
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION (no code object)
  BASIS "it exists only as illustrative TypeScript inside docs/canon/ICHING_STRUCTURAL_ENGINE.md:134" — F §5
  AUTHORITY NONE LOCATED — "there is no seed map in code TO have provenance"

ROW P3-F-34 · Invariant 13 Tier-2 consequential-forecast refusal
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION (canon prose; it is a required refusal, not a capability)
  BASIS "⛔ no implementing code found anywhere in Domain F" — F §4, §5, §9.1
  AUTHORITY ⭐ GOVERNING TEXT LOCATED · IMPLEMENTATION NONE FOUND — "the governing source exists; the implementation does not"

ROW P3-F-35 · "Symbolic Guidance Layer Doctrine"
  PARTICIPATION UNKNOWN — NOT A PARTICIPATION QUESTION (artifact not located)
  BASIS "named as a companion document at MAIA_SOVEREIGNTY_INVARIANTS.md:245 — ⛔ no file of that name found" — F §10
  AUTHORITY UNKNOWN — not located

ROW P3-F-36 · alchemical stage vocabulary — `nigredo` / `albedo` / `rubedo`
  PARTICIPATION UNKNOWN — the record expressly declined to classify
  BASIS "classifying them here would be a cross-domain claim" — F §7, §10; "⭐ the finding is the LOCATION: alchemy is not an independent symbolic system at this subject, it is vocabulary embedded in elemental objects"
  AUTHORITY UNKNOWN

---

## Counts — positions recovered, by position, and UNKNOWN total

```text
RECOVERED                                   46 of 111 rows
  CONTRIBUTES        11   D-01 02 03 04 · E-02 03 06 · F-06 14 28 31
                          (explicit 1: D-01 · criterion 10)
  DECIDES             2   D-06 (explicit) · F-24 (the record's own verb)
  PARTICIPATES        2   F-07 · F-08   (both explicit, F §3.3)
  EXISTS             31   D-12 13 15 16 17 18 19 20 21 22 23 24 25 26 28 39 46  (17)
                          E-01 07 12 15 16 18 20 22 24                           (9)
                          F-18 19 20 22 23                                       (5)
  KNOWS               0   ⛔ no record established it
  CONSIDERS           0   ⛔ no record established it
  HAS AUTHORITY       0   ⛔ off the ladder (Amendment 3 §2); ⛔ never assigned

UNKNOWN                                     65 of 111 rows
  SILENT / no participation statement   35
  AMBIGUOUS                              8   D-05 14 27 40 · E-05 17 25 · F-12(two F lists)
  RECORDS DISAGREE                      10   see next section
  NOT A PARTICIPATION QUESTION          12   see final section

AUTHORITY STANDING (second axis)
  GOVERNED                               4   E-29 · F-14 · F-28 · F-31
  GOVERNING TEXT LOCATED, UNIMPLEMENTED  3   F-27 · F-32 · F-34
  NONE LOCATED                          46
  UNKNOWN                               58
```

⭐ `EXISTS` is the single largest recovery, and that is the finding, not a filler: 31 rows are
objects the records determined **exist and do not participate**. ⭐ `KNOWS` and `CONSIDERS` were
recovered **zero times** — no record in this slice ever established either.

---

## Rows where the records DISAGREE (both sides quoted; all UNKNOWN)

⛔ Preserved, ⛔ not derived across, ⛔ neither side dropped, ⛔ no source code read.

### ⭐ X-DEF-1 — the same module, two opposite surfacing findings → P3-D-07 and P3-E-04
```text
D_field.md §2 D-OBJ-7   "SURFACED WHERE ⭐ INTO THE PROMPT as a labelled block:
                         maiaService.ts:1094-1110 '🎯 TALK MODE FIELD INTELLIGENCE
                         (Reference Context)'"
D_field.md §6 ans.4     lists it as traced path (c), "(a)–(d) sit at CONTRIBUTES"
E §3.3                  "SURFACED WHERE ⛔ NOWHERE. grep -n fieldAwareness → exactly
                         1079, 1094, 1198. :1198 // Note: fieldAwareness intentionally
                         NOT appended"
```
⭐ **This is the one place in the slice where an EXPLICIT ladder assignment is withheld.** D
assigned `CONTRIBUTES`; the assignment is preserved verbatim above and ⛔ is not carried, because
carrying it would be deriving across the disagreement. **P3-D-34** is listed here too: its only
traced consumption (`maiaService.ts:1083,1091`) sits inside the same disputed block.

### X-DEF-2 — the status of `app/api/oracle/conversation/route.ts`
```text
D_field.md §3 heading   "CAPABILITY RECORDS — Families B and C (other cognition paths)"
                        — and traces D-OBJ-9 / D-OBJ-10 through that route to the prompt
E §1 Q2                 that route carries "an unconditional HTTP 410 at :446-453", in a
                        block "the file itself labels // Unreachable below (:455)"
F C-F5                  a third statement about the same route — the anchor's "~zero live
                        traffic" — which F expressly does not let settle the question
```
UNKNOWN on this ground: **P3-D-09 · P3-D-10 · P3-E-05 · P3-E-10 · P3-E-11 · P3-E-27**.

⚠️ **Two X-DEF-2-dependent rows DID recover a position, on a basis independent of the dispute, and
the independence is stated rather than assumed:**
- **P3-E-16** — `enabledApplied` defaults to `[]` at **both** call sites, one of which is
  `app/api/maia/spiralogic/route.ts:89`, not the disputed route.
- **P3-F-24** — the quoted sentence is about what `evaluateEncounter` does when it runs, ⛔ not
  about whether the route runs.

### Within-record contradictions also blocking a position
- **P3-D-10** additionally: `substrateMap.ts:383-391` "consumers: [] … Service preserved; no live
  consumer wired" (CONTRA-2) against D's own traced path to `route.ts:2787`.
- **P3-D-14** — C-F6: two different objects are named `PersonalOracleAgent` and "⛔ which of the
  two objects those citations mean is NOT DETERMINED BY SOURCE RECORD".
- **P3-F-12** — F §2 classifies runes "interpretive · member-facing" (⛔ not concluding) while
  F §4's no-refusal-surface list includes it. Both preserved.

---

## Rows where a record establishes an EFFECT but no LOCATED AUTHORIZATION (INF-6 cases)

⭐⭐ **Renamed per Amendment 3 §1.** What these rows establish is exactly:
```text
effect                    OBSERVED (in the record's own words)
authorization located     NO
authorization status      UNKNOWN / NONE LOCATED
```
⛔ **Not** *proved unauthorized*. That verdict belongs to a different lane and is ⛔ not
pre-announced here.

```text
ROW      PARTICIPATION   AUTHORITY      the effect, in the record's words
P3-D-06  DECIDES         NONE LOCATED   "it DECIDES, and its text replaces MAIA's" ·
                                        returned "before the turn reaches a model"
P3-F-24  DECIDES         NONE LOCATED   "decides whether a sacred passage meets the member";
                                        "the system's own judgement is the gate"
P3-F-07  PARTICIPATES    NONE LOCATED   CONCLUDE "yes, and instructed to", PERSISTED at :159
P3-F-08  PARTICIPATES    NONE LOCATED   same prompt, practitioner-facing, persisted
P3-D-01  CONTRIBUTES     NONE LOCATED   prompt append, FAST + CORE; "no governance gate of any kind"
P3-D-02  CONTRIBUTES     NONE LOCATED   FieldContext.pfi → prompt, via the ungated caller
P3-D-03  CONTRIBUTES     NONE LOCATED   FieldContext.resonance → prompt JSON
P3-D-04  CONTRIBUTES     NONE LOCATED   FieldContext.unified → prompt JSON
P3-E-02  CONTRIBUTES     NONE LOCATED   element into the system prompt every CORE and DEEP turn
P3-E-03  CONTRIBUTES     NONE LOCATED   element into [Field Intelligence] on CORE
P3-E-06  CONTRIBUTES     NONE LOCATED   persisted spiral state rendered into a prompt
P3-F-06  CONTRIBUTES     NONE LOCATED   three addenda into the live /list turn
                                        (⭐ gates multiple, structural and TESTED — ⛔ a gate is
                                         not an authorization; ⛔ INF-1: witness recorded absence)
```

**12 rows. 2 of them DECIDES.** ⛔ None is called unauthorized.

### ⭐ The INF-6 prevention lines, gathered (Amendment 3 §4a)
```text
P3-D-06   DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
P3-F-24   DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
P3-F-07   PARTICIPATES established · HAS AUTHORITY not established · INF-6 prevents promotion
P3-F-08   PARTICIPATES established · HAS AUTHORITY not established · INF-6 prevents promotion
```
⭐⭐ **P3-D-06 is the case the prohibition exists for, and the record itself failed it**: D §6
ans.4 wrote *"(e) is the only object in Domain D at HAS AUTHORITY"* immediately after describing
the effect, while D §7 recorded that **no ratified source authorizing realm-based refusal was
located**. The sentence is preserved as evidence and the authority claim is ⛔ not carried.
⭐ F §3.3 is the opposite case and shows the discipline already existing inside a P1-02 record:
*"authentication establishes `PARTICIPATES`, not `HAS AUTHORITY`."*

---

## F-POWER rows (KNOW / SAY / CONCLUDE preserved, ⛔ NOT mapped to ladder positions)

⛔ Per Amendment 3 §3, `CONCLUDING-CAPABLE = yes` establishes **none** of DECIDES · CONTRIBUTES ·
MEMBER-FACING · PERSISTED · AUTHORIZED. Each needs its own evidence.

```text
ROW      LADDER        F-POWER as F recorded it
P3-F-01  UNKNOWN       KNOW corpus data · SAY n/a · CONCLUDE n/a
P3-F-02  UNKNOWN       KNOW house corpus · SAY via F-06's blocks · CONCLUDE no
P3-F-03  UNKNOWN       ⚠️ CONCLUDE forecast-shaped BY DATA STRUCTURE (a `Future` position is a slot)
P3-F-04  UNKNOWN       KNOW rune corpus · CONCLUDE not determined
P3-F-09  UNKNOWN       CONCLUDE (F §2) · one inline self-authored restraint, not canon-bound
P3-F-10  UNKNOWN       ⛔ CONCLUDE: NO — house corpus text
P3-F-11  UNKNOWN       ⚠️ CONCLUDE forecast-shaped; unauthenticated; no mechanism COULD judge
P3-F-12  UNKNOWN       ⚠️ F's two lists disagree — both preserved, neither chosen
P3-F-13  UNKNOWN       informational; not classified concluding
P3-F-16  UNKNOWN       ⭐ CONCLUDE yes — a narrative about this member; disclaimer is a COMMENT
P3-F-18  EXISTS        ⚠️ concluding-SHAPED by name only; ⛔ no traced path to a member turn
P3-F-19  EXISTS        ⭐⭐ interfaces promise confidence scores ABOUT A PERSON; zero importers
P3-F-29  UNKNOWN       ⭐ CONCLUDE — classified concluding, in F §4's no-refusal-surface set
P3-F-06  CONTRIBUTES   ⭐⭐ CONCLUDE STRUCTURALLY REFUSED — the one that refuses by construction
P3-F-07  PARTICIPATES  ⭐⭐ CONCLUDE yes-and-instructed · PERSISTED with no author-class column
P3-F-08  PARTICIPATES  ⭐⭐ CONCLUDE yes-and-instructed · persisted
P3-F-14  CONTRIBUTES   CONCLUDE constrained ONLY by the wrapper — an instruction, not a mechanism
P3-F-28  CONTRIBUTES   CONCLUDE wrapper-constrained only
```

⭐ **The CONCLUDE count stays unsettled.** F gives three incompatible enumerations (F §2 table →
F-07 08 09 11 16 29; F §4 no-refusal list → F-07 08 11 12 16 29; F §6 prose → "six … one refuses").
⛔ No number is adopted here, ⛔ nothing added to or removed from any list; it is P1-05's.

---

## Rows that are NOT A PARTICIPATION QUESTION

⭐ Not "unknown because nobody looked" — **there is no object to place on a participation axis.**

```text
P3-D-29   "Fields" collaborative workspace — "out of D's substantive scope; enumerated to
          prevent conflation"; a kanban/decision workspace, not field intelligence
P3-D-32   /field/* — "naming collision only"
P3-D-41   RFI — ⛔ 0 code objects
P3-D-42   UFI — one comment that explicitly excludes it
P3-D-43   FIS Field State Primitive — canon that self-declares no runtime authority
P3-D-44   COLLECTIVE_FIELD_SERVICE_URL — the variable "appears nowhere else in the repository"
P3-D-45   maia-mcp/server.ts — absent from this repository
P3-E-28   the S-16 12-phase document vocabulary — "⛔ 0 code hits" for four of them
P3-F-32   safe_for_retrieval — no field, column, index, query or filter exists
P3-F-33   facetToHexagram — illustrative TypeScript inside a canon document
P3-F-34   Invariant 13 Tier-2 refusal — a required refusal with no implementing mechanism
P3-F-35   "Symbolic Guidance Layer Doctrine" — named by canon, no file of that name found
```

⛔ Three of these carry a LOCATED governing text with nothing implementing it (P3-F-32 · P3-F-34,
and P3-F-27 outside this list). ⭐ That is the mirror image of the inventory above — **authority
located without effect**, where those rows are **effect without located authorization**.

```text
P1-03 · LADDER PASS · SLICE D · E · F · COMPLETE
111 rows · 46 positions recovered · 65 UNKNOWN · 0 HAS AUTHORITY assigned
12 EFFECT-WITHOUT-LOCATED-AUTHORIZATION rows · 4 INF-6 prevention lines recorded
10 rows UNKNOWN because two records disagree (X-DEF-1 · X-DEF-2), both sides preserved
⛔ NO SOURCE CODE READ · NO GOVERNING DOCUMENT READ · NO TEST · NO RUNTIME WITNESS
⛔ NO CONTRADICTION RESOLVED · NO POSITION ASSIGNED WITHOUT A QUOTED BASIS
```
