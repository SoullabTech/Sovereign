# A1 — CONTROLLED SYNTHETIC WITNESS, LIVE ROUTE — evidence record

Production: soullab@minisforum · container `maia-sovereign` · image sha256:7a2289024d2d… ·
GIT_COMMIT=3d1e27348 (verified against container env) · DB `maia_consciousness` in `maia-postgres`.
Route exercised: POST `/api/sovereign/app/maia/list` (called on container-internal localhost:3000).
Code read bound to commit `3d1e27348` only — the local worktree (HEAD d41b8b355,
branch feature/labtools-redesign) DIFFERS from the deployed commit for the list route.

## 1. Synthetic identity
- members.id            = a5fa4900-ed41-4a15-9fd0-f15615abc475
- username              = a1-synthetic-witness-20260812T224206Z
- passkey               = A1-SYNTH-20260812T224206Z
- password_hash         = '!SYNTHETIC-A1-NO-LOGIN-NOT-A-VALID-HASH!'  (deliberately unusable)
- auth_sessions.id      = 9a0578ff-60a8-45b7-8885-559499baad03 (plaintext token, 6h expiry)
- sessionId (client-supplied, accepted) = 70363e16-42b1-4380-b0e6-ed6b44cab479

## 2. Durable artifacts created (RETAINED — no cleanup performed)
Full id lists: `durable-artifacts.txt`, `agent_runs-ids.txt`.

AUTHORIZED classes:
- members                    1  a5fa4900-ed41-4a15-9fd0-f15615abc475
- auth_sessions              1  9a0578ff-60a8-45b7-8885-559499baad03
- maia_sessions              1  70363e16-42b1-4380-b0e6-ed6b44cab479
- maia_turns                 2  173850, 173851
- memory_transition_records  8  1093–1100
- developmental_memories     1  8720548b-2a07-4c71-afd1-a751f415749e
- breakthrough_moments       1  fb0835cf-66b5-4bfc-ac72-c5348dc4ce5d
- conversation_insights      0  (threshold did not fire — neither forced nor suppressed)

OUTSIDE the literally-named classes (see §8 finding A):
- conversation_turns          4  291a779d…, ec9d75ff…, a87fe0c6…, 5b4c75e5…
- agent_runs                 17  (see agent_runs-ids.txt)
- ain_shape_telemetry         4  7299–7302
- field_orchestrator_telemetry 2 3697, 3698
- integration_passes          2  3fa2c2cb…, c55ac14d…
- maia_decisions              2  2b1469d5…, 4f30b5e0…
- member_relationships        1  a9eac784-2670-43c8-902d-39d8f45d7983
- relationship_entries        1  428760f6-0a06-48a5-bd10-1c1f88ffb6f2
- relationship_essences       1  9422cfc9-2eff-43d4-b5a5-3f52245daf7a
- runtime_consent_state       2  3545f69f…, b58a6276…
- socratic_validator_events   2  4236, 4237

FK re-verification: no runtime write-target carries an FK to `members` except `auth_sessions`
(ON DELETE CASCADE). `conversation_turns` self-references only. Founder's retention analysis
holds and extends to the unnamed tables.

## 3. Routing per turn  (EVENT_OBSERVED)
- Turn 1: `🚦 Processing Profile: CORE | Turn 1 | Length: 115`
- Turn 2: `🚦 Processing Profile: CORE | Turn 2 | Length: 184`
Both CORE. No DEEP: `DEEP PATH` never emitted. Routing stayed inside FAST/CORE.

## 4. Six-seam verdicts (Turn-1 continuity → Turn-2 prompt)
| Seam | Verdict | Basis |
|---|---|---|
| availability  | EVENT_OBSERVED | Turn-1 pair present in `conversation_turns` before Turn 2 |
| persistence   | EVENT_OBSERVED | rows 291a779d (user), ec9d75ff (assistant), queried directly |
| retrieval     | EVENT_OBSERVED | CORE fetched via TurnsStore.getRecentTurns (only path available; meta.conversationHistory was empty) |
| admission     | EVENT_OBSERVED | `🔄 [Conversation History] Included 1 exchanges in prompt` |
| composition   | EVENT_OBSERVED | same marker: source appends the block then logs inside one guard |
| influence     | NOT_OBSERVABLE | out of scope by design; pass question stops at prompt boundary |

