# P1-02 · DOMAIN A — CANONICAL COGNITION / MAIA

```text
STEP        PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-02
DOMAIN      A — Canonical cognition / MAIA
SUBJECT     1a5554300e855d3581085849301a39cbb10ab385
TYPE        RECORD ONLY — evidence, never rulings
AUTHORITY   READ / TRACE / CLASSIFY
```

> **P1-02 asks what the organism does. It does not infer from doing that the organism is
> authorized to do it.**

## 0 · Subject verification and reading basis

- Working-tree HEAD at capture: `f0279c5b0eee0ae7090df38b67d820923917c58c`.
- Census subject `1a555430` **exists as a commit object** and **is an ancestor of HEAD**
  (`git merge-base --is-ancestor` → true).
- `git diff --stat 1a555430 HEAD -- app/ lib/ components/` → **empty**. The two commits differ only
  in `docs/`. Every `file:line` citation below therefore holds at the subject.
- Shallow-clone limit: 1098 revisions present. Per constraint E-1, no history claim is made beyond
  the working tree and the dated in-repo records read.

## 1 · CONSTRAINT 3 — THE CANONICAL COGNITION BOUNDARY

```text
CANONICAL COGNITION BOUNDARY  =  UNKNOWN
```

There is no ruled boundary at the subject. `lib/maia/canonical-turn/` (CMT-01 M0–M2) is an
**authorized target that the live member path does not pass through**: on
`app/api/sovereign/app/maia/list/route.ts` it runs in **shadow only**
(`list/route.ts:1276-1330`), and `lib/sovereign/maiaService.ts:7` imports only
`renderTurnForCognition`, reached from exactly one non-shadow branch
(`maiaService.ts:3376`, Writers-Studio turns, feature-flagged off by default).

⛔ Nothing in this record adopts the CMT-01 target as law. ⛔ Nothing here describes M3 as done.
What follows are **actual** entry, convergence, delegation, return and termination points.

---

## 2 · CAPABILITY RECORDS

### A-01 · Canonical member chat turn (`/api/sovereign/app/maia/list`)

- **CAPABILITY** — accept a member utterance over HTTP, assemble context, produce a MAIA-claiming
  response, terminate to the member.
- **DECLARED WHERE** — `app/api/sovereign/app/maia/list/route.ts:285` (`POST`);
  registry entry `lib/maia/maiaRuntimeContext.ts:64` (`status: 'canonical-live'`).
- **COMPUTED WHERE** — delegates to `getMaiaResponse` (`list/route.ts:1365`).
- **PERSISTED WHERE** — durable turn-acceptance write before preamble work
  (`list/route.ts:368-392` comment block, F1 boundary); `addConversationExchange` inside
  `maiaService`.
- **LOADED WHERE** — ~14 addendum loaders assembled before `buildMaiaRuntimeContext`
  (`list/route.ts:1219-1249`).
- **SURFACED WHERE** — `jsonWithCors` at `list/route.ts:1966` (success) with canon provenance
  headers `list/route.ts:1813`.
- **UPDATED WHERE** — n/a (per-turn).
- **CANONICAL CALL PATH** —
  `POST list/route.ts:285` → `ensureSchemaReady` (`:298`) → `resolveMemberIdentity` (`:329`) →
  turn-acceptance write → addenda assembly → `buildMaiaRuntimeContext` (`:1219`) →
  `assertProviderAvailable` (`:1362`) → `getMaiaResponse` (`:1365`) → response construction
  (`:1790-1830`) → `jsonWithCors` (`:1966`).
- **UPSTREAM DEPENDENCIES** — `app/maia/page.tsx:843,1540`, `app/field/talk/page.tsx:415`,
  `app/studio/maia/page.tsx:118`, `components/maia/presence/MaiaPresence.tsx:284`,
  `app/writers-studio/canvas/StudioConversation.tsx:128`, `app/book-companion/ain/page.tsx:151`,
  `components/academy/AcademySheet.tsx:240`, `lib/hooks/useMaiaChat.ts:129`,
  `components/OracleConversation.tsx` (canonical fetch, `:852`).
- **DOWNSTREAM CONSUMERS** — `observeRelationalContent` (`:1824`), `detectRelationalSignal`
  (`:1829`), `logAgentRun` (corpus callosum), `emitSignal`.
- **MEMBER AUTHORITY** — supplies the utterance and the Sanctuary posture (`:387`
  `meta.sanctuary`). ⛔ A body `userId` is explicitly **not** trusted (`:329-333`).
- **MAIA AUTHORITY** — none over identity resolution; full authorship of the response text
  subject to §A-10 egress constraints.
- **PRACTITIONER AUTHORITY** — none at this route. Practitioner material reaches the prompt only
  as `studioAddendum` / `atomsAddendum` strings assembled upstream.
- **SYSTEM AUTHORITY** — chooses the tier (§A-02), chooses which addenda exist, and may refuse the
  turn at the schema gate or provider gate.
- **GOVERNANCE GATE** — `ensureSchemaReady` → 503 (`:296-306`); missing message → 400 (`:366`);
  `assertProviderAvailable()` → named `ProviderUnavailableError` → 503 from the infrastructure
  channel, never MAIA's voice channel (`:1358-1362`); `SAFE_MODE` const declared at `:192`;
  `middleware.ts` matcher covers this path (`middleware.ts:487` — negative matcher, this route is
  not excluded).
