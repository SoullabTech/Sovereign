# MAIA Memory Topology — 2026-08-09

**Part of the MAIA High-Target Tester Readiness Audit.** Complete reconstruction of every substrate involved in remembering or reconstructing a member across turns, sessions, and time. Evidence: code audit of working tree (`feature/labtools-redesign`) cross-checked against production DB row counts and logs (minisforum, container `b1399f693`, deployed 2026-08-06).

**Prior maps verified against current code**: `MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md`, `MEMORY_EXPANSION_PLAN_2026-05-24.md`, `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`, CLAUDE.md six-category typology. **The code has moved past the May documentation in several load-bearing places** — most importantly, the DEEP-tier addenda divergence (§II.B) is **fixed in current code** (`appendAllContextAddenda` wired into `buildMaiaComprehensivePrompt` at `lib/sovereign/maiaVoice.ts:1044`), and an episodic recall path now exists that the May plan treated as future work. The in-code self-map `lib/maia/substrateMap.ts` is itself partially stale (D4).

**Verdict vocabulary**: live · wired-unverified · built-unwired · dormant · dead. Production row counts in brackets where measured.

---

## A. Live conversational spine

All wired through the live route `app/api/sovereign/app/maia/list/route.ts`. (`app/api/oracle/conversation/route.ts` mirrors much of this wiring but receives ~zero traffic — D9.)

