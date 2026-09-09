# FOCUS DISCLOSURE · DOWNSTREAM CENSUS OF `conversation_turns`

**Mandatory first step of the Class A Focus Disclosure Contract lane.**
Read-only source census on canonical `5b133abcd`.

```text
code changes   NONE      model calls   NONE
member text    NONE      production    NO CONTACT
receipt design ⛔ NOT PROPOSED — the last consumer is classified first
```

**The question this answers:** *what persistence tier are we putting a Focus
provenance receipt into?* Not whether the receipt contains manuscript text — it
must not — but where a receipt would land, and what would carry it onward.

---

## 0 · ⚠️ TWO CORRECTIONS BEFORE THE MATRIX

### 0.1 Substring matching conflated two tables

`maia_conversation_turns` is **a different table** with a different writer
(`lib/learning/conversationTurnService.ts`, `engineComparisonService.ts`). Every
earlier count that matched on the substring included it. It is **not** downstream
of `conversation_turns`; it holds `user_input` / `maia_response` written directly
by the learning service. ⛔ Out of scope here, and named so it is not
re-conflated.

### 0.2 The training verdict, narrowed as the founder ruled

```text
CROSS-SESSION MEMORY     ✅ ACTIVE CODE PATH
TRAINING ELIGIBILITY     ✅ ESTABLISHED
TRAINING BACKFILL PATH   ✅ EXISTS  (operator-run SQL)
AUTOMATIC TRAINING FEED  ⚠️ NARROWED — see §3
```

⭐ **§3 moves this one square, and not in the reassuring direction.**

---

## 1 · The row, as it actually is

`conversation_turns` carries **three** places a Focus receipt could live, and
they have different downstream fates:

```text
content       TEXT   the member's words / MAIA's words, verbatim
provenance    JSONB  minted per turn (S5 substrate, 20260718000001)
meta          JSONB  added 20260204000002 — a SEPARATE side-channel
```

⛔ **`meta` was not in the earlier picture and matters**: `lib/ain/meaningTraceDigest.ts`
already reads `meta->'meaningTrace'` across turns for aggregate reporting. A
receipt placed in `meta` would land in a column an aggregator already sweeps. A
receipt in `provenance` would not — **on the evidence below, and no further.**

## 2 · THE MATRIX — every real consumer of `conversation_turns`

⭐ **No consumer anywhere issues `SELECT *` against this table.** Every read names
its columns. That is the single most load-bearing fact for receipt containment,
and it is why a column-by-column answer is meaningful at all.

| # | Consumer | Columns read | Emits | Destination |
|---|---|---|---|---|
| 1 | `TurnsStore.getSessionTurns` / `getRecentTurns` | `role, content, created_at` | turn list | in-memory → prompt |
| 2 | `MemoryBundle` cross-session | `id, role, content, created_at, session_id` | last 12 turns | **prompt-visible, cross-session** |
| 3 | `MemoryBundle.encounterStats` | counts only | 4 integers | UI/telemetry |
| 4 | `lib/maia/memoryLoaders.ts` | `session_id, role, created_at, LEFT(content, 600)` | recall rows | **prompt-visible** |
| 5 | `lib/ain/meaningTraceDigest.ts` | **`meta` only** | aggregate rates | digest/report |
| 6 | `lib/learning/ImprovementHypothesisGenerator.ts` | `claude_consultation_used`, joined to feedback | correlation | learning hypotheses |
| 7 | `app/api/conversation/turns/route.ts` | `id, role, content, session_id, created_at` | JSON | member-facing API |
| 8 | `app/api/admin/activity-feed/route.ts` | `session_id`, `COUNT(*)` | counts | admin surface |
| 9 | `app/api/community/{stats,user-stats}` | `COUNT(*)` | counts | community aggregate |
| 10 | `scripts/backfill-training-data.sql` | `session_id, content, created_at` | **row copies** | **`maia_turns` — §3** |
| 11 | `scripts/memory-health.sql` | counts | counts | ops |
| 12 | `scripts/sweep-stale-sessions.ts` | `COUNT(*)` ≥ 2 | eligibility | summary queue |
| 13 | `run-session-summary-worker.ts` | — (**DELETE only**) | sanctuary purge | destructive |
| 14 | `app/api/scribe/end-session` | — (**DELETE only**) | sanctuary purge | destructive |
| 15 | `sessionFinalizer` → `TurnsStore.deleteBySessionId` | — | purge / enqueue | destructive / queue |
| 16 | `app/api/members/delete-account` | `user_id` (governed delete) | deletion | destructive |
| 17 | `lib/db/schemaCheck.ts`, `app/api/health` | schema/count | liveness | ops |
| 18 | `app/api/_backend/**` (`SupabaseMemory`, `MemoryOrchestrator`) | — | — | ⛔ excluded backend; not in the running app |

**Comment-only, no query:** `conversationalRecallBlock.ts`, `MemoryWriteback.ts`,
`ConversationMemoryUsesStore.ts`, `explorerId.ts`, `memoryService.ts`,
`migrate-data`, `oracle/iching`.