- **FAILURE MODE** — 503 (schema / provider), 400 (no message), 500 from outer catch
  (`:1908/:1929/:1948`). Client-visible errors are JSON, not MAIA prose.
- **CURRENT STATUS** — **LIVE**. Traced path at the subject **and** a dated in-repo runtime
  witness: `app/api/sovereign/app/maia/route.ts:8-9` records a 2026-05-23 48h production-log audit
  of "99 hits to /list, 0 here". ⚠️ That witness is ~4 months older than the subject and is a
  *traffic* observation, not an observation of this route's present behaviour.
- **SOURCE EVIDENCE** — as cited.
- **CONTRADICTIONS** — the outbound `meta.endpoint` literal reports the SIBLING path
  `/api/sovereign/app/maia` (`list/route.ts:1390`), acknowledged in-source as a pre-existing
  mislabel left untouched.
- **UNRESOLVED QUESTIONS** — whether the 2026-05-23 traffic audit still describes the subject.

---

### A-02 · Processing-tier decision (FAST / CORE / DEEP)

- **CAPABILITY** — select which cognition path a turn takes.
- **DECLARED WHERE** — `lib/consciousness/processingProfiles.ts:49`
  (`chooseProcessingProfile`); type `ProcessingProfile` imported at `maiaService.ts:12`.
- **COMPUTED WHERE** — `maiaService.ts:3169-3176`; result assigned `:3177`.
- **PERSISTED WHERE** — carried into `addConversationExchange` meta
  (`maiaService.ts:3973 processingProfile`).
- **SURFACED WHERE** — response field `processingProfile`; canon header `source` derived from it
  (`list/route.ts:1817`).
- **CANONICAL CALL PATH** — `getMaiaResponse` (`maiaService.ts:2704`) → `chooseProcessingProfile`
  (`:3169`) → `switch (processingProfile)` (`:3391`) → `fastPathResponse` (`:771`) /
  `corePathResponse` (`:1601`) / `deepPathResponse` (`:2056`); `default:` falls back to FAST
  (`:3426-3435`).
- **UPSTREAM DEPENDENCIES** — message text, `turnCount`, conversation history, and a
  **cognitive profile** loaded per member/session (`processingProfiles.ts:65-84`).
- **MEMBER AUTHORITY** — indirect and lexical: an explicit-deep phrase list
  (`processingProfiles.ts:104-116`) plus a long-message + process-language + `turnCount >= 5`
  rule (`:126-136`). ⛔ There is no member-facing tier control at this seam.
- **MAIA AUTHORITY** — none; the tier is decided before cognition.
- **SYSTEM AUTHORITY** — total. A `processingProfileOverride` request field exists
  (`maiaService.ts:610, 2705`) and is applied to the *reported* profile at `:3973`.
- **GOVERNANCE GATE** — **NONE FOUND.** No refusal-registry check, no consent gate and no
  member-visible disclosure governs which mind answers a given turn. ⭐ This matters because the
  three tiers do **not** carry the same standing guardrails (§A-03/04/05).
- **FAILURE MODE** — cognitive-profile load failure is caught and non-blocking
  (`processingProfiles.ts:82-84`); routing continues.
- **CURRENT STATUS** — **WIRED-BUT-UNOBSERVED** (no dated in-repo record of observed tier
  distribution at or near the subject).
- **CONTRADICTIONS** — the RCN branch (§A-06) can return before the switch and reports itself as
  `processingProfile: 'DEEP'` "for client compatibility" (`maiaService.ts:3245`) — the reported
  tier is then **not** the tier that ran.

---

### A-03 · FAST tier prompt assembly and generation

- **DECLARED WHERE** — `lib/sovereign/maiaService.ts:771` (`fastPathResponse`).
- **COMPUTED WHERE** — `baseSystemPrompt` template literal `maiaService.ts:1497-1507`, addenda
  interpolated inline at `maiaService.ts:1507` (single line, ~30 conditional addendum slots).
- **CANONICAL CALL PATH** — `fastPathResponse` → `generateText({ systemPrompt: baseSystemPrompt })`
  at `maiaService.ts:1560-1562`.
- **IDENTITY SOURCE** — `MEMORY_AUTHORITY_BLOCK`, then `MAIA_RELATIONAL_SPEC`,
  `MAIA_LINEAGES_AND_FIELD`, `MAIA_CENTER_OF_GRAVITY`, `PLATFORM_KNOWLEDGE_ADDENDUM`,
  `MAIA_RUNTIME_PROMPT` — dynamically imported at `maiaService.ts:1070`
  (`await import('../consciousness/MAIA_RUNTIME_PROMPT')`).
- **GOVERNANCE GATE** — ⭐⭐ **PARTIAL, AND DIVERGENT.** Grep of `lib/sovereign/maiaService.ts` for
  `INTERFACE_HUMILITY_GUARDRAIL`, `MEMORY_SPEECH_ACT_BOUNDARY`, `PLATFORM_KNOWLEDGE_BOUNDARY`
  returns **zero hits**; only `PLATFORM_KNOWLEDGE_ADDENDUM` is imported (`maiaService.ts:5`,
  used `:1505`). **FAST therefore receives one of the four standing texts and not the other
  three.** The three absent ones are defined at `lib/sovereign/maiaVoice.ts:460`, `:484`, `:497`
  and are appended only inside `appendAllContextAddenda` (`maiaVoice.ts:507-545`), which FAST never
  calls. ⛔ This is recorded as observed structure; no repair is proposed.
