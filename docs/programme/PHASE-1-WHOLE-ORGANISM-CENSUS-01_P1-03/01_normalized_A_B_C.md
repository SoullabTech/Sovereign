# P1-03 · NORMALIZED CAPABILITY REGISTER — DOMAINS A · B · C

```text
STEP        PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-03
SUBJECT     1a5554300e855d3581085849301a39cbb10ab385
TYPE        RECORD ONLY — restatement of three CLOSED P1-02 domain records
INPUT       A_canonical_cognition.md (17) · B_memory.md (31) · C_developmental_relational.md (14)
OUTPUT      62 normalized rows
BOUND BY    PHASE-1-WHOLE-ORGANISM-CENSUS-01_P1-03_INSTRUMENT_2026-09-14.md · INF-1…INF-5
```

> ⭐ **P1-03 restates. It does not decide.**
> Where a source record did not determine a field, this file writes
> `NOT DETERMINED BY SOURCE RECORD`. ⛔ It does not fill the gap.
> ⛔ No status upgraded · ⛔ no ladder assigned that a record did not establish ·
> ⛔ no contradiction resolved · ⛔ no row merged or split · ⛔ no capability added ·
> ⛔ no source code read.

## Reading conventions declared before use

**COVERAGE family labels.** ⚠️ The source records issued **no family labels of their own**. The
labels below are restatement handles for objects domain A enumerated by route and tier; ⛔ they
are not a new taxonomy and ⛔ they do not assert that any two are the same mind.

```text
F-LIST-FAST          /list · FAST tier                           A §A-03
F-LIST-CORE          /list · CORE tier                           A §A-04
F-LIST-DEEP-PRIMARY  /list · DEEP primary stage 1                A §A-05 (no prompt seam)
F-LIST-DEEP-CONSULT  /list · DEEP primary stage 2, Claude        A §A-05 (env-gated off)
F-LIST-DEEP-REPAIR   /list · DEEP repair                         A §A-05
F-RCN                RCN early-return cognition                  A §A-06
F-WS-FOCUS           Writers-Studio canonical turn               A §A-07
F-SHADOW             canonical-turn shadow (non-member-facing)   A §A-08
F-BETWEEN            /api/between/chat                           A §A-11
F-MAIA-SIBLING       /api/sovereign/app/maia (dormant)           A §A-12
F-ORACLE             /api/oracle/conversation (410 at POST)      A §A-13
F-VOICE-STREAM       /api/voice/stream-conversation (orphaned)   A §A-14
F-PERIPHERAL         the 25 peripheral MAIA-claiming routes      A §A-15
```

**COVERAGE value discipline.** `NOT APPLICABLE` is written only where the source record
**affirmatively** establishes there is no prompt seam (write-only, observability, gate, or an
explicit "SURFACED WHERE: NOWHERE"). Where a record simply did not trace a seam,
`NOT DETERMINED BY SOURCE RECORD` is written instead.

**STATUS.** Where a source record's status cell is not one of the instrument's enum values, the
cell is restated verbatim and flagged; ⛔ it is not coerced into an enum value.

---

# DOMAIN A — CANONICAL COGNITION / MAIA

Source: `PHASE-1-WHOLE-ORGANISM-CENSUS-01_P1-02/A_canonical_cognition.md`.
⚠️ Carried with every A row: **`CANONICAL COGNITION BOUNDARY = UNKNOWN`** (A §1).

```text
ROW ID            P3-A-01
DOMAIN            A
NAMED OBJECT      Canonical member chat turn — POST /api/sovereign/app/maia/list
ARTIFACT          app/api/sovereign/app/maia/list/route.ts:285 · registry lib/maia/maiaRuntimeContext.ts:64 ('canonical-live')
STATUS            LIVE
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED · OBSERVED
COVERAGE          Entry point for F-LIST-FAST · F-LIST-CORE · F-LIST-DEEP-PRIMARY · F-LIST-DEEP-CONSULT · F-LIST-DEEP-REPAIR · F-RCN; also hosts F-SHADOW
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PRESENT, RUNTIME-GATED — ensureSchemaReady→503 (:296-306) · missing message→400 (:366) · assertProviderAvailable→503 (:1358-1362) · identity resolution refuses body userId (:329-333) · middleware.ts:487 matcher · SAFE_MODE const (:192)
GOVERNING SOURCE  NONE LOCATED for the route as a whole; Canon v1.1 provenance headers named at egress (A §A-10)
SOURCE RECORD     A §2 · A-01
```

```text
ROW ID            P3-A-02
DOMAIN            A
NAMED OBJECT      Processing-tier decision (FAST / CORE / DEEP) — chooseProcessingProfile
ARTIFACT          lib/consciousness/processingProfiles.ts:49 · computed lib/sovereign/maiaService.ts:3169-3176 · switch :3391
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · CONFIG-SELECTED
COVERAGE          Selects among F-LIST-FAST · F-LIST-CORE · F-LIST-DEEP-PRIMARY · F-LIST-DEEP-REPAIR. ⛔ Not F-RCN (returns before the switch) · ⛔ not F-WS-FOCUS (bypasses the switch)
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND — no refusal-registry check, no consent gate, no member-visible disclosure governs which mind answers a turn
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     A §2 · A-02
```

```text
ROW ID            P3-A-03
DOMAIN            A
NAMED OBJECT      FAST tier prompt assembly and generation — fastPathResponse
ARTIFACT          lib/sovereign/maiaService.ts:771 · baseSystemPrompt :1497-1507 · generateText :1560-1562
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED
COVERAGE          F-LIST-FAST only
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL, AND DIVERGENT — receives PLATFORM_KNOWLEDGE_ADDENDUM only (maiaService.ts:5, used :1505); INTERFACE_HUMILITY_GUARDRAIL · MEMORY_SPEECH_ACT_BOUNDARY · PLATFORM_KNOWLEDGE_BOUNDARY return zero hits in the file; they exist at maiaVoice.ts:460/:484/:497 and are appended only inside appendAllContextAddenda, which FAST never calls
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     A §2 · A-03
```

```text
ROW ID            P3-A-04
DOMAIN            A
NAMED OBJECT      CORE tier prompt assembly and generation — corePathResponse / buildMaiaWisePrompt
ARTIFACT          lib/sovereign/maiaService.ts:1601 · builder lib/sovereign/maiaVoice.ts:549 · appendAllContextAddenda :910 · generateText :1988 (repair re-entry :2015/:2027)
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · CONFIG-SELECTED
COVERAGE          F-LIST-CORE (and the ADDENDA_SPECS registry it shares with F-LIST-DEEP-REPAIR)
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PRESENT — FULL FOUR standing texts appended unconditionally (maiaVoice.ts:530/:536/:540/:544). ⚠️ MAIA_SAFE_MODE=true short-circuits to buildSimpleMaiaPrompt (:550-553), discarding every addendum and every guardrail — CONFIG-SELECTED, and no located ruling governs who may set it
GOVERNING SOURCE  NONE LOCATED for MAIA_SAFE_MODE; ENTRUSTMENT_COVENANT_PROTOCOL_2026-06-05.md and ENTRUSTMENT_KEEP_SPEECHACT_GATE_2026-06-05.md cited at maiaVoice.ts:524-531, ⛔ NOT VERIFIED in the source record
SOURCE RECORD     A §2 · A-04
```

```text
ROW ID            P3-A-05
DOMAIN            A
NAMED OBJECT      DEEP tier — two prompt regimes, one of them seamless (deepPathResponse)
ARTIFACT          lib/sovereign/maiaService.ts:2056 · primary stage 1 :2338-2354 · stage 2 gate :2371-2373, addenda :2385-2393, consult :2418 · repair :2543 → maiaVoice.ts:950/:965/:972 → generateText :2554
STATUS            WIRED-BUT-UNOBSERVED (repair) · WIRED-BUT-UNOBSERVED (primary stage 1) · DORMANT (consultation stage 2) — three statuses as the source record states them; ⛔ not collapsed
ALTITUDE          EXISTS · WIRED · CONFIG-SELECTED (stage 2 env-gated off by default)
COVERAGE          F-LIST-DEEP-REPAIR · F-LIST-DEEP-PRIMARY · F-LIST-DEEP-CONSULT
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   MIXED — DEEP-repair: full four. DEEP-primary stage 1: NONE FOUND (no system prompt at all; none of the four standing texts, none of the 27 ADDENDA_SPECS fields). DEEP-primary stage 2: seven recall addenda only, and disabled by default
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     A §2 · A-05
```

```text
ROW ID            P3-A-06
DOMAIN            A
NAMED OBJECT      RCN early-return cognition — maiaRcnProcess
ARTIFACT          lib/sovereign/maiaService.ts:3196-3266 (call :3210 · format :3215 · finalize :3224 · exchange :3230 · return :3241)
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED
COVERAGE          F-RCN. Text is corpus-derived; ⛔ it never passes a MAIA system prompt or any of the four standing texts. Writers-Studio turns excluded outright by WriterCanonicalOnly (:3211, :3264)
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — egress discipline only (finalizeMemberFacingText), added because "this path previously skipped all three" (:3221-3223)
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     A §2 · A-06
```

```text
ROW ID            P3-A-07
DOMAIN            A
NAMED OBJECT      Writers-Studio canonical turn — POST /api/writers-studio/focus
ARTIFACT          app/api/writers-studio/focus/route.ts:30 (flag :28, 404 :31) · lib/writers-studio/writersStudioCognition.ts:124 · maiaService.ts:3376 renderTurnForCognition → generateText :3380-3386
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED · CONFIG-SELECTED
COVERAGE          F-WS-FOCUS only — bypasses the FAST/CORE/DEEP switch entirely (the switch sits in the else at :3390-3391)
LADDER            CONTRIBUTES — established by the source record: "the only place where the canonical-turn renderer CONTRIBUTES to a member-facing answer. It still does not DECIDE the organism's shape."
GOVERNANCE GATE   PRESENT — identity must be verified else 401 (:38-40) · feature flag WRITERS_STUDIO_FOCUS_ENABLED · WriterCanonicalOnly excludes RCN · canonical floor lib/maia/canonical-turn/floor.ts:23-26 (all four texts)
GOVERNING SOURCE  NONE LOCATED; FOCUS-WITNESS-01_RESULT_2026-09-10.md exists in-repo but was NOT READ for runtime status in the source slice
SOURCE RECORD     A §2 · A-07
```

