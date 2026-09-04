# SELF-ADDRESSED-RETURN-01 — §7.6 real-database integration witness

**Date:** 2026-09-04
**Result:** §7.6's four cases hold. **34/34** integration · **32/32** dispatch · **115/0** registry.
**Not closed:** this witness covers §7.6's integration bullet only. Worker registration, the
production cancel secret, the member-facing surface, and the production witness remain.

---

## 0. Binding

```text
candidate                cff6a4849 + this evidence commit
PostgreSQL               17.7 / UTF8
fresh DB                 maia_sar01_integration
migration chain          3 migrations
§7.6                     34/34
dispatch                 32/32
registry / R32           115/115 under ugrep
concurrent connections   distinct pg_backend_pid()
scratch DB               DROPPED
maia_consciousness       UNTOUCHED
GNU registry             still 110/5 pending #1202
```

---

## 1. Exact provenance

| | |
|---|---|
| Branch | `claude/maia-reengagement-nudges-rtzrwg` |
| HEAD | `cff6a4849cd724d0d1ca5790b9b851d2c94a4169` (`cff6a4849`) |
| Working tree | `scripts/verify-reminders-dispatch.ts` modified · `scripts/verify-reminders-integration.ts` added (both recorded in §4) |
| PostgreSQL | `17.7 (Homebrew) on aarch64-apple-darwin24.6.0` |
| `server_encoding` | **UTF8** |
| Database | `maia_sar01_integration` — created disposable, **destroyed after** (§6) |
| `maia_consciousness` | **untouched.** No migration applied to it, no row read or written by any proof here |

**Not rebased onto PR #1202.** That PR (refusal-registry grep portability) is open, not merged;
binding this witness to an unmerged branch would bind it to something that does not yet stand.
This proof is on `cff6a4849` and depends on nothing in #1202.

### Migration chain — complete and minimal

Applied in order to an empty `TEMPLATE template0` UTF8 database:

1. `20260103000001_members.sql`
2. `20260521000001_member_memory_atoms.sql`
3. `20260904000002_member_reminders.sql`

Resulting schema — nothing else was needed or present:

```
member_memory_atoms · member_reminders · members · v_member_memory_atoms_summary
```

## 2. Results

| Suite | Command | Result |
|---|---|---|
| §7.6 integration | `npx tsx scripts/verify-reminders-integration.ts` | **34 passed · 0 failed** |
| Dispatch authority | `npx tsx scripts/verify-reminders-dispatch.ts` | **32 passed · 0 failed** |
| Refusal registry (incl. R32) | `npx tsx tests/constitutional/refusal-registry/index.ts` | **115 passed · 0 failed** (24 refusals) |

**Negative control on the destructive-target guard.** The dispatch verifier was pointed at
`maia_consciousness` and **refused before executing any statement** — exit code `2`, message naming
the connected database. `maia_consciousness` still reported its 16 members immediately afterwards,
confirming the refusal happened ahead of the `DELETE`, not after it. The guard is demonstrated, not
merely present.

### §7.6 coverage

**0 — the table's constraints refuse the states they forbid** (8 assertions). Declared constraints
are not enforcement until the database rejects the row, so each forbidden state was *attempted*:
cancelled-and-dispatched, delivery-without-dispatch, dispatch-without-claim, a partial claim lease,
a failure code without a failure time, a deadline before delivery, a typed source with no
`source_id`. Each was refused by its named constraint. Absence-blindness was asserted against
`information_schema` — the **live** table, not the migration text.

**1 — creation is member-owned** (5). A member may schedule their own atom; another member's is
refused 404; and the refusal for someone else's atom is **byte-identical** to the refusal for an
atom that does not exist, so it leaks nothing.

**2 — `sacred_protected` is refused** (4). The member's *own* sacred_protected atom is refused,
indistinguishably from non-existence. An atom webbed across several registers is refused if **any**
is sacred_protected (the predicate is `ANY()`, not scalar equality). A non-sacred atom in the same
registers is still available — the gate is not vacuous.

**3 — cancellation is idempotent** (8). Three successive cancellations all report `cancelled`; the
row is stamped exactly once; another member gets `not_found`. Idempotence correctly **stops** at the
linearization point: once `beginDispatch` succeeds, cancellation reports `already_sending`, not a
false success.

