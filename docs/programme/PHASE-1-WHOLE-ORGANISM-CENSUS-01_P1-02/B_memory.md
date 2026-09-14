# P1-02 · DOMAIN B — MEMORY / ANAMNESIS

```text
STEP      P1-02 · PARALLEL ORGANISM CENSUS
DOMAIN    B · Memory / Anamnesis
SUBJECT   1a5554300e855d3581085849301a39cbb10ab385
TYPE      RECORD ONLY — evidence, never rulings
AUTHORITY READ / TRACE / CLASSIFY
```

> **P1-02 asks what the organism does. It does not infer from doing that the organism is
> authorized to do it.**

---

## 0 · Custody, scope and calibration

**Census subject verification.** The checkout is at `f0279c5b0eee0ae7090df38b67d820923917c58c`
(branch `claude/quirky-lovelace-yxaes0`, working tree clean). `git diff --name-only
1a5554300e855d3581085849301a39cbb10ab385 HEAD` returns **14 paths, all under
`docs/programme/PHASE-1-WHOLE-ORGANISM-CENSUS-01*`** — P1-01 slice records, the C-2 ruling, the
flow, the custody record and the P1-02 instrument. **No `lib/`, `app/`, `database/` or `scripts/`
file differs between the subject and this checkout.** Every code claim below is therefore a claim
at the subject. This is stated because it is checkable, not because it was assumed.

**`LIVE` calibration applied verbatim.** There is no runtime, no database and no production access
here. `LIVE` is asserted only where a traced call path at the subject is joined by a **dated
runtime/production witness record in-repo**. Exactly **one** memory arena meets both conditions
(§2.5). Everything else with a complete traced path is `WIRED-BUT-UNOBSERVED`, which is the honest
default for this census.

**Collapse refused.** A migration declaring a table is not participation. A service file existing
is not participation. The test applied throughout is: *does the live serving route reach it on a
turn, and does its material reach a prompt string?* Those are two separate questions and are
answered separately at every stage.

**The live route.** `app/api/sovereign/app/maia/list/route.ts` (1,980 lines). Its own header
comment at `:113-120` states *"THIS is the live sovereign-MAIA route the UI actually hits (not
`/api/sovereign/app/maia/route.ts`, which is dormant). The 'list' in this filename is misleading —
it serves the chat path."* The in-repo report `docs/ops/MAIA_MEMORY_SELECTION_REALITY_REPORT_2026-08-04.md:6`
independently names the same route as active at deployed SHA `57b0324fd`. Traffic distribution
across `/api/oracle/conversation`, `/api/between/chat` and `/api/voice/stream-conversation` is
**`UNKNOWN`** in this container and is not assumed anywhere below.

---

## 1 · ARENA ENUMERATION BY NAMED OBJECT — stop-stage table

Every row is a **named object**, not a vocabulary term. Stop-stage = the last stage of
`EXISTS → COMPUTED → PERSISTED → LOADED → SURFACED → UPDATED` the object demonstrably reaches on
the live route, or on the route named in the row.