```text
ROW ID            P3-A-08
DOMAIN            A
NAMED OBJECT      CMT-01 canonical-turn shadow on /list
ARTIFACT          lib/maia/canonical-turn/ (14 modules) · list/route.ts:1276 · :1296 constructCanonicalTurn (cognitionPath 'shadow' :1323) · :1326 emitShadowDiff
STATUS            OBSERVATION-ONLY
ALTITUDE          EXISTS · WIRED · CI-GATED
COVERAGE          F-SHADOW. MEMBER-FACING EFFECT: none — the legacy turn is unaffected by construction
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   CI-GATED ONLY — refusals R25–R31 (tests/constitutional/refusal-registry/refusal-25…31-canonical-*.ts), incl. refusal-31-canonical-shadow-observational.ts. ⚠️ INF-2: static/CI, not a request-time gate
GOVERNING SOURCE  CMT-01_M0-M2_WITNESS_2026-09-03.md (:99 live zeroDiff witness NOT yet obtained; :198 first shadow deploy ran as GIT_COMMIT=unknown, evidence void)
SOURCE RECORD     A §2 · A-08
```

```text
ROW ID            P3-A-09
DOMAIN            A
NAMED OBJECT      MAIA identity / system prompt — source count (96 declaration sites)
ARTIFACT          96 files matching "You are MAIA|You are Maia" across app/api + lib (25 are HTTP route handlers); named: lib/consciousness/MAIA_RUNTIME_PROMPT.ts · lib/oracle/MaiaSystemPrompt.ts · lib/voice/MaiaSystemPrompt.ts · lib/prompts/maiaEssence.ts · lib/consciousness/AdaptiveSystemPrompts.ts · lib/services/ClaudeService.ts · lib/sovereign/intelligentVoiceAdaptation.ts · lib/multi-tenant/TenantMAIA.ts · app/api/ask-maia/ask/route.ts:8 · app/api/maia/living-field/[fieldKey]/encounter/route.ts:111
STATUS            PARTIAL
ALTITUDE          EXISTS · WIRED
COVERAGE          MAIA_RUNTIME_PROMPT.ts reaches F-LIST-FAST (maiaService.ts:1070) and F-LIST-CORE / F-LIST-DEEP-REPAIR (maiaVoice.ts:585). ⛔ F-LIST-DEEP-PRIMARY reaches none of them. The other 95 sources have independent standing; their family coverage is NOT DETERMINED BY SOURCE RECORD
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND for identity-source uniqueness — no guard, registry or refusal constrains a new file declaring "You are MAIA" and shipping it to a model. Nearest instrument lib/maia/canonical-turn/producerRegistry.ts governs F-SHADOW and F-WS-FOCUS only
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     A §2 · A-09
```

```text
ROW ID            P3-A-10
DOMAIN            A
NAMED OBJECT      Egress — member-facing finalization (finalizeMemberFacingText)
ARTIFACT          lib/sovereign/maiaService.ts:2660-2689 · determineResponseMode :2670 · enforcePresenceConstraints :2672 · enforceIdentityPredicateConstraint :2681 · route sanitizeMaiaOutput :3439 · makeCanonHeaders list/route.ts:1813 · jsonWithCors :1966
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · CI-GATED
COVERAGE          The getMaiaResponse family only. ⭐ EGRESS IS NOT SINGULAR — enumerated member-facing terminations producing MAIA-claiming text: list/route.ts:1966 (P3-A-01) · maiaService.ts:3241 (F-RCN) · between/chat route.ts:776 (F-BETWEEN) · writers-studio/focus (F-WS-FOCUS) · the 25 routes of F-PERIPHERAL · voice/stream-conversation SSE (F-VOICE-STREAM, uninvoked). P1-01's UNKNOWN on egress is restated as: SEVERAL, ENUMERATED — with no single chokepoint
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL / CI-GATED — refusal-14-identity-predicate-guard.ts · refusal-24-cross-session-continuity-truthfulness.ts · Canon v1.1 provenance headers · sanctuary suppresses relational observation (list/route.ts:1823)
GOVERNING SOURCE  docs/canon/MAIA_CANON_v1.1 provenance headers (named in record)
SOURCE RECORD     A §2 · A-10
```

```text
ROW ID            P3-A-11
DOMAIN            A
NAMED OBJECT      /api/between/chat — live-secondary lane
ARTIFACT          app/api/between/chat/route.ts:776 (2665 lines) · registry maiaRuntimeContext.ts:78 · generateMaiaTurn lib/consciousness/maiaOrchestrator.ts:251 → getMaiaResponse :506 · generateSimpleMaiaResponse :1047 → :1059
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · CONFIG-SELECTED
COVERAGE          F-BETWEEN; converges on lib/sovereign/maiaService.ts:2704. ⚠️ Reaches cognition WITHOUT buildMaiaRuntimeContext ever running for it
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — SAFE_MODE at between/chat/route.ts:370 · pipeline provenance header 'orchestrator.generateMaiaTurn' (:1523, :2463)
GOVERNING SOURCE  NONE LOCATED; the wrapper's own contract (maiaRuntimeContext.ts:3-5) is not satisfied on this path
SOURCE RECORD     A §2 · A-11
```

```text
ROW ID            P3-A-12
DOMAIN            A
NAMED OBJECT      /api/sovereign/app/maia — dormant predecessor
ARTIFACT          app/api/sovereign/app/maia/route.ts:1 (@ts-nocheck), header :4-19, getMaiaResponse at :343 and :497 · registry maiaRuntimeContext.ts:96
STATUS            DORMANT
ALTITUDE          EXISTS · WIRED
COVERAGE          F-MAIA-SIBLING (calls getMaiaResponse). ⚠️ Dormant here means unvisited, not closed — the handler would serve a request
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND — dormancy is asserted by a source comment and a registry entry, not enforced; there is no 404/410 refusal in the handler
GOVERNING SOURCE  NONE LOCATED; in-source 2026-05-23 traffic audit is the only evidence
SOURCE RECORD     A §2 · A-12
```

```text
ROW ID            P3-A-13
DOMAIN            A
NAMED OBJECT      /api/oracle/conversation — blocked lane
ARTIFACT          app/api/oracle/conversation/route.ts:433 (POST), refusal marker :435, 410 at :452; ~2600 lines of unreachable cognition (MultiLLMProvider :2245, own finalSystemPrompt, scrubMemoryAmnesia :2569)
STATUS            BLOCKED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED · CI-GATED
COVERAGE          F-ORACLE. The 410 is the first executable statement of POST
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PRESENT — refusal-19-oracle-lane-disabled.ts (grade A), asserting the body is never read and the content writers (storeSessionPattern, storeCMLayerSignal) are unreachable from HTTP. ⛔ refusal-19:25 states explicitly that passing does NOT authorize the writers, which remain ungoverned (S5)
GOVERNING SOURCE  refusal-19-oracle-lane-disabled.ts (CI instrument, not a governing document)
SOURCE RECORD     A §2 · A-13
```

```text
ROW ID            P3-A-14
DOMAIN            A
NAMED OBJECT      /api/voice/stream-conversation — the second mind, orphaned at the client
ARTIFACT          app/api/voice/stream-conversation/route.ts (1639 lines) · getClaudeService :28 · MemoryBundleService :33 · MEMORY_CANON_GUARD_PROMPT :35 · guardVoiceChunk :36 · sole fetch site hooks/useStreamingVoice.ts:633
STATUS            ORPHANED
ALTITUDE          EXISTS · WIRED · CI-GATED
COVERAGE          F-VOICE-STREAM. ⛔ CONVERGENCE: NONE — zero references to getMaiaResponse, maiaService, buildMaiaWisePrompt or finalizeMemberFacingText. Declared consumer destructures sendStreamingMessage (OracleConversation.tsx:2604) and never invokes it
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND for the route itself; the only instruments are __tests__/voice-non-degradation.test.ts (a unit test over a CLIENT component), the non-degradation doctrine, and the exit map. ⛔ Not DORMANT-by-refusal: it is unreached, not closed
GOVERNING SOURCE  docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md · docs/architecture/VOICE_CANONICAL_CONVERGENCE_02_EXIT_MAP.md (both verified present at the subject)
SOURCE RECORD     A §2 · A-14
```

```text
ROW ID            P3-A-15
DOMAIN            A
NAMED OBJECT      Peripheral MAIA-claiming routes with independent cognition (25, as a class)
ARTIFACT          app/api/maia/relational-navigation/route.ts:46 · app/api/maia/living-field/[fieldKey]/encounter/route.ts:34 · …/refine/route.ts · app/api/portal/[slug]/chat/route.ts:32 · app/api/practitioner/practice-field/draft/route.ts:40 · app/api/studio/with-me/sessions/[sessionId]/synthesize/route.ts · app/api/ask-maia/ask/route.ts:84 · app/api/maia/chat/route.ts:26 (refusal stub) · app/api/maia/field-driven-response/route.ts:3,:69
STATUS            PARTIAL as a class; individual statuses NOT DETERMINED BY SOURCE RECORD
ALTITUDE          EXISTS · WIRED
COVERAGE          F-PERIPHERAL. ⛔ CONVERGENCE: NONE with getMaiaResponse
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND as a class — no registry entry, no buildMaiaRuntimeContext, no ADDENDA_SPECS, no four standing texts, no finalizeMemberFacingText, no assertProviderAvailable. middleware.ts matches them (tier/access), which governs who may call, never what may be said in MAIA's name
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     A §2 · A-15
```

```text
ROW ID            P3-A-16
DOMAIN            A
NAMED OBJECT      Model / provider dispatch — generateText gateway (boundary to Domain G)
ARTIFACT          lib/ai/modelService.ts:76 (in-source: "Main gateway for ALL text generation in MAIA" :72) · ALLOW_OPENAI_TEXT=false :61 · sovereignty throw :90 · MAIA_INFERENCE_MODE → lib/ai/sovereignRouter.ts:134 (:83-85)
STATUS            PARTIAL
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED · CONFIG-SELECTED
COVERAGE          Reached by F-LIST-FAST · F-LIST-CORE · F-LIST-DEEP-REPAIR · F-WS-FOCUS (via generateText). ⚠️ NOT reached by F-VOICE-STREAM (getClaudeService), six F-PERIPHERAL routes (new Anthropic()), F-ORACLE's MultiLLMProvider, or F-LIST-DEEP-PRIMARY's consciousnessWrapper
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — sovereignty refusal at the gateway, which at least four independent model reaches do not pass. Detailed adjudication belongs to Domain G
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     A §2 · A-16
```

