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
| `DUAL-WRITE (3A)` | Phase 3A: writes both plaintext + encrypted, reads prefer encrypted |
| `PLAINTEXT` | Currently plaintext, needs encryption |
| `METADATA` | Encryption metadata column (iv, tag, kid, v) |
| `EXEMPT` | Not PHI (IDs, timestamps, enums) |

---

## Priority 1: Critical Clinical Content

These columns contain clinical narratives and session content. **Highest breach risk.**

| Table | Column | Type | Status | PHI Reason |
|-------|--------|------|--------|------------|
| `practitioner_client_notes` | `content_enc` | TEXT | ENCRYPTED | Practitioner-private notes on a Studio client — **no plaintext sibling column exists by design** (encrypted from birth, no dual-write stage) |
| `practitioner_client_notes` | `content_enc_meta` | JSONB | METADATA | Encryption metadata |
| `case_notes` | `content` | TEXT | ENCRYPTED | Full session notes |
| `case_notes` | `interventions_used` | TEXT[] | PLAINTEXT | Clinical interventions |
| `case_notes` | `themes_observed` | TEXT[] | PLAINTEXT | Client patterns |
| `case_notes` | `maia_analysis` | JSONB | PLAINTEXT | AI clinical insights |
| `case_notes` | `pattern_markers` | TEXT[] | PLAINTEXT | Clinical markers |
| `supervision_transcript_segments` | `text` | TEXT | DUAL-WRITE (3A) | Clinical dialogue |
| `supervision_transcript_segments` | `text_enc` | TEXT | ENCRYPTED | Encrypted text (AES-256-GCM) |
| `supervision_transcript_segments` | `text_enc_meta` | JSONB | METADATA | Encryption metadata |
| `practice_transcript_segments` | `text` | TEXT | DUAL-WRITE (3A) | Session dialogue |
| `practice_transcript_segments` | `text_enc` | TEXT | ENCRYPTED | Encrypted text (AES-256-GCM) |
| `practice_transcript_segments` | `text_enc_meta` | JSONB | METADATA | Encryption metadata |
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
| `maia_consultations` | `practitioner_query` | TEXT | ENCRYPTED | Clinical question |
| `maia_consultations` | `context_provided` | JSONB | ENCRYPTED | Case context |
| `maia_consultations` | `maia_response` | TEXT | ENCRYPTED | Clinical response |
| `maia_consultations` | `practitioner_feedback` | TEXT | ENCRYPTED | Clinical reflection |

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

---

## Phase 3A: Transcript Encryption (Commit `75774bad`)

**Highest PHI exposure surface** - full clinical dialogue.

### Tables

| Table | Column | Status |
|-------|--------|--------|
| `supervision_transcript_segments` | `text` | DUAL-WRITE |
| `supervision_transcript_segments` | `text_enc` | ENCRYPTED |
| `supervision_transcript_segments` | `text_enc_meta` | METADATA |
| `practice_transcript_segments` | `text` | DUAL-WRITE |
| `practice_transcript_segments` | `text_enc` | ENCRYPTED |
| `practice_transcript_segments` | `text_enc_meta` | METADATA |

### Files

- **Migration**: `database/migrations/20260122_transcript_encryption.sql`
- **PHI Accessor**: `lib/security/phiAccessors/transcripts.ts`
- **Backfill Script**: `scripts/backfill-transcript-encryption.ts`
- **Tests**: `lib/security/__tests__/transcriptEncryption.test.ts`

### Updated Data Access

**SupervisionStore.ts**:
- `addTranscriptSegment()` - dual-write
- `getTranscript()` - decrypt + sanitize
- `getRecentTranscript()` - decrypt + sanitize

**PracticeStore.ts**:
- `addTranscriptSegment()` - dual-write
- `getTranscriptSegments()` - decrypt + sanitize
- `getFullTranscript()` - decrypt + sanitize

### Rollout Checklist

1. **Set env**: `PHI_ENCRYPTION_KEY` (64 hex chars or 44 base64 chars)
2. **Run migration**: `psql -d maia_consciousness -f database/migrations/20260122_transcript_encryption.sql`
3. **Deploy code** (dual-write enabled)
4. **Backfill**:
   ```bash
   npx tsx scripts/backfill-transcript-encryption.ts --dry-run
   npx tsx scripts/backfill-transcript-encryption.ts --live
   npx tsx scripts/backfill-transcript-encryption.ts --verify
   ```
5. **Phase 3B** (next): Stop writing plaintext, add constraints

### PR Checklist

When your PR touches transcript reads:
```
[ ] Uses decryptTranscriptSegments() or accessor
[ ] Output contains text, not *_enc columns
[ ] No raw SELECT * from transcript tables
```

