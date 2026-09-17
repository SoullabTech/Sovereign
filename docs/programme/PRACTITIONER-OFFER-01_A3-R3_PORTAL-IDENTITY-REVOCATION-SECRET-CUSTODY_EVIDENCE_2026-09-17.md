# PRACTITIONER-OFFER-01 · A3-R3
## Portal Identity, Revocation & Secret Custody — Evidence Freeze

**Date:** 2026-09-17  
**Authority:** read-only investigation and contract freeze  
**Feature branch:** `feature/practitioner-offer-a3-r3-portal-custody-20260917`  
**A3-R3 opening SHA:** `c0b85aac3fd77a6518c10da8530036723cf4bbc1`  
**Canonical SHA:** `7ee173db0d54f7340353316d11729b88480434a5`  
**Canonical merge base:** `7ee173db0d54f7340353316d11729b88480434a5`  
**Data status:** repository evidence and synthetic/model data only; no real client data was used.

## Verdict

**STOP — the client portal is not yet one revocable, slug-bound identity system.**

The current implementation has useful controls: invite plaintext is not stored in
`client_invites`; password hashes use salted scrypt; A3-R2 composite relationship
constraints bind invitations to the correct practice and client; portal cookies are
HTTP-only; and messaging tokens have explicit expiry/revocation fields.

Those controls do not close five material boundaries:

1. claim and sign-in do not prove that the request slug owns the relationship;
2. invite consumption is check-then-update and therefore replay/race susceptible;
3. client portal sessions are stateless for 30 days and cannot be centrally revoked;
4. dedicated secret configuration fails open to shared or public defaults;
5. several privileged portal mutations authenticate only caller-supplied IDs.

No repair, migration, PR, merge, or deployment is authorized by this record.

## Identity authorities found

| Authority | Credential | Scope actually enforced | Revocable | State |
|---|---|---|---|---|
| Portal claim `/claim` | invite code + supplied email/password | invite tuple; **not URL slug** | invite after update only | PARTIAL / STOP |
| Portal claim `/invites/claim` | invite code + booking email/password | invite tuple; **not URL slug** | invite after update only | DUPLICATE / STOP |
| Client sign-in | portal email/password | global email lookup; **not URL slug** | no | STOP |
| Client cookie | HMAC payload | payload slug only; no live relationship check | browser-local sign-out only | STOP |
| Portal messaging | `client_message_tokens.token` | client/practice through token lookup | yes, but not called on closure | PARTIAL / DORMANT issuance |
| Legacy portal token | `client_portal_tokens` | no live application caller found | unknown | DORMANT |
| Practitioner portal writes | member session on some routes | correct where used | yes | WORKING/PARTIAL |
| FAQ/settings writes | caller-supplied practitioner ID | ID/row equality only | n/a | STOP |

## Route-level evidence

| Route / mutation | Intended actor | Current proof | Finding |
|---|---|---|---|
| `POST /api/portal/[slug]/claim` | invited client | code, recovery email, password | Invite query returns the real slug but never compares it to `[slug]`; cookie receives request slug. |
| `POST /api/portal/[slug]/invites/claim` | invited client | code, booking email, password | Does not read `[slug]`; credentials and invite are updated in separate non-transactional queries. |
| `POST /api/portal/[slug]/client-auth/signin` | claimed client | email/password | Global `portal_email` lookup; selected practitioner slug is never compared to request slug. |
| `POST /api/portal/[slug]/client-auth/signout` | signed-in client | none required | Clears only the current browser cookie; copied tokens remain valid. |
| `GET /api/portal/[slug]/my-chart` | signed-in client | stateless portal cookie | Only live consumer of `requireClientSession`; no DB relationship/status revalidation. |
| `POST /api/portal/[slug]/messages` | message-token client | bearer message token | Correctly compares token-derived practitioner to slug-derived practitioner. Separate authority. |
| `POST /api/portal/[slug]/sliding-scale` | public or token client | public contact data or message token | Public submission is intentional; token path verifies practice equality. |
| `POST /api/portal/[slug]/book` | public visitor | public form + slug/service tuple | Public intake is intentional; separate legacy client/session authority remains outside this unit. |
| `POST /api/portal/[slug]/faq/list` | practitioner | body `practitionerId` only | Unauthenticated creation for any known practitioner ID. |
| `PUT/DELETE /api/portal/[slug]/faq/[id]` | practitioner | body `practitionerId` equals row value | Unauthenticated update/delete; URL slug is ignored. |
| `POST /api/portal/[slug]/faq/reorder` | practitioner | body `practitionerId` only | Unauthenticated reorder; URL slug is ignored. |
| `PATCH /api/portal/[slug]/settings` | practitioner | body ID agrees with slug | Unauthenticated portal publish/draft mutation. Agreement is not actor authentication. |

