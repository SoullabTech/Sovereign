# Ganesha G2-3E — Fictional session-backed PostgreSQL boundary rehearsal

**Date:** 2026-10-13
**Authority:** source-only, isolated, uncommitted engineering test; **no beta or production release**.
**Candidate:** `/Users/soullab/ganesha-pro-g2-3d-personal-field-20261013`, now at G2-3D held source commit `1a8b15cfee` (G2-3C parent `e46cb00bb9`). This G2-3E addendum is uncommitted.
**Actual member release gate:** `isG2MemberAuthoringReleaseAdmitted() => false` (unchanged).

## Outcome

- **PASS — 17/17 isolated API integration tests**, with the real `getMemberIdFromRequest` session lookup, real `resolveIndividualContext` ownership resolution, the actual Notes/Attention/overview route handlers, and actual PostgreSQL queries.
- **PASS — 95/95 focused unit/regression tests across 10 suites** (G2 identity, session, continuity, authoring, integration preview and admission).
- **PASS — scoped TypeScript check** of G2-3E changed code and directly imported candidate dependencies (`./node_modules/.bin/tsc -p scripts/witness/fixtures/tsconfig.g2e.json --noEmit`). The complete monorepo typecheck **fails with extensive unrelated errors**; therefore no clean global typecheck or release-build claim is made.
- The G2-3D source-exact 5/5 PostgreSQL 16 checks and synthetic browser preview remain prior, separately recorded evidence.
- These are NOT a real deployment, actual signed-in browser acceptance, a production schema installation, nor a test of independently durable R20 deletion authority.

## Fixture isolation and commands

`python3 scripts/witness/g2EAuthenticatedPg.py` provisions a throwaway local PostgreSQL 14 instance using `initdb` and `pg_ctl`, with **Unix-domain socket only** (`listen_addresses=''`; no TCP listener). A private temporary directory contains the socket and all database files. The test database is addressed through an explicit `DATABASE_URL` passed only to the child Jest process. All credentials, member IDs, practitioner IDs, session tokens, notes, chosen people, and events are fictional. No external endpoints, user files, real member accounts, application secrets, or existing database are read. PostgreSQL is stopped and the temporary directory removed in `finally`.

The fixture applies the exact proposal `scripts/witness/fixtures/G2_3A_PROPOSED_SCHEMA_UNAPPLIED.sql` **only** in the disposable database; SHA-256 must equal `f46b12d808e14a4fabe273666d7358e7a59df24e4c633505f7ceeef2d0337465`. A safety precondition requires the real source-level admission gate to still return false. **Jest alone must not be used as evidence**: the integration test refuses to run unless `G2E_DISCONNECTED_FIXTURE=yes` and `DATABASE_URL` points to that temporary Unix-socket fixture.

Only two surfaces are simulated:
1. Next's request-scoped `cookies()` accessor, populated with the synthetic test cookie jar.
2. `isG2MemberAuthoringReleaseAdmitted()` in the Jest process, to test what a hypothetical separately authorized release would permit. Real source remains closed.

## Witnessed acceptance boundaries

1. No credentials, arbitrary member claim, expired or revoked session, or identity mismatch → 401; active source gate → 503 `authorization_held`.
2. Both cookie web-session identity and Safari/iOS fallback header session are backed by the fixture's `auth_sessions` table.
3. Fictional Member A has **no** practitioner record and can read/author only member-native Personal Field entries; Member B owns native and one exact historical Personal Studio record plus an independent Professional row.
4. A cannot read/edit B, B cannot read/edit A; injected `memberId`, `personal_member_id`, `practitionerId`, paid/pro claims and forged references never transfer ownership.
5. Notes can be created, reopened, revised by the owner and not by the other member. Attention references are revalidated against personal authorship; unauthorized placement and repositioning refuse.
6. Suspended, reassigned and ambiguous legacy ownership withhold affected historical records without erasing member-native content or inferring Pro access.
7. Missing schema, missing Event table and unavailable session table yield 503/error rather than a fabricated empty Personal Field.
8. A revoked session cannot continue reading/writing. No member-native DELETE routes were added; R20 remains held.
9. Source-layer authoring remains held regardless of installed synthetic schema.

## Additional G2-3E finding and narrow source amendment

The generic `getMemberIdFromRequest` resolver prefers a valid web cookie to an `x-session-token` header. With two valid tokens belonging to **different** members, it can silently select the cookie's account during an account switch. This is **not proof of unauthorized access** because the cookie is valid, but it is a Personal Field misattribution risk.

An isolated adjustment in `lib/auth/individualContext.ts` now checks an alternate header token **only when both credential sources are present and differ**. It requires the alternate token to resolve through `auth_sessions` to the **same** authenticated member or returns null before examining practitioner history. If both credentials represent the same member, continuity is preserved. No changes were made to the shared generic session resolver, browser login flow, or public product.

Regressions were added in `lib/auth/__tests__/individualContext.test.ts` and the PostgreSQL fixture suite.

## Incomplete gates — HOLD

- Authenticated **full HTTP/browser/device** staging with two fictional accounts, genuine signup/sign-in/sign-out and session expiration; tab/account switching, cookie and header transport, keyboard/mobile review.
- Production-version PostgreSQL schema readiness, migration lock budget and old-reader compatibility under installed-schema rehearsal.
- R20 durable signed deletion authority, actual backup custody, recovery/no-resurrection, historical asset coverage and erasure policy.
- Snapshot-consistent composite reads, bounded pagination past 25, local timezone, member-native Event/People authoring, explicit delete/withdrawal contracts and relationship consent.
- Independent human privacy/security review, commit/revision custody, founder release decision, actual beta deployment.

**Disposition:** G2-3E fictional auth + PostgreSQL boundary PASS; source-level safeguard candidate ready for independent review. **No merge, migration, production data, beta opening, payment, deletion, or restore authorized.**

## October 15 — exact source custody and independent technical repeat

This G2-3E source was copied, without altering the original author working tree,
into isolated branch `fix/ganesha-g2e-session-owner-20261015`, parented on
G2-3D immutable commit `1a8b15cfeed95c24b7346a0c92354f98d95e4cd2`.
The final review commit ID is recorded separately in GitHub after normal hooks.

Fresh execution on the isolated copy:

- Exact historical G2-3A proposed SQL SHA-256 verified unchanged.
- **17/17** executable session-backed PostgreSQL 14 fixture tests PASS via the
  actual route/service SQL against fictional members; Unix-socket fixture
  shut down and temporary data removed.
- **84/84** separately selected Jest tests PASS across nine suites for
  individual identity, shared-session checks, member authoring, historical
  continuity, release refusal and Ganesha preview. The two counts cover
  different test selections; do not sum them to imply a single run.
- Scoped TypeScript PASS and governed application-wide TypeScript
  **no-regression PASS (222 existing diagnostics vs 239 baseline)**.
  This does **not** assert an error-free monorepo or release build.
- No production migration, account contents, secrets, billing, flags,
  Ganesha House navigation or member data were modified.

**Release law unchanged:** `isG2MemberAuthoringReleaseAdmitted()` continues to
return `false`. Neither these synthetic fixture successes nor this isolated
commit authorize schema installation, public beta, model calls, signed deletion
restore, independent human Class A acceptance or production deployment.
