# Capability Access Model — Proposal

**Status:** PROPOSAL / INQUIRY — no implementation authorized
**Created:** 2026-07-28
**Author of record:** Kelly (rulings) · Claude Code (findings)

> **Note on this file:** `CAPABILITY_ACCESS_MODEL_PROPOSAL.md` did not exist in the repo or
> in any git history when this update was requested. This document was created to hold the
> rulings and findings. Nothing here is canon until ratified.

---

## ⚠️ Preserved as authored 2026-07-28 — five items have since moved

This file was written before the evening rulings and was **untracked until 2026-07-29**; it is committed now to bring the rulings ledger into the governed record. **The body below is unedited**, so provenance is intact — which means some statements in it are no longer current. Where they differ, the sources named here govern.

| In this file | Current position |
|---|---|
| PR #785 as ruled-but-not-executed | **Merged.** Decisions removed from the House registry. ⚠️ A caller survived — `UnifiedJournalView.tsx:281` still reads `/api/studio/decisions`. Sharpened invariant in `COMMITMENTS_SCHEMA_AND_LINK_CONTRACT.md` §10: *no member surface may read, render, count, or navigate practitioner Decisions merely because the member also happens to be a practitioner.* |
| `member_paths` / `member_threads` as the naming lean | **Settled: "Becoming Thread"** — `member_becoming_threads`, `becoming_returns`, slug `becoming.member`. Optional member-selected *kind*, never inferred. See `BECOMING_IMPLEMENTATION_GATE.md` §2. |
| The "practice" naming question | **Closed.** Refused on Invariant 14 (*nobody practices cancer*), independently confirmed by audit — `practice` is spent 8+ ways, all practitioner-side. |
| Ruling 9's security ordering gate as blocking | **Satisfied.** PR #793 (journal session-derived identity) merged and deployed, `471bdf85c`. |
| Becoming as "concept only, not build" | **Still true, and narrowed further**: *shared infrastructure only; no speculative Becoming implementation.* Build deferred behind four evidence conditions — `BECOMING_IMPLEMENTATION_GATE.md` §3. |

Not anticipated by this file at all: the **account-deletion completeness defect** (contained `4b3448c6f`), which established that member content survives account closure. It bears on any capability that stores member-authored material — see the incident record.

---

---

## Part 0 — Rulings received (2026-07-28, Kelly)

1. `changes.member` is the existing I Ching-related member function; available during beta as a
   product-basis capability.
2. **Do not merge Changes into Decisions.**
3. **Do not expose `decisions.practitioner` to ordinary members.**
4. Do not assume a member-facing "Decisions" surface already exists. Model the future member
   function provisionally as `commitments.member` until its product definition and final name
   are ruled.
5. In the capability table, use the **actual current routes and authorization behavior**. Flag
   any mismatch between the name **Changes** and what the existing code really serves.

Framing sentence (Kelly): *Changes interprets movement. Commitments records the member's
response. Practitioner Decisions remains a separate protected tool.*

---

## Part 1 — Capability table (as-built, verified 2026-07-28)

| Capability | Member/actor question | Nature | Routes (actual) | Auth check (actual) | Data scope |
|---|---|---|---|---|---|
| `journal.member` | What happened, and what have I recorded? | reflective record | `POST /api/journal/quick`, `GET /api/journal/quick/list`, `POST /api/journal/quick/audio` · **legacy:** `/api/journal/list` | ⚠️ **weak** — `quick/list` accepts `userId` as a **query param** (client-asserted) with `x-member-id` as an alternate path; `/api/journal/list` has **no auth at all** and writes to a legacy SQLite store | `quick_journal_entries.user_id`, `episodic_memories` |
| `changes.member` | What is changing, and what does the situation reveal? | **I Ching / symbolic discernment** | `/api/changes`, `/api/changes/[id]`, `/api/changes/[id]/cast`, `/interpret`, `/consult`, `/experiences` | ✅ `getMemberIdFromRequest` on **every** handler; 401 on miss; every query is `WHERE ... AND member_id = $2`; parent-chain ownership re-checked (403) | `studio_changes` rows owned by `member_id` |
| `commitments.member` | What am I choosing or carrying forward? | member-authored intention/action | **none — does not exist** | n/a | n/a |
| `decisions.practitioner` | What practitioner decision or client-work judgment is being recorded? | privileged practitioner workflow | `/api/studio/decisions`, `/api/studio/decisions/[id]`, `/consult`, `/mentor`, `/experiences`; UI at `/studio/decisions` | ✅ `getCurrentPractitioner` → requires a row in `practitioners` with `status='active'` linked to the member; 401 otherwise | `studio_decisions` scoped by `practitioner_id`, joined to `practitioner_clients` |
| `becoming.member` *(inquiry)* | How am I becoming? | developmental continuity | **none — see Part 4** | n/a | n/a |

