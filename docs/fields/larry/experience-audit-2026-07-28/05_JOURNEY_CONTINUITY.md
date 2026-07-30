# 05 — Journey Continuity: Following One Executive Through Three Months

**Object:** the "Now What?" surface — `app/now-what/*`, `components/now-what/*`, `app/api/now-what/*`
**Method:** code evidence only. Persistence traced to migration + table + read path.
**Discipline held:** *built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.*
**Date:** 2026-07-28

---

## 0. Scope of the surface

Five API routes, eleven pages, four components:

| Route | Lines | Writes? | Reads? |
|---|---|---|---|
| `app/api/now-what/register/route.ts` | 162 | `members` INSERT | `members` SELECT |
| `app/api/now-what/signin/route.ts` | 88 | `members.last_sign_in` UPDATE | `members` SELECT |
| `app/api/now-what/interview/route.ts` | 408 | **NOTHING** | via `composeRoomTurnPrompt` only |
| `app/api/now-what/field-note/route.ts` | 275 | `member_field_note_threads`, `member_field_note_events` | `member_field_note_threads` |
| `app/api/now-what/program-position/route.ts` | 218 | `field_program_positions` (upsert/delete) | `field_program_positions` |

Every `INSERT INTO` in the entire `app/api/now-what/` tree — exhaustive, verified by grep:

```
app/api/now-what/register/route.ts:105    INSERT INTO members
app/api/now-what/field-note/route.ts:114  INSERT INTO member_field_note_events
app/api/now-what/field-note/route.ts:137  INSERT INTO member_field_note_threads
```

Plus, one layer down in the shared service:
`lib/practiceField/programPositionService.ts` — `upsertPosition()` (INSERT … ON CONFLICT DO UPDATE on `field_program_positions`), `deletePosition()` (hard DELETE).

**OBSERVATION.** There are exactly four member-data tables in play. There is no now-what conversation table, no transcript table, no session table.

---

## 1. WHAT IS WRITTEN WHEN A USER ACTS

### 1.1 Complete enumeration of persisted artifacts

| # | Artifact | Table | Migration | Trigger (member gesture) | Write site |
|---|---|---|---|---|---|
| W1 | Member account | `members` | `20260103000001_members.sql` | Registers at `/now-what/arrive` | `app/api/now-what/register/route.ts:105` |
| W2 | `last_sign_in` timestamp | `members` | same | Signs in | `app/api/now-what/signin/route.ts:73` |
| W3 | Auth audit event | (authAudit sink) | — | Register / signin | `register/route.ts:140`, `signin/route.ts:58,74` |
| W4 | Authored thread (kept / revised / split-child / created) | `member_field_note_threads` | `20260626000001_member_field_note_threads.sql:14` (+ `20260628000001`, `20260701000004` phase/field columns) | Member decides on MAIA's proposals at "Listen back" and hits carry | `field-note/route.ts:137` via `saveThread()`; client `NowWhatRoom.tsx:639` |
| W5 | Practice commitment (`spiralogic_phase='practice'`) | `member_field_note_threads` | same | Member types the one thing they'll live and commits | `NowWhatRoom.tsx:679 commitPractice()` → `saveTagged('practice')` `:663` → `field-note/route.ts:137` |
| W6 | Offering (`spiralogic_phase='offering'`) | `member_field_note_threads` | same | Member names what they'll make available | `NowWhatRoom.tsx:695 commitOffering()` → `saveTagged('offering')` |
| W7 | Question (`spiralogic_phase='question'`) | `member_field_note_threads` | same | Member keeps a MAIA-proposed thread whose `kind==='question'` | `field-note/route.ts:232` (`p.isQuestion ? 'question' : spiralogicPhase`) |
| W8 | Authorship ledger row (`kept`/`revised`/`discarded`/`created`) | `member_field_note_events` | `20260626000001_member_field_note_threads.sql:59` | Every decision above, incl. **discard** (which writes a row with `thread_id = NULL`) | `field-note/route.ts:114` via `logEvent()` |
| W9 | Program position | `field_program_positions` | `20260712000001_field_programs_and_positions.sql:59` | Member taps confirm, or types their own focal point | `program-position/route.ts:193,202` → `upsertPosition()` |
| W10 | Position deletion | `field_program_positions` | same | Member "departs" a program | `program-position/route.ts:176` → `deletePosition()` (hard DELETE, zero residue) |

