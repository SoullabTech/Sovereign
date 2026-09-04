# GOVERNANCE-CLASS-A-BOOTSTRAP-SHADOW-01

```text
LANE      GOVERNANCE-CLASS-A-BOOTSTRAP-SHADOW-01
BASE      clean-main-no-secrets @ 35c1b1b75
BRANCH    claude/governance-class-a-bootstrap-shadow-01
OPENED    2026-09-04 · founder ruling
SCOPE     DOCS ONLY — no code, no workflow machinery, no label engine
PURPOSE   Define how a single-owner repo may lawfully conduct a reversible,
          zero-authority Class A production shadow validation while independent
          Council / Mentor review is not yet operational.
```

Opened because #1199 (Cut 1A) surfaced a contradiction in the governance layer, and
resolving it with a one-off founder exception would have created another undocumented layer
of governance drift. **The code is currently more precise about authority than the process
that authorizes the code.** This lane repairs that before the first unified-cognition
production shadow, not after.

## 1. The three findings

### 1.1 The constitutional document offers a bridge the enforcement design deleted

`docs/GOVERNANCE_MENTOR_COVENANT.md` §8 still defines:

> `covenant-signoff` — **bootstrap bridge (temporary).** Explicit, logged single-operator
> sign-off that satisfies the founder / mentor / founder-or-release *approval* requirements
> when no independent second steward exists yet.

and §8's closing rule still relies on it:

> Class A/B/Frontier additionally need approval, which the `covenant-signoff` label may
> bridge during bootstrap.

`.github/workflows/covenant-gates.yml`, in its own header, says the opposite:

> Removed in this redesign: the FOUNDERS/MENTORS/GUARDIAN_CIRCLE approval engine, per-class
> approval counting, and the `covenant-signoff` bootstrap bridge — all of which
> reimplemented (and diverged from) GitHub's own review model.
>
> Until a second human GitHub collaborator exists, this repo is single-owner + admin-merge,
> NOT independent two-person review.

So the covenant points at a mechanism that no longer exists. This is not merely "Council
approval is currently impossible" — it is that the constitution and the enforcement layer
disagree about what is available.

### 1.2 Even as written, the bridge never covered Council

§8 says `covenant-signoff` satisfies *"the founder / mentor / founder-or-release approval
requirements."* Council is not named. The Class A gate (§5) is **Founder-Steward + 2 Council
votes + 1 Mentor verification**. So the bridge, even when it existed, did not clearly
discharge the two Council votes that Class A specifically requires. The gap is older and
narrower than the workflow's deletion of it.

### 1.3 Production promotion *is* governed by the covenant — but nothing enforces it

An earlier reading of this question concluded only that "no document says production
promotion is outside Class A." That was too weak. The covenant governs production promotion
directly, in §8:

> `staging-ready` — approved + safe to test in staging
> `release-approved` — steward signed, ready for production
>
> **Rule:** A PR cannot be labeled `release-approved` if it has `frontier-check` unresolved.

Meanwhile `grep` across `scripts/` for `class-a`, `requires-founder`, `requires-council` or
`frontier-check` returns **no hits**: the deploy path is label-blind. So governance reaches
production in doctrine and not in mechanism.

**Recorded, not repaired here.** This lane does not add enforcement to the deploy path.
Doing so would be a Class B change to `scripts/deploy*` inside a docs lane, and the deploy
lane has its own hard-won invariants (immutable-SHA snapshot, flock, lane token) that a
governance lane should not reach into casually.

## 2. Ruling

The normal Class A bar is **unchanged**. For anything that actually changes member-facing
authority:

```text
Founder-Steward + 2 Council votes + 1 Mentor verification
```

That remains the destination. What this lane adds is one narrow, temporary, explicitly
bounded category beneath it.

### BOOTSTRAP CLASS A — SHADOW VALIDATION ONLY

Available **only** while independent second-steward review is unavailable. Retires
automatically when a second human steward can give independent approval.

**Requires all of:**

```text
explicit Founder-Steward sign-off, recorded
exact candidate SHA named (the head, not the implementation commit)
all required CI green on that exact head
rollback plan
zero member-facing response authority
no schema or data mutation
no consent or retention widening
no new PHI or member-content telemetry
bounded production witness with explicit stop conditions
```

**May authorize:**

```text
production shadow observation
canonical merge of the same zero-authority shadow infrastructure
```

**May NOT authorize:**

