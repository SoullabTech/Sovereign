# Disclosure Receipts — State Anomaly Finding

**2026-09-20** · observed incidentally while unblocking a migration on the
**Mac Studio LOCAL DEVELOPMENT database** (`maia_consciousness` @ localhost)
**Standing** ⚠️ **RECORDED, NOT EXPLAINED** · ⛔ NO LANE OPENED · ⛔ NO REPAIR ·
⛔ PRODUCTION NOT READ — nothing here is a claim about production

---

## Why this is recorded

`context_disclosure_receipts` is constitutionally special. Its own column comment
states the design:

> … no automatic pruning and no age-based lifecycle; deletable **ONLY** by a
> governed custody act naming its deletion manifest (BEFORE DELETE trigger); …
> a tombstoned receipt cannot be restored (BEFORE INSERT trigger)

Two properties of that table were observed **not holding**, in opposite
directions, within one session. Neither is explained. The record exists so the
observation survives the session that happened to notice it — the same reason
the `conversation_memory_uses` CHECK discrepancy was worth writing down.

## What was observed

### Reading 1 — 45 rows, none of them admissible

```
 boundary                               | count | min crossed_at                | max crossed_at
----------------------------------------+-------+-------------------------------+-------------------------------
 writers_studio.ask->maia_developmental |    45 | 2026-09-10 14:43:02.375413-04 | 2026-09-10 15:48:41.164842-04
```

⭐ **That boundary value has never been admitted by any migration in the tree.**

| source | admits |
|---|---|
| `20260909000001_context_disclosure_receipts.sql` (creating migration) | `writers_studio.focus->maia_cognition` — one value |
| `20260913000002_disclosure_boundary_developmental_ask.sql` (widening) | the above **plus** `writers_studio.developmental_ask->maia_cognition` |
| observed in the rows | `writers_studio.ask->maia_developmental` — **neither** |

⚠️ Note the shape: the observed value is not a typo of the canonical one. Word
order is reversed and the target differs (`maia_developmental` vs
`maia_cognition`). It reads as **a different naming convention**, i.e. a writer
that did not consult the vocabulary rather than one that mistyped it.

**So the CHECK was not in force when those 45 rows were written on 2026-09-10.**

### The migration halt that surfaced it

`npm run db:migrate` stopped at `20260913000002`:

```
ERROR: check constraint "context_disclosure_receipts_boundary_check"
       of relation "context_disclosure_receipts" is violated by some row
```

⭐ The migration is a **pure widening** — one admitted value becomes two. A
widening CHECK cannot be violated by a row that satisfied the narrower one. The
failure is therefore itself evidence that rows existed which the original
constraint never admitted. `ON_ERROR_STOP` worked correctly and the four
editorial migrations downstream were never attempted.

### Reading 2 — minutes later, the same query

```
 boundary | count | min | max
----------+-------+-----+-----
(0 rows)
```

**45 → 0.** In the same terminal session, between two runs of an identical
query, alongside `proposal_chains|proposal_versions|1` — so the migrations
proceeded *after* the table was emptied.

## ⭐⭐ The two invariants, stated precisely

1. **Rows existed that the CHECK forbade.** The constraint did not prevent
   writes it was declared to prevent.
2. **Those rows were removed.** The table carries a BEFORE DELETE trigger whose
   stated purpose is to refuse deletion absent a governed custody act naming a
   deletion manifest.

⭐ Each alone is a defect. **Together they describe a table whose two guards —
one governing what may enter, one governing what may leave — were both absent or
bypassed on the same table within ten days, in opposite directions.**

## ⛔ What is NOT established

- ⛔ **What performed the deletion.** Asked in-session, unanswered at time of
  writing. It was not this session's assistant, which declined to propose a
  delete and said so before the rows disappeared.
- ⛔ Whether the BEFORE DELETE trigger was present at delete time.
- ⛔ Whether the boundary CHECK was present at insert time on 2026-09-10.
- ⛔ Whether any deletion manifest or custody act was recorded.
- ⛔ Whether the deleted rows are recoverable.
- ⛔⛔ **Anything about production.** Production was not read. This is a local
  development database, and the member-facing exposure of these specific rows is
  **nil**. ⛔ The finding must not be restated as a production claim.

⚠️ **Verifying the trigger and CHECK are present *now* does not close this.** If
they are present now, their presence is the puzzle rather than the reassurance —
the deletion should have been refused. Present-state conformance and
historical-act accountability are different questions, and only the first is
cheap to check.

## Owed — ⛔ none authorized by this record

1. **What ran the delete**, if it is still knowable. Everything else follows from it.
2. Whether the same boundary-value condition exists in **production**
   `context_disclosure_receipts` — a read, not a repair, and not taken here.
3. ⚠️ **PROVENANCE REMAINS OPEN — and a later search did NOT close it.**
   On 2026-09-21 the tree was searched for that boundary value. It appears
   **nowhere in source**; the only literals present are
   `writers_studio.developmental_ask->maia_cognition` (×2) and
   `writers_studio.focus->maia_cognition` (×7).

   ⛔ **That absence establishes nothing about where the 45 rows came from.**
   Source as it stands today cannot testify about code that ran on 2026-09-10:
   the writer may have been removed since, may live on another branch, or may
   never have been application code at all. ⭐ *A value's absence from the
   present tree is evidence about the present tree, not about the past.*

   The remaining question, unchanged:
   whether a writer somewhere emits `writers_studio.ask->maia_developmental`.
   ⚠️ **Stated at the strength the evidence supports, and no further.** 45 rows
   across ~65 minutes *suggests a repeated automated or systematic writer* — it
   ⛔ does **not** establish a continuously running process, and the actor
   remains unidentified. What follows is conditional: **if** such a writer
   exists, it will do this again wherever the CHECK is absent. *(An earlier
   draft of this line asserted "is a running process, not a hand-inserted
   fixture." That overstated a frequency observation into a claim about a
   mechanism nobody has seen. Corrected 2026-09-21; the weaker claim is the
   true one.)*

⛔ NOT AUTHORIZED BY THIS RECORD: schema change · trigger change · data repair ·
restoring or reconstructing the deleted rows · reading or touching production ·
opening a lane.

⭐ *A receipt's whole purpose is to outlive the convenience of the moment that
would rather it weren't there. Two guards existed to make that structural. On
this database, within ten days, neither held.*
