# PHI Encryption — Phase 2B

**Enforcement & Plaintext Elimination Plan**

**Audience:** Engineering, QA, Stewardship
**Purpose:** Define the controlled transition from dual-write (Stage A) to enforced encrypted-only PHI handling (Stage B), eliminating plaintext drift.

---

## 1. Phase 2B Goals

Phase 2B formally **ends the coexistence period** between plaintext and encrypted PHI.

### Outcomes

* Encrypted columns become the **authoritative source of truth**
* Plaintext columns are no longer read in normal operation
* Structural constraints prevent new plaintext PHI from being written
* Any failure becomes **loud**, not silent

This phase is about **enforcement, not migration**.

---

## 2. Preconditions (Must Be True Before Flip)

Phase 2B MUST NOT begin until all of the following are verified:

1. **Backfill complete**

   * `scripts/backfill-phi-encryption.ts --verify` reports 100% encrypted coverage
2. **Dual-write verified**

   * New writes populate `*_enc` and `*_enc_meta`
3. **PHI_ENCRYPTION_KEY set in all environments**
4. **No unresolved decrypt failures**

   * Logs show zero persistent decrypt errors
5. **QA sign-off**

   * Spot checks confirm encrypted reads match legacy plaintext values

> If any precondition fails, Phase 2B is postponed.

---

## 3. Stage B.1 — Prefer Encrypted Reads (Code-Level Flip)

### Change

* All read paths must:

  * **Read encrypted columns first**
  * Treat plaintext as deprecated fallback only in explicitly marked migration helpers

### Required Updates

* Remove implicit plaintext reads
* Guard legacy fallback paths with:

  ```ts
  if (process.env.PHI_ALLOW_PLAINTEXT_FALLBACK === 'true')
  ```
* Default value: **false**

### Result

* Production behavior no longer relies on plaintext
* Any missing encryption becomes immediately visible

---

## 4. Stage B.2 — Database Constraints (Structural Enforcement)

Once Stage B.1 is stable:

### Add NOT NULL Constraints (Incremental)

Example:

```sql
ALTER TABLE practitioner_clients
ALTER COLUMN name_enc SET NOT NULL,
ALTER COLUMN name_enc_meta SET NOT NULL;
```

Apply **table by table**, starting with:

1. practitioner_clients
2. client_messages
3. sessions / notes tables
4. emergency / risk-related tables

---

### Optional: CHECK Constraints for Drift Prevention

Example pattern:

```sql
CHECK (
  name IS NULL
  OR name_enc IS NOT NULL
)
```

This ensures plaintext cannot exist without encrypted counterpart.

---

## 5. Stage B.3 — Write Path Lockdown

### Goal

Prevent **any future plaintext PHI writes**, even accidentally.

### Actions

* Remove plaintext writes from:

  * create
  * update
  * import
* Introduce write-time guards:

  * Reject writes where plaintext PHI fields are populated without encryption context
* Add CI guardrails:

  * grep-based or AST checks preventing writes to legacy columns

---

## 6. Stage B.4 — Plaintext Decommission (Deferred but Planned)

**Not required immediately**, but must be planned.

Options:

1. Retain plaintext columns but keep them NULL forever
2. Remove plaintext columns entirely (major migration)

Recommendation:

* Keep columns for ≥1 release cycle
* Remove once operational confidence is high

---

## 7. Failure Modes & Expected Behavior

| Scenario                  | Expected Outcome     |
| ------------------------- | -------------------- |
| Encrypted column missing  | Hard error           |
| Decryption fails          | Logged + surfaced    |
| Plaintext write attempted | Rejected             |
| Legacy code path used     | CI / runtime failure |

Phase 2B intentionally **breaks silently unsafe behavior**.

---

## 8. Phase 2B Exit Criteria

Phase 2B is considered complete when:

* All PHI reads use encrypted columns by default
* Plaintext PHI columns are structurally constrained
* No fallback paths are enabled in production
* CI prevents reintroduction of plaintext writes
* Documentation updated to mark plaintext as deprecated

---

## 9. Non-Negotiable Invariant (Carry Forward)

> **Plaintext PHI must never again be required for correct system operation.**

This is the same philosophy used in:

* Trusted Colleagues privacy enforcement
* Password hashing migration
* Sovereignty checks

---

### Next Logical Follow-Ups (After Phase 2B)

* "Do Not Break These Rules" checklist (repo-pinned)
* QA script (regression + failure simulations)
* Audit log encryption (Phase 3 HIPAA hardening)
