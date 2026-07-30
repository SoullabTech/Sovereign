# Now What? — Phase 2: Verification Ledger, Opportunities, Synthesis
**Authored 2026-07-28 · not delegated · all claims checked against `origin/clean-main-no-secrets` (`471bdf85c`)**

> Working tree is 27 ahead / 390 behind canon. Every claim below was re-checked on canon.
> The now-what auth files (`arrive`, `register`, `signin`) are byte-identical worktree↔canon.

---

## A. Verification ledger

| # | Claim | Source | State |
|---|-------|--------|-------|
| 1 | Two practitioner names addressable to one client in one session | 01 | **CONFIRMED** — `NowWhatRoom.tsx:788` "with Larry Closs" vs `:139` "Kelly can accompany… Sharing any thread with Kelly" |
| 2 | Invitation gate 403s *after* collecting name/email/password | 01 | **CONFIRMED** — `arrive:38` defaults `next=/now-what/room` (no `fieldContext`); `register:68-71` then 403s |
| 3 | `phase` defaults `fire_1`, nothing sets it → 5/6 openers dead | 03 | **PREMISE INCORRECT** — `room/page.tsx:25` reads `?phase=` from the URL. Not dead code: reachable by a practitioner door link, never by any UI affordance. Restated below as #4. |
| 4 | `theme`/`open` proposal kinds parsed then dropped | 03 | **CONFIRMED AS FACT, FRAMING INCORRECT** — deliberate, dated, documented in-code (`field-note/route.ts:34-42`, ruling 2026-07-13: "a persisted theme substrate stays behind the Themes gate"). This is governance working, not loss. |
| 5 | `/field`, `/questions`, `/next` issue the identical GET | 02 | **CONFIRMED** — same `apiFetch('/api/now-what/field-note')`; differ only by a client-side `.filter()`. `/field` is the unfiltered superset. |
| 6 | Dead branch behind `const nowWhat = true` | 04 | **CONFIRMED** — `NowWhatRoom.tsx:197`; the entire Vision Studio arm (`:653`, `:741`, `:762`) is unreachable. |
| 7 | Presence flag absent from production env | 05 | **CONFIRMED** — `NOW_WHAT_MAIA_PRESENCE_ENABLED` present in `.env.local` only; `0` occurrences in `.env.production` and `.env.docker`. |

**Two of seven did not survive as stated.** #3 and #4 are the reason a verification pass is not optional:
both would have entered a redesign as "broken," and both would have been wrong — one is a URL contract,
the other is a ruling deliberately implemented.

---

## B. What the five audits agree on

Three independent methods converged on one structural fact:

- **#02** (link graph): `/now-what/room` has in-degree 7, out-degree 1; `/now-what` 307-redirects to it.
- **#03** (arrival states): all eight life-moments land on the same route; the sole branch is `priorPractice !== null`.
- **#05** (continuity): that same boolean is the *only* return signal; it fires in week two and never changes again.

**The environment has one door, one question behind it, and one bit of memory.**

### The coaching contradiction — both investigators were right

#03 measured coaching at **41%**; #04 measured it at **0.0%**. They counted different referents.
#03 counted the *apparatus* (room, prompts, response grammar). #04 counted *directive advice*, which the
code actively forbids (`interview/route.ts:79-81`, `next/page.tsx:162`).

> **The surface is built almost entirely out of coaching machinery that is under standing orders never to coach.**

Neither investigator could have produced that sentence alone. It is the most accurate one-line description
of Now What? this audit produced, and it is not a defect — it is the design, made visible by disagreement.

---

## C. Opportunities

Ranked. Every item carries its **artifact category**, what it would actually require, and — per the
Phase-2 guard — whether the evidence **supports** it or merely **permits** it.

### Tier 0 — Defects (not opportunities; these are repairs)

