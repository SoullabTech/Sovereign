# PHI Encryption — Phase 2A

**Status & Verification Memo (Post-Merge)**

**Audience:** Engineering, QA, Stewardship
**Purpose:** Confirm integrity of PHI encryption rollout (Phase 2A), document delivered scope, and define operational next steps.

---

## 1. Verification Snapshot (Post-Merge Sanity)

### Repo State

* `git status`: clean (no local diffs)
* `origin/main`: up to date
* Latest commits (most recent first):

  * `a637a1a6` — fix(sih): close side route leaks for client name encryption
  * `69d3d1ea` — docs/test: PHI encryption docs + tests
  * `3b0e6f68` — feat(security): PHI encryption infrastructure

### Beads / Tracking

* `bd sync`: clean, synced with `clean-main-no-secrets`
* Issue state:

  * `MAIA-SOVEREIGN-sih`: **in_progress**
    Remaining scope: outcome measures, risk assessment, scheduling, multi-turn consultations

---

## 2. PHI Encryption Phase 2A — Delivered Scope

### Infrastructure

**File:** `lib/security/phiEncryption.ts`

* AES-256-GCM encryption
* AAD context binding:

  * table
  * column
  * rowId
  * ownerId
* Key ID support (rotation-ready)

---

### Client Name Encryption (Dual-Write)

**File:** `lib/stellium/clients.ts`

* Dual-write on create/update (plaintext + encrypted shadow columns)
* Decrypt on read
* Exported helper:

  * `decryptJoinedClientFields()`

This establishes **PHI-first behavior** without breaking existing reads during migration.

---

### Side-Route Leak Closure (JOIN Read Surfaces)

**Files updated:**

* `lib/stellium/sessions.ts`
* `lib/practitioner/messages.ts`
* `lib/practitioner/sessionPrep.ts`

**Standardized pattern applied everywhere:**

1. Include encrypted join columns in SQL (`*_enc`, `*_enc_meta`)
2. Decrypt post-query via `decryptJoinedClientFields`
3. Stage A fallback to plaintext **only** if encrypted value is missing or decryption fails

> Result: no remaining JOIN paths leak client names outside the encryption boundary.

---

### Backfill, Documentation, and Tests

* `scripts/backfill-phi-encryption.ts`

  * resumable, batch-safe backfill
  * `--dry-run` and verification modes
* `docs/security/phi-columns.md`

  * authoritative PHI scope contract (73+ columns, 22 tables)
* `lib/security/__tests__/phiEncryption.test.ts`

  * 23 passing tests covering:

    * encryption/decryption
    * AAD binding
    * key handling
    * failure modes

---

## 3. Operational Next Steps (Phase 2B Readiness)

1. **Deploy migrations** to production
2. **Set `PHI_ENCRYPTION_KEY`**

   * 32-byte base64 value
3. **Verify dual-write**

   * create a client
   * confirm `name_enc IS NOT NULL`
4. **Backfill existing data**

   * run with `--dry-run`
   * then execute live
5. **Flip read preference**

   * prefer encrypted reads over plaintext
   * schedule follow-up constraint migration to prevent plaintext drift

---

## 4. Current State Summary

* PHI encryption infrastructure is live and tested
* Client name encryption is active with dual-write safety
* All known side-route leaks are closed
* Backfill tooling and documentation are in place
* System is ready to advance to **Phase 2B** when ops confirms

---

## 5. Notes for the Team

* This phase intentionally prioritizes **correctness over enforcement**.
* Plaintext fallback exists *only* to allow safe migration.
* Once Phase 2B completes, plaintext should become structurally impossible.
