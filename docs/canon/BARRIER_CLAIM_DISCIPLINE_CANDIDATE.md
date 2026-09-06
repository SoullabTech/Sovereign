# Barrier Claim Discipline — CANDIDATE, NOT PROMOTED

**Status:** Candidate. **Not canon.** Stated as a standing rule by the founder
2026-09-06; promotion to canon is a founder act and has not occurred.
**Kin:** `MARKETING_CLAIM_DISCIPLINE.md` (sibling — governs outward
representation; this governs barrier language in internal records),
`CLAIM_STATE_AUTHORITY.md`.
**Observed in:** `docs/design/REFLECTIONS_NOTICING_DERIVATION_2026-09-06.md`.

---

## The rule

```text
ENFORCED / PROTECTED / IMPOSSIBLE
-> use only when a mechanism has been observed that actually prevents the act

GOVERNED / NOT AUTHORIZED / NOT ELIGIBLE UNDER CURRENT PROCESS
-> use when the barrier is normative and depends on the record being followed
```

## The drift it protects against

**Barrier inflation** — describing governance in the vocabulary of mechanism.
The sibling canon protects against inflating what the *system does*. This
protects against inflating what *stops us*.

Observed 2026-09-06 while recording the `reflection_opening_v1` freeze. Three
successive statements of the same barrier, each borrowing authority from an
enforcement that did not exist:

| # | Written | Actual |
|---|---|---|
| 1 | "structurally unmergeable" | a red typecheck gate — a condition, satisfiable by the wrong means |
| 2 | "the commit cannot become a merge" | same gate; cherry-pick and non-standard promotion both defeat it |
| 3 | "never a merge candidate" | a governance status; the branch carries no protection rule |

Each was corrected by the founder. The drift ran one direction only —
**no barrier was ever understated.** That asymmetry is the signature: barrier
inflation feels like rigor while it is happening, which is why it needs a rule
rather than care.

## Why the distinction is load-bearing

The two barrier kinds fail differently:

```text
enforced   defeated only deliberately
governed   defeated deliberately — or by someone who simply does not know
```

An enforced barrier needs no reader. A governed one is only as strong as its
record, which makes **provenance, wording, and discoverability part of the
control itself** — not documentation about the control.

Calling a governed barrier "enforced" therefore does more than overstate: it
removes the reason to keep the record findable, and so weakens the only thing
actually holding the line.

## Test before writing a barrier claim

> Has a mechanism been **observed** to prevent this act — not inferred from a
> gate's presence, a branch's name, or a process's existence?

No -> the barrier is governed. Say so.

## Adjacent trap

A gate is a **condition**, not a structure. Anyone can turn a red gate green;
whether doing so resolves the defect the gate stood for is a separate question.
When a gate is standing in for an unresolved decision, record what the gate is
*for*, so satisfying it by the wrong means is legible as a crossing rather than
a fix.
