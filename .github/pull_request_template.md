## Summary

<!-- Brief description of what this PR does -->

## Changes

<!-- List of changes made -->

---

## PHI / Security Impact

- [ ] This PR does not touch PHI-related paths/tables

If it **does** touch PHI paths/tables, complete this checklist:

### PHI Encryption Checklist (required for PHI-touch PRs)

- [ ] Reads prefer encrypted fields (no plaintext reliance in prod paths)
- [ ] Writes populate encrypted fields; plaintext is not written (or is set to NULL)
- [ ] No silent decrypt failure fallback in production
- [ ] Correct AAD binding used (table/column/rowId/ownerId)
- [ ] JOIN routes include encrypted join columns + decrypt helper
- [ ] No PHI in logs/telemetry/errors (IDs/hashes only)
- [ ] Backfill tooling remains dry-run + verify + resumable (if modified)
- [ ] DB enforcement not weakened without explicit rollback plan

**PHI paths touched (list):**
-

---

## Testing

<!-- How was this tested? -->

- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Typecheck passes
