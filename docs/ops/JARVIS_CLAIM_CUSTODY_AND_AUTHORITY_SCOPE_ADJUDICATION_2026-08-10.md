# JARVIS — Claim State + `authority_scope` Custody Adjudication

**Date:** 2026-08-10 22:29–22:34 EDT · **Mode:** ⭐ **READ-ONLY ADJUDICATION**
**Authority:** founder ruling 2026-08-10 (claim/custody adjudication unit)

> ⛔ No claim released · recovered · reconciled · forced · created · heartbeated.
> ⛔ No implementation written · no authority-scope artifact modified · KEEP not begun.
> The only executable action taken was **re-running an existing proof script**, verified
> non-mutating before and after (§4).

---

## §1 — ⚠️ Correction of this session's own prior finding

**Prior statement (chat, 22:29):** *"`git grep authority_scope` across `*.ts` `*.sql` `*.mjs` returns
zero — no implementation boundary exists yet."*

**That inference was unsound.** `git grep` searches **tracked files in one checkout**. It cannot
observe untracked files, and it cannot observe other worktrees. The measurement tested
*"no tracked file in the main checkout mentions authority_scope"* and was then used to assert
*"no implementation exists"* — a proposition it does not test.

**Corrected:** the implementation **exists** (§3). The governing principle, restated:

> ⭐ **Evidence proves only the proposition the measurement actually tests.**
> *"Zero results in this checkout"* ≠ *"the implementation does not exist."*

Symmetrically: an older execution report is not proof that files still exist today. **Current
filesystem evidence decided existence here** — `find` across all worktrees, then `ls`, then `shasum`.

---

## §2 — Claim contract, read from executable source (`scripts/builder/session.mjs`)

⭐ Prose was **not** relied upon where source was available. No conflict found between
`docs/ops/JARVIS_CLAIM_STATE_ADJUDICATION_2026-08-10.md` §2 and the implementation.

```js
if (alive)                          claim_state = 'LIVE';
else if (authenticated && !leaseStale) claim_state = 'LIVE';   // legitimate supervisor lease
else if (unauthRecent)              claim_state = 'AMBIGUOUS_OWNERSHIP';
else if (leaseStale)                claim_state = 'STALE';
else                                claim_state = 'QUIET';

counts_active = open                      // a dead pid still holds capacity
recoverable   = open && claim_state === 'STALE'      // and nothing else
reconcilable  = open && claim_state === 'AMBIGUOUS_OWNERSHIP' && leaseStale
leaseStale    = leaseAgeS > 14400          // 4 hours
```

### ⭐ The decisive semantic finding — `recoverable: false` is **temporal, not permanent**

`recoverable: false` on a dead-pid claim does **not** mean *"can never be recovered."* It means
**"not yet STALE."** A claim with an **authenticated lease** is deliberately `LIVE` while the lease
is fresh — a supervisor lease is designed to outlive its process. Recoverability arrives on a clock.

⛔ **`recover` ≠ `reconcile`.** `recover` requires STALE (genuine absence of ownership).
`reconcile` is the governed escape from AMBIGUOUS_OWNERSHIP once the *lease itself* ages out, and is
explicitly *"deliberately NOT `--force`."* Disjoint preconditions.

---

## §3 — `authority_scope` custody

