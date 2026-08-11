# SHARED LOCAL DATABASE CUSTODY RACE

**Date:** 2026-08-11 · **Status:** ⛔ **DIAGNOSTIC DEFECT RECORD. Authorizes no remedy.**

> Source-isolated worktrees can mutate the same local member/fixture state,
> invalidating evidence and allowing one lane's verification activity to alter
> another lane's test subject.

Third in the family, distinct from the first two:

| Defect | Shared surface | Uncovered thing |
|---|---|---|
| [`SHARED_GIT_HOOK_CUSTODY_RACE`](SHARED_GIT_HOOK_CUSTODY_RACE_2026-08-10.md) | `.git/hooks` | commits during custody drift |
| [`SHARED_CHECKOUT_SOURCE_CUSTODY_RACE`](SHARED_CHECKOUT_SOURCE_CUSTODY_RACE_2026-08-10.md) | the working tree | authorship/custody of source |
| **Shared local database custody race** (this) | **local Postgres** | **the mutable data subject a verification claim rests on** |

This one is worse in one specific way: **git worktree isolation, working as
designed, does nothing to prevent it.** The first two defects existed because
isolation was available and unused. This one exists *even when isolation is used
correctly* — because the isolation git provides is scoped to source, and the
verification evidence in this project rests on data, not source.

---

## 1. Observed

While verifying Journal Room Browse continuity in an isolated worktree
(`feature/journal-deployment-closure`, deployment custody per founder ruling
2026-08-10), an entry surfaced in the `walk.878` fixture member's corpus that this
lane never wrote:

```
id:      dd06a46f-fe8b-452a-a39d-d8c1c6596e7d
member:  walk.878
source:  journal_room
created: 2026-08-11 08:49:21
content: "CUTOVER PROOF 4c19 — written through /journal after the cutover."
```

**Ruled out:** the shared checkout's `/journal` route is unchanged, still serving
`UnifiedJournalView` — no cutover happened there. **Corroborating signal:** two new
`.claude/launch.json` entries (`journal-cutover`, `journal-candidate`) appeared
mid-session, pointing at worktrees this lane never created.

**Conclusion:** a different, source-isolated worktree performed and verified its own
`/journal` cutover — and its proof-of-work write landed in the exact fixture member
this lane's founder-walk evidence depended on. **Both lanes were correctly isolated
at the git layer.** Neither was isolated at the data layer, because in this
environment there is only one local Postgres instance, and every worktree points at
it.

### Governance check performed, and its limit

`node scripts/builder/session.mjs status` was checked — the Builder OS control
plane, not the other worktree's source — per the standing rule that a lane
discovering a collision must not inspect another lane's private tree. It showed **no
governed claim for either lane**: the cutover-testing lane has no work unit on
record, and *this* lane (`feature/journal-deployment-closure`) does too — neither was
ever opened via `session.mjs open`.

⚠️ **This is a limit of the check, not proof of anything.** Absence from the Builder
registry does not prove a lane lacks authority — a founder ruling could exist
entirely outside a conversation this instrument can see. It is simply the best
available control-plane evidence, and on that evidence alone, neither side's
authority is established. Per founder ruling, deployment custody remains with the
lane holding the last explicit grant until governance evidence says otherwise.

---

## 2. Why this is the data-layer form of a law this project already learned

> right proposition + right code subject + wrong mutable data subject = invalid evidence

The founder-walk protocol already required the *code* subject to be exact — a named
candidate SHA, walked in isolation, nothing else in flight. That discipline turned
out to be necessary but not sufficient. The **data** subject was never pinned the
same way: `walk.878` was treated as a stable fixture because nothing in the git
history could touch it, but everything running against the same Postgres instance
could.

**Fixture cleanup is not fixture isolation.** Removing the one row this session
happened to notice would not make `walk.878` trustworthy again — there is no way to
prove it was the only mutation, only that it was the only one *found*.

---

## 3. Scale of the amplifier

Measured 2026-08-11 via Builder OS: **8 distinct sessions** active within the trailing
60 minutes, request rate reading `ANOMALOUS` (9.56× baseline, 5-minute window). Every
one of them, if running against Journal fixtures, shares the same database this
incident occurred in.

⚠️ The anomalous rate reading is recorded here as an **observed condition at the time
of discovery**, not as a cause of this incident. Per standing project discipline:
*anomalous ≠ causal explanation.* No claim is made connecting the two.

---

## 4. The pattern, once more

```
correct mechanism + incomplete coverage
                ↓
        false governance confidence
```

| Defect | Correct mechanism | Uncovered |
|---|---|---|
| Hook race | the design-canon gate | which hooks are installed *right now* |
| Source race | git worktree isolation | who committed uncommitted source |
| **This** | **git worktree isolation** | **who mutated the shared data a claim rests on** |

---

## 5. Governing invariant for the future unit

> A governed verification lane must control both the code subject and the mutable
> data subject used to establish its claims.

---

## 6. Resolution applied to THIS incident (not the general remedy)

Per founder ruling, for the Journal deployment walk specifically:

1. **The contaminating entry is preserved, not deleted** — it is the clearest
   evidence the collision occurred at all.
2. **`walk.878` is retired as the founder-walk fixture.** No amount of row-level
   cleanup restores confidence in a shared, unisolated fixture.
3. **A fresh, uniquely named ephemeral member is used instead** —
   `journal.deploy.<candidate-sha>.<nonce>` — seeded with only the minimum corpus the
   walk needs, with row counts recorded before and after, and the account retired
   once the candidate is accepted.
4. **Cutover-lane authority is classified `UNKNOWN / UNVERIFIED`** on current
   evidence, not asserted either way.

This is deployment-test hygiene applied once, under a specific ruling — **not** the
general architectural remedy (candidate: per-worktree database isolation), which is
recorded below and explicitly deferred.

---

## 7. Candidate remedies — **none chosen**

Recorded to prevent premature convergence: per-worktree isolated local database or
schema (the architecturally correct fix, explicitly not undertaken now) · fixture
namespacing enforced at the schema level · a claim/lease over specific fixture rows,
analogous to the hook-custody lock · read-only fixture snapshots restored per walk ·
something else the evidence indicates.

**Do not build comprehensive per-worktree database isolation to unblock this
deployment.** A unique member plus pre/post state accounting is sufficient for this
walk. The general remedy is future work, deliberately deferred.

Independent of, and not to be merged into, any Builder OS claim-lifecycle or
capacity-coverage work, or the two prior custody-race records.
