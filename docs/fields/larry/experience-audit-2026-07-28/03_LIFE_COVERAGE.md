# 03 — Life Coverage: what the "Now What?" environment has a place for

**Date:** 2026-07-28
**Object of audit:** `app/now-what/*`, `components/now-what/*`, `app/api/now-what/*`, plus the one shared
module the room's prompt composition depends on (`lib/maia/roomComposition.ts`).
**Method:** full read of `components/now-what/NowWhatRoom.tsx` (1,785 LOC), all 10 page routes, all 5 API
routes, the shell, the map view, and the trust-copy component. Every claim below cites a file, a line, a
route, or a quoted string.

**Rule followed throughout:** OBSERVATIONS are what the code does. INTERPRETATIONS are labelled as such.
No recommendations appear anywhere in this document — naming an absence is where this audit stops.

---

## 0. Scope boundary (read this before the tables)

**OBSERVATION.** The Now What? environment is navigationally closed. The shell exposes exactly three doors
(`components/now-what/NowWhatShell.tsx`, `DOORS`): `Map` → `/now-what/map`, `Session room` →
`/now-what/room`, `Your field` → `/now-what/field`. The map (`components/now-what/EnvironmentMapView.tsx`)
draws seven rooms: five open (`room`, `field`, `position`, `next`, `questions`) and two deliberately closed
(`themes`, `reflections`). **No link anywhere in `app/now-what/*` or `components/now-what/*` routes to
`/maia`, `/journal`, `/maia/anchor`, or any other Soullab surface.** Unauthenticated access to any
`/now-what/*` path is redirected to `/now-what/arrive`, not to the platform's `/signin`
(`middleware.ts:290-296`).

**INTERPRETATION.** For a member of Larry's field, "the platform" is these seven rooms. Coverage claims in
this document are scoped there. Where a domain word (e.g. "burnout", "grief") appears in other parts of the
wider Soullab codebase, that is noted as out of reach from this environment rather than as coverage.

**OBSERVATION — one entry point, two screens.** `/now-what` rewrites to `/now-what/room`
(`next.config.js:138-139`). Inside the room, the arrival branch has exactly one conditional:
`const returning = priorPractice !== null` (`NowWhatRoom.tsx:773`). There is no time-of-day branch, no
elapsed-time branch, no state branch, no topic branch. Every arriving person therefore meets one of two
screens:

- First visit: `"Welcome."` … `"Flourishing is a practice — one you live, day by day, long after a
  conversation ends."` … button `"Come in"` (`NowWhatRoom.tsx:789-807`), then the threshold question
  **`"Where's your attention right now?"`** with placeholder `"In your own words…"`
  (`NowWhatRoom.tsx:970, 979`).
- Return visit (only when a prior thread tagged `practice` exists): `"Last time you chose this practice:"`
  → the practice verbatim → **`"What happened?"`** (`NowWhatRoom.tsx:962-966`).

---

## A. Executive life coverage map

**Classification rule (stated so it can be checked).** Derived from the terminal phase of the loop
(`NowWhatRoom.tsx:1139-1209`), which is the only exit that persists anything:

- **SUPPORTS** — a route, a phase, a persisted type, or designed copy exists *for this thing*.
- **GENERIC FIELD ONLY** — nothing designed exists, but the surface's shape receives it: it is an
  attention-object that can be typed or spoken into `"Where's your attention right now?"` and can plausibly
  exit through `"Now what will you actually live? One practice. One experiment. One commitment. Not ten."`
  This is the note-taking-equivalent column; the field happens to be conversational rather than a text box,
  which is a widening of the prompt's term and is flagged here rather than hidden.
- **IGNORES** — no place at all, *and* the surface's shape does not receive it: the thing is either
  actively re-shaped by the prompt grammar into something else, or it has no commitment-shaped exit and so
  leaves the loop with nothing persisted.

