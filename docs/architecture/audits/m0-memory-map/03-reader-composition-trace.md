# M0 Memory Map — Lane 3: Retrieval → Composition → MAIA Surface Trace (reader side)

Date: 2026-08-09 · READ-ONLY discovery · Branch: feature/labtools-redesign (working tree)
Scope: how member memory actually reaches MAIA's prompt and the member today.

---

## 1. The live route: `app/api/sovereign/app/maia/list/route.ts` (1,583 lines)

All memory assembly for the production MAIA surface happens here, then flows into
`getMaiaResponse()` (`lib/sovereign/maiaService.ts`) as `meta.*` fields. Global gates
computed early (~lines 412–453):

- `isSanctuary = meta.sanctuary === true`
- `allowCrossSessionMemory = isRecognizedUser && !isSanctuary`
- `shouldBuildMemory = !isSanctuary && allowCrossSessionMemory && memoryMode !== 'ephemeral'`
  (`memoryMode` from `lib/memory/MemoryGate.resolveMemoryMode`)

### Memory inputs loaded at the route (in load order)

| # | Input | Loaded by | Formatted by | Carried as |
|---|-------|-----------|--------------|------------|
| 1 | Memory bundle (recent turns, semantic memories, breakthroughs, relationship snapshot) | `MemoryBundleService.build` (`lib/memory/MemoryBundle.ts`) | bundle → formatted string | `meta.memoryBundle` + `meta.memoryContext` |
| 2 | Wu Xing snapshot | parallel leg 2 | inline | `meta.wuxingSnapshotAddendum` |
| 3 | Astrology (birth chart + transits) | `getAstrologyContextForUser` | `SYMBOLIC_LENS_BOUNDARY` preface + capped detail (3,000 chars) | `meta.astrologyAddendum` |
| 4 | Member Web (spiral state, active patterns, session remembrances, journals, relationship essence, theme signals, field state) | `buildMemberLiveContext` (`lib/memory/MemberLiveContext.ts` — loads `loadSpiralState`, `loadJournals`, `loadRelationshipEssence`, patterns, summaries) | `formatMemberWebForPrompt` — "🕸️ MEMBER WEB (Silent context…)" | `meta.memberWebAddendum` |
| 5 | Place context (House Presence) | `validatePlaceContext` | `buildPlaceAddendum` | `meta.placeAddendum` |
| 6 | Practice Field (practitioner accompaniment) | `buildPracticeFieldContext` | `formatPracticeFieldContextForPrompt` | `meta.practiceFieldAddendum` |
| 7 | AIN Knowledge Gate (flag `AIN_KNOWLEDGE_GATE_ENABLED=1`, skipped in sanctuary) | `scoreKnowledgeGate` | inline source-mix block | `meta.knowledgeGateAddendum` |
| 8 | Developmental memories + theme signals | `loadRecentDevelopmentalMemories`, `loadRecentThemeSignals` (`lib/maia/memoryLoaders.ts`) | `buildMemoryInfluencePlan` (`lib/maia/memoryOrchestrator.ts`) — **directional primes only, content deliberately withheld** ("do not cite it") | `meta.memoryInfluenceAddendum`, `meta.forwardReadinessAddendum` |
| 9 | Memory atoms incl. `is_breakthrough` | `loadMemberMemoryAtomsForPrompt` (`lib/maia/memoryAtomsLoader.ts`) | `formatAtomsForPrompt` | `meta.atomsAddendum` (+ `atomsLoadedCount`) |
| 10 | Conversational Phase 2 (prior cross-session exchanges) | `loadConversationalRecallPref` + `loadPriorCrossSessionExchanges` | `formatPriorExchangesForPrompt` (`lib/maia/conversationalRecallBlock.ts`) — log `[MAIA] conversational-block` | `meta.conversationalRecallAddendum` |
| 11 | Episodic (member-marked moments) | `loadEpisodicRecallPref` + `loadRecentMarkedEpisodes` | `formatMarkedEpisodesForPrompt` (`lib/maia/episodicRecallBlock.ts`) | `meta.episodicRecallAddendum` |
| 12 | In-turn correction repair (Layer A corrigibility) | route inline | inline | `meta.correctionRepairAddendum` |
| 13 | Studio prompt cap (surface === 'studio') | route inline | inline | `meta.studioAddendum` |

### Loaded/computed but NOT prompt inputs (observability lane)

