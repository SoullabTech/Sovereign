# Writer’s Studio — exact small-group admission correction

Date: 2026-10-13
State: ISOLATED ENGINEERING CANDIDATE; NOT MERGED OR DEPLOYED
Base: `9f0648d060` (guarded ten-writer and continuous-draft beta candidate)
Integration branch: `fix/ws-beta-integrated-small-group-20261013`
Admission correction originally committed as isolated `22f8a3ada8` and cherry-picked here as `6e7d34af27`; only the restricted-entry UI/proxy gate is ported from the separate `c220476355` candidate.
Parent release work unit: `v2-writer-s-studio-small-beta-launch-mv5adx5f`
Tracker: https://github.com/SoullabTech/Sovereign/issues/1800

## Narrow failure addressed

The preexisting `writersStudioBetaAccess` check accepted *any* member-linked
`ops_contacts` row whose contact type was `beta_tester` and whose pipeline
stage was `active`. That broad Soullab status is not proof of the founder's
more specific Writer’s Studio small-group approval.

## Narrow correction

For an ordinary writer, admission is now an **intersection**:
1. A member ID independently derived from the verified server-side session.
2. A currently active, member-linked `ops_contacts` beta-tester record.
3. An **exact verified member ID** in server-only `WRITERS_STUDIO_BETA_MEMBER_IDS`.

The existing `WRITERS_STUDIO_RESTRICTED_BETA=true` feature switch still
controls whether this additive beta restriction is enabled. The new list is
not a browser flag, not a subscription role, not a wildcard and not a
separate source of ownership. Missing/malformed/duplicate lists deny all
ordinary writers. A verified founder/CTO retains the separate witness role
under the previously implemented server-side admin-role check.

No ID list or private tester roster is stored in this repository. Populate
the protected runtime configuration **only after** exact account and invitation
authorization; an invitation or entitlement is never inferred from a name.

## Synthetic focused proof

`./node_modules/.bin/jest --runInBand --silent lib/writersStudio/__tests__/betaAccessServer.test.ts lib/writersStudio/__tests__/restrictedBetaAdmission.test.ts`

2026-10-13 Mac Studio isolated checkout: **2/2 suites, 30/30 tests PASS**.
Covers absent/wildcard/invalid/duplicate list, nonmatching exact member,
ordinary active tester without Writer’s Studio grant, allowlisted inactive
tester, positive authorized member, query member-ID binding, verified founder
witness and database failure (propagated to proxy fail-closed handler).
These use fictional IDs and mocked database rows. No real member bytes.

## Open integration/security decisions (HOLD)

- This integration branch is based directly on guarded Writer’s Studio
  candidate `9f0648d060` and ports only the restricted-beta entry pieces from
  `c220476355`. It has **not** been merged, rebuilt as a release image, or
  reconciled with the separate Review rollback and R20 custody corrections.
  Do not promote it merely because focused tests passed.
- Independently inspect session and member-ID derivation, grant changes, revoked
  sessions, role replacement, cross-tab account switching and all Studio
  entry points on the exact image. Shared manuscript APIs intentionally remain
  governed by their own per-record ownership rules.
- Witness feature switch ON, absent/unauthorized grant DENY, invited-grant
  ALLOW, founder witness, revocation and mobile WebKit on actual external
  authenticated sessions, without disclosing the protected IDs.
- Separate R20 Source vault restore/erasure, Review rollback and human Class A
  review remain mandatory before the two-person canary.

This patch authorizes **no** merge, production configuration update, data
migration, manuscript read, invitation or public beta.
