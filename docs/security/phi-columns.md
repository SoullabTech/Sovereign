# PHI Columns - Encryption Scope Contract

> **HIPAA Sprint 7 Phase 2A**
> This document defines the canonical list of PHI columns requiring encryption.
> All columns listed here MUST be encrypted with AES-256-GCM before HIPAA compliance.

---

## Do Not Break These Invariants

```
1. Encrypted identity is never trusted in raw form
   - *_enc and *_enc_meta must never leave the data layer
   - If it's in a payload, log, or export, that's a bug

2. Identity is resolved post-query, not in SQL
   - JOINs may fetch encrypted columns only
   - Decryption happens in application code via shared helpers

3. No "convenience plaintext" joins
   - Plaintext identity is not pulled "just in case"
   - If you think you need it, you probably don't

4. Authorization precedes decryption
   - Practitioner context is required to decrypt
   - Absence of auth means absence of identity

5. Decryption failure must be safe
   - Stage A: log + fallback only if plaintext exists
   - Never crash list views
   - Never silently substitute incorrect identity

6. One pattern, everywhere
   - All read paths use:
     SELECT + shared join fragment
     → decryptJoinedClientFields()
     → safe output
```

---

## Encryption Status Legend

| Status | Meaning |
|--------|---------|
| `ENCRYPTED` | Already encrypted with AES-256-GCM |
| `PLAINTEXT` | Currently plaintext, needs encryption |
| `EXEMPT` | Not PHI (IDs, timestamps, enums) |

---

## Priority 1: Critical Clinical Content

These columns contain clinical narratives and session content. **Highest breach risk.**

| Table | Column | Type | Status | PHI Reason |
|-------|--------|------|--------|------------|
| `case_notes` | `content` | TEXT | ENCRYPTED | Full session notes |
| `case_notes` | `interventions_used` | TEXT[] | PLAINTEXT | Clinical interventions |
| `case_notes` | `themes_observed` | TEXT[] | PLAINTEXT | Client patterns |
| `case_notes` | `maia_analysis` | JSONB | PLAINTEXT | AI clinical insights |
| `case_notes` | `pattern_markers` | TEXT[] | PLAINTEXT | Clinical markers |
| `supervision_transcript_segments` | `text` | TEXT | PLAINTEXT | Clinical dialogue |
| `practice_transcript_segments` | `text` | TEXT | PLAINTEXT | Session dialogue |
| `supervision_insights` | `content` | TEXT | PLAINTEXT | AI clinical insight |
| `session_insights` | `content` | TEXT | PLAINTEXT | Session observations |

---

## Priority 2: Client Communication

Between-session messages and practitioner-client communication.

| Table | Column | Type | Status | PHI Reason |
|-------|--------|------|--------|------------|
| `client_messages` | `body` | TEXT | PLAINTEXT | Client-written content |
| `practitioner_messages` | `subject` | TEXT | PLAINTEXT | Message subject |
| `practitioner_messages` | `body` | TEXT | PLAINTEXT | Message content |
| `maia_consultations` | `practitioner_query` | TEXT | PLAINTEXT | Clinical question |
| `maia_consultations` | `context_provided` | JSONB | PLAINTEXT | Case context |
| `maia_consultations` | `maia_response` | TEXT | PLAINTEXT | Clinical response |
| `maia_consultations` | `practitioner_feedback` | TEXT | PLAINTEXT | Clinical reflection |

---

## Priority 3: Client Identity & Contact

Direct client PII/PHI that identifies individuals.