Public booking, inquiry, chat, and sliding-scale submission must not be made private
merely because they mutate state. They need abuse controls, validation, and exact
practice binding. Configuration writes require authenticated practitioner ownership.

## Frozen falsifiers

### F1 — wrong-slug invite claim

`app/api/portal/[slug]/claim/route.ts` selects `p.slug AS practitioner_slug`
but never compares it with the route slug. It then signs a cookie containing the
request slug and the invite's client/practitioner IDs. A valid synthetic invite for
practice A can therefore be submitted at practice B's slug.

The duplicate `/invites/claim` route does not read route parameters at all. The UI
currently calls this duplicate route, so neither path establishes slug ownership.

### F2 — wrong-slug sign-in

`client-auth/signin` searches globally by `portal_email`; its legacy `OR` join can
match either practitioner record or member ID. Although it selects the actual slug,
it never checks it. Valid credentials can therefore create a cookie under a different
portal slug.

### F3 — non-atomic one-time claim

Both claim routes read `status = unused` in application logic and later update the
row without `AND status = 'unused'`, row locking, or affected-row verification.
Concurrent claims can both pass the precondition. The `/invites/claim` variant also
updates client credentials and invite state outside a transaction.

### F4 — session revocation absent

`maia_client_portal` is a signed, stateless 30-day token containing slug, client ID,
practitioner ID, issue time, and expiry. Validation checks signature, expiry, and
payload slug only. It has no session ID, server-side row, credential/session version,
or current relationship-status check.

Client pause/completion/archive, relationship end, password change, invite revocation,
and practitioner-wide emergency revocation cannot invalidate an already copied token.
Studio archive only changes `practitioner_clients.status`; it does not end the
relationship or revoke any portal/message access.

### F5 — fail-open secrets and weak invite custody

Client session signing uses:

`CLIENT_SESSION_SECRET || PHI_ENCRYPTION_KEY || 'dev-client-secret'`.

Invite hashing uses:

`PORTAL_INVITE_PEPPER || 'maia-sovereign-portal'`.

The repository contains no tracked configuration contract declaring either dedicated
variable. This does **not** prove production is unset; it proves production custody is
not repository-witnessed. The fallbacks collapse domain separation or accept a public
constant outside an explicit development-only branch.

Invite codes contain 48 random bits and may remain valid for 14 or 90 days depending
on issuer. With a known default pepper, a leaked hash table permits offline search of
that bounded space. Raw code and client email are placed in the claim URL; email is
therefore exposed to browser history and ordinary URL telemetry. Some notification
and booking logs also print client email.

### F6 — privileged writes trust body identity

FAQ POST/PUT/DELETE/reorder and portal settings PATCH do not authenticate a member.
They treat a caller-supplied practitioner ID—or agreement between that ID and a public
slug—as authorization. These are direct privileged-write containment failures.

### F7 — parallel token authorities

Portal chart access uses the HMAC cookie. Messaging uses a separate database bearer
token stored in plaintext. A legacy `client_portal_tokens` table also remains. No
application caller was found for message-token issuance or either revocation helper,
so that path is classified as dormant/parallel rather than proven live. Relationship
closure calls none of the available revocation helpers.

## Evidence-derived security laws

1. **Slug is a locator, never an authenticator.** The canonical practice record must
   be resolved from slug and joined to the authenticated/invited relationship.
2. **One claim authority.** Claim must atomically consume exactly one unused,
   unexpired invite and create/update credentials in the same transaction.
3. **One client-session authority.** Every protected request must prove a live,
   unrevoked server-side session and an allowed current relationship.
