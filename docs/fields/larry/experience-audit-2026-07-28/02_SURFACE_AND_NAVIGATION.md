# 02 — Surface Inventory & Navigation Philosophy (reverse-engineered)

**Phase 1 · reveal only · no recommendations.**
Method per `00_METHOD.md`: observations cite `file:line` or quote shipped copy; interpretations
are separately labeled. Tier discipline applies (`built ≠ wired ≠ surfacing ≠ verified`).

Scope: `app/now-what/*`, `components/now-what/*`, `app/api/now-what/*`, plus the connective
tissue in `middleware.ts`, `config/accessMatrix.ts`, and `next.config.js`.

Reading order note: **Part B §B.1–B.5 was written before either spec doc was opened.** §B.6
(divergence) was written after. This ordering is load-bearing to the value of §B.6.

---

# PART A — SURFACE INVENTORY

## A.0 Observation — the complete file census

| File | Lines |
|---|---|
| `app/now-what/arrive/page.tsx` | 195 |
| `app/now-what/field/page.tsx` | 237 |
| `app/now-what/map/page.tsx` | 16 |
| `app/now-what/next/page.tsx` | 196 |
| `app/now-what/position/page.tsx` | 223 |
| `app/now-what/questions/page.tsx` | 201 |
| `app/now-what/reflections/page.tsx` | 105 |
| `app/now-what/room/page.tsx` | 63 |
| `app/now-what/themes/page.tsx` | 108 |
| `app/now-what/welcome/page.tsx` | 40 (+ `opengraph-image.tsx`, 12) |
| `components/now-what/NowWhatRoom.tsx` | 1785 |
| `components/now-what/EnvironmentMapView.tsx` | 432 |
| `components/now-what/NowWhatShell.tsx` | 244 |
| `components/now-what/RoomTrustCopy.tsx` | 63 |
| `app/api/now-what/interview/route.ts` | 408 |
| `app/api/now-what/field-note/route.ts` | 275 |
| `app/api/now-what/program-position/route.ts` | 218 |
| `app/api/now-what/register/route.ts` | 162 |
| `app/api/now-what/signin/route.ts` | 88 |

There is **no** `app/now-what/page.tsx` and **no** `app/now-what/layout.tsx`. The root path is a
config-level redirect (`next.config.js:138-140`) and there is no shared layout — every page
mounts its own chrome.

`NowWhatRoom.tsx` at 1785 lines is 41% of the entire surface's line count.

---

## A.1 Observation — surface inventory table

Legend for **Tier**: BUILT (code exists) · WIRED (a caller reads it) · SURFACING (a member sees
its output) · VERIFIED (production witness cited in-repo).

### Member routes

| Route | Purpose (from code + shipped copy) | Data read | Tier | Unique? |
|---|---|---|---|---|
| `/now-what` | Nothing — 307 to `/now-what/room` (`next.config.js:138-140`, `permanent:false`) | none | SURFACING | Yes (address only) |
| `/now-what/pitch` | Rewrite → static `public/now-what/index.html` prospect deck (`next.config.js:103-106`) | none | SURFACING | Yes |
| `/now-what/welcome` | Public marketing landing; renders shared `PublicSectionLanding` from `lib/og/ogCard` `SECTIONS['now-what']` | none | SURFACING | **Overlaps `/now-what/pitch`** — both are outward faces |
| `/now-what/arrive` | Environment-local signup **and** signin, tabbed (`page.tsx:42` `mode: 'create' \| 'signin'`); honors `?next=` default `/now-what/room` (`:38-40`) | POST register/signin | SURFACING | **Overlaps platform `/signin` and `/begin`** |
| `/now-what/map` | 16 lines; `return <EnvironmentMapView viewer="member" />` | none (component fetches nothing) | SURFACING | Yes as a route; the substance is the component |
| `/now-what/room` | 63 lines; threshold-or-room switch; mounts `NowWhatRoom` with `phase` (default `fire_1`, `:25`), `fieldContext`, `program` | via `NowWhatRoom` | SURFACING | Yes — the only generative surface |
| `/now-what/field` | "What you kept, in your own words." All threads, grouped by month | `GET /api/now-what/field-note` (`:66`) → `setThreads(json.threads)` (`:68`) | SURFACING | **No — superset of `questions` + `next`** |
| `/now-what/questions` | "The questions you kept, waiting for you — kept warm." | same endpoint (`:50`), then `threads.filter(t => t.spiralogic_phase === 'question')` (`:55`) | SURFACING | **No — client-side filter of `/field`** |
| `/now-what/next` | "The practices you chose, and the door to your next step." | same endpoint (`:51`), then `threads.filter(t => t.spiralogic_phase === 'practice')` (`:56`) | SURFACING | **No — client-side filter of `/field`** |
| `/now-what/position` | "Your place, as you declared it." | `GET /api/now-what/program-position?fieldContext=` (`:67-69`) | WIRED; surfacing only if `field_program_positions` has rows | Yes (distinct table) |
| `/now-what/themes` | HOLD + EXPLAIN. `holds="Nothing yet — this page is the whole room. No member data is read to render it."` (`:79`) | **none, deliberately** | SURFACING (as an explanation) | **Overlaps `/reflections` structurally** |
| `/now-what/reflections` | HOLD + EXPLAIN. Identical `holds=` string (`:76`) | **none, deliberately** | SURFACING (as an explanation) | **Overlaps `/themes` structurally** |

