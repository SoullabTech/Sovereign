# WS-DELETE-01 — Erasure Authority Amendment (S4)

**Status: ACCEPTED — founder ruling, 2026-09-08. This defect is CLOSED.**
Seam repaired twice · NC-12…NC-19 green, NC-19 against real PostgreSQL.
**Review 1 refused the implementation (§2.0). Review 2 accepted the architectural shape
and held acceptance for one concurrency defect (§2.1). Review 3 accepted the repair.**
All three are recorded, not erased — the five original defects remain constitutionally
instructive and stay in the record. **PT-3 Step 4 is authorized on this acceptance.**

The accepted invariant, in full:

```text
lock member-scoped lifecycle subject
  → capture the complete stable Source inventory
    → member-scoped destructive transition, requiring positive DELETE … RETURNING
      → enqueue exactly the captured Source refs
        → commit or roll back as one transaction
```

**The lock is part of the constitutional boundary, not an optimization.** The accepted
concurrency law: *a snapshot is not the relinquished set unless the boundary prevents that
set from changing while the lifecycle act is underway.* The unlocked demonstration in the
NC-19 witness is retained as the negative control for the lock.
Date: 2026-09-08 · Branch: `claude/studio-bring-work-back-icvfaa`
Authorizing act: founder ruling 2026-09-08, *PT-3 Source Custody / WS-DELETE-01 Erasure
Authority*, §2 (S4 authorized first) and §1 (lane ownership).

Lane ownership, as ruled: **the three-producer finding is adjudicated here**, in the lane
that constituted `vault_erasure_queue`. PT-3 discovered the defect and owns the property
that must become true — *a content-working act cannot reach Source-destruction
authority* — but does not take ownership of the global erasure channel to satisfy its own
test.

---

## 1 — What is amended, with the prior wording preserved

`database/migrations/20260907000001_vault_erasure_queue.sql` constituted the queue with
this discipline. It is quoted, not deleted:

> *"NOT a general lifecycle system. It has exactly one producer (the manuscript DELETE
> act) and one consumer (the sweep). Anything wanting a broader deletion lifecycle needs
> its own ruling."*

By 2026-09-08 there were **three** runtime producers — manuscript erasure, Work deletion,
and Work-cover replacement, the last a content-working route. The founder's correction:

> **Producer count was a proxy for bounded authority. The system has outgrown the proxy.
> Preserve the bounded authority, not the obsolete count.**

**The amended invariant:**

> Every runtime request to place a vault artifact beyond recovery passes through **one
> governed authority boundary**, and that boundary determines whether the requesting act
> is authorized to destroy **that class** of artifact. Multiple legitimate producers may
> exist only when their authority is explicitly bounded.

The migration's own sentence is now historical: it named the right danger and the wrong
invariant. It stands in the record as written, superseded here rather than edited there.

---

## 2.0 — The first implementation, and why it was refused

Recorded rather than deleted: it was refused for reasons that are now the design.

It minted a portable `ErasureAuthority` on the observation that a manuscript and its
arrival rows were **absent**. The founder's finding:

> **absence + namespace is not evidence + locality.**

| # | Defect | Consequence |
|---|---|---|
| 1 | Absence proves a **state**, not the **transition** that produced it | a nonexistent id, or an id belonging to another member, minted Source authority with no erasure having occurred — so the claim *"a content-working path cannot obtain it without having performed the erasure"* was **not true** |
| 2 | The authority was **namespace-wide** | a legitimate erasure of manuscript A could enqueue manuscript B's Source — authority over one act becoming authority over every Source artifact |
| 3 | The token was **transferable** | mint in transaction A, let it escape, roll A back, use it in transaction B |
| 4 | `MINTED` was a type-shape intention the seam never validated at runtime | a cast or a hand-built object was a capability |
| 5 | The namespace check was **textual** while destruction resolves paths | `work-visuals/../manuscript-sources/x` classified as a Work visual, resolved into Source |

The corrected requirement, in the founder's words:

> Source-destruction authority must arise from the **actual governed lifecycle
> mutation**, be **bounded to exactly what that mutation relinquished**, and be
> **unreachable from content-working code** except by crossing the visible lifecycle
> boundary.

---

## 2.1 — The concurrency defect, and the lock that closes it

Founder review 2026-09-08 (second return) accepted the architectural shape and held
acceptance for one remaining defect. It was real, and it recreated the exact custody
failure the seam exists to prevent.

`relinquishManuscriptSource()` captured the Source refs and only then deleted the parent
manuscript, with no lock on the manuscript before the capture. `claimArrival()` attaches
an unclaimed arrival to a manuscript through ordinary independent queries. So:

```text
ERASURE TX                         ARRIVAL CLAIM
capture refs → [A]
                                   attach arrival B → manuscript M, commit
DELETE manuscript M
  cascade deletes A AND B
enqueue [A]
COMMIT
  → B's custody row: gone · B's bytes: retained · erasure handle: absent
```

