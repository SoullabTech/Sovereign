# PR #1671 — Class A canonical-admission exception

**Date:** 2026-10-02  
**PR:** #1671 — `fix(safety): add independent human delivery fallback`  
**Canonical merge commit:** `15a9175fb917cd9aa84a2735f7b3cf91a964b49b`  
**Purpose:** preserve a visible factual record so this admission does not become silent precedent.

## Event — established facts

- PR #1671 was classified **Class A** and carried the labels `requires-founder` and `requires-council`.
- The PR was authored by `Soullab`.
- GitHub records the PR as merged by `Soullab` at **2026-10-02T09:47:07Z**.
- GitHub's pull-request review endpoint returned **zero reviews** for #1671 at the time of the read-only post-merge census.
- The merge commit is `15a9175fb917cd9aa84a2735f7b3cf91a964b49b`.
- The engineering gate suite had passed before/at admission: authoritative adjudication, empty-database reconstruction, record-SHA verification, JARVIS patch-admission falsifiers, TypeScript no-regression, auto-label, Docker build, diagram check, covenant-gates, sovereignty, and GitGuardian.

## Governing law in force

The canonical admission design at
`docs/programme/CANONICAL-ADMISSION-ENFORCEMENT-01_E1_FAIL_CLOSED_ADMISSION_DESIGN_2026-09-23.md`
states:

- the chosen architecture is a **genuinely distinct human custodian**;
- `SoullabCovenant` must not be assumed to satisfy that role from account identity alone;
- until a valid second human custodian is constituted, **self-authored Class A canonical admission = FAIL CLOSED**;
- administrator bypass is not authorized merely because the second custodian has not yet been constituted.

A repository-wide post-merge search found no later governed record constituting the second human custodian before #1671 merged.

## Enforcement state observed before the merge

Read-only GitHub inspection found:

- branch protection required approving-review count: **0**;
- code-owner review required: **false**;
- last-push approval required: **false**;
- repository rulesets: **0**;
- `/lib/safety/` and `/lib/consciousness/` CODEOWNERS resolved only to `@Soullab`;
- #1671 had **0 requested reviewers** and **0 reviews** when inspected before admission.

Therefore the repository's documented Class-A custody requirement was not mechanically enforced by GitHub at that time.

## Classification of the event

This record classifies the merge as a **canonical-admission exception relative to the governing Class-A custody law**.

It does **not** assert:

- why the merge occurred;
- that the engineering work was defective;
- that any person intended to bypass governance;
- that the merged runtime should automatically be reverted.

Those questions are not established by the available evidence.

The material distinction is:

> **Engineering acceptance was satisfied; human-custody concurrence was not evidenced.**

## Consequence

The merge is now historical fact. A later approval cannot make the earlier admission compliant *at the time it occurred*. Post-facto review may determine whether the merged state should remain canonical, be amended, or be reverted, but it does not erase this exception record.

### Deployment standing

The earlier post-merge census found production at `12b461bd8`, before #1671 had crossed deployment. That observation was correct at the time but is now superseded by a later read-only witness.

On 2026-10-02, production was witnessed healthy at:

```text
d4655e6477fa40b8f94c5f8f91be47198288d2af
```

Repository ancestry checking confirms #1671 merge `15a9175fb917cd9aa84a2735f7b3cf91a964b49b` is an ancestor of that running SHA.

Therefore the exception has now crossed both **canonical admission and production deployment**. This does not cure the custody exception, create retroactive concurrence, or alter the remediation requirement. Detailed runtime evidence is recorded in `docs/ops/SAFETY_DELIVERY_01_POSTDEPLOY_WITNESS_2026-10-02.md`.

## Remediation

1. **Constitute the second human custodian** under the existing canonical design. The governed record must bind at least:
   - human identity;
   - GitHub login;
   - immutable GitHub user id;
   - custody role;
   - explicit assertion of human distinctness from Founder;
   - scope of authority;
   - effective date and authorizing Founder act;
   - revocation/supersession path.

2. **Mechanically enforce Class-A concurrence** after that constitution:
   - make the custody gate required for canonical admission;
   - prevent ordinary administrator bypass from substituting for concurrence;
   - preserve a readable evidence trail for any separately governed break-glass act.

3. **Review #1671 post-facto** under the constituted custody process:
   - review the exact admitted merge commit `15a9175fb917cd9aa84a2735f7b3cf91a964b49b`;
   - record whether the substantive safety changes are affirmed, amended, or reverted;
   - keep this exception record regardless of the substantive disposition.

## Standing

**OPEN — governance remediation required.**

This record is evidence of the admission event. It is not itself a substitute for the missing second-human custody act.