### Components

| Component | Purpose | Consumers | Unique? |
|---|---|---|---|
| `NowWhatRoom.tsx` (1785) | The live encounter: turns, proposal, authorship gestures, voice input, insight paste, holoflower centre | `/now-what/room` only | Yes. **But its own docblock line 4 reads `Vision Studio Room — Living Field genesis experience`** — it is named for a different product |
| `EnvironmentMapView.tsx` (432) | SVG floor plan + word index of 7 rooms; `viewer: 'member' \| 'practitioner'` | `/now-what/map` **and** `app/studio/environment/page.tsx:17` | Yes — one component, two audiences |
| `NowWhatShell.tsx` (244) | Persistent header (`variant: 'full' \| 'quiet'`) + `NowWhatThreshold` sign-in door + `useMemberSession()` (`localStorage.beta_user`, `:47`) | 7 pages | Yes. **But it carries three concerns**: chrome, auth threshold, and session detection |
| `RoomTrustCopy.tsx` (63) | Collapsible 4-register disclosure: Holds / Never holds / Who can see it / Your control | 6 pages | Yes |

### API routes

| Route | Purpose | Store | Tier | Unique? |
|---|---|---|---|---|
| `POST /api/now-what/interview` | Live model turn. **Persists nothing** (docblock `:27-28`). Shares `composeRoomTurnPrompt` with `app/api/maia/vision-studio/interview/route.ts` via `lib/maia/roomComposition.ts:49` | none | SURFACING | **Sibling route exists** — deliberately deduped at the composition layer, not the route layer |
| `GET/POST /api/now-what/field-note` | The only persistence path. `SELECT … FROM member_field_note_threads WHERE member_id = $1 AND released_at IS NULL AND ($2::text IS NULL OR field_context = $2) ORDER BY created_at DESC LIMIT 200` (`:170-177`). Also piggybacks `arrival` (`:189`) | `member_field_note_threads`, `member_field_note_events` | SURFACING | Yes — **and it is the single read for three routes** |
| `GET/POST /api/now-what/program-position` | Member-scoped positions; POST accepts exactly one of confirm/focalPoint/depart (`:137-140`), strict key allowlist (`:104`) | `field_programs`, `field_program_positions` | WIRED | Yes |
| `POST /api/now-what/register` | Creates member + session. Email-uniqueness check (`:87`), INSERT INTO `members` (`:105`) | `members` | SURFACING | **Overlaps `/api/members/register`** |
| `POST /api/now-what/signin` | Authenticates against `members` (`:43`), updates `last_sign_in` (`:73`) | `members` | SURFACING | **Overlaps `/api/members/signin`** |

---

## A.2 Observation — every overlap, with evidence

**Overlap 1 — Three routes, one query, one filter each.**
`/field`, `/questions`, `/next` all issue the identical request:

```
app/now-what/field/page.tsx:66      apiFetch(`/api/now-what/field-note${qs}`)
app/now-what/questions/page.tsx:50  apiFetch(`/api/now-what/field-note${qs}`)
app/now-what/next/page.tsx:51       apiFetch(`/api/now-what/field-note${qs}`)
```

They diverge only in the line immediately after:

