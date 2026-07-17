# Mentor-Surface Reconciliation Package

**Status:** DOCUMENTATION ONLY — Kelly's Ruling 2 (2026-07-17): *"There is only one MAIA. Rooms may shape her posture but may not create another identity."* No surface is removed or merged by this package; conversions happen one at a time, each after this behavioral comparison and its own approval. Evidence re-verified from source 2026-07-17 (file:line anchors in the underlying survey; agent evidence retained in session transcript).

## The shared shape (what all three have in common)

All three surfaces are **practitioner-facing**, wear MAIA's name, run on the shared `LLMProvider` (Anthropic Haiku, tier `fast` — except SessionReviewChat: `forceClaude`, tier `core`), append a strong shared epistemic discipline (`lib/studio/mentorDiscipline.ts` anti-diagnosis rules / `sessionReviewMode.ts` "reflection, not interpretation"), and are **deliberately memory-write-free**: none touches `conversation_turns`, atoms, or any member-memory table. That last property is not an accident — it is a privacy posture the canonical path does not currently have, and it is the central conversion constraint:

> **The canonical route (`/api/sovereign/app/maia/list`) fires member memory writeback on every turn** (`MemoryWritebackService.writeBack` at `list/route.ts:1233-1246`, plus `conversation_turns`/semantic-vector inserts in maiaService). Converting any of these surfaces without a structurally enforced **write-suppressed posture mode** would pour their content into the practitioner's personal long-term memory. For SessionReviewChat that content is a **client's transcript** — a practitioner-client privacy violation, not a bug.

**Prerequisite for ALL conversions (build once, first):** a posture channel on the canonical route — `posture` field validated against `MaiaPosture` (`lib/maia/presence/postures.ts`), carrying (a) the posture prompt addendum, (b) a **hard memory-write suppression flag** (sanctuary-grade, enforced at the route, not by prompt), (c) server-side object context fetch from `place.objectId` (never trusting client-supplied content), (d) practitioner-ownership auth for studio postures.

**Kelly's ruling on the enforcement shape (2026-07-17):** suppression must be enforced **below the prompt layer** — never a prompt instruction like "do not write memory in this posture." The posture contract declares an enforceable memory policy, and **the server — not the component — enforces it**:

```ts
memoryPolicy: {
  read:  'none' | 'member-authorized' | 'container-scoped';
  write: 'none' | 'member-memory' | 'container-scoped';
}
```

