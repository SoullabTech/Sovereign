# CLASS A ENFORCEMENT AUDIT — 2026-08-10

**Status:** design + verification finding. READ-ONLY. No implementation authorized.
**Repo:** `SoullabTech/Sovereign` · trunk `clean-main-no-secrets` @ `0d145071c`

---

## PHASE 0 — #1007 FREEZE RECORD (state at time of audit, 2026-08-10)

> **SUPERSEDED 2026-08-11T01:09:07Z — #1007 was merged.** The table below records the
> pre-merge state as audited. See **EFFECT ON #1007** at the end of this document for the
> post-merge record. The audit's findings about repository enforcement are unaffected.

| Field | Value |
|---|---|
| State | `OPEN` · not draft |
| Head SHA | `edf66dbd21470e93ffd7f0e77465f30203375f98` |
| Base | `clean-main-no-secrets` (`0d145071c`) |
| `86649f5f1` in ancestry | **PRESENT** |
| Labels | `class-a`, `requires-founder`, `requires-council`, `frontier-dependent`, `frontier-check` |
| Reviews | **none** (empty array) |
| `reviewDecision` | `""` (empty — no review requirement registered) |
| `mergeable` / `mergeStateStatus` | `MERGEABLE` / **`CLEAN`** |
| Checks | auto-label ✅ · build ✅ · check-diagrams ✅ · covenant-gates ✅ · sovereignty ✅ |

Founder-Steward approval: **absent**. Council votes: **0 of 2**. Mentor verification: **absent**.
GitHub nonetheless reports `CLEAN`. Nothing was approved, merged, rebased, or edited.

---

## PHASE 1 — CONSTITUTIONAL REQUIREMENT

Source: `docs/GOVERNANCE_MENTOR_COVENANT.md:106,120`

> Class A — Sacred Boundaries → **Founder-Steward + 2 Council votes + 1 Mentor verification**