**4 — two independent connections race one due reminder** (6). Two separate `pg.Client`
connections, verified to be **distinct server backends** by `pg_backend_pid()` — not two calls
multiplexed over one client, and not the shared pool. Issued the worker's claim simultaneously:
exactly one leased the row (`FOR UPDATE SKIP LOCKED`). The winner obtained dispatch authority; a
second dispatch on the same row was refused `already_dispatched`; a connection without the winning
claim token could not dispatch; the member's words were dispatched exactly once.

## 3. R32

All 9 checks pass, **including its own negative control** (the detector still catches a deliberate
`last_seen` read, a `SELECT * FROM members`, and `opened =` telemetry).

R32-D is worth naming: *"no conversation-turn writer reaches `member_memory_atoms` or
`member_daily_anchors` — Sanctuary safety is **local**, not inherited from R21."* Spec §7.5 worried
that §6.6's sanctuary argument rested on a then-red R21. R32-D proves the property locally, so the
Tier 1 claim does not actually depend on that inheritance.

## 4. Two findings

### 4.1 The 32/32 dispatch proof was not reproducible as written — now it is

Spec line 733 records *"Real-DB dispatch proof | 32/32 (9 cases + invariant sweep)"*. Against a
fresh database carrying the canonical schema, `verify-reminders-dispatch.ts` **failed at its first
fixture insert**:

```
INSERT INTO members (email) VALUES ('witness@example.test')
→ 23502: null value in column "passkey" violates not-null constraint
```

`members.passkey` is `NOT NULL` in `20260103000001_members.sql` and **no migration ever relaxes
it** — verified across all migrations, and `maia_consciousness` reports `is_nullable = NO` too. So
the script could not have completed against the canonical schema in any environment.

Repaired by supplying the full required tuple (`passkey`, `username`, `password_hash`). The suite
then passes **32/32 genuinely**. The number in the spec was right; it now has a run behind it.

### 4.2 Unguarded destructive verifier — **CLOSED by this commit**

Both verifiers delete fixture data, and `verify-reminders-dispatch.ts` carried **no guard on its
target**. Pointed at `maia_consciousness` — or production — it would have emptied the members
table. The instruction to use a disposable database was load-bearing, not hygiene.

**Both scripts now refuse to execute** unless `current_database()` names a disposable database
(`_test` / `_integration`), checked **before the first destructive statement**.

The check reads `current_database()` over the live connection rather than parsing `DATABASE_URL`,
because the URL is not authoritative about where the client lands: the database segment may be
absent, `PGDATABASE` may override it, and a service alias may redirect it. The connection is the
only thing that knows where it actually is.

Verified by pointing the dispatch verifier at a non-disposable database and confirming it refused
with no statement executed (§2, negative control).

## 5. What this authorizes — and what it does not

**Authorizes:** that against real Postgres with the canonical schema, Tier 1's creation gate is
member-owned and sacred-blind, cancellation is idempotent up to but not past the linearization
point, the forbidden lifecycle states are unrepresentable, and two genuinely independent
connections cannot both dispatch one reminder.

**Does NOT authorize:**

- any claim about **production** — this ran on a local disposable database, never against
  minisforum, and no member has used this path;
- that email is ever actually delivered — no provider was called; the proof stops at dispatch
  authority;
- that the **member-facing surface** works — the API is proven, the UI is not in this unit;
- Stage 4/5 language of any kind. Per CLAUDE.md contact-fidelity progression this is a **local
  integration proof**, not a live witness.

## 6. Database destroyed

`maia_sar01_integration` was dropped after the run. Nothing persists; re-running rebuilds it from
the three migrations above.

## 7. Sequence after #1202 merges

1. Merge PR #1202 (refusal-registry grep portability) to canonical.
2. Bring canonical into this lane — **then**, not before.
3. Re-run the complete exact-head gate set on the merge result: registry, dispatch 32/32,
   integration 34/34, `npm run typecheck`.
4. That successor SHA becomes the PR candidate for Tier 1.

Until then this lane's registry run is grep-implementation-dependent: **115/0** under ugrep/BSD
grep, **110/5** under GNU grep, because the R19/R21 detector defect is repaired in #1202 and not
here. That divergence is expected and is not a property of Tier 1.
