# Now What? — Demo Spec: Two Companion Journeys
**Status:** CANDIDATE demo design + seeded-data manifest. Kelly, 2026-07-05.
**Theme:** *"What happens after the workshop?"* — one complete, believable journey per relationship type, not a feature demo.
**Framing sentence for Larry:** **Every meaningful developmental relationship has time between encounters. The question is: what carries the work forward until the next encounter?**
**Closing slide:** *The workshop creates transformation. The companion helps people live it.*

---

## The two journeys (one platform, only the context changes)

| | Demo 1 — Workshop Companion | Demo 2 — Coaching Companion |
|---|---|---|
| Relationship | Many participants | One relationship |
| Rhythm | Cohort (between workshops) | Personal (between sessions) |
| Journey | Shared developmental journey | Individual developmental journey |
| Return | Next workshop | Next coaching conversation |

Third entry point (name it, don't demo it yet): **Leadership Team Companion** — each leader with their own MAIA, plus a shared team space across a year of off-sites. Vision layer; runs on the same Encounter → Reflection → Practice → Recognition → Return spine.

---

## Demo 1 — "After the Workshop" (Michael) · 15–20 minutes

| Act | Beat | Surface | Status |
|---|---|---|---|
| 1 (2m) | Meet Michael — one profile page, "just enough humanity" | Slide or simple page | Demo asset to make |
| 2 (2m) | The workshop, summarized. Larry: *"Between now and our next gathering, I'd like you to continue working inside Now What?"* | Slide | Demo asset to make |
| 3 (4m) | First arrival: threshold → *"How are you entering this room today?"* → reflection → a practice emerges | **Live** — `/maia/vision-studio?program=now-what` | ✅ Deployed `8f0482623` |
| 4 (3m) | Living between sessions — time passes as a 4-week timeline, not every conversation | **Seeded** — 4 weekly shared threads (see manifest) render in Larry's view; a member-side timeline view is polish | Seeded ✅ / polish open |
| 5 (4m) | Larry's view — Questions Alive · Practices · Recognitions · Shared Reflections; *only what Michael chose to share* | **Live** — `/studio/fields/<michael-id>` (threads grouped by tag/phase) | ✅ (4-section grouping = polish pass) |
| 6 (3m) | Return — the room opens from the practice: *"Last time you chose this practice. What happened?"* Larry asks *"Tell me what happened when you tried that morning practice"* instead of *"How have you been?"* | **Live** — return branch | ✅ Deployed |

**Walkthrough credentials + links:** see seeded-data manifest below.

## Demo 2 — "Between Sessions" (coaching, 1:1)

Same surfaces, personal rhythm: Session One → *"Let's keep this conversation alive between our meetings"* → weekly reflections (board meeting, style recognition, a hard week) → next session begins where the work actually is, from the thread she chose to share. **Runs entirely on Live surfaces today** — needs only its own seeded persona when Larry's ready for it (do not reuse "Sarah"; that name belongs to Library Flagship #1).

---

## Seeded-data manifest (production, clearly-labeled demo account)

Created 2026-07-05 via SQL on minisforum. **All demo rows are fictional, labeled, and removable in one statement.**

- Member: `michael.demo` / name **Michael (Demo)** / passkey `SOULLAB-DEMO-MICHAEL`
- Password: `NowWhat-Demo-2026` (legacy-hash minted in-container; auto-upgrades to bcrypt on first signin)
- `field_context`: `now-what-demo`
- Threads (backdated for the Act 4 timeline; all `member_authored`):
  1. −28d · `fire_1` · shared — "The workshop cracked something open — I don't want to manage my way out of it"
  2. −26d · `practice` · shared — "Three quiet minutes before my first executive meeting: what kind of leader do I want to become today?"
  3. −19d · `unsolicited` · shared — "Caught myself performing confidence in the budget review — paused, named it, chose honesty"
  4. −12d · `unsolicited` · shared — "Conflict with my COO — I listened past my own defense for the first time"
  5. −5d · `closure` · shared — "Achievement no longer defines identity — it expresses it"
  6. −3d · `unsolicited` · **private** — "Some mornings the question feels heavier than others" *(demonstrates default-private: Larry's view must NOT show this one)*

**Demo links:**
- Demo Home (front door): `https://soullab.life/now-what/`
- Overview deck: `https://soullab.life/now-what/overview.html`
- Michael's room (return branch fires on arrival): `https://soullab.life/maia/vision-studio?program=now-what&phase=fire_1&fieldContext=now-what-demo`
- Larry/Kelly's facilitator view: `https://soullab.life/studio/fields/<michael-demo-id>`

**Namespace decision (Kelly, 2026-07-06):**

> For now, `/now-what/` is the Larry demo front door; any emerging member-app route should ship under a distinct path until deliberately promoted.

Rationale: the demo home is live, coherent, and outward-facing; product-internal member-app work must not silently inherit a public presentation address. Mechanical note: the `next.config.js` rewrite is `afterFiles` and would yield to an `app/now-what/` route — so this decision is enforced by coordination, not code. The uncommitted member-app WIP (`app/now-what/` — guide/refuge/speak/talk/write) must relocate to a distinct path before it ships.

**Removal:** delete threads + events + sessions + member by the demo member id (one SQL statement, recorded in memory).

---

## The Workshop Cohort view — constitutional redesign required

The proposed table (Current State: Engaged/Quiet · Last Check-in: 5 days ago · Next Follow-up: Needs outreach) **cannot ship as drawn.** Three lines it crosses:

1. **"Current State: Engaged/Quiet/Reflecting"** — the system classifying members' states. This is the exact drift the field concept names: automatic state assignment = the framework performing the member's self-recognition. "Quiet" may mean *private*, not disengaged — a member having daily private conversations shows as "Quiet" solely because she shared nothing. Labeling privacy as a deficiency inverts the consent model.
2. **"Last Check-in: 5 days ago"** — activity telemetry from private sessions. Members consented to share *threads*, never their usage cadence. Surfacing conversation timing without consent is surveillance-by-metadata.
3. **"Needs outreach"** — an engagement-retention flag triggered by non-activity. That is attachment-capture mechanics wearing a care costume.

**The consent-shaped cohort view (buildable, Designed):**

| Participant | Practice they carried *(if shared)* | Most recent **shared** reflection | Questions they've named alive *(shared)* | Larry's notes *(his own)* |
|---|---|---|---|---|
| Michael | Morning three-minute pause | 5 days ago — "Achievement no longer defines…" | "What kind of leader am I becoming?" | *(Larry-authored)* |
| Susan | — nothing shared yet — | — | — | |

Everything in it is either member-shared or Larry-authored. "Nothing shared yet" is a fact, not a judgment. Recency of *shares* is legitimate (shares are, by definition, visible to him); recency of *activity* is not.

**Design principle — facts, not interpretations (Kelly, 2026-07-06 — CANDIDATE, elevated from the line above):**

> Every state shown to a practitioner should answer: *is this a fact, or our interpretation?* Only facts belong in the interface. Recognition belongs to the member.

This is constitutional language becoming interface. "Nothing shared yet" is a fact; "Quiet" is an interpretation; "Needs outreach" is an interpretation wearing an action's clothes. The test applies to every practitioner-facing state the platform will ever render — one distinction that keeps dozens of future features honest. (Interface expression of Observe → Verify → Represent and reveal-not-manufacture.)

**The care need, served constitutionally:** what Larry actually wants from "Needs outreach" is *who would welcome a human touch*. That signal must originate from the member — a member-pulled gesture (mirroring the anchors `surface_preference` model): *"I'd welcome a check-in from Larry."* One tap, explicit, revocable. Then the cohort view can show it — because the member put it there.

**Gate before any cohort surface ships:** Co-Lab Release Gate 31/31 + the three practitioner-privacy invariants + this redesign. Phase 3 of the field concept.

---

## What remains to polish (demo assets, not platform)

1. Michael profile page (Act 1) — slide-weight, not schema
2. Workshop summary (Act 2) — slide
3. Member-side timeline view of own shared threads (Act 4 alternative: present Larry's view; it already tells the time-passing story)
4. Facilitator view four-section grouping (Questions Alive / Practices / Recognitions / Shared Reflections) — a heading-level polish over the existing phase/tag grouping
5. Demo-2 persona seeding, when wanted

*The demo's spine — Acts 3, 5, 6 — runs on production surfaces deployed 2026-07-05. What Larry walks through is not a mockup.*
