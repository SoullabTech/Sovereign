# Writer’s Studio Free + Pro — R2 individual beta authorization
**Status:** 22 October 2026 · isolated source only · DRAFT HOLD · no deployment or member invitations

## Founder intent and admission authority

Writer’s Studio has one ongoing Free plan and one optional Pro plan (price hypothesis
$19/month, $180/year). Members may write indefinitely on Free; private ownership,
consent, author-controlled editing, safe basic export and deletion do not depend on
payment.

**Every individually admitted beta writer is included in the entire currently
approved Pro product experience, complimentary, until the founder explicitly
ends that pilot authorization.** “Full Pro” means no commercial upsell or
arbitrary feature downgrade during approved testing, **not** the automatic
activation of separately held source/rights operations.

Kelly is the sole actual enrollment/release decision-maker until he delegates
that authority through a separate explicit governance process. R2 additionally
introduces `writer_studio_pilot_admission_control.founder_member_id`, intentionally
**NULL after migration**. Approval/refusal, acceptance and Pro witnessing
require an exact member-ID binding **and** that member's currently verified
`admin_role = 'founder'`. Another account carrying the founder role does not
inherit this admission authority. A live binding must be separately
founder-verified and recovery-governed; no real ID is embedded in source.

## R1 authorization deficit and R2 correction

R1 product projection reused `writersStudioBetaAccess`, where an active member-linked
`ops_contacts` record was sufficient to see complimentary Pro. That CRM contact
is not proof of author-owned account control, individual founder decision or
admission to Writer’s Studio.

R2 replaces **only the Free/Pro product projection** with an explicit database
`writer_studio_beta_grants` lifecycle:

| Grant state | Authority / event | Pro inclusion |
|---|---|---|
| Missing | Even an active CRM beta contact is not authority | No |
| Pending | Founder session explicitly approves a *specific member UUID* | No |
| Accepted | The **same account owner** signs in and explicitly accepts | Yes, if founder remains current and CRM still active |
| Revoked | Founder explicitly revokes that individual grant | No, terminal within current DB |
| Expired/suspended | Expiry, founder-role loss, or inactive CRM | No |

Founder witnessing is separate from a tester admission. The CTO or generic
member-toggled beta flag never creates complimentary Pro or approves a writer.

### Admission cap / founder canary gate

R2 admits **a maximum of two individual beta grants total**, *including revoked
grants*. The database trigger and transactional server resolver serialize
concurrent inserts through a singleton admission-control lock. Retiring one
account does not silently produce an available replacement seat. No third writer
can be admitted by repeatedly clicking an approval control or concurrently
calling the endpoint. Wider beta expansion requires independent small-group
canary proof and a later explicit founder-governed design/code change.

### Server-only authentication

- Both submitted web cookie and mobile header sessions are verified against
  `auth_sessions`. A stale or conflicting credential cannot be ignored in
  favor of the other. Bare member/role/tier headers grant nothing.
- Founder's own verified session with current DB `admin_role='founder'`
  is required to approve or revoke; password fallback and CTO are excluded.
- State changes require exact-origin evidence and same-origin Fetch Metadata
  if supplied. Unsupported custom-origin iOS schemes remain held.
- A writer may accept only the grant for their **authenticated self**.
  There is no email-based linking, name-based matching or bulk accept route.
- Grant writes remain **OFF by default** behind
  `WRITER_PILOT_GRANT_WRITES_ENABLED`; this environment gate does not
  replace founder approval, code review or release custody.
- The plan endpoint remains private and no-store; missing schema and DB
  failures return refusal rather than a guessed Pro grant.

## Actual file delta

- `database/migrations/20261022000001_writer_studio_pilot_grants_r2.sql`
  review-only model with two-seat cap, immutable grant identity and terminal
  revocation in the current database.
- `lib/writersStudio/pilotGrantServer.ts`: current grant resolver and
  transactional approve/accept/revoke operations.
- `lib/writersStudio/pilotWriteSecurity.ts`: exact-origin and strictly
  authenticated identity/authority.
- `app/api/sovereign/writers-studio/pilot-approval/route.ts`:
  explicit founder approve/revoke, off by default.