```text
ROW ID            P3-A-17
DOMAIN            A
NAMED OBJECT      Runtime governance instruments actually found on the canonical lane (the set of eleven)
ARTIFACT          schema gate list/route.ts:296-306 · identity list/route.ts:329 + list/resolveIdentity.ts · provider gate list/route.ts:1362 + lib/maia/assertProviderAvailable.ts · route registry lib/maia/maiaRuntimeContext.ts:60-101 · safe mode maiaVoice.ts:550 + four route consts · addenda registry maiaVoice.ts:414-442 · standing texts maiaVoice.ts:460/484/497 + :530-544 · egress guards maiaService.ts:2660-2689 · refusal registry tests/constitutional/refusal-registry/ (31 checks) · middleware.ts:478-487 · canonical floor lib/maia/canonical-turn/floor.ts:23-26
STATUS            NOT DETERMINED BY SOURCE RECORD — the record presents a table of instruments with per-instrument notes and assigns no single status
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED (schema/identity/provider/safe-mode/middleware) · CI-GATED (refusal registry, 31 checks)
COVERAGE          The canonical /list lane. ⚠️ Standing texts: F-LIST-CORE + F-LIST-DEEP-REPAIR only. ⚠️ Canonical floor: F-SHADOW + F-WS-FOCUS only. ⚠️ Route registry warns only — "Non-blocking: unknown routeId = warn + passthrough" (:198-200)
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   ⭐ The refusal registry is the largest governance artifact in this domain and it DOES NOT RUN AT REQUEST TIME — it is a source-scanning suite (INF-2). ⛔ Recording that is not a claim that it should run at request time
GOVERNING SOURCE  NONE LOCATED as a set
SOURCE RECORD     A §2 · A-17
```

---

# DOMAIN B — MEMORY / ANAMNESIS

Source: `PHASE-1-WHOLE-ORGANISM-CENSUS-01_P1-02/B_memory.md`.
⭐ **B's coverage obligation, carried on every row.** The source record established that memory
participation **differs by cognition family**: six prompt injection points (B §3), of which S-1/S-2
are FAST, S-3 is CORE + DEEP-repair, S-4 is CORE, S-5 is DEEP-consultation, S-6 is the oracle
route — and ⛔ **"DEEP-primary has no memory prompt seam at all"** (B §3, quoting
maiaService.ts:2380-2384). ⛔ No B row is written as reaching "MAIA".

```text
ROW ID            P3-B-01
DOMAIN            B
NAMED OBJECT      TurnsStore + meta.conversationHistory (session thread) — conversation_turns
ARTIFACT          lib/memory/stores/TurnsStore.ts:113/:206/:256/:293/:311 · injection S-2 maiaService.ts:1058 (recentThreadBlock)
STATUS            WIRED-BUT-UNOBSERVED (stop stage UPDATED)
ALTITUDE          EXISTS · WIRED
COVERAGE          recentThreadBlock reaches F-LIST-FAST via S-2. Tier reach of meta.conversationHistory NOT DETERMINED BY SOURCE RECORD
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — sanctuary contentWritable refuses at TurnsStore write boundaries (:113, :206, :256)
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-01; §8
```

```text
ROW ID            P3-B-02
DOMAIN            B
NAMED OBJECT      MemoryBundleService — the compressed cross-session bundle
ARTIFACT          lib/memory/MemoryBundle.ts:99 (retrievals :112-117, :224, :269/:319, :362, :398) · loaded list/route.ts:552-575 · surfaced :709 → :1406 → maiaService.ts:925 → :1058
STATUS            WIRED-BUT-UNOBSERVED (FAST) · BLOCKED by construction on CORE/DEEP — both restated
ALTITUDE          EXISTS · WIRED · CONFIG-SELECTED (MemoryGate memoryMode / sanctuary skip at route :541)
COVERAGE          F-LIST-FAST ONLY. ⛔ "CORE and DEEP do not read meta.memoryContext at all" — stated twice in code (maiaService.ts:1629, :2084) as an architectural fact
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND for bundle composition (composite scoring, decay, maxBullets:5). MemoryGate.resolveMemoryMode gates whether it runs, not what it selects
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §2.1
```

```text
ROW ID            P3-B-03
DOMAIN            B
NAMED OBJECT      loadMemberMemoryAtomsForPrompt (memoryHealth key 'semantic') — member_memory_atoms
ARTIFACT          lib/maia/memoryAtomsLoader.ts:230, predicates :278-291 (guard :185-186) · loaded route :994 · surfaced :1006 → :1424 → S-1 maiaService.ts:1444/:1507 · S-3 maiaVoice.ts:427 · S-5 maiaService.ts:2388
STATUS            LIVE (path, per calibration) · predicate UNKNOWN in production
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED · OBSERVED
COVERAGE          F-LIST-FAST (S-1) · F-LIST-CORE + F-LIST-DEEP-REPAIR (S-3) · F-LIST-DEEP-CONSULT (S-5). ⛔ F-LIST-DEEP-PRIMARY has no memory prompt seam
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PRESENT, RUNTIME-GATED (SQL boundary) — five refusal predicates incl. sacred_protected absolute refusal (:285), PRACTITIONER_ATTRIBUTION_GUARD, member_response_status. ⭐ The strongest memory-side gate found anywhere in the domain
GOVERNING SOURCE  NONE LOCATED for the predicate; runtime witness docs/ops/MAIA_MEMORY_SELECTION_REALITY_REPORT_2026-08-04.md:8 (SHA 57b0324fd ≠ subject; predicate has moved since)
SOURCE RECORD     B §2.5
```

```text
ROW ID            P3-B-04
DOMAIN            B
NAMED OBJECT      loadPriorCrossSessionExchanges (conversational recall) — conversation_turns
ARTIFACT          lib/maia/memoryLoaders.ts:195 (:209) · consent :241/:245 · surfaced route :1061 → :1426 → S-1 maiaService.ts:1423/:1507 · S-3 maiaVoice.ts:425 · S-5 :2386
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED · GOVERNED (member-writable consent column)
COVERAGE          F-LIST-FAST · F-LIST-CORE · F-LIST-DEEP-REPAIR · F-LIST-DEEP-CONSULT. ⛔ Not F-LIST-DEEP-PRIMARY
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PRESENT — conversational_recall_enabled read at loader (:245), default-on, graceful-true on error; member-writable via PATCH /api/members/recall-preferences (:96, allowlist :43-45), UI components/settings/MemoryConsentSection.tsx
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §2.3
```

```text
ROW ID            P3-B-05
DOMAIN            B
NAMED OBJECT      loadRecentMarkedEpisodes (episodic, member-marked) — episodic_memories
ARTIFACT          lib/maia/memoryLoaders.ts:283 (:297-299) · consent :328/:332 · surfaced route :1087 → :1427 → S-1 maiaService.ts:1433/:1507 · S-3 maiaVoice.ts:426 · S-5 · write app/api/sovereign/episodes/mark/route.ts (DELETE :372-376)
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED
COVERAGE          F-LIST-FAST · F-LIST-CORE · F-LIST-DEEP-REPAIR · F-LIST-DEEP-CONSULT. ⛔ Not F-LIST-DEEP-PRIMARY
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — episodic_recall_enabled is READ and enforced (memoryLoaders.ts:332) and cited as consentBasis (producerRegistry.ts:133), but ⛔ has NO member write path: recall-preferences allows one column and names episodic only in a comment (:20). The gate exists and is enforced on read; the member cannot move it
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §2.4
```

```text
ROW ID            P3-B-06
DOMAIN            B
NAMED OBJECT      loadRecentDevelopmentalMemories → buildMemoryInfluencePlan — developmental_memories
ARTIFACT          lib/maia/memoryOrchestrator.ts:214 · loaded route :945-948 · surfaced :991 → :1421 → maiaService.ts:1398 → :1507 · FAST_ONLY_ADDENDA declared maiaService.ts:3308
STATUS            PARTIAL — LOADED on every eligible turn at every tier; SURFACED on FAST only
ALTITUDE          EXISTS · WIRED
COVERAGE          F-LIST-FAST ONLY. ⛔ Cannot reach a CORE or DEEP prompt (maiaService.ts:3291-3307), against an observed prevalence the same comment records as CORE 72.8% / FAST 27.2%
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — route :943 allowCrossSessionMemory && userId (derived :520 as isRecognizedUser && !isSanctuary). ⛔ No per-layer member consent gate exists for developmental or theme signals
GOVERNING SOURCE  NONE LOCATED; behaviour named in-code a "deliberate product decision, deferred by founder ruling 2026-08-13"
SOURCE RECORD     B §2.2
```

```text
ROW ID            P3-B-07
DOMAIN            B
NAMED OBJECT      loadRecentThemeSignals (pattern cue) — member_theme_signals
ARTIFACT          route :947 · surfaced inside the B-06 influence block (:991 → :1421 → maiaService.ts:1507)
STATUS            PARTIAL
ALTITUDE          EXISTS · WIRED
COVERAGE          F-LIST-FAST ONLY (inside B-06's block). ⛔ Not F-LIST-CORE · ⛔ not F-LIST-DEEP-*
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — same route :943 gate as B-06; no per-layer consent gate
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-07; §2.2
```

```text
ROW ID            P3-B-08
DOMAIN            B
NAMED OBJECT      is_breakthrough flag on atoms — member_memory_atoms
ARTIFACT          ORDER BY is_breakthrough DESC in memoryAtomsLoader.ts:278-291 · app/api/sovereign/atoms/[id]/breakthrough/route.ts:88 POST / :128 DELETE
STATUS            WIRED-BUT-UNOBSERVED (stop stage UPDATED)
ALTITUDE          EXISTS · WIRED
COVERAGE          Rides the atoms addendum — F-LIST-FAST · F-LIST-CORE · F-LIST-DEEP-REPAIR · F-LIST-DEEP-CONSULT. ⛔ Not F-LIST-DEEP-PRIMARY
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD (member mark/unmark routes exist; no gate named for the flag itself)
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-08; §7.1
```

```text
ROW ID            P3-B-09
DOMAIN            B
NAMED OBJECT      MemoryWritebackService — writes developmental_memories · breakthrough_moments · conversation_insights
ARTIFACT          lib/memory/MemoryWriteback.ts:603/:689/:732 · sanctuary skip route :1697
STATUS            WIRED-BUT-UNOBSERVED (write-only)
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED (sanctuary skip)
COVERAGE          NOT APPLICABLE — write-only; the record traces no prompt seam. Runs on the live sovereign list route turn; tier NOT DETERMINED BY SOURCE RECORD
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND for the formation threshold — what rises to a developmental_memory or a breakthrough_moment is decided in-code with no traced governing rule
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-09; §10.2
```