- **memoryHealth** (`buildMemoryHealth`, `lib/maia/memoryHealth.ts`): semantic/atoms count,
  breakthrough count, conversational count, error states → logged
  (`[MAIA/sovereign] memoryHealth`) and passed to `buildMaiaRuntimeContext` — never in prompt. By design.
- **buildMaiaRuntimeContext** (`lib/maia/maiaRuntimeContext.ts`): **confirmed still observer,
  not orchestrator.** File header states explicitly: validates routeId against registry,
  inspects provider config, emits 8-field observability log, "does NOT … modify the meta
  passed to getMaiaResponse()". Role unchanged from the recorded characterization.
- **Corpus Callosum** (`logAgentRun` at route line ~1240; `logCorpusCallosumTrace` in
  maiaService): **write-only emission** into `agent_runs`/traces. Nothing from
  `agent_runs`/`integration_passes` is ever read back into prompt composition. Substrate is
  observational, not a memory input.
- **Breakthrough surfacing log**: `markedBreakthroughCount` from surfaced atoms → log line
  `[MAIA/sovereign] breakthrough surfaced` (the atoms block itself carries the marker text).

### NOT loaded on the live route (notable absences)

- **Anchors** (`lib/anchor/loadRecentAnchors.ts` + `surface_preference` gate): **not imported
  by the live route at all.** `buildAnchorContextBlock` is wired only into
  `app/api/oracle/conversation/route.ts` (line 2407) — the ~zero-traffic route. The
  consent-gated ambient anchor surfacing mechanism (verified 2026-07-03) is therefore
  **unreachable from the production MAIA surface**. Consistent with the 2026-08-09 founder
  correction (0 rows), but structurally: even if members created anchors, the live route
  would not surface them.
- **Spiral Orientation Cut 2**: commented out in the live route (lines 1028–1040,
  `buildMemberSpiralOrientation` import commented at line 138). Spiral state reaches the
  prompt only indirectly, via MemberLiveContext → member web block.
- **spiralSnapshotAddendum**: consumed by maiaService FAST/CORE, but **produced only by
  `app/api/between/chat/route.ts`** (line 1623). On the sovereign route it is always undefined.

### Output-side guard

`scrubMemoryAmnesia` (`lib/maia/prompts/memoryCanonGuard.ts`) runs post-generation on the
live route (lines ~1109–1140) — deterministic replacement when MAIA claims amnesia while
memory layers were actually loaded (`hasLoadedContext` = atoms || conversational || episodic
|| memberWeb || memoryContext). This is the canon §V enforcement moved to where the traffic is.

---

## 2. Tier composition inside `lib/sovereign/maiaService.ts` (3,710 lines)

### FAST (~lines 637–1370)

```
route meta ─────────────────────────────────────────────┐
                                                        ▼
FAST prompt template literal (line 1293), single string concat:
  MAIA_RUNTIME_PROMPT + userIdentification + placeAddendum + modeAdaptation
  + timeAwareness + cognitiveScaffolding + relationshipContext (RelationshipMemoryService,
    loaded in-service, sanctuary-skipped) + selfletPromptBlock + sanctuaryInstruction
  + wisdomInjection + knowledgeFieldAddendum + epistemicPath + spiralSnapshot(∅ on live route)
  + therapeuticFramework + reflectionLens + governor + maiaMode + scribeSessionDiscussion
  + wuxing + astrology + practiceField + studio + knowledgeGate + memberWeb + fieldWisdom
  + conversationalRecall + episodicRecall + atoms + memoryInfluence + forwardReadiness
  + correctionRepair + stateVectorContract + youthPromptAddendum
contextPrompt = memoryContext (MemoryBundle) + recent thread + input   ← bundle is FAST-only
```

Every route-built memory addendum reaches the FAST prompt. Additionally:

- **FAST fallback fetch** (lines 794–806): if the route supplied no `memoryContext` and not
  sanctuary, FAST fetches recall itself via `memoryOrchestrator.formatRecallForPrompt(recall)`
  — relationship context, recent turns, breakthroughs. ⚠️ This in-service path does **not**
  check `conversational_recall_enabled` (see §5 gaps).

### CORE (~lines 1380–1779)

