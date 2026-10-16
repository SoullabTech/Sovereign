# Writer’s Studio R19 — Read-only PostgreSQL 16 manuscript-custody gate

**Date:** October 16, 2026. **Scope:** a five-person, invitation-only beta intended for `soullab.life`.
**Parent candidate:** R18 `2d18e8a2e0083900983d5bd24856a31e19e3dfa5`.
**Release disposition:** **REAL MEMBER WRITING HOLD**.

## What was directly checked

The existing dark, closed Writer's Studio beta database was queried for `information_schema.columns` **only**, through an already authorized read-only maintenance connection. The query did not select data rows, member IDs, manuscripts, account contacts, credentials or original filenames. The resulting schema-name/type metadata was stored privately on the founder's Mac Studio and was NOT committed to GitHub.

The observed PostgreSQL 16 schema contained **756 public tables, 8,928 column definitions**. A broad name/type candidate inventory flagged **918 text/JSON/binary fields** for possible sensitivity review, of which **40** were prioritized by directly manuscript-related table names. These are review candidates, not 918 confirmed privacy violations.

Seven directly reconstructive or privately identifying fields were confirmed present in ordinary text-compatible columns:

- `manuscript_source_arrivals.source_text`
- `manuscript_source_arrivals.original_filename`
- `manuscript_sections.body`
- `manuscript_working_drafts.content`
- `manuscript_draft_sections.text`
- `manuscript_revision_offers.proposed_text`
- `manuscript_revision_authorizations.expected_text`

Additional editorial/JSONB fields and storage paths still require classification. Encryption at the new R16 held-pair adapter does not by itself eliminate existing ordinary SQL, WAL, old backup or derived text. None of these seven fields was modified or migrated during R19.

## New release gate

`lib/writersStudio/recovery/schemaCustodyR19.ts` performs a **pure, offline, fail-closed** schema metadata assessment. It accepts only a PostgreSQL-16 metadata-only inventory with internally consistent counts, a SHA-256 schema fingerprint, correctly typed unique candidate columns, and all expected manuscript reconstruction fields present. Missing/invalid snapshots refuse. A valid snapshot containing those fields returns `HOLD_PLAINTEXT_CUSTODY` and **`canAdmitRealWriters: false`**, never a release GO.

CLI `scripts/ops/wsBetaR19SchemaHoldGate.ts` reads a separate supplied JSON snapshot; it contains no database connection or secrets. No public API, migration, Caddy rule, key, Source writer, email or user flow is activated. `R19_REAL_MEMBER_WRITES_ENABLED=false` remains constant.

## Verification

- Read-only live dark-beta `information_schema` inventory complete, metadata only.
- Scoped strict TypeScript: PASS.
- New R19 unit tests: **7/7 PASS**, including stale/wrong major, missing fields, duplicate entries, counts, record/credential-bearing snapshot rejection and verified HOLD.
- Exact private inventory: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R19_DARK_BETA_SCHEMA_METADATA_ONLY_20261016.json`.
- Private gate receipt: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R19_SCHEMA_HOLD_GATE_20261016.json`.

## Next milestone

**R20 must implement or formally review actual member-owned encrypted write, read, recovery and historic SQL/Source custody** for the identified reconstruction fields, including revisions/editorial content, nonrollbackable independent Work-key/deletion authority, database migration/old-reader compatibility, actual PG16 restore/rollback, writer withdrawal/export, exact production build and Safari complete-member acceptance.

Until then **do not enable real member writing, import, claims, cohort invitations or change production `soullab.life`**. The R18 physical PG16 encrypted-pair fixture is qualified; actual deployed encrypted custody remains unqualified.

**No real manuscript/account row data was read, and neither server state nor schema was changed by R19.**
