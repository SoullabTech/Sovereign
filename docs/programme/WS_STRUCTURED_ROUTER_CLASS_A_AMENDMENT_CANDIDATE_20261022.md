# Structured MAIA Router — Class A source amendment candidate

**22 October 2026 | REVIEW-ONLY | DO NOT MERGE | NO PRODUCTION/MODEL CALL**

## Decision and source custody

The existing governed structured inference router is pinned at Git blob
`c4cb96d17f89cce48da703452faf65c8959e98dc` by
`lib/ai/structured/__tests__/seamIsolation.test.ts` and the previously
accepted historical baseline `8ea119d52cbf0d79ab641943930cf0b294bbfbb1`.

This candidate proposes changing that file. It therefore **cannot** be merged
just because functional tests pass. Founder-Steward and independent Class A
security/privacy/structured-seam review must explicitly authorize the new
semantics, exact source, historical baseline transition and rollback plan.
There is **no automatic baseline update, pin exemption or test weakening**.

The review branch `review/ws-structured-router-class-a-amendment-20261022`
is based **only** on the published-base Class A wrapped-provider draft
`fix/ws-structured-provider-error-redaction-review-20261022` (PR #1918),
not the unpublished R87/R12 Writer source. It is a **stacked draft**, not a
deployable branch. The independently red diagnostic PR #1920 stays unchanged.

## Reproduced starting failure (not a reported incident)

On unchanged router source, PR #1920 exact CI
`39863914442` showed **5/5 red security falsifiers** and two passing
sovereign/no-provider controls:

1. Generic, unwrapped provider Error text in a returned refusal detail.
2. Identical free-text content logged as `preflightMessage`.
3. Arbitrary untrusted error `name`, `code` and `error.type` reaching logs.
4. Lazy adapter factory/load Error text returned as `not_configured.detail`.
5. A hostile `status` getter throwing out of the error handler.

No real member prose, production logging incident, credentials or provider
request was observed. These were invented test strings only.

## Bounded proposed amendment (functional tests pending)

The reviewed candidate:
- Returns only fixed `structured_adapter_unavailable` for a lazy
  adapter load/refusal, **without inventing a dispatch observation**.
- Returns only fixed `structured_provider_error_redacted` for an executed
  provider refusal. Never calls `String(err)`, inspects vendor `message`,
  arbitrary name, code, nested `error`/cause or request body.
- Reads `dispatch` only through neutral `dispatchOf(err)` inside a
  guarded try/catch, allowing only
  `response_observed`, `no_response_observed`, or `unknown`.
  Unwrapped errors and hostile instances stay **unknown**, not falsely
  classified as no provider crossing.
- Logs only structurally safe
  `{dispatch,status}`, where numeric HTTP status comes from a validated
  own DATA descriptor on the neutral `StructuredDispatchError`
  **and only** when a provider response is confirmed.
- **Constructor-minted delivery fact is now REQUIRED.** The exact review
  `lib/ai/structured/dispatch.ts` implementation was converged from the
  stronger parallel [Class A draft PR #1922](https://github.com/SoullabTech/Sovereign/pull/1922).
  A private `WeakSet` distinguishes genuinely constructed neutral wrappers
  from arbitrary errors whose prototypes were forged with
  `Object.setPrototypeOf`. Nonwritable/nonconfigurable own data
  descriptors freeze `dispatch` and valid numeric `status`. A forged
  `instanceof` can no longer falsely claim a confirmed provider crossing
  or mutate a genuine response classification after construction.
- Preserves platform-owned inference mode, one caller-pinned model,
  nonfallbackable structured result, no duplicate requests, no unauthorized
  tool fallback and explicit attempted-versus-crossed disclosure facts.

The existing `nonFallbackable.test.ts` candidate changes one previously
unsafe assertion of raw error text to the new fixed refusal. All remaining
intent and no-fallback assertions are preserved. This test change is **not
an accepted constitution amendment** by itself.

## Proof and deliberate governance STOP

The new
`lib/ai/structured/__tests__/unwrappedRouterPrivacyAmendment.test.ts`
copies every assertion from independent red PR #1920 **without weakening**
and adds confirmation cases for a real neutral wrapped
`response_observed` HTTP error and nonconfirming delivery states.
**Two additional falsifiers** now prove that a forged `instanceof`
prototype cannot mint `response_observed` and an already constructed
`response_observed` cannot be downgraded by mutation. The first router-only
candidate passed 89/89 earlier assertions but **failed both new spoof/mutation
tests (89/91)**. The branded, immutable `dispatch.ts` candidate was added
after that diagnostic failure; rerun results must be verified on its final
exact source, not borrowed from the earlier 89-test result.

The dedicated review CI
`.github/workflows/writer-router-class-a-amendment-review.yml` has two
separate jobs:

1. **Functional candidate**: synthetic router privacy, SDK adapter errors,
   structured non-fallback, request equivalence, inference mode policy and
   editorial attempted/crossed disclosure falsifiers; expected GREEN if
   the proposed change preserves behavior.
2. **Historical governed seam source pin**: unmodified
   `seamIsolation.test.ts`; expected RED because router byte content has
   changed without accepted founder/mentor baseline ratification. This job
   is deliberately **not ignored and not marked continue-on-error**.

Only a founder-ratified amendment may later move the governed historical
baseline; simply updating the pin's SHA or writing a green mock is forbidden.

## Open release blockers / owner decisions

- Independent Class A privacy/security reviewer accepts or requests revisions
  to this exact source diff and the proposed fixed-detail contract.
- Founder-Steward explicitly approves that specific governed router
  amendment and the recorded source-baseline transition. The release
  steward accepts independent CI, separate rollback and exact source/image.
- Confirm the wrap-only PR #1918's latest Class A review separately;
  it is a **stacked dependency** and currently draft.
- Verify persisted editorial attempted/crossed receipts and true provider
  reported model identity, bounded author processing consent and retention,
  no fallback and no manuscript changes without explicit author's Apply.
- Current Writer beta R20 revocation/latest WORM head, R86P original-file
  ingest/no auto-expiry, two-member source/Work isolation, deletion-safe
  restore, managed beta platform/privacy, physical iPhone Safari and
  independent founder GO remain unchanged.

**Disposition: source review only. No change to production, no real MAIA
provider request, no Writer beta invitations/billing/permissions, and no
merge/deployment authorization.**