```
field/page.tsx:68      setThreads(json.threads ?? []);                                    // no filter
questions/page.tsx:55  setQuestions(threads.filter(t => t.spiralogic_phase === 'question'));
next/page.tsx:56       setPractices(threads.filter(t => t.spiralogic_phase === 'practice'));
```

`/field` is a strict superset. A member with three kept questions sees those same three rows in
two places. The API does no kind-filtering at all — the discrimination is entirely client-side.

**Overlap 2 — Four rooms share one primary gesture.**
`field:189`, `position:175`, `questions:153`, `next:148` each render exactly one accented action,
and in all four cases it is the same computed value:

```
const roomHref = `/now-what/room${fieldContext ? `?fieldContext=…` : ''}`
```
(`field:76`, `questions:75`, `next:76`, `position:91` — four verbatim copies of the same expression.)

**Overlap 3 — `/themes` and `/reflections` are the same file with different prose.**
A normalized diff (substituting the two room names) reduces to docblock wording, one animation
keyframe name (`nwtFadeUp` vs `nwrFadeUp`), and body copy. Both carry byte-identical trust-copy
values for two of four registers:

- `holds="Nothing yet — this page is the whole room. No member data is read to render it."` (themes:79, reflections:76)
- `whoSees="This explanation is the same for everyone. There is nothing of yours here for anyone to see."` (themes:81, reflections:78)

Both answer the same user question — *why can't I see patterns in my own material yet?*

**Overlap 4 — Two authentication front doors onto one `members` table.**
`/now-what/arrive` + `/api/now-what/register` + `/api/now-what/signin` duplicate the function of
`/signin`, `/begin`, `/api/members/register`, `/api/members/signin`. Both write the same table.
`config/accessMatrix.ts:69` records this as intentional: *"the invitation is the gate (`/begin`
stays AIN's universal door)"*. The duplication is at the **door**, not the identity.

**Overlap 5 — Two outward faces.**
`/now-what/welcome` (React landing) and `/now-what/pitch` (static deck) are both public,
both non-rooms. `welcome/page.tsx:35-36` links to *both* `/now-what` and `/now-what/pitch`.

**Overlap 6 — Two rooms with one composition engine.**
`app/api/now-what/interview/route.ts:43-49` explicitly names `app/api/maia/vision-studio/interview`
as its sibling and imports the shared `composeRoomTurnPrompt` *"extracted so the siblings cannot
drift."* The overlap is acknowledged and fenced, not removed.

**Non-overlap worth recording:** `EnvironmentMapView` serves both `/now-what/map` and
`/studio/environment` from one file, with the boundary enforced structurally — the component
*fetches no member data on either clearance* (`:22-24`). This is the one place where a shared
surface reduces rather than multiplies risk.

---

## A.3 Observation — the actual link graph

Built from `href=`/`redirect`/`rewrite` occurrences only. No inferred edges.

```
EXTERNAL / CONFIG EDGES
  /whatnow      ──307──▶ /now-what                      next.config.js:120-125
  /what-now     ──307──▶ /now-what                      next.config.js:126-129
  /now-what     ──307──▶ /now-what/room                 next.config.js:138-140
  /now-what/pitch ─rewrite▶ public/now-what/index.html  next.config.js:103-106
  ANY /now-what/* (unauthed) ──302──▶ /now-what/arrive?next=<full original>&rid=
                                                        middleware.ts:290-297

IN-APP EDGES
  welcome ──▶ /now-what            welcome/page.tsx:35
  welcome ──▶ /now-what/pitch      welcome/page.tsx:36

  arrive  ──▶ window.location = next   arrive/page.tsx:85   (default /now-what/room)

  NowWhatShell (mounted on: room[quiet], field, position, questions, next, themes, reflections)
          ──▶ /now-what/map        NowWhatShell.tsx:98, :117
          ──▶ /now-what/room       via DOORS :55-59
          ──▶ /now-what/field      via DOORS :55-59
  NowWhatThreshold
          ──▶ /now-what/arrive?next=  NowWhatShell.tsx:222
          ──▶ /now-what/map           NowWhatShell.tsx:229

  EnvironmentMapView (mounted on /now-what/map AND /studio/environment)
          ──▶ room :210 · field :231 · position :249 · questions :261
              next :273 · themes :286 · reflections :292
              (+ word-index duplicates at :367, :383)

  field :189 ──▶ room        position :175 ──▶ room
  questions :153 ──▶ room    next :148 ──▶ room
  NowWhatRoom :1307 ──▶ /now-what/field

INBOUND FROM THE WIDER MAIA APP
  (none)
```

