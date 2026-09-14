# P1-04 · MAP 3 — THE AUTHORITY GRAPH

```text
STEP     PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-04 · MAP 3
TYPE     RECORD ONLY — ⛔ no repair · no design · no adjudication · no verdict
INPUT    P1-03/04_ladder_A_B_C.md · 05_ladder_D_E_F.md · 06_ladder_G_H_I.md
         (artifact paths and statuses only: 01_/02_/03_normalized_*.md)
BOUND BY P1-04 INSTRUMENT · Amendment 2 (INF-6, sparse graphs, SYN-1…SYN-4) ·
         Amendment 3 (orthogonal axes, EFFECT-WITHOUT-LOCATED-AUTHORIZATION) ·
         Amendment 4 (INF-7; NONE LOCATED ≠ UNKNOWN; INF-6 rows stay first-class)
```

> ### ⭐⭐ Governance of a thing is not necessarily authorization of what that thing does.

> ⭐⭐ **The graph represents the evidence density of the organism, not the coherence we wish the
> organism had.** ⛔ No source code, governing document, test or runtime witness was read. ⛔ No
> contradiction adjudicated. ⛔ No GOVERNED ACT inferred. ⛔ The word *unauthorized* appears at no
> node, edge, caption, heading or summary line in this file. ⛔ The separately-owned
> authorization/exposure lane is neither cited, awaited nor answered.

---

## 0 · How to read a node, declared before use

```text
<row id> · <named object> · ART <artifact, from the slice or the register>   [EWLA]
  <PARTICIPATION> [SYN]   AUTH <GOVERNED | NONE LOCATED | UNKNOWN> [SYN]   SCOPE <…>
  INF-6 <the prevention lines, verbatim>            ← omitted where the slice did not fire it
  BASIS "<quote>" · "<quote>"
```

**Two axes, never one.** `PARTICIPATION` and `AUTHORITY` are independent (Amendment 3 §2 /
Amendment 4 §4). ⛔ Neither is derived from the other. `PARTICIPATION UNKNOWN + AUTHORITY GOVERNED`
is a coherent, reportable state, ⛔ not a hole to fill.

**`SCOPE` line.** One of `GOVERNED OBJECT · GOVERNED SHAPE · GOVERNED ACT · GOVERNED DECISION`
**only** where the quoted source in the ladder slice explicitly says what is governed. Otherwise
`SCOPE OF GOVERNANCE — UNKNOWN`. ⛔ `GOVERNED ACT` is never inferred. ⛔ No label is invented.
Where a slice states a scope in words that are **not** one of the four, those words are quoted and
the four-label scope stays `UNKNOWN` — ⛔ the record's own phrase is never rounded to the nearest
label.

**SYN classes** (Amendment 2 §1) — carried by every node **and every edge**:

```text
SYN-1  OBSERVED    the source record's own words, quoted by the slice
SYN-2  DERIVED     the slice applied a criterion it declared before use, to quoted prose
SYN-3  CONTRADICTION / TENSION      two records stand and neither was dropped
SYN-4  UNKNOWN     ⛔ never drawn as an edge
```

Per-slice SYN convention, stated so it is subtractable: slice 04 assigns `SYN-1` where the P1-02
record itself assigned or refused the position, or stated `DORMANT`/`ORPHANED`/zero callers, and
`SYN-2` where its two declared anchors were applied; slice 05 marks its own rows `(explicit)` →
`SYN-1` and `(criterion)` → `SYN-2`; slice 06 declares that *"the three P1-02 records never use the
ladder vocabulary"* and a reading rule was unavoidable, so its non-`EXISTS` positions are `SYN-2`
and its `EXISTS` (subject-identity verified on all 48) is `SYN-1`.

**`[EWLA]`** marks a row in the `EFFECT-WITHOUT-LOCATED-AUTHORIZATION` inventory — **62 rows,
18 + 12 + 32**. ⭐ Each is individually legible below and again in §*Where INF-6 fired*. The count
is navigation only. ⛔ `EWLA` establishes: *effect OBSERVED · authorization located NO ·
authorization status UNKNOWN / NONE LOCATED*. ⛔ It establishes nothing else.

**Node inclusion**: every row carrying a recovered `CONTRIBUTES` or `DECIDES`, **or** any
`AUTHORITY STANDING` other than `UNKNOWN`. **183 nodes** of the 221 register rows.

---

# NODES — DOMAIN A · CANONICAL COGNITION / MAIA

P3-A-01 · Canonical member chat turn — POST /api/sovereign/app/maia/list · ART app/api/sovereign/app/maia/list/route.ts:285 · registry lib/maia/maiaRuntimeContext.ts:64   [EWLA]
  CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "CAPABILITY — accept a member utterance over HTTP, assemble context, produce a MAIA-claiming response, terminate to the member." · "SYSTEM AUTHORITY — chooses the tier (§A-02), chooses which addenda exist, and may refuse the turn at the schema gate or provider gate." · authority: "NONE LOCATED for the route as a whole; Canon v1.1 provenance headers named at egress"
P3-A-02 · Processing-tier decision (FAST / CORE / DEEP) — chooseProcessingProfile · ART lib/consciousness/processingProfiles.ts:49 · computed lib/sovereign/maiaService.ts:3169-3176 · switch :3391   [EWLA]
  DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion · ⛔ CONTRIBUTES / CONSIDERS / KNOWS NOT written downward from DECIDES
  BASIS "CAPABILITY — select which cognition path a turn takes." · "MAIA AUTHORITY — none; the tier is decided before cognition." · "GOVERNANCE GATE — NONE FOUND. No refusal-registry check, no consent gate and no member-visible disclosure governs which mind answers a given turn."
