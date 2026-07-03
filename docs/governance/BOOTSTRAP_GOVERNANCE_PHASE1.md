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
**Normal operation:** mentor review satisfies the Class B role
**Bootstrap deadlock:** under the explicitly defined bootstrap conditions, mentor review temporarily satisfies the founder approval requirement as specified by the enforcement layer
**Not placed in:** `FOUNDERS` — `SoullabCovenant` holds no intrinsic founder-level authority

`SoullabCovenant` is not the Founder. It represents the covenant process itself.

The authority that permits mentor review to satisfy a Class A requirement during deadlock comes from the governance rules in force — not from the identity of the reviewer. When those conditions change (Guardian Circle appointed), the same reviewer returns to the Class B role without any change to the identity itself.

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

This is not a weakening of Class A. The PR still requires review and approval from a governance identity distinct from the author. The authority that permits this comes from the enforcement rules in force during Bootstrap Phase 1 — it is conditional, not intrinsic to the reviewer.

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
| Satisfy Class B approval requirement — normal Mentor role | ✅ |
| Satisfy founder approval requirement under deadlock conditions — bounded, logged | ✅ (conditional) |
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
| 2026-07-03 | **Covenant bypass invoked** — PR #548 (Gate 2, Class B migration) merged by admin override without a non-author approval. See _Recorded exceptions_ below. |
| [future] | Guardian Circle appointed — Phase 2 begins |

---

## Recorded exceptions (visible, not normalized)

This phase's own principle: an exception must stay **visible** and must not become
**silent precedent**. Invocations of the admin bypass are logged here as facts.

### 2026-07-03 · PR #548 — Gate 2 Soul Portrait Path B schema migration

**What happened (established from the PR page + read-only verification):**

- PR #548 (three inert Path B tables — `soul_portraits`, `member_guardians`,
  `soul_portrait_consents`) was classified **Class B** (structural / migration) by
  `covenant-gates`.
- It was **merged to `clean-main-no-secrets` by `Soullab`** (also the PR author), merge
  commit **`caecc57`**, with **3 of 5 checks passing** — `covenant-gates` was **failing,
  not passing**.
- Merge path = **admin bypass** (branch-protection override), **not** a cleared gate. No
  non-author approval was obtained; the founder cannot self-approve, and the designed
  **Tier-0 path** (`SoullabCovenant` Release-Steward/Mentor approval) was **not used**.
- **Production was not deployed and the migration was not applied** — verified read-only:
  live commit `d758` (pre-merge); all three tables absent from the live database.
  Repository state only; no runtime effect.

**Not asserted:** the reason bypass was chosen over the Tier-0 path is not established
here. The operative working assumption at the time was that `SoullabCovenant` was
operationally unavailable — an *operational* assumption, not a confirmed fact.

**Remediation status:**

1. ~~Record the bypass factually~~ — **done** (this entry).
2. **Resolve `SoullabCovenant` operational access** — open. The bypass stepped around the
   deadlock rather than resolving it; it will recur on the next Class-A/B crossing.
3. **Route the next Class-A/B crossing through the normal `SoullabCovenant` path** — open;
   proves this bypass did not normalize.