- `app/api/sovereign/writers-studio/pilot-accept/route.ts`:
  explicit member-owned accept, off by default.
- `lib/writersStudio/planAccessServer.ts` now reads founder-approved,
  writer-accepted grants rather than the broad CRM beta check.
- R2 focused Jest/handler tests and
  `scripts/writers-studio/pilotGrantPostgresR2Proof.ts`:
  fictional PostgreSQL 16 + actual route function invocations.

## Bounded evidence — 22 October 2026

A dedicated `postgres:16` Docker container was bound to
**127.0.0.1:55439**, with disposable fictional accounts and credentials.
The pre-founder-ID-binding R2 revision's migration and direct handler proof
reported **35/35 PASS** including:

- CRM-only, no approval, no acceptance, missing member, wrong actor and
  nonfounder/direct-insert refusals.
- Eight simultaneous approvals for the same writer producing exactly one grant.
- Exactly two first canary seats; a third candidate refused in server route and
  PostgreSQL trigger, including after two preexisting grants.
- Founder-approved writer-owned acceptance and distinct A/B isolation of
  approvals; reacceptance refused.
- Invalid/cross-site origins, conflicting cookie/header sessions, expired cookie,
  and originless state-change refusal.
- Current-founder loss / inactive contact suspending Pro, founder-only terminal
  revocation, refusal to silently reapprove or accept, and separate B continuity.

After the exact-founder binding was added, **51/51 focused Jest tests passed**
across eight suites, and Writer-specific TypeScript and targeted ESLint passed.
The disposable PostgreSQL proof was expanded to test the new unbound/selected
founder rule; its execution on that final source is **NOT VERIFIED** because
the latest run could not be completed. Do not treat 35/35 on the earlier source
as proof of this latest migration.

These are isolated **direct Next route-handler / actual PostgreSQL** tests
where explicitly observed, not live authenticated public-domain HTTP or
mobile Safari acceptance. The R1 component/badge/plan public preview uses
mocked plan HTTP responses and has not been integrated with accepted member
accounts on a deployed image.

## Outstanding mandatory admission gates

1. **Independent R20 revocation authority and restore anti-resurrection:**
   a snapshot restored from before a revocation can resurrect a revoked grant,
   despite an immutable row/trigger in the CURRENT database. A separately
   witnessed, fail-closed external revocation checkpoint and restore policy
   must be accepted before any real pilot grant or account data is admitted.
2. **Founder identity:** verify Kelly's real signed-in account, independently
   bind it to the `founder_member_id` singleton under founder-controlled ops,
   and prove unauthorized founder-role accounts remain excluded. Migration leaves
   this unset and thus refuses every grant by default. This needs an accepted
   write/restore authority before setting it outside fictional testing.
3. **Invitation evidence:** restricted founder-approved roster, independently
   verified member account control, consented invitation and feedback,
   separate from Co-Lab/Field Lab cohorts. Names/emails are NEVER a database
   grant or source-control roster. Verify two initial accounts individually.
4. **Operational integration:** entitlement checks must be wired to the actual
   advanced MAIA, editorial, Academy and publishing-preview request handlers.
   Current badges/plans are not gates; author-owned Work read/save, source
   ownership, consent and their own release flags remain independent.
5. **Current canonical source:** port R1/R2 bounded delta onto qualified
   Writer P4R1 reader + source-custody code; complete PostgreSQL HTTP,
   chromium, physical Safari, screen-reader, cancellation/retirement,
   old/new-reader and rollback tests. No direct promotion from this review branch.
6. **Held product operations:** original manuscript ingest, cloud sync,
   member PDF/EPUB files, autonomous publisher submission, and the separately
   held Living Compass × Writer Academy candidate #1904 are NOT enabled.
7. **Commerce:** separately verified paid receipt source, owner-operated
   cancellations, revocation and downgrade with preserved authorship; payment
   and public Free sign-up are still OFF.

**Disposition: DRAFT HOLD — review candidate, not a new member entitlement.
No production changes, real invitations, emails, migrations, payments, real
writing, or publishing downloads are authorized by this source.**