P3-A-03 · FAST tier prompt assembly and generation — fastPathResponse · ART lib/sovereign/maiaService.ts:771 · baseSystemPrompt :1497-1507 · generateText :1560-1562   [EWLA]
  CONTRIBUTES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · DECIDES not established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "CANONICAL CALL PATH — `fastPathResponse` → `generateText({ systemPrompt: baseSystemPrompt })` at `maiaService.ts:1560-1562`." · gate "PARTIAL, AND DIVERGENT … FAST therefore receives one of the four standing texts and not the other three."
P3-A-04 · CORE tier prompt assembly — corePathResponse / buildMaiaWisePrompt · ART lib/sovereign/maiaService.ts:1601 · lib/sovereign/maiaVoice.ts:549 · appendAllContextAddenda :910 · generateText :1988   [EWLA]
  CONTRIBUTES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · DECIDES not established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "CANONICAL CALL PATH — `corePathResponse` → `buildMaiaWisePrompt` (`maiaVoice.ts:549`) → `appendAllContextAddenda` (`maiaVoice.ts:910`) → `generateText` at `maiaService.ts:1988`." · ⚠️ two specs cited at `maiaVoice.ts:524-531` are "⛔ NOT VERIFIED in the source record"; ⛔ an unverified citation is not a located authorization
P3-A-05 · DEEP tier — two prompt regimes, one seamless (deepPathResponse) · ART lib/sovereign/maiaService.ts:2056 · primary stage 1 :2338-2354 · repair :2543 → maiaVoice.ts:972 → generateText :2554   [EWLA]
  CONTRIBUTES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · DECIDES not established · HAS AUTHORITY not established · INF-6 prevents promotion · ⛔ the record's three statuses are carried, not collapsed
  BASIS "…raced against a 4500ms timeout …; the response is taken verbatim at `:2346`." · "DEEP-primary stage 1: **NONE FOUND**"
P3-A-06 · RCN early-return cognition — maiaRcnProcess · ART lib/sovereign/maiaService.ts:3196-3266 (call :3210 · finalize :3224 · return :3241)   [EWLA]
  CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "MAIA AUTHORITY — the returned text is corpus-derived, not tier-generated; it never passes a MAIA system prompt or any of the four standing texts." · "if `used && confidence >= 0.7 && completedNormally` → … → **returns before the tier switch** (`:3241`)." · gate is "egress discipline only"
P3-A-07 · Writers-Studio canonical turn — POST /api/writers-studio/focus · ART app/api/writers-studio/focus/route.ts:30 · lib/writers-studio/writersStudioCognition.ts:124   [EWLA]
  CONTRIBUTES [SYN-1 — assigned by the source record]  ⛔ explicitly NOT DECIDES   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · DECIDES REFUSED BY THE RECORD ITSELF · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "PRESERVED DISTINCTION — this is the only place where the canonical-turn renderer CONTRIBUTES to a member-facing answer. It still does not DECIDE the organism's shape." · authority: "FOCUS-WITNESS-01_RESULT_2026-09-10.md exists in-repo but was NOT READ"
P3-A-08 · CMT-01 canonical-turn shadow on /list · ART lib/maia/canonical-turn/ (14 modules) · list/route.ts:1296 constructCanonicalTurn · :1326 emitShadowDiff
  KNOWS [SYN-1 — Anchor 1 shape, ⛔ NOT CONTRIBUTES, excluded by the record]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS established · CONSIDERS / CONTRIBUTES not established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "MEMBER-FACING EFFECT — none. The legacy turn is unaffected by construction." · authority: the named source is the CMT-01 witness, which records "the live `zeroDiff:true` witness is **NOT yet obtained**" — "⛔ A witness is not authorization text." · "⚠️ INF-2: static/CI, not a request-time gate."
P3-A-09 · MAIA identity / system prompt — 96 declaration sites · ART 96 files matching "You are MAIA|You are Maia" across app/api + lib (25 are HTTP route handlers); named lib/consciousness/MAIA_RUNTIME_PROMPT.ts et al.   [EWLA]
  CONTRIBUTES [SYN-2 — for the ONE named source only]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · DECIDES not established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "`MAIA_RUNTIME_PROMPT.ts` reaches FAST via `maiaService.ts:1070` and CORE/DEEP-repair via `maiaVoice.ts:585`. DEEP-primary stage 1 reaches **none of them**." · "GOVERNANCE GATE — NONE FOUND for identity-source uniqueness. No guard, registry, or refusal check constrains a new file from declaring 'You are MAIA' and shipping it to a model." · ⚠️ the other 95 sources' reach is NOT DETERMINED and carries no position
P3-A-10 · Egress — member-facing finalization (finalizeMemberFacingText) · ART lib/sovereign/maiaService.ts:2660-2689 · determineResponseMode :2670 · makeCanonHeaders list/route.ts:1813   [EWLA]
  CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "COMPUTED WHERE — `determineResponseMode(input)` (`:2670`) → if `PRESENCE`, `enforcePresenceConstraints` (`:2672`) → `enforceIdentityPredicateConstraint` (`:2681`)." · "`finalizeMemberFacingText` governs only the `getMaiaResponse` family." · ⭐ authority: the named source is "Canon v1.1 provenance headers", which govern the headers, ⛔ not the egress constraints
