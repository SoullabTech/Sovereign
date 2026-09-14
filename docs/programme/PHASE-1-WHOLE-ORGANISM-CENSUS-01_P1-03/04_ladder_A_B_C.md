# P1-03 · BOUNDED LADDER-DERIVATION PASS — DOMAINS A · B · C

```text
STEP        PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-03 · ladder pass
AUTHORIZED  Amendment 2 · Ruling 1 (founder, 2026-09-14)
TYPE        RECORD ONLY — restatement of what existing record prose already establishes
INPUT       01_normalized_A_B_C.md (62 rows) · P1-02 A_canonical_cognition.md ·
            P1-02 B_memory.md · P1-02 C_developmental_relational.md
OUTPUT      one ladder position set per row, or UNKNOWN
BOUND BY    INF-1…INF-5 (unchanged) · INF-6 (Amendment 2 §2)
```

> ⛔ NO SOURCE CODE, GOVERNING DOCUMENT, TEST OR RUNTIME WITNESS WAS READ.
> ⛔ Nothing was derived across a disagreement. ⛔ AUTH-EXPOSURE-01 is neither cited nor awaited.
> ⭐ Silence → UNKNOWN. Ambiguity → UNKNOWN. A position with no quotable basis → UNKNOWN.

---

## 0 · The two discriminators, declared before use — ⛔ not invented here

The corpus contains exactly **two** rows where a P1-02 record itself assigned a ladder position.
Both state the discriminator that separates the position from its neighbour. This pass uses those
two statements, and nothing else, as the reading of the ladder vocabulary.

```text
ANCHOR 1 · KNOWS  vs  CONSIDERS        B_memory.md §2.6 (row P3-B-15)
  "⭐ This is a `KNOWS ≠ CONSIDERS` case in its purest form. The system performs a resonance
   recall against its own lattice on qualifying turns, reports what it found to the log, and
   then lets the result fall out of scope."
   — with SURFACED WHERE: "⛔ NOWHERE … The recalled object never enters `meta`, never enters a
   prompt, and never reaches a response."
  ⇒ a retrieval that runs is KNOWS.  ⇒ the named discriminator for CONSIDERS is PROMPT ENTRY.

ANCHOR 2 · CONTRIBUTES  vs  DECIDES    A_canonical_cognition.md §A-07 (row P3-A-07)
  "PRESERVED DISTINCTION — this is the only place where the canonical-turn renderer
   CONTRIBUTES to a member-facing answer. It still does not DECIDE the organism's shape."
  ⇒ machinery that assembles/produces member-facing MAIA text is CONTRIBUTES.
  ⇒ CONTRIBUTES does not carry DECIDES with it.
```

**Applied consequence, stated so it can be struck if the founder's vocabulary differs:** where a
record affirmatively traces a retrieval, **KNOWS**; where it affirmatively traces that material
into a prompt, **CONSIDERS**; where it traces assembly or generation of member-facing MAIA text,
**CONTRIBUTES**; where its own prose uses decision language about an outcome (*selects · decides ·
refuses · determines · returns before · withholds*), **DECIDES**. Each entry below carries the
quote, so a reader who rejects the reading can still audit the fact.

⛔ **EXISTS is assigned only where the record affirmatively establishes non-participation**
(DORMANT / ORPHANED / zero callers). It is not written on rows that carry a higher position,
because ⭐ **the ladder is not monotonic (INF-6)** and a trivially-true EXISTS on every row would
say nothing.

⛔⛔ **HAS AUTHORITY is assigned NOWHERE in this pass.** Not one of the 62 rows carries record text
establishing an authorization. See §INF-6 section.

---

# DOMAIN A — CANONICAL COGNITION / MAIA

```text
ROW ID        P3-A-01
NAMED OBJECT  Canonical member chat turn — POST /api/sovereign/app/maia/list
LADDER        CONTRIBUTES · DECIDES
BASIS         CONTRIBUTES — A §A-01: "CAPABILITY — accept a member utterance over HTTP, assemble
              context, produce a MAIA-claiming response, terminate to the member."
              DECIDES — A §A-01: "SYSTEM AUTHORITY — chooses the tier (§A-02), chooses which
              addenda exist, and may refuse the turn at the schema gate or provider gate."
              ⛔ HAS AUTHORITY not established: register records "GOVERNING SOURCE NONE LOCATED
              for the route as a whole". [A_canonical_cognition.md §A-01]
```

```text
ROW ID        P3-A-02
NAMED OBJECT  Processing-tier decision (FAST / CORE / DEEP) — chooseProcessingProfile
LADDER        DECIDES
BASIS         A §A-02: "CAPABILITY — select which cognition path a turn takes." and
              "MAIA AUTHORITY — none; the tier is decided before cognition."
              ⛔ HAS AUTHORITY refused: same section, "GOVERNANCE GATE — NONE FOUND. No
              refusal-registry check, no consent gate and no member-visible disclosure governs
              which mind answers a given turn." [A_canonical_cognition.md §A-02]
```

```text
ROW ID        P3-A-03
NAMED OBJECT  FAST tier prompt assembly and generation — fastPathResponse
LADDER        CONTRIBUTES
BASIS         A §A-03: "CANONICAL CALL PATH — `fastPathResponse` → `generateText({ systemPrompt:
              baseSystemPrompt })` at `maiaService.ts:1560-1562`." (Anchor 2.)
              [A_canonical_cognition.md §A-03]
```

```text
ROW ID        P3-A-04
NAMED OBJECT  CORE tier prompt assembly and generation — corePathResponse / buildMaiaWisePrompt
LADDER        CONTRIBUTES
BASIS         A §A-04: "CANONICAL CALL PATH — `corePathResponse` → `buildMaiaWisePrompt`
              (`maiaVoice.ts:549`) → `appendAllContextAddenda` (`maiaVoice.ts:910`) →
              `generateText` at `maiaService.ts:1988`." [A_canonical_cognition.md §A-04]
```

```text
ROW ID        P3-A-05
NAMED OBJECT  DEEP tier — two prompt regimes, one of them seamless (deepPathResponse)
LADDER        CONTRIBUTES
BASIS         A §A-05, DEEP-primary stage 1: "…raced against a 4500ms timeout …; the response is
              taken verbatim at `:2346`."  DEEP-repair: "…→ `appendAllContextAddenda`
              (`maiaVoice.ts:972`) → `generateText` at `maiaService.ts:2554`."
              ⛔ Assigned to the row as a whole; the record's three statuses are not collapsed.
              [A_canonical_cognition.md §A-05]
```

