# WS-DELETE-01 — Delete Work: total erasure

**Founder ruling, 2026-09-07 (Kelly).** Canonical ref at time of work:
`4a5bf8ff9b0710acf7c7b498d930cc3bd09957c6` (`clean-main-no-secrets`).

---

## What prompted it

A member could create Works in Writer's Studio and had no way to remove one. Test
imports and abandoned drafts accumulated on the Studio home with no affordance.

`DELETE /api/sovereign/manuscripts/[id]` had existed since July — member-scoped,
404-not-403 on another member's id — with **zero UI callers** anywhere in `app/`
or `components/`. The same shape as WS2-NAV-01 (`{ convert: true }`, no caller)
and NAV-03 (`beginDraft()`, no callback): the command existed, the door did not.

Not to be confused with `WorkDrawer.tsx:110`, which DELETEs
`/living-works/{id}/expressions` — that **withdraws** a manuscript from a Work's
expressions and destroys nothing.

## The question that had to be ruled first

`20260824000001_manuscript_source_custody.sql` declares
`manuscript_id uuid REFERENCES member_manuscripts(id) ON DELETE CASCADE`, so
deleting a Work also destroys its source-custody row — the original bytes' hash,
provenance, and the extraction held as the record of what arrived.

Two defensible readings were put up: *correct as-is* (gone means gone) versus
*a custody loss* (the record exists so what arrived cannot be silently rewritten).

**The audit found a third fact that defeated both.** `deleteVaultBytes()` existed
in `lib/storage/fileVault.ts` with **zero callers repo-wide**, and the DELETE
handler was a single SQL statement. So the cascade destroyed the *record* of what
arrived while the *uploaded file itself* stayed in the vault forever — orphaned,
unreferenced, unattributable, and beyond reach of any future query. The member's
file was not gone, and the record of what it was had been destroyed. The state
satisfied neither reading.

## The ruling

> If the member chooses "Delete Work," Soullab relinquishes custody of the Work.
> An orphaned blob is still custody. The system would be saying "deleted" while
> retaining the thing itself.

```text
DELETE WORK

member-visible promise
  The Work is gone.

must remove
  source text
  uploaded source bytes
  manuscript / sections / drafts
  renders and derived writing artifacts
  source-custody record
  reconstructive provenance capable of restoring the Work

must not mean
  hidden
  archived
  detached
  unreferenced but retained
```

> If the system wants to preserve the original material, that is a legitimate
> design — but the button must then be called Withdraw, Remove from Studio, or
> Archive, not Delete.

**Explicitly rejected:** shipping the deletion gesture while knowingly retaining
orphaned source bytes. *"That would make the product promise false at precisely
the sovereignty boundary where words need to mean what they say."*

### Standing qualification — not settled by this ruling

Total erasure does **not** automatically settle the standing-events question.
Standing events may have acquired independent status as member acts rather than
remaining properties of the manuscript:

> The member may erase the material without necessarily erasing the fact that
> they once made a decision.

Any surviving standing event must be **content-minimal and non-reconstructive** —
no quoted manuscript text, no reconstructive ranges, no source fragments, nothing
that effectively keeps the deleted Work alive.

```text
Work/source content       ERASED
vault bytes               ERASED
custody                   ENDED
standing decision record  MAY SURVIVE
                          only if independently governed
                          and non-reconstructive
```

This remains **open**. It was not adjudicated here and must not be treated as
settled by the erasure ruling.

## What was built

| Path | Change |
|---|---|
| `lib/storage/fileVault.ts` | `destroyVaultBytes()` — verified destroy. Throws unless the path is observably gone. |
| `app/api/sovereign/manuscripts/[id]/route.ts` | DELETE reads vault paths before the cascade, destroys bytes after, refuses shared material, reports incomplete custody. |
| `lib/writersStudio/deleteWork.ts` | The member act: orchestration, ordering, refusal copy. |
| `app/writers-studio/HomeView.tsx` | Delete affordance + confirmation naming the Work. |
| `app/writers-studio/page.tsx` | Wiring via `apiFetch`. |