| Field | Finding |
|---|---|
| **IMPLEMENTATION EXISTS** | ⭐ **YES** |
| **LOCATION** | `/Users/soullab/MAIA-SOVEREIGN/.claude/worktrees/authority-scope-slice1/` |
| | `scripts/builder/knowledge/authority-scope.mjs` (8887 B, mtime 22:22:53) |
| | `scripts/builder/__tests__/authority-scope-slice1-proof.mjs` (10900 B, mtime 22:23:44) |
| | `package.json:161` → `"jarvis:authority-scope:proof"` |
| **WORKTREE** | `authority-scope-slice1` |
| **BRANCH** | `chore/authority-scope-slice-1` (HEAD `06f5103ef`) |
| **COMMITTED** | ⛔ **NO** — staged only: `A` impl · `A` proof · `M` package.json. HEAD is an inherited main merge; **no authority-scope commit exists** |
| **BYTES MATCH PREVIOUSLY TESTED SLICE** | **UNKNOWN** — no prior digest was recorded to compare against. Current digests recorded here for future comparison: impl `ae1b5b3e…`, proof `861c88ec…` |
| **19/19 PROOF REPRODUCIBLE WITHOUT MUTATION** | ⭐ **YES — CURRENT.** Re-run 22:33 → `19 passed · 0 failed`. Worktree dirty-digest identical before/after (`25ea64f7f2fc188b`) |
| **MATCHING BUILDER CLAIM** | ⛔ **NONE.** No record in `~/.claude/ain-delegation/` has ever named `authority-scope` (grep across the whole registry: empty) |
| **LAST WRITER / PROCESS** | ⛔ **UNKNOWN.** No claim, no pid, no lease binds these writes to an owner |

### ⭐ Proof output bears directly on D-SL-1

The re-run reports **Condition 3 sub-checks `1=PASS … 8=PASS`** — including C3.2 (*no writer of
`corpus_weight` exists anywhere*) and C3.8 (*no combined truth/confidence/rank/priority score couples
the axes*). Under D-SL-1, Condition 3 was `PARTIAL — IMPLEMENTATION-BOUND`. **The boundary now
exists and the closure proof executes green over it.**

⛔ **This does not clear Gate §14.** The artifact is uncommitted and unclaimed; a proof executed over
an unowned boundary establishes a *technical* result with **no governance standing**. Gate closure
requires the boundary to be under valid custody. **Technical PASS · governance INVALID.**

### CUSTODY CLASSIFICATION: ⚠️ **C — implementation exists outside any matching claim**

Treated as a **governance defect**. ⛔ No retrospective claim was created to make history look
conformant.

*Suggestive but NOT established:* `authority-scope-slice1` and claim `s-90e108c2`'s worktree share
HEAD `06f5103ef`. Per the ruling, ownership is **not** inferred from shared SHAs, filenames, or
timestamps. Ownership remains **UNKNOWN**.

---

## §4 — Claim adjudications

### `s-80845628` — D-14R

| | |
|---|---|
| CREATED / LAST HEARTBEAT | 2026-08-10T22:22:06Z / 22:30:47Z |
| PROCESS / ALIVE | pid 68323 · ⛔ **DEAD** (`ps` confirms absent) |
| WORKTREE / BRANCH | `…/jarvis-d14r-interactive-presence-proof` · `chore/jarvis-desktop-d14r-interactive-presence-proof` (`d3a9dab2e`) |
| CURRENT WORK PRESENT | ⚠️ **YES** — untracked `scripts/builder/design/jarvis-founder-presence-auth/d14r-interactive-proof/`; 49 commits ahead of `clean-main-no-secrets` |
| COMMITTED / UNCOMMITTED | commits preserved on branch; **the proof directory is uncommitted** |
| CLAIM STATE | ⭐ **STALE** (crossed the 14400 s lease threshold at ~22:30; hb_age 14586 s at 22:33) |
| RECOVERABLE SEMANTICS | `recoverable: true` — ordinary `recover` path is now open, **no `--force` required** |
| **SAFE RELEASE INDICATED** | ⚠️ **NO — RECOVER instead, with postconditions** |

**Recommendation: `RECOVER`** (conditional).
*Before:* confirm the untracked `d14r-interactive-proof/` directory is preserved or explicitly
accepted as disposable — recovery transfers claim ownership and would leave that artifact unowned.
*After:* verify the worktree still exists, HEAD is unchanged at `d3a9dab2e`, the untracked directory
is byte-identical, and capacity drops to 1/2.

### `s-90e108c2` — jarvis-route-a-sub-a-registry

