# PR #1633 — Class A canonical-admission exception

**Date:** 2026-10-02  
**PR:** #1633 — `Safety: server-side crisis assessment — referral only on clear signals, context for ambiguous (Option A)`  
**Canonical merge commit:** `5c3d31c2a777ee62780906d8e07ba7b5fff47537`  
**Purpose:** preserve a visible factual record so this admission does not become silent precedent.

## Event — established facts

- PR #1633 explicitly declared **Class A — Sacred Boundaries**.
- The PR carried `requires-founder` and `requires-council` labels.
- The PR was authored by `Soullab`.
- GitHub records the PR as merged by `Soullab` at **2026-10-02T10:45:01Z**.
- GitHub's review list for #1633 contains **zero reviews**.
- The merge commit is `5c3d31c2a777ee62780906d8e07ba7b5fff47537`.
- The PR's frontier diagnostic was explicitly resolved as not materially frontier-dependent; that determination does not satisfy or replace Class-A human custody.

## Governing law in force

`docs/programme/CANONICAL-ADMISSION-ENFORCEMENT-01_E1_FAIL_CLOSED_ADMISSION_DESIGN_2026-09-23.md`
states:

- the chosen architecture is a **genuinely distinct human custodian**;
- `SoullabCovenant` must not be assumed to satisfy that role from account identity alone;
- until a valid second human custodian is constituted, **self-authored Class A canonical admission = FAIL CLOSED**;
- administrator bypass is not authorized merely because the second custodian has not yet been constituted.

A repository-wide post-merge search found no governed record constituting the second human custodian before #1633 merged.

## Classification of the event

This record classifies #1633 as a **canonical-admission exception relative to the governing Class-A custody law**.

It does **not** assert:
- why the merge occurred;
- that the engineering work was defective;
- that any person intended to bypass governance;
- that the merged runtime should automatically be reverted.

The material distinction is:

> **Canonical admission occurred without evidenced distinct-human custody concurrence.**

## Deployment standing

A read-only production witness on 2026-10-02 found `maia-sovereign` running SHA `12b461bd8`.

Inside that running container:
- `lib/safety/crisisAssessment.ts` is **absent**;
- the canonical MAIA list route has no `assessCrisis` seam.

Therefore #1633's server-side crisis detector had **not crossed into production** at that witness.

Canonical presence is not treated here as deployment authority.

## Consequence

The merge is historical fact. A later review cannot make the earlier admission compliant *at the time it occurred*.

Post-facto governance may affirm, amend, or revert the substantive safety change, but it cannot erase this exception record or rewrite the admission sequence as a normal Class-A pass.

## Remediation

1. **Mechanically enforce the existing Class-A floor.**
   - #1716 provides the immediate custody-floor enforcement inside the already-required authoritative-adjudication status context.

2. **Constitute the second human custodian** under the existing canonical design.
   The governed record must bind at least:
   - human identity;
   - GitHub login;
   - immutable GitHub user id;
   - custody role;
   - explicit assertion of human distinctness from Founder;
   - scope of authority;
   - effective date and authorizing Founder act;
   - revocation/supersession path.

3. **Review #1633 post-facto** under the constituted custody process.
   - review exact admitted merge `5c3d31c2a777ee62780906d8e07ba7b5fff47537`;
   - record whether the server-side crisis safety changes are affirmed, amended, or reverted;
   - preserve this exception record regardless of disposition.

4. **Keep production cut fail-closed.**
   - #1718 must not select #1633 into a production projection solely because the code is canonical.

## Standing

**OPEN — governance remediation required.**

Engineering/canonical standing and deployment standing are deliberately separate in this record.
