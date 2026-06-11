# RELATIONSHIP MEMORY v1 — Session Room ⇄ Person/Case Graph

**Status:** Designed (not built). Claim discipline: every capability below is **Designed** until it is built → wired → surfacing → verified. Nothing here is Live.
**Date:** 2026-06-11
**Owner decision:** Kelly — this is the next major Studio build *after* operational PRs #403/#405 (shipped + verified). Not metrics, not comms, not dashboards.
**Grounded in:** memory `project_session_room_scribe_diagnosis`, `project_practitioner_adoption_roadmap`; canon `MAIA_OATH.md`, Sanctuary Mode invariants (CLAUDE.md), `MARKETING_CLAIM_DISCIPLINE.md`.

---

## 0. The center

> Studio does not become indispensable when it stores sessions. It becomes indispensable when it **remembers people**.

"Stores notes" is a documentation tool. "Remembers my people" is a practice companion. This spec joins the two products that grew up separately — the practitioner-portal **client model** and **Studio Session Room** — by giving Session Room an edge into the person/case graph that already exists.

This is **not new architecture. It is a missing orbit.**

---

## 1. Grounded current state (prod, 2026-06-11)

The relational anchor already exists and has UI. The gap is a single missing edge.

| Object | Table | State | Role |
|---|---|---|---|
| **Person** | `practitioner_clients` | 8 rows / 2 practitioners; rich (`name`, `preferred_name`, `name_enc`, `email`, `intake_responses`, `last_session_at`, `internal_notes`, `tags`, `tier`, birth data, portal auth) | Durable anchor. Backed by `app/api/studio/clients/*` + client portal. |
| **Relationship/case** | `practitioner_cases` | 1 row (`presenting_concerns`, `intake_date`, `case_status`, `spiral_stage`, `facet_code`, `privacy_mode`) | Working engagement with a person. |
| **Memory graph** | `case_memories` | 2 rows (`case_id`, `content`, `significance`, `source_session_id`, `recall_count`, `vector_embedding`, `memory_type`, `evidence_refs`) | Per-relationship memory threads. Fed today by portal consultations/notes — **not** Session Room. |
| **Thread telemetry** | `…_shape_telemetry` | `active_thread_present`, `active_thread_confidence` (migration `20260317000001`) | Measures thread-aliveness. **Scope unverified — may be per-conversation, not per-relationship.** |
| **Session (container/consent)** | `scribe_sessions` | 69 rows; `memory_policy` (sealed/learning), `transcript_enabled`, `summary`, `booking_id` | What the practitioner starts. **No `client_id`/`case_id`.** |
| **Session (content)** | `supervision_*` | 72 sessions, 1,447 assembled turns, 27 `essence_summary`, 11,782 insights | Where review content actually lives. `case_id` exists but **0 populated**. |

**The gap (total):** sessions linked to a person = **0** (`scribe_sessions.booking_id` 0/69, `supervision_sessions.case_id` 0/72). Session Room creates an *encounter with no person attached.* That single missing foreign key is why the list reads "Witness session," why `case_memories` is stuck at 2 rows, and why Prepare Me cannot reach what Session Room produces.

In LeJEPA terms: the relationship collapsed into an isolated event because **there is no edge from the session to the person.** Representation didn't fail; the relationship was never connected to it.

---

## 2. The loop

```
Person (practitioner_clients)
  └─ Relationship (practitioner_cases, implicit/active)
       └─ Sessions (scribe_sessions ⇄ supervision_*)
            └─ Reviews (review-session, on Claude per #405)
                 └─ Case memories (case_memories, practitioner-curated)
                      └─ Prepare Me (reads the relationship before the next session)
```

Three stages: **Attach → Curate → Recall.**

---

## 3. Locked answers (owner rulings, 2026-06-11)

| # | Question | Ruling |
|---|---|---|
| 1 | Sanctuary boundary — may a `sealed` session participate? | **Sealed may attach as minimal metadata (client/case linkage = operational provenance), but generates NO durable memory** — no content, themes, summaries, embeddings, or Prepare Me recall. `learning` is eligible for practitioner-confirmed continuity memory. Plus a **stricter sanctuary** opt-out: "keep even the client link private for this session" → no linkage stored. |
| 2 | Unit of continuity — client or case? | **Client-first, implicit active case.** Attach to `client_id`; auto-ensure an active/default `case_id` behind the scenes. Do **not** make practitioners manage cases in v1. |
| 3 | Provenance — auto-extracted or curated? | **Curated, practitioner-confirmed, system-suggested.** MAIA may *propose* memory; the practitioner *places* it. No silent writing of a person's durable record. |
| 4 | When to build? | Spec now (preparatory). Build is the next major Studio build; #403/#405 "settle" = shipped + verified (already met). |