### 1.2 What is NOT written

**OBSERVATION.** The conversation itself is never persisted. `app/api/now-what/interview/route.ts` contains no `query()` import and no DB write. Its header states the contract at `:27–28`: *"Ephemeral: this route does NOT persist anything."* The full conversation history is held in React state (`NowWhatRoom.tsx` `turns`) and re-transmitted on every turn (`callInterview` at `:408–428`, capped at `MAX_HISTORY = 40` turns, `MAX_CONTENT = 4000` chars — `interview/route.ts:53–54`).

**OBSERVATION.** Also not persisted: the inferred Spiralogic cell (`detectCellCandidate`, `interview/route.ts:242`), confirmed elements, dismissed elements, speech preferences, "bring an insight" pasted text, and `sessionRef` beyond its role as a column value. `NowWhatRoom.tsx:244–247` states this explicitly: *"never sent to any API and never written to localStorage."*

**OBSERVATION.** `member_field_note_threads` rows written from this room carry `content = title` — `field-note/route.ts:142` passes `$3` into both the `title` and `content` columns. There is no long-form body. The persisted artifact of a 45-minute session is a handful of short strings.

### 1.3 The write ceiling

`parseProposals` breaks at 6 (`field-note/route.ts:83`); `parseCreated` breaks at 6 (`:101`); MAIA proposes at most 3 threads (`interview/route.ts:283`). Practice and offering are one each per session.

**INTERPRETATION.** A maximal single session deposits roughly 3–5 short strings. Three months at fortnightly cadence (~6 sessions) yields a ceiling in the low tens of rows, most of them one sentence long.

---

## 2. WHAT IS READ ON A RETURN VISIT

### 2.1 Complete enumeration of read paths

| # | Read | Source | Consumer screen | Effect |
|---|---|---|---|---|
| R1 | `GET /api/now-what/field-note?fieldContext=…` → all non-released threads, `ORDER BY created_at DESC LIMIT 200` (`field-note/route.ts:170–179`) | `member_field_note_threads` | `app/now-what/field/page.tsx:65` | Renders the full list grouped by month (`:90–95`) |
| R2 | same GET, filtered `spiralogic_phase === 'practice'` | same | `app/now-what/next/page.tsx:56` | Renders "What you chose to live" list |
| R3 | same GET, filtered `spiralogic_phase === 'question'` | same | `app/now-what/questions/page.tsx:55` | Renders "Questions you're living" list |
| R4 | same GET, `.find(t => t.spiralogic_phase === 'practice')` | same | `components/now-what/NowWhatRoom.tsx:313` | **Sets `priorPractice`** → changes the room's opening AND MAIA's system prompt |
| R5 | `arrival` payload riding the same GET (`field-note/route.ts:186–193` → `resolveArrival()`) | `field_program_positions` + `field_programs` | `NowWhatRoom.tsx:317` | Renders the arrival/anchor affordance |
| R6 | `GET /api/now-what/program-position?fieldContext=…` (`program-position/route.ts:71`) | `field_program_positions` | `app/now-what/position/page.tsx:67` | Renders "Where you are" with epistemic footing |
| R7 | `composeProgramPositionBlock()` (`lib/practiceField/programPositionService.ts:327`) | `field_program_positions` | **MAIA's system prompt** via `roomComposition.ts:246` | Position text enters the prompt |
| R8 | `composeLessonContext()` (`roomComposition.ts:266`) | `field_program_lessons` (`20260714000001`) | MAIA's system prompt | Practitioner-authored lesson for the current step |
| R9 | `resolveFieldBlock()` (`roomComposition.ts:107`) | `practice_fields` | MAIA's system prompt | Practitioner's field corpus |
| R10 | `assemblePresenceContext()` (`roomComposition.ts:162`) | `developmental_memories`, `member_theme_signals`, `member_memory_atoms`, `conversation_turns` | MAIA's system prompt | **Flag-gated — see §5** |
| R11 | `localStorage.beta_user` (`NowWhatShell.tsx:47`) | browser | Every room's shell | Signed-in vs. threshold |