```
route meta ──▶ MaiaContext assembly (lines ~1540–1600): every *Addendum copied in
   + relationshipMemory (in-service load, sanctuary-skipped)
   + crossSessionTurns → effectiveHistory (in-service load, sanctuary-skipped)
        │
        ▼
buildMaiaWisePrompt(context, input, effectiveHistory)      lib/sovereign/maiaVoice.ts:530
        │
        ▼
appendAllContextAddenda(context, prompt)                   maiaVoice.ts:489
   iterates ADDENDA_SPECS (24 fields, maiaVoice.ts:405–429; atoms, conversational,
   episodic, memberWeb, astrology, place, governor, studio, knowledgeGate, fieldWisdom,
   consultation, correctionRepair, …)
   then appends, unconditionally:
     MEMORY SPEECH-ACT BOUNDARY (never claim "I kept that")
     PLATFORM_KNOWLEDGE_ADDENDUM (House Knowledge)
     PLATFORM_KNOWLEDGE_BOUNDARY
     INTERFACE_HUMILITY_GUARDRAIL (last)
```

All memory addenda reach the CORE prompt via the shared iterator. Note: the formatted
MemoryBundle (`memoryContext`) is **not** injected in CORE — cross-session continuity there
comes from `effectiveHistory` + the addenda blocks.

### DEEP (~lines 1782–2370)

```
in-service loads (sanctuary-skipped): relationshipMemory(full) · cross-session pairs →
effectiveHistory · wisdom routing / userIdentification → meta.selfletPromptBlock
        │
STEP 1  consciousnessWrapper.processConsciousnessEvolution(input, consciousnessContext)
        — local orchestrator draft. NO PROMPT SEAM by construction ("it weaves templates,
        it does not read a system prompt"). None of the route addenda enter here.
        │
STEP 3  Claude consultation lane — GATED:
        enableClaudeConsultation = process.env.MAIA_USE_CLAUDE_CONSULTATION === 'true'  (line 2080)
        If enabled: consultationRecallAddenda = [conversationalRecallAddendum,
          episodicRecallAddendum, atomsAddendum].filter(Boolean).join()  → contextAddenda
          param of consultClaudeForConsciousness (lines ~2088–2111).
        │
Socratic validator repair path (line ~2159): buildMaiaComprehensivePrompt →
        buildComprehensiveVoicePrompt → **result.prompt = appendAllContextAddenda(context, …)**
        (maiaVoice.ts:1034–1045)
```

### Addenda-channel divergence (§II.B / §II.C) — CURRENT STATUS

The recorded state in CLAUDE.md/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md is **outdated**:

- **§II.B is CLOSED.** `buildMaiaComprehensivePrompt` (maiaVoice.ts:1034) now explicitly
  appends `appendAllContextAddenda` to `buildComprehensiveVoicePrompt`'s output, with an
  in-code comment: "DEEP repair path joins FAST+CORE addenda channel via shared helper.
  Closes §II.B…". The shared helper `appendAllContextAddenda` is the single point of truth
  for FAST-adjacent CORE + DEEP-repair addenda ordering.
- **§II.C is partially closed but likely DORMANT.** The consultation lane pass-through
  (lines 2088–2100) carries conversational + episodic + atoms addenda — but only when
  `MAIA_USE_CLAUDE_CONSULTATION === 'true'`. That variable appears in **no** repo env file or
  compose file (grep of `.env*`, `docker-compose*.yml` — zero hits). Unless set on minisforum
  outside the repo, **DEEP-primary responses today carry NO route-built memory addenda at
  all**: local draft has no prompt seam; consultation is off; the repair path fires only on
  validator failure. DEEP's only memory is effectiveHistory (cross-session pairs) feeding the
  consultation context — itself dormant — and relationshipMemory stored on meta.
  **Needs prod verification**: `ssh soullab@minisforum 'docker exec maia-sovereign printenv MAIA_USE_CLAUDE_CONSULTATION'`.

### Per-tier memory reachability summary

| Input | FAST | CORE | DEEP-primary | DEEP-repair |
|---|---|---|---|---|
| MemoryBundle (`memoryContext`) | ✅ prompt | ❌ | ❌ | ❌ |
| Atoms (+is_breakthrough) | ✅ | ✅ | ⚠️ consultation-gated (likely off) | ✅ |
| Conversational Phase 2 | ✅ | ✅ | ⚠️ same | ✅ |
| Episodic (member-marked) | ✅ | ✅ | ⚠️ same | ✅ |
| Member Web (patterns/journals/summaries/spiral) | ✅ | ✅ | ❌ | ✅ |
| Memory-influence / forward-readiness primes | ✅ | ✅ | ❌ | ✅ |
| Astrology / WuXing / Place / PracticeField / KnowledgeGate / Studio | ✅ | ✅ | ❌ | ✅ |
| Relationship memory (in-service) | ✅ (relationshipContext) | ✅ (context obj) | ✅ (meta, indirect) | ✅ |
| Cross-session raw history (effectiveHistory) | recent thread only | ✅ | ✅ (into consultation ctx) | ✅ |
| Anchors | ❌ (not wired) | ❌ | ❌ | ❌ |
| Spiral Orientation Cut 2 | ❌ (commented out) | ❌ | ❌ | ❌ |
| Corpus callosum rows | ❌ (write-only) | ❌ | ❌ | ❌ |
| memoryHealth | ❌ (observability, by design) | ❌ | ❌ | ❌ |

