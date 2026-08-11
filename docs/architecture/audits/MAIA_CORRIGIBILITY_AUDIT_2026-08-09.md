# MAIA Corrigibility Audit — 2026-08-09

**Part of the MAIA High-Target Tester Readiness Audit.** Scope: whether a member's corrections, refusals, and deletions propagate through future behavior — or merely accumulate beside the material they were meant to correct. Evidence: code audit of the working tree (`feature/labtools-redesign`) + production runtime probes on minisforum (container `b1399f693`, deployed 2026-08-06). Builds on and updates `AIN_MEMBER_CENTER_CORRIGIBILITY_STEWARDSHIP_AUDIT_2026-08-09.md` (same day, prior pass).

**Discipline**: built ≠ wired ≠ surfacing ≠ verified. Every verdict names which of those it is.

---

## 1. Deletion — what "delete my memory" actually deletes

`app/api/sovereignty/delete-my-memory/route.ts` deletes exactly **five stores** (`CONSCIOUSNESS_STORES`, ~L55–62): `elemental_evolution`, `wisdom_moments`, `ain_consciousness_memory`, `elemental_personalities`, `maia_adaptations`.

It does **not** touch: `member_memory_atoms`, `conversation_turns` (39,555 rows in prod), `episodic_memories` (115 rows), semantic embedding chunks (minted at `lib/sovereign/maiaService.ts:3287`), `agent_runs` (33,985 rows carrying `input_summary`/`output_text` — `lib/services/corpusCallosumService.ts:120`), session summaries, `member_spiral_state`, anchors, caseload captures/notes, or cloud backups.

**Repaired since the prior audit**: the route's former false-totality claim (`success: true` implying everything was deleted) is fixed in the working tree — it now authenticates via `getMemberIdFromRequest`, refuses cross-member deletion, and returns enumerated per-store counts. Pinned by `__tests__/deleteMemoryHonesty.test.ts`, which also records what it does *not* prove.

**Verdict: PARTIAL.** The route is honest about its scope, but its scope is a small minority of the member's actual memory footprint. A member who invokes it and believes "my memory is deleted" is wrong in nine substrates.

## 2. Correction propagation matrix

| Correction act | Substrate | Mechanism | Verdict |
|---|---|---|---|
| "That observation about me is wrong" | atoms (practitioner_observation) | `member_response_status='rejected'` via decline route `app/api/sovereign/atoms/[id]/decline/route.ts:108`; loader excludes at `lib/maia/memoryAtomsLoader.ts:282` | **PROPAGATES** (read-time exclusion, wired) |
| "Stop surfacing this" | atoms | status gestures `set_aside`/`archive`/`protect` (`lib/psyche/portfolio.ts:429-461`); loader admits only `active`/`still_alive` | **PROPAGATES** |
| "That's no longer true" (interpretive) | interpretive_ledger | `status='superseded'` supersession chain (`lib/consciousness/interpretiveLedger.ts:137`; `CONTRADICTION_WEIGHTS.user_correction=0.95`) | **BUILT, UNWIRED** — 0 importers, 0 production rows |
| Correction uttered in conversation | conversation_turns | none — the correction is just another row; conversational recall is recency-only (`lib/maia/memoryLoaders.ts:213`) | **APPENDS** — the named failure mode, present in the highest-traffic substrate |
| Un-mark an episode | episodic_memories | mark route is write-only; no retract path found | **NO PATH** |
| Un-mark a breakthrough | atoms | DELETE on `/api/sovereign/atoms/[id]/breakthrough` | **PROPAGATES** (wired; 0 breakthrough atoms exist in prod, so unexercised) |

**The central corrigibility fact**: the one substrate where members actually live (conversation turns — 39.5k rows, recency-loaded into every prompt) has **no correction semantics at all**. A member saying "that's not what I meant" produces a new turn that competes with, and eventually scrolls past, the misunderstanding — nothing marks the earlier material superseded. Meanwhile the substrate that *has* full supersession machinery (interpretive ledger, with explicit user-correction weighting) has zero callers and zero rows.

## 3. Consent gates inventory

