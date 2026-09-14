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