| Table | Column | Type | Status | PHI Reason |
|-------|--------|------|--------|------------|
| `practitioner_cases` | `client_name_encrypted` | TEXT | ENCRYPTED | Client real name |
| `practitioner_cases` | `client_identifier` | VARCHAR | PLAINTEXT | Client pseudonym |
| `practitioner_cases` | `presenting_concerns` | TEXT[] | PLAINTEXT | Clinical symptoms |
| `practitioner_cases` | `consent_notes` | TEXT | PLAINTEXT | Consent details |
| `practitioner_clients` | `name` | VARCHAR | PLAINTEXT | Client full name |
| `practitioner_clients` | `email` | VARCHAR | PLAINTEXT | Client email |
| `practitioner_clients` | `phone` | VARCHAR | PLAINTEXT | Client phone |
| `practitioner_clients` | `intake_responses` | JSONB | PLAINTEXT | Clinical intake |
| `practitioner_clients` | `internal_notes` | TEXT | PLAINTEXT | Practitioner notes |
| `practitioner_clients` | `birth_date` | DATE | PLAINTEXT | Date of birth |
| `practitioner_clients` | `birth_time` | TIME | PLAINTEXT | Birth time |
| `practitioner_clients` | `birth_location` | VARCHAR | PLAINTEXT | Birth location |

---

## Priority 4: Safety & Emergency

Critical safety information requiring protection.

| Table | Column | Type | Status | PHI Reason |
|-------|--------|------|--------|------------|
| `client_emergency_info` | `safety_plan` | TEXT | ENCRYPTED | Client safety plan |
| `client_emergency_info` | `medications` | TEXT | ENCRYPTED | Current medications |
| `client_emergency_info` | `medical_conditions` | TEXT | ENCRYPTED | Medical conditions |
| `client_emergency_info` | `risk_notes` | TEXT | ENCRYPTED | Practitioner risk notes |
| `safety_concern_logs` | `review_note` | TEXT | PLAINTEXT | Safety review notes |

---

## Priority 5: User Journals & Reflections

Personal user content (lower clinical risk but still PHI).

| Table | Column | Type | Status | PHI Reason |
|-------|--------|------|--------|------------|
| `quick_journal_entries` | `content` | TEXT | PLAINTEXT | User journal text |
| `elemental_journal_entries` | `content` | TEXT | PLAINTEXT | User reflection |
| `elemental_journal_entries` | `insights` | TEXT[] | PLAINTEXT | User insights |
| `selflet_messages` | `content` | TEXT | PLAINTEXT | Letter to self |
| `selflet_messages` | `title` | VARCHAR | PLAINTEXT | Message title |
| `selflet_messages` | `received_interpretation` | TEXT | PLAINTEXT | User reflection |

---

## Priority 6: AI Memory & Patterns

AI-derived content that may contain PHI.

| Table | Column | Type | Status | PHI Reason |
|-------|--------|------|--------|------------|
| `case_memories` | `content` | TEXT | PLAINTEXT | Clinical memory |
| `conversation_insights` | `insight_text` | TEXT | PLAINTEXT | User insight |
| `conversation_insights` | `conversation_context` | TEXT | PLAINTEXT | Conversation context |
| `user_session_patterns` | `conversation_themes` | TEXT[] | PLAINTEXT | User themes |
| `user_session_patterns` | `emotional_patterns` | JSONB | PLAINTEXT | Emotional data |
| `practitioner_growth` | `observation` | TEXT | PLAINTEXT | Cross-session insight |
| `practitioner_growth` | `practitioner_notes` | TEXT | PLAINTEXT | Practitioner notes |

---

## Priority 7: Audio/Transcript Paths

File paths to PHI content (files must also be encrypted at rest).

| Table | Column | Type | Status | PHI Reason |
|-------|--------|------|--------|------------|
| `supervision_sessions` | `title` | TEXT | PLAINTEXT | Session title |
| `supervision_sessions` | `recording_path` | TEXT | PLAINTEXT | Audio file path |
| `supervision_sessions` | `transcript_path` | TEXT | PLAINTEXT | Transcript path |
| `practice_sessions` | `title` | TEXT | PLAINTEXT | Session title |
| `practice_sessions` | `notes` | TEXT | PLAINTEXT | Session notes |
| `practice_sessions` | `recording_path` | TEXT | PLAINTEXT | Audio file path |
| `practice_sessions` | `transcript_path` | TEXT | PLAINTEXT | Transcript path |
| `quick_journal_entries` | `audio_path` | TEXT | PLAINTEXT | Voice recording path |

