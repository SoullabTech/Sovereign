# MAIA / Practitioner Platform — Usefulness & Experience Audit (2026-07-18)

Governing question: *What must be true for a new practitioner or member to experience meaningful value within their first ten minutes?*

**Method:** walked the live production system first (browser, unauthenticated public path), then grounded authenticated journeys in this session's direct evidence. **Every finding is tagged by provenance** — observed vs. inferred, per the standing rule.

Provenance tags: `[LIVE]` walked in the browser this session · `[SHOT]` Kelly's in-session screenshots · `[CODE]` source read this session · `[MEM]` prior-session memory (point-in-time, may be stale).

---

## A. Usefulness maps (Arrival → Orientation → First action → First value → Continuation → Return)

### Journey 1 — First-time member, no knowledge of Soullab
- Arrival: `soullab.life` landing. **Strong, coherent** — "We build for the soul," clear "what people bring to MAIA," honest sovereignty framing, primary actions "Enter MAIA" / "Work with Soullab." Fast; **zero console errors**. `[LIVE]`
- Orientation: good on the landing itself.
- First action: "Enter MAIA" → **`/signin` email gate.** `/begin` (the documented new-user entry) **redirects to `/signin`.** `[LIVE]`
- **BREAK:** `/signin` has **no "Begin Journey / New to Soullab" affordance** (`hasBeginLink:false`) and asks for an email **before** telling the newcomer what happens next. `[LIVE]` A person with no passkey has no visible on-ramp.
- First value: **not reachable** without already being a member. **Time-to-value: blocked at the door.**

### Journey 2 — Practitioner reviewing a previous session
- Arrival → Studio → Session Room → past-sessions list (sessions show duration/turns/`assembled`, live **Review** buttons). `[SHOT]`
- **BREAK (was):** Review opened on *"Who was this session with?"* and the name field was the **only** input — no content until you named/skipped. Recognition was gated behind identification. `[SHOT][CODE]`
- **Repair already built:** PR #645 makes the overview load immediately; name becomes optional; Overview/Outline/Insights/Transcript are first-class. **Staged, not yet deployed.** `[CODE]`
- First value after #645: a layered overview in one click, zero data entry. **This is the journey closest to world-class and the one to repair first.**

### Journey 3 — Practitioner preparing for an upcoming session
- Surfaces exist (Clients, Caseload, Sessions, Calendar) but **no consolidated "your next client + last session's thread + what's unfinished"** view. `[SHOT][MEM]` Prep = assembling context by hand across rooms. No single primary action.

### Journey 4 — Returning member continuing something meaningful
- Continuity primitives exist (Now What?, Marked Moments, anchors) `[MEM]`, but **conversation chapters are not shipped** and entry does not present *what happened / what mattered / what remains unfinished / what to return to* in one place. Return depends on the member remembering where they were.

### Journey 5 — Used once, deciding whether to return
- **No visible re-entry thread** ("here's what you left, pick it back up"). Nothing structurally pulls the person back to their own unfinished meaning. Return is unsupported by the interface.

---

## B. Friction register (ranked by impact on lived usefulness)

| # | Problem | User | Severity | Evidence | Smallest safe correction | Verify |
|---|---------|------|----------|----------|--------------------------|--------|
| 1 | Review gated content behind client name (recognition-before-identification inverted) | Practitioner | **Critical** | `[SHOT][CODE]` | **#645 (built)** — overview-first, name optional | Open review → content in 1 click, 0 entry; audit row fires |
| 2 | No new-user on-ramp: `/begin`→`/signin`, no "Begin Journey" link, email asked before context | First-timer | **Critical** | `[LIVE]` `hasBeginLink:false` | Restore amber "New to Soullab? Begin Journey" on `/signin`; ensure `/begin` reaches onboarding | New visitor finds start path w/o guessing |
| 3 | Studio left rail ≈ 22 items = "box of unrelated tools," no primary action | Practitioner | High | `[SHOT]` | Group rail + name one primary action per context (design, not build yet) | A newcomer names the next action unaided |
| 4 | Open TURN relay (security) | All | High | `[CODE]` prior review | **#644 (built)** — consent-gate minting + rate limit | Unauth mint→403, burst→429, legit still connects |
| 5 | No consolidated practitioner "prep next session" view | Practitioner | High | `[SHOT][MEM]` | Rung 2: one prep surface (next client, last thread, open items) | Prep in one screen, no cross-room hunting |
| 6 | Continuity not visible on entry | Returning member | High | `[MEM]` | Rung 2: entry surfaces "what's unfinished / return to" | Member resumes w/o recall effort |
| 7 | Trust model (memory/consent/audit) invisible in-product | All | Med | `[MEM]` | Rung 2: plain-language "what's remembered / who sees this" | User can state what's kept and who sees it |
| 8 | Onboarding = 7 steps before first value | First-timer | Med | `[MEM]` CLAUDE.md | Rung 1/2: shorten to first-value-fast | Value before step 7 |
| 9 | Terminology load in rail (Threshold, Co-lab, Vision Studio, Caseload) | Both | Med | `[SHOT]` | Rung 2: clearer labels / grouping | Newcomer guesses each label's purpose |
| 10 | a11y tree returned empty on SPA (screen-reader risk) | Accessibility | Med — **unconfirmed** | `[LIVE]` (tooling-uncertain) | Confirm with axe/real SR before acting | a11y scan passes |

