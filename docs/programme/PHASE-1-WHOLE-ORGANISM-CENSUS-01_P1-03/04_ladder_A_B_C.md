# P1-03 · BOUNDED LADDER-DERIVATION PASS — DOMAINS A · B · C

```text
STEP        PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-03 · ladder pass
AUTHORIZED  Amendment 2 · Ruling 1 (founder, 2026-09-14)
REFINED BY  Amendment 3 (founder, 2026-09-14, relayed mid-flight) — BINDING on this return
TYPE        RECORD ONLY — restatement of what existing record prose already establishes
INPUT       01_normalized_A_B_C.md (62 rows) · P1-02 A_canonical_cognition.md ·
            P1-02 B_memory.md · P1-02 C_developmental_relational.md
OUTPUT      two orthogonal values per row: PARTICIPATION and AUTHORITY STANDING
BOUND BY    INF-1…INF-5 (unchanged) · INF-6 (Amendment 2 §2)
```

> ⛔ NO SOURCE CODE, GOVERNING DOCUMENT, TEST OR RUNTIME WITNESS WAS READ.
> ⛔ Nothing was derived across a disagreement. ⛔ AUTH-EXPOSURE-01 is neither cited nor awaited.
> ⭐ Silence → UNKNOWN. Ambiguity → UNKNOWN. A position with no quotable basis → UNKNOWN.

---

## 0 · The two axes, per Amendment 3 §2

```text
PARTICIPATION       EXISTS · PARTICIPATES · KNOWS · CONSIDERS · CONTRIBUTES · DECIDES · UNKNOWN
AUTHORITY STANDING  GOVERNED · NONE LOCATED · UNKNOWN
```

⛔ **`HAS AUTHORITY` has left the ladder.** It was never a rung. Authority is the second axis and
is read from authorization text or not at all. All combinations are coherent states — including
`PARTICIPATION UNKNOWN + AUTHORITY GOVERNED`, ⛔ which is not a hole to fill.

**AUTHORITY STANDING, as read in this pass:**

```text
GOVERNED       a located governing source that the record treats as binding THIS capability
NONE LOCATED   the record positively records no governing source located for it — OR names a
               source and, in its own words, denies that the source authorizes this capability
               (a witness · a header set · a CI instrument the record calls "not a governing
               document")
UNKNOWN        a source is named but the record could not verify it, or does not establish that
               it binds this capability
```

