# Writer Class A — independent adjacent error privacy proof (expected RED)

**REVIEW ONLY / NO SOURCE AMENDMENT / DO NOT MERGE / NOT RELEASE AUTHORITY.**

## Why separate
Draft #1922 addresses raw/unwrapped errors in the structured router and preserves the historical byte pin. That work does **not** change the adjoining error disclosure paths in `lib/disclosure/contextDisclosureReceipt.ts` or the governed structured policy `lib/ai/structured/policy.ts`.

This review-only branch is based on the published `clean-main-no-secrets` commit `ffcab520e346cf2d7cee1f293e509c68afc44ab3`. It changes only two isolated security tests, this note and a read-only CI workflow; it does not change governed runtime source or source pins.

## Expected falsifiers — all fictional
1. Receipt `mintDisclosureAttempt` returning `unavailable` nonetheless logs raw `Error.message`, then bare rejected text, from the mocked failing PostgreSQL query.
2. `confirmDisclosureCrossed` honestly returns `false` but logs raw `Error.message`, then bare rejected text, after a mocked failed confirmation. That failure **must remain an unresolved crossing**, not become success or erase the attempted receipt.
3. Invalid `MAIA_INFERENCE_MODE` is safely refused but its uncontrolled string is echoed in `resolveStructuredMode().detail` and the public `runStructured()` refusal.
4. Green controls preserve successful minted/confirmed receipts and sovereign/local_only no-provider refusal.

The tests intentionally require zero fictional private marker text in observable errors/refusals. They are expected to **FAIL on the published source**. A red security witness is not a CI setup problem and must not be changed to demand the old unsafe behavior.

## Separate governed acceptance
- Review content-free, allowlisted operational diagnostic codes, never raw SQL exceptions or arbitrary configuration text.
- Preserve minted-only disclosure permission, unknown/unresolved crossing truth, and no-fallback sovereignty.
- Independently authorize changes to `policy.ts` as a historically pinned structured seam amendment. Any disclosure-receipt amendment is a **separate** Class A privacy/custody decision.
- Maintain an unconditional historic seam byte pin until explicit Founder-Steward plus independent Class A acceptance. Never change it to green up a candidate.
- Prove red on the untouched source, green on a **separately reviewed** proposed patch using unchanged assertions. Qualify log sinks, rollback, R20 erasure, author consent, actual model provenance and physical Safari separately.

Related: security issue #1917, Writer gate #1800, wrapper draft #1918, negative router draft #1920, governed-router draft #1922.

**No live member source, PostgreSQL, model, provider key, inference, production change, upload, beta account grant, billing, merge or deployment.**