---

## 3. Secondary read paths

| Path | Status | Memory reads |
|---|---|---|
| `app/api/oracle/conversation/route.ts` | **Effectively orphaned surface** (~zero live traffic per prior audit; 13 stale client refs in components still point at it). | The richest reader in the repo: sessionMemoryService, RelationshipAnamnesis, MemoryPalaceOrchestrator, `loadSpiralState`/`upsertSpiralState` (Bridge D), **`loadRecentAnchors` + `buildAnchorContextBlock` (line 2407 — the ONLY anchor read)**, MemberLiveContext, memoryOrchestrator, conversational recall. Memory features wired here-only are functionally dark. |
| `app/api/between/chat/route.ts` | Separate live surface (BETWEEN product; the historical typecheck entrypoint). | RelationshipMemoryService, SignificantMomentsService (`formatSignificantMomentsAddendum`), selflet context, developmental + theme signals via memoryOrchestrator, **spiralSnapshotAddendum (only producer, line 1623)**. Uses its own `asSafeAddendum` assembly then calls maiaService with meta addenda. |
| `app/api/caseload/[caseId]/memories/list|search` | Real practitioner surface. | Case-scoped documents (CaseMemoryService/CasePatternService) — practitioner case memory, **not** member conversational memory. Gated by `requireSelfScopedMember` (founder ruling 2026-08-09: caller-supplied identity never authority) + `CaseStore.getCase(caseId, memberId)` ownership check. |
| `app/api/studio/*` reads (pattern-ledger, sessions, consult) | Practitioner surfaces. | `lib/team/sessionTeamScope.ts` (`resolveSessionTeamId`) is a **write-side** scoping fix (#899) used only by `app/api/studio/sessions/route.ts` — fails loudly if a booking cannot be scoped to the practitioner's own Co-Lab. Not part of the member-memory read path. |
| `lib/soulPortrait/generator/*` | Member-facing generator. | **No member-memory reads.** Inputs are birth data → ephemeris/astrology + archetype catalog + LLM. "essence" here is archetype essence, not relationship essence. |
| `app/api/premium-storage/journey|export` | Self-scoped (`requireSelfScopedMember`); `PremiumStorageService.generateConsciousnessJourney`. Zero client refs found for `journey` → likely dormant surface. Service internals not audited in this lane. |
| Orphan candidates (client-ref counts) | `app/api/maia/memory-enhanced-response` (0), `premium-storage/journey` (0), `oracle/memory` (1), `maia/memory/ingest` (1), `consciousness/memory/*` (3) — all candidates for the write-side lane to cross-check; none participate in live composition. |

---

## 4. Filtering in the read path — where it exists

**Sanctuary** (strongest, multi-layered):
1. Route: `shouldBuildMemory=false`, astrology/memberWeb/knowledge-gate skipped, recall
   formatters called with `mode: 'Sanctuary'` (suppression inside formatter).
2. maiaService: each tier independently re-checks `meta.sanctuary` and skips relationship
   memory + cross-session loads (`[FAST|CORE|DEEP] Sanctuary mode active`).
3. FAST nullifies `memoryContext` under sanctuary (line 789).
4. MemberLiveContext contract: "may NOT contain raw conversation content from sanctuary
   sessions"; `skipDbReads` option for sanctuary/anonymous.

**Consent flags** (opt-out model, default TRUE):
- `members.conversational_recall_enabled` — checked by `loadConversationalRecallPref`,
  enforced inside `formatPriorExchangesForPrompt` (suppression rule 1).
- `members.episodic_recall_enabled` — same pattern for marked episodes.
- Atoms (`lib/maia/memoryAtomsLoader.ts` — the most disciplined reader): SQL-level gates —
  memory_scope + scope context (team_id/client_id/encounter_id), `member_pulled` atoms
  structurally excluded from ambient surfacing, practitioner observations with
  `member_response_status = 'rejected'` excluded ("declined = released").
- Anchors: `surface_preference IN ('contextual_doorway','ritual_review_opt_in')` — correct
  gate, but only reachable from the dead oracle route.

**Team/practitioner boundaries**: atoms colab/client/encounter scoping (SQL); caseload +
premium-storage self-scoped identity; sessionTeamScope (write-side); practitioner
observation atoms carry facilitator identity + epistemic status.

## 5. Filtering gaps (reader-side)

1. **History channel bypasses recall consent.** `conversational_recall_enabled` gates only
   the *addendum* channel. CORE (crossSessionTurns → effectiveHistory, ~line 1414) and DEEP
   (~line 1897) load raw cross-session exchange pairs directly into conversation history with
   only the sanctuary check — a member who opts out of conversational recall still gets
   cross-session content injected as history on CORE/DEEP turns.
2. **FAST fallback bypasses recall consent.** The in-service `[FAST/MemoryFallback]`
   (maiaService ~794–806) fetches memoryOrchestrator recall (relationship, turns,
   breakthroughs) whenever a caller supplies no `memoryContext` — sanctuary-checked, but no
   `conversational_recall_enabled` check. Any getMaiaResponse caller other than the live
   route can trip this.
3. **Bundle/MemberWeb have no member-facing consent gate.** MemoryBundle (turns, semantic,
   breakthroughs, relationship) and MemberLiveContext (patterns, journals, summaries,
   essence, theme signals) load under "continuity mode" implicit consent only — no per-layer
   opt-out exists for patterns/journals/summaries, unlike conversational/episodic.
4. **DEEP asymmetry.** If consultation env is off (repo default), DEEP-primary responds with
   no route-composed memory at all while FAST/CORE are memory-rich — the member experiences
   memory loss precisely on explicit-depth turns. (Inverse of the original §II.B worry: not
   unfiltered injection, but silent non-injection.)
5. **Anchors: consented mechanism, unreachable surface** (see §1). Consent architecture
   exists; composition wire on the live route does not.

## 6. Provenance labeling in composed blocks — mostly good

- **Atoms** (`formatAtomsForPrompt`): exemplary. `# MEMBER-PLACED PORTFOLIO` ("member-placed,
  not system-inferred… do NOT cross-reference, synthesize"), per-atom member markers
  ("marked as a breakthrough by the member", "marked still alive by the member"), separate
  `# PRACTITIONER OBSERVATIONS` section with epistemic-standing phrasing rules ("A
  practitioner observed…", never collapse to "You are…").
- **Conversational block**: "PRIOR EXCHANGES (cross-session continuity, structural recall
  only)" — "raw structural recall — no thematic clustering, no system interpretation."
- **Episodic block**: "MEMBER-MARKED MOMENTS (episodic continuity, structural recall only)".
- **Memory-influence addendum**: content-free directional primes by design.
- **Member Web**: single "silent context" block that **mixes provenance** — system-derived
  patterns (confidence-labeled) + theme signals (epistemic label corrected per R4 ruling)
  + member-authored journals + system-summarized sessions under one header. Weakest
  provenance separation of the composed blocks.
- **MemoryBundle → memoryContext (FAST)**: bullets carry internal `source:
  turn|developmental|insight|breakthrough` but the formatted string's member-visible
  provenance labeling was not verified in this lane — flag for follow-up.
- Standing guards appended every FAST/CORE/DEEP-repair turn: MEMORY SPEECH-ACT BOUNDARY,
  platform knowledge boundary, Interface Humility guardrail; plus output-side
  `scrubMemoryAmnesia` on the live route.

## 7. Written-but-never-composed (reader-side view)

- `member_daily_anchors` (also 0 rows) — loader exists, live route never calls it.
- `agent_runs` / `integration_passes` (corpus callosum) — written every turn, never read into composition.
- `member_spiral_state` — written (Bridge D), read only via MemberLiveContext summary + dead oracle route conductor seeding.
- Spiral Orientation Cut 2 sources — reader commented out on the live route.
- memoryHealth — computed per turn, observability only (by design, correct).

## 8. Verification commands (prod)

```bash
ssh soullab@minisforum 'docker exec maia-sovereign printenv MAIA_USE_CLAUDE_CONSULTATION'  # DEEP consultation lane live?
ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 | grep -E "conversational-block|deep-consultation recall-addenda|breakthrough surfaced|memoryHealth"'
```