---

## Priority 8: Member PII

User account information (PII, some PHI).

| Table | Column | Type | Status | PHI Reason |
|-------|--------|------|--------|------------|
| `members` | `name` | VARCHAR | PLAINTEXT | User name |
| `members` | `email` | VARCHAR | PLAINTEXT | User email |
| `members` | `birth_date` | DATE | PLAINTEXT | Date of birth |
| `members` | `birth_time` | TIME | PLAINTEXT | Birth time |
| `members` | `birth_location_name` | VARCHAR | PLAINTEXT | Birth location |

---

## Columns NOT to Encrypt (Operational)

These columns are **exempt** from encryption:

- All UUID primary keys (`id`)
- All foreign keys (`*_id`)
- All timestamps (`created_at`, `updated_at`, `sent_at`, etc.)
- Status enums (`status`, `direction`, `message_type`, etc.)
- Numeric metadata (`duration_ms`, `speaker_count`, etc.)
- Vector embeddings (already encoded, needed for search)
- Encryption infrastructure (`encryption_key_salt`, `encryption_key_version`)

---

## Phase 2A Implementation Order

1. **Wave 1**: `client_messages.body` (highest traffic, between-session)
2. **Wave 2**: `case_notes.*` (clinical content)
3. **Wave 3**: `practitioner_clients.*` (client PII)
4. **Wave 4**: `maia_consultations.*` (AI dialogues)
5. **Wave 5**: Remaining tables

---

## Encryption Configuration

```
PHI_ENCRYPTION_KEY=<32-byte-base64>
PHI_ENCRYPTION_KEY_ID=k1
```

Key rotation: Bump `PHI_ENCRYPTION_KEY_ID` and add new key, old keys kept for decryption.

---

## Validation

Run `npm run check:phi-encryption` to verify:
- All PHI columns have `_enc` counterparts
- No direct reads of plaintext PHI columns in app code
- Encryption metadata columns exist

---

## Addendum: Side-Route Leak Fixes (Commit `a637a1a6`)

### What we fixed

When we introduced encrypted identity columns (e.g., `name_enc`, `name_enc_meta`, `preferred_name_enc`, etc.), we discovered a common "side-route leak" pattern:

- A feature query joins client identity fields in a SELECT (sessions, inbox, prep, etc.)
- The code expects plaintext `client_name` (or equivalent)
- A future dev (or exporter, or logger) might accidentally surface identity because "it was already in the row"
- Result: PHI can leak through *non-obvious read paths* even if the primary "client read" endpoint is safe

**Fix:** Standardize joined identity selection + post-query decryption + safe fallback.

### Pattern applied (standard)

1. **Add a shared SQL fragment:**
   - `CLIENT_NAME_JOIN_COLUMNS` includes encrypted fields needed for decryption (`name_enc`, `name_enc_meta`, `preferred_name_enc`, etc.)

2. **Post-query normalization:**
   - `decryptJoinedClientFields(row, practitionerId)` runs **after** the DB returns the row

3. **Safe fallback behavior:**
   - If decryption fails, we **fall back to plaintext only when present** (Stage A compatibility)
   - We **do not throw** for decryption mismatch during Stage A (avoids breaking production reads while backfill is incomplete)

