# WS-DELETE-01 — Erasure Authority Amendment (S4)

**Status: SEAM BUILT · NEGATIVE CONTROLS GREEN · RETURNED FOR FOUNDER REVIEW.**
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

## 2 — The seam

`lib/storage/erasureAuthority.ts`.

```text
SOURCE ARRIVAL AUTHORITY    may establish a NEW entrusted artifact,
                            never rewrite a historical one
CONTENT-WORKING AUTHORITY   cannot create, replace, truncate, overwrite or
                            destroy bytes in the Source namespace
SOURCE LIFECYCLE AUTHORITY  may relinquish the entrusted artifact, only through
                            the explicitly governed lifecycle
```

**A · One enqueue primitive.** `enqueueVaultErasure(tx, authority, refs)` is the only
runtime writer of `vault_erasure_queue`. The queue gained **no new column**: authority is
decided before the row is written and is never stored, so the row still cannot
reconstruct or attribute erased writing.

**B · Authority is scoped to a namespace.** `workVisualErasureAuthority()` governs
`work-visuals` and nothing else. Erasing a manuscript does not confer generic vault
power: the Work-cover path inside `eraseManuscript` takes work-visual authority, the same
authority the content route holds.

**C · Source authority is evidence, not a request.** `mintSourceErasureAuthority(tx, …)`
reads, **inside the caller's transaction**, whether the manuscript and its arrival rows
are *already gone*, and returns an authority only then. There is no flag, enum or label a
caller can supply to obtain it. A content-working path cannot reach it without having
performed the member-directed erasure — at which point it is not masquerading as the
lifecycle act, it **is** the lifecycle act. Same shape as Circles FR-18: *the authority is
the mutation, not a precheck.*

> ⚠ **Stated plainly rather than oversold:** in-process JavaScript cannot stop a module
> from importing an exported function, so this is **evidence plus locality**, not an
> unforgeable capability. The runtime half is the evidence condition; the locality half is
> PT-3's static P7 scan, which pins where the cascade-triggering DELETE may live. Neither
> half alone is sufficient, and the design does not claim otherwise.

**D · Namespace refusal at the seam.** A content-working authority handed a
`manuscript-sources/` path is refused — loudly, as a thrown refusal, never a silent skip
that would leave bytes retained behind a caller who believes it asked for destruction. A
batch containing one ungoverned path is refused **entirely**; a refusal that half-succeeds
is not a refusal.

**E · All three producers migrated, none grandfathered.**

| Producer | Authority now used |
|---|---|
| `lib/manuscript/source/eraseManuscript.ts` (source artifacts) | Source lifecycle, minted after the DELETE |
| `lib/manuscript/source/eraseManuscript.ts` (cascaded Work cover) | work-visual |
| `app/api/sovereign/living-works/[id]/route.ts` (delete Work) | work-visual |
| `app/api/sovereign/living-works/[id]/visual/route.ts` (replace · remove) | work-visual |

**F · WS-DELETE-01 still erases completely.** The lifecycle act is unchanged in effect:
one transaction, paths read while the rows naming them exist, obligation committed with
the deletion, idempotent sweep, independent consumer. The mint sits *after* the DELETE
and refuses if the rows are somehow still readable — in which case the transaction rolls
back and the member's Work is intact. Custody that cannot be relinquished is capture, not
custody; nothing here narrows the member's right to end it.

---

## 3 — Negative-control evidence

`lib/storage/__tests__/erasureAuthority.test.ts` — **11 passed, 0 failed.** Every control
asserts *nothing was enqueued*, not merely that an error was raised.

| Control | Result |
|---|---|
| Work-visual (content-working) authority handed a Source path | **REFUSED**, 0 inserts |
| Source authority handed a Work-visual path | **REFUSED**, 0 inserts |
| Namespaceless path | **REFUSED**, 0 inserts |
| Mixed batch, one path ungoverned | **REFUSED entirely**, 0 inserts |
| Source authority requested while the manuscript still exists | **null** — the act has not happened |
| Source authority requested while an arrival row survives | **null** — a half-done erasure confers nothing |
| Source authority after both are gone, then enqueue | granted; exactly the Source refs enqueued |
| Empty batch | 0 inserts, no statement issued |
| All three producers contain the seam call and no direct INSERT (property E) | **PASS** |
| Whole-runtime scan: the seam is the only inserter, comments stripped | **PASS** |

Comment-stripping is the ratified C21 discipline: this document, the seam and the test all
name the banned statement in prose, and a scan that reads prose as behaviour would fail on
the files that document their own compliance.

**Other gates:** typecheck 229 vs baseline 239, **0 regressions** · `lib/manuscript`,
`lib/storage`, `app/api/sovereign/living-works` — **58 suites, 1006 passed, 0 failed**,
including the pre-existing Work-visual doctrine suite (its two assertions that pinned the
raw SQL now pin the seam call; the doctrine — the obligation is tied to the commit — is
unchanged).

---

## 4 — Standing

⛔ Not authorized and not done: Encounter · Restore · intention authority · lineage ·
WS2-08B · `living_works.stage` · deployment · unrelated vault work · the PT-3 witness
itself (sequence step 4).

⛔ **No migration.** The queue's schema is untouched; this is an authority boundary in
code, not a new column.

⛔ **Not deployed.** The seam changes how four runtime paths reach destruction. It should
be reviewed as a constitutional shape before it runs against member data.

Owed next, per the ruling's sequence: PT-3 design amended for **P7 reachability** and the
**Source vault-write authority** (step 3, done — see the PT-3 design document), then the
PT-3 witness built against this final authority shape (step 4), then bound into the
release gate (step 5).

> Stop making safety depend on which code happens to know a pathname. Make the system
> know what kind of authority is acting.
