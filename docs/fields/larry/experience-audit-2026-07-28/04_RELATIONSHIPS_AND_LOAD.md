# 04 — Relationship Architecture & Cognitive Load

**Object:** the "Now What?" surface — `app/now-what/*`, `components/now-what/*`, `app/api/now-what/*`
**Date:** 2026-07-28
**Method:** exhaustive read of all 20 files in the surface (5,071 LOC), plus the four
persistence tables the surface writes/reads, plus the shared prompt-composition module
the interview route calls (`lib/maia/roomComposition.ts`).
**Nature:** counting audit. Observations and interpretations are separated. No recommendations.

---

## 0. THE SURFACE, ENUMERATED

Reproduce with: `find app/now-what components/now-what app/api/now-what -type f | sort`

| File | LOC |
|---|---:|
| `components/now-what/NowWhatRoom.tsx` | 1785 |
| `components/now-what/EnvironmentMapView.tsx` | 432 |
| `components/now-what/NowWhatShell.tsx` | 244 |
| `components/now-what/RoomTrustCopy.tsx` | 63 |
| `app/now-what/field/page.tsx` | 237 |
| `app/now-what/position/page.tsx` | 223 |
| `app/now-what/questions/page.tsx` | 201 |
| `app/now-what/next/page.tsx` | 196 |
| `app/now-what/arrive/page.tsx` | 195 |
| `app/now-what/themes/page.tsx` | 108 |
| `app/now-what/reflections/page.tsx` | 105 |
| `app/now-what/room/page.tsx` | 63 |
| `app/now-what/welcome/page.tsx` | 40 |
| `app/now-what/map/page.tsx` | 16 |
| `app/now-what/welcome/opengraph-image.tsx` | 12 |
| `app/api/now-what/interview/route.ts` | 408 |
| `app/api/now-what/field-note/route.ts` | 275 |
| `app/api/now-what/program-position/route.ts` | 218 |
| `app/api/now-what/register/route.ts` | 162 |
| `app/api/now-what/signin/route.ts` | 88 |
| **Total** | **5,071** |

Persistence reached by this surface:
`member_field_note_threads`, `member_field_note_events`
(`database/migrations/20260626000001_member_field_note_threads.sql`);
`field_program_positions`, `field_programs`
(`database/migrations/20260712000001_field_programs_and_positions.sql`);
`practice_fields` (`database/migrations/20260701000001_practice_fields.sql`);
`members` (write path: `app/api/now-what/register/route.ts:105`).

---

# PART A — RELATIONSHIP ARCHITECTURE

## A.1 OBSERVATIONS — every place another human being appears

### A.1.1 As a persisted entity (schema)

**Count: 0 tables in this surface model a third human as an addressable entity.**

Method: read every `CREATE TABLE` DDL for every table this surface reads or writes;
count columns whose *referent* is a person other than the signed-in member.

| Table | Columns | Columns referring to a non-member human | Which |
|---|---:|---:|---|
| `member_field_note_threads` | 21 | 2 | `can_be_shown_to_practitioner` (`…threads.sql:40`), `practitioner_visibility_basis` (`:41`) |
| `member_field_note_events` | 9 | 0 | — |
| `field_program_positions` | 9 | 0 (1 enum value) | `stated_by` may equal `'practitioner_seeded'` (`…positions.sql:64`) |
| `field_programs` | 9 | 0 | — |
| `practice_fields` | 17 | 1 | `practitioner_member_id` (`…practice_fields.sql:24`) — the field's owner |
| `members` | (identity) | 0 | — |

Both `member_field_note_threads` columns are **booleans/labels about visibility**, not
foreign keys to a person. There is no `person`, `contact`, `relationship`,
`colleague`, `report`, `stakeholder`, or `household` table anywhere in this surface.
`practice_fields.practitioner_member_id` is a FK to `members(id)` — the practitioner
exists as a *field owner*, one per field, not as a person the member is in relationship with.

