# Now What? Program Catalog & Multi-Engagement — Spec

**Date:** 2026-07-10
**Status:** SPEC — **AUTHORIZED** (Kelly's word, 2026-07-10, conditional on the four
gaps below being folded in — they are, as of this revision): **combined build**
(v1 + catalog in one build, no catalog-of-one special case shipped separately),
**acceptance staged one-then-many** (§9). The four folded gaps: declared departure
(§5), stale-row dormancy-as-silence (§5), declined-confirmation-writes-nothing (§5),
and the practitioner-expectation conversation item (§8).
**Extends:** `NOW_WHAT_PROGRAM_POSITION_SPEC_2026-07-10.md` (commit `e13574d9b`) —
the single-program v1. Everything constitutional in that spec is inherited unchanged;
this spec only widens the *shape* from one program to a catalog, and from one
position to one position per engagement.
**Origin:** Kelly's directive 2026-07-10 — an easy-to-engage process so the
practitioner can ensure each client's work is anchored to the particular programs
they are engaging — coaching, training, workshops, courses, retreats — each level of
each, meeting the client where they are in any/all.

---

## 1. The process, stated as gestures

The design goal is that neither Larry nor his clients ever administer anything.
Three gestures for the practitioner, one for the client.

**Larry's three gestures:**

1. **Name the offerings.** A working session distills each offering into a catalog
   entry: a name, a kind (coaching · training · workshop · course · retreat), and an
   ordered list of focal points — the levels, weeks, or stages in his own words.
   That is the whole authoring unit. No content re-upload: every program draws on
   the same field corpus already composed into the room.
2. **Hand out doors, not codes.** Each program gets a link — the existing
   `fieldContext` room-link pattern extended with a program: the retreat welcome
   email carries the retreat door, the course page carries the course door.
   Giving the right link in the right context *is* the entire client-provisioning
   step. No roster upload, no participant coding, no admin panel.
3. **Advance the cohort.** When the group moves ("we're in week 3 now"), Larry
   updates that program's current focal point — one write through the existing
   practitioner guidance surface and its 422 boundary.

**Sarah's one gesture:**

She walks through a door. On first arrival through the retreat door the room
announces its anchoring: *"This room holds Larry's work — you've come in through the
Deep Dive Retreat, current focus: Descent work. Is that where you are?"* One tap to
confirm, or one sentence in her own words. **That gesture is the enrollment.**

Departure is the same gesture in reverse: one declaration — "I've finished the
retreat," "I'm not doing the course anymore" — closes the engagement (§5). Arrival
and departure are symmetric, both one-gesture, both member-owned.

## 2. Enrollment is declared by arrival, not administered by roster

This is the load-bearing design decision, and it answers "does he upload his
programs coded so the platform knows Sarah is a retreat participant?" — no, and
deliberately no.

There is no enrollment table and no roster. A member's engagement with a program
*is* their first position gesture in it: walking through the program's door and
confirming (or correcting) where they are creates the position row. What would have
been "enrollment status" is exactly the epistemic-footing machinery v1 already
defines — a member who has never spoken has no row; a member Larry seeded is
`practitioner_seeded` = *assumed* until her own gesture.

Why this is constitutional and not just minimal: if Larry's roster told MAIA that
Sarah is a retreat participant, MAIA would hold a fact about Sarah that Sarah never
gave it — third-party provenance about the member, the exact move the authority
split exists to prevent. Arrival-as-enrollment keeps the chain clean: **Larry
authors what the programs are; Sarah declares which ones she is in and where she
stands in each.** "Whose version is true" cannot arise on either axis.