### 2.2 Screens that read NOTHING

**OBSERVATION.** Two of the seven member rooms make zero data reads by design:

- `app/now-what/themes/page.tsx` — header at `:6–8`: *"It makes ZERO data reads and ZERO interpretive calls."* The entire page is a static explanation of why the room is not running (HOLD + EXPLAIN, ruling 2026-07-13).
- `app/now-what/reflections/page.tsx` — header at `:6–7`: *"ZERO data reads, ZERO interpretive calls."* Same posture.

**OBSERVATION.** `app/now-what/map/page.tsx` (16 lines) and `app/now-what/welcome/page.tsx` (40 lines) are navigation/marketing surfaces with no member reads.

---

## 3. THREE SEPARATE QUESTIONS

### 3.1 Does the platform REMEMBER? — YES, narrowly and honestly.

**OBSERVATION.** Member-authored artifacts survive across sessions in `member_field_note_threads` and `field_program_positions`. Both are read back on return (R1–R7). Nothing about the member is inferred, scored, or modelled into storage — `field-note/route.ts:19` states *"No transcript, no categories, no elemental scores."*

**OBSERVATION.** What it does NOT remember: any conversation. Session 1's dialogue is gone the moment the tab closes. If the executive said something profound in month one and did not convert it into a kept thread, it does not exist anywhere in the system.