```text
ROW ID        P3-A-06
NAMED OBJECT  RCN early-return cognition — maiaRcnProcess
LADDER        CONTRIBUTES · DECIDES
BASIS         CONTRIBUTES — A §A-06: "MAIA AUTHORITY — the returned text is corpus-derived, not
              tier-generated; it never passes a MAIA system prompt or any of the four standing
              texts."
              DECIDES — A §A-06: "if `used && confidence >= 0.7 && completedNormally` → … →
              **returns before the tier switch** (`:3241`)."
              [A_canonical_cognition.md §A-06]
```

```text
ROW ID        P3-A-07
NAMED OBJECT  Writers-Studio canonical turn — POST /api/writers-studio/focus
LADDER        CONTRIBUTES   ⛔ explicitly NOT DECIDES
BASIS         A §A-07: "PRESERVED DISTINCTION — this is the only place where the canonical-turn
              renderer CONTRIBUTES to a member-facing answer. It still does not DECIDE the
              organism's shape."  (Assigned by the source record itself; Anchor 2.)
              [A_canonical_cognition.md §A-07]
```

```text
ROW ID        P3-A-08
NAMED OBJECT  CMT-01 canonical-turn shadow on /list
LADDER        KNOWS   ⛔ NOT CONTRIBUTES (excluded by the record)
BASIS         A §A-08: "MEMBER-FACING EFFECT — none. The legacy turn is unaffected by
              construction." — the shadow constructs a canonical turn and emits a diff
              (":1296 constructCanonicalTurn … :1326 emitShadowDiff") whose result reaches no
              member-facing text. Anchor 1 shape: computed, reported, out of scope.
              [A_canonical_cognition.md §A-08]
```

```text
ROW ID        P3-A-09
NAMED OBJECT  MAIA identity / system prompt — source count (96 declaration sites)
LADDER        CONTRIBUTES
BASIS         A §A-09: "CANONICAL CALL PATH (the `/list` lane only) — `MAIA_RUNTIME_PROMPT.ts`
              reaches FAST via `maiaService.ts:1070` and CORE/DEEP-repair via `maiaVoice.ts:585`.
              DEEP-primary stage 1 reaches **none of them**."
              ⚠️ The other 95 sources: their reach is NOT DETERMINED; no position is assigned to
              them. ⛔ HAS AUTHORITY refused: "GOVERNANCE GATE — NONE FOUND for identity-source
              uniqueness." [A_canonical_cognition.md §A-09]
```

```text
ROW ID        P3-A-10
NAMED OBJECT  Egress — member-facing finalization (finalizeMemberFacingText)
LADDER        CONTRIBUTES · DECIDES
BASIS         DECIDES — A §A-10: "COMPUTED WHERE — `determineResponseMode(input)` (`:2670`) → if
              `PRESENCE`, `enforcePresenceConstraints` (`:2672`) → `enforceIdentityPredicate
              Constraint` (`:2681`)."
              CONTRIBUTES — A §A-10: "`finalizeMemberFacingText` governs only the
              `getMaiaResponse` family." (it acts on the member-facing text of that family)
              [A_canonical_cognition.md §A-10]
```

```text
ROW ID        P3-A-11
NAMED OBJECT  /api/between/chat — live-secondary lane
LADDER        CONTRIBUTES
BASIS         A §A-10: "Distinct member-facing terminations that produce MAIA-claiming text at the
              subject: … `app/api/between/chat/route.ts` `POST` at `:776` (A-11)."
              Convergence quoted at A §A-11: "→ `lib/consciousness/maiaOrchestrator.ts:251` →
              **converges on `getMaiaResponse`** at `maiaOrchestrator.ts:506`."
              [A_canonical_cognition.md §A-10, §A-11]
```

```text
ROW ID        P3-A-12
NAMED OBJECT  /api/sovereign/app/maia — dormant predecessor
LADDER        EXISTS
BASIS         A §A-12: "CURRENT STATUS — DORMANT … ⚠️ Dormant here means *unvisited*, not
              *closed* — the handler would serve a request."  ⛔ No participation traced.
              [A_canonical_cognition.md §A-12]
```

```text
ROW ID        P3-A-13
NAMED OBJECT  /api/oracle/conversation — blocked lane
LADDER        EXISTS
BASIS         A §A-13: "CURRENT STATUS — BLOCKED. The 410 is the first executable statement of
              `POST`."  ⛔ No participation reachable over HTTP at the subject.
              [A_canonical_cognition.md §A-13]
```

```text
ROW ID        P3-A-14
NAMED OBJECT  /api/voice/stream-conversation — the second mind, orphaned at the client
LADDER        EXISTS
BASIS         A §A-14: "CONVERGENCE — ⛔ NONE." and "CURRENT STATUS — ORPHANED (route + hook
              exist; declared consumer no longer invokes them) … it is unreached, not closed."
              [A_canonical_cognition.md §A-14]
```

```text
ROW ID        P3-A-15
NAMED OBJECT  Peripheral MAIA-claiming routes with independent cognition (25, as a class)
LADDER        CONTRIBUTES
BASIS         A §A-15: "CAPABILITY — produce member-facing text that claims to be MAIA, outside
              every path above."
              ⛔ HAS AUTHORITY refused, same section: "GOVERNANCE GATE — NONE FOUND as a class …
              `middleware.ts` matches them (tier / access), which governs **who may call**, never
              **what may be said in MAIA's name**." [A_canonical_cognition.md §A-15]
```

```text
ROW ID        P3-A-16
NAMED OBJECT  Model / provider dispatch — generateText gateway (boundary to Domain G)
LADDER        CONTRIBUTES · DECIDES
BASIS         CONTRIBUTES — A §A-16: "`lib/ai/modelService.ts:76` (`generateText`) — described
              in-source as *'Main gateway for ALL text generation in MAIA'*".
              DECIDES — A §A-16: "explicit throw *'SOVEREIGNTY VIOLATION: OpenAI is FORBIDDEN'*
              (`:90`); `MAIA_INFERENCE_MODE` hands off to `lib/ai/sovereignRouter.ts:134`".
              ⚠️ Carried with the row: "THE GATEWAY CLAIM IS FALSE AT THE SUBJECT" — four
              independent model reaches bypass it. [A_canonical_cognition.md §A-16]
```

```text
ROW ID        P3-A-17
NAMED OBJECT  Runtime governance instruments actually found on the canonical lane (the set of 11)
LADDER        UNKNOWN
BASIS         NOT A PARTICIPATION QUESTION — the row is a heterogeneous set of eleven governance
              instruments (gates, a registry, a CI suite, middleware), and the register itself
              records "STATUS — NOT DETERMINED BY SOURCE RECORD — the record presents a table of
              instruments with per-instrument notes and assigns no single status."
              ⛔ No single ladder position is forced onto a set. [01_normalized_A_B_C.md P3-A-17]
```