### Why a second vault function

`deleteVaultBytes` is documented "best-effort … never throws" — correct for
cleanup, wrong for custody. A permission error, a read-only mount, or a path the
traversal guard declines all return normally, so a caller relying on it reports
"deleted" over bytes still on disk. That is the ruling's *unreferenced but
retained* failure one layer down. `destroyVaultBytes` observes absence rather
than attempting removal. The best-effort helper is left untouched.

### Two findings that shaped the implementation

1. **Shared material.** `living_work_expressions.expression_id` is a bare UUID
   with no FK, and the migration deliberately does **not** make it unique per
   expression — calling exclusivity an unruled constitutional question. So a
   manuscript may be an expression of more than one Living Work, and erasing it
   would gut a Work the member did not delete. The route **refuses**
   (`declared_in_other_works`, 409) rather than destroying. A future ruling may
   narrow this; until then the refusal never destroys.

2. **The detached state.** Deleting only the manuscript leaves a `living_works`
   row pointing at an id that no longer exists — *detached*, forbidden by name.
   So the act is both deletions. The material goes **first**, because it is the
   only step that can legitimately refuse; a refusal then leaves the studio
   untouched. If the declaration then fails, the member has an empty card they
   can clear by pressing Delete again — the retry finds the manuscript already
   gone (404) and continues, which is why absence is treated as the outcome
   sought rather than an error.

---

# Closure conditions (founder, 2026-09-07)

The implementation direction was accepted — including the shared-material 409 and
verified vault destruction — with three conditions before the lane may close.
**WS-DELETE-01 remains OPEN. No PR.**

## 1. Eliminate the detached failure state — DONE

**The finding stood.** The first implementation deleted material and declaration
with two requests, material first, and answered a failure between them with
"press Delete again." The founder refused: *retryability is not invariance, and a
forbidden state does not become permitted because another click can repair it.*

Both deletions now happen in **one transaction**
(`lib/manuscript/source/eraseManuscript.ts`), so there is no interval in which a
live Work points at absent material. The client sends one request.

The remaining seam — vault bytes are not transactional — is closed by writing the
paths owed destruction **inside** that transaction
(`vault_erasure_queue`, migration `20260907000001`):

```text
commit fails                      nothing destroyed; the Work is intact
commit succeeds, sweep succeeds   nothing survives; queue row deleted
commit succeeds, sweep fails      named, non-live, self-completing —
                                  the queue row is the instruction to finish
```

The intermediate state is therefore never a Work and never a nameless blob. The
queue holds a vault path and nothing else: no member id, no manuscript id, no
title, no source text, no hash. It is deleted on success and is not an audit log.

Declaration handling is precise, because a Living Work's expressions are open by
design: if the manuscript was the Work's **only** expression, the Work goes with
it; if the Work names other things, only the dead expression row is removed and
the Work survives pointing at what remains. Neither branch leaves a declaration
naming absent material.

### "Self-completing" — narrowed twice, and still not fully earned

**Second founder correction (2026-09-07), accepted.** Running the consumer as a
separate process proves reconciliation *can* occur independently. It does not
prove it *will* occur without an operator. Verified: nothing in the repository
invokes `sweep-vault-erasure-queue.ts` — no cron, no systemd unit, no compose
service, no CI hook; the repo has no scheduling infrastructure at all. So the
open hole is precisely:

```text
commit succeeds → inline sweep fails → HTTP request ends →
queue row survives → nobody ever invokes the ops script →
bytes retained indefinitely
```

The queue row remains truthful the entire time, which is exactly what makes this
worth naming rather than assuming. **`AUTONOMOUS INVOCATION` is OWED**; what is
proven is listed in the closure state and is narrower than "self-completing".

