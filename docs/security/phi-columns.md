# PHI Columns - Encryption Scope Contract

> **HIPAA Sprint 7 Phase 2A**
> This document defines the canonical list of PHI columns requiring encryption.
> All columns listed here MUST be encrypted with AES-256-GCM before HIPAA compliance.

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
| `case_notes` | `content` | TEXT | PLAINTEXT | Full session notes |
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
