# AIN-CONTEXT-01 · ACT 1 — LONGITUDINAL CONTINUITY FAILURE CENSUS

**Lane**: `AIN-CONTEXT-01` — Context Assembly / Longitudinal Continuity
**Act**: 1 of 9. **CENSUS ONLY.** No redesign, no summarizer, no prompt change, no memory change.
**Date**: 2026-09-15
**Branch**: `claude/sweet-mayer-on4m5x`
**Tree**: `8cb6406`
**Method**: source and migration reading of the working tree only. ⛔ **No database was queried, no
container inspected, no production traffic observed, no token count measured, no model invoked.**
Every claim is a claim about **code and schema**, never about **traffic**, unless marked otherwise.

---

## 0. THE ONE-SENTENCE ANSWER

> **MAIA's durable transcript and MAIA's accessible continuity are two different things, and
> nothing in the canonical live path connects them.** Every member turn and every MAIA turn is
> written durably to `conversation_turns`. The prompt's verbatim window is not read from that
> table — it is **supplied by the browser** from an array the client hard-caps at 100 messages and
> **slices**. Past that cap the earlier turns remain on disk and have **no read path into
> cognition**. The system's only present answer to the resulting gap is a prompt instruction
> telling MAIA to ask the member to say it again.

Stated against the founder's invariant:

> *Conversation length may change how prior material is represented, but must never by itself make
> significant relational history unrecoverable.*

**The invariant is violated today, and it is violated on the recovery side, not the storage side.**
Source survives. The path back does not exist. From the member's chair those are the same event.

---

## 1. THE MEASURED PATH

This census measures the **canonical live surface**: `app/api/sovereign/app/maia/list/route.ts`,
established as the live, client-wired, mounted ingress by the CMT-01 census
(`docs/programme/MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md` §1.4) and not re-derived here.
`between/chat` is sampled where it differs materially. Voice converges at the client into the same
route (`__tests__/voice-non-degradation.test.ts`) and is therefore covered by the same findings.

Inherited without re-verification (CMT-01 §1.4, §5, §8): route topology, liveness classes, the
`/list` ⇄ `between/chat` addendum disjunction, and the D1 FAST-tier sovereignty-gate divergence.
**This census does not re-open those and does not depend on them being repaired.**

---

## 2. WHERE FULL TURNS ARE STORED

| Store | Written by | Grain | Cross-session? | Reaches prompt? |
|---|---|---|:--:|:--:|
| `conversation_turns` | `lib/memory/stores/TurnsStore.ts:125,215,274,281` | one row per turn, full `content`, no truncation | yes (keyed `user_id`) | **⛔ not on `/list`** |
| client `messages[]` (React state) | `components/OracleConversation.tsx` `appendMessageCapped` | message objects | no | ✅ **this is the window** |
| `localStorage[storageKey]` | `OracleConversation.tsx:3127` | `pgMessages.slice(-50)` | no | via client merge |
| `episodic_memories` (member-marked) | member gesture | `verbatim_text` + `source_turn_id` + `source_session_id` | yes | ✅ limit 5 |
| `member_sessions.summary` | `SessionSummaryStore.writeSummary` | session summary text | yes | **⛔ no prompt reader** |

**The durable store is sound.** `conversation_turns` carries `user_id`, `session_id`, `role`,
`content`, `exchange_id`, `seq`, `posture_at_creation`, `provenance`. Content is stored whole.
`/list` writes the member turn at `route.ts:422` (before cognition) and MAIA's turn at `:1552`
(after). Nothing in this census found a code path that deletes turns except two explicit ones:
`scripts`-level scribe teardown (`app/api/scribe/end-session/route.ts:107`) and
`TurnsStore.ts:293`, both scoped `WHERE session_id = $1`.

> **Recorded plainly: the raw transcript is durable and is not the defect.**

---

## 3. WHERE OLD TURNS STOP ENTERING CONTEXT

