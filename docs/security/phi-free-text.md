# Free-Text PHI Doctrine

**Scope:** Any user- or practitioner-authored text that can contain identifying information, clinical content, or sensitive context. In this system, **free-text is PHI by default unless explicitly proven otherwise**.

This doctrine governs:

* **Direct client content:** `client_messages.body`, transcript segments, notes, emergency info
* **Clinical context / AI artifacts:** consultations, insights, async job outputs
* **Memory + embeddings:** stored "case memories" and vectors derived from PHI
* **Exports:** CSV/PDF/print views, digests, admin tools

---

## Do Not Break These Invariants

### 1. Free-text is PHI by default

If a column stores prose, dialogue, notes, summaries, or assessments, treat it as PHI.

### 2. Encryption at rest is mandatory for critical free-text

Direct client content and transcripts must be stored encrypted (or dual-written during transition).

### 3. Decryption requires explicit practitioner auth context

No "background" decryption without a validated practitioner identity and authorization for that case/client scope.

### 4. No raw free-text in logs, analytics, or error reports

Logs may include **IDs, timestamps, lengths, and stable hashes**—never bodies/notes/transcripts.

### 5. No ciphertext leaves the data layer

`*_enc` / `*_enc_meta` must never appear in API payloads, UI props, exports, or logs.
All read outputs must be sanitized at the boundary (e.g., `stripEncryptedColumns()`).

### 6. Exports are an explicit consent surface

Exports must pass through a dedicated export pipeline with:
* consent gates (where applicable)
* redaction controls
* audit trail

### 7. Derived data is still PHI

Summaries, insights, safety assessments, embeddings, and "memory" content derived from PHI are PHI.
Do not treat "AI output" as de-identified by default.

---

## Inventory and Risk Tiers

### Critical Risk (Direct Client Content)

Must be encrypted at rest (dual-write allowed during transition):

| Table | Column | Current Status |
|-------|--------|----------------|
| `client_messages` | `body` | Dual-write Stage A |
| `supervision_transcript_segments` | `text` | **PLAINTEXT** (highest priority) |
| `practice_transcript_segments` | `text` | **PLAINTEXT** (highest priority) |
| `case_notes` | `content` | **PLAINTEXT** (high priority) |
| `client_emergency_info` | `medications`, `medical_conditions`, `risk_notes`, `safety_plan` | **PLAINTEXT** (highest priority) |

### High Risk (Clinical Context / AI Artifacts)

Strongly recommended to encrypt at rest:

| Table | Column |
|-------|--------|
| `supervision_insights` | `content` |
| `session_insights` | `content` |
| `maia_consultations` | `practitioner_query`, `maia_response`, `context_provided` |
| `supervision_jobs` | `output_data` |
| `safety_concern_logs` | `review_note` |

### Medium Risk (Practitioner Authored)

Encrypt if it can contain client identifiers, clinical context, or sensitive relational data:

| Table | Column |
|-------|--------|
| `practitioner_growth` | `observation`, `practitioner_notes` |
| `client_relationships` | `notes` |

### Special Case: Semantic Memory + Embeddings

Treat as PHI, even if it "doesn't look readable":

| Table | Column | Note |
|-------|--------|------|
| `case_memories` | `content` | Plaintext now |
| `case_memories` | `vector_embedding` | Derived from PHI and searchable |

**Rule:** Do not create embeddings from plaintext PHI unless you have a defined security posture for:
* encryption-at-rest of embeddings (or equivalent)
* access controls that match the underlying PHI scope
* deletion / retention requirements
* export prevention

---

## Standard Implementation Pattern

### Write Pattern (Dual-Write Transition)

For each free-text column `X`:

1. Add shadow columns:
   * `X_enc` (ciphertext)
   * `X_enc_meta` (encryption metadata)
   * (optional) `X_hash` (for safe comparisons / idempotency)

2. Stage A:
   * Continue writing plaintext `X` for compatibility
   * Dual-write encrypted `X_enc` + `X_enc_meta`

3. Stage B:
   * Stop writing plaintext `X`
   * Enforce constraints that prevent plaintext drift

### Read Pattern (Decrypt + Sanitize + Safe Output)

All read paths that return free-text must:

1. **Select encrypted columns (preferred)**
2. **Decrypt post-query** with practitioner auth context
3. **Return safe output**
4. **Sanitize at boundary** (`stripEncryptedColumns()`)

**Never:**
* Return raw `*_enc` columns
* Spread raw DB rows into API payloads without sanitization
* Log decrypted content

---

## Logging and Observability Rules

### Allowed in logs

* Record IDs
* Practitioner ID (non-PHI)
* Timestamps
* Byte/char lengths of content
* Stable hashes (e.g., SHA-256 of plaintext prior to encryption; never reversible)
* Error codes / failure categories (not raw content)

### Not allowed in logs

* Message bodies
* Transcript segments
* Notes content
* AI summary text
* "Debug dumps" of row objects that may include PHI

---

## Exports and Print Views

Exports are a separate security surface. All exports must go through a dedicated exporter that:

* Re-checks authorization at export time
* Applies consent gates (where applicable)
* Supports redaction modes (de-identified / minimal / full)
* Records an audit event (who exported, what, when)

**Never:**
* Export raw ciphertext (`*_enc`)
* Export plaintext from Stage A without explicit justification and review

---

## Migration Priority Order

This is the recommended sequence to reduce risk fastest:

### 1. Transcripts (highest exposure + most PHI volume)

* `supervision_transcript_segments.text`
* `practice_transcript_segments.text`

### 2. Emergency info

* `client_emergency_info.*`

### 3. Case notes

* `case_notes.content`

### 4. AI-derived content

* `supervision_insights.content`
* `session_insights.content`
* `supervision_jobs.output_data`
* `maia_consultations.*`

### 5. Memory + embeddings posture

Decide whether to:
* Encrypt embeddings at rest, or
* Store embeddings in a segregated security domain with strict RLS-equivalent controls, or
* Avoid embeddings for certain content classes entirely

---

## PR Checklist for Free-Text Read/Write Paths

When reviewing any PR touching free-text PHI:

- [ ] Free-text treated as PHI by default
- [ ] Write path dual-writes to `*_enc` (Stage A) or encrypted-only (Stage B)
- [ ] Read path decrypts post-query with practitioner auth context
- [ ] Response is sanitized with `stripEncryptedColumns()` at the boundary
- [ ] No logs contain free-text or row dumps
- [ ] No exports bypass exporter pipeline
- [ ] Tests updated/added to prevent regressions (tripwire coverage)

---

## Definition: "Proven Non-PHI"

A free-text field can only be treated as non-PHI if:

* It is structurally constrained to non-identifying tokens **AND**
* Validated/normalized on write **AND**
* Cannot contain clinical context or client-specific narrative **AND**
* Is reviewed as safe for logs/exports

**If unsure, treat as PHI.**

---

## Related Documents

* [PHI Encryption Do Not Break](./phi-encryption-do-not-break.md) — Identity PHI guardrails
* [PHI Columns](./phi-columns.md) — Column inventory and encryption patterns
* [Phase 2A Engineering Memo](./phi-encryption-phase-2a.md) — Identity PHI implementation
* [Phase 2B Enforcement Plan](./phi-encryption-phase-2b-plan.md) — Transition to encrypted-only
