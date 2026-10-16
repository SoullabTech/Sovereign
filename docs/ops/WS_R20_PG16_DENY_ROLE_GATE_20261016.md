# Writer’s Studio R20 — PostgreSQL 16 deny-only writer-storage boundary

Date: October 16, 2026.
Parent: R19 `9fbdb71c950c276d5508eda9ad65618af27de3db`.
Classification: **ISOLATED ENGINEERING REVIEW ONLY — FIVE-WRITER RELEASE HOLD**.

## What this actually changes

A disposable PostgreSQL 16.13 fixture now runs a proposed **NOLOGIN, non-superuser, no-create, deny-only database role**. The SQL is intentionally placed at `docs/ops/WS_R20_RESTRICTED_ROLE_REVIEW_ONLY.sql`, **not** in `database/migrations`.

The role receives **no direct privilege to read, insert, update or delete writer plaintext** in any of the seven legacy Source/chapter/draft/revision tables, and no direct access to R16's held encrypted-pair manifest. A future service cannot simply switch to this role and perform writer writes; it must first gain an independently reviewed cryptographic custody authority, server-verified writer session and member-specific consent/invitation boundary, and an audited stored-operation interface. This denies unsafe fallback now, without giving a false impression that editing is functional.

No user-facing endpoint, migration, key provider, token, consent notice or publication route has been added. R16/R17/R19 runtime real-writer flags remain disabled.

## Actual PostgreSQL 16 test

`scripts/ops/wsBetaR20PG16RestrictedRole.py` requires exact `R20_ROLE_FIXTURE=fictional-only` environment opt-in, creates one random local `postgres:16.13` container with `--network none`, no published ports and no host-bind mounts. The image-created anonymous database volume is temporary and removed by `docker rm -fv`. The fixture has only fabricated member/Source IDs and a fabricated document string.

Results: **39 checks PASS and nine classes of negative controls PASS.** They include:
- Existing fictional owner can still retrieve intact original SQL text after the refusals.
- Writer role is NOLOGIN/NOSUPERUSER/NOCREATEDB/NOCREATEROLE.
- For each of seven reconstruction fields: SELECT, INSERT, UPDATE, DELETE all rejected through PostgreSQL privileges.
- Encrypted-pair direct SELECT and INSERT both rejected.
- CREATE TABLE refused.
- Original R16 owner-join/immutable table loaded **only** into disposable PG16.
- Temporary Docker container and its image-declared anonymous test volume removed.

Physical receipt (private, not committed): `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R20_PG16_DENY_WRITER_ROLE_20261016.json`.

The initial run met a temporary post-initdb PostgreSQL startup shutdown race; the fixture's readiness test was corrected to wait for a successful full SQL query. A second test exposed the image-declared ephemeral database volume, which the test now verifies by destination/type and removes with `docker rm -fv`. Both early runs exited HOLD and removed their containers. Any anonymous volumes potentially orphaned by those early runs require independent exact-owner identification before cleanup—none has been pruned.

## Concrete existing plaintext-writing call sites to migrate

| Data / table | Current path or finding | R21 requirement |
|---|---|---|
| Original Source and filename `manuscript_source_arrivals` | `lib/manuscript/source/arrivals.ts` INSERT with `source_text`, `original_filename` | Encrypt original and provenance before persisting; no old plaintext/WAL fallback |
| Chapter Source bodies `manuscript_sections.body` | `app/api/sovereign/manuscripts/route.ts` INSERT | Preserve immutable Source + signed provenance; encrypted member-owned chapters |
| Working draft `manuscript_working_drafts.content` | `app/api/sovereign/manuscripts/[id]/draft/route.ts` INSERT/UPDATE, and draft revisions route | Encrypt actual current text and ensure compare-and-swap/history atomicity |
| Draft sections `manuscript_draft_sections.text` | Same draft and revision restore routes | Encrypted section/address mapping and reversible Apply/Undo |
| Expected approved edit `manuscript_revision_authorizations.expected_text` | `lib/manuscript/revisionAuthorization/store.ts` INSERT | Preserve signed writer authorization and immutable provenance without leaking text |
| `manuscript_revision_offers.proposed_text` | Exists as SQL text field; no direct current TypeScript write found in the bounded `app/`+`lib/` search | Independently investigate historical/indirect writers and backups; do not assume unused means safe |

Other editorial/JSONB state, model input/output, exports, WAL, snapshots, replicas and old backups remain unclassified. The dark beta's 918 metadata candidates are *review candidates*, not proven leaks.

## Next engineering exit gate

**R21 must demonstrate an actual server session+consent+invite-backed, independently trusted ciphertext-only write/read/restore operation on PostgreSQL 16 and an isolated file vault.** It must refuse plaintext fallback on all relevant writer paths, without disrupting other existing Soullab rooms or earlier member drafts. Then qualify whole-schema, WAL, old-backup anti-resurrection; R15 crash/journal/deletion high-water; old reader rollback; five-member access and complete Mac/iPhone Safari MAIA editorial workflow.

Only after exact-source/class-A founder sign-off, exact-image build, storage headroom, backup/restore witness and actual beta notices may deployment to `soullab.life` and consented tester invitations be considered.

**R20 role-denial PASS is not a deployed secure writer service or member admission approval.**
