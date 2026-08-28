# JARVIS-MEMORY-SURFACING-01 — Phase M1 Census (read-only)

**Date**: 2026-08-28
**Branch**: `claude/memory-surfacing-audit-6z845t`
**Scope**: PWA/web voice path (`/api/voice/stream-conversation`), compared against the text path.
**Status**: Census only. **No code changed.** No writes, no schema, no deploy.

---

## 0. Headline

> The starting observation — `episodic/somatic/morphic/semantic/session = false` on a verified
> voice turn — **is not evidence about memory.** Those five flags are structurally guaranteed
> to be `false` on *every* voice turn, for a reason that has nothing to do with retrieval.

**Separately, and more urgently — F10: the live voice memory build is not sanctuary-gated.**
Cross-session memory is retrieved and injected into the prompt during Sanctuary voice sessions.
No write occurs, so retention holds; the no-retrieval boundary does not. Vow-level. Reported,
not repaired — the fix sits in a file shared with two other lanes and needs coordinator
authorization.

Outside Sanctuary, memory *does* reach MAIA on the voice path. What is missing there is not
access — it is **relevance**, **exclusion**, and **an audit trail**.

---

## I. The memory path actually used by voice

```
POST /api/voice/stream-conversation
  │
  ├─ [A] MaiaWisdomProvider.buildVoiceContext()        route.ts:803
  │       └─ MemoryBundleService.build()  ← BUILD #1
  │            → memoryDirective / spiralDirective / relationshipBrief
  │       → context.wisdomDirective, context.memoryContext, context.spiralContext
  │                                                     route.ts:1080-1087
  │       ✗ DEAD — see F5
  │
  ├─ [B] MemoryBundleService.build()      ← BUILD #2   route.ts:1170
  │       └─ formatForPrompt() → voiceMemoryContext
  │       → voiceSystemPrompt  (council + astrology + memory + canon guard)
  │                                                     route.ts:1202
  │       → claudeService.generateOracleResponseStreaming(msg, context, voiceSystemPrompt)
  │                                                     route.ts:1238
  │       ✓ LIVE — this is the only memory that reaches the model
  │
  └─ [C] fireAndForgetFieldMonitor({ ...no memoryContext... })
                                                        route.ts:1481
          ✗ BLIND — see F1
```

`MemoryBundleService` buckets: **A** recent cross-session turns · **B** `developmental_memories` ·
**C** `breakthrough_moments` · plus a relationship snapshot.

The five-layer *memory palace* (`MemoryPalaceOrchestrator`) is a **different mechanism** and is
invoked only by `/api/oracle/conversation`. Voice never calls it.

---

## II. Findings

### F1 — INSTRUMENTATION GAP (falsifies the starting observation) · CONFIRMED
`app/api/voice/stream-conversation/route.ts:1481` calls `fireAndForgetFieldMonitor` with
`memberId, sessionId, route, responseText, userMessage, element, voiceMode, relationalStance,
processingPath` — and **no `memoryContext`**.

`lib/consciousness/fieldMonitorTelemetry.ts:286`:
```ts
if (!memoryContext) {
  return { episodic: false, somatic: false, morphic: false, semantic: false, session: false };
}
```
All five flags are therefore `false` on every voice turn by construction. **The observation carries
no information about whether memory surfaced.**

### F2 — MECHANISM MISMATCH · CONFIRMED
`detectMemoryLayerHits` probes `significantEpisodes`, `somaticPatterns`, `activePatterns`,
`evolutionStatus`, `sessionMemory` — the `MemoryPalaceOrchestrator` shape. Even if the voice route
passed its `memoryDirective` (a `string`), all five would still read `false`. Fixing F1 alone
would produce a *different* false reading, not a true one.

### F3 — ATOMS ARE OUT OF SCOPE ON VOICE · CONFIRMED
`memory_atoms` has **no reader** in `lib/memory/**` or `lib/voice/**`; the voice route contains
zero `atom` references. Readers are `lib/maia/memoryAtomsLoader.ts` and the sovereign/list route.
"No surfacable atoms returned" on a **voice** turn is **CORRECT EXCLUSION by architecture**, not a
failure. (It would be a real finding on the sovereign/text path — not tested here.)

### F4 — ACCESS IS INTACT · CONFIRMED
Build #2 → `formatForPrompt()` (relationship line, recent continuity, ranked bullets, recent
breakthroughs) → `voiceSystemPrompt` → Anthropic `system` param
(`ClaudeService.ts:197` — `systemPrompt || this.buildMaiaSystemPrompt(context)`).
Memory reaches the model. Observable today via `[voice:prompt_weight:<turnId>] memory=<chars>`
and `📦 [Voice/MemoryBundle] bullets=N ... loaded=<bool>`.

