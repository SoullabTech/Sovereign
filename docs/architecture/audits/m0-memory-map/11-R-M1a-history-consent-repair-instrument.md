# R-M1a — History-Channel Consent Repair Instrument

**Lane**: AIN Memory Ecology Rehabilitation — M0 follow-on, founder ruling R-M1a (2026-08-09)
**Status**: DESIGN ONLY. No code changed by this instrument. Implementation requires its own lane.
**Parent workpaper**: `03-reader-composition-trace.md` §5 (filtering gaps 1–2)

**Tree provenance (verification discipline):** the local working tree (branch
`feature/labtools-redesign`) diverged 2026-08-01 and is ~398 commits behind the deployed
lineage; production runs **`b1399f693`** (`origin/clean-main-no-secrets`). Every
load-bearing claim below was verified against **both** trees (`git grep`/`git show` on
`b1399f693` + local file reads) and is marked **[both]** / **[deployed]** / **[local-only]**.
Citations give `deployed-line / local-line` where they drift. A repair PR merges onto the
deployed lineage — all recommendations in §3 target `b1399f693`.

> **Grep trap recorded:** `conversational_recall_enabled` does NOT appear literally in
> `app/api/sovereign/app/maia/list/route.ts` or `lib/sovereign/maiaService.ts` on
> `b1399f693` — the route consults the preference **through the loader**
> (`loadConversationalRecallPref`, `lib/maia/memoryLoaders.ts:244–249 [both]`), imported
> and called at route line 854 [deployed] / 875 [local]. A column-name grep alone
> understates production enforcement; the P1 addendum gate **is live on the deployed tree**.

**Founder-required invariant (verbatim):**
> A member's refusal of conversational recall must prevent that same conversational history
> from reaching MAIA through another composition tier or transport path. CORE/DEEP may not
> increase the epistemic or retrieval authority granted by the member.

---

## 1. The full chain: preference → retrieval paths → tier → prompt

### 1.1 Where the preference lives and is read

| Element | Location | Tree |
|---|---|---|
| Column | `members.conversational_recall_enabled BOOLEAN NOT NULL DEFAULT TRUE` — `database/migrations/20260524000001_member_conversational_recall.sql:22` | [both] |
| Canonical reader | `loadConversationalRecallPref(memberId)` — `lib/maia/memoryLoaders.ts:230–249` (`!== false` → default-on opt-out doctrine) | [both] |
| Member-facing route | `app/api/members/recall-preferences/route.ts` (GET/PATCH; allowlisted column set at lines 43–44; identical on both trees) | [both] |
| Gate consumers today | live route `app/api/sovereign/app/maia/list/route.ts:854–858 [deployed] / 875–879 [local]` · `lib/maia/roomComposition.ts:190 [deployed] / 189 [local]` · dead oracle route `app/api/oracle/conversation/route.ts:666` | [both] |
| Enforcement site today | `formatPriorExchangesForPrompt` — `lib/maia/conversationalRecallBlock.ts` (`recallEnabled === false` → suppress; doc at :22/:55 confirmed on deployed). **This is the ONLY enforcement site, and it governs only the addendum channel — true on BOTH trees.** | [both] |

**What production enforces TODAY (`b1399f693`) vs the local branch:** the enforcement
shape is the **same defect on both trees**. Deployed production DOES gate the P1 addendum
(route :854–858 → `formatPriorExchangesForPrompt({recallEnabled})`), and deployed
production does NOT gate any of P2–P7. The local branch changes line positions only, not
enforcement semantics. `appendAllContextAddenda` exists on `b1399f693`
(`lib/sovereign/maiaVoice.ts:482`, applied at :906 CORE and :1038 DEEP-repair) — the
§II.B addenda-channel closure is live on the deployed tree too.

**⚠️ Adjacent identity defect (flagged, out of scope):** `resolveMemberId` in the
recall-preferences route falls back to `request.nextUrl.searchParams.get('memberId')`
when no server session exists — caller-supplied identity as authority, contrary to the
founder ruling of 2026-08-09 (`requireSelfScopedMember` pattern). Anyone who knows a
memberId can read or flip that member's consent gate. This instrument stays on transport
integrity; the identity defect needs its own repair under the existing self-scoping lane.

