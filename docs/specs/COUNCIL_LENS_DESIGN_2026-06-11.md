# Council Lens — Design Brief

- **Date**: 2026-06-11
- **Status**: **Designed** (one component already **Live** in buried form — see §2). Nothing in this doc is authorized to build. Design-only, following the `PERSONAL_*_DESIGN_2026-06-11.md` house pattern.
- **Claim-discipline tag**: Designed · Center of gravity = *a reflective lens that surfaces long-view, conflict, and unheard voices*, not a council that decides.
- **Inspiration (named, not affiliated)**: the "elderhood as relational function" pattern — courage where there is fear, agreement where there is conflict, hope where there is despair, long memory, moral independence, listening to the unheard, interdependence/ubuntu. We borrow the **pattern**, never the brand. See §8 guardrails.

---

## 0. The one-sentence spine (load-bearing)

> **MAIA does not become the elder.** Council Lens names the questions an elder-council would ask, surfaces the voice least represented, and hands the discernment back to the human(s). It convenes a function; it does not occupy it.

Every decision below is downstream of that sentence. The moment Council Lens speaks *as* an authority, channels a real or indigenous elder, or resolves a conflict on the human's behalf, it has violated the spine and the [Sovereignty Invariants](../canon/MAIA_SOVEREIGNTY_INVARIANTS.md) — and must not ship.

---

## 1. Why this is small, not a module

Constraint from CLAUDE.md: *prefer small composable features over a giant new module.* This brief honors that. Council Lens is **a lens that composes into three surfaces that already exist**, in ascending order of risk/effort:

| Surface | Already exists | Council Lens adds |
|---|---|---|
| **A. Session Review** | `components/studio/SessionReviewChat.tsx` — `ReviewLens = 'core' \| 'spiralogic' \| 'mentor'` + `LENS_PROMPTS` record (`:42`, `:76`) | Promote the buried "Council report" prompt into a first-class `council` lens with the 6 elder-functions as prompts. **← minimal PR** |
| **B. MAIA chat** | `lib/voice/voiceCommands.ts` — `MaiaMode = 'talk'\|'care'\|'scribe'` + `CareSubMode` enum + `getModeSystemPrompt()` (`:1520`) | A *council reflection* — as a **Care sub-mode** or **scribe reflection lens**, **not** a new top-level mode. (Designed only.) |
| **C. Governance / Decisions** | `app/studio/decisions/{page,new,[id]}` + Co-Lab (`app/team/*`, `app/stellium/comms`) | An optional "council pass" on a decision: the long-view / conflict / unheard-voice questions as a review overlay. (Designed only.) |

No new top-level route. No new mode. No new app.

---

## 2. What already ships (the honest baseline)

`SessionReviewChat.tsx:65` already renders:
```
{ label: 'Council report', prompt: 'Generate a Council Report for this session — one voice per element.' }
```
This is **Live today**, buried as one of four buttons under the `spiralogic` lens. So the truthful claim is: *the Council primitive exists; it is under-surfaced and under-extended.* This mirrors the project's own "discoverability outranks enhancement" finding — the first move is to **surface and structure a working primitive**, not invent one.

---

## 3. The six elder-functions × Elemental Alchemy

The de-branded functions, mapped to the canonical `Element` type (`lib/types/interpretive-ledger.ts:32`) and facets (`app/api/_backend/src/constants/elementalFacetMap.ts`). These become the **prompt set** for the lens.

| Elder-function | Element | Facet anchor | Council question |
|---|---|---|---|
| Courage where there is fear | **Fire** | Spark → Flame | "What courage is being asked for here, and what fear is operating against it?" |
| Agreement where there is conflict | **Air** (+ Water) | Idea / clarity | "Where is conflict masking a possible agreement? What is each side actually protecting?" |
| Listening to the unheard | **Water** | Tide / Abyss | "Whose voice is least represented in this? What would they say if present?" |
| Root-cause long view | **Earth** | Seed / Structure | "What is the long view? What root cause is being avoided for short-term relief?" |
| Hope where there is despair | **Aether** | — | "Where is hope still structurally available, not as reassurance but as real option?" |
| Interdependence / ubuntu | **Aether** | — | "Who else is affected? What does the whole field need, not just the loudest part?" |