## 5. Prompt-inclusion evidence (the pass criterion)
`2026-08-12T22:43:44.560993172Z 🔄 [Conversation History] Included 1 exchanges in prompt`

Emission point (maiaVoice, commit 3d1e27348, ~line 864-871):
```js
if (recentExchanges.length > 0) {
  adaptedPrompt += `\n\n🔄 RECENT CONVERSATION (for memory and continuity):\n${recentExchanges}...`;
  console.log(`🔄 [Conversation History] Included ${conversationHistory.length} exchanges in prompt`);
}
```
Append precedes the log inside the same guard ⇒ the marker fires iff the text entered the prompt.

Absence is readable — denominator contrast:
- `⚡ [CORE] Parallel fetch complete` fired on BOTH turns (22:42:58.362, 22:43:44.555)
- `🔄 [Conversation History]` fired on Turn 2 ONLY (1 occurrence in 567 captured lines)
Turn 1 had no prior exchange and correctly produced no marker.

CONTENT CAVEAT: the marker records a COUNT, not content. That the included exchange was
specifically the copper-kettle turn is INFERRED — but the referent set is fully constrained:
`getRecentTurns` filters by user_id, and this member had exactly one prior exchange.

## 6. Provider-path evidence (EVENT_OBSERVED)
- Turn 1: `🧠 Using Claude (Anthropic) as primary` → `✅ Claude (sonnet): 278 chars, 5053ms`
- Turn 2: `🧠 Using Claude (Anthropic) as primary` → `✅ Claude (sonnet): 448 chars, 3897ms`
- Response metadata both turns: providerUsed=anthropic, model=claude-sonnet-4-6, modeUsed=cloud
- `🔮 Using local Ollama consciousness processing` appears twice, but BOTH strictly AFTER the
  Claude completion timestamp (22:43:03.528 > 22:43:03.423; 22:43:48.578 > 22:43:48.454).
  Post-response processing, NOT the generation path. Local model identity remains NOT_OBSERVABLE.

## 7. Delivery / persistence
Turn 1: HTTP 200, 5655ms, 276-char reply, turnId 173850.
Turn 2: HTTP 200, 4177ms, 446-char reply, turnId 173851.
Both replies persisted to conversation_turns and maia_turns. Container: running/healthy,
RestartCount=0, StartedAt unchanged (no restart or recreate occurred).

## 8. Findings
A. AUTHORIZATION UNDER-DESCRIBES THE ROUTE. Normal `/list` operation wrote 11 tables not named
   in the authorized class list. `maia_turns` IS written (via maiaService → logMaiaTurn), so the
   list was incomplete rather than wrong — but the primary conversational turn store for this
   route is `conversation_turns`, which was never named while `maia_turns` was.
B. OBSERVABILITY CONTRADICTS BEHAVIOUR. Turn 2 reported
   `memoryHealth.conversational="empty"`, `continuityConfidence:"low"`, and
   `📦 [Route/MemoryBundle] Turns: 0 (same-session: 0, cross: 0)` — while continuity DID reach
   the prompt through a different channel (CORE crossSessionTurns → effectiveHistory).
   Two independent retrieval channels exist; the health surface reports only the one that failed.
C. CLIENT-SUPPLIED HISTORY. `conversationHistory` arrives from request `meta`. Server-side
   retrieval is gated on `conversationHistory.length === 0`. A client that sends history
   suppresses the server path entirely — so a naive test that echoes history back would have
   proven nothing. Turn 2 deliberately sent none.
D. Pairing loop is order-sensitive (expects user@i, assistant@i+1). `getRecentTurns` returns
   `ORDER BY created_at DESC, seq DESC` then `.reverse()` → chronological. Correct here.

## 9. Unresolved seams
- UNRESOLVED: exact content of the injected exchange (log records counts, not content) — §5 caveat.
- UNRESOLVED: whether developmental_memories / breakthrough_moments / memory_transition_records
  rows were written BEFORE or AFTER generation, and whether any were read into Turn 2. Their
  existence is NOT evidence of influence.
- NOT_OBSERVABLE: local model identity; influence of prompt content on response.
- UNRESOLVED: FAST-path continuity. Both turns routed CORE, so `🧠 [FAST/MemoryDebug]`
  never fired (0 occurrences). FAST continuity is untested by this encounter.