| Executive month event | Verdict | Evidence |
|---|---|---|
| **Difficult conversations** | GENERIC FIELD ONLY | No route, no persisted type, no copy. The single nearest artifact is one clause inside `RESPONSE_GRAMMAR` step 3: *"or an outward one: where this wants to be lived, a person it involves, a conversation it's asking for"* (`app/api/now-what/interview/route.ts:96`) — a clause applied to every turn regardless of topic, not a place. The persisted schema (`member_field_note_threads`, written at `field-note/route.ts:137-149`) has no column for a person, a counterparty, or a conversation. |
| **Hiring** | IGNORES | Zero occurrences of "hiring" in `app/` or `components/` platform-wide. No route, no prompt, no persisted type. It is a decision with an outward object and a timeline; the loop persists only a title string plus a tag. |
| **Firing / terminating a VP** | IGNORES | Zero occurrences of "layoff"; "terminate" appears in 5 unrelated files, none in `now-what`. `HARD_LIMITS` forbids the only shape this need takes: *"No lists, headings, or analysis"* and *"Do NOT interpret their meaning for them"* (`interview/route.ts:81-82`). There is no third-party confidentiality handling — the room's consent model governs member↔practitioner sharing only (`field-note/route.ts:14-18`), not material about a named employee. |
| **Board meetings** | IGNORES | Zero occurrences of "board meeting" in `app/` or `components/`. There is no pre-event or post-event surface; the only "what happened?" is practice-anchored, not event-anchored (`NowWhatRoom.tsx:966` fires only when `priorPractice !== null`). |
| **Investor calls** | IGNORES | "investor" appears in 4 files, none under `now-what`. Same structural absence as board meetings. |
| **Travel** | IGNORES | No occurrences under `now-what`. No location, calendar, time-zone, or trip concept exists in the schema or the UI. |
| **Burnout / exhaustion** | IGNORES (one partial accommodation) | No occurrences under `now-what`. The loop's exit demands a commitment (`"One practice. One experiment. One commitment. Not ten."`, `NowWhatRoom.tsx:1146`); nothing in the surface acknowledges depletion or offers a lower-effort mode. **Partial accommodation:** the `Discuss` affordance bypasses the requirement to compose an answer before entering — `beginDiscussion()` (`NowWhatRoom.tsx:753-758`), documented in-code as *"I'm not ready to formulate this — help me talk it through."* This is the only entry designed for an unformed state, and it is topic-neutral. |
| **Conflict** | GENERIC FIELD ONLY | The word appears exactly once in the environment, as a Water keyword in the holoflower tint regex: `Water: /\b(feel\|emotion\|overwhelm\|process\|conflict\|shadow)\b/i` (`interview/route.ts:230`). That match tints an ephemeral mandala and produces the line *"This feels like something deeper finding its flow. Does that feel true for you?"* (`NowWhatRoom.tsx:1588`, via `ELEMENT_FEELING_LABEL`). It persists nothing (`NowWhatRoom.tsx:244-247`) and does not change the reply (`interview/route.ts:31-32`). |
| **Uncertainty** | **SUPPORTS** | The only genuine row. `/now-what/questions` exists for questions still alive; `kind: 'question'` is the one proposal type the save route persists as its own record (`field-note/route.ts:38-42, 226-228`); `PROPOSE_SYSTEM` types evidence as `"question" — a question still alive, unresolved, reaching` (`interview/route.ts:167`); the room's proposal view has the heading `"Questions still alive"` (`NowWhatRoom.tsx:92`). Room copy: *"A question worth living doesn't need an answer yet — it needs to not get lost."* |
| **Celebration / unexpected praise** | IGNORES (actively re-shaped) | Every turn is instructed to find a problem: `RESPONSE_GRAMMAR` step 2 — *"Name the live tension or need underneath it"* (`interview/route.ts:95`). The return prompt explicitly forbids the reciprocal gesture: *"Do not evaluate adherence. Do not praise compliance."* (`interview/route.ts:142`). The proposal taxonomy has four kinds — `theme`, `question`, `practice`, `open` (`interview/route.ts:165-169`) — none of which is an achievement, a win, or a recognition. |
| **Loneliness / isolation** | IGNORES | No occurrences under `now-what`. The room's own self-description assumes a working professional with a body of work: *"They have been working on their practice for years and have their own language for it"* (`interview/route.ts:121`); discipline 11 is *"See development — witness a body of work that has been growing for years."* The Water phase lenses exist but are unreachable — see the reachability finding in §C. |
| **Family stress** | IGNORES | No occurrences under `now-what`. Every opening question in `PHASE_OPENING_QUESTIONS` is work-anchored, including the emotional ones: *"What is the original wound or beauty that gave birth to **this work** — not the idea, but the experience?"* (`interview/route.ts` / `NowWhatRoom.tsx:162`, emphasis added). |

