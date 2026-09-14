# PROPOSAL-SUCCESSION-STORE-01 — the adapter witness

**Lane** `claude/proposal-succession-store`, from `e44453b39`.
**Census** `PROPOSAL-SUCCESSION-STORE-01_PERSISTENCE_CENSUS_2026-09-14.md` (`92baf3abf`).

> **The acceptance question, unchanged:** *Can the durable database round-trip
> the already-proven contract without ADDING, LOSING, SYNTHESIZING or
> REINTERPRETING any fact?*

---

## The run of record — 2026-09-14, disposable cluster

```
witness      scripts/witness/proposal-succession-store-witness.ts
             23 passed · 0 failed

falsifiers   scripts/witness/proposal-succession-store-mutations.sh
             11 killed · 0 survived

pure         lib/manuscript/proposalChain/__tests__/succession.test.ts
             31 passed · 0 failed

gates        typecheck 229 vs baseline 239 · 0 regressions
             check:no-supabase clean
```

⭐ **M1 — the founder's named mutation** (*the adapter sorts by `authored_at`
and reconstructs predecessor order*) — is killed by **F7**, **F7b** and
**F14b**. The pure-contract lesson is not reintroduced one layer later.

---

## ⭐⭐ The first falsification run left THREE SURVIVORS, and that is the result

The harness did its job before the witness did. Recorded because a clean first
run would have taught nothing:

```
M2   the head is taken as the newest row          SURVIVED
M3   rationale hydrates by truthiness             SURVIVED
M10  replacementText spread-guarded ('' lost)     SURVIVED
```

Each was a **real hole in the witness**, and each has a distinct cause:

### M2 — the write path was untested

`F7` proved the **read** path ignores the clock. Nothing touched the **append**
path, so `headIdOf` could be rewritten to take the newest row and every
falsifier stayed green. ⭐ The gap existed because F7's contradictory-timestamp
fixture is built with raw SQL and never appended through the adapter.

**Closed by F14**: append through the adapter onto that same chain. The
structural head is `t4`, the **oldest** row; the newest is `t1`. A clock-based
head supersedes `t1` and branches the chain.

### M10 — nothing ever stored a deletion

The schema admits `formulation = ''` deliberately — *a deletion is a
formulation* — but no fixture had one, so spread-guarding `replacementText` was
invisible. **Closed by F15.**

### M3 — the claim was UNFALSIFIABLE, which is worse than untested

Census §6.5 says the project idiom `...(r.x ? {…} : {})` tests **truthiness**,
and that for `rationale` this coincides with `!== null` **only because of the
`btrim` CHECK in another file**. ⛔ But a lawful database cannot hold `''`, so
reverting to truthiness changed nothing observable. The discipline was correct
and **unprovable**.

**Closed by F16**, which lifts that one CHECK for a single insert and asserts
that an empty rationale on disk is **reported**, never silently converted into
absence — *losing a fact is the failure mode this whole lane exists to prevent.*

⛔ **F16's fault injection is crash-safe by construction**, which the 2026-09-10
walk-12 finding requires: the constraint is re-added in `finally`, **and** re-added
unconditionally before the drop, so an interrupted earlier run cannot leave the
database permissive. And the witness refuses any `DATABASE_URL` whose database
name does not contain `witness`.

---

## ⚠️ Two instrument defects found and repaired during the run

**The disposable-database guard misidentified its subject.** The name was parsed
as `url.split('/').pop()`, which reads the last segment of
`?host=/tmp` — so a genuinely disposable database was refused as `'tmp'`.
⛔ *A guard that misidentifies its subject is not a guard, even when it happens
to say no.* Repaired: the query string comes off first.

**The witness could not clean up after itself, and that is the substrate being
right.** The first draft opened with `DELETE FROM proposal_versions`; the second
run died on `proposal_versions is append-only: an authored formulation is
finished (attempted DELETE)`. ⭐ The immutability the witness exists to respect
refused the witness. Recorded, not worked around: there is no cleanup, every
chain is opened fresh with a server-minted id, and no assertion is global. Two
consecutive runs both return `21 passed · 0 failed`.

---

## The adapter surface, as derived

```
openChain(memberId, { locus, governedBy? })     → ProposalChain     query
appendAuthoredVersion(memberId, chainId, …)     → AppendResult      transaction
readChain(memberId, chainId)                    → StoredChain|null  query ×2
```

⛔ **`lineage` and `head` are NOT store functions.** They are the pure
`lineage()` and `headOf()` applied to what `readChain` returned. Making them
store calls would put a second implementation of succession behind a database —
census §6.1 arriving through the front door.

**`appendAuthoredVersion` is five ordered steps**, and the pure function is the
first authority while the database is the second:

```
1  lock the chain           FOR UPDATE · member_id in the predicate
2  read every version       inside that lock
3  validateChain            ⛔ corrupt rows REFUSE; never silently repaired
4  appendVersion            ⭐ succession decided by `supersedes`, in TS
5  INSERT                   the one-successor index refuses a race loser
```

⛔ **23505 only** becomes `simultaneous_append`, with no automatic retry —
retrying would make machine scheduling the ordering authority over two authored
acts. **Every other error rethrows**: database unavailability is not a domain
refusal, and the blanket `catch { return refuse('write_failed') }` of
`revisionProposal/store.ts:211` (census §6.6, the shape of the open S3
`unreachable` finding) is deliberately not copied.

---