---

# DOMAIN B — MEMORY / ANAMNESIS

```text
ROW ID        P3-B-01
NAMED OBJECT  TurnsStore + meta.conversationHistory (session thread) — conversation_turns
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — B §1: "B-01 | `TurnsStore` + `meta.conversationHistory` (session thread) |
              `conversation_turns` | **UPDATED**" (the store reads and writes the thread).
              CONSIDERS — B §3, S-2: "`lib/sovereign/maiaService.ts:1058` | **FAST** —
              `contextPrompt` | `memoryContext` (the `MemoryBundle`) + `recentThreadBlock`".
              ⚠️ FAST only for `recentThreadBlock`; `meta.conversationHistory` tier reach is NOT
              DETERMINED. [B_memory.md §1, §3]
```

```text
ROW ID        P3-B-02
NAMED OBJECT  MemoryBundleService — the compressed cross-session bundle
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — B §2.1: "COMPUTED WHERE lib/memory/MemoryBundle.ts:112-117 — four parallel
              retrievals: getRecentTurns … getSemanticMemories … getBreakthroughs …
              getRelationshipData".
              CONSIDERS — B §2.1: "SURFACED WHERE route :709 formatForPrompt → :1406
              meta.memoryContext → lib/sovereign/maiaService.ts:925 read → :1058 interpolated
              into `contextPrompt`. ⛔ FAST ONLY."
              ⚠️ Carried: "CORE and DEEP do not read `meta.memoryContext` at all." [B_memory.md §2.1]
```

```text
ROW ID        P3-B-03
NAMED OBJECT  loadMemberMemoryAtomsForPrompt (memoryHealth key 'semantic') — member_memory_atoms
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — B §2.5: "COMPUTED/LOADED :278-291 — `FROM member_memory_atoms` with five
              refusal predicates".
              CONSIDERS — B §2.5: "SURFACED WHERE route :1006 atomsAddendum → meta :1424 → FAST
              maiaService.ts:1444 → :1507; CORE/DEEP-repair via maiaVoice.ts:427 ADDENDA_SPECS;
              DEEP-consultation maiaService.ts:2388." [B_memory.md §2.5]
```

```text
ROW ID        P3-B-04
NAMED OBJECT  loadPriorCrossSessionExchanges (conversational recall) — conversation_turns
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — B §2.3: "COMPUTED/LOADED lib/maia/memoryLoaders.ts:195
              loadPriorCrossSessionExchanges (`FROM conversation_turns`, :209)".
              CONSIDERS — B §2.3: "SURFACED WHERE route :1061 conversationalRecallAddendum →
              :1426 meta → FAST maiaService.ts:1423 → :1507 template; CORE/DEEP-repair via
              lib/sovereign/maiaVoice.ts:425 …; DEEP-consultation via maiaService.ts:2386."
              [B_memory.md §2.3]
```

```text
ROW ID        P3-B-05
NAMED OBJECT  loadRecentMarkedEpisodes (episodic, member-marked) — episodic_memories
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — B §2.4: "LOADED WHERE lib/maia/memoryLoaders.ts:283 loadRecentMarkedEpisodes
              — `FROM episodic_memories WHERE user_id=$1 AND marked_by_member = TRUE`".
              CONSIDERS — B §2.4: "SURFACED WHERE route :1087 → meta :1427 → FAST
              maiaService.ts:1433 → :1507; CORE/DEEP-repair via maiaVoice.ts:426 ADDENDA_SPECS."
              [B_memory.md §2.4]
```

```text
ROW ID        P3-B-06
NAMED OBJECT  loadRecentDevelopmentalMemories → buildMemoryInfluencePlan — developmental_memories
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — B §2.2: "LOADED WHERE route :945-948 — loadRecentDevelopmentalMemories
              (userId, 3) and loadRecentThemeSignals(userId, 10), in parallel".
              CONSIDERS — B §2.2: "SURFACED WHERE route :991 memoryInfluenceAddendum → :1421 meta
              → maiaService.ts:1398 read → :1507 FAST template. ⛔ FAST ONLY."
              ⚠️ Carried: "On a CORE or DEEP turn they cannot reach the prompt" against
              "CORE 72.8% / FAST 27.2%". [B_memory.md §2.2]
```

```text
ROW ID        P3-B-07
NAMED OBJECT  loadRecentThemeSignals (pattern cue) — member_theme_signals
LADDER        KNOWS · CONSIDERS
BASIS         B §2.8: "Theme signals **are** loaded on the live route (`route :947`) and **do**
              reach the FAST prompt inside the influence block."
              ⚠️ See RECORDS DISAGREE section — domain C carries the same table as P3-C-09 with a
              different finding; ⛔ the disagreement is about the C row, and this quote is domain
              B's own affirmative trace, preserved unchanged. [B_memory.md §2.8]
```

```text
ROW ID        P3-B-08
NAMED OBJECT  is_breakthrough flag on atoms — member_memory_atoms
LADDER        UNKNOWN
BASIS         AMBIGUOUS. The record establishes only that the flag is an ordering key —
              B §2.5: "ORDER BY is_breakthrough DESC, kept_at DESC" — and that member routes
              set/clear it. ⛔ The record does not state whether ordering determines what
              surfaces, and the flag's own participation position is not characterized.
              [B_memory.md §2.5, §7.1]
```

```text
ROW ID        P3-B-09
NAMED OBJECT  MemoryWritebackService — writes developmental_memories · breakthrough_moments ·
              conversation_insights
LADDER        DECIDES
BASIS         ⭐ B §10.2: "`NONE FOUND` — `MemoryWritebackService` formation threshold. What rises
              to a `developmental_memory` or a `breakthrough_moment` is decided in
              `lib/memory/MemoryWriteback.ts:603,:689,:732` with no traced governing rule."
              ⭐⭐ The single cleanest INF-6 case in domain B: the record's own sentence carries
              the decision AND the absence of the authorization. [B_memory.md §10.2]
```

```text
ROW ID        P3-B-10
NAMED OBJECT  buildMemberLiveContext ("member web")
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — B §1: "B-10 | `buildMemberLiveContext` ('member web') | `member_spiral_state`
              ·session summaries·`member_patterns`·journals·`relationship_essences`·
              `member_theme_signals` | **SURFACED**" (it reads those sources).
              CONSIDERS — B §3: "All three tiers: … member web (B-10)", and S-3 lists
              "member web `:422`" among the ADDENDA_SPECS fields reaching CORE + DEEP-repair.
              [B_memory.md §1, §3]
```