### 1.2 Every path by which cross-session conversational content reaches a MAIA prompt

"Cross-session conversational content" = verbatim or truncated exchange text originating
from `conversation_turns` rows outside the current `session_id`.

All line citations are `deployed(b1399f693) / local` where the trees drift; a single
number means the citation is identical on both. **Every path P1–P8 exists on BOTH trees**
— nothing below is local-only, and nothing was removed on the deployed lineage.

| # | Path | Tree | Retrieval | Content | Tier / prompt seam | `conversational_recall_enabled` consulted? |
|---|---|---|---|---|---|---|
| **P1** | **Phase 2 addendum (the gated reference)** | [both] | `loadPriorCrossSessionExchanges` (`lib/maia/memoryLoaders.ts:195`) at live route `app/api/sovereign/app/maia/list/route.ts:854–864 / 875–879` | Prior exchanges, provenance-labeled block | FAST + CORE via `appendAllContextAddenda` (`lib/sovereign/maiaVoice.ts:482/489`, spec entry :421, applied :906 CORE, :1038 DEEP-repair on deployed); DEEP consultation lane (env-gated, dormant) | ✅ YES — pref loaded at route :854/:875, suppressed in `conversationalRecallBlock.ts` (`recallEnabled === false`) |
| **P2** | **FAST in-service cross-session `recentContext`** | [both] | `TurnsStore.getRecentTurns(effectiveUserId, 6)` — `lib/sovereign/maiaService.ts:715 / 714` (fires when `conversationHistory.length === 0 && effectiveUserId`, non-sanctuary) | Last 3 turns, raw text truncated to 100 chars each | FAST `contextPrompt` ("Recent conversation" block) | ❌ NO — sanctuary check only |
| **P3** | **FAST MemoryFallback** | [both] | `memoryOrchestrator.getSessionRecallContext(effectiveUserId)` → `formatRecallForPrompt` — `maiaService.ts:790–807 / 789–806` (fires when caller supplied no `memoryContext`) | Relationship context + recent turns + breakthroughs | FAST `memoryContext` slot of `contextPrompt` | ❌ NO — sanctuary check only |
| **P4** | **FAST MemoryBundle (route-built `memoryContext`)** | [both] | `MemoryBundleService.build({ scope: 'cross_session' })` — live route :461 / 463; bundle cross-session branch delegates to `TurnsStore.getRecentTurns` (`lib/memory/MemoryBundle.ts:183–196`) and counts `turnsCrossSession` (:143–145) | Compressed continuity summary + memory bullets sourced from cross-session turns, semantic memories, breakthroughs | FAST `contextPrompt` (bundle is FAST-only) | ❌ NO — gate is `shouldBuildMemory = !isSanctuary && allowCrossSessionMemory && memoryMode !== 'ephemeral'` (route :442 / 444, `allowCrossSessionMemory = isRecognizedUser && !isSanctuary` :422): session-mode flags, not the member's consent column |
| **P5** | **CORE raw history injection** | [both] | `TurnsStore.getRecentTurns(effectiveUserId, 8)` — `maiaService.ts:1420 / 1429` (parallel fetch, non-sanctuary, empty session) → paired into `effectiveHistory` (`maiaService.ts:1492–1508 / 1500–1520`) | Up to 4 full exchange pairs (`pairs.slice(-4)`), verbatim | `buildMaiaWisePrompt(context, input, effectiveHistory)` — `maiaService.ts:1578` [deployed], repair re-use :1733 [deployed] → `maiaVoice.ts:860–885` renders exchanges verbatim into the CORE prompt | ❌ NO — sanctuary check only |
| **P6** | **DEEP raw history injection** | [both] | `TurnsStore.getRecentTurns(effectiveUserId, 10)` — `maiaService.ts:1870 / 1881` (`conversationHistory.length === 0 && effectiveUserId && !isSanctuaryDeep`) → `effectiveHistory = pairs.slice(-5)` (:1886 [deployed]) | Full exchange pairs, verbatim | (a) consultation context `conversationHistory: effectiveHistory` (`maiaService.ts:2023 / 2034`, also :2095 `conversationContext` [deployed]) — live only if `MAIA_USE_CLAUDE_CONSULTATION === 'true'` (dormant in repo); (b) DEEP-repair `buildMaiaComprehensivePrompt(input, repairedContext, effectiveHistory)` (`maiaService.ts:2214` [deployed]) → renders history + `appendAllContextAddenda` (`maiaVoice.ts:1038`) | ❌ NO — sanctuary check only |
| **P7** | **BETWEEN surface cross-session fallback** | [both] | `getUserConversationHistory(effectiveUserId, 10, safeSessionId)` — `app/api/between/chat/route.ts:1090–1096` (identical both trees; fires when session history empty and userId not `anon:`); delegates to `TurnsStore.getRecentTurns` (`lib/sovereign/sessionManager.ts:155`) | Full exchange pairs | Passed as `conversationHistory` into maiaService → same tier seams as P2/P5/P6, **entering as caller-supplied history** so in-service cross-session guards never even see it as cross-session | ❌ NO — no consent check at all. (Note: `ADDENDA_CHANNEL_DIVERGENCE` §IX records that *recall addenda* wiring on BETWEEN awaits a founder ruling — yet raw history already flows here, on production.) |
| **P8** | **Dead oracle route** | [both] | `app/api/oracle/conversation/route.ts` (richest reader; loads the pref at line 666 and gates its addendum) | Multiple memory layers | ~Zero live traffic; superseded header forbids new wiring | ✅ addendum gated; route dormant — tripwire only |