**Observation — degree table.**

| Route | In-degree (in-app) | Out-degree |
|---|---|---|
| `/now-what/room` | 7 | 1 (→ field) |
| `/now-what/map` | 2 (shell ×2 positions, threshold) | 7 |
| `/now-what/field` | 3 (shell, map, room) | 1 (→ room) |
| `/now-what/position` | 1 (map only) | 1 (→ room) |
| `/now-what/questions` | 1 (map only) | 1 (→ room) |
| `/now-what/next` | 1 (map only) | 1 (→ room) |
| `/now-what/themes` | 1 (map only) | 0 (shell only) |
| `/now-what/reflections` | 1 (map only) | 0 (shell only) |
| `/now-what/welcome` | **0** | 2 |
| `/now-what/arrive` | 2 (middleware, threshold) | 0 (JS redirect only) |

**Observation — `/now-what/welcome` has zero inbound links from anywhere in the codebase.**
This is deliberate and documented: `EnvironmentMapView.tsx:66-71` records that a "The door" card
routing to the public landing *"was dropped as an impostor — it wired a signed-in member out to
the public landing."*

**Observation — the shell knows 3 rooms; the map knows 7.**
`NowWhatShell.tsx:55-59`:
```
const DOORS = [ {Map, /now-what/map}, {Session room, /now-what/room}, {Your field, /now-what/field} ]
```
`EnvironmentMapView.tsx` defines `OPEN_ROOMS` (room, field, position, next, questions) and
`PROTECTED_ROOMS` (themes, reflections). The persistent chrome therefore offers no direct path to
5 of the 7 rooms; the map is the sole hub.

**Observation — the `current` prop is invisible in 5 of 7 rooms.**
In the **quiet** variant (used only by `/now-what/room`, `room/page.tsx:45`), `current` renders as
text: `NowWhatShell.tsx:105`. In the **full** variant (used by the other six pages), `current` is
consumed only by the match test `d.name === current` (`:127`). Since `DOORS` contains only
`Map / Session room / Your field`, the strings `"Where you are"`, `"Questions you're living"`,
`"What may be next"`, `"Themes"`, `"Reflections"` never match, so those five pages set
`aria-current` on nothing and display no location label at all.

---

## A.4 Observation — access & isolation

`config/accessMatrix.ts:57-70` — six rules; four public (`/now-what`, `/now-what/welcome`,
`/now-what/pitch`, `/now-what/arrive`, `/api/now-what/register`), one gated
(`prefix: '/now-what/room'`, `minTier: 'free'`).

`middleware.ts:290-297` is the **only** `now-what`-specific branch in middleware, and it is a
redirect-target override: `now-what` traffic goes to `/now-what/arrive` instead of `/signin`,
carrying `pathname + search` as `next`.

**Observation — connections to the wider MAIA app, exhaustively:**
1. `middleware.ts:290` (redirect override)
2. `config/accessMatrix.ts:53-70` (access rows)
3. `next.config.js:93-140` (rewrite + 3 redirects)
4. `app/studio/environment/page.tsx:17` imports `EnvironmentMapView` — the only shared component
5. `app/api/maia/vision-studio/interview/route.ts:33, :392` — comments naming the sibling; shared code lives in `lib/maia/roomComposition.ts`
6. Shared `members` table, `apiFetch`, `getCurrentSession`, `getMemberIdFromRequest`, `RoomHoloflower`

There are **zero navigation links from any MAIA nav, rail, or menu into `/now-what`.**
`room/page.tsx:4-7` states the design: *"Isolated reference embodiment (founder direction
2026-07-06): the client experience lives in its own namespace … and does not modify framework surfaces."*

---

## A.5 Observation — the empty-state surface

Per `00_METHOD.md` §4. With zero `member_field_note_threads` rows and zero
`field_program_positions` rows, a signed-in member walking the map encounters:

| Room | Rendered content |
|---|---|
| Session room | Full (generative — no data prerequisite) |
| Your field | Empty state only |
| Questions you're living | Empty state only |
| What may be next | Empty state only |
| Where you are | Empty state only |
| Themes | Full (the explanation *is* the room) |
| Reflections | Full (the explanation *is* the room) |

