# Dormant Proof-Instrument Review

**Date**: 2026-08-09 · **Mode**: analysis. ⛔ Nothing bound, committed, or implemented.
**Question ruled open by** `docs/governance/FOUNDER_RULING_CLOSED_LOOP_1_STEP5_2026-08-09.md`:

> **Can `/orient` and `/continue` certify work if their own proof instruments have no invocation
> boundary?**

**Instruction**: do not bind them; determine whether this is *merely* a Horizon IV concern or
whether the current Closed Loop 1 claim **needs qualification**.

---

## Answer

**Both — but not in the way the question is framed.** Dormancy turns out **not** to be the binding
defect. A different, sharper defect was found while testing it, and **that** one requires
qualification now.

| | verdict |
|---|---|
| Does dormancy invalidate the point-in-time proofs? | **No** — and the reason is structural (§1) |
| Does dormancy prevent certifying other work? | **Only outside the ref where the proof ran** (§2) |
| Is the current Closed Loop 1 claim adequate? | **No — one qualification is required** (§3) |
| Is the general dormancy question Horizon IV? | **Yes, and it should stay there** (§5) |

---

## 1. The proofs are non-circular, and that is why dormancy does not void them

The obvious worry is regress: `/orient` certifies work; the proof suite certifies `/orient`; what
certifies the proof suite? If the answer were "nothing," a dormant proof would establish only
**self-consistency**.

It terminates, and the founder's own Step-1 hardening requirement is what terminates it. Verified
by inspection:

- The proof invokes the probe **only as a subprocess** (1 call site); it imports **zero** probe
  internals.
- Every expected value is derived from **independent git plumbing** with unambiguous semantics —
  `rev-parse --abbrev-ref HEAD`, `rev-parse --short HEAD`, `status --porcelain`,
  `log -1 --format=%cI`, and the two-dot `rev-list --count` ranges.

So the proof's referent is **git's behavior**, not the probe's. The regress terminates at an
external witness.

> **Finding 1.** The hardening requirement ("derive expected values independently, not by
> reproducing the same parsing logic") did more than catch a reversed reading. **It is the property
> that makes a *dormant* proof still meaningful.** Had the proof re-used the probe's `--left-right`
> parsing — as the first draft did — the regress would not terminate and dormancy *would* void it.

This generalizes, and is the review's most portable result:

> **A proof instrument may be dormant without being worthless, provided its expected values are
> derived from a witness independent of the thing under test. A proof that shares its subject's
> logic establishes only self-consistency, and dormancy then makes it useless.**

## 2. What dormancy actually costs

A proof run at ref *X* with recorded provenance establishes a **measurement-class** claim:
*"at X, these instruments behaved as specified."* Dormancy cannot retroactively unmake a
measurement. What an invocation boundary would add is different in kind — it converts a
point-in-time measurement into a **maintained** guarantee across change.

Therefore the precise cost:

> **A dormant proof instrument can legitimately certify work only where the certification and the
> proof share a ref** — i.e. where the proof was run against the same instrument state that
> performed the certification. Outside that ref, the certification rests on an unverified
> instrument.

This is checkable, and materially weaker than "bind the instruments."

## 3. The defect that does require qualification — the certification ref does not contain the instrument

Testing §2 surfaced the real problem. The first packet's `VERIFIED` lines carry
`provenance: 851c2e73a · dirty 245 · 2026-08-09`. Measured:

```
❌ ABSENT from 851c2e73a   scripts/builder/orient.mjs
❌ ABSENT from 851c2e73a   scripts/builder/continue.mjs
❌ ABSENT from 851c2e73a   scripts/builder/__tests__/orient-proof.mjs
❌ ABSENT from 851c2e73a   scripts/builder/__tests__/continue-proof.mjs
tracked files under scripts/builder, .claude/skills/{orient,continue}, docs/handoffs: 0
```

**The provenance names a ref that does not contain the artifact it certifies.** It is not false —
`851c2e73a` *was* HEAD — but it is **epistemically empty**: a future session checking out
`851c2e73a` would find none of these files. The instruments exist only in one uncommitted working
tree among ~101 worktrees.

This is `feedback_instrument_referent_matching` — *"`--verify` measures the observer's checkout, not
the deployed referent"* — turned on the Closed Loop's own artifacts, and it is the standing rule
***a commit is the only durable act*** (filed after a 592-line suite was lost) applied to itself.

**Same condition, verified, for other artifacts certified today**: `RESOLUTION_CONTRACT.md` and
`WITNESS_JURISDICTION_COROLLARY_2026-08-09.md` are both **untracked**.

**Contrast**: `scripts/memory/audit-memory.py` **is** tracked (last commit `5be162551`, 2026-07-28).
Its findings bind to `index_sha256` + `corpus_manifest_sha256`, *and* the instrument itself sits in
a ref. **That is the shape a citable instrument has** — and it was dormant the whole time, which is
the point: **tracked-and-dormant is a far stronger position than untracked-and-proven.**

> **Finding 3.** The Closed Loop 1 claim requires one qualification:
> **"operationally demonstrated" is true only of an uncommitted working tree, and is not currently
> reproducible from any ref.** Dormancy is not what limits it. **Non-durability is.**

## 4. Recommended qualification and minimal remedy

**Qualification** (proposed wording — ⛔ not self-adopted):

> Closed Loop 1 is **operationally demonstrated in an uncommitted working tree at HEAD
> `851c2e73a`**, not reproducible from any ref, and not constitutionally bound as a governance
> control.

**Minimal remedy** — ⛔ **not authorized, not performed**: commit the Step 1–5 artifacts so the
proof provenance names a ref that actually contains them. This is **not binding** and not Horizon
IV; it makes the *existing* claim checkable by a second party. It is also the cheapest possible
action and is reversible.

Until then, `/orient` and `/continue` may be **used**, but a claim certified by them cannot be
independently re-derived by anyone who does not hold this working tree.

## 5. What stays in Horizon IV

The general question — *should proof suites have invocation boundaries, and what happens to claims
certified between runs?* — is unchanged by this review and stays deferred. Answering it means
deciding per-instrument whether a protected condition warrants a boundary, which is the entry point
to the Capability Continuity Guard.

**Recorded**: *dormant proof instruments → acknowledged → **not bound** → Horizon IV.*

## 6. The four rungs, re-scored

| rung | status |
|---|---|
| instrument exists | ✅ |
| works when invoked | ✅ 33/33 · 27/27, non-circular (§1) |
| catches real drift | ✅ `dirty 245 → 248`, unforced |
| **reachable** | ❌ **not in any ref** — the newly located gap (§3) |
| authorized as a control | ❌ not claimed |

The founder's progression named *reachable* as rung four. This review finds that rung is failing
for a reason **prior to** invocation boundaries: **an instrument that exists in exactly one
uncommitted working tree is not reachable at all.** Binding an unreachable instrument to a boundary
would bind nothing.

> **Order of operations follows: durable → reachable → bound.** Binding first would have been the
> more sophisticated mistake.
