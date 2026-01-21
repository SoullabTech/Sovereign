# PHI Encryption — Do Not Break These Rules

**Purpose:** Hard guardrails to prevent plaintext drift, accidental PHI exposure, and "it worked locally" regressions.
**Applies to:** All code touching PHI tables/columns (read/write, joins, exports, logs, queues, background jobs).

---

## Rule 1 — Encrypted-first reads are the default

**All normal read paths must prefer encrypted columns.**
Plaintext reads are allowed only inside explicitly labeled migration utilities (Phase 2A/2B transitional tooling).

**Fail condition:** Any production code path relies on plaintext PHI for correctness.

---

## Rule 2 — No new plaintext PHI may be written

If a record contains PHI, the encrypted shadow columns (`*_enc`, `*_enc_meta`) are the **source of truth**.

**Allowed:** Plaintext columns set to `NULL` (or retained only as deprecated history during soak).
**Not allowed:** Updating plaintext PHI fields with real values after Phase 2B.

---

## Rule 3 — Decryption failures must be loud

If decrypt fails:

* Log a structured error (no PHI in logs)
* Surface failure to the caller or fail closed depending on route sensitivity
* Do **not** silently fall back to plaintext in production once Phase 2B starts

**Fail condition:** "catch → ignore → return plaintext" in production.

---

## Rule 4 — AAD context binding must match the row

Encryption/decryption must use the same AAD context binding (table, column, rowId, ownerId/practitionerId as applicable).

**Fail condition:** Generic decrypt without binding context (weakens integrity).

---

## Rule 5 — Joins must include encrypted join columns and decrypt post-query

For any query that joins PHI-bearing identity fields:

1. Include the encrypted join columns in the SELECT (e.g. `*_enc`, `*_enc_meta`, safe label)
2. Decrypt post-query using the established helper (e.g. `decryptJoinedClientFields(row, practitionerId)`)
3. Never leak identity via alternate routes (digests, prep views, message inboxes, etc.)

**Fail condition:** A "side route" returns plaintext identity because the join omitted encrypted columns.

---

## Rule 6 — Redaction and logs: PHI never enters telemetry

No PHI in:

* server logs
* audit events (store hashes / IDs only)
* error traces
* analytics payloads
* notification content (unless explicitly approved and encrypted end-to-end)

**Fail condition:** Any PHI appears in a log line, even "temporarily."

---

## Rule 7 — Backfill must be verifiable and resumable

Backfill scripts must:

* support `--dry-run`
* support `--verify`
* be resumable (batching + checkpoints)
* produce a mismatch report that is safe to share (no PHI)

**Fail condition:** One-shot "trust me" migrations.

---

## Rule 8 — DB constraints are the last line of truth

Phase 2B enforcement relies on DB constraints to prevent invalid states.

**Required direction:**

* Encrypted columns become `NOT NULL` once backfill is complete and reads are encrypted-first
* Optional CHECK constraints prevent plaintext drift (plaintext implies encrypted exists; or plaintext must be NULL)

**Fail condition:** Removing constraints "to unblock deploy" without a rollback plan.

---

## PR / Review Checklist (Copy-Paste)

When reviewing any PR touching PHI:

- [ ] Reads prefer encrypted fields (no plaintext reliance)
- [ ] Writes populate encrypted fields; plaintext not written (or set NULL)
- [ ] No silent decrypt failure fallback in prod
- [ ] Correct AAD binding used
- [ ] Join routes include encrypted join columns + decrypt helper
- [ ] No PHI in logs/telemetry/errors
- [ ] Backfill tooling remains dry-run + verify + resumable
- [ ] DB enforcement not weakened without an explicit rollback path
