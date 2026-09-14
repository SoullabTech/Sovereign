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
> contradiction adjudicated. ⛔ No GOVERNED ACT inferred. ⛔ No node, edge,
> caption, heading or summary line in this file renders a verdict of legitimacy on anything. ⛔ The
> separately-owned authorization/exposure lane is neither cited, awaited nor answered.

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

# NODES — DOMAIN D · FIELD INTELLIGENCE

P3-D-01 · D-OBJ-1 `FieldContext` seam — buildFieldContext / formatFieldAddendum · ART lib/field/fieldOrchestrator.ts:36-62,154,161-165,234-242; lib/sovereign/maiaService.ts:1521,1534,1946,1962   [EWLA]
  CONTRIBUTES [SYN-1 — explicit]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "(a)–(d) **CONTRIBUTE** to what MAIA says … (a)–(d) sit at CONTRIBUTES" — paths (a) `maiaService.ts:1521 → :1534` FAST and (b) `:1946 → :1962` CORE · "P1-D-GOV-01 The canonical field seam (D-OBJ-1) has no governance gate of any kind"
P3-D-02 · D-OBJ-2 PFI mind state `generatePFIMindState` · ART lib/sovereign/pfiMindEntrypoint.ts:94,247,254; lib/field/fieldOrchestrator.ts:16-20; maiaService.ts:2916   [EWLA]
  CONTRIBUTES [SYN-2 — criterion; via path (b) only, path (a) is flag-blocked]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "SURFACED WHERE Into D-OBJ-1's FieldContext.pfi { element, coherence, fieldWorkSafe, realm, deepWorkRecommended } → prompt." · gate "PARTIAL / DEFEATED IN ONE PATH"
P3-D-03 · D-OBJ-3 `ResonanceFieldGenerator` · ART lib/maia/resonance-field-system.ts (657 L); invoked from lib/field/fieldOrchestrator.ts:21   [EWLA]
  CONTRIBUTES [SYN-2 — criterion]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "SURFACED WHERE FieldContext.resonance → \"[Field Intelligence]\" prompt JSON." · "GOVERNANCE GATE ⛔ NONE FOUND"
P3-D-04 · D-OBJ-4 `UnifiedElementalFieldCalculator` · ART lib/consciousness/field/UnifiedElementalFieldCalculator.ts (517 L); fieldOrchestrator.ts:22-24,161-165   [EWLA]
  CONTRIBUTES [SYN-2 — criterion]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "SURFACED WHERE FieldContext.unified → prompt JSON (D-OBJ-1:44-49)" · "GOVERNANCE GATE ⛔ NONE FOUND"
