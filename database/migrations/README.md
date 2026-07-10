# Migration conventions

Runner: `scripts/run-sql-migrations.sh` (production `migrate` compose service). Selection is **set-membership against the `schema_migrations` ledger by filename** — any file not yet recorded is applied, regardless of timestamp order relative to already-applied neighbors. A checksum (SHA-256) is recorded at apply time; editing a migration file after it has been applied is detected as drift, not silently ignored.

**Consequences for authors:**

1. **Migrations must be order-independent or same-PR.** Set-membership guarantees *application*, not *ordering* — a migration that depends on a neighbor's schema change may apply before it if both arrive unrecorded. If migration B needs migration A's schema, either make B self-sufficient (guards/`IF EXISTS`) or ship A and B in the same PR so they can never arrive separately.
2. **Never edit an applied migration.** The checksum ledger will flag it. Write a new migration instead.
3. **Idempotent and self-protecting** — prereq guards and post-create shape checks, per existing practice (see `20260702000004` for the pattern).
4. **Schema and reader ship together** — a migration and the code that reads its tables belong to the same deploy (full path: `scripts/deploy-production.sh`, which runs migrations and tags rollback images).