**Pattern note (Kelly, 2026-07-10):** arrival-not-roster is the third independent
appearance of the same constitutional move — evidence-never-meaning (Press),
lens-never-speaks-first (Field Charter), no-fact-about-Sarah-that-Sarah-didn't-give
(this spec). Three subsystems converging on *"the interpretive/administrative layer
may hold only what the sovereign party placed there"* marks it as constitutional,
not local design taste. When next convenient, all three should cite a single named
principle rather than each restating it (candidate recorded; naming is a canon act,
not this spec's).

## 3. Schema

**Catalog** — programs are children of the field, not new fields (one field, one
corpus, many programs drawing on it):

```sql
CREATE TABLE IF NOT EXISTS field_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_slug VARCHAR(64) NOT NULL,            -- joins practice_fields.field_slug
  program_slug VARCHAR(64) NOT NULL,          -- door address, e.g. 'deep-dive-retreat'
  kind TEXT NOT NULL CHECK (kind IN ('coaching','training','workshop','course','retreat')),
  title TEXT NOT NULL,                        -- practitioner's display name
  focal_points JSONB NOT NULL DEFAULT '[]',   -- ordered array of the practitioner's
                                              -- level/stage names, verbatim
  current_focal_point TEXT,                   -- cohort default; NULL = arrival line
                                              -- does not render. No fabrication.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (field_slug, program_slug)
);
```

`focal_points` is an ordered list of names — the levels of each offering in the
practitioner's language. It is *display and orientation* structure only: MAIA never
walks a member up it, never computes "next level," never nudges advancement. The
sequence exists so position can be *located against* it (v1's asymmetry rule), not
so the platform can drive it. Coaching, which often has no sequence, is simply a
program with an empty list and a moving `current_focal_point` ("what we're working
on").

**Position** — v1's table gains one column:

```sql
ALTER TABLE field_program_positions
  ADD COLUMN IF NOT EXISTS program_slug VARCHAR(64);
-- UNIQUE (field_slug, program_slug, member_id) replaces the v1 unique constraint.
-- One position per member per engagement: "any/all" is rows, not state machines.
```

All v1 semantics carry over per-row unchanged: `stated_by`
(member_confirmed / member_stated / practitioner_seeded), `member_confirmed_at`
as epistemic state, member's words saved verbatim.

**Migration note:** v1 rows (if any exist at authorization time) backfill with a
`general` program per field; the v1 single-program room remains a degenerate case
of this spec (catalog of one).

## 4. The room with a catalog — arrival and composition

**Program door** (`?fieldContext=<field>&program=<program_slug>`): the arrival line
is v1's, scoped to the program:

> This room holds Larry's work — you've come in through the **Deep Dive Retreat**,
> current focus: **Descent work**. Is that where you are?
> [ Yes, that's where I am ] [ I'm somewhere else ]

**Generic door** (field, no program): the room offers what the *member* has
declared, never the full catalog as an assignment:

> You've been working from the **Deep Dive Retreat** and the **Flourishing Course**.
> Which are you bringing today — or something else?

Selection is member-pulled orientation, not routing: whichever she names, the whole
field remains composed; only the position block is scoped.

**Any/all — composition when engagements overlap.** Today's program (door-entered
or member-named at the generic door) leads. Beyond it, only *confirmed-current*
positions compose; stale non-focal engagements compose as **silence** (§5 dormancy
rule), never as standing questions. v1's ask-don't-assume footing applies to
today's program only, when its own position is stale:

```
[PROGRAM POSITION — Deep Dive Retreat — member-confirmed 2026-07-08]
Current focus: Descent work (retreat sequence: preparation → descent → return).

[ALSO ENGAGED — Flourishing Course — member-confirmed 2026-07-09]
Current focus: Savoring & attention (week 3).
```

MAIA may *hold* the whole picture ("this connects to the descent work from the
retreat") because the member declared every piece of it. She may never *manage* the
picture — no "you're behind in the course," no cross-program synthesis into a
developmental read. Position blocks are context, not instruction, per v1 §6; the
composition order (constitution → field → positions → conversation) is unchanged.

## 5. Departure, dormancy, and declined confirmation — the symmetric half

Sovereignty is symmetric only if exit is as one-gesture and as member-owned as
entry. Three rules, folded in on Kelly's word (2026-07-10):

**Declared departure closes the row — by deleting it.** One declaration — a
departure gesture in the room or on the arrival affordance ("I've finished this,"
"I'm done with the course," "remove this") — hard-deletes the position row. No
`departed` status, no graveyard: a closed-state column would be an enrollment
ledger by another name, and the moment it exists it can become a churn metric.
Closed = gone. If Sarah returns next year, she walks through the door again and
arrival re-declares — the same gesture that enrolled her the first time. No state
machine, no reactivation flow.

The gesture's member-facing language says what it does, so clearing is never
mistaken for pausing (Kelly, 2026-07-10):

> *This clears your position here; the door is open whenever you return.*

No confirmation friction — the cost of accidental departure is already low by
design (walk back in, redeclare). Just no silent surprise.

**Stale rows decay to silence, not to questions.** Ask-don't-assume is correct
footing *per row*, but across a multi-year relationship three dormant engagements
each generating gentle check-ins is the room managing Sarah's enrollment status —
the exact move P8d fences, arriving through the back door of politeness. The
dormancy rule: **a stale position composes as silence unless the member raises
it.** "Raising it" means walking through that program's door or naming it at the
generic door — only then does v1's ask-don't-assume footing render, for that
program alone. The generic-door offer may still *list* a stale engagement (it is a
member-pulled surface and the engagement is member-declared), but listing is not
asking: no composed question, no nudge, rides on the offer.

**Declined confirmation writes nothing.** The arrival affordance has three
outcomes, only two of which write: confirm (→ `member_confirmed`), correct in own
words (→ `member_stated`), and **decline/dismiss (→ zero rows, zero residue)**.
"Is that where you are?" answered with "no, I'm not doing this" — or simply
dismissed, or a forwarded link opened by someone who was never a participant —
leaves no trace. The door gesture is enrollment **only on affirmation**. This is
the write-side twin of the 401-first rule: no residue from anyone who didn't
affirmatively cross.

## 6. API surface

- `field_programs` reads ride the existing room-load path (arrival payload gains the
  program's title + focal point; interview composition resolves positions
  server-side). No new public read surface.
- `POST /api/now-what/program-position` — v1's route, body gains `program` and the
  departure gesture: `{ fieldContext, program, confirm? | focalPoint? | depart? }`
  — **exactly one** of `confirm: true`, `focalPoint: "<text>"`, `depart: true`;
  zero or more than one → 422, zero residue. `depart` hard-deletes the row (§5).
  Same auth (401-first), same 422-on-widening. Decline/dismiss on the arrival
  affordance sends nothing at all — no "declined" telemetry write (§5).
- Practitioner catalog writes go through the existing practitioner guidance surface
  and its 422 boundary — no new practitioner write path. (The working-session
  authoring flow seeds the catalog the same way the field corpus was seeded, until
  the authoring surface exists.)

## 7. Probes — entering PENDING per the induction rule

v1's P7a–d run unchanged against the widened route. New:

- **P8a** — program-scoped positions: same member, two programs, two differing
  positions; each door's arrival line and composed block carries its own program's
  position, never the other's.
- **P8b** — generic-door offering renders only member-declared engagements: a
  program the member never entered does not appear in the "which are you bringing"
  offer.
- **P8c** — dormancy-as-silence: one confirmed-current + one stale position →
  composed block carries the confirmed engagement and **nothing** for the stale one
  (string-witnessed absence); walking through the stale program's own door then
  renders v1's ask-don't-assume footing for it alone.
- **P8d** — no-advancement invariant: with a full `focal_points` sequence authored
  and a member confirmed at stage 2, no composed output contains next-stage
  prompting language (regression fence around "orientation, not routing").
- **P8e** — declined confirmation writes nothing: arrival prompt dismissed / "no"
  path → zero rows, zero residue anywhere (the forwarded-link case).
- **P8f** — departure is one gesture and total: `depart: true` → row deleted, zero
  residue; the generic-door offer no longer lists the engagement; re-arrival
  through the door re-enrolls cleanly.
- **P8g** — exactly-one gesture: POST with none or more than one of
  `confirm`/`focalPoint`/`depart` → 422, zero residue.

## 8. Practitioner expectation — the absence is the feature

Not a spec change; a conversation item for the charter-session dossier, recorded
here so the build doesn't quietly grow what the conversation is supposed to sell.

"The practitioner gets no read of member positions" is constitutionally settled,
and its full consequence should be Larry's **informed purchase, not a discovered
limitation**: no facilitator dashboard, no "how many retreat participants are
active," no completion funnel — ever. Small cohorts rule out even aggregates: a
retreat of eight re-identifies trivially, so "just show me counts" is not a safe
middle ground and will not become one. Most platforms sell facilitators exactly
this visibility; Larry will assume it exists until told otherwise. The dossier's
symmetry framing carries it: what his clients get (a room that holds only what
they placed there) is priced in what he gives up (visibility into where they
stand). What Larry *does* get: authorship of the catalog and the cohort focal
point, the rehearsal transcripts (his program run against client scenarios, per
the one-pager's rehearsal paragraph), and clients whose trust in the room is
trust in him.

## 9. Build gate — AUTHORIZED, acceptance staged one-then-many

Kelly's word, 2026-07-10, with the four gaps folded in (this revision):
**combined build** — v1 + catalog in one build, one migration (catalog table +
position column + constraint swap), program resolution in room-link and interview
routes, arrival affordances (program door + generic-door offering + decline path +
departure gesture), P7/P8 probes entering PENDING. Building v1 separately would
ship a special case immediately generalized — schema churn with no learning gained.

**Acceptance is staged in two gates, one build:**

- **Gate 1 — catalog-of-one:** one program, one door, one position — v1's behavior
  exactly. P7a–d green under live run.
- **Gate 2 — many:** multi-program, multi-row composition, dormancy, departure.
  P8a–g green under live run.

Gate 2 opens only after Gate 1 is witnessed. A red in Gate 2 is a defect in the
*many* layer and cannot be confused with the mechanism Gate 1 already proved.
Per Kelly's ruling: departure/decay semantics are **not deferrable** — deferral was
safe when the whole layer was out of scope; shipping arrival without departure
ships an asymmetric sovereignty surface, which is worse than shipping neither.

**Sequencing (Kelly's word, 2026-07-10 — ordering, not lane):** the build is
**HELD** until the identity cut lands. The catalog creates doors, rooms, and
member-position rows — surfaces the identity cut almost certainly touches;
building first and reconciling onto the post-cut world re-creates the drift
pattern deliberately. Order: (1) identity cut lands (staged and ready in its own
lane; it is the substrate); (2) catalog builds second, on the post-cut world —
natural lane is whichever session owns that world. The spec-authoring session
holds; the spec was written precisely so the build doesn't depend on its author's
memory. **Precondition before assigning the lane:** one explicit check whether the
identity cut and the catalog are genuinely disjoint surfaces — if disjoint, either
lane works; either way, **exactly one lane gets named on the board.**

**HOLD LIFTED (Kelly's word, 2026-07-12), after the named precondition was run.**
The disjointness check found the overlap **narrow and manageable**: the identity
cut had not landed (nothing identity-shaped merged since 2026-07-10; only the
auth-posture Phase 0 log-only probe, behavior unchanged), and the shared surface
is exactly one line — the interview route's identity resolution
(`cookieSession?.memberId ?? getMemberIdFromRequest`), which the build leaves
untouched. Two facts weaken the original drift concern: (1) position rows key on
the member UUID itself — the identity cut changes how a request *proves*
identity, not the UUID values, so rows written pre-cut remain valid post-cut;
(2) the now-what family's auth helper (`lib/scribe/scribeAuth`) is already
session-credential-only — it never trusts a bare `x-member-id` header, so the
new position route adopts the hardened posture from day one. **The lane named
on the board: the 2026-07-12 build session, branch
`feature/now-what-program-catalog`.** Gate 1 (catalog-of-one, P7a–d) remains
the acceptance boundary before Gate 2 opens.

## 10. Deferred (recorded so no session builds them unprompted)

- Practitioner authoring UI for the catalog (working-session seeding covers the
  Larry demo; the authoring surface is its own build).
- Cohort management and any practitioner read of member positions — unchanged from
  v1 §9: jurisdiction belongs to the practitioner-client privacy model; this spec
  gives the practitioner NO read of who confirmed what.
- Menu-driven position pickers from `focal_points` (member's language remains the
  record; the ordered list locates, it does not enumerate choices).
- Any surfacing of position or engagement outside the room (dashboards, nudges,
  summaries, "progress" views of any kind).
- Cross-field programs (a program spanning two practitioners' fields) — no known
  need; would reopen provenance questions.