> **A snapshot is not the relinquished set unless the boundary prevents that set from
> changing while the act is underway.**

**The repair.** A member-scoped `SELECT … FOR UPDATE` on the manuscript, **above** the
capture, establishing it as a locked lifecycle subject before any inventory is taken:

```text
lock the manuscript FOR UPDATE   →  capture refs  →  DELETE … RETURNING  →  enqueue
```

`FOR UPDATE` conflicts with the `FOR KEY SHARE` a foreign-key attachment takes on its
referenced row, so a concurrent claim **waits**. If the erasure commits, the claim can no
longer attach to a manuscript that no longer exists; if it rolls back, the claim proceeds
and is visible to the next attempt. The lock also doubles as the existence and ownership
test — no row to lock means no lifecycle subject, so nothing is inventoried and nothing
is deleted.

It must stay above the capture: a second read after the DELETE is too late, because the
cascade has already destroyed the rows carrying the refs. Isolation was **not** raised
globally — the invariant belongs locally, at the custody boundary.

---

## 2 — The repaired seam

`lib/storage/erasureAuthority.ts`. **There is no authority object.** Nothing to forge,
nothing to widen, nothing to carry out of the transaction that gave it meaning.

> **Source lifecycle authority is an operation, not a portable token.**

**`relinquishManuscriptSource(tx, manuscriptId, memberId, label)`** — the governed
operation, running inside the caller's transaction:

```text
lock the member-scoped manuscript FOR UPDATE  (the custody inventory becomes stable)
  → capture the exact Source refs             (read while the rows naming them exist)
    → member-scoped DELETE … RETURNING        (positive evidence of the transition)
      → enqueue exactly those captured refs   (only after a row comes back)
```

It returns an **outcome**, never destruction power.

| Requirement | How it is met |
|---|---|
| **1 · positive transition evidence** | the enqueue is downstream of `DELETE … RETURNING`; no row returned → `{deleted:false}`, nothing enqueued, *even though the manuscript is then demonstrably absent* |
| **2 · exact-artifact binding** | the refs enqueued are the ones this call captured, for this manuscript, under this member. There is no parameter by which another manuscript's Source could be named — the binding is the query, not an argument |
| **3 · same-transaction binding** | capture, delete and enqueue are one call on the caller's `tx`; a rollback takes all three |
| **4 · runtime non-forgeability** | achieved by removal: the generic enqueue is module-private, and the module exports no authority type, no mint, and no function taking an authority. A capability that does not exist cannot be counterfeited |
| **5 · canonical namespace** | one `canonicalVaultRef()` validator at the boundary refuses absolute paths, drive letters, backslashes, NUL, empty, `.` and `..` segments — so the object authorized and the object destroyed are the same canonical object. It refuses rather than normalizes: a reference that survives is one `path.resolve` cannot relocate |

**Content-working counterpart.** `eraseWorkVisualBytes(tx, refs, label)` is likewise an
operation, bounded to `work-visuals` by construction. Handed a Source path — canonical or
disguised as traversal — it refuses. A batch containing one ungoverned path is refused
**entirely**; a refusal that half-succeeds is not a refusal.

**Producers, all migrated, none grandfathered.**

| Producer | Operation |
|---|---|
| `lib/manuscript/source/eraseManuscript.ts` (Source) | `relinquishManuscriptSource` — its own `DELETE` moved inside the seam |
| `lib/manuscript/source/eraseManuscript.ts` (cascaded Work cover) | `eraseWorkVisualBytes` |
| `app/api/sovereign/living-works/[id]/route.ts` | `eraseWorkVisualBytes` |
| `app/api/sovereign/living-works/[id]/visual/route.ts` (replace · remove) | `eraseWorkVisualBytes` |

**The queue gained no column.** Authority is decided before the row is written and is
never stored, so the row still cannot reconstruct or attribute erased writing.

**F · WS-DELETE-01 still erases completely.** Ordering and atomicity are unchanged; the
member's right to relinquish custody is untouched. Custody that cannot be ended is
capture, not custody.

---

## 3 — Negative-control evidence

`lib/storage/__tests__/erasureAuthority.test.ts` — **17 passed, 0 failed.** Every control
asserts *nothing was enqueued*, not merely that an error was raised.