The founder's qualification was correct and caught a real gap: *a queue row is an
owed act, self-completing only if an independently runnable consumer will revisit
it without the member deleting the now-absent Work again.* At that point the only
consumer was the inline sweep inside the originating request — which, if it fails,
has already returned. That was **named failure, not self-completing failure**, and
retained bytes could have lived forever behind a perfectly truthful queue row.

Second consumer built: `scripts/ops/sweep-vault-erasure-queue.ts`. It reads no
member data, reconstructs nothing, takes only the owed paths, and cannot erase
anything a committed transaction did not already decide to erase — so running it
more often is never more destructive, only more complete. Exit 1 while obligations
remain, so a scheduler surfaces an unclearable vault instead of looping silently.

Proven end to end by the witness, with a **real** failure rather than a simulated
one (the arrival is pointed at a directory, so `unlink` genuinely fails), and with
the later pass run as a **separate process** — the independence is the claim:

```text
  ok  rows committed even though the bytes could not be destroyed — sweptAll=false
  ok  the manuscript rows are gone despite the failed sweep
  ok  the obligation SURVIVES the request that created it — 1 owed
  ok  the independent consumer ran and cleared the vault
  ok  the bytes are destroyed by that later pass
  ok  the obligation DISAPPEARS once it is honoured — 0 still owed
```

### The queued path carries nothing member-authored — with one defect found

`artifact_ref` is built as `{namespace}/{timestamp36}-{hash16}.{ext}`
(`writeVaultBytes`). **The original filename is not in it**; only the extension is
derived from it. So the path is a machine identifier plus a truncated content
digest — a correlator, never a reconstructor — and the row is deleted on success.

**But the witness found a leak the design had not.** `last_error` stored
`err.message`, and a filesystem error message **embeds the full path** — putting
the vault path into a second column and giving the row more provenance than the
one field it is allowed. Fixed: `last_error` now stores the **errno only**
(`EACCES`, `EPERM`, `EROFS`…), capped at 32 chars by CHECK constraint. The errno
is also the half an operator can act on.

Found because the witness's own marker appeared in `vault_erasure_queue.last_error`
during the abandonment run. The witness's blocked path was then made content-free
to mirror production, so that assertion is now a true test rather than one that
detects its own seeding.

Not broadened into a lifecycle system: one producer, two consumers.

## 2. Prove reconstructive provenance is gone — WITNESS BUILT, RUN OWED

`scripts/witness/ws-delete-01-erasure-witness.ts`.

It deliberately **does not read the migrations**. A cascade audit built from
`REFERENCES member_manuscripts` proves only what the migration files say — it
cannot see a soft reference carrying no FK (`living_work_expressions` is exactly
that), a column added by hand, or a substrate nobody thought to grep for.

Instead it proves the property directly: every content field of a real manuscript
is seeded with an unguessable sentinel — title, section heading and body, working
draft content, extracted `source_text`, and real bytes on disk — the manuscript is
erased, and then **every text/varchar/json/jsonb column of every base table in
`public` is scanned for that sentinel**. A survivor anywhere fails and names the
table and column, including one the script has never heard of. An unscannable
column fails rather than being assumed clean.

The line the ruling draws is made mechanical: the sentinel is *content*, so a row
holding only counts, timestamps, or opaque ids passes because it never contained
the sentinel. **Non-reconstructive audit provenance survives; anything sufficient
to reconstruct the writing does not.**

It also asserts a pre-erasure positive (the scan can see the sentinel — a witness
that cannot detect what it looks for is not a witness), vault absence, no detached
declaration, an empty queue, and an untouched bystander manuscript. It cleans up
by passkey prefix in a `finally`, so an aborted run is collected by the next one;
a witness that litters the database it audits has no business on production.

### Local run — 2026-09-07, dev database `maia_consciousness`