| | |
|---|---|
| CREATED / LAST HEARTBEAT | 2026-08-11T01:48:08Z / hb_age 2745 s at 22:33 |
| PROCESS / ALIVE | pid 55774 · ⛔ **DEAD** |
| WORKTREE / BRANCH | `/Users/soullab/.claude/worktrees/ain-jarvis-route-a-deterministic-lane` · `feat/builder-os-deterministic-lane` (`06f5103ef`) |
| CURRENT WORK PRESENT | ⚠️ **YES** — untracked `scripts/builder/`; 429 commits ahead of `clean-main-no-secrets` |
| CLAIM STATE | **LIVE** — authenticated lease, not yet stale |
| RECOVERABLE / RECONCILABLE | `false` / `false` — **ineligible for every governed path** |
| **SAFE RELEASE INDICATED** | ⛔ **NO** |

**Recommendation: `KEEP`.** Not eligible for recovery or reconciliation under the contract. Becomes
STALE ≈ 3.2 h from observation. ⛔ Do not force. Route A partial work in that worktree remains
dependent on this claim for exclusive ownership.

---

## §5 — ⚠️ Falsification of the suspected control-plane defect

**Hypothesis under test:** *"Builder OS may report non-recoverable claims forever after their
processes disappear — capacity permanently exhausted without any live worker."*

⛔ **NOT SUPPORTED by this evidence.** `recoverable` is a pure function of `claim_state === 'STALE'`,
and `leaseStale` is a monotonic function of elapsed time. Observed directly: `s-80845628` transitioned
`LIVE → STALE`, `recoverable: false → true`, **during this adjudication**, with no intervention. The
state machine is time-based and self-clearing. There is **no permanent-exhaustion defect here.**

⭐ **The real defect is latency, and it is already on record** — `JARVIS_CLAIM_STATE_ADJUDICATION_2026-08-10.md`
**§C.4: *"Delegation completion does not release the Builder claim."*** A completed worker leaves its
claim holding capacity for up to the full 4 h lease window. That is a genuine control-plane defect
worth fixing; it is **not** the permanent exhaustion suspected, and the two should not be conflated.

---

## §6 — Capacity: two views (⛔ not reconciled by mutation)

| View | Value |
|---|---|
| **MECHANICAL CAPACITY** | **2 / 2** · queued 0 · recoverable `[s-80845628]` |
| **LEGITIMATE ACTIVE CUSTODY** | **0 / 2 live** — both processes dead; **no live worker holds either claim** |
| *(qualifier)* | Both worktrees hold **uncommitted work that still requires custody**, so neither claim is empty — but neither corresponds to a running worker |

⚠️ **The discrepancy that matters:** the one lane doing real authority-scope work holds **zero
claims**, while both capacity slots are consumed by claims whose processes are dead. Capacity
accounting and actual custody have come apart in **opposite directions simultaneously.**

---

## §7 — KEEP preconditions (facts only)

| Precondition | State | Basis |
|---|---|---|
| AUTHORITY_SCOPE BOUNDARY SETTLED | ⛔ **NO** | implementation exists but is **uncommitted and unclaimed** (custody C). Settled ≠ written. |
| GOVERNANCE STATE KNOWN | ✅ **YES** | established by this adjudication |
| CLAIM CAPACITY AVAILABLE | ⛔ **NO** | 2/2 consumed; one slot is *restorable* via `recover`, not currently available |
| **KEEP** | ⛔ **HELD** | |

⛔ KEEP was not begun. Even had capacity been available, this unit had no authority to begin it.

---

## §8 — Disclosure: this session's own custody exposure

⚠️ Two branch-committed copies of documents this session also edited in the **main checkout** exist:

| Branch commit | File | Relation to this session's edit |
|---|---|---|
| `f0e452633` (`chore/corpus-weighting-schema-status-correction`) | `docs/canon/CORPUS_WEIGHTING_SCHEMA_v1.0.md` | ⚠️ **DIVERGENT.** This session appended a 17-line founder-ruling block to the **main checkout** copy. sha256 branch `657562d5…` vs main `79e8dfc0…`. The change is **purely additive** (insertion before the `**Lineage:**` line) and mergeable, but the divergence was created without knowledge of the branch copy. |
| `bb297b567` (`chore/preserve-jarvis-authority-scope-documents`) | 3 JARVIS authority-scope docs | ✅ Not edited by this session — read only. |