Verification grep (returns nothing in this surface):
`grep -rn 'CREATE TABLE' database/migrations/*.sql | grep -i 'person\|contact\|relationship\|colleague'`

### A.1.2 As a data field the member can fill

**Count: 0.**

Every free-text field in the surface takes text *about the member's own state*.
Enumerated exhaustively:

| Field | file:line | What it asks for |
|---|---|---|
| `arrivalAnswer` textarea | `NowWhatRoom.tsx:975` | "Where's your attention right now?" |
| `draft` textarea | `NowWhatRoom.tsx:1689` | free conversation turn |
| `bringText` textarea | `NowWhatRoom.tsx:1641` | pasted material |
| `anchorDraft` input | `NowWhatRoom.tsx:868` | "Where are you, in your own words…" |
| `revising[title]` input | `NowWhatRoom.tsx:1380` | edit a proposed thread title |
| `newThread` input | `NowWhatRoom.tsx:1447` | "Name a thread that is genuinely yours…" |
| `practiceDraft` textarea | `NowWhatRoom.tsx:1165` | "what will you live between now and next time?" |
| `offeringDraft` textarea | `NowWhatRoom.tsx:1225` | "What would you enjoy making available to others…" |
| `name` / `email` / `password` | `arrive/page.tsx:151–153` | the member's own identity |
| `identifier` / `password` | `arrive/page.tsx:157–158` | the member's own identity |

**11 free-text inputs. 0 of them name, reference, or scope another person.**
Another person can only appear *inside* the prose the member types, where the system
cannot address, count, or return to them.

### A.1.3 As a UI element

Every rendered string in member-facing UI whose object is another human:

| # | file:line | Rendered text | Object |
|---|---|---|---|
| 1 | `NowWhatRoom.tsx:139` | "Kelly can accompany this field as your facilitating practitioner… Sharing any thread with Kelly is a separate choice you make thread by thread" | practitioner (named, hardcoded) |
| 2 | `NowWhatRoom.tsx:788` | "Now What? · with Larry Closs" | practitioner (named, hardcoded) |
| 3 | `NowWhatRoom.tsx:857` | "This room holds Larry's work" | practitioner (named, hardcoded) |
| 4 | `NowWhatRoom.tsx:1063` | "Sharing with your practitioner is a separate, explicit choice — off by default." | practitioner |
| 5 | `NowWhatRoom.tsx:1072` | trust copy `whoSees`: "visible to your practitioner only thread-by-thread" | practitioner |
| 6 | `NowWhatRoom.tsx:1132` | "sharing a thread with your practitioner is a separate, explicit choice" | practitioner |
| 7 | `NowWhatRoom.tsx:1180` | checkbox label "Share with your practitioner" (practice) | practitioner |
| 8 | `NowWhatRoom.tsx:1240` | checkbox label "Share with your practitioner" (offering) | practitioner |
| 9 | `NowWhatRoom.tsx:1435` | checkbox label "Share with your practitioner" (kept thread) | practitioner |
| 10 | `NowWhatRoom.tsx:1461` | checkbox label "Share with your practitioner" (own thread) | practitioner |
| 11 | `NowWhatRoom.tsx:1470` | "Sharing a thread with your practitioner is a separate choice, per thread" | practitioner |
| 12 | `field/page.tsx:171` | "· shared with your practitioner" | practitioner |
| 13 | `field/page.tsx:204` | trust copy `whoSees` | practitioner |
| 14 | `questions/page.tsx:136` | "· shared with your practitioner" | practitioner |
| 15 | `questions/page.tsx:168` | trust copy `whoSees` | practitioner |
| 16 | `next/page.tsx:163` | trust copy `whoSees` | practitioner |
| 17 | `position/page.tsx:46` | "placed by your practitioner — not yet yours until you say so" | practitioner |
| 18 | `position/page.tsx:190` | trust copy `whoSees`: "Your practitioner cannot see your positions" | practitioner |
| 19 | `themes/page.tsx:73` | "share a theme with your practitioner without your separate, explicit consent" | practitioner |
| 20 | `reflections/page.tsx:69–70` | "hand a reflection to your practitioner" | practitioner |
| 21 | `NowWhatRoom.tsx:1221` | "What would you enjoy making available to **others** at this point in your life?" | unnamed others |