**Load-bearing principle (canon):** *"This encounter happened with this person" is operational provenance. "What it meant" is memory. Sanctuary forbids the second, not necessarily the first* — and the practitioner may forbid the first too.

---

## 4. Consent / Sanctuary matrix (the safeguard core)

Enforced **server-side**, not just in UI.

| `memory_policy` + choice | client/case link | content → `case_memory` | themes / summary / embeddings | Prepare Me recall |
|---|---|---|---|---|
| `learning` | ✅ | ✅ practitioner-confirmed only | ✅ on confirmed memories | ✅ |
| `sealed` (default) | ✅ minimal metadata | ❌ | ❌ | ❌ |
| `sealed` + "keep link private" (**stricter sanctuary**) | ❌ | ❌ | ❌ | ❌ |

Required UI copy at session start when `sealed`:
> **Sealed:** this session can remain attached to the client record for continuity of care, but its content will not be remembered or used in future preparation.

With an explicit control:
> ☐ Keep even the client link private for this session.

---

## 5. Data model — one migration, reuse everything else

**Add to `scribe_sessions`** (the practitioner-facing container):
```sql
ALTER TABLE scribe_sessions
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS case_id   UUID REFERENCES practitioner_cases(id)   ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_scribe_sessions_client ON scribe_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_scribe_sessions_case   ON scribe_sessions(case_id);
```
- Both nullable → today's behavior is preserved when no client is attached (solo, or practitioner skips).
- Stricter-sanctuary → both stay NULL.
- `case_id` propagates to the linked `supervision_sessions.case_id` once the supervision twin is created (linked via `supervision_sessions.metadata->>'scribeSessionId'`).
- `case_memories.source_session_id` references **`scribe_sessions.id`** (canonical session id) — confirm no existing consumer assumes otherwise.

No other schema change. `practitioner_clients`, `practitioner_cases`, `case_memories` are used as-is.

---

## 6. Stage specs (observability-first phasing)

### Phase 1 — Attach (the edge + the name)
**Goal:** a session knows who it is with; the list shows the person.
- **Session Room idle setup** (`app/studio/session-room/page.tsx`): client picker reading `GET practitioner_clients` for the practitioner (existing `app/api/studio/clients`). Optional. Plus the sealed-link-private checkbox.
- **`/api/scribe/start`**: accept `clientId` (+ optional `caseId`). Persist `scribe_sessions.client_id`. **Client-first implicit case:** if the client has an open `practitioner_case`, use it; else create a default case (status active) and use its id → `case_id`. Respect the consent matrix (stricter-sanctuary → store neither).
- **List label** (`page.tsx:920`): prefer the client's display name (`name_safe_label` / `preferred_name`, decrypted for the owning practitioner only) over the container type. Fixes "Witness session" → "Sophie Nezat — Jun 4".
- **Propagate** `case_id` to `supervision_sessions` when the twin exists.
- **Observability:** `[RelMem] attach { sessionId, clientIdPrefix, caseIdPrefix, memoryPolicy, linkStored: true|false }`.

**Phase 1 does not touch content or memory.** It is pure attachment + display.