| # | Substrate | Write path | Read path → prompt | Identity | Consent/gate | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Turn persistence** — `conversation_turns` [39,555] + `maia_sessions` [1,054] | `TurnsStore.addTurn/addExchange` (`lib/memory/stores/TurnsStore.ts:125,220-227`; carries `posture_at_creation` + `provenance`; inserts lacking provenance refused per `:15`) | `getConversationHistory` (`lib/sovereign/sessionManager.ts:127`); `loadPriorCrossSessionExchanges` (`lib/maia/memoryLoaders.ts:195-209`); MemoryBundle | `user_id` + `session_id` | sanctuary purge (`sessionFinalizer.ts:11`) | **live** |
| 2 | **Session summaries** — `member_sessions` [707] + `session_summary_queue` [218] | row created with summary=NULL (`sessionFinalizer.ts:150-156`); job enqueued `:177`; worker `lib/scribe/sovereignSummarizer.ts` | **no prompt read-back found** | member_id + session_id | sanctuary → summary forced null (`:131-137`) | **wired-unverified** — 218 queued jobs suggests worker completion unproven |
| 3 | **Conversational Phase 2** (cross-session exchanges) | reads `conversation_turns` | loader `memoryLoaders.ts:195-209` → formatter `conversationalRecallBlock.ts` → wire `list/route.ts:877-893`; FAST template `maiaService.ts:1218-1238`; CORE+DEEP via `appendAllContextAddenda` (`maiaVoice.ts:488,912,1044`) | user_id | `conversational_recall_enabled` default TRUE (`memoryLoaders.ts:241-249`) + member toggle | **live, production-verified**: `[MAIA] conversational-block` fired 49× in last 24h, `emitted: true, surfacedCount: 6` observed |
| 4 | **Atoms** — `member_memory_atoms` [15 rows, 10 members, 0 breakthroughs] | Keep gesture `lib/psyche/portfolio.ts:373`; With Me `app/api/studio/with-me/sessions/[sessionId]/route.ts:137`; breakthrough mark route | loader `memoryAtomsLoader.ts:283` (`ORDER BY is_breakthrough DESC, kept_at DESC`) → `formatAtomsForPrompt` `:361` → all tiers | member_id | `return_preference` (default `member_pulled`) | **live** — "atoms loaded" 5× in 24h; breakthrough path wired but never member-exercised (Stage 3, not 4) |
| 5 | **Episodic** — `episodic_memories` [115] | member marks via `/api/sovereign/episodes/mark/route.ts:308` (INSERT), `:372` (DELETE) | `loadRecentMarkedEpisodes` (`memoryLoaders.ts:283-297`) → `episodicRecallBlock.ts:86` (90-day window, no theme synthesis) → FAST `maiaService.ts:1228-1230` + CORE/DEEP via helper | user_id | `episodic_recall_enabled` (`memoryLoaders.ts:328-336`) — **no UI toggle exposes it** | **wired, beyond the May plan** — member use unverified |
| 6 | **Semantic vectors** — `semantic_memory_vectors` (pgvector 768-d) | written every eligible turn (`maiaService.ts:3286`; embed gate: counsel always, dialogue ≥18 words) via Ollama `nomic-embed-text` | **none.** Only delete-account and migrate-data reference it | user_id | none | **write-only (D1)** — embedding compute is pure cost |
| 7 | **memoryHealth** (12-layer per-turn health) | derived at `list/route.ts:955` | observability only | — | — | **live** — but `semantic` input = atoms count (`:959`; D2): **"sem: ok" measures atoms, not vectors** |
| 8 | **MemoryBundleService** | reads only; usage → `conversation_memory_uses` [72,168] | buckets (`lib/memory/MemoryBundle.ts:88`): recent=conversation_turns; "semantic"=**developmental_memories** `:235`; insights=developmental_memories `:283`; breakthroughs=**breakthrough_moments** `:324`; composite score (similarity×significance×recency) compressed to bullets → `memoryInfluenceAddendum` (`list/route.ts:854`) | user_id | scope gate | **live** — quietly gives developmental + breakthrough_moments a prompt path (D7) |
| 9 | **Relationship memory** — `relationship_essences`, `conversation_themes`, `breakthrough_moments`, `relationship_patterns` | writers `RelationshipMemoryService.ts:474,499,518` — **live callers unverified** | reads `:63,269,303,335`; loaded FAST `maiaService.ts:678-685`, CORE `:1404`; formatted `:1084-1085` → prompt | user_id | none found | **live read path; write path unverified** — possibly reading fossil rows (D6, D15) |
| 10 | **Spiral state** — `member_spiral_state` [**0 rows**] | `spiralStatePersistence.ts:148` upsert, fire-and-forget | load `:96`; conductor hysteresis seed | member_id | none (structural only) | **wired-but-empty** — Bridge D's wire points sit in the near-dead oracle route; zero production rows |
| 11 | **Daily Anchor** — `member_daily_anchors` [**0 rows**] | `/api/anchor/today/route.ts:61` | ambient `loadRecentAnchors.ts:51-66` (SQL consent gate, default excluded); member-pull route | member_id | `surface_preference` default `member_pulled`; kill-switch flag | **live-but-empty** (founder correction 2026-08-09 confirmed) |
| 12 | **Developmental/themes** — `developmental_memories` [1,456] + `member_theme_signals` | **producer of developmental_memories not found (open question)** | `memoryLoaders.ts:87-102,136-150`; content reaches prompt **via MemoryBundle only** | user_id / member_id | none | **read-live, producer-unknown (D7)** |
| 13 | **Corpus Callosum** — `agent_runs` [33,985] + `integration_passes` [2,804] | `corpusCallosumService.ts:120,180`; sanctuary-gated | no runtime read-back | user/session/turn | sanctuary skip | **live, write-only by design** |
| 14 | **Learning spine** — `maia_turns` | `maiaService.ts:~3317` cascade; sanctuary excluded | reviewer surfaces (Loop C) | user_id | sanctuary gate | **live (admin altitude)** |
| 15 | **Correction repair** | in-turn only — no persistent store | `correctionRepairAddendum` via helper (`maiaVoice.ts:429`; wire `list/route.ts:785-791`) | — | — | **live, ephemeral** — corrections do not persist (see Corrigibility audit) |

## B. Practitioner / member-record substrates

- **Caseload** — `case_memories` [0]/`case_memory_chunks` [0] + embeddings jobs (`20260107000001-3`); reads `lib/caseload/CaseStore.ts:98,159`; embedding-backed search; `requireSelfScopedMember` auth. Live surface, near-zero data.
- **pattern_ledger** — explicitly "system-INFERRED claims about the member" (route comment, `app/api/studio/clients/[id]/pattern-ledger/route.ts:27`); practitioner read fail-closed (PIN 5).
- **Premium storage** — **filesystem** archive at `/maia/premium_storage` (`lib/services/premium-storage.ts:29`); requires claim-heavy legacy fields (`consciousness_level`, `shadow_work_insights`); outside every DB deletion/consent path (D10).

