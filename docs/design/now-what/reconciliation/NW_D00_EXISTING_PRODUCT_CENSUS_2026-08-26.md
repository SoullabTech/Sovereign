# NW-D00 — EXISTING PRODUCT CENSUS

**Programme**: Now What? — Product, Flourishing & Coaching Experience Reconciliation
**Unit**: NW-D00 (first authorized unit)
**Date**: 2026-08-26
**Constraint honored**: *"Do not redesign during NW-D00."* No screen, component, route, style
or copy was changed by this unit. This document is a census only.

---

## UNIT

NW-D00 — Existing Product Census.

## STATUS

COMPLETE. Awaiting ruling before NW-R01.

## CANONICAL START

The live `/now-what` environment at commit `HEAD` of branch
`claude/now-what-design-refinement-wpbkbo`, cross-read against the deployed surface at
`https://soullab.life/now-what` (founder screenshot, 2026-08-26, signed in as Kelly, **no
`fieldContext` query parameter**).

## OBJECTIVE

Establish what Now What? actually contains today — routes, capabilities, substrate, governance
— before research or aesthetics reshape the interpretation. Classify every surface
KEEP / EVOLVE / REBUILD / RETIRE / UNKNOWN.

---

## SOURCES EXAMINED

**Code (read in full or in relevant part)**
- `app/now-what/*` — 19 route files
- `components/now-what/*` — 7 components (`ClientHome`, `NowWhatRoom`, `NowWhatShell`,
  `PaperRoom`, `EnvironmentMapView`, `RoomTrustCopy`, `WithdrawVisibility`)
- `lib/nowWhat/*` — `rooms.ts` (registry), `invitation.ts` (eligibility gate)
- `app/api/now-what/*` — 6 routes (`home`, `field-note`, `interview`, `program-position`,
  `register`, `signin`)
- `database/migrations/*` — 6 migrations in the field-note / field-program lineage
- `__tests__/now-what-withdraw-practitioner-visibility.test.ts`; `scripts/eval/now-what-probes.ts`

**Governance / design record**
- `docs/design/now-what/NOW_WHAT_GESTURE_ARCHITECTURE.md`
- `docs/design/now-what/NOW_WHAT_EXPERIENTIAL_FLOOR_PLAN.md` (+ founder amendments 2026-08-05)
- `docs/design/now-what/NOW_WHAT_HOME_DOOR_MAP_2026-08-05.md`
- `docs/design/now-what/NOW_WHAT_VISION_REFERENCE_DISPOSITION_2026-08-05.md`
- `docs/design/now-what/NOW_WHAT_EXPERIENCE_GAP.md`
- `docs/fields/larry/*` (7 docs incl. `experience-audit-2026-07-28/`)
- `docs/reviews/LARRY_IP_CORPUS_INVENTORY_AUDIT_2026-08-03.md`,
  `docs/governance/LARRY_ATTACHMENT_A_INSTRUMENT_v0.md`

**Not examined in this unit** (deliberate — belongs to NW-R01/R02/D01): any external
flourishing, coaching, transition or change-theory literature.

---

## EXISTING PRODUCT EVIDENCE

### A. Route census — 19 files, 3 categories

**Live member rooms (5)** — the ratified five-room ontology.

| Route | Room | Frame | Reads | Substrate filter |
|---|---|---|---|---|
| `/now-what` | Home | own 74rem grid | `GET /api/now-what/home` | none (all fields when no `fieldContext`) |
| `/now-what/questions` | My Question | own (Tailwind) | `GET /api/now-what/field-note` | `spiralogic_phase === 'question'` |
| `/now-what/work` | My Work | `PaperRoom` 46rem | `GET /api/now-what/field-note` | `spiralogic_phase === 'practice'` + `flourishing_dimension` |
| `/now-what/coaching` | My Coaching | `PaperRoom` 46rem | `GET /api/now-what/home` + `program-position` | shared / upcoming / position |
| `/now-what/field` | My Story | `PaperRoom` 46rem | `GET /api/now-what/field-note` | none (all kept threads) |
| `/now-what/room` | The Room | own | `field-note`, `interview`, `program-position` | write + read |