⛔ No attempt was made to reconcile these. Reconciliation is a separate, claimed act.

---

## §9 — Recommended next governance action

**Adjudicate `s-80845628` first (it is now legitimately STALE), then resolve custody class C.**
⛔ Do **not** clear claims merely to free capacity — that would conceal the custody violation, which
is the more important of the two signals.

Order: (1) recover `s-80845628` under §4 postconditions → capacity 1/2 · (2) place the
`authority-scope-slice1` artifacts under a **valid claim** before any further authority-scope work,
so the 19/19 proof acquires governance standing · (3) reconcile the CORPUS_WEIGHTING divergence
(§8) · (4) allow `s-90e108c2` to age out naturally, or close it via its owner's ordinary path ·
(5) only then re-evaluate KEEP preconditions.

---

**STOP.** ⛔ No claim mutation · no KEEP · no implementation.

---

## §10 — ⭐ OUTCOME ADDENDUM — 2026-08-10 22:38 EDT (post-adjudication)

Founder ruled recovery of `s-80845628`. **A parallel lane executed the same ruling ~10 seconds
ahead of this session.** Recorded because the race, and its correct refusal, are the evidence.

| Time (EDT) | Event |
|---|---|
| 22:37:03 | This session verifies preconditions: `s-80845628` = active · STALE · `recoverable: true` |
| 22:38:16 | ⭐ **Another lane recovers `s-80845628`** — ledger `event: "recovered"`, `forced: false`, sanctioned stale path |
| 22:38:26 | ⭐ That lane opens **`s-dd465195`** · unit `authority-scope-slice-1-custody-adoption` · branch `chore/authority-scope-slice-1` · worktree `authority-scope-slice1` · baseline `dirty_count: 3` |
| ~22:38:26 | This session's `recover` call → **`session s-80845628 is abandoned — nothing to recover`** |

### Findings

1. ⭐ **The mechanism prevented a double-recovery.** This session's call refused on
   `!counts_active`. No `--force` was used by either party. **The concurrency control worked.**
2. ⭐ **Custody class C is being resolved prospectively, as ruled** — `s-dd465195` adopts the
   pre-existing dirty state as its **baseline** (`dirty_count: 3`, `dirty_digest: 66b4ad1c0075ae0d`)
   rather than asserting the artifacts originated under it. ⚠️ This session did **not** author that
   claim and cannot verify its reason string carries the non-assertion of original provenance.
3. ✅ **Nothing was lost.** Verified after the fact:
   - authority-scope artifacts **byte-identical** to the 22:33 proof run — impl `ae1b5b3e…`,
     proof `861c88ec…`, HEAD `06f5103ef`, dirty 3.
   - D-14R artifacts **intact and unowned** — HEAD `d3a9dab2e`, 13 files, digest
     `02e83499fba8b1ba2b346f0f3fc33e9e` (identical to the pre-recovery capture).
4. ⚠️ **The D-14R orphan survives the recovery.** `d14r-interactive-proof/` remains uncommitted and
   now belongs to no claim. Siblings `d14l`/`d14p`/`d14q` are tracked; d14r is not. **Open item —
   not adopted, not discarded, not scheduled.**

### Revised state

```
MECHANICAL CAPACITY:            2 / 2   (s-90e108c2 · s-dd465195)
s-80845628:                     RECOVERED by another lane — no longer active
authority_scope CUSTODY:        C → adoption IN PROGRESS under s-dd465195
authority_scope ARTIFACTS:      unchanged, byte-verified
D-14R ORPHAN:                   OPEN — uncommitted, unowned
KEEP:                           HELD (capacity still 2/2; boundary still unsettled)
```

⛔ This session took **no further action** on the authority-scope worktree — it is now validly
claimed by `s-dd465195`, and touching it would be the collision this adjudication exists to prevent.