4. **Closure revokes access.** Ending/archiving a relationship must revoke portal
   sessions, unused invites, and any scoped bearer tokens in one defined operation.
5. **Secrets fail closed.** Dedicated production secrets are mandatory, domain
   separated, rotatable, and never replaced by public constants.
6. **Bearer material is stored as a hash.** Raw invite/session/message tokens are
   shown or transmitted only when necessary and never persisted or logged.
7. **Practitioner writes derive identity from authentication.** Body IDs may narrow
   a mutation but can never authorize it.

## Exact negative-test plan

| Test | Expected result |
|---|---|
| Claim practice-A invite at practice-B slug | 404/403; no credential, invite, or session mutation |
| Sign practice-A client in at practice-B slug | generic 401; no cookie |
| Submit two concurrent claims for one invite | exactly one success; loser 409/410; one credential version |
| Fail after client credential update during claim | transaction rolls back both client and invite |
| Start server in production without dedicated session secret | startup/config validation fails |
| Start server in production without invite pepper/key | startup/config validation fails |
| Use portal token after password reset | 401 |
| Use portal token after relationship `ended` or client archived | 401 |
| Use portal token after practitioner emergency revoke-all | 401 |
| Use old token after signing in again under rotate-all policy | 401 |
| Create/update/delete/reorder FAQ without practitioner auth | 401 |
| Authenticated practitioner mutates another practice FAQ/settings | 404/403, zero rows changed |
| Claim URL/log capture test | no client email; no bearer value in application logs |
| Database inspection of active message/session tokens | hashes only; no raw bearer values |

## Bounded repair sequence

### A3-R3-R1 — Canonical Claim & Slug Binding

- choose `/claim` as the sole claim endpoint and retire/redirect the duplicate;
- bind `slug -> practitioners.id/member_id -> invite -> client` in one query;
- atomically transition `unused -> claimed` with expiry in the mutation predicate;
- verify exactly one affected row and transact credential creation with consumption;
- bind sign-in to the same canonical practice relationship;
- add wrong-slug, replay, concurrency, and rollback negative fixtures.

### A3-R3-R2 — Privileged Portal Mutation Containment

- apply member authentication and practitioner ownership to FAQ and settings writes;
- remove body-supplied identity as authority;
- bind FAQ item reads/writes to the route's resolved practice;
- extend the private-route guard so these regressions fail statically.

### A3-R3-R3 — Revocable Client Sessions & Closure

- introduce hashed server-side client sessions with ID, client/practice tuple,
  issued/last-used/expiry/revoked timestamps, and credential/session version;
- revalidate live relationship state on protected requests;
- define password reset, sign-out-all, archive/end, invite revoke, and emergency revoke;
- make closure update relationship state and revoke all access atomically;
- reconcile or retire message and legacy portal token authorities.

### A3-R3-R4 — Secret & Bearer Custody

- enforce dedicated, fail-closed, rotatable production keys;
- increase invite entropy and unify invite lifetime policy;
- hash all persisted bearer tokens;
- remove client email from claim URLs and sensitive values from logs;
- document key ownership, rotation, overlap, incident, and recovery procedures.

## Exit condition

## Validation record

- `check-private-routes`: PASS.
- `check-member-owned-boundary`: PASS when invoked as
  `node --import tsx scripts/check-member-owned-boundary.ts`; the npm wrapper could
  not open tsx's local IPC pipe in this execution sandbox (`EPERM`).
- `check-internal-imports`: completed with the existing warn-only inventory of 44
  unresolved aliases; this documentation-only unit introduced none.
- `git diff --check`: PASS.
- Secret configuration census: no tracked declaration of `CLIENT_SESSION_SECRET` or
  `PORTAL_INVITE_PEPPER` found. This is a repository-contract finding, not a claim
  about the unobserved production environment.

A3-R3 closes as an evidence unit when this record is committed and its branch is
published for review. Repairs remain unopened. Commercial or production witnessing
remains prohibited until the four bounded repair units and their negative controls pass.

**A3-R3 STATUS: STOP — EVIDENCE FROZEN; NO REPAIR AUTHORITY SPENT.**
