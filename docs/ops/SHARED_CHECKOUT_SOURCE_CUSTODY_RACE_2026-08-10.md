# SHARED CHECKOUT SOURCE CUSTODY RACE

**Date:** 2026-08-10 · **Status:** ⛔ **DIAGNOSTIC DEFECT RECORD. Authorizes no remedy.**

> Concurrent lanes can commit another lane's uncommitted source changes when both
> edit the same shared checkout without exclusive claim/worktree custody.

Distinct from [`SHARED_GIT_HOOK_CUSTODY_RACE_2026-08-10.md`](SHARED_GIT_HOOK_CUSTODY_RACE_2026-08-10.md).
That defect is about the shared **enforcement** surface; this one is about the shared
**source** surface. They are the same failure family and different mechanisms.

**Provenance discipline:** everything under *Observed* was directly observed by the
authoring session, which was Lane A in the incident below.

---

## 1. Causal shape

```
Lane A edits Journal files
        ↓
changes remain uncommitted
        ↓
Lane B edits same files
        ↓
Lane B commits
        ↓
Lane A's uncommitted changes are swept into Lane B's commit
        ↓
provenance of authorship/custody becomes ambiguous
```

This is **more serious than an ordinary merge conflict, because there was no
conflict**. Neither lane was stopped. The result was a clean commit containing mixed
authorship.

---

## 2. Observed

**Lane A** (this session) built Journal Room Slice 1 and committed `07d4e1dea`. It
then made further uncommitted edits under founder rulings on tablet and
accessibility — a touch-target token (`hit`, `hitBlock`, `hitStack`), a hover token
(`quiet`, `quietGroup`), and className changes across all six room components.

**Lane B** committed `e8a23efe7` — *"feat(journal): consolidate the Journal Room
candidate"* — touching **10 files, +669 / −91**, including
`components/journal/room/tokens.ts (+54)` and every component Lane A had open. It
introduced `lib/journal/return.ts` and its tests, replacing a function Lane A had
authored.

**The sweep, verified:**

- `hitStack` was authored by Lane A at **22:55**, uncommitted, and is **present in
  `HEAD` via `e8a23efe7`** — a commit Lane A did not make.
- `git status --porcelain components/journal/room` afterwards reported **clean**.

⚠️ **That clean status is the trap.** A clean tree normally means *your work is
committed*. Here it meant *your work was committed by someone else*.

### Why authorship cannot disambiguate it

Every lane in this environment commits under the **same git identity**. `e8a23efe7`
is authored by `Kelly Nezat`, exactly as Lane A's `07d4e1dea` is. Author metadata is
structurally incapable of separating lanes, so a mixed-authorship commit is
indistinguishable from a single-author one after the fact.

### How it was detected

Not by any tool. A runtime probe showed a DOM section missing, which prompted reading
the file, which revealed content Lane A had not written. **Nothing announced the
handover** — the same silence property as the hook race.

### Not observed

Lane B's identity, intent, and whether it was aware of Lane A. No claim about
fault: **the defect is that the system permitted it**, not that either lane erred.

---

## 3. The irony worth recording

This repository already has the mechanism that prevents this: **73 git worktree roots
exist** (measured 2026-08-10). Both lanes were nevertheless working in the **same
main checkout**. Isolation was available and unused, because nothing required it.

---

## 4. The pattern

```
correct mechanism + incomplete coverage
                ↓
        false governance confidence
```

| Defect | Shared surface | Uncovered thing | Silent result |
|---|---|---|---|
| Hook custody race | `.git/hooks` | commits during custody drift | commit passes gates that never ran |
| **Source custody race** | the working tree | authorship/custody of source | clean commit, mixed authorship |

---

## 5. Future invariant

> Two active governed lanes must not be able to mutate the same member-facing source
> set without an explicit custody transfer or collision stop.

---

## 6. Custody outcome for this incident

Two founder rulings, in sequence on 2026-08-10:

1. **Lane A relinquished Journal Room write custody.** Exclusivity had been lost, and
   continuing to edit would have compounded the ambiguity.
2. **JOURNAL DEPLOYMENT CLOSURE re-established custody in Lane A** — explicitly, and
   against a named baseline, which is what makes it a genuine custody *transfer*
   rather than a lane pretending it never lost exclusivity.

**Baseline: `e8a23efe7`.** Custody is held in a dedicated git worktree rather than the
shared checkout — the structural remedy for the defect recorded here, applied to the
incident that produced it. See `docs/design/references/JOURNAL_DEPLOYMENT_CLOSURE_2026-08-10.md`.

⚠️ This is one lane taking isolation for one work unit. It is **not** the general
remedy in §7, which remains unchosen.

---

## 7. Candidate remedies — **none chosen**

Recorded to prevent premature convergence: worktree-per-lane admission · claim
registration for member-facing source sets · pre-commit detection of unclaimed
foreign modifications · per-lane commit identity so mixed authorship is visible ·
something else the evidence indicates.

Independent of, and not to be merged into, any Builder OS claim-lifecycle or
capacity-coverage work.
