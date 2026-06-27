# Bootstrap Governance Phase 1

**Status:** Active (as of 2026-06-27)
**Superseded by:** Appointment of Guardian Circle (Bootstrap Phase 2)

---

## What this is

This is the first explicitly named stage of MAIA's governance architecture. It is not an ad hoc exception or a workaround. It is the deliberate starting state before the full Founder + Guardian Circle + Mentor model is operational.

## Why it exists

The covenant-gates system requires a non-author approval for all PRs. During early development, the only Founder (`Soullab`) is also the primary code author. GitHub's review system blocks self-approval. Without a principled bridge, every PR would require an admin override — which defeats the purpose of having a gate.

Bootstrap Phase 1 installs a bounded governance identity that can approve PRs without holding founder-level authority.

## Identity: `SoullabCovenant`

`SoullabCovenant` is a governance principal, not a development identity.

**Placed in:** `MENTORS` (Release Steward role)
**Authority:** Class B (Structural Risk) approvals
**Not placed in:** `FOUNDERS` — no Sacred Boundaries authority by default

`SoullabCovenant` is not the Founder. It represents the covenant process itself.

## Class A deadlock fallback

Class A (Sacred Boundaries) requires Founder approval. When the only Founder is the PR author, GitHub blocks approval — a structural deadlock.

The covenant-gates workflow includes an explicit fallback rule:

> When the only Founder is the PR author **and** no independent Founder or Guardian Circle exists,
> a Mentor approval substitutes for Founder approval.

When this substitution fires, the gate logs:

```
⚠️ Mentor substitution used for founder self-approval deadlock.
   PR author: Soullab | Mentor approvals: SoullabCovenant
   Bootstrap Phase 1: no independent Founder or Guardian Circle exists.
```

This is not a weakening of Class A. The PR still requires review and approval from a governance identity distinct from the author. The substitution is bounded to the deadlock condition only.

## Governance org structure (Bootstrap Phase 1)

```
SoullabTech
    ├── Soullab            (Founder — code authorship + final authority)
    ├── SoullabCovenant    (Bootstrap Mentor / Release Steward)
    ├── [future]           (Guardian Circle — 2+ members, appointed)
    └── [future]           (Additional Mentors)
```

## Permissions: `SoullabCovenant`

| Permission | Granted |
|---|---|
| Review PRs | ✅ |
| Approve covenant workflows (Class B) | ✅ |
| Deadlock substitute for Class A | ✅ (bounded) |
| Push to protected branches | ❌ |
| Merge by itself | ❌ |
| Deploy production | ❌ |
| Modify infrastructure | ❌ |

## Transition to Phase 2

Bootstrap Phase 1 ends when the Guardian Circle has at least two appointed members. At that point:

1. Add Guardian Circle members to `GUARDIAN_CIRCLE` in `covenant-gates.yml`
2. Update this document with the transition date and appointed members
3. Class A approvals transition to the permanent Founder + Guardian Circle + Mentor model
4. The deadlock fallback remains in the workflow but becomes dormant (Guardian Circle provides independent approval)

## Audit record

| Date | Action |
|---|---|
| 2026-06-27 | `SoullabCovenant` account created |
| 2026-06-27 | Added to `MENTORS` in covenant-gates.yml (this PR) |
| 2026-06-27 | Class A deadlock fallback logic added |
| [future] | Guardian Circle appointed — Phase 2 begins |
