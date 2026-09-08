# WS-DELETE-01 — Erasure Authority Amendment (S4)

**Status: SEAM REPAIRED · NC-12…NC-18 GREEN · RETURNED FOR FOUNDER REVIEW (2nd).**
**First implementation REFUSED by founder review, 2026-09-08 — recorded in §2.0, not
erased. Step 4 (building PT-3) remains held.**
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

## 2 — The repaired seam

`lib/storage/erasureAuthority.ts`. **There is no authority object.** Nothing to forge,
nothing to widen, nothing to carry out of the transaction that gave it meaning.

> **Source lifecycle authority is an operation, not a portable token.**

**`relinquishManuscriptSource(tx, manuscriptId, memberId, label)`** — the governed
operation, running inside the caller's transaction:

```text
capture the exact Source refs                 (read while the rows naming them exist)
  → member-scoped DELETE … RETURNING          (positive evidence of the transition)
    → enqueue exactly those captured refs     (only after a row comes back)
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

`lib/storage/__tests__/erasureAuthority.test.ts` — **15 passed, 0 failed.** Every control
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
| Statement ordering: capture → delete → enqueue | **PASS** |
| **P9** a real relinquishment still completes fully | both refs enqueued |
| All producers through the seam, none grandfathered | **PASS** |
| Whole-runtime scan: the seam is the only queue inserter (comments stripped) | **PASS** |
| Whole-runtime scan: `DELETE FROM member_manuscripts` exists only in the seam | **PASS** |

**Stated rather than overclaimed:** these run against a recording transaction client, so
they prove the seam's decisions and its statement ordering. They do not re-test
PostgreSQL's rollback — that is the database's guarantee. What the repair makes
*structurally* true, and what NC-18 checks, is that no object exists that could outlive a
transaction and still authorize anything.

**Other gates:** typecheck 229 vs baseline 239, **0 regressions** · `lib/manuscript`,
`lib/storage`, `app/api/sovereign/living-works` — **58 suites, 1010 passed, 0 failed**,
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

> Stop making safety depend on which code happens to know a pathname. Make the system
> know what kind of authority is acting.