```text
ROW ID        P3-B-11
NAMED OBJECT  RelationshipAnamnesisPostgres (essence) — relationship_essences
LADDER        UNKNOWN
BASIS         SILENT. The record gives a stop stage only — B §1: "B-11 |
              `RelationshipAnamnesisPostgres` (essence) | `relationship_essences` | **UPDATED**" —
              and the object is not named in B §3's by-tier list. ⛔ No retrieval and no prompt
              seam is traced for this object itself. [B_memory.md §1]
```

```text
ROW ID        P3-B-12
NAMED OBJECT  RelationshipMemoryService (loadRelationshipMemory)
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — the named object is a loader (`loadRelationshipMemory`), B §1 row B-12.
              CONSIDERS — B §3, S-4: "`lib/sovereign/maiaVoice.ts:888-892` | **CORE** |
              `relationshipMemory` via `formatRelationshipMemoryForPrompt`", and §3 by-tier:
              "FAST + CORE: relationship memory (B-12)". [B_memory.md §1, §3]
```

```text
ROW ID        P3-B-13
NAMED OBJECT  Relational Context Bridge (getMemberActiveRelationalContext) — member_relationships
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — the named object is a loader gated at route :908 (B §1 row B-13).
              CONSIDERS — B §3 by-tier: "All three tiers: … relational context bridge (B-13)";
              S-3 lists "relational context `:431`", S-5 "relational context".
              [B_memory.md §1, §3]
```

```text
ROW ID        P3-B-14
NAMED OBJECT  loadRecentIChingReadings (divination recall)
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — the named object is a loader (B §1 row B-14, gated route :1105).
              CONSIDERS — B §3 by-tier: "All three tiers: … divination (B-14)"; S-3 lists
              "divination `:428-430`"; S-5 "three divination". [B_memory.md §1, §3]
```

```text
ROW ID        P3-B-15
NAMED OBJECT  ConsciousnessMemoryLattice — resonance recall (and its separate write half)
LADDER        KNOWS   ⛔ explicitly NOT CONSIDERS
BASIS         B §2.6: "⭐ This is a `KNOWS ≠ CONSIDERS` case in its purest form." with
              "SURFACED WHERE ⛔ NOWHERE … The recalled object never enters `meta`, never enters a
              prompt, and never reaches a response."
              (Assigned by the source record itself; Anchor 1.) [B_memory.md §2.6]
```

```text
ROW ID        P3-B-16
NAMED OBJECT  spiralStatePersistence — member_spiral_state
LADDER        UNKNOWN
BASIS         SILENT. B §1 gives a stop stage only: "B-16 | `spiralStatePersistence` |
              `member_spiral_state` | **UPDATED**", and the object is not in B §3's by-tier list.
              ⚠️ Domain C carries the same TABLE as P3-C-03 with three loaders; ⛔ the two rows
              are not merged and C's trace is not imported onto this row. [B_memory.md §1]
```

```text
ROW ID        P3-B-17
NAMED OBJECT  Selflet temporal message — selflet_messages · selflet_nodes
LADDER        CONSIDERS   ⛔ KNOWS not separately established (INF-6: no downward inference)
BASIS         B §3, S-1: the FAST template literal carries "`selfletPromptBlock`"; §3 by-tier:
              "FAST + CORE: relationship memory (B-12), selflet (B-17)."
              ⛔ No retrieval site is traced for this object in the record, so KNOWS is NOT
              written merely because CONSIDERS is. [B_memory.md §3]
```

```text
ROW ID        P3-B-18
NAMED OBJECT  recordMemoryTransitions — memory_transition_records
LADDER        UNKNOWN
BASIS         NOT A PARTICIPATION QUESTION — an observability writer. B §1: "B-18 |
              `recordMemoryTransitions` | `memory_transition_records` | **PERSISTED
              (observability)**"; register: "COVERAGE NOT APPLICABLE — observability; no prompt
              seam." [B_memory.md §1; 01_normalized_A_B_C.md P3-B-18]
```

```text
ROW ID        P3-B-19
NAMED OBJECT  ConversationMemoryUsesStore (retrieval audit) — conversation_memory_uses
LADDER        UNKNOWN
BASIS         NOT A PARTICIPATION QUESTION — a retrieval audit. B §2.1: "PERSISTED WHERE not
              persisted — built per turn. Retrieval audit only: ConversationMemoryUsesStore.
              recordRetrievedCandidates (:133)"; register: "COVERAGE NOT APPLICABLE —
              observability; no prompt seam." [B_memory.md §1, §2.1]
```

```text
ROW ID        P3-B-20
NAMED OBJECT  buildMemoryHealth / recordRuntimeTurn — runtime_events.memory_layers
LADDER        UNKNOWN
BASIS         AMBIGUOUS. B §2.8: "SURFACED WHERE not a prompt block. Conditions the §VI fallback
              and the degradation warning (route :1210-1214, isBaseChainDegraded)."
              ⛔ *Conditions* is influence language the record does not characterize as a
              decision, and the record affirmatively excludes a prompt seam. Assigning either
              DECIDES or CONSIDERS would require argument, so: UNKNOWN. [B_memory.md §2.8]
```

```text
ROW ID        P3-B-21
NAMED OBJECT  memoryCanonGuard (MEMORY_CANON_GUARD_PROMPT · FORBIDDEN_AMNESIA_PATTERNS ·
              scrubMemoryAmnesia · containsForbiddenAmnesia)
LADDER        CONTRIBUTES  (prompt side only)
BASIS         B §2.9: "SURFACED WHERE prompt side: lib/consciousness/MAIA_RUNTIME_PROMPT.ts:4,:137
              (so it rides in on every tier that carries MAIA_RUNTIME_PROMPT) and
              app/api/voice/stream-conversation/route.ts:1236."
              ⛔ The OUTPUT side carries no position: "Whether the scrubbed text replaces the
              member-facing text on this route was **not established** by this trace and is
              carried as an open question (§9, OQ-4)." [B_memory.md §2.9]
```

```text
ROW ID        P3-B-22
NAMED OBJECT  MemoryGate.resolveMemoryMode — env + allowlist
LADDER        DECIDES
BASIS         Register P3-B-22: "a gate; determines whether memory building runs on the live list
              route turn"; B §2.1: "`MemoryGate.resolveMemoryMode` gates whether it runs, not what
              it selects."
              ⛔ HAS AUTHORITY refused by the register's own flag: "⚠️ INF-3: an env var or
              allowlist selecting behaviour authorizes nothing." [01_normalized_A_B_C.md P3-B-22;
              B_memory.md §2.1]
```