```text
  ok  sentinel is present before erasure (the scan can see it) — 8 column(s)
  ok  sentinel bytes are on disk before erasure
  ok  erasure reported success — queued 1, swept all: true
  ok  vault sweep completed
  ok  NO reconstructive provenance survives anywhere in the database
        — scanned every text column in public
  ok  vault bytes absent
  ok  no detached declaration — the Work is gone with its only expression
  ok  no expression row points at erased material
  ok  nothing left owed in the erasure queue — 0 pending
  ok  unrelated material still fully present — 8 column(s)
  ok  unrelated vault bytes still present

11 passed · 0 failed
```

3,248 text/varchar/json/jsonb columns scanned. Residue after the run: zero
members, zero manuscripts, zero queue rows.

**Scope of this run, stated precisely.** The dev database carries **13 of the 14**
manuscript substrates; `developmental_readings` is absent from it, so its
content-bearing-ness is **unproven** — the FK enumeration says it cascades, and
this ruling declines to accept an FK definition as the proof. The production run
must cover it.

**Still owed: the authenticated production run.** A dev database is not the
survivor set. This establishes that the witness executes, detects what it looks
for, and holds on a near-complete schema — not that production is clean.

### What the sentinel scan does NOT prove — and the census that covers it

Founder limit, accepted: scanning text/varchar/json/jsonb proves **literal content
survival across those stores**. It does not by itself exclude *transformed*
derivatives — encoded blobs, summaries, indexes, embeddings, external caches, or
non-database stores. The witness is therefore connected to this census rather than
claiming to prove the whole universe alone.

| Derivative class | Census result |
|---|---|
| Binary blobs (`bytea`) | **None exist** anywhere in the schema |
| Full-text indexes (`tsvector`) | Exactly one: `library_chunks.content_tsv` |
| Vector embeddings (`vector`) | 16 columns, all in corpus/session/insight stores |
| Manuscript → chunk/embedding writer | **None.** No reference to `LibraryService`, `library_chunks`, `corpus_chunks`, or any embed call from `lib/manuscript/**`, `lib/writersStudio/**`, `app/api/sovereign/manuscripts/**`, or `app/writers-studio/**` |
| `WeQIngestionQueue` (only module naming `'manuscript'` as a source) | **Zero callers repo-wide.** The enum member is dormant, not a live writer |
| Chunk store population (dev) | `library_chunks` 0 · `corpus_chunks` 0 · `ain_knowledge_chunks` 0 |
| External / non-DB stores | The file vault, covered directly by `destroyVaultBytes` + the queue |

**Conclusion:** no path carries manuscript content into a transformed store, so the
sentinel scan's literal-content coverage is sufficient *given this census*. The two
must be read together — the census establishes the universe, the scan proves it
empty. **This census is dev-schema-derived and must be re-established on
production**, where the store list may differ.

### An incidental finding, worth recording

The witness's first two attempts failed on the seed, not the assertion: `members`
requires `password_hash`, and `manuscript_sections` has **no `member_id` column**
despite the migration text I had read. The second is the exact failure mode this
condition was written to prevent — a schema read that was confidently wrong. The
survivor scan is catalog-driven for that reason, and does not share the mistake.

### `destroyVaultBytes` — absence vs. inability to look

Verified, and now pinned by test. Only `ENOENT` counts as destroyed. An `EACCES`
propagates from both the `unlink` and the confirming `stat`; a path outside the
vault root throws rather than resolving. The test proving the permissions case
skips under uid 0 with that reason stated, rather than passing vacuously.

## 3. Unclaimed arrivals — BOUNDARY, needs a founder ruling

Not closed by omission. The precise boundary, with the facts:

- `insertArrival` writes every arrival with `manuscript_id` **NULL**; it is
  claimed only at confirmation (`claimArrival`). So **NULL is the normal state of
  every upload**, not an exotic edge case.
- Such a row holds the full extracted `source_text` **and** vault bytes.
- The member cannot see it, so cannot ask for it.
- The ingest route's own header already anticipated this: *"an unclaimed arrival
  is an orphan row a sweep can collect."* **That sweep was never built.**