### Phase 2 — Curate (review → case memory; `learning` only)
**Goal:** continuity-bearing material from a review enters the person's graph — placed by the practitioner.
- After a review completes (Claude path, #405), MAIA **suggests** candidate continuity items derived from the review (theme, commitment, follow-up, shift), each with proposed `significance` and an evidence ref back to transcript range. **Suggestions are not writes.**
- The practitioner selects/edits/confirms. On confirm → `POST` writes `case_memories` with: `case_id`, `practitioner_id`, `source_session_id` (scribe id), `content`, `significance`, `memory_type`, `provenance = 'practitioner_confirmed'`, `formed_at`. Embeddings computed only for confirmed rows.
- **Hard gate:** server rejects any `case_memory` write whose `source_session_id` resolves to a session with `memory_policy <> 'learning'`. Sealed → the curation surface is disabled with the matrix copy.

### Phase 3 — Recall (Prepare Me reads through the relationship)
**Goal:** before the next session, the practitioner arrives already inside the relationship.
- Prepare Me, given a `client_id`/`case_id`, reads: recent linked sessions (scribe/supervision), `case_memories` (**scoped `case_id` AND `practitioner_id`**), last `essence_summary`, and active-thread signals **iff** that telemetry is per-relationship (open Q §8).
- **Reconcile** with the existing Prepare Me source: today `/api/stellium/maia/prepare` reads stellium `client_history`. v1 extends/redirects it to read `case_memories`; decide unify vs augment (§8).
- Recall **structurally excludes** sealed-session material — sealed never wrote `case_memories`, so exclusion is by construction, not by filter.

---

## 7. Safeguards (must all hold)

1. **Consent gate (server-side):** content → `case_memory` only when `memory_policy = 'learning'`. Enforced at the write, not just the UI.
2. **Curated, not auto:** MAIA proposes; the practitioner places. Every `case_memory` carries `provenance = 'practitioner_confirmed'`. No silent writes to a person's record.
3. **Cross-client scoping:** every `case_memories` read / vector retrieval scoped by `case_id` AND `practitioner_id`. No similarity query may cross clients or practitioners.
4. **Stricter sanctuary:** "keep link private" → no `client_id`/`case_id` stored; the session is invisible to the graph.
5. **Provenance + no inflated claim:** the UI never says "MAIA remembers" for anything but confirmed, learning-sourced memories. Sealed sessions never surface as remembered. (Claim discipline: Live/Designed/Vision.)
6. **Encryption at rest:** client names are encrypted (`name_enc`); decrypt only for the owning practitioner. The Session Room list must not leak names cross-practitioner.

---

## 8. Open questions / dependencies (resolve during build)

- **active_thread telemetry scope:** is `active_thread_present` per-relationship or per-conversation? Verify before Prepare Me reads it; if per-conversation, do not surface it as relationship continuity.
- **Prepare Me source reconciliation:** unify or augment `stellium client_history` vs `case_memories`. (`project_practitioner_adoption_roadmap`: Prepare Me API exists, no UI.)
- **Name decryption path** for the list: `name_safe_label` vs `name_enc` + key version; confirm the read path and that it is practitioner-scoped.
- **`source_session_id` semantics:** confirm `case_memories.source_session_id` references `scribe_sessions.id` and no existing consumer assumes a different table.
- **Supervision propagation timing:** supervision twins assemble async; define when `case_id` propagates (at attach, or on assembly).
- **Default-case creation:** confirm `practitioner_cases` required fields (e.g. `client_identifier`, consent) can be satisfied by an auto-created default case without violating its own consent semantics.

---

## 9. Verification gates (observability-first, per phase)

**Phase 1:** attach logs show `linkStored: true` for linked sessions; the list renders the client name for a linked session and the container type for an unlinked one; a stricter-sanctuary session stores no link; a query proves no `client_id` resolves to another practitioner's client.

**Phase 2:** new `case_memories` rows appear **only** for `learning` sessions and **only** `provenance = 'practitioner_confirmed'`; a sealed session attempting a write is rejected (test); `SELECT count(*) FROM case_memories WHERE source_session_id IN (sealed sessions)` = 0.

**Phase 3:** Prepare Me surfaces `case_memories` for the correct client only; a cross-client query returns nothing; zero recall traceable to a sealed session; latency acceptable for a pre-session surface.

Discipline reminder: *declaration is not liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.* Each phase reports honestly what is actually wired.

---

## 10. What this v1 does NOT do

- No auto-memory; no LLM silently authoring a person's record.
- No cross-client or cross-practitioner retrieval.
- No "field state," "coherence," or RFI/UFI surface.
- No case-management UI (client-first, implicit case).
- No metrics/dashboards.
- No claim of "MAIA remembers" beyond confirmed, learning-sourced, practitioner-placed memory.

---

## 11. One-line summary

Attach Session Room to the person/case graph that already exists, let the practitioner place what mattered, and let Prepare Me remember through that relationship — with sanctuary preserved at every step. The first version of Relationship Memory that behavior has already justified.