Observation, not inference: on a first walk, **the two rooms that are deliberately not running are
the only rooms besides the Session room with content on the screen.**

---

## A.6 INTERPRETATIONS — Part A

*Labeled inference. Not observation.*

- **I-A1.** The environment has one act and six windows. Only `/now-what/room` produces anything;
  every other member room is a read of what that room left behind, and every one of those reads
  terminates in a link back to it. The out-degree table is the shape of a hub-and-spoke, not a
  geography.
- **I-A2.** Room identity is carried by *copy*, not by *mechanism*. `/questions` and `/next` are
  distinguished from `/field` by one string comparison each. The differentiation that makes them
  feel like different places lives entirely in the h1, the section label, and the trust copy.
- **I-A3.** The 1785-line `NowWhatRoom` versus the 105-line `/reflections` is not a defect but it
  is a fact about where identity accumulated: the room grew, the rooms-about-the-room stayed thin.
- **I-A4.** `NowWhatShell` conflates three jobs (chrome, auth threshold, session sensing) and knows
  a different room list than the map. That the persistent chrome and the hub disagree about how
  many rooms exist is the structural residue of them having been authored at different moments.
- **I-A5.** The isolation is real and deliberate, but it is asymmetric: `Now What?` can reach into
  the platform's identity store, and the platform's practitioner studio reaches into `Now What?`'s
  map component — but no platform *navigation* reaches in. A member of MAIA cannot arrive here by
  walking; they must be sent.

---

# PART B — NAVIGATION PHILOSOPHY, REVERSE-ENGINEERED

**Written before opening any spec document.** Inferred from route names, nesting, link graph,
data model, and ordering only.

## B.1 The candidates, with evidence and confidence

### Candidate 1 — Organized around **PLACE** (a building of rooms) · confidence **HIGH**

Evidence:
- The hub renders an SVG floor plan; the component is literally `BuildingMap`
  (`EnvironmentMapView.tsx:153`) with "chambers", an "arrival arch", and an "east corridor" (`:141-150`).
- CSS class `nw-chamber` on every map link (`:210, :231, :249, …`).
- The nav element is `aria-label="Rooms"` (`NowWhatShell.tsx:125`); the shell's own docblock calls
  itself *"the hallway"* and its links *"doors"*.
- Route names are locative or interrogative-locative, never functional: `arrive`, `room`, `field`,
  `position` (rendered as "Where you are"), `map`. Not `dashboard`, `history`, `settings`.
- `route: null` in a `RoomDef` is documented as *"not yet open; never guessed"* (`:58`) — an
  unbuilt feature is modeled as **an unopened door**, not a disabled feature.
- Auth is modeled as `NowWhatThreshold` — a *door met before the room* (`NowWhatShell.tsx:155-159`).

### Candidate 2 — Organized around **AUTHORSHIP / PROVENANCE** · confidence **HIGH**

Evidence:
- The single persistence table is `member_field_note_threads`, and every thread carries an
  `authorship` column read on every room load (`field-note/route.ts:170`).
- The distinguishing enum is `authorship ∈ {maia_proposed, member_authored}`
  (`field-note/route.ts:264`), and `can_be_shown_to_practitioner` defaults FALSE per
  `NowWhatRoom.tsx:19`.
- Every room h1 is possessive and past-tense-of-the-member's-act:
  *"What you kept, in your own words."* · *"The questions you kept."* · *"The practices you chose."*
  · *"Your place, as you declared it."*
- `RoomTrustCopy`'s four fixed registers (holds / never holds / who sees / your control) are
  identical across every room — the constant across the environment is not a feature set, it is a
  **consent contract**.
- `stated_by ∈ {member_confirmed, member_stated, practitioner_seeded}` in the position store.
- The interview route persists **nothing** (`:27-28`). Nothing crosses into storage except by gesture.

### Candidate 3 — Organized around **CONVERSATION** (one act, many views) · confidence **HIGH**

Evidence:
- `/now-what` resolves to `/now-what/room`, not to the map (`next.config.js:138-140`).
- All four data rooms' single accented action is a link back to the room (§A.2 Overlap 2).
- `EnvironmentMapView.tsx` marks the room `primary: true` with the comment *"Session room = every
  arc's center of gravity"* (`:40-42`).