**Classification:** **VERIFIED** for W4–W8 (`console.info('[NowWhat/field-note] saved', …)` at `field-note/route.ts:269` emits per-save telemetry; the read path is exercised by the room's own return-detection on every load). **WIRED** for W9/R6/R7 — the code path is complete and unconditional given a resolved field, but I found no production-log or probe evidence in-repo confirming a member has actually declared a position.

### 3.2 Does the platform ACCUMULATE? — PARTIALLY. Two of the four artifacts do not.

**OBSERVATION — accumulates:** `member_field_note_threads` is append-only. Six sessions produce six sessions' worth of rows. `app/now-what/field/page.tsx:90–95` groups them by month, so month three genuinely shows more than month one.

**OBSERVATION — does NOT accumulate:** `field_program_positions` carries `UNIQUE (field_slug, program_slug, member_id)` (`20260712000001_field_programs_and_positions.sql:59`) and `upsertPosition()` does `ON CONFLICT … DO UPDATE SET focal_point = EXCLUDED.focal_point`. **Each new position overwrites the previous one.** There is exactly one row per member per program, forever. Where the executive stood in month one is destroyed when they restate in month two. There is no position history table.

**OBSERVATION — accumulates but is never read:** `member_field_note_events` grows on every decision including discards. Repo-wide grep for readers returns **only INSERT sites** (`field-lab/field-note/[id]/route.ts:33`, `field-lab/field-note/route.ts:89,111`, `vision-studio/field-note/route.ts:97`, `now-what/field-note/route.ts:114`). Zero TS/TSX reads. The one SQL consumer, `member_authorship_metrics` (`20260626000004_authorship_metrics_views.sql:25`), carries its own comment at `:57`: *"Gate 5 steward ecology (READ-ONLY, **never read at runtime**)"* — and no TypeScript file references that view either.

**Classification of the ledger:** **BUILT + WIRED (write side) / DEAD (read side).** This is a table that accumulates for no one.

**OBSERVATION — accumulates but is invisible:** threads written under an arc phase tag (`fire_1`…`aether_3`, or `unsolicited`/`closure`) render in `app/now-what/field/page.tsx` but `TAG_LABELS` (`field/page.tsx:38–41`) contains only `practice` and `offering`. A thread tagged `fire_2` renders as bare text with no label. Nothing anywhere filters or groups by arc phase.

### 3.3 Does the platform DEEPEN? — YES, but through exactly two narrow channels, one of which carries a single string.

This is the load-bearing question. "Deepening" = *later experience differs BECAUSE of earlier experience.* Two code paths produce it, and only two.

#### Channel A — the returning-practice prompt swap

`components/now-what/NowWhatRoom.tsx:299–326`:
```js
const practice = threads.find(t => t.spiralogic_phase === 'practice');
if (practice && !cancelled) setPriorPractice(practice.title);
```
→ `NowWhatRoom.tsx:422`: `...(priorPractice ? { returningPractice: priorPractice } : {})`
→ `app/api/now-what/interview/route.ts:314–315`: `returningPractice ? buildReturnPrompt(returningPractice) : buildPhasePrompt(phase)`
→ `interview/route.ts:134–151`: MAIA's entire system prompt is replaced. The opening becomes *"Last time you chose this practice. What happened?"*, with explicit instruction at `:142` not to evaluate adherence.

Client-side, `NowWhatRoom.tsx:773` (`const returning = priorPractice !== null`) suppresses the first-visit welcome (`:778`) and re-labels the input (`:976–979`, *"What actually happened…"*).

**This is genuine deep continuity.** Session 2 differs from session 1 in what MAIA says first and how it listens.

**But observe the width of the channel.** `.find()` on a list ordered `created_at DESC` returns exactly **one** thread — the most recent practice. In month three, an executive with three committed practices has two of them silently ignored by this path. The string is capped at 300 chars (`interview/route.ts:303`). Nothing else from the field — no questions, no offerings, no themes, no prior practices — reaches the prompt through this channel.

**INTERPRETATION.** Session 2 is meaningfully different from session 1. Session 6 is different from session 1 in exactly the same way and to exactly the same degree as session 2 was. The deepening is a step function that fires once and then flattens.

#### Channel B — the program-position block

`lib/maia/roomComposition.ts:245–282` calls `composeProgramPositionBlock()` when a field composed. `lib/practiceField/programPositionService.ts:353–400` renders into the prompt either:
- `The member told you where they are, in their own words: "…"` (`:361`, `member_stated`), or
- `Current focus: …` (`:362`, `member_confirmed`), or
- a stale-footing warning (`:371–373`) instructing MAIA *"Do not assume either — ask where they are before working from it."*

Plus `[ALSO ENGAGED …]` lines for other confirmed programs (`:397–399`).

`computeFooting()` (`:/export function computeFooting/`) downgrades to `assumed-from-last-known` when the member's confirmation predates the cohort's `setAt`. Stale positions in other programs are dropped entirely (`:395`).

**This is also genuine deep continuity** — and it is the more sophisticated of the two, because it models epistemic staleness rather than treating stored data as permanently true.

**Preconditions, all of which must hold** (`roomComposition.ts:245`): `NOW_WHAT_FIELD_CONTEXT_ENABLED !== '0'` (default on), a resolvable field (URL `fieldContext` slug or `NOW_WHAT_PRACTICE_FIELD_ID` pin), a `field_programs` cohort row, and a `field_program_positions` row for this member.

**INTERPRETATION.** Because the position row is overwritten rather than appended, this channel's content is a *snapshot*, not a trajectory. MAIA knows where the executive says they are today. It cannot know they have moved, because the record of where they were is deleted by the act of updating it.

#### Channel C — presence context (does NOT deepen this room)

`roomComposition.ts:288–290` composes `assemblePresenceContext()` only when `process.env.NOW_WHAT_MAIA_PRESENCE_ENABLED === '1'` (`:235`).

**OBSERVATION — flag state.** Grep across all env files:

```
.env.local:12  NOW_WHAT_MAIA_PRESENCE_ENABLED=1
.env.local:15  NOW_WHAT_PRACTICE_FIELD_ID=9c2f36ca-2c00-46b7-955b-bba335d0ea4f
```
`.env`, `.env.production`, `.env.docker`, `.env.staging`, `.env.example`, `.env.development.local`: **no `NOW_WHAT` keys at all.** No `NOW_WHAT` key appears in `docker-compose*.yml` or `Dockerfile*`.

**Classification:** the presence channel is **WIRED IN DEVELOPMENT ONLY** on the evidence in this repo. It is enabled in `.env.local` (Mac Studio dev) and absent from `.env.production`. I have not inspected the live container's environment, so this is **unverified for production** in the strict sense — the honest statement is: *no repo artifact enables it in production, and one repo artifact enables it in dev.*

**OBSERVATION — and it would not matter here even if on.** `assemblePresenceContext` reads `developmental_memories` (`memoryLoaders.ts:102`), `member_theme_signals` (`:150`), `member_memory_atoms` (`memoryAtomsLoader.ts:275`), and `conversation_turns` (`memoryLoaders.ts:209`). **The Now What? surface writes to none of these tables.** Its only writes are `members`, `member_field_note_threads`, `member_field_note_events`, `field_program_positions`. The interview route is explicitly *not* routed through `getMaiaResponse` precisely so it does not write turns — `interview/route.ts:44–47`: *"Deliberately NOT getMaiaResponse: that path increments turn count, reads history from the DB, and writes the exchange — incompatible with this room's ephemeral, client-held, no-write contract."*

**INTERPRETATION.** For an executive whose only contact with the platform is the Now What? rooms, `assemblePresenceContext` would return an empty string even with the flag on. It can only carry material earned in `/maia`. This is a structurally sealed channel, not merely a closed one.

---

## 4. WHERE CONTINUITY IS CREATED / WHERE IT IS LOST

### 4.1 Continuity CREATED (deep — changes what MAIA says or what is offered)

| Mechanism | Path | Tier |
|---|---|---|
| Returning-practice prompt swap | `NowWhatRoom.tsx:313` → `:422` → `interview/route.ts:314` → `:134` | **SURFACING** (member sees a different opening and hears a different first question) |
| Position block in system prompt | `roomComposition.ts:246` → `programPositionService.ts:353–400` | **WIRED** (surfacing conditional on a member having declared a position; no in-repo evidence one has) |
| Stale-footing refusal | `programPositionService.ts:366–375` | **WIRED** |
| Lesson context for current step | `roomComposition.ts:266` → `composeLessonContext()` | **WIRED** (requires a position AND ratified `field_program_lessons` rows) |
| Arrival affordance | `field-note/route.ts:189` → `NowWhatRoom.tsx:317` | **WIRED** |

### 4.2 Continuity CREATED (shallow — populates a list, changes nothing else)

| Mechanism | Path | Note |
|---|---|---|
| "Your field" month-grouped list | `field/page.tsx:65,90` | Grows. Read by no other code. |
| "What may be next" practice list | `next/page.tsx:56` | The page's own header at `:16–17` declares *"no recommendation engine and MAIA does not announce a next step here."* Intentionally inert. |
| "Questions you're living" list | `questions/page.tsx:55` | Nothing consumes kept questions downstream — not the prompt, not any other room. |
| "Where you are" | `position/page.tsx:67` | Reads the same single row the prompt reads. |

**INTERPRETATION.** Three of the four member-facing history rooms are read-only mirrors. The member sees their own accumulation; the system does not act on it.

### 4.3 Continuity LOST — writes with no corresponding read

| # | Lost artifact | Evidence |
|---|---|---|
| L1 | **The entire conversation.** Every turn of every session. | `interview/route.ts` has no DB write. Held in React state only. |
| L2 | **`member_field_note_events` — the whole ledger.** Every kept/revised/discarded/created decision, in a table with an index on `(member_id, created_at DESC)` built for reading. | 5 INSERT sites, 0 TS readers. Its only view is annotated *"never read at runtime"* (`20260626000004:57`). |
| L3 | **Discard decisions specifically.** `field-note/route.ts:227` writes `logEvent(…, 'discarded', 'discard')` with `thread_id = NULL`. | Into L2. Unreadable — the null thread_id means even a future reader could not say what was discarded. |
| L4 | **Offerings.** Written at `NowWhatRoom.tsx:701` with tag `'offering'`. | Read only into the undifferentiated `field/page.tsx` list. No offering room; nothing in the prompt; no practitioner surface. |
| L5 | **All but the most recent practice.** | `NowWhatRoom.tsx:313` `.find()`. Practices 1..n−1 render in a list and never re-enter MAIA's attention. |
| L6 | **Kept questions.** Persist under `spiralogic_phase='question'`. | Read only by `questions/page.tsx:55` for display. Never composed into any prompt. |
| L7 | **Prior positions.** | `upsertPosition()` `ON CONFLICT DO UPDATE` destroys the previous focal point. No history. |
| L8 | **Arc-phase tags** (`fire_1`…`aether_3`). Written on every carried thread via `spiralogicPhase` (`NowWhatRoom.tsx:646`). | `TAG_LABELS` (`field/page.tsx:38–41`) covers only `practice`/`offering`. Nothing groups, filters, or reasons over arc phase. |
| L9 | **The inferred Spiralogic cell.** Computed per turn at `interview/route.ts:380`. | Returned to the client, tints the holoflower, discarded on unmount (`NowWhatRoom.tsx:244–247`). |
| L10 | **`can_be_shown_to_practitioner`.** Set per thread by explicit member gesture. | Read by `app/studio/fields/[memberId]/page.tsx` — a practitioner surface, not member continuity. Correctly gated; noted here only for completeness. |

### 4.4 Continuity LOST — reads that exist but cannot fire on this surface

| # | Path | Why it cannot fire |
|---|---|---|
| L11 | `assemblePresenceContext` → `conversation_turns`, `developmental_memories`, `member_theme_signals`, `member_memory_atoms` | Flag `NOW_WHAT_MAIA_PRESENCE_ENABLED` absent from `.env.production`; **and** the source tables receive nothing from this surface even if enabled (§3.3 Channel C). |
| L12 | Return detection entirely | `NowWhatRoom.tsx:302`: `if (!fieldContext) { setReturnChecked(true); return; }`. **A member who opens `/now-what/room` without a `?fieldContext=` query param is treated as a first-time visitor forever** — welcome screen, generic prompt, no position block, no lesson block. `app/now-what/room/page.tsx:26` reads it purely from the URL. There is no fallback, no stored last-used field, no default. Continuity in this surface is carried by a link. |

### 4.5 Rooms that are honest holes

`themes/page.tsx` and `reflections/page.tsx` are **BUILT as explanation only**. They are not lost continuity — they are declared absence, with the gate conditions named in-file (`themes/page.tsx:12–15`: episodic memory live and tested, meaning-write rulings resolved, member-pulled invocation, provenance on every reflected theme, member ability to reject/remove, no practitioner access without separate consent). Both carry an explicit in-code prohibition against adding reads ahead of those gates.

**INTERPRETATION.** These two rooms are where cross-session pattern would live. Their emptiness is the single largest continuity gap on the surface, and it is a deliberate, documented, governed emptiness — not a defect.

---

## 5. DOES SESSION N+1 DIFFER FROM SESSION N?

**Answer: yes, but the difference is binary, not cumulative. It fires between session 1 and session 2 and never changes again.**

### 5.1 The differences that exist

| Difference | Fires when | Code path | Scales with N? |
|---|---|---|---|
| Welcome screen suppressed | any prior practice exists | `NowWhatRoom.tsx:773,778` | **No** — binary |
| Opening becomes "Last time you chose this practice. What happened?" | any prior practice exists | `interview/route.ts:140` | **No** — binary |
| Entire system prompt swapped to return-grammar | any prior practice exists | `interview/route.ts:314` → `:134–151` | **No** — binary |
| Input placeholder → "What actually happened…" | any prior practice exists | `NowWhatRoom.tsx:979` | **No** — binary |
| Position line in prompt | a position row exists | `programPositionService.ts:353` | **No** — one row, overwritten |
| Position downgraded to "last known, not reconfirmed" | cohort default moved past member's confirmation | `programPositionService.ts:366–375` | **No** — time-based, not history-based |
| `[ALSO ENGAGED]` lines | member holds ≥2 confirmed positions | `programPositionService.ts:397` | **Weakly** — scales with programs, not sessions |
| Lesson context | position + ratified lesson rows | `roomComposition.ts:266` | **No** |
| Lists get longer | every save | `field/page.tsx:90`, `next/page.tsx:56`, `questions/page.tsx:55` | **Yes — and this is the only thing that does** |

### 5.2 The precise statement

**Session 2 vs session 1:** materially different. Different first screen, different opening question, different system prompt, different listening instruction.

**Session 6 vs session 2:** identical in kind. Both are "return visits." MAIA's prompt in month three contains:
- exactly one practice string (the newest), 300 chars max — `interview/route.ts:303`
- exactly one position string (the current one) — `programPositionService.ts:349`
- the practitioner's field corpus (constant across all sessions) — `roomComposition.ts:119`
- optionally one lesson block for the current step

It does **not** contain: any prior conversation, any earlier practice, any kept question, any offering, any theme, any count of sessions, any span of time, any indication that this is the sixth visit rather than the second.

**No code path exists that produces a session-6-specific difference.** I searched for one: there is no `COUNT(*)` over threads feeding any prompt, no `MIN(created_at)` establishing a relationship start date, no session counter, no tenure branch. The `LIMIT 200` on the thread read (`field-note/route.ts:177`) is the only place volume appears, and it feeds display code exclusively.

**INTERPRETATION.** The system distinguishes "new" from "returning." It does not distinguish "returning" from "long-standing." Continuity here is a boolean, not a depth.

---

## 6. TIER CLASSIFICATION — every continuity mechanism

| Mechanism | BUILT | WIRED | SURFACING | VERIFIED | Notes |
|---|:-:|:-:|:-:|:-:|---|
| Thread persistence (`member_field_note_threads`) | ✓ | ✓ | ✓ | ✓ | Save + read + render all present; `console.info` telemetry at `field-note/route.ts:269` |
| Return-practice prompt swap | ✓ | ✓ | ✓ | — | Member perceives a different opening. No in-repo production proof. |
| Program position write | ✓ | ✓ | ✓ | — | Full gesture → row → render loop |
| Position block → prompt | ✓ | ✓ | ? | — | Surfacing only if a member has declared a position; no evidence any has |
| Lesson context → prompt | ✓ | ✓ | ? | — | Requires position **and** ratified lessons |
| Field corpus → prompt | ✓ | ✓ | ? | — | Requires a resolvable field; `NOW_WHAT_PRACTICE_FIELD_ID` set only in `.env.local` |
| Stale-footing refusal | ✓ | ✓ | ? | — | Depends on cohort `setAt` movement |
| Presence context (atoms / developmental / recall) | ✓ | dev only | ✗ | ✗ | Flag `NOW_WHAT_MAIA_PRESENCE_ENABLED` — `.env.local` only. **Structurally inert here regardless:** source tables receive no now-what writes. |
| Authorship ledger (`member_field_note_events`) | ✓ | write only | ✗ | ✗ | **Zero readers.** Its own view says "never read at runtime." |
| `member_authorship_metrics` view | ✓ | ✗ | ✗ | ✗ | No TS reference anywhere |
| Themes room | ✓ (as explanation) | ✗ | ✓ (the explanation surfaces) | — | Zero data reads by ruling |
| Reflections room | ✓ (as explanation) | ✗ | ✓ (the explanation surfaces) | — | Zero data reads by ruling |
| Conversation memory | ✗ | ✗ | ✗ | ✗ | Does not exist by design |
| Position history | ✗ | ✗ | ✗ | ✗ | Destroyed by upsert |
| Cross-session synthesis | ✗ | ✗ | ✗ | ✗ | Gated; see themes/reflections |

**Not promoted beyond evidence:** nothing in the "VERIFIED" column except thread persistence, and that on the strength of complete write+read code plus save telemetry — not on production log evidence, which I did not gather.

---

## 7. SEPARATED FINDINGS

### 7.1 OBSERVATIONS (code facts)

1. The Now What? surface writes to exactly 4 tables and reads from exactly 3 of them (`members`, `member_field_note_threads`, `field_program_positions`). `member_field_note_events` is written and never read.
2. `app/api/now-what/interview/route.ts` performs zero database writes. Conversation is client-held.
3. Return detection reads exactly one practice string via `.find()` (`NowWhatRoom.tsx:313`).
4. `field_program_positions` has a unique constraint per (field, program, member) and is upserted — no history exists.
5. `NOW_WHAT_MAIA_PRESENCE_ENABLED=1` appears in `.env.local:12` and in no other env file, compose file, or Dockerfile in the repo.
6. `assemblePresenceContext` reads four tables (`developmental_memories`, `member_theme_signals`, `member_memory_atoms`, `conversation_turns`), none of which the Now What? surface writes.
7. Two of seven member rooms (`themes`, `reflections`) make zero data reads, by explicit in-file ruling dated 2026-07-13.
8. `TAG_LABELS` in `field/page.tsx:38–41` covers 2 of the ~14 phase values `asPhase()` accepts (`field-note/route.ts:51–66`).
9. Without a `?fieldContext=` URL parameter, return detection short-circuits at `NowWhatRoom.tsx:302` and the member is treated as first-time.
10. No prompt anywhere on this surface receives a session count, a first-seen date, or any measure of tenure.

### 7.2 INTERPRETATIONS (clearly labelled as mine)

1. The architecture is unusually disciplined about *not* accumulating. Nearly every "loss" catalogued in §4.3 traces to an explicit, documented refusal (ephemerality, no synthesis, no interpretation, hard-delete on departure) rather than to oversight.
2. The exceptions — the dead ledger (L2/L3), the unused arc-phase tags (L8), the invisible offerings (L4) — are ordinary incompleteness, not governed absence. They are writes that nothing was ever built to read.
3. Deepening as implemented is a *threshold*, not a *gradient*. The single most consequential line for the executive's felt experience is `NowWhatRoom.tsx:313` — a `.find()` where the whole question of "what does MAIA carry from my history" is answered with "the newest practice, and nothing else."
4. The two rooms designed to hold cross-session meaning are the two rooms deliberately empty. The surface therefore *cannot* deepen with tenure until those gates lift, and it says so in its own source.
5. Continuity is carried by a URL parameter. This is the most fragile structural dependency I found — a bookmark to `/now-what/room` without `?fieldContext=` silently resets the executive to a first-time visitor, permanently, with no error and no recovery path.

---

## 8. THE THREE-MONTH ANSWER

An executive in month three, having run six sessions, encounters:

- **Different from a first-time user:** the welcome is skipped; MAIA opens with *"Last time you chose this practice. What happened?"* naming their newest commitment verbatim; the input asks what actually happened; if they ever declared a program position, MAIA's prompt carries it with honest epistemic footing.
- **Identical to a second-visit user:** every one of those differences. All of them fired in week two.
- **The only thing that grew:** three lists (Your field, What may be next, Questions you're living), each longer, none consulted by anything.

The system remembers. It accumulates in one table, overwrites in another, and writes a third that nothing reads. It deepens exactly once.

---

*No recommendations are offered. Every claim above is traceable to a cited file:line or migration filename.*
