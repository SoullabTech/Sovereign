# Member content retention — propagation inventory

**Type: evidence. Status: FINDINGS, not a proposal.**
No deletion capability is proposed, designed, or authorized here. Per founder ruling 2026-07-28: *inventory first, then define what "delete" truthfully means.*

Traced against `origin/clean-main-no-secrets @ 471bdf85c`. Subject: a member-authored **journal entry** — the most personal surface in the product, and the first case where the question was asked.

Origin of this lane: the #793 acceptance walk could not run its delete step, because no delete exists. That is not a CRUD omission. *The system currently asks members to trust memory they cannot revoke.*

---

## 0. Headline finding

> ### Deleting a member's account does not delete their journal content.

`app/api/members/delete-account/route.ts:88-117` revokes `auth_sessions`, then deletes `member_settings`, `member_sessions`, `members`, plus three best-effort tables from `OPTIONAL_CLEANUP` (`:35-39`) — `developmental_memories`, `google_calendar_credentials`, `memory_links` — each in its own savepoint.

It **never touches** `quick_journal_entries`, `episodic_memories`, `reflection_capsules`, or audio. Those tables key on `user_id TEXT` with **no foreign key to `members`**, so no database cascade compensates.

### 0.1 The endpoint tells the member otherwise

On success the route returns (`:125`):

> `"Account and all associated data permanently deleted"`

That statement is **not true**. The member's verbatim journal text, a second verbatim copy inside `episodic_memories`, a 1200-character excerpt in `reflection_capsules`, and a 768-dimension embedding of their writing all survive.

This is a claim-discipline failure as much as a retention one: the system makes a definite promise about the disposition of someone's most personal material and does not keep it. Under `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` the sentence is a *Vision* claim presented as a *Live* one — and it is presented at the single moment a member is most entitled to accuracy.

⚠️ **The cheapest correction is not a deletion feature — it is telling the truth in that string.** Whatever is decided about deletion, the message should be narrowed to what the endpoint actually does, and that change is independent of every other item here.

**Consequence:** a member who closes their account leaves behind their verbatim journal text, a verbatim copy inside `episodic_memories`, a 1200-character excerpt in `reflection_capsules`, and a 768-dimension embedding of their writing — now **owner-orphaned**, because the `members` row that identified them is gone.

Measured against CLAUDE.md's stated vows — *"Consent for memory — there is no stealth memory"*, *"no third party sits between users and their data"* — this is the gap that matters most, and it exists today independent of any new capability.

---

## 1. Class 1 — Primary artifacts

| Destination | Content | Entry id retained | Removed by account deletion |
|---|---|---|---|
| `quick_journal_entries` (`20260102000000:4-13` + `_audio.sql:4`) | **verbatim** `content.trim()`, plaintext; `tags`, `meta`, `audio_*` | is the id | ❌ **no** |
| Audio file `{cwd}/storage/audio/journals/{owner}/{file}` (`audio/route.ts:222-230`) | raw recording; rel path in `audio_path` | via `audio_path` only | ❌ no |

⚠️ `user_id` is **TEXT with no FK to `members`** — the structural reason nothing cascades.

⚠️ **Audio is on the ephemeral container layer.** `docker-compose.production.yml:176-195` mounts `voice_notes_data`, `vault_data`, `audit_data`, `media_data` — **`/app/storage/audio` is not among them** (verified on the running container: mounts are `/app/storage/voice-notes` and `/app/public/audiobook` only). Journal audio would therefore be destroyed by any container replacement. **Currently harmless: `rows_with_audio = 0`, and `find /app/storage/audio` returns 0 files — no journal audio has ever been written in production.** The trap is armed but has never fired. This is a *data-loss* risk, the inverse of the retention risk, and it should be fixed before the first voice journal entry exists. Host-side mount overrides outside this repo cannot be ruled out.

---

## 2. Class 2 — Derived artifacts

Written fire-and-forget from the POST handler (`journal/quick/list/route.ts:237-244`), so they are invisible at the call site.

| Destination | What it holds | Vector | Traceable to entry id |
|---|---|---|---|
| **`episodic_memories`** (`:28-72`) | ⚠️ **`experience_description` = the FULL raw `content.trim()`** — a complete verbatim second copy — plus an 80-char derived title | ✅ `semantic_vector`, 768d | ❌ **NO** — `episode_id` is `quick-{type}-{randomUUID}` (`:37`) |
| **`reflection_capsules`** via `createCapsule` (`capsuleService.ts:69-104`) | `summary` = **first 1200 chars of raw content** (`:95`) + title | ✗ | ✅ `source_id` = journal id |
| In-process embedding cache (`vector-embeddings.ts:260-265`) | `{text, vector, sha256}` | ✅ | ✗ | 