- Three of five open rooms are filters over the artifacts of one conversation.
- `NowWhatRoom` is 41% of the surface's code.

### Candidate 4 — Organized around **TIME** · confidence **LOW**

Evidence for: `/field` groups threads by month (`field/page.tsx:80-86`); every list is
`ORDER BY created_at DESC`; each row shows a `dayLabel`.
Evidence against: there is no timeline, no journey, no calendar, no arc-over-time view anywhere.
Time is a *sort key and a grouping label*, never a navigational axis. Nothing lets a member move
through time; they can only look at a reverse-chronological list.

### Candidate 5 — Organized around **PEOPLE / RELATIONSHIP** · confidence **LOW**

Evidence for: `can_be_shown_to_practitioner` is a per-thread member gesture; `stated_by` records
`practitioner_seeded`; a practitioner clearance of the map exists.
Evidence against: the practitioner is present in the data model **only as a permission flag and a
negation**. `position/page.tsx:190`: *"Your practitioner cannot see your positions — there is no
read for them, anywhere."* `EnvironmentMapView.tsx:20-24`: *"the practitioner sees the STRUCTURE of
holding, never what's held."* No route surfaces another person. There is no shared surface, no
message, no session-with-someone. The other person is an *access boundary*, not a destination.

### Candidate 6 — Organized around **COACHING / PROGRAM / WORKFLOW** · confidence **LOW**

Evidence for: `field_programs` + `field_program_positions` exist; `fieldContext` and `program`
propagate through nearly every URL; `phase` defaults to `fire_1` (`room/page.tsx:25`).
Evidence against, strongly: there is no sequence, no step counter, no completion state, no
progress, no next-step assignment. `next/page.tsx:163` explicitly disclaims it, and
`EnvironmentMapView.tsx` says of "What may be next": *"No one here decides your next step, and
nothing is recommended."* `/position` shows only what the member *declared*. The program vocabulary
exists to **locate** a member, never to **advance** them.

### Candidate 7 — Organized around **FEATURES** or **DOCUMENTS** · confidence **VERY LOW**

No feature nouns in any route name. No document, file, note, or artifact route. Nothing is
titled, versioned, edited, or organized by the member. `member_field_note_threads.title` is a
line of the member's own speech, not a document name.

### Candidate 8 — Organized around **TRANSFORMATION** · confidence **LOW-MEDIUM**

Evidence for: Spiralogic phase vocabulary is present (`spiralogic_phase`, `PHASE_LENS`,
`inferSpiralogicCell`); the interview route tints the room by inferred element.
Evidence against: `interview/route.ts:30-31` states cell inference *"is read-only and secondary —
it tints the room, never drives the reply,"* and `:17-19` records that a phase-scripted design was
**removed** for producing "could-be-anyone questions." `spiralogic_phase` is repurposed in the
persistence layer as a plain thread-kind discriminator (`'question'`, `'practice'`) rather than a
developmental stage. The transformation vocabulary survives as *atmosphere*, having been
deliberately stripped of *authority*.

## B.2 The ordering evidence

There is no ordering. `OPEN_ROOMS` is declared room · field · position · next · questions
(`EnvironmentMapView.tsx:59-125`); `DOORS` is map · room · field (`NowWhatShell.tsx:55-59`); the
SVG floor plan places them spatially. **No array index means "step 2."** No route reads a
completion state to decide what to show next. Every room is reachable from the map at all times.

## B.3 What the structure refuses (inferred from absences)

Absences are observations here — each is a thing the code had the ingredients for and did not build:
- No numeric anything. No counts, scores, streaks, percentages, or stat tiles on any room.
- No aggregation across threads. `member_field_note_threads` is never `GROUP BY`'d.
- No system-authored rows. `authorship` has no value that a system write could legally use.
- No cross-member surface. Nothing joins two members' data.
- No completion. Nothing marks a thread done, closed, or achieved. `released_at IS NULL` is the
  only lifecycle predicate, and release is a member act.
- No inference-driven navigation. Nothing about the member decides what is on screen.

## B.4 INTERPRETATION — the implicit organizing principle

**Single-sentence verdict:** *`Now What?` is organized as a **place built around one act of
speaking**, in which every other surface exists to show the member — in their own words, without
aggregation, ranking, or interpretation — what they themselves chose to keep from that speaking,
and then to walk them back to it.*

