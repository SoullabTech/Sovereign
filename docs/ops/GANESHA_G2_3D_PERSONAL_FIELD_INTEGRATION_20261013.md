# Ganesha G2-3D — Personal Field reconciliation and fictional responsive preview

**Date:** 2026-10-13
**Parent SHA:** `e46cb00bb9da3f85fb0d10f331b5bd75f2bf338b` (source-held G2-3C).
**Branch:** `feature/ganesha-pro-g2-3d-personal-field-20261013`.
**Status:** isolated engineering source and synthetic checks, **NOT member release**.
**Revision-matched review SHA:** record after governed commit and GitHub publication.
**Production, migrations, subscriptions, member data, MAIA and source merge:** HOLD.

## Constitutional product boundary

Ganesha Life Flow / Personal Portal belongs to every Soullab **individual**;
no practitioner-shaped record, paid tier, Co-Lab or professional permission is
a condition of individual identity. Pro Studio remains an additive practitioner
capability, subject to independently enforced authorization. Personal Field
events, chosen people, authored notes and attention have no inferred importance
score, automatic relationship profile, clinical interpretation or member stage.

**Historical Personal Studio records remain in custody, with their original
IDs and storage owner.** G2-3D is read-only reconciliation; there is no backfill,
ownership conversion, account creation, copy of member content between tables,
professional lookup by email, or data migration.

## Implemented source (source-HELD)

- `lib/ganesha/personalFieldIntegration.ts`: exact, independently member-scoped
  SQL for **member-native Events and People** and **one exact active historical
  Personal Studio**'s Events and People; full 4-table capability probe; bounded
  read of G2-2 owner-verified Decisions, Changes, Process, Notes and Attention
  and G2-3C native Notes/Attention. No generic `/api/studio/field` calls.
- `composeVerifiedPersonalField`: refuse contradictory duplicate row identities,
  invalid timestamps, and historical rows with ambiguous or suspended owner.
  Return `member-native` versus `historical-personal` provenance for each
  Note, Event and chosen Person. Include the original row ID unchanged plus a
  source-qualified UI key. Do not invent a unified Attention ordering: the
  two independently authored sequences remain distinct. Never treat absence
  from the 25-row bounded query as history being deleted or not existing.
- `app/api/ganesha/personal-field/overview/route.ts`: the new bounded
  **read-only** composite endpoint. It invokes `admitMemberField` which still
  uses `isG2MemberAuthoringReleaseAdmitted() => false`. Live requests therefore
  refuse with `503 authorization_held` without reading member content.
  Synthetic route tests mock the admitted state to verify intended behavior,
  source errors and no-store caching. Actual member-facing activation is not
  authorized by schema presence, a tier, an account mode, URL or cookie claim.
- `lib/ganesha/memberFieldApi.ts`: returns the already authenticated
  `IndividualContext` to the admitted code path without accepting a
  practitioner/customer ID from a caller. Existing G2-3C routes continue to
  use the same session-derived `memberId`.
- `components/ganesha/PersonalFieldReadOnlyPreview.tsx`: a **not mounted**
  React preview with warm light background, larger readable type, explicit
  read-only and incomplete-history copy, the four orientation questions,
  source-distinguished Attention, Events and People chosen by the member.
  No forms, buttons, deletion or provider links. No inference, score or paywall.
- No installed UI route, House navigation link, Pro Studio conversion or
  subscription checkout changed.

### Timeline and authorship truthfulness

Existing `/api/studio/field/events` uses the server's current day, which does
**not** establish a member's own day. G2-3D retains and displays the event's
UTC timestamp; a real member-local Today/calendar interface requires an
explicit timezone capability. A person shown in Ganesha is only a name/note
the individual previously authored; the platform must not infer who matters.

### Read consistency limitation

The current view uses individually owner-scoped statements, not a proven
single-transaction repeatable-read snapshot across every collection.
Contemporaneous edits can make a composite momentarily uneven; they must
not be treated as permission to invent joins or an excuse to broaden access.
Version-matched transactional consistency is an additional production gate.

## Executed evidence on authorized Mac Studio

**Jest and type checks:** 193 focused tests PASS across 21 suites spanning
G1, G2-1, G2-2, G2-3A, G2-3C, and G2-3D; TypeScript PASS.
New G2-3D 29 tests cover composition, verified metadata and historical
status, native/legacy duplicate refusal, source-bound Attention ranking,
no false Today, explicit 503 on missing schema/release refusal, and static
read-only preview contracts.

**Exact new SQL on disconnected PostgreSQL16:** The source SQL exported by
`scripts/witness/g2FieldIntegratedSql.ts` ran under
`scripts/witness/g2FieldIntegratedPg16.py`. PostgreSQL
`postgres:16-alpine` was preinstalled, Docker `--network none --rm`,
no mounts, no real records, no client data, no credentials or external calls.
It applied the original SHA-pinned G2-3A proposal (SHA-256
`f46b12d808e14a4fabe273666d7358e7a59df24e4c633505f7ceeef2d0337465`)
**only** to a fictional database. **Five groups PASS**: 4-table capability
before/after, member-native Event/People isolation, exact active member-owned
historical reference, source refusal after suspension, and source refusal
after attempted historical member reassignment. Container cleaned.

**Fictional WebKit preview:** HTML generated by
`scripts/witness/g2FieldPreviewFixture.tsx`, styled using the repository's
Tailwind CSS, and loaded with locally installed WebKit. At **390 × 844 mobile**
and **1365 × 900 desktop**, there was no horizontal overflow and the expected
headings, fictional content, and lack of editing/destructive controls passed.
Screenshot review found a mobile dark-background/low-contrast section below
the first viewport; the preview main was then given an explicit light
background and `min-h-screen`. Repeated screenshot review and browser checks
passed. Measured sample note text contrast was **16.03:1** on both viewports.
These are **static fictional visuals, not authenticated browser/mobile beta
acceptance** and not screenshots of actual member content.

## Outstanding gates — separate explicit acceptance

1. **The G2-3C hard source HOLD remains**, and public schema has no installed
   `personal_member_id` for Field Notes/Attention/Events/People. No one can
   use the new composite endpoint in public production.
2. **G2-3A migration** requires lock-budget evidence, old-reader and
   version-matched installed-schema validation, signed deletion custody,
   consent/privacy review and explicit founder approval.
3. **R20–GANESHA–01 (#1814)**: Ephemeral G2-3B signing and backup restore
   proofs do not establish independently durable signer/high-water,
   authenticated deletion gesture/outbox, full asset coverage or zero
   resurrection of real storage. Destructive member-native APIs remain
   absent, but old Practitioner Studio has legacy DELETE routes.
4. **Browser/authenticated integration:** real signed-in fictional staging
   accounts, member mode, no-member, historical, suspended, ambiguous, Pro
   coexistence and keyboard/screen reader/mobile acceptance still required.
   Offline static WebKit does not satisfy this.
5. **Additional member-native authored Events and People** require their own
   creator/edit/withdrawal contracts, member timezone and privacy acceptance;
   this candidate contributes only source-verified **read** integration.
6. **Continuity and scope:** broader historical assets and MAIA memory,
   provenance/quarantine semantics, client/Relationship Space consent,
   cross-version READ/WRITE continuity, paged history beyond LIMIT 25 and
   snapshot consistency remain explicit, not implicitly accepted.
7. **G1/G2 human review, current-trunk reconciliation and standalone
   Ganesha/Pro commercial entitlements (G3)** remain unapproved.

**Disposition:** G2-3D source integration / fictional presentation candidate
ready for independent review. Do not merge, install, activate, bill or deploy.