### 3.1 The cap is in the browser

```
components/OracleConversation.tsx:335  MAX_DISPLAY_MESSAGES = 100
components/OracleConversation.tsx:342  MAX_API_HISTORY     = 100
```

`appendMessageCapped` (`:348`) ends with:

```ts
return updated.length > maxMessages ? updated.slice(-maxMessages) : updated;
```

That `slice` is the event. Message 1 does not move to an archive, a summary, or a secondary
buffer — **it leaves the array.** `truncateHistoryForAPI` (`:372`) then merges
`historicalMessagesRef.current` with the current array, dedupes by id, and returns
`allMessages.slice(-maxMessages)`.

The request body carries the result (`:5475`):

```ts
conversationHistory: truncateHistoryForAPI(nextMessagesForApi, historicalMessagesRef.current),
```

### 3.2 The server consumes what the client sent

`app/api/sovereign/app/maia/list/route.ts:828`:

```ts
const conversationHistory = ((meta as any)?.conversationHistory || []) as Array<...>;
```

and `:832` further narrows for one consumer: `conversationHistory.slice(-6)`.

**⭐ FINDING C1 — THE VERBATIM WINDOW ON THE CANONICAL ROUTE IS CLIENT-SUPPLIED.**
`/list` contains no in-session `SELECT … FROM conversation_turns`. The server writes the
transcript and then asks the browser what the conversation was. The authority over MAIA's
recent-past is therefore held by a React ref on a device, not by the sovereign store.

Consequences that follow structurally, ⛔ none of them observed in traffic by this census:
- the window is only as long as that device's array;
- a second device continues the *same* member's session from **its own** reconstruction;
- a client that omits or shortens the field silently shortens MAIA's memory with no server signal.

> `between/chat` is the counter-example and is architecturally better here:
> `route.ts:1090` calls `getConversationHistory(safeSessionId, 20)`, a real server-side read.
> **The two live routes disagree about where conversational truth lives.**

### 3.3 The comment at the cap states the problem in the code's own words

`OracleConversation.tsx:342`:

> *"Send last 100 messages (~50 exchanges) to API. **Raised from 30 to extend depth before MAIA
> hits the wall and confabulates about her own architecture.** Paired with the 'Memory Posture'
> instruction in buildSacredAttendingPrompt — when the gap is hit, she asks rather than fabricates."*

This is an honest comment and a well-made mitigation. It is also the census's clearest evidence
that **the wall is known, is treated as a fixed property, and is managed by raising a number and
by instructing MAIA how to behave when she hits it.**

---

## 4. ARE THEY STILL RETRIEVABLE AFTER THAT?

**Not into the prompt, on `/list`.** Enumerated exhaustively:

| Candidate recovery path | Reaches `/list` prompt? | Why it cannot recover the current long conversation |
|---|:--:|---|
| `loadPriorCrossSessionExchanges` (`lib/maia/memoryLoaders.ts:195`) | ✅ yes | **⛔ excludes the current session by predicate**: `AND ($2::text IS NULL OR session_id <> $2)`. Also `LIMIT 6` and `LEFT(content, 600)` |
| `loadRecentMarkedEpisodes` (`:283`) | ✅ yes | only rows the member explicitly marked; `LIMIT 5`; `ORDER BY created_at DESC` |
| `getConversationHistory` (`lib/sovereign/sessionManager.ts:127`) | ⛔ no — `/list` never imports it | reaches `between/chat` only |
| `/api/conversation/turns` | client-side restore only | see §6 |
| `member_sessions.summary` | ⛔ no prompt reader exists | see §5 |
| `memberWebAddendum`, `atomsAddendum`, semantic retrieval | ✅ yes | these are **derived** objects, not the transcript; none returns a turn |