```text
ROW ID        P3-B-23
NAMED OBJECT  TurnPosture / contentWritable (Sanctuary)
LADDER        DECIDES
BASIS         B §8, invariant 1: "`contentWritable` refuses at every traced content store;
              `MemoryWritebackService` is skipped (`route :1697`); `MemoryBundle` is skipped
              (`:541`)"; and "⛔ The refusal is loud and fails closed (`turnPosture.ts:56`)".
              ⛔ HAS AUTHORITY not established: the named governing source is "the six documented
              Sanctuary invariants (CLAUDE.md)", and domain C §8.4 records that under D-P1-06
              `CLAUDE.md` is "operational/session evidence, ⛔ not a governing source".
              [B_memory.md §8; C_developmental_relational.md §8.4]
```

```text
ROW ID        P3-B-24
NAMED OBJECT  MemoryPalaceOrchestrator and its eight services
LADDER        UNKNOWN
BASIS         RECORDS DISAGREE — see the disagreement section. Domain B traces retrievals and a
              prompt seam on `/api/oracle/conversation`; domain A records that route's POST as
              hard-refused at its first executable statement. ⛔ Not derived across.
              [B_memory.md §2.7; A_canonical_cognition.md §A-13]
```

```text
ROW ID        P3-B-25
NAMED OBJECT  lib/maia/recurrenceDetector.ts
LADDER        EXISTS
BASIS         B §4.1: "grep for `recurrenceDetector` across `app/` + `lib/` returns only the file
              itself." Status DORMANT (zero callers). [B_memory.md §4.1]
```

```text
ROW ID        P3-B-26
NAMED OBJECT  lib/memory/confidenceDecay.ts (calculateDecayedConfidence · shouldPromptForConfirmation)
LADDER        EXISTS
BASIS         B §4.2: "`calculateDecayedConfidence` (TS) | imported at `lib/memory/MemoryBundle.ts:16`
              and **never called** in that file"; "`shouldPromptForConfirmation` |
              `lib/memory/confidenceDecay.ts:199` — zero callers repo-wide."
              ⛔ The SQL function of the near-identical name is a DIFFERENT object (P3-C-11); not
              merged. [B_memory.md §4.2]
```

```text
ROW ID        P3-B-27
NAMED OBJECT  lib/anamnesis/* (five modules)
LADDER        EXISTS
BASIS         B §4.1/§4.2: "`lib/anamnesis/AnamnesisField.ts` | zero importers anywhere outside
              `lib/anamnesis/`"; "sole importer is `lib/integrated-oracle-system.ts`, which itself
              has **zero importers**"; "no traced route entry." [B_memory.md §4.1, §4.2]
```

```text
ROW ID        P3-B-28
NAMED OBJECT  lib/memory/MemoryManager.ts · lib/memory/VaultSymbolIndex.ts
LADDER        EXISTS
BASIS         B §4.1: "`lib/memory/MemoryManager.ts` | zero importers." /
              "`lib/memory/VaultSymbolIndex.ts` | zero importers." [B_memory.md §4.1]
```

```text
ROW ID        P3-B-29
NAMED OBJECT  lib/memory/mem0.ts · lib/memory/beads-sync/
LADDER        EXISTS (beads-sync half) · UNKNOWN (mem0 half)
BASIS         EXISTS — B §4.1: "`lib/memory/beads-sync/` | referenced only by
              `lib/maia/substrateMap.ts:254` as an inventory entry."
              UNKNOWN / AMBIGUOUS — register P3-B-29: "NOT DETERMINED BY SOURCE RECORD for mem0
              (reachable from lib/semantic; no turn path traced)". ⛔ The row is not split.
              [B_memory.md §4.1; 01_normalized_A_B_C.md P3-B-29]
```

```text
ROW ID        P3-B-30
NAMED OBJECT  memory_contracts table
LADDER        UNKNOWN
BASIS         NOT A PARTICIPATION QUESTION — a declared table. B §4.3: "`memory_contracts` (read
              only by `lib/trust/service.ts`)", register: "not reached by any traced turn path in
              this domain." [B_memory.md §4.3]
```

```text
ROW ID        P3-B-31
NAMED OBJECT  case_memories · case_memory_chunks · memory_links · vault_symbols ·
              vault_query_patterns (declared tables)
LADDER        UNKNOWN
BASIS         NOT A PARTICIPATION QUESTION — declared tables. B §4.3: "⛔ **A table's existence in
              a migration is recorded here as a declaration and nothing more.**" [B_memory.md §4.3]
```

---

# DOMAIN C — DEVELOPMENTAL + RELATIONAL MEMORY

```text
ROW ID        P3-C-01
NAMED OBJECT  developmental_readings — frozen developmental reading (WS2-07)  [Band I]
LADDER        KNOWS
BASIS         C §3 · C-1: "LOADED WHERE store.ts:120 (loadReading, member-scoped) · store.ts:136
              (listReadings) · lib/manuscript/ask/frozenDevelopmentalReading.ts:80".
              ⛔ CONSIDERS not established: register P3-C-01 — "⛔ no MAIA-cognition prompt seam
              traced". ⛔ CONTRIBUTES not established: the member-facing surface is a read-back of
              a stored record, which the record does not characterize as a member-facing answer.
              [C_developmental_relational.md §3 · C-1]
```

```text
ROW ID        P3-C-02
NAMED OBJECT  developmental_observation_standing_events — member standing (BUILD-07F)  [Band I]
LADDER        KNOWS
BASIS         C §3 · C-2: "LOADED WHERE store.ts:74 · store.ts:87 · store.ts:163".
              ⚠️ Carried, and it is the only NEGATIVE authority statement in the corpus:
              "SYSTEM AUTHORITY — ⛔ none by design. The migration states the absence of an
              `actor` column makes a system write **UNSAYABLE, not UNWRITABLE**."
              [C_developmental_relational.md §3 · C-2]
```

```text
ROW ID        P3-C-03
NAMED OBJECT  member_spiral_state (Bridge D)  [Band II]
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — C §3 · C-3: "⚠️ THREE INDEPENDENT LOADERS: 1. app/api/oracle/conversation/
              route.ts:1711 (guarded) 2. lib/maia/living-field/encounterContext.ts:126
              (UNGUARDED) 3. lib/memory/MemberLiveContext.ts:390 (UNGUARDED)".
              CONSIDERS — C §5.1: "Its prompt renderer, however, emits **only**
              `element`/`phase`/`motion` (`encounterContext.ts:196-198`)."
              ⭐ ⛔ The inferred-developmental class stays at KNOWS, by the record's own words:
              "So the inferred-developmental class is carried past the guard but was not observed
              reaching the prompt at that renderer." [C_developmental_relational.md §3·C-3, §5.1]
```