- **FAILURE MODE** — not traced beyond `generateText`.
- **CURRENT STATUS** — **WIRED-BUT-UNOBSERVED**.
- **CONTRADICTIONS** — `docs/programme/CMT-01_M0-M2_WITNESS_2026-09-03.md:82-84` records the
  passing assertions *"FAST prompt opens with the runtime prompt and closes with the three
  guardrails"*. Those assertions run against `lib/maia/canonical-turn/floor.ts:23-26` (the
  **canonical floor**, which does carry all four), **not** against `fastPathResponse`. Both sides
  preserved: the floor carries them; the live FAST path does not.

---

### A-04 · CORE tier prompt assembly and generation

- **DECLARED WHERE** — `maiaService.ts:1601` (`corePathResponse`).
- **COMPUTED WHERE** — `buildMaiaWisePrompt(context, input, effectiveHistory)` at
  `maiaService.ts:1846`; the prompt builder is `lib/sovereign/maiaVoice.ts:549`.
- **CANONICAL CALL PATH** — `corePathResponse` → `buildMaiaWisePrompt` (`maiaVoice.ts:549`) →
  `appendAllContextAddenda` (`maiaVoice.ts:910`) → `generateText` at `maiaService.ts:1988`.
  Validation-repair re-entry: `maiaService.ts:2015` → `generateText` `:2027`.
- **IDENTITY SOURCE** — `MAIA_RELATIONAL_SPEC` / `MAIA_LINEAGES_AND_FIELD` /
  `MAIA_CENTER_OF_GRAVITY` via `require('../consciousness/MAIA_RUNTIME_PROMPT')` at
  `maiaVoice.ts:585`, then one of four complexity-branch `basePrompt` templates
  (`maiaVoice.ts:592 / 612 / 632 / 652`).
- **GOVERNANCE GATE** — **FULL FOUR.** `appendAllContextAddenda` appends, unconditionally and in
  this order: `MEMORY_SPEECH_ACT_BOUNDARY` (`maiaVoice.ts:530`), `PLATFORM_KNOWLEDGE_ADDENDUM`
  (`:536`), `PLATFORM_KNOWLEDGE_BOUNDARY` (`:540`), `INTERFACE_HUMILITY_GUARDRAIL` (`:544`).
  Additionally `MAIA_SAFE_MODE=true` short-circuits to `buildSimpleMaiaPrompt`
  (`maiaVoice.ts:550-553`) — a kill-switch that **discards every addendum and every guardrail**.
- **SYSTEM AUTHORITY** — `ADDENDA_SPECS` (`maiaVoice.ts:414-442`) is the single ordered registry of
  27 addendum fields that may reach FAST-via-wise/CORE/DEEP-repair prompts.
- **CURRENT STATUS** — **WIRED-BUT-UNOBSERVED**.
- **UNRESOLVED QUESTIONS** — `MAIA_SAFE_MODE` is read in four places
  (`maiaVoice.ts:550`, `maiaService`-adjacent routes `list/route.ts:192`,
  `app/api/sovereign/app/maia/route.ts:54`, `app/api/between/chat/route.ts:370`,
  `lib/consciousness/maiaOrchestrator.ts:892`) with no located ruling on who may set it or what it
  is permitted to remove.

---

### A-05 · DEEP tier — two prompt regimes, one of them seamless

- **DECLARED WHERE** — `maiaService.ts:2056` (`deepPathResponse`).
- **DEEP-PRIMARY (stage 1)** — `consciousnessWrapper.processConsciousnessEvolution(input,
  consciousnessContext)` raced against a 4500ms timeout (`maiaService.ts:2338-2344`); the response
  is taken verbatim at `:2346`. On timeout the text is a hardcoded fallback string (`:2354`).
  ⭐ **This stage has no system prompt at all.** In-source: *"the local orchestrator draft has no
  prompt seam by construction — it weaves templates, it does not read a system prompt"*
  (`maiaService.ts:2379-2382`, repeated `:2404-2408`). ⛔ Therefore **none** of the four standing
  texts, and none of the 27 `ADDENDA_SPECS` fields, govern DEEP-primary stage 1.
- **DEEP-PRIMARY (stage 2, Claude consultation)** — gated **off by default**:
  `enableClaudeConsultation = process.env.MAIA_USE_CLAUDE_CONSULTATION === 'true'`
  (`maiaService.ts:2371`), guard at `:2373`. When on, the only prompt seam is
  `consultationRecallAddenda` — seven recall addenda joined at `maiaService.ts:2385-2393` — passed
  to `consultClaudeForConsciousness` (`:2418`).
- **DEEP-REPAIR** — `buildMaiaComprehensivePrompt(input, repairedContext, effectiveHistory)` at
  `maiaService.ts:2543` → `lib/sovereign/maiaVoice.ts:950` → `buildComprehensiveVoicePrompt`
  (`maiaVoice.ts:965`, from `lib/sovereign/intelligentVoiceAdaptation.ts`) →
  `appendAllContextAddenda` (`maiaVoice.ts:972`) → `generateText` at `maiaService.ts:2554`.
- **GOVERNANCE GATE** — DEEP-repair: full four. DEEP-primary stage 1: **NONE FOUND**.
  DEEP-primary stage 2: recall addenda only, and disabled by default.