P3-A-11 · /api/between/chat — live-secondary lane · ART app/api/between/chat/route.ts:776 · lib/consciousness/maiaOrchestrator.ts:251 → getMaiaResponse :506   [EWLA]
  CONTRIBUTES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · DECIDES not established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "Distinct member-facing terminations that produce MAIA-claiming text at the subject: … `app/api/between/chat/route.ts` `POST` at `:776` (A-11)." · "→ `lib/consciousness/maiaOrchestrator.ts:251` → **converges on `getMaiaResponse`** at `maiaOrchestrator.ts:506`." · "NONE LOCATED; the wrapper's own contract (`maiaRuntimeContext.ts:3-5`) is not satisfied on this path"
P3-A-12 · /api/sovereign/app/maia — dormant predecessor · ART app/api/sovereign/app/maia/route.ts:1 (@ts-nocheck), getMaiaResponse at :343 and :497
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EXISTS established · ⛔ no higher position written from the fact that the handler "would serve a request" — a capacity is not a participation
  BASIS "CURRENT STATUS — DORMANT … ⚠️ Dormant here means *unvisited*, not *closed* — the handler would serve a request." · "GOVERNANCE GATE — NONE FOUND. Dormancy is asserted by a source comment and a registry entry, not enforced."
P3-A-13 · /api/oracle/conversation — blocked lane · ART app/api/oracle/conversation/route.ts:433 (POST), 410 at :452; ~2600 lines of unreachable cognition
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EXISTS established · ⛔ nothing written from the ~2600 lines of unreachable cognition still in the tree
  BASIS "CURRENT STATUS — BLOCKED. The 410 is the first executable statement of `POST`." · authority: the named source is "refusal-19 … (CI instrument, not a governing document)", and "refusal-19:25 states explicitly that passing does **not** authorize the writers themselves, which remain ungoverned (S5)."
P3-A-15 · Peripheral MAIA-claiming routes with independent cognition (25, as a class) · ART app/api/maia/relational-navigation/route.ts:46 · living-field/[fieldKey]/encounter/route.ts:34 · portal/[slug]/chat/route.ts:32 · ask-maia/ask/route.ts:84 · …   [EWLA]
  CONTRIBUTES [SYN-2 — for the CLASS]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established for the CLASS · DECIDES not established · HAS AUTHORITY not established · INF-6 prevents promotion · ⛔ INF-5: the class position is not written onto any individual route
  BASIS "CAPABILITY — produce member-facing text that claims to be MAIA, outside every path above." · ⭐ "`middleware.ts` matches them (tier / access), which governs **who may call**, never **what may be said in MAIA's name**."
P3-A-16 · Model / provider dispatch — generateText gateway (boundary to Domain G) · ART lib/ai/modelService.ts:76 · sovereignty throw :90 · MAIA_INFERENCE_MODE → lib/ai/sovereignRouter.ts:134   [EWLA]
  CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "`lib/ai/modelService.ts:76` (`generateText`) — described in-source as *'Main gateway for ALL text generation in MAIA'*" · "explicit throw *'SOVEREIGNTY VIOLATION: OpenAI is FORBIDDEN'* (`:90`)" · ⚠️ carried: "THE GATEWAY CLAIM IS FALSE AT THE SUBJECT." · gate "PARTIAL — … which at least four independent model reaches do not pass"
P3-A-17 · Runtime governance instruments on the canonical lane (the set of eleven) · ART schema gate list/route.ts:296-306 · provider gate :1362 · route registry maiaRuntimeContext.ts:60-101 · refusal registry tests/constitutional/refusal-registry/ · middleware.ts:478-487
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ No position forced. ⭐ An instrument that governs is not thereby a participant, and an instrument that does not run at request time is not thereby a runtime gate
  BASIS "STATUS NOT DETERMINED BY SOURCE RECORD — the record presents a table of instruments … and assigns no single status." · "NONE LOCATED as a set" · ⚠️ "The refusal registry is the largest governance artifact in this domain and it DOES NOT RUN AT REQUEST TIME" (INF-2)

# NODES — DOMAIN B · MEMORY / ANAMNESIS

P3-B-01 · TurnsStore + meta.conversationHistory (session thread) — conversation_turns · ART lib/memory/stores/TurnsStore.ts:113/:206/:256 · injection maiaService.ts:1058
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONSIDERS established at FAST · ⛔ NOT written for CORE/DEEP · CONTRIBUTES not established · INF-6 prevents promotion
  BASIS "`lib/sovereign/maiaService.ts:1058` | **FAST** — `contextPrompt` | `memoryContext` (the `MemoryBundle`) + `recentThreadBlock`" · gate PARTIAL (sanctuary at write boundaries only)