Consequences of that principle, as read from structure:
- The building metaphor is not decoration; it is what carries identity when the mechanisms are
  nearly identical (§A.2 Overlap 1 and 3). Because the system may not *interpret* the member's
  material, it cannot differentiate rooms by intelligence — so it differentiates them by
  **address and by name**.
- Consent copy is the environment's only universal grammar. `RoomTrustCopy` is the one component
  on almost every page, with the same four registers everywhere.
- Refusals are given rooms of their own. `/themes` and `/reflections` are addresses whose content
  is an explanation of why they are closed. This is unusual enough to be diagnostic: the
  environment treats *not doing something* as a first-class place a member can visit.

## B.5 Confidence summary

| Organizing axis | Confidence |
|---|---|
| Place / rooms (surface grammar) | HIGH |
| Authorship & consent (data model) | HIGH |
| Conversation as centre (link graph) | HIGH |
| Transformation | LOW-MEDIUM (vocabulary present, authority removed) |
| Time | LOW (sort key, not axis) |
| People | LOW (boundary, not destination) |
| Coaching / workflow | LOW (locating, never advancing) |
| Features / documents | VERY LOW |

---

## B.6 Where my structural inference and the stated intent diverge

*Written after reading `NOW_WHAT_UX_INTEGRATION_CANDIDATE_2026-07-12.md` and
`NOW_WHAT_ROOMS_COMPLETION_AUDIT_2026-07-13.md`. Observations first, then interpretation.*

### Convergences (recorded briefly, so the divergences are readable)

The place-grammar (B.1 Candidate 1) is exactly the stated intent: *"one building, one register …
reached by walking, never by menu"* (UX §"The organizing decision"). The authorship/consent axis
matches the Completion Audit's governing constraints verbatim. The "outside stays outside" ruling
predicted `/now-what/welcome`'s zero in-degree, and the reserved-slot comment I found in code is
the ruling's own artifact. Themes/Reflections as HOLD + EXPLAIN was authored as such.

### Divergence 1 — **The ground moved, and no one wrote it down**

UX invariant #1: *"**The map is the ground.** `/now-what` lands on the map (Q6 — ruling pending)."*
Open decision #2: *"Q6 landing: map vs room — Open — recommendation: map. Exhibits: founder trapped
in room (dead end)."* Build step 4: *"Q6 ruling → `/now-what` lands on map."*

Shipped: `next.config.js:138-140` redirects `/now-what` → `/now-what/room`, with the in-file
comment *"room as entry (2026-07-08) … a person here to practice lands in the practice, not a
slideshow."*

**Observation:** Q6 appears never to have been ruled. The 07-08 room-as-entry decision predates
the 07-12 spec, survived it, and is still the live behaviour on 07-28. The spec's *stated* ground
is the map; the *actual* ground is the room. My structural inference (B.1 Candidate 3) read
room-as-centre with HIGH confidence precisely because the code says so.

**Interpretation:** this is the single largest divergence, and it is not a bug — it is an
unresolved decision that has been settled by default for sixteen days. The whole geography
argument in the UX candidate is downstream of a landing that was never changed.

### Divergence 2 — **"Not a nav bar" shipped as a nav bar**

UX §"What this rethink is NOT": *"Not a nav bar, breadcrumbs, or app chrome — wayfinding stays
doorway-grammar."*

Shipped: `NowWhatShell.tsx:125` renders `<nav aria-label="Rooms">` containing three pill links,
persistent at the top of seven pages, with `aria-current="page"` on the active one (`:130`).