**Row count:** 1 SUPPORTS · 2 GENERIC FIELD ONLY · 9 IGNORES.

**OBSERVATION.** The environment's own outward copy names three of these categories that the code does not
build for. `app/now-what/welcome/page.tsx` promises: *"bring the actual thing — the decision, the
overwhelm, the question that keeps coming back."* The map's session-room explanation promises: *"a
decision, a question, a stuck place"* (`EnvironmentMapView.tsx`, `OPEN_ROOMS[0].explain`). Of those three,
only **question** has a route (`/now-what/questions`) and a persisted type. **Decision** and **overwhelm**
have neither.

---

## B. Missing moments — eight arrival states

For each: the actual route landed on, and the copy that greets them, quoted verbatim from the file.

**OBSERVATION common to all eight.** There is no way to arrive anywhere but the session room. `/now-what`
→ `/now-what/room` (`next.config.js:138-139`). If signed out → `/now-what/arrive`
(`middleware.ts:290-296`). Inside the room, the only branch is prior-practice-or-not
(`NowWhatRoom.tsx:773`). **All eight states below therefore land on the identical screen.** The variation
below is entirely in what the person brings, not in what the product does.

### 1. Just left a disastrous board meeting
- **Route:** `/now-what` → `/now-what/room`.
- **Greeting:** *"Where's your attention right now?"* / placeholder *"In your own words…"* — or, if they
  have a prior practice, *"Last time you chose this practice: [X]. What happened?"*
- **Does anything welcome them?** No surface acknowledges an event. The return branch would ask about
  their practice, not the meeting. **INTERPRETATION:** the return question is actively wrong-footed here —
  it asks about a commitment from a previous session while the live material is 40 minutes old.
- **Place for it?** None. Nothing in the schema holds an event.

### 2. Received unexpected praise
- **Route:** `/now-what/room`. Same two screens.
- **Greeting:** *"Where's your attention right now?"*
- **Does anything welcome them?** No. If they type it, `RESPONSE_GRAMMAR` step 2 instructs MAIA to *"Name
  the live tension or need underneath it"* (`interview/route.ts:95`). The four `kind` values available at
  the keep gesture contain no category for a good thing that happened. At the exit they are asked *"Now
  what will you actually live?"*
- **INTERPRETATION:** this is the clearest case in the audit of a state being converted into a different
  state by the prompt grammar rather than merely being unaccommodated.

### 3. Needs to terminate a VP
- **Route:** `/now-what/room`.
- **Greeting:** *"Where's your attention right now?"*
- **Does anything welcome them?** No. `HARD_LIMITS` bars the shape the need takes — *"No lists, headings,
  or analysis. Speak as one warm, unhurried turn in plain language"* (`interview/route.ts:82`). What the
  grammar offers instead is step 3: *"Usually two: something practical (map the next concrete step) and
  something reflective (slow down and listen for what the moment is asking)."*
- **Place for it?** No route, no type. **CANNOT DETERMINE FROM CODE** whether the third party's
  confidentiality was considered — nothing in the environment addresses material about a named non-member.

