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

## 6. Sequence

```text
THIS LANE       reconcile · define the bridge · make canonical
THEN            merge new canonical into #1199 · CI reruns on the exact new head
THEN            explicit Founder shadow sign-off naming that head
THEN            bounded Cut 1A production deploy · witness · STOP
Cut 1B          still requires full Class A governance
P6              CLOSED
```