Searched and cleared: session summaries / capsules reach prompts only as *derived*
content via MemberLiveContext member-web block and MemoryBundle bullets (see §6 —
derivative layers are a governance question, not raw history transport).
`conversation_memory_uses` is write-side audit only (readers: none in composition).
`lib/soulPortrait/*` reads no member memory. Caseload/studio routes read case documents,
not member conversational turns.

### 1.3 The defect, stated structurally

The member's refusal switches off **one labeled block** (P1) while six ungated transports
(P2–P7) carry the **same rows from the same table** (`conversation_turns`) into the same
prompts. CORE/DEEP grant themselves *more* retrieval authority than the member conferred —
precisely what the invariant forbids.

**This is the state of PRODUCTION today** (`b1399f693`): the addendum gate is deployed
and live; the six bypasses are deployed and live. The local branch does not change this
picture — it only shifts line numbers. A repair PR targets the deployed lineage.

**Bug found in passing [both trees]:** `getUserConversationHistory` documents
`@param excludeSessionId - Optionally exclude current session's turns`
(`sessionManager.ts:153`) and never uses the parameter — the exclusion contract is dead
code on deployed and local alike.

---

## 2. Scope boundary: what the opt-out governs

**In scope — cross-session recall**: any `conversation_turns` row whose `session_id`
differs from the current turn's session.

**Not in scope — the current-session thread.** "Current session" is bounded in code by
`session_id`:
- A session is created/resumed via `ensureSession(sessionId)` (`lib/sovereign/sessionManager.ts:22` [both], rows in `maia_sessions`); the live route passes `session.id` into `getMaiaResponse` (route :1051–1052 [local]; same contract on deployed via `buildMaiaRuntimeContext`).
- Current-session history is loaded by `getConversationHistory(sessionId, 10)` — `sessionManager.ts:127` [both], SQL `WHERE session_id = $1`; called inside `getMaiaResponse` (`maiaService.ts:2402` [local]; same shape on deployed).
- Cross-session content enters **only** when that current-session load returns empty (all of P2/P5/P6/P7 are `length === 0`-guarded) and is fetched by `TurnsStore.getRecentTurns` — SQL `WHERE user_id = $1` with **no session filter** (`lib/memory/stores/TurnsStore.ts:62`).