### F5 — DEAD BRANCH + DUPLICATE BUILD · CONFIRMED
`context.wisdomDirective` / `.memoryContext` / `.spiralContext` are consumed **only** by
`buildCapabilityAwareness()` (`ClaudeService.ts:760-782`), reachable only from
`buildMaiaSystemPrompt()` — which the `voiceSystemPrompt` override bypasses. Consequences:

1. `MemoryBundleService.build()` runs **twice per voice turn**, both awaited before the LLM call.
   This sits inside the unattributed `llm_starting → llm_first_chunk` window the route already
   flags (4,070ms in the `19a2f166` trace).
2. **Spiral state never reaches the voice prompt.** `spiralDirective` is built and discarded.
   Voice has no spiral continuity; text does.
3. `relationshipBrief` is likewise built and discarded.
4. `emit('wisdom', { metadata })` reports `memoryBulletsUsed` from the **discarded** build —
   client-side observability describes the dead branch.

### F6 — RETRIEVAL GAP: the current message does not drive retrieval · CONFIRMED — **central**
`MemoryBundle.getSemanticMemories()` runs a non-vector query first and **returns early** when it
yields any row (`MemoryBundle.ts:246-258`). The vector path below it is reached only when a member
has **zero** developmental memories — and it then queries the same table
`WHERE vector_embedding IS NOT NULL`, which by construction also returns zero.

**The vector path is unreachable in both branches.** `queryText` (`currentInput`) is used only to
generate an embedding that is never consumed. The live ranking is:

```
0.40·decayed_confidence + 0.35·recency + 0.15·confirmed_by_user + 0.10·recall_count
```

— **no term for the current message.** Bucket B is *prominence* retrieval, not *relevance*
retrieval: the same top memories for every turn of a session, whatever the member says.

*Implication for M2:* a DIRECT RECALL probe succeeds only if the target memory already sits in the
member's global top-N by significance/recency. A failed direct-recall probe would therefore be a
**RETRIEVAL GAP**, not a storage or eligibility gap.

### F7 — RANKING: incomparable score scales · CONFIRMED
`rankCandidates` short-circuits on a pre-computed `compositeScore`, so bucket B keeps the SQL score
(range → ~0.87 max) while turns are scored in TypeScript
(`0.40·similarity + 0.30·significance + 0.20·recency + 0.10`). Turns are constructed with
`similarity: 0` (`turnsToCandidate`), permanently zeroing the 0.40 term → ~0.45 max.
**Developmental memories systematically outrank recent conversational turns**, regardless of which
is more relevant. The two scales are sorted against each other as if commensurate.

### F8 — NO EXCLUSION MECHANISM · CONFIRMED
`deduped.slice(0, maxBullets)` with **no minimum-score threshold**. Exclusion is rank-order
truncation only. For any member with ≥5 candidates, **5 bullets surface on every turn** whether or
not anything is relevant.

> Constitutionally this is the load-bearing one: the mission requires *access* **and** *exclusion*.
> Exclusion currently has no mechanism to fail or succeed — only a fixed cutoff.
> A NEGATIVE CONTROL probe cannot pass today by design.