### 4. Cannot sleep
- **Route:** `/now-what/room`.
- **Greeting:** first visit, the full welcome runs first: *"Flourishing is a practice — one you live, day
  by day, long after a conversation ends."* … *"You set the rhythm."* … *"Come in"*. Then *"Where's your
  attention right now?"*
- **Does anything welcome them?** No. No time-of-day logic exists anywhere in `app/now-what/*` — the only
  `Date` uses are `monthKey`/`dayLabel` formatting (`field/page.tsx`) and `confirmedAt` timestamps.
- **Would they feel there is no place for it?** **INTERPRETATION:** the arrival demands composition — the
  `Begin` button is `disabled={!arrivalAnswer.trim()}` (`NowWhatRoom.tsx:992`). The `Discuss` link
  (`NowWhatRoom.tsx:1029-1036`, caption *"talk it through"*) is the one door that opens without a composed
  thought.

### 5. Feels isolated
- **Route:** `/now-what/room`.
- **Greeting:** *"Where's your attention right now?"*
- **Does anything welcome them?** No. The room's constitutional frame, if they open *"What is this
  space?"*, reads: *"This isn't an intake interview. It isn't an assessment."* … *"Think of this as the
  beginning of a Living Field."* (`OPENING_FRAME`, `NowWhatRoom.tsx:97-141`). The frame is about
  epistemics and consent, not about company.
- **Place for it?** None. The one relational object in the entire environment is the practitioner-share
  checkbox: *"Share with your practitioner"* (`NowWhatRoom.tsx:1180, 1240, 1435`) — a consent control, not
  a relationship surface.

### 6. Must make a $50M decision
- **Route:** `/now-what/room`.
- **Greeting:** *"Where's your attention right now?"*
- **Does anything welcome them?** The *marketing* copy does — `/now-what/welcome`: *"A live room where you
  bring the actual thing — the decision, the overwhelm, the question that keeps coming back — and work with
  it until a next real step appears."* The *code* does not: there is no decision type, no options list, no
  criteria, no reversibility field, no stakes field. `HARD_LIMITS` forbids lists and analysis. The exit
  gesture converts whatever emerged into one practice sentence.
- **INTERPRETATION:** this is a live claim/build gap under the project's own claim-discipline standard —
  the promise is Live-tense, the mechanism is a generic conversation.

### 7. Exhausted after travel
- **Route:** `/now-what/room`.
- **Greeting:** *"Where's your attention right now?"* — or, on return, *"Last time you chose this practice:
  [X]. What happened?"*
- **Does anything welcome them?** No. **OBSERVATION:** the return prompt does contain the environment's
  single most generous line for a person who did not manage anything: *"Whether they lived it fully,
  partially, differently than planned, or not at all: all of it is faithful material. Not living a practice
  is information about the practice or the season, never a failure of the person."*
  (`interview/route.ts:142`). That is a model instruction, not a surface — the member never sees it.
- **Place for it?** None. No low-energy mode, no "just check in", no skip.

### 8. Had a breakthrough with a child
- **Route:** `/now-what/room`.
- **Greeting:** *"Where's your attention right now?"*
- **Does anything welcome them?** No. The room's identity is professional: *"You are MAIA, in a live
  encounter with someone in the What Now? room … They have been working on their practice for years"*
  (`interview/route.ts:121`). Discipline 11 asks MAIA to *"witness a body of work that has been growing for
  years."* Nothing in the four `kind` values receives a personal-life breakthrough; the closest, `open`, is
  defined as *"something that surfaced and remains open, not yet formed"* — and `open` is one of the kinds
  the save route deliberately does **not** persist (`field-note/route.ts:38-42`).
- **INTERPRETATION:** a personal breakthrough can be spoken about but cannot be kept, because keeping is
  routed exclusively through `question`, `practice`, and `offering`.

**Summary observation for §B:** eight distinct arrival states, one landing route, two possible greetings,
zero state-specific copy anywhere in the environment.