**⭐ FINDING C2 — THE ONE SERVER-SIDE TRANSCRIPT READER THAT REACHES `/list` IS DEFINED TO EXCLUDE
THE CONVERSATION THE MEMBER IS IN.** `loadPriorCrossSessionExchanges` was built for a different
and legitimate purpose — *prior* sessions. Nothing was built for *this* session's displaced turns.
The gap is not a bug in a component; **it is an absent component.**

Its two shaping constants are also worth recording as continuity limits in their own right:
`LIMIT 6` and `LEFT(content, 600)` — cross-session recall is six turns, each clipped at 600
characters, with no marker in the text that clipping occurred.

---

## 5. WHERE SUMMARIES ARE CREATED — AND THE GOOD NEWS

**There is no rolling conversational summary on any live cognition path.**

- `session_summary_queue` exists (`database/migrations/20260209000001_session_summary_pipeline.sql`)
  with correct Sanctuary law at the schema level (`mode` stored so it is verifiable at every step).
- `SessionSummaryStore.writeSessionRecord` **forces `summary` to null** as defence in depth
  (`lib/memory/stores/SessionSummaryStore.ts:57` — `const safeSummary = isSanctuary ? null : summaryText`),
  and `lib/sovereign/sessionFinalizer.ts:131` writes the metadata row with summary null.
- `SessionSummaryStore.writeSummary` (`:92`) is the worker's write seam.
- **The only reader is `app/api/sovereign/session/summaries/route.ts` — an API surface, not the
  prompt.** No cognition path in this census consumes a session summary.

**⭐ FINDING C3 — THE COMPOUNDING-LOSS FAILURE THE FOUNDER WARNED ABOUT DOES NOT EXIST YET,
BECAUSE THE SUMMARY LAYER IS NOT LIVE.** There is no summary-of-summary, no overwrite of previous
representation, and no place where a derivative object has displaced source material.

⭐ This is the single most valuable fact in the census for sequencing. **The layered-continuity
architecture can be built into an empty slot rather than unwound from a lossy incumbent.** The
ordinary failure mode — one rolling summary, entrenched, load-bearing, and quietly lossy — is
still avoidable here. It will not stay avoidable once a summarizer ships.

Answering the founder's two questions exactly:
- *Are summaries replacing source material or supplementing it?* — **Neither. No summary reaches
  cognition.** Source is not replaced because nothing has been put in front of it.
- *Does any summarization overwrite previous representation?* — **Not on the live path.**
  `writeSummary` is an `UPDATE … SET summary = $3` on `member_sessions`, so a *second* generation
  for the same session would overwrite the first, ⚠️ but no reader consumes it and no scheduler
  was traced in this census. Recorded as a **latent** overwrite, not a live one.

---

## 6. SESSION RESTORE — TWO WINDOWS THAT DISAGREE

On mount, `OracleConversation.tsx:3093-3143` reconstructs `historicalMessagesRef`:

1. **localStorage** — whatever was cached, written as `pgMessages.slice(-50)` (`:3127`) — the **last 50**.
2. **PostgreSQL** — `apiFetch('/api/conversation/turns?sessionId=…&userId=…')`.
3. **Selection rule** (`:3124`): `if (pgMessages.length > loadedMessages.length)` — *prefer whichever
   array is longer.*

The endpoint (`app/api/conversation/turns/route.ts:69-75`), session-scoped branch:

```sql
SELECT id, role, content, created_at as "createdAt"
FROM conversation_turns
WHERE user_id = $1 AND session_id = $2
ORDER BY created_at ASC
LIMIT 100
```

**⭐⭐ FINDING C4 — SESSION RESTORE RETURNS THE OLDEST 100 TURNS, NOT THE MOST RECENT.**
`ORDER BY created_at ASC LIMIT 100` takes turns 1–100. The cross-session branch immediately below
it (`:78-84`) correctly uses `ORDER BY created_at DESC LIMIT 50`. **The two branches of the same
handler order in opposite directions**, and only the DESC one is recency-correct.

