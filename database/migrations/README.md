# Migration conventions

Runner: `scripts/run-sql-migrations.sh` (production `migrate` compose service). Selection is **set-membership against the `schema_migrations` ledger by filename** — any file not yet recorded is applied, regardless of timestamp order relative to already-applied neighbors. A `checksum` column exists on `schema_migrations` but is **not populated or compared** — the runner records `filename` only (verified 2026-08-02). **Editing an applied migration is therefore silently ignored**, not detected as drift: the file is skipped by filename and its new contents never run. Do not rely on drift detection; it is not implemented.

**Consequences for authors:**

1. **Migrations must be order-independent or same-PR.** Set-membership guarantees *application*, not *ordering* — a migration that depends on a neighbor's schema change may apply before it if both arrive unrecorded. If migration B needs migration A's schema, either make B self-sufficient (guards/`IF EXISTS`) or ship A and B in the same PR so they can never arrive separately.
2. **Never edit an applied migration.** The checksum ledger will flag it. Write a new migration instead.
3. **Idempotent and self-protecting** — prereq guards and post-create shape checks, per existing practice (see `20260702000004` for the pattern).
4. **Schema and reader ship together** — a migration and the code that reads its tables belong to the same deploy (full path: `scripts/deploy-production.sh`, which runs migrations and tags rollback images).
5. **Each migration runs in its OWN transaction** — `psql -v ON_ERROR_STOP=1 -c "BEGIN;" -f "$f" -c "COMMIT;"`, not one transaction for the chain. A later migration cannot roll back an earlier one that already committed. This is why an unsafe migration cannot be neutralized by adding a blocking migration after it (see Retired migrations below).

---

## Retired migrations

Migrations listed here **must not be resurrected**. They are recorded for discoverability so that a
future author who finds them in git history understands why they are absent, rather than restoring
them. This section is a record, not an execution mechanism.

### `20260802000001_coach_facilitator_field.sql`

| | |
|---|---|
| **Status** | **RETIRED** — reverted from trunk before any protected environment executed it |
| **Reason** | Introduced a rejected plaintext content-bearing foundation: 22 `coach_*` tables including `coach_authored_notes.body`, `coach_client_personal_notes.body` (the client's own private notes), and `coach_note_publication_events.body_snapshot` (append-only second plaintext copy of every published note). |
| **Governing ruling** | Founder, 2026-08-02 — structural-only foundation. Every field capable of holding substantive human expression moves out of the foundation into a dedicated encrypted-content lane, with **no plaintext placeholder that must later be migrated**. |
| **Merged as** | PR #898, merge `6884e66b0` |
| **Removed by** | PR #910, revert `25255b3b4`, merged `32ddc1257` |
| **Execution state at removal** | **Never applied in production** (0 `coach_*` tables). Local dev only: applied, all tables empty, 0 rows. No member or practitioner data existed in this surface anywhere. |
| **Replacement** | The canonical practitioner relationship foundation lineage, keyed on `practitioner_clients.id`. |
| **Full record** | `docs/architecture/COACH_FIELD_FOUNDATION_CANONICALITY_2026-08-02.md` |

⚠️ Its spec and audit were deleted from trunk along with the code. They survive in git history and on
`feature/coach-facilitator-field-foundation`. **Treat them as historical evidence, not as an active
specification** — they encode plaintext-content assumptions and lifecycle assumptions that have since
been corrected.

### The invariant this incident established

> **When a merged migration is unsafe and has never executed in any protected environment,
> correcting the migration history before execution is safer than adding a later blocking migration.**

Because each migration commits in its own transaction, a later guard cannot prevent the earlier
migration's adoption — the bad state already exists by the time the guard runs. A migration can be
absent from production and still be dangerous while it remains executable in the path to production.
