# Ganesha G2-3C — Member-owned Personal Field reading and authoring

**Date:** October 13, 2026
**Engineering status:** isolated candidate, synthetic-witnessed.
**Exact parent:** `785a2059d746194abe0eea167d14379823c08f3d` (G2-3B signed restore synthetic witness).
**Candidate branch:** `feature/ganesha-pro-g2-3c-member-authored-20261013`.
**Review SHA:** obtain from the normal governed commit.
**All public launch, installed migration, payment, source merge, member-data and MAIA runtime actions remain HOLD.**

## Product and ownership law

Ganesha Life Flow / Personal Portal is for **individuals**. Personal Field authorship belongs to the authenticated Soullab **member**, even with no practitioner-shaped record, professional tier, client roster, team, or Relationship Space. Professional capability belongs to Pro Studio and is additive only after separate authorization. Neither schema presence nor a paid tier confers member-authoring release authority.

The G2-3C source implements a narrowly limited **Notes + Attention** first slice, not the complete Ganesha experience or the installed Personal Studio user interface. Events and People are separate subsequent work, as are Personal Decisions/Changes editing, Dream, Journal, Calendar, MAIA memory, and professional/client crossings.

## Implemented, source-held endpoint contracts

| Path | Supported | Authorization and data scope |
| --- | --- | --- |
| `GET /api/ganesha/personal-field/notes` | Bounded read, 25 most recent member-native notes | Verified session member; `personal_member_id=$1`, NULL practitioner/team; no implied completeness |
| `POST /api/ganesha/personal-field/notes` | Member-authored note | Section + trimmed 1–2000 character body only; `INSERT…SELECT` resolves member in DB; no owner claims |
| `PATCH /api/ganesha/personal-field/notes/[id]` | Author correction/placement | Only section/body; SQL exact member + NULL practitioner/team; no source erasure |
| `GET /api/ganesha/personal-field/attention` | Bounded read with current verified labels | Member-native rows; personal Decision/Change joins independently revalidate member owner, NULL practitioner/client/team; revoked source neutralizes title and reference |
| `POST /api/ganesha/personal-field/attention` | Place authored note or own Decision/Change | `INSERT…SELECT` with source-owner `EXISTS`; free note is authored label, referenced title is selected from owned current source; no client/team/professional inference |
| `PATCH /api/ganesha/personal-field/attention/[id]` | Reposition member-owned Attention | Only field and authored position; same member and NULL practitioner/team SQL ownership |

**There is intentionally no DELETE route.** Destructive field erasure cannot be considered safe until R20 proves independently durable signed deletion authority, honest withdrawal, custody coverage and zero resurrection.

## Explicit two-part fail-closed release hold

1. `lib/ganesha/g2MemberAuthoringRelease.ts` returns **false** for real source execution. This is not controlled by an HTTP header, cookie, environment variable, membership tier, caller ID or completed migration. Synthetic Jest route tests mock this pure function to separately test the prospective behavior. An additional test imports the real function to verify it remains false.
2. `lib/ganesha/memberFieldAuthoring.ts` requires a PostgreSQL catalog witness for both member-owner columns, relaxed practitioner NOT NULL, matching G2-3A member FKs and one-owner CHECKs. If the installation is missing/incompatible, the response is explicit **503 `migration_held`** rather than a fabricated empty field or a newly created practitioner record. Authentication failure is 401.

Because the source authorization gate is HOLD, even a future accidental installation of the proposed schema cannot make this branch's routes usable. Any future admission must be an independently reviewed, separately authorized source change, not a support/operator toggle.

The endpoints return `Cache-Control: private, no-store`. They never log member-written text, SQL-driver free-form error strings, account IDs or submitted source titles on failure. Invalid owner, client, practitioner and team fields are rejected rather than accepted silently.

## Evidence

**Jest/TypeScript (isolated worktree):** 164 passing focused/security regression tests over 18 suites, including existing G1/G2 identity/professional boundaries and new G2-3C cases. TypeScript PASS. New route negatives exercise unsigned session, release HOLD, absent/incompatible schema, forged owner/client/team fields, cross-member read/write, foreign notes, source-label spoofing, source revoke, and deletion-route absence.

**Exact PostgreSQL 16 fixture:** `scripts/witness/g2MemberAuthoringSql.ts` extracts the same SQL constants executed by the new routes. `scripts/witness/g2MemberAuthoringPg16.py` starts a disposable `postgres:16-alpine` with `--network none`, no mounts, fictional A/B members, old practitioner records and personal/professional Decisions/Changes. It applies the SHA-pinned G2-3A original SQL twice to that synthetic database; tests the exact schema readiness query before/after; then runs exact parameterized new SQL and cleans up the fixture.

The witness passed **12 grouped checks** covering authored note READ/CREATE/UPDATE and cross-member exclusion, unknown member, member Decision source, eight cross-owner/professional/team/client/legacy source denials, authored note and Change, reference uniqueness, member-scoped Attention read/reorder, stale label neutralization after owner change, and historical practitioner exclusion. SQL fixture SHA: `f46b12d808e14a4fabe273666d7358e7a59df24e4c633505f7ceeef2d0337465`.

This is **not a live production acceptance**; fixtures use a simplified base schema, no real member records and no installed migration.

## R20 independent signing dependency — parallel work still owed

The existing R20-R2 `signedLedger.mjs` independently models Ed25519 ledger/head verification and an externally pinned sequence/high-water, but its allowlisted table vocabulary does **not** include Ganesha's Notes, Attention, Events and People. G2-3B demonstrated a synthetic signature/checkpoint/restore overlay, but keypairs and independent pin existed in the same ephemeral process and have not been converted into independently durable, auditable production signing custody.

An acceptable R20-to-Ganesha bridge needs, separately:

- Verified member deletion/withdrawal gesture plus transactionally durable authority outbox, independent of API response success.
- Separate, independently operated signing and verification keys; protected high-water commitment stored outside the restorable archive/database (with rollback and key-rotation procedures).
- Full table/object identity, members AND practitioner compatibility rows, linked assets, attachment/derived data custody and exact revocation coverage; immutable content-minimal tombstones.
- Audit the existing legacy Studio Field Note/Attention DELETE routes separately: this new Ganesha lane refuses DELETE, but it does **not** disable historical practitioner-scoped destructive APIs or retroactively sign their deletions.
- Closed quarantined restore process that refuses promotion until all signed deletion constraints are applied, including no re-exposure through pre-delete backups, stale clients and derived representations.
- Human independent source/security review of exact R20 and G2 revisions, observed realistic recovery rehearsal, founder grant and installation decision.

**Neither this branch nor schema migration is accepted for public use until those gates pass.**

## Remaining G2-3C integration gates

- Correct Ganesha user-facing navigation and state presentation; historical G2-2 continuity and new member-native Notes/Attention do not yet form one accepted full personal Field.
- Full old/new reader continuity, authenticated synthetic member accounts, accessibility and mobile/Desktop witness.
- G2-3A original DDL lock budgeting and non-destructive installation approval; deletion-safe restore acceptance is prior to destructive member actions.
- Events/People and additional personal facets; independent Ganesha product grants and G3 Ganesha/Pro subscription coexistence.
- Formal independent human review and revision-matched staged build. The 136-test earlier G1/G2 pass set plus 28 new G2-3C controls do not erase the three independently reproduced legacy baseline failures.

**Disposition: candidate prepared and source-held; implementation reviewed only as synthetic evidence. Merge, billing and production release HOLD.**