```text
ROW ID            P3-B-10
DOMAIN            B
NAMED OBJECT      buildMemberLiveContext ("member web")
ARTIFACT          lib/memory/MemberLiveContext.ts (incl. deriveFieldState, :390 spiral-state load) · sources member_spiral_state · session summaries · member_patterns · journals · relationship_essences · member_theme_signals · gated route :750
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED (sanctuary)
COVERAGE          F-LIST-FAST (S-1 memberWebAddendum) · F-LIST-CORE + F-LIST-DEEP-REPAIR (S-3, maiaVoice.ts:422). ⛔ NOT named in S-5 (DEEP-consultation) · ⛔ not F-LIST-DEEP-PRIMARY
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — sanctuary gate at route :750
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-10; §3
```

```text
ROW ID            P3-B-11
DOMAIN            B
NAMED OBJECT      RelationshipAnamnesisPostgres (essence) — relationship_essences
ARTIFACT          named in B §1 (stop stage UPDATED); relationship_essences is one of B-10's sources
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED
COVERAGE          NOT DETERMINED BY SOURCE RECORD — not named in B §3's by-tier list; relationship_essences is a source of the member web (P3-B-10)
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-11
```

```text
ROW ID            P3-B-12
DOMAIN            B
NAMED OBJECT      RelationshipMemoryService (loadRelationshipMemory)
ARTIFACT          surfaced S-4 lib/sovereign/maiaVoice.ts:888-892 via formatRelationshipMemoryForPrompt; FAST via maiaService.ts:1289-1290
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED
COVERAGE          F-LIST-FAST + F-LIST-CORE only. ⛔ Not F-LIST-DEEP-* 
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-12; §3
```

```text
ROW ID            P3-B-13
DOMAIN            B
NAMED OBJECT      Relational Context Bridge (getMemberActiveRelationalContext) — member_relationships
ARTIFACT          route :908 gate · surfaced S-1 maiaService.ts:1507 · S-3 maiaVoice.ts:431 · S-5 maiaService.ts:2386-2393
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED (sanctuary; explicit handoff)
COVERAGE          F-LIST-FAST · F-LIST-CORE · F-LIST-DEEP-REPAIR · F-LIST-DEEP-CONSULT. ⛔ Not F-LIST-DEEP-PRIMARY
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — sanctuary gate at route :908
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-13; §3
```

```text
ROW ID            P3-B-14
DOMAIN            B
NAMED OBJECT      loadRecentIChingReadings (divination recall)
ARTIFACT          gated route :1105 · surfaced S-1 (three divination blocks, maiaService.ts:1507) · S-3 maiaVoice.ts:428-430 · S-5 maiaService.ts:2386-2393
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED (sanctuary)
COVERAGE          F-LIST-FAST · F-LIST-CORE · F-LIST-DEEP-REPAIR · F-LIST-DEEP-CONSULT. ⛔ Not F-LIST-DEEP-PRIMARY
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — sanctuary gate at route :1105
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-14; §3
```

```text
ROW ID            P3-B-15
DOMAIN            B
NAMED OBJECT      ConsciousnessMemoryLattice — resonance recall (and its separate write half)
ARTIFACT          lib/memory/ConsciousnessMemoryLattice.ts, imported maiaService.ts:44 · recall :3057 (mode gate :3049-3053) · truncation :3069-3085 · = null :3102 · write :3689 (gate :3676, refusal logged :3706)
STATUS            PARTIAL · recall ORPHANED downstream · write WIRED-BUT-UNOBSERVED — all three restated
ALTITUDE          EXISTS · WIRED · CONFIG-SELECTED (memoryMode)
COVERAGE          NOT APPLICABLE for the recall — "SURFACED WHERE: ⛔ NOWHERE"; the recalled object never enters meta, a prompt, or a response. Write half runs inside getMaiaResponse; its family reach is NOT DETERMINED BY SOURCE RECORD
LADDER            KNOWS — established by the source record: "a KNOWS ≠ CONSIDERS case in its purest form". ⛔ CONSIDERS is explicitly excluded
GOVERNANCE GATE   PARTIAL — write gated by allowLatticeWrite (:3676); read: none — the recall runs and is discarded regardless
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §2.6
```

```text
ROW ID            P3-B-16
DOMAIN            B
NAMED OBJECT      spiralStatePersistence — member_spiral_state
ARTIFACT          named in B §1 (stop stage UPDATED); member_spiral_state is one of B-10's sources
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED
COVERAGE          NOT DETERMINED BY SOURCE RECORD — not named in B §3's by-tier list. ⚠️ Domain C carries the same table as P3-C-03 with three independent loaders; ⛔ the two rows are not merged
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD (domain C records R16 admission guard at one of three loaders)
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-16
```

```text
ROW ID            P3-B-17
DOMAIN            B
NAMED OBJECT      Selflet temporal message — selflet_messages · selflet_nodes
ARTIFACT          surfaced S-1 selfletPromptBlock (maiaService.ts:1507); B §3 by-tier list
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED
COVERAGE          F-LIST-FAST + F-LIST-CORE only. ⛔ Not F-LIST-DEEP-*
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-17; §3
```

```text
ROW ID            P3-B-18
DOMAIN            B
NAMED OBJECT      recordMemoryTransitions — memory_transition_records
ARTIFACT          named in B §1 (stop stage PERSISTED, observability)
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED
COVERAGE          NOT APPLICABLE — observability; no prompt seam
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD. ⚠️ No member deletion path exists for this table (B §7.2)
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-18; §7.2
```

```text
ROW ID            P3-B-19
DOMAIN            B
NAMED OBJECT      ConversationMemoryUsesStore (retrieval audit) — conversation_memory_uses
ARTIFACT          recordRetrievedCandidates, MemoryBundle.ts:133
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED
COVERAGE          NOT APPLICABLE — observability; no prompt seam
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD. ⚠️ No member deletion path exists for this table (B §7.2)
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-19; §7.2
```

```text
ROW ID            P3-B-20
DOMAIN            B
NAMED OBJECT      buildMemoryHealth / recordRuntimeTurn — runtime_events.memory_layers
ARTIFACT          lib/maia/memoryHealth.ts:60-74 (meanings :44-57, layerStatus :122) · computed route :1178-1209 · persisted lib/maia/substrateObservability.ts:99-130 via maiaRuntimeContext.ts:251 · conditions isBaseChainDegraded route :1210-1214
STATUS            WIRED-BUT-UNOBSERVED · 8/12 layers fed · 4/12 structurally constant
ALTITUDE          EXISTS · WIRED · OBSERVED (it is itself the observability surface)
COVERAGE          NOT APPLICABLE — not a prompt block. Conditions the §VI fallback and the degradation warning
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — canon citation only (memoryHealth.ts:4 cites docs/canon/MAIA_MEMORY_CANON_v1.0.md §VII); ⛔ no runtime gate
GOVERNING SOURCE  docs/canon/MAIA_MEMORY_CANON_v1.0.md §VII — cited, ⛔ content not re-adjudicated by the source record
SOURCE RECORD     B §2.8
```

```text
ROW ID            P3-B-21
DOMAIN            B
NAMED OBJECT      memoryCanonGuard (MEMORY_CANON_GUARD_PROMPT · FORBIDDEN_AMNESIA_PATTERNS · scrubMemoryAmnesia · containsForbiddenAmnesia)
ARTIFACT          lib/maia/prompts/memoryCanonGuard.ts:47/:109/:200/:226 · prompt side lib/consciousness/MAIA_RUNTIME_PROMPT.ts:4,:137 and app/api/voice/stream-conversation/route.ts:1236 · output side route :1487 (_memoryScrub) and app/api/oracle/conversation/route.ts:2569
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED
COVERAGE          Prompt side: "every tier that carries MAIA_RUNTIME_PROMPT" (source record's words), plus F-VOICE-STREAM (:1236). Output side: the live sovereign list route (:1487) and F-ORACLE (:2569). ⛔ Which tiers carry MAIA_RUNTIME_PROMPT is NOT DETERMINED BY THIS SOURCE RECORD
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PRESENT (prompt floor + post-generation scrub). ⚠️ Whether the scrubbed text replaces member-facing text on the sovereign route was NOT ESTABLISHED (B OQ-4). Beside it: MEMORY_SPEECH_ACT_BOUNDARY appended by appendAllContextAddenda (:507)
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §2.9
```

```text
ROW ID            P3-B-22
DOMAIN            B
NAMED OBJECT      MemoryGate.resolveMemoryMode — env + allowlist
ARTIFACT          gates route :541 shouldBuildMemory / :545 MemoryBundle skip; lattice write gate maiaService.ts:3676
STATUS            WIRED-BUT-UNOBSERVED (stop stage COMPUTED — a gate)
ALTITUDE          EXISTS · WIRED · CONFIG-SELECTED
COVERAGE          NOT APPLICABLE — a gate; determines whether memory building runs on the live list route turn. ⚠️ INF-3: an env var or allowlist selecting behaviour authorizes nothing
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   It is itself the gate; ⛔ no governing rule located for the mode vocabulary
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-22
```

```text
ROW ID            P3-B-23
DOMAIN            B
NAMED OBJECT      TurnPosture / contentWritable (Sanctuary)
ARTIFACT          lib/sanctuary/turnPosture.ts:24/:29/:44-47/:56/:58/:71 · lib/sanctuary/sanctuaryGuards.ts:26/:42/:54 · enforced TurnsStore.ts:113/:206/:256 · sessionManager.ts:67 · corpusCallosumService.ts:115/:175 · route gates :397/:408/:520/:541/:545/:550/:750/:826/:908/:1105/:1697
STATUS            WIRED-BUT-UNOBSERVED (stop stage COMPUTED — a gate at four write boundaries)
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED
COVERAGE          NOT APPLICABLE — a write-boundary gate; no prompt seam
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PRESENT AND STRUCTURAL — private constructor, fails closed (ANY affirmative signal wins), cannot be forged by an object literal; ⛔ no in-session override path found. ⚠️ A runtime_events row is still written for sanctuary turns carrying twelve memory_layers statuses, de-identified (substrateObservability.ts:92-130, :143-146)
GOVERNING SOURCE  The six documented Sanctuary invariants (CLAUDE.md); invariant 2 (no training data) NOT EVALUABLE from domain B; invariant 4 (visual clarity) not traced
SOURCE RECORD     B §8
```