| # | Named object | Table(s) | Stop stage | Status |
|---|---|---|---|---|
| B-01 | `TurnsStore` + `meta.conversationHistory` (session thread) | `conversation_turns` | **UPDATED** | WIRED-BUT-UNOBSERVED |
| B-02 | `MemoryBundleService` | `conversation_turns`·`developmental_memories`·`breakthrough_moments` | **SURFACED (FAST only)** | WIRED-BUT-UNOBSERVED |
| B-03 | `loadMemberMemoryAtomsForPrompt` (memoryHealth key `semantic`) | `member_memory_atoms` | **UPDATED** | **LIVE** |
| B-04 | `loadPriorCrossSessionExchanges` (conversational recall) | `conversation_turns` | **SURFACED** | WIRED-BUT-UNOBSERVED |
| B-05 | `loadRecentMarkedEpisodes` (episodic, member-marked) | `episodic_memories` | **UPDATED** | WIRED-BUT-UNOBSERVED |
| B-06 | `loadRecentDevelopmentalMemories` → `buildMemoryInfluencePlan` | `developmental_memories` | **SURFACED (FAST only)** | PARTIAL |
| B-07 | `loadRecentThemeSignals` (pattern cue) | `member_theme_signals` | **SURFACED (FAST only, inside B-06's block)** | PARTIAL |
| B-08 | `is_breakthrough` on atoms | `member_memory_atoms` | **UPDATED** | WIRED-BUT-UNOBSERVED |
| B-09 | `MemoryWritebackService` | writes `developmental_memories`·`breakthrough_moments`·`conversation_insights` | **UPDATED (write-only)** | WIRED-BUT-UNOBSERVED |
| B-10 | `buildMemberLiveContext` ("member web") | `member_spiral_state`·session summaries·`member_patterns`·journals·`relationship_essences`·`member_theme_signals` | **SURFACED** | WIRED-BUT-UNOBSERVED |
| B-11 | `RelationshipAnamnesisPostgres` (essence) | `relationship_essences` | **UPDATED** | WIRED-BUT-UNOBSERVED |
| B-12 | `RelationshipMemoryService` (`loadRelationshipMemory`) | relationship/turn aggregates | **SURFACED (FAST + CORE)** | WIRED-BUT-UNOBSERVED |
| B-13 | Relational Context Bridge (`getMemberActiveRelationalContext`) | `member_relationships` | **SURFACED** | WIRED-BUT-UNOBSERVED |
| B-14 | `loadRecentIChingReadings` (divination recall) | I Ching readings | **SURFACED** | WIRED-BUT-UNOBSERVED |
| B-15 | `ConsciousnessMemoryLattice` (`lattice`) | lattice store | **LOADED — recall result discarded; write path separate** | **PARTIAL / recall ORPHANED downstream** |
| B-16 | `spiralStatePersistence` | `member_spiral_state` | **UPDATED** | WIRED-BUT-UNOBSERVED |
| B-17 | Selflet temporal message | `selflet_messages`·`selflet_nodes` | **SURFACED (FAST + CORE)** | WIRED-BUT-UNOBSERVED |
| B-18 | `recordMemoryTransitions` | `memory_transition_records` | **PERSISTED (observability)** | WIRED-BUT-UNOBSERVED |
| B-19 | `ConversationMemoryUsesStore` (retrieval audit) | `conversation_memory_uses` | **PERSISTED (observability)** | WIRED-BUT-UNOBSERVED |
| B-20 | `buildMemoryHealth` / `recordRuntimeTurn` | `runtime_events.memory_layers` | **PERSISTED (observability)** | WIRED-BUT-UNOBSERVED |
| B-21 | `memoryCanonGuard` (`scrubMemoryAmnesia`, `MEMORY_CANON_GUARD_PROMPT`) | none | **SURFACED (prompt) + post-generation scrub** | WIRED-BUT-UNOBSERVED |
| B-22 | `MemoryGate.resolveMemoryMode` | env + allowlist | **COMPUTED (gate)** | WIRED-BUT-UNOBSERVED |
| B-23 | `TurnPosture` / `contentWritable` (Sanctuary) | none | **COMPUTED (gate at 4 store boundaries)** | WIRED-BUT-UNOBSERVED |
| B-24 | `MemoryPalaceOrchestrator` + its 8 services | `somatic_memories`·`morphic_pattern_memories`·`coherence_field_readings`·episodes·achievements·evolution | **SURFACED — on `/api/oracle/conversation` only** | WIRED-BUT-UNOBSERVED |
| B-25 | `recurrenceDetector` | reads `member_theme_signals` | **EXISTS** | **DORMANT** (zero callers) |
| B-26 | `confidenceDecay.ts` (`calculateDecayedConfidence`, `shouldPromptForConfirmation`) | — | **EXISTS** | **ORPHANED** (imported, never called) |
| B-27 | `lib/anamnesis/*` (`AnamnesisField`, `DecentralizedMemory`, `MemoryCoreIndex`, `CollectiveConsciousnessBridge`, `UnifiedMemoryInterface`) | — | **EXISTS** | **DORMANT / ORPHANED** |
| B-28 | `lib/memory/MemoryManager.ts`, `VaultSymbolIndex.ts` | — | **EXISTS** | **DORMANT** (zero importers) |
| B-29 | `lib/memory/mem0.ts`, `lib/memory/beads-sync/` | — | **EXISTS** | legacy; `mem0` reachable from `lib/semantic`, `beads-sync` **DORMANT** |
| B-30 | `memory_contracts` table | `memory_contracts` | **PERSISTED** | read only by `lib/trust/service.ts` — outside the memory path |
| B-31 | `case_memories`, `case_memory_chunks`, `memory_links`, `vault_symbols`, `vault_query_patterns` | declared | **EXISTS (table)** | not reached by any traced turn path |

**Count at the subject: 31 distinct named memory objects.** That number is descriptive of this
trace, not a ratified enumeration, and §5 shows why no single count can be authoritative.

---

## 2 · CAPABILITY RECORDS

Only the records that carry load-bearing findings are given in full schema. The rest are
summarised in §1 and cited by `file:line` where a structural claim is made.

### 2.1 · B-02 · `MemoryBundleService` — the compressed cross-session bundle

```text
CAPABILITY      Ranked cross-session memory compressed into a prompt preamble.
DECLARED WHERE  lib/memory/MemoryBundle.ts:99 (`MemoryBundleService`)
COMPUTED WHERE  lib/memory/MemoryBundle.ts:112-117 — four parallel retrievals:
                getRecentTurns (:224 conversation_turns) · getSemanticMemories
                (:269, :319 developmental_memories, SQL decay term) ·
                getBreakthroughs (:362 breakthrough_moments) ·
                getRelationshipData (:398 conversation_turns aggregate)
PERSISTED WHERE not persisted — built per turn. Retrieval audit only:
                ConversationMemoryUsesStore.recordRetrievedCandidates (:133)
LOADED WHERE    app/api/sovereign/app/maia/list/route.ts:552-575 (parallel leg 1)
SURFACED WHERE  route :709 formatForPrompt → :1406 meta.memoryContext →
                lib/sovereign/maiaService.ts:925 read → :1058 interpolated into
                `contextPrompt`. ⛔ FAST ONLY.
UPDATED WHERE   n/a (read model)
```

⚠️ **CORE and DEEP do not read `meta.memoryContext` at all.** This is stated by the code itself,
twice, as an architectural fact and not a bug: `lib/sovereign/maiaService.ts:1629` (*"CC-A: CORE
does not read meta.memoryContext at all. That is an architectural fact"*) and `:2084` (*"DEEP does
not read meta.memoryContext either"*). The route builds the bundle on every eligible turn
regardless of tier.

```text
MEMBER AUTHORITY       none over the bundle as an object. Indirect: the bundle is
                       skipped entirely when sanctuary or memoryMode='ephemeral'
                       (route :541).
MAIA AUTHORITY         none — MAIA neither selects nor refuses bundle contents.
PRACTITIONER AUTHORITY none found.
SYSTEM AUTHORITY       total: composite scoring, decay, `maxBullets: 5` (route :568).
GOVERNANCE GATE        NONE FOUND for bundle composition. `MemoryGate.resolveMemoryMode`
                       gates whether it runs, not what it selects.
FAILURE MODE           catch → `null` → route continues with no bundle (:569-572);
                       5s `withTimeoutLabeled` (:573).
CURRENT STATUS         WIRED-BUT-UNOBSERVED (FAST); BLOCKED by construction on CORE/DEEP.
```

### 2.2 · B-06 / B-07 · Developmental + theme signals — the FAST-only influence plan

```text
COMPUTED WHERE  lib/maia/memoryOrchestrator.ts:214 buildMemoryInfluencePlan
LOADED WHERE    route :945-948 — loadRecentDevelopmentalMemories(userId, 3)
                and loadRecentThemeSignals(userId, 10), in parallel
SURFACED WHERE  route :991 memoryInfluenceAddendum → :1421 meta →
                maiaService.ts:1398 read → :1507 FAST template. ⛔ FAST ONLY.
```

⭐ **The tier-scope is explicit and documented as a truthfulness repair, not an accident.**
`lib/sovereign/maiaService.ts:3308` declares `const FAST_ONLY_ADDENDA = ['memoryInfluenceAddendum',
'forwardReadinessAddendum']`, and the comment at `:3291-3307` states these two fields *"have no
field on MaiaContext, are absent from ADDENDA_SPECS, and are not assembled by the CORE (:1571ff) or
DEEP (:2200ff) context builders. On a CORE or DEEP turn they cannot reach the prompt"* — against
an observed prevalence the same comment records as **CORE 72.8% / FAST 27.2%**. The repair made the
telemetry honest (`availableButNotComposed`, `:3310-3312`); it explicitly *"does NOT change which
addenda reach which tier"*, and names the remaining question as a deferred founder decision.

⚠️ **Somatic, morphic and semantic appear inside this plan as *message-text detectors*, not as
memory.** `lib/maia/memoryOrchestrator.ts:282-287` — `detectSemanticCandidate(message)`,
`detectSomaticCandidate(message)`, `detectMorphicCandidate(message)`, each annotated `(flag only)`.
No somatic or morphic store is read on this path. `lib/maia/types/memoryOrchestrator.ts:29-31`
labels `semantic_memory`, `somatic_memory`, `morphic_pattern` as *"Phase 2 placeholders — not yet
active."*

```text
GOVERNANCE GATE   route :943 `allowCrossSessionMemory && userId` — derived at :520 as
                  `isRecognizedUser && !isSanctuary`. No per-layer member consent gate
                  exists for developmental or theme signals (contrast B-04/B-05).
CURRENT STATUS    PARTIAL — LOADED on every eligible turn at every tier; SURFACED on FAST only.
```

### 2.3 · B-04 · Conversational recall (cross-session exchanges)

```text
COMPUTED/LOADED  lib/maia/memoryLoaders.ts:195 loadPriorCrossSessionExchanges
                 (`FROM conversation_turns`, :209)
CONSENT GATE     lib/maia/memoryLoaders.ts:241 loadConversationalRecallPref →
                 `SELECT conversational_recall_enabled FROM members` (:245).
                 Default-on, graceful-true on error.
SURFACED WHERE   route :1061 conversationalRecallAddendum → :1426 meta →
                 FAST maiaService.ts:1423 → :1507 template;
                 CORE/DEEP-repair via lib/sovereign/maiaVoice.ts:425 ADDENDA_SPECS
                 entry → :507-514 appendAllContextAddenda;
                 DEEP-consultation via maiaService.ts:2386.
MEMBER AUTHORITY PATCH /api/members/recall-preferences (route :96), column allowlist
                 at :43-45. UI: components/settings/MemoryConsentSection.tsx,
                 rendered from components/account/AccountSettings.tsx.
CURRENT STATUS   WIRED-BUT-UNOBSERVED. Reaches all three tiers.
```

### 2.4 · B-05 · Episodic — member-marked moments

```text
LOADED WHERE     lib/maia/memoryLoaders.ts:283 loadRecentMarkedEpisodes —
                 `FROM episodic_memories WHERE user_id=$1 AND marked_by_member = TRUE` (:297-299)
CONSENT GATE     lib/maia/memoryLoaders.ts:328 loadEpisodicRecallPref →
                 `SELECT episodic_recall_enabled FROM members` (:332)
SURFACED WHERE   route :1087 → meta :1427 → FAST maiaService.ts:1433 → :1507;
                 CORE/DEEP-repair via maiaVoice.ts:426 ADDENDA_SPECS.
UPDATED WHERE    POST/DELETE app/api/sovereign/episodes/mark/route.ts —
                 DELETE at :372-376 removes the row outright.
```

🔴 **`episodic_recall_enabled` is READ but has no member write path.** The loader reads it
(`memoryLoaders.ts:332`); the producer registry cites it as the consent basis
(`lib/maia/canonical-turn/producerRegistry.ts:133`, `consentBasis: 'episodic_recall_enabled'`); but
`app/api/members/recall-preferences/route.ts:43-45` allows exactly one column,
`conversational_recall_enabled`, and names episodic only in a comment at `:20` —
*"episodic_recall_enabled (when episodic Phase 2 lands)"*. A repository-wide grep for the column
across `app/`, `lib/` and `components/` returns no `UPDATE` and no UI control. **The gate exists
and is enforced on read; the member cannot move it.** Per constraint 6, naming this is not a repair
authorization. `REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED`.

### 2.5 · B-03 · Memory atoms — **the only arena meeting the `LIVE` calibration**

```text
DECLARED WHERE   lib/maia/memoryAtomsLoader.ts:230 loadMemberMemoryAtomsForPrompt
COMPUTED/LOADED  :278-291 — `FROM member_memory_atoms` with five refusal predicates:
                 scope · status IN ('active','still_alive') ·
                 return_preference IN ('contextual_doorway','ritual_review_opt_in') ·
                 NOT ('sacred_protected' = ANY(registers)) ·
                 PRACTITIONER_ATTRIBUTION_GUARD (:185-186) ·
                 member_response_status IS DISTINCT FROM 'rejected'
                 ORDER BY is_breakthrough DESC, kept_at DESC
LOADED WHERE     route :994 (inside the developmental try-block)
SURFACED WHERE   route :1006 atomsAddendum → meta :1424 → FAST maiaService.ts:1444
                 → :1507; CORE/DEEP-repair via maiaVoice.ts:427 ADDENDA_SPECS;
                 DEEP-consultation maiaService.ts:2388.
UPDATED WHERE    lib/psyche/portfolio.ts:525-610 applyGesture (11 gesture kinds) ·
                 app/api/psyche/portfolio/atoms/[id]/gesture/route.ts:114 POST ·
                 app/api/sovereign/atoms/[id]/breakthrough/route.ts:88 POST / :128 DELETE ·
                 app/api/sovereign/atoms/[id]/decline/route.ts:113 POST / :145 DELETE
```

**Runtime witness (dated, in-repo):**
`docs/ops/MAIA_MEMORY_SELECTION_REALITY_REPORT_2026-08-04.md:8` — *"4 `[MAIA/sovereign] atoms
loaded` emissions in 48h, most recent `{ count: 8, userId: 'ce284751...' }` — the path fires under
real member traffic and the limit saturates."* Deployed SHA `57b0324fd`, container created
2026-08-04T15:27Z, verified via `printenv GIT_COMMIT` (`:5-7`).

⚠️ **The witness is dated and its SHA is not the census subject.** The report's quoted `WHERE`
clause (`:23-30`) does not contain `PRACTITIONER_ATTRIBUTION_GUARD` or the `member_response_status`
predicate, both of which are present at the subject (`memoryAtomsLoader.ts:286-287`). The *path* is
the same; the *selection predicate has moved since the witness was taken*. `LIVE` is asserted for
the path. It is **not** asserted that the current predicate has been observed in production.

```text
MEMBER AUTHORITY       highest of any arena — 11 gestures, breakthrough mark/unmark,
                       decline, return-preference. ⛔ NO DELETE (see §4.3).
PRACTITIONER AUTHORITY practitioner_observation atoms may exist and may surface; they
                       must carry facilitator_id (:185-186) or they are refused. The
                       member may `decline` them (member_response_status='rejected'),
                       which removes them from surfacing.
GOVERNANCE GATE        `sacred_protected` register is an absolute surfacing refusal at
                       the SQL boundary. This is the strongest memory-side gate found
                       anywhere in the domain.
CURRENT STATUS         LIVE (path, per calibration) · predicate UNKNOWN in production.
```

### 2.6 · B-15 · `ConsciousnessMemoryLattice` — recall computed, loaded, and discarded

```text
DECLARED WHERE   lib/memory/ConsciousnessMemoryLattice.ts (imported as `lattice`,
                 lib/sovereign/maiaService.ts:44)
COMPUTED/LOADED  maiaService.ts:3057 `lattice.resonanceRecall(recallKey, {...})`, inside
                 getMaiaResponse (:2704), gated by mode at :3049-3053.
SURFACED WHERE   ⛔ NOWHERE. Every subsequent reference to `memoryField` is a mode-based
                 truncation (:3069-3085), a console.log (:3089-3096), or `= null`
                 (:3102). A full-file grep for `memoryField` returns 22 hits, all inside
                 lines 3041–3102. The recalled object never enters `meta`, never enters
                 a prompt, and never reaches a response.
UPDATED WHERE    maiaService.ts:3689 `lattice.integrateEvent(...)`, gated by
                 `shouldElevate && allowLatticeWrite` (:3676); the MemoryGate refusal is
                 logged at :3706.
```

⭐ **This is a `KNOWS ≠ CONSIDERS` case in its purest form.** The system performs a resonance
recall against its own lattice on qualifying turns, reports what it found to the log, and then
lets the result fall out of scope. The **write** half of the same object is live and gated. Recall
is therefore `ORPHANED DOWNSTREAM`; the object as a whole is `PARTIAL`.

```text
GOVERNANCE GATE  write: `allowLatticeWrite` derived from memoryMode (:3676, refusal
                 logged :3706). read: none — the recall runs and is discarded regardless.
CURRENT STATUS   PARTIAL · recall ORPHANED · write WIRED-BUT-UNOBSERVED.
```

### 2.7 · B-24 · `MemoryPalaceOrchestrator` and the eight "underutilized" services

```text
DECLARED WHERE   lib/consciousness/memory/MemoryPalaceOrchestrator.ts:8-15 — imports
                 episodicMemoryService · somaticMemoryService · morphicPatternService ·
                 semanticMemoryService · achievementService ·
                 consciousnessEvolutionService · coherenceFieldService ·
                 sessionMemoryServicePostgres
COMPUTED/LOADED  :21-88 retrieveMemoryContext — seven parallel retrievals, each
                 individually `.catch()`-degrading
PERSISTED WHERE  :175 trackSomaticPattern · :188 coherenceFieldService.recordReading ·
                 :199 updateMetrics · :207 recordBreakthrough · :233 unlockAchievement
SURFACED WHERE   app/api/oracle/conversation/route.ts:902 retrieveMemoryContext →
                 :2787 `memoryPalaceOrchestrator.generateMemoryContextPrompt(memoryContext)`
                 interpolated into the prompt template; :1499 storeConversationMemory.
                 ⛔ NOT reached from app/api/sovereign/app/maia/list/route.ts.
```

🔴 **This directly contradicts the system's own substrate inventory.**
`lib/maia/substrateMap.ts:204-251` classifies all eight as
`category: 'underutilized-consciousness'` with notes reading *"Event memory — unmapped"*,
*"Somatic memory — unmapped"*, *"Field memory — unmapped"*, *"Field coherence — unmapped"*,
*"Topology — unmapped"*, *"Growth tracking — unmapped"*, *"Mastery tracking — unmapped"*, and for
Morphic, *"declared service, no producer, no runtime slot."* At the subject they have a producer
(`MemoryPalaceOrchestrator`), a consumer (`/api/oracle/conversation`), and a prompt seam
(`:2787`). **Both sides are preserved; neither is reconciled here.** Whether that route serves
member traffic is `UNKNOWN` in this container. The substrateMap file's own header (`:14-16`) says
*"When this drifts from the divergence map doc, the doc is authoritative… The drift itself is
signal."*

```text
GOVERNANCE GATE  NONE FOUND at the orchestrator. No sanctuary check, no memory-mode
                 check and no member consent gate appears in
                 MemoryPalaceOrchestrator.ts; whatever gating exists is the calling
                 route's. (Traced only to the point of that statement; the oracle
                 route's own gates are Domain A/I territory.)
CURRENT STATUS   WIRED-BUT-UNOBSERVED on /api/oracle/conversation ·
                 NOT REACHED on the sovereign list route.
```

### 2.8 · B-20 · `buildMemoryHealth` — the enforcement-bound enumeration

```text
DECLARED WHERE   lib/maia/memoryHealth.ts:60-74 — `MemoryHealth`, twelve LayerStatus
                 keys + continuityConfidence. Layer meanings enumerated at :44-57.
COMPUTED WHERE   route :1178-1209 buildMemoryHealth({...})
PERSISTED WHERE  lib/maia/substrateObservability.ts:99-130 insertRuntimeEvent →
                 `runtime_events.memory_layers`, called from
                 lib/maia/maiaRuntimeContext.ts:251 recordRuntimeTurn.
SURFACED WHERE   not a prompt block. Conditions the §VI fallback and the degradation
                 warning (route :1210-1214, isBaseChainDegraded).
```

🔴 **Four of the twelve declared layers are never populated by the live route.** The call at
route `:1178-1209` supplies exactly eight inputs: `recentTurns`, `session`, `relational`,
`semantic`, `breakthrough`, `conversational`, `episodic`, `developmental`. It supplies **no
`pattern`, no `somatic`, no `field`, no `meta`**. `layerStatus(undefined)` returns `'empty'`
(`memoryHealth.ts:122`). Those four therefore report `'empty'` on every turn as a **structural
constant**, and `runtime_events.memory_layers` records that constant as though it were a per-turn
observation.

⚠️ **`pattern` is the sharp case.** `memoryHealth.ts:103` annotates the input as
`pattern?: { count } // theme_signals feeds this` and places it under *"Wired by Cut 1"* (`:92`).
Theme signals **are** loaded on the live route (`route :947`) and **do** reach the FAST prompt
inside the influence block. The binding from loader to health input was simply never made — the
identical call-site omission archetype the route's own comment at `:1203-1208` documents having
already fixed once for `developmental`. Both facts stand: the layer is fed in the prompt path and
reported empty in the health path.

⚠️ **`semantic` is a known mislabel, recorded in the code and unrepaired.** `memoryHealth.ts:97-100`
and route `:1182-1186`: the key keeps its canon §VII name while what feeds it is the atoms loader
**row count**; *"no semantic retrieval exists on this path."* The gap map
`docs/ops/MAIA_MEMORY_INTEGRITY_GAP_MAP_2026-08-04.md:38` calls this *"a self-report that misstates
the memory state MAIA is in… occurring in the observability layer itself"* and flags it as awaiting
authorization.

```text
GOVERNANCE GATE  canon citation only — docs/canon/MAIA_MEMORY_CANON_v1.0.md §VII, cited
                 at memoryHealth.ts:4. No runtime gate.
CURRENT STATUS   WIRED-BUT-UNOBSERVED · 8/12 layers fed · 4/12 structurally constant.
```

### 2.9 · B-21 · `memoryCanonGuard` — the only memory-speech enforcement surface

```text
DECLARED WHERE  lib/maia/prompts/memoryCanonGuard.ts:47 MEMORY_CANON_GUARD_PROMPT ·
                :109 FORBIDDEN_AMNESIA_PATTERNS · :200 scrubMemoryAmnesia ·
                :226 containsForbiddenAmnesia
SURFACED WHERE  prompt side: lib/consciousness/MAIA_RUNTIME_PROMPT.ts:4,:137 (so it
                rides in on every tier that carries MAIA_RUNTIME_PROMPT) and
                app/api/voice/stream-conversation/route.ts:1236.
                output side: route :1487 scrubMemoryAmnesia(orchestratorResult.text)
                and app/api/oracle/conversation/route.ts:2569.
```

⚠️ The route's scrub result is assigned to `_memoryScrub` (`:1487`) — an underscore-prefixed
binding. Whether the scrubbed text replaces the member-facing text on this route was **not
established** by this trace and is carried as an open question (§9, OQ-4), not asserted either way.

A second standing floor sits beside it: `MEMORY_SPEECH_ACT_BOUNDARY`
(`lib/sovereign/maiaVoice.ts`, named constant preceding `appendAllContextAddenda`) — *"You do not
save, keep, store, file, journal, or remember anything by your own action… never claim, imply, or
promise that something has been or will be kept."* It is appended by
`appendAllContextAddenda` (`:507`) after every addendum.

---

## 3 · WHICH ARENAS REACH `SURFACED` — the injection points, by `file:line`

There are **five** places in the codebase where memory text becomes prompt characters. All five are
named here; nothing else was found.

| # | Injection point | Tier / route | What passes through it |
|---|---|---|---|
| S-1 | `lib/sovereign/maiaService.ts:1507` | **FAST** — one template literal | **every** addendum, including the two FAST-only ones: `memoryInfluenceAddendum`, `forwardReadinessAddendum`, plus `conversationalRecallAddendum`, `episodicRecallAddendum`, `atomsAddendum`, three divination blocks, `relationalContextAddendum`, `memberWebAddendum`, `selfletPromptBlock`, `relationshipContext` (`:1289-1290`) |
| S-2 | `lib/sovereign/maiaService.ts:1058` | **FAST** — `contextPrompt` | `memoryContext` (the `MemoryBundle`) + `recentThreadBlock` |
| S-3 | `lib/sovereign/maiaVoice.ts:507-514` `appendAllContextAddenda`, reached from `:910` (`buildMaiaWisePrompt`, CORE) and `:972` (`buildMaiaComprehensivePrompt`, DEEP-repair) | **CORE + DEEP-repair** | the 27 `ADDENDA_SPECS` fields (`:414-441`) — conversational recall `:425`, episodic `:426`, atoms `:427`, divination `:428-430`, relational context `:431`, member web `:422`. ⛔ **`memoryInfluenceAddendum` and `forwardReadinessAddendum` are absent from this list** |
| S-4 | `lib/sovereign/maiaVoice.ts:888-892` | **CORE** | `relationshipMemory` via `formatRelationshipMemoryForPrompt` |
| S-5 | `lib/sovereign/maiaService.ts:2386-2393` | **DEEP-consultation lane only** | conversational · episodic · atoms · three divination · relational context |
| S-6 | `app/api/oracle/conversation/route.ts:2787` | **oracle route** | `memoryPalaceOrchestrator.generateMemoryContextPrompt(...)` — the eight consciousness services |

⛔ **DEEP-primary has no memory prompt seam at all.** `maiaService.ts:2380-2384` states it
plainly: *"the only prompt seam on DEEP-primary (the local orchestrator draft has no prompt seam by
construction — it weaves templates, it does not read a system prompt)."*

**Arenas reaching `SURFACED` on the live sovereign route, by tier:**

- **All three tiers:** atoms (B-03), conversational recall (B-04), episodic (B-05), divination
  (B-14), relational context bridge (B-13), member web (B-10).
- **FAST + CORE:** relationship memory (B-12), selflet (B-17).
- **FAST only:** `MemoryBundle` (B-02), developmental influence plan (B-06), theme signals inside
  it (B-07).
- **Never (loaded and discarded):** lattice resonance recall (B-15).

---

## 4 · DORMANT / ORPHANED / DOCUMENTATION-ONLY — used precisely

### 4.1 · DORMANT (code exists; no reachable caller found)

| Object | Evidence |
|---|---|
| `lib/maia/recurrenceDetector.ts` | grep for `recurrenceDetector` across `app/` + `lib/` returns only the file itself. Reads `member_theme_signals` (`:94`). |
| `lib/memory/MemoryManager.ts` | zero importers. |
| `lib/memory/VaultSymbolIndex.ts` | zero importers. |
| `lib/anamnesis/AnamnesisField.ts` | zero importers anywhere outside `lib/anamnesis/`. |
| `lib/memory/beads-sync/` | referenced only by `lib/maia/substrateMap.ts:254` as an inventory entry. |
| `lib/consciousness/memory/SemanticMemoryService.ts` (the `lib/consciousness` copy) | reachable only via `MemoryPalaceOrchestrator` / `MAIAUnifiedConsciousness` / `PersonalOracleAgent`; **two files named `SemanticMemoryService` exist** (`lib/memory/` and `lib/consciousness/memory/`) — a duplicate the substrateMap notes at `:211`. |

### 4.2 · ORPHANED (code exists; its declared consumer does not, or does not call it)

| Object | Evidence |
|---|---|
| `lattice.resonanceRecall` result | computed `maiaService.ts:3057`, never consumed (§2.6). |
| `calculateDecayedConfidence` (TS) | imported at `lib/memory/MemoryBundle.ts:16` and **never called** in that file — the decay actually applied is the SQL function `calculate_decayed_confidence` (`MemoryBundle.ts:266`). Two implementations, one import that does nothing. |
| `shouldPromptForConfirmation` | `lib/memory/confidenceDecay.ts:199` — zero callers repo-wide. |
| `lib/anamnesis/DecentralizedMemory.ts`, `lib/anamnesis/UnifiedMemoryInterface.ts` | sole importer is `lib/integrated-oracle-system.ts`, which itself has **zero importers**. |
| `lib/anamnesis/CollectiveConsciousnessBridge.ts` | sole importer `lib/consciousness/MorphoresonantFieldInterface.ts`, itself imported only by `FascialConsciousnessField.ts` and `ElderCouncilService.ts` — no traced route entry. |
| `lib/anamnesis/MemoryCoreIndex.ts` | the importer is `app/api/_backend/src/services/ConversationalPipeline.ts`, inside the `_backend` tree that `substrateMap.ts:173-199` classifies `orphaned-backend`. |

### 4.3 · Tables declared with no reader on any traced turn path

`somatic_memories` (read only by `SomaticMemoryService`) · `morphic_pattern_memories` (read by
`MorphicPatternService` and `app/api/maia/field/route.ts`) · `memory_contracts` (read only by
`lib/trust/service.ts`) · `case_memories` · `case_memory_chunks` · `memory_links` (written/deleted
by `lib/memory/stores/MemoryLinksStore.ts:333`) · `vault_symbols` · `vault_query_patterns` ·
`vault_symbol_links` · `vault_symbol_misses`.

⛔ **A table's existence in a migration is recorded here as a declaration and nothing more.** No
claim is made that any of these are empty, unused in production, or safe to remove.

### 4.4 · DOCUMENTATION-ONLY (named in documents; no artifact at the subject)

- **The asserted 15-layer memory architecture** (P1-01 slice 03 finding) — no code object with
  fifteen members was found. The widest code enumeration is the 12-key `MemoryHealth`.
- **`RFI` / `UFI`** — carried in `CLAUDE.md` Cat 1 as preserved direction; no memory-side artifact
  found under either name.
- **Layers 10 (Full Archive Memory) and 11 (Legacy Memory)** from the 11-level/3-band document
  (P1-01 slice 03, S-? at `:118`) — no corresponding store, loader or surface found.

---

## 5 · THE ENUMERATION QUESTION — what the code actually has, compared without a winner

P1-01 slice 03 found **five** document enumerations of the memory arenas with no agreement. The
instruction is to determine what the code contains and compare **without choosing**. The code
contains **six** enumerations of its own, and they do not agree either.

| # | Code enumeration | Location | Members | Bound to |
|---|---|---|---|---|
| C-E1 | `MemoryHealth` | `lib/maia/memoryHealth.ts:60-74` | **12** + `continuityConfidence` | `runtime_events.memory_layers` — an enforcement/telemetry surface |
| C-E2 | `MemoryHealthInputs` | `memoryHealth.ts:91-111` | **11** (no `recentTurns/session` split parity; `meta` present) | the builder's own signature |
| C-E3 | `MemoryHealth` **as actually populated** by the live route | `route :1178-1209` | **8** | the turn |
| C-E4 | `MemorySource` | `lib/maia/types/memoryOrchestrator.ts:21-31` | **9** (6 active + 3 "Phase 2 placeholders") | the influence plan |
| C-E5 | `ADDENDA_SPECS` | `lib/sovereign/maiaVoice.ts:414-441` | **27** addenda, of which ~9 are memory-bearing | what reaches CORE/DEEP-repair prompts |
| C-E6 | `substrateMap` | `lib/maia/substrateMap.ts` | **30** module entries in 7 categories | the admin substrate monitor |

**Observations, not resolutions:**

1. **C-E1 is the only code enumeration bound to an enforcement surface**, and it mirrors the canon
   §VII 12-layer stack 1:1 (`memoryHealth.ts:4`, and P1-01 slice 03 `:62` independently identifies
   the same mirroring). That is a fact about binding, not a claim of primacy.
2. **C-E1 and C-E3 differ by four members** on every single turn (§2.8). The canonical set and the
   populated set are not the same set, and the telemetry does not distinguish *"empty because
   nothing was there"* from *"empty because nothing was asked."*
3. **C-E4 crosses C-E1 diagonally.** `spiral_state`, `relationship_anamnesis` and
   `member_live_context` are `MemorySource` members with no `MemoryHealth` key;
   `recentTurns`, `session`, `breakthrough`, `field` and `meta` are `MemoryHealth` keys with no
   `MemorySource` member. Neither is a subset of the other.
4. **C-E6 disagrees with traced reachability** for eight objects (§2.7).
5. ⛔ **No code enumeration is nominated as authoritative here.** Doing so would resolve lexical
   ambiguity in the direction that makes the architecture coherent, which the hard vocabulary rule
   forbids.

---

## 6 · "FIELD" IN THE MEMORY CORPUS — census per named object

P1-01 recorded **7 `field` objects + 2 in the memory corpus**. At the subject, inside Domain B, the
following distinct objects are named `field`. They are not the same object and are not treated as
one.

| Named object | Location | What it is |
|---|---|---|
| `MemoryHealth.field` | `lib/maia/memoryHealth.ts:71` | a `LayerStatus` key, documented `:55` as *"wider symbolic and collective patterns"* — **never populated by the live route** (§2.8) |
| `MemoryField` (type) + `memoryField` (value) | `lib/memory/ConsciousnessMemoryLattice.ts`, used `maiaService.ts:3041-3102` | the lattice resonance-recall result object — **discarded** (§2.6) |
| `MemberLiveContext.fieldState` | `lib/memory/MemberLiveContext.ts` (`deriveFieldState`, called in `buildMemberLiveContext`) | a derived descriptor inside the member-web context |
| `CoherenceFieldService` / `coherence_field_readings` | `lib/consciousness/memory/CoherenceFieldService.ts` | a persisted reading store, reached only via `MemoryPalaceOrchestrator:75,:188` |
| `QuantumFieldMemory` | `lib/consciousness/memory/QuantumFieldMemory.ts` | `substrateMap.ts:222-226` assigns it the `field` evidence key; **no importer** other than substrateMap |
| `fieldContextAdapter` | `lib/maia/fieldContextAdapter.ts` (`substrateMap.ts:156`) | a separate adapter, flagged |
| `enforceFieldSafety` / `fieldRouting` | `lib/field/enforceFieldSafety.ts`, route `:99`, meta `:1409-1410` | a **safety gate**, not a memory store |

⛔ Seven objects, one word. *"Field memory is live"* and *"field memory is not live"* are both
unevaluable in this domain until the referent is named.

**Second collision, smaller but load-bearing: `semantic`.** `MemoryHealth.semantic` (a row count of
atoms, §2.8) · `lib/memory/SemanticMemoryService.ts` · `lib/consciousness/memory/SemanticMemoryService.ts`
· `MemorySource.'semantic_memory'` (a Phase-2 placeholder) · `detectSemanticCandidate` (a
message-text regex). Five referents.

---

## 7 · MEMBER AUTHORITY OVER MEMORY — implemented paths, and the gaps

### 7.1 · What exists

| Capability | Implemented? | Path |
|---|---|---|
| **Correct** (name) | YES | `lib/consciousness/nameChangeDetection.ts:56` detect → `:87 updatePreferredName` → `:115 processNameChangeIfDetected`, called from route `:104` import |
| **Correct** (continuity claim) | DETECTION ONLY | `lib/consciousness/correctionDetection.ts:69 detectCorrectionSignal`, sole caller `maiaService.ts:4100`. Produces a signal; no store mutation was traced from it. |
| **Override** (what surfaces) | YES, per-atom | `applyGesture` 11 kinds (`lib/psyche/portfolio.ts:530-610`): `mark_still_alive`·`set_aside`·`protect`·`archive`·`return_to_active`·`touch`·`replace_primary_register`·`add/remove_register`·`add/remove_lens`·`add/remove_thread`·`set_return_preference` |
| **Override** (breakthrough) | YES | `app/api/sovereign/atoms/[id]/breakthrough/route.ts:88` POST sets `is_breakthrough = TRUE`; `:128` DELETE clears flag + timestamp |
| **Override** (decline a practitioner atom) | YES | `app/api/sovereign/atoms/[id]/decline/route.ts:113` POST / `:145` DELETE → `member_response_status`, enforced in the loader at `memoryAtomsLoader.ts:287` |
| **Seal** | YES, structurally | the `sacred_protected` register — refused at the SQL boundary, `memoryAtomsLoader.ts:285` `AND NOT ('sacred_protected' = ANY(registers))`. The member sets it via `add_register` (`portfolio.ts:578-586`). This is the strongest member instrument in the domain: a seal the retrieval query itself cannot cross. |
| **Consent gate — conversational** | YES, member-writable | `PATCH /api/members/recall-preferences` (`:96,:147`), UI `components/settings/MemoryConsentSection.tsx` |
| **Consent gate — episodic** | READ-ONLY (🔴) | enforced on read (`memoryLoaders.ts:332`), **no write path** (§2.4) |
| **Consent gate — anchor surfacing** | YES | `app/api/anchor/[id]/surface-preference/route.ts` |
| **Delete — episodic** | YES | `app/api/sovereign/episodes/mark/route.ts:372-376` — a true `DELETE FROM episodic_memories`, scoped `AND user_id = $2 AND marked_by_member = TRUE` |
| **Delete — session transcript** | YES, indirectly | `app/api/scribe/end-session/route.ts:107` `DELETE FROM conversation_turns WHERE session_id = $1`; `lib/memory/stores/TurnsStore.ts:293,:311` |
| **Export** | PARTIAL | `app/api/members/export-data/route.ts` — exports `members` (`:71-73`), `member_settings` (`:78`), `member_sessions` (`:83-84`), `developmental_memories` (`:91-94`), `google_calendar_credentials` (`:101-102`) |

### 7.2 · Where no path exists — stated as absence, not as a repair

🔴 **No member deletion path exists for:** `member_memory_atoms` (the gesture vocabulary has no
delete kind — `portfolio.ts:530-610` enumerated in full above; `archive` sets
`status='archived'`, which the loader excludes at `memoryAtomsLoader.ts:283` but the row persists)
· `developmental_memories` · `breakthrough_moments` · `conversation_insights` ·
`relationship_essences` · `member_theme_signals` · `member_spiral_state` ·
`memory_transition_records` · `conversation_memory_uses` · the lattice store.

🔴 **The export omits every arena the member cannot delete but which surfaces into the prompt:**
`member_memory_atoms`, `episodic_memories`, `conversation_turns`, `breakthrough_moments`,
`relationship_essences`, `member_theme_signals`. A member exercising export receives their
developmental memories and sessions; they do not receive the atoms that are the most
frequently-surfaced memory object in the system.

🔴 **No path was found for a member to correct the *content* of a formed memory.** Atoms can be
re-registered, re-lensed, archived and declined; their `title`/`body` have no member-facing update
route (`app/api/psyche/portfolio/atoms/[id]/route.ts` exports **`GET` only**, `:15`). Developmental
memories have no member-facing route at all.

⭐ **This matches the P1-01 slice 03 hypothesis and does not settle it.** Correct/override/seal are
implemented (unevenly); **deletion and erasure of formed memory exist in code for exactly two
objects — marked episodes and session transcripts — and both were built for other reasons.** Per
constraint 6, finding these paths does not make deletion governed. The `vault_erasure_queue`
machinery (`lib/manuscript/source/eraseManuscript.ts:123,:191,:206-238`) is Writer's-Studio
artifact erasure, **not** memory erasure, and is recorded here only so it is not mistaken for one.

```text
GOVERNANCE GATE for member memory deletion:  NONE FOUND.
```

---

## 8 · SANCTUARY MODE — what the path actually does, against the six documented invariants

A sanctuary path **exists** and is structural rather than advisory.

```text
DECLARED WHERE  lib/sanctuary/turnPosture.ts:24 class TurnPosture ·
                :44-47 TurnPosture.resolve (fails closed: ANY affirmative signal wins) ·
                :58 contentWritable — store-boundary guard, :71 refusal ·
                lib/sanctuary/sanctuaryGuards.ts:26 sanctuarySafeSummary ·
                :42 shouldPersistTurn · :54 shouldPersistKeep
ENFORCED AT     four store boundaries, all of them write boundaries:
                lib/memory/stores/TurnsStore.ts:113, :206, :256
                lib/sovereign/sessionManager.ts:67
                lib/services/corpusCallosumService.ts:115, :175
GATED AT (route) :397 isSanctuary · :408 turnPosture · :520 allowCrossSessionMemory =
                isRecognizedUser && !isSanctuary · :541 shouldBuildMemory ·
                :545 MemoryBundle skip · :550 astrology · :750 member web ·
                :826 knowledge gate · :908 relational context · :1105 divination ·
                :1697 MemoryWriteback skip
```

| Documented invariant | What the code does | Assessment |
|---|---|---|
| 1 · No content retention | `contentWritable` refuses at every traced content store; `MemoryWritebackService` is skipped (`route :1697`); `MemoryBundle` is skipped (`:541`) | traced and consistent |
| 2 · No training data | nothing traced in this domain either way | **not evaluable from Domain B** |
| 3 · Minimal metadata only | ⚠️ a `runtime_events` row **is still written** for sanctuary turns (`substrateObservability.ts:92-130`), with `member_id_prefix = NULL` (`:143-146`) — but it carries `is_sanctuary`, `route_id`, `prompt_block_chars`, `memory_continuity_confidence` and all twelve `memory_layers` statuses | metadata, de-identified, **broader than "timestamp, duration"** |
| 4 · Visual clarity | UI — outside Domain B | not traced |
| 5 · Default off | `route :397` `(meta as any)?.sanctuary === true` — absent signal is an ordinary turn | consistent |
| 6 · Absolute boundary, including by user request | `TurnPosture` is a class whose constructor is private (`turnPosture.ts:29`) and the file's own header (`:17`) notes `{ sanctuary: false }` does not typecheck against it — the posture cannot be forged by an object literal | structurally strong; **no in-session override path found** |

⛔ The refusal is loud and fails closed (`turnPosture.ts:56`), which is recorded as an observation
about the mechanism, not as a verdict on whether the invariants are satisfied.

---

## 9 · D-P1-07 · DOES ANYTHING EVALUATE THE FOUR FREEZE CONDITIONS?

**Observation only, per the ruling.** ⛔ No threshold is created, no evaluator is nominated, no
condition is declared satisfied, and no inference is drawn from elapsed time.

**Finding: NONE FOUND.**

- A repository-wide grep for the four condition phrases — *"stable evaluation"*, *"closed learning
  loops"*, *"routing coherence"*, *"settled memory topology"* — across `**/*.ts`, `**/*.tsx` and
  `**/*.md` returns **five hits, all in documents**: the P1-01 slice 04 record (`:55`, `:416`),
  `docs/architecture/RELATIONAL_INTELLIGENCE_DIRECTIONS_2026-05-24.md:18`,
  `docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md:166` (using *"routing coherence"* in an
  unrelated sense), and `artifacts/phase-4.2-master-summary.md:35`. **Zero hits in `app/` or
  `lib/`.**
- A grep for `observationPhase` / `OBSERVATION_PHASE` / `freezeCondition` / `liftCondition` across
  `app/`, `lib/`, `scripts/`, `components/` returns **nothing**.
- A case-insensitive grep for the word `freeze` in `app/` and `lib/` returns only somatic
  nervous-system vocabulary (`dorsal-vagal`, *"activation, freeze, or collapse language"*), a
  Writer's-Studio HTTP status mapping, and `Object.freeze`. **No memory-governance referent.**

**What this means and does not mean.** No code or operational mechanism was found that reads,
computes, tests, records or reports on any of the four conditions. **The freeze has no
implementation-side observer of any kind.** Per D-P1-07 that absence is not evidence that the
conditions are met, unmet, or stale — it is evidence that nothing in the organism is watching them.
The conditions live entirely in prose, and the only things in the tree that even name the memory
freeze are `CLAUDE.md`'s *"Still held under freeze"* list and the two architecture documents above.

⚠️ One adjacent observation, offered as evidence and not as an argument: several of the objects the
freeze names — Morphic, Somatic, Coherence Field — **are reachable through
`MemoryPalaceOrchestrator` into a prompt seam** (§2.7, S-6). Whether that constitutes contact with
the frozen surface is **not** a question this worker may answer. It is recorded so that the
question can be asked by someone who may.

---

## 10 · REQUIRED END SECTIONS

### 10.1 · Contradictions — both sides, unreconciled

**CTR-B1 · The consciousness memory services: "unmapped" vs. wired to a prompt.**
*Side A:* `lib/maia/substrateMap.ts:204-251` classifies eight services `underutilized-consciousness`
with notes *"unmapped"*, and for Morphic, *"no producer, no runtime slot."*
*Side B:* `MemoryPalaceOrchestrator.ts:8-15` imports all eight, `:21-88` retrieves from seven in
parallel, `:175-233` writes to four, and `app/api/oracle/conversation/route.ts:902,:1499,:2787`
consumes and prompt-injects the result.
**Unreconciled.** Whether that route serves traffic is `UNKNOWN` here.

**CTR-B2 · `memoryHealth.pattern`: fed in the prompt path, empty in the health path.**
*Side A:* `memoryHealth.ts:103` — `pattern?: { count } // theme_signals feeds this`, listed under
*"Wired by Cut 1"*.
*Side B:* `route :1178-1209` supplies no `pattern` input, so `layerStatus(undefined) = 'empty'`
(`memoryHealth.ts:122`) on every turn — while `route :947` loads theme signals and `:991` routes
them into the FAST prompt.
**Unreconciled.**

**CTR-B3 · `memoryHealth.semantic` names a layer the path does not have.**
*Side A:* `memoryHealth.ts:63` declares `semantic`, documented `:49` as *"enduring facts, roles,
relationships, preferences."*
*Side B:* `memoryHealth.ts:97-100` and `route :1182-1186` state that what feeds it is an atoms
**row count** and that *"no semantic retrieval exists on this path"*;
`docs/ops/MAIA_MEMORY_INTEGRITY_GAP_MAP_2026-08-04.md:38` calls this a self-report that misstates
MAIA's memory state.
**Both sides are in the code, adjacent, and unreconciled.**

**CTR-B4 · Two definitions of decay, one of them imported and unused.**
*Side A:* `lib/memory/confidenceDecay.ts` exports `calculateDecayedConfidence`, imported at
`MemoryBundle.ts:16`.
*Side B:* `MemoryBundle.ts:266` applies the **SQL** `calculate_decayed_confidence`
(`database/migrations/20251231_memory_architecture_enhancements.sql:178`), and the TS function is
never called in that file. P1-01 slice 03 (`:254`, F3) records the two as divergent and states
*"there is no single authoritative definition of decay today."*
**Unreconciled.**

**CTR-B5 · The influence plan's tier scope.**
*Side A:* `route :991` computes `memoryInfluenceAddendum` on every eligible turn at every tier, and
`route :1229` reports it in `buildMaiaRuntimeContext.addenda`.
*Side B:* `maiaService.ts:3291-3308` establishes it cannot reach a CORE or DEEP prompt, against a
recorded prevalence of *"CORE 72.8% / FAST 27.2%"*.
The telemetry was repaired to tell the truth (`availableButNotComposed`); the behaviour was
deliberately left, the comment naming it a *"deliberate product decision, deferred by founder
ruling 2026-08-13."* **Preserved, not reconciled.**

**CTR-B6 · Episodic consent: enforced but unmovable.**
*Side A:* `memoryLoaders.ts:332` reads `episodic_recall_enabled` and
`producerRegistry.ts:133` names it `consentBasis`.
*Side B:* `app/api/members/recall-preferences/route.ts:43-45` admits one column and names episodic
only in a comment (`:20`) as future work. **Unreconciled.**

**CTR-B7 · `lattice` recalls and discards.**
*Side A:* `maiaService.ts:3057` performs a real resonance recall, mode-gated at `:3049-3053`, with
results truncated per mode at `:3069-3085` — the shape of code written to be used.
*Side B:* nothing consumes it (`:3102` `memoryField = null`). **Unreconciled.**

**CTR-B8 · Six code enumerations of the memory arenas, none a subset of another** (§5). Preserved
in full; no winner chosen.

### 10.2 · Unlocated governance

- **`GOVERNANCE GATE: NONE FOUND` — member deletion or erasure of formed memory.** No ruled model
  governs whether a member may delete an atom, a developmental memory, a breakthrough, a
  relationship essence or a theme signal. Two deletion paths exist in code (episodic unmark;
  scribe session-end transcript delete) and neither was traced to a governing document.
- **`NONE FOUND` — `MemoryBundle` selection.** Composite scoring, decay weighting and
  `maxBullets: 5` are system decisions with no traced governing source.
- **`NONE FOUND` — `MemoryPalaceOrchestrator`.** No sanctuary check, memory-mode check or consent
  gate appears in the orchestrator itself.
- **`NONE FOUND` — `MemoryWritebackService` formation threshold.** What rises to a
  `developmental_memory` or a `breakthrough_moment` is decided in
  `lib/memory/MemoryWriteback.ts:603,:689,:732` with no traced governing rule.
- **`NONE FOUND` — the four freeze conditions have no evaluator of any kind** (§9).
- **`NONE FOUND` — practitioner visibility into member memory.** Under P1-GOV-ACCESS-01: the only
  practitioner-related instrument traced in this domain is
  `PRACTITIONER_ATTRIBUTION_GUARD` (`memoryAtomsLoader.ts:185-186`), which governs *attribution of
  a practitioner-authored atom*, not *what a practitioner may see*. No path was found by which a
  practitioner reads a member's memory arenas. ⛔ Absence of a traced path is not a finding that
  none exists; Domain I holds this question.
- **Canon citation without verification.** `memoryHealth.ts:4` cites
  `docs/canon/MAIA_MEMORY_CANON_v1.0.md §VII` as its authority. Per constraint 5 the citation is
  recorded; the canon's content is P1-01's, not re-adjudicated here.

### 10.3 · Named-but-unverified artifacts

| Named in | Artifact | Status at subject |
|---|---|---|
| `CLAUDE.md` Cat 6 | *"atoms loader + `is_breakthrough` schema-bound flag"* as live runtime authority | **verified present**; `LIVE` per calibration (§2.5) |
| `CLAUDE.md` Cat 6 | `memoryHealth.semantic` as live runtime authority | present, but see CTR-B3 |
| `CLAUDE.md` Cat 3 | `EpisodicMemoryService`, `CoherenceFieldService` — *"0 live callers"* | **contradicted** at the subject: both are called by `MemoryPalaceOrchestrator` (`:61`, `:75`, `:188`) |
| `CLAUDE.md` Cat 4 | `QuantumFieldMemory` *"810 LOC, 0 persistence"* | zero importers outside `substrateMap` — **consistent** |
| `CLAUDE.md` Cat 4 | duplicate `SemanticMemoryService` *(consciousness/ vs memory/)* | **both files present** — consistent |
| `CLAUDE.md` | `shouldPromptForConfirmation` *"has zero callers and was not wired"* | **verified** — `confidenceDecay.ts:199`, zero callers |
| `CLAUDE.md` | DEEP blocked at `buildComprehensiveVoicePrompt` | `maiaService.ts:2521-2525` still carries the divergence note; DEEP-**repair** now reaches addenda via `maiaVoice.ts:972`, DEEP-**primary** does not (`maiaService.ts:2380-2384`). **Partially superseded; both sides preserved.** |
| `docs/ops/MAIA_MEMORY_SELECTION_REALITY_REPORT_2026-08-04.md` | atoms production witness | **verified in-repo, dated, SHA `57b0324fd` ≠ subject**; selection predicate has since changed (§2.5) |
| P1-01 slice 03 | *asserted 15-layer memory architecture* | **DOCUMENTATION-ONLY** — no code object with fifteen members |
| `substrateMap.ts:174-199` | six `app/api/_backend/src/**` memory modules | present on disk; classified `orphaned-backend` by the map itself; not traced to any turn |

### 10.4 · Open questions for P1-04

- **OQ-1** — Which of the six code enumerations (§5) is intended to be the memory arena
  vocabulary, and by what authority? ⛔ Not answerable by a census worker.
- **OQ-2** — Does `/api/oracle/conversation` serve member traffic at the subject? The answer
  determines whether eight consciousness memory services are `WIRED-BUT-UNOBSERVED` participants or
  a dead limb (CTR-B1), and whether frozen surfaces are being touched (§9).
- **OQ-3** — Is the FAST-only scope of `memoryInfluenceAddendum` and `MemoryBundle` the intended
  architecture or an unremoved artifact? The code names it a deferred founder decision (CTR-B5),
  and it means **the developmental and bundle arenas do not reach the majority of turns.**
- **OQ-4** — Does `scrubMemoryAmnesia`'s result replace the member-facing text on the sovereign
  route, or is `_memoryScrub` (`route :1487`) observability only? Not established by this trace.
- **OQ-5** — What is the governing model for member deletion and export of formed memory? Today
  export covers 5 tables and omits every prompt-surfacing memory arena but developmental (§7.2).
- **OQ-6** — Should `runtime_events` record twelve `memory_layers` statuses for a sanctuary turn
  (§8, invariant 3)? The row is de-identified; the question is whether de-identified per-turn
  memory telemetry is "minimal metadata."
- **OQ-7** — `memoryHealth` reports `'empty'` identically for *"the store was read and was empty"*
  and *"the store was never asked"* (`memoryHealth.ts:122`). Four layers are permanently in the
  second condition (§2.8). Is a health surface that cannot distinguish these fit for the §VII
  degradation predicate it feeds (`isBaseChainDegraded`, `route :1210`)?
- **OQ-8** — `lattice.resonanceRecall` costs a retrieval on qualifying turns and is discarded
  (CTR-B7). Is the recall meant to participate?

---

```text
DOMAIN B · COMPLETE
31 named memory objects enumerated · 6 prompt injection points located ·
1 arena meets the LIVE calibration · 8 contradictions preserved unreconciled ·
6 governance gates NONE FOUND · freeze evaluator NONE FOUND.
⛔ NO REPAIR PROPOSED · NO RULING MADE · NO CONTRADICTION RESOLVED.
REPAIR QUESTIONS MAY EXIST — NOT YET AUTHORIZED.
```