| | Item | Requires | Evidence |
|---|---|---|---|
| **0.1** | **Practitioner identity collision.** A client is told two different people are their practitioner, and the one interactive consent gesture in the product attaches to a name that may not be who they think they're speaking with. | Make the practitioner name a single sourced value, not two literals. Small. | **SUPPORTS** — confirmed on canon |
| **0.2** | **Credential collection before refusal.** "You were invited here." → name, email, password → 403. | Gate at arrival, not at submit; or carry context into the default `next`. Small. | **SUPPORTS** — confirmed on canon |

These are Kelly's to see before any architectural material. 0.1 touches consent integrity; 0.2 collects
PII from someone the system has already decided to refuse.

### Tier 1 — Quick wins (evidence supports; bounded)

| | Item | Category | Requires |
|---|---|---|---|
| 1.1 | Shell knows 3 rooms, map knows 7 → five rooms show no location label, `aria-current` on nothing | Cat 6 repair | Extend `NowWhatShell.tsx:55-59` to the real room set |
| 1.2 | `/field` `/questions` `/next` are one endpoint + three filters presented as three rooms | Cat 6 simplification | A ruling on whether they *are* three rooms; then either merge or differentiate them in substance |
| 1.3 | Duplicate "listen back" control bound to one function; element-confirmation costs ≤8 decisions on a value **never persisted** | Cat 6 repair | Remove. `#04` counts 34 of 71 distinct decisions as exposing implementation |
| 1.4 | Dead Vision Studio branch behind `const nowWhat = true` | Cat 6 hygiene | Delete the arm or restore the flag |
| 1.5 | Map not offered on the closing screen — the one moment the client is oriented and unhurried | Cat 6 | One link. `#01` rates the closing screens the strongest work on the surface |

### Tier 2 — Architectural (evidence supports the *problem*; the *solution* needs a ruling)

| | Item | Category | The honest statement |
|---|---|---|---|
| 2.1 | **Return detection rides a URL parameter.** `NowWhatRoom.tsx:302` short-circuits when `?fieldContext=` is absent — a bookmarked room resets the executive to first-time, silently, permanently. | Cat 6 defect w/ architectural cause | The repair is small; the question of what *should* carry identity across a return is not |
| 2.2 | **Position writes destroy their own history.** `field_program_positions` is `UNIQUE(field, program, member)` + `ON CONFLICT DO UPDATE`. MAIA can know where the executive stands, never that they moved. | Cat 6 | Movement is the developmental signal. Append-only would preserve it — but retention is a consent question, not a schema question |
| 2.3 | **Deep continuity is one 300-char string.** `:313` carries the newest practice only. Prior practices, kept questions, offerings, arc tags are read into display lists and never reach MAIA. | Cat 3→6 | This is the gap between *remembering* and *deepening*. It is also exactly where synthesis pressure enters — see the caution below |
| 2.4 | **The authored question set is reachable only by hand-crafted URL.** 5/6 phase openers + 3 Water lenses live behind `?phase=`, which no UI generates. | Cat 6 | Either practitioners are meant to send phase-carrying links (then say so, and the finding is "undocumented contract") or the room should choose — which is an authority question |
| 2.5 | **Write-only ledger.** `member_field_note_events`: 5 INSERT sites, 0 readers. `member_authorship_metrics` view carries the in-file comment *"never read at runtime."* Discard rows write `thread_id = NULL` — unreadable in principle. | Cat 3 | Classify honestly: BUILT, not WIRED. Either wire it or record why it stays dark |

### Tier 3 — Foundational (evidence *permits*; does not yet support)

> **These are Cat 1. Naming them here does not authorize them.**