- **CURRENT STATUS** — **WIRED-BUT-UNOBSERVED** (repair path); **WIRED-BUT-UNOBSERVED** (primary
  stage 1); **DORMANT** (consultation stage 2 — env-gated off, no in-repo record of it being on).
- **CONTRADICTIONS — the 2026-05-24 addenda-channel divergence claim, adjudicated at the subject:**
  - **§II.B (DEEP repair path does not iterate `MaiaContext` addenda) — CONTRADICTED.** It does:
    `maiaVoice.ts:972`, and `maiaVoice.ts:955-960` records the closure in-source.
  - ⚠️ **A stale comment asserting the opposite survives inside the same function**:
    `maiaService.ts:2519-2521` still reads *"buildComprehensiveVoicePrompt … currently does NOT
    iterate MaiaContext addenda"*, four lines above comments at `:2526-2535` asserting that it
    does. Both sides preserved; not reconciled.
  - **§II.C (primary DEEP path) — PARTIALLY CONTRADICTED, SUBSTANTIALLY CONFIRMED.** The
    consultation lane now carries seven recall addenda (`:2385-2393`), but that lane is off by
    default, and stage 1 — the path that actually produces DEEP text when consultation is off —
    remains prompt-seamless by construction.

---

### A-06 · RCN early-return cognition (`maiaRcnProcess`)

- **DECLARED WHERE** — `maiaService.ts:3196-3266`.
- **CANONICAL CALL PATH** — `getMaiaResponse` → `maiaRcnProcess(input, rcnContext)` (`:3210`) →
  if `used && confidence >= 0.7 && completedNormally` → `formatRcnForMaia` (`:3215`) →
  `finalizeMemberFacingText` (`:3224`) → `addConversationExchange` (`:3230`) → **returns before the
  tier switch** (`:3241`).
- **MAIA AUTHORITY** — the returned text is corpus-derived, not tier-generated; it never passes a
  MAIA system prompt or any of the four standing texts.
- **GOVERNANCE GATE** — egress discipline only (`finalizeMemberFacingText`, §A-10), explicitly
  added because *"this path previously skipped all three"* (`maiaService.ts:3221-3223`).
  Writers-Studio turns are excluded outright by `WriterCanonicalOnly` (`:3211`, `:3264`).
- **CURRENT STATUS** — **WIRED-BUT-UNOBSERVED**.
- **CONTRADICTIONS** — reports `processingProfile: 'DEEP'` while being neither DEEP nor any tier
  (`:3245`).

---

### A-07 · Writers-Studio canonical turn — the one live canonical-turn cognition seam

- **DECLARED WHERE** — `app/api/writers-studio/focus/route.ts:30` (`POST`), enabled only by
  `WRITERS_STUDIO_FOCUS_ENABLED === '1'` (`:28`), otherwise **404, not 403** (`:31`).
- **CANONICAL CALL PATH** — `focus/route.ts` → `resolveCanonicalIdentity` (`:37`) →
  `performFocusCrossing` → `prepareCanonicalHandoff` / `beginCanonicalGeneration`
  (`lib/writers-studio/writersStudioCognition.ts:124` calls `getMaiaResponse`) →
  `maiaService.ts:3376` `renderTurnForCognition(writerStudioTurn, {tier})` → `generateText`
  (`maiaService.ts:3380-3386`) — **bypassing the FAST/CORE/DEEP switch entirely** (the switch sits
  in the `else` at `:3390-3391`).
- **GOVERNANCE GATE** — identity must be `verified` else 401 (`focus/route.ts:38-40`); feature flag;
  `WriterCanonicalOnly` excludes RCN; canonical floor via `lib/maia/canonical-turn/floor.ts:23-26`.
- **CURRENT STATUS** — **WIRED-BUT-UNOBSERVED** (flag default off; `FOCUS-WITNESS-01_RESULT_2026-09-10.md`
  exists in-repo but was not read for runtime-production status in this slice).
- **PRESERVED DISTINCTION** — this is the only place where the canonical-turn renderer
  **CONTRIBUTES** to a member-facing answer. It still does not **DECIDE** the organism's shape.

---

### A-08 · CMT-01 canonical-turn shadow on `/list`

- **DECLARED WHERE** — `lib/maia/canonical-turn/` (14 modules incl. `floor.ts`, `identity.ts`,
  `producerRegistry.ts`, `manifest.ts`, `render.ts`, `shadow.ts`, `policy.ts`).
- **CANONICAL CALL PATH** — `list/route.ts:1276` `resolveCanonicalIdentity` → `:1296`
  `constructCanonicalTurn` (`cognitionPath: 'shadow'`, `:1323`) → `:1326`
  `emitShadowDiff(compareLegacyToCanonical(...))`. Wrapped in try/catch, explicitly non-fatal
  (`:1327-1331`).
- **MEMBER-FACING EFFECT** — none. The legacy turn is unaffected by construction.
- **GOVERNANCE GATE** — refusals R25–R31
  (`tests/constitutional/refusal-registry/refusal-25…31-canonical-*.ts`), incl.
  `refusal-31-canonical-shadow-observational.ts`.
- **CURRENT STATUS** — **OBSERVATION-ONLY**. `CMT-01_M0-M2_WITNESS_2026-09-03.md:99` states the
  live `zeroDiff:true` witness is **NOT yet obtained**; `:198` records that the first shadow deploy
  ran as `GIT_COMMIT=unknown` and its evidence is void.