```text
ROW ID        P3-C-04
NAMED OBJECT  member_relationships + relationship_entries + relationship_field_state  [Band III]
LADDER        KNOWS · CONSIDERS
BASIS         KNOWS — C §3 · C-4: "LOADED WHERE lib/relationships/relationshipContextService.ts:84
              · :116 · :132".
              CONSIDERS — C §5.2: "⭐ `pattern_hint` — MAIA-generated — is promoted into
              `salientThemes` (`relationshipContextService.ts:146-148`) and `salientThemes` is
              formatted into MAIA's prompt (`list/route.ts:916`)."
              [C_developmental_relational.md §3·C-4, §5.2]
```

```text
ROW ID        P3-C-05
NAMED OBJECT  member_relational_signals (system-detected relational state)  [Band III]
LADDER        KNOWS   ⛔ NOT CONSIDERS (excluded by a traced negative finding)
BASIS         KNOWS — C §3 · C-5: "LOADED WHERE relationshipSignalService.ts:313 · :340 · :393".
              ⛔ CONSIDERS refused — same section: "⭐ NEGATIVE FINDING, TRACED:
              `relationshipContextService.ts` — the module that feeds MAIA's prompt — **does not
              read `member_relational_signals`** … its only surfacing path found is the founder
              review lane." ⭐ A second KNOWS ≠ CONSIDERS case, independent of P3-B-15.
              [C_developmental_relational.md §3 · C-5]
```

```text
ROW ID        P3-C-06
NAMED OBJECT  member_patterns (practitioner-scoped developmental judgement)  [Band IV]
LADDER        KNOWS · DECIDES
BASIS         KNOWS — C §3 · C-6: "LOADED WHERE lib/patterns/getMemberPatterns.ts:45
              (getPatternsForClient — PRACTITIONER) … :57 (getMemberVisiblePatterns — MEMBER)".
              DECIDES — C §3 · C-6: "⭐⭐ ASYMMETRIC VISIBILITY, IMPLEMENTED IN CODE … **A
              developmental judgement about a member is deliberately withheld from that member
              while it is `emerging`.**"
              ⛔ HAS AUTHORITY refused — same section: "GOVERNANCE GATE — NONE FOUND", and
              "the `emerging`-withholding rule at `getMemberPatterns.ts:55` exists **only as a
              code comment**" (C §9). [C_developmental_relational.md §3·C-6, §9]
```

```text
ROW ID        P3-C-07
NAMED OBJECT  pattern_ledger (MAIA-detected patterns)  [Band IV]
LADDER        KNOWS
BASIS         C §3 · C-7: "LOADED WHERE lib/patterns/getMemberPatterns.ts
              (getMaiaDetectedPatterns)".
              ⛔ CONSIDERS not established: register P3-C-07 — "⛔ no MAIA-cognition prompt seam
              traced". ⛔ CONTRIBUTES not established (same reading as P3-C-01).
              [C_developmental_relational.md §3 · C-7]
```

```text
ROW ID        P3-C-08
NAMED OBJECT  living_field_affinities (system-created affinity)  [Band V]
LADDER        KNOWS · CONSIDERS · DECIDES
BASIS         KNOWS — C §3 · C-8: "LOADED WHERE lib/maia/living-field/encounterContext.ts:110 ·
              app/api/maia/living-field/route.ts:55 · …/gathering/route.ts:46".
              CONSIDERS — C §3 · C-8: "SURFACED WHERE gathering route (to the member) · encounter
              + refine routes (into MAIA's prompt)".
              DECIDES — ⭐⭐ C §5.3: "**A system-computed score selects and orders which of the
              member's own Keeps enter MAIA's prompt, with a hard `LIMIT 10`.** This is *ranking*
              and *what MAIA says*, from a system-inferred judgement."
              ⛔ HAS AUTHORITY refused — C §3 · C-8: "⛔ **no gate was located governing the
              scoring or the ranking itself**", and C §9: "`ECOLOGY_OF_MIRRORS.md` governs
              *inspectability*, not *selection weight*."
              [C_developmental_relational.md §3·C-8, §5.3, §9]
```

```text
ROW ID        P3-C-09
NAMED OBJECT  member_theme_signals (participatory reality themes)  [Band V]
LADDER        UNKNOWN
BASIS         RECORDS DISAGREE — see the disagreement section (register X-1). Domain C traces the
              write path only and locates no member-facing read; domain B states the signals reach
              the FAST prompt. ⛔ Not derived across. [C_developmental_relational.md §3 · C-9;
              B_memory.md §2.8]
```

```text
ROW ID        P3-C-10
NAMED OBJECT  episodic_memories  [Band VI]
LADDER        KNOWS
BASIS         C §3 · C-10: "LOADED WHERE EpisodicMemoryService.ts:103 · :127 · :151 · :202".
              ⛔ CONSIDERS not established BY THIS RECORD — "⚠️ Band overlap with domain B.
              Retrieval/decay of this material runs through `lib/memory/MemoryBundle.ts` —
              **noted and not re-censused**." (P3-B-05 carries the seam; ⛔ rows not merged.)
              [C_developmental_relational.md §3 · C-10]
```

```text
ROW ID        P3-C-11
NAMED OBJECT  Confidence decay — TS calculateDecayedConfidence + SQL calculate_decayed_confidence
LADDER        UNKNOWN
BASIS         AMBIGUOUS. The record establishes only that both are called and that one module
              calls both — C §3 · C-11: "BOTH ARE CALLED, AND ONE MODULE CALLS BOTH" — and the
              register records "STATUS NOT DETERMINED BY SOURCE RECORD — the record assigns no
              single status to the pair." ⛔ No participation position is characterized for
              either implementation. [C_developmental_relational.md §3 · C-11]
```

```text
ROW ID        P3-C-12
NAMED OBJECT  trust_observations  [Band VII]
LADDER        EXISTS
BASIS         C §3 · C-12: "CALLERS ⛔ NONE FOUND" and "**The declared consumer does not exist**,
              and the declared future use is exactly an inference→weighting path.
              **X-19-relevant as a DECLARED INTENT, not as a live path**."
              [C_developmental_relational.md §3 · C-12]
```

