# S3 · M-PHASE DISPOSITIONS — the two findings W-A/W-B left open

**Date** 2026-09-14 · **Candidate** `3a65ad1b` · **Witness** `b68eb10d`
(verified in-session: single-file record, parent IS the candidate)

⛔ **ROUTE INTEGRATION NOT OPENED.** That is a separate founder act, and nothing
here anticipates it.

---

## 1 · W-A and W-B are DISCHARGED

```text
W-A  8 independent connections · 1 claim · 7 losers · 1 consumption row
     foreign and expired opportunities produced NO ROW AT ALL
W-B  six cases PASS — interrupted · lost response · outcome deleted ·
     unclaimed+expired · delete custody · completion monotonicity
```

⭐ **S3-F1 was necessary and not sufficient; it is now sufficient.** The
physical mechanism establishes what the single-threaded double could only model.

⭐ And the scope statement in the witness is the right one: *zero receipts before
and after is a **substrate** claim.* ⛔ It does not pretend to prove that a
future integrated route cannot cross incorrectly — that is what route
integration's own evidence must show.

---

## 2 · DISPOSITION — the S3 substrate typecheck

**The finding, precisely:** `tsconfig.s3-substrate.json` sets
`noUncheckedIndexedAccess`, which the ship config has not adopted. The flag is
right for S3's own files — and it also re-checks all of `lib/db/postgres.ts`,
which S3 imports. There it surfaces `insertOne()` promising `T` while returning
`result.rows[0]`, a `T | undefined`.

```text
⛔ NOT an S3 regression — the file is unchanged since the Class-B freeze,
   and the canonical ship typecheck reports 229 vs baseline 239, 0 regressions
⛔ NOT reachable from S3 — the claimant uses query() directly, never insertOne()
```

### The two refusals

```text
⛔ weaken the flag until the command turns green   → manufactures a pass
⛔ leave the command permanently RED               → an instrument nobody can
                                                     pass teaches people to
                                                     ignore it, and decays into
                                                     prose
```

### ⭐ TAKEN: one inherited diagnostic, ALLOWED BY NAME

`scripts/typecheck-s3-substrate.mjs` keeps the flag and permits exactly one
diagnostic, keyed on **file + error code + a semantic message fragment — never a
line number** (D1's rule). Everything else fails.

```text
FAIL-CLOSED     an allowance that stops matching FAILS; it never silently passes
STALE EXEMPTION an allowance that no longer fires is REPORTED, so the exemption
                is removed rather than left standing after the defect is fixed
```

⚠️ **UNVERIFIED IN THIS ENVIRONMENT.** This container has no project
`node_modules`, so the wrapper cannot be run against the real diagnostic here;
the allowance is keyed on the message the founder's run reported. ⭐ The failure
direction is safe — a mis-keyed allowance fails rather than passes — but **the
founder's run is the evidence of record.**

### ⚠️ FINDING HANDED ON, NOT TAKEN — `insertOne()` is unsound

`insertOne<T>()` returns `undefined` as `T` when no row comes back. The type
system was hiding it; the stricter flag surfaced it.

⛔ **S3 does not fix it.** It is shared infrastructure every lane calls, the fix
changes runtime behaviour for existing callers (throw vs `undefined`), and *the
lane that finds a defect does not thereby own it.*

---

## 3 · DISPOSITION — expected-conflict logging

`query()` catches, logs `console.error` with **the SQL and the params**, then
rethrows. So a deliberate completion conflict — a *governed refusal working
exactly as designed* — currently surfaces as an unexpected error.

```text
SEMANTICS   correct: the trigger refuses, recordCompletion returns `conflict`
OPERATIONS  wrong: a predictable refusal logged at error level trains operators
            to ignore errors
```

### ⚠️ AND ONE THING THE REVIEW DID NOT NAME

⛔ **That log line carries `Params` — for this path, the act reference and the
completion identity.**

```text
NOT a content leak   both are identities; no authored character is involved,
                     so the receipt law's refusal surface is not breached
STILL wrong          "a refusal is not an occasion to disclose" is this lane's
                     own rule, and a refusal does not need to emit the
                     identities it refused
```

### Disposition

⛔ **Not repaired here**, and deliberately so — every lawful fix touches shared
infrastructure or the refusal itself:

```text
⛔ pre-check before the UPDATE      reintroduces a read that can be wrong
⛔ make the trigger not RAISE       weakens the database refusal, which IS the
                                    authority
⭐ an opt-in "expected refusal" path through the query helper, so a governed
   refusal is not logged as an unexpected error — shared infra, founder's call
```

⭐ **Recorded as a NAMED ROUTE-INTEGRATION OBLIGATION**: before S3 serves a
member, the conflict path must not log as an unexpected error, and must not emit
the refused identities.

---

## Standing

```text
CLASS-B FREEZE            INTACT @ 2255b60d
W-A · W-B                 ⭐ DISCHARGED · candidate 3a65ad1b
SUBSTRATE TYPECHECK       disposition TAKEN · one named allowance · fail-closed
                          ⚠️ unverified in this container
insertOne() UNSOUNDNESS   ⚠️ FINDING HANDED ON · not S3's to fix
CONFLICT LOGGING          ⚠️ named route-integration obligation · not repaired
ROUTE INTEGRATION         ⛔ NOT OPENED
MERGE                     ⛔ NOT AUTHORIZED
PRODUCTION                UNTOUCHED
```