- **UNRESOLVED QUESTIONS** — M3 remains unauthorized; the boundary this module targets remains
  `UNKNOWN` (§1).

---

### A-09 · MAIA identity / system prompt — source count

- **CAPABILITY** — declare who MAIA is to a model.
- **DECLARED WHERE** — ⭐⭐ **not one source.** `grep -rln "You are MAIA|You are Maia"` over
  `app/api` + `lib` (excluding `app/api/_backend`) returns **96 files**, of which **25 are HTTP
  route handlers**. Named examples: `lib/consciousness/MAIA_RUNTIME_PROMPT.ts`,
  `lib/oracle/MaiaSystemPrompt.ts`, `lib/voice/MaiaSystemPrompt.ts`, `lib/prompts/maiaEssence.ts`,
  `lib/consciousness/AdaptiveSystemPrompts.ts`, `lib/services/ClaudeService.ts`,
  `lib/sovereign/intelligentVoiceAdaptation.ts`, `lib/multi-tenant/TenantMAIA.ts`,
  `app/api/ask-maia/ask/route.ts:8` (`const SYSTEM_PROMPT = 'You are MAIA, a wise guide…'`),
  `app/api/maia/living-field/[fieldKey]/encounter/route.ts:111`.
- **CANONICAL CALL PATH (the `/list` lane only)** — `MAIA_RUNTIME_PROMPT.ts` reaches FAST via
  `maiaService.ts:1070` and CORE/DEEP-repair via `maiaVoice.ts:585`. DEEP-primary stage 1 reaches
  **none of them**.
- **GOVERNANCE GATE** — **NONE FOUND** for identity-source uniqueness. No guard, registry, or
  refusal check constrains a new file from declaring "You are MAIA" and shipping it to a model.
  The nearest structural instrument is `lib/maia/canonical-turn/producerRegistry.ts` (closed
  38-producer registry) — which governs the **shadow** turn and the Writers-Studio turn only.
- **CURRENT STATUS** — **PARTIAL**. One source is canonical for two of four live prompt regimes on
  one route; 95 others exist with independent standing.
- **CONTRADICTIONS** — `lib/oracle/MaiaSystemPrompt.ts` and `lib/voice/MaiaSystemPrompt.ts` are two
  files of the same basename in different trees. ⛔ Per the vocabulary rule, no claim is made that
  either is "the" system prompt.

---

### A-10 · Egress — member-facing finalization

- **DECLARED WHERE** — `finalizeMemberFacingText` at `lib/sovereign/maiaService.ts:2660-2689`.
- **COMPUTED WHERE** — `determineResponseMode(input)` (`:2670`) → if `PRESENCE`,
  `enforcePresenceConstraints` (`:2672`) → `enforceIdentityPredicateConstraint` (`:2681`) →
  telemetry (`:2676`, `:2686`).
- **CANONICAL CALL PATH (route level)** — `getMaiaResponse` returns → `sanitizeMaiaOutput`
  (`maiaService.ts:3439`) → … → route builds `responseData` → audio normalized via
  `toAudioResponsePayload` (`list/route.ts:1807`) → `makeCanonHeaders` (`:1813`) → `jsonWithCors`
  (`:1966`).
- **GOVERNANCE GATE** — `refusal-14-identity-predicate-guard.ts`;
  `refusal-24-cross-session-continuity-truthfulness.ts`; Canon v1.1 provenance headers.
  Sanctuary suppresses relational observation at `list/route.ts:1823`.
- **CURRENT STATUS** — **WIRED-BUT-UNOBSERVED**.
- **⭐ EGRESS IS NOT SINGULAR.** Distinct member-facing terminations that produce MAIA-claiming
  text at the subject: `list/route.ts:1966` (A-01) · `maiaService.ts:3241` (RCN, A-06) ·
  `app/api/between/chat/route.ts` `POST` at `:776` (A-11) · `app/api/writers-studio/focus/route.ts`
  (A-07) · the 25 peripheral routes of A-15 · `app/api/voice/stream-conversation/route.ts` SSE
  (A-14, currently uninvoked). **P1-01's `UNKNOWN` on egress is RESOLVED to: SEVERAL, ENUMERATED
  BELOW — with no single chokepoint.** `finalizeMemberFacingText` governs only the `getMaiaResponse`
  family.

---

### A-11 · `/api/between/chat` — live-secondary lane

- **DECLARED WHERE** — `app/api/between/chat/route.ts:776` (`POST`, 2665 lines);
  registry `maiaRuntimeContext.ts:78` (`status: 'live-secondary'`, `callsMaiaResponse: false`).
- **CANONICAL CALL PATH** — `between/chat/route.ts:18` imports `generateMaiaTurn` →
  `lib/consciousness/maiaOrchestrator.ts:251` → **converges on `getMaiaResponse`** at
  `maiaOrchestrator.ts:506`. Also `generateSimpleMaiaResponse` (`maiaOrchestrator.ts:1047`) →
  `getMaiaResponse` (`:1059`).
- **CONVERGENCE POINT** — `lib/sovereign/maiaService.ts:2704`.
- **GOVERNANCE GATE** — `SAFE_MODE` at `between/chat/route.ts:370`; pipeline provenance header
  `orchestrator.generateMaiaTurn` (`:1523`, `:2463`).