So the two channels are cleanly distinguishable **at retrieval time** (`session_id`-scoped
query vs `user_id`-scoped query) and **indistinguishable afterward** — once converted to
`{userMessage, maiaResponse}` pairs, cross-session exchanges are shape-identical to
current-session ones. An opted-out member must still get a fully coherent *within-session*
conversation; the repair must not touch the `session_id`-scoped channel.

---

## 3. Enforcement point analysis

**Target tree**: all designs below were validated against `b1399f693` (the deployed
lineage a repair PR merges onto). Every named seam — the three `TurnsStore.getRecentTurns`
call sites (:715/:1420/:1870), the MemoryFallback block (:790–807), the bundle branch
(`MemoryBundle.ts:183–196`), `getUserConversationHistory` (`sessionManager.ts:155`), and
`appendAllContextAddenda` (`maiaVoice.ts:482`) — exists on the deployed tree.

Founder guidance: *"Prefer the highest common enforcement point that cannot be bypassed by
another tier."* The decisive fact from §2: **the cross-session / current-session
distinction exists only at the retrieval layer.** Any enforcement placed after retrieval
must either re-thread provenance through every history shape or over-block the
current-session thread.

### Candidate A — single choke-point in `maiaService.getMaiaResponse` before tier dispatch

Resolve consent once (`sanctuary || !loadConversationalRecallPref(effectiveUserId)` →
`crossSessionAllowed=false`) near `maiaService.ts:2402`, stamp it on the internal context,
and have each tier's cross-session block check it.

- ✅ One DB read per turn; all four in-service sites (P2, P3, P5, P6) inherit it.
- ✅ Matches the existing shape (sanctuary is already resolved-once-checked-per-tier).
- ❌ **Bypassable by construction**: P7 proves it. `between/chat` loads cross-session
  history *at the route* and hands it to maiaService as plain `conversationHistory`. A
  choke-point inside maiaService cannot tell consented current-session history from
  route-injected cross-session history — the provenance is already gone. Any future route
  that pre-loads history re-opens the hole silently.
- ❌ Still N per-site checks inside tiers; a new tier or new fetch site added later is
  ungoverned by default (enumerated-gate decay — exactly how P2–P7 came to exist).

### Candidate B — per-prompt-builder gating

Gate inside `buildMaiaWisePrompt` / FAST template / `buildComprehensiveVoicePrompt` /
consultation-context assembly.

- ✅ Closest to the final string; "nothing reaches the prompt" is asserted where the prompt is made.
- ❌ Builders receive provenance-erased exchange pairs (§2) — they **cannot** distinguish
  what to suppress without either over-blocking the current-session thread (breaks
  in-session coherence for opted-out members) or threading provenance tags through every
  history shape (large invasive change, and every future builder must remember the tag).
- ❌ Worst enumeration surface: four+ builders today (FAST literal, wise prompt,
  comprehensive/repair, consultation), each a separate gate to decay.

### Candidate C — governed retrieval boundary + static import tripwire (**RECOMMENDED**)

Make cross-session conversational retrieval itself the consent gate:

1. **One governed accessor** — a module (working name
   `lib/maia/crossSessionHistory.ts`) exposing the *only* legal way to obtain
   cross-session exchange content for composition, e.g.
   `getConsentedCrossSessionTurns(memberId, { sessionId, limit, sanctuary })`. Inside it,
   in order: sanctuary → return `[]`; `loadConversationalRecallPref(memberId) === false`
   → return `[]` (with a discoverable log marker, e.g.
   `[MAIA] cross-session-history { suppressed: 'member_opt_out' }`); else delegate to
   `TurnsStore.getRecentTurns`.
2. **Migrate all six ungated call sites** to it (deployed-tree lines): `maiaService.ts:715`
   (P2), `:1420` (P5), `:1870` (P6), the MemoryFallback orchestrator fetch (P3,
   `:790–807` — gate the `recentTurns` component; see §6 for the derivative components),
   `MemoryBundle.getRecentTurns`'s cross-session branch (P4, `MemoryBundle.ts:183–196`),
   and `sessionManager.getUserConversationHistory` / `between/chat:1096` (P7).
