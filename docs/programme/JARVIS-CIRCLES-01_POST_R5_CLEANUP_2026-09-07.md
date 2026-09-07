# Post-R5 cleanup — P1 … P5

**Status:** P1–P4 IMPLEMENTED · P5 PROPOSAL ONLY · ⛔ **NOT VERIFIED** (no database or dependencies
in a remote session).

⚠️ **Two migrations are now pending and applied nowhere:** `20260906000003` (R2 removals) and
`20260907000001` (CA-03 withdrawal). Both must be applied to the shadow before the gate runs, or
their assertions fail on missing columns — **migration state, not repair state.**

---

## P1 · Verifier correctness

**Duplicate C14 removed** — the block appeared twice and ran twice. That is why the last run printed
`36 passed` against a 35-obligation floor.

**V-02 closed: a required obligation is now discharged only by PASS.**

```text
PASS     discharges          FAIL     does not (already a failure)
WARN     does not            SKIP     does not
MISSING  does not
```

Outcomes are tracked per ID as a **set**, and `satisfied(id)` requires `{pass}` exactly. *"Did it
run"* and *"did it hold"* are different questions, and only the second discharges an obligation —
treating WARN/SKIP as coverage would reopen the FR-14 hole one level down. Non-required diagnostic
WARN/SKIP remain non-fatal. Unit-tested in isolation: `warn`, `skip`, `fail` and absence all fail
to discharge; only `pass` discharges.

**Floor now names 44 obligations** (35 + C15, C16, S5, T7a–T7f).

## P2 · B-04 provenance — resolved as provenance

⛔ **No historical prose invented.** Record:
`docs/architecture/CIRCLES_FIELD_PULSE_CONTAINMENT_PROVENANCE_2026-09-07.md`.

The cited plan document **does not exist and is not recoverable** — searched the working tree, all
doc trees, `git log --all --diff-filter=A` across **4,801 commits**, and every ref.

⚠️ **Second finding, outside this lane:** `docs/ops/PRESERVATION_AUDIT_2026-08-01.md` lists the file
among 281 documents *"stranded — on the branch, not on canonical."* **It is not on that branch** —
fetched and searched. That audit is a governance record whose stated purpose is that every file
receives a disposition before the branch is deleted. An entry for a file that is not there means
the branch was rewritten after the audit, or the inventory named something that was never a file.
**Not repaired — raised for founder adjudication.** The question it implies (*does this affect other
entries among the 281?*) is not one Jarvis should answer by editing the list.

**The ruling itself is intact.** Surviving authoritative evidence: the code comment written at the
time, and the runtime behavior it produced — which the verifier proves on every run (**C4**).
That is a stronger guarantee than the prose would have been.

> A citation to a document nobody can produce is worse than no citation: it implies an authority
> that cannot be checked. **Naming the absence is the repair.**

## P3 · CA-03 — response withdrawal

Migration `20260907000001` adds `withdrawn_at`, following the established `shared_artifacts.revoked_at`
soft-revoke precedent exactly. Service `withdrawResponse` / `withdrawResponseWithClient`; route
`POST /api/circles/[circleId]/inquiries/[inquiryId]/withdraw` (gated, so **18 routes, 0 ungated**).

All six required semantics:

1. **only the author** — the contract takes **no target-member parameter at all**, so proxy
   withdrawal is *unrepresentable*, not refused at runtime (asserted structurally by C16);
2. withdrawal removes the response from Circle visibility (C16, T7b);
3. **nothing private is touched** — the response is the representation the member authored *for*
   this crossing, never its source;
4. no facilitator or other member may withdraw on their behalf (per 1);
5. the act **reveals nothing** about whether or how others responded — the route returns `{ok:true}`
   and no count;
6. the withdrawn response is not member-visible Circle content.

**Two decisions worth naming.**

