# MAIA Security Constitution

**Status:** Ratified
**Effective:** January 2026
**Scope:** All PHI-bearing data in MAIA Sovereign

---

## Article I — Sovereignty

MAIA data never leaves infrastructure we control. No cloud provider, CDN, or third party sits between users and their data. True sovereignty means:

- Self-hosted PostgreSQL on owned hardware
- No Supabase, no Firebase, no cloud databases
- Caddy as edge proxy (no Cloudflare MITM)
- Air-gap capability if needed

**Enforcement:** `npm run check:no-supabase` in pre-commit hook

---

## Article II — Encryption Architecture

All Protected Health Information (PHI) uses AES-256-GCM with context-bound AAD:

```
AAD = { table, column, rowId, ownerId }
```

**Guarantees:**
- Ciphertext is meaningless without the correct context
- Rows cannot be moved, copied, or replayed between tables
- Each practitioner's data is cryptographically isolated

**Key Management:**
- `PHI_ENCRYPTION_KEY` (32-byte, base64)
- Key never in code, logs, or version control
- Rotation planned via `PHI_ENCRYPTION_KEY_ID`

---

## Article III — Constitutional Enforcement Layers

Three layers ensure PHI protection cannot be bypassed:

| Layer | Mechanism | Bypassed By |
|-------|-----------|-------------|
| **L1: Application** | PHI accessors, sanitization | Malicious code |
| **L2: Guardrail** | `npm run check:no-phi-enc` | Disabling pre-commit |
| **L3: Database** | BEFORE INSERT/UPDATE triggers | Nothing short of DB admin |

**L3 is the constitution.** Even if L1/L2 fail, the database rejects plaintext-only writes:

```sql
-- Triggers enforce: if plaintext exists, encrypted must exist
RAISE EXCEPTION 'PHI enforcement: % requires encryption'
```

---

## Article IV — Data Layer Boundaries

PHI never crosses the data layer boundary in encrypted form:

1. **On write:** Accessor encrypts, stores both plaintext and ciphertext
2. **On read:** Accessor decrypts, returns plaintext
3. **On return:** `stripEncryptedColumns()` removes `*_enc` columns

**Invariant:** No API response, frontend state, or log ever contains `*_enc` blobs.

**Enforcement:** Tripwire tests recursively detect leaked `*_enc` columns (27 tests)

---

## Article V — PHI Column Registry

All PHI columns are inventoried in `docs/security/phi-columns.md`:

| Table | Columns | Accessor |
|-------|---------|----------|
| `clients` | name, preferred_name, email | stellium/clients |
| `case_notes` | content | phiAccessors/sessionNotes |
| `client_emergency_info` | safety_plan, medications, medical_conditions, risk_notes | phiAccessors/emergencyInfo |
| `maia_consultations` | practitioner_query, context_provided, maia_response, practitioner_feedback | phiAccessors/maiaConsultations |
| `client_messages` | body | phiAccessors/clientMessages |
| `*_transcript_segments` | text | phiAccessors/transcripts |

**No new PHI column may be added without:**
1. Shadow columns (`*_enc`, `*_enc_meta`)
2. Accessor with encrypt/decrypt helpers
3. DB trigger enforcement
4. Entry in phi-columns.md

---

## Article VI — Prohibited Actions

The following are **unconditionally prohibited**:

1. Writing plaintext PHI without corresponding encryption
2. Returning `*_enc` columns from any API endpoint
3. Logging PHI (even "temporarily" or "for debugging")
4. Weakening DB triggers without explicit rollback plan
5. Disabling pre-commit sovereignty checks
6. Storing encryption keys in version control

---

## Article VII — Verification

Before any release:

- [ ] `npm run typecheck` passes
- [ ] `npm run check:no-supabase` passes
- [ ] `npm run check:no-phi-enc` passes
- [ ] Tripwire tests pass (27/27)
- [ ] DB triggers verified in staging

---

## Amendments

This constitution may only be amended by:
1. Explicit architectural decision record (ADR)
2. Full security review
3. Updated enforcement mechanisms

The goal is not to make security difficult, but to make insecurity impossible.
