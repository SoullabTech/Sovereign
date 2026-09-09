# FOCUS DISCLOSURE CONTRACT — `conversation_turns` consumer census

**2026-09-09 · READ ONLY.** No receipt schema. No write. No #1275 change.

The question this census exists to answer:

> Is `conversation_turns.provenance` genuinely inert with respect to **memory**,
> **training**, **summarization**, and **cognition** — or would a disclosure
> receipt placed there acquire meanings it was never granted?

Method: trace **values**, not names. Every file referencing the table was read for
which columns it moves and where those columns end up.

---

## 1 · The table's surface

```sql
conversation_turns(
  id, user_id, session_id, role, content, created_at,
  meta jsonb DEFAULT '{}',            -- reader-live, WRITER-DEAD (see §4)
  parent_turn_id, visibility, exchange_id, seq, field_slug,
  posture_at_creation NOT NULL,       -- S5 constitutional
  provenance jsonb                    -- S5 constitutional, WRITE-ONLY (see §3)
)
```

Four writers, all in `lib/memory/stores/TurnsStore.ts` (single, mint, exchange,
pair). **No `UPDATE conversation_turns` exists anywhere in the repository.** A
turn row is append-only in practice, and its content is amended only by deletion.

---

## 2 · `content` — CONFIRMED memory-and-training surface

The founder's standing finding holds, and is broader than transcript storage:

| Consumer | Path | Class |
|---|---|---|
| `TurnsStore.getRecentTurns` | → session continuity | memory |
| `TurnsStore.getSessionTurns` | → `sovereignSummarizer.generateSessionRemembrance` → **Anthropic prompt** → `maia_sessions.summary` → vector embedding → `[Summary→Memory]` episode bridge | summarization + memory |
| `MemoryBundle` cross-session leg (`LIMIT 12`) | → memory bundle → prompt | memory + cognition |
| `memoryLoaders.loadConversationalRecall` (`LEFT(content, 600)`) | → `conversationalRecallBlock` → **MAIA's prompt** | cognition |
| `scripts/backfill-training-data.sql` | `conversation_turns` → **`maia_turns`** (the learning system's table) | training |
| `MemoryBundle` encounter stats, community stats, admin activity feed | counts only | analytics |

⭐ **A Focus passage placed into `content` would enter the training corpus, the
summarizer's prompt, and cross-session recall — three surfaces the writer never
addressed.** `content` is therefore refused as a receipt location, not on style
but on consequence.

---

## 3 · `provenance` — write-only, but NOT unclaimed

**Finding P1 — zero readers.** No file selects `conversation_turns.provenance`.
Every reader query enumerates its columns explicitly (`role, content, created_at`,
plus `id`/`session_id` in two places); **there is no `SELECT *` against this table
anywhere**, so provenance cannot leak into a payload by accident. Nothing in
memory, training, summarization or cognition reads it today.

**Finding P2 — it is constitutionally governed, not spare space.** The S5 mint
gate (`database/migrations/20260718000001_s5_provenance_substrate.sql`) fires
`BEFORE INSERT` and **refuses the row** unless `provenance` carries all six keys:
`createdBy · generatedBy · postureAtCreation · sourceContainer · source ·
persistencePolicy`. The trigger tests key *presence*, so an additional key would
be admitted — meaning the column would accept a receipt **without any gate
noticing that a second kind of claim had moved in**.

⛔ *That is the finding, not a green light.* The question a receipt raises here is
not whether the write would succeed. It is whether a disclosure fact may live
inside the object that answers *"under what consent was this turn persisted?"* —
where a later reader would have no way to tell a constitutional key from a feature
receipt. **Unclaimed is not the same as inert.**

**Finding P3 — provenance travels on paths the receipt would not choose.**
`app/api/members/migrate-data` moves rows between identities with
`UPDATE <table> SET user_id = $1 WHERE user_id = $2`, column-blind: whatever is in
`provenance` migrates with the row, unread and unexamined.

---

## 4 · `meta` — reader-live, writer-dead. **Not a free channel.**

- `lib/ain/meaningTraceDigest.ts` aggregates `meta->>'toSystem'`, `meta->>'style'`,
  `meta->'meaningTrace'->'outcome'->>'helpful'`, `…->>'copied'` and
  `jsonb_array_elements_text(meta->'meaningTrace'->'contextTags')` across the
  table, and is reachable live at `app/api/ain/digest/route.ts`.
- **Nothing writes `meta` at all.** `TurnsStore` omits it with the comment *"meta
  and parent_turn_id are not in the production schema"* — ⚠️ **that comment is
  false**: migration `20260204000002` added both, and the baseline carries them.
  No other writer exists.

So `meta` is a **live learning-digest surface with no current producer**, indexed
on `(meta->>'kind')`. A receipt placed there would be the first thing to populate
a column an aggregation endpoint already reads. ⛔ Not inert.

---

## 5 · Deletion and custody

| Path | Behaviour |
|---|---|
| `TurnsStore.deleteBySessionId` | Sanctuary purge, whole row |
| `app/api/scribe/end-session` | sanctuary close: `DELETE … WHERE session_id` inside the finalization transaction |
| `run-session-summary-worker.purgeSanctuaryTurns` | periodic `DELETE` for closed sanctuary sessions |
| `TurnsStore.pruneOldTurns` | keeps last N per user, deletes the rest |
| `app/api/members/delete-account` | `conversation_turns` listed under label `conversations` |

⭐ Every custody path operates on **whole rows**. Nothing deletes, redacts or
rewrites a column. A receipt in any column of this table therefore inherits the
row's lifetime exactly — including `pruneOldTurns`, which discards turns by age
with no regard for whether a disclosure was recorded on them.

---

## 6 · What the census establishes

1. `content` is a memory **and training** surface. **A Focus passage must not be
   written to `content` in order to preserve a disclosure receipt.** (Confirmed.)
2. `provenance` has **no readers** — but it is a **constitutional object under a
   DB mint gate**, and the gate would not notice a second kind of claim moving in.
3. `meta` is **not** the softer alternative: it is already read by the AIN digest
   and written by nothing.
4. There is **no UPDATE path and no `SELECT *`** on this table — the two mechanisms
   by which a new column value usually leaks are both absent.
5. Custody is **row-granular only**; `pruneOldTurns` can discard a receipt purely
   by age.

## 7 · Open, and deliberately not answered here

- Whether a disclosure receipt may share the S5 provenance object at all, or
  requires its own named location.
- Whether receipt lifetime may equal turn lifetime, given `pruneOldTurns`.
- Whether the false `TurnsStore` comment about `meta` indicates a further
  divergence between the store's assumptions and the production schema.
- ⛔ Not opened: `meta` is read by a live endpoint but produced by nothing — a
  separate finding about the AIN digest's evidentiary basis, not this lane's.

**Standing: census COMPLETE for `conversation_turns`. No receipt shape proposed.
No write. No schema change. #1275 untouched.**