`hasResponded` stays **row-existence based**, so withdrawing does not re-hide the field or permit a
second, better-informed answer (T7f). *Withdrawal returns consent over one's own contribution; it
cannot un-see what was already seen.* FR-04 protects independent perception **before** exposure —
a boundary that cannot be re-crossed backwards.

⚠️ **Open question, deliberately not decided:** the row retains `response_text` while excluding it
from every read. That satisfies the ruling as written (*"must not preserve … as **member-visible**
Circle content"*) and matches share revocation. A stricter reading of continuing consent would blank
the text. **That is a consent question, not an implementation detail** — founder call.

## P4 · B-08 — the boundary moved into the contract

Both callers were already correctly scoped. The defect was that the **signature permitted an
unscoped call** while every sibling service self-gates: *the next caller inherits no protection from
the signature.*

- `getCirclePulse(circleId, memberId)` — self-gating via `getCircleWithMembership`.
- `getCirclePulseLight(circleId)` **removed**, replaced by
  `getCirclePulseSummariesForMember(memberId)` — **one query scoped through `circle_memberships`.**

> A Circle the member does not belong to cannot appear, because it is never selected. **The
> authorization IS the join**, not a check layered over one — which removes the N+1 and the
> possibility of a bypass in the same move.

No RLS. Route gates unchanged — this is defence in depth beneath them. New assertions: **C15**
(no exported pulse function surfaces activity without member identity) and **S5** (member A cannot
read Circle B's pulse, against real principals).

Withdrawn responses no longer assert movement in the pulse — a withdrawn contribution should not
keep signalling presence.

## P5 · B-09 `integrating` — PROPOSAL, NOT IMPLEMENTED

### What it currently means: operationally, nothing

| Site | Treats `integrating` vs `closed` |
|---|---|
| `respondToInquiry` | identical — refuses anything not `'open'` |
| `getInquiryWithResponses` | identical — `status !== 'open'` reveals all |
| `getCirclePulse` | identical — only looks for `'open'` |
| exit transition | **none exists** |

`closeInquiry` sets `fieldSynthesis ? 'integrating' : 'closed'`. So the status is exactly
**`closed` AND `field_synthesis IS NOT NULL`**, re-encoded — and nothing downstream reads the
distinction.

> **⭐ It is a stored duplicate of a derivable fact — the precise anti-pattern FR-13 forbids.**
> And it can already drift: nothing prevents `status='closed'` with a synthesis present, or
> `'integrating'` with none.

### Proposal — retire it, derive the fact

⛔ **Not an exit ceremony.** There is no defensible durable meaning to give it an exit *from*, and
manufacturing one would be inventing lifecycle the founder forbade.

```text
closeInquiry() always sets 'closed'
"integrating" becomes a DERIVED display fact:  field_synthesis IS NOT NULL
```

**Why this is proposed, not done.** It requires (a) a CHECK-constraint migration, (b) changing what
`?status=integrating` returns, and (c) changes in two UI files — `FieldMemory.tsx` fetches
`?status=closed` and `?status=integrating` as separate calls and merges them, then branches on
`inquiry.status === 'integrating'`. **That is product-surface change during a cleanup act**, and the
enum value is a data-shape decision. Founder act required.

⛔ Not equated with **ConstitutionState** · **FieldPhase** · Circle maturation · Common-Ground
Mediation. Distinct concepts, deliberately kept apart.

**Interim state:** `integrating` remains reachable and remains one-way. **B-09 stays STILL DEFECT.**
Nothing was half-changed to make it look resolved.

---

## Gate

⛔ **Not run from this session.** Requires: both migrations applied to the shadow · every one of the
**44** required obligations **PASS** · **0 required WARN/SKIP/MISSING** · `0 failed` · fixture
rollback · shadow and worktree deleted · production unchanged.

⛔ **Do not call it PASS because a total matches an expectation.**

## Standing

DEPLOY · INVOKE · COHORT — **NOT AUTHORIZED.** No discovery. No cohort access. No facilitator
assignment. Migrations not applied to production. Founder gate untouched.