Important: these are **facets of one reflection**, explicitly framed as lenses — never personified as separate authorities, channeled beings, or named real elders. (See §8.)

---

## 4. Feature list

1. **`council` review lens** (Surface A) — 4–6 prompts above, added to `LENS_PROMPTS`. Reuses the existing session-review LLM call end-to-end. *No schema, no new route.*
2. **Council Report formatting** — structured output: one short passage per active element + a closing "the question this leaves with you" (a handoff, not a verdict).
3. **Council reflection in chat** (Surface B, design-only) — a Care sub-mode / scribe lens that runs the same six questions over a live conversation when the human asks to "slow this down."
4. **Decision council-pass** (Surface C, design-only) — an optional overlay on `studio/decisions/[id]` that runs the long-view / conflict / unheard questions over a pending decision and stores the pass as reflection (not as a recommendation).
5. **Founder governance orientation** (Surface C, design-only) — the same pass available to the proposer/approver flow as *orientation before deciding*, wired to the existing `CONSTITUTIONAL_AUDIT_PROCESS.md`, never as an override.

---

## 5. UX flow & prompt architecture

**Surface A (minimal PR):**
1. Session ends → `SessionReviewChat` loads as today.
2. Lens selector now shows a 4th option: **Council**.
3. Selecting it reveals the six elder-function prompt buttons.
4. Practitioner taps one (or "Full council report") → existing review endpoint → response rendered as a Council Report card.
5. Closing line is always a **handoff question**, never a directive.

**Prompt architecture** — a single system preamble injected ahead of the chosen council prompt:
> *You are convening a brief council reflection. Speak each element as a distinct facet of attention, not as a person or authority. Surface the unheard voice and the long view. End by returning the discernment to the practitioner as an open question. Never instruct, diagnose, or decide.*

This preamble is the runtime enforcement of §0. It lives beside the existing `getModeSystemPrompt()` convention.

---

## 6. Suggested names (route / component / type)

- Type: extend `ReviewLens` → `'core' | 'spiralogic' | 'mentor' | 'council'` (`SessionReviewChat.tsx:42`).
- Constant: `COUNCIL_PROMPTS` + add to `LENS_PROMPTS` (`:76`).
- Chat (later): `CareSubMode` add `'council'`, or scribe reflection-lens `council`.
- Decision overlay (later): `components/studio/CouncilPass.tsx`; helper `lib/council/councilQuestions.ts` (single source of the six questions, imported by all surfaces).
- Copy/system-prompt constant: `lib/council/councilPreamble.ts`.

No new top-level `app/` route is proposed.

---

## 7. Database schema (only if/when we persist)

**Minimal PR needs none** — Surface A is stateless (reuses session-review). Schema enters only at Surface C, and even then prefer reuse:

- **Preferred (reuse):** store a decision council-pass as a `member_memory_atoms` row (`source_type: 'decision'`, body = the reflection) or in a `decisions.metadata JSONB` field. No new table.
- **Only if a first-class object is required (Later, gated):**
  ```sql
  -- council_passes: a reflection convened over a subject; never an authority record
  id              UUID PRIMARY KEY
  member_id       UUID NOT NULL REFERENCES members(id)
  subject_type    TEXT NOT NULL   -- 'session' | 'decision' | 'conversation'
  subject_id      UUID            -- nullable for ad-hoc
  questions       JSONB NOT NULL  -- the six functions surfaced
  reflection      JSONB           -- per-element passages + handoff question
  created_at      TIMESTAMPTZ DEFAULT now()
  -- NO 'recommendation', 'verdict', 'score', or 'decision' column — by design
  ```
  The deliberately-absent columns are the schema-level expression of §0.

---

## 8. Risks & ethics guardrails (non-negotiable)