⚠️⚠️ **The `episodic_memories` copy is the hard case.** It is a *full verbatim duplicate* of the member's writing, and **there is no stored association back to the originating journal entry**. Deleting the journal row cannot find it. The only handle is the heuristic `experience_context LIKE 'quick_journal_%'`, which identifies the *class* of row, not *which* row. **Any promise of deletion that does not solve this is false**, and solving it likely requires a migration to record provenance before deletion is meaningful.

Embeddings: `nomic-embed-text` via local Ollama (`localEmbeddingClient.ts:13-23`) — no third party. Journal vectors land only in `episodic_memories.semantic_vector`, in the same row as the verbatim text. `semantic_memory_vectors` is written by the conversation path (`maiaService.ts:3272`), not journal.

---

## 3. Class 3 — Relational references

| Reference | Behaviour on primary-row delete |
|---|---|
| `reflection_capsules.source_id` → journal id | becomes a **dangling pointer**; no FK, so nothing prevents it |
| `episodic_memories` | not a reference — an unlinked duplicate (§2) |
| `member_memory_atoms.source_type='journal'` | declared **stub** only (`20260521000001:25`); **no writer exists** |
| `memory_links` | *is* removed by account deletion — the one derived structure that is |

---

## 4. Class 4 — Operational residue

| Residue | Detail |
|---|---|
| **Backups** | `scripts/backup-database.sh:20-21` captures both tables; `backup-db.sh:30` / `backup-postgres.sh:12` full `pg_dump`. Retention 30 days / 14 files. ⚠️ **No Stage-0 offsite pipeline exists in `scripts/`** — all targets are local dirs; offsite appears only in `docs/incidents/*` (PR #587 still open). |
| **Logs** | No entry *content* is logged. ⚠️ But `journal/quick/list/route.ts:103` logs the **full** member id, and `audio/route.ts:253` logs `relPath`, which contains the member id. |
| **Embedding cache** | in-process, per-process, TTL-bounded; holds source text until restart |
| **LLM provider** | journal previews are placed in prompts (§5) and sent to Anthropic. ❓ **Retention there is outside this repo and cannot be determined from it.** Any honest deletion promise must say so rather than imply otherwise. |

---

## 5. Could the material still influence MAIA after the visible row is gone?

The real sovereignty test. **Yes — by two paths, both surviving a primary-row delete:**

| Path | Mechanism |
|---|---|
| `SignificantMomentsService.loadJournals` (`:147-197`) → 150-char preview (`:285`) → prompt (`between/chat/route.ts:1199-1204`) | reads `quick_journal_entries` — **stops** on row delete ✅ |
| `MemberLiveContext` (`:393, 467-476`) → 200-char preview → oracle prompt | reads `quick_journal_entries` — **stops** ✅ |
| `sovereign/quotes/candidates` (`:106-153`) | reads the **episodic copy**, extracts verbatim quotes, returns them to the client — **continues** ❌ |
| Any consumer of `episodic_memories` / its `semantic_vector` | **continues** ❌ |

So deleting the journal row stops the *prompt-context* paths but **not** the episodic paths. A member's deleted writing could still be quoted back to them.

`JournalStore.ts:37-87` is a dead read (no callers).

---

## 6. What this permits us to promise

Three distinct promises. **They must not be merged under one generic "Delete" button** — the difference between them is exactly what a member would want to know.

**1 — Remove from view.** Content remains stored and may still influence the system.
*Achievable today* with a visibility flag. Honest, and much weaker than "delete" sounds.

**2 — Delete from active systems.** Primary and traceably-derived artifacts removed; backups expire on their own schedule.
*Not achievable today.* Blocked by the missing `episodic_memories` provenance link (§2) — the verbatim copy cannot be located from the entry. Requires a migration first.

**3 — Forget from future use.** Active artifacts removed **and** the material prevented from influencing future retrieval or personalization.
*Not achievable today.* Requires (2), plus vector removal, plus a truthful statement about LLM-provider retention we cannot verify from this repo.

⚠️ **Ranked by consequence, the work is: (a0) correct the false success message (§0.1) — hours, not a feature; (a) make account deletion actually delete; (b) give `episodic_memories` a provenance link so any deletion can find the duplicate; (c) mount the audio path before voice journaling exists; (d) only then design a member-facing gesture.** A delete button built before (b) would be a false promise implemented sincerely.

---

## 7. What this document does not do

It proposes no endpoint, no schema, no UI, and no migration. It does not rule on which promise the product should make. It establishes only what is true now, so that the promise chosen later can be kept.

Open question for ruling, stated plainly: **is the current account-deletion gap (§0) an incident, or a known defect to schedule?** It concerns member data already in production, and that classification is not Claude's to make.