| | Item | The gate |
|---|---|---|
| 3.1 | **No human being exists as an entity anywhere in this surface.** 0 person/relationship schemas; 11 free-text inputs, none scoping another person; 20 of 21 human references are the practitioner. For a product about leadership, other people are prose inside a `title` field. | An entity layer for colleagues/reports/family is a *large* sovereignty question (who is represented, who consented, what MAIA may infer). Nothing in this audit authorizes building it. |
| 3.2 | **Nine of twelve executive-month categories have no place.** Daily leadership 0%, relationships 0%, decisions 0% across four independent counting methods. | Coverage is not automatically a goal. A one-door environment may be *correct*. But the welcome page currently sells "the decision, the overwhelm, the question that keeps coming back" and only *question* has a route — so either the door widens or the promise narrows. |
| 3.3 | **Celebration is structurally re-shaped.** `RESPONSE_GRAMMAR` requires naming the tension underneath every turn; the return prompt bars praising. | Possibly exactly right for a developmental environment. Worth Kelly *deciding* rather than inheriting: "we have no place for good news" and "we convert good news into unmet need" are different products. |

---

## D. The synthesis question

> *If this product were organized around an executive's lived experience rather than coaching features,
> what would naturally become the organizing structure?*

**The premise needs one correction first.** Now What? is **not** organized around coaching features.
#02 reverse-engineered the structure blind and scored coaching, workflow, time, and people all LOW.
Its verdict: *a place built around one act of speaking* — every other surface exists to show the member,
in their own words and without aggregation, what they chose to keep, then walk them back.

So the tension is not coaching-vs-life. It is narrower and more tractable:

> **The product is already organized around lived experience. It admits exactly one occasion of it.**

### Where the existing architecture already supports the vision

- **Arrival is already a first-class concept.** The room opens by asking where attention is. That is an
  occasion-shaped question, not a feature-shaped one.
- **Authorship is already the unit.** Nothing is stored that the member did not choose to keep
  (`field-note/route.ts` ruling). An occasion layer would inherit that gate rather than fight it.
- **The closing screens already know how to end an occasion.** *"One practice. One experiment. One
  commitment. Not ten."* — #01 rates these the strongest work on the surface.
- **`spiralogic_phase` is already a per-thread tag**, not a global mode. The data model can hold
  differentiated occasions today; only the UI funnels them into one.

### Where it conflicts

- **One door, one greeting, one memory bit.** Confirmed three ways (§B).
- **No entity layer.** Occasions in an executive's life are *about people* — a board, a VP, a child.
  Without §3.1 an occasion can only ever be a mood, not a situation.
- **Continuity is 300 characters of the most recent practice.** An occasion-organized product needs to
  know that the hard conversation happened *and then* what came of it. §2.2 actively deletes that.

### The latent organizing principle

If one exists in this codebase already, it is **occasion** — arrival, speaking, keeping, return.
That is the grammar the room already implements once. The evidence permits the reading that widening
the door is more faithful to what is built than adding rooms alongside it: #02 found the completion work
*tripled the rooms and the hallway did not follow*, making the original diagnosis more true, not less.
Rooms have already been tried as the answer to breadth.

### The caution I will not soften

§2.3 and §3.1 are where this becomes dangerous. Richer continuity plus an entity layer is precisely the
substrate from which a system starts telling an executive what its pattern-matching thinks about their
VP. This project already froze that class of work (Patterns, cross-layer synthesis, coherence surfaces).
**Nothing in this audit lifts that freeze, and the opportunity ranking above must not be read as
authorization.** The one-door design may be a considered refusal, not an omission — and the audit found
governance working correctly at every point it looked closely (#4 ruling, #7 flag off, themes/reflections
deliberately empty by the 2026-07-13 ruling with gate conditions named in-file).

**What this audit establishes: the environment is coherent, deliberately narrow, and materially smaller
than what its welcome page promises. What it does not establish: that the answer is to make it bigger.**

---

## E. Recommended next act

Not a build. A ruling, on one question:

> **Is the single door a refusal or an omission?**

Everything in Tier 2 and Tier 3 resolves differently depending on the answer, and the answer is Kelly's
and Larry's, not this document's. Tier 0 should be repaired regardless.