```text
ROW ID            P3-B-24
DOMAIN            B
NAMED OBJECT      MemoryPalaceOrchestrator and its eight services (episodic · somatic · morphic · semantic · achievement · consciousnessEvolution · coherenceField · sessionMemoryPostgres)
ARTIFACT          lib/consciousness/memory/MemoryPalaceOrchestrator.ts:8-15, retrieve :21-88, writes :175/:188/:199/:207/:233 · consumed app/api/oracle/conversation/route.ts:902, :1499, prompt seam S-6 :2787
STATUS            WIRED-BUT-UNOBSERVED on /api/oracle/conversation · NOT REACHED on the sovereign list route
ALTITUDE          EXISTS · WIRED
COVERAGE          F-ORACLE ONLY (S-6). ⛔ NOT reached from app/api/sovereign/app/maia/list/route.ts — so no F-LIST-* family. ⚠️ Whether that route serves member traffic is UNKNOWN in the source record's container
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND at the orchestrator — no sanctuary check, no memory-mode check, no member consent gate appears in the file; whatever gating exists is the calling route's
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §2.7
```

```text
ROW ID            P3-B-25
DOMAIN            B
NAMED OBJECT      lib/maia/recurrenceDetector.ts
ARTIFACT          lib/maia/recurrenceDetector.ts (reads member_theme_signals :94); grep returns only the file itself
STATUS            DORMANT (zero callers)
ALTITUDE          EXISTS
COVERAGE          NOT APPLICABLE — no reachable caller found
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD
GOVERNING SOURCE  memory/project_recurrence_prevention_architecture.md is cited at maiaRuntimeContext.ts:22 in domain A and ⛔ NOT VERIFIED
SOURCE RECORD     B §1 · B-25; §4.1
```

```text
ROW ID            P3-B-26
DOMAIN            B
NAMED OBJECT      lib/memory/confidenceDecay.ts (calculateDecayedConfidence · shouldPromptForConfirmation)
ARTIFACT          confidenceDecay.ts:199 (shouldPromptForConfirmation, zero callers repo-wide) · imported MemoryBundle.ts:16 and never called there
STATUS            ORPHANED (imported, never called)
ALTITUDE          EXISTS
COVERAGE          NOT APPLICABLE for the TS helper. ⚠️ A DIFFERENT object — the SQL function calculate_decayed_confidence — is applied inside P3-B-02 (MemoryBundle.ts:266), whose coverage is F-LIST-FAST only. ⛔ The two are not merged
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD
GOVERNING SOURCE  NONE LOCATED — P1-01 slice 03 records "there is no single authoritative definition of decay today"
SOURCE RECORD     B §4.2; CTR-B4
```

```text
ROW ID            P3-B-27
DOMAIN            B
NAMED OBJECT      lib/anamnesis/* (AnamnesisField · DecentralizedMemory · MemoryCoreIndex · CollectiveConsciousnessBridge · UnifiedMemoryInterface)
ARTIFACT          AnamnesisField.ts (zero importers outside lib/anamnesis/) · DecentralizedMemory.ts + UnifiedMemoryInterface.ts (sole importer lib/integrated-oracle-system.ts, itself zero importers) · CollectiveConsciousnessBridge.ts (importer chain reaches no traced route) · MemoryCoreIndex.ts (importer inside the orphaned-backend tree)
STATUS            DORMANT / ORPHANED — both restated as the source record gives them
ALTITUDE          EXISTS
COVERAGE          NOT APPLICABLE — no traced route entry
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-27; §4.1/4.2
```

```text
ROW ID            P3-B-28
DOMAIN            B
NAMED OBJECT      lib/memory/MemoryManager.ts · lib/memory/VaultSymbolIndex.ts
ARTIFACT          both files; zero importers
STATUS            DORMANT (zero importers)
ALTITUDE          EXISTS
COVERAGE          NOT APPLICABLE — zero importers
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-28; §4.1
```

```text
ROW ID            P3-B-29
DOMAIN            B
NAMED OBJECT      lib/memory/mem0.ts · lib/memory/beads-sync/
ARTIFACT          beads-sync referenced only by lib/maia/substrateMap.ts:254 as an inventory entry
STATUS            legacy; mem0 reachable from lib/semantic · beads-sync DORMANT — restated verbatim; ⛔ "legacy" is not an instrument enum value
ALTITUDE          EXISTS
COVERAGE          NOT DETERMINED BY SOURCE RECORD for mem0 (reachable from lib/semantic; no turn path traced) · NOT APPLICABLE for beads-sync
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-29; §4.1
```

```text
ROW ID            P3-B-30
DOMAIN            B
NAMED OBJECT      memory_contracts table
ARTIFACT          read only by lib/trust/service.ts
STATUS            "read only by lib/trust/service.ts — outside the memory path" — restated verbatim; ⛔ not one of the instrument's enum values and ⛔ not coerced. Stop stage PERSISTED
ALTITUDE          EXISTS
COVERAGE          NOT APPLICABLE — not reached by any traced turn path in this domain
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-30; §4.3
```

```text
ROW ID            P3-B-31
DOMAIN            B
NAMED OBJECT      case_memories · case_memory_chunks · memory_links · vault_symbols · vault_query_patterns (declared tables)
ARTIFACT          declared in migrations; memory_links written/deleted by lib/memory/stores/MemoryLinksStore.ts:333. B §4.3 additionally names vault_symbol_links · vault_symbol_misses in the same class
STATUS            EXISTS (table) — "not reached by any traced turn path"
ALTITUDE          EXISTS
COVERAGE          NOT APPLICABLE — no reader on any traced turn path
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NOT DETERMINED BY SOURCE RECORD. ⛔ A table's existence in a migration is recorded as a declaration and nothing more; no claim that any is empty, unused in production, or safe to remove
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     B §1 · B-31; §4.3
```

---

# DOMAIN C — DEVELOPMENTAL + RELATIONAL MEMORY

Source: `PHASE-1-WHOLE-ORGANISM-CENSUS-01_P1-02/C_developmental_relational.md`.
⚠️ Carried with every C row: the record's central answer — **"SEVERAL SYSTEMS, PLUS ONE OVERLAP
BAND. It is not one system, and it is not cleanly several."** Fourteen substrates, seven bands;
⛔ no shared identity primitive, provenance column, consent gate, decay model or write boundary.

```text
ROW ID            P3-C-01
DOMAIN            C
NAMED OBJECT      developmental_readings — frozen developmental reading (WS2-07)  [Band I]
ARTIFACT          database/migrations/20260904000001_developmental_readings.sql:1-47 (immutability trigger :88-101, key refusal :105-121, outcome CHECK :75-80) · commission.ts · store.ts:71/:120/:136 · lib/manuscript/ask/frozenDevelopmentalReading.ts:80 · app/api/sovereign/manuscripts/[id]/readings/route.ts
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED · GOVERNED
COVERAGE          NOT DETERMINED BY SOURCE RECORD — loaded by the Ask lane's frozen-reading module and surfaced on member-facing manuscript routes; ⛔ no MAIA-cognition prompt seam traced
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   ⭐ PRESENT AND ENFORCED IN SCHEMA — UPDATE refused by trigger; insert trigger admits exactly seven observation keys and refuses interpretation · questions · uncertainty · severity · priority · confidence · score · rank. The strongest governance binding in domain C
GOVERNING SOURCE  docs/programme/WS2-07-DECIDE_DEVELOPMENTAL_READING_OBJECT.md, cited in-migration; INV-0/1/2/3/4/22/25 named
SOURCE RECORD     C §3 · C-1
```

```text
ROW ID            P3-C-02
DOMAIN            C
NAMED OBJECT      developmental_observation_standing_events — member standing toward an observation (BUILD-07F)  [Band I]
ARTIFACT          database/migrations/20260906000001_developmental_observation_standing.sql (:20-22, :27-30, :78, dose_no_update trigger :96-102) · lib/manuscript/standing/store.ts:74/:87/:163/:168 · app/api/sovereign/manuscripts/[id]/readings/[readingId]/standings/route.ts
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · GOVERNED
COVERAGE          NOT DETERMINED BY SOURCE RECORD — member-facing standings route; ⛔ no MAIA-cognition prompt seam traced
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PRESENT — append-only by trigger; standing ∈ {keep, dismiss, unresolved}; unset is zero events, "there is no default; the governed default is NO ROW". ⭐ The absence of an actor column makes a system write UNSAYABLE, not UNWRITABLE — the schema explicitly refuses to be misread as evidence of its own guarantee
GOVERNING SOURCE  WS2-07-BUILD-07F_DESIGN_2026-09-05.md, named as design of record; D3/D6/D7 cited in-schema
SOURCE RECORD     C §3 · C-2
```

```text
ROW ID            P3-C-03
DOMAIN            C
NAMED OBJECT      member_spiral_state (Bridge D)  [Band II]
ARTIFACT          database/migrations/20260213200001_member_spiral_state.sql · persisted lib/consciousness/spiralStatePersistence.ts:233/:263/:298 + innerGuideFieldPersistence.ts:73 · THREE LOADERS: app/api/oracle/conversation/route.ts:1711 (GUARDED) · lib/maia/living-field/encounterContext.ts:126 (UNGUARDED) · lib/memory/MemberLiveContext.ts:390 (UNGUARDED) · surfaced app/api/members/spiral-state/route.ts:27-28 and app/api/admin/command-center/members/route.ts:34-35
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED (at one loader of three) · CI-GATED (refusal R16)
COVERAGE          F-ORACLE (loader 1, guarded by admitPersistedStateForShaping) · the living-field encounter/refine prompt (loader 2 — full SpiralState placed on ctx at :144; that renderer emits only element/phase/motion at :196-198) · MemberLiveContext (loader 3; its tier reach is NOT DETERMINED BY THIS SOURCE RECORD — domain B carries the member web as P3-B-10)
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL, SINGLE-SITED — admitPersistedStateForShaping() strips INFERRED_DEVELOPMENTAL_FIELDS (lib/relational/developmentalStateAdmission.ts:61-71), asserted by refusal-16; ⛔ invoked at exactly ONE of three loaders
GOVERNING SOURCE  NONE LOCATED — no migration-cited ruling, no canon reference; the R16 file header cites docs/architecture/COMPRESSION_AUDIT_DEVELOPMENTAL_ECOLOGY_2026-07-08.md and task_06badd89, ⛔ existence NOT VERIFIED
SOURCE RECORD     C §3 · C-3; §5.1
```

```text
ROW ID            P3-C-04
DOMAIN            C
NAMED OBJECT      member_relationships + relationship_entries + relationship_field_state  [Band III]
ARTIFACT          database/migrations/20260403000001_relationship_field_v1.sql · app/api/relationships/[id]/checkin/route.ts:97-108/:111 · lib/relationships/relationshipContextService.ts:84/:116/:132/:143-148/:162 · surfaced app/api/sovereign/app/maia/list/route.ts:916 and app/api/oracle/conversation/route.ts:2409
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED
COVERAGE          The live sovereign list route prompt (:916) and F-ORACLE (:2409). Tier reach on the list route is NOT DETERMINED BY THIS SOURCE RECORD — domain B carries the relational-context addendum as P3-B-13
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PRESENT AND NARROW at the surfacing site — explicit member handoff only (list/route.ts:906-910, fires on a client-supplied relationshipContextId, allowRecentThreadFallback off, in-code reason "ambient detection is membrane leakage if it arrives before observation"); sanctuary-gated :908
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     C §3 · C-4; §5.2
```

