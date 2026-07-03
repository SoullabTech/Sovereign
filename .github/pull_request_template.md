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

## Covenant Governance

Covenant Gates checks the change class of every PR. **Check exactly one** (leave the `[x]` exactly as shown so the gate can read it):

- [ ] **Class A — Sacred Boundaries** (privacy / consent / safety / sovereignty). Required for anything under `lib/safety/`, `lib/memory/`, `lib/consciousness/`, `lib/session/`, `app/api/session/`, `docs/policy/`, `docs/GOVERNANCE`.
- [ ] **Class B — Structural Risk** (migrations / auth / routing / infra / governance workflows).
- [ ] **Class C — Routine Improvement** (refactor / copy / UX / prompt tuning).
- [ ] **Frontier-Dependent** (models / providers / pricing).

### Rollback plan (required for Class B) — check one:

- [ ] Revert commit is sufficient
- [ ] Migration rollback script provided
- [ ] Feature flag can disable
- [ ] **No rollback possible**

### Sign-off

Covenant approval is meant to be an independent steward review. **Until an independent steward account exists**, the founder records an explicit, logged sign-off by applying the **`covenant-signoff`** label to this PR — a temporary bootstrap bridge, *not* independent review. The label bridges only the founder/mentor approval requirement; it does **not** satisfy classification, rollback, sacred-path escalation, or CI. Remove the bridge once an independent steward exists.

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
