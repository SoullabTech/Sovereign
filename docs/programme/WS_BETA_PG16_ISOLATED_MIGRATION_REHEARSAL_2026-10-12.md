# Writer’s Studio — isolated production-schema PostgreSQL 16 migration rehearsal

**Date:** October 12, 2026. **Standing:** Engineering PASS for the enumerated isolated assertions; **migration release STOP** until independent evidence and founder decision.

## Scope and isolation

- A schema-only, custom-format `pg_dump --schema-only --no-owner --no-acl` was obtained **read-only** from the Linux production `maia_consciousness` database. It contained **no copied member, manuscript, conversation or recording rows**.
- The secured schema-only artifact resides in `~/.maia-release-authority/ws-migration-compat-20261012/production-schema-only.dump` on the Mac Studio, SHA-256 `29f083d213aea31337f5f112a526c43a18af15bad08580d4a236f609cc16ea78`.
- Restored into **only** local Mac Docker PostgreSQL 16.15, new disposable database `maia_ws_migration_witness_20261012`; the restore contained 753 public table definitions, including all five required parent tables.
- The Mac Homebrew PostgreSQL 17.7 and the separate Linux production PostgreSQL were **not mutation targets**.
- No Caddy edit, live source upload, member data copy, production migration or application deployment was performed.

## Exact pending sequence

1. `20261002000002_writer_studio_chapter_overview_lens.sql` — expand the existing lens check and replace observation validation to admit `overview`.
2. `20261005000001_writer_studio_work_directives.sql` — new Work directive and event custody.
3. `20261006000001_writer_studio_completion_checks.sql` — new explicit writer-completion decisions.
4. `20261007000001_craft_version_choices.sql` — immutable writer-version choices.

**Defect and correction:** Original directive SQL checked `TG_TABLE_NAME` and referenced `OLD.directive_id` in one combined boolean clause shared across two row types. Real PG16 refused deletion with `record "old" has no field "directive_id"` rather than the intended custody decision. The candidate now branches by `TG_TABLE_NAME` before accessing row-type-specific fields.

**Other repairs:** Composite `(living_work_id, member_id)` foreign key enforces a Work’s actual member owner at the database level. Completion-check DELETE is refused while its parent manuscript exists; TRUNCATE is refused; lawful parent manuscript deletion remains able to cascade.

## Isolated proof

The reproducible witness is `scripts/witness/ws-beta-migration-pg16-20261012.py`. Output is `prefix-rehearsal.json` and `prefix-run.log` in the secure receipt directory.

**39/39 enumerated checks PASS**, including:
- exact disposable database identity and PG16 major version;
- old 8-lens constraint read and SQL reader probe;
- real held AccessShareLock causing first migration’s 5s lock-timeout; schema unchanged after failure;
- successful replay of the migration and Overview admission in both CHECK and trigger;
- each of the four ordered SQL scripts applies successfully;
- cross-member directive and event FKs refuse mismatched owner;
- direct directive and event update/delete/truncate cannot erase protected history;
- real Work-parent deletion removes its governed directives/events by cascade;
- cross-member completion FK refuses mismatched owner;
- direct completion update/delete/truncate refused; real parent manuscript deletion cascades;
- absent proposal version refused; actual synthetic member version choice accepted; malformed JSON refused;
- old basic SQL reader query remains available after every stage;
- transaction-scoped DDL rollback leaves no extra table.

All inserted records in the witness database use synthetic identities. This is not a live-data or old-application session witness.

## Migration-history reconciliation

Linux production ledger: **570 applied** names. Candidate tree has **522** migration files and **four pending**. The apparent **52 applied names missing from candidate SQL** have identifiable provenance:
- 51 names occur in `database/baseline/0001_baseline_2026-09-01.manifest`, which was captured from production ledger and intentionally subsumed them;
- one filename, `20260903000001_return_authority_fail_closed.sql`, has an exact recoverable Git source in commit `6c6228c248`, SHA-256 `42ce98bd36280f59837e6692c5cab81949fc07f11787e31270b4805115fd9be3`. It remains absent from the candidate tree; do not silently reintroduce/reapply it.

The source/name mystery is substantially reconciled. **Historical byte integrity remains unproven:** only 4 of 570 production ledger rows have recorded checksum values; the runner’s prior filename-only behavior cannot establish authenticity for all past SQL.

## What this PASS does not establish

1. Exact deployed old reader `c9e4f7f7e` interacting with every migrated prefix — we ran SQL probes, not that application image. Existing overview rows could change old-reader behavior once a new writer creates them.
2. A full frozen image/build, actual browser and API compatibility at the final candidate code SHA.
3. Physical crash/restart recovery, durable backup restore, full production rollback, source filesystem custody or multi-host old/new reader coexistence.
4. No internal ingress bypass of the Caddy source-write fence.
5. Independent reviewer admission, founder migration approval, production write or beta launch.

## Required next act and release STOP

Freeze the exact candidate SQL and review hashes. Have an independent reviewer reproduce the PG16 evidence, test the real old-reader image on an isolated clone after **each prefix**, perform crash/restore and rollback acceptance, and evaluate the full migration-gate composition against the authoritative production ledger. Only then request a **separate** founder authorization for any production schema change. No migrations were applied to Linux production by this lane.
