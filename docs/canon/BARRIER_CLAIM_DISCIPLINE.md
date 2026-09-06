# MAIA Canon — Barrier Claim Discipline

**Status:** Canon. Ratified 2026-09-06 (founder ruling), after a required
scope correction to the candidate text.
**Kin:** `MARKETING_CLAIM_DISCIPLINE.md` (sibling — governs outward
representation; this governs barrier language in internal records),
`CLAIM_STATE_AUTHORITY.md`.
**Observed in:** `docs/design/REFLECTIONS_NOTICING_DERIVATION_2026-09-06.md`.

---

## The rule

```text
MECHANICALLY ENFORCED / PROTECTED
-> use only when an observed mechanism prevents the act
   within a stated and verified scope

GOVERNED / NOT AUTHORIZED / NOT ELIGIBLE UNDER CURRENT PROCESS
-> use when compliance depends on people knowing and honoring the record

IMPOSSIBLE
-> reserve for cases where no reachable path exists within the stated scope;
   a red gate or observed refusal alone does not establish impossibility
```

## The drift it protects against

**Barrier inflation** — describing governance in the vocabulary of mechanism.
The sibling canon protects against inflating what the *system does*. This
protects against inflating what *stops us*.

Observed 2026-09-06 while recording the `reflection_opening_v1` freeze. Four
successive statements of the same barrier class, each borrowing authority from
an enforcement that did not exist or was not scoped:

| # | Written | Actual |
|---|---|---|
| 1 | "structurally unmergeable" | a red typecheck gate — a condition, satisfiable by the wrong means |
| 2 | "the commit cannot become a merge" | same gate; cherry-pick and non-standard promotion both defeat it |
| 3 | "never a merge candidate" | a governance status; the branch carries no protection rule |
| 4 | "enforced barriers are defeated only deliberately" | written *inside this document* — enforcement also fails by scope misunderstanding, configuration change, an existing bypass, differing permissions, or mechanism failure |

Each was corrected by the founder. The drift ran one direction only —
**no barrier was ever understated.** That asymmetry is the signature: barrier
inflation feels like rigor while it is happening, which is why it needs a rule
rather than care.

Row 4 is the strongest evidence that this is more than a retrospective
taxonomy. The rule identified a fresh instance of the drift in the very text
written to prevent it, and that finding changed the document before
ratification — use produced a decision, not merely a distinction.

```text
rows 1-3     recurrence
             the drift is real and repeated

row 4        self-application
             the rule catches a fresh instance,
             not merely one catalogued afterward

correction   decision produced, before ratification

together     warrant for canon
```

Rows 1–3 established recurrence; row 4 demonstrated the rule could operate
beyond the examples from which it was derived. Neither alone is the warrant.

## Why the distinction is load-bearing

The two barrier kinds carry resistance differently:

```text
mechanically enforced
  resistance is carried by a mechanism within its verified scope;
  defeat requires bypass, mechanism change/failure, or leaving that scope

governed
  resistance is carried by human adherence;
  ignorance alone can defeat it
```

The load-bearing sentence:

> A mechanically enforced barrier does not depend solely on a reader for the act
> and scope actually observed. A governed barrier does.

For a governed barrier this makes **provenance, wording, and discoverability
part of the control itself** — not documentation about the control. Calling a
governed barrier "enforced" therefore does more than overstate: it removes the
reason to keep the record findable, and so weakens the only thing actually
holding the line.

Note that the enforced case is bounded too. "Needs no reader" holds only for the
act and scope observed; outside that scope, an enforced barrier is a governed
one wearing a mechanism's name.

## Test before writing a barrier claim

> Has a mechanism been **observed** to prevent this act — not inferred from a
> gate's presence, a branch's name, or a process's existence — and is the scope
> of that observation stated?

No mechanism observed -> the barrier is governed. Say so.
Mechanism observed, scope unstated -> state the scope, or say governed.

## Adjacent trap — a gate is a condition, not a structure

Anyone can turn a red gate green; whether doing so resolves the defect the gate
stood for is a separate question. When a gate is standing in for an unresolved
decision, record what the gate is *for*, so satisfying it by the wrong means is
legible as a crossing rather than a fix.