Consequence, derived from source and ⛔ not yet witnessed against a database: for any session that
has exceeded 100 turns, a reload restores **the beginning of the conversation and discards
everything recent**. The length comparison at `:3124` then actively prefers that 100-row oldest
set over a 50-row localStorage cache that *was* recency-correct — so **the longer array wins and
the more recent array loses.**

This is the sharpest available answer to the founder's question *"Can MAIA retrieve a specific
statement from turn 18 at turn 140?"*:

> After a reload in a 140-turn session: **turn 18 — yes. Turn 138 — no.** The architecture
> currently preserves the oldest material and drops the newest, which is the reverse of what a
> conversation needs and the reverse of what the member will assume.

✅ **WITNESSED 2026-09-15 by `C4-WITNESS-01` — RED.** On a disposable shadow with a 150-turn
session (150 distinct timestamps), the real route returned exactly the oldest 100 and excluded
the newest turn. Record: `AIN-CONTINUITY_C4-WITNESS-01_RESULT_2026-09-15.md`.
⚠️ The original classification is kept below, struck rather than deleted.

~~Classified **DERIVED, UNWITNESSED**. It follows from reading three files. It has not been run.~~
It is the **first thing ACT 4's baseline must confirm or refute**, because if it is real it is a
one-line ordering defect producing a large relational failure, and if it is not real this census
wants to know why.

⛔ **Not repaired here.** It is a live member-facing read path outside this act's authority, and a
census that fixes what it finds stops being able to say what it found.

---

## 7. WHAT HAPPENS AT 20 / 50 / 100 / 200 TURNS

Turn counted as one message (a member turn and a MAIA turn are two). All figures are **code-derived
ceilings**, ⛔ never measured token counts.

| Conversation length | In the prompt | Durable | Recoverable into cognition |
|---|---|---|---|
| **20** | all 20 | all | all |
| **50** | all 50 | all | all |
| **100** | all 100 (at the cap) | all | all |
| **200** | last 100 only | all 200 | **turns 1–100: none** — no reader exists (§4) |
| **200, after reload** | oldest 100 of the session, per §6 | all 200 | **turns 101–200: none** |

The 100-message ceiling is ~50 exchanges. Against the founder's planted-object scenario, a 150-turn
conversation places every object before turn ~50 outside the window permanently, unless the member
explicitly marked it as an episode (§8).

⛔ **No token budget is enforced anywhere in this path.** No `tiktoken`, no counter, no ceiling
check was found in the `/list` assembly. The cap is a **message count**, which means the same 100
messages can be 4k tokens or 60k tokens. Whether the assembled prompt has ever exceeded a model or
rate limit is **unmeasured and unknowable from source** — recorded as an owed measurement, not as a
claim that it has.

---

## 8. PROTECTED ANCHORS — THE PRIMITIVE EXISTS AND IS NARROW

The founder's "protected anchors" layer has a real precedent already in the tree, and it was built
with the right constitution.

`database/migrations/20260531000001_episodic_member_marked_provenance.sql` adds to
`episodic_memories`: `verbatim_text`, `marked_by_member BOOLEAN NOT NULL DEFAULT FALSE`, with a
CHECK enforcing *verbatim_text is non-empty **if and only if** marked_by_member is TRUE*, and the
loader (`lib/maia/memoryLoaders.ts:283`) carries `source_turn_id` and `source_session_id`.

⭐ **That is exactly the shape the founder described**: a retrievable unit, verbatim, with
source-turn provenance, whose privileged standing comes from a member act rather than from a
model's judgment of importance.

Its limits, recorded precisely:

| Property | Today |
|---|---|
| Admission | **explicit member mark only** — no MAIA-proposed, no automatic |
| Count | `LIMIT 5` |
| Ordering | `ORDER BY created_at DESC` — **recency, not significance** |
| Consequence | anchor #6 falls off; an anchor from turn 12 is displaced by five later ones |
| Gate | `loadEpisodicRecallPref(userId)` — consent-gated, correct |
| Prompt reach | ✅ `route.ts:1087` → `meta.episodicRecallAddendum` → FAST template `maiaService.ts:1507` |

