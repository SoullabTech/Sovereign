# Writer structured inference — Class A raw-error router amendment review

**22 October 2026 | Review specification only | NO runtime router change | DRAFT/HOLD**

## Why the existing provider-wrapper fix is insufficient

The separate [draft PR #1918](https://github.com/SoullabTech/Sovereign/pull/1918)
qualifies the *normal Anthropic structured adapter*'s error wrapper with
**96/96 fictional tests across seven suites** (CI on
`717adf459a072baa4cb5c4026317e0e177d831dc`). The wrapper now retains
only a generic message, validated numeric status and honest dispatch
classification, and no raw vendor object.

This does **not** cover failures that bypass that wrapper. The byte-pinned
neutral `lib/ai/structured/router.ts` (Git blob
`c4cb96d17f89cce48da703452faf65c8959e98dc`) has additional catches:

- The lazy adapter factory/load catch returns
  `{ok:false, refusal:'not_configured', detail:String(err)}` directly.
- The provider execute catch returns free-form `err.message` as
  `StructuredOutcome.detail`.
- The same catch may log `preflightMessage: err.message` when numeric status
  is absent, and may include arbitrary `name`, `error.type`, `code`
  and `cause.code` fields from the untrusted error.
- Reading `typeof e.status` on a hostile object may invoke a getter that
  throws **inside the catch**.

The current adapter normally wraps genuine SDK exceptions. This is a real
**source-level privacy and resilience gap**, NOT evidence that any
real manuscript was logged or that production served one of these paths.

## Exact negative acceptance evidence

The isolated [draft PR #1920](https://github.com/SoullabTech/Sovereign/pull/1920)
contains NO runtime modifications. Its `unwrappedRouterPrivacyHold.test.ts`
runs the real governed `runStructured()` router using fictional text and
a no-network mocked adapter.

The first CI run (GitHub Actions `39863012504`, job
`120118173017`) **FAILED for the intended reasons**:

- A fictional raw provider error marker appeared in
  `provider_unavailable.detail`.
- A fictional adapter-construction error marker appeared in
  `not_configured.detail`.

A stronger next test revision separately checks **five** red cases:
raw provider refusal body, raw preflight log, arbitrary nested diagnostic
fields, raw adapter-load refusal, and a throwing status getter, plus **two**
green `sovereign/local_only` no-provider controls. Keep this proof **red**
until a separately accepted router amendment fixes the corresponding
failures; distinguish test setup issues from intended falsification.

## Proposed minimal, independently ratified router change (NOT applied)

The following is pseudocode describing the intended source patch. Do not
apply it to the governed router merely to make CI green.

1. Preserve a single `runStructured(req)` export, lazy adapter loading, the
   caller-pinned request/model/tool contract and `primary` versus
   `sovereign/local_only` no-fallback policy.
2. For the `defaultProvider()` catch, return a **fixed content-free**
   `{ok:false, refusal:'not_configured', detail:'structured_adapter_unavailable'}`.
   Do not call `String(err)`, inspect `err`, log the original object,
   or synthesize a `dispatch` (no adapter or provider was reached).
3. In the provider-execute catch, use **only neutral wrapper facts**:
   `dispatchOf(err)` gives `response_observed`,
   `no_response_observed` or `unknown`; unwrapped errors must stay
   `unknown` rather than inferring arrival from an untrusted status.
   Recognize a `StructuredDispatchError` instance from the neutral
   `./dispatch` module for safe, already-bounded numeric `status`.
   Never inspect arbitrary `err.status` getters or `err.name`,
   `err.code`, `err.error.type`, `err.cause.code` or
   `err.message`.
4. Log only fixed event name and a small safe shape, for example:
   `{ dispatch: dispatchOf(err), status: trustedWrappedStatusOrNull }`.
   Return fixed
   `{ok:false, refusal:'provider_unavailable', detail:'structured_provider_error_redacted', dispatch:dispatchOf(err)}`.
   The response must not contain a raw error/cause/body or request words.
5. Never retry, select another provider, synthesize a local answer, persist
   unverified manuscript changes, or treat `unknown` as proof that nothing
   crossed. A provider's **error response** still means
   `response_observed` and must confirm the attempted/crossed disclosure
   receipt even when no usable editorial result exists.
6. Maintain error logs and consent receipts as **separate** objects. Only
   the latter may record source/contact authorization; neither may use
   provider error prose as a dispatch or disclosure fact.

## Tests and approval that MUST precede any router amendment

- Get explicit Founder-Steward plus independent Class A security/privacy
  and structured-inference-seam governance approval to alter the byte-pinned
  `router.ts`. Name exact base source SHA, bounded diff and rollback.
- Make all five red raw-error falsifiers green **without weakening their
  assertions**, keep both sovereign/local_only no-provider controls green.
- Update the existing `nonFallbackable.test.ts` bare-error detail expectation
  **only after** the new fixed-detail contract is accepted. Do not quietly
  rewrite other historically governed tests.
- Run `providerErrorRedaction`, `adapterErrorEdge`,
  `nonFallbackable`, `requestEquivalence`, `modePolicy`,
  `seamIsolation`, and `editorialDisclosureFalsifiers`, including exact
  historical source-byte pins. A new source baseline requires a **governed
  baseline amendment**, not an automatic hash replacement or test skip.
- Verify disclosure attempts and confirmed provider arrivals, no fallback,
  true requested/reported model identity, refusal of ambiguous delivery,
  bounded retries, diagnostic sinks, retention and actual author processing
  consent before any genuine MAIA call.
- After independent acceptance, review current Writer R87/P4R1 source
  separately. A clean-base unit test does not authorize production runtime
  merge, full Work Save→Review→Apply→Undo→Reopen, mobile Safari or beta users.

**STATUS: CLASS A SOURCE FIX NEEDED; implementation and merge NOT approved.**
The current Writer Free/Pro beta, original-file upload/auto-expiry,
terminal R20 grant and erasure/restore controls remain held.