### F9 — NO AUDIT TRAIL FOR VOICE TURNS · CONFIRMED
`ConversationMemoryUsesStore.recordRetrievedCandidates()` is gated on
`traceId && sessionId && userId` (`MemoryBundle.ts:104`). The live voice build (#2) passes
`userId, currentInput, sessionId, scope, maxBullets` — **no `traceId`**. So voice turns write **no**
`conversation_memory_uses` rows. The per-memory inclusion/exclusion record M2 needs does not exist
for the voice path.

### F10 — SANCTUARY RETRIEVAL GUARD MISSING ON THE LIVE BUILD · CONFIRMED — **vow-level**

`app/api/voice/stream-conversation/route.ts:1168` guards the live memory build with:

```ts
if (userId) {                    // ← NOT `if (userId && !sanctuary)`
  const bundle = await MemoryBundleService.build({ userId, currentInput: message, ... });
  voiceMemoryContext = MemoryBundleService.formatForPrompt(bundle) || '';
}
```

`voiceMemoryContext` is then joined into `voiceSystemPrompt` **unconditionally** (route.ts:1202).

Every other retrieval/persistence site in this route is sanctuary-gated — identity context
(`userId && !sanctuary`, :839), idea capture (:1392), training log (:1459), field monitor (:1480),
trust observation (:1495) — and `MaiaWisdomProvider.buildVoiceContext` implements an explicit
hard wall that returns `SANCTUARY_DIRECTIVE` with no retrieval. **Build #2 bypasses that wall.**

There is no early return for sanctuary before :1168, and the LLM path demonstrably executes under
sanctuary (`context.sanctuary` is passed at :1084). The site is reachable.

**Effect:** in a Sanctuary voice session, cross-session turns, developmental memories and
breakthrough moments are retrieved and injected into the system prompt.

**Not affected:** no *write* occurs — `recordRetrievedCandidates` is gated on a `traceId` this call
does not pass (F9). So this is a **retrieval + prompt-injection** breach, not a retention breach.
Sanctuary Invariant 1 ("no content retention") appears to hold; Invariant 6 ("absolute boundary")
and the `MaiaWisdomProvider` no-retrieval contract do not.

**Provenance:** the R2 comment block immediately above (`CANONICAL CONTINUITY SUBSTRATE`) indicates
build #2 was added to give voice the same contributors as text. The sanctuary predicate was present
in the branch it duplicated (the wisdom provider) and was not carried across.

**Not repaired in M1.** The fix is a one-predicate change in a file shared with VOICE-CAPTURE and
ALLOY-PROSODY. Reported to the programme coordinator for authorization rather than crossing the
lane boundary. Recommended as its own minimal PR ahead of the rest of this lane.


---

## III. Adjudication against the M3 table

| Boundary | Verdict |
|---|---|
| STORAGE GAP | **Not established.** Not probed; no evidence either way. |
| IDENTITY GAP | **Not established.** `userId` gates all retrieval; lineage not probed. |
| **RETRIEVAL GAP** | **CONFIRMED (F6).** `currentInput` never influences developmental retrieval. |
| **RANKING GAP** | **CONFIRMED (F7).** Cross-scale sort; turns structurally disadvantaged. |
| COMPOSITION GAP | **Refuted for the live branch (F4).** Confirmed for the dead branch (F5) — spiral state is lost. |
| BEHAVIORAL GAP | **Not established.** Requires M2 runtime probes. |
| CORRECT EXCLUSION | **Cannot be demonstrated (F8).** No eligibility mechanism exists to credit. |
| *(new)* INSTRUMENTATION GAP | **CONFIRMED (F1, F2, F9).** The evidence surface is blind, mismatched, and unrecorded. |
| *(new)* **SANCTUARY BREACH** | **CONFIRMED (F10).** Live build is not sanctuary-gated; memory is retrieved and injected in Sanctuary voice sessions. |

---

## IV. What M1 does **not** claim

- Not that memory is broken. Memory reaches the voice prompt (F4).
- Not that any specific member memory failed to surface — no runtime probe was run.
- Nothing about the sovereign/text atoms path beyond "voice does not consult it."
- No claim about the DEEP tier or the oracle/conversation memory palace.

---

## V. Recommended M2 sequence (not authorized here)

M2 is blocked on F1/F9: the current evidence surface cannot distinguish the M3 boundaries. The
**smallest** unblocking change is observability-only, read-path untouched:

1. Pass a `traceId` into the live voice `MemoryBundleService.build()` so
   `conversation_memory_uses` records candidates for voice turns (F9). *Restores the existing
   audit trail; adds no new mechanism.*
2. Log `bundle.retrievalStats` (already computed, currently dropped) on the voice turn —
   `totalCandidates`, `semanticHits`, `breakthroughsFound`, `afterRanking`.
3. Either pass a correctly-shaped `memoryContext` to `fireAndForgetFieldMonitor`, **or** stop
   emitting the five palace flags on routes that do not run the palace (F1/F2). Emitting a
   guaranteed-`false` flag is worse than emitting none: it reads as evidence.

Only then run the A/B/C probes (direct recall · implicit relevance · negative control).

**Repairs deliberately NOT proposed yet** — each needs its own decision and its own proof:
F5 (dead branch / duplicate build / lost spiral state), F6 (relevance retrieval),
F7 (score commensurability), F8 (eligibility threshold). None should be touched before M2 shows
which boundary actually bites a real member memory.

---

## VI. Constitutional note

F6 + F8 together mean the voice path currently implements **"the member's most prominent memories,
always"** rather than **"the right memory when it matters."** That is a defensible interim posture —
it is not stealth memory, not synthesis, and not cross-member leakage — but it should not be
described as situated recall. Per the growth-obligation check: the uncertainty to preserve here is
that *MAIA does not currently know whether a surfaced memory is relevant to what was just said*, and
nothing in the prompt tells her so.