```text
ROW ID            P3-C-05
DOMAIN            C
NAMED OBJECT      member_relational_signals (system-detected relational state)  [Band III]
ARTIFACT          database/migrations/20260409000010_member_relational_signals.sql (source CHECK :34, confidence :37, counterpart_label :16, dynamic_tags :25-26) · lib/relationships/detectRelationalSignal.ts · relationshipSignalService.ts:183/:313/:340/:393 · called list/route.ts:1830 (fire-and-forget) and app/api/sovereign/app/maia/route.ts:448 · surfaced app/api/founder/relational-signals/route.ts:233
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED (sanctuary at the enclosing block)
COVERAGE          NOT APPLICABLE for MAIA cognition — TRACED NEGATIVE FINDING: relationshipContextService does not read this table, and its only located surfacing path is the founder review lane
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — sanctuary honoured at the enclosing block (list/route.ts:1826); ⛔ no consent gate, no member notice and no member visibility surface located for the inferred signal
GOVERNING SOURCE  NONE LOCATED — ⛔ no consent model for inferred relational state about a member's intimate relationships
SOURCE RECORD     C §3 · C-5
```

```text
ROW ID            P3-C-06
DOMAIN            C
NAMED OBJECT      member_patterns (practitioner-scoped developmental judgement)  [Band IV]
ARTIFACT          database/migrations/20260316000003_member_patterns.sql · lib/patterns/createPattern.ts:13 · respondToPattern.ts:19 · getMemberPatterns.ts:45 (practitioner, all statuses) / :55-57 (member, offered·confirmed·rejected only) · app/api/studio/clients/[id]/patterns/route.ts:33-45 · app/api/members/patterns/route.ts:16
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED (linkage-row check)
COVERAGE          NOT DETERMINED BY SOURCE RECORD — practitioner and member API surfaces; ⛔ no MAIA-cognition prompt seam traced
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND — access is authenticated practitioner + existence of a practitioner_clients row. ⚠️ That is a linkage check, not a consent record; the practitioner_clients schema carries no consent, scope or visibility column. ⭐ A developmental judgement about a member is deliberately withheld from that member while 'emerging', under a code comment only
GOVERNING SOURCE  NONE LOCATED — the only document naming this table contradicts the code (see contradictions, C-8.1)
SOURCE RECORD     C §3 · C-6
```

```text
ROW ID            P3-C-07
DOMAIN            C
NAMED OBJECT      pattern_ledger (MAIA-detected patterns)  [Band IV]
ARTIFACT          lib/patterns/getMemberPatterns.ts (getMaiaDetectedPatterns) · PatternResponseService.ts:238 · PatternOfferingService.ts:222 · app/api/members/patterns/[id]/label/route.ts:32 (sourceType discriminator) · surfaced app/api/members/patterns/route.ts:16
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED
COVERAGE          NOT DETERMINED BY SOURCE RECORD — member-facing patterns endpoint; ⛔ no MAIA-cognition prompt seam traced
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND at the subject
GOVERNING SOURCE  NONE LOCATED — ⛔ no ruling located governing member_patterns ↔ pattern_ledger sharing one member-facing endpoint. ⚠️ Two migrations declare pattern_ledger (20260204100001, 20260315120000); not reconciled
SOURCE RECORD     C §3 · C-7
```

```text
ROW ID            P3-C-08
DOMAIN            C
NAMED OBJECT      living_field_affinities (system-created affinity)  [Band V]
ARTIFACT          database/migrations/20260702000001_living_field_affinities.sql (created_by DEFAULT 'system', evidence_reason NOT NULL, affinity_score NUMERIC(4,3)) · written lib/maia/living-field/indexAtom.ts:62 + scripts/backfill-living-field-affinities.ts · loaded encounterContext.ts:110-119 (ORDER BY affinity_score DESC LIMIT 10) · app/api/maia/living-field/route.ts:55 · gathering/route.ts:46-67 · surfaced encounter/route.ts:107,153,227 and refine/route.ts:35
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED (constitutional guards re-applied at read time in both consumers)
COVERAGE          The living-field encounter and refine route prompts. Domain A §A-15 names these among F-PERIPHERAL; ⛔ no F-LIST-* tier family traced. Scope stated precisely: the member's OWN material, self-scoped by member_id on both queries — ⛔ NOT member-to-member
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — status/register guards at both read sites; disclosed denominator and stated criterion at gathering/route.ts:58-67; ⛔ NO gate located governing the scoring or the ranking itself
GOVERNING SOURCE  docs/canon/ECOLOGY_OF_MIRRORS.md, cited in-route — governs INSPECTABILITY, ⛔ not selection weight or the LIMIT 10 prompt cut
SOURCE RECORD     C §3 · C-8; §5.3
```

```text
ROW ID            P3-C-09
DOMAIN            C
NAMED OBJECT      member_theme_signals (participatory reality themes)  [Band V]
ARTIFACT          database/migrations/20260316000001_participatory_reality_themes.sql (six closed themes; signal_type ∈ {active, emerging, blocked, integrating}) · written lib/consciousness/participatoryRealityHelper.ts:110 (fire-and-forget) · refusal lib/circles/fieldPulseService.ts:5-10
STATUS            WIRED-BUT-UNOBSERVED (write path only; no member-facing read located)
ALTITUDE          EXISTS · WIRED · GOVERNED (as a refusal)
COVERAGE          NOT DETERMINED BY THIS SOURCE RECORD — it traces the write path only and locates no member-facing read. ⚠️ Domain B carries the same table as P3-B-07 reaching F-LIST-FAST only, inside the influence block. Both restated; ⛔ not merged and ⛔ not reconciled
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   ⭐⭐ PRESENT, AND IT IS A REFUSAL — "System-inferred member themes (member_theme_signals) are SUSPENDED from the … Do not reintroduce member_theme_signals here without a ratified collective …". A system-inferred developmental signal explicitly withheld from a collective surface
GOVERNING SOURCE  NONE LOCATED (the refusal is in-code, naming a ratification that has not occurred)
SOURCE RECORD     C §3 · C-9; §5.5
```

```text
ROW ID            P3-C-10
DOMAIN            C
NAMED OBJECT      episodic_memories  [Band VI]
ARTIFACT          database/migrations/20260115000010_episodic_memories.sql · lib/consciousness/memory/EpisodicMemoryService.ts:64/:103/:127/:151/:176/:202/:230 · app/api/sovereign/episodes/mark/route.ts:28-48 · consumers MemoryPalaceOrchestrator, substrateMap
STATUS            WIRED-BUT-UNOBSERVED
ALTITUDE          EXISTS · WIRED · RUNTIME-GATED
COVERAGE          NOT DETERMINED BY THIS SOURCE RECORD — it traces the marking route and explicitly defers retrieval/decay to domain B ("noted and not re-censused"), where P3-B-05 carries it
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   PARTIAL — ⭐ the strongest consent reasoning found on a memory write in this domain: refuses Sanctuary-origin writes, refuses client-asserted provenance, resolves session ownership server-side, and returns ONE identical governed denial for missing / foreign / inaccessible sessions so nothing reveals whether a session exists or whose it is
GOVERNING SOURCE  NONE LOCATED (no ruling document binding the table)
SOURCE RECORD     C §3 · C-10
```

```text
ROW ID            P3-C-11
DOMAIN            C
NAMED OBJECT      Confidence decay over formed memory — TS calculateDecayedConfidence + SQL calculate_decayed_confidence
ARTIFACT          lib/memory/confidenceDecay.ts:61 (confirmed effect halfLifeDays*1.5 at :78-79) · database/migrations/20251231_memory_architecture_enhancements.sql (COALESCE(last_confirmed, formed_at) :27, GREATEST(0.3,…) :36, half-life CASE :13-24) · both invoked: MemoryBundle.ts:16 imports TS, :266 invokes SQL; PreferenceConfirmationStore.ts:211 invokes SQL
STATUS            NOT DETERMINED BY SOURCE RECORD — the record assigns no single status to the pair; it records that BOTH ARE CALLED and that one module calls both
ALTITUDE          EXISTS · WIRED
COVERAGE          NOT DETERMINED BY THIS SOURCE RECORD. ⚠️ The SQL function is applied inside P3-B-02 (F-LIST-FAST only) and inside PreferenceConfirmationStore; the TS helper is ORPHANED as P3-B-26
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND — and two divergent implementations are both live
GOVERNING SOURCE  NONE LOCATED — ⛔ no authoritative definition of decay
SOURCE RECORD     C §3 · C-11; §8.2
```

```text
ROW ID            P3-C-12
DOMAIN            C
NAMED OBJECT      trust_observations  [Band VII]
ARTIFACT          database/migrations/20260407200002_trust_observations.sql (:1-4 header; response_type ∈ {evocative, interpretive, care, direct} · engagement_proxy FLOAT · feedback ∈ {positive, negative} · context jsonb) · lib/trust/trustObservationService.ts:45 · CALLERS: ⛔ NONE FOUND
STATUS            ORPHANED
ALTITUDE          EXISTS
COVERAGE          NOT APPLICABLE — no callers; no traced decision path at the subject. Declared future use ("Feeds future symbolic affinity weighting") is an inference→weighting path recorded as DECLARED INTENT, ⛔ not a live path
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   NONE FOUND
GOVERNING SOURCE  NONE LOCATED. ⚠️ Vocabulary: unrelated to lib/trust/service.ts (privacy envelopes, live) and to skills_registry.trust_level (rollout control)
SOURCE RECORD     C §3 · C-12; §5.4
```

```text
ROW ID            P3-C-13
DOMAIN            C
NAMED OBJECT      lib/relationship/scope.ts — the four-scope relational architecture  [Band VII]
ARTIFACT          lib/relationship/scope.ts:1-19 (member_field · commitment · practitioner_practice "never directly offerable" · practitioner_wisdom; "they never merge" :11-19) · CALLERS: ⛔ NONE FOUND outside lib/relationship/__tests__/scope.test.ts
STATUS            DORMANT
ALTITUDE          EXISTS
COVERAGE          NOT APPLICABLE — zero non-test callers
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   ⭐⭐ The most explicit relational-authority boundary in domain C — and it is unreachable. ⛔ Being authored is not being wired
GOVERNING SOURCE  docs/design/now-what/THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06.md, cited in-file at :5-6; ⛔ existence NOT VERIFIED by the source record
SOURCE RECORD     C §3 · C-13; §8.5
```