## C. Dormant / legacy (verified current)

- **`lib/consciousness/memory/` still contains all 13 files** — EpisodicMemoryService, CoherenceFieldService, duplicate SemanticMemoryService, ConsciousnessEvolutionService, QuantumFieldMemory, MorphicPatternService, SomaticMemoryService, AchievementService, MAIAMemoryArchitecture, MemoryPalaceOrchestrator, SessionMemoryService(+Postgres), EnhancedMAIAFieldIntegration. **None of the May-plan renames/guts happened.** The live episodic path (A5) bypasses the dormant EpisodicMemoryService entirely — same table family, different code.
- **PersonalOracleAgent** (`lib/agents/PersonalOracleAgent.ts`) — legacy lane, still importable; Supabase-style `.eq()` calls at `:679`.
- **`app/api/_backend/src/adapters/memory/SupabaseMemory.ts`** — Supabase adapter on disk in dead code (D14); `lib/services/cloud-backup.ts` also carries prisma + `uploadToSupabase` (see Corrigibility audit).
- **Bardic/selflet families** — migrations + libs exist; not on the sovereign spine; delete-account covers their tables, implying historical data.
- **Anamnesis** — `lib/anamnesis-wisdom-layer.ts`; no live-route caller.
- **Field substrates** — `fieldContextAdapter.ts` flag-gated read-only; CoherenceFieldService/QuantumFieldMemory dormant/frozen as documented. `morphic_pattern_memories`, `somatic_memories` [0 rows each].
- **substrateMap IMPOVERISHED_ROUTES** (`substrateMap.ts:267-274`) — self-declared orphan routes.

## D. Defect register

1. **D1 write-only vector store** — `semantic_memory_vectors` written every eligible turn, read by nobody.
2. **D2 mislabeled health** — `memoryHealth.semantic` counts atoms; historical "sem: ok" evidence measured the wrong thing.
3. **D3 duplicate SemanticMemoryService** unresolved (consciousness/ vs memory/).
4. **D4 stale self-map** — `substrateMap.ts:312` claims DEEP is context-only; code says otherwise (`maiaVoice.ts:1044`).
5. **D5 delete-my-memory scope** — 5 legacy tables out of ~14 live substrates (detail in Corrigibility audit; route auth repaired in working tree, but a stale header comment at `:40` still flags the old issue — comment should be removed).
6. **D6/D15 breakthrough duality** — member-marked `atoms.is_breakthrough` vs system-written `breakthrough_moments`: two substrates, opposite authority models, both with prompt paths.
7. **D7 doctrine bypass** — `developmental_memories` content reaches the prompt through MemoryBundle's ranked/compressed bullets, though the Expansion Plan lists developmental as observed-only and forbids synthesis. MemoryBundle's significance-ranking + compression **is** synthesis.
8. **D8 empty live substrates** — anchors 0 rows, spiral state 0 rows, case_memories 0 rows: code live, unused.
9. **D9 route duplication** — oracle/conversation maintains a parallel copy of the whole wiring with ~zero traffic; divergence-by-maintenance risk (Bridge D's only wire points live there — hence D8's spiral-state emptiness).
10. **D10 premium storage** — filesystem archive outside all deletion/consent paths, claim-laden schema.
11. **D12 identity-key split** — `user_id` (turns, vectors, relationship tables) vs `member_id` (member_* tables); dual `maia_sessions` writers with different column sets.
12. **D13 implicit retention horizon** — `TurnsStore.pruneOldTurns` keeps 100 turns/user (`:248-259`), undocumented.

## E. Open questions

1. Who writes `developmental_memories` (1,456 rows exist — producer not found in current code; possibly legacy writer since removed)?
2. Are `saveConversationTheme/BreakthroughMoment/RelationshipPattern` called live, or is relationship memory reading fossil rows?
3. Does the summary worker complete `member_sessions.summary` (218 queued), and does anything read it?
4. Exact delete-account coverage of atoms/anchors/spiral/agent_runs/maia_turns/case/premium stores.
5. DEEP-primary (consciousnessOrchestrator) addenda coverage after the §IX consultation-lane change — runtime verification absent.
