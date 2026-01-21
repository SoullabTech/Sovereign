# PHI Encryption — Phase 2B Enforcement Plan

**Status:** Draft
**Depends on:** Phase 2A complete (dual-write active, backfill 100%, verification passing)
**Goal:** Flip read preference to encrypted-first, then enforce encrypted-only writes

---

## 1. Phase 2B Objectives

| Objective | Description |
|-----------|-------------|
| **Encrypted-prefer reads** | All read paths return decrypted value; plaintext fallback removed |
| **Encrypted-only writes** | New writes populate only `*_enc` columns; plaintext columns receive NULL |
| **Constraint enforcement** | Database constraints prevent plaintext insertion |
| **Plaintext cleanup** | NULL existing plaintext after verification window |

---

## 2. Prerequisites Checklist

Before starting Phase 2B, confirm:

- [ ] Phase 2A migration applied to production
- [ ] `PHI_ENCRYPTION_KEY` set in production environment
- [ ] Backfill complete: `SELECT COUNT(*) FROM client_messages WHERE body IS NOT NULL AND body_enc IS NULL` = 0
- [ ] Backfill verified: `scripts/backfill-phi-encryption.ts --verify` passes
- [ ] No decrypt errors in logs for 48+ hours
- [ ] All read surfaces use `decryptJoinedClientFields()` pattern
- [ ] No direct reads of plaintext columns in application code

---

## 3. Staged Rollout

### Stage B1: Flip Read Preference (encrypted-first)

**Change:** Read paths prefer encrypted, fall back to plaintext only if encrypted missing.

**Files to update:**

```
lib/security/phiAccessors/clientMessages.ts
  - readMessageBody() → call readMessageBodyPreferEncrypted()
  - Remove background verification (no longer needed)

lib/stellium/clients.ts
  - decryptJoinedClientFields() → remove plaintext fallback warning
  - Return decrypted value only; throw if decrypt fails and no fallback
```

**Verification:**
- Deploy to staging
- Create new message → verify reads from `body_enc`
- Read old message → verify decrypts correctly
- Simulate missing `body_enc` → confirm graceful error (not crash)

---

### Stage B2: Encrypted-Only Writes

**Change:** New writes populate encrypted columns only; plaintext columns receive explicit NULL.

**Files to update:**

```
lib/portal/messages.ts
  - sendClientMessage(): remove plaintext from INSERT, set body = NULL

lib/practitioner/messages.ts
  - sendReply(): remove plaintext from INSERT, set body = NULL
```

**SQL pattern:**

```sql
-- Before (dual-write)
INSERT INTO client_messages (id, body, body_enc, body_enc_meta, ...)
VALUES ($1, $2, $3, $4, ...)

-- After (encrypted-only)
INSERT INTO client_messages (id, body, body_enc, body_enc_meta, ...)
VALUES ($1, NULL, $2, $3, ...)
```

**Verification:**
- Create new message
- Confirm `body IS NULL AND body_enc IS NOT NULL`

---

### Stage B3: Database Constraints

**Change:** Add CHECK constraints preventing plaintext writes.

**Migration:** `database/migrations/YYYYMMDD_phi_enforce_encrypted.sql`

```sql
-- ============================================================================
-- PHI ENCRYPTION ENFORCEMENT
-- Phase 2B: Require encrypted columns, prevent plaintext
-- ============================================================================

-- Step 1: NULL any remaining plaintext (safety net)
UPDATE client_messages
SET body = NULL
WHERE body IS NOT NULL AND body_enc IS NOT NULL;

-- Step 2: Add CHECK constraint requiring encrypted columns
ALTER TABLE client_messages
  ADD CONSTRAINT require_body_encrypted
  CHECK (body_enc IS NOT NULL AND body_enc_meta IS NOT NULL);

-- Step 3: Add CHECK constraint preventing plaintext
ALTER TABLE client_messages
  ADD CONSTRAINT prevent_body_plaintext
  CHECK (body IS NULL);

-- Step 4: Update encryption status
UPDATE phi_encryption_status
SET status = 'enforced', completed_at = NOW()
WHERE table_name = 'client_messages' AND column_name = 'body';
```

