# WRITERS-STUDIO-PRODUCTION-DEPLOY-01 · Phase A

**Status: REPOSITORY ANALYSIS COMPLETE · ⚠️ PRODUCTION MEASUREMENT NOT RUN · ⛔ NOT DEPLOYED**

Canonical `38b9bada9`. Last recorded production candidate `637c115d1`.

⚠️ **I cannot perform Phase A.** It says *"establish four things **from the Mac
Studio**"*, and this container has no `ssh` binary and no route to the
production LAN. What follows is everything Phase A can be answered **from the
repository**, plus a read-only instrument for the rest. ⛔ Nothing here is a
production reading.

---

## 1. The gap, measured

```
production          637c115d1
canonical           38b9bada9
behind by           135 commits
pending migrations  7
```

None of Acts 01–04 exists in the deployed tree — `WorkConversation.tsx`,
`RelationshipChooser.tsx`, `adoption.ts`, `sectionProjection.ts`,
`workContext.ts` are all **ABSENT** at `637c115d1`.

## 2. ⭐⭐ THE EXPOSURE WINDOW — answered, and it is NOT a blocker

The ruling asked whether any of Acts 01–04 *"requires one of those migrations
during startup or immediately on ordinary requests"*, because
`deploy-production.sh` orders **build → swap → verify → migrate**, so new code
runs against the old schema for the length of the migrate step.

Each route's **transitive value-import graph** was walked for references to the
seven migrations' tables and columns:

```
schema-compatible    sovereign/manuscripts/[id]/ask/route.ts
NEEDS NEW SCHEMA     writers-studio/editorial/thread/route.ts         (4 modules)
NEEDS NEW SCHEMA     writers-studio/editorial/turn/route.ts           (7 modules)
NEEDS NEW SCHEMA     writers-studio/editorial/version/route.ts        (2 modules)
NEEDS NEW SCHEMA     writers-studio/editorial/adoption/route.ts       (6 modules)
NEEDS NEW SCHEMA     writers-studio/editorial/relationships/route.ts  (2 modules)
```

⭐ **The ordinary Work conversation is schema-compatible.** `threadStore` has
**zero** references to any new column, and `openThread` inserts only
pre-existing ones:

```sql
INSERT INTO ask_threads
  (manuscript_id, member_id, anchor, reading_identity, canonical_at_open, initiated_by)
```

Nothing on canvas load reaches the new schema either: the manuscript, draft,
write-state, readings and members routes carry no reference, direct or
transitive.

⭐ **So by the ruling's own criterion — startup, or ordinary requests — the
build→swap→verify→migrate order is NOT a blocker for this release.**

⚠️ **But there is a real exposure, and it is created by the flag decision.**
With `WRITERS_STUDIO_EDITORIAL_ENABLED=1` in the same act as the swap, the
editorial capability is mounted and reachable while its five tables do not yet
exist. It takes a deliberate member gesture to reach — the *Work on an exact
passage →* click, or an addressed `editorialThread` URL — so it is not an
ordinary request. But the window is real and the release chose to open it.

⛔ **Not decided here.** Two orderings remove it, each with its own cost, and
the choice is a founder ruling:

| ordering | cost |
|---|---|
| deploy with the flag **absent**, verify the seven independently, then enable and recreate | the flag change is a bare `up -d --no-deps`, which takes **no lane lock** and runs **no provenance verify** — the 2026-09-07 gap |
| deploy with the flag **on**, accept a minutes-long window | a deliberate editorial gesture during the migrate step hits a missing table |

## 3. ⭐ MIGRATION RISK — only two statements can fail on real rows

Five of the seven create new tables, or alter tables this batch itself created
and which are therefore empty. **Two statements touch PRE-EXISTING production
tables**, and they are the whole migration risk:

```sql
ALTER TABLE ask_threads VALIDATE CONSTRAINT ask_threads_one_subject;
  -- CHECK (num_nonnulls(anchor, proposal_chain_id) = 1)
  -- scans EVERY existing row; pre-migration this reduces to `anchor IS NOT NULL`

ALTER TABLE ask_turns ADD CONSTRAINT ask_turns_thread_index_speaker_key
  UNIQUE (thread_id, turn_index, speaker);
  -- fails on any duplicate group
```

⭐ **Both are predictable BEFORE the deploy**, and the preflight predicts them
directly against production rows rather than discovering them in a `log_warn`
after the swap.

⚠️ `ask_threads_editorial_has_no_reading` validates trivially (the column it
constrains is created NULL), and `ask_threads_id_chain_key UNIQUE (id, …)` is
implied by the primary key — stated so their absence from the risk list reads as
measured rather than overlooked.

**Rollback properties:** `20260915000002` carries a commented-out inverse for
every constraint it adds, including `ALTER TABLE ask_threads ALTER COLUMN anchor
SET NOT NULL`. ⚠️ That last one is **only reversible while no NULL anchors
exist** — i.e. while no editorial thread has been created. ⛔ Once the walk opens
one editorial relationship, the schema is **forward-only**.

## 4. The instrument

`scripts/witness/ws-production-deploy-preflight.sh` + `.sql` — **read only**, every
statement a `SELECT`. Run from the Mac Studio. It answers:

1. **identity** — container `GIT_COMMIT`, image `GIT_COMMIT` **separately**
   (a stale compose runtime override can stamp one and not the other — 2026-09-03),
   `DEPLOY_LANE`, container age
2. **migration delta** — the seven by name, APPLIED/PENDING, from the ledger
3. **migration prediction** — the two failing-statement counts above; ⛔ any
   non-zero is a STOP
4. **flag** — the live value, and whether it is declared in compose or `.env.production`
5. **the real Work** — *Elemental Alchemy* as an owned Studio Work with a
   working draft, its `section_addressable_at`, and **every section listed** so
   Chapter 10 is *identified* rather than guessed from position

## 5. ⛔ What I have NOT done

- ⛔ no production reading of any kind
- ⛔ no deploy, no flag change, no migration
- ⛔ the flag ordering is **reported, not decided**
- ⛔ `REAL-WORK-ACCEPTANCE-01` remains closed

## 6. Standing

```
exposure window         ANSWERED — not a blocker on the ruling's criterion
migration risk          ISOLATED to two statements, both predictable
preflight instrument    WRITTEN, read-only, UNRUN
production identity     UNREAD
live Chapter 10         UNPROVEN  ⛔ hard stop until measured
flag ordering           OPEN — founder ruling
deploy                  ⛔ NOT PERFORMED
```