```text
response influence          consent changes
memory-authority changes    retention changes
Cut 1B                      P6                      M3
```

The lighter bar applies to **both** merge and production promotion of zero-authority shadow
infrastructure. It deliberately does not say "Council matters for merge but not for deploy"
— that distinction was rejected as indefensible: council approval that binds canonical code
but not running code is not a boundary.

## 3. Why the exception has teeth

The category is defined so that the change which motivated it barely fits, and its successor
does not fit at all.

| | Cut 1A (#1199) | Cut 1B (orientation authority) |
|---|---|---|
| member-facing response influence | none — `applied: false` | **yes, by definition** |
| prompt bytes | exact parity asserted per turn | changes |
| schema / data mutation | none | none, but irrelevant |
| new member content in telemetry | none | to be determined |
| Sanctuary | tightened (a derivation that ran and was discarded now does not run) | unchanged at best |
| reversible | revert commit, no data consequence | revert plus a behavioural window |
| **eligible for the bridge** | **yes** | **no — full Class A governance** |

If Cut 1B could use this bridge, the bridge would be a loophole rather than a boundary.

## 4. `frontier-check` on #1199

```text
frontier-dependent label    PATH HEURISTIC
                            triggered by lib/sovereign/maiaService.ts appearing in the diff
actual frontier dependency  NONE IDENTIFIED
```

§5 defines Frontier-Dependent Decisions as *model IDs, provider changes, pricing
assumptions* — external runtime facts requiring mentor verification. Cut 1A introduces no
model ID, no provider, no SDK behaviour, no pricing assumption, and no dependency on any
external fact. The label fired because a frontier-listed **file path** appears in the diff,
not because a frontier **decision** is present.

This is recorded as a determination, not as a label removal. Distinguishing "a frontier path
was touched" from "a frontier decision was made" is a change to the label machinery, and
belongs to a later governance cut if it is wanted at all — not to this lane and certainly
not to the convergence lane.

Note the covenant's live rule: *a PR cannot be labeled `release-approved` if it has
`frontier-check` unresolved.* This determination is what resolves it for #1199; it does not
resolve it for any other PR.

## 5. What this lane changes

| File | Change |
|---|---|
| `docs/GOVERNANCE_MENTOR_COVENANT.md` | §5 gains the bootstrap shadow clause beneath the Class A gate; §8 reconciles `covenant-signoff` with the workflow that deleted it |
| `docs/programme/GOVERNANCE-CLASS-A-BOOTSTRAP-SHADOW-01.md` | this record |

**Not changed:** `.github/workflows/covenant-gates.yml`, `.github/workflows/auto-labeler.yml`,
`.github/CODEOWNERS`, any deploy script, any label machinery. The new bridge is a **recorded
founder act, not an automated approval engine** — deliberately, because the engine that was
deleted in the 2026-07-03 redesign was deleted for reimplementing and diverging from
GitHub's own review model. Rebuilding one here would repeat that mistake.

## 5b. Adoption — the one-time constitutional bootstrap act

The bridge defined above **may not authorize its own adoption**. It becomes effective only
once this amendment is canonical, and confers no authority over the change that introduces
it. So adopting it raises an unavoidable, one-time problem, handled explicitly rather than
disguised: the currently canonical Class A process is internally inconsistent and cannot be
fulfilled with the present collaborator structure, and it defines no working bridge for
repairing that inconsistency. The covenant gives the Founder-Steward final responsibility
for production legitimacy while requiring Council and Mentor participation for ordinary
Class A changes — and the mechanism that once reconciled those was deleted.

```text
ONE-TIME CONSTITUTIONAL BOOTSTRAP ACT

Purpose:
  adopt the governance repair only

Authority claimed:
  Founder-Steward constitutional ratification

Authority NOT claimed:
  Council vote
  Mentor verification
  production authorization for #1199
  satisfaction of ordinary Class A requirements

Reason:
  current canonical governance is contradictory / mechanically
  unsatisfiable and defines no working bridge for repairing
  that contradiction

Ends:
  immediately when this governance amendment becomes canonical
```

```text
ADOPTION AUTHORITY     §3 Founder-Steward responsibility
RATIFICATION STATUS    PERFORMED post-hoc — see §8
                       (read as PENDING at canonicalization; that is the deviation)
NOT AUTHORIZED BY      Bootstrap Class A — Shadow Validation Only
```

> **§8 supersedes the status line above as a statement of fact, and preserves it as a
> statement of history.** At canonicalization this block read `PENDING`, and it was accurate.
> The act came afterwards.

**At canonicalization, the act had not been performed.** The canonical document therefore
correctly recorded `PENDING` at that moment. The act was subsequently performed post-hoc and
prospectively, as recorded in §8 and in PR #1201 comment `5547712376`; it does not reach
backward to authorize the canonical merge.

**The act as performed did not use the new rule.** Its authority was the Founder-Steward's
already-existing responsibility, held before this amendment and independent of it —
`GOVERNANCE_MENTOR_COVENANT.md` §3: *"The Founder-Steward holds **final responsibility** for
MAIA's purpose, doctrine, and production legitimacy,"* including *"final sign-off on
production releases"* and *"veto power on any change that threatens sovereignty, consent, or
doctrine alignment."* Repairing a constitution that has become self-contradictory and
mechanically unsatisfiable falls squarely inside that standing responsibility.

**The bootstrap-shadow rule became available for governed use only after the recorded
ratification act.** Because the amendment was already canonical, that one-time act terminated
immediately upon being made. It did not authorize itself and contributed no authority to
#1199. That ordering is what keeps the
no-self-authorization clause real rather than ceremonial: the clause would be empty if the
very act adopting the rule could lean on it.

This is also materially different from using a founder exception to ship Cut 1A. One
explicit founder act repairs the broken constitution; afterwards #1199 must satisfy the
newly canonical bootstrap-shadow rule on its own merits, and this act contributes nothing
toward that.

## 6. Sequence

> **Superseded in part by §7.** #1199 merged on 2026-09-04 before this amendment became
> canonical, so the merge steps below are historical rather than pending. The production
> steps stand.

```text
THIS LANE       reconcile · define the bridge · make canonical
THEN            re-derive the exact production candidate from canonical
                (do NOT reuse bc2984e65 automatically — see §7.4)
                record explicit Founder-Steward bootstrap-shadow production sign-off
                verify Cut 1A still meets EVERY eligibility condition
                technical custody on the exact candidate
                deploy · bounded shadow witness · STOP
Cut 1B          still requires full Class A governance
P6              CLOSED
```

**Merge before witness (founder ruling, 2026-09-04).** The clause permits both canonical
merge and production shadow observation of the same zero-authority infrastructure, so
deploying the canonical merge SHA rather than a branch head gives the cleanest provenance
available:

```text
reviewed tree = merged tree = deployed tree = witnessed tree
```

No branch-head-versus-canonical qualification survives on the witness.

---

## 7. Sequence deviation — 2026-09-04

### 7.1 What happened

```text
SEQUENCE DEVIATION — 2026-09-04

Cut 1A (#1199) became canonical at bc2984e65
before GOVERNANCE-CLASS-A-BOOTSTRAP-SHADOW-01 became canonical.
```

Verified at the time of recording: `7bbec9b3d` (the Cut 1A implementation) is an ancestor of
`clean-main-no-secrets`; `906217fb2` and `7600f957e` (this amendment) are not;
`lib/maia/orientation/contract.ts` is present on canonical.

The founder's standing instruction had been *no merge until the governance amendment is
canonical*. Canonical merge of zero-authority shadow infrastructure is one of the two things
the bootstrap-shadow rule was written to authorize, so the merge occurred ahead of the rule
that would have governed it.

### 7.2 Classification

```text
CLASSIFICATION   canonicalized out of the intended governance sequence;
                 NOT retroactively cured
```

Stated that way deliberately. The alternative — describing the merge as having been
authorized after the fact — would launder a sequence deviation into authority it did not
have at the time, which is the precise failure this lane was opened to prevent.

**The authority under which the merge was performed is not recorded here, because no such
record was made at the time.** This document does not name it Founder-Steward ratification;
asserting a ratification that was never recorded would be a second, worse fabrication than
the deviation itself.

### 7.3 Consequences

```text
the bootstrap-shadow rule did NOT authorize the #1199 merge
the rule is NOT applied retroactively
the no-self-authorization clause remains intact
Cut 1A's production promotion remains UNPERFORMED
once this amendment is canonical, the rule may govern the remaining
  production-shadow promotion of Cut 1A on its own merits
```

**The rule is not narrowed.** For future qualifying changes it still may authorize both
canonical merge and production shadow promotion. Only *this one change's* history has
foreclosed the merge half:

| | Cut 1A |
|---|---|
| merge | already occurred before the rule → **not authorized by the rule** |
| deploy | still pending → **may be authorized after the rule is canonical** |

Rewriting the general rule around one accident would damage the constitution to tidy a
single incident. The incident is recorded; the rule stands as written.

### 7.4 Not reverted, and why

Cut 1A is **not** reverted to replay the intended order. It carries zero response authority,
is not deployed, and a revert-and-remerge would produce code churn without improving the
factual record — the deviation would still have happened, and the history would then also
contain a ceremonial reversal pretending otherwise.

The boundary that still matters is intact:

```text
canonical code ≠ running production
```

Production remains at `293d454cf`. The repaired governance can therefore still be applied
before the first member-facing runtime exposure of this infrastructure, which is the
boundary the lane actually exists to protect.

### 7.5 The one-time adoption act is unchanged

The one-time Founder-Steward constitutional act (§5b) remains for **#1201 only**. It does
not ratify #1199's past merge, does not satisfy Cut 1A's bootstrap sign-off, and does not
authorize deploy, Cut 1B or P6. Its sole job remains repairing the contradictory governance
text, and it ends the moment this amendment is canonical. Cut 1A then requires a **new,
separate** Founder-Steward bootstrap-shadow production sign-off under the now-live rule.

### 7.6 Custody consequence

Because the histories crossed, **`bc2984e65` must not be reused automatically as the deploy
candidate.** After this amendment lands, re-derive the actual canonical state. The
production candidate must contain:

```text
Cut 1A
+ the canonical governance repair
+ whatever else legitimately became canonical meanwhile
```

and that exact SHA must earn fresh technical evidence under the new rule — not inherit
evidence from tonight's superseded heads.

---

## 8. Adoption sequence deviation and post-hoc ratification — 2026-09-04

```text
EXPECTED
  stable green → Founder-Steward ratification → canonical merge

ACTUAL
  stable green → canonical merge at 825a0c2a5 → ratification absent

CLASSIFICATION
  canonicalized before required adoption act
  NOT retroactively cured

POST-HOC ACT
  Founder-Steward expressly ratified the amendment after canonicalization
  recorded: PR #1201, comment 5547712376

EFFECT
  ratification is PROSPECTIVE from the recorded act
  #1201's prior merge remains a recorded sequence deviation
  #1199's prior merge remains a separate recorded sequence deviation
  bootstrap-shadow rule available only from the ratification act forward
```

### 8.1 The heart of the correction

> **Canonicalization satisfied a necessary timing condition; it did not manufacture the
> missing adoption act.**

§5 of the covenant makes the rule effective "only once this governance amendment is
canonical," and separately requires that its adoption authority be *expressly ratified*.
Only the first was met at `825a0c2a5`. At that moment this document still read
`RATIFICATION STATUS PENDING · must be explicit` and *"The act has not been performed."* The
rule was therefore **not available for governed use** between canonicalization and the
ratification act, and production remained blocked across that whole interval.

### 8.2 Post-hoc, not retroactive

The distinction is load-bearing and is the reason this section exists rather than an edit
changing `PENDING` to `RATIFIED`:

```text
POST-HOC       the act was made later than it should have been, and says so
RETROACTIVE    the act reaches backwards and authorizes what preceded it
```

This ratification is the first and not the second. It does not authorize or cure #1201's own
merge, does not authorize #1199's merge, and erases neither deviation. Rewriting the status
line to imply the act had happened would have been the same fabrication §7 refuses for
#1199 — asserting an authority that was not recorded at the time — committed inside the
document written to prevent it.

### 8.3 The constitutional clause is unchanged

`GOVERNANCE_MENTOR_COVENANT.md` §5 already says the adoption authority applies *"when
expressly ratified"* and that the rule may not authorize its own adoption. Both remain
correct and are untouched by this section. **The defect was historical, not architectural** —
the constitution described the right process; the process was not followed. Amending the
clause to fit what happened would have damaged a correct rule to accommodate a deviation
from it.

### 8.4 State after this record

```text
governance repair          ADOPTED (prospective, from the recorded act)
#1201 sequence deviation   RECORDED · not erased
#1199 sequence deviation   RECORDED · not erased
Cut 1A                     canonical · NOT deployed · zero response authority
production                 293d454cf
```

Cut 1A's production promotion requires its own separate Founder-Steward bootstrap-shadow
sign-off under the now-live rule, naming an exact deploy SHA re-derived from then-current
canonical — never `bc2984e65` by inheritance (§7.6).
