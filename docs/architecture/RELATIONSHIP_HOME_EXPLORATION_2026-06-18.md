# Relationship Home — Exploration & Minimal-Slice Proposal

**Date:** 2026-06-18 · **Status:** Exploration + proposal (no code written) · **Discipline:** observe-first, small verified slices, no prod changes

> Brief premise: *people enter Co-lab through relationships (therapist–client, supervisor–therapist, circle, couple, team), not as isolated users/channels.* Design the first practical **Relationship Home** that supports therapist–client use without becoming Slack, a CRM, or an EHR. Organizing phrase: **"messages as one tab, not the center."**

---

## 0. Headline finding (read this first)

**This is not greenfield. It is a reconciliation problem.** The repo already contains **at least four built worlds** and, *within* the practitioner↔client world, **3–4 overlapping "relationship/case/container" objects** created at different times that do **not reference each other**. The team/Co-lab world and the practitioner↔client world are **separate silos** with essentially one bridge.

So the dominant risk is **adding a fifth model**. The disciplined first move is: **pick one existing anchor, build a thin read-only *view* over what is already wired, and write a reconciliation map — do not introduce a new relationship table.** ("Earn before name": the relationship object should be *discovered* from what's already load-bearing, not declared.)

A second hard finding: **there is no client-facing visibility model.** Privacy today is enforced by *route auth* (practitioner-only endpoints), not by a data-level `shared_with_client` flag. Therefore a **client-facing** Relationship Home cannot ship safely yet — it requires a visibility/consent model first, and the **Session Room consent ledger is the gold-standard template** already in the repo.

*(Liveness verdicts below are from read-only code exploration — grep for callers/routes. Confirm against real prod data before building.)*

---

## 1. Current repo findings (with file paths)

### A. Practitioner↔client clinical world — FRAGMENTED (the core problem)
Multiple overlapping "relationship/case/client" objects, built separately:

| Object | Migration | "Client" rep | Practitioner FK | Notes |
|---|---|---|---|---|
| `practitioner_clients` | `20260116000001_practitioner_portal.sql` | first-class record (email, birth_data, tier) | `→ practitioners(id)` | **Most wired** (UI + sessions + decisions + comms) |
| `practitioner_cases` | `20260107000001_practitioner_caseload.sql` | `client_identifier` **string** + encrypted name | `→ members(id)` | Owns `case_notes`, `case_memories`, `maia_consultations` |
| `rl_containers` / `rl_practices` / `rl_agreements` / `rl_participants` | `20260120000001_relational_ledger.sql` | `rl_participants` | practice-scoped | Richest *relational* model; owns **agreements** + **practices** |
| `member_relationships` (+ `relationship_field_state`, `relationship_entries`) | `20260403000001_relationship_field_v1.sql` | end-user's own relationships | `→ members(id)` | End-user "Personal Field" relational tracking, **not** practitioner-scoped |
| `client_relationships` | `20260118000002_…enhanced_clients.sql` | synastry pairing | — | Chart overlays between two clients |

**Divergence signal:** FK targets disagree (`practitioner_cases.practitioner_id → members` vs `practitioner_clients.practitioner_id → practitioners`), confirming these were built independently. There is **no single "the ongoing relationship between P and C" object** — there are several partial ones.

Built practitioner UI already exists: `app/studio/clients/page.tsx`, **`app/studio/clients/[id]/page.tsx`** (client detail — the natural host for a "home" view).

### B. Session Room — WIRED, and the consent gold standard
- `scribe_sessions` — `database/migrations/20260126000001_scribe_sessions.sql` (+ `…20260614000001_session_agreements.sql`). `member_id → members`, `client_id → practitioner_clients`, `container ∈ solo|witness|practitioner`, `privacy_mode/mode`, `agreement_*`, `video_link_reveal_allowed`, `room_state`. WIRED (`/api/scribe/start|consent|stop`, `/api/studio/sessions/[id]/agreement`).
- `session_consent_events` (append-only ledger) + `session_join_tokens` (scoped, hashed, per agreement-version) — **fail-closed reveal**: link shown only if the latest client event for the current agreement version = `accept`. Logic in `lib/session/ClientConsent.ts`. **This is the template for any client-shared surface.**

### C. Co-lab durable objects — WIRED
- `studio_decisions` — `20260208000002_studio_decisions.sql`. **The one cross-world bridge:** has **both** `client_id → practitioner_clients` **and** `source_channel_id → team_channels` / `source_message_id → team_messages`. (Capture-as-Decision routes: `/api/team/channels/[id]/decisions`, `/api/team/decisions`.)
- `studio_tasks` — `20260202200001_studio_tasks.sql`; `source_decision_id → studio_decisions`. Decision→task flow is live.
- `studio_teams` / `studio_team_members` — `20260202100001_studio_teams.sql`; `team_channels.team_id → studio_teams` (`20260609000001_soulcomms_multi_team.sql`). A "team" = collaboration scope, **not** a clinical dyad.
- **"Agreements/practices" exist only in the `rl_*` ledger (silo B/A), not wired to teams. "Open questions" / "current focus" = ABSENT** (no table).

### D. Memory & boundaries — what must never leak
- `pending_review_candidates` (`20260314000002_…`) — MAIA **internal candidate** memory, 7-day expiry, `promoted_at NULL = unconfirmed`, practitioner-only review pipeline (`/api/studio/review/*`). **DO NOT EXPOSE.**
- `case_memories` vs `case_notes` — `case_notes` = practitioner's private working notes (no client read path today); `case_notes.maia_analysis`, `case_memories.significance`/`review_lens_id`/`source_candidate_id` = MAIA internal. **Practitioner-only.**
- **Sanctuary** — `privacy_mode='sanctuary'` / `mode='sanctuary'` (`/api/maia/session/start`); blocks downstream memory formation. Sealed content must **never** surface in any aggregation.

### The silo map
`team-world (studio_teams · team_channels · team_messages · studio_decisions · studio_tasks)` and `practitioner-world (practitioner_clients · practitioner_cases · rl_* · scribe_sessions)` are **disconnected**, except:
- `studio_decisions.client_id` (decision ↔ client), and
- `comms_threads.case_id` (clinical messaging ↔ `practitioner_cases`; `20260122_comms_spine.sql`).

---

## 2. Recommended domain model

1. **Do not add a new relationship table.** Treat "Relationship Home" as a **read-only projection (aggregation query) over existing wired objects**, not a new write model. A home is a *view*, not a row.
2. **Pick one anchor — recommended `practitioner_clients`** (it already has the UI, and is the FK target of sessions, decisions, and messages). *First* confirm with live data which model is canonical (some may be dormant). The other models reconcile *to* the anchor over time; they are not unified in code in this slice.
3. **Map the home's sections to existing stores** (read-only, practitioner-side):
   - *People* → practitioner + `practitioner_clients`
   - *Next / recent session* → `scribe_sessions WHERE client_id = ?`
   - *Decisions / commitments* → `studio_decisions WHERE client_id = ?`
   - *Shared agreements* → `rl_agreements` (or `session_agreements`) — **read-only; provenance-grounded**
   - *Notes* → `case_notes` **count + titles only, practitioner-only** (never content to a client; never `maia_analysis`)
   - *Tasks* → `studio_tasks` via decisions
   - *Messages* → existing Co-lab/comms thread as **one tab**
   - *Open questions / current focus / active practices* → **mostly ABSENT**; do not invent now (see §6)
4. **Client-facing visibility is a separate, later capability.** It is absent today and must be modeled on the **Session Room append-only consent ledger** (fail-closed), not a boolean bolted onto notes.

---

## 3. Proposed minimal slice (Slice 1)

**A read-only, practitioner-only "Relationship Home" tab on the existing `app/studio/clients/[id]` page** (extend, don't replace), reorganized around continuity:

- Sections: *Next/recent session · Open decisions · Agreements · Recent notes (titles/count, practitioner-only) · Messages as one tab.*
- **Pure aggregation of already-wired data. No schema change. No new object. No client exposure.** (Client-facing view explicitly deferred to a later, gated slice.)
- Proves **"messages as one tab, not the center"** with zero new model and zero new risk surface.
- **Verification:** load a real client; confirm their sessions/decisions/agreements surface correctly and chronologically; confirm Sanctuary/sealed sessions and `pending_review_candidates`/`maia_analysis` never appear; confirm it reads only the anchor's data (no cross-practitioner leakage).

---

## 4. Risks & consent boundaries

- **DO-NOT-EXPOSE (to client; and never surfaced as fact):** `pending_review_candidates`; `case_notes` content + `maia_analysis`; `case_memories.significance`/`review_lens_id`/`source_candidate_id`; any `sanctuary`/sealed session; any MAIA candidate/inferred memory.
- **Visibility gap (load-bearing):** privacy is currently route-auth, not a data flag. **Do not ship a client-facing view without a real visibility/consent model** — adopt the Session Room ledger pattern (append-only, fail-closed). A naive `shared_with_client` boolean is insufficient.
- **Fragmentation risk:** building on the wrong anchor entrenches one competing model. Mitigated by making Slice 1 *read-only aggregation* (cheap to repoint) and writing the reconciliation map first.
- **Sanctuary:** sealed-session content must never enter any aggregation/timeline.
- **Drift:** these silos are exactly the declared-vs-actual divergence pattern — the home view should not paper over it; PR 0 names it.

---

## 5. Suggested PR sequence (small, off `clean-main`, verified, no prod-disrupting refactor)

- **PR 0 — Reconciliation map (doc, no code):** confirm with live data which relationship model is canonical/used; decide the anchor; record the silo bridges. Output: a short decision doc.
- **PR 1 — Read-only practitioner Relationship Home tab** on `clients/[id]`: aggregation query + view over wired stores (sessions, decisions, agreements, note titles, messages-as-tab). Verified behavior; no schema change.
- **PR 2 — (optional) "Current focus" / "open questions"** *only if a real need surfaces*: small, **member/practitioner-authored** (no AI synthesis), following the explicit-capture pattern of decisions.
- **PR 3 — (gated, later) Client-facing view:** requires the visibility/consent model (Session Room ledger pattern) designed + built first. **Not before.**

---

## 6. What NOT to build yet

- ❌ A new `relationship`/`case` table — do not add a fifth model.
- ❌ Silo unification / cross-FK migrations — that's a large reconciliation; do the map (PR 0) first.
- ❌ A client-facing Relationship Home — blocked on the visibility/consent model.
- ❌ EHR or billing.
- ❌ Surveillance: presence dots, seen-by/read-ranking, typing indicators, activity scoring, engagement nudges.
- ❌ Exposing MAIA candidate/internal memory or practitioner-private notes (content or `maia_analysis`).
- ❌ Making channels the primary model — *and* don't rip them out; the relationship view references them as one tab.
- ❌ Synthesizing "what this relationship is" from conversation — surface only explicitly-authored, provenance-grounded items.