```text
ROW ID        P3-C-13
NAMED OBJECT  lib/relationship/scope.ts — the four-scope relational architecture  [Band VII]
LADDER        EXISTS
BASIS         C §3 · C-13: "CALLERS ⛔ NONE FOUND outside lib/relationship/__tests__/scope.test.ts"
              and "⭐⭐ This is the most explicit relational-authority boundary in domain C and it
              is unreachable." [C_developmental_relational.md §3 · C-13]
```

```text
ROW ID        P3-C-14
NAMED OBJECT  lib/coachField/practitionerProjection.ts  [Band VII]
LADDER        EXISTS
BASIS         C §3 · C-14: "CALLERS ⛔ NONE FOUND" and "the module that reasons most carefully
              about what a practitioner may know **is dormant**."
              [C_developmental_relational.md §3 · C-14]
```

---

## Counts — positions recovered, by position, and UNKNOWN total

```text
ROWS IN SLICE                       62   (A 17 · B 31 · C 14)
ROWS CARRYING ≥1 RECOVERED POSITION 50   (P3-B-29 counts here on its beads-sync half only)
ROWS FULLY UNKNOWN                  12

BY POSITION (a row may carry more than one; ⛔ no position implies another)
  EXISTS            11   A-12 A-13 A-14 · B-25 B-26 B-27 B-28 B-29(part) · C-12 C-13 C-14
  PARTICIPATES       0   ⭐ NO RECORD IN THIS SLICE USES OR ESTABLISHES THIS RUNG
  KNOWS             22   A-08 · B-01 B-02 B-03 B-04 B-05 B-06 B-07 B-10 B-12 B-13 B-14 B-15 ·
                         C-01 C-02 C-03 C-04 C-05 C-06 C-07 C-08 C-10
  CONSIDERS         15   B-01 B-02 B-03 B-04 B-05 B-06 B-07 B-10 B-12 B-13 B-14 B-17 ·
                         C-03 C-04 C-08
  CONTRIBUTES       12   A-01 A-03 A-04 A-05 A-06 A-07 A-09 A-10 A-11 A-15 A-16 · B-21
  DECIDES           10   A-01 A-02 A-06 A-10 A-16 · B-09 B-22 B-23 · C-06 C-08
  HAS AUTHORITY      0   ⛔⛔ NOT ASSIGNED ANYWHERE. See the INF-6 section.

PRIOR STATE (01_normalized_A_B_C.md): ladder established on 2 of 62.
THIS PASS: 50 of 62, both prior assignments preserved verbatim and unchanged.

UNKNOWN, BY REASON (12 rows)
  SILENT                        2   B-11 · B-16
  AMBIGUOUS                     3   B-08 · B-20 · C-11        (+ B-29's mem0 half)
  RECORDS DISAGREE              2   B-24 · C-09
  NOT A PARTICIPATION QUESTION  5   A-17 · B-18 · B-19 · B-30 · B-31
```

⭐ **Two shapes in these counts are findings in themselves.**
**(1) `PARTICIPATES` is empty.** No record in domains A, B or C uses that rung or establishes a
fact that this pass could read as it. ⛔ That is recorded as a gap in the corpus, not as a claim
that nothing participates.
**(2) `CONTRIBUTES` is domain A + one domain B row; `KNOWS`/`CONSIDERS` is domains B + C.** The
ladder positions partition almost exactly along the domain boundary — ⚠️ which may say more about
what each P1-02 worker was asked to trace than about the organism. ⛔ Not adjudicated here.

---

## Rows where the records DISAGREE (both sides quoted; all assigned UNKNOWN)

### D-1 · `P3-B-24` — MemoryPalaceOrchestrator and its eight services

```text
SIDE B (B_memory.md §2.7)
  "SURFACED WHERE app/api/oracle/conversation/route.ts:902 retrieveMemoryContext →
   :2787 `memoryPalaceOrchestrator.generateMemoryContextPrompt(memoryContext)` interpolated into
   the prompt template; :1499 storeConversationMemory."
  and: "Whether that route serves member traffic is `UNKNOWN` in this container."

SIDE A (A_canonical_cognition.md §A-13)
  "CURRENT STATUS — BLOCKED. The 410 is the first executable statement of `POST`."
  and refusal-19 "additionally asserts the body is never read".
```
⛔ If the POST is refused at its first statement, neither the retrievals nor the prompt seam runs;
if the seam runs, the route is reached. **Both stand. No position derived.** (Register X-3.)

### D-2 · `P3-C-09` — `member_theme_signals`

```text
SIDE B (B_memory.md §2.8)
  "Theme signals **are** loaded on the live route (`route :947`) and **do** reach the FAST prompt
   inside the influence block."

SIDE C (C_developmental_relational.md §3 · C-9)
  "CURRENT STATUS — `WIRED-BUT-UNOBSERVED` (write path only; no member-facing read located)."
  and: "⭐⭐ GOVERNANCE GATE — PRESENT, AND IT IS A REFUSAL … 'System-inferred member themes
   (`member_theme_signals`) are SUSPENDED from the …'"
```
⛔ **Both stand.** `P3-C-09` is UNKNOWN. ⚠️ `P3-B-07` keeps its own record's affirmative trace
(KNOWS · CONSIDERS) because that is domain B's finding restated, ⛔ not a resolution of the
divergence — the two rows were deliberately not merged by P1-03, and they are not merged here.
(Register X-1.)

⚠️ **Adjacent divergences that do NOT block a position, recorded so they are not lost:** the
contradictions A-1…A-7, B-1…B-8 and C-1…C-5 carried by the register concern *what a mechanism
does or which comment is true*, not *where a capability sits on the ladder*. Each row above that
carries one carries it verbatim in its BASIS or its ⚠️ line.

---

## Rows where a record establishes an EFFECT but no AUTHORIZATION — ⭐⭐ THE INF-6 CASES

> Amendment 2 §2: *"⛔⛔ HAS AUTHORITY MUST NEVER BE INFERRED FROM DECIDES — founder: 'that would
> violate INF-4 in a different costume.'"*

⭐⭐ **ALL 50 ROWS THAT RECOVERED A POSITION DID SO AS AN EFFECT. NOT ONE ROW IN THIS SLICE
CARRIES RECORD TEXT ESTABLISHING AN AUTHORIZATION TO OCCUPY IT.** `HAS AUTHORITY` is therefore
zero — ⛔ not because the pass was cautious, but because the corpus contains no such sentence.

**The sharp subset — the 18 rows whose effect reaches an OUTCOME or the organism's OUTPUT
(`DECIDES` and/or `CONTRIBUTES`), with what the record says about authorization beside it:**