Roles defined at `:34` (Founder-Steward = Kelly), `:45` (Founder's Council), `:59` (Mentors).
Labels defined at `:181–184` — `requires-founder`, `requires-council`, `frontier-check`.
`:173` records the *intent* — "Require Founder-Steward approval for merges to `main`" — as an
aspiration, not an implemented control.

---

## PHASE 2 — ACTUAL MACHINE ENFORCEMENT (measured)

`GET /repos/SoullabTech/Sovereign/branches/clean-main-no-secrets/protection`:

```
required_status_checks: strict=true, contexts=[build, check-diagrams, sovereignty]
required_pull_request_reviews: null      ← NO review requirement of any kind
enforce_admins: false                    ← owner may merge past protection
restrictions: null                       ← no merge-actor restriction
```

`GET /repos/.../rulesets` → **empty**. No rulesets exist.

### Finding 1 — CODEOWNERS is inert

`.github/CODEOWNERS` (56 lines) maps every Class A / Class B / doctrine path to `@Soullab`.
CODEOWNERS binds **only** when branch protection enables *require review from Code Owners*,
which requires `required_pull_request_reviews` to be non-null. It is `null`.
**The file is currently documentation, not a control.**

### Finding 2 — the authority handoff went to an empty receiver

`.github/workflows/covenant-gates.yml` header (2026-07-03 Phase 2 redesign) states:

> GitHub owns MERGE AUTHORITY — approvals, required reviewers (CODEOWNERS + branch
> protection) … It does NOT count approvals or gate on human review; that authority
> lives in GitHub, not in this workflow.

The redesign deliberately removed the FOUNDERS/MENTORS/GUARDIAN_CIRCLE approval engine and
delegated approval authority to GitHub. **GitHub was never configured to receive it.**
This is the precise mechanism of the gap: authority was transferred to a mechanism that
was not turned on. The redesign was not wrong to prefer GitHub as substrate; the
configuration half of the change never landed.

*Mitigating record:* the same header disclosed the condition honestly —
"Until a second human GitHub collaborator exists, this repo is single-owner + admin-merge,
NOT independent two-person review." The defect is that **the disclosure never became a block.**

### Finding 3 — covenant-gates is not a required check

Required contexts are `build`, `check-diagrams`, `sovereignty`. `covenant-gates` and
`auto-label` are **not** required. Even its constitutional *validation* (classification,
sacred-path backstop, rollback coupling — `core.setFailed` at `:186`) is advisory at the
merge boundary.

### Finding 4 — Council and Mentor have no machine identity

Collaborators (complete list):

| Login | Role | push | admin |
|---|---|---|---|
| `Soullab` | admin | ✅ | ✅ |
| `SoullabCovenant` | write | ✅ | ❌ |

No GitHub teams. No identity mapping for Council or Mentor exists anywhere in the repo.
**Class A is therefore not merely unenforced — it is presently unsatisfiable by any faithful
mechanism**, because two of its three required constitutional actors have no representation
a machine could check. Any enforcement built today would necessarily be satisfied by
`Soullab` and `SoullabCovenant` alone — i.e. it would manufacture the appearance of
independent review from a single principal.

### Bypass paths (all currently open)

admin merge · API merge · direct push to trunk · force-push · approval-then-new-commit
(no staleness rule exists because no approval rule exists) · self-review ·
label removal (labels are descriptive) · merge-method choice.

---

## CLASSIFICATION

**D → C.** The constitutional identity/authority model is not sufficiently executable yet
(D); once Council/Mentor identities exist, both branch protection *and* a sovereignty-side
gate require changes (C). It is **not** A — configuration alone cannot express
"2 Council votes + 1 Mentor verification" when neither role has an identity, and configuring
generic "2 approvals" now would satisfy the letter while inverting the meaning.

## RECOMMENDED ARCHITECTURE (proposal only — not authorized)

**Hybrid (C), in this order:**

1. **Governance prerequisite (founder act, not technical):** establish Council and Mentor
   membership with named GitHub identities, recorded in a committed, versioned roster —
   e.g. `docs/governance/ROSTER.yml` — so constitutional identity has a durable home in
   the repository, not in GitHub's mutable team state.
2. **Sovereignty-side gate (expresses the constitution):** a required check that reads the
   roster + the PR's review events and refuses to pass unless
   `class_a ∧ founder_approval ∧ council_votes ≥ 2 ∧ mentor_verification ∧ checks_green`,
   with each approval bound to the **head SHA** it was given on.
3. **Native protection (prevents casual bypass):** `enforce_admins: true`, non-null
   `required_pull_request_reviews` with `dismiss_stale_reviews`, `covenant-gates` and the new
   gate added to required contexts, and merge-actor restriction.

**Division of labor:** GitHub enforces *that the constitution was satisfied*; the roster and
the gate define *what satisfaction means*. GitHub never becomes the source of constitutional
truth — the roster is committed, portable, and survives migration off GitHub.

**Failure-closed:** if the roster is unreadable, identities unresolvable, or the SHA moved,
the gate **fails**, not passes.

---

## EFFECT ON #1007

At audit time: **NONE** — no change was proposed to #1007's process, and this unit made no
modification to it.

### POST-MERGE RECORD — 2026-08-11T01:09:07Z

#1007 was merged by **`Soullab`** (Founder-Steward, repository admin).

| Field | Value |
|---|---|
| Merge commit | `06f5103ef` — **true merge commit, not squash** |
| Trunk | `0d145071c` → `06f5103ef` |
| `86649f5f1` | **PRESENT** in trunk |
| `edf66dbd2` (PR head) | **PRESENT** in trunk |
| History rewritten | **No** — evidence lineage preserved as intended |
| Recorded reviews | **none** — zero review records exist on the PR |

**Constitutional status, stated plainly and without inference:** the merge was performed by
the Founder-Steward, so Founder-Steward authority was exercised in the act. The **2 Council
votes** and **1 Mentor verification** required by
`docs/GOVERNANCE_MENTOR_COVENANT.md:106,120` were **not present, and are not recorded
anywhere machine-attributable.** Per Finding 4 those predicates were *unsatisfiable* at the
time — no Council or Mentor identities exist — which this audit surfaced for founder ruling
immediately prior to the merge.

This entry takes no position on whether the merge was legitimate; the Founder-Steward holds
final responsibility and appointment authority over both bodies. It records **what is true**,
so that the governance gap remains visible rather than being retroactively smoothed over by
the fact that the merge succeeded. That visibility is the entire purpose of this unit.

**Founder decision required:** YES — the Class A gate remains unsatisfiable until Council and
Mentor identities exist. Merging #1007 did not resolve that; it exercised it.
**Implementation authorized:** NO