P3-B-02 · MemoryBundleService — the compressed cross-session bundle · ART lib/memory/MemoryBundle.ts:99 (retrievals :112-117) · surfaced :709 → :1406 → maiaService.ts:925 → :1058
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS + CONSIDERS established (FAST) · ⛔ "CORE and DEEP do not read `meta.memoryContext` at all" — CONSIDERS NOT written there · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "COMPUTED WHERE lib/memory/MemoryBundle.ts:112-117 — four parallel retrievals: getRecentTurns … getSemanticMemories … getBreakthroughs … getRelationshipData" · "⛔ FAST ONLY." · "GOVERNANCE GATE NONE FOUND for bundle composition. `MemoryGate.resolveMemoryMode` gates whether it runs, not what it selects."
P3-B-03 · loadMemberMemoryAtomsForPrompt (memoryHealth 'semantic') — member_memory_atoms · ART lib/maia/memoryAtomsLoader.ts:230, predicates :278-291 · surfaced route :1006 → :1424
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS + CONSIDERS established · CONTRIBUTES not established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "COMPUTED/LOADED :278-291 — `FROM member_memory_atoms` with five refusal predicates" · "SURFACED WHERE route :1006 atomsAddendum → meta :1424 → FAST maiaService.ts:1444 → :1507; CORE/DEEP-repair via maiaVoice.ts:427 ADDENDA_SPECS; DEEP-consultation maiaService.ts:2388." · ⚠️ "NONE LOCATED for the predicate; runtime witness … (SHA 57b0324fd ≠ subject)"
P3-B-04 · loadPriorCrossSessionExchanges (conversational recall) — conversation_turns · ART lib/maia/memoryLoaders.ts:195 (:209) · consent :241/:245 · surfaced route :1061 → :1426
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS + CONSIDERS established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "COMPUTED/LOADED lib/maia/memoryLoaders.ts:195 loadPriorCrossSessionExchanges (`FROM conversation_turns`, :209)" · "SURFACED WHERE route :1061 conversationalRecallAddendum → :1426 meta → FAST maiaService.ts:1423 → :1507; CORE/DEEP-repair via maiaVoice.ts:425 …; DEEP-consultation via maiaService.ts:2386." · ⚠️ "a consent gate is a member instrument, not a located governing source, and the record locates none"
P3-B-05 · loadRecentMarkedEpisodes (episodic, member-marked) — episodic_memories · ART lib/maia/memoryLoaders.ts:283 · consent :328/:332 · surfaced route :1087 → :1427
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS + CONSIDERS established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "LOADED WHERE lib/maia/memoryLoaders.ts:283 loadRecentMarkedEpisodes — `FROM episodic_memories WHERE user_id=$1 AND marked_by_member = TRUE`" · "SURFACED WHERE route :1087 → meta :1427 → FAST maiaService.ts:1433 → :1507; CORE/DEEP-repair via maiaVoice.ts:426." · ⚠️ "The gate exists and is enforced on read; the member cannot move it."
P3-B-06 · loadRecentDevelopmentalMemories → buildMemoryInfluencePlan — developmental_memories · ART lib/maia/memoryOrchestrator.ts:214 · loaded route :945-948 · surfaced :991 → :1421
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS (every tier) + CONSIDERS (FAST only) established · ⛔ CONSIDERS NOT written for CORE/DEEP against "CORE 72.8% / FAST 27.2%" · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "LOADED WHERE route :945-948 — loadRecentDevelopmentalMemories(userId, 3) and loadRecentThemeSignals(userId, 10), in parallel" · "SURFACED WHERE route :991 memoryInfluenceAddendum → :1421 meta → maiaService.ts:1398 read → :1507 FAST template. ⛔ FAST ONLY." · ⚠️ an in-code citation of "a 'deliberate product decision, deferred by founder ruling 2026-08-13'" — "⛔ that ruling was NOT located as a document"
P3-B-07 · loadRecentThemeSignals (pattern cue) — member_theme_signals · ART route :947 · surfaced inside the B-06 influence block (:991 → :1421 → maiaService.ts:1507)
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS + CONSIDERS established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "Theme signals **are** loaded on the live route (`route :947`) and **do** reach the FAST prompt inside the influence block." · "no per-layer consent gate" · ⚠️ Domain C reaches a different finding on the same TABLE (P3-C-09); ⛔ the two rows remain unmerged
P3-B-08 · is_breakthrough flag on atoms — member_memory_atoms · ART ORDER BY is_breakthrough DESC in memoryAtomsLoader.ts:278-291 · app/api/sovereign/atoms/[id]/breakthrough/route.ts:88 POST / :128 DELETE
  UNKNOWN — AMBIGUOUS [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ No position written from "it rides the atoms addendum" — riding another object's block is that object's participation, not this one's
  BASIS the record establishes only an ordering key — "ORDER BY is_breakthrough DESC, kept_at DESC" — and member mark/unmark routes · "GOVERNANCE GATE NOT DETERMINED BY SOURCE RECORD … GOVERNING SOURCE NONE LOCATED"
P3-B-09 · MemoryWritebackService — writes developmental_memories · breakthrough_moments · conversation_insights · ART lib/memory/MemoryWriteback.ts:603/:689/:732 · sanctuary skip route :1697   [EWLA]
  DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS ⭐⭐ "`NONE FOUND` — `MemoryWritebackService` formation threshold. What rises to a `developmental_memory` or a `breakthrough_moment` is decided in `lib/memory/MemoryWriteback.ts:603,:689,:732` with no traced governing rule." ⭐ effect and absence-of-located-authorization in one sentence of the record
P3-B-10 · buildMemberLiveContext ("member web") · ART lib/memory/MemberLiveContext.ts (:390 spiral-state load) · gated route :750
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS + CONSIDERS established · ⛔ NOT written for DEEP-consultation ("NOT named in S-5") · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "B-10 | `buildMemberLiveContext` ('member web') | `member_spiral_state`·session summaries·`member_patterns`·journals·`relationship_essences`·`member_theme_signals` | **SURFACED**" · "All three tiers: … member web (B-10)"; S-3 lists "member web `:422`"
P3-B-11 · RelationshipAnamnesisPostgres (essence) — relationship_essences · ART named in B §1 (stop stage UPDATED); relationship_essences is one of B-10's sources
  UNKNOWN — SILENT [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ No position imported from P3-B-10 merely because `relationship_essences` is one of the member web's sources
  BASIS "B-11 | `RelationshipAnamnesisPostgres` (essence) | `relationship_essences` | **UPDATED**" — a stop stage only; ⛔ no retrieval and no prompt seam traced for this object itself
P3-B-12 · RelationshipMemoryService (loadRelationshipMemory) · ART surfaced S-4 lib/sovereign/maiaVoice.ts:888-892 via formatRelationshipMemoryForPrompt; FAST via maiaService.ts:1289-1290
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS + CONSIDERS established (FAST + CORE) · ⛔ NOT written for DEEP · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "`lib/sovereign/maiaVoice.ts:888-892` | **CORE** | `relationshipMemory` via `formatRelationshipMemoryForPrompt`" · "FAST + CORE: relationship memory (B-12)"
P3-B-13 · Relational Context Bridge (getMemberActiveRelationalContext) — member_relationships · ART route :908 gate · surfaced S-1 maiaService.ts:1507 · S-3 maiaVoice.ts:431 · S-5 :2386-2393
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS + CONSIDERS established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "All three tiers: … relational context bridge (B-13)"; S-3 "relational context `:431`"; S-5 "relational context" · gate PARTIAL (sanctuary)
P3-B-14 · loadRecentIChingReadings (divination recall) · ART gated route :1105 · surfaced S-1 (three divination blocks, maiaService.ts:1507) · S-3 maiaVoice.ts:428-430
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS + CONSIDERS established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "All three tiers: … divination (B-14)"; S-3 "divination `:428-430`"; S-5 "three divination" · gate PARTIAL (sanctuary)
P3-B-15 · ConsciousnessMemoryLattice — resonance recall (and its separate write half) · ART lib/memory/ConsciousnessMemoryLattice.ts · recall maiaService.ts:3057 · = null :3102 · write :3689
  KNOWS [SYN-1 — assigned by the source record]  ⛔ explicitly NOT CONSIDERS   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS established · CONSIDERS REFUSED BY THE RECORD ITSELF · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "⭐ This is a `KNOWS ≠ CONSIDERS` case in its purest form." — with "SURFACED WHERE ⛔ NOWHERE … The recalled object never enters `meta`, never enters a prompt, and never reaches a response." · "read: none — the recall runs and is discarded regardless" · ⚠️ the write half's family reach is NOT DETERMINED and carries no position
P3-B-16 · spiralStatePersistence — member_spiral_state · ART named in B §1 (stop stage UPDATED); member_spiral_state is one of B-10's sources
  UNKNOWN — SILENT [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ Domain C's three-loader trace for the same TABLE (P3-C-03) is NOT imported onto this row
  BASIS "B-16 | `spiralStatePersistence` | `member_spiral_state` | **UPDATED**"; the object is not in §3's by-tier list
P3-B-17 · Selflet temporal message — selflet_messages · selflet_nodes · ART surfaced S-1 selfletPromptBlock (maiaService.ts:1507)
  CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⭐ CONSIDERS established · KNOWS NOT established — no retrieval site is traced for this object · INF-6 prevents the DOWNWARD inference
  BASIS §3 S-1 lists "`selfletPromptBlock`" among what passes through the FAST template literal; "FAST + CORE: relationship memory (B-12), selflet (B-17)."
P3-B-18 · recordMemoryTransitions — memory_transition_records · ART named in B §1 (stop stage PERSISTED, observability)
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ No position forced onto an observability writer
  BASIS "B-18 | `recordMemoryTransitions` | `memory_transition_records` | **PERSISTED (observability)**" · "COVERAGE NOT APPLICABLE — observability; no prompt seam." · ⚠️ "No member deletion path exists for this table (B §7.2)."
P3-B-19 · ConversationMemoryUsesStore (retrieval audit) — conversation_memory_uses · ART recordRetrievedCandidates, MemoryBundle.ts:133
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ No position forced onto a retrieval audit
  BASIS "Retrieval audit only: ConversationMemoryUsesStore.recordRetrievedCandidates (:133)" · ⚠️ "No member deletion path exists for this table (B §7.2)."
P3-B-21 · memoryCanonGuard (MEMORY_CANON_GUARD_PROMPT · scrubMemoryAmnesia · containsForbiddenAmnesia) · ART lib/maia/prompts/memoryCanonGuard.ts:47/:109/:200/:226 · prompt side MAIA_RUNTIME_PROMPT.ts:4,:137   [EWLA]
  CONTRIBUTES [SYN-2 — prompt side only]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established on the PROMPT side · ⛔ NOTHING established on the OUTPUT side · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "SURFACED WHERE prompt side: lib/consciousness/MAIA_RUNTIME_PROMPT.ts:4,:137 (so it rides in on every tier that carries MAIA_RUNTIME_PROMPT) and app/api/voice/stream-conversation/route.ts:1236." · "Whether the scrubbed text replaces the member-facing text on this route was **not established** by this trace and is carried as an open question (§9, OQ-4)."
P3-B-22 · MemoryGate.resolveMemoryMode — env + allowlist · ART gates route :541 shouldBuildMemory / :545 MemoryBundle skip; lattice write gate maiaService.ts:3676   [EWLA]
  DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion · ⭐ a gate that determines whether a capability runs is making a decision
  BASIS "a gate; determines whether memory building runs on the live list route turn" · "`MemoryGate.resolveMemoryMode` gates whether it runs, not what it selects." · ⚠️ "INF-3: an env var or allowlist selecting behaviour authorizes nothing"; "⛔ no governing rule located for the mode vocabulary"
P3-B-23 · TurnPosture / contentWritable (Sanctuary) · ART lib/sanctuary/turnPosture.ts:24/:44-47/:56 · lib/sanctuary/sanctuaryGuards.ts:26/:42/:54 · enforced TurnsStore.ts:113/:206/:256   [EWLA]
  DECIDES [SYN-2]   AUTH UNKNOWN [SYN-4]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "`contentWritable` refuses at every traced content store; `MemoryWritebackService` is skipped (`route :1697`); `MemoryBundle` is skipped (`:541`)"; "⛔ The refusal is loud and fails closed (`turnPosture.ts:56`)." · authority: the named source is "the six documented Sanctuary invariants (CLAUDE.md)", and domain C §8.4 records that under D-P1-06 `CLAUDE.md` is "operational/session evidence, ⛔ not a governing source" · ⚠️ carried: a `runtime_events` row IS still written for sanctuary turns with twelve `memory_layers` statuses, de-identified
P3-B-24 · MemoryPalaceOrchestrator and its eight services · ART lib/consciousness/memory/MemoryPalaceOrchestrator.ts:8-15 · consumed app/api/oracle/conversation/route.ts:902, :1499, prompt seam :2787
  UNKNOWN — RECORDS DISAGREE [SYN-3]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ Even KNOWS is withheld: if the POST is refused at its first statement the retrievals do not run either, so the disagreement reaches the whole row
  BASIS Side B: "SURFACED WHERE app/api/oracle/conversation/route.ts:902 retrieveMemoryContext → :2787 `generateMemoryContextPrompt(memoryContext)` interpolated into the prompt template." · Side A: "CURRENT STATUS — BLOCKED. The 410 is the first executable statement of `POST`." ⛔ NOT DERIVED ACROSS · "NONE FOUND at the orchestrator — no sanctuary check, no memory-mode check and no member consent gate appears in the file"
P3-B-26 · lib/memory/confidenceDecay.ts (calculateDecayedConfidence · shouldPromptForConfirmation) · ART confidenceDecay.ts:199 (zero callers repo-wide) · imported MemoryBundle.ts:16 and never called there
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EXISTS established · ⛔ the SQL function of the near-identical name is a DIFFERENT object (P3-C-11) and its participation is NOT imported here
  BASIS "`calculateDecayedConfidence` (TS) | imported at `lib/memory/MemoryBundle.ts:16` and **never called** in that file"; "`shouldPromptForConfirmation` | `confidenceDecay.ts:199` — zero callers repo-wide." · "P1-01 slice 03 records 'there is no single authoritative definition of decay today'"
P3-B-27 · lib/anamnesis/* (AnamnesisField · DecentralizedMemory · MemoryCoreIndex · CollectiveConsciousnessBridge · UnifiedMemoryInterface) · ART lib/anamnesis/**; sole importer lib/integrated-oracle-system.ts, itself zero importers
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EXISTS established · ⛔ no position written from module names that describe memory
  BASIS "zero importers anywhere outside `lib/anamnesis/`"; "sole importer is `lib/integrated-oracle-system.ts`, which itself has **zero importers**"; "no traced route entry."
P3-B-28 · lib/memory/MemoryManager.ts · lib/memory/VaultSymbolIndex.ts · ART both files; zero importers
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "`lib/memory/MemoryManager.ts` | zero importers." / "`lib/memory/VaultSymbolIndex.ts` | zero importers."
P3-B-29 · lib/memory/mem0.ts · lib/memory/beads-sync/ · ART beads-sync referenced only by lib/maia/substrateMap.ts:254 as an inventory entry
  EXISTS (beads-sync half) [SYN-1] · UNKNOWN — AMBIGUOUS (mem0 half) [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ The row is not split to make either half tidier, and mem0's "reachable from lib/semantic" is not promoted to a participation
  BASIS "`lib/memory/beads-sync/` | referenced only by `lib/maia/substrateMap.ts:254` as an inventory entry." · "NOT DETERMINED BY SOURCE RECORD for mem0 (reachable from lib/semantic; no turn path traced)"
P3-B-30 · memory_contracts table · ART read only by lib/trust/service.ts
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ No position forced onto a declared table
  BASIS "`memory_contracts` (read only by `lib/trust/service.ts`)"; "not reached by any traced turn path in this domain."
P3-B-31 · case_memories · case_memory_chunks · memory_links · vault_symbols · vault_query_patterns (declared tables) · ART declared in migrations; memory_links written/deleted by lib/memory/stores/MemoryLinksStore.ts:333
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ No position forced onto declared tables
  BASIS "⛔ **A table's existence in a migration is recorded here as a declaration and nothing more.** No claim is made that any of these are empty, unused in production, or safe to remove."

# NODES — DOMAIN C · DEVELOPMENTAL + RELATIONAL MEMORY

P3-C-01 · developmental_readings — frozen developmental reading (WS2-07) [Band I] · ART database/migrations/20260904000001_developmental_readings.sql (immutability trigger :88-101, key refusal :105-121) · store.ts:120/:136
  KNOWS [SYN-2]   AUTH ⭐ GOVERNED [SYN-1]   SCOPE ⭐ GOVERNED SHAPE — "what is governed is the SHAPE of the record — which keys may be written, that UPDATE is refused"
  INF-6 KNOWS established · CONTRIBUTES not established · INF-6 prevents promotion
  BASIS "LOADED WHERE store.ts:120 (loadReading, member-scoped) · store.ts:136 (listReadings) · lib/manuscript/ask/frozenDevelopmentalReading.ts:80" · "GOVERNANCE GATE — PRESENT AND ENFORCED IN SCHEMA. `WS2-07-DECIDE_DEVELOPMENTAL_READING_OBJECT.md` cited in-migration; INV-0/1/2/3/4/22/25 named … **This is the strongest governance binding in domain C.**" · ⛔ "Governing the form of a thing is not authorizing a participation position, and none is claimed."
P3-C-02 · developmental_observation_standing_events — member standing (BUILD-07F) [Band I] · ART database/migrations/20260906000001_developmental_observation_standing.sql (dose_no_update trigger :96-102) · store.ts:74/:87/:163
  KNOWS [SYN-2]   AUTH ⭐ GOVERNED [SYN-1]   SCOPE ⭐ GOVERNED SHAPE — "the migration states the absence of an `actor` column makes a system write **UNSAYABLE, not UNWRITABLE**"
  INF-6 KNOWS established · ⛔ nothing written from "the one unambiguously MEMBER-AUTHORED developmental object" — member authorship is the member's position, not this capability's
  BASIS "LOADED WHERE store.ts:74 · store.ts:87 · store.ts:163" · "GOVERNANCE GATE — PRESENT. `WS2-07-BUILD-07F_DESIGN_2026-09-05.md` named as design of record; D3/D6/D7 cited in-schema." · ⭐⭐ the corpus's only NEGATIVE authority statement: "SYSTEM AUTHORITY — ⛔ none by design." ⛔ An absence is not a grant, and it is not read onto any other row
P3-C-03 · member_spiral_state (Bridge D) [Band II] · ART database/migrations/20260213200001_member_spiral_state.sql · THREE LOADERS: oracle/conversation/route.ts:1711 (GUARDED) · lib/maia/living-field/encounterContext.ts:126 (UNGUARDED) · lib/memory/MemberLiveContext.ts:390 (UNGUARDED)
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⭐ KNOWS + CONSIDERS established, AND THE SPLIT IS THE FINDING — "So the inferred-developmental class is carried past the guard but was not observed reaching the prompt at that renderer." ⛔ CONSIDERS is NOT extended to `relational_phase` / `autonomy_streak` · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "⚠️ THREE INDEPENDENT LOADERS: 1. app/api/oracle/conversation/route.ts:1711 (guarded) 2. lib/maia/living-field/encounterContext.ts:126 (UNGUARDED) 3. lib/memory/MemberLiveContext.ts:390 (UNGUARDED)" · "Its prompt renderer, however, emits **only** `element`/`phase`/`motion` (`encounterContext.ts:196-198`)." · "⛔ **No governing source located for `member_spiral_state`** — no migration-cited ruling, no canon reference."
P3-C-04 · member_relationships + relationship_entries + relationship_field_state [Band III] · ART database/migrations/20260403000001_relationship_field_v1.sql · lib/relationships/relationshipContextService.ts:84/:116/:132/:143-148 · surfaced list/route.ts:916
  KNOWS · CONSIDERS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS + CONSIDERS established · CONTRIBUTES not established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "⭐ `pattern_hint` — MAIA-generated — is promoted into `salientThemes` (`relationshipContextService.ts:146-148`) and `salientThemes` is formatted into MAIA's prompt (`list/route.ts:916`)." · ⚠️ "**PROVENANCE COLUMN: NONE FOUND.** … A consumer reading `pattern_hint` cannot tell from the row that it is inferred." · ⛔ "a gate is not a located governing source"
P3-C-05 · member_relational_signals (system-detected relational state) [Band III] · ART database/migrations/20260409000010_member_relational_signals.sql · relationshipSignalService.ts:313/:340/:393 · surfaced app/api/founder/relational-signals/route.ts:233
  KNOWS [SYN-1 — CONSIDERS refused by a traced negative]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS established · CONSIDERS REFUSED BY A TRACED NEGATIVE · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "⭐ NEGATIVE FINDING, TRACED: `relationshipContextService.ts` — the module that feeds MAIA's prompt — **does not read `member_relational_signals`** … its only surfacing path found is the founder review lane." · "⛔ no consent model for inferred relational state about a member's intimate relationships"
P3-C-06 · member_patterns (practitioner-scoped developmental judgement) [Band IV] · ART database/migrations/20260316000003_member_patterns.sql · lib/patterns/getMemberPatterns.ts:45 (practitioner, all statuses) / :55-57 (member)   [EWLA]
  KNOWS · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion · ⛔ the access gate is "a linkage check, not a consent record" and is not read as an authorization
  BASIS "⭐⭐ ASYMMETRIC VISIBILITY, IMPLEMENTED IN CODE … **A developmental judgement about a member is deliberately withheld from that member while it is `emerging`.**" · "GOVERNANCE GATE — NONE FOUND", and "the `emerging`-withholding rule at `getMemberPatterns.ts:55` exists **only as a code comment**." ⚠️ The one document naming the table contradicts the code (§8.1) — ⛔ both sides preserved
P3-C-07 · pattern_ledger (MAIA-detected patterns) [Band IV] · ART lib/patterns/getMemberPatterns.ts (getMaiaDetectedPatterns) · surfaced app/api/members/patterns/route.ts:16
  KNOWS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS established · CONTRIBUTES not established (same reading as P3-C-01) · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "LOADED WHERE lib/patterns/getMemberPatterns.ts (getMaiaDetectedPatterns)" · "⛔ no MAIA-cognition prompt seam traced" · "⛔ no ruling located governing `member_patterns` ↔ `pattern_ledger` sharing one member-facing endpoint."
P3-C-08 · living_field_affinities (system-created affinity) [Band V] · ART database/migrations/20260702000001_living_field_affinities.sql · loaded encounterContext.ts:110-119 (ORDER BY affinity_score DESC LIMIT 10) · surfaced encounter/route.ts:107,153,227   [EWLA]
  KNOWS · CONSIDERS · DECIDES [SYN-2]   AUTH ⭐ SPLIT [SYN-1] — GOVERNED for inspectability · NONE LOCATED for the DECIDES effect
  SCOPE the record states its own scope and it is ⛔ none of the four labels: "`ECOLOGY_OF_MIRRORS.md` governs *inspectability*, not *selection weight*" → SCOPE OF GOVERNANCE — UNKNOWN as to the four
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion · ⛔⛔ A located governing source that covers a DIFFERENT aspect of the same object is not an authorization for this one
  BASIS ⭐⭐ "**A system-computed score selects and orders which of the member's own Keeps enter MAIA's prompt, with a hard `LIMIT 10`.** This is *ranking* and *what MAIA says*, from a system-inferred judgement." · "⛔ **no gate was located governing the scoring or the ranking itself**" · ⚠️ scope carried: "the member's OWN material, self-scoped by `member_id` … ⛔ NOT member-to-member."
P3-C-09 · member_theme_signals (participatory reality themes) [Band V] · ART database/migrations/20260316000001_participatory_reality_themes.sql · written lib/consciousness/participatoryRealityHelper.ts:110 · refusal lib/circles/fieldPulseService.ts:5-10
  UNKNOWN — RECORDS DISAGREE [SYN-3]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ No position derived. ⭐ A located refusal withholding a capability from one surface does not establish where that capability sits on another
  BASIS Side C: "CURRENT STATUS — `WIRED-BUT-UNOBSERVED` (write path only; no member-facing read located)." · Side B: "Theme signals **are** loaded on the live route (`route :947`) and **do** reach the FAST prompt inside the influence block." ⛔ NOT DERIVED ACROSS · ⚠️ "GOVERNANCE GATE — PRESENT, AND IT IS A REFUSAL … 'System-inferred member themes … are SUSPENDED…'" recorded as NONE LOCATED because "the refusal is in-code, naming a ratification that has not occurred."
P3-C-10 · episodic_memories [Band VI] · ART database/migrations/20260115000010_episodic_memories.sql · EpisodicMemoryService.ts:103/:127/:151/:202
  KNOWS [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 KNOWS established · ⛔ P3-B-05's prompt seam for the same table is NOT imported onto this row; the two rows were deliberately not merged
  BASIS "LOADED WHERE EpisodicMemoryService.ts:103 · :127 · :151 · :202" · "⚠️ Band overlap with domain B. Retrieval/decay of this material runs through `lib/memory/MemoryBundle.ts` — **noted and not re-censused**." · "(no ruling document binding the table)"; ⛔ "strong reasoning in code is not a located governing source"
P3-C-11 · Confidence decay — TS calculateDecayedConfidence + SQL calculate_decayed_confidence · ART lib/memory/confidenceDecay.ts:61 · database/migrations/20251231_memory_architecture_enhancements.sql · both invoked (MemoryBundle.ts:16 TS, :266 SQL)
  UNKNOWN — AMBIGUOUS [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 ⛔ No position written from the fact that the SQL function runs inside P3-B-02's retrieval — participation of the caller is not participation of the callee
  BASIS "BOTH ARE CALLED, AND ONE MODULE CALLS BOTH"; "STATUS NOT DETERMINED BY SOURCE RECORD — the record assigns no single status to the pair." · "⛔ **No authoritative definition of decay**"; "two divergent implementations are both live."
P3-C-12 · trust_observations [Band VII] · ART database/migrations/20260407200002_trust_observations.sql · lib/trust/trustObservationService.ts:45 · CALLERS: ⛔ NONE FOUND
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EXISTS established · ⛔⛔ the migration's own declared intent ("Feeds future symbolic affinity weighting") is NOT promoted to DECIDES or CONTRIBUTES. A declared future consumer is not a participation
  BASIS "CALLERS ⛔ NONE FOUND"; "**The declared consumer does not exist** … **X-19-relevant as a DECLARED INTENT, not as a live path**." · "GOVERNANCE GATE — NONE FOUND." · "PROVENANCE COLUMN: NONE FOUND. MEMBER AUTHORITY: NONE FOUND."
P3-C-14 · lib/coachField/practitionerProjection.ts [Band VII] · ART lib/coachField/practitionerProjection.ts:1-30 (scope derived server-side, :28-31) · CALLERS: ⛔ NONE FOUND
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EXISTS established · ⛔ careful in-file reasoning about authority is not authority standing
  BASIS "CALLERS ⛔ NONE FOUND"; "the module that reasons most carefully about what a practitioner may know **is dormant**, while the live practitioner read (C-6) gates on a linkage row." · "Reasoning stated in-file; ⛔ unreachable … GOVERNING SOURCE NONE LOCATED"