```text
ROW      POSITION                 WHAT THE RECORD SAYS ABOUT AUTHORIZATION
A-01     CONTRIBUTES · DECIDES    GOVERNING SOURCE NONE LOCATED for the route as a whole
A-02     DECIDES                  ⭐ "GOVERNANCE GATE — NONE FOUND. No refusal-registry check, no
                                  consent gate and no member-visible disclosure governs which mind
                                  answers a given turn."
A-03     CONTRIBUTES              GOVERNING SOURCE NONE LOCATED; one of four standing texts only
A-04     CONTRIBUTES              gate PRESENT (full four) but ⛔ "no located ruling governs who may
                                  set MAIA_SAFE_MODE"; GOVERNING SOURCE cited, NOT VERIFIED
A-05     CONTRIBUTES              GOVERNING SOURCE NONE LOCATED; DEEP-primary stage 1 gate NONE FOUND
A-06     CONTRIBUTES · DECIDES    GOVERNING SOURCE NONE LOCATED; egress discipline only
A-07     CONTRIBUTES              GOVERNING SOURCE NONE LOCATED (FOCUS-WITNESS not read in slice)
A-09     CONTRIBUTES              ⭐ "NONE FOUND for identity-source uniqueness … no guard, registry
                                  or refusal constrains a new file declaring 'You are MAIA'"
A-10     CONTRIBUTES · DECIDES    Canon v1.1 provenance HEADERS named — ⛔ governs the headers, not
                                  the egress constraints
A-11     CONTRIBUTES              ⭐ GOVERNING SOURCE NONE LOCATED; "the wrapper's own contract …
                                  is not satisfied on this path"
A-15     CONTRIBUTES              ⭐ "NONE FOUND as a class … middleware governs who may call, never
                                  what may be said in MAIA's name"
A-16     CONTRIBUTES · DECIDES    GOVERNING SOURCE NONE LOCATED; "THE GATEWAY CLAIM IS FALSE"
B-09     DECIDES                  ⭐⭐ "…is decided in lib/memory/MemoryWriteback.ts:603,:689,:732
                                  with no traced governing rule."
B-21     CONTRIBUTES              GOVERNING SOURCE NONE LOCATED
B-22     DECIDES                  ⭐ register's own flag: "INF-3: an env var or allowlist selecting
                                  behaviour authorizes nothing"
B-23     DECIDES                  governing source = the six Sanctuary invariants in CLAUDE.md,
                                  which D-P1-06 classes as evidence, ⛔ not a governing source
C-06     DECIDES (+KNOWS)         ⭐⭐ "GOVERNANCE GATE — NONE FOUND" · the withholding rule "exists
                                  **only as a code comment**" · the one doc naming the table
                                  contradicts the code
C-08     DECIDES (+KNOWS,        ⭐⭐ "⛔ no gate was located governing the scoring or the ranking
         CONSIDERS)               itself"; ECOLOGY_OF_MIRRORS "governs *inspectability*, not
                                  *selection weight*"
```

⭐ **The four most load-bearing, because in each the record's own sentence carries the effect and
the absence of the authorization in the same breath:** `A-02` (which mind answers a turn) ·
`B-09` (what rises to a formed memory) · `C-06` (what a member may not see about themselves) ·
`C-08` (what enters MAIA's prompt, and in what order).

⚠️ **Two rows carry a named design-of-record governing source and still do not reach
`HAS AUTHORITY`:** `P3-C-01` (WS2-07 DECIDE record, INV-0/1/2/3/4/22/25, "the strongest governance
binding in domain C") and `P3-C-02` (BUILD-07F design of record). ⭐ What those sources govern is
the **shape of the record** — which keys may be written, that UPDATE is refused — ⛔ not an
authorization for the capability to occupy a ladder position. *Governing the form of a thing is
not authorizing the act of it.*

⭐ **One negative authority statement exists in the corpus and is recorded rather than converted:**
`P3-C-02` — *"SYSTEM AUTHORITY — ⛔ none by design."* ⛔ That establishes an absence, not a grant,
and it is not read as HAS AUTHORITY for anything else.

---

## Rows that are NOT A PARTICIPATION QUESTION

⛔ A ladder is not forced onto these. They are named so a later reader does not re-find them as
missing values.

```text
P3-A-17   Runtime governance instruments on the canonical lane (the set of eleven)
          A heterogeneous SET of gates, a registry, middleware and a CI suite. The register
          itself assigns no single status to it. ⛔ A set does not occupy a rung.

P3-B-18   recordMemoryTransitions — memory_transition_records
          Observability writer. "PERSISTED (observability)"; "no prompt seam."

P3-B-19   ConversationMemoryUsesStore — conversation_memory_uses
          "Retrieval audit only." Observability; no prompt seam.

P3-B-30   memory_contracts (table)
          A declared table, "read only by lib/trust/service.ts — outside the memory path."

P3-B-31   case_memories · case_memory_chunks · memory_links · vault_symbols ·
          vault_query_patterns (declared tables)
          "⛔ A table's existence in a migration is recorded here as a declaration and nothing
          more." ⛔ No claim that any is empty, unused, or safe to remove.
```

⚠️ **Deliberately NOT placed here:** `P3-B-22` (MemoryGate) and `P3-B-23` (Sanctuary TurnPosture)
are gates, but their own records state that they **refuse** and **determine whether** — decision
language about an outcome. ⭐ *A gate that refuses is making a decision; calling it "just a guard"
would hide exactly the effect INF-6 exists to expose.* Both carry `DECIDES`, neither carries
`HAS AUTHORITY`.

---

```text
P1-03 · BOUNDED LADDER-DERIVATION PASS · DOMAINS A · B · C · COMPLETE
62 rows · 50 recovered a position · 12 UNKNOWN
EXISTS 11 · PARTICIPATES 0 · KNOWS 22 · CONSIDERS 15 · CONTRIBUTES 12 · DECIDES 10
⛔⛔ HAS AUTHORITY 0 — 18 rows establish an effect on an outcome or on the organism's output,
    and NOT ONE of them establishes an authorization for it.
⛔ NO SOURCE CODE READ · ⛔ NO POSITION INFERRED DOWNWARD · ⛔ NO AUTHORITY INFERRED FROM DECIDES
⛔ NO DISAGREEMENT DERIVED ACROSS · ⛔ NOTHING RESOLVED · ⛔ AUTH-EXPOSURE-01 NEITHER CITED NOR AWAITED
P1-03 RESTATES. IT DOES NOT DECIDE.
```