**⭐ FINDING C5 — PROTECTION EXISTS; PREFERENTIAL SURVIVAL DOES NOT.** Nothing in the current
system causes a correction, a decision, a boundary, a commitment, or an unresolved question to
survive compression preferentially. The only material that outlives the window is material the
member manually marked, and even that is capped at five and ordered by recency.

---

## 9. CORRECTIONS AND REJECTED INTERPRETATIONS — THE ANSWER IS NO

The founder's decisive scenario: MAIA offers "abandonment" at turn 23; the member rejects it at
turn 27; the subject returns at turn 117.

**Census result: no correction-standing primitive reaches cognition on any live path.**

| Primitive | Location | Reaches prompt? |
|---|---|:--:|
| `accumulating_hypotheses` with `user_initiated` weighted 0.95 | `20260311000001_accumulating_hypotheses.sql:168`; `lib/consciousness/hypothesisBuffer.ts` | **⛔ no** — importers are `app/api/members/ledger/route.ts` and `…/annotate/route.ts` only |
| `correction_detected` | `20260317000001_ain_shape_telemetry_continuity.sql:30`, written `route.ts:1604` | **⛔ no** — telemetry; write-only relative to the prompt |
| `latestBlockHasCorrection` | `lib/team/maiaThreadReflection.ts:189` | ⛔ no — team thread surface, not member cognition |
| append-only correction law | `20260901000001_ask_threads.sql:108`, `20260914000005_editorial_ontology.sql:244` | n/a — Ask/editorial lanes, ⭐ **the right law, in the wrong room** |

**⭐⭐ FINDING C6 — WITHIN THE WINDOW, A REJECTED INTERPRETATION AND ITS REJECTION HAVE IDENTICAL
STANDING; OUTSIDE THE WINDOW, NEITHER SURVIVES — BUT DERIVED LAYERS MAY OUTLIVE BOTH.**

The first two clauses are benign: while turns 23 and 27 are both in the verbatim window, the model
sees the correction in sequence, which is the ordinary case and usually works. Once the window
slides past turn 27, both leave together, which is a loss but a *symmetric* loss.

The third clause is the hazard, and it is structural rather than hypothetical. The derived layers
that **do** persist and **do** reach the prompt — `memberWebAddendum` (patterns, summaries,
journals), `atomsAddendum`, Anamnesis `relationship_essences` (written fire-and-forget at
`route.ts:1660`), `living_field_affinities` — are written continuously from turn material and are
**not** governed by any mechanism that binds a later correction to the material it corrected.
Nothing found in this census causes a rejection at turn 27 to travel with, suppress, or annotate an
inference derived from turn 23.

⛔ **This census does not claim that an "abandonment" inference has ever survived its own
correction and resurfaced.** Establishing that requires ACT 5's adversarial corpus. What the census
establishes is narrower and sufficient: **there is no mechanism that would prevent it.** The
asymmetry that makes it plausible is that the interpretation gets written into durable derived
stores as it is formed, while the correction is only a conversational turn.

⭐ Two lanes in this repository have already ratified the correct law for exactly this —
*"a correction is a new turn, never a revision of one already spoken"* (`ask_threads`) and the
authored-record analogue (`editorial_ontology`). **The law exists; it has never been extended to
member memory.**

---

## 10. THE CURRENT MITIGATION IS A PROMPT, NOT A PATH

`lib/maia/prompts/memoryCanonGuard.ts:47` — `MEMORY_CANON_GUARD_PROMPT`, reached by
`MAIA_RUNTIME_PROMPT.ts:470`, `maiaService.ts:220`, and `voice/stream-conversation/route.ts:1236`.
It forbids the "I don't have memory between conversations" family and prescribes:

> *"My continuity is partial right now. Remind me what you told me, and we'll pick up the thread."*

**⭐ FINDING C7 — THE MEMBER IS THE RECOVERY MECHANISM.** This block is well-built, honest, and
correct given the architecture beneath it: it refuses to let an operational gap be misreported as
an identity limitation, and it prefers asking to confabulating. Its closing sentence is doctrinally
right — *"The person re-introducing context is the conversation working, not failing."*

⚠️ And it is load-bearing in a way the lane must hold precisely: **it is the entire answer to §4.**
Where the architecture has no path back, MAIA asks the member to be the path back. That is the
correct behaviour to keep. It is not a substitute for recoverability, and it should not be allowed
to become one by continuing to work well enough.

---

## 11. CROSS-SESSION vs SESSION-SCOPED — WHICH STORES CROSS

| Carrier | Crosses sessions? | Mechanism |
|---|:--:|---|
| `conversation_turns` (store) | ✅ | keyed `user_id` |
| `/list` verbatim window | **⛔ no** | client array, reset per mount |
| `loadPriorCrossSessionExchanges` | ✅ | ⛔ but excludes current session; 6 rows; 600 chars |
| `loadRecentMarkedEpisodes` | ✅ | 5 rows, member-marked |
| atoms / memberWeb / Anamnesis essence | ✅ | derived |
| `between/chat` history | **⛔ no** | `getConversationHistory(sessionId, 20)` — session-scoped |
| `member_sessions.summary` | ✅ stored | ⛔ no prompt reader |
| localStorage | ⛔ device-local | `slice(-50)`, cleared at `:1462, 6747, 7605, 7731, 10849` |

*"Can she recover an unresolved thread after a session boundary?"* — **Only if it became an atom, a
marked episode, or a derived pattern.** As a *thread* — an open question carried forward as open —
**no.** No store found in this census represents unresolvedness. `expansion_events.validated`
(`20260113000005_expansion_events.sql:215`) has a NULL=pending tri-state, the nearest thing, and it
does not reach cognition.

---

## 12. ONE THING THE ARCHITECTURE ALREADY GETS RIGHT

`lib/sovereign/maiaService.ts:1507` — the FAST template places `MAIA_RUNTIME_PROMPT` **first**, with
volatile addenda appended after it. The constitutional core is therefore already at the front of the
prompt, which is the cache-stable position. ⛔ No caching is configured or claimed anywhere in this
path, and this census measured no cache behaviour — but the ordering a prefix-cache would require is
**already the ordering in use**, and the eventual layer should be careful not to lose it.

⚠️ Counter-observation, recorded so it is not lost: `userIdentification` is interpolated second,
immediately after the constitutional core and ahead of everything else. It is stable per member but
not per deployment, so the stable prefix is stable **per member**, not globally.

---

## 13. FINDINGS INDEX

| # | Finding | Class | Evidence |
|---|---|---|---|
| **C1** | The `/list` verbatim window is client-supplied; no in-session server read exists | **architectural** | §3.2 |
| **C2** | The only transcript reader reaching `/list` excludes the current session by predicate | **architectural** | §4 |
| **C3** | No summary layer is live — the compounding-loss failure is still avoidable | ⭐ **sequencing** | §5 |
| **C4** | Session restore returns the **oldest** 100 turns; the sibling branch is correctly DESC | ⚠️ **derived, unwitnessed** | §6 |
| **C5** | Protected anchors exist (member-marked, provenance-bearing) but cap at 5 and order by recency | **capability limit** | §8 |
| **C6** | No correction-standing primitive reaches cognition; derived layers may outlive the correction | **epistemic** | §9 |
| **C7** | The present answer to lost continuity is a prompt instruction asking the member to re-supply | **doctrinal** | §10 |
| **C8** | `transformTurnsToExchanges` assumes strict user→assistant alternation | **hazard** | §14 |
| **C9** | No token budget is enforced anywhere in the assembly; the cap is a message count | **measurement gap** | §7 |