```text
ROW ID            P3-C-14
DOMAIN            C
NAMED OBJECT      lib/coachField/practitionerProjection.ts  [Band VII]
ARTIFACT          lib/coachField/practitionerProjection.ts:1-30 (three-field separation; client sovereign field "is never reachable from here at all"; scope derived from the authenticated actor server-side, never a caller-submitted practitioner_id, :28-31) · CALLERS: ⛔ NONE FOUND
STATUS            DORMANT
ALTITUDE          EXISTS
COVERAGE          NOT APPLICABLE — zero callers
LADDER            NOT DETERMINED BY SOURCE RECORD
GOVERNANCE GATE   Reasoning stated in-file; ⛔ unreachable. ⭐ The module that reasons most carefully about what a practitioner may know is dormant, while the live practitioner read (P3-C-06) gates on a linkage row
GOVERNING SOURCE  NONE LOCATED
SOURCE RECORD     C §3 · C-14; §8.5
```

---

## Contradictions carried forward (verbatim from source records, both sides, unreconciled — do not summarize away either side)

⛔ Nothing below is resolved, ranked, or dropped. Each side is restated in the source record's own terms.

**A-1 · Registry vs orchestrator.** *Side A:* `maiaRuntimeContext.ts:81` — `between/chat`
`callsMaiaResponse: false`, reason *"uses maiaOrchestrator, not getMaiaResponse"*. *Side B:*
`maiaOrchestrator.ts:506` — it does. ⇒ a live lane reaches cognition outside the wrapper its own
header (`maiaRuntimeContext.ts:3-5`) declares mandatory. (P3-A-11)

**A-2 · DEEP addenda, in one function.** *Side A:* `maiaService.ts:2519-2521` — *"buildComprehensiveVoicePrompt
… currently does NOT iterate MaiaContext addenda"*. *Side B:* `maiaService.ts:2526-2535` +
`maiaVoice.ts:972` — it does. Four lines apart. (P3-A-05)

**A-3 · Guardrail parity.** *Side A:* `CMT-01_M0-M2_WITNESS_2026-09-03.md:82-84` — *"FAST prompt
opens with the runtime prompt and closes with the three guardrails"*. *Side B:*
`lib/sovereign/maiaService.ts` contains none of the three identifiers. The witness is true of
`floor.ts:23-26`; it is not true of `fastPathResponse`. (P3-A-03)

**A-4 · Oracle lane.** *Side A:* `CLAUDE.md` — *"~zero live traffic"*. *Side B:*
`oracle/conversation/route.ts:452` — hard 410 as the first executable statement of POST. Per
D-P1-06 the anchor is evidence, not law; the code stands. (P3-A-13)

**A-5 · Reported tier vs executed tier.** `maiaService.ts:3245` reports `processingProfile: 'DEEP'`
*"for client compatibility"* for an RCN turn that ran no tier. (P3-A-02, P3-A-06)

**A-6 · Sole-gateway claim.** *Side A:* `modelService.ts:72` — *"Main gateway for ALL text
generation in MAIA"*. *Side B:* at least four independent model reaches bypass it —
`getClaudeService` (A-14), six `new Anthropic()` routes (A-15), A-13's `MultiLLMProvider`,
DEEP-primary's `consciousnessWrapper`. (P3-A-16)

**A-7 · Egress mislabel.** `list/route.ts:1390` emits `endpoint: '/api/sovereign/app/maia'` from the
`/list` handler; acknowledged in-source as a pre-existing mislabel, left untouched. (P3-A-01)

**B-1 · The consciousness memory services: "unmapped" vs wired to a prompt.** *Side A:*
`substrateMap.ts:204-251` classifies eight services `underutilized-consciousness`, notes
*"unmapped"*, and for Morphic *"declared service, no producer, no runtime slot."* *Side B:*
`MemoryPalaceOrchestrator.ts:8-15` imports all eight, `:21-88` retrieves from seven, `:175-233`
writes to four, and `oracle/conversation/route.ts:902,:1499,:2787` consumes and prompt-injects.
Whether that route serves traffic is `UNKNOWN`. (P3-B-24)

**B-2 · `memoryHealth.pattern`: fed in the prompt path, empty in the health path.** *Side A:*
`memoryHealth.ts:103` — `pattern?: { count } // theme_signals feeds this`, under *"Wired by Cut 1"*.
*Side B:* `route :1178-1209` supplies no `pattern` input, so `layerStatus(undefined) = 'empty'` on
every turn — while `route :947` loads theme signals and `:991` routes them into the FAST prompt.
(P3-B-20, P3-B-07)

**B-3 · `memoryHealth.semantic` names a layer the path does not have.** *Side A:*
`memoryHealth.ts:63` declares `semantic`, documented `:49` as *"enduring facts, roles,
relationships, preferences."* *Side B:* `memoryHealth.ts:97-100` and `route :1182-1186` state what
feeds it is an atoms **row count** and that *"no semantic retrieval exists on this path"*;
`MAIA_MEMORY_INTEGRITY_GAP_MAP_2026-08-04.md:38` calls it *"a self-report that misstates the memory
state MAIA is in… occurring in the observability layer itself."* (P3-B-20)

**B-4 · Two definitions of decay, one imported and unused.** *Side A:* `confidenceDecay.ts` exports
`calculateDecayedConfidence`, imported at `MemoryBundle.ts:16`. *Side B:* `MemoryBundle.ts:266`
applies the SQL `calculate_decayed_confidence`; the TS function is never called in that file.
*"there is no single authoritative definition of decay today."* (P3-B-26, P3-C-11)

**B-5 · The influence plan's tier scope.** *Side A:* `route :991` computes
`memoryInfluenceAddendum` on every eligible turn at every tier and `route :1229` reports it in
`buildMaiaRuntimeContext.addenda`. *Side B:* `maiaService.ts:3291-3308` establishes it cannot reach
a CORE or DEEP prompt, against a recorded prevalence of *"CORE 72.8% / FAST 27.2%"*. The telemetry
was repaired; the behaviour was deliberately left, named a *"deliberate product decision, deferred
by founder ruling 2026-08-13."* (P3-B-06)

**B-6 · Episodic consent: enforced but unmovable.** *Side A:* `memoryLoaders.ts:332` reads
`episodic_recall_enabled`; `producerRegistry.ts:133` names it `consentBasis`. *Side B:*
`recall-preferences/route.ts:43-45` admits one column and names episodic only in a comment (`:20`)
as future work. (P3-B-05)

**B-7 · `lattice` recalls and discards.** *Side A:* `maiaService.ts:3057` performs a real resonance
recall, mode-gated `:3049-3053`, truncated per mode `:3069-3085` — *"the shape of code written to be
used."* *Side B:* nothing consumes it (`:3102` `memoryField = null`). (P3-B-15)

**B-8 · Six code enumerations of the memory arenas, none a subset of another.** `MemoryHealth` (12)
· `MemoryHealthInputs` (11) · `MemoryHealth` as populated (8) · `MemorySource` (9) ·
`ADDENDA_SPECS` (27) · `substrateMap` (30). ⛔ No code enumeration nominated as authoritative.
(carried across all B rows)

**C-1 (§8.1) · `member_patterns` ownership.** *Side A:*
`docs/DATA_BOUNDARIES_AND_OWNERSHIP.md:28` places it in **MAIA Core**, *"Inner Patterns | MAIA's
memory of themes, growth edges"*, in a domain whose declared Owner is *"The member"* (doc:9).
*Side B:* the schema is `practitioner_id UUID NOT NULL REFERENCES practitioners(id)`; rows are
created by a practitioner lane; `getMemberPatterns.ts:55` withholds `emerging` rows from the member
as *"practitioner-internal."* (P3-C-06)

**C-2 (§8.2) · Confidence decay — two live implementations.** TS `halfLifeDays * 1.5` on
member confirmation vs SQL reference-date shift (`COALESCE(last_confirmed, formed_at)`) plus a
`GREATEST(0.3, …)` floor. *"The two are not two spellings of one rule; they express different
semantics for what member confirmation does."* (P3-C-11)

**C-3 (§8.3) · The R16 guard's stated scope vs its wiring.** *Side A:* the guard declares a
class-level rule binding *"any response-shaping subsystem"* and is written to fire for future
fields. *Side B:* it is invoked at exactly one site; two other loaders of the same table exist and
do not pass through it. ⛔ Not characterised as a defect. (P3-C-03)

**C-4 (§8.4) · `CLAUDE.md` route liveness vs the guard's placement.** *Side A:* `CLAUDE.md` records
`oracle/conversation/route.ts` as *"~zero live traffic"* and names the list route as live.
*Side B:* the R16 guard's sole call site is in `oracle/conversation/route.ts`. ⚠️ No runtime witness
for either route was located in-repo, so neither side is confirmed under the LIVE calibration.
(P3-C-03)

**C-5 (§8.5) · Practitioner access — stated boundary vs live gate.** *Side A:*
`practitionerProjection.ts` and `relationship/scope.ts` state strict, non-merging, server-derived
scope rules — and are dormant. *Side B:* the live practitioner read
(`studio/clients/[id]/patterns/route.ts:33-44`) gates on an authenticated practitioner plus a
`practitioner_clients` linkage row carrying no consent or scope column. (P3-C-06, P3-C-13, P3-C-14)

### Cross-record divergences (both records restated, ⛔ neither reconciled, ⛔ no new finding made)

**X-1 · `member_theme_signals`.** *Domain B (P3-B-07):* theme signals are loaded at `route :947`
and surfaced into the FAST prompt inside the influence block — `PARTIAL`, `SURFACED (FAST only)`.
*Domain C (P3-C-09):* `WIRED-BUT-UNOBSERVED (write path only; no member-facing read located)`, and
explicitly SUSPENDED from the collective surface. Both restated; ⛔ not merged.

**X-2 · `EpisodicMemoryService` / `CoherenceFieldService` liveness.** *`CLAUDE.md` Cat 3:*
*"0 live callers."* *Domain B §10.3:* **contradicted** at the subject — both are called by
`MemoryPalaceOrchestrator` (`:61`, `:75`, `:188`).

**X-3 · `/api/oracle/conversation` traffic.** Domain A: hard-refused at POST (410). Domain B and C
both carry live-path material whose only located consumer is that route (P3-B-24, P3-C-03 loader 1).
Domain B records the question as `OQ-2`; ⛔ unanswered.

---

## Fields NOT DETERMINED BY SOURCE RECORD (a list — this is a finding about census completeness, not a defect)