### 2.1 Provenance containment — the transitive question, answered as far as it goes

```text
reads content      1, 2, 4, 7, 10          ← the passage must never be here
reads meta         5                       ← an aggregator already sweeps it
reads provenance   NONE FOUND
SELECT *           NONE FOUND
row spread / JSON serialization of a whole row   NONE FOUND
```

⭐ **`provenance` has no reader among the consumers of this table.** ⛔ **That is
not the same as cleared.** It says a receipt there would not be *carried onward by
these paths*. It does not establish that nothing reads `provenance` elsewhere —
the S5 substrate migration exists precisely to have that column read by
something, and tracing S5's own consumers is a separate trace this census did
not perform. **Provenance containment: NARROWED, NOT CLEARED.**

## 3 · ⭐⭐ THE TRAINING TIER — the founder's square moves

The backfill copies `conversation_turns.content` into `maia_turns.user_text` /
`maia_text`. The founder's precision was right: **a script is not a schedule.**

⛔ **But the backfill is not the only writer.**

```text
app/api/maia/log-turn/route.ts     LIVE HTTP ROUTE
                                   INSERT INTO maia_turns (…, content, …)
                                   ⚠️ NO IN-REPO CALLER
```

So the training tier is **writable by request**, independently of the operator
script. The correct verdict is neither "automatic" nor "manual only":

```text
TRAINING FEED   REACHABLE — a live endpoint writes maia_turns.content
                NO IN-REPO CALLER — nothing in this codebase invokes it
                whether anything OUTSIDE the repo does is UNWITNESSED
```

⭐ This is the Instance-2 vocabulary again, on a different subject: *exists*,
*reachable*, and *actually fed* are three different states, and only the first
two are established here.

### 3.1 🔴 DERIVATIVE DELETION — the finding that outranks the receipt

`app/api/members/delete-account` governs **44 tables**, refuse-by-default.

```text
conversation_turns   ✅ governed
member_sessions      ✅ deleted explicitly
maia_turns           ⛔ ABSENT from the governed list
                     ⛔ no DELETE path found anywhere in the tree
                        (only FK cascades FROM maia_turns to its own children)
```

⛔ **If the backfill has ever run, `maia_turns` holds a durable copy of member
conversation text that account deletion does not reach.** That is a live custody
question about text already stored, and it does not depend on Focus at all.

⚠️ **Stated at its true strength:** the path exists and deletion does not cover
it. Whether rows are actually there is **unwitnessed**, and no production query
is authorized here. ⭐ **But the ordering follows regardless — deletion semantics
for an existing copy outrank the design of a new receipt.**

## 4 · The summary tier — how quoted Work would survive

```text
sessionFinalizer (continuity)
  → member_sessions row, summary NULL
  → job in session_summary_queue
  → worker loads turns, GENERATES A SUMMARY VIA THE SOVEREIGN MODEL
  → writes member_sessions.summary
```

⭐ **This is the concrete mechanism behind the founder's "MAIA quotes it back"
boundary, and it reaches further than the transcript.** If MAIA reproduces the
Focus verbatim, that text enters the **assistant turn's `content`**, and from
there it is eligible for: cross-session memory (#2, #4 — prompt-visible), the
member-facing turns API (#7), the training backfill (#10), **and a
model-generated summary durably stored on `member_sessions.summary`.**

⛔ **So the no-verbatim-reproduction contract is not politeness about
transcripts. It is the boundary that keeps a request-scoped disclosure from
becoming four durable copies, one of them written by a second model call.**

Sanctuary is the one place this is structurally closed: sanctuary turns are
purged and the summary is forced NULL.

## 5 · Standing

```text
conversation_turns.content
  cross-session memory        ✅ ACTIVE, PROMPT-VISIBLE   (#2, #4)
  member-facing API           ✅ ACTIVE                   (#7)
  training eligibility        ✅ ESTABLISHED              (#10)
  session summary             ✅ ACTIVE, MODEL-GENERATED, DURABLE (§4)

conversation_turns.meta       swept by one aggregator      (#5)
conversation_turns.provenance NO READER AMONG THESE CONSUMERS
                              ⛔ S5's own consumers NOT TRACED — not cleared

maia_turns                    live writer route, no in-repo caller
                              ⛔ NOT covered by account deletion
                              ⛔ contents UNWITNESSED

receipt design                ⛔ STILL HELD — provenance not yet cleared
#1275                         frozen @ 18d8c7004
production                    ⛔ NO CONTACT
```

**Owed before a receipt shape may be proposed:**
1. trace consumers of `conversation_turns.provenance` (the S5 substrate) —
   the one column the receipt would plausibly use, and the one whose readers
   this census did not follow;
2. adjudicate `maia_turns` deletion coverage — a custody question about text
   already stored, independent of Focus.

---

*A column with no reader is not the same as a column that is safe. It is a column
whose readers we have not yet found.*
