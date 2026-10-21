# ADMIN-READ-SOVEREIGNTY-01 — Operator Read-Access Census (READ-ONLY)

**Date:** 2026-10-01 · **Lane:** ADMIN-READ-SOVEREIGNTY-01 (opened by founder direction, first act) · **Act:** census only
**Bound to:** canonical `clean-main-no-secrets` @ `8e4372d18`
**Evidence class:** repository truth (code-read) only. No production database, container, env file or host was read. Every "reachable" below means *the code says so*, ⛔ not *runtime was witnessed*.
⛔ No migration · ⛔ no route change · ⛔ no deploy · ⛔ nothing repaired.

## 0. Why this lane exists

The 2026-10-01 disclosure correction (PR #1636, branch `fix/not-monitored-disclosure-20261001`, tip `bada8c3a0`, **OPEN, not on canonical**) replaced *"Your conversations are private"* with *"Your conversations are stored so MAIA can remember context. They are not monitored by a person…"*, and `__tests__/not-monitored-disclosure.test.ts` (same branch) refuses the "private" claim. The correction was made because conversations are stored for memory and are readable by anyone with admin or database access.

The founder's direction: (1) access logging on admin reads of member conversation content; (2) later, per-member encryption at rest; only then a stronger privacy claim. This record establishes what exists today.

⚠️ **Custody note.** Two artifacts named in the lane brief are *not* on canonical at `8e4372d18`: the disclosure + its test (PR #1636, open) and `lib/sovereign/clientPromptAuthority.ts` + `lib/sovereign/__tests__/clientPromptAuthority.test.ts` (PR #1635, branch `fix/prompt-authority-client-addenda-20261001`, tip `b74387f76`, open). They are cited here at those SHAs.

## 1. Bottom line

1. **No member conversation content is encrypted at rest.** Every table holding member- or MAIA-authored conversation text stores it as plaintext `text`/`jsonb` (§3). Encryption at rest exists only for the practitioner/clinical PHI family, under **one global key** from env.
2. **No read of member conversation content is logged with row identity or reason, anywhere.** The only admin access log (`admin_access_log`) records *route entry* for one of the three admin gates, is fail-open, and is not append-only (§2.1, §4).
3. **Backups are plaintext** gzipped `pg_dump`s, and a **full streaming replica** sits on a second host (§2.4).
4. **The app connects as the database superuser** (`POSTGRES_USER: soullab`), so any app-level control is bypassable by any code or person holding `DATABASE_URL` (§4.4).
5. ⚠️ **Three held security findings** — routes whose code admits a read of member-authored or session-transcript content without an adequate gate. Details are **withheld from this public record** and delivered to the founder directly (§6).

The honest claim the product can make today is the one PR #1636 makes, and no stronger.

## 2. Every path by which a human operator can read member conversation content

### 2.1 Gates in use (the three admin authorities)

| Gate | File | Identifies the human? | Logs the access? |
|---|---|---|---|
| **A** `isAdminRequest` / `requireAdmin` | `lib/admin/requireAdmin.ts:16` | ❌ shared `LABTOOLS_ADMIN_PASSWORD` string compare | ❌ nothing |
| **B** `checkAdminAuth` | `lib/admin/adminAuth.ts:48` | ✅ member session + `admin_role`, **or** ❌ the same shared password (granted `founder`) | ⚠️ route-entry row in `admin_access_log` (`via`, `member_id`, `admin_role`, `route`, `ip`); insert failure is swallowed — *"Audit log must never block access"* (`adminAuth.ts:40`) |
| **C** `requireFounder` | `lib/founder/founderAuth.ts:49` | ✅ session member ∈ `FOUNDER_MEMBER_IDS` | ❌ nothing |

`/api/admin/**`: 40 route files — 14 use B; of the other 26, 22 use A, 2 compare `LABTOOLS_ADMIN_PASSWORD` inline, and 2 use neither (§7). `admin_role` includes `tester` in `ALL_ADMIN_ROLES` (`adminAuth.ts:19`), the default for B callers that pass no role list.

Unmapped routes in `config/accessMatrix.ts` pass through `proxy.ts` unless `ACCESS_CONTROL_MODE=strict` (`accessMatrix.ts:797–813`); repository tests record that production does not set strict (`app/api/invites/__tests__/inviteIssuanceAuthority.test.ts:17`). ⛔ Production env not read.

### 2.2 API routes and pages that return conversation content (code-read)

| Route (page) | Gate | Tables | Content returned | Decrypt | Read logged |
|---|---|---|---|---|---|
| `app/api/admin/maia/engine-comparisons/route.ts:25,48–67` (`app/admin/maia/engine-comparisons`) | A | `maia_engine_comparisons` ⋈ `maia_turns` | `user_text` (member input), `maia_text`, shadow `response_text` | n/a (plaintext) | ❌ |
| `app/api/founder/relational-signals/route.ts:155,215–258` (`app/founder/relational-signals`) | C | `member_relational_signals` ⋈ `maia_turns` | `turn_user_text` (member's words) | n/a | ❌ |
| `app/api/founder/relational-patterns/route.ts:62,69–91` (`app/founder/relational-patterns`) | C | `relationship_entry_patterns`, `relationship_entries`, `member_relationships` | `relationship_entries.content`, evidence, counterpart name | n/a | ❌ |
| `app/api/admin/monitor/bugs/**` (`app/admin/monitor`) | B | `bug_reports`, vault attachments | member-written message; screenshots (may depict a conversation — uncertain) | n/a | ⚠️ route entry only |
| `app/api/team/admin/bugs/route.ts:25` (`components/team/AdminPanel.tsx`) | inline `members.roles` ∋ `team_admin`/`admin` | `bug_reports` | as above | n/a | ❌ |
| `app/api/studio/encounters/[id]/transcript/route.ts:123–156` | practitioner + ownership | `encounter_transcripts`, `transcript_turns` | practitioner session transcript | ✅ `lib/security/phiAccessors/encounterTranscripts.ts` | ❌ (owner path, not operator) |
| 3 further routes — **held**, §6 | — | — | — | — | — |

Admin routes checked and found to return **counts/metadata only** (no content): `admin/activity-feed`, `admin/command-center/{conversations,overview}`, `admin/opus-pulse/{summary,turns}` (`userPreview` hard-coded empty; `maiaPreview` is evaluator notes — uncertain), `admin/council/telemetry`, `admin/maia/substrate`, `admin/security`, `admin/beta-testers`, `founder/{today,signals}`.

Also an operator channel: `app/api/feedback/route.ts` POST writes a 100-char preview of member feedback to the server log (`:100`) and emails/SMSes the founder (`:15–46`) — member-authored text leaving the database by design.

### 2.3 Scripts (run with `DATABASE_URL`; no gate, no access log)

| Script | Tables | Content | Destination |
|---|---|---|---|
| `scripts/research/relational-field-shadow/export-blind.ts:44–86` | `maia_relational_field_shadow_runs` ⋈ `maia_turns` | `user_text` | files on disk |
| `scripts/research/relational-field-shadow/export-h8-current-act.ts:41–129` | `conversation_turns`, `maia_turns` | `content`, `user_text` | files on disk |
| `scripts/training/lora-finetune.py:84–95` | `maia_turns` + feedback | `user_text`, `maia_text` | training dataset on disk |
| `scripts/backfill-maia-turns-summaries.ts:126` | `maia_turns` | both sides | summarizer input |
| `scripts/backfill-training-data.sql:15–43` | `conversation_turns` → `maia_turns` | `content` | table-to-table copy |
| `scripts/proof-pattern-linking.ts:110–155` | `developmental_memories` | `content_text` | 50-char previews to console |
| `scripts/spotcheck-embeddings.ts:68–95` | `episodic_memories` | title/description | `/tmp/spotcheck_report.txt` |
| `scripts/assemble-transcript.js:153` | `supervision_transcript_segments` | segment text | re-assembled into another table |

`scripts/witness/temporal-memory-audit.sql` selects counts only. Remaining `scripts/witness/**` were not traced line-by-line (most seed synthetic fixtures) — **uncertain, not cleared**.

### 2.4 Paths outside the application

| Path | What it reads | Can the app log it? |
|---|---|---|
| `docker exec maia-postgres psql` / `psql` on minisforum as `soullab` (superuser) | everything, plaintext | ❌ |
| `pg_dump` backups — `scripts/backup-postgres.sh:7–15`, `backup-db.sh:30`, `backup-database.sh:36–52`, `maia-auto-backup.sh`; cron `setup-backup-cron.sh:55` | full database, **plaintext** `.sql.gz` (no gpg/openssl/age in any backup script) | ❌ |
| Hetzner streaming-replication standby over Tailscale (`docker-compose.production.yml:477–482`, `docs/ops/PROD_INFRA_RECONCILIATION_2026-06-14.md`) | full replica | ❌ |
| Container logs (`docker logs`) | whatever the app logs (e.g. the feedback preview above) | ❌ |
| Anyone holding `DATABASE_URL` (in `.env.production`) — incl. every script in §2.3 | everything | ❌ |

No `pgaudit`, `log_statement` or `log_connections` configuration exists in the repository.

## 3. Tables holding conversation content, and their encryption

Baseline = `database/baseline/0001_baseline_2026-09-01.sql`. Directly verified in this session: `conversation_turns.content text` (B:8107), `member_memory_atoms.body text` (B:12625), `practitioner_client_notes.content_enc` + `content_enc_meta` only (B:14500). The rest is from a full sweep, cited by line.

**Plaintext — no `_enc` column, no key:**

| Table | Content columns | Embeddings |
|---|---|---|
| `conversation_turns` | `content`, `meta` | — |
| `maia_turns` / `maia_turn_feedback` | `user_text`, `maia_text`, `observer_insights` / `comment`, `ideal_maia_reply` | — |
| `ask_threads` / `ask_turns` (`20260901000001`) | `anchor` / `body` | — |
| `maia_sessions`, `member_sessions` | `conversation_history`, `summary`, `themes` | — |
| `conversation_memory_uses` | `feedback_note` | — |
| `member_memory_atoms` | `title`, `body` | — |
| `developmental_memories` | `content_text`, `trigger_event` | `vector_embedding vector(1536)` |
| `episodic_memories` | `experience_*`, `verbatim_text` | `semantic_vector jsonb` |
| `conversation_insights`, `user_relationship_context`, `user_session_patterns` | `content` | several embedding columns |
| `somatic_memories`, `morphic_pattern_memories`, `journal_memory_packets` | jsonb / `summary`, `raw_extraction` | — |
| `member_daily_anchors` | `prompt_shown`, `response` | — |
| `quick_journal_entries`, `elemental_journal_entries`, `holoflower_journal_entries` | `content`, `prompt`, `intention`, `conversation_messages` | — |
| `member_reflections`, `selflet_messages`, `capture_notes`, `notebook_entries` | content | — |
| `voice_notes`, `session_voice_notes` | `transcript`, `drafted_note` | — |
| `bug_reports`, `platform_feedback` | `message`, `context` | — |
| `team_dm_messages`, `relationship_space_messages`, `relationship_entries`, `member_relationships` | `body` / `content` | — |
| `studio_companion_turns` | `content` | — |
| `supervision_transcript_segments` | `text` **and** `text_enc` (see below) | — |
| (secondary) `member_manuscripts`, `manuscript_working_drafts`, `manuscript_sections` | authored text | — |

**Encrypted (`*_enc` AES-GCM blob + `*_enc_meta`), global key `PHI_ENCRYPTION_KEY`:** `practitioner_client_notes`, `transcript_turns`, `encounter_transcripts`, `encounter_reflections`, `encounter_moments`, `encounter_interpretations`, `practice_transcript_segments` (DB trigger enforces), `supervision_transcript_segments`, `case_notes`, `client_messages`, `practitioner_messages`, `comms_messages`, `maia_consultations`, `client_emergency_info`, `coach_client_shared_items`. ⚠️ Several still carry their plaintext sibling column (e.g. `transcript_turns.text` beside `text_enc`); whether those siblings are NULL in production is ⛔ unread.

**Key custody, all families:** process env on the app host; no KMS; **no per-member key anywhere**. `members.encryption_key_salt` / `encryption_key_version` exist (B:13095–96) and **nothing reads them**.

## 4. A minimal append-only admin-read access log — what it would need

### 4.1 The record
One row per read act: `id` · `occurred_at` · **who** (`actor_member_id` — never NULL for a human read; a shared-password caller has no identity and therefore cannot be a lawful content reader) · `actor_role` · **what** (`table_name`, `row_ids uuid[]`, `subject_member_ids uuid[]` — identifiers only, ⛔ never content, excerpts or digests) · `route` / `entrypoint` · **why** (`reason_code` from a closed taxonomy + optional free-text `reason_note` authored by the actor) · `request_id`.
Append-only by trigger: refuse `UPDATE`, refuse `DELETE`, refuse `TRUNCATE` — the pattern already used by `ask_turns_append_only()` (`20260901000001_ask_threads.sql:104`) and the S3 authorization tables.

### 4.2 Why `admin_access_log` is not it
It logs route entry for gate B only, with no row identity, no subject member, no reason; insert failure is swallowed (fail-open); no append-only trigger; gates A and C never write to it. It answers *"someone opened an admin route"*, never *"whose words were read, by whom, and why"*.

### 4.3 Where enforcement must sit so a new route cannot bypass it
Gate-level logging (like B) is bypassed by any route that uses a different gate — already true of A and C. The read must be **unreachable without the log**:

- **One accessor seam.** All operator reads of content tables go through a single module (e.g. `lib/security/operatorRead.ts`) whose signature *requires* an established actor and a `reason_code`, writes the log row **in the same transaction** as the SELECT, and **fails closed** if the log write fails.
- **A pinning test**, modelled on `clientPromptAuthority.test.ts` (PR #1635): that test reads the real `maiaService.ts` source, extracts every key it reads, and fails when a new one is not covered — *the law is pinned against the code that reads it.* The analogue: scan every file under `app/api/{admin,founder,steward,team/admin,labtools}/**`, `app/**/admin/**` and `scripts/**` for any SQL naming a §3 content table (`FROM`/`JOIN conversation_turns|maia_turns|member_memory_atoms|…`), and fail unless that file reaches it only through the accessor. The content-table list is itself pinned: a new migration creating a table with a member-authored text column must be classified or the test fails. Include a non-vacuity floor (the scan must find > N real reads), as `clientPromptAuthority.test.ts` does with `toBeGreaterThan(20)`.
- ⚠️ A source-scan test pins **repository code**, ⛔ not runtime. It cannot see a script someone writes on the host and never commits.

### 4.4 What can and cannot be covered
| Covered by an app-level log | Not covered |
|---|---|
| admin/founder/team API routes and their pages | `psql` / `docker exec` on minisforum |
| committed scripts, if forced through the accessor (and run with an actor identity) | uncommitted ad-hoc scripts using `DATABASE_URL` |
| | backups at rest and restores; the Hetzner standby |
| | container log output |

Narrowing the uncovered column needs database-level measures, each its own decision: a non-superuser app role with no direct SELECT on content tables (reads only via a `SECURITY DEFINER` function that logs); `pgaudit` on those tables; separate custody of superuser credentials. **Even then, a superuser can disable triggers and read anything.** Only encryption with keys the operator does not hold changes that (§5).

## 5. What per-member encryption at rest would require

**Reusable pattern:** `lib/security/phiEncryption.ts` — AES-256-GCM, 12-byte IV, AAD binding `table/column/rowId/ownerId` (`:34–39`), key-id (`kid`) in each blob, multi-key load via `PHI_ENCRYPTION_KEY_<id>`, `needsReencryption`/`reencrypt` (`:407/:415`), `encryptForDB`/`decryptFromDB`; accessor modules under `lib/security/phiAccessors/*`; the PR-template PHI checklist (`.github/pull_request_template.md:49–57`: reads prefer `_enc`, writes NULL the plaintext, no silent decrypt fallback, AAD binding, no PHI in logs, dry-run/verify/resumable backfills); backfill tooling `scripts/backfill-phi-encryption.ts` et al.; Co-Lab gate §12 asserts `content_enc` non-NULL (`scripts/verify-constitution-colab.ts:294–303, 512`). The only per-owner key derivation in the codebase is `lib/caseload/ClientNameEncryption.ts` (master key + per-practitioner PBKDF2 salt, `:37, :66–76`).

**Hard parts:**
1. **Key custody — the whole question.** A per-member key derived from an env master key (the caseload pattern) is per-member *separation* but not operator *exclusion*: whoever holds the host env decrypts everything. Operator exclusion requires a key the operator cannot obtain — member-held/passkey-derived, or an external KMS with access policy — and that collides with MAIA reading memory server-side between turns.
2. **Memory retrieval over ciphertext.** Retrieval SQL ranks and filters on content in-database (e.g. developmental memory scoring). Encrypted text cannot be searched, ranked or deduped in SQL; it must be decrypted in the app per turn. `hashForSearch` (`phiEncryption.ts:342`) gives exact-match only.
3. **Embeddings.** `vector(1536)` and jsonb vectors are derived from plaintext and leak meaning (inversion, nearest-neighbour). Encrypting the text while leaving vectors in clear is not encryption of the content. pgvector cannot search encrypted vectors.
4. **Backups and replica.** Column encryption carries into dumps and the standby automatically — but the backup scripts themselves are plaintext today, and key backup/escrow must be separate from data backup or a restore is useless (or keys travel with the data and protection is void).
5. **Breadth.** ~30 tables, plaintext sibling columns, JSONB containers (`meta`, `conversation_history`), and every reader (memory bundle, summarizers, training exports, research scripts) needs migrating; dual-read during backfill.
6. **Erasure.** Per-member keys enable crypto-shredding, which interacts with the F5 erasure non-conformance already on record.

## 6. ⚠️ Held security findings — withheld from this public record

`SoullabTech/Sovereign` is a **public** repository. The sweep found **three routes** whose code, as read, admits a read of member-authored text or session-transcript text without an adequate gate (two with no gate in the route and unmapped in the access matrix; one gated to any signed-in member with no ownership check). Naming them here would signpost them. Route names, file:line references and evidence were delivered to the founder directly in-session.
Standing: **code-read only · ⛔ not runtime-witnessed** (production `ACCESS_CONTROL_MODE` and Caddy rules unread) · ⛔ not repaired · ⛔ no lane opened. These are defects against existing law (no stealth access), not design questions, and are likely more urgent than anything else in this record.

## 7. Adjacent observations — routed out, ⛔ not this lane

- `app/api/admin/partners/prelude/[id]/route.ts` has no auth check; it selects from `partners_prelude_responses`, which no migration defines. Not member conversation content.
- `lib/auth/clientSession.ts:28` falls back from session secret → `PHI_ENCRYPTION_KEY` → the literal `'dev-client-secret'`.
- `app/api/admin/reset-member-password/route.ts` uses its own `ADMIN_RESET_SECRET` (fail-closed) — a fourth admin authority.

## 8. Founder decisions owed before any implementation

1. **Held findings (§6):** repair now, separately from this lane — recommended.
2. **Shared-password admin (gate A, and B's password path):** may an unidentified caller read member content at all? Recommended: no — content reads require an identified actor.
3. **Log storage location:** same Postgres (simple; a superuser can alter it) · separate database/role the app can only INSERT into · off-host append-only sink. Recommended: same database with append-only triggers + an INSERT-only role, now; off-host later.
4. **Reason taxonomy:** the closed set of lawful reasons (e.g. `member_request`, `bug_investigation`, `safety_review`, `legal_obligation`, `research_with_consent`) and whether a free-text note is mandatory.
5. **Member visibility:** is the access log member-readable ("who read my conversations")? That is what would make a stronger claim honest.
6. **Scripts and research exports:** must committed scripts that read content go through the accessor, and do training/research exports need per-member consent?
7. **Database-level posture:** non-superuser app role, `pgaudit`, superuser credential custody.
8. **Encryption sequencing and key model:** which tables first (journals and memory atoms vs `conversation_turns`); envelope keys under a host master key (separation only) vs operator-excluding keys (changes how memory works); what happens to embeddings; backup encryption and key escrow — backup encryption is independent and cheaper, and could go first.
9. **Claim gate:** which property must be proven — and by what witness — before the product copy may say more than PR #1636 says.

*This record claims no privacy property the code does not have. Today: conversations are stored in plaintext, readable by operators and database holders, and those reads are not logged.*