**Observation:** by markup and by behaviour this is a horizontal navigation bar. It was authored
*after* the spec (the file's own docblock cites walk finding #5, 2026-07-12: *"I don't know what
to do navigating this"*) and its comment at `:125` reads *"Full variant = real navigation, not
labels."*

**Interpretation:** the walk overturned the doctrine in the same week the doctrine was written,
and the code records the overturning while the spec still states the original prohibition. The
more interesting divergence is *which* three rooms: the nav is a nav for the three rooms that
existed on 07-12, and was never extended when four more opened on 07-13+. The prohibition against
chrome may be why nobody revisited it.

### Divergence 3 — **The audit said "link, don't build"; the code built**

Completion Audit §2, "What may be next" — disposition **WIRE (link, don't build)**: *"the map room
routes into the existing member-pulled experience with honest framing copy. **No new mechanism.**"*

Shipped: `app/now-what/next/page.tsx`, 196 lines, with its own fetch, its own filter, its own
empty state, its own trust copy, and a link to the room.

**Observation:** the audit's letter was honoured — no new *mechanism* was added (the fetch reuses
`field-note`). The audit's shape was not: what was described as a routing target became a full
room. The same happened to "Questions you're living," which the audit disposed as **BUILD-small**
with the note *"No dedicated substrate"* — and which shipped as a 201-line page whose entire
substrate is `t.spiralogic_phase === 'question'` on a shared response.

**Interpretation:** the completion drive turned dispositions into pages. Three of the audit's seven
rooms were resolved by giving them addresses over one existing query. This is precisely the
mechanism behind §A.2 Overlap 1 — the overlap is not an accident of parallel development, it is
the direct consequence of "complete the environment" being executed room-by-room against a data
model that only ever had two tables.

### Divergence 4 — **"One primary gesture per surface" became "one identical gesture on four surfaces"**

UX invariant #4: *"One primary gesture per surface. Map: Session room card carries 'begin here'
weight. Room: the conversation. Field: reading what you kept."*

Shipped: field, position, questions and next each carry exactly one accented action, and it is the
same link, computed by four verbatim copies of the same expression (§A.2 Overlap 2).

**Observation:** the invariant is literally satisfied on every page and its intent — that each
surface have its *own* primary act — is not. Only the Session room and the Map have a gesture
unique to them. The Field's stated primary gesture in the spec was *"reading what you kept"*, which
is not a gesture at all.

### Divergence 5 — **The spec's room census is stale in two directions**

The Completion Audit (07-13) records `OPEN_ROOMS` = 2 (room, field) and `COMING_ROOMS` = 5 with
`route: null`. Today `OPEN_ROOMS` = 5 and `PROTECTED_ROOMS` = 2 — a different constant name, a
different semantic (deliberately protected vs not-yet-built), and the audit's Phase-2 slice
appears to have shipped in full.

Neither spec contains `/now-what/arrive`. It was authorized 2026-07-16 (`arrive/page.tsx:6`,
`accessMatrix.ts:68-69`), three days after the later document. **Observation:** a second
authentication front door, a second `register`/`signin` API pair, and a middleware special-case
were added to the environment after both navigation specs were written, and neither was amended.

**Interpretation:** the geography documents describe a 7-room building. The shipped environment is
a 7-room building **with its own front gate and its own passport office**, and the gate is the
surface a first-time member actually meets first (middleware sends all unauthenticated traffic
there). The most-encountered surface in the environment appears in neither spec.

### Divergence 6 — **The stated diagnosis was hallways; the hallway that shipped is partial**

UX §"The diagnosis in one sentence": *"no one built the **hallways** — the member experiences a set
of disconnected rooms, not one environment."*

**Observation:** the hallway exists (`NowWhatShell`) and reaches 3 of 7 rooms. The map reaches 7 of
7 and has an in-degree of 2. Five rooms have an in-degree of exactly 1 (the map). Five rooms
display no location label at all, because `current` never matches a `DOORS` entry (§A.3).

**Interpretation, and the most valuable divergence in this file:** the 07-12 diagnosis was written
against a 2-room environment, where a 3-door shell *was* a complete hallway. The environment then
tripled. The hallway did not. The specific failure the spec named — *disconnected rooms, not one
environment* — is structurally more true today than on the day it was diagnosed, and it is more
true **because** the completion work succeeded. Every room the audit opened was connected to the
map and to the Session room, and to nothing else.

---

## B.7 Recorded non-findings

- I could not determine from code whether `field_programs` / `field_program_positions` have rows in
  production; the 07-13 audit records 0 rows, and `scripts/seed-larry-program-doors.ts` unrun. If
  still 0, `/now-what/position` is WIRED but not SURFACING.
- I could not determine from code what proportion of threads carry
  `spiralogic_phase = 'question'` vs `'practice'` vs null. If most are null, `/questions` and
  `/next` render empty while `/field` renders fully — but this is unverifiable from source.
- Whether Q6 was ruled verbally and simply never applied is not determinable from the repository.

**No recommendations are made in this file.**
