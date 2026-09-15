# `AIN-CONTEXT-01` · ACT 1 — LONGITUDINAL CONTINUITY FAILURE CENSUS

**Date:** 2026-09-15 · **Status:** COMPLETE · **READ-ONLY**
**Authority:** `docs/programme/AIN-CONTEXT-01_CHARTER_2026-09-15.md` §4
**Scope of evidence:** repository truth at this checkout. ⛔ **No production or shadow
database was read.** Every claim below is static reachability established from source.
Claims requiring runtime evidence are marked `UNVERIFIED` and are not asserted.

---

## 0. Headline

**The mechanism is located, and it is not the context window.**

Three findings, in order of force:

1. ⭐⭐ **The serving route's prompt-visible conversation window is 10 exchanges,
   hard-coded, and does not grow.** The client sends 100 messages; the server
   **discards them for prompt purposes** and re-reads the last 10 exchanges from the
   database. The deliberate remedy recorded in the client (`MAX_API_HISTORY` raised
   30 → 100 *"to extend depth before MAIA hits the wall and confabulates about her own
   architecture"*) **changes nothing MAIA sees.**

2. ⭐⭐ **Every cross-session carrier structurally excludes the current session.** In a
   long conversation the current session *is* the problem, so the entire cross-session
   memory apparatus is switched off exactly when it would be needed. Material between
   turn 1 and turn N−10 of a live session has **no carrier at all**.

3. ⭐⭐ **MAIA is told the wrong turn count.** The authoritative session turn count is
   computed and available, and the prompt is built with the *window length* instead.
   On turn 200 of a session, the CORE prompt says `11 turns`.

⭐ **The good news, and it is load-bearing: the source survives.** `conversation_turns`
is append-only on this path with no pruning, no rollup and no destructive compaction
outside Sanctuary. **Nothing is being deleted. Everything is being un-selected.**

That is the difference between a memory failure and a context failure, and it decides
what ACT 2 is allowed to conclude.

---

## 1. The flow, with every edge classified

```text
MEMBER / MAIA TURN
      │
      ▼
conversation_turns                                       [LIVE]
  append-only · no TTL · no pruning (non-Sanctuary)
      │
      ├── survives? ───────────────────── YES (full history retained)
      │
      ▼
in-session selection                                     [LIVE]
  getConversationHistory(sessionId, 10)
      │
      ├── truncation point ───────────── LAST 10 EXCHANGES (hard)
      │                                  then −3 / −4 / −5 per tier
      │
      ▼
tier prompt rendering                                    [LIVE]
  FAST  last 3 exch · MAIA reply cut to 80 chars
  CORE  last 4 exch · MAIA reply cut to 120 chars
  DEEP  last 5 exch
      │
      ▼
summary / compression
      │
      ├── session remembrance (worker) ── [LIVE, but member-gated — §5]
      ├── source retained? ────────────── YES
      ├── recursive summary? ──────────── NO  (⭐ see §6)
      │
      ▼
cross-session carriers                                   [LIVE, but §4]
  MemoryBundle bucket A     LIMIT 12 · session_id <> current
  conversational recall     LIMIT 6  · session_id <> current
      │
      ▼
developmental memory retrieval                           [LIVE]
  ⚠️ query-INDEPENDENT top-12 · vector path [UNREACHABLE] — §7
      │
      ▼
other memory systems
      ├── episodic (member-marked)   [LIVE]
      ├── episodic (worker-bridged)  [UNREACHABLE] — §5.3
      ├── relationship essence       [DORMANT as prompt input] — §8
      ├── spiral state               [LIVE]
      └── member web / patterns      [LIVE]
      │
      ▼
prompt builders (string concatenation — no messages array) [LIVE]
      │
      ▼
FINAL MODEL REQUEST
  ⛔ no token budget · no context-window accounting anywhere — §9
```

---

## 2. Carrier record

| Carrier | Source | Persistence | Selection | Provenance / standing | Class |
| --- | --- | --- | --- | --- | --- |
| In-session history | `conversation_turns` | permanent | **last 10 exch**, then −3/−4/−5 | none; rendered as bare `User:`/`MAIA:` | LIVE |
| Client `meta.conversationHistory` | browser state | none | 100 msgs sent | — | LIVE but **prompt-inert** (§3) |
| Cross-session turns (bundle) | `conversation_turns` | permanent | `LIMIT 12`, recency, **excludes current session** | none | LIVE |
| Conversational recall | `conversation_turns` | permanent | `LIMIT 6`, recency, `LEFT(content,600)`, **excludes current session** | provenance grounding in formatter | LIVE |
| Developmental memories | writeback distillation | permanent | **query-independent top-12** | `memory_type` always `'pattern'` (§10) | LIVE |
| Breakthroughs | writeback ≥0.5 | permanent | `LIMIT 5` | typed | LIVE |
| Session remembrance | summary worker | permanent | top 3, essence cut to 140 chars | dated | LIVE, gated (§5) |
| Bridged session episodes | summary worker | permanent | — | — | **UNREACHABLE** (§5.3) |
| Member-marked episodes | member act | permanent | `LIMIT 5` | verbatim + source turn | LIVE |
| Relationship essence | every turn | permanent | — | — | **DORMANT as prompt input** (§8) |

---

## 3. ⭐⭐ Finding 1 — the client's history is prompt-inert

`components/OracleConversation.tsx:342`

```ts
const MAX_API_HISTORY = 100; // Send last 100 messages (~50 exchanges) to API.
// Raised from 30 to extend depth before MAIA hits the wall and confabulates
// about her own architecture.
```

Those 100 messages arrive in `meta.conversationHistory`. On the serving route they are
consumed by exactly three things, none of which is the prompt:

- `app/api/sovereign/app/maia/list/route.ts:832` — Knowledge Gate scoring, `slice(-6)`
- `:1625` — interruption ledger, `slice(-5)`
- `:1577` — a telemetry turn index

The prompt's history comes from somewhere else entirely:

`lib/sovereign/maiaService.ts:2763`

```ts
// Get conversation history for context (limited to 10 for prompt, but turnCount is authoritative)
const conversationHistory = await getConversationHistory(sessionId, 10);
```

That value — and only that value — is what reaches `fastPathResponse` /
`corePathResponse` / `deepPathResponse` (`:3394`, `:3405`, `:3416`).

⭐ **A remedy was authored, shipped, and had no path to effect.** The comment on
`MAX_API_HISTORY` names the exact phenomenological defect this lane was opened to
explain, and the change it justifies cannot reach the prompt. This is the single most
important thing ACT 1 found, because it means the failure has already survived one
attempt to fix it.

### 3.1 The window, tier by tier

`lib/sovereign/sessionManager.ts:127-198` — reads **all** turns for the session (no SQL
`LIMIT`), pairs them, then `exchanges.slice(-limit)`.

Then each tier narrows again, and truncates MAIA's own words:

| Tier | Exchanges | MAIA's prior reply |
| --- | --- | --- |
| FAST | 3 (`maiaService.ts:841`) | **80 chars** |
| CORE | 4 (`maiaVoice.ts:865`) | **120 chars** |
| DEEP | 5 (`maiaService.ts:2419`) | full |

⭐ On FAST — which `CLAUDE.md` records as carrying most conversations — **MAIA sees the
first 80 characters of her own last three replies.** Her own reasoning is structurally
unavailable to her. A member referring back to something MAIA said four turns ago is
referring to something that is, from MAIA's side, not there.

### 3.2 A second-order effect worth naming

`lib/sovereign/sessionManager.ts:183` pairs turns with `i += 2` and keeps a pair only if
it is `user → assistant`. The route deliberately tolerates a MAIA turn failing to
persist (`route.ts:1566-1572`: *"Losing the response here degrades the record; it must
not erase what the member said"*). ⚠️ **One unpaired turn therefore shifts the parity of
every subsequent pair in that session**, and pairs that fail the role test are dropped
silently. The tolerance is right; its interaction with fixed-stride pairing is
`UNVERIFIED` in frequency and is **not** claimed here as an observed production event.

---

## 4. ⭐⭐ Finding 2 — cross-session memory is switched off inside the current session

`lib/memory/MemoryBundle.ts:225-233`

```sql
SELECT ... FROM conversation_turns
WHERE user_id = $1
  AND session_id <> $2      -- current session excluded
ORDER BY created_at DESC
LIMIT 12
```

`lib/maia/memoryLoaders.ts:208-215` (conversational recall) does the same, `LIMIT 6`.

The default memory mode is `continuity` (`lib/memory/MemoryGate.ts:58`), which selects
`scope: 'cross_session'` at `route.ts:565`. So on the default path:

```text
turns 1 … N−10   of the current session   →  no carrier
turns N−9 … N    of the current session   →  10-exchange window
other sessions                            →  last 12 turns, recency only
```

⭐ **There is no relevance-based path back into the current session's own past.** Both
cross-session carriers are ordered by `created_at DESC` alone — recency, never
relevance. Nothing anywhere asks *"what in this conversation bears on what the member
just said?"*

**This is the mechanism.** In a long conversation, material leaves the window and there
is no carrier — not a summary, not a retrieval, not a pointer — that can bring it back.

---

## 5. Summarization — what exists, and what gates it

### 5.1 It is real and it is member-gated

Session remembrance is produced by `maia-summary-worker`
(`docker-compose.production.yml:391`), reading up to `MAX_TURNS_TO_READ = 60` turns
(`scripts/run-session-summary-worker.ts:40`).

Jobs are enqueued only by `finalizeSession` (`lib/sovereign/sessionFinalizer.ts:177`),
which has exactly one caller path:

`components/OracleConversation.tsx:7788`, inside `handleClosingRitualComplete`.

⚠️ **`handleClosingRitualSkip` (`:7803`) does not finalize.**

⚠️⚠️ **CORRECTION (2026-09-15, during ACT 2 — this sentence originally read "No server-side
idle sweeper for unfinalized sessions was found." That was wrong and is corrected in place,
not deleted.)** A sweeper exists: `scripts/sweep-stale-sessions.ts` closes sessions idle past
a threshold (default 2h) and enqueues them to `session_summary_queue` with
`ON CONFLICT DO NOTHING`. It is **not** a compose service, **not** a `package.json` script,
and **not** referenced by CI. `docs/ops/memory-pipeline.md:73-82` documents it as a manual
run or a **crontab on the Mac Studio host** — which `CLAUDE.md` names as *not* the production
host. Whether any crontab invokes it against minisforum is **UNVERIFIED** (requires host
access). ⭐ The correction changes the remedy, which is why it is worth making: the gap is
not a missing sweeper, it is **an unscheduled one**.

⭐ **So the summary pipeline runs only if the member completes a closing ritual.** Tab
closed, app backgrounded, WebView reset, or simply stopping → no finalize → no job → no
summary. The `beta_user`/WebView-reset trap already recorded in `CLAUDE.md` lands
directly on this path. How often this occurs in production is `UNVERIFIED`.

### 5.2 Where summaries do reach the prompt

`lib/memory/MemberLiveContext.ts:391` → `getRecentSummaries(userId, 3)`, rendered at
`:454-460` with `essence` cut to **140 characters**, into `memberWebAddendum`. `[LIVE]`

### 5.3 ⚠️ Where they do not — a write-only limb

`scripts/run-session-summary-worker.ts:140-155` also bridges each remembrance into
`episodic_memories`, **computing and storing a 768-dim embedding** for semantic
resonance search.

The only live prompt-path reader of that table is
`lib/maia/memoryLoaders.ts:297-300`:

```sql
WHERE user_id = $1
  AND marked_by_member = TRUE
```

The bridge sets no `marked_by_member`; the column defaults `FALSE`
(`database/migrations/20260531000001_...:71`).

⭐ **Every bridged session summary is structurally excluded from the only loader that
could surface it.** The embedding is computed, stored, and never queried on the serving
path. Classification: **UNREACHABLE** — not dormant code, but live code whose rows a
live reader's predicate excludes. ⛔ The doctrine the predicate enforces (*"episodic
memory preserves member-marked significance; it does not manufacture significance"*) is
correct and is **not** challenged here; the finding is that a producer was built on the
other side of it without the two being reconciled.

---

## 6. ⭐ Summary-of-summary — hunted, NOT FOUND

The charter named recursive summarization as a primary target. **It does not exist on
this path**, and the search was specific rather than general:

- `generateSessionRemembrance` reads **turns**, never a prior summary
  (`sovereignSummarizer.ts:96`, worker `:176`).
- Each session is summarized **once**, from source.
- `MemoryBundle.compress` (`:480`) truncates a single candidate to 150 chars — it never
  consumes a prior bullet.
- `RelationshipAnamnesis.captureEssence` takes `existingEssence` and accumulates, but
  the route hands it a **two-element history — the current turn only**
  (`route.ts:1668-1671`). It is an accumulator, not a re-summarizer of text.

⭐ **This is a genuine architectural strength and should be recorded as one.** The
degradation mode the founder named — detail vanishing with no deletion — is **not**
present. Loss here is by *non-selection*, which is recoverable in principle. Loss by
recursive compression would not have been.

⚠️ One derived-from-derived edge exists and is named rather than dismissed:
`senseRelationshipQuality(..., existingEssence)` derives new quality from prior quality.
Since §8 finds that essence never reaches the prompt, it currently carries no
prompt-visible consequence. ⛔ That is a fact about today's reachability, not a licence.

---

## 7. ⭐⭐ Finding — "semantic retrieval" is not semantic

`lib/memory/MemoryBundle.ts:252-278`:

```sql
SELECT ... , (0.40 * decayed_confidence + 0.35 * recency
            + 0.15 * confirmed + 0.10 * recall_count) AS score
FROM developmental_memories
WHERE user_id = $1 AND content_text IS NOT NULL
  AND (valid_to IS NULL OR valid_to > NOW())
ORDER BY score DESC
LIMIT 12
```

⛔ **`queryText` appears nowhere in this query.** The same top-12 memories are returned
regardless of what the member just said.

The vector path (`:296-300`) runs **only if the non-vector query returns zero rows** —
which, for any member holding at least one developmental memory, never happens.
Classification: **UNREACHABLE in practice** for exactly the members it was built for.

`lib/maia/memoryLoaders.ts:102-106` (`memoryInfluenceAddendum`) is likewise
`ORDER BY significance DESC` — query-independent, `LIMIT 3`.

⭐ This independently corroborates the `F2` finding already recorded in `CLAUDE.md`
(*invisible decay changes which developmental rows survive the non-vector top-12
retrieval cut*) and sharpens it: **decay is not merely one input to the cut — it is
almost the whole of it**, because relevance contributes nothing.

---

## 8. Relationship essence — written every turn, never read into the prompt

`route.ts:1656-1685` loads the existing essence and saves an updated one on every turn.
The only consumer of `loadRelationshipEssence` on the serving path is that write itself.
`MemberLiveContext` also loads it (`:393`) but `formatMemberWebForPrompt` renders
patterns, sessions, journals and themes — **not the essence**.

Classification: **DORMANT as prompt input.** The write is live; the read into MAIA's
context is not. `UNVERIFIED` whether any non-conversational surface consumes it.

---

## 9. No context budget exists

No token counting, no context-window accounting, and no budget-driven eviction was found
anywhere on the serving path. Every limit is a **hard-coded constant** — 10, 6, 5, 4, 3,
12, 6, 3, 150, 140, 600, 120, 80.

⭐ **Consequence: the system cannot tell the difference between dropping something
because it ran out of room and dropping something because a number was chosen in 2026.**
It is always the second. Nothing "falls out" of MAIA's context — everything is
*excluded* by a constant, identically on turn 5 and turn 500.

---

## 10. ⭐⭐ The correction question — answered, and the answer is A

The charter's test:

```text
Turn 20   MAIA infers X
Turn 24   member: "No — X is wrong."
Turn 110  retrieval searches the related subject
```

**Result: `A` — X alone, with no standing.** Traced:

1. **The correction is noticed.** `MemoryWriteback.calculateSignificance:478-480` adds
   `+0.2` for `/no,|actually|not quite|that's not|i meant/i`, labelled *"Correction
   pattern (learning opportunity)"*. So a correction is **more** likely to be written
   than an ordinary turn. ⭐ The system knows a correction when it sees one.

2. **The knowledge is then discarded at the write.** `writeDevelopmentalMemory:650`
   hard-codes `'pattern'` — and the file's own comment says why:

   > *"Future work: route specific cases to more precise types (correction when the user
   > corrects MAIA …) — tracked in Phase B."*

   `'correction'` is a valid value of the `memory_type` CHECK constraint and is **never
   written by any live path** (readers exist: `DevelopmentalMemory.ts:334`,
   `PreferenceConfirmationStore.ts:219`).

3. **Nothing links the correction to what it corrects.** `supersedes` / `superseded_by`
   exist **only** in the manuscript/proposal lane
   (`20260914000001_proposal_succession.sql`). `developmental_memories` has no such
   column and no writer for one.

4. **What is stored is not the proposition.** The written `content_text` is a
   `distilledSignal` — *"[core movement]; [direction of shift]; [tone/quality]"* — so the
   rejection is compressed into a trajectory phrase before it is stored.

5. **Retrieval cannot prefer it.** Per §7, retrieval is query-independent. Even if the
   rejection were stored as such, nothing steers retrieval toward it when X surfaces.

6. **X and its rejection compete on score, and can silently collide.**
   `MemoryBundle.deduplicate:461` keys on the **first 100 characters, lowercased**. An
   interpretation and its correction discussing the same subject can hash identically, in
   which case **whichever ranks higher survives and the other is dropped without trace.**

⭐⭐ **This is the dangerous finding, and it is worth stating plainly.** The system is
*better* at retaining corrections than ordinary turns (step 1) and *structurally unable*
to represent them as corrections (steps 2–4) or to retrieve them alongside what they
correct (steps 5–6). Every downstream improvement in retrieval quality makes an
interpretation the member has explicitly rejected **more** available, with no
countervailing force. The charter's warning is not a risk here; it is the current state.

⛔ **No repair is proposed and none is authorized.** `'correction'` already exists in the
constraint, and the temptation to "just write the right type" is exactly the move this
lane must not make before ACT 2 has a baseline — a typed correction that still cannot be
retrieved alongside its target changes the label and not the danger.

---

## 11. ⭐⭐ Finding 3 — MAIA is told the wrong turn count

`lib/sovereign/maiaService.ts:2759` computes the authoritative count, with a comment that
shows the hazard was already understood:

```ts
// NOTE: Using session.turn_count (not history.length) to avoid cap from limited history
const turnCount = await incrementTurnCount(sessionId);
```

It is used for routing and telemetry (`:3171`, `:3184`). But the prompt is built from the
window:

- `:1781` — `summary: "Conversation: ${element} element, ${effectiveHistory.length + 1} turns"`
- `:2426` — `sessionMetadata.turnCount: effectiveHistory.length + 1`
- `:2328` — `observerLevel: Math.max(1, Math.min(effectiveHistory.length + 1, 7))`

Since `effectiveHistory` is capped at 10, **every one of these saturates at 11**.

⭐ On turn 200 of a session, MAIA's CORE prompt states the conversation is `11 turns`
long, and her `observerLevel` is identical to turn 7's. She is not merely missing the
history — **she is told it does not exist.** ⚠️ That, not the window itself, is the most
plausible proximate cause of the confabulation the `MAX_API_HISTORY` comment describes:
a system informed it is on turn 11 has no reason to report a gap.

---

## 12. Answers to the charter's questions

| Question | Answer |
| --- | --- |
| Where is original material stored? | `conversation_turns` |
| Does raw source survive? | ⭐ **Yes** — append-only, no pruning (non-Sanctuary) |
| What crosses turn boundaries? | Last 10 exchanges (→3/4/5 by tier) |
| What crosses session boundaries? | 12 turns (bundle) + 6 turns (recall) + ≤3 summaries, all recency-only |
| Where does truncation occur? | Nine hard-coded constants, §9 |
| Are summaries created? | Yes — per session, member-gated (§5) |
| Do summaries replace source? | ⭐ **No** — they supplement; source retained |
| Recursive summarization? | ⭐ **No** (§6) |
| What can recover dropped material? | ⛔ **Nothing relevance-driven.** No mechanism retrieves by relation to the current utterance |
| What reaches the model? | One concatenated string; no messages array; no budget |
| Epistemic standing carried? | Minimal. Patterns carry confidence + date; marked episodes carry verbatim + source turn; **turns and developmental memories carry none** |
| Do corrections travel with what they correct? | ⛔ **No** — §10, answer `A` |
| Can important conversation become **permanently inaccessible**? | ⭐ **No — and this is the load-bearing answer.** It becomes **unselectable**, not unrecoverable. The rows are there. ⚠️ One exception: a session that never finalizes is never summarized, and re-summarization is not offered |

⭐⭐ **The invariant in charter §2 is therefore not violated at the storage layer and is
comprehensively violated at the selection layer.** *Leaving working context is not
forgetting* — but in AIN today, leaving working context is **indistinguishable from
forgetting**, because nothing can bring the material back.

---

## 13. What ACT 2 must be able to distinguish

The reproduction harness must separate four outcomes that currently look alike from
outside:

```text
NOT RETAINED      the row does not exist
NOT RETRIEVED     the row exists; no carrier selected it
NOT ASSEMBLED     selected; did not survive a constant
NOT STANDING      assembled; arrived without its epistemic status
```

Per this census the expected distribution is heavily weighted to **NOT RETRIEVED** —
and the rejected-interpretation probes (turns 27/29/130) are expected to show
**NOT STANDING** on the retrieved side. ⛔ Those are predictions to be falsified by ACT 2,
not results.

---

## 14. Routed out, ⛔ no lane opened, ⛔ nothing repaired

1. Fixed-stride `i += 2` pairing vs. tolerated unpaired turns (§3.2).
2. `deduplicate` 100-char hash collision between a claim and its correction (§10.6).
3. `insertOne`-style unsoundness is **not** implicated here; not raised.
4. The worker→`episodic_memories` bridge writing rows its only live reader excludes (§5.3).
5. Sessions that never finalize never summarize, with no re-summarization path (§5.1).
6. `'correction'` valid in the schema, written by nothing (§10.2).

⭐ *The lane that finds a defect does not thereby own it.*

---

## 15. Standing

```text
ACT 1                      COMPLETE · READ-ONLY
Evidence class             STATIC / repository truth
Production DB read         NONE
Shadow DB read             NONE
Source changed             NONE
Schema changed             NONE
Repair                     NOT AUTHORIZED
New summarizer             NOT AUTHORIZED
Context assembler          NOT AUTHORIZED
ACT 2                      SPECIFIED · NOT OPENED
Production                 UNTOUCHED
```
