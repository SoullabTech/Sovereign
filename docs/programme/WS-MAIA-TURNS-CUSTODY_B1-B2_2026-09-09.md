# LANE B · B1 CONTAINMENT + B2 IDENTITY DESIGN

**Class A.** Canonical `5b133abcd`. ⛔ **No production query. No schema change. No
repair of the broken writer. The Focus receipt remains unproposed.**

**Governing rule:** *a derived copy cannot outlive the member data whose deletion
created the obligation to remove it.*

**Order:** `B1 contain → B2 design → B3 falsify → B4 witness → B5 remediate`.
This document delivers **B1** and **B2**. B3–B5 are not begun.

---

## B1 · CONTAINMENT — both creation paths, fail-closed

### B1.1 The operator path

`scripts/backfill-training-data.sql` now raises **inside the transaction, before
any INSERT**:

```sql
BEGIN;
DO $$ BEGIN RAISE EXCEPTION 'backfill-training-data.sql is contained: …'; END $$;
```

Running it aborts and writes nothing. ⛔ The guard is removed by this lane when
identity and deletion coverage exist — **never to "just run it once."**

### B1.2 The HTTP path — ⭐ refusal, not accident

`app/api/maia/log-turn` `POST` now returns **503** and touches nothing: no query,
no transaction, and it does not even parse the request body, so nothing is held.

⚠️ **Its SQL was already broken, and that was never the boundary.** The statement
names four columns that do not exist — `role`, `content`, `engine`, `meta` —
against a schema carrying `user_text` / `maia_text`.

> ⭐ **A route that fails by accident is one plausible "fix" away from becoming a
> successful writer.** The accident is not a boundary. The refusal is.

⛔ **The broken statement is preserved unrepaired**, as evidence, moved into an
unreachable function beneath the refusal and marked DO NOT REPAIR. Repairing it
would convert a broken writer into a live one *before* custody is solved — the
exact failure this containment exists to prevent.

### B1.3 The falsifier

`lib/memory/__tests__/maiaTurnsContainment.test.ts` — **6 assertions, passing**:

```text
POST refuses · no query · no transaction · no body parsed
the retired statement is preserved unrepaired  ← fails if someone "fixes" it
the backfill raises BEFORE any INSERT, inside the transaction it aborts
ONLY these two paths contain INSERT INTO maia_turns, tree-wide
⭐ maia_turns still carries no user_id and no session FK
```

⭐ **The last is a tripwire, not a preference.** The containment rests on the
table being unable to prove whose row it is. If a `user_id` ever appears, this
test fails — forcing the custody question to be re-adjudicated deliberately
rather than quietly satisfied by a column showing up.

### B1.4 ⛔ What B1 does NOT close

Source-level containment covers **the paths that exist**. A *new* writer added
later is not covered. Only a database-level refusal closes that, and it is
designed in B2 — **not authored here**, because it is a migration and a schema
act is a founder decision.

---

## B2 · DESIGN — authoritative member identity and deletion coverage

⛔ **Design only. No migration is written and none is authorized by this
document.**

### B2.1 The identity that exists today

```text
maia_turns
  session_id   TEXT NOT NULL   ⛔ no FK, no member column
  user_text    TEXT NOT NULL   ← member's words
  maia_text    TEXT NOT NULL   ← MAIA's words
  5 child tables CASCADE from it
```

⭐ **Adding `user_id` does not retroactively make historical ownership known.**
A new column is empty for every row already there. So the design has two
populations and must not conflate them.

### B2.2 Future rows — identity at creation, or no row

```text
REQUIRED   member identity carried at INSERT time, from the authenticated
           actor — never inferred later from session_id
ENFORCED   NOT NULL, so a row without identity cannot be created
DELETION   reachable from the account-deletion path by that identity, and
           in the S5 substrate so restore cannot resurrect it
```

⭐ **Enforcement belongs at the database, not at the caller.** The S5 lane's own
lesson is the precedent: *no layer trusts a caller*. A `NOT NULL` member column
plus a mint-style gate makes an identity-less row impossible to create, which is
also the B1.4 gap closed properly — a future writer inherits the refusal without
anyone remembering to contain it.

### B2.3 Historical rows — ⛔ NOT solvable by join

`session_id` is bare TEXT with no FK. Three populations are foreseeable:

```text
attributable      session_id joins to a session with a known member
unattributable    session_id joins to nothing, or to a session with no member
ambiguous         the join is not proven total
```

⛔ **No heuristic attribution by `session_id` alone.** Deleting rows because a
string matched, or retaining them because it did not, are both the system
deciding whose words these are. The unattributable population is a **historical-custody
adjudication** with its own founder act — not a gap for a clever query to fill.

### B2.4 What B3 must falsify, when authorized

```text
an identity-less maia_turns row cannot be created
account deletion removes every attributable row AND its cascaded children
a tombstoned/manifest-scoped row cannot be restored
the backfill cannot run while its guard stands
the broken writer stays broken
⭐ deletion is proven by absence AFTER deletion — never by the delete
   statement having been issued
```

### B2.5 ⛔ Not authorized here

`user_id` column · any migration · any change to the S5 substrate · repairing
the log-turn statement · removing either guard · any production query.

---

## Standing

```text
B1 containment      ✅ COMPLETE — both paths fail closed, 6 assertions
B2 identity design  ✅ RECORDED — design only, no migration
B3 falsify          ⛔ NOT BEGUN
B4 occupancy        ⛔ NOT WITNESSED — no production contact
B5 remediation      ⛔ NOT BEGUN

new maia_turns rows        IMPOSSIBLE via both known paths
future writers             ⛔ gap named, closed only by B2.2's DB enforcement
custody defect             ESTABLISHED, unrepaired
Focus disclosure           ⛔ still NOT AUTHORIZED — this outranks it
#1275                      frozen @ 18d8c7004
gates                      typecheck no regressions · check:no-supabase clean
```

---

*Containment is not repair. It buys the right to think about identity without the
pile getting deeper while we do.*
