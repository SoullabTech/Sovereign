# CRP-001 — PROCESS CLOSURE SEQUENCE

**Authored:** 2026-08-12 by Founder
**Status:** step 1 done; steps 2–6 open
**Standing instruction:** **Do not repair MAIA yet.** The process closes
before the product is touched.

---

## The sequence

**Revised by founder 2026-08-12.** Custody and the chain registry were
promoted out of "enforcement" into steps of their own, because each is a
prerequisite the validator cannot be written without.

| # | Step | Owner | State |
| --- | --- | --- | --- |
| 1 | Freeze `CRP-001-UNIT-RETURN-SCHEMA-v1` as candidate house schema | assistant | **DONE** — sha256 `fac499a6…`, `CRP-001-SCHEMA-FREEZE-RECORD.md` |
| 2 | Founder rulings **C1–C4** | founder | **CLOSED 2026-08-12** — `CRP-001-STEP2-RULINGS.md` (C1=D2, C2=N/A, C3=F1 bound prospectively, C4=G2) |
| 3 | Rule canonical custody / home for CRP governance objects | founder | **EXECUTION COMPLETE / CANONICALIZATION PENDING MERGE** — PR [#1039](https://github.com/SoullabTech/Sovereign/pull/1039), branch `chore/crp-001-governance-custody`. Remote durable custody PROVEN; canonical-trunk custody NOT yet effective. |
| 4 | Define + freeze the **chain registry** | — | **BLOCKED until #1039 merges** |
| 5 | Implement validator / enforcement | — | OPEN, blocked on 4 |
| 6 | Run adversarial conformance suite | — | OPEN, blocked on 5 |
| — | First MAIA repair unit | — | BLOCKED on 1–6 |

Step 2 carries three attached items:

- the **evidence-window principle** — ACCEPTED, house law;
- the **longitudinal minima** — PROVISIONAL, to be ruled or revised;
- **C4 moved forward** — it now precedes witness design, not follows it.

---

## Step 3 ledger — three states, not collapsed

`mergeStateStatus: BLOCKED` on PR #1039 is the **correct** state, not a
failure condition and not something to work around. Three distinct things are
being tracked separately, and collapsing any two of them is the inflation this
program exists to prevent:

```text
CLASSIFICATION SATISFIED     ✅  Class A attached; covenant-gates passes
APPROVAL SATISFIED           ❌  Class A human approval state incomplete
CANONICAL CUSTODY SATISFIED  ❌  #1039 unmerged; artifacts are not yet
                                 canonical-trunk facts
```

**Two things must not happen while waiting:**

1. **`covenant-gates: pass` is not substantive approval.** It is a
   constitutional check that a classification exists and its obligations are
   declared. The gate says so itself: *"Merge authority — approvals, required
   reviewers, branch protection — belongs to GitHub, not this workflow."*
2. **Later approval must not retroactively make `8da6ea5e7` canonical before
   the merge.** Approval changes the *approval* state. Only the merge changes
   the *custody* state, and only from the merge commit forward.

**Ledger, in substance:**

> **CRP-001 Step 3** — execution complete; Class A classification resolved;
> approval pending; canonicalization pending merge.
> **CRP-001 Step 4** — **BLOCKED — canonical custody prerequisite
> unsatisfied.**

No MAIA work crosses that boundary.

### Merge predicate — evaluated against the CURRENT head

The head is now `e48f4ae8e`. The merge predicate is evaluated against the
current head, never inherited from an earlier one. All must hold
**simultaneously, on the head being merged**:

1. `class-a` classification still present;
2. `covenant-gates` passes on the new head;
3. every required check green on the new head;
4. Founder-Steward + 2 Council + 1 Mentor approvals currently satisfied;
5. no repository rule has dismissed or invalidated approvals due to the new commit;
6. PR actually mergeable under branch protection.

> **Approval attaches to the review state of the PR / current diff.
> Custody attaches only to the merged bytes on canonical trunk.**

### ⚠ Enforcement gap — measured, not assumed

Branch protection on `clean-main-no-secrets`, read 2026-08-12:

```text
required_status_checks         build, check-diagrams, sovereignty   strict: true
required_approving_review_count 1
dismiss_stale_reviews          false
require_last_push_approval     false
require_code_owner_reviews     false
enforce_admins                 false
rulesets                       none
```

Three consequences, none of them theoretical:

**(a) The Class A approval gate is not mechanically enforced.** The covenant
requires Founder-Steward + 2 Council votes + 1 Mentor. GitHub requires **one**
approving review. Nothing mechanical distinguishes a Class A merge from a
Class C merge. The covenant gate is *constitutional*, and — see (c) — it is
not even a required check. **A Class A change can be merged with 1 of its 4
required covenant approvals and GitHub will permit it.**

**(b) Approvals are NOT dismissed by new commits.** `dismiss_stale_reviews:
false` and `require_last_push_approval: false` together mean an approval given
on one head **persists onto later commits the approver never saw**. Condition
5 above is therefore structurally satisfied for the wrong reason: nothing can
dismiss an approval because nothing is watching.

> **Operational consequence, binding on this PR:** once review begins, **no
> further commits are pushed to this branch.** With stale-dismissal off, a
> post-approval push would silently carry an approval onto unreviewed bytes —
> the precise inflation this program exists to prevent, performed by us, on
> the artifact that defines the prohibition. `e48f4ae8e` + this commit is the
> final ledger state before review.

**(c) `covenant-gates` is not a required status check.** Required contexts are
`build`, `check-diagrams`, `sovereignty` only. The covenant gate runs and
reports, but branch protection does not require it to pass. Its own disclaimer
is accurate in a way that cuts against it: *"Merge authority… belongs to
GitHub, not this workflow"* — and GitHub is not asking.

None of this is a reason to work around anything. It is recorded because the
program's premise is that unenforced rules are not enforcement, and this is an
unenforced rule discovered in the program's own merge path. Raised as **OQ-3**.

### Remaining order — no step may be skipped

```text
Class A approvals
   ↓
all required checks green
   ↓
merge #1039
   ↓
bind the new canonical trunk SHA
   ↓
verify both paths + blob identities on that SHA
   ↓
declare canonical custody PROVEN
   ↓
unblock Step 4
```

**Two ledger transitions, never one.** *"PR merged"* is an **event**.
*"Canonical custody proven"* is a **verification result**. The second does not
follow from the first; it follows from identifying the actual merge
commit / trunk SHA, confirming each of the ten artifact paths exists at that
SHA, and comparing blob OIDs and bytes against the approved source artifacts.
`CANONICAL CUSTODY SATISFIED` moves ❌ → ✅ only on that verification, and only
for the paths actually verified.

---

## Step 3 — enforcement rejects a unit lacking

- referent;
- instrument / version;
- positive control;
- negative control;
- well-formed adjacent crossing;
- non-empty `does_not_establish`;
- non-empty counterevidence;
- any downstream crossing (no skipping);
- **evidence window meeting the crossing's minimum** (schema §2.6).

The last is new with §2.6 and is what makes step 5's seventh test case
mechanically decidable.

## Step 4 — auto-derivation, with the constraint it carries

The validator derives the required `does_not_establish` crossings from the
declared proven crossing, so the executor is not relying on memory for all
five. Correct, and it removes the most likely honest omission.

**Constraint:** auto-derivation needs a **chain registry**, not one hardcoded
chain. The §2.4 nine-state chain is not the only one — mandate §9 declares the
correction chain (`OLD CLAIM → MEMBER CORRECTION → CORRECTION EVENT → …`), and
§2.3 permits a unit to declare a substrate chain in its own IDENTITY. A
validator that knows only the §2.4 chain will either reject valid correction
units as malformed, or pass them without deriving anything.

So step 4 has a prerequisite: **the set of declarable chains must be
enumerated and frozen** the way the stage vocabulary was. Unit-declared
substrate chains (§2.3) then need a rule — registered in advance, or declared
per unit and validated structurally.

**Unruled.**

## Step 5 — the conformance suite

Each must be rejected mechanically, not by a reader noticing:

1. skipped `ASSEMBLED`
2. `FINAL PROMPT` alias
3. missing negative control
4. `counterevidence: none`
5. `RETRIEVED → FINAL MODEL REQUEST` (non-adjacent)
6. unbound referent
7. claim of experienced continuity from one exchange

These are the protocol's own positive/negative controls. The suite tests the
validator, not MAIA — the same admissibility question §16 asks of every
instrument, turned on the process itself: *can it detect a known-bad return
and pass a known-good one?* A validator that has not been shown to do both is
INADMISSIBLE, and enforcement is not closed.

---

## The methodology's first demand on the product

The first MAIA build is **the witness**, not a ranking tweak.

```text
candidate identity
      ↓
RETRIEVED
      ↓
SELECTED
      ↓
ASSEMBLED
      ↓
FINAL MODEL REQUEST
```

— with candidate and provenance identity preserved unbroken across every
boundary.

This is forced, not chosen. Schema §2.4's candidate-bound participation makes
`ASSEMBLED → FINAL MODEL REQUEST` provable only if candidate identity survives
into the request. Without it there is no negative control for that crossing,
so it is INADMISSIBLE TO TEST, so every crossing downstream of it is
unreachable — `USED`, `OBSERVABLE IN RESPONSE`, and `EXPERIENCED CONTINUITY`
all sit behind it.

Mandate §5 already ordered the witness first. What has changed is that it is
now *derived* rather than asserted: the return schema will not permit the
downstream claims until the witness exists.

> The methodology is telling us what instrumentation must exist before it
> permits us to repair the product.

Note the ordering consequence for C4: the witness is the first build, and C4
(may the witness run on member traffic, or founder/synthetic only?) governs
what it may observe. **C4 is not a later question. It scopes step 6's first
unit.**

---

## Definition of operational

When C1–C4 are settled and enforcement passes its own conformance suite, the
JARVIS repair process is **operational**. MAIA is then repaired through it,
crossing by crossing, with no broad claim permitted to outrun its evidence.

Not before.