| Gate | Schema | Read-enforced | Member-facing UI |
|---|---|---|---|
| Sanctuary Mode | `runtime_consent_state` posture (S5 migration `20260718000001`:32), immutable | YES — `contentWritable` refuses `agent_runs` writes (`corpusCallosumService.ts:113`); R18 episodic-mark refusal (`app/api/.../episodes/mark/route.ts:225-281`); finalize purge | YES — **implemented in code, not just doctrine** |
| atoms `return_preference` (default `member_pulled`) | `20260521000001`:115 | `memoryAtomsLoader.ts:279` | gesture route `set_return_preference` |
| anchors `surface_preference` | `20260702000003` | `loadRecentAnchors.ts:66` | `app/maia/anchor/history/page.tsx` — **0 production rows; gate presently vacuous** |
| `conversational_recall_enabled` | `20260524000001` (default TRUE) | `memoryLoaders.ts:244-249` | `MemoryConsentSection` in `AccountSettings.tsx:2842` |
| `episodic_recall_enabled` | `20260531000001`:108 | `memoryLoaders.ts:331-336` | **NOT in UI** — the toggle type exposes conversational only |

## 4. Resurrection vectors (open)

1. **Backups survive deletion.** `lib/services/cloud-backup.ts:152` `restoreBackup()` returns decrypted JSON to the caller (no DB writes), but snapshots are never purged when the member deletes — deleted conversation content is client-resurrectable from any pre-deletion backup. No deletion→backup-purge path exists. (Side finding: `cloud-backup.ts` still uses prisma + `uploadToSupabase` — contra the no-Supabase invariant; likely dormant legacy, flagged for removal.)
2. **Tombstones cover the wrong tables.** DB-level `pg_restore` resurrection is structurally refused only for `conversation_turns`/`agent_runs`/`integration_passes` deletions recorded in `deletion_manifests` + `provenance_tombstones` (`20260718000001_s5_provenance_substrate.sql:140-202`). The five delete-my-memory tables have **no tombstone triggers**.
3. **Embeddings are never corrected or deleted.** Semantic chunks minted at `maiaService.ts:3287` have no correction/deletion propagation.
4. **Substrate uncoupling.** Archiving or declining an atom does not suppress conversational recall of the *same material* from `conversation_turns` — the correction wins in one substrate and loses in another on the same turn.
5. **Practitioner copies** (caseload notes/captures) are untouched by any member act.
6. **Summary laundering** remains unconstrained/untested (prior audit gap K8).

## 5. Salience and forgetting

- Atoms: `ORDER BY is_breakthrough DESC, kept_at DESC` (`memoryAtomsLoader.ts:284`) — member-marked flag + recency only.
- Conversational: recency only; explicitly no relevance scoring.
- Episodic: `created_at DESC`; doctrine forbids system significance-ranking.
- `developmental_memories`: `significance DESC` / `similarity DESC` (`DevelopmentalMemory.ts:206,256`) — but only on the between/chat route.
- **No decay, expiry, or archival automation exists anywhere.** `applyDecay` is unreachable; `last_surfaced_at`/`surface_count` cooldown and decline-twice auto-revert are **schema-only** — the Phase 2 logic was never implemented.
- Distinctions that *do* exist and are enforced: `sacred_protected` (CHECK-enforced voice-ineligible), `protected`/`archived`/`set_aside` statuses, `member_pulled` default privacy.

**Verdict: ABSENT as an architecture.** MAIA has consent gates and member-gesture statuses (real, enforced), but no salience model — retrieval is recency plus one member-set flag. Nothing distinguishes ephemeral from constitutive; nothing decays; nothing quiets.

## 6. Mechanisms with no code at all

Supersession on turns/episodes · correction-to-embedding propagation · deletion→backup purge · tombstones for the delete-my-memory tables · episodic un-mark · episodic consent UI · decay/cooldown execution · cross-substrate correction fan-out · prompt-level authority layer for member corrections (prior audit gap K2).

---

## Scorecard inputs

| Dimension | Score | Basis |
|---|---|---|
| Corrigibility (atoms) | **PROVEN** (mechanism) | decline/status gestures read-enforced; runtime exercise thin |
| Corrigibility (conversation) | **ABSENT** | corrections append; no supersession |
| Deletion honesty | **PARTIAL** | route honest, scope narrow |
| Deletion completeness | **BROKEN** | 5 of ~14 substrates; backups survive |
| Consent gating | **PARTIAL** | strong where built (sanctuary, recall toggles); episodic UI missing; anchors vacuous |
| Salience/forgetting | **ABSENT** | recency + one flag; no decay implemented |