**Why this was not decided here.** The obvious disposition — an age-based sweep —
is *system-initiated destruction of member material on a timer*. That is not a
member-governed erasure act, and quietly adopting it would broaden deletion by
implementation rather than by ruling. The alternative, a member-governed act,
needs a surface for material the member currently cannot see, which is a product
question this lane has no authority to settle.

**CONSTITUTED (founder, 2026-09-07): `WS-DELETE-02 · UNCLAIMED ARRIVAL
DISPOSITION`. OPEN / NOT IMPLEMENTED.** Its decision is kept separate because
there are at least two legitimate designs with materially different meanings, and
they are **not implementation equivalents**:

- **member-act deletion** — an affordance to erase an unclaimed arrival; or
- **purpose-bound expiry** — uploads constituted as temporary custody, with an
  explicit retention period and automatic destruction.

The machinery already exists and is reusable — `vault_erasure_queue` plus
`destroyVaultBytes` plus the independent sweeper — so whichever disposition is
ruled, only the trigger is new.

**Until ruled: a member can have uploaded bytes they cannot erase.** Recorded as a
known, unresolved gap in TOTAL ERASURE, not as out of scope.

### What WS-DELETE-01 therefore means, exactly

> **Total erasure of a constituted manuscript/Work at the member's request.**

Member copy must not imply that *all* uploaded Writer's Studio material is
presently erasable until WS-DELETE-02 lands. Checked: `DELETE_WORK_COPY.body`
reads *"This deletes the writing, its sections and drafts, and the original file
it came from"* — scoped to the Work in hand, claiming nothing about unclaimed
uploads. No copy anywhere offers a general "erase everything" promise.

## Standing events

Untouched, per the founder's qualification. Not settled by this ruling.

---

# Closure state (founder, 2026-09-07)

```text
WS-DELETE-01

DB ATOMIC ERASURE          SATISFIED
DETACHED LIVE STATE        ELIMINATED

VAULT OBLIGATION QUEUE     BUILT

INDEPENDENT RECOVERY CONSUMER   PROVEN
ABANDONED OBLIGATION SURVIVES   PROVEN
LATER INDEPENDENT SWEEP CLEARS  PROVEN
MEMBER RETRY NOT REQUIRED       PROVEN
AUTONOMOUS INVOCATION           OWED

LOCAL PROVENANCE WITNESS   PASS
developmental_readings     PRODUCTION PROOF OWED
PRODUCTION WITNESS         OWED

UNCLAIMED ARRIVALS         BOUNDED TO WS-DELETE-02
WS-DELETE-02               OPEN / NOT IMPLEMENTED

F6 FOUNDER ACCEPTANCE      OWED

PR                         NOT YET
CLOSE                      NOT YET
```

**Remaining, and nothing else. No redesign.**

1. **Bind the consumer to an operational trigger**, then prove one abandoned
   obligation is picked up *without manually launching the sweep*. Small, but
   constitutionally real — see below.
2. Run the erasure witness against production — including the fourteenth
   substrate, `developmental_readings` — with the census re-established there:

   ```text
   developmental_readings       exercised
   bytea manuscript stores      none
   tsvector manuscript path     none
   vector manuscript writers    none
   WeQ manuscript writer        none / live status rechecked
   catalog sentinel scan        zero survivors
   bystander                    preserved
   vault bytes                  absent
   queue obligation             cleared
   ```
3. F6 founder acceptance: the member-facing act on production.

---

## What was NOT done

- No soft-delete column, trash view, or bulk delete.
- No general deletion lifecycle.
- No F6 live walk — mechanical evidence only. Tests are not Founder Acceptance.
- No PR opened.

## Gates

`npm run typecheck` (no regressions) · `npm run check:no-supabase` ·
90 suites / 1530 tests. Migration `20260907000001` touches no Co-Lab-scoped table.
