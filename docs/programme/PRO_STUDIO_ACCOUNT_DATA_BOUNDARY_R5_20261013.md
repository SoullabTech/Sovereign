# Pro Studio / Soullab Home Account Boundary R5
Date: 2026-10-13 · **ISOLATED LOCAL CLASS A CANDIDATE — NO RELEASE AUTHORITY**

## Custody and scope
- Protected default/release baseline: `clean-main-no-secrets@2e836abc32853bf01bf8256062b561c2b7406378`.
- Prior held identity correction: `829c328374c7f5fc717f1b30f4da3bf2ae89f921`.
- Prior held security amendment: `f21bcdd5dbd059b8487fb417a40fd4ecadc752c8`.
- Exact 19-file R4 staged source patch imported into new R5 branch before changes: SHA-256
  `1e5a1b841977edd624286d4921cc0c57b79c0dd6d6b285b0307f7048e9fe4b4b`.
- Original R4 worktree remains unchanged; R5 is a separate T7 candidate.

## Explicit trust boundary
The server can verify an HttpOnly session, session revocation, and its member
identity. It **cannot cryptographically verify localStorage contents or that a
particular browser tab has reconciled its previous owner's local materials**.
Earlier R4 ledger was one-time and atomic yet direct same-origin JavaScript
with a valid A cookie could still mint a view witness while B's cache existed.

R5 therefore **removes** the unused R4 Home/House one-time proof and planned
`account_home_view_admissions` migration entirely. No new schema is required
for R5. Home and House always produce neutral server-rendered HTML/RSC, even
for a valid session with an `entry` URL. They never render a private Work,
name, or HousePreferencesProvider server-side.

A session-authenticated `POST /api/auth/home-view` returns private,
no-store **JSON** with only that server member's name, two Works and House
preferences. `expectedMemberId` is a client consistency check, **not auth**;
the server ignores client-supplied identity for database ownership. A
same-origin script holding A's session still may request A's JSON. This is
not an XSS defense, a cryptographic device identity attestation, or a
guarantee against a compromised origin.

The client renders the existing complete House visual/workspace only after:
1. GET /api/members/session verifies cookie identity and onboarding;
2. locally stored member ID aliases and active-account marker agree;
3. first-time browser with no prior owner receives a **human Continue** gesture;
4. the scoped account marker is written to the **verified member** namespace;
5. server-protected JSON is retrieved and owner validated;
6. local account state is checked again after network completion.

## Local browser custody and cross-tab behavior
New R5 local state resides under `soullab:accounts:v1:<verified_uuid>:...`
plus a neutral active-account marker. This namespace is for **new House
navigation/display preferences**, not copies of MAIA conversation, journals or
hidden clinical data. Existing `beta_user`, `explorerId`, journal and MAIA
legacy data are never silently moved, deleted or appropriated as another
member's history. They are checked for conflict and remain in place pending
a member-authorized recovery process.

On identity-bearing `storage` events, broadcast account-change messages,
page visibility/focus/pageshow, a mismatched owner hides the private client
view and enters the neutral conflict surface. An in-flight private response
must be rechecked at receipt before any Work appears.

## Acceptance evidence and limits
- Scoped R5 Jest tests and existing auth/Reflect regressions PASS.
- WebKit mobile with fictional PostgreSQL16: Home/House initial SSR lacks
  protected Work in normal, malformed and old-nonce routes; aligned A/Home
  and B/House see only their own fictional Work **after private JSON**;
  A-cookie/B local cache redirects to neutral conflict without erasure;
  cookie-only first use asks for explicit human Continue before any private
  view; mismatched MAIA/sign-in unchanged; sign-out explicitly revokes A.
- Cross-tab A→B after private view shows conflict and hides previous Work.
- In-flight JSON held during cross-tab A→B: response suppressed, conflict.
- Direct same-origin scripted A JSON read under valid A cookie: allowed by
  server authentication, but **no A Work appears in Home/House document HTML**.
- Real PostgreSQL restore rehearsal and exact release-build qualification:
  record later against frozen R5 source before claiming PASS.
- Global/root providers, MAIA entire voice/memory conversation, physical
  Safari, offline Cabin mode and legacy local unscoped private data migration
  are NOT accepted by this limited work.
- Broader TypeScript baseline remains separately unresolved.
- R20 historical restoration authority is independently held; eliminating
  the R4 proof ledger does not imply deletion/revocation recovery guarantees
  for all Soullab records.

## Release hold
No production source, deployed image, operator feature flag, paid Reflect,
billing, tester invitations, member data, PostgreSQL migration, or
persistent account data are changed or authorized by this document.

Before beta: independent qualified human Class A security/privacy review,
founder visual acceptance of R5 neutral conflict/House continuity, full
staging and recovery checks, full-project typecheck/no-regression disposition,
actual image digest/ingress no-store and rollback, consented tester cohort,
separate founder and release-operator exact-image GO/NO-GO.

Tracker: https://github.com/SoullabTech/Sovereign/issues/1816
