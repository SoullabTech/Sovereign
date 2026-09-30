# PR #1513 — post-admission Stripe delta review

**Date:** 2026-09-30  
**Scope:** commit `77d8656c18ec8824ca6058de4fe5d89dc2ec6f2c` only.

## Custody gap recorded

The admission material cited by PR #1513 bound candidate head `443ff27b`. The PR
was ultimately merged as `47081520f` with second parent `77d8656c`, so the Stripe
delta entered canonical after that cited admission review. This record closes that
specific review gap; it does not retroactively alter the original admission record.

## Independent review

`77d8656c` changes one line in `lib/stripe/config.ts`:

- from Stripe API version `2025-12-15.clover`
- to `2026-02-25.clover`

Canonical installs Stripe SDK `20.4.1`. Its shipped `types/apiVersion.d.ts`,
runtime `apiVersion.js`, and changelog all pin `2026-02-25.clover`. The delta
therefore aligns the explicit client API version with the installed SDK rather
than introducing a separate behavior or payment-flow change.

## Verification

- full production build on Node 22 / Next 16 completed successfully on the
  Writer's Studio convergence candidate;
- the Stripe delta is already an ancestor of current canonical;
- no additional Stripe code changed in this review unit.

**Disposition:** reviewed and accepted as a compatibility correction.  
**Residual governance issue:** the one-human branch rule/admin-bypass posture
remains a separate repository-governance problem and is not resolved here.