---

## C. Attention distribution

**All numbers below are artifacts of the counting method, not measurements of felt experience.** LOC is a
proxy for build effort, not for how much of a member's session any concern occupies. Bucket assignment
involved judgment calls, which are stated inline so a reader can re-cut them.

### Counting method 1 — LOC by concern

Universe: the 19 files that constitute the environment plus its one shared prompt-composition dependency.
Total **5,295 LOC**. `NowWhatRoom.tsx` was split by line range at its phase boundaries (`arrival`,
`conversation`, `proposal`, `practice`, `offering`, `closed`) so its 1,785 lines could be distributed
rather than dumped into one bucket.

| Concern | LOC | % | What was counted (and the judgment calls) |
|---|---:|---:|---|
| Coaching / structured session | 2,173 | 41.0% | `NowWhatRoom` conversation (293) + proposal (169) + practice (73) + offering (56) + closed (57) + generic Vision-Studio arrival (57) + shared state/handlers (566) + constants incl. `OPENING_FRAME` (195) = 1,466; plus `interview/route.ts` (408) and `roomComposition.ts` (299). **Judgment call:** the 566-line handler block includes ~60 lines of position gestures and ~80 of voice/file input that could arguably sit elsewhere; leaving them here inflates this bucket by roughly 2.6 points. |
| Onboarding / arrival / wayfinding | 1,456 | 27.5% | `NowWhatRoom` welcome + arrival threshold (319) + `arrive/page.tsx` (195) + `register` (162) + `signin` (88) + `NowWhatShell` (244) + `EnvironmentMapView` (432) + `map/page.tsx` (16). |
| The member's own record (kept material) | 1,413 | 26.7% | `field` (237) + `questions` (201) + `next` (196) + `position` (223) + `field-note/route.ts` (275) + `program-position/route.ts` (218) + `RoomTrustCopy` (63). |
| Reflection | 213 | 4.0% | `themes` (108) + `reflections` (105). **Both pages make zero data reads and zero model calls** — they are honest explanations of why the room is not running (`themes/page.tsx:6-16`, `reflections/page.tsx:6-13`). |
| Resources / content | 40 | 0.8% | `welcome/page.tsx`. Two static decks also exist outside the LOC universe: `public/now-what/index.html` (18.8 KB) and `overview.html` (21.2 KB). |
| **Daily leadership** | **0** | **0%** | No file, no route, no prompt, no persisted type. |
| **Relationships** | **0** | **0%** | No file, no route, no persisted type. The practitioner-share checkbox is counted under "record". |
| **Decisions** | **0** | **0%** | No file, no route, no persisted type — despite being named in two pieces of outward copy. |

### Counting method 2 — routes

10 page routes + 5 API routes = 15.

- Session: 2 (`/now-what/room`, `POST /api/now-what/interview`)
- Onboarding/wayfinding: 5 (`/arrive`, `/map`, `/welcome`, `POST /register`, `POST /signin`)
- Record: 6 (`/field`, `/questions`, `/next`, `/position`, `field-note` GET+POST, `program-position`)
- Reflection: 2 (`/themes`, `/reflections`) — **both render explanations only.**
- Daily leadership / relationships / decisions: **0 routes each.**

### Counting method 3 — distinct member-facing question prompts

12 exist in the source:

1. `"Where's your attention right now?"` (`NowWhatRoom.tsx:970`)
2. `"What happened?"` (return, `:966`)
3. `"Now what will you actually live?"` (`:1145`)
4. `"What would you enjoy making available to others at this point in your life?"` (`:1221`)
5. `CLOSURE_QUESTION` — *"what surprised you in what you just said?"* (`:167`)
6. conversation fallback — *"what's stirring? We can talk it through."* (`:1543`)
7–12. the six `PHASE_OPENING_QUESTIONS` (`:158-165`).