**Non-room routes (4)**: `/arrive` (auth door), `/welcome` (public landing, zero inbound links
by design), `/map` (environment map, reached from the wordmark), `/practice` (practitioner
workspace — reads `/api/practitioner/programs`, not member substrate).

**Retired redirects (6)**: `/home` → `/now-what`; `/cultivate`, `/next` → `/work`;
`/calendar`, `/position` → `/coaching`; `/themes`, `/reflections` → `/now-what`. All are
comment-documented, none render UI. Retirement here was executed cleanly.

### B. Substrate census — one table carries the member's life

`member_field_note_threads` is the single store of member-authored material. Columns in play:
`title`, `content`, `authorship`, `member_decision`, `member_decision_at`,
`spiralogic_phase` (the member's own tag), `flourishing_dimension` (member-placed),
`can_be_shown_to_practitioner` (default FALSE), `field_context`, `released_at`.

Supporting tables: `member_field_note_events` (gesture ledger), `field_programs` /
`field_program_positions` (coach-placed position), `sessions`, `practitioner_clients`,
`members`.

**Provenance is real and enforced at the column level.** `authorship` distinguishes
`member_authored` from MAIA-proposed; `can_be_shown_to_practitioner` defaults FALSE and moves
only by an explicit per-thread gesture; `released_at` implements withdrawal. §XXII's
requirement — *the platform must know the difference between "Kelly said X" and "the system
inferred X"* — is **already satisfied in the substrate**, which is the strongest asset this
census found.

### C. Governance census

- **Gesture architecture** (`NOW_WHAT_GESTURE_ARCHITECTURE.md`) is ratified and specific. Its
  standing rules include: *one primary gesture per screen*; *doors are sentences, not
  buttons-in-grids*; *two doors never sit side by side competing*; *nothing counts, badges or
  nudges*; *motion is settling, not attracting*; *the room is complete without content*.
- **Adaptation boundary** (founder, floor plan §Adaptation boundary) is explicit. Allowed:
  *"You kept this reflection about delegation."* Forbidden: *"You seem stuck." / "You are ready
  for growth." / "You probably need this next."*
- **Vision-reference disposition** already ran a benchmark-adoption pass and produced a
  borrowable-heuristics table with per-row strip-rules, under the governing law: *a pattern is
  borrowable when it solves orientation; not when it also carries an ownership model.*
- **Larry IP**: a corpus inventory audit (2026-08-03) and an unsigned Attachment A instrument
  (`v0`) exist. Custody is documented as **not yet established**.

---

## FINDINGS

**F1 — Three of the four noun-rooms are filtered views of one table.**
My Question, My Work and My Story all call the same endpoint (`GET /api/now-what/field-note`)
and differ only by a **client-side filter on the member's own tag**. This is not a defect —
provenance stays intact and the typing comes from a member gesture — but it means the room
count is an *information-architecture choice*, not a substrate constraint. The registry's own
standing test (*"two rooms cannot exist merely because they use different nouns if they invoke
the same human gesture"*) has never been applied to this fact.

**F2 — The refinement gap is localized to Home, not systemic.**
The four rooms render through `PaperRoom`: a single-column 46rem reading measure, hairline
rules, serif headings, no boxes. Home renders through its own 74rem three-column grid of
bordered, radius-16 cards with hover lift and shadow. **Home is the only surface in the
environment using the card-grid register.** The founder critique of "dashboard pattern dressed
elegantly" describes one screen, and the rooms it leads to already sit in the register the
critique asks for.

**F3 — Home contradicts the environment's own ratified gesture architecture.**
This is a regression, not an open design question. Against `NOW_WHAT_GESTURE_ARCHITECTURE.md`:
- *"One primary gesture per screen"* — Home offers five equal-weight primaries.
- *"Doors are sentences, not buttons-in-grids"* — Home renders a 3×2 grid of buttons.
- *"Two doors never sit side by side competing"* — three sit side by side.
- *"Motion is settling, not attracting"* — cards lift and cast shadow on hover.
- The document's own §"What this document forbids" names *"rendering
  reflections/commitments/questions as three parallel doors"* as the **box-translation
  failure**. Home does approximately this.

**F4 — A live continuity defect between Home and My Work (functional, not aesthetic).**
`GET /api/now-what/home` treats a missing `fieldContext` as *no filter*
(`AND ($2::text IS NULL OR field_context = $2)`) and returns threads across all fields.
`app/now-what/work/page.tsx:81` reads `if (session !== 'in' || !fieldContext) return;` — with
no `fieldContext` it never calls the API at all. The deployed screenshot URL is
`soullab.life/now-what`, **no query parameter**. Therefore: Home displays the member's
commitment ("I'll find better ways of offering platform development"), the member clicks
"Reflect on what you are living", and My Work renders empty. The same guard governs My
Coaching's second read (`coaching/page.tsx:107`). Home promises material the room cannot show.

**F5 — CORRECTED (2026-08-26, post-recovery): the governing ontology document was orphaned by
a branch split, not missing.**
*Original finding, superseded*: ~~the governing ontology document does not exist.~~ That was read
against a **shallow clone** (149 of 5,278 commits) and overstated the loss. On full history the
document exists and has been **recovered**: the implementation (`ca8d1cac9`) merged to
`clean-main-no-secrets`; the ruling (`95cfae2e8`, and a corrected 2026-08-09 version at
`c42cfe4a3`) lived only on branches that never landed. There is no deletion commit. The document
is restored to its cited path, so `rooms.ts` and the 7 route citations now resolve. The recovered
ruling is substantial and load-bearing — it already ruled the "what is alive now" question on
2026-08-05, and it exposes two places where the build went past its authorization (D-B enacted
while open; D-D shipped as fixed architecture against a ruling that recommended a declinable
offering). Full detail: `NW_D00_ONTOLOGY_CUSTODY_RECORD_2026-08-26.md`.

**F6 — The Room's implementation lineage does not match the door's promise.**
Home's fifth door reads *"The Room · A place to think · Think something through"* →
`/now-what/room?entry=think`. `components/now-what/NowWhatRoom.tsx` documents itself as the
**"Vision Studio Room — Living Field genesis experience… a practitioner-facilitated Spiralogic
Interview"**. `entry=think` selects threshold copy only; the room beneath is the interview
room. The environment's single conversational surface is carrying two different product
intentions.

**F7 — No clinical boundary, off-ramp, referral or crisis path exists in the environment.**
Case-insensitive search for `crisis|referral|therap|clinical|emergency` across
`app/now-what`, `components/now-what`, `lib/nowWhat` and `app/api/now-what` returns **zero
matches**. §XX of the directive currently has no substrate anywhere in Now What?.

**F8 — No resources / library surface exists.** Consistent with the door map, which records it
as having no substrate. Correctly absent rather than placeholdered.

**F9 — Relationship capabilities are gated, not built.** Member↔coach messaging, coach→client
notes, and circles are all documented as waiting on the encrypted lane (`phiAccessors`) plus,
for circles, an unruled third-party-consent question. Nothing renders. This is disciplined
absence, correctly executed.

**F10 — Membership eligibility is a static allowlist of three strings.**
`AUTHORIZED_FIELD_CONTEXTS = { 'now-what-demo', 'now-what', 'flourishing' }`. No
invitation-token system, no field registry. Documented as interim.

**F11 — Test coverage for the environment is one test file** (withdraw / practitioner
visibility) plus `scripts/eval/now-what-probes.ts` (~20 probes). Given that the substrate
enforces consent, coverage is thin relative to the risk it carries.

**F12 — Positioning is contested in the record.** The 2026-08-05 amendment defines Now What? as
a *"between-session executive development environment."* The 2026-08-26 directive states: *"I
would not define Now What? as an executive coaching platform."* Both are founder statements,
three weeks apart. `ClientHome` currently renders `"{coachName} · Executive Coaching"` as its
brand line. This conflict is live in the code.

---

## CONFLICTS

**C1 — Ratified gesture architecture vs. shipped Home.** (F3) The build drifted from a document
that was already ruled. Resolution does not require new doctrine; it requires deciding whether
the ratified document still governs.

**C2 — Positioning: "executive development environment" vs. "larger than executive life."**
(F12) Must be settled in NW-D01 before information architecture, because it determines whether
"Executive Coaching" stays in the brand line and whether the coach relationship is the frame or
one context among several.

**C3 — Sequencing: NW-F00 (Figma ideal-state) proposed as "the next unit."**
The directive's own §XXVII places design doctrine at NW-D04 and prototypes at NW-D05, after
research reconciliation (R01, R02) and Larry doctrine (D01). Running NW-F00 next would resolve
the interface before the human model and the Larry doctrine that are supposed to determine it —
the exact inversion §II forbids. **Flagged, not resolved: sequencing is the founder's call.**

**C4 — RESOLVED by the recovery.** The 2026-08-05 ruling already settled this: *"five doors,
aliveness-ordered by member-authored facts only."* The shipped Home renders in fixed source
order and implements no aliveness ordering — a third departure from ruled ground alongside F3.
Original framing retained below.

**C4 (original) — "What is alive now" vs. the adaptation boundary.**
The proposed Home centers *what is alive now*. The forbidden list includes *"You seem stuck"* —
system-voiced findings about the person. These are reconcilable but not identical. Census note:
the existing code already selects `questions[0]` from an ordering of
`COALESCE(member_decision_at, created_at) DESC` — i.e. **the member's own most recent keeping
gesture**. A "what is alive now" region built on that ordering is a plain fact about the
member's act, and introduces no new inference. A version that ranked by system-judged salience
would cross the line. The distinction must be made explicit before it is built.

**C5 — Simplicity constraint vs. five permanent destinations.** The directive's three-layer rule
and the question *"does My Question need to remain a separate permanent destination?"* run
against the currently-ratified five-room ontology — whose ruling document does not exist (F5).
There is therefore **less to overturn than the code implies**.

---

## RULINGS

Classification per §XII. Rulings are census-level: they record what the evidence supports today
and do not authorize any build.

### KEEP

| Surface / asset | Why |
|---|---|
| **Provenance model** (`authorship`, `can_be_shown_to_practitioner` default FALSE, `released_at`, `member_field_note_events`) | Already satisfies §XXII. The system's strongest asset. |
| **Five conceptual domains as language** (My Question · My Work · My Coaching · My Story · The Room) | Validated by the founder in the same message that challenged their presentation. Language KEEP is independent of IA ruling. |
| **`PaperRoom` reading register** (46rem, hairlines, serif, no boxes) | Already the register the refinement critique asks for. |
| **`RoomTrustCopy` four-register disclosure** (holds / never holds / who sees / your control) | Genuinely distinctive; claim-disciplined; true of the code beneath it. |
| **Gated absence discipline** (messaging, coach notes, circles, resources render *nothing*) | Refusal to placeholder unfinished software is a load-bearing product quality. |
| **Retired-route redirects** | Clean retirement, no broken links, documented. |
| **Adaptation boundary + gesture architecture as governing documents** | Ratified, specific, and — per F3 — under-applied rather than wrong. |

### EVOLVE

| Surface | Ruling |
|---|---|
| **Home — visual/interaction register** | Card grid → the `PaperRoom` register the rest of the environment already uses. Concept sound, presentation inadequate. |
| **Home — hierarchy** | Five equal doors → one primary gesture with the remainder as sentences. This is *return to ratified ground*, not new direction. |
| **Home — reading measure** | 74rem → align with the rooms' 46rem so movement between surfaces reads as one place. |
| **Trust strip interaction** | Content KEEP; the dashed-border box and the `!important` colour overrides fighting the palette need redesign. |
| **Daily thought** | Currently reads as decorative footer. Evolve its placement/role; its own Experience Inquiry is open and unanswered. |
| **`/now-what/questions`** | Only member room not on `PaperRoom` (raw Tailwind). Register inconsistency. |

### REBUILD

| Surface | Ruling |
|---|---|
| **Home↔room `fieldContext` continuity** (F4) | Requirement stands; implementation is wrong. Home and the rooms disagree about what "no field context" means. **Scoping member material is consent-adjacent — the fix is a founder decision, not a refactor.** |
| **The Room's entry model** (F6) | The requirement — one conversational surface serving several doors — stands. The implementation is the Vision Studio interview room wearing five different threshold strings. |

### RETIRE

Nothing new. The six retirements of 2026-08-05 were executed cleanly and are already complete.

### UNKNOWN

| Question | Why unknown |
|---|---|
| ~~**Does the Now What? conversation path inherit any MAIA safety/off-ramp layer?**~~ **RESOLVED — it does not.** See `NW_D00_SAFETY_INHERITANCE_TRACE_2026-08-26.md`: the constitutional floor is composed but conditionally (skipped when `NOW_WHAT_MAIA_PRESENCE_ENABLED !== '1'` and no field block), it carries no crisis/referral instruction, the provider layer has none, and MAIA's safety modules are not imported on this path. | Safety modules exist in `lib/spiritual-support/*` and elsewhere in MAIA. The room posts to `/api/now-what/interview`. Whether that path reaches them was **not traced in this unit**. ABSENT would be an overstatement; ABSENT is accurate only for the Now What? namespace itself (F7). |
| **What Larry material is authorized for use** | Corpus inventory audited (2026-08-03); Attachment A instrument at `v0`, **unsigned**. Custody unestablished. §XXIII cannot be answered from the repo. |
| **Whether members ever arrive with a `fieldContext`** | Determines whether F4 is universal or edge-case. Requires production traffic evidence, not code reading. |
| **Whether five destinations match observed member need** | No user research exists in the record. The five-room ontology was ratified by design reasoning; its ruling document is missing (F5). |
| **Actual member usage of any surface** | No analytics reviewed; the environment deliberately records no activity. Behavioural evidence for NW-D06 will have to come from walks and interviews, not instrumentation — a direct consequence of the privacy design. |

---

## DESIGN IMPLICATIONS

1. **The Home redesign is smaller than it looks.** F2 + F3 mean the target register already
   exists in the codebase (`PaperRoom`) and the target behaviour is already written down
   (gesture architecture). This is a reconciliation, not an invention.
2. **The simplicity constraint has substrate support.** F1 shows the rooms are already views
   over one table. Collapsing or de-permanent-ing a destination is an IA change, not a data
   migration.
3. **"What is alive now" has a legal formulation and an illegal one.** (C4) The legal one is
   the member's own most recent keeping gesture, attributed. Write the rule down before
   drawing the screen.
4. **The three prototype directions are not equally clear of the record.** Direction 1 (Living
   Orientation) is consistent with the ratified architecture. Direction 2 (Spatial Life Map)
   needs the "closer based on current context" rule tested against the adaptation boundary —
   a constellation mockup already exists at
   `docs/design/now-what/mockups/NOW_WHAT_CONSTELLATION_MOCKUP_2026-08-05.html`. Direction 3
   (Conversational Home) is the one that most directly risks the forbidden list, since a
   system-composed opening line is a system-voiced finding by construction.
5. **Positioning must be settled before the brand line is designed.** (C2)

## DATA / SOVEREIGNTY IMPLICATIONS

- Provenance columns exist and are enforced; any new surface must carry `authorship` through to
  render, as the rooms already do ("in your words · placed here by you").
- **F4's fix touches material scoping.** Widening or narrowing what a room reads changes which
  of the member's material appears where. Treat as a consent decision.
- `can_be_shown_to_practitioner` defaults FALSE with an explicit per-thread gesture and a
  withdrawal path — this is the model any future coach-facing surface must inherit.
- Opening Home writes nothing. Any "what is alive now" selection must preserve that: reading
  must not become a recorded act.
- §XIX (measurement) currently has **no instrument and no score anywhere in the environment**.
  That is the correct starting state; the census finds nothing to unwind.

## TEST / RESEARCH GAPS

1. No user research of any kind in the record for the five-room ontology (blocks NW-D03).
2. Larry doctrine is not extractable from the repo without the signed instrument (blocks
   NW-D01 at the custody step, not the analysis step).
3. One test file for a consent-bearing environment (F11).
4. The founder's own governing next input remains unanswered: *"Larry's first 10 seconds on the
   deployed room — what did he understand this room was for before anyone explained it?"*
5. Safety-layer inheritance untraced (see UNKNOWN).

---

---

## INPUTS RECEIVED DURING THIS UNIT (PARKED, NOT ACTED ON)

Three founder directives arrived while NW-D00 was running. All are downstream of this unit;
they are recorded here so they are not lost, and are **not** applied.

**P1 — NW-F00 Figma ideal-state architecture** (five layers: master map · canonical flows ·
full screen system incl. every state · design system · three prototype Home directions; 18-page
file structure). → Eligible at **NW-D04/D05**. Sequencing conflict recorded at **C3**.

**P2 — Simplicity as a hard constraint.** *"Make the surface simpler as the intelligence
underneath becomes more sophisticated."* Three-layer rule (immediate · context · intelligence);
four-question feature test; five canonical surfaces rather than eighteen; the open questions of
whether **My Question** needs to remain a permanent destination and whether **flourishing**
should be a perspective rather than a tab. → Governs **NW-D02/D03**. Census evidence bearing on
it: **F1** (three noun-rooms are already filtered views of one table) and **C5** (the ontology
ruling that would have to be overturned does not exist).

**P3 — Palette direction: "more winter, Miami."** Cooler, lighter, coastal — against the
environment's current warm register. Census evidence: the shipped palette is warm paper in light
(`#f8f5ef`/`#f4f0e8`, ink `#29231c`) and warm charcoal in dark (`#211d18`/`#1b1815`), with bronze
`#8a6a35` / `#c9a35e` as the single accent, ratified in the 2026-08-05 brand pass (the
"Direction B" wordmark puts the question mark in bronze). A winter/Miami direction **replaces**
that pass rather than refining it, and the bronze accent is load-bearing across `PaperRoom`,
`ClientHome`, the shell and the brand board. → **NW-D04**, and it needs an explicit ruling that
the 2026-08-05 brand pass is superseded. Note for that unit: the vision-reference disposition
already ruled the light/dark register a *"pure rendering decision… carries no claims"* — so a
palette change is doctrinally cheap, but not free in code.


## NEXT ELIGIBLE UNIT

**NW-R01 — Flourishing Research Reconciliation**, per §XXVII.

Two items are eligible to run in parallel because they are census-completion, not research:
- **F5 remediation** — author or retrieve the missing ontology ruling, so NW-D03 is not
  reasoning against a citation with nothing behind it.
- **UNKNOWN #1** — trace `/api/now-what/interview` for safety-layer inheritance, so §XX has a
  factual starting point.

**NW-F00 is not eligible next** without an explicit sequencing amendment — see C3.

## STOP