*Corrected in-flight, recorded for honesty:* the `/signin` "empty Holoflower" screenshots looked like a perf failure but the page loads in **64 ms** with controls rendered — it was mid-animation, **not** slow. Do not treat it as a performance defect.

---

## C. World-class gap analysis (interaction principles, not visual imitation)

| Principle | Current state |
|-----------|---------------|
| Obvious orientation | Landing: strong. Entry gate + Studio rail: weak (no on-ramp; tool-box rail). |
| Progressive disclosure | Violated at two doors: email before context (#2); name before content (#1, fixed by #645). |
| Strong defaults | Review default was "ask for a name"; #645 changes default to "show the session." |
| Minimal cognitive load | Studio rail overloads; landing does not. |
| Clear language | Landing clear; rail terminology heavy. |
| Responsive feedback | Public path fast (64 ms), no console errors. Loading states on review are present. |
| Recoverable mistakes | Name is now clearable (#645); onboarding reversibility unverified. |
| Consistent navigation | MAIA-presence foundation (deployed) gives one continuous MAIA; rail vs. hallway still two mental models. |
| Fast perceived performance | Good on measured surfaces. |
| Human-quality assistance | MAIA host-knowledge (platformKnowledge) deployed; review synthesis strong once reachable. |

---

## D. Three-rung improvement plan

**Rung 1 — Make it usable** (fix what blocks reaching value; mostly *already built*)
- Scope: ship **#644** (relay security) → verify → ship **#645** (content-first review) → verify + walk. Then restore the **new-user on-ramp** (#2): "Begin Journey" link on `/signin`, `/begin` reaches onboarding.
- Screens: Session Review, `/signin`, `/begin`.
- Acceptance: (a) open a review → overview in one click, zero data entry; (b) a newcomer finds a start path without guessing; (c) relay closed (403/429) while legit traffic connects.
- Production verification: the runbook (`RUNBOOK_644_645_MERGE_DEPLOY_VERIFY.md`) + one live end-to-end review producing exactly one audit row.
- **Stop condition:** journey 2 reaches value cleanly AND journey 1 has a visible on-ramp. Stop; do not proceed to Rung 2 until reviewed.

**Rung 2 — Make it coherent** (unify; design before build)
- Scope: one practitioner "prep/continue" surface (next client + last thread + open items); make continuity visible on entry (what happened / mattered / unfinished / next); group the Studio rail to one primary action per context; surface the trust model in plain language.
- Acceptance: prep and return each happen on one screen without cross-room hunting; a newcomer can state what's remembered and who sees it.
- Stop condition: journeys 3, 4, 5 each reach value on one screen.

**Rung 3 — Make it exceptional** (only distinctive capability)
- Scope: the continuity that ordinary note-taking/coaching/AI cannot do — a session's meaning preserved and *restored accurately on return*, the "living thread." Only after Rungs 1–2 prove the base is usable and coherent.

---

## Product proof required before declaring success
One complete live journey: session occurs → transcript captured → practitioner reviews → **something meaningful recognized** → next step preserved → person returns later → context restored accurately. #645 delivers the **review → recognize** middle; preservation + accurate restore is Rung 2/3. Success criterion: *a real person receives meaningful help with less effort, confusion, or loss than without the system.*