P3-D-05 · D-OBJ-5 `routePanconsciousField` → FieldRoutingDecision · ART lib/field/panconsciousFieldRouter.ts:5-30; lib/sovereign/maiaService.ts:2207,2216
  UNKNOWN — AMBIGUOUS [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "the record expressly places the position on the enforcement object, not the classifier"; D-OBJ-5's own output is "attached to `(meta as any).fieldRouting` (:2216)" · "P1-D-GOV-02 … no ratified document authorizing realm-based refusal was located"
P3-D-06 · D-OBJ-6 `enforceFieldSafety` → FieldSafetyDecision · ART lib/field/enforceFieldSafety.ts:25; lib/field/fieldSafetyCopy.ts (189 L); maiaService.ts:2830-2860, esp. :2838,:2848   [EWLA]  ⭐⭐ THE SHARPEST INF-6 TEST IN SLICE 05
  DECIDES [SYN-1 — explicit]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "(e) is categorically different: it **DECIDES**, and its text **replaces** MAIA's." · "SURFACED WHERE ⭐⭐ DIRECTLY AS MAIA'S ANSWER ON REFUSAL. maiaService.ts:2848 — `const text = fieldSafety.message ?? …` returned before the turn reaches a model." · "P1-D-GOV-02 … **No ratified source authorizing realm-based refusal was located.** The in-source \"H2\"/\"W2\" commentary is a citation, not a located source."
  ⚠️ CARRIED, ⛔ NOT CARRIED FORWARD AS STANDING: the record itself wrote "(e) is the only object in Domain D at HAS AUTHORITY" — ⛔ derived from the effect it had just described; quoted here as evidence per INF-6 / Amendment 3 §2
P3-D-07 · D-OBJ-7 `analyzeFieldIntelligence` (Talk Mode field intelligence) · ART lib/maia/talkModeFieldIntelligence.ts:27,287,327; maiaService.ts:1079-1114,1094-1110,1198
  UNKNOWN — RECORDS DISAGREE (X-DEF-1) [SYN-3]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS D assigns "(c) … CONTRIBUTES"; E states "SURFACED WHERE ⛔ NOWHERE." ⛔ Not derived across · "GOVERNANCE GATE ⛔ NONE FOUND"
P3-D-08 · D-OBJ-8 `logFieldOrchestratorTelemetry` + field_orchestrator_telemetry · ART lib/field/fieldOrchestratorTelemetry.ts:45,91; app/api/admin/command-center/{overview,field-engines}/route.ts; maiaService.ts:1537,1965
  UNKNOWN — SILENT [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "SURFACED WHERE Admin Command Center only. ⛔ Not member-facing." · "P1-D-GOV-04 … no consent gate traced and no member read path"
P3-D-09 · D-OBJ-9 `getFieldContext` / `buildFieldContextPromptBlock` (vault-backed) · ART lib/maia/fieldContextAdapter.ts:1-40,100-128; app/api/oracle/conversation/route.ts:127,853
  UNKNOWN — RECORDS DISAGREE (X-DEF-2) [SYN-3]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS D treats that route as "the second cognition path"; E records "an unconditional HTTP 410 at `:446-453`". ⛔ Not derived across · ⭐ the gate itself is "PRESENT AND NAMED: … `MAIA_FIELD_CONTEXT_ENABLED === 'true'`" — INF-3: selection authorizes nothing
P3-D-10 · D-OBJ-10 `coherenceFieldService` + coherence_field_readings · ART lib/consciousness/memory/CoherenceFieldService.ts:80,125,402; oracle/conversation/route.ts:902,2787
  UNKNOWN — RECORDS DISAGREE twice (X-DEF-2 route status; CONTRA-2) [SYN-3]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS D assigns "(d) … CONTRIBUTES" via `route.ts:2787`; against it `substrateMap.ts:383-391` "consumers: [] … Service preserved; no live consumer wired" · "P1-D-GOV-03 … No source ruling that a computed coherence score may confer an award was located"
P3-D-11 · D-OBJ-11 `fireAndForgetFieldMonitor` + field_monitor_turns · ART lib/consciousness/fieldMonitorTelemetry.ts:29,165 (575 L); app/api/voice/stream-conversation/route.ts:82
  UNKNOWN — SILENT [SYN-4]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "CALL PATH app/api/voice/stream-conversation/route.ts:82 … ⭐ the VOICE path, not the canonical text path." · P1-D-GOV-04
P3-D-12 · D-OBJ-12 `QuantumFieldMemory` · ART lib/consciousness/memory/QuantumFieldMemory.ts (810 L); app/api/maia/enhanced-consciousness/route.ts:22 (0 in-repo callers)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "**DORMANT** (module resolvable; no reachable entry point)"
P3-D-13 · D-OBJ-13 `ConsciousnessField` engine · ART lib/consciousness/field/ConsciousnessFieldEngine.ts (466 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "value-importers `app/api/maia/memory-enhanced-response/route.ts` (0 callers) and `route.enhanced.backup.ts` … DORMANT"
P3-D-14 · D-OBJ-14 `MAIAFieldInterface` · ART lib/consciousness/field/MAIAFieldInterface.ts (575 L); lib/agents/PersonalOracleAgent.ts:42
  UNKNOWN — AMBIGUOUS [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "DORMANT (PersonalOracleAgent reachability → Domain A)"; "⛔ which of the two objects those citations mean is NOT DETERMINED BY SOURCE RECORD" (C-F6)
P3-D-15 · D-OBJ-15 `ElementalFieldIntegration` · ART lib/consciousness/field/ElementalFieldIntegration.ts (870 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "6 importers, all inside the same dormant cluster or 0-caller routes … DORMANT"
P3-D-16 · D-OBJ-16 `ElementalInterferenceMonitor` · ART lib/consciousness/field/ElementalInterferenceMonitor.ts (584 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "2 importers, both intra-cluster … DORMANT"
P3-D-17 · D-OBJ-17 `QuantumFieldPersistence` · ART lib/consciousness/field/QuantumFieldPersistence.ts (434 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "only importers are the two 0-caller routes … DORMANT"
P3-D-18 · D-OBJ-18 `EnhancedMAIAFieldIntegration` · ART lib/consciousness/memory/EnhancedMAIAFieldIntegration.ts (1096 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "3 importers: `spiral-aware-response.ts`, `enhanced-consciousness/route.ts` (0 callers), backup file … DORMANT"
P3-D-19 · D-OBJ-19 `ResonanceFieldOrchestrator` (A) lib/field · ART lib/field/ResonanceFieldOrchestrator.ts:97,779 (783 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "⛔ **0 external importers** — `getResonanceOrchestrator()` (`:779`) is never called outside the file … **ORPHANED**"
P3-D-20 · D-OBJ-20 `ResonanceFieldOrchestrator` (B) lib/oracle · ART lib/oracle/ResonanceFieldOrchestrator.ts:40 (629 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "imported only by `lib/oracle/HybridSystemToggle.ts:7,43,49`, which itself has **0 importers**, and by a test … **ORPHANED**"
P3-D-21 · D-OBJ-21 `MaiaFieldOrchestrator` · ART lib/maia/MaiaFieldOrchestrator.ts (571 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "only `lib/integration/MaiaCrystalBridge.ts:11,83`, which has 1 importer … DORMANT"
P3-D-22 · D-OBJ-22 `FieldIntelligenceSystem` / `RelationalField` · ART lib/field-intelligence-system.ts (690 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "4 value importers, all within the dormant `maia-consciousness-lattice` cluster … DORMANT"
P3-D-23 · D-OBJ-23 `MAIAFieldAwareness` · ART lib/maia-field-intelligence-integration.ts (559 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "single importer `lib/maia-consciousness-lattice.ts:10`, itself with no route consumer … DORMANT"
P3-D-24 · D-OBJ-24 `FieldCoherenceTensor` + `fieldIntegrityValidation` · ART lib/field/fieldCoherenceTensor.ts (388 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "⛔ **type-only import** by `fieldIntegrityValidation.ts:13`; that file has **0 importers** … **ORPHANED**"
P3-D-25 · D-OBJ-25 `FieldAnalytics` · ART lib/field/FieldAnalytics.ts (277 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "⛔ **0 importers** … **ORPHANED**"
P3-D-26 · D-OBJ-26 `ParallelFieldProcessor` + fieldProtocol/{validation,storage} · ART lib/fieldProtocol/ (1657 L)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "4 importers … — no route reached … DORMANT"
P3-D-27 · D-OBJ-27 `FieldRecordsService` / `FieldRecordsRepo` + field_records · ART lib/field-protocol/ (1061 L); app/api/field/records/route.ts:14,57
  UNKNOWN — AMBIGUOUS [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "**PARTIAL** — repo path WIRED-BUT-UNOBSERVED; service layer ORPHANED"
P3-D-28 · D-OBJ-28 `neuropodEligibility`, `energyState` · ART lib/field/ (564 L total)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "`neuropodEligibility` **0 importers**; `energyState` 1 … ORPHANED / DORMANT" (⛔ the pair is kept as the record kept it)
P3-D-31 · D-OBJ-31 "Field Lab" experiment shelf · ART app/maia/field-lab/** (page.tsx:1-24 anti-gamification invariant), lib/maia/fieldLab/shelf.ts
  UNKNOWN — SILENT [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "Experiment shelf; header … an explicit anti-gamification invariant | Yes (`/maia/field-lab`) | NO"
P3-D-32 · D-OBJ-32 `/field/*` voice-first conversation surface · ART app/field/layout.tsx:11 (title "MAIA Field"), app/field/talk/
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "naming collision only"
P3-D-34 · D-OBJ-34 "Wisdom Field" circles + `WISDOM_FIELD_MOVES` · ART schema (9 `wisdom_field*` tables); `WISDOM_FIELD_MOVES` consumed at lib/sovereign/maiaService.ts:1083,1091
  UNKNOWN [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "`WISDOM_FIELD_MOVES` consumed at `maiaService.ts:1083,1091`"; "those lines are inside D-OBJ-7's Talk-Mode assembly, which E records as \"SURFACED WHERE ⛔ NOWHERE\"" — its only traced consumption sits inside the block whose surfacing is disputed (X-DEF-1)
P3-D-35 · D-OBJ-35 Field Coherence Index dashboard + /api/field-analytics/report · ART app/labtools/field-analytics/page.tsx:81-95,231-286; app/api/field-analytics/report/route.ts:19,70-76
  UNKNOWN — SILENT on cognition [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "⛔ **NO — gated.** … the file states \"⛔ Lab Tools is NOT a member surface.\"" · §4.3 "renders `0.5 → \"50%\"` … with nothing distinguishing the fallback from a measurement" · "P1-D-GOV-05 … whether it reaches this object is a scope question a worker may not answer"
P3-D-36 · D-OBJ-36 `/labtools/coherence` breath/HRV tool · ART app/labtools/coherence/page.tsx + lib/somatic/*
  UNKNOWN — SILENT [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "NO (lab-gated) | shows a **somatic** shift, unrelated to any other \"coherence\" here" (the gate found is `requireLabAccess()`, an access gate)
P3-D-37 · D-OBJ-37 `rhythmCoherence` overlay in the member conversation component · ART components/OracleConversation.tsx:1569,1745,10734-10753 (:10753 renders `Coherence: N%`); mounted app/maia/page.tsx:17, app/field/talk/page.tsx:20
  UNKNOWN — the record expressly withholds the determination [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "⛔ This record does not assert that a member sees it, and does not assert the code is unauthorized. It records what the code does." · "⛔ NONE FOUND"; P1-D-GOV-05's scope question "is a P1-04 question, not a worker's"
P3-D-38 · D-OBJ-38 `/labtools/relational-field` · ART app/labtools/relational-field/page.tsx (header "Not analysis. Perception.")
  UNKNOWN — SILENT [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "NO (lab-gated) | NO"
P3-D-39 · D-OBJ-39 `/api/maia/field` "field perception bundle" · ART app/api/maia/field/route.ts
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "⚠️ **0 in-repo callers** — ORPHANED by its own header's determination" (a self-only access gate is recorded, not an authorization)
P3-D-40 · D-OBJ-40 `ResonanceEngine` + `resonanceHysteresis`, `resonance-map` · ART lib/resonanceEngine.ts:25 (140 L), lib/resonanceHysteresis.ts (213 L), lib/resonance-map.ts (373 L)
  UNKNOWN — the record withheld a status word [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "⚠️ 13 importers, but **11 import only the `Element` type**"
P3-D-41 · `RFI` (named term) · ART ⛔ NO CODE OBJECT — named at docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md:70 and in CLAUDE.md Cat 1
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "**Finding: at the census subject, neither RFI nor UFI names any code object.**"
P3-D-42 · `UFI` (named term) · ART ⛔ NO CODE OBJECT — one comment, lib/orientation/spiralOrientation.ts:31
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "exactly ONE hit, a comment … \" *   UFI = field assembly (not used here)\""
P3-D-43 · `FIS Field State Primitive` · ART docs/canon/FIS_FIELD_STATE_PRIMITIVE.md
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS self-declared "interface target — no runtime authority yet"; "nearest artifact … does NOT match its six-dimension shape" · ⭐ the canon document is located and itself declares no runtime authority
P3-D-44 · `COLLECTIVE_FIELD_SERVICE_URL` service on :3010 · ART app/api/field-analytics/report/route.ts:19 — the variable appears in exactly one file repo-wide
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "**That variable appears nowhere else in the repository**"
P3-D-45 · `maia-mcp/server.ts` (`get_member_field`) · ART named only by the header of app/api/maia/field/route.ts
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS named only by a route header "which itself records the artifact as absent from this repository"
P3-D-46 · table `field_state_snapshots` · ART database/baseline/…sql:9969
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "table exists; ⛔ no writer or reader traced in lib/** or app/**"

# NODES — DOMAIN E · SPIRALOGIC / ELEMENTAL

⚠️ E assigns no ladder position anywhere; every position below is criterion-based or an `EXISTS`
drawn from E's own explicit non-participation determination.

P3-E-01 · `SPIRALOGIC_REFERENCE` constant · ART lib/maia/spiralogicReference.ts:2 (8-line file, one export)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] (UG-E7) · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "SURFACED WHERE NONE … CURRENT STATUS ORPHANED (vocabulary)"; "⭐ **Zero importers**"
P3-E-02 · `ConversationElementalTracker` → context.summary → system prompt · ART lib/consciousness/conversation-elemental-tracker.ts:18,45,253; maiaService.ts:1773,1781,1785; maiaVoice.ts:277,861   [EWLA]
  CONTRIBUTES [SYN-2 — criterion]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "SURFACED WHERE ⭐ the PROMPT. maiaService.ts:1781 sets context.summary = `Conversation: ${dominantElement} element, N turns` → lib/sovereign/maiaVoice.ts:277 \"Previous conversation context: ${context.summary}\""; "a member-derived elemental label reaching MAIA's system prompt on every CORE and DEEP turn" · "GOVERNANCE GATE ⭐ NONE FOUND. No env flag, no consent check, no Sanctuary branch at the injection site."
P3-E-03 · `ElementalOracleBridge` → elementalResult.dominant → [Field Intelligence] · ART lib/bridges/elemental-oracle-bridge.ts:205,328,373-387; maiaService.ts:1957,1962,1970   [EWLA]
  CONTRIBUTES [SYN-2 — criterion, CORE only]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "SURFACED WHERE ⭐ CORE only: maiaService.ts:1957 element: elementalResult?.dominant → … → maiaService.ts:1962 adaptivePrompt += \"\\n\\n[Field Intelligence]\\n{json}\"" · "⛔ No gate on the element computation itself"; the Sanctuary gate on the FieldContext is recorded and is not an authorization
P3-E-04 · Talk-mode `fieldAwareness` block · ART lib/sovereign/maiaService.ts:1079,1084-1094,1198 — `grep -n fieldAwareness` returns exactly 1079, 1094, 1198
  UNKNOWN — RECORDS DISAGREE (X-DEF-1) [SYN-3]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS E: "SURFACED WHERE ⛔ NOWHERE. … :1198 // Note: fieldAwareness intentionally NOT appended" vs D: "SURFACED WHERE ⭐ INTO THE PROMPT as a labelled block". ⛔ Not derived across · the env flag and mode condition "select the computation (INF-3: selection authorizes nothing)"
P3-E-05 · `member_spiral_state` substrate + `upsertSpiralState` · ART database/migrations/20260213200001_member_spiral_state.sql; lib/consciousness/spiralStatePersistence.ts:59,76,96,148; sole writer call site oracle/conversation/route.ts:1611
  UNKNOWN — AMBIGUOUS + RECORDS DISAGREE (X-DEF-2) [SYN-3]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS E: the sole writer sits "BELOW the unconditional 410 at :446-453"; D treats the same route as "the second cognition path" · UG-E3: "no ratified definition of what integer 1..12 denotes"
P3-E-06 · reader 1 — Living Field encounter/refine context · ART lib/maia/living-field/encounterContext.ts:126,196-198; encounter/route.ts:19; refine/route.ts:9   [EWLA]
  CONTRIBUTES [SYN-2 — criterion]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "⭐ **renders it into the prompt**: `:196-198` `Spiral state: element=…, phase=…, motion=…` inside `gatheredMaterial`" (⛔ not the disputed route) · ⚠️ carried, not resolved: E §12 Q5 — "Rows written before the oracle lane's retirement are being read today as if current."
P3-E-08 · reader 3 — `GET /api/members/spiral-state` · ART app/api/members/spiral-state/route.ts:15,24-30; client components/consciousness/ContinuityView.tsx:143
  UNKNOWN — a disclosure route; no participation position in cognition stated [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "returns `currentElement`, `phase`, `motion`, ⚠️ `relationalPhase`, ⚠️ `autonomyStreak` to the authenticated member" · "the two inferred fields are returned with no admission step equivalent to R16" (UG-E4)
P3-E-10 · `admitPersistedStateForShaping` — Refusal R16 · ART lib/relational/developmentalStateAdmission.ts:5-8,:31-39; sole caller oracle/conversation/route.ts:1711
  UNKNOWN — RECORDS DISAGREE (X-DEF-2) [SYN-3]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS E: "SOLE CALLER app/api/oracle/conversation/route.ts:1711 — ⛔ BELOW THE 410"; D treats that route as a live cognition path. ⛔ Not derived across · ⭐ asymmetry recorded: "Refusal R16, law quoted in-file at :5-8; ⛔ no external ratified document cited by E" — a named, tested refusal whose ratified source is not located
P3-E-12 · Corpus Callosum trace — corpusCallosumService + agent_runs / integration_passes · ART lib/services/corpusCallosumService.ts:111,172,229,317; maiaService.ts:3948,3967,4022
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] (UG-E6) · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "CURRENT STATUS WIRED-BUT-UNOBSERVED (write); ⛔ **NOT participating in cognition**" and "LOADED WHERE ⛔ NOT loaded back into any turn. No reader of agent_runs feeds cognition." · the Sanctuary refusal is a gate, ⛔ not an authorization; `CORPUS_CALLOSUM_ENABLED` is config selection (INF-3)
P3-E-15 · `VoiceDistinctionScorer.scoreFirewallIntegrity` · ART lib/spiralogic/VoiceDistinctionScorer.ts; maiaService.ts:99,4001-4005,4015
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "\"observability-only collapse detector … No behavior / prompt / schema impact\", and its result is emitted only as a `console.log`"
P3-E-16 · per-phase modality selection — FRAMEWORK_REGISTRY + chooseFrameworksForCell · ART lib/consciousness/spiralogic-core.ts:1314-1592; call sites oracle/conversation/route.ts:846 and app/api/maia/spiralogic/route.ts:89, BOTH without opts
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "Both non-test call sites pass **no opts** … so `enabledApplied` defaults to `[]` (`:1579`) and **no applied modality can ever be selected**." ⭐ independent of X-DEF-2: it holds at BOTH call sites · "⭐ NONE FOUND — no consent gate, no disclosure, no refusal surface on modality selection; the empty default is a code default, ⛔ not a gate" (UG-E1, named by P1-01 the highest-consequence unlocated gap) · ⚠️ "its inertness is not a ruling that it is safe"
P3-E-18 · `CrossSpiralPatternRecognizer` + `TriadicPhaseDetector` · ART lib/spiralogic/CrossSpiralPatternRecognizer.ts, TriadicPhaseDetector.ts — 1 importer each, types only
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "1 importer each, `lib/ain/AINSpiralogicBridge.ts:22,23` (types only) … DORMANT / orphaned as recorded"
P3-E-25 · `bead_events.spiralogic_element` → `getConsciousnessPolicy` · ART database/baseline/…sql:5863; read at lib/sovereign/maiaService.ts:443-506,455-461, logged :801
  UNKNOWN — AMBIGUOUS [SYN-4]   AUTH NONE LOCATED [SYN-1] (UG-E5)   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "READ by lib/sovereign/maiaService.ts:455-461 (getConsciousnessPolicy, 30-day window) → policy.dominantElement logged :801 and carried into awareness-level guidance" — ⛔ "carried into awareness-level guidance" names neither a prompt nor a member surface
P3-E-28 · the S-16 12-phase document vocabulary · ART docs/MAIA_12_PHASE_AWARENESS_SYSTEM.md:47; docs/CANONICAL_SPIRALOGIC_12_PHASE_REFERENCE.md:107,108,162
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "⛔ **0 code hits** for four of them" · "the naming documents carry no status" (UG-E7)
P3-E-29 · `lib/spiralogic/registration/` — the chart-to-elemental grammar · ART lib/spiralogic/registration/ (6 files + test), self-contained
  UNKNOWN — the record determines backing, not participation [SYN-4]   AUTH ⭐ GOVERNED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "the one chart-to-elemental grammar with ratified backing"; "the only Spiralogic artifact E found with ratified backing (P1-01; UG-E7)" · ⭐ Amendment 3 §2's third coherent combination: PARTICIPATION UNKNOWN + AUTHORITY GOVERNED. ⛔ Not a hole to be filled · ⛔ the record does not say WHAT the ratified backing governs

# NODES — DOMAIN F · SYMBOLIC SYSTEMS

⛔ `KNOW / SAY / CONCLUDE` are NOT ladder positions (Amendment 3 §3). Where F established only an
F-power, PARTICIPATION is `UNKNOWN` and the F-power is carried in BASIS.

P3-F-03 · F-03 `lib/divination/tarot/` · ART major-arcana.ts 364 · minor-arcana.ts 533 · spreads.ts 574 (:27,:291,:315) · drawing.ts 410
  UNKNOWN — F-POWER ONLY [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS ⚠️ CONCLUDE forecast-shaped BY DATA STRUCTURE: "a `Future` position defined as \"Likely outcome based on current trajectory\" is a forecast SLOT, not merely a possible output" · "MAIA_SOVEREIGNTY_INVARIANTS.md:246 names Tarot in Tier 2 — ⛔ no implementing mechanism found"
P3-F-06 · F-06 `divinationRecallLoader` · ART lib/maia/divinationRecallLoader.ts:30-49,:73; app/api/sovereign/app/maia/list/route.ts:143,1103,1105-1111; producerRegistry.ts:196-215   [EWLA]
  CONTRIBUTES [SYN-2 — criterion]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 CONTRIBUTES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "SURFACED WHERE route.ts:1105-1111 — three separate addenda + [MAIA] divination-block marker"; "A member's own durable I Ching readings are made available to the ordinary `/list` conversation." · "the loader header's declared authority chain … ⛔ no P1-01 governing source named" · ⭐ gates are multiple, structural and TESTED — ⛔ a gate is not an authorization · ⚠️ INF-1 HELD: "a dated production record exists, a complete path is traced, and the witness says the block produced **nothing**. ⛔ That is not `LIVE`" · F-POWER: KNOW bounded · SAY gated · ⭐⭐ CONCLUDE "structurally refused"
P3-F-07 · F-07 `POST /api/changes/[id]/interpret` · ART app/api/changes/[id]/interpret/route.ts:17-40 (INTERPRETATION_SYSTEM_PROMPT), :47-49 auth, :56 member-scoped SELECT, :159 UPDATE studio_changes   [EWLA]
  ⭐ PARTICIPATES [SYN-1 — explicit]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 PARTICIPATES established · HAS AUTHORITY not established — ⭐ the record says so in the same sentence · INF-6 prevents promotion
  BASIS "Per the instrument's preserved distinctions: authentication establishes `PARTICIPATES`, not `HAS AUTHORITY`." · "**GOVERNANCE GATE** — ⭐ **`NONE FOUND`** … they gate *who may invoke*, never *what may be claimed*" · F-POWER: ⭐⭐ CONCLUDE "yes, and instructed to" (`reading`·`guidance`·`warnings`·`timing`·`relatingReading`), PERSISTED at `:159` with no author-class column. ⛔ None of that is a ladder position
P3-F-08 · F-08 `POST /api/studio/changes/[id]/interpret` · ART app/api/studio/changes/[id]/interpret/route.ts (186 ln) — the same INTERPRETATION_SYSTEM_PROMPT (:17-40, identical in both files)   [EWLA]
  PARTICIPATES [SYN-1 — explicit, same F §3.3 sentence]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 PARTICIPATES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "authentication establishes `PARTICIPATES`, not `HAS AUTHORITY`" · "⭐ NONE FOUND (identical grep result to P3-F-07: no lens, no tradition-framing, no refusal, no test)" · F-POWER: CONCLUDE yes-and-instructed, persisted
P3-F-09 · F-09 `app/api/studio/changes/[id]/mentor/` (+ /chat) · ART mentor/route.ts (222 ln) :32
  UNKNOWN — F-POWER ONLY [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "interpretive · concluding | WIRED-BUT-UNOBSERVED"; the only restraint is inline at `:32` — "You never diagnose, prescribe, or claim authority over the person's process" · "⛔ Not `SYMBOLIC_LENS_BOUNDARY`, not canon-bound"
P3-F-10 · F-10 `app/api/oracle/iching/route.ts` · ART app/api/oracle/iching/route.ts:71 (member scoping)
  UNKNOWN — SILENT on participation in a turn [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "computational · memory-bearing · member-facing | WIRED-BUT-UNOBSERVED"; its written readings are what F-06 later recalls · F-POWER: ⛔ CONCLUDE: NO — house corpus text
P3-F-11 · F-11 `POST /api/oracle/tarot` — UNAUTHENTICATED · ART app/api/oracle/tarot/route.ts:4-48 (111 ln) — grep for auth/member/session/SYMBOLIC_LENS returns ZERO matches
  UNKNOWN — F-POWER ONLY [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "interpretive · **concluding** · member-facing | WIRED-BUT-UNOBSERVED · **UNAUTHENTICATED**" · "⭐ NONE FOUND on both axes — no authentication, no member scoping, no symbolic-lens wrapper"; "⛔ no mechanism was found that COULD make the Tier-2 claim-type judgement on this path"
P3-F-12 · F-12 `POST /api/oracle/runes` — UNAUTHENTICATED · ART app/api/oracle/runes/route.ts (180 ln) — same shape, same zero auth matches
  UNKNOWN — F-POWER ONLY, and ⚠️ F's two enumerations disagree about it [SYN-3] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS F §2 classifies it "interpretive · member-facing" (⛔ not concluding); F §4's no-refusal-surface list includes it. ⛔ Not reconciled
P3-F-13 · F-13 `app/api/iching/cast/`, `/search/`, `/hexagram/[number]/` · ART app/api/iching/cast/route.ts:8
  UNKNOWN — SILENT [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "\"Does not require authentication — the oracle is available to all\""; "not classified concluding by F" — openness is DECLARED; a claim-type gate is not determined
P3-F-14 · F-14 `maiaAstrologyContextService` in the live member turn · ART lib/services/maiaAstrologyContextService.ts (1,205 ln); app/api/sovereign/app/maia/list/route.ts:109,552,695,726-738,732,1419
  CONTRIBUTES [SYN-2 — criterion]   AUTH ⭐ GOVERNED [SYN-1]
  SCOPE OF GOVERNANCE — UNKNOWN. The located source is quoted as naming the WRAPPER, ⛔ not this service's act: "MAIA_SOVEREIGNTY_INVARIANTS.md:241-252 — Invariant 13 (Claim-Type Floor) names the wrapper as its operationalization" · ⛔ GOVERNED ACT not inferred
  INF-6 CONTRIBUTES established · HAS AUTHORITY not established for the act · INF-6 prevents promotion
  BASIS "Natal chart, current transits, Mayan profile and \"cosmic weather\" are computed per member and **injected into the prompt of the ordinary conversational route**"; "→ :1419 passed into generation"; "⭐ This is the **live conversational route** … Astrology is not a side surface; it is in the ordinary turn." · ⚠️ carried: the wrapper is "a model-compliance instruction, ⛔ not a structural refusal; nothing measures obedience and no test or falsifier exists." GOVERNED names a located authorization, ⛔ not an enforced one
P3-F-16 · F-16 `lib/story/archetypalNarrativeService.ts` · ART lib/story/archetypalNarrativeService.ts:1-9,:5; app/api/astrology/narrative/route.ts:13,59
  UNKNOWN — F-POWER ONLY [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "interpretive · **concluding**"; "the disclaimer at `:5` is a COMMENT addressed to developers, ⛔ not an instruction in the model's prompt" · "claim-type gate NONE FOUND — no `SYMBOLIC_LENS_BOUNDARY`, no Invariant-13 check in route or service" · F-POWER: ⭐ CONCLUDE yes — a narrative about this member's journey
P3-F-21 · F-21 `lib/stellium/` · ART lib/stellium/** incl. chartAnalysis.ts (431 ln); 63 importers incl. lib/practitioner/sessionPrep.ts, lib/maia/context/buildMaiaContext.ts
  UNKNOWN — a possible second symbolic entry into MAIA context, expressly NOT traced [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "flagged by F as a POSSIBLE second symbolic entry into MAIA context, ⛔ NOT traced to a turn (Domain A/B territory)" · "⭐ NONE FOUND for member consent to practitioner-visible chart derivation … ⛔ Existing visibility is not treated as legitimate merely because it exists."
P3-F-24 · F-24 `lib/wisdom/sacredTexts/` + `SacredEncounterService` · ART lib/wisdom/sacredTexts/** incl. SacredEncounterService.ts:170 `evaluateEncounter`; oracle/conversation/route.ts:30; components/OracleConversation.tsx:65,9723   [EWLA]
  DECIDES [SYN-1 — the record's own verb, in ordinary prose]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "`evaluateEncounter` (`SacredEncounterService.ts:170`) returns `EncounterResult | null` — it **decides whether a sacred passage meets the member**." · "⛔ `grep` for `consent|optIn|enabled` … returns **no match**. … The only found control is the null return of `evaluateEncounter` itself — i.e. **the system's own judgement is the gate**." · ⚠️ SCOPE OF THE ASSIGNMENT: the quoted sentence is about what the function does when it runs; X-DEF-2 disputes the reachability of the route that imports it, ⛔ NOT resolved here
P3-F-27 · F-27 `chineseAstrology.ts`, `types/daYun.ts`, `types/vedic.ts`, BaZi · ART lib/astrology/chineseAstrology.ts + type modules; BaZi tables via migration 20260130000001
  UNKNOWN — SILENT [SYN-4]   AUTH NONE LOCATED for an implementing binding [SYN-1] · ⭐ a governing TEXT is located
  SCOPE OF GOVERNANCE — UNKNOWN · BASIS "MAIA_SOVEREIGNTY_INVARIANTS.md:245 names Vedic; no implementing binding located" (C-F4) — ⭐ the mirror image of EWLA: authority located without effect
P3-F-28 · F-28 `mayanAstrology` (via F-14) · ART lib/astrology/mayanAstrology, computed inside maiaAstrologyContextService and carried in the same addendum at route.ts:732
  CONTRIBUTES [SYN-2 — criterion, inside F-14's addendum]   AUTH GOVERNED [SYN-1]
  SCOPE OF GOVERNANCE — UNKNOWN. Located source quoted as naming the wrapper and the tradition: "`SYMBOLIC_LENS_BOUNDARY` at route.ts:732"; "MAIA_SOVEREIGNTY_INVARIANTS.md:245 (Invariant 13 names Mayan)" · ⛔ GOVERNED ACT not inferred
  INF-6 CONTRIBUTES established · HAS AUTHORITY not established for the act · INF-6 prevents promotion
  BASIS "computed inside maiaAstrologyContextService and carried in the same addendum at route.ts:732", traced ":732 → :1419 passed into generation" · F-POWER: CONCLUDE wrapper-constrained only
P3-F-29 · F-29 `lib/soulPortrait/generator/` · ART lib/soulPortrait/generator/**, both importing lib/astrology
  UNKNOWN — F-POWER ONLY [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "interpretive · **concluding** | WIRED-BUT-UNOBSERVED"; "no turn path traced" · "⭐ NONE FOUND (F §4 list)"
P3-F-31 · `SYMBOLIC_LENS_BOUNDARY` (the wrapper itself) · ART app/api/sovereign/app/maia/list/route.ts:282-283 — an inline `const` prompt string; applied at exactly two call sites, :646 (Wu Xing) and :732 (astrology)
  CONTRIBUTES [SYN-2 — criterion; the wrapper's own text is prepended into the prompt]   AUTH GOVERNED [SYN-1]
  SCOPE OF GOVERNANCE — UNKNOWN, and the slice says why in its own words: "⛔ NONE FOUND governing the wrapper itself: no artifact states who may edit it or requires new symbolic paths to apply it" — while "MAIA_SOVEREIGNTY_INVARIANTS.md:245-246 (Invariant 13, Claim-Type Floor)" "names the wrapper as its operationalization". ⛔ Both carried, ⛔ neither resolved
  BASIS "→ :732 astrologyAddendum = SYMBOLIC_LENS_BOUNDARY + '\\n\\n' + contextHeader + detail → :1419 passed into generation" · ⚠️ it is "a model-compliance instruction, ⛔ not a structural refusal", ⛔ NOT CI-GATED · ⭐ "being a gate is not a position on the participation axis above CONTRIBUTES, and is not authority over the paths it does not reach (C-F4)"
P3-F-32 · `safe_for_retrieval` · ART ⛔ ZERO matches in lib/ database/ app/ (*.ts, *.sql); every occurrence is prose in docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md
  UNKNOWN — NOT A PARTICIPATION QUESTION (no code object) [SYN-4]   AUTH NONE LOCATED for an implementation [SYN-1] · a governing text is located
  SCOPE OF GOVERNANCE — UNKNOWN · BASIS "⭐⭐ `safe_for_retrieval` HAS NO IMPLEMENTATION … **Verified at the census subject**"; the cited text "asserts a mechanism the code does not contain" (C-F2)
P3-F-33 · `facetToHexagram` seed map · ART ⛔ zero matches in lib/ app/ components/ database/ — exists only as illustrative TypeScript inside docs/canon/ICHING_STRUCTURAL_ENGINE.md:134
  UNKNOWN — NOT A PARTICIPATION QUESTION [SYN-4] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "there is no seed map in code TO have provenance"
P3-F-34 · Invariant 13 Tier-2 consequential-forecast refusal · ART MAIA_SOVEREIGNTY_INVARIANTS.md:246 — hard refusal for forecasts of death, illness, marriage, legal/financial outcomes "regardless of source"
  UNKNOWN — NOT A PARTICIPATION QUESTION (canon prose; a required refusal, not a capability) [SYN-4]
  AUTH ⭐ GOVERNING TEXT LOCATED · IMPLEMENTATION NONE FOUND [SYN-1] — ⛔ carried verbatim as the slice wrote it, ⛔ NOT collapsed into GOVERNED or NONE LOCATED
  SCOPE OF GOVERNANCE — UNKNOWN · BASIS "⛔ no implementing code found anywhere in Domain F"; "the governing source exists; the implementation does not"

# NODES — DOMAIN G · MODEL / PROVIDER / ORCHESTRATION

P3-G-01 · `generateText(req: TextRequest)` — declared "main gateway for ALL text generation" · ART lib/ai/modelService.ts:71-76 (declared), :83-193 (branching), :10,52-58   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "CANONICAL CALL PATH | app/api/sovereign/app/maia/list/route.ts:89,1364-1365 → getMaiaResponse() … → generateText() at maiaService.ts:1561 (FAST)" · "SYSTEM AUTHORITY | Total, via process environment… an unrecognized value falls through every branch to the local Ollama call at :187." · "GOVERNANCE GATE | NONE FOUND at runtime"; "Provider admission as declared in that file has no runtime expression."
P3-G-02 · `generateTextWithSovereignty` / degradedResult() / DEGRADED_TEXT — DEGRADING · ART lib/ai/sovereignRouter.ts:134-140, :15-17, :50-61; exits :77,:85,:117,:125   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "Routes a plain-text request under an explicit inference mode and decides what happens when a provider fails." · "The degraded string is returned as MAIA's turn, not as an error"; "the seam emits text in MAIA's first person without any MAIA cognition having run." · ⛔ PERSISTENCE — UNKNOWN: "The emitting seam makes a persistence claim it does not itself discharge" · "GOVERNANCE GATE | NONE FOUND. The mode string is passed through from modelService.ts:10 unvalidated" (INF-3)
P3-G-03 · `generateWithClaude` / `selectClaudeModel` · ART lib/ai/claudeClient.ts:114, :50-86, :13-16, :176-186   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · DECIDES [SYN-2]  ⛔⛔ CONSIDERS EXPLICITLY NOT ASSIGNED   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion · ⭐ KNOWS WITHOUT CONSIDERS: "At the subject, selectClaudeModel() never reads an awareness level."
  BASIS "The awareness level appears in this file exclusively inside a log string — consciousnessPolicy?.awarenessLevel → awarenessLog (:136-140)." · "SELECTION RULE, AS READ | forceOpus → Opus (:70-72); … everything else → Sonnet (:85)" · "GOVERNANCE GATE | NONE FOUND. meta is an untyped Record<string, unknown> (:91); forceOpus / forceSonnet / reasoningMode are read straight from it with no provenance check on who set them." · ⚠️ C-4: ADR-001 is located and Accepted but the code no longer implements it and "No superseding ADR or ruling was located"
P3-G-04 · `runStructured` + `resolveStructuredMode()` + EXTERNAL_AUTHORIZED — REFUSING · ART lib/ai/structured/router.ts:65-73,:93-105,:116-131; lib/ai/structured/policy.ts:38-52   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "5 non-test callers: maiaReader.ts:51,738 · askReader.ts:22,232 · developmentalAskReader.ts:33,206 · developmentalReader/read.ts:26,123 · developmentalReading/classify.ts:23,209." · "FAILURE MODE | ⭐ REFUSES. … 'THE FAILURE STOPS HERE. No second provider, no local text path, no degraded template.'" · ⭐ the nearest authorization language in domain G sits here — "the platform owns whether the provider is authorized (policy.ts:9-13)" — and the register records "GOVERNING SOURCE NONE LOCATED (the rule is stated in the module)". ⛔ Per INF-4 a module stating its own rule is implementation evidence, not a located authorization
P3-G-05 · `isLocalHealthy` / `callLocalInference` (maia-local-inference) · ART lib/ai/localInferenceClient.ts:34,:51,:16-26 (45 s breaker), :60,:80
  EXISTS [SYN-1] · PARTICIPATES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "maia-local-inference | http://maia-local-inference:8080 | Selected at sovereignRouter.ts:80,120" · ⛔ DECIDES UNKNOWN — the record states the breaker is "tripped on health failure (:45) and on generate failure (:91)" but does not establish that this object determines the turn's outcome · ⭐ "No model is named on the sovereign text path." · "GOVERNANCE GATE NONE FOUND."
P3-G-06 · `localModelClient` (Ollama / DeepSeek) at modelService.ts:187 — LOCAL FALLBACK · ART lib/ai/localModelClient.ts:9,12,21-22,56; lib/ai/modelService.ts:180-193   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EFFECT established (CONTRIBUTES · answer-producing, member-facing) · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "modelService.ts:187 — the unconditional terminal branch of the legacy path." · "TEMPLATE ENGINE | localModelClient.ts:56 returns model: 'template-engine' under the consciousness_engine provider — a fourth answer-producing path that is not a model at all." · ⛔ DECIDES NOT ASSIGNED — the record places the selection at P3-G-01 · "No drift event is emitted at all." · "GOVERNANCE GATE NONE FOUND."
P3-G-07 · `kimiClient` + its two triggers (Moonshot / Kimi) · ART lib/ai/kimiClient.ts:11-13,68,96; lib/ai/modelService.ts:126-151
  EXISTS [SYN-1] · PARTICIPATES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "CALL PATH | modelService.ts:127-151. Two independent triggers: TEXT_MODEL_PROVIDER === 'moonshot' or req.meta?.useKimi — i.e. a per-request meta flag from any caller selects a third-party cloud provider." · ⛔ DECIDES NOT ASSIGNED; declared scope and trigger disagree (C-6) · "GOVERNANCE GATE | NONE FOUND, at any layer. moonshot appears in no tier of scripts/provider-policy.json"
P3-G-08 · `generateWithMultipleEngines` / OrchestrationType · ART lib/ai/multiEngineOrchestrator.ts; gate + result shape at lib/ai/modelService.ts:58,94-123   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EFFECT established (CONTRIBUTES · the text of a conversational TextResult) · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "CALL PATH | modelService.ts:94-123, gated by ENABLE_MULTI_ENGINE … AND (TEXT_MODEL_PROVIDER === 'multi_engine' OR req.meta?.useMultiEngine)." · "RESULT SHAPE | text: consensus || primaryResponse (:113), model: `orchestration:${type}` (:116) — ⭐ the model field records an orchestration label, not a model." · ⛔ DECIDES UNKNOWN — "reading `consensus || primaryResponse` as a decision would be interpretation, not restatement" · "GOVERNANCE GATE NONE FOUND."
P3-G-09 · MODEL_REGISTRY / selectOptimalModel / getModelFallbackChain; minimumBloomLevel? · ART lib/ai/modelRegistry.ts:1 (@ts-nocheck), :6,:31,:40,:202,:254
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "⭐ No importer exists. A tree-wide grep for modelRegistry outside the file itself returns one hit, a prose comment" · ⭐⭐ NON-MONOTONIC, RECORDED: the file declares "minimumBloomLevel? — 'Developmental gate (if applicable)' (:31) — i.e. a model gate keyed to a developmental attribute of a person, declared as a type field", and "no evaluator and no importer found". ⛔ A declared gate that decides nothing is EXISTS and nothing above it · "GOVERNANCE GATE NONE FOUND."
P3-G-10 · scripts/anthropic-import-allowlist.json and the 60 files it enumerates · ART scripts/anthropic-import-allowlist.json; .githooks/pre-commit:43   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · DECIDES [SYN-2]   AUTH NONE LOCATED at runtime [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "MEMBER-FACING ENTRIES | Includes 7 HTTP route handlers"; verbatim allowlist rows: "app/api/maia/living-field/[fieldKey]/encounter/route.ts ('Cognitive surface, pins Sonnet') · .../refine/route.ts ('pins Haiku')" — each pins its own model · ⭐ seven entries "shipped AFTER this guard landed (2026-05-20) without being allowlisted — their lanes did not exercise preflight/pre-commit, so the guard never fired." · "Build/commit-time only (G-13). NONE FOUND at runtime — nothing prevents these files executing." (INF-2)
P3-G-12 · scripts/check-provider-governance.ts + scripts/provider-policy.json · ART check-provider-governance.ts:32,34-40,48,111; package.json:45,109,111; .githooks/pre-commit:39   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · DECIDES (commit / CI lane) [SYN-2]   AUTH UNKNOWN [SYN-4]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established (commit admission) · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "Exit 1 on any hit outside the allowlist (:111); exit 2 if the policy file is missing (:48)." · ⚠️ scope verbatim: "BUILD-TIME, NOT RUNTIME. It prevents new source surfaces. It has no effect on a running container." (INF-2) · ⭐ "'or other cloud AI providers' has no mechanical expression anywhere in the repository." · authority: the human policy it names, "docs/canon/PROVIDER_GOVERNANCE.md", is "NOT READ in this census. … its content, status and ratification are UNKNOWN here."
P3-G-13 · scripts/check-no-direct-anthropic.ts · ART :32-34 (self-declared authority), :69,:125,:196; package.json:42,111; .githooks/pre-commit:43; ⛔ absent from ci:sovereignty   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · DECIDES (commit lane) [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established (commit admission) · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "Any importer not in approved ∪ operational ∪ grandfathered fails with exit 1 (:125, :196)." · verbatim: "SELF-DECLARED AUTHORITY :32-34 cites CLAUDE.md — MAIA Sovereignty section and two docs/orientation/ documents. It cites no canon document, and no canon document names it." · "Verified to exist; its governing source is UNLOCATED."
P3-G-14 · `emitDriftEvent` / DriftEventType (incl. 'silent_fallback') · ART lib/sovereignty/driftAlarm.ts:39-45,79,113,120-138; call sites lib/ai/sovereignRouter.ts:105 and lib/maia/fieldContextAdapter.ts:101,118,127
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES (operator / practitioner surface) [SYN-2]  ⛔⛔ CONTRIBUTES-TO-MEMBER EXPLICITLY NOT ASSIGNED   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "AUDIENCE | ⭐ Operator/practitioner, never the member. Nothing in this path reaches a member surface." · "Always writes console.warn with { kind:'drift_alarm', … }; then, if TELEGRAM_BOT_TOKEN and PRACTITIONER_TELEGRAM_CHAT_ID are set … fires a Telegram message." · ⭐ coverage of the four degraded exits is nil by construction: "the one emitDriftEvent('silent_fallback', …) at :105 is on none of them." · "GOVERNANCE GATE NONE FOUND."
P3-G-15 · ReaderProvenance / ReaderIdentity / readerIdentity(model) · ART lib/manuscript/structure/readerProvenance.ts:12-21,24; developmentalReader/read.ts:104-106; proposalStore.ts:179-180,206
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · CONTRIBUTES (stored record) [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "PERSISTED WHERE | proposalStore.ts:179-180 stamps frozenAt at the write; read back at :206 from row.reader_provenance." · "⭐ An identity of the reading, not of MAIA: provider + model + a SHA-256 over system prompt and tool contract together + a reader version. It is the only object traced in this domain that binds who read to what was produced." · ⛔ IDENTITY ACROSS PROVIDER CHANGE — UNKNOWN by construction: "provider is the string literal type 'anthropic' … A different provider is not representable in this record." ⛔ that is not an establishment of identity discontinuity
P3-G-16 · scripts/deploy-lock.sh (acquire_deploy_lock()), exporter of DEPLOY_LANE_TOKEN · ART deploy-lock.sh:67,88-121,152,185; entry points deploy-production.sh:452,555,640,746; pre-deploy-gate.sh:234   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · DECIDES (deploy lane) [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "exclusive non-blocking flock -n on fd 9 … never queues, refuses with exit 1 and prints the holder's pid= started= user= entry= target= target_sha=." · ⭐ the closest call in domain G, both texts kept — FOR: "Acquiring the lock is the grant of build authority." AGAINST: "a tripwire against the QUIET bypass, not a forgery-proof credential"; "GOVERNING SOURCE NONE LOCATED; docs/ops/DEPLOY_LANE_TOKEN.md is named but NOT READ." ⛔ A mechanism that conveys a token is not a located authorization of itself
P3-G-17 · Dockerfile deploy-lane tripwire + deploy_ctx_materialize / _verify_image / _verify_running · ART Dockerfile:20-21,23-42; scripts/deploy-context.sh:190,238-239,375-389; scripts/pre-deploy-gate.sh:228-265   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · DECIDES (deploy lane) [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "PRE-DEPLOY GATE | … deploy-maia sequence at :228-265: lock → materialize → gates → build → verify image → tag_images_for_rollback → swap → verify running." · "TRIPWIRE | Dockerfile:23-42 — ARG DEPLOY_LANE_TOKEN=''; a build with it empty prints '🛑 OUT-OF-LANE BUILD REFUSED' and exit 1" · the file "states its own limit: 'a tripwire against the QUIET bypass, not a forgery-proof credential' (:20-21)"; "docs/ops/IMMUTABLE_SHA_DEPLOY.md and docs/ops/COLAB_RELEASE_GATE.md are named but NOT READ"
P3-G-18 · run_migrations_or_abort / cmd_migrate / the compose migrate service · ART scripts/deploy-production.sh:61,73-78,82-118,448-546,552-633; docker-compose.production.yml:529-537   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · DECIDES (deploy lane) [SYN-2]   AUTH SPLIT [SYN-1/SYN-4] — two halves, kept separate
  SCOPE OF GOVERNANCE — UNKNOWN. FAIL-CLOSED BEHAVIOUR — UNKNOWN: "Attributed in-file to DEPLOYMENT-SAFETY-01, founder ruling 2026-09-14 (:61)"; "⛔ The ruling document itself was not located or read, so an attribution is recorded, not a located authorization." MIGRATION SELECTION — NONE LOCATED: "SEPARATE MIGRATION GATE | ⭐⭐ NONE FOUND … no SHA argument, no migration selection, no per-migration authorization."
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "ORDER, AS READ | deploy (:448-546): lock → materialize → build → swap → provenance verify → migrate (:538) → success (:540) → smoke (:546)." · "Migration failure now aborts — run_migrations_or_abort prints '⛔ DATABASE MIGRATIONS FAILED — DEPLOYMENT ABORTED' and exit 1 (:93, :117)." · ⭐ verbatim: "It applies whatever migration files are present, in bulk."

# NODES — DOMAIN H · SENSORY / VOICE

P3-H-01 · `selectVoiceTransport(facts)` — four transports · ART lib/utils/platformDetection.ts:125-149; components/voice/ContinuousConversation.tsx:3370-3420 (dispatch :3408)   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "INPUTS isNative · isDesktop · hasSpeechRecognition · canRecordAudio"; "SYSTEM AUTH total — platform facts decide"; "The ear is selected by CAPABILITY, not by POLICY." · MEMBER AUTHORITY "none — the member cannot choose a transport." · ⚠️ carried verbatim: "CONSUMED ContinuousConversation.tsx:3401 (LOGGED, not dispatched on…)" · "GOVERNANCE ⛔ NONE FOUND for provider egress"; "DESKTOP-SOVEREIGN-STT-01 · S1/S4 · S11" and "D01 §XII" → "⛔ not located"
P3-H-02 · app/api/voice/transcribe-simple/route.ts · app/api/voice/transcribe/route.ts · ART transcribe-simple:11-14,31-33,116-149; transcribe:27,42-44,189-219,234   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "CALL PATH ContinuousConversation (MediaRecorder) → POST → maia-whisper → onTranscript"; "PERSISTED transcribe: llamaService.addMemory(memberId, …) :234" · "E-1 · auth | getMemberIdFromRequest(req) → 401"; "E-3 · entitlements"; "E-4 · daily usage quota" · "⛔ NO provider-qualification gate. ⛔ NO consent gate. ⚠️ transcribe-simple has AUTH ONLY" · ⭐ "E-1…E-4 are identity and commercial gates. ⛔ None is a provider-egress or consent gate"
P3-H-03 · webkitSpeechRecognition session + @capacitor-community/speech-recognition · ART components/voice/ContinuousConversation.tsx:9,695,711,715-725,885-920   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "CALL PATH initializeSpeechRecognition (:695) → onresult (:885-:920) → onTranscript"; "COMPUTED off-device, by the browser or OS vendor" · "Desktop is refused Web Speech by CLASSIFICATION (:711 …), which is the ONLY place in the corpus where an STT provider is refused — and it is refused for Desktop only, by shell classification, never by a policy module." · "GOVERNANCE ⛔ NONE FOUND."
P3-H-04 · handleVoiceTranscript guard set N1–N12 (21-string ghost filter; t.length < 50) · ART components/OracleConversation.tsx:6780-7428; ghost list :7233-7251; heuristic :7155   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS the N1–N12 exit table; "FAILURE a refused utterance is silently dropped; nothing is surfaced to the member." · "the ghost-phrase list — 21 hard-coded strings (OracleConversation.tsx:7233-:7251) that refuse a member's utterance on CONTENT" · "⚠️ N4 and N5 are exits on which MAIA SPEAKS AND NO COGNITION RAN." · MEMBER AUTHORITY "⛔ NONE — the member cannot see, tune or override any guard." · "⛔ It is a NON-DEGRADATION gate, not a governance ruling … 'FROZEN IS NOT BLESSED.'" (INF-2)
P3-H-05 · `await handleTextMessage(cleanedText)` — the sole canonical cognition call · ART components/OracleConversation.tsx:7397 (canon pins the same OPERATION at a stale :7268)
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES [SYN-2]   AUTH ⭐ GOVERNED [SYN-1] — the only GOVERNED node in slice 06
  SCOPE the slice states the scope in its own words, ⛔ not in one of the four labels: "the located source governs the REQUIREMENT of convergence" → SCOPE OF GOVERNANCE — UNKNOWN as to the four · ⛔ GOVERNED ACT not inferred
  BASIS "⭐ As implemented, everything above the seam is capture and admission. The voice handler carries no request of its own, no prompt, no endpoint and no model selection into cognition — it hands a string across." · ⛔ DECIDES NOT ASSIGNED · "GOVERNANCE ⭐ docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md — named in CLAUDE.md as a 'hard acceptance gate on all voice/transport work'; RED = voice does not ship."; "The strongest gate in this domain." · ⚠️ per INF-2 the test that enforces it is not runtime governance; C6 records the canon's coordinate as stale — ⛔ a citation-staleness finding, ⛔ not a divergence
P3-H-06 · `commitOracleTurn(reason)` — one idempotent seam, six terminal reasons · ART components/OracleConversation.tsx:6371-6376,6380-6395; reasons :6400,6461,6500,6529,6535,6634; watchdog :341   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "EFFECT setMessages(prev => appendMessageCapped(prev, oracleMessage)) :6375 … + voice-mode saveConversationMemory(…) rides the same seam :6380-:6395" · "path 3 commits at 6s …; a promise that never settles runs neither branch"; "IDEMPOTENCE if (oracleTurnCommitted) return" · MEMBER AUTHORITY "none over the seam; showVoiceText governs RENDERING only." · authority: the 2026-08-13 MODALITY INDEPENDENCE founder ruling is "cited by name at OracleConversation.tsx:6447 … ⛔ NO document found under docs/canon/** or docs/programme/** bearing this ruling. … The law is carried by a comment and by one source-shape test."
P3-H-07 · maiaSpeak · handleSpeakMessage · openai-tts route · ttsRouter · cloudVoicePolicy · voiceArchetypes · ART OracleConversation.tsx:1955,2034,2130,7499; route :43,110,115,121,256-277; ttsRouter.ts:62-104; voiceArchetypes.ts:58-92   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · CONTRIBUTES · DECIDES [SYN-2]   AUTH UNKNOWN — RECORDS DISAGREE (C1) [SYN-3]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "DECLARED maiaSpeak (OracleConversation.tsx:1955 → POST /api/voice/openai-tts at :2034 native, :2130 web)" · "MEMBER AUTH member voice archetype (getMemberVoicePreferences, route :121)" · "⭐⭐ THE ARCHETYPE BRANCH RUNS BEFORE G-T1, G-T2 AND G-T3, AND RETURNS"; "voiceArchetypes.ts:88, :92 — unset OR unknown archetype ⇒ OpenAI" · authority: VOICE-SOVEREIGNTY-01 "exists only as a doctrine block inside the module it governs. No separate canon document located. A module that states its own authorising ruling is the only record of that ruling." ⛔ Not derived across
P3-H-08 · lastSendWasVoiceRef + lib/voice/restartAuthority.ts + attemptMicRestart · ART OracleConversation.tsx:1618 (init true), :4917-4919, :6827; seven restart sites :2678,2781,2850,2998,5758,6580,6597   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "set false on every typed turn at :4919, set true on an ACCEPTED voice turn at :6827" · "Read as the gate on seven restart sites" · ⭐ "MEMBER AUTH ⭐ REAL — modality of the member's last send decides whether the mic re-arms." ⛔ recorded as member authority; the record uses no authorization language about the mechanism, so ⛔ it is not read onto the authority axis · ⚠️ "lastSendWasVoiceRef INITIALISES TRUE — before the member has spoken once, the system's default posture is 'voice was the last modality.'" · "GOVERNANCE ⚠️ PARTIAL … not traced to a ruling document at the subject."
P3-H-09 · the eleven Class C `await maiaSpeak(` sites (of twelve; one is canonical) · ART OracleConversation.tsx:6854 (crisis script :6852-6857), :7039,7044,7053,7079,7097,7120,7143,7209; canonical site :6514   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES (member-facing, first person) [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EFFECT established (CONTRIBUTES · member-facing first-person utterance) · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "WORDS AUTHORED BY local scripts and data-API responses. ⛔ NO MODEL IN THE PATH — these are not an alternate MAIA mind. BUT they are member-facing first-person utterances that bypass canonical egress finalization entirely." · "⭐ SHARPEST the crisis script at :6852-:6857 — spoken outside every guard, deliberately non-returning." · "GOVERNANCE ⛔ NONE FOUND … '⚠️ FROZEN IS NOT BLESSED: pinning stops them growing, it does not certify them.'"; "Still unruled at the subject."
P3-H-10 · the four saveConversationMemory call sites · ART OracleConversation.tsx:5120, :6382, :6428, :7325; definition lib/services/memoryService.ts:28   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES (stored member record) [SYN-2]   AUTH UNKNOWN — RECORDS DISAGREE (C5) [SYN-3]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EFFECT established (CONTRIBUTES · retention of member utterances) · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "FOUND four saveConversationMemory call sites … :7325 (member voice utterance, sourceType:'voice', role:'user')." · ⚠️ "This is MODALITY-SYMMETRIC — the typed path is identical. It is therefore NOT a voice-versus-typed divergence and NOT a non-degradation breach." · authority: four unconditional write sites versus CLAUDE.md Sanctuary invariants 1 and 6. ⛔ Not derived across; routed to whichever domain owns Sanctuary, ⛔ not repaired here
P3-H-11 · sendStreamingMessage / useStreamingVoice / /api/voice/stream-conversation · ART hooks/useStreamingVoice.ts:633; app/api/voice/stream-conversation/route.ts; OracleConversation.tsx:2609
  EXISTS [SYN-1] · PARTICIPATES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "OracleConversation.tsx:2609 still calls useStreamingVoice({…})" · ⛔ UNREACHABLE FROM VOICE, verbatim: "no identifier sendStreamingMessage or streamingVoiceMode appears inside handleVoiceTranscript's body. Status: SUPERSEDED (preserved as evidence, unreachable from the voice handler)." · ⛔ CONTRIBUTES / DECIDES UNKNOWN — "Its coverage of any current MAIA-claiming path: NOT DETERMINED BY SOURCE RECORD." · "GOVERNANCE GATE CI-GATED negative assertion only"
P3-H-12 · X1 offline · X2 network-error · X3 server-error · X4 API catch · X5 teen abuse block · X6 voice-flow catch · ART OracleConversation.tsx:5386-5397,:5550-5561,:5630-5641,:6643ff,:5169-5210,:7404-7416   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES (member-facing) [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EFFECT established (CONTRIBUTES · member-facing locally-authored text) · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS the X-table: "what the member gets | locally-authored text, spoken via a different TTS entry"; "⛔ No model authored X1–X3's words." · "All six are pre-cognition or failure paths — commitOracleTurn does not yet exist in scope at X1–X3, X5, and X6 is a different function."
P3-H-13 · BetaMinimalMirror handleTranscript · ART components/chat/BetaMinimalMirror.tsx:133
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "handleTranscript body is '// Optional: Show live transcript preview' — empty. DORMANT: grep finds no mount of BetaMinimalMirror anywhere in app/ or components/."
P3-H-14 · app/oracle/page.broken.tsx — its own handleVoiceTranscript binding · ART app/oracle/page.broken.tsx:1072,1122
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "binds its own handleVoiceTranscript. Filename `.broken.tsx` is not a Next route. ORPHANED."
P3-H-15 · MaiaRealtimeWebRTC · RealtimeSpiralogicBraid · RealtimeVoiceService (.DISABLED) · ART lib/voice/ (119 entries total)
  EXISTS [SYN-1] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "lib/voice/*.DISABLED (3 files …) DORMANT by filename." · ⚠️ UNKNOWN carried: "lib/voice/ holds 119 entries against a handful reached from the traced path. Reachability of the remainder (aethericOrchestrator, moshi/, personaplex/, MaiaRealtimeClient*, ElementalVoiceOrchestrator, UnifiedVoiceOrchestrator, MayaHybridVoiceSystem, …) was not traced."
P3-H-16 · VoiceWithNotes · ART components/voice/VoiceWithNotes.tsx:75,179 → POST /api/notes   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES (stored record) [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EFFECT established (CONTRIBUTES · member transcript stored) · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "transcript → POST /api/notes. Never reaches cognition — a capture surface, not a conversation."
P3-H-17 · MorningDreamCaptureInterface onTranscript · ART components/dreams/MorningDreamCaptureInterface.tsx:242
  EXISTS [SYN-1] · PARTICIPATES [SYN-2] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "onTranscript={(t) => setDreamContent(t)} — fills a form field. No cognition."
P3-H-18 · labtools scribe onTranscript · ART app/labtools/scribe/page.tsx:78
  EXISTS [SYN-1] · PARTICIPATES [SYN-2] · AUTH NONE LOCATED [SYN-1] · SCOPE OF GOVERNANCE — UNKNOWN · BASIS "onTranscript: (result: TranscriptResult) => … — labtools scribe surface, separate from the MAIA conversation."

# NODES — DOMAIN I · MEMBER / PRACTITIONER

⛔ Restated only. For P3-I-01 … P3-I-07 the register records `COVERAGE: NOT APPLICABLE — no MAIA
cognition on this path`; their positions are read against the **member/practitioner visibility
path**, ⛔ never as claims about MAIA's cognition.

P3-I-01 · GET /studio/fields/<memberId> + member_field_note_threads.can_be_shown_to_practitioner · ART app/studio/fields/[memberId]/page.tsx:9-11,63-85,104-107,134-205; migration 20260626000001:8,40,96   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "SELECT … FROM member_field_note_threads WHERE member_id = $1 AND released_at IS NULL AND can_be_shown_to_practitioner = TRUE (:65-73)"; "SYSTEM AUTHORITY — released_at IS NULL (:68) silently excludes released threads" · ⭐⭐ "The gate at :104-107 asks 'is the viewer an active practitioner?', never 'is this practitioner this member's practitioner?' … The consent column limits which threads, never which practitioner." · MEMBER AUTHORITY "the per-thread boolean can_be_shown_to_practitioner, DEFAULT false" · "GOVERNANCE GATE — ⛔ NONE FOUND. The page header (:9-11) asserts 'This is the consented facilitator view.' That is a source comment, not a ruled source. … 'consented' is an assertion the corpus does not back."
P3-I-02 · GET /api/supervision/sessions · /api/supervision/transcript/list (+9 siblings) · ART app/api/supervision/sessions/route.ts:22-31; transcript/list/route.ts:34-45; config/accessMatrix.ts:578   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · CONTRIBUTES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 EFFECT established (CONTRIBUTES · disclosure of clinical transcript segments) · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "practitionerId and caseId read straight from searchParams (:22-23) → listSessions({…}) (:26-31) → response." · ⛔ DECIDES NOT ASSIGNED — the record establishes the opposite: "nothing can fail closed on identity, because identity is never established"; "⛔ NO HANDLER-LEVEL AUTHORIZATION. Neither file imports requireFounder, requirePractitioner … Grepped: zero matches in either route." · ⚠️ "the remaining seven were not individually read; their status is UNKNOWN, not 'the same'." · "P1-01 recorded 'Governance of the supervision stream …' as UNLOCATED."
P3-I-03 · GET /api/caseload/* (9 routes) — practitioner identity from the query string · ART app/api/caseload/list/route.ts:22,36,45,46-51,61-64; config/accessMatrix.ts:470,727-729   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "memberId from searchParams (:36) → CaseStore.isPractitioner(memberId) (:45) → 403 if false (:46-51) → CaseStore.listCases(memberId, filters) …" · ⭐⭐ "The check is 'is the member named in the URL a practitioner', not 'is the caller that member'." And: "⛔ No failure mode exists for 'caller is not the member named' — that question is never asked." · ⚠️ "Production ACCESS_CONTROL_MODE is UNKNOWN." · "GOVERNANCE GATE — ⛔ NONE FOUND."
P3-I-04 · POST /api/practitioners/create · ART app/api/practitioners/create/route.ts:13-27,43-60,144-165; lib/auth/getCurrentPractitioner.ts:36-48   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · CONTRIBUTES (stored record) · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "INSERT INTO practitioners (…) (:144) → UPDATE members SET is_practitioner = true … WHERE id = $1 (:161)." · ⭐⭐ "The handler performs no authentication and no authorization. … The memberId written is the one supplied in the body." · ⭐ "the row created is exactly the row read by getCurrentPractitioner() … and by CAP-I-01's inline gate … This capability is upstream of CAP-I-01's only check." · MEMBER AUTHORITY "⛔ NONE FOUND." · §5: "⛔ Authority to create a practitioner. POST /api/practitioners/create has no gate and no located ruling."
P3-I-05 · app/api/practitioner/clients/[clientId]/{messages,digest,prep,emergency,policy,spiralogic-report} · ART digest/route.ts:15,30 · messages/route.ts:15 · spiralogic-report/route.ts:16,28; migration 20260802000002:26-39,150-154   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "AUTHORIZATION — requireMemberId() from lib/auth/session (digest:15,30 · messages:15 · spiralogic-report:16,28)." · ⚠️ "whether requireMemberId()'s value is the correct referent at each call site could not be settled from the tree and is recorded as UNKNOWN, ⛔ not as a defect" — "the declared shape in this repository is therefore NOT authoritative." · MEMBER AUTHORITY "⛔ NONE FOUND on the read side … no column records a consent state and no withdrawal path exists." · "GOVERNANCE GATE — ⛔ NONE FOUND."
P3-I-06 · app/api/studio/** (≈76 routes) with getCurrentPractitioner(request) · ART lib/auth/getCurrentPractitioner.ts:27-66; e.g. app/api/studio/clients/route.ts:27-32   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion · ⭐ the soundest identity derivation in the domain still has no located authorization — two different facts, kept separate
  BASIS "SCOPING identity.practitionerId, server-derived, used in the WHERE clause … ⭐ The best-behaved practitioner surface in the tree: identity is never accepted from the caller." · ⭐⭐ "the only file selecting from a member-owned table … is app/studio/fields/[memberId]/page.tsx … That boundary is structural (no join exists), not permissioned." · ⚠️ "most of the ≈76 Studio routes were classified by their shared authorization import rather than read individually." · "GOVERNANCE GATE — ⛔ NONE FOUND."
P3-I-07 · the eight derived-visibility channels D-1 … D-8 · ART app/studio/fields/[memberId]/page.tsx:70-72,117,132,148-149,165-168,199; app/api/now-what/field-note/[id]/route.ts:132-139   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · CONTRIBUTES · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS D-2: "Three distinguishable outcomes: unknown id → notFound() (:117); known id + zero shared threads → the member's name plus 'has not yet carried anything from a Vision Studio session' (:165-168); known id + ≥1 thread → the threads." · D-1: "Supplying an id reveals that it resolves to a real member, and that member's name." · D-4: "a practitioner who saw the page before and after observes a count decrease and a missing title." · ⭐ D-8 is the one enforced-by-construction non-visibility: "no route here reads, counts, or aggregates them, and none may be added" — "⛔ Still GOVERNANCE GATE: NONE FOUND" · "P1-01 slice 08 §3 recorded: 'No document read in this slice addresses whether a practitioner could infer the existence of member-private material through metadata, counts, ordering, timestamps, notifications, suggested actions, or latency.'"
P3-I-08 · lib/relationship/scope.ts (ReadScope · resolveReadScope · canRead · practitionerMay · wisdomMayCiteMemberMaterial) · ART lib/relationship/scope.ts:50-420 (:336-344,:345-362,:350,:369-412); sole consumer its own test file
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "CONSUMERS lib/relationship/__tests__/scope.test.ts — and nothing else." · ⭐⭐ NON-MONOTONIC, verbatim: "MEMBER / PRACTITIONER / MAIA / SYSTEM AUTHORITY — all notional; it governs no live read." A module that models the whole authority question participates at EXISTS and nothing above it · ⭐ ":350 names can_be_shown_to_practitioner as 'the existing flag that holds this line' — so the module knows about CAP-I-01's column, and CAP-I-01 does not know about the module." · "GOVERNANCE GATE — ⛔ NONE FOUND — a source file is not a ruled source, and no located ruling cites it."
P3-I-09 · lib/coachField/{identity,practitionerProjection,bringForward,invitation}.ts · ART practitionerProjection.ts:57-73,109,201; bringForward.ts:5-8,14-24,98,151,209; consumers two verify scripts only
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "zero importers in app/ or lib/" · ⭐⭐ the stated reason DECIDES is NOT assigned: "bringForward is, by its own header, 'the only place a member decides' that anything crosses to a practitioner … No member-facing route reaches it. The member gesture the coach-field model is built around has no surface." · ⭐ "the client-sovereign field is protected by the absence of a join … ⭐ A genuine discipline. ⚠️ It protects a projection no route calls." · "GOVERNANCE GATE — ⛔ NONE FOUND."
P3-I-10 · member_memory_atoms.source_type='practitioner_observation' + .facilitator_id + .epistemological_status · ART migration 20260624000001:5-9,17-26,45; lib/maia/memoryAtomsLoader.ts:171,186,296-311,442-447; lib/psyche/portfolio.ts:385-392   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES (read side) · CONTRIBUTES (MAIA prompt) · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "SURFACED :442-447 — projectAtomSections() splits '# MEMBER-PLACED PORTFOLIO' from '# PRACTITIONER OBSERVATIONS'"; "⭐ The direction is practitioner → member … an observation is written into the member's memory and reaches MAIA's cognition about that member, in a labelled section." · "GUARDED PRACTITIONER_ATTRIBUTION_GUARD (:186)"; "WRITE REFUSED lib/psyche/portfolio.ts:386-392 — keepSource() throws for this source type." · ⛔ CRITICAL LIMIT, verbatim: "⛔ NO WRITER WAS LOCATED. … No live INSERT of a practitioner_observation atom exists at the subject." ⛔ the contribution path is established; whether any row exists to traverse it is UNKNOWN · "GOVERNANCE GATE — ⛔ NONE FOUND. The migration header (:5-9) asserts a 'Constitutional intent' … a migration comment is implementation evidence, not a ruled source"
P3-I-11 · relationship_spaces (invite_token · participant_member_id · status · consent_status · relationship_type · created_from) · ART created app/api/practitioner/practice-field/invite/route.ts:72-100; MAIA-facing app/api/sovereign/app/maia/list/route.ts:800-820   [EWLA]
  EXISTS [SYN-1] · PARTICIPATES · KNOWS · CONTRIBUTES (MAIA prompt) · DECIDES [SYN-2]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  INF-6 DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
  BASIS "MAIA's prompt for that member gains the practitioner's practice-field snapshot, gated on status='active' AND consent_status='accepted' and suppressed in Sanctuary (maia/list/route.ts:801,806)." · ⭐ "Member consent gesture: PRESENT and NAMED — relationship_spaces.consent_status, moved by the member's accept." · ⭐ THE ONE AUTHORIZATION-LANGUAGE CLAUSE IN SLICE 06, bounded by its own sentence: "WHAT THE CONSENT AUTHORIZES — practitioner material flowing toward MAIA/member. ⛔ It authorizes no practitioner read of member material, and none was found on this object." ⛔ A member act, ⛔ not a located governing source — the standing stays NONE LOCATED · ⚠️ "Its schema default was not read … UNKNOWN, not assumed."
P3-I-12 · app/api/_backend/** — facilitatorDashboard.routes.ts + {calendarIntegration,retreatSupport}Service.ts, keyed on facilitator_id · ART facilitatorDashboard.routes.ts:15,54,63
  EXISTS [SYN-1]   AUTH NONE LOCATED [SYN-1]   SCOPE OF GOVERNANCE — UNKNOWN
  BASIS "find app/api/_backend -name route.ts → no results; the directory is _-prefixed and contains no Next route module, so it is not routable by the App Router." · ⚠️ UNKNOWN carried: "its Dockerfiles and package.json mean it may be built and run as a separate service; whether any deployment does so is UNKNOWN." · "GOVERNANCE GATE — ⛔ NONE FOUND."

---

# EDGE LIST

⛔ **An edge exists only where a ladder slice's own quoted text establishes the relation.** ⛔ Two
well-evidenced nodes do not license an edge between them. ⛔ No unknown edge is drawn, dotted or
labelled *probable*. Declared reading rule, so it is subtractable: an edge is `SYN-1` where one
quote names **both** ends (a row id, a section label, or a tier name that is a row's own name), and
`SYN-2` where the relation is in a quote and the identification of an end rests on a file or
coordinate that **both** rows' ladder text carries.

```text
A-01 → A-02   SYN-1  "SYSTEM AUTHORITY — chooses the tier (§A-02) …"
A-06 → A-02   SYN-2  "…**returns before the tier switch** (`:3241`)" — precedence, not selection
A-09 → A-03 · A-04 · A-05   SYN-1  "`MAIA_RUNTIME_PROMPT.ts` reaches FAST via `maiaService.ts:1070` and CORE/DEEP-repair via `maiaVoice.ts:585`."
A-03 → A-16   SYN-2  "`fastPathResponse` → `generateText({ systemPrompt: baseSystemPrompt })` at `maiaService.ts:1560-1562`."
A-04 → A-16   SYN-2  "→ `generateText` at `maiaService.ts:1988`."
A-05 → A-16   SYN-2  "→ `generateText` at `maiaService.ts:2554`."
A-16 → G-01   SYN-2  slice 04 titles the row "(boundary to Domain G)"; both rows quote `lib/ai/modelService.ts` `generateText`. ⛔ NO claim that the two rows are one object — that is P1-05's
B-01 → A-03   SYN-2  "`maiaService.ts:1058` | **FAST** — `contextPrompt` | … + `recentThreadBlock`"
B-02 → A-03   SYN-2  "SURFACED WHERE route :709 formatForPrompt → … → `contextPrompt`. ⛔ FAST ONLY."
B-03 → A-03 · A-04 · A-05   SYN-2  "FAST maiaService.ts:1444 → :1507; CORE/DEEP-repair via maiaVoice.ts:427 ADDENDA_SPECS; DEEP-consultation maiaService.ts:2388."
B-04 → A-03 · A-04 · A-05   SYN-2  "FAST maiaService.ts:1423 → :1507; CORE/DEEP-repair via lib/sovereign/maiaVoice.ts:425 …; DEEP-consultation via maiaService.ts:2386."
B-05 → A-03 · A-04   SYN-2  "FAST maiaService.ts:1433 → :1507; CORE/DEEP-repair via maiaVoice.ts:426."
B-06 → A-03   SYN-2  "→ maiaService.ts:1398 read → :1507 FAST template. ⛔ FAST ONLY."
B-07 → B-06   SYN-1  "loadRecentDevelopmentalMemories(userId, 3) and loadRecentThemeSignals(userId, 10), in parallel"; "**do** reach the FAST prompt inside the influence block."
B-07 → A-03   SYN-2  "Theme signals … **do** reach the FAST prompt inside the influence block."
B-10 → A-03 · A-04 · A-05   SYN-2  "All three tiers: … member web (B-10)" (⛔ NOT DEEP-consultation: "NOT named in S-5")
B-12 → A-03 · A-04   SYN-2  "FAST + CORE: relationship memory (B-12)"
B-13 → A-03 · A-04 · A-05   SYN-2  "All three tiers: … relational context bridge (B-13)"
B-14 → A-03 · A-04 · A-05   SYN-2  "All three tiers: … divination (B-14)"
B-17 → A-03 · A-04   SYN-2  "FAST + CORE: relationship memory (B-12), selflet (B-17)."
B-22 → B-02   SYN-1  "`MemoryGate.resolveMemoryMode` gates whether it runs, not what it selects." ⭐ the quote bounds its own scope
B-23 → B-09   SYN-1  "`MemoryWritebackService` is skipped (`route :1697`)"
B-23 → B-02   SYN-1  "`MemoryBundle` is skipped (`:541`)"
B-24 → A-13   SYN-3  Side B: "SURFACED WHERE app/api/oracle/conversation/route.ts:902 … :2787 … interpolated into the prompt template." Side A: "BLOCKED. The 410 is the first executable statement of `POST`." ⛔ Both stand
C-03 → E-06   SYN-2  C: "Its prompt renderer … emits **only** `element`/`phase`/`motion` (`encounterContext.ts:196-198`)" · E: "⭐ **renders it into the prompt**: `:196-198` `Spiral state: element=…`"
C-04 → A-01   SYN-2  "`salientThemes` is formatted into MAIA's prompt (`list/route.ts:916`)"
D-02 → D-01   SYN-1  "SURFACED WHERE Into D-OBJ-1's FieldContext.pfi { … } → prompt."
D-03 → D-01   SYN-1  "SURFACED WHERE FieldContext.resonance → \"[Field Intelligence]\" prompt JSON."
D-04 → D-01   SYN-1  "SURFACED WHERE FieldContext.unified → prompt JSON (D-OBJ-1:44-49)"
D-01 → A-03 · A-04   SYN-2  "paths (a) `maiaService.ts:1521 → :1534` FAST and (b) `:1946 → :1962` CORE"
D-34 → D-07   SYN-1  "`WISDOM_FIELD_MOVES` consumed at `maiaService.ts:1083,1091`"; "those lines are inside D-OBJ-7's Talk-Mode assembly" — containment observed; ⚠️ D-07's own surfacing is contested (X-DEF-1)
D-07 ↔ E-04   SYN-3  "⭐ X-DEF-1 — the same module, two opposite surfacing findings → P3-D-07 and P3-E-04" ⛔ not derived across, ⛔ neither side dropped
E-05 → E-06   SYN-1  E §4.2 "reader 1 — Living Field encounter/refine context", which "renders it into the prompt"
E-05 → E-08   SYN-1  E §4.2 "reader 3 — `GET /api/members/spiral-state`", which "returns `currentElement`, `phase`, `motion`, ⚠️ `relationalPhase`, ⚠️ `autonomyStreak`"
E-02 → A-04 · A-05   SYN-2  "a member-derived elemental label reaching MAIA's system prompt on every CORE and DEEP turn"
E-03 → A-04   SYN-2  "SURFACED WHERE ⭐ CORE only: maiaService.ts:1957 … :1962"
E-03 → D-01   SYN-2  both ladder texts carry `maiaService.ts:1962` and the block name "[Field Intelligence]" — E: "adaptivePrompt += \"\\n\\n[Field Intelligence]\\n{json}\"" · D: "(b) `:1946 → :1962` CORE"
F-10 → F-06   SYN-1  "its written readings are what F-06 later recalls"
F-06 → A-01   SYN-2  "A member's own durable I Ching readings are made available to the ordinary `/list` conversation."
F-14 → A-01   SYN-2  "injected into the prompt of the ordinary conversational route"; "⭐ This is the **live conversational route**"
F-28 → F-14   SYN-1  "computed inside maiaAstrologyContextService and carried in the same addendum at route.ts:732"
F-31 → F-14   SYN-1  "→ :732 astrologyAddendum = SYMBOLIC_LENS_BOUNDARY + '\\n\\n' + contextHeader + detail → :1419 passed into generation"
G-01 → G-02   SYN-1  "modelService.ts:83-85 → generateTextWithSovereignty(req, MAIA_INFERENCE_MODE, t0)."
G-01 → G-06   SYN-1  "an unrecognized value falls through every branch to the local Ollama call at :187."
G-01 → G-07   SYN-1  "CALL PATH | modelService.ts:127-151. Two independent triggers …"
G-01 → G-08   SYN-1  "CALL PATH | modelService.ts:94-123, gated by ENABLE_MULTI_ENGINE …"
G-02 → G-05   SYN-1  "Selected at sovereignRouter.ts:80,120"
G-02 → G-14   SYN-1  "CALL SITES | sovereignRouter.ts:105 (provider)"  ⚠️ the same quote names a second call site in another domain — see *Edges NOT drawn*
G-16 → G-17   SYN-1  "It also exports DEPLOY_LANE_TOKEN='deploy-lane' (:185) — the single mechanism that makes the Dockerfile tripwire (G-17) satisfiable."
G-16 → G-18   SYN-1  "ENTRY POINTS THAT TAKE IT | deploy-production.sh deploy (:452), update (:555), migrate (:640), rollback (:746)"
H-04 → H-05   SYN-2  "⭐ As implemented, everything above the seam is capture and admission … it hands a string across." — the N1–N12 exits are what sits above it
H-06 → H-10   SYN-1  "voice-mode saveConversationMemory(…) rides the same seam :6380-:6395" · H-10: ":6382 and :6428 (response, voice and chat)"
H-09 → H-07   SYN-1  "the eleven Class C `await maiaSpeak(` sites (of twelve; one is canonical)"
H-12 → H-07   SYN-2  "locally-authored text, spoken via a different TTS entry" — H-07's named object carries `handleSpeakMessage`
I-04 → I-01   SYN-1  "the row created is exactly the row read … by CAP-I-01's inline gate … This capability is upstream of CAP-I-01's only check."
I-04 → I-06   SYN-1  "the row created is exactly the row read by getCurrentPractitioner()"
I-08 → I-01   SYN-1  ⭐ ONE-DIRECTIONAL AND THE RECORD SAYS SO: ":350 names can_be_shown_to_practitioner as 'the existing flag that holds this line' — so the module knows about CAP-I-01's column, and CAP-I-01 does not know about the module."
I-10 → B-03   SYN-2  both rows' ladder text carries `member_memory_atoms` / `memoryAtomsLoader`; I: "an observation is written into the member's memory and reaches MAIA's cognition about that member, in a labelled section" (:442-447)
I-11 → A-01   SYN-2  "MAIA's prompt for that member gains the practitioner's practice-field snapshot … (maia/list/route.ts:801,806)"
```

**59 edges.** ⭐ Every one carries its quote. ⛔ No edge stands on endpoint quality.

---

## GOVERNED nodes, by scope

⭐⭐ **Eight nodes reach a located governing source. Not one of them has a scope that authorizes the
act it performs, and two of them authorize no participation position at all — what is governed
there is the SHAPE OF THE RECORD.** ⛔ That is a reading of where authorization text was found,
⛔ not a claim about any node's legitimacy.

```text
GOVERNED SHAPE — ⭐ the record's form is governed; ⛔ the act is not
  P3-C-01  developmental_readings — "what is governed is the SHAPE of the record — which keys may
           be written, that UPDATE is refused" · PARTICIPATION KNOWS · ⭐ "the strongest governance
           binding in domain C" and it authorizes no position
  P3-C-02  developmental_observation_standing_events — "the migration states the absence of an
           `actor` column makes a system write **UNSAYABLE, not UNWRITABLE**" · PARTICIPATION KNOWS
           ⭐⭐ the corpus's only NEGATIVE authority statement: "SYSTEM AUTHORITY — ⛔ none by design."
           ⛔ An absence is not a grant

GOVERNED · SCOPE OF GOVERNANCE — UNKNOWN as to the four labels
  P3-C-08  living_field_affinities — SPLIT. "`ECOLOGY_OF_MIRRORS.md` governs *inspectability*, not
           *selection weight*" · DECIDES carries NONE LOCATED ⭐⭐ the sharpest demonstration that
           the axes are orthogonal: a located source covering a DIFFERENT aspect of the same object
  P3-E-29  lib/spiralogic/registration/ — "the only Spiralogic artifact E found with ratified
           backing" · PARTICIPATION UNKNOWN ⭐ Amendment 3 §2's third coherent combination
  P3-F-14  maiaAstrologyContextService — Invariant 13 "names the wrapper as its operationalization";
           ⚠️ the wrapper is "a model-compliance instruction, ⛔ not a structural refusal"
  P3-F-28  mayanAstrology — "`SYMBOLIC_LENS_BOUNDARY` at route.ts:732"; "Invariant 13 names Mayan"
  P3-F-31  SYMBOLIC_LENS_BOUNDARY itself — named by Invariant 13 as its operationalization, AND
           "⛔ NONE FOUND governing the wrapper itself: no artifact states who may edit it or
           requires new symbolic paths to apply it." ⛔ Both carried, ⛔ neither resolved
  P3-H-05  await handleTextMessage — "the located source governs the REQUIREMENT of convergence";
           ⭐ the only GOVERNED node in slice 06, and ⚠️ per INF-2 the test enforcing it is not
           runtime governance

GOVERNING TEXT LOCATED · IMPLEMENTATION NONE FOUND — ⛔ a fourth value slice 05 wrote and this map
does not collapse. ⭐ The mirror image of EWLA: authority located without effect
  P3-F-34  Invariant 13 Tier-2 refusal — "the governing source exists; the implementation does not"
  P3-F-32  safe_for_retrieval — "HAS NO IMPLEMENTATION … **Verified at the census subject**"
  P3-F-27  Vedic — "MAIA_SOVEREIGNTY_INVARIANTS.md:245 names Vedic; no implementing binding located"
```

⛔ **`GOVERNED ACT` is written nowhere in this map.** No slice's quoted source said it.

---

## NONE LOCATED vs UNKNOWN — counted separately

```text
NONE LOCATED   the census LOOKED and did not find authority in the permitted evidence
               ⛔ it does NOT mean authority does not exist
UNKNOWN        even that search conclusion cannot be supported
```

⛔ The two are not merged in any count, and ⛔ neither is rendered as absence.

```text
AUTHORITY STANDING           A·B·C      D·E·F      G·H·I     nodes here
NONE LOCATED                    54         71*        42         167
GOVERNED                         2          4          1           7
SPLIT (two halves kept apart)    1  C-08     —         1  G-18      2
GOVERNING TEXT LOCATED /
  IMPLEMENTATION NONE FOUND      —          3          —           3
UNKNOWN                          5         33*         4          (4 emitted as nodes:
                                                                   B-23 · G-12 · H-07 · H-10)
```

⚠️ **Carried, ⛔ not reconciled**: slice 05's own summary block tallies `NONE LOCATED 46 · UNKNOWN
58`, while its 111 per-row `AUTHORITY` lines read `71 · 33` (marked \* above). This map is built
from the **rows**, which is what the nodes quote. ⛔ The discrepancy is recorded and left to P1-05;
⛔ no row's value was changed to make a column agree.

⭐ The governing-source void stays visible, as Amendment 2 §4b requires: of the 183 nodes, **167
carry `NONE LOCATED`** — and the four `UNKNOWN`-authority nodes emitted here are emitted *because*
they carry `CONTRIBUTES` or `DECIDES`, ⛔ not because the search concluded.

---

## Where INF-6 fired — the full inventory, as named rows

⛔ **Not reducible to a count** (Amendment 4 §3). Each row below carries, in its node block above,
the three recorded lines: *effect established · HAS AUTHORITY not established · INF-6 prevents
promotion*. ⛔ None is called unauthorized; ⛔ none is rated, ordered by importance, or recommended
for repair.

**A · B · C — 18 rows whose effect reaches an OUTCOME or the organism's OUTPUT**
```text
A-01  CONTRIBUTES·DECIDES  the canonical member turn, end to end
A-02  DECIDES              ⭐ which mind answers a given turn
A-03  CONTRIBUTES          FAST prompt assembly — one of four standing texts reaches it
A-04  CONTRIBUTES          CORE prompt assembly — ⚠️ two specs cited in-source, ⛔ NOT VERIFIED
A-05  CONTRIBUTES          DEEP — "DEEP-primary stage 1: NONE FOUND"
A-06  CONTRIBUTES·DECIDES  RCN returns before the tier switch — egress discipline only
A-07  CONTRIBUTES          Writers-Studio turn; witness exists in-repo, ⛔ not read in the slice
A-09  CONTRIBUTES          ⭐ "no guard, registry or refusal constrains a new file declaring 'You are MAIA'"
A-10  CONTRIBUTES·DECIDES  egress finalization — Canon v1.1 governs the HEADERS, not the constraints
A-11  CONTRIBUTES          /api/between/chat — "the wrapper's own contract … is not satisfied"
A-15  CONTRIBUTES          25 peripheral MAIA-claiming routes, as a class
A-16  CONTRIBUTES·DECIDES  provider dispatch — "THE GATEWAY CLAIM IS FALSE AT THE SUBJECT"
B-09  DECIDES              ⭐⭐ what rises to a formed memory — "with no traced governing rule"
B-21  CONTRIBUTES          memoryCanonGuard, prompt side; output side not established (OQ-4)
B-22  DECIDES              whether memory building runs — INF-3: selection authorizes nothing
B-23  DECIDES              Sanctuary contentWritable — AUTHORITY UNKNOWN (CLAUDE.md is evidence)
C-06  KNOWS·DECIDES        ⭐⭐ what a member may not see about themselves — "only as a code comment"
C-08  KNOWS·CONSIDERS·DECIDES  ⭐⭐ what enters MAIA's prompt, and in what order — SPLIT authority
```
⭐ Four are load-bearing because the record's own sentence carries the effect and the missing
located authorization in one breath: **A-02 · B-09 · C-06 · C-08**.

**D · E · F — 12 rows**
```text
D-06  DECIDES       ⭐⭐ "it DECIDES, and its text replaces MAIA's" — returned before a model
F-24  DECIDES       "decides whether a sacred passage meets the member"; "the system's own judgement is the gate"
F-07  PARTICIPATES  CONCLUDE "yes, and instructed to", PERSISTED at :159 with no author-class column
F-08  PARTICIPATES  the same prompt, practitioner-facing, persisted
D-01  CONTRIBUTES   the canonical field seam — "no governance gate of any kind"
D-02  CONTRIBUTES   FieldContext.pfi → prompt, via the ungated caller
D-03  CONTRIBUTES   FieldContext.resonance → prompt JSON
D-04  CONTRIBUTES   FieldContext.unified → prompt JSON
E-02  CONTRIBUTES   element into the system prompt every CORE and DEEP turn
E-03  CONTRIBUTES   element into [Field Intelligence] on CORE
E-06  CONTRIBUTES   persisted spiral state rendered into a prompt
F-06  CONTRIBUTES   three divination addenda into the live /list turn (⭐ gates TESTED; ⛔ a gate is not an authorization)
```
⭐⭐ **D-06 is the case the prohibition exists for, and the record itself failed it**: D §6 ans.4 wrote
*"(e) is the only object in Domain D at HAS AUTHORITY"* immediately after describing the effect,
while D §7 recorded that no ratified source was located. ⭐ F §3.3 is the opposite case, and shows
the discipline already existing inside a P1-02 record: *"authentication establishes `PARTICIPATES`,
not `HAS AUTHORITY`."*

**G · H · I — 32 rows**
```text
G-01  DECIDES               provider branching on the conversational path        NONE LOCATED (runtime)
G-02  DECIDES·CONTRIBUTES   degraded first-person MAIA turn                      NONE LOCATED
G-03  DECIDES               Claude model selection for a conversational turn     NONE LOCATED
G-04  DECIDES               hard refusal on the structured path                  NONE LOCATED (gate present)
G-06  CONTRIBUTES           answer-producing local/template fallback             NONE LOCATED
G-08  CONTRIBUTES           the text of a conversational TextResult              NONE LOCATED
G-10  DECIDES               57 grandfathered surfaces pinning their own models   NONE LOCATED (runtime)
G-12  DECIDES               commit/CI admission                                  UNKNOWN (named doc unread)
G-13  DECIDES               commit admission                                     NONE LOCATED
G-16  DECIDES               deploy-lane refusal                                  NONE LOCATED
G-17  DECIDES               out-of-lane build refusal; provenance blocks         NONE LOCATED
G-18  DECIDES               deploy abort; bulk migration application             SPLIT
H-01  DECIDES               which recognizer hears the member                    NONE LOCATED
H-02  DECIDES               auth/entitlement/quota admission of an utterance     NONE LOCATED
H-03  DECIDES               Web Speech refused on Desktop by shell class         NONE LOCATED
H-04  DECIDES               whether a spoken utterance becomes a member turn     NONE LOCATED
H-06  DECIDES               whether MAIA's turn reaches the member               NONE LOCATED
H-07  DECIDES               TTS provider on the branch that runs first           UNKNOWN (records disagree)
H-08  DECIDES               whether the microphone re-arms                       NONE LOCATED
H-09  CONTRIBUTES           eleven member-facing first-person utterances         NONE LOCATED
H-10  CONTRIBUTES           retention of member utterances                       UNKNOWN (records disagree)
H-12  CONTRIBUTES           locally-authored member-facing text (X1–X6)          NONE LOCATED
H-16  CONTRIBUTES           member transcript stored via POST /api/notes         NONE LOCATED
I-01  DECIDES               which member-authored threads a practitioner sees    NONE LOCATED
I-02  CONTRIBUTES           clinical transcript segments returned                NONE LOCATED
I-03  DECIDES               caseload disclosure on a query-string identity       NONE LOCATED
I-04  DECIDES               who becomes a practitioner                           NONE LOCATED
I-05  DECIDES               client message/digest/prep/report access             NONE LOCATED
I-06  DECIDES               Studio scoping by server-derived identity            NONE LOCATED
I-07  DECIDES               the three distinguishable outcomes of D-1…D-8        NONE LOCATED
I-10  DECIDES               which observation atoms load into MAIA's prompt      NONE LOCATED
I-11  DECIDES               practice-field injection into MAIA's prompt          NONE LOCATED
```
⭐ Recorded plainly, without ranking: **I-06 is the row the record calls "the best-behaved
practitioner surface in the tree" and it stands in this inventory beside the rest.**

**INF-6 also fired on rows that are NOT in the 62** — where the block prevented a promotion that
would have looked natural but reached no outcome or output. Named, ⛔ not counted away:
`A-08` (KNOWS, ⛔ not CONSIDERS/CONTRIBUTES) · `A-12` `A-13` (EXISTS; ⛔ nothing written from a
handler that "would serve a request", or from ~2600 lines of unreachable cognition) · `B-01` `B-02`
`B-03` `B-04` `B-05` `B-06` `B-07` `B-10` `B-12` `B-13` `B-14` (KNOWS/CONSIDERS, ⛔ CONTRIBUTES not
established, and ⛔ tier reach not widened) · `B-08` `B-11` `B-16` `B-17` `B-18` `B-19` `B-24`
`B-26` `B-27` `B-29` `B-30` `B-31` · `C-01` `C-02` `C-03` `C-04` `C-05` `C-07` `C-10` `C-11` `C-12`
`C-14` · `G-05` `G-06` `G-07` `G-08` `G-09` `G-14` `G-15` (positions expressly withheld on a named
sub-question) · `H-05` `H-11` · `I-02` `I-08` `I-09`.

---

## Edges NOT drawn

⭐ **This section is the evidence that the sparse rule was applied rather than merely stated.** Each
line is a relation that looked natural and has no quoted basis of the required kind.

```text
A-02 → A-03 · A-04 · A-05   the quote says only "select which cognition path a turn takes" — ⛔ it
                            names no tier. The tier mapping sits in the register's COVERAGE field,
                            which this pass may read for a path or status, ⛔ not as edge evidence
A-11 → A-10                 would require joining TWO quotes ("converges on `getMaiaResponse`" +
                            "`finalizeMemberFacingText` governs only the `getMaiaResponse` family").
                            ⛔ The relation must be in ONE quote
A-07 → A-16                 the generateText call for the Writers-Studio turn appears only in the
                            register's ARTIFACT field. ⛔ Not edge evidence
A-05 → A-04                 both quote `appendAllContextAddenda`, at DIFFERENT call sites
                            (`:972` / `:910`). ⛔ A shared function is not a relation between rows
B-01 → B-02                 both enter the same FAST `contextPrompt` at `:1058`. ⛔ Co-location is
                            not a relation
B-08 → B-03                 the only sentence linking them — "it rides the atoms addendum" — is
                            quoted INSIDE the slice's own refusal. ⛔ No relation is drawn from a
                            sentence whose purpose was to withhold one
B-16 ↔ C-03 · B-05 ↔ C-10 · B-07 ↔ C-09   same TABLE, different rows, "deliberately not merged" by
                            P1-03. ⛔ Sharing a table is not an edge
D-05 → D-06                 the slice calls one "the classifier" and the other "the enforcement
                            object"; ⛔ no quote traces the decision from one into the other
D-06 → a model call         "returned before the turn reaches a model" is a real precedence
                            relation — ⛔ but "a model" names no row. Recorded, ⛔ not drawn
D-09 → G-14                 G-14 quotes `lib/maia/fieldContextAdapter.ts:101,118,127` and calls it
                            "(field — a different domain)"; ⛔ D-09's ladder text does not carry
                            that file, so the identification rests on the register's ARTIFACT field
F-01 → F-07 · F-08          "used by F-07/F-08 via `getHexagram()`" appears only in the register's
                            ARTIFACT field. ⛔ Not edge evidence
F-30 → F-06 · F-02 → F-06   both quotes name F-06 — F-30: ":186 persistReading is one of the
                            writers behind the readings F-06 recalls"; F-02: "reaching a turn only
                            via F-06's copy-at-write-time" — ⛔ but both rows' AUTHORITY is UNKNOWN,
                            so neither is a node here and no edge is drawn to or from them
F-06 ↔ B-14                 ⭐ two rows in DIFFERENT slices quote the same route coordinate
                            (`:1105`) for divination recall. ⛔ Whether they name the same object is
                            not established by either slice — ⛔ not merged, ⛔ not drawn
I-07 → I-01                 I-07's channels are quoted at coordinates in the same page file as
                            I-01, but I-07's ladder text does not name the file. ⛔ Not drawn
H-01 → H-02 · H-03          the slice records selection of four transports, and separately records
                            Web Speech refused on Desktop; ⛔ no quote traces the selection into a
                            named transport row
H-05 → A-01 · A-03          "it hands a string across" — ⛔ the string's destination is not named as
                            a row anywhere in slice 06
G-01 → G-03                 G-03's PARTICIPATES quote is a provider table row
                            ("Anthropic | @anthropic-ai/sdk | claudeClient.ts:149"); ⛔ no call-path
                            quote reaches it from modelService
```

**Quoted negatives, recorded and ⛔ NOT drawn as edges** — a record stating that something does
**not** reach somewhere is preserved as a node fact, never as a negative edge:
`A-09` "DEEP-primary stage 1 reaches **none of them**" · `B-15` "SURFACED WHERE ⛔ NOWHERE" ·
`C-05` "does not read `member_relational_signals`" · `E-04` ":1198 `// Note: fieldAwareness
intentionally NOT appended`" · `E-07` "`formatMemberWebForPrompt` (`:436`) contains **no**
spiral/element/phase reference" · `G-03` "never reads an awareness level" · `G-14` "Nothing in this
path reaches a member surface" · `I-08` "CAP-I-01 does not know about the module."

---

```text
P1-04 · MAP 3 · AUTHORITY GRAPH · COMPLETE
183 nodes · 59 edges · 62 EFFECT-WITHOUT-LOCATED-AUTHORIZATION rows, each individually legible
AUTHORITY  NONE LOCATED 167 · GOVERNED 7 · SPLIT 2 · GOVERNING TEXT LOCATED/UNIMPLEMENTED 3 · UNKNOWN 4
GOVERNED with an explicit scope 2 (both GOVERNED SHAPE) · SCOPE OF GOVERNANCE UNKNOWN 181
18 relations declined for want of a quoted basis or an endpoint · 8 quoted negatives recorded, none drawn

⭐⭐ THE MAP'S ONE SENTENCE: governance of a thing is not necessarily authorization of what that
   thing does — and where this organism's authorization text was found, it governs the SHAPE of a
   record, the OPERATIONALIZATION of a wrapper, or the REQUIREMENT of a convergence.

⛔ NO SOURCE CODE · GOVERNING DOCUMENT · TEST · RUNTIME WITNESS READ   ⛔ NO CONTRADICTION ADJUDICATED
⛔ NO GOVERNED ACT INFERRED   ⛔ NO EDGE INTERPOLATED   ⛔ NO COUNT STANDING IN FOR NAMED ROWS
⛔ NO VERDICT OF LEGITIMACY AT ANY ALTITUDE   ⛔ THE SEPARATE AUTHORIZATION/EXPOSURE LANE IS NEITHER
   CITED, AWAITED NOR ANSWERED
P1-04 SHOWS THE TOPOLOGY. P1-05 DECIDES WHAT THE EVIDENCE PERMITS.
```
