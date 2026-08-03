# Covenant Gate — Declared vs Enforced Authority

**Date:** 2026-08-03 · **Occasion:** PR [#944](https://github.com/SoullabTech/Sovereign/pull/944)
**Status:** ⛔ **FINDINGS ONLY.** Authorizes no change to branch protection, no merge, no workflow edit.
**Companions:** [Authority Schema](../governance/PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md) · [Capture Protocol](../governance/PRACTITIONER_WISDOM_CAPTURE_PROTOCOL_v1.md)

---

## 0. Why two findings, kept apart

Investigating *"why didn't Actions run on #944"* surfaced a second, unrelated, and more
consequential fact. They have different subjects, different evidence, and different
remedies. ⛔ **Do not let the operational finding absorb the constitutional one** — the
first is an outage, the second is an architecture.

---

## 1. Workflow dispatch failure — origin UNRESOLVED

> **Workflow dispatch failure origin unresolved; exhausted Actions capacity is suspected
> but unconfirmed pending account-level verification.**

⚠️ The capacity hypothesis is **plausible and unpromoted**. It is not a finding. It
becomes one only when someone with `admin:org` scope reads the billing page.

### What the evidence rules out

| Hypothesis | Evidence | Verdict |
|---|---|---|
| Branch filter | `on.pull_request` has bare `types:`, no `branches:` | ❌ ruled out |
| Path filter | no `paths:` / `paths-ignore:` | ❌ ruled out |
| Job-level condition | no `if:` on the `covenant-gates` job | ❌ ruled out |
| Workflow absent on branch | present on branch **and** trunk | ❌ ruled out |
| Workflow disabled | API reports `state: active` | ❌ ruled out |
| Approval queue | `waiting` 0 · `queued` 0 · `action_required` 0 | ❌ ruled out |

### The decisive test

PR #944 was closed and reopened, firing `reopened` — a type listed in the trigger.
`actions/runs?head_sha=80dfaf8df` returned **`total_count: 0`** afterward.

⇒ **A qualifying event was received and GitHub created no workflow run.** The failure sits
*above* workflow evaluation, not inside the workflow definition.

### ⚠️ The sample is n=1

Last run repo-wide: **16:47:25Z** (PR #943). PR #944 was created **17:54:58Z** and is the
**only** PR opened since. "Actions stopped repo-wide" and "#944 specifically failed" are
both consistent with the evidence. ⛔ Do not report the outage as repo-wide until a second
PR (or a second event on another branch) tests it. See
`feedback_empty_measurement_is_not_absence`.

---

## 2. ⭐⭐⭐ Covenant Gates was never a merge control

This is the consequential finding.

### Measured branch protection on `clean-main-no-secrets`

```json
{
  "required_status_checks": { "contexts": ["build", "check-diagrams"], "strict": true },
  "required_pull_request_reviews": null
}
```

**Covenant Gates is not in `contexts`.** No review is required either.

⇒ Had the run fired **and gone red, nothing would have blocked the merge.** The step
*"confirm covenant gate green"* is a **convention we observe**, not a control that enforces.

### ⭐ The workflow is not at fault — it says so itself

`.github/workflows/covenant-gates.yml` header, verbatim in intent:

> Covenant Gates owns **constitutional validation + diagnostics only** — classification,
> rollback/migration coupling, sacred-path discipline, and an explanatory PR comment. It
> does **not** count approvals or gate on human review; that authority lives in GitHub.

The workflow's stated purpose and its actual power **agree**. What diverged is the
*surrounding process language*, which had begun treating an observational mechanism as an
enforcement mechanism.

> ⭐⭐⭐ **The drift was in the description, not the mechanism.** This is
> `feedback_documentation_as_false_control_surface` — surfacing at the exact moment we
> were leaning on it.

### ⛔⛔ Why this is NOT fixed here

Making Covenant Gates a required check is **not a bug fix**. It is a decision about the
repository's authority structure, and it deserves its own ruling.

| Model | Shape | Merge permitted when |
|---|---|---|
| **A — Advisory** | gate informs humans → humans decide | a human judges it acceptable |
| **B — Required technical check** | gate passes → merge permitted | the check is green |
| **C — Constitutional gate** | gate passes → required review confirms **interpretation** → merge | a human has confirmed what green *means* |

These are different operating models. **A is the current state.** Model B automates a
judgment; Model C keeps interpretation human and adds a second pair of eyes — which this
repo cannot currently express, since `required_pull_request_reviews` is `null` and there is
one human collaborator.

⛔ **Do not close this gap by strengthening the mechanism before deciding what authority the
mechanism should have.**

---

## 3. Queue (founder-set, 2026-08-03)

1. Resolve `detectRelationalSignal` authority splits — ⚠️ active lane, PR #943 OPEN.
2. Restore CI signal.
3. Investigate Actions capacity **if needed**.
4. Resolve four documentation add/add conflicts **through synthesis**.
5. **Separately** decide Covenant Gates enforcement status (§2).
6. Merge only when the actual acceptance conditions are explicit.

### ⚠️ Correction to a stale note

The typecheck blocker on this branch is **not** `RelationshipTone` / `TONE_LANGUAGE` at
line 61, as previously recorded. Measured:

```
lib/relationships/detectRelationalSignal.ts(348,5): error TS2322:
  Type '"person"' is not assignable to type 'DetectableCounterpartLabel | null'.
```

A different question — whether a generic `person` counterpart label is representable — and
it belongs to PR #943's lane, not this one.

### The four conflicts (untouched)

All **add/add**: parallel sessions wrote different content to the same paths. None touch
`lib/practiceField/`; the gate code merges clean.

```
docs/architecture/COACH_FIELD_FOUNDATION_CANONICALITY_2026-08-02.md
docs/architecture/FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md
docs/observations/EMPTY_STATE_OBSERVATION_2026-08-03.md
docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md
```

> ⭐⭐⭐ **If two artifacts make different claims about the same event, preserve both
> provenance paths until the contradiction is resolved.** ⛔ Do not let Git's conflict model
> collapse an epistemic conflict into a file conflict. `--ours` / `--theirs` is the wrong
> instrument here.

---

## 4. What #944 demonstrated

The PR was a governance-bearing change, and it behaved like one. It surfaced two
divergences before it merged:

```text
local truth        ≠  repository truth    (the capture protocol was working-tree-only)
declared control   ≠  enforced control    (Covenant Gates is advisory, not required)
```

Neither was visible until something tried to move through the process carrying real
authority. That is the process working, not failing.
