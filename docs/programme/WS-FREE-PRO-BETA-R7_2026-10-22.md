# Writer’s Studio Free + Pro — R7 single beta-admission authority
**22 October 2026 · Class A source review · DRAFT / HOLD · NO PRODUCTION CHANGE**

## The founder decision remains unchanged

Free must remain a meaningful writing environment, including author-owned
writing, privacy, safe essential export, Inspiration Compass and foundational
Writer Academy/MAIA. Optional Pro adds deeper editorial collaboration. **Every
individually founder-approved and account-verified writer in the restricted
beta cohort receives the entire currently approved Pro product inclusion for
free**, not a trial or time-limited upsell. The first release cohort is two
distinct verified writers; no automatic extra seats, public enrollment,
payments or change to separate PDF/EPUB/Source holds.

## R7 source audit — the two genuine inconsistencies

1. **Mutation routes:** before R7, `/pilot-approval` POST/DELETE and
   `/pilot-accept` POST could update the disposable/local
   `writer_studio_beta_grants` model when the
   `WRITER_PILOT_GRANT_WRITES_ENABLED=1` flag was set and a member session
   was valid. They did **not** obtain an independent, restore-resistant R20
   authorization seal before local DB mutation. This is a source-design gap,
   **not** evidence that unapproved real grants were issued.
2. **Beta access/feedback:** `/beta-access` and `/beta-feedback` still used
   the older `writersStudioBetaAccess` predicate. An active member-linked
   `ops_contacts` CRM beta_tester was enough to display beta feedback or
   submit explicit beta notes. It did not prove individual founder admission
   or member acceptance. The Free/Pro plan already required the newer source.
   These divergent policies could misrepresent who had joined the writer beta.

## Corrections implemented in the R7 review branch

- **Single member admission decision:** `writersStudioBetaAccess` now
  delegates to `writerStudioPlanForMember`, which requires an accepted,
  member-linked founder-approved grant and independently valid R20 decision
  before a nonfounder can see beta eligibility. A CRM contact, general paid
  membership or query parameter is never enough. Current external R20
  authority is not provisioned and therefore fails closed.
- **No one-flag grant writes:** all three member grant-changing HTTP
  operations now demand `requireIndependentPilotR20MutationReceipt` BEFORE
  calling their DB model functions. It is deliberately UNPROVISIONED and
  raises `PilotR20AuthorityUnavailable`. Even with the feature flag ON and a
  verified founder session, the response is a private no-store **423 HOLD**.
  A successful fictional mock of the receipt proves only operation ordering.
- **One strict request identity rule:** both beta-access GET and explicit
  feedback POST now validate any supplied cookie and header sessions, require
  every credential to identify the same currently authenticated member, and
  refuse stale, contradictory or mismatched identity assertions. This matches
  the existing stricter pilot write resolver.
- **Explicit feedback origin protection:** submissions must carry exact
  same-origin evidence; a foreign, null or unsupported origin is refused
  before reading or storing the narrative. Beta access and feedback failures
  are private/no-store and cannot optimistically show eligibility.
- **Author-owned scope unchanged:** feedback remains opt-in. A manuscript ID
  still needs an owner-scoped membership check; R7 neither changes Work
  ownership nor author retention/custody policy.

## Test evidence — bounded claims

- **136/136 focused Jest tests PASSED** across **16** suites for R1–R7,
  including R7 real-unmocked external-authority refusal, fictional R20
  seal-before-DB ordering, CRM-only denial, strict cookie/header conflict,
  feedback origin protection, and preserved Source/canary tests.
- **63/63 actual fictional PostgreSQL 16 + direct Next-handler checks
  PASSED**, with founder-bound approval model, two writers, parallel attempt
  uniqueness, no recycled seat after deletion, the **real unprovisioned
  R20 mutation boundary**, beta-access and feedback denial, and A/B conflicting
  session cookie/header refusal. The DB-only fiction tests explicitly call
  their model helpers for accepted/revoked state to test independent DB
  invariants; they are **not approved live mutation routes**.
- Writer flagship TypeScript, targeted ESLint, and Git source diff checks
  PASSED. The source's pre-commit sovereignty checks are recorded at commit.
- All accounts and token values were fictional. PostgreSQL ran in a dedicated
  Docker tmpfs instance bound to 127.0.0.1:55439 and was stopped. No
  production DB, account, billing, manuscript bytes, email, invitation, secret
  or shared Docker volume was changed.
- Direct handler calls validated against real PostgreSQL are **not** a
  production-built or externally authenticated HTTP/site replay, and do not
  constitute physical iPhone/Safari acceptance. Those remain held in #1800.

## Remaining critical authority work

The current `requireIndependentPilotR20MutationReceipt` is intentionally
a **nonfunctional fail-closed adapter**. It does not seal an actual grant;
it cannot be enabled by a flag. Approval needs a separately and
cryptographically generated stable `grant_id` **BEFORE** the external
`issued` event; the exact same ID and subject commitment must be stored
locally. Acceptance and revocation must seal the same generation, under
idempotent crash-recovery semantics. A loose boolean “R20 service ready”
check would not meet this requirement.

**DB model helpers still exist and can be called directly by isolated test
scripts.** Route-level R20 protection does not mean PostgreSQL itself can
verify WORM receipts; the trusted service + DB transaction boundary needs
independent Class A review and must remain protected against future internal
callers. No operational entitlement may rely solely on `ops_contacts`,
local `writer_studio_beta_grants`, or a frontend beta flag.

The standing R20 independent WORM/current-head security and deletion-safe
backup workstreams remain HOLD, as do qualified current Writer P4R1 source
integration, 2-account authenticated Work ownership and Save/reopen tests,
mobile Safari/VoiceOver, exact signed image/rollback and separate founder
release authority. Public Free signup and paid checkout are still disabled.

**Disposition: DRAFT / HOLD. R7 closes inconsistent product/HTTP source
authorization surfaces but does NOT create durable production R20 authority,
release new member functionality, or authorize enrollment.**