**LADDER — 60 of 62 rows.** Only two ladder positions were established by a source record:
`P3-A-07` = **CONTRIBUTES** (and explicitly *not* DECIDES) and `P3-B-15` = **KNOWS** (and explicitly
*not* CONSIDERS). ⛔ Every other row is `NOT DETERMINED BY SOURCE RECORD`. ⭐ The census produced a
capability register that is almost entirely silent on where each capability sits on the ladder.

**STATUS — 2 rows undetermined, plus 2 restated verbatim.** Undetermined: `P3-A-17` (a table of
instruments, no single status assigned) · `P3-C-11` (the decay pair, no single status assigned).
Restated verbatim because the source record's status cell is not an instrument enum value and was
⛔ not coerced into one: `P3-B-29` ("legacy; mem0 reachable from lib/semantic · beads-sync DORMANT")
· `P3-B-30` ("read only by lib/trust/service.ts — outside the memory path"). ⚠️ Separately,
`P3-A-05` and `P3-B-02` and `P3-B-15` each carry MORE THAN ONE status because their source records
assign more than one; ⛔ they were not split into tidier rows.

**COVERAGE — 17 rows carry an undetermined coverage value, 10 of them wholly.**
*Wholly undetermined (10):* `P3-B-11` · `P3-B-16` · `P3-B-29` (mem0 half; beads-sync is NOT
APPLICABLE) · `P3-C-01` · `P3-C-02` · `P3-C-06` · `P3-C-07` · `P3-C-09` · `P3-C-10` · `P3-C-11`.
*Partly undetermined (7):* `P3-A-09` (the other 95 identity sources) · `P3-B-01`
(`meta.conversationHistory` tier reach) · `P3-B-09` (tier) · `P3-B-15` (the write half's family
reach) · `P3-B-21` (which tiers carry `MAIA_RUNTIME_PROMPT`) · `P3-C-03` (loader 3's tier reach) ·
`P3-C-04` (tier reach on the list route). ⚠️ Additionally `P3-A-15` determines the class
(F-PERIPHERAL) but leaves the individual statuses of the 25 undetermined. ⭐ Under INF-5 each of
these is a row whose organism-wide reach is **not established**, and none may be read as "the system."

**GOVERNANCE GATE — 14 rows** where the record names neither a gate nor an absence: `P3-B-08` ·
`P3-B-11` · `P3-B-12` · `P3-B-16` · `P3-B-17` · `P3-B-18` · `P3-B-19` · `P3-B-25` · `P3-B-26` ·
`P3-B-27` · `P3-B-28` · `P3-B-29` · `P3-B-30` · `P3-B-31`. ⛔ This is distinct from `NONE FOUND`,
which is a positive finding of absence. ⭐ **Every one of them is in domain B** — domain A and
domain C each answered the gate question on every row, positively or as NONE FOUND.

**GOVERNING SOURCE — 51 of 62 rows are `NONE LOCATED`.** The eleven rows carrying a named
governing source are: `P3-A-08` (CMT-01 witness) · `P3-A-10` (Canon v1.1 provenance headers) ·
`P3-A-13` (refusal-19, a CI instrument) · `P3-A-14` (non-degradation doctrine + exit map) ·
`P3-B-20` (MAIA_MEMORY_CANON_v1.0 §VII, cited not re-adjudicated) · `P3-B-23` (the six documented
Sanctuary invariants, two of them not evaluable from domain B) · `P3-B-25`
(project_recurrence_prevention_architecture.md, cited and NOT VERIFIED) · `P3-C-01` (WS2-07 DECIDE
record) · `P3-C-02` (BUILD-07F design) · `P3-C-08` (ECOLOGY_OF_MIRRORS, inspectability only) ·
`P3-C-13` (THREE_FIELDS doc, existence NOT VERIFIED). ⚠️ Three of the eleven are citations the
source record could not verify; ⛔ they are carried as cited, not as located.

**CANONICAL COGNITION BOUNDARY** — `UNKNOWN` at the subject, carried on every domain A row.

**Whole-question gaps the records declare rather than answer:** live tier distribution (A OQ-2) ·
whether the 2026-05-23 traffic audit still describes the subject (A-01) · how many of the 25
peripheral routes are member-reachable (A OQ-4) · whether `scrubMemoryAmnesia`'s result replaces
member-facing text (B OQ-4) · whether `/api/oracle/conversation` serves member traffic (B OQ-2) ·
the referent of *"the SQL confirmation term caps at 0.0225"* (C §10, NOT FOUND at the subject).

---

## Rows where GOVERNANCE GATE is NONE FOUND

**Count: 12 rows** (a positive finding of absence, distinct from the 14 `NOT DETERMINED` rows above).

```text
P3-A-02  tier selection — nothing consents to, discloses, or refuses which mind answers a turn
P3-A-09  MAIA identity-source uniqueness — 96 declaration sites, no registry covering them
P3-A-12  /api/sovereign/app/maia — dormancy is a comment, not a refusal
P3-A-14  /api/voice/stream-conversation — no gate of its own; only a client-side unit test
P3-A-15  the 25 peripheral MAIA-claiming routes, as a class
P3-B-02  MemoryBundle composition — scoring, decay weighting and maxBullets:5
P3-B-09  MemoryWritebackService formation threshold
P3-B-24  MemoryPalaceOrchestrator — no sanctuary, memory-mode or consent check in the file
P3-C-06  member_patterns — a linkage-row check, not a consent record
P3-C-07  pattern_ledger
P3-C-11  confidence decay — and two divergent implementations are both live
P3-C-12  trust_observations
```

⚠️ **Partial / sub-path NONE FOUND, not counted above** (the row carries a gate elsewhere):
`P3-A-05` — DEEP-primary **stage 1** has NONE FOUND (no system prompt at all), while DEEP-repair
carries the full four. ⛔ Not split into its own row.

⚠️ **Cross-cutting NONE FOUND findings the records state outside any single row, carried forward
unattached:** member deletion or erasure of formed memory (B §10.2) · the four freeze conditions
have no evaluator of any kind (B §9) · practitioner visibility into member memory (B §10.2) ·
`MAIA_SAFE_MODE` — no ruling on who may set it or what it may remove (A §4) · what a practitioner
may see of a member's developmental material (C §9) · erasure of `member_spiral_state`,
`member_relational_signals`, `member_theme_signals`, `trust_observations` (C §9).

⭐ Per INF-4: finding the code that ranks, hides, shapes or infers does **not** make that behaviour
governed. Every `NONE FOUND` above is a finding.

---

## Vocabulary collisions carried forward (same word, different objects, both named)

⛔ No collision is resolved. ⛔ No two objects are merged because they share a word.

**`field` — 9 referents.** `MemoryHealth.field` (a LayerStatus key, never populated) ·
`MemoryField`/`memoryField` (the lattice recall result, discarded) · `MemberLiveContext.fieldState`
· `CoherenceFieldService` / `coherence_field_readings` · `QuantumFieldMemory` ·
`fieldContextAdapter` · `enforceFieldSafety` / `fieldRouting` (a **safety gate**, not a memory
store) — seven from B §6 — plus `living_field_affinities` and `relationship_field_state` from
domain C. ⛔ *"Field memory is live"* and *"field memory is not live"* are **both unevaluable**
until the referent is named.

**`semantic` — 5 referents.** `MemoryHealth.semantic` (an atoms row count) ·
`lib/memory/SemanticMemoryService.ts` · `lib/consciousness/memory/SemanticMemoryService.ts`
(two files, same basename, different trees) · `MemorySource.'semantic_memory'` (a Phase-2
placeholder) · `detectSemanticCandidate` (a message-text regex).

**`developmental` — 5 referents.** WS2-07 manuscript reading · `member_spiral_state.relational_phase`
· `member_relationships.developmental_theme` · `lib/development/` = **Claude Code tooling, not
member development** · `lib/developmental-insights.ts` = **MAIA's OWN development, not a member's**.
⚠️ The last two were traced and excluded from domain C's substrate count so a later reader does not
re-find them as member-developmental substrate.

**`trust` — 5 referents.** `trust_observations` (engagement proxy) · `skills_registry.trust_level`
(**code rollout control**) · `comms_messages.trust_scope` (message context class) ·
`lib/trust/service.ts` (privacy/sharing envelopes) · `consciousness_evolution.trust_evolution` jsonb.

**`pattern` — 6 referents.** `member_patterns` (practitioner) · `pattern_ledger` (MAIA) ·
`journal_patterns` · `morphic_pattern_memories` · `case_patterns` ·
`lib/relationships/patternDetection.ts`. ⚠️ Plus `MemoryHealth.pattern` (a LayerStatus key) from
domain B, and the two are not the same object.

**`relationship` — 3 sibling directories, 3 different architectures.** `lib/relational/` ·
`lib/relationship/` · `lib/relationships/`.

**`MaiaSystemPrompt` — 2 files of the same basename in different trees.**
`lib/oracle/MaiaSystemPrompt.ts` and `lib/voice/MaiaSystemPrompt.ts`. ⛔ Per the vocabulary rule, no
claim is made that either is "the" system prompt.

**`patterns` as one member-facing word over two physically separate substrates.**
`app/api/members/patterns/route.ts:16` returns `getMemberVisiblePatterns()` (practitioner-authored,
`member_patterns`) **and** `getMaiaDetectedPatterns()` (MAIA-authored, `pattern_ledger`) from one
endpoint; the label route selects the table by a `sourceType === 'maia'` discriminator. The two
substrates remain physically separate; what is shared is the member-facing word.

**`receipt`-class duplication of declarations.** `pattern_ledger` is declared by **two** migrations
(`20260204100001`, `20260315120000`); ⛔ not reconciled.

**`memory layers` — six code enumerations, none a subset of another** (B §5, restated at
contradiction B-8). ⛔ No winner chosen.

**`recurring_interests`** — a **column**, not a table, with zero code references. ⚠️ Named here so it
is not re-found as a substrate.

---

```text
P1-03 · DOMAINS A · B · C NORMALIZED
62 rows — A 17 · B 31 · C 14
GOVERNANCE GATE NONE FOUND: 12 rows (+1 sub-path, +6 cross-cutting)
GOVERNING SOURCE NONE LOCATED: 51 of 62 rows
LADDER established by a source record: 2 of 62
⛔ NO STATUS UPGRADED · ⛔ NO LADDER MANUFACTURED · ⛔ NO CONTRADICTION RESOLVED
⛔ NO ROW MERGED OR SPLIT · ⛔ NO CAPABILITY ADDED · ⛔ NO SOURCE CODE READ
P1-03 RESTATES. IT DOES NOT DECIDE.
```