| Control | Result |
|---|---|
| **NC-12** nonexistent manuscript | no transition, no refs, **0 inserts** |
| **NC-13** manuscript outside the member scope | no transition, **0 inserts**, existence never confirmed |
| **NC-14** one act cannot reach another manuscript's Source | only the captured refs enqueued; B absent |
| **NC-15 / NC-16** fabricate or repurpose an authority | **structural**: the module's entire export surface is pinned — no authority type, no mint, no generic enqueue, no function taking an authority |
| **NC-17** `work-visuals/../manuscript-sources/x` under content authority | **REFUSED**, 0 inserts; plus 9 further non-canonical shapes refused |
| **NC-18** an outcome surviving a rollback | authorizes nothing — there is no call that accepts it; asserted against the module's own source |
| Content authority handed a plainly canonical Source path | **REFUSED**, 0 inserts |
| Mixed batch, one ungoverned path | **REFUSED entirely**, 0 inserts |
| Statement ordering: **lock → capture → delete → enqueue** | **PASS** |
| **P9** a real relinquishment still completes fully | both refs enqueued |
| All producers through the seam, none grandfathered | **PASS** |
| Whole-runtime scan: the seam is the only queue inserter (comments stripped) | **PASS** |
| Whole-runtime scan: `DELETE FROM member_manuscripts` exists only in the seam | **PASS** |

**Stated rather than overclaimed:** the controls above run against a recording
transaction client, so they prove the seam's decisions and its statement ordering, not
PostgreSQL's row-lock or rollback behaviour. That admitted limit is exactly why the
concurrency defect gets its own database-backed witness.

### NC-19 — concurrent arrival claim, against real PostgreSQL

`scripts/witness/ws-delete-01-s4-concurrency-witness.ts` — two real connections, two real
transactions, interleaved. **Run 2026-09-08 against PostgreSQL 16.13, schema built from
the actual `20260824000001` and `20260907000001` migrations: ALL CONTROLS PASSED.**

| Control | Result |
|---|---|
| 1 the lifecycle subject is locked before any inventory is taken | **ok** |
| 2 the inventory sees exactly the Source already attached | **ok** |
| 3 ⛔ **the race is closed** — the concurrent claim cannot cross the locked boundary | **ok**, blocked while the inventory is open |
| 4 positive transition evidence preserved | **ok** |
| 5 once erasure commits, the claim cannot attach to the erased manuscript | **ok** — PostgreSQL gives the *stronger* outcome: the waiting UPDATE resumes, finds its parent gone, and the foreign key **refuses it (23503)** rather than quietly matching zero rows |
| 6 ⛔ **no orphaned Source** — B never became this manuscript's and was never cascaded away | **ok** |
| 7 every Source actually relinquished is owed destruction | **ok** |
| 8 and nothing else is | **ok** |
| 9 the cascade took exactly the row whose ref was captured | **ok** |

**And the defect demonstration, in the same witness** — the identical interleaving with
the lock removed, i.e. the code exactly as it stood before this repair. A falsifier that
cannot show what it would catch is not yet a falsifier:

| | |
|---|---|
| D1 without the lock the claim crosses the open inventory | **reproduces** |
| D2 the erasure still reports a clean success | **reproduces** |
| D3 ⛔ B's custody row was cascaded away | **reproduces** |
| D4 ⛔ …and its bytes are owed to **nobody** — *unreferenced but retained* | **reproduces** |

If that half ever stops reproducing, the control above has stopped meaning anything and
the witness fails rather than reporting a quiet pass.

**Static ordering pin.** Two further unit controls hold the lock in place: `lockAt === 0`
in the statement sequence, and a source-order assertion that `FOR UPDATE` precedes the
capture, which precedes the DELETE, which precedes the enqueue. A future edit moving the
lock beneath the snapshot would leave every single-threaded control green and silently
reopen the race; these fail instead.

**Other gates:** typecheck 229 vs baseline 239, **0 regressions** · `lib/manuscript`,
`lib/storage`, `app/api/sovereign/living-works` — **58 suites, 1012 passed, 0 failed**,
including the pre-existing Work-visual doctrine suite (its assertions now pin the seam
operation; the doctrine — the obligation is tied to the commit — is unchanged).

---

## 4 — Standing

⛔ Not authorized and not done: Encounter · Restore · intention authority · lineage ·
WS2-08B · `living_works.stage` · deployment · unrelated vault work · **the PT-3 witness
(step 4 remains held)**.

⛔ **No migration.** The queue's schema is untouched; this is an authority boundary in
code.

⛔ **Not deployed.** The seam changes how four runtime paths reach destruction, and moves
the manuscript DELETE itself. It should be accepted as a constitutional shape before it
runs against member data.

Owed next, per the ruling's sequence: founder acceptance of the repaired S4 → amend PT-3
**P8** to the post-S4 shape (already folded into the design document, §4) → build PT-3 →
let **P11** expose whether the Source-write boundary needs its own repair → bind into the
release gate → demonstrate P9 still fully relinquishes custody.

## 5 — Recorded, not expanded into this lane

`claimArrival()` performs its arrival claim and the subsequent `member_manuscripts.source_custody`
update as **two separate top-level statements**, not one transaction. The NC-19 repair did
not require changing it — the parent lock closes Source custody from the erasure side — so
per the ruling it is recorded here as a follow-on for its own review, and **not** used to
broaden S4.

> Stop making safety depend on which code happens to know a pathname. Make the system
> know what kind of authority is acting.