- **CURRENT STATUS** — **WIRED-BUT-UNOBSERVED**.
- **CONTRADICTION** — the registry entry asserts `callsMaiaResponse: false`
  (`maiaRuntimeContext.ts:81`) with the stated reason *"uses maiaOrchestrator, not
  getMaiaResponse"*. The orchestrator **does** call `getMaiaResponse` (`maiaOrchestrator.ts:506`).
  Both sides preserved. The consequence is that this lane reaches cognition **without**
  `buildMaiaRuntimeContext` ever running for it — the wrapper's own contract
  (`maiaRuntimeContext.ts:3-5`: *"Every route calling getMaiaResponse() must pass through this
  wrapper"*) is not satisfied on this path.

---

### A-12 · `/api/sovereign/app/maia` — dormant predecessor

- **DECLARED WHERE** — `app/api/sovereign/app/maia/route.ts:1` (`@ts-nocheck`), header `:4-19`.
- **CANONICAL CALL PATH** — calls `getMaiaResponse` at `:343` and `:497`.
- **GOVERNANCE GATE** — **NONE FOUND.** Dormancy is asserted by a source comment and a registry
  entry (`maiaRuntimeContext.ts:96`), not enforced. There is no 404/410 refusal in the handler.
- **CURRENT STATUS** — **DORMANT** (registry `status: 'dormant'`; in-source 2026-05-23 traffic
  audit). ⚠️ Dormant here means *unvisited*, not *closed* — the handler would serve a request.

---

### A-13 · `/api/oracle/conversation` — blocked lane

- **DECLARED WHERE** — `app/api/oracle/conversation/route.ts:433` (`POST`), refusal marker `:435`,
  `{ status: 410 }` at `:452`.
- **CURRENT STATUS** — **BLOCKED**. The 410 is the first executable statement of `POST`.
- **GOVERNANCE GATE** — `refusal-19-oracle-lane-disabled.ts`, grade A, which additionally asserts
  the body is never read and the content writers (`storeSessionPattern`, `storeCMLayerSignal`) are
  unreachable from HTTP.
- **⛔ NOT AUTHORIZED BY THE BLOCK** — `refusal-19:25` states explicitly that passing does **not**
  authorize the writers themselves, which remain ungoverned (S5). ~2600 lines of unreachable
  cognition (own `MultiLLMProvider` at `:2245`, own `finalSystemPrompt`, own `scrubMemoryAmnesia`
  at `:2569`) remain in the tree.
- **CONTRADICTION WITH CLAUDE.md** — the anchor calls this route *"~zero live traffic"*. At the
  subject it is not low-traffic; it is **hard-refused**. Per D-P1-06 the anchor does not amend the
  code; both statements recorded.

---

### A-14 · `/api/voice/stream-conversation` — the second mind, orphaned at the client

- **DECLARED WHERE** — `app/api/voice/stream-conversation/route.ts` (1639 lines).
- **COMPUTED WHERE** — independent cognition: `getClaudeService()` (`:28`),
  `MemoryBundleService` (`:33`), `MEMORY_CANON_GUARD_PROMPT` (`:35`), `guardVoiceChunk` (`:36`),
  own TTS stack (`:37-41`), own prosody (`:73-78`).
- **CONVERGENCE** — ⛔ **NONE.** Zero references to `getMaiaResponse`, `maiaService`,
  `buildMaiaWisePrompt` or `finalizeMemberFacingText` (verified by grep).
- **UPSTREAM DEPENDENCIES** — sole fetch site `hooks/useStreamingVoice.ts:633`. The hook is
  imported at `components/OracleConversation.tsx:15` and its `sendMessage` is destructured as
  `sendStreamingMessage` at `:2604` — **and never invoked**: the only other occurrences of that
  identifier in the file are the two comment lines `:7354` and `:7375` describing its removal.
- **GOVERNANCE GATE** — `__tests__/voice-non-degradation.test.ts` (two compiler-derived closed sets
  over `handleVoiceTranscript`); doctrine `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`;
  exit map `docs/architecture/VOICE_CANONICAL_CONVERGENCE_02_EXIT_MAP.md`. All three verified
  present at the subject.
- **CURRENT STATUS** — **ORPHANED** (route + hook exist; declared consumer no longer invokes them).
  ⛔ Not DORMANT-by-refusal: the route has no gate of its own; it is unreached, not closed.
- **CONTRADICTIONS** — `components/OracleConversation.tsx:7370-7377` states the implementation is
  *"UNTOUCHED AND UNDELETED"* deliberately. The test header (`:77-84`) states the gate
  *"does not claim universal MAIA egress convergence"* and that Class C `maiaSpeak()` sites plus
  `OracleConversation.tsx:6712` (a crisis script spoken outside any guard) are **separately
  recorded findings, unrepaired** — *"FROZEN IS NOT BLESSED."*

---

### A-15 · Peripheral MAIA-claiming routes with independent cognition

- **CAPABILITY** — produce member-facing text that claims to be MAIA, outside every path above.
- **DECLARED WHERE** — 25 route handlers declare their own MAIA identity string. Direct
  `new Anthropic()` clients in routes: `app/api/maia/relational-navigation/route.ts:46`,
  `app/api/maia/living-field/[fieldKey]/encounter/route.ts:34`,
  `app/api/maia/living-field/[fieldKey]/refine/route.ts`,
  `app/api/portal/[slug]/chat/route.ts:32`,
  `app/api/practitioner/practice-field/draft/route.ts:40`,
  `app/api/studio/with-me/sessions/[sessionId]/synthesize/route.ts`,
  plus `app/api/_backend/src/**` (3 files, excluded from the 25).
  Others route through `generateText` with a local prompt, e.g. `app/api/ask-maia/ask/route.ts:84`.
  Full list of identity-declaring route files is reproducible with the grep in §5.
- **CONVERGENCE** — ⛔ **NONE** with `getMaiaResponse`.
- **GOVERNANCE GATE** — **NONE FOUND** as a class. No registry entry, no
  `buildMaiaRuntimeContext`, no `ADDENDA_SPECS`, no four standing texts, no
  `finalizeMemberFacingText`, no `assertProviderAvailable`. `middleware.ts` matches them (tier /
  access), which governs **who may call**, never **what may be said in MAIA's name**.
- **CURRENT STATUS** — **PARTIAL** as a class; individual statuses not determined in this slice.
  `app/api/maia/chat/route.ts:26` is an explicit refusal stub (PersonalOracleAgent removed for
  external-API violation, 62 lines). `app/api/maia/field-driven-response/route.ts:3` self-declares
  *"TEMPORARILY DISABLED"* and returns simulated text (`:69`) — i.e. it still answers.
- **UNRESOLVED QUESTIONS** — how many of the 25 are reachable by a member at the subject; which
  are practitioner-only (deferred to Domain I under `P1-GOV-ACCESS-01`).

---

### A-16 · Model / provider dispatch (boundary to Domain G)

- **DECLARED WHERE** — `lib/ai/modelService.ts:76` (`generateText`) — described in-source as
  *"Main gateway for ALL text generation in MAIA"* (`:72`).
- **GOVERNANCE GATE** — `ALLOW_OPENAI_TEXT = false` (`:61`); explicit throw
  *"SOVEREIGNTY VIOLATION: OpenAI is FORBIDDEN"* (`:90`); `MAIA_INFERENCE_MODE` hands off to
  `lib/ai/sovereignRouter.ts:134` (`:83-85`).
- ⚠️ **THE GATEWAY CLAIM IS FALSE AT THE SUBJECT.** A-14 (`getClaudeService`), A-15 (six routes with
  `new Anthropic()`), A-13's `MultiLLMProvider`, and DEEP-primary's `consciousnessWrapper` all reach
  a model without passing `lib/ai/modelService.ts`. Both sides preserved.
- **CURRENT STATUS** — **PARTIAL**. Detailed adjudication belongs to Domain G.

---

### A-17 · Runtime governance instruments actually found on the canonical lane

| Instrument | Location | What it refuses |
|---|---|---|
| Schema gate | `list/route.ts:296-306` | serves 503 if migrations behind code |
| Identity resolution | `list/route.ts:329`, `list/resolveIdentity.ts` | body `userId` never trusted |
| Provider gate | `list/route.ts:1362`, `lib/maia/assertProviderAvailable.ts` | 503 before generation, never MAIA prose |
| Route registry | `lib/maia/maiaRuntimeContext.ts:60-101` | ⚠️ warns only — *"Non-blocking: unknown routeId = warn + passthrough"* (`:198-200`) |
| Safe mode | `maiaVoice.ts:550`; four route consts | replaces the entire prompt with `buildSimpleMaiaPrompt` |
| Addenda registry | `maiaVoice.ts:414-442` | closed 27-field list for the `buildMaiaWisePrompt` family |
| Standing texts | `maiaVoice.ts:460/484/497` + `:530-544` | ⚠️ CORE + DEEP-repair only (see A-03) |
| Egress guards | `maiaService.ts:2660-2689` | presence constraint + identity-predicate reframe |
| Refusal registry | `tests/constitutional/refusal-registry/` (31 checks) | **static/CI assertions, not runtime refusals** |
| Middleware | `middleware.ts:478-487` | tier/access at the HTTP edge; negative matcher |
| Canonical floor | `lib/maia/canonical-turn/floor.ts:23-26` | all four texts — shadow + Writers-Studio only |

⭐ **The refusal registry is the largest governance artifact in this domain and it does not run at
request time.** It is a source-scanning suite. ⛔ Recording that is not a claim that it should run
at request time.

---

## 3 · CONTRADICTIONS (both sides visible, unreconciled)

1. **Registry vs orchestrator.** `maiaRuntimeContext.ts:81` — `between/chat` `callsMaiaResponse:
   false`. `maiaOrchestrator.ts:506` — it does. ⇒ a live lane reaches cognition outside the wrapper
   its own header declares mandatory (`maiaRuntimeContext.ts:3-5`).
2. **DEEP addenda, in one function.** `maiaService.ts:2519-2521` (does NOT iterate) vs
   `maiaService.ts:2526-2535` + `maiaVoice.ts:972` (does iterate).
3. **Guardrail parity.** `CMT-01_M0-M2_WITNESS_2026-09-03.md:82-84` asserts FAST closes with the
   three guardrails; `lib/sovereign/maiaService.ts` contains none of the three identifiers. The
   witness is true of `floor.ts`; it is not true of `fastPathResponse`.
4. **Oracle lane.** `CLAUDE.md` — *"~zero live traffic"*. `oracle/conversation/route.ts:452` — hard
   410. Per D-P1-06 the anchor is evidence, not law; the code stands.
5. **Reported tier vs executed tier.** `maiaService.ts:3245` reports `'DEEP'` for an RCN turn that
   ran no tier.
6. **Sole-gateway claim.** `modelService.ts:72` (*"ALL text generation"*) vs at least four
   independent model reaches (§A-16).
7. **Egress mislabel.** `list/route.ts:1390` emits `endpoint: '/api/sovereign/app/maia'` from the
   `/list` handler; acknowledged in-source, untouched.

## 4 · UNLOCATED GOVERNANCE

- **GOVERNANCE GATE: NONE FOUND** — tier selection (A-02): nothing consents to, discloses, or
  refuses which mind answers.
- **GOVERNANCE GATE: NONE FOUND** — MAIA identity-source uniqueness (A-09): 96 declaration sites,
  no registry covering them.
- **GOVERNANCE GATE: NONE FOUND** — the 25 peripheral MAIA-claiming routes (A-15) as a class.
- **GOVERNANCE GATE: NONE FOUND** — dormant sibling `/api/sovereign/app/maia` (A-12): dormancy is a
  comment, not a refusal.
- **GOVERNANCE GATE: NONE FOUND** — `/api/voice/stream-conversation` (A-14) has no gate of its own;
  the only instrument is a unit test over a *client component*.
- **GOVERNANCE GATE: NONE FOUND** — `MAIA_SAFE_MODE`: no located ruling on who sets it or what it
  may remove, though it removes every addendum and every standing text.
- **PARTIAL** — the route registry is advisory (`maiaRuntimeContext.ts:198-200`); its CI
  promotion is deferred ("step 6"/"step 7") in the same file's own comments (`:34-36`, `:52-57`).

## 5 · NAMED-BUT-UNVERIFIED / VERIFIED ARTIFACTS

**Verified present at the subject:** `docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md` ·
`docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` ·
`docs/architecture/VOICE_CANONICAL_CONVERGENCE_02_EXIT_MAP.md` ·
`docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` ·
`__tests__/voice-non-degradation.test.ts` · `lib/maia/substrateObservability.ts` ·
`lib/maia/assertProviderAvailable.ts` · `lib/consciousness/processingProfiles.ts` ·
`lib/consciousness/MAIA_RUNTIME_PROMPT.ts` · `lib/maia/canonical-turn/` (14 modules) ·
`tests/constitutional/refusal-registry/` (31 checks).

**Named in-source, NOT verified in this slice:** `memory/project_recurrence_prevention_architecture.md`
(cited `maiaRuntimeContext.ts:22`) · `docs/specs/ENTRUSTMENT_COVENANT_PROTOCOL_2026-06-05.md` and
`ENTRUSTMENT_KEEP_SPEECHACT_GATE_2026-06-05.md` (cited `maiaVoice.ts:524-531`) ·
`docs/canon/INTERFACE_HUMILITY.md` (cited `maiaVoice.ts:472`).

**Reproduction commands for the counts in this record:**

```bash
grep -rln "You are MAIA\|You are Maia" app/api lib --include=*.ts | grep -v _backend    # 96
grep -rln "new Anthropic\|@anthropic-ai/sdk" app/api --include=*.ts                      # 10
grep -rn "getMaiaResponse" app/ lib/ --include=*.ts | grep -v __tests__
```

## 6 · OPEN QUESTIONS FOR P1-04

1. Is a turn answered by DEEP-primary stage 1 — no system prompt, no standing texts, no addenda —
   the same MAIA as a CORE turn? The organism currently answers "yes" by naming both MAIA.
   **REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.**
2. What is the actual live tier distribution? Everything in A-02/03/04/05 is
   WIRED-BUT-UNOBSERVED; the guardrail divergence matters in proportion to FAST's share, which is
   unmeasured in-repo.
3. Does `buildMaiaRuntimeContext`'s declared contract (*"every route calling getMaiaResponse must
   pass through this wrapper"*) have any authority, given `between/chat` does not and the registry
   only warns?
4. Which of the 25 peripheral MAIA-claiming routes are member-reachable, and under what consent?
   (Hands to Domain I / `P1-GOV-ACCESS-01`.)
5. `/api/voice/stream-conversation` is a complete second mind, deliberately preserved and currently
   uninvoked. What governs its re-invocation? Today: one client-side unit test.
6. Should the canonical cognition boundary be the `getMaiaResponse` convergence
   (`maiaService.ts:2704`), the `generateText` gateway (`modelService.ts:76`), or the canonical-turn
   renderer? All three are **claimed** as chokepoints in-source; none is one. ⛔ Not answered here —
   constraint 3 holds and the boundary remains **UNKNOWN**.
7. `refusal-19:25` explicitly states the oracle lane's content writers remain ungoverned behind a
   410. Is unreachable-but-ungoverned an acceptable resting state? **REPAIR QUESTION MAY EXIST —
   NOT YET AUTHORIZED.**

---

```text
DOMAIN A · CAPABILITY RECORDS: 17
LIVE 1 · PARTIAL 3 · OBSERVATION-ONLY 1 · WIRED-BUT-UNOBSERVED 8 · DORMANT 2
ORPHANED 1 · BLOCKED 1
CANONICAL COGNITION BOUNDARY: UNKNOWN
```