### Pattern diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1) DATABASE QUERY                                            │
│                                                             │
│ SELECT ...                                                   │
│   JOIN client                                                │
│                                                             │
│ • Select encrypted identity columns only                    │
│   (name_enc, preferred_name_enc, *_enc_meta)                │
│ • Use shared fragment: CLIENT_NAME_JOIN_COLUMNS             │
│ • Do NOT pull plaintext identity "for convenience"          │
│                                                             │
│ Result: row contains *_enc fields only                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2) POST-QUERY NORMALIZATION                                  │
│                                                             │
│ decryptJoinedClientFields(row, practitionerId)               │
│                                                             │
│ • Runs AFTER DB returns rows                                │
│ • Decrypts only if practitioner is authorized               │
│ • Normalizes safe fields (e.g. client_name)                 │
│ • Strips raw *_enc blobs from output                         │
│                                                             │
│ Result: normalized row (safe for UI / API)                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3) SAFE OUTPUT                                               │
│                                                             │
│ UI / API Payload                                             │
│                                                             │
│ • client_name =                                              │
│     decrypted.client_name || row.client_name (Stage A)      │
│ • If decrypt fails in Stage A:                               │
│     – Do NOT crash                                           │
│     – Log for investigation                                  │
│     – Fallback only if plaintext exists                     │
│ • Never expose *_enc columns                                 │
│   (payloads, logs, exports, admin tools)                    │
│                                                             │
│ Result: no side-route PHI leakage                            │
└─────────────────────────────────────────────────────────────┘
```

### PR Checklist (Copy Into PRs)

When your PR touches any query that JOINs `practitioner_clients`:

```
[ ] Used CLIENT_NAME_JOIN_COLUMNS (not raw c.name)
[ ] Called decryptJoinedClientFields() post-query
[ ] Output contains client_name, not *_enc columns
[ ] No plaintext fallback without PHI_ALLOW_PLAINTEXT_FALLBACK guard
```

### Wrong vs Right

**Wrong (Side Route Leak):**

```typescript
// ❌ Pulls plaintext directly, bypasses encryption layer
const result = await query(`
  SELECT s.*, c.name as client_name
  FROM sessions s
  JOIN practitioner_clients c ON s.client_id = c.id
`);
return result.rows; // Leaks plaintext name
```

**Right (Encrypted Path):**

```typescript
// ✅ Uses shared fragment, decrypts post-query
const result = await query(`
  SELECT s.*, ${CLIENT_NAME_JOIN_COLUMNS}
  FROM sessions s
  JOIN practitioner_clients c ON s.client_id = c.id
`);
return result.rows.map(row => {
  const decrypted = decryptJoinedClientFields(row, practitionerId);
  return {
    ...row,
    client_name: decrypted.client_name || row.client_name,
    // Strip *_enc columns from output
  };
});
```

### Files updated (read surfaces protected)

**Client join decryption helper**
- `lib/stellium/clients.ts`
  - Added `decryptJoinedClientFields()` export

**Session read paths**
- `lib/stellium/sessions.ts`
  - `getSessions`
  - `getUpcomingSessions`
  - `getSession`
  - `getSessionsNeedingFollowUp`

**Messaging read paths**
- `lib/practitioner/messages.ts`
  - `getInbox`
  - `getMessage`
  - `getMessageDigest`

**Session prep read path**
- `lib/practitioner/sessionPrep.ts`
  - `getUpcomingSessionsWithPrep`

### Why this matters

This closes a whole class of bugs:

- "PHI lurking in the row" (identity present even when UI shouldn't show it)
- Accidental leakage via exports / logs / admin tooling
- Future feature joins that unknowingly pull sensitive columns

It's also the template we'll reuse for additional PHI waves.

---

## Operational Next Steps (deployment sequence)

1. Generate key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. Deploy migrations → verify new encrypted columns exist

3. Deploy code → dual-write enabled

4. Test dual-write:
   - Create client message
   - Verify `body_enc IS NOT NULL`

5. Backfill:
   - `--dry-run` first
   - Then live backfill with `--verify`

6. Phase 1.5 (recommended): Add NULL/consistency constraints to prevent plaintext drift once Stage B begins

---

## QA: "Side-route leak" verification checklist

- [ ] Sessions list: client name resolves correctly (encrypted when present)
- [ ] Session detail: same
- [ ] Inbox/digest/message detail: same
- [ ] Session prep: same
- [ ] Confirm: no API payload includes raw `*_enc` blobs unintentionally
- [ ] Confirm: decryption failure does **not** crash list pages (Stage A), but logs are visible for investigation