---

## Part 2 — Findings on the current **Changes** implementation

**Requested:** route + API dependencies; is it truly the I Ching experience or a launcher/history
surface; audience and access checks; is member data private to the member; how it differs from
practitioner Decisions.

### 2.1 Route and API dependencies

Member lane (`app/api/changes/*`, all `force-dynamic`):

| Route | Purpose | Notable dependency |
|---|---|---|
| `GET/POST /api/changes` | list / create a change (chained: `parent_change_id`, `root_change_id`) | `lib/db/postgres` |
| `GET/PUT /api/changes/[id]` | detail + iterations | — |
| `POST /api/changes/[id]/cast` | **casts the hexagram** | `lib/iching/casting` (`cast`), `lib/iching/lookup` (`getHexagram`) |
| `POST /api/changes/[id]/interpret` | MAIA's reading of the hexagram in context | `lib/consciousness/LLMProvider`, `lib/iching/lookup` |
| `POST /api/changes/[id]/consult` | optional AIN council consultation | `lib/studio/changes/changeCouncil` |
| `GET/POST /api/changes/[id]/experiences` | member logs reflections, dreams, synchronicities | — |

UI: `components/maia/changes/` — `ChangesSheet` (entry), `NameYourChange`, `ChangeListView`,
`ChangeJourney`, `MemberHexagramCaster`, `MemberHexagramReading`, `ChangeLandscapeVisual`.
Mounted in the member House at [app/maia/page.tsx:1772](app/maia/page.tsx#L1772), opened from
the module grid and rail.

### 2.2 Is it truly the I Ching experience? — **Yes.**

Casting is real and server-side: `/cast` calls `lib/iching/casting.cast()` and resolves the
hexagram via `lib/iching/lookup`, persisting the result on the change record. `/interpret`
generates a reading grounded in that hexagram. `MemberHexagramCaster` / `MemberHexagramReading`
are dedicated I Ching components, not links to `/oracle/iching`.

It is **not only** a casting surface — it is a *change-discernment container* that happens to use
the I Ching as its discernment instrument. Around the cast it carries: a named change, a
description, `change_type` / `urgency` / `emotional_state`, an **iteration chain** (a change can
be re-entered over time, each iteration with its own notes and emotional state), and a
member-logged **experiences** stream. The hexagram is the interpretive move inside a longer
member-owned thread.

**Naming mismatch to flag (ruling 5):** the label "Changes" reads to an unfamiliar member as a
change *log* — the exact reading Kelly ruled against. The code is closer to
*change discernment* / *what is moving in my life, and what does it reveal*. Recommend the
capability slug stay `changes.member` but that any member-facing subtitle name the function
(e.g. "what is changing — and what it reveals"), never "recent changes" or "history".

### 2.3 Audience and access checks

Audience: **any authenticated member.** No practitioner check, no role gate, no feature flag
found on the member lane. Every one of the six handlers calls `getMemberIdFromRequest(request)`
(cookie or `x-member-id`, per the Capacitor trap) and returns 401 when absent.

### 2.4 Is member data private to the member? — **Yes, on this lane.**

Every read and write is scoped `WHERE id = $1 AND member_id = $2`. Chained creates re-verify
that the parent change belongs to the caller (`403 'Parent change not yours'`). There is no
practitioner, team, or admin read path into member-owned `studio_changes` rows in this lane.

⚠️ **Shared-table note:** member changes and practitioner changes live in the **same table**,
`studio_changes` — the member lane scopes by `member_id`, the practitioner lane
(`/api/studio/changes`, `getCurrentPractitioner`) scopes by `practitioner_id` and may join
`practitioner_clients`. Isolation is currently held by query discipline, not by schema or RLS.
Any future column, view, or export over `studio_changes` must re-establish the boundary
explicitly. Worth a ruling.

### 2.5 How Changes differs from practitioner Decisions

| | `changes.member` | `decisions.practitioner` |
|---|---|---|
| Identity | member (`getMemberIdFromRequest`) | practitioner (`getCurrentPractitioner`, active `practitioners` row) |
| Table | `studio_changes` scoped by `member_id` | `studio_decisions` scoped by `practitioner_id` |
| Third parties | none — the member is the only subject | `client_id` → `practitioner_clients`, `team_id` |
| Instrument | I Ching cast + interpretation | council/mentor consultation over stakes, time pressure, situation type |
| Object | *a movement the member is inside of* | *a judgment the practitioner must make about work with someone else* |
| Direction | inward, discernment | outward, accountable professional record |

They are not two names for one thing. Merging them would put a member's symbolic discernment
into the same object as a practitioner's client-work judgment — a category error with a consent
surface attached.

### 2.6 ⚠️ Live defect: a member-facing Decisions surface **does** exist, and it is wired to the practitioner lane

Contrary to the working assumption in ruling 4:

- `components/maia/decisions/` exists (`DecisionsSheet`, `DecisionListView`, `DecisionCreate`,
  `DecisionCouncilView`) and is mounted in the **member House** at
  [app/maia/page.tsx:1780](app/maia/page.tsx#L1780), with entry points in the module grid
  (`:1130`) and rail (`:1417`).
- Those components call **`/api/studio/decisions`** — the practitioner-gated lane
  ([DecisionListView.tsx:57](components/maia/decisions/DecisionListView.tsx#L57),
  [DecisionCreate.tsx:52](components/maia/decisions/DecisionCreate.tsx#L52),
  [DecisionCouncilView.tsx:66](components/maia/decisions/DecisionCouncilView.tsx#L66)).

Consequences as-built:

1. For an ordinary member (no `practitioners` row), the sheet opens and **401s** — a dead door in
   the House.
2. For a member who *is* an active practitioner, the House sheet renders **practitioner
   client-work decisions**, including `client_id`-joined rows, inside the member surface. That is
   `decisions.practitioner` exposed through a member doorway — the thing ruling 3 forbids. It is
   not a cross-member data leak (scoping is by the caller's own `practitioner_id`), but it is a
   boundary violation between the two lanes.

**No fix applied — proposal only.** The ruling needed is *which* of these: (a) remove the member
Decisions doorway until `commitments.member` is defined; (b) keep the doorway, repoint it at a
future member-owned commitments lane; (c) something else. Until ruled, treat the member
Decisions doorway as **unauthorized surface**.

### 2.7 Related access findings observed in passing (not implemented, not in scope)

- `GET /api/journal/quick/list` trusts a `userId` **query param** as identity.
- `POST /api/journal/list` (legacy SQLite path) performs **no authentication** and takes `userId`
  from the body.
- `/api/practice/*` (`sessions`, `growth`, `insights`) takes `practitionerId` from the **query
  string with no auth check** — `GET /api/practice/growth?practitionerId=…` returns another
  practitioner's growth observations if the id is known.

These corroborate the open journal/scribe Tier 1 item in the account-takeover remediation
thread. Flagged here for the record; they belong to that thread, not this one.

---

## Part 3 — Corrected capability names

| Slug | Room name (current) | Status |
|---|---|---|
| `journal.member` | Journal / Reflections | live, auth weak (see 2.7) |
| `changes.member` | Changes | **live, correctly scoped** — product-basis capability for beta. Name **settled, no rename** (ruling 1) |
| `commitments.member` | *(unnamed)* | **provisional slug only** — no product definition, no route, no ruling |
| `decisions.practitioner` | Decisions (Studio) | live, practitioner-gated — ⚠️ leaking through a member doorway (2.6); removal of that doorway is ruling 2, **lean not order** |
| `becoming.member` | Becoming | accepted in principle (ruling 5); build gated on real member marks. Domain object name open (ruling 7) |

---

## Part 4 — Inquiry: is there a missing fourth member capability?

**Received 2026-07-28 (Kelly).** Proposal only. The proposed structure:

| Function | Primary question | Nature |
|---|---|---|
| Journal | What happened? | experience |
| Changes | What is changing? | meaning |
| Commitments | What am I choosing? | choice |
| **Becoming** *(mechanism: Practice)* | **How am I becoming?** | transformation |

### 4.1 Is it genuinely unserved today? — **Yes, for members. Emphatically.**

No member-facing capability answers continuity-over-time. Verified:

- `changes.member` has an iteration chain, but it is scoped to **one named change**. It cannot
  see across changes, and it is not designed to.
- `journal.member` is entry-level and episodic; nothing aggregates.
- `member_spiral_state` (Bridge D) persists `dominant_element`, `phase`, `motion`,
  `autonomy_streak`, `return_count` — but it is explicitly *anti-regression plumbing, not
  personalization*, and has **no member-facing surface**.
- The `practice_*` tables (`practice_sessions`, `practice_worlds`, `practice_insights`,
  `elemental_practice_completions`) and `/api/practice/growth` are **practitioner** artifacts —
  "what MAIA notices about the *practitioner's* development." Wrong actor. Also unauthenticated
  (2.7).
- `practice_fields` is Developmental Ecology (the relational medium), not a personal capability.

**Naming collision warning:** "Practice" is already spent four ways in this codebase
(practitioner session recording, practice worlds, practice fields, `/api/practice/growth`).
Adopting `practice.member` would be ambiguous on day one.

### 4.2 Existing primitives that partially support it

| Primitive | What it already gives | Gap |
|---|---|---|
| `member_memory_atoms` | member-**kept** moments with `title`, `body`, `registers[]`, `elemental_lenses[]`, `thread_ids[]`, `kept_at`, `surface_count`, `is_breakthrough`, and a consent field `return_preference` (default `member_pulled`) | no notion of *a thing being practiced*; `thread_ids` is the closest existing continuity handle and is under-used |
| `episodic_memories` + member-marked provenance | the "Keep this moment" gesture; member-authored marks distinguishable from system-inferred | **zero marks exist in production** — the substrate is wired, not surfacing |
| `member_daily_anchor` + `surface_preference` | the **consent pattern to copy exactly**: default private (`member_pulled`), member opts into `contextual_doorway`; refusal R08 | — |
| `studio_changes` iteration chain | proof the product already models *a thread re-entered over time* | scoped to one change |
| `member_spiral_state` | `return_count`, `autonomy_streak` — return is already counted | structural only, deliberately not member-facing |

**Nothing new needs to be invented to count returns.** What is missing is the member's ability to
*name what they are practicing* and attach returns to it.

### 4.3 Authority boundary — the governing constraint

This is where the inquiry is most at risk. Under
`docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`, authority moves upward only:
**Encounter → Reflection → Recognition → Living Field → Developmental Ecology.**
"How am I becoming?" is a **Recognition-layer** question.

The three example utterances in the inquiry sit on opposite sides of that line:

| Utterance | Verdict |
|---|---|
| *"You've returned to courage nine times."* | ✅ **admissible** — if *courage* is a member-authored name and each of the nine returns is a member act. MAIA is counting, not naming. |
| *"For the past six weeks you've been practicing patience."* | ⚠️ **admissible only if** *patience* was authored by the member. If MAIA inferred the theme, it is the system manufacturing Recognition — refused. |
| *"Your relationship with boundaries has shifted."* | ⛔ **refused as stated.** "Has shifted" is an authored developmental claim about a person's interior. That is the member's sentence to write, not MAIA's. |

Standing freezes this touches: **Pattern Attunement is frozen**; *"becoming a pattern"* is the
frozen-Patterns line; the Journey Point analysis is parked Cat-1 precisely because the gap there
"isn't technical, it's **who may author meaning**"; chapter/theme naming is Living Field and
blocked. A Becoming capability that lets MAIA name arcs would reopen all four at once.

**Proposed boundary (for ruling):**

> `becoming.member` may hold only what the member authored, and may only ever perform
> **counting, recurrence, and recency** over member-authored objects. It may not name a theme,
> infer a practice, characterize a trajectory, or assert that anything has changed. Member-
> authored name + system-counted return. Default private (`member_pulled`), per the anchor
> consent gate. A refusal (R-number TBD) covers "MAIA characterizes a member's development."

This is what makes the capability *possible* rather than blocked: it is a **Reflection-layer
container the member fills**, whose only system contribution is arithmetic the member can verify.

### 4.4 Naming

Kelly's instinct — *"Becoming names the human experience; Practice names the mechanism"* —
survives the code check and is strengthened by it:

- **Room name: Becoming.** Names the question, not the machinery. No collision.
- **Mechanism/underlying object: practice** (lowercase, internal) — a member-named thing being
  cultivated, with returns attached.
- **Capability slug: `becoming.member`.** Do **not** use `practice.member` — collides with four
  existing practitioner-side meanings (4.1).
- Rejected: *Growth* (achievement register, and `/api/practice/growth` already exists),
  *Development* (software homonym), *Cultivation* (imposes a frame — Invariant 14).

⚠️ Register check: "Becoming" is an interpretive word. It must name the **member's own
question**, never MAIA's assessment. If the room ever answers the question instead of holding it,
the name has become a claim.

### 4.5 Smallest honest first version

A member can name something they are practicing, and can see their own returns to it. Nothing
else.

1. A member-authored **practice**: a name, an optional why, a start date. Member-created only —
   no suggestion, no auto-detection, no seeding.
2. A **return**: a member gesture attaching an existing marked moment / atom / journal entry /
   change iteration to that practice. Member-initiated only.
3. A surface showing, per practice: the member's own name for it, when they started, the count of
   returns, the dates, and the linked objects. **Provenance-grounded, no synthesis.**
4. MAIA may say only what the member could count themselves — *"you've returned to this nine
   times, most recently Tuesday."* No adjectives. No arcs. No "has shifted."
5. Default private (`member_pulled`), mirroring the Daily Anchor consent gate.

**Existing primitives sufficient for v1:** `member_memory_atoms` (+ `thread_ids`),
`episodic_memories` member-marked provenance, the anchor `surface_preference` consent pattern.
**Genuinely new primitives eventually needed:** a member-authored container object (name +
lifecycle) and a returns join with an explicit `authored_by = 'member'` provenance column. Both
are member-authored containers, not inference tables. **The container's name is unresolved — see
§4.6.**

**Honest constraint on timing:** zero member-marked moments exist in production today. A Becoming
room built now would render **empty** for every member — the same finding that parked the Journey
Point analysis. Building the container does not create the developmental data; it exposes that
there is none yet. Recommend the ruling authorize the *concept and boundary* now, and gate the
build on the first natural member marks arriving.

---

### 4.6 The domain object is **not** a practice (Kelly, 2026-07-28) — supersedes §4.4's mechanism

Kelly's correction: what a member returns to is not always a practice. The examples given —
**grief · fatherhood · forgiveness · cancer · creativity · courage** — are not four practices and
two nouns; only *courage* and *creativity* are comfortably practiced at all. Someone does not
"practice" cancer.

This is not a naming preference. Calling the object a *practice* would make the member translate
grief into the vocabulary of cultivation in order to record it — the exact failure named by
**Sovereignty Invariant 14 (cultural sovereignty)**: *are we imposing a framework, translating the
member's meaning into our vocabulary?* A member in the middle of a diagnosis, asked to name their
"practice," has been told what kind of experience they are permitted to have.

**Ruling recorded:** keep *practice* as a possible **mechanism**, not the core domain object, until
real member behavior shows what people actually return to.

Candidate nouns, assessed against how much frame each imposes:

| Candidate | Imposes | Note |
|---|---|---|
| `member_practices` | cultivation, discipline, effort | ❌ excludes grief and illness — the §4.6 failure |
| `member_becomings` | transformation, forward motion | ❌ abstract, and reads as a claim about the member |
| `member_paths` | journey, direction, destination | ⚠️ Kelly's lean. Holds grief and fatherhood well; still implies *going somewhere*, which not every return is |
| `member_threads` | recurrence only | ✅ **recommended.** Least imposing noun available, and it is **already in the schema** — `member_memory_atoms.thread_ids` exists and is under-used (§4.2). A thread is something you return to without being told it leads anywhere |

**Recommendation:** `member_threads` for the object, `becoming.member` for the capability,
**Becoming** for the room. The room may carry an interpretive name because it names the member's
own question; the *stored object* should carry the flattest noun that still holds grief, cancer,
and courage in the same column. Kelly's `member_paths` is the acceptable second choice and the
decision is his — flagged only because `thread` is already load-bearing in the atoms schema, so
choosing it also consolidates rather than adds.

⚠️ **Stress test the room name against Kelly's own list.** *Becoming* holds courage, creativity,
fatherhood and forgiveness beautifully. It sits less easily on **grief** and **cancer**. A room
that asks "who am I becoming?" of someone in treatment can read as a demand that suffering
produce growth — the toxic-positivity failure mode, and a live risk under Invariant 14 and the
non-manipulation vow. Two ways out, for ruling: (a) the room holds the question but never poses
it to the member unprompted — the member's own threads are the only content, and the title is
ambient rather than interrogative; (b) a second, flatter member-facing label. Recommend (a).

**Resolved 2026-07-28 (Kelly) — option (a), ambient not interrogative.** The reasoning, recorded
because it is what makes the ruling durable:

> The room is called Becoming. The room does not ask *"who are you becoming?"* every time someone
> enters it. A library doesn't force you to read. A chapel doesn't force you to pray.

A room may carry an aspirational name without interrogating someone who is trying to survive
chemotherapy or sit with grief. The title is a frame the member may take up or ignore; their own
threads are the only content. General form this settles: **room names may be aspirational; room
prompts may not be.**

---

## Part 5 — The rooms as a grammar of development (Kelly, 2026-07-28)

The four capabilities are not a feature set. They are organized around enduring human questions,
and the means are deliberately absent from the naming:

| Room | Human question | Movement |
|---|---|---|
| Journal | What happened? | Experience |
| Changes | What is life asking of me? | Meaning |
| Commitments | How will I respond? | Choice |
| Becoming | Who am I becoming? | Transformation |

There is no room called *AI*, no room called *I Ching*, no room called *Journal App*. Those are
**means, not destinations**. This is the naming rule the capability model should inherit, and it
resolves the mismatch flagged in 2.2 from above rather than by patching a subtitle: *Changes* is
correct as a room name **because** it names the question, not the instrument. The I Ching is how
the room works, not what the room is.

Founder sentence, entered into the record:

> **The House doesn't simply remember your life. It helps you become the person your life is
> asking you to become.**

⚠️ Claim-discipline note (`docs/canon/MARKETING_CLAIM_DISCIPLINE.md`): that sentence is **Vision**
today, not Live. Journal is live with weak auth; Changes is live; Commitments does not exist;
Becoming does not exist; zero member marks exist. The sentence is true of the design and not yet
of the product. Center of gravity must be stated as such wherever it is used outwardly.

### 5.1 The transitions are a capability of their own — and the highest-risk one

The proposal's real novelty is not the fourth room but the **movement between rooms**, with MAIA
as host. That movement is a distinct thing needing its own ruling, because a doorway offer is an
act of authorship about where a member is in their development.

Assessed against the Direction of Authority:

| Proposed transition | From → To | Verdict |
|---|---|---|
| *"Would you like to explore what is changing here?"* | Journal → Changes | ✅ **admissible.** Offers a doorway; names nothing about the member. Encounter → Reflection, upward, no skip. |
| *"Is there something you want to carry forward?"* | Changes → Commitments | ✅ **admissible.** The member authors the answer; MAIA holds the door. |
| *"You've returned to courage several times this month. Would you like to see how this has become part of your practice?"* | → Becoming | ⚠️ **split.** The first clause is admissible **iff** *courage* is member-authored and the count is arithmetic over member acts (4.3). The second clause — *"how this has become part of your practice"* — is MAIA asserting a developmental fact. **Refused as stated.** Admissible form: *"You've returned to courage nine times. Would you like to look at these together?"* |

**Doctrine this yields (for ruling):** *MAIA may open doors. It may not describe what is on the
other side of one in the member's own life.* An offer that reports a count is a door; an offer
that names what the count means has already walked through it.

Two further constraints, consistent with existing invariants:

- **Offers are doorways, never routing.** The member may loop Journal ⇅ Changes ⇅ Commitments ⇅
  Becoming in any order; the *system's* authority stays one-directional. The cycle in this Part is
  a description of how development often moves, **not** a sequence MAIA moves people through.
  (`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY` — the member may jump around; the system may not.)
- **Frequency is an attachment-capture surface.** A host that offers a next room after every
  entry is engagement machinery wearing developmental language. Offers should be rare, declinable
  without friction, and never re-offered on refusal. Sovereignty invariant test applies: does this
  reduce the system's psychological centrality over time?

Open question, not answered here: **who authors the offer** — is a transition prompt a
Reflection-layer act (MAIA may compose it) or a Recognition-layer act (member-initiated only)?
Recommend it be treated as Reflection-layer **only** while its content is limited to counts and
questions.

---

## Part 6 — Rulings ledger

| # | Question | Status (2026-07-28) |
|---|---|---|
| 1 | **Changes naming** — rename or keep? (§2.2) | ✅ **SETTLED — no rename.** Kelly: *"It's not an I Ching feature. It's a change discernment room that happens to use the I Ching as one of its primary instruments."* §5 supplies the reason: the room names the question, the I Ching is the means. The §2.2 subtitle worry is dissolved, not patched. |
| 2 | **Member Decisions doorway** (§2.6) | ✅ **RULED + SHIPPED TO REVIEW 2026-07-28 — PR #785**, on `fix/remove-member-decisions-doorway` off `784e94ad2`. Scope extended beyond the first inventory: the clean base also carried a **House destination** (`lib/navigation/houseDestinations.ts`, `audience: 'founder'`) — the same conditional-render pattern in a different file, from the #766 lane. Removing only the callback path would have left a House tile that renders for practitioners and does nothing, so the destination, `HouseSheetId`'s `'decisions'`, the dispatch branch, and the tests encoding the superseded ruling went with it. **#770 (the practitioner-gate approach) closed unmerged** after a lane-clear check: its authoring session dormant since 07-27T21:47Z, no reviews, and today's only commit a bulk main-merge from an unrelated housekeeping sweep. New invariant under test: *no audience receives a `decisions` destination from the member House registry.* Kelly's device walk is the remaining acceptance gate. Original entry: | Scope ruled: *unmount the doorway only; leave the practitioner implementation intact.* Removed — mobile grid button, desktop button, both `DecisionsSheet` mounts (page + modal manager), and the `onOpenDecisions` prop chain (`MaiaShell` → `MaiaRightPanelHost`, where it was already a dead prop). `components/maia/decisions/*`, `/api/studio/decisions`, and `/studio/decisions` untouched. **Uncommitted** — see the co-mingling note below. Kelly's framing, adopted: the fix is that *the member-facing House no longer exposes a practitioner capability* — not a data-access fix; practitioner auth was already doing its job. The House was advertising a room outside the member grammar. |
| 3 | **`studio_changes` shared table** (§2.4) | ✅ **RULED — acceptable now, deserves structural separation eventually.** Query-discipline isolation stands for beta; structural separation is a named debt, to be paid before any third surface (view, export, or column) reads the table. ⚠️ Read from *"acceptable **or** eventually deserves separation"* answered "yes to all" — correct if this reads as one answer, not two. |
| 4 | **`commitments.member`** — product definition and final name | ⬜ open (not in the founder's list of five) |
| 5 | **`becoming.member`** as fourth first-class capability, at the §4.3 authority boundary, build gated on real member marks | ✅ **RATIFIED 2026-07-28 as the fourth member room — concept only, not build.** Kelly: *"the real constraint isn't technical. It's authorship."* |
| 6 | **Refusal number** for "MAIA characterizes a member's development" | ⬜ open (not in the founder's list of five) |
| 7 | **Domain object name** (§4.6) | 🔶 `practice` rejected as core object (ruled). Choice between `member_paths` (Kelly's lean) and `member_threads` (recommended — already in the atoms schema) open. |
| 8 | **"Becoming" against grief and cancer** (§4.6) | ✅ **RULED 2026-07-28 — ambient, not interrogative.** *"A library doesn't force you to read. A chapel doesn't force you to pray."* General form: room names may be aspirational; room prompts may not be. |
| 9 | **Security findings gate** (§2.7) | ✅ **RULED — the journal/practice auth findings must be resolved before any capability implementation proceeds.** This is an ordering constraint on the whole lane, not a fix authorization; the work belongs to the account-takeover Tier 1 thread. |

---

## Part 7 — Constitutional principle candidate

Kelly, 2026-07-28: *"This sentence is the one I'd elevate almost immediately… It isn't just about
Becoming — it governs transitions, pattern recognition, developmental claims, and Journey Point."*

> **MAIA may open doors. It may not describe what is on the other side of one in the member's own
> life.**

**Status:** ✅ **RATIFIED as direction by Kelly, 2026-07-28** — and stated as the governing
principle in `docs/canon/THE_HOUSE.md`.

⚠️ **The Reconcile step has not been performed.** The lifecycle is
Candidate → **Reconcile** → Ratify → Living, and it is not to be collapsed. The founder's yes
settles *that* this principle governs; it does not yet establish *how it sits* alongside existing
canon. Until reconciliation is done, cite it from `THE_HOUSE.md` as product direction — do **not**
insert it into `MAIA_SOVEREIGNTY_INVARIANTS.md` or cite it as an invariant.

Scope it appears to govern, if ratified:

| Surface | What the principle decides |
|---|---|
| Room transitions (§5.1) | an offer may carry a count and a question; it may not carry a characterization |
| `becoming.member` (§4.3) | member authors the name; system supplies arithmetic only |
| Pattern Attunement (frozen) | states *why* it is frozen rather than merely *that* it is |
| Journey Point (parked Cat-1) | the parked gap — *who may author meaning* — is this principle's exact subject |
| Living Field / chapter-theme naming (blocked) | the block becomes a consequence of a principle, not a standing exception |

**Reconcile step required before ratification** — it must be checked against, and its relationship
stated to, `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY` (upward-only authority),
`MAIA_SOVEREIGNTY_INVARIANTS` (Invariant 16 Recognition Integrity — this may be a corollary rather
than a new invariant), and Interface Humility. Recommend it be proposed as a **corollary of
Invariant 16 expressed at the interface layer**, not a seventeenth invariant, unless reconciliation
shows it does independent work.