---

## Phase 3B: Transcript Encryption Enforcement (Commit `e751b7a2`)

**Stop plaintext drift** - encryption required via DB trigger.

### Stage Model (Clarified)

| Stage | Plaintext | Encrypted | Enforcement |
|-------|-----------|-----------|-------------|
| **A** | ✓ writes | ✓ optional | None (code-level) |
| **B** | ✓ writes | ✓ required | DB trigger (INSERT/UPDATE) |
| **C** | ✗ removed | ✓ only | DDL (`text DROP NOT NULL`) |

**Why Stage B still writes plaintext**: The `text` column has `NOT NULL` constraint.
Removing that constraint requires a separate migration after Stage B is stable.

### Prerequisites

1. Phase 3A complete (migration applied)
2. Backfill complete (0 rows with `text_enc IS NULL`)

### Code Changes

- **`isTranscriptStageBActive()`** - semantic flag for `PHI_TRANSCRIPT_STAGE_B=true`
- **SupervisionStore/PracticeStore** - dual-write (text + text_enc) when encryption enabled
- **DB triggers** - enforce `text_enc IS NOT NULL` on INSERT and UPDATE

### Migration

`database/migrations/20260122_transcript_encryption_3b.sql`:
- `enforce_transcript_encryption()` trigger function
- Triggers on both transcript tables (INSERT and UPDATE)
- Requires `text_enc IS NOT NULL`
- Rollback script included

### Rollout Checklist (Safe Order)

1. **Verify backfill complete**:
   ```sql
   SELECT COUNT(*) FROM supervision_transcript_segments WHERE text_enc IS NULL;
   SELECT COUNT(*) FROM practice_transcript_segments WHERE text_enc IS NULL;
   -- Both should return 0
   ```

2. **Run Phase 3B migration** (trigger enforcement):
   ```bash
   psql -d maia_consciousness -f database/migrations/20260122_transcript_encryption_3b.sql
   ```

3. **Verify triggers exist**:
   ```sql
   SELECT tgname FROM pg_trigger
   WHERE tgname IN ('enforce_supervision_transcript_enc', 'enforce_practice_transcript_enc');
   -- Should return 2 rows
   ```

4. **Deploy code** (dual-write always when encryption enabled)

5. **Set env**: `PHI_TRANSCRIPT_STAGE_B=true` (semantic flag)

6. **Verify enforcement**:
   ```sql
   -- This should fail with "PHI enforcement" error
   INSERT INTO supervision_transcript_segments (session_id, speaker, start_ms, end_ms, text)
   VALUES (gen_random_uuid(), 'TEST', 0, 1000, 'test');
   ```

### Rollback (if needed)

```sql
DROP TRIGGER enforce_supervision_transcript_enc ON supervision_transcript_segments;
DROP TRIGGER enforce_practice_transcript_enc ON practice_transcript_segments;
-- Then unset PHI_TRANSCRIPT_STAGE_B in env
```

### Phase 3C (Future)

To move to encrypted-only (remove plaintext):

1. Verify Stage B stable (no trigger failures)
2. Run: `ALTER TABLE supervision_transcript_segments ALTER COLUMN text DROP NOT NULL;`
3. Run: `ALTER TABLE practice_transcript_segments ALTER COLUMN text DROP NOT NULL;`
4. Update code to stop writing plaintext
5. Backfill `text = NULL` for all rows

---

## Security Exceptions (Documented)

### GHSA-8qq5-rm4j-mr97, GHSA-r6q2-hw4h-h46w (`tar` via `node-gyp`)

**Severity:** High (6 instances in dependency graph)

**Scope:** Present in prod dependency graph via native module install tooling:
```
sqlite3 / swisseph → node-gyp → make-fetch-happen → cacache → tar
```

**Runtime Impact:** Not invoked by application runtime; only executes during dependency install/native compilation. The vulnerable `tar` code path (archive extraction with path traversal) is never called by the running application.

**Mitigation:**
- Production deploys use CI-built artifacts/Docker images
- No package installation occurs on production hosts
- CI runners are ephemeral with least privileges

**Condition:** This exception is valid **only if** production deploys do **not** run `npm install` (or any dependency installation step) on production hosts. Installs occur in Docker build stage; runtime image is immutable.

**Verification (deploy checklist):**
- [ ] Confirm deploy pipeline uses pre-built artifact/image (no install step on prod host)

**Plan:** Monitor upstream dependency updates; re-evaluate when sqlite3/swisseph release versions that remove/patch the vulnerable tar chain.

**Last Reviewed:** 2026-01-21