3. **Static import tripwire** (house style, see §5): outside the governed module and the
   stores' own tests, **no file may import or call `TurnsStore.getRecentTurns` or
   `getUserConversationHistory`**. The allowlist is frozen; adding a name to it is a
   deliberate, reviewed act with a failing test attached.
4. Keep Candidate A's resolve-once as an *optimization inside* the boundary (per-turn
   memoized pref read), not as the enforcement itself.

**Why no tier can bypass this:**
- Every tier, every transport (addendum, raw history, fallback, bundle), and every
  *route* obtains cross-session conversational rows from exactly one function, and the
  consent check is inside that function — there is no second door.
- The tripwire converts "bypass" from a silent code path into a failing test: a new fetch
  site cannot even *import* the raw store without tripping the pin. This is the same
  mechanism that already protects practitioner boundaries in this repo
  (`__tests__/practitioner-authority-boundaries.test.ts` — containment pins on imports).
- It is the **highest point at which the distinction still exists** (§2). Higher points
  (dispatch, builders) can be handed pre-mixed history; lower points (SQL) can't see
  member context. Retrieval is where identity (`user_id` query) meets scope
  (`session_id` absence) — the one place the invariant is decidable.
- P1 remains gated where it is (`conversationalRecallBlock.ts:85`) — defense in depth:
  loader-level suppression (its loader also moves behind the boundary) plus
  formatter-level suppression.

**Cost acknowledged**: one extra pref read per cross-session fetch (memoizable per turn);
six call-site migrations; the P4 bundle change touches a shared service (bundle must
receive/resolve consent for its turns bucket while leaving its non-conversational buckets
to §6 governance).

---

## 4. What "enforced" means, precisely

With `conversational_recall_enabled = false` for member M, non-sanctuary, on every tier
(FAST, CORE, DEEP-primary, DEEP-repair, consultation-lane-if-enabled) and every live
surface (`/api/sovereign/app/maia/list`, `/api/between/chat`):

1. No text originating from a `conversation_turns` row with `session_id ≠ current` appears
   anywhere in the final prompt string sent to any model.
2. The current-session thread continues to appear normally (opt-out must not degrade
   in-session coherence).
3. Suppression is observable (log marker), so liveness can be verified in prod per the
   repo's "LIVE = deployed + exercised" standing rule.