⚠️ **Declared deviation from the register's tally, so it is auditable:** the register records
`GOVERNING SOURCE NONE LOCATED` on **51 of 62**. This pass records **54** as `NONE LOCATED`,
because three of the eleven named sources are, by the records' own sentences, not authorization
text: `P3-A-08` (a witness that records its own witness as *not yet obtained*), `P3-A-10` (Canon
v1.1 **provenance headers**), `P3-A-13` (`refusal-19`, which the register itself calls *"a CI
instrument, not a governing document"*). ⛔ No row's governing-source cell was altered; only its
reading on the authority axis is stated here.

## 0a · The two discriminators, declared before use — ⛔ not invented here

The corpus contains exactly **two** rows where a P1-02 record itself assigned a position. Both
state the discriminator that separates it from its neighbour. This pass uses those two statements,
and nothing else, as the reading of the participation vocabulary.

```text
ANCHOR 1 · KNOWS vs CONSIDERS        B_memory.md §2.6 (row P3-B-15)
  "⭐ This is a `KNOWS ≠ CONSIDERS` case in its purest form. The system performs a resonance
   recall against its own lattice on qualifying turns, reports what it found to the log, and then
   lets the result fall out of scope."  — with "SURFACED WHERE ⛔ NOWHERE … The recalled object
   never enters `meta`, never enters a prompt, and never reaches a response."
  ⇒ a retrieval that runs is KNOWS.  ⇒ the named discriminator for CONSIDERS is PROMPT ENTRY.

ANCHOR 2 · CONTRIBUTES vs DECIDES    A_canonical_cognition.md §A-07 (row P3-A-07)
  "PRESERVED DISTINCTION — this is the only place where the canonical-turn renderer CONTRIBUTES
   to a member-facing answer. It still does not DECIDE the organism's shape."
  ⇒ machinery that assembles or produces member-facing MAIA text is CONTRIBUTES.
  ⇒ CONTRIBUTES does not carry DECIDES with it.
```

**Applied consequence, stated so it can be struck if the founder's vocabulary differs:** an
affirmatively traced retrieval → **KNOWS**; material affirmatively traced into a prompt →
**CONSIDERS**; assembly or generation of member-facing MAIA text → **CONTRIBUTES**; the record's
own decision language about an outcome (*selects · decides · refuses · determines · returns
before · withholds*) → **DECIDES**. Each entry carries its quote, so a reader who rejects the
reading can still audit the fact.

⛔ **EXISTS is assigned only where the record affirmatively establishes non-participation**
(DORMANT / ORPHANED / zero callers). A trivially-true EXISTS on every row would say nothing, and
⭐ the ladder is not monotonic.

⭐ **Per Amendment 3 §4a the INF-6 block is written into the row itself**, because a prohibition
obeyed silently leaves no evidence it was ever tested.

---

# DOMAIN A — CANONICAL COGNITION / MAIA

```text
ROW                 P3-A-01
NAMED OBJECT        Canonical member chat turn — POST /api/sovereign/app/maia/list
PARTICIPATION       CONTRIBUTES · DECIDES
BASIS QUOTE         CONTRIBUTES — "CAPABILITY — accept a member utterance over HTTP, assemble
                    context, produce a MAIA-claiming response, terminate to the member."
                    DECIDES — "SYSTEM AUTHORITY — chooses the tier (§A-02), chooses which addenda
                    exist, and may refuse the turn at the schema gate or provider gate."
SOURCE RECORD       A_canonical_cognition.md §A-01
AUTHORITY STANDING  NONE LOCATED — register: "GOVERNING SOURCE NONE LOCATED for the route as a
                    whole; Canon v1.1 provenance headers named at egress"
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-A-02
NAMED OBJECT        Processing-tier decision (FAST / CORE / DEEP) — chooseProcessingProfile
PARTICIPATION       DECIDES
BASIS QUOTE         "CAPABILITY — select which cognition path a turn takes." · "MAIA AUTHORITY —
                    none; the tier is decided before cognition."
SOURCE RECORD       A_canonical_cognition.md §A-02
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE GATE — NONE FOUND. No refusal-registry check, no
                    consent gate and no member-visible disclosure governs which mind answers a
                    given turn."
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
                    ⛔ CONTRIBUTES / CONSIDERS / KNOWS NOT written downward from DECIDES
```

```text
ROW                 P3-A-03
NAMED OBJECT        FAST tier prompt assembly and generation — fastPathResponse
PARTICIPATION       CONTRIBUTES
BASIS QUOTE         "CANONICAL CALL PATH — `fastPathResponse` → `generateText({ systemPrompt:
                    baseSystemPrompt })` at `maiaService.ts:1560-1562`."
SOURCE RECORD       A_canonical_cognition.md §A-03
AUTHORITY STANDING  NONE LOCATED — register: "GOVERNING SOURCE NONE LOCATED"; gate "PARTIAL, AND
                    DIVERGENT … FAST therefore receives one of the four standing texts and not
                    the other three."
INF-6               CONTRIBUTES established · DECIDES not established · HAS AUTHORITY not
                    established · INF-6 prevents promotion
```

```text
ROW                 P3-A-04
NAMED OBJECT        CORE tier prompt assembly and generation — corePathResponse / buildMaiaWisePrompt
PARTICIPATION       CONTRIBUTES
BASIS QUOTE         "CANONICAL CALL PATH — `corePathResponse` → `buildMaiaWisePrompt`
                    (`maiaVoice.ts:549`) → `appendAllContextAddenda` (`maiaVoice.ts:910`) →
                    `generateText` at `maiaService.ts:1988`."
SOURCE RECORD       A_canonical_cognition.md §A-04
AUTHORITY STANDING  NONE LOCATED — register: "NONE LOCATED for MAIA_SAFE_MODE".
                    ⚠️ Two specs are cited at `maiaVoice.ts:524-531` and are "⛔ NOT VERIFIED in
                    the source record"; ⛔ an unverified citation is not a located authorization.
INF-6               CONTRIBUTES established · DECIDES not established · HAS AUTHORITY not
                    established · INF-6 prevents promotion
```

```text
ROW                 P3-A-05
NAMED OBJECT        DEEP tier — two prompt regimes, one of them seamless (deepPathResponse)
PARTICIPATION       CONTRIBUTES
BASIS QUOTE         DEEP-primary stage 1 — "…raced against a 4500ms timeout …; the response is
                    taken verbatim at `:2346`."  DEEP-repair — "→ `appendAllContextAddenda`
                    (`maiaVoice.ts:972`) → `generateText` at `maiaService.ts:2554`."
SOURCE RECORD       A_canonical_cognition.md §A-05
AUTHORITY STANDING  NONE LOCATED — "DEEP-primary stage 1: **NONE FOUND**"; register "GOVERNING
                    SOURCE NONE LOCATED"
INF-6               CONTRIBUTES established · DECIDES not established · HAS AUTHORITY not
                    established · INF-6 prevents promotion
                    ⛔ The record's three statuses are carried, not collapsed into one.
```

```text
ROW                 P3-A-06
NAMED OBJECT        RCN early-return cognition — maiaRcnProcess
PARTICIPATION       CONTRIBUTES · DECIDES
BASIS QUOTE         CONTRIBUTES — "MAIA AUTHORITY — the returned text is corpus-derived, not
                    tier-generated; it never passes a MAIA system prompt or any of the four
                    standing texts."
                    DECIDES — "if `used && confidence >= 0.7 && completedNormally` → … →
                    **returns before the tier switch** (`:3241`)."
SOURCE RECORD       A_canonical_cognition.md §A-06
AUTHORITY STANDING  NONE LOCATED — gate is "egress discipline only"; register "NONE LOCATED"
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-A-07
NAMED OBJECT        Writers-Studio canonical turn — POST /api/writers-studio/focus
PARTICIPATION       CONTRIBUTES   ⛔ explicitly NOT DECIDES
BASIS QUOTE         "PRESERVED DISTINCTION — this is the only place where the canonical-turn
                    renderer CONTRIBUTES to a member-facing answer. It still does not DECIDE the
                    organism's shape."   (assigned by the source record itself)
SOURCE RECORD       A_canonical_cognition.md §A-07
AUTHORITY STANDING  NONE LOCATED — register: "GOVERNING SOURCE NONE LOCATED;
                    FOCUS-WITNESS-01_RESULT_2026-09-10.md exists in-repo but was NOT READ"
INF-6               CONTRIBUTES established · DECIDES REFUSED BY THE RECORD ITSELF · HAS AUTHORITY
                    not established · INF-6 prevents promotion
```

```text
ROW                 P3-A-08
NAMED OBJECT        CMT-01 canonical-turn shadow on /list
PARTICIPATION       KNOWS   ⛔ NOT CONTRIBUTES (excluded by the record)
BASIS QUOTE         "MEMBER-FACING EFFECT — none. The legacy turn is unaffected by construction."
                    — with ":1296 `constructCanonicalTurn` … :1326 `emitShadowDiff`". Anchor 1
                    shape: computed, reported, out of scope.
SOURCE RECORD       A_canonical_cognition.md §A-08
AUTHORITY STANDING  NONE LOCATED — the named source is the CMT-01 witness, which records "the live
                    `zeroDiff:true` witness is **NOT yet obtained**" and that the first shadow
                    deploy's "evidence is void". ⛔ A witness is not authorization text.
                    ⚠️ Gate is CI-only: "⚠️ INF-2: static/CI, not a request-time gate."
INF-6               KNOWS established · CONSIDERS / CONTRIBUTES not established · HAS AUTHORITY
                    not established · INF-6 prevents promotion
```

```text
ROW                 P3-A-09
NAMED OBJECT        MAIA identity / system prompt — source count (96 declaration sites)
PARTICIPATION       CONTRIBUTES
BASIS QUOTE         "`MAIA_RUNTIME_PROMPT.ts` reaches FAST via `maiaService.ts:1070` and
                    CORE/DEEP-repair via `maiaVoice.ts:585`. DEEP-primary stage 1 reaches **none
                    of them**."
                    ⚠️ Assigned for the ONE named source only; the other 95 sources' reach is NOT
                    DETERMINED and carries no position.
SOURCE RECORD       A_canonical_cognition.md §A-09
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE GATE — NONE FOUND for identity-source uniqueness.
                    No guard, registry, or refusal check constrains a new file from declaring
                    'You are MAIA' and shipping it to a model."
INF-6               CONTRIBUTES established · DECIDES not established · HAS AUTHORITY not
                    established · INF-6 prevents promotion
```

```text
ROW                 P3-A-10
NAMED OBJECT        Egress — member-facing finalization (finalizeMemberFacingText)
PARTICIPATION       CONTRIBUTES · DECIDES
BASIS QUOTE         DECIDES — "COMPUTED WHERE — `determineResponseMode(input)` (`:2670`) → if
                    `PRESENCE`, `enforcePresenceConstraints` (`:2672`) →
                    `enforceIdentityPredicateConstraint` (`:2681`)."
                    CONTRIBUTES — "`finalizeMemberFacingText` governs only the `getMaiaResponse`
                    family."
SOURCE RECORD       A_canonical_cognition.md §A-10
AUTHORITY STANDING  NONE LOCATED — the named source is "Canon v1.1 provenance headers", which
                    govern the headers, ⛔ not the egress constraints. Gate is "PARTIAL /
                    CI-GATED".
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-A-11
NAMED OBJECT        /api/between/chat — live-secondary lane
PARTICIPATION       CONTRIBUTES
BASIS QUOTE         §A-10: "Distinct member-facing terminations that produce MAIA-claiming text at
                    the subject: … `app/api/between/chat/route.ts` `POST` at `:776` (A-11)."
                    §A-11: "→ `lib/consciousness/maiaOrchestrator.ts:251` → **converges on
                    `getMaiaResponse`** at `maiaOrchestrator.ts:506`."
SOURCE RECORD       A_canonical_cognition.md §A-10, §A-11
AUTHORITY STANDING  NONE LOCATED — register: "NONE LOCATED; the wrapper's own contract
                    (`maiaRuntimeContext.ts:3-5`) is not satisfied on this path"
INF-6               CONTRIBUTES established · DECIDES not established · HAS AUTHORITY not
                    established · INF-6 prevents promotion
```

```text
ROW                 P3-A-12
NAMED OBJECT        /api/sovereign/app/maia — dormant predecessor
PARTICIPATION       EXISTS
BASIS QUOTE         "CURRENT STATUS — DORMANT … ⚠️ Dormant here means *unvisited*, not *closed* —
                    the handler would serve a request."
SOURCE RECORD       A_canonical_cognition.md §A-12
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE GATE — NONE FOUND. Dormancy is asserted by a source
                    comment and a registry entry, not enforced."
INF-6               EXISTS established · ⛔ no higher position written from the fact that the
                    handler "would serve a request" — a capacity is not a participation.
```

```text
ROW                 P3-A-13
NAMED OBJECT        /api/oracle/conversation — blocked lane
PARTICIPATION       EXISTS
BASIS QUOTE         "CURRENT STATUS — BLOCKED. The 410 is the first executable statement of
                    `POST`."
SOURCE RECORD       A_canonical_cognition.md §A-13
AUTHORITY STANDING  NONE LOCATED — the named source is "refusal-19 … (CI instrument, not a
                    governing document)", and "refusal-19:25 states explicitly that passing does
                    **not** authorize the writers themselves, which remain ungoverned (S5)."
INF-6               EXISTS established · ⛔ nothing written from the ~2600 lines of unreachable
                    cognition still in the tree.
```

```text
ROW                 P3-A-14
NAMED OBJECT        /api/voice/stream-conversation — the second mind, orphaned at the client
PARTICIPATION       EXISTS
BASIS QUOTE         "CONVERGENCE — ⛔ NONE." · "CURRENT STATUS — ORPHANED (route + hook exist;
                    declared consumer no longer invokes them) … it is unreached, not closed."
SOURCE RECORD       A_canonical_cognition.md §A-14
AUTHORITY STANDING  UNKNOWN — a governing doctrine IS located and verified present
                    (MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md + the exit map), and the
                    record simultaneously states "GOVERNANCE GATE — NONE FOUND for the route
                    itself; the only instruments are … a unit test over a CLIENT component".
                    ⛔ Whether the doctrine binds this route is not established.
INF-6               EXISTS established · ⛔ no participation written from the existence of a
                    complete second cognition stack.
```

```text
ROW                 P3-A-15
NAMED OBJECT        Peripheral MAIA-claiming routes with independent cognition (25, as a class)
PARTICIPATION       CONTRIBUTES
BASIS QUOTE         "CAPABILITY — produce member-facing text that claims to be MAIA, outside every
                    path above."
SOURCE RECORD       A_canonical_cognition.md §A-15
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE GATE — NONE FOUND as a class. No registry entry, no
                    `buildMaiaRuntimeContext`, no `ADDENDA_SPECS`, no four standing texts, no
                    `finalizeMemberFacingText`, no `assertProviderAvailable`. `middleware.ts`
                    matches them (tier / access), which governs **who may call**, never **what may
                    be said in MAIA's name**."
INF-6               CONTRIBUTES established for the CLASS · DECIDES not established · HAS AUTHORITY
                    not established · INF-6 prevents promotion
                    ⛔ INF-5: the class position is not written onto any individual route; their
                    individual statuses are NOT DETERMINED.
```

```text
ROW                 P3-A-16
NAMED OBJECT        Model / provider dispatch — generateText gateway (boundary to Domain G)
PARTICIPATION       CONTRIBUTES · DECIDES
BASIS QUOTE         CONTRIBUTES — "`lib/ai/modelService.ts:76` (`generateText`) — described
                    in-source as *'Main gateway for ALL text generation in MAIA'*".
                    DECIDES — "explicit throw *'SOVEREIGNTY VIOLATION: OpenAI is FORBIDDEN'*
                    (`:90`); `MAIA_INFERENCE_MODE` hands off to `lib/ai/sovereignRouter.ts:134`".
                    ⚠️ Carried: "THE GATEWAY CLAIM IS FALSE AT THE SUBJECT."
SOURCE RECORD       A_canonical_cognition.md §A-16
AUTHORITY STANDING  NONE LOCATED — register: "GOVERNING SOURCE NONE LOCATED"; gate "PARTIAL —
                    sovereignty refusal at the gateway, which at least four independent model
                    reaches do not pass"
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-A-17
NAMED OBJECT        Runtime governance instruments on the canonical lane (the set of eleven)
PARTICIPATION       UNKNOWN — NOT A PARTICIPATION QUESTION
BASIS QUOTE         Register: "STATUS NOT DETERMINED BY SOURCE RECORD — the record presents a
                    table of instruments with per-instrument notes and assigns no single status."
                    ⛔ A heterogeneous SET of gates, a registry, middleware and a CI suite does
                    not occupy a rung.
SOURCE RECORD       A_canonical_cognition.md §A-17; 01_normalized_A_B_C.md P3-A-17
AUTHORITY STANDING  NONE LOCATED — register: "NONE LOCATED as a set". ⚠️ "The refusal registry is
                    the largest governance artifact in this domain and it DOES NOT RUN AT REQUEST
                    TIME" (INF-2).
INF-6               ⛔ No position forced. ⭐ An instrument that governs is not thereby a
                    participant, and an instrument that does not run at request time is not
                    thereby a runtime gate.
```

---

# DOMAIN B — MEMORY / ANAMNESIS

```text
ROW                 P3-B-01
NAMED OBJECT        TurnsStore + meta.conversationHistory (session thread) — conversation_turns
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — §1: "B-01 | `TurnsStore` + `meta.conversationHistory` (session thread)
                    | `conversation_turns` | **UPDATED**".
                    CONSIDERS — §3 S-2: "`lib/sovereign/maiaService.ts:1058` | **FAST** —
                    `contextPrompt` | `memoryContext` (the `MemoryBundle`) + `recentThreadBlock`".
SOURCE RECORD       B_memory.md §1, §3
AUTHORITY STANDING  NONE LOCATED — register "NONE LOCATED"; gate PARTIAL (sanctuary at write
                    boundaries only)
INF-6               CONSIDERS established at FAST · ⛔ NOT written for CORE/DEEP · CONTRIBUTES not
                    established · INF-6 prevents promotion
```

```text
ROW                 P3-B-02
NAMED OBJECT        MemoryBundleService — the compressed cross-session bundle
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — "COMPUTED WHERE lib/memory/MemoryBundle.ts:112-117 — four parallel
                    retrievals: getRecentTurns … getSemanticMemories … getBreakthroughs …
                    getRelationshipData".
                    CONSIDERS — "SURFACED WHERE route :709 formatForPrompt → :1406
                    meta.memoryContext → lib/sovereign/maiaService.ts:925 read → :1058
                    interpolated into `contextPrompt`. ⛔ FAST ONLY."
SOURCE RECORD       B_memory.md §2.1
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE GATE NONE FOUND for bundle composition.
                    `MemoryGate.resolveMemoryMode` gates whether it runs, not what it selects."
INF-6               KNOWS + CONSIDERS established (FAST) · ⛔ "CORE and DEEP do not read
                    `meta.memoryContext` at all" — CONSIDERS NOT written there · HAS AUTHORITY not
                    established · INF-6 prevents promotion
```

```text
ROW                 P3-B-03
NAMED OBJECT        loadMemberMemoryAtomsForPrompt (memoryHealth key 'semantic') — member_memory_atoms
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — "COMPUTED/LOADED :278-291 — `FROM member_memory_atoms` with five
                    refusal predicates".
                    CONSIDERS — "SURFACED WHERE route :1006 atomsAddendum → meta :1424 → FAST
                    maiaService.ts:1444 → :1507; CORE/DEEP-repair via maiaVoice.ts:427
                    ADDENDA_SPECS; DEEP-consultation maiaService.ts:2388."
SOURCE RECORD       B_memory.md §2.5
AUTHORITY STANDING  NONE LOCATED — register: "NONE LOCATED for the predicate; runtime witness …
                    (SHA 57b0324fd ≠ subject; predicate has moved since)".
                    ⚠️ Gate is the strongest in the domain (`sacred_protected` absolute refusal at
                    the SQL boundary) and is still not a located authorization.
INF-6               KNOWS + CONSIDERS established · CONTRIBUTES not established · HAS AUTHORITY not
                    established · INF-6 prevents promotion
```

```text
ROW                 P3-B-04
NAMED OBJECT        loadPriorCrossSessionExchanges (conversational recall) — conversation_turns
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — "COMPUTED/LOADED lib/maia/memoryLoaders.ts:195
                    loadPriorCrossSessionExchanges (`FROM conversation_turns`, :209)".
                    CONSIDERS — "SURFACED WHERE route :1061 conversationalRecallAddendum → :1426
                    meta → FAST maiaService.ts:1423 → :1507 template; CORE/DEEP-repair via
                    lib/sovereign/maiaVoice.ts:425 …; DEEP-consultation via maiaService.ts:2386."
SOURCE RECORD       B_memory.md §2.3
AUTHORITY STANDING  NONE LOCATED — register "NONE LOCATED".
                    ⚠️ A member-writable consent column exists (`conversational_recall_enabled`,
                    PATCH route + UI); ⛔ a consent gate is a member instrument, not a located
                    governing source, and the record locates none.
INF-6               KNOWS + CONSIDERS established · HAS AUTHORITY not established · INF-6 prevents
                    promotion
```

```text
ROW                 P3-B-05
NAMED OBJECT        loadRecentMarkedEpisodes (episodic, member-marked) — episodic_memories
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — "LOADED WHERE lib/maia/memoryLoaders.ts:283 loadRecentMarkedEpisodes —
                    `FROM episodic_memories WHERE user_id=$1 AND marked_by_member = TRUE`".
                    CONSIDERS — "SURFACED WHERE route :1087 → meta :1427 → FAST
                    maiaService.ts:1433 → :1507; CORE/DEEP-repair via maiaVoice.ts:426."
SOURCE RECORD       B_memory.md §2.4
AUTHORITY STANDING  NONE LOCATED — register "NONE LOCATED". ⚠️ "The gate exists and is enforced on
                    read; the member cannot move it."
INF-6               KNOWS + CONSIDERS established · HAS AUTHORITY not established · INF-6 prevents
                    promotion
```

```text
ROW                 P3-B-06
NAMED OBJECT        loadRecentDevelopmentalMemories → buildMemoryInfluencePlan — developmental_memories
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — "LOADED WHERE route :945-948 — loadRecentDevelopmentalMemories(userId,
                    3) and loadRecentThemeSignals(userId, 10), in parallel".
                    CONSIDERS — "SURFACED WHERE route :991 memoryInfluenceAddendum → :1421 meta →
                    maiaService.ts:1398 read → :1507 FAST template. ⛔ FAST ONLY."
SOURCE RECORD       B_memory.md §2.2
AUTHORITY STANDING  NONE LOCATED — register "NONE LOCATED".
                    ⚠️ The behaviour is named in-code "a 'deliberate product decision, deferred by
                    founder ruling 2026-08-13'"; ⛔ that ruling was NOT located as a document, so
                    it is recorded as an in-code citation, never as a located authorization.
INF-6               KNOWS (every tier) + CONSIDERS (FAST only) established · ⛔ CONSIDERS NOT
                    written for CORE/DEEP against "CORE 72.8% / FAST 27.2%" · HAS AUTHORITY not
                    established · INF-6 prevents promotion
```

```text
ROW                 P3-B-07
NAMED OBJECT        loadRecentThemeSignals (pattern cue) — member_theme_signals
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         "Theme signals **are** loaded on the live route (`route :947`) and **do** reach
                    the FAST prompt inside the influence block."
SOURCE RECORD       B_memory.md §2.8
AUTHORITY STANDING  NONE LOCATED — register "NONE LOCATED"; "no per-layer consent gate"
INF-6               KNOWS + CONSIDERS established · HAS AUTHORITY not established · INF-6 prevents
                    promotion
                    ⚠️ Domain C reaches a different finding on the same TABLE (P3-C-09). ⛔ This
                    row restates domain B's own affirmative trace and is NOT a resolution of that
                    divergence; the two rows remain unmerged.
```

```text
ROW                 P3-B-08
NAMED OBJECT        is_breakthrough flag on atoms — member_memory_atoms
PARTICIPATION       UNKNOWN — AMBIGUOUS
BASIS QUOTE         The record establishes only an ordering key — "ORDER BY is_breakthrough DESC,
                    kept_at DESC" — and member mark/unmark routes. ⛔ It does not state whether
                    ordering determines what surfaces, and does not characterize the flag's own
                    participation.
SOURCE RECORD       B_memory.md §2.5, §7.1
AUTHORITY STANDING  NONE LOCATED — register: "GOVERNANCE GATE NOT DETERMINED BY SOURCE RECORD …
                    GOVERNING SOURCE NONE LOCATED"
INF-6               ⛔ No position written from "it rides the atoms addendum" — riding another
                    object's block is that object's participation, not this one's.
```

```text
ROW                 P3-B-09
NAMED OBJECT        MemoryWritebackService — writes developmental_memories · breakthrough_moments ·
                    conversation_insights
PARTICIPATION       DECIDES
BASIS QUOTE         ⭐⭐ "`NONE FOUND` — `MemoryWritebackService` formation threshold. What rises to
                    a `developmental_memory` or a `breakthrough_moment` is decided in
                    `lib/memory/MemoryWriteback.ts:603,:689,:732` with no traced governing rule."
SOURCE RECORD       B_memory.md §10.2
AUTHORITY STANDING  NONE LOCATED — the same sentence carries it: "with no traced governing rule."
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
                    ⭐ The cleanest case in domain B: effect and absence-of-located-authorization
                    in one sentence of the record.
```

```text
ROW                 P3-B-10
NAMED OBJECT        buildMemberLiveContext ("member web")
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — §1: "B-10 | `buildMemberLiveContext` ('member web') |
                    `member_spiral_state`·session summaries·`member_patterns`·journals·
                    `relationship_essences`·`member_theme_signals` | **SURFACED**".
                    CONSIDERS — §3: "All three tiers: … member web (B-10)"; S-3 lists
                    "member web `:422`".
SOURCE RECORD       B_memory.md §1, §3
AUTHORITY STANDING  NONE LOCATED — register "NONE LOCATED"; gate PARTIAL (sanctuary at route :750)
INF-6               KNOWS + CONSIDERS established · ⛔ NOT written for DEEP-consultation ("NOT named
                    in S-5") · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-B-11
NAMED OBJECT        RelationshipAnamnesisPostgres (essence) — relationship_essences
PARTICIPATION       UNKNOWN — SILENT
BASIS QUOTE         §1 gives a stop stage only: "B-11 | `RelationshipAnamnesisPostgres` (essence) |
                    `relationship_essences` | **UPDATED**", and the object is not named in §3's
                    by-tier list. ⛔ No retrieval and no prompt seam traced for this object itself.
SOURCE RECORD       B_memory.md §1
AUTHORITY STANDING  NONE LOCATED — register: "GOVERNANCE GATE NOT DETERMINED … GOVERNING SOURCE
                    NONE LOCATED"
INF-6               ⛔ No position imported from P3-B-10 merely because `relationship_essences` is
                    one of the member web's sources.
```

```text
ROW                 P3-B-12
NAMED OBJECT        RelationshipMemoryService (loadRelationshipMemory)
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — the named object is a loader (§1 row B-12, `loadRelationshipMemory`).
                    CONSIDERS — §3 S-4: "`lib/sovereign/maiaVoice.ts:888-892` | **CORE** |
                    `relationshipMemory` via `formatRelationshipMemoryForPrompt`"; §3 by-tier:
                    "FAST + CORE: relationship memory (B-12)".
SOURCE RECORD       B_memory.md §1, §3
AUTHORITY STANDING  NONE LOCATED — register: "GOVERNANCE GATE NOT DETERMINED … GOVERNING SOURCE
                    NONE LOCATED"
INF-6               KNOWS + CONSIDERS established (FAST + CORE) · ⛔ NOT written for DEEP · HAS
                    AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-B-13
NAMED OBJECT        Relational Context Bridge (getMemberActiveRelationalContext) — member_relationships
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — §1 row B-13, a loader gated at route :908.
                    CONSIDERS — §3 by-tier: "All three tiers: … relational context bridge (B-13)";
                    S-3 "relational context `:431`"; S-5 "relational context".
SOURCE RECORD       B_memory.md §1, §3
AUTHORITY STANDING  NONE LOCATED — register "NONE LOCATED"; gate PARTIAL (sanctuary)
INF-6               KNOWS + CONSIDERS established · HAS AUTHORITY not established · INF-6 prevents
                    promotion
```

```text
ROW                 P3-B-14
NAMED OBJECT        loadRecentIChingReadings (divination recall)
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — §1 row B-14, a loader gated at route :1105.
                    CONSIDERS — §3 by-tier: "All three tiers: … divination (B-14)"; S-3
                    "divination `:428-430`"; S-5 "three divination".
SOURCE RECORD       B_memory.md §1, §3
AUTHORITY STANDING  NONE LOCATED — register "NONE LOCATED"; gate PARTIAL (sanctuary)
INF-6               KNOWS + CONSIDERS established · HAS AUTHORITY not established · INF-6 prevents
                    promotion
```

```text
ROW                 P3-B-15
NAMED OBJECT        ConsciousnessMemoryLattice — resonance recall (and its separate write half)
PARTICIPATION       KNOWS   ⛔ explicitly NOT CONSIDERS
BASIS QUOTE         "⭐ This is a `KNOWS ≠ CONSIDERS` case in its purest form." — with "SURFACED
                    WHERE ⛔ NOWHERE … The recalled object never enters `meta`, never enters a
                    prompt, and never reaches a response."   (assigned by the source record itself)
SOURCE RECORD       B_memory.md §2.6
AUTHORITY STANDING  NONE LOCATED — register "NONE LOCATED"; "read: none — the recall runs and is
                    discarded regardless"
INF-6               KNOWS established · CONSIDERS REFUSED BY THE RECORD ITSELF · HAS AUTHORITY not
                    established · INF-6 prevents promotion
                    ⚠️ The write half's family reach is NOT DETERMINED and carries no position.
```

```text
ROW                 P3-B-16
NAMED OBJECT        spiralStatePersistence — member_spiral_state
PARTICIPATION       UNKNOWN — SILENT
BASIS QUOTE         §1 gives a stop stage only: "B-16 | `spiralStatePersistence` |
                    `member_spiral_state` | **UPDATED**"; the object is not in §3's by-tier list.
SOURCE RECORD       B_memory.md §1
AUTHORITY STANDING  NONE LOCATED — register: "GOVERNANCE GATE NOT DETERMINED … NONE LOCATED"
INF-6               ⛔ Domain C's three-loader trace for the same TABLE (P3-C-03) is NOT imported
                    onto this row. The two rows were deliberately not merged and are not merged
                    here.
```

```text
ROW                 P3-B-17
NAMED OBJECT        Selflet temporal message — selflet_messages · selflet_nodes
PARTICIPATION       CONSIDERS
BASIS QUOTE         §3 S-1 lists "`selfletPromptBlock`" among what passes through the FAST template
                    literal; §3 by-tier: "FAST + CORE: relationship memory (B-12), selflet (B-17)."
SOURCE RECORD       B_memory.md §3
AUTHORITY STANDING  NONE LOCATED — register: "GOVERNANCE GATE NOT DETERMINED … NONE LOCATED"
INF-6               ⭐ CONSIDERS established · KNOWS NOT established — no retrieval site is traced
                    for this object · INF-6 prevents the DOWNWARD inference. This row is the
                    clearest demonstration in the slice that the ladder is not a staircase.
```

```text
ROW                 P3-B-18
NAMED OBJECT        recordMemoryTransitions — memory_transition_records
PARTICIPATION       UNKNOWN — NOT A PARTICIPATION QUESTION
BASIS QUOTE         §1: "B-18 | `recordMemoryTransitions` | `memory_transition_records` |
                    **PERSISTED (observability)**"; register: "COVERAGE NOT APPLICABLE —
                    observability; no prompt seam."
SOURCE RECORD       B_memory.md §1; 01_normalized_A_B_C.md P3-B-18
AUTHORITY STANDING  NONE LOCATED — register: "NOT DETERMINED … NONE LOCATED". ⚠️ "No member
                    deletion path exists for this table (B §7.2)."
INF-6               ⛔ No position forced onto an observability writer.
```

```text
ROW                 P3-B-19
NAMED OBJECT        ConversationMemoryUsesStore (retrieval audit) — conversation_memory_uses
PARTICIPATION       UNKNOWN — NOT A PARTICIPATION QUESTION
BASIS QUOTE         §2.1: "Retrieval audit only: ConversationMemoryUsesStore.
                    recordRetrievedCandidates (:133)"; register: "COVERAGE NOT APPLICABLE —
                    observability; no prompt seam."
SOURCE RECORD       B_memory.md §1, §2.1
AUTHORITY STANDING  NONE LOCATED. ⚠️ "No member deletion path exists for this table (B §7.2)."
INF-6               ⛔ No position forced onto a retrieval audit.
```

```text
ROW                 P3-B-20
NAMED OBJECT        buildMemoryHealth / recordRuntimeTurn — runtime_events.memory_layers
PARTICIPATION       UNKNOWN — AMBIGUOUS
BASIS QUOTE         "SURFACED WHERE not a prompt block. Conditions the §VI fallback and the
                    degradation warning (route :1210-1214, isBaseChainDegraded)."
                    ⛔ *Conditions* is influence language the record does not characterize as a
                    decision, and the record affirmatively excludes a prompt seam.
SOURCE RECORD       B_memory.md §2.8
AUTHORITY STANDING  UNKNOWN — "canon citation only — `docs/canon/MAIA_MEMORY_CANON_v1.0.md §VII`,
                    cited at memoryHealth.ts:4. No runtime gate." Register: "cited, ⛔ content not
                    re-adjudicated by the source record."
INF-6               ⛔ Neither DECIDES nor CONSIDERS written. Assigning either would require
                    argument rather than a quote, so the answer is UNKNOWN.
                    ⭐ This is a coherent Amendment-3 state: participation UNKNOWN, a canon source
                    cited but unadjudicated.
```

```text
ROW                 P3-B-21
NAMED OBJECT        memoryCanonGuard (MEMORY_CANON_GUARD_PROMPT · FORBIDDEN_AMNESIA_PATTERNS ·
                    scrubMemoryAmnesia · containsForbiddenAmnesia)
PARTICIPATION       CONTRIBUTES  (prompt side only)
BASIS QUOTE         "SURFACED WHERE prompt side: lib/consciousness/MAIA_RUNTIME_PROMPT.ts:4,:137
                    (so it rides in on every tier that carries MAIA_RUNTIME_PROMPT) and
                    app/api/voice/stream-conversation/route.ts:1236."
SOURCE RECORD       B_memory.md §2.9
AUTHORITY STANDING  NONE LOCATED — register "NONE LOCATED"
INF-6               CONTRIBUTES established on the PROMPT side · ⛔ NOTHING established on the
                    OUTPUT side: "Whether the scrubbed text replaces the member-facing text on this
                    route was **not established** by this trace and is carried as an open question
                    (§9, OQ-4)." · HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-B-22
NAMED OBJECT        MemoryGate.resolveMemoryMode — env + allowlist
PARTICIPATION       DECIDES
BASIS QUOTE         Register P3-B-22: "a gate; determines whether memory building runs on the live
                    list route turn"; §2.1: "`MemoryGate.resolveMemoryMode` gates whether it runs,
                    not what it selects."
SOURCE RECORD       B_memory.md §2.1; 01_normalized_A_B_C.md P3-B-22
AUTHORITY STANDING  NONE LOCATED — register's own flag: "⚠️ INF-3: an env var or allowlist
                    selecting behaviour authorizes nothing"; "⛔ no governing rule located for the
                    mode vocabulary"
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
                    ⭐ Recorded rather than filed under "it is only a guard": a gate that determines
                    whether a capability runs is making a decision.
```

```text
ROW                 P3-B-23
NAMED OBJECT        TurnPosture / contentWritable (Sanctuary)
PARTICIPATION       DECIDES
BASIS QUOTE         §8 invariant 1: "`contentWritable` refuses at every traced content store;
                    `MemoryWritebackService` is skipped (`route :1697`); `MemoryBundle` is skipped
                    (`:541`)"; "⛔ The refusal is loud and fails closed (`turnPosture.ts:56`)."
SOURCE RECORD       B_memory.md §8
AUTHORITY STANDING  UNKNOWN — the named source is "the six documented Sanctuary invariants
                    (CLAUDE.md)", two of which the record says are not evaluable from domain B;
                    and domain C §8.4 records that under D-P1-06 `CLAUDE.md` is
                    "operational/session evidence, ⛔ not a governing source."
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
                    ⚠️ Carried: a `runtime_events` row IS still written for sanctuary turns with
                    twelve `memory_layers` statuses, de-identified.
```

```text
ROW                 P3-B-24
NAMED OBJECT        MemoryPalaceOrchestrator and its eight services
PARTICIPATION       UNKNOWN — RECORDS DISAGREE
BASIS QUOTE         Side B: "SURFACED WHERE app/api/oracle/conversation/route.ts:902
                    retrieveMemoryContext → :2787 `generateMemoryContextPrompt(memoryContext)`
                    interpolated into the prompt template."
                    Side A: "CURRENT STATUS — BLOCKED. The 410 is the first executable statement of
                    `POST`."  ⛔ NOT DERIVED ACROSS.
SOURCE RECORD       B_memory.md §2.7; A_canonical_cognition.md §A-13
AUTHORITY STANDING  NONE LOCATED — "NONE FOUND at the orchestrator — no sanctuary check, no
                    memory-mode check and no member consent gate appears in the file"
INF-6               ⛔ Even KNOWS is withheld: if the POST is refused at its first statement the
                    retrievals do not run either, so the disagreement reaches the whole row.
```

```text
ROW                 P3-B-25
NAMED OBJECT        lib/maia/recurrenceDetector.ts
PARTICIPATION       EXISTS
BASIS QUOTE         §4.1: "grep for `recurrenceDetector` across `app/` + `lib/` returns only the
                    file itself." Status DORMANT (zero callers).
SOURCE RECORD       B_memory.md §4.1
AUTHORITY STANDING  UNKNOWN — `memory/project_recurrence_prevention_architecture.md` is "cited at
                    maiaRuntimeContext.ts:22 in domain A and ⛔ NOT VERIFIED."
INF-6               EXISTS established · ⛔ nothing written from the fact that it reads
                    `member_theme_signals`.
                    ⭐ A coherent Amendment-3 state: participation EXISTS, authority UNKNOWN.
```

```text
ROW                 P3-B-26
NAMED OBJECT        lib/memory/confidenceDecay.ts (calculateDecayedConfidence ·
                    shouldPromptForConfirmation)
PARTICIPATION       EXISTS
BASIS QUOTE         §4.2: "`calculateDecayedConfidence` (TS) | imported at
                    `lib/memory/MemoryBundle.ts:16` and **never called** in that file";
                    "`shouldPromptForConfirmation` | `confidenceDecay.ts:199` — zero callers
                    repo-wide."
SOURCE RECORD       B_memory.md §4.2
AUTHORITY STANDING  NONE LOCATED — "P1-01 slice 03 records 'there is no single authoritative
                    definition of decay today'"
INF-6               EXISTS established · ⛔ the SQL function of the near-identical name is a
                    DIFFERENT object (P3-C-11) and its participation is NOT imported here.
```

```text
ROW                 P3-B-27
NAMED OBJECT        lib/anamnesis/* (AnamnesisField · DecentralizedMemory · MemoryCoreIndex ·
                    CollectiveConsciousnessBridge · UnifiedMemoryInterface)
PARTICIPATION       EXISTS
BASIS QUOTE         §4.1/§4.2: "zero importers anywhere outside `lib/anamnesis/`"; "sole importer
                    is `lib/integrated-oracle-system.ts`, which itself has **zero importers**";
                    "no traced route entry."
SOURCE RECORD       B_memory.md §4.1, §4.2
AUTHORITY STANDING  NONE LOCATED
INF-6               EXISTS established · ⛔ no position written from module names that describe
                    memory.
```

```text
ROW                 P3-B-28
NAMED OBJECT        lib/memory/MemoryManager.ts · lib/memory/VaultSymbolIndex.ts
PARTICIPATION       EXISTS
BASIS QUOTE         §4.1: "`lib/memory/MemoryManager.ts` | zero importers." /
                    "`lib/memory/VaultSymbolIndex.ts` | zero importers."
SOURCE RECORD       B_memory.md §4.1
AUTHORITY STANDING  NONE LOCATED
INF-6               EXISTS established.
```

```text
ROW                 P3-B-29
NAMED OBJECT        lib/memory/mem0.ts · lib/memory/beads-sync/
PARTICIPATION       EXISTS (beads-sync half) · UNKNOWN — AMBIGUOUS (mem0 half)
BASIS QUOTE         EXISTS — §4.1: "`lib/memory/beads-sync/` | referenced only by
                    `lib/maia/substrateMap.ts:254` as an inventory entry."
                    UNKNOWN — register: "NOT DETERMINED BY SOURCE RECORD for mem0 (reachable from
                    lib/semantic; no turn path traced)".
SOURCE RECORD       B_memory.md §4.1; 01_normalized_A_B_C.md P3-B-29
AUTHORITY STANDING  NONE LOCATED
INF-6               ⛔ The row is not split to make either half tidier, and mem0's "reachable from
                    lib/semantic" is not promoted to a participation.
```

```text
ROW                 P3-B-30
NAMED OBJECT        memory_contracts table
PARTICIPATION       UNKNOWN — NOT A PARTICIPATION QUESTION
BASIS QUOTE         §4.3: "`memory_contracts` (read only by `lib/trust/service.ts`)"; register:
                    "not reached by any traced turn path in this domain."
SOURCE RECORD       B_memory.md §4.3
AUTHORITY STANDING  NONE LOCATED
INF-6               ⛔ No position forced onto a declared table.
```

```text
ROW                 P3-B-31
NAMED OBJECT        case_memories · case_memory_chunks · memory_links · vault_symbols ·
                    vault_query_patterns (declared tables)
PARTICIPATION       UNKNOWN — NOT A PARTICIPATION QUESTION
BASIS QUOTE         §4.3: "⛔ **A table's existence in a migration is recorded here as a
                    declaration and nothing more.** No claim is made that any of these are empty,
                    unused in production, or safe to remove."
SOURCE RECORD       B_memory.md §4.3
AUTHORITY STANDING  NONE LOCATED
INF-6               ⛔ No position forced onto declared tables.
```

---

# DOMAIN C — DEVELOPMENTAL + RELATIONAL MEMORY

```text
ROW                 P3-C-01
NAMED OBJECT        developmental_readings — frozen developmental reading (WS2-07)  [Band I]
PARTICIPATION       KNOWS
BASIS QUOTE         "LOADED WHERE store.ts:120 (loadReading, member-scoped) · store.ts:136
                    (listReadings) · lib/manuscript/ask/frozenDevelopmentalReading.ts:80".
                    ⛔ CONSIDERS not established — register: "⛔ no MAIA-cognition prompt seam
                    traced".
SOURCE RECORD       C_developmental_relational.md §3 · C-1
AUTHORITY STANDING  ⭐ GOVERNED — "GOVERNANCE GATE — PRESENT AND ENFORCED IN SCHEMA.
                    `docs/programme/WS2-07-DECIDE_DEVELOPMENTAL_READING_OBJECT.md` cited
                    in-migration; INV-0/1/2/3/4/22/25 named … **This is the strongest governance
                    binding in domain C.**"
                    ⚠️ PRECISE SCOPE: what is governed is the SHAPE of the record — which keys may
                    be written, that UPDATE is refused. ⛔ Governing the form of a thing is not
                    authorizing a participation position, and none is claimed.
INF-6               KNOWS established · CONTRIBUTES not established (the member-facing surface is a
                    read-back of a stored record, which the record does not characterize as a
                    member-facing answer) · INF-6 prevents promotion
```

```text
ROW                 P3-C-02
NAMED OBJECT        developmental_observation_standing_events — member standing (BUILD-07F) [Band I]
PARTICIPATION       KNOWS
BASIS QUOTE         "LOADED WHERE store.ts:74 · store.ts:87 · store.ts:163".
SOURCE RECORD       C_developmental_relational.md §3 · C-2
AUTHORITY STANDING  ⭐ GOVERNED — "GOVERNANCE GATE — PRESENT. `WS2-07-BUILD-07F_DESIGN_2026-09-05.md`
                    named as design of record; D3/D6/D7 cited in-schema."
                    ⭐⭐ And the corpus's only NEGATIVE authority statement, recorded rather than
                    converted: "SYSTEM AUTHORITY — ⛔ none by design. The migration states the
                    absence of an `actor` column makes a system write **UNSAYABLE, not
                    UNWRITABLE**." ⛔ An absence is not a grant, and it is not read onto any other
                    row.
INF-6               KNOWS established · ⛔ nothing written from "the one unambiguously
                    MEMBER-AUTHORED developmental object" — member authorship is the member's
                    position, not this capability's.
```

```text
ROW                 P3-C-03
NAMED OBJECT        member_spiral_state (Bridge D)  [Band II]
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — "⚠️ THREE INDEPENDENT LOADERS: 1. app/api/oracle/conversation/
                    route.ts:1711 (guarded) 2. lib/maia/living-field/encounterContext.ts:126
                    (UNGUARDED) 3. lib/memory/MemberLiveContext.ts:390 (UNGUARDED)".
                    CONSIDERS — §5.1: "Its prompt renderer, however, emits **only**
                    `element`/`phase`/`motion` (`encounterContext.ts:196-198`)."
SOURCE RECORD       C_developmental_relational.md §3 · C-3, §5.1
AUTHORITY STANDING  NONE LOCATED — "⛔ **No governing source located for `member_spiral_state`** —
                    no migration-cited ruling, no canon reference."
                    ⚠️ The R16 header's two citations are "⛔ existence NOT VERIFIED".
INF-6               ⭐ KNOWS + CONSIDERS established, AND THE SPLIT IS THE FINDING: the
                    inferred-developmental class stays at KNOWS by the record's own words — "So
                    the inferred-developmental class is carried past the guard but was not observed
                    reaching the prompt at that renderer." ⛔ CONSIDERS is NOT extended to
                    `relational_phase` / `autonomy_streak` · HAS AUTHORITY not established ·
                    INF-6 prevents promotion
```

```text
ROW                 P3-C-04
NAMED OBJECT        member_relationships + relationship_entries + relationship_field_state [Band III]
PARTICIPATION       KNOWS · CONSIDERS
BASIS QUOTE         KNOWS — "LOADED WHERE lib/relationships/relationshipContextService.ts:84 ·
                    :116 · :132".
                    CONSIDERS — §5.2: "⭐ `pattern_hint` — MAIA-generated — is promoted into
                    `salientThemes` (`relationshipContextService.ts:146-148`) and `salientThemes`
                    is formatted into MAIA's prompt (`list/route.ts:916`)."
SOURCE RECORD       C_developmental_relational.md §3 · C-4, §5.2
AUTHORITY STANDING  NONE LOCATED — register "NONE LOCATED". ⚠️ The gate is "PRESENT AND NARROW at
                    the surfacing site" (explicit member handoff, sanctuary); ⛔ a gate is not a
                    located governing source.
INF-6               KNOWS + CONSIDERS established · CONTRIBUTES not established · HAS AUTHORITY not
                    established · INF-6 prevents promotion
                    ⚠️ Carried: "**PROVENANCE COLUMN: NONE FOUND.** … A consumer reading
                    `pattern_hint` cannot tell from the row that it is inferred."
```

```text
ROW                 P3-C-05
NAMED OBJECT        member_relational_signals (system-detected relational state)  [Band III]
PARTICIPATION       KNOWS   ⛔ NOT CONSIDERS (excluded by a traced negative finding)
BASIS QUOTE         KNOWS — "LOADED WHERE relationshipSignalService.ts:313 · :340 · :393".
                    ⛔ CONSIDERS refused — "⭐ NEGATIVE FINDING, TRACED:
                    `relationshipContextService.ts` — the module that feeds MAIA's prompt — **does
                    not read `member_relational_signals`** … its only surfacing path found is the
                    founder review lane."
SOURCE RECORD       C_developmental_relational.md §3 · C-5
AUTHORITY STANDING  NONE LOCATED — "⛔ no consent model for inferred relational state about a
                    member's intimate relationships"; "no consent gate, no member notice and no
                    member visibility surface were located."
INF-6               KNOWS established · CONSIDERS REFUSED BY A TRACED NEGATIVE · HAS AUTHORITY not
                    established · INF-6 prevents promotion
                    ⭐ A second KNOWS ≠ CONSIDERS case, independent of P3-B-15 and found by a
                    different worker in a different domain.
```

```text
ROW                 P3-C-06
NAMED OBJECT        member_patterns (practitioner-scoped developmental judgement)  [Band IV]
PARTICIPATION       KNOWS · DECIDES
BASIS QUOTE         KNOWS — "LOADED WHERE lib/patterns/getMemberPatterns.ts:45
                    (getPatternsForClient — PRACTITIONER) … :57 (getMemberVisiblePatterns —
                    MEMBER)".
                    DECIDES — "⭐⭐ ASYMMETRIC VISIBILITY, IMPLEMENTED IN CODE … **A developmental
                    judgement about a member is deliberately withheld from that member while it is
                    `emerging`.**"
SOURCE RECORD       C_developmental_relational.md §3 · C-6, §9
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE GATE — NONE FOUND", and §9: "the
                    `emerging`-withholding rule at `getMemberPatterns.ts:55` exists **only as a
                    code comment**." ⚠️ The one document naming the table contradicts the code
                    (§8.1) — ⛔ both sides preserved, ⛔ neither read as authorization.
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
                    ⛔ The access gate is "a linkage check, not a consent record" and is not read
                    as an authorization.
```

```text
ROW                 P3-C-07
NAMED OBJECT        pattern_ledger (MAIA-detected patterns)  [Band IV]
PARTICIPATION       KNOWS
BASIS QUOTE         "LOADED WHERE lib/patterns/getMemberPatterns.ts (getMaiaDetectedPatterns)".
                    ⛔ CONSIDERS not established — register: "⛔ no MAIA-cognition prompt seam
                    traced".
SOURCE RECORD       C_developmental_relational.md §3 · C-7
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE GATE — NONE FOUND at the subject"; "⛔ no ruling
                    located governing `member_patterns` ↔ `pattern_ledger` sharing one
                    member-facing endpoint."
INF-6               KNOWS established · CONTRIBUTES not established (same reading as P3-C-01) ·
                    HAS AUTHORITY not established · INF-6 prevents promotion
```

```text
ROW                 P3-C-08
NAMED OBJECT        living_field_affinities (system-created affinity)  [Band V]
PARTICIPATION       KNOWS · CONSIDERS · DECIDES
BASIS QUOTE         KNOWS — "LOADED WHERE lib/maia/living-field/encounterContext.ts:110 ·
                    app/api/maia/living-field/route.ts:55 · …/gathering/route.ts:46".
                    CONSIDERS — "SURFACED WHERE gathering route (to the member) · encounter +
                    refine routes (into MAIA's prompt)".
                    DECIDES — ⭐⭐ §5.3: "**A system-computed score selects and orders which of the
                    member's own Keeps enter MAIA's prompt, with a hard `LIMIT 10`.** This is
                    *ranking* and *what MAIA says*, from a system-inferred judgement."
SOURCE RECORD       C_developmental_relational.md §3 · C-8, §5.3, §9
AUTHORITY STANDING  ⭐ SPLIT, AND THE SPLIT IS THE POINT —
                    GOVERNED for inspectability only: `docs/canon/ECOLOGY_OF_MIRRORS.md` is cited
                    in-route and the denominator + criterion are disclosed.
                    NONE LOCATED for the DECIDES effect: "⛔ **no gate was located governing the
                    scoring or the ranking itself**"; §9: "`ECOLOGY_OF_MIRRORS.md` governs
                    *inspectability*, not *selection weight*."
INF-6               DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
                    ⛔⛔ A located governing source that covers a DIFFERENT aspect of the same
                    object is not an authorization for this one. ⭐ This row is the sharpest
                    demonstration in the slice that the two axes are genuinely orthogonal.
                    ⚠️ Scope carried: "the member's OWN material, self-scoped by `member_id` …
                    ⛔ NOT member-to-member."
```

```text
ROW                 P3-C-09
NAMED OBJECT        member_theme_signals (participatory reality themes)  [Band V]
PARTICIPATION       UNKNOWN — RECORDS DISAGREE
BASIS QUOTE         Side C: "CURRENT STATUS — `WIRED-BUT-UNOBSERVED` (write path only; no
                    member-facing read located)."
                    Side B: "Theme signals **are** loaded on the live route (`route :947`) and
                    **do** reach the FAST prompt inside the influence block."
                    ⛔ NOT DERIVED ACROSS.
SOURCE RECORD       C_developmental_relational.md §3 · C-9; B_memory.md §2.8
AUTHORITY STANDING  ⚠️ A REFUSAL IS LOCATED, AND IT IS NOT AN AUTHORIZATION —
                    "⭐⭐ GOVERNANCE GATE — PRESENT, AND IT IS A REFUSAL … 'System-inferred member
                    themes (`member_theme_signals`) are SUSPENDED from the … Do not reintroduce
                    … without a ratified collective …'"
                    Recorded as NONE LOCATED, because the register states "the refusal is in-code,
                    naming a ratification that has not occurred."
INF-6               ⛔ No position derived. ⭐ A located refusal withholding a capability from one
                    surface does not establish where that capability sits on another.
```

```text
ROW                 P3-C-10
NAMED OBJECT        episodic_memories  [Band VI]
PARTICIPATION       KNOWS
BASIS QUOTE         "LOADED WHERE EpisodicMemoryService.ts:103 · :127 · :151 · :202".
                    ⛔ CONSIDERS not established BY THIS RECORD — "⚠️ Band overlap with domain B.
                    Retrieval/decay of this material runs through `lib/memory/MemoryBundle.ts` —
                    **noted and not re-censused**."
SOURCE RECORD       C_developmental_relational.md §3 · C-10
AUTHORITY STANDING  NONE LOCATED — "(no ruling document binding the table)". ⚠️ The record calls
                    the marking route's consent reasoning "the strongest … found on a memory write
                    in this domain"; ⛔ strong reasoning in code is not a located governing source.
INF-6               KNOWS established · ⛔ P3-B-05's prompt seam for the same table is NOT imported
                    onto this row; the two rows were deliberately not merged.
```

```text
ROW                 P3-C-11
NAMED OBJECT        Confidence decay — TS calculateDecayedConfidence + SQL calculate_decayed_confidence
PARTICIPATION       UNKNOWN — AMBIGUOUS
BASIS QUOTE         "BOTH ARE CALLED, AND ONE MODULE CALLS BOTH"; register: "STATUS NOT DETERMINED
                    BY SOURCE RECORD — the record assigns no single status to the pair."
                    ⛔ No participation position is characterized for either implementation.
SOURCE RECORD       C_developmental_relational.md §3 · C-11, §8.2
AUTHORITY STANDING  NONE LOCATED — "⛔ **No authoritative definition of decay**"; "and two
                    divergent implementations are both live."
INF-6               ⛔ No position written from the fact that the SQL function runs inside
                    P3-B-02's retrieval — participation of the caller is not participation of the
                    callee.
```

```text
ROW                 P3-C-12
NAMED OBJECT        trust_observations  [Band VII]
PARTICIPATION       EXISTS
BASIS QUOTE         "CALLERS ⛔ NONE FOUND"; "**The declared consumer does not exist**, and the
                    declared future use is exactly an inference→weighting path. **X-19-relevant as
                    a DECLARED INTENT, not as a live path**."
SOURCE RECORD       C_developmental_relational.md §3 · C-12, §5.4
AUTHORITY STANDING  NONE LOCATED — "GOVERNANCE GATE — NONE FOUND." · "PROVENANCE COLUMN: NONE
                    FOUND. MEMBER AUTHORITY: NONE FOUND."
INF-6               EXISTS established · ⛔⛔ the migration's own declared intent ("Feeds future
                    symbolic affinity weighting") is NOT promoted to DECIDES or CONTRIBUTES. A
                    declared future consumer is not a participation.
```

```text
ROW                 P3-C-13
NAMED OBJECT        lib/relationship/scope.ts — the four-scope relational architecture  [Band VII]
PARTICIPATION       EXISTS
BASIS QUOTE         "CALLERS ⛔ NONE FOUND outside lib/relationship/__tests__/scope.test.ts";
                    "⭐⭐ This is the most explicit relational-authority boundary in domain C and it
                    is unreachable."
SOURCE RECORD       C_developmental_relational.md §3 · C-13, §8.5
AUTHORITY STANDING  UNKNOWN — `docs/design/now-what/THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06.md`
                    is "cited in-file at :5-6; ⛔ existence NOT VERIFIED by the source record."
INF-6               EXISTS established · ⛔⛔ the strongest authority LANGUAGE in the domain is not
                    read as authority STANDING: "⛔ Being authored is not being wired."
                    ⭐ A coherent Amendment-3 state: participation EXISTS, authority UNKNOWN.
```

```text
ROW                 P3-C-14
NAMED OBJECT        lib/coachField/practitionerProjection.ts  [Band VII]
PARTICIPATION       EXISTS
BASIS QUOTE         "CALLERS ⛔ NONE FOUND"; "the module that reasons most carefully about what a
                    practitioner may know **is dormant**, while the live practitioner read (C-6)
                    gates on a linkage row."
SOURCE RECORD       C_developmental_relational.md §3 · C-14, §8.5
AUTHORITY STANDING  NONE LOCATED — register: "Reasoning stated in-file; ⛔ unreachable … GOVERNING
                    SOURCE NONE LOCATED"
INF-6               EXISTS established · ⛔ careful in-file reasoning about authority is not
                    authority standing.
```

---

## Counts — positions recovered, by position, and UNKNOWN total

```text
ROWS IN SLICE                       62   (A 17 · B 31 · C 14)
ROWS CARRYING ≥1 RECOVERED POSITION 50   (P3-B-29 counts here on its beads-sync half only)
ROWS FULLY UNKNOWN                  12

AXIS 1 · PARTICIPATION (a row may carry more than one; ⛔ no position implies another)
  EXISTS            11   A-12 A-13 A-14 · B-25 B-26 B-27 B-28 B-29(part) · C-12 C-13 C-14
  PARTICIPATES       0   ⭐ NO RECORD IN THIS SLICE USES OR ESTABLISHES THIS RUNG
  KNOWS             22   A-08 · B-01 B-02 B-03 B-04 B-05 B-06 B-07 B-10 B-12 B-13 B-14 B-15 ·
                         C-01 C-02 C-03 C-04 C-05 C-06 C-07 C-08 C-10
  CONSIDERS         15   B-01 B-02 B-03 B-04 B-05 B-06 B-07 B-10 B-12 B-13 B-14 B-17 ·
                         C-03 C-04 C-08
  CONTRIBUTES       12   A-01 A-03 A-04 A-05 A-06 A-07 A-09 A-10 A-11 A-15 A-16 · B-21
  DECIDES           10   A-01 A-02 A-06 A-10 A-16 · B-09 B-22 B-23 · C-06 C-08
  UNKNOWN           12   (reasons below)

AXIS 2 · AUTHORITY STANDING (all 62 rows carry a value)
  GOVERNED           2   C-01 · C-02   — and in both, what is governed is the SHAPE of the record
  SPLIT              1   C-08          — GOVERNED for inspectability · NONE LOCATED for the ranking
  UNKNOWN            5   A-14 · B-20 · B-23 · B-25 · C-13   (cited-unverified, or a source whose
                         binding on this capability is not established)
  NONE LOCATED      54

PRIOR STATE (01_normalized_A_B_C.md): ladder established on 2 of 62.
THIS PASS: 50 of 62 on the participation axis; both prior assignments preserved verbatim.

UNKNOWN, BY REASON (12 rows)
  SILENT                        2   B-11 · B-16
  AMBIGUOUS                     3   B-08 · B-20 · C-11        (+ B-29's mem0 half)
  RECORDS DISAGREE              2   B-24 · C-09
  NOT A PARTICIPATION QUESTION  5   A-17 · B-18 · B-19 · B-30 · B-31
```

⭐ **Three shapes in these counts are findings in themselves.**
**(1) `PARTICIPATES` is empty.** No record in A, B or C uses that rung or establishes a fact this
pass could read as it. ⛔ Recorded as a gap in the corpus, not as a claim that nothing participates.
**(2) The positions partition along the domain boundary** — `CONTRIBUTES` is domain A plus one B
row; `KNOWS`/`CONSIDERS` is domains B and C. ⚠️ That may say more about what each P1-02 worker was
asked to trace than about the organism. ⛔ Not adjudicated.
**(3) The two axes do not correlate.** The two `GOVERNED` rows sit at `KNOWS`; every `DECIDES` row
sits at `NONE LOCATED` or `UNKNOWN`. ⭐ ⛔ That is an observation about where authorization text was
found, ⛔ not a claim that the DECIDES rows are unauthorized.

---

## Rows where the records DISAGREE (both sides quoted; all assigned UNKNOWN)

### D-1 · `P3-B-24` — MemoryPalaceOrchestrator and its eight services

```text
SIDE B (B_memory.md §2.7)
  "SURFACED WHERE app/api/oracle/conversation/route.ts:902 retrieveMemoryContext → :2787
   `memoryPalaceOrchestrator.generateMemoryContextPrompt(memoryContext)` interpolated into the
   prompt template; :1499 storeConversationMemory."
  and: "Whether that route serves member traffic is `UNKNOWN` in this container."

SIDE A (A_canonical_cognition.md §A-13)
  "CURRENT STATUS — BLOCKED. The 410 is the first executable statement of `POST`."
  and refusal-19 "additionally asserts the body is never read".
```
⛔ If the POST is refused at its first statement, neither the retrievals nor the prompt seam runs;
if the seam runs, the route is reached. **Both stand. No position derived — not even KNOWS.**
(Register X-3; B OQ-2.)

### D-2 · `P3-C-09` — `member_theme_signals`

```text
SIDE B (B_memory.md §2.8)
  "Theme signals **are** loaded on the live route (`route :947`) and **do** reach the FAST prompt
   inside the influence block."

SIDE C (C_developmental_relational.md §3 · C-9)
  "CURRENT STATUS — `WIRED-BUT-UNOBSERVED` (write path only; no member-facing read located)."
  plus the located refusal suspending it from the collective surface.
```
⛔ **Both stand.** `P3-C-09` is UNKNOWN. ⚠️ `P3-B-07` keeps its own record's affirmative trace
(KNOWS · CONSIDERS) because that is domain B's finding restated — ⛔ **not** a resolution of the
divergence. The two rows were deliberately not merged by P1-03 and are not merged here.
(Register X-1.)

⚠️ **Divergences that do NOT block a position, recorded so they are not lost:** the contradictions
A-1…A-7, B-1…B-8 and C-1…C-5 carried by the register concern *what a mechanism does* or *which
comment is true*, not *where a capability sits*. Each affected row carries its side verbatim in its
BASIS QUOTE or its ⚠️ line.

---

## EFFECT-WITHOUT-LOCATED-AUTHORIZATION — the INF-6 inventory

> ⭐⭐ **Renamed per Amendment 3 §1.** ⛔ NOT *effect-without-authorization*. That name asserted a
> negative this census cannot prove.

```text
WHAT THIS INVENTORY ESTABLISHES, EXACTLY
  effect                    OBSERVED          (a quoted position on the participation axis)
  authorization located     NO
  authorization status      UNKNOWN / NONE LOCATED

WHAT IT DOES NOT ESTABLISH
  ⛔ PROVED UNAUTHORIZED.  DECIDES + gate NONE FOUND + no quoted authorization located
     ≠ unauthorized. ⛔ AUTH-EXPOSURE-01 is where some of these may become proved; this lane
     neither cites, awaits, nor pre-announces that verdict.
```

⭐⭐ **ALL 50 ROWS THAT RECOVERED A POSITION DID SO AS AN OBSERVED EFFECT. Two rows carry a located
governing source (and a third carries one covering a different aspect); ⛔ none of the three
establishes an authorization for the position it occupies.** That is a reading of the corpus, ⛔ not
a verdict on the organism.

**The sharp subset — the 18 rows whose effect reaches an OUTCOME or the organism's OUTPUT
(`DECIDES` and/or `CONTRIBUTES`), each carrying its recorded INF-6 block:**

```text
ROW    PARTICIPATION            AUTHORITY STANDING — and what the record actually says
A-01   CONTRIBUTES · DECIDES    NONE LOCATED — "NONE LOCATED for the route as a whole"
A-02   DECIDES                  NONE LOCATED — ⭐ "nothing consents to, discloses, or refuses which
                                mind answers a turn"
A-03   CONTRIBUTES              NONE LOCATED — one of four standing texts reaches FAST
A-04   CONTRIBUTES              NONE LOCATED — ⚠️ two specs cited in-source, ⛔ NOT VERIFIED
A-05   CONTRIBUTES              NONE LOCATED — DEEP-primary stage 1 gate NONE FOUND
A-06   CONTRIBUTES · DECIDES    NONE LOCATED — egress discipline only
A-07   CONTRIBUTES              NONE LOCATED — witness exists in-repo, ⛔ not read in the slice
A-09   CONTRIBUTES              NONE LOCATED — ⭐ "no guard, registry or refusal constrains a new
                                file declaring 'You are MAIA'"
A-10   CONTRIBUTES · DECIDES    NONE LOCATED — Canon v1.1 governs the HEADERS, not the constraints
A-11   CONTRIBUTES              NONE LOCATED — "the wrapper's own contract … is not satisfied"
A-15   CONTRIBUTES              NONE LOCATED — ⭐ middleware governs "who may call, never what may
                                be said in MAIA's name"
A-16   CONTRIBUTES · DECIDES    NONE LOCATED — "THE GATEWAY CLAIM IS FALSE AT THE SUBJECT"
B-09   DECIDES                  NONE LOCATED — ⭐⭐ "…is decided in MemoryWriteback.ts:603,:689,:732
                                with no traced governing rule."
B-21   CONTRIBUTES              NONE LOCATED — output side not established (OQ-4)
B-22   DECIDES                  NONE LOCATED — ⭐ INF-3: "an env var or allowlist selecting
                                behaviour authorizes nothing"
B-23   DECIDES                  UNKNOWN — the six Sanctuary invariants live in CLAUDE.md, which
                                D-P1-06 classes as evidence, ⛔ not a governing source
C-06   KNOWS · DECIDES          NONE LOCATED — ⭐⭐ the withholding rule "exists **only as a code
                                comment**"; the one doc naming the table contradicts the code
C-08   KNOWS·CONSIDERS·DECIDES  SPLIT — ⭐⭐ GOVERNED for inspectability, NONE LOCATED for the
                                ranking: "governs *inspectability*, not *selection weight*"
```

**Every one of those 18 rows carries, in its entry above, the three recorded lines:**

```text
DECIDES established          (or CONTRIBUTES established, where that is the recovered position)
HAS AUTHORITY not established
INF-6 prevents promotion
```

⭐ **Four are load-bearing, because in each the record's own sentence carries the effect and the
absence of the located authorization in the same breath:** `A-02` (which mind answers a turn) ·
`B-09` (what rises to a formed memory) · `C-06` (what a member may not see about themselves) ·
`C-08` (what enters MAIA's prompt, and in what order).

⭐⭐ **`C-08` is the single most instructive row in the slice for P1-04:** a located canon source
covers *inspectability* while the ranking effect it sits beside has none. ⛔ A governing source that
covers a different aspect of the same object is not an authorization for this one — *which is only
visible because the axes were separated.*

⚠️ **Two rows reach `GOVERNED` and still appear nowhere in this inventory as authorized
participants:** `C-01` and `C-02`. What their design-of-record sources govern is **the shape of the
record** — which keys may be written, that UPDATE is refused, that a system write is unsayable.
⭐ *Governing the form of a thing is not authorizing the act of it.*

---

## Rows that are NOT A PARTICIPATION QUESTION

⛔ A position is not forced onto these. They are named so a later reader does not re-find them as
missing values.

```text
P3-A-17   Runtime governance instruments on the canonical lane (the set of eleven)
          A heterogeneous SET — gates, a registry, middleware, a CI suite. The register assigns
          it no single status. ⛔ A set does not occupy a rung.

P3-B-18   recordMemoryTransitions — memory_transition_records
          Observability writer. "PERSISTED (observability)"; "no prompt seam."

P3-B-19   ConversationMemoryUsesStore — conversation_memory_uses
          "Retrieval audit only." Observability; no prompt seam.

P3-B-30   memory_contracts (table)
          Declared table, "read only by lib/trust/service.ts — outside the memory path."

P3-B-31   case_memories · case_memory_chunks · memory_links · vault_symbols ·
          vault_query_patterns (declared tables)
          "⛔ A table's existence in a migration is recorded here as a declaration and nothing
          more." ⛔ No claim that any is empty, unused, or safe to remove.
```

⚠️ **Deliberately NOT placed here: `P3-B-22` (MemoryGate) and `P3-B-23` (Sanctuary TurnPosture).**
Both are gates, and both records use decision language about an outcome — *determines whether* and
*refuses*. ⭐ *A gate that refuses is making a decision; filing it under "just a guard" would hide
exactly the effect INF-6 exists to expose.* Both carry `DECIDES` on the participation axis and
neither reaches `GOVERNED` on the authority axis.

---

```text
P1-03 · BOUNDED LADDER-DERIVATION PASS · DOMAINS A · B · C · COMPLETE
62 rows · 50 recovered a participation position · 12 UNKNOWN · all 62 carry an authority value

PARTICIPATION  EXISTS 11 · PARTICIPATES 0 · KNOWS 22 · CONSIDERS 15 · CONTRIBUTES 12 · DECIDES 10
AUTHORITY      GOVERNED 2 · SPLIT 1 · UNKNOWN 5 · NONE LOCATED 54

⭐⭐ 18 rows establish an effect on an outcome or on the organism's output. NOT ONE of them has a
   located authorization for it. ⛔ That is EFFECT-WITHOUT-LOCATED-AUTHORIZATION — ⛔ never
   "proved unauthorized", which is AUTH-EXPOSURE-01's to establish and this lane's to leave alone.

⛔ NO SOURCE CODE READ · ⛔ NO POSITION INFERRED DOWNWARD · ⛔ NO AUTHORITY INFERRED FROM DECIDES
⛔ NO DISAGREEMENT DERIVED ACROSS · ⛔ NOTHING RESOLVED · ⛔ AUTH-EXPOSURE-01 NEITHER CITED NOR AWAITED
P1-03 RESTATES. IT DOES NOT DECIDE.
```