## The falsifiers

```
F1    non-alternating MAIA/member authorship survives exactly
F2    supersedes survives exactly
F3    NULL rationale hydrates as ABSENT — the key is not on the object
F4    a substantive rationale survives unchanged
F5    governedBy absent remains absent
F6    governedBy present remains the LINEAGE REFERENCE only
F7    ⭐ timestamps do not determine lineage — root is the NEWEST row
F7b   and the head is the OLDEST row, because supersedes says so
F8    a foreign-member chain reads as null
F8b   and an absent chain reads as null too — the SAME shape
F9    append to another member's chain refuses
F9b   ⛔ and NOTHING was written
F10   a cross-chain predecessor reaches the database constraint
F11   the adapter exports no way to rewrite or delete a version
F12   what came back out validates under the pure contract
F13   a version carries exactly the contract's keys — nothing added
F13b  and a chain carries exactly its own
F14   ⭐ an append supersedes the STRUCTURAL head, not the newest row
F14b  and the chain is still linear, root first
F15   an empty replacementText round-trips as '' — a deletion is a formulation
F16   ⭐ an empty rationale ON DISK is reported, never absented away
F17   ⭐⭐ a non-23505 database error ESCAPES the adapter
F17b  and nothing was written by the failed append
```

⚠️ **F1's fixture is deliberately `maia · maia · member · member`.** An
alternating fixture cannot discriminate an implementation that infers the author
from position — the homogeneous-fixture defect this programme has already been
caught by once, and the reason M8 is a kill rather than a coincidence.

⚠️ **F11 asserts an ABSENCE OF CAPABILITY**, not a caught exception. A test that
called an update and caught the trigger would be testing the schema lane again;
this one asserts the module exports nothing matching
`update|replace|delete|remove|rewrite|edit|set`.

---

## Addendum 1 — founder review, 2026-09-14

Two findings. One merge blocker, one evidence gap. **Both repaired; neither
softened into a smaller claim.**

### ⛔⛔ MERGE BLOCKER — `headIdOf()` was a second implementation of succession

`store.ts` carried a local head-id helper: the `headOf()` algorithm reproduced
inside the persistence layer, under a comment asserting it *"duplicates no
logic"*. **It quite literally did.**

⭐ **And the proof was sitting in the falsification suite.** Mutation `M2` could
mutate that helper **alone** — which is only possible if there are **two
independently falsifiable answers to "what is the head?"**. Two implementations
that happened to agree.

That violates the central law of the lane: *persistence TRANSPORTS the contract;
it does not implement succession again.*

**Repaired:** `headOf` is imported from `./succession` and used directly
(`supersedes: headOf(versions)?.id ?? null`); the helper is deleted; the file
now carries an explicit prohibition where it stood. `appendVersion()` remains
the second check that the candidate really succeeds the current head — ⭐ that
is redundancy **inside one pure authority**, which is not the same thing as a
second algorithm in the store.

⚠️ **`M2` is retargeted accordingly.** There is no second head algorithm left to
mutate, so it now corrupts the **use** of `headOf()` into a clock-derived
predecessor — the defect the old helper made possible, expressed at the only
place it can still live. **F14 still kills it.**

### ⚠️ EVIDENCE GAP — the failure-state distinction was claimed, not witnessed

The census made this load-bearing and the implementation honoured it:

```ts
if (e.code === '23505') return refuse('simultaneous_append');
throw e;
```

⛔ **But no assertion demonstrated the second half.** It was left to source
inspection — and after what this programme learned from the S3 `unreachable`
collapse, where a real provider failure surfaced as one word with no cause
because an error was captured and then discarded a layer down, that is not good
enough.

**F17** injects a fault raising a known **non-23505** SQLSTATE (`57P01`) on
insert and requires the error to **escape**. ⛔ It must not return as
`chain_unknown`, `chain_corrupt` or `simultaneous_append` — *a domain refusal
would tell the caller a RULE said no when in fact the DATABASE could not
answer.* **F17b** adds that the failed append wrote nothing.

⛔ **Crash-safe by the F16 discipline**: the trigger is dropped in `finally`
**and** dropped unconditionally before creation, so an interrupted earlier run
cannot leave this database carrying the fault.

**M11** reproduces the S3 defect on purpose — a blanket catch converting every
database exception into one domain refusal. **F17 is the only falsifier that
kills it**, which is exactly the discrimination the gap was about.

---

## ⛔ Standing

```
census                COMPLETE
adapter               BUILT
head authority        ⭐ SINGLE — the pure `headOf()`, imported
failure propagation   ⭐ WITNESSED — F17 · F17b
witness               23 passed · 0 failed
falsifiers            11 killed · 0 survived

authorization         ⛔ NO       acceptance          ⛔ NO
MAIA generation       ⛔ NO       conversation/revise ⛔ NO
route                 ⛔ NO       UI                  ⛔ NO
manuscript write      ⛔ NO       production migration ⛔ NO
canonical merge       ⛔ NO

decision_chain_id     the LINEAGE reference, hydrated and nothing more.
                      ⛔ Nothing resolves it to a decision EVENT.
```

⚠️ The disposable cluster is **EPHEMERAL** — PG16 at `/var/lib/postgresql/succession`
(:5599, socket `/tmp`), database `store_witness`, rebuilt by applying
`database/migrations/20260914000001_proposal_succession.sql` over a
single-column `members` stub. It does not survive the container.