4. Re-enabling the preference restores surfacing with no residue from the disabled period
   beyond what the tables already hold (the opt-out governs *surfacing*, not storage —
   storage consent is Sanctuary's jurisdiction, unchanged).

---

## 5. Test suite specification (written BEFORE implementation)

**File**: `__tests__/history-consent-transport.test.ts`
**House style**: mirrors `__tests__/practitioner-authority-boundaries.test.ts` — header
comment stating these are containment pins, "if a pin fails do not edit the allowlist,"
static checks via source scanning, plus behavioral tests where a seam exists.

**Test infrastructure requirement (must land with the repair, not after):** a
prompt-capture seam — the final prompt string per tier must be inspectable under test
(e.g. injectable LLM transport or an exported prompt-assembly function per tier). The
sentinel technique: seed cross-session `conversation_turns` rows containing
`SENTINEL_XSESSION_R_M1A` for a test member; assert on its presence/absence in the
captured prompt.

### Behavioral — recall disabled (sentinel must NOT appear in final prompt)

| # | Test | Path pinned |
|---|---|---|
| T1 | FAST, empty session, opted-out → prompt contains no sentinel (recentContext channel) | P2 |
| T2 | FAST, no `memoryContext` supplied, opted-out → MemoryFallback contributes no sentinel | P3 |
| T3 | FAST, route-built bundle, opted-out → bundle turns-bucket contributes no sentinel (`turnsCrossSession` forced 0 or bundle turns suppressed) | P4 |
| T4 | CORE, empty session, opted-out → `effectiveHistory` empty of cross-session pairs; `buildMaiaWisePrompt` output contains no sentinel | P5 |
| T5 | DEEP repair path, opted-out → `buildMaiaComprehensivePrompt` output contains no sentinel | P6b |
| T6 | DEEP consultation lane with `MAIA_USE_CLAUDE_CONSULTATION='true'` in test env, opted-out → consultation context history carries no sentinel | P6a |
| T7 | BETWEEN route history fallback, opted-out → `conversationHistory` handed to maiaService carries no sentinel | P7 |

### Behavioral — controls (prove the tests are non-vacuous)

| # | Test |
|---|---|
| T8 | **Positive control**: same setup as T1/T4, recall ENABLED → sentinel DOES appear. (A suite that never sees the sentinel proves nothing.) |
| T9 | **Sanctuary orthogonality**: sanctuary ON + recall enabled → sentinel absent (existing sanctuary behavior unchanged by the repair). |
| T10 | **Current-session preservation**: opted-out member with live same-session history containing `SENTINEL_SAMESESSION_R_M1A` → that sentinel STILL appears. The opt-out must never eat the current thread. |
| T11 | **Re-enable round-trip**: disable → turn (no sentinel) → enable → turn (sentinel present). |

### Static tripwires (regression pins, house style)

| # | Pin |
|---|---|
| T12 | Import pin: source scan asserts no file outside `{lib/maia/crossSessionHistory.ts, lib/memory/stores/TurnsStore.ts + its tests}` references `TurnsStore.getRecentTurns` or `getUserConversationHistory`. Frozen allowlist; failure text instructs "take it to the ruling," not "extend the list." |
| T13 | Gate-intact pin: `conversationalRecallBlock.ts` still suppresses on `recallEnabled === false`, and the governed accessor still contains the pref check (source-level assertion on both files). |
| T14 | Dead-route pin: `app/api/oracle/conversation/route.ts` gains no new import of the raw stores (superseded surface must not become a bypass). |

**Total: 14 tests** (11 behavioral, 3 static). T1–T7 + T12 are the invariant; T8–T11
guard against vacuous or over-broad enforcement.

---

## 6. Explicitly NOT resolved by this design (flagged for governance, not decided here)

1. **Derivative conversational content.** MemoryBundle's semantic-memory bullets,
   breakthrough records, relationship themes, MemberLiveContext session summaries /
   journal signals, and BETWEEN's SignificantMoments are *distilled from* conversations
   but are not raw exchange text. Does a refusal of conversational recall extend to
   derivatives? The founder invariant as worded governs "that same conversational
   history"; this design gates raw-exchange transport only. The derivative question is
   workpaper-03 gap 3 (Bundle/MemberWeb implicit consent) and needs its own ruling.
2. **Relationship memory** (`RelationshipMemoryService`, loaded in-service on all tiers)
   — same derivative class; untouched here.
3. **Identity of the consent surface**: the `?memberId` query-param fallback in
   `recall-preferences` (§1.1) — separate repair under the self-scoping ruling.
4. **DEEP asymmetry** (workpaper-03 gap 4: DEEP-primary's memory poverty when
   consultation is off) — orthogonal; this repair neither worsens nor fixes it.
5. **BETWEEN surface placement ruling** — whether BETWEEN should carry personal recall at
   all remains the open founder ruling in `ADDENDA_CHANNEL_DIVERGENCE` §IX; this design
   only ensures that *if* history flows there, it obeys the member's gate.
6. **Audit rows under suppression**: should `ConversationMemoryUsesStore` record a
   "retrieval suppressed by consent" event (observability of refusal) or record nothing?
   Recording nothing is the conservative default; deciding is a small governance call.
7. **Dead `excludeSessionId` parameter** in `getUserConversationHistory` — fix trivially
   during implementation, but its intended semantics (exclude vs include current session
   in cross-session fallback) should be stated when touched.
8. **Episodic layer parity**: `episodic_recall_enabled` has the same
   addendum-only-enforcement shape; the governed-boundary pattern should be extended
   there in a follow-on, not silently bundled into this repair.