1. **No affiliation, no brand.** Never use "The Elders" as a product name; never imply partnership with Peter Gabriel, The Elders, or any member. Internal/external copy says "council *function*," "elder *pattern*" — never the proper noun.
2. **No simulated authority (project vow).** The elemental voices are *facets of a reflection*, never personified councilors, channeled beings, or named real/indigenous elders. No "an elder says…" framing. This satisfies *refuse to simulate certainty, intimacy, or power*.
3. **Indigenous / local knowledge — function, not costume.** We honor "listening to the unheard" as a **relational discipline** (whose voice is missing), not as aesthetic borrowing, ceremony cosplay, or appropriated terminology. No invented "indigenous wisdom" text generation. If a real tradition is referenced, it is the human's to bring, attributed by them — MAIA does not author it.
4. **The Clearing discipline.** Per [`THE_CLEARING.md`](../canon/THE_CLEARING.md): the member/practitioner *places* significance; the system does not classify the person. Council Lens asks questions; it does not label the human or the conflict.
5. **Sovereignty Invariant check (CLAUDE.md gate):**
   - *Increases agency?* Yes — surfaces the unheard, returns the choice. ✅
   - *Pushes life outward?* Yes — orients toward real-world agreement/repair. ✅
   - *Reduces system centrality over time?* **Only if** MAIA stays the convener, not the elder. The handoff-question ending and the absent "verdict" schema are the enforcement. ✅ *by design, must be verified in use.*
6. **No guru stance.** Output is framing + open question. A council pass that ever returns "you should…" is a defect, not a feature.
7. **Failure test (claim discipline).** Public copy must survive: *if the model produced a confident, directive, persona-driven "elder verdict," would our framing have implied that was the intent?* If yes, the copy over-claims.

---

## 9. Copy options (interface)

**Lens label:** `Council` (sub-label: *one reflection, several voices*).

**Lens intro (Surface A):**
> A brief council reflection — courage and fear, conflict and agreement, the long view, and the voice least heard. Not advice. A wider angle, handed back to you.

**Closing-handoff template (always present):**
> *The council leaves you with this question: …*

**Chat entry (Surface B, later):**
> "Let's slow this down. What's the long view here? Who isn't being heard? What might still be agreed?"

**What it is / isn't (about / help text):**
> Council Lens doesn't replace elders or decide for you. It remembers that elderhood is a human function — and helps you hear it again.

---

## 10. Phased implementation plan

- **Phase 0 — Prototype (this is the only thing the minimal PR touches).**
  - Add `council` to `ReviewLens` + `COUNCIL_PROMPTS` + `councilQuestions.ts` + `councilPreamble.ts`.
  - Surface A only. Stateless. No schema, no new route.
  - Gate: builder/practitioner accounts first (matches the Clarify-Engagement / builder-gate precedent).
  - Verify: lens renders, council report returns, every output ends in a handoff question (the §0 enforcement is observable).
- **Phase 1 — Private testing.**
  - Real practitioner runs council lens on real session reviews. Observe: does it surface the unheard / long view without drifting into directive verdicts?
  - Only after observation: design the chat sub-mode (Surface B) and the decision council-pass (Surface C) as their own specs.
- **Phase 2 — Public launch.**
  - Default-on council lens in session review; opt-in council-pass on decisions.
  - Governance orientation wired to `CONSTITUTIONAL_AUDIT_PROCESS.md` — orientation, never override.
  - Persistence (`council_passes` or atom reuse) only if private testing shows it's wanted.

---

## 11. First minimal PR scope (if authorized)

**Branch off `clean-main-no-secrets`.** Surface A only:
1. `lib/council/councilQuestions.ts` — the six functions (single source of truth).
2. `lib/council/councilPreamble.ts` — the runtime §0 system preamble.
3. `components/studio/SessionReviewChat.tsx` — extend `ReviewLens`, add `COUNCIL_PROMPTS`, add lens to `LENS_PROMPTS`, render Council Report card with mandatory handoff line.
4. No migration. No new route. No schema. No new top-level mode.

Verification: `npm run typecheck` · `npm run check:no-supabase` · session-review renders the new lens · spot-check that outputs end with a handoff question. Then PR (gated behind the covenant/review process; do not self-merge or deploy).

---

*This brief borrows a relational pattern, not a brand. It surfaces a primitive that already ships rather than inventing a module. It is Designed, not Live, except for the one buried prompt named in §2.*
