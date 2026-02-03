# Free-Text PHI Doctrine
**Status:** Draft
**Applies to:** All free-text fields capable of containing PHI
**Depends on:** PHI Encryption Phase 2A complete; Phase 2B in progress
**Audience:** Engineers, reviewers, security auditors

---

## 0. Purpose

Free-text is the highest-risk PHI surface.

Unlike structured fields, free-text:
- is unbounded
- often contains identifiers unintentionally
- is easily leaked via logs, exports, or debug output

This document defines **how free-text PHI is classified, encrypted, accessed, logged, tested, and enforced** across the system.

---

## 1. Core Doctrine (Non-Negotiables)

1. **Free-text is PHI by default**
   Any user-supplied or practitioner-authored free-text that may reference a client is treated as PHI unless explicitly exempted.

2. **No raw PHI in logs — ever**
   Logs may include:
   - IDs
   - counts
   - state flags
   Logs may NOT include:
   - message bodies
   - notes
   - summaries
   - consultation text

3. **Encryption uses the standard PHI pattern**
   All free-text PHI encryption MUST:
   - use `phiEncryption.ts`
   - use AES-256-GCM
   - bind AAD to `(table, column, rowId, ownerId)`

4. **No `_enc` or `_enc_meta` columns leave the data layer**
   Encrypted columns are **never** returned from:
   - data access functions
   - API responses
   - exports

5. **Exports are explicit, audited, and permissioned**
   Free-text PHI may only be exported when:
   - role permits it
   - client consent permits it (where applicable)
   - an audit event is recorded

---

## 2. Free-Text PHI Inventory

| Surface | Table.Column | Owner | Encrypt Wave | Logging | Export |
|------|-------------|-------|--------------|--------|--------|
| Client messages | `client_messages.body` | Client | ✅ Wave 1 | ❌ | ⚠️ Restricted |
| Practitioner replies | `practitioner_messages.body` | Practitioner | ✅ Wave 1 | ❌ | ⚠️ Restricted |
| Session notes | `case_notes.notes` | Practitioner | Wave 2 | ❌ | ⚠️ Restricted |
| Consultation input | `maia_consultations.prompt` | Client | Wave 2 | ❌ | ❌ |
| Consultation output | `maia_consultations.response` | System | Wave 2 | ❌ | ❌ |
| Emergency info | `client_emergency_info.details` | Client | Wave 2 | ❌ | ❌ |
| Risk assessments | `risk_events.description` | Practitioner | Wave 3 | ❌ | ❌ |
| Outcome narratives | `outcomes.notes` | Practitioner | Wave 3 | ❌ | ⚠️ Aggregated only |

**Notes**
- "Wave" defines rollout priority.
- "Export" means *raw text export*. Aggregated or redacted exports may be allowed separately.

---

## 3. Required Implementation Pattern

### 3.1 Database

For each free-text PHI column:

- Add shadow columns:
  - `<column>_enc`
  - `<column>_enc_meta`
- Plaintext column remains only during Stage A dual-write.

---

### 3.2 Write Path (Stage A)

All writes MUST:

1. Encrypt free-text using `phiEncryption.encrypt()`
2. Dual-write:
   - plaintext column (temporary)
   - encrypted column
3. Never log the plaintext

---

### 3.3 Read Path

Reads MUST:

1. Prefer encrypted column
2. Decrypt via accessor helper
3. Strip all encrypted columns before returning data
4. Stage A only:
   - fallback to plaintext if encrypted value missing
   - emit **metric**, not log, on fallback

---

### 3.4 Accessor Modules

Each surface MUST have a dedicated accessor module, e.g.:

- `phiAccessors/clientMessages.ts`
- `phiAccessors/sessionNotes.ts`
- `phiAccessors/consultations.ts`

Responsibilities:
- encryption
- decryption
- sanitization (removal of `_enc` keys)
- enforcement of caller context

---

## 4. Logging Rules (Strict)

Allowed:
- row IDs
- practitionerId / clientId
- boolean flags
- counts
- state transitions

Forbidden:
- free-text content
- decrypted values
- partial strings
- summaries derived from PHI

**Rule of thumb:**
If it would be unsafe in a breach report, it does not belong in logs.

---

## 5. Testing & Tripwires

### 5.1 Required Tests

Each free-text surface MUST be covered by tests that prove:

1. Writes produce encrypted columns
2. Reads return decrypted text
3. Returned objects contain **no `_enc` or `_enc_meta` keys**
4. Nested leaks are impossible

Use the shared helper:
- `containsEncryptedColumns()`

---

### 5.2 Invariant Tests

Add targets to:
- `phiLeakPrevention.test.ts`

Any function that returns free-text PHI **must be listed explicitly**.

---

## 6. Phase 2B Enforcement Alignment

Once Phase 2B is active:

- Plaintext free-text columns:
  - set to NULL on write
  - blocked by DB CHECK constraints
- Encrypted-only writes enforced
- Plaintext columns removed after soak period

---

## 7. PR Checklist (Required)

Any PR touching free-text PHI MUST confirm:

- [ ] Uses `phiEncryption.ts`
- [ ] No plaintext logging
- [ ] `_enc` columns stripped before return
- [ ] Tripwire test updated or added
- [ ] Export rules respected
- [ ] No new free-text fields without inventory entry

---

## 8. Do Not Break These Rules

1. Never log free-text PHI
2. Never return `_enc` columns
3. Never bypass accessors
4. Never export without audit
5. Never introduce free-text without inventory
6. Never weaken tests "temporarily"

If one of these feels inconvenient, **stop and escalate**.

---

## 9. Status

- Wave 1: client/practitioner messages — complete
- Wave 2: session notes, consultations, emergency info — next
- Wave 3: risk and outcome narratives — planned

This doctrine is **binding**, not advisory.