---

## 14. C8, STATED PRECISELY

`lib/sovereign/sessionManager.ts:177-199` pairs turns by fixed stride:

```ts
for (let i = 0; i < turns.length - 1; i += 2) {
  const userTurn = turns[i];
  const assistantTurn = turns[i + 1];
  if (userTurn?.role === 'user' && assistantTurn?.role === 'assistant') { exchanges.push(...) }
}
```

A single unpaired row flips the parity for the remainder of the scan, after which every `(i, i+1)`
pair is `(assistant, user)` and **no further exchange is pushed** — the loop completes silently and
returns a truncated history. It does not throw and it does not log.

The coupling that makes this reachable: `/list` writes the member turn **before** cognition
(`route.ts:422`) and MAIA's turn **after** (`:1552`), into the same `conversation_turns` table that
`between/chat` reads. **A timed-out or failed turn therefore leaves exactly the unpaired row this
loop cannot survive.**

⚠️ Scope kept honest: the reader is on `between/chat`; whether the two routes share `session_id`
values for the same member was **not established** by this census. ⛔ Not repaired.

---

## 15. WHAT THIS CENSUS DOES NOT ESTABLISH

1. **No traffic, no database, no token measurement, no model call.** Every number is a code
   constant or a schema fact.
2. **C4 is derived from three files and has not been run.** It is the highest-value thing to
   falsify first, in either direction.
3. **C6's third clause is a structural absence, not an observed resurfacing.** No claim is made
   that a corrected interpretation has ever returned.
4. **`between/chat`, `voice/stream-conversation` and the `/api/maia/*` direct-Anthropic routes were
   sampled, not censused.** CMT-01 §10 items 2–4 remain open and are inherited unresolved.
5. **Whether any summarizer worker is scheduled** was not traced. `writeSummary` has a write seam
   and no observed scheduler; §5's overwrite finding is therefore latent, not live.
6. **Sanctuary interaction with the window** was not traced beyond confirming `isSanctuary` gates
   the memory build (`route.ts:541`) and the summary store forces null.
7. **Whether `/list` and `between/chat` share `session_id` space** (bears on C8).
8. **Retrieval quality** — nothing here measures whether what *is* retrieved is the right thing.
   That is ACT 4/5.

---

## 16. WHAT ACT 2 INHERITS

Recorded so the next act does not silently re-derive or silently skip:

- **The invariant is now falsifiable.** *Length may change representation; it may not make
  significant relational history unrecoverable.* §4 gives the exact predicate that violates it and
  §6 gives the exact `ORDER BY` that may invert it.
- **Two questions are answered and can be closed**: *where do turns live* (§2, sound) and *is
  summarization eating source* (§5, no — the slot is empty).
- **Four measurements are owed before any design**: C4 against a real session; token cost of an
  assembled prompt at 20/50/100 messages; whether a scheduler runs `writeSummary`; session_id
  sharing for C8.
- **The primitive inventory for the eventual four-layer architecture already exists in part** —
  raw transcript ✅ durable, protected anchors ✅ present but narrow (§8), episodic segmentation
  ⛔ absent as a retrievable unit with provenance beyond the member-marked five, derivative
  continuity ⛔ absent and ⭐ **should stay absent until it can be built as a carrier rather than
  an authority.**
- **The correction law exists in two other rooms** (`ask_threads`, `editorial_ontology`) and has
  never been extended to member memory (§9). That is prior art, not a licence to copy it forward.

⛔ **Nothing in this census authorizes a context assembler, a summarizer, a schema change, an
ordering fix, or a prompt edit.** ACT 2 (source → prompt reachability map) opens on a founder act.

---

*Memory is the field of recoverability; context is present attention. This census finds the field
intact and the path to it missing.*
