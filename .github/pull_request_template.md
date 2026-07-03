## Summary

<!-- Brief description of what this PR does -->

## Changes

<!-- List of changes made -->

---

## Change Classification (required)

<!--
  Check exactly ONE box, OR apply the matching class-* label. The Covenant Gates
  check reads this section. See docs/GOVERNANCE_MENTOR_COVENANT.md for definitions.
  "MAIA proposes; Mentors approve; Production is human-signed."
-->

- [ ] **Class A — Sacred Boundaries** (privacy/consent/safety/sovereignty)
- [ ] **Class B — Structural Risk** (migrations/auth/routing/infra)
- [ ] **Class C — Routine Improvement** (refactor/copy/UX/prompt tuning)
- [ ] **Frontier-Dependent** (models/providers/pricing)

### Rollback Plan (required for Class B)

- [ ] Revert commit is sufficient
- [ ] Migration rollback script provided
- [ ] Feature flag can disable
- [ ] **No rollback possible**

### Frontier Verification (required for Frontier-Dependent)

- [ ] Verified by Mentor: <!-- @handle, date, valid until YYYY-MM-DD -->

<!--
  Approval: Class A/B/Frontier need founder/mentor approval. During bootstrap,
  a maintainer may apply the `covenant-signoff` label to bridge that approval
  requirement. It does NOT bridge classification or rollback.
-->

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