**Reachability finding (OBSERVATION).** `phase` is read from the URL and defaults to `fire_1`
(`app/now-what/room/page.tsx:26`). Nothing in `app/now-what/*` or `components/now-what/*` ever sets it; the
one link in the codebase that does sets `?phase=fire_1` (`public/now-what/index.html:142`). **Five of the
six phase openers and five of the six `PHASE_LENS` entries are therefore unreachable** without hand-editing
a URL — including all three Water lenses (*"the lived experience the work grew from"*, *"what they have had
to let go of"*, *"knowing that has to be lived into"*, `interview/route.ts:111-113`). Reachable
member-facing questions: **7 of 12**.

### Counting method 4 — persisted data types

Four tables are written or read by the environment: `member_field_note_threads`,
`member_field_note_events`, `field_program_positions`, `members`.

Member-authored content persists as exactly one shape: a title string (≤400 chars), an `authorship` value,
a `member_decision`, a `field_context`, and one `spiralogic_phase` tag (`field-note/route.ts:130-152`).
Tags reachable through the UI: **`practice`**, **`offering`**, **`question`**, and the default phase tag
(`fire_1`). The `theme` and `open` kinds are parsed and then deliberately dropped
(`field-note/route.ts:38-42`).

**There is no persisted type for:** a person, a relationship, an event, a meeting, a decision, an option, a
mood, a state, a day, an energy level, an outcome, or a win. **OBSERVATION.** Zero of twelve executive-life
categories in §A has a data type.

### Distribution, stated plainly

| | LOC share | Route share | Persisted types |
|---|---:|---:|---:|
| Coaching / structured session | 41.0% | 2/15 | 0 (the room persists nothing itself) |
| Onboarding / wayfinding | 27.5% | 5/15 | 1 (`members`) |
| Member's record | 26.7% | 6/15 | 3 content tags + 1 position |
| Reflection | 4.0% | 2/15 | 0 (both rooms held closed) |
| Resources / content | 0.8% | 1/15 | 0 |
| Daily leadership | 0% | 0/15 | 0 |
| Relationships | 0% | 0/15 | 0 |
| Decisions | 0% | 0/15 | 0 |

**INTERPRETATION.** Under every one of the four independent counts, the same three concerns come back zero:
daily leadership, relationships, decisions. That agreement across methods is what makes the zeros
load-bearing rather than an artifact of how LOC was bucketed. It does not tell us how the environment feels
to use, and nothing here measures a member's actual session.

---

## D. Consolidated observations

1. **One room, one question, one exit.** Twelve life categories, eight arrival states, and every possible
   mood route to `"Where's your attention right now?"` and exit through `"Now what will you actually live?
   One practice. One experiment. One commitment. Not ten."`
2. **The only designed life-category is uncertainty.** `/now-what/questions` + `kind: 'question'` is the
   single row in §A that clears the SUPPORTS bar.
3. **Praise and celebration are re-shaped, not merely absent.** `RESPONSE_GRAMMAR` requires a tension every
   turn; the return prompt forbids praise; no `kind` value receives a win.
4. **Two named promises have no mechanism.** "the decision" and "the overwhelm" appear in
   `/now-what/welcome` and in the map's room explanation; neither has a route, a type, or a prompt.
5. **Five of six phase lenses are dead code from the member's side** — including every Water lens, the
   only prompts in the environment oriented toward loss, letting go, and lived-through experience.
6. **The two rooms nearest to the uncovered territory are the two that are deliberately closed.**
   `/now-what/themes` and `/now-what/reflections` render explanations only, by ruling. Both state in code
   that they perform zero data reads.
7. **CANNOT DETERMINE FROM CODE:** whether any of the nine IGNORES rows reflects a governance decision
   rather than an omission. No document in `app/now-what/*` or `components/now-what/*` names a
   life-coverage scope; the in-code rulings cited throughout concern consent, provenance, and interpretive
   authority, not which parts of a life the environment intends to hold.

---

*This document contains no recommendations. Absences are named; filling them is not proposed.*