**21 member-facing references to another human. 20 of 21 refer to the practitioner.
1 of 21 (`:1221`) refers to unnamed "others" — and it is a prompt, not an object.**
5 of the 21 are interactive (the "Share with your practitioner" checkboxes, ##7–10 plus
the trust-copy disclosures); the other 16 are static copy.

Interactive controls whose object is another human: **5 checkboxes, all binary, all the
same binary** (share / don't share, with the same single recipient).

### A.1.4 As a prompt directive to MAIA

Method: read all system-prompt constants in `app/api/now-what/interview/route.ts`
(`TWELVE_DISCIPLINES` :62, `HARD_LIMITS` :77, `RESPONSE_GRAMMAR` :89, `PHASE_LENS` :107,
`buildPhasePrompt` :116, `buildReturnPrompt` :134, `PROPOSE_SYSTEM` :153) and grep for
person-nouns.

**Count: 2 directives across ~130 lines of prompt text mention another human.**

- `interview/route.ts:96` — the only *outward* instruction in the entire prompt corpus:
  > "…or an outward one: where this wants to be lived, **a person it involves, a
  > conversation it's asking for**. Offer it — do not decide for them."
  It is one clause inside step 3 of a four-step grammar, listed after "something
  practical" and "something reflective", introduced by "Sometimes… fits better".
- `NowWhatRoom.tsx:160` (`PHASE_OPENING_QUESTIONS.fire_2`, rendered as the guided
  opener when `phase=fire_2`) — "a conversation, an encounter, **someone you worked
  with**". Reachable only via `?phase=fire_2`; the default is `fire_1`
  (`room/page.tsx:25`), whose opener has no other-person reference.

Every other person-noun in the prompts is either the member ("this person", "THIS
person") or a rhetorical control ("a hundred people", `:15`, `:103`).

### A.1.5 As generated copy the member reads

MAIA's replies are free model text and are not persisted (`interview/route.ts:27–28`).
The `propose` mode returns 1–3 threads typed as `theme|question|practice|open`
(`interview/route.ts:165–172`). **None of the four thread kinds is a person, a
relationship, or a conversation-to-have.** The taxonomy admits no relational object.

### A.1.6 As context in MAIA's prompt

`lib/maia/roomComposition.ts:107–145` composes the *practitioner's own authored field*
(`practice_fields` free-text columns — `welcome_message`, `how_we_work_together`,
`how_maia_supports`, `about_practice`, `active_field_content`) into every conversation
turn. This is the one place a second human is materially present to MAIA: **as an
authored corpus about the practice, never as a person the member is in relation with.**

## A.2 OBSERVATIONS — what the platform centers (percentage estimate)

**Counting method, stated explicitly so it is reproducible:**

- **Unit** = one distinct member-facing affordance or content surface (a control, a
  link, a rendered content region), counted once per screen on which it appears.
- **Universe** = the 16 member-reachable screen states enumerated in Part B, at their
  *minimum* branch (nothing conditional expanded), plus the 5 share checkboxes counted
  once each. Total = **92** units.
- **Assignment** = each unit assigned to exactly one bucket (no double-counting).

| Bucket | Units | % | What was counted |
|---|---:|---:|---|
| **Information** | 54 | 58.7% | map (14), room threshold (2), welcome gate (2), closed screen (3), field (5), next (6), questions (6), position (6), themes (5), reflections (5) — rooms that display kept material, navigate, or explain why a room is closed |
| **Conversations** | 17 | 18.5% | arrival threshold (8), live conversation (9) |
| **Reflection** | 13 | 14.1% | proposal keep/revise/leave + own-thread (6), practice suggestions + shell (2), offering (5) |
| **Relationships** | 5 | 5.4% | the 5 "Share with your practitioner" checkboxes |
| **Tasks** | 3 | 3.3% | `practiceDraft`, "Carry this practice", "Not today" |
| **Coaching** | 0 | 0.0% | — |
| | **92** | **100%** | |

**Sensitivity.** Two units are contestable. If the arrival textarea (`:975`) is read as
reflection rather than conversation, reflection rises to 15.2% and conversations fall to
17.4%. If the two HOLD+EXPLAIN rooms (themes, reflections — 10 units) are excluded as
not-yet-product, information falls to 53.7% of 82. No assignment moves relationships
above 6% or coaching above 0%.

**Coaching = 0% is a measured value, not an omission.** It is enforced in code:
`interview/route.ts:79–81` ("Do NOT interpret their meaning for them"),
`next/page.tsx:103` ("no one here announces your next step — not MAIA, not the program,
not this page"), `next/page.tsx:162` ("No recommendations, no suggested next steps, no
ranking of possibilities, no compliance tracking").

## A.3 OBSERVATION — are other people first-class objects?

**Answer: SECOND-CLASS, and only for one person.**

Stated precisely, because the three grades do not apply uniformly:

- **The practitioner is second-class-plus.** He exists in schema
  (`practice_fields.practitioner_member_id`), in a persisted per-item consent boolean
  (`member_field_note_threads.can_be_shown_to_practitioner`), in a position provenance
  enum (`stated_by='practitioner_seeded'`), in MAIA's prompt as an authored corpus, and
  by hardcoded name in three rendered strings. He is not, however, an entity the member
  can create, name, describe, or reason about — he is a fixed property of the room.
- **Every other human in the member's life is ABSENT as an object and second-class as
  content.** They can be typed into any of the 11 free-text fields and will be stored
  verbatim inside `title`/`content`. They cannot be named as an entity, retrieved,
  counted, revisited, linked to a thread, or reasoned about across sessions. The
  proposal taxonomy has no kind for them (`interview/route.ts:165–169`). No room lists
  them. No schema holds them.

**There is no schema in which a colleague, direct report, board member, or family member
can exist as an entity.** Confirmed by reading all 6 tables above column-by-column.

## A.4 INTERPRETATION (clearly separated)

The numbers describe a system built around **one person and their own material**, with
exactly one relational edge: member → practitioner, expressed as a visibility boolean.

If leadership is relationships, then this surface currently instruments the *inner* half
of leadership work — attention, question, practice, commitment — and holds the *outer*
half only as prose. A member can say "I need to have a hard conversation with my COO" in
the arrival textarea; the system will store that sentence and nothing about the COO.
Returning to it next session is possible only if the member types it again, or if the
free-text thread happens to surface.

The single outward clause in the prompt (`interview/route.ts:96`) shows the outward turn
is *authorized* in MAIA's speech but *unrepresented* in the data model. The gap between
those two facts is the finding. It is a design position, not a defect — the surface's
governing documents state repeatedly that no synthesis, typing, or modeling of the person
occurs, and a relationship graph would be modeling. The audit's job is only to record
that the position has a cost, and that the cost is the outer half of leadership.

---

# PART B — COGNITIVE LOAD

## B.1 OBSERVATIONS — decision count per screen

**Counting method:**
- **Screen** = a distinct rendered state a member can be in (route, or a `roomPhase`
  branch of `NowWhatRoom`).
- **Decision** = one control the member can act on: a button, a link, a menu item, a
  toggle, a checkbox, a form field, or a keyboard branch that changes outcome.
- **Min** = the state with all conditionals collapsed. **Max** = every conditional
  branch expanded (program anchor present, bring-panel open, cell candidate showing,
  3 proposed threads all in revise state, etc.).
- Repeated identical controls (e.g. per-thread keep/revise/leave) are counted per
  instance in Max, once in Min.
- `NowWhatShell` affordances are counted on every screen that renders it.

| # | Screen | file:line anchor | Min | Max |
|---|---|---|---:|---:|
| S0 | `/now-what/arrive` — front door | `arrive/page.tsx:117–177` | 5 | 6 |
| S1 | `/now-what/map` | `EnvironmentMapView.tsx:168–298`, `:364–395` | 14 | 14 |
| S2 | Room threshold (signed out) | `NowWhatShell.tsx:217–234` | 2 | 2 |
| S3 | Welcome gate (first visit) | `NowWhatRoom.tsx:778–812` | 2 | 2 |
| S4 | Arrival threshold | `NowWhatRoom.tsx:814–1079` | 8 | 16 |
| S5 | Conversation | `NowWhatRoom.tsx:1495–1783` | 9 | 21 |
| S6 | Proposal | `NowWhatRoom.tsx:1325–1490` | 6 | 26 |
| S7 | Practice | `NowWhatRoom.tsx:1139–1209` | 5 | 8 |
| S8 | Offering | `NowWhatRoom.tsx:1212–1265` | 5 | 5 |
| S9 | Closed | `NowWhatRoom.tsx:1268–1322` | 3 | 3 |
| S10 | `/now-what/field` | `field/page.tsx:107–206` | 5 | 5 |
| S11 | `/now-what/next` | `next/page.tsx:82–165` | 6 | 6 |
| S12 | `/now-what/questions` | `questions/page.tsx:81–170` | 6 | 6 |
| S13 | `/now-what/position` | `position/page.tsx:97–192` | 6 | 6 |
| S14 | `/now-what/themes` | `themes/page.tsx:31–83` | 5 | 5 |
| S15 | `/now-what/reflections` | `reflections/page.tsx:29–80` | 5 | 5 |
| | **TOTAL (whole environment)** | | **92** | **136** |
| | **Single-session core path** (S0→S3→S4→S5→S6→S7→S8→S9) | | **45** | **87** |

**Uncertainty declared.** Three counts are ranges by construction, not by imprecision:
- **S4** varies with `programArrival` (`NowWhatRoom.tsx:831`): +7 controls when a program
  anchor renders, plus one button per prior engagement (`:939`, unbounded N). Max shown
  assumes 1 engagement.
- **S5** varies with three independent panels: bring (+4, `:1632`), cell candidate (+3,
  `:1581`), element picker (+5, `:1613`).
- **S6** scales with proposed thread count (0–3, capped at `interview/route.ts:283`) ×
  3–7 controls each. Max shown assumes 3 threads in the widest branch.

**One dead screen found.** `NowWhatRoom.tsx:1083–1136` ("Ways to Begin", 2 buttons) is
unreachable: `nowWhat` is hardcoded `true` at `:197`, and the guard at `:762` claims
every `roomPhase === 'arrival'` render. Not counted.

## B.2 OBSERVATIONS — MATTERS vs EXPOSES IMPLEMENTATION

Classified per distinct control. A control is **EXPOSES IMPLEMENTATION** when it exists
because the system needed the member to disambiguate something the system could not or
did not resolve itself, or when it is a single-option page-turn, a duplicate route to an
identical destination, or a choice of input modality rather than content.

### MATTERS (37 distinct controls)

| Control | file:line | Why it matters |
|---|---|---|
| `arrivalAnswer` textarea + "Begin" | `:975`, `:990` | the session's actual subject |
| "Discuss" | `:1029` | a genuinely different path (talk it through vs compose) |
| `draft` textarea + "Send" | `:1689`, `:1773` | the conversation itself |
| "Keep — take something back with you" | `:1731` | ends the session, opens authorship |
| keep / revise / leave (×3 threads) | `:1395`, `:1399`, `:1403` | authorship over MAIA's proposals — 9 instances |
| revise inline input + "keep revised" | `:1380`, `:1416` | the member's own wording wins |
| `newThread` input | `:1447` | naming something entirely their own |
| "Keep what I chose" / "Leave without keeping" | `:1475`, `:1482` | the consent crossing |
| 5 × "Share with your practitioner" | `:1180`, `:1240`, `:1435`, `:1461` (+`:1428`) | the only relational consent in the system |
| `practiceDraft` + "Carry this practice" + "Not today" | `:1165`, `:1188`, `:1195` | the one commitment that shapes the next visit |
| `offeringDraft` + "Offer it" + "Skip for now" | `:1225`, `:1248`, `:1255` | the outward turn |
| "Yes, that's where I am" / "I'm somewhere else" / `anchorDraft` / "That's where I am" / "Not now" | `:897`, `:905`, `:868`, `:879`, `:912` | declaring position in a program, in own words |
| "I've finished this" (depart) | `:843` | hard-deletes the position row |
| engagement selector buttons / "Something else" | `:939`, `:948` | which engagement I'm bringing today |
| name / email / password / identifier + submit | `arrive:151–158`, `:169` | practical: creating an account |
| "See the map first" | `NowWhatShell.tsx:228` | orientation before commitment |
| 5 room links (field, next, questions, position, room) | `EnvironmentMapView.tsx:71–118` | real destinations with real content |

### EXPOSES IMPLEMENTATION (34 distinct controls) — stated plainly

| Control | file:line | What the system needed the member to disambiguate |
|---|---|---|
| "Create my key" / "I already have a key" tabs | `arrive:118`, `:132` | whether a `members` row already exists. The system **already resolves this itself** — `arrive:63–71` catches a 409 and pivots the member into sign-in automatically. The tabs ask the member to answer a question the server answers one request later. |
| "Come in" | `NowWhatRoom.tsx:802` | nothing. Single-option control = a page-turn, not a decision. |
| "Dictate" | `:1003` / `:1760` | input modality, not content. Same destination field as typing. |
| "Upload" (`.txt`/`.md` only) | `:1016` / `:1656` | input modality + file-format constraint pushed to the member. |
| "Hear the room" | `:1746` | TTS on/off — a browser capability surfaced as a choice. |
| "Bring something with you" + textarea + "Bring this in" + "Choose a .txt or .md file" + "Never mind" | `:1717`, `:1641`, `:1649`, `:1656`, `:1662` | 5 controls to get text into a field that already accepts paste. |
| Enter vs Shift+Enter | `:1700`, `:982` | keyboard-binding disambiguation, taught in a caption at `:1709`. |
| **Duplicate** "Keep — listen back" (top) | `:1515` | identical action to `:1731` on the same screen. The comment at `:1710–1715` records that the founder twice failed to find this action; the resolution added a second copy rather than removing the ambiguity. |
| "Try listening back again" (degraded) | `:1347` | a JSON parse failure in `interview/route.ts:399` surfaced to the member as a button. |
| "undo" a left thread | `:1411` | correcting a UI state the member just set. |
| "Feels true" / "Not quite" / "It's something else" | `:1592`, `:1598`, `:1604` | the member is asked to adjudicate a **keyword-regex** element guess (`interview/route.ts:228–234`) whose result is **never persisted** (`NowWhatRoom.tsx:245–247`: "never sent to any API and never written to localStorage"). Three decisions with zero durable consequence. |
| 5 element buttons ("new energy trying to move", etc.) | `:1613–1621` | the member picks from the system's own five-element ontology, in translated language, for state that dies with the session. |
| "What is this space?" toggle ×2 | `:1051`, `:1119` | reveals a 45-line governance frame (`OPENING_FRAME` `:97–141`). |
| `RoomTrustCopy` `<details>` ×7 | `RoomTrustCopy.tsx:38–42`, rendered on 7 screens | the system explaining its own guarantees, as a control. |
| Wordmark link ×8 screens | `NowWhatShell.tsx:97`, `:116` | duplicates the "Map" pill on the same bar. |
| 7 duplicate map affordances | `EnvironmentMapView.tsx:210–297` vs `:364–395` | the SVG floor plan and the word-index below it target the **same 7 routes**. 14 clickable elements, 7 destinations. |
| "Themes" / "Reflections" doors ×2 (×2 renderings) | `:286`, `:292`, `:380–395` | two navigable rooms that lead to pages explaining they are not open (`themes/page.tsx`, `reflections/page.tsx` make zero data reads). |
| "Begin again" | `:1312` | `window.location.reload()` presented as a gesture. |

### Tally

| | Distinct controls | Share of distinct | Instance count (Max) | Share of instances |
|---|---:|---:|---:|---:|
| MATTERS | 37 | 52.1% | ~78 | 57.4% |
| EXPOSES IMPLEMENTATION | 34 | 47.9% | ~58 | 42.6% |
| **Total** | **71** | 100% | **136** | 100% |

**Uncertainty declared.** The distinct-control count (71) is lower than the instance
count (136) because per-thread controls repeat. Two classifications are arguable and
would move the ratio ~3 points either way: (a) the account fields at `arrive:151–158`
are classified MATTERS as a practical real-world act, though they exist for row-keying;
(b) "Come in" (`:802`) is classified EXPOSES IMPLEMENTATION on the single-option rule,
though it is deliberately designed as a threshold gesture.

## B.3 OBSERVATION — where the load concentrates

- **Highest single-screen load:** S6 Proposal, 26 at max — 3 threads × up to 7 controls
  each, plus 4 screen-level controls, plus the shell.
- **Highest ratio of implementation-exposure:** S5 Conversation. Of 21 max controls,
  **14 are input-modality, panel-toggle, duplicate, or unpersisted-inference controls**
  (mic ×1, TTS ×1, bring panel ×5, duplicate listen-back ×1, cell-candidate ×3, element
  picker ×5 — overlapping sets; 14 distinct). The two that carry the session are the
  textarea and Send.
- **The map is the highest-count screen in the environment** (14) and the one with the
  most duplication (7 destinations, 14 affordances, 2 of which lead to closed rooms).
- **Consent load:** 5 identical "Share with your practitioner" checkboxes, each a
  separate per-item decision (`field-note/route.ts:216–219`). A member who keeps 3
  threads plus a practice plus an offering makes **5 separate identical consent
  decisions in one session**, with the same recipient every time.

## B.4 INTERPRETATION (clearly separated)

A member walking one full session meets **45–87 decisions**, of which roughly **43% by
instance exist because the system needed disambiguation** rather than because a real
choice was at stake. The largest single contributors to that 43% are:
input-modality controls (11), duplicate routes to identical destinations (8), the
unpersisted element-confirmation flow (8), and the trust/governance disclosures (9).

The element-confirmation flow is the sharpest case: it asks up to 8 decisions across a
session about a regex-derived guess that is never stored. Whatever it costs the member,
the system keeps nothing from it.

The duplication pattern (map SVG + word index; wordmark + Map pill; listen-back top +
bottom) is documented in the code as a response to founder walk failures — the fix each
time was addition. The counts show the additions accumulating: on the map, one member
decision is presented as two identical affordances.

Against that, the developmental spine is genuinely thin and genuinely load-bearing:
**one question, one conversation, keep/revise/leave, one practice, one optional
offering.** Roughly 12 controls carry the entire developmental arc. Everything else is
scaffolding around them.

---

## Reproduction notes

Every count above was produced by reading the files listed in §0 in full, plus the
migration DDL cited inline. The two greps used for the relationship inventory:

```
grep -rniE '\b(colleague|coworker|direct report|manager|boss|teammate|board member|peer|stakeholder|spouse|family|friend|mentor|client|employee|staff)\b' \
  $(find app/now-what components/now-what app/api/now-what -type f)
grep -ric 'practitioner' $(find app/now-what components/now-what app/api/now-what -type f)
```

The first returns **zero matches in rendered member-facing copy** — every hit is either
the `'use client'` directive or the word "client" inside a code comment. That null result
is itself the load-bearing finding of Part A.