Concretely: the canonical route resolves the posture's `memoryPolicy` server-side and gates `MemoryWritebackService.writeBack`, atoms writes, `conversation_turns` inserts, and semantic-vector inserts on `write`, and the memory loaders on `read` — the same structural pattern Sanctuary already proves. Kelly's decision rule for tool-vs-posture: *"A function belongs to MAIA when relationship, continuity, and dialogue are essential to it. A bounded transformation may remain a tool."* — do not turn every intelligent function into a posture. And for SessionReviewChat specifically: *"The client's transcript is not raw material for the practitioner's AI memory"* — its conversion additionally requires authenticated/authorized transcript access (PR #622), zero write by default, an explicit client-words vs practitioner-reflections distinction, container-scoped provenance, and explicit consent rules for any later "keep."

---

## 1. `MentorPanel` (Decisions) — proposed posture: `decision-witness`

| Dimension | Current fact |
|---|---|
| Purpose | Inline decision reflection: always-visible template (Reflections / Micro-Practice / Sovereignty Check / Follow-up Intention) + opt-in one-shot "Go deeper with MAIA" |
| System prompt | `"You are MAIA Mentor — a sovereignty-oriented companion for practitioners navigating complex decisions"`; role "NOT to advise"; forced JSON `{questions[3], sovereigntyCheck, nextExperiment}` |
| State/memory | **No conversation at all** — one-shot generation; reflection JSON persisted to `studio_decisions.mentor_reflection` (cached, council-keyed); no member-memory touch |
| Content access | The one decision row + council result + last-5 experiences; strictly object-scoped |
| Consent/auth | `getCurrentPractitioner` → 401; `practitioner_id` row filter; no sanctuary concept |
| Absent from canonical | Structured JSON artifact generation; persistence onto the object record; council-keyed cache invalidation |
| Conversion risks | UI renders the JSON contract; the persisted artifact loses its writer; canonical has no structured-output channel |

**Honest classification note for Kelly:** this surface holds no dialogue — it is an **artifact generator** wearing MAIA's conversational name. Two compliant endpoints exist: (a) convert per ruling to a `decision-witness` posture whose *conversation* is canonical MAIA and whose artifact generation becomes a bounded tool she can invoke; or (b) reclassify the generator as a bounded tool (like the Ideas composer) and re-label its output so only actual conversation wears MAIA's name. Both satisfy "no second conversational being"; (b) is smaller. Flagged, not decided.

**Smallest safe migration (if (a)):** keep the one-shot generator endpoint as an internal tool (unchanged contract, artifact still persisted); route any *dialogue* need to canonical MAIA with `posture: 'decision-witness'` + place objectId; remove "MAIA Mentor" branding from the artifact panel. What is preserved: artifact cache, follow-up intention, practitioner scoping. What is lost: nothing (no dialogue exists to migrate).

---

## 2. `MentorChat` / `ChangeMentorPanel` (Changes) — proposed posture: `change-reflection`

| Dimension | Current fact |
|---|---|
| Purpose | Panel mirrors MentorPanel (+ Hexagram Wisdom field) **plus a real multi-turn SSE dialogue** ("Mentor Dialogue", "Ask anything about this change") |
| System prompt | `"You are MAIA Mentor — a sovereignty-oriented companion for navigating change"` + live-dialogue framing; change + hexagram + council context injected each turn |
| State/memory | Chat thread is **ephemeral React state only** ("Phase 1 — no DB persistence yet"); route stateless; "Save insight" overwrites `follow_up_intention` (500 chars); one-shot twin persists `studio_changes.mentor_reflection` |
| Content access | The one change row, council result, I Ching hexagrams, last-5 experiences |
| Consent/auth | `getCurrentPractitioner` → 401; `practitioner_id` filter; council-result required (400 otherwise) |
| Absent from canonical | Object-bound SSE dialogue; hexagram context; artifact persistence. Explicitly "no global MAIA memory, no full orchestration" — the inverse of canonical |
| Conversion risks | Memory-write policy question (below); JSON contract for the one-shot twin; council-gate; hexagram injection must be reproduced in the posture context |

**This is the real duplicate-identity case** (an actual second conversation wearing MAIA's name) — and also the **cleanest first conversion**: the dialogue is ephemeral by design, so there is no stored history to migrate; the practitioner is already an authenticated member; and the content is the *practitioner's own* material (their change), so memory-writeback is a consent-design question rather than a privacy violation. **Recommend converting this one first.**

**Smallest safe migration:** ① build the posture channel prerequisite; ② `MentorChat` opens canonical MAIA (presence sheet) with `posture: 'change-reflection'`, place carrying the change objectId; server fetches change+hexagram+council context by id under practitioner auth; ③ decide the write policy explicitly (default recommendation: write-suppressed until Kelly rules whether practice-material belongs in the practitioner's personal memory); ④ one-shot generator + Hexagram Wisdom artifact stay as a bounded tool (as in §1); ⑤ retire the `/mentor/chat` SSE route after a comparison period. Behavioral comparison to run before retirement: same 5 practitioner questions against both surfaces; compare specificity (hexagram/council reference), restraint, and latency (canonical is not Haiku-pinned — response-time regression is a real risk to measure).

---

## 3. `SessionReviewChat` (Session Room) — proposed posture: `session-review` — **HIGHEST RISK, CONVERT LAST**

| Dimension | Current fact |
|---|---|
| Purpose | Practitioner-only post-session review ("Review with MAIA"): three lenses (core/spiralogic/mentor), SOAP/DAP notes, intervention review, Parent Update. The client is a subject, never a user |
| System prompt | `"You are MAIA in Session Review mode. A practitioner is reviewing a completed session."` — "This is reflection, not interpretation. You offer; the practitioner integrates." `forceClaude: true`, tier `core` |
| State/memory | Client-held React state only; route **stateless and write-free** (reads scribe_sessions/transcript_entries/markers; zero INSERTs). Privacy is structural |
| Content access | The full (sampled at 800 segments) **client-session transcript** + markers — the client's own spoken words |
| Consent/auth | ⚠️ **The POST route has NO auth check** — any caller with a `reviewedSessionId` receives prompts built from a client transcript. Separate fix task spawned (add session auth + practitioner-ownership check). Independent of, and more urgent than, any conversion |
| Absent from canonical | Lens system, SOAP/DAP contracts, transcript sampling/repair, marker timeline, Parent Update |
| Conversion risks | **Client-content contamination:** canonical's writeback would store client-session content into the practitioner's personal memory/atoms under the practitioner's id. Also: consent — the client consented to a session with their practitioner, not to their words entering any MAIA memory system |

**Disposition:** retain as-is (its write-free statelessness is currently the strongest privacy property in this family) until: ① the auth hole is fixed; ② the write-suppression posture mode exists and is **tested to be structurally un-bypassable** for this posture; ③ a client-consent boundary is explicitly designed (what may a `session-review` posture retain? Recommendation: nothing — sanctuary-grade always); ④ the lens/note-format capabilities are ported as posture instructions + bounded tools. Only then convert, with the strict boundary Kelly named.

## Recommended conversion order

**0.** Fix `/api/scribe/review-session` auth (already spawned as its own task — not gated on any ruling). → **1.** Build the posture channel (write-suppression + object context + practitioner auth). → **2.** Convert `MentorChat` dialogue (`change-reflection`), run the behavioral comparison, retire its chat route. → **3.** Rule on artifact generators (posture-tool vs bounded-tool relabel), apply to Decisions + Changes panels. → **4.** Design the client-consent boundary, then convert `SessionReviewChat` (`session-review`). Each step returns for approval before the next.
