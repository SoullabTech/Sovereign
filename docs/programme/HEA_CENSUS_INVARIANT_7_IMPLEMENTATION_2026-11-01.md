# HEA Census — Invariant 7 (Human World Priority): where it fires, and whether the member can decline

**Status:** READ-ONLY CENSUS · ⛔ no repair · ⛔ no proposal · ⛔ no authorization
**Date:** 2026-11-01 · working tree at `d74b261c7` (branch `fix/account-settings-save-feedback-20261031`; no Invariant-7-relevant file is modified in that tree)
**Stream:** `JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01` — input for the stream owner. Companion to `HEA_WORKING_NOTE_ATTENDING_AS_RELATIONAL_CONDUCT_2026-11-01.md` (PR #2027), whose §4 preserved the tension this census measures.
**Evidence class:** code-read throughout. This record says what the source instructs and wires; it does not say what any member has experienced or what the model actually emits.

---

## 0. Question

`docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` Invariant 7 — *"MAIA must periodically return attention to: body sensation · physical environment · time away from the interface · real-world experimentation."*

For each runtime mechanism that does this: **what triggers it, is it an invitation or a nudge, and can the member decline it?**

## 1. Headline findings

1. **No runtime code references Invariant 7.** `rg` for `invariant 7`, `invariant-7`, `Human World Priority`, `humanWorldPriority` across `lib/ app/ components/ config/` returns nothing. The invariant is named only in canon and four programme records. Nothing in the codebase claims to implement it.
2. **Nothing "periodically returns" attention on its own schedule.** There is no timer-, usage-, or session-count-driven mechanism that interrupts a conversation to point the member away from it. The one timer that exists (§2.4) is member-started and member-extended.
3. **The "body" axis is implemented as prompt instruction on the live path; the other three axes are not implemented as anything.** *Physical environment*, *time away from the interface* and *real-world experimentation* have no mechanism on the live text path beyond generic prompt language.
4. **The member-facing FAQ claims a mechanism the code does not contain.** `components/onboarding/FAQSection.tsx:237,245` tell the member MAIA "includes a self-auditing system … If your engagement starts pulling you away from your life, your body, or your people, MAIA will nudge you toward grounding." No self-audit or drift-detection module exists on the live path (§2.6). This is a claim-state finding under `MARKETING_CLAIM_DISCIPLINE`, ⛔ not repaired here.
5. **The one mechanism that does model "return authorship / diminish centrality" is on a dead route.** `lib/relational/relationalStance.ts` is imported only by `app/api/oracle/conversation/route.ts`, which `CLAUDE.md` records as receiving ~zero live traffic. The live route (`app/api/sovereign/app/maia/list/route.ts`) does not import it.

## 2. Mechanism table

| # | Mechanism | Axis | Trigger | Form | Member can decline? | Live? |
|---|---|---|---|---|---|---|
| 2.1 | `lib/consciousness/MAIA_RUNTIME_PROMPT.ts:22` — *"Anchor everything in the user's own experience … 'How does this land in your body, relationships, and daily life?'"* | body (and life, loosely) | every turn; it is the constitutional floor | prompt instruction, phrased as a question MAIA may ask | yes — a question, answerable or not | **yes** — `lib/sovereign/maiaService.ts:1697` interpolates `MAIA_RUNTIME_PROMPT` into the live prompt; also `roomComposition.ts:248` and `canonical-turn/floor.ts` |
| 2.2 | `MAIA_RUNTIME_PROMPT.ts:405` — *"Your choice to step away or stay is yours, and I want to respect that."* | time away | example dialogue inside the prompt (member pulling back after a bad exchange) | modelled stance, not a rule | yes — it is the point of the line | yes (same file) |
| 2.3 | `lib/prompts/maiaEssence.ts:27,39,110,151` — *"Where do you feel that in your body?"* | body | prompt example/instruction | question | yes | **voice path only** — imported by `lib/voice/VoicePromptFromMemory.ts`; not by `maiaService` |
| 2.4 | `lib/session/SessionTimer.ts` + `components/session/SessionTimeAwareness.tsx` | time away (session boundary) | **member starts it** (`handleStartSession(durationMinutes)`, `OracleConversation.tsx:7780`); phases opening→exploration→integration→closure→complete; `systemPromptContext` fed to MAIA (`:5671`) so her temporal awareness tracks the container | temporal container; phase language to MAIA | yes — member chooses duration, `handleExtendSession` extends; **what happens at `complete` was not read** — no evidence of a hard stop, none of its absence | yes, when the member opens one |
| 2.5 | `lib/youth/ageTierEngine.ts` `maxSessionMinutes` (5 / 25 / 50 / 90 by tier) → `OracleConversation.tsx:11017 maxDuration={isTeenUser ? youthMaxSessionMinutes : undefined}` | time away | teen tier only; caps the **selectable** duration of 2.4 | ceiling on the member's own choice | partially — teen cannot select above the cap; adults unaffected | yes for teens |
| 2.6 | FAQ "self-auditing system … nudge you toward grounding" (`FAQSection.tsx:237,245,250`) | all four, as described | — | **claim only**; `rg` for `selfAudit`, `driftDetect`, `toward grounding`, `grounding nudge` across `lib/sovereign lib/maia lib/voice app/api/sovereign` finds no such module | n/a | **no mechanism found** |
| 2.7 | `lib/relational/relationalStance.ts` — `RELEASE` stance (`brevityLevel 0.8`, tag `diminish_centrality`), `dependencyPull → MIRROR` (*"return authorship harder, do NOT hold tighter"*) | centrality (Invariant 7's design principle, not its rule) | per-message signal detection | stance shaping | yes — shapes MAIA's reply, demands nothing | **no** — sole importer is the near-dead `/api/oracle/conversation` route |
| 2.8 | `lib/maia/forwardReadiness.ts` — header: *"Reduces psychological centrality: moves life outward into action"* | real-world action | fires only on explicit member directive-shift, suppressed by any ambivalence | prompt addendum telling the LLM to honour the practical request without re-opening deliberation | yes — it fires **because** the member asked | **yes** — `list/route.ts:1448` |
| 2.9 | `components/maia/WorldDoorway.tsx` | outward (into "experiential worlds", not the physical world) | world-level intent detected in the member's message; feature-flagged (`featureFlags.worldDoorways`) | inline card, `onDismiss` | yes | flag-dependent; not read further — it routes *into* the product, so it is not an Invariant 7 mechanism |
| 2.10 | Daily Anchor (`lib/anchor/*`) | — | member-pulled by default (`surface_preference = member_pulled`) | member's own words returned as context | yes | yes, but it is continuity, not attention-return |

Out of scope, noted so they are not mistaken for Invariant 7: `lib/practice/worlds/somatic.ts` and `lib/elemental-alchemy/practices.ts` (member-initiated practice content); `lib/astrology/*`, `lib/neuropod/*` (vocabulary hits only); `lib/sovereign/teachingRouter.ts:175` ("grounding question" after an identity answer — not attention-return).

## 3. Answer to the preserved tension

The note's §4 asked whether Invariant 7 is implemented as an invitation the member may decline or as compulsion. **On the live path the answer is: as invitation, and only on the body axis.** Every live mechanism is either a question (2.1, 2.3), a modelled stance (2.2), something the member starts and controls (2.4), or something that fires because the member asked (2.8). Nothing compels.

But the stronger finding is that the invariant's "must periodically return" is **mostly unimplemented**, not implemented gently. Three of four axes have no mechanism. If Invariant 7 is to mean what it says, something will have to be built, and the note's tension becomes a design constraint on that build rather than a risk in what exists.

## 4. Findings routed out (⛔ none repaired, ⛔ no lane opened)

- **F-A — FAQ over-claims a mechanism** (2.6). Member-facing copy asserts a self-auditing grounding nudge that the live path does not contain. Under `CLAIM_STATE_AUTHORITY`, the copy should move to Designed/Vision or the mechanism should exist; which is a founder decision. *Same defect class as the 2026-09-06 `verify-colab-boundaries.ts` finding: a named thing that does not exist.*
- **F-B — `relationalStance` is dormant** (2.7). The only code that operationalises "diminish centrality" sits on the route the live traffic left. Whether it should move to the live route is a design question for the HEA stream; this census does not recommend it.
- **F-C — Session-timer `complete` behaviour unread.** Whether the conversation continues, pauses, or blocks at `complete` was not traced; relevant to the teen tier, where the cap is a protection.

## 5. What this census does not establish

⛔ What MAIA actually says to members (no transcript read, no member data touched). ⛔ Whether the body-axis prompt instruction produces body-directed questions in practice. ⛔ Anything about the voice path beyond the import at 2.3. ⛔ That absence from `rg` is absence from the world — the search terms are listed so they can be widened.

**Search terms used:** `invariant 7|invariant-7|human world priority|humanWorldPriority` · `step away|away from the screen|away from the interface|time away|take a break|go outside|physical environment|body sensation|in your body|real[- ]world|return to (your|the) (body|world|life)|outside the (system|app|conversation)|life outside|centrality|dependen|aliveness` · `selfAudit|self-audit|driftDetect|driftGuard|fantasy.?escape|spiritual bypass|escapism` · `sessionMinutes|minutesInSession|longSession|usage(Limit|Nudge|Cap)|dailyLimit|screenTime|idle(Nudge|Prompt)|breakReminder` · `world doorway|worldDoorway|return gesture|returnGesture`.