**Verification:**
- Attempt INSERT with plaintext → should fail constraint
- Attempt INSERT with NULL encrypted → should fail constraint
- Attempt INSERT with both encrypted columns → should succeed

---

### Stage B4: Plaintext Column Removal (Optional, Future)

**Change:** Drop plaintext column entirely.

**When:** After 30+ days of enforcement with no issues.

```sql
-- Only after extended verification period
ALTER TABLE client_messages DROP COLUMN body;
```

**Risk:** Irreversible. Only proceed after:
- Full backup verified
- No code references to `body` column
- Rollback plan documented

---

## 4. Code Changes Summary

| File | Stage | Change |
|------|-------|--------|
| `lib/security/phiAccessors/clientMessages.ts` | B1 | Switch to `readMessageBodyPreferEncrypted()` |
| `lib/stellium/clients.ts` | B1 | Remove plaintext fallback in decrypt helper |
| `lib/portal/messages.ts` | B2 | Write NULL to plaintext column |
| `lib/practitioner/messages.ts` | B2 | Write NULL to plaintext column |
| `database/migrations/*_phi_enforce.sql` | B3 | Add CHECK constraints |

---

## 5. Rollback Plan

### If Stage B1 fails (read issues):

```bash
# Revert to dual-read (prefer plaintext)
git revert <B1-commit>
# No data loss - plaintext still exists
```

### If Stage B2 fails (write issues):

```bash
# Revert to dual-write
git revert <B2-commit>
# New messages written without plaintext can still be read (B1 active)
```

### If Stage B3 fails (constraint issues):

```sql
-- Remove constraints
ALTER TABLE client_messages DROP CONSTRAINT IF EXISTS require_body_encrypted;
ALTER TABLE client_messages DROP CONSTRAINT IF EXISTS prevent_body_plaintext;

-- Revert status
UPDATE phi_encryption_status
SET status = 'completed'
WHERE table_name = 'client_messages' AND column_name = 'body';
```

---

## 6. Verification Checklist (Post-B3)

- [ ] All new messages have `body IS NULL AND body_enc IS NOT NULL`
- [ ] All reads return decrypted content correctly
- [ ] Constraint prevents plaintext INSERT
- [ ] No decrypt errors in production logs
- [ ] `phi_encryption_status` shows `status = 'enforced'`
- [ ] API responses contain no `*_enc` or `*_enc_meta` fields

---

## 7. Timeline Estimate

| Stage | Description | Duration |
|-------|-------------|----------|
| B1 | Flip read preference | 1 day deploy + 2 day soak |
| B2 | Encrypted-only writes | 1 day deploy + 2 day soak |
| B3 | Database constraints | 1 day deploy + 7 day soak |
| B4 | Column removal (optional) | 30+ day soak first |

**Total:** ~2 weeks for full enforcement (excluding B4)

---

## 8. Do Not Break These Rules

1. **Never skip Stage B1** — reads must work before writes change
2. **Never add constraints before B2** — would break existing dual-write code
3. **Never drop columns without 30-day soak** — irreversible
4. **Never expose `*_enc` columns in API responses** — raw ciphertext is not useful to clients
5. **Never remove key from environment** — renders all encrypted data unreadable
6. **Always test decrypt in staging first** — production key must work

---

## 9. Wave 2+ Replication

This same pattern applies to all subsequent PHI columns:

1. Add shadow columns (`*_enc`, `*_enc_meta`)
2. Dual-write (Phase 2A)
3. Backfill existing data
4. Flip read preference (B1)
5. Encrypted-only writes (B2)
6. Enforce constraints (B3)
7. Optional column removal (B4)

Each wave can proceed independently once the previous wave reaches B3.
