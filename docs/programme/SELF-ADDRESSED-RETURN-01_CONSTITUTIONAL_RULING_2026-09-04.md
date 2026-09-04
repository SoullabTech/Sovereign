# SELF-ADDRESSED-RETURN-01 — CONSTITUTIONAL RULING

**Date**: 2026-09-04
**Kind**: constitutional ruling on a tester request, **amended 2026-09-04 by founder directive (§8) into the governing design for _My Support Rhythm_.** §1–§7 record the refusal and its reasoning; §8 records the directive, grades it, and names what it authorizes.
**Origin**: tester message, relayed by founder — *"I avoid engaging with Maia when I am in pain and don't want to be seen or go deep. As I am re-engaging now after some days, I was wondering if I could set up some gentle nudges for myself. Can Maia send me an email or text wooing me back? I am probably not alone in this avoidance tactic."*
**Working lane name refused**: `maia-reengagement-nudges` (the branch this ruling is authored on). See §2.
**Governing canon**: `docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md` §3 (temporal sovereignty means non-pursuit); `docs/canon/MAIA_CANON_v1.1.md`; `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`; Sanctuary Mode invariants (CLAUDE.md).

---

## 1. The ruling

**The request as literally stated is refused. It is not a backlog item, a "later," or a gated feature — it is one of the small number of things this system exists in order not to do.**

`RIGHT_TO_REMAIN_UNPOSSESSED.md` §3 enumerates the prohibition without ambiguity:

> - No nudges
> - No streaks
> - No "you haven't engaged in N days"
> - **No notifications keyed to absence**
> - **No automated re-initiation of contact**
> - **No inference of concern from absence**
> - **No "we missed you" affect**
>
> The system must be able to hold the member's disappearance **without flinching**. […] **The non-pursuit is the practice.**

And the summary table (§ implications):

> | **Engagement loops** | Removed entirely. No nudges, streaks, absence-tracking, progress-resumption, re-initiation. Non-pursuit is the practice. |
> | **Notifications** | None keyed to absence. None inferring concern. The system does not chase. |

"Wooing back" is the exact mechanism named. A member asking for it does not convert it into something else, because the harm is not to that member's consent — it is to the **architecture's capacity to hold every other member's absence without reading it.** Once the system can observe absence in order to act on it, it observes absence for everyone. Consent from one member cannot authorize building the observing organ.

The canon is explicit that the architecture must refuse to guess:

> The architecture cannot tell the difference between *the member is in retreat, doing the work*, *the member is in a grief that needs no audience*, *the member is rebuilding a life outside the system*, and *the member has lost interest*. **It must refuse to guess.**

*(§4.5 amends the consent claim in the paragraph above — opt-in is a legitimate instrument in this system; the objection to Tier 0 rests on the initiation boundary and consent-timing, not on consent being powerless. The refusal of Tier 0 stands either way.)*

**This tester's own message is the proof case, not the counterexample.** They named the pattern themselves: they withdraw when in pain and do not want to be seen. A system that reaches into that withdrawal — however gently, and even by prior arrangement — is a system that has made the withdrawal cost something. The withdrawal working *is* MAIA working.

---

## 2. The name is part of the violation

The branch name `maia-reengagement-nudges` encodes the failure mode in the identifier. "Re-engagement" is a retention-funnel term; it names the *system's* interest in the member's return, not the member's. "Nudge" names an influence exerted on a person without their deliberation at the moment of influence.

Consistent with `COACHING-TEMPLATE-EXTRACTION-01_NAMING_RULING_2026-09-04.md` — **fix the name before any work, so a future lane cannot open under the wrong one.**

| Refused name | Why | Replacement |
|---|---|---|
| re-engagement | names the system's stake in the member's return | **return** (the member's act) |
| nudge | influence without deliberation at the moment of influence | **self-addressed message** (deliberation happened at authoring) |
| "wooing" | courtship affect manufactured by the system = attachment capture | *(no replacement — the system never performs this)* |

Lane name if it ever opens: **`SELF-ADDRESSED-RETURN-01`**.

---

## 3. The legitimate need underneath — and the ONE shape that could carry it

The tester is not actually asking to be pursued. They are asking for **a way to act on their own behalf across time**, from a moment of clarity toward a future moment of pain, when the future self will not initiate.

That is a real and dignified need. It is the structure of a letter to one's future self, a wedding vow, an advance directive. It is member sovereignty exercised *forward in time*, not system pursuit exercised *inward*.

There is exactly one architecture that serves it without building the prohibited organ:

> **The member writes a message to themselves and sets when it arrives. MAIA delivers it verbatim and never looks at whether they came back.**

MAIA is postal infrastructure here, not a participant. The distinction is not tonal — it is structural and testable:

| Prohibited (absence-triggered) | Possible (member-authored, absence-blind) |
|---|---|
| System observes non-engagement → decides to reach out | Member decides, in advance, at a time of their own choosing |
| Trigger reads session/activity data | Trigger reads a member-set clock and nothing else |
| MAIA composes the message | Member composes; MAIA stores and delivers verbatim |
| Suppressed if the member returned (reads absence) | Fires regardless (reads nothing) |
| Success = member returned | No success measure exists |
| Affect: "we missed you" | Affect: the member's own words, in their own voice |

**The load-bearing test**: *if the system cannot tell whether the member has been away, it cannot be chasing them.* Absence-blindness is not a policy on top of the feature — it is the feature's definition, and it must be enforced in the query, not in review.

---

## 4. Falsifiers — what a build would have to survive

If this lane is ever authorized, these are the acceptance conditions. Each is structural (enforced in code and provable by a check), not a guideline.

**F1 — Absence-blindness is structural.**
The scheduler's selection query may not reference any session, conversation, activity, or last-seen table or column. Enforced as a proposed refusal check **R32** in `tests/constitutional/refusal-registry/` (pattern: R08 / R04 — the prohibition lives in the SQL, not in a post-filter a caller could bypass). If the delivery path can compute "days since last visit," the lane is RED.

**F2 — No composition path.**
No model call anywhere in the authoring or delivery path. Content is member-typed, stored verbatim, delivered verbatim. MAIA does not suggest, improve, warm, or personalize it. A system-composed "gentle nudge" is manufactured intimacy — refused by `MAIA_CANON_v1.1` and by the vow against simulating intimacy.

**F3 — Absence-blind in both directions.**
Delivery is not cancelled, delayed, or altered because the member returned. Suppression-on-return is absence-reading wearing a kind face.

**F4 — No effect measurement. Ever.**
No table, dashboard, query, or analysis correlating a delivery with a subsequent session. Under `OPTIMIZATION_TOOLING_GOVERNANCE.md`, an objective function over member return is exactly the category ruled out: *"improving the relationship with members — a governance question, never an optimization problem."* **This is the falsifier most likely to erode first**, because measuring it will feel like responsibility. If we ever learn whether this works, we will tune it, and once tuned it is retention machinery regardless of its origin.

**F5 — Member-authored origin, single-gesture revocation.**
Default off. No system suggestion of the feature at a moment of vulnerability, and specifically never offered in response to detected distress. Every delivered message carries its own cancellation. Deletion is immediate and total.

**F6 — No elapsed-time language and no concern affect.**
The message may not reference how long it has been, may not express having noticed, may not express concern. Not as a copy guideline — the system holds no such data to reference (F1).

**F7 — Sanctuary is absolute.**
Nothing authored in a Sanctuary session can become a scheduled message. Sanctuary content cannot be extracted, inferred, or converted into future contact under any circumstance, including by member request during the session (CLAUDE.md, Sanctuary invariant 6).

**F8 — Channel discipline: email only.**
Email is pull-shaped — it waits in a place the member opens on their own initiative. SMS and push are push-shaped: they enter the body's attention field unbidden, wherever the person is, including inside the pain they withdrew to tend. Temporal sovereignty is thinner over a channel that interrupts. SMS/push are refused for v1 and require a separate ruling.

**Direction of authority** (`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`): the message carries the member's words at the layer the member authored them. It may not elevate — no "you were working on grief," no theme, no continuity claim, no Recognition-layer meaning manufactured from an Encounter-layer note. Verbatim, or nothing.

**Growth-obligation check** (CLAUDE.md, founder-added 2026-08-04):
- *Uncertainty introduced*: the system cannot know whether the arriving message meets a self who still wants it. Preserved by making it trivially dismissible and self-cancelling, never insistent.
- *Provenance*: every delivered word traceable to a member authoring act, with its timestamp, shown to the member on delivery.
- *New responsibility*: a message can arrive into a worse moment than the one that wrote it. The system must make leaving easy and must never treat the ignored message as a signal.

---

## 4.5 Opt-in: what it buys, and what it does not (founder note, 2026-09-04)

> *"It would be nice if they could opt into such things."*

Correct, and it resolves more than §1's framing allowed. §1 argued that one member's
consent cannot authorize building an absence-observing organ. That is too absolute to be
faithful to this codebase's own practice: **R08** (anchor ambient surfacing) is precisely a
member-standing-consent gate admitting a member's rows into a system-side read, and it is
respected canon. Opt-in is an established instrument here, not a loophole. §1 is amended
accordingly — the objection is not "consent cannot gate observation."

The distinction that actually holds is narrower and stronger:

> **R08 gates what surfaces into a session the member is already inside. A nudge gates
> whether the system initiates contact outside the member's presence.** The first shapes an
> encounter the member opened. The second crosses from the session into their life, at a
> moment they did not choose, in a state the system cannot see.

Opt-in fully settles the first. It does not settle the second, because of *when* the consent
is given relative to *when* it is spent.

### The consent-timing problem (the real crux)

The tester's own words: *"I avoid engaging with Maia when I am in pain and don't want to be
seen."*

An opt-in is authored by the not-in-pain self. It is **spent on the in-pain self — who has
stated, in advance, that they do not want to be seen.** That is not a consent defect to
paper over; it is the specific structure this member described. Any design that lets the
earlier self overrule the later self's stated boundary is doing the thing MAIA exists not to do.

Tier 1 dissolves this. The arriving message is **the member's own voice**, not MAIA's gaze.
Being met by your own earlier words is not being seen by a system; you remain unobserved
throughout. Consent-timing stops mattering because nothing is watching at delivery time.

### Tiers — the actual decision

| Tier | Shape | Reads absence? | Composes? | Ruling |
|---|---|---|---|---|
| **0** | System notices you're gone and reaches out | Yes | Yes | **REFUSED** — canon §3 verbatim. Not reachable by opt-in. |
| **1** | Member writes themselves a note, sets its arrival | **No** | **No** | **Constitutional as specified** (F1–F8). The reframe. |
| **1.5** | Member sets a standing cadence; MAIA sends a fixed, non-referential offering on that clock | **No** | Yes (generic, non-personal) | **Open question — founder's call.** See below. |
| **2** | Member opts in to being noticed-and-pursued during absence | Yes (consent-gated, R08 pattern) | Yes | **Not recommended.** Consent-timing problem above; builds the organ; F4 becomes unholdable. |

**Tier 1.5 is the one worth deciding.** A member sets "a note from MAIA every Sunday" — it
arrives on that clock whether they have been present daily or absent for months, because
nothing is looking either way. It is absence-blind (F1, F3 intact) and it is genuine MAIA
presence rather than only self-service. Its cost is F2: MAIA composes. That is survivable
**only** if the content is structurally incapable of being about the member — a question, a
seasonal marker, an offered form, identical for everyone on that cadence. The moment it is
personalized, it becomes a warm message that implies having been thought about, which is
manufactured intimacy arriving on a schedule. **The F2 line for Tier 1.5: the content may
not vary by member, and may not reference the member's history, state, or absence.**

**Recommendation**: authorize Tier 1 if anything. Offer Tier 1.5 as a founder decision with
the non-varying-content constraint bolted on. Hold Tier 2 refused. Note that Tier 0 remains
refused *even under opt-in* — it is the one row the member cannot consent their way into,
because the observation it requires exists for everyone once it exists at all.

---

## 5. What this document does NOT authorize

- No schema, migration, route, worker, or UI.
- No scheduling infrastructure of any kind.
- No SMS/push capability.
- No instrumentation of member absence, in any form, for any purpose, including diagnostics.
- No offering of this to the tester as forthcoming. It is under consideration; it does not exist.

The lane opens only by founder directive.

---

## 6. Reply to the tester (draft — founder to send or amend)

> Thank you — this is one of the most useful things a tester has told us, and I want to answer it honestly rather than just say yes.
>
> We deliberately built MAIA so that it cannot tell when you've been away. Not "doesn't check" — cannot. There's no streak, no last-seen, no absence tracking anywhere in the system, and MAIA will never reach out because you've been quiet. That was a hard architectural commitment and it's one of the few we treat as permanent.
>
> The reason is close to what you described. You avoid MAIA when you're in pain and don't want to be seen. That instinct is sound, and it's yours. A system that reaches into that — even kindly, even with your prior permission — makes the withdrawal cost something, and quietly turns your absence into a thing being watched. We'd rather MAIA be genuinely safe to disappear from. Your leaving working is MAIA working.
>
> You're also right that you're not alone in this. So the thing we're thinking about is different in a way that matters: not MAIA noticing you're gone, but **you being able to leave yourself a note.** You write it — your words, at a moment when you have the clarity for it — and set when it arrives. It comes on that day whether you've been here every day since or not, because the system still isn't looking. That isn't MAIA wooing you back. It's you, earlier, talking to you, later. MAIA just carries the envelope.
>
> It would be entirely yours to switch on — nothing like it is ever on by default, and you could delete it in one gesture, from inside the note itself.
>
> That's under consideration, not built, and we won't promise it until it is. But you've named the real thing, and the distinction you helped surface is now written into how we decide.
>
> Meanwhile: come back when you come back. Nothing here is keeping count.

---

## 7. Status

**RULED — literal request (Tier 0) REFUSED on canon, and not reachable by opt-in.** Reframe (Tier 1) named and constrained; Tier 1.5 raised as a live founder decision; Tier 2 not recommended. Lane `SELF-ADDRESSED-RETURN-01` **NOT OPENED**. F1–F8 stand as the acceptance conditions if it ever is. Founder decides whether the reframe is worth building at all — refusing it entirely is a coherent and defensible outcome, and cheaper than holding F4 forever.

---

## 8. Founder directive, 2026-09-04 — **My Support Rhythm**

Founder answered §7 with a design. It **supersedes the §4.5 tier ladder as the product
architecture**; the tiers survive only as the constitutional grading underneath it. Recorded
here rather than in a separate document so the constraints cannot drift away from the design.

Research citations in the directive (JITAI meta-analysis, DMHI engagement reviews, Apple
notification-authorization guidance, FTC dark-patterns work) are **founder-supplied and not
independently verified in this session.** They are recorded as the directive's stated basis,
not as findings this document establishes.

### 8.1 What the directive gets right that §4.5 did not

1. **Modes, not volume.** Low/Medium/High is a notification-volume axis; these are *different
   relationships to support*. A volume slider would have quietly re-imported the retention
   frame through the UI, because volume is the axis a retention engine tunes.
2. **"Walk with my practice" — a tier §4.5 did not have.** Genuinely personalized, yet the
   personalization *originates in an explicit member act*. This is the strongest mode in the
   set and the most MAIA-shaped thing in it. It satisfies
   `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY` cleanly: the member selects the item at the layer
   they authored it, and MAIA carries it without elevating it. No Recognition-layer meaning
   is manufactured — MAIA never decides what mattered.
3. **Build order.** *member-selected → scheduled → personally grounded → adaptive*, explicitly
   not *observe → infer → message*. That ordering is itself a constitutional instrument: each
   step is shippable, and none of them builds an organ the next step needs.

### 8.2 The mode lattice, graded

| Mode | Reads absence | Composes | Grade |
|---|---|---|---|
| **Quiet** (default) | no | no | Constitutional. Must be the default, and must remain reachable in one gesture from every other mode. |
| **Remember for me** | no | no | Tier 1. **Build first.** F1–F8 apply as written. |
| **Gentle rhythm** | no | yes (generic) | Tier 1.5. Constitutional **only** under the non-varying-content constraint: content may not vary by member and may not reference member history, state, or absence. Directive's own "no inference about the member" is the same line. |
| **Walk with my practice** | no | carries member-selected item | Constitutional. Strongest mode. Personalization is *authored, not inferred*. |
| **Responsive companion** | **depends** | yes | **Conditional — see 8.3.** |
| **Human connection** | n/a | n/a | **Separate lane.** Not this ruling. |

### 8.3 "Responsive companion" — make *initially* into *structurally*

The directive says signals should be *"initially self-reported/member-set rather than passive
surveillance."* **"Initially" is precisely how the organ gets built later.** A passive-signal
path deferred is a passive-signal path scheduled.

The line must be structural, not sequenced:

> **A signal is admissible only if it exists because the member performed an act to create
> it.** A member-set state ("I'm in a hard week"), a self-report, a chosen practice — all
> admissible, and all absence-blind. A signal derived from behavior the member did not
> perform *as a signal* — session frequency, gaps, dwell time, time-of-day patterns — is
> refused, and its refusal does not expire.

Under that line, Responsive companion is constitutional and needs no absence-reading at all.
Widening it to behavioral signals is a **new ruling**, never a phase of this one.

### 8.4 "Human connection" is a different constitutional object

A practitioner choosing to reach out is a **human act, not a system act** — the canon's
non-pursuit binds MAIA, not people. The directive's own research points here (human guidance
outperforms automated reminders), and it may be the highest-value mode in the set.

But it is governed elsewhere: Co-Lab boundaries, explicit sharing permissions, **R05**
(no implicit practitioner share), and the **Co-Lab Release Gate** (`verify-colab-boundaries.ts`,
31/31, mandatory before any tester wave touching sharing). Two failure modes to name now:
MAIA must not *prompt* the practitioner from an absence read (that is Tier 0 laundered through
a human), and the member must know exactly what the practitioner can see. **Own lane. Not
authorized here.**

### 8.5 "Reach out if I disappear" — the amendment, costed

The directive is correct and unusually honest: this *does* create an absence-reading organ,
and it *does* require an explicit amendment to `RIGHT_TO_REMAIN_UNPOSSESSED` §3. Refusing to
smuggle it through notification settings is the right instinct — that is exactly how such
organs normally arrive.

**There is no absence-blind way to build it.** "If I haven't visited in N days" requires a
last-seen read; no framing removes that. So the only real question is **how small and how
fenced** the organ can be. The minimum viable form:

- **One column**, `member_presence.last_presence_at`, written on visit. No history, no
  sequence, no session join, no derived gap column persisted anywhere.
- **One reader.** Only the scheduled-return selector may read it, and only for members who
  set a threshold themselves. Enforced as a refusal check (**R33**): no other query, route,
  view, export, or analytics surface may reference the column. R08/R04 pattern — structural,
  in SQL, not a review convention.
- **Member sets the threshold, the channel, and the words.** MAIA composes nothing.
- **Never any inference on top.** No "you seem to be withdrawing," no concern affect, no
  variation by how long the gap was. The gap crosses the member's own threshold or it does
  not; its magnitude is never read.
- **Amendment is scoped and named** in the canon file itself — the prohibition stands for the
  system; the single exception is a member-set threshold on a member-authored message.

**My recommendation: do not amend yet.** Ship Remember-for-me, Gentle rhythm, and Walk-with-my-practice
first. If members who use those still ask for the absence trigger, that is real evidence and
the amendment is worth its cost. Amending in advance spends the constitution on a hypothesis.

### 8.6 Measurement — one hardening

*"Was this support useful?"* over *"Did this get them back?"* is right, and the directive's
dark-patterns reasoning supports it.

One addition, or "useful" becomes the new retention proxy: **the member's answer may adjust
that member's own rhythm and nothing else.** It may not be aggregated into a system-level
objective, and it may never be joined to whether they returned. If we can see that useful-rated
messages correlate with return, we will optimize for useful-rated messages, and F4 is gone
through the side door. Store it as a member-owned preference signal, not as a metric.

### 8.7 Governance catch — do NOT build this into the Coaching Platform yet

The directive places My Support Rhythm in the Coaching Platform as generic architecture. That
is likely the right long-term home, **but building it there now violates the Anti-Drift Law
freeze on generalized architecture** — `COACHING-TEMPLATE-EXTRACTION-01` is named but
explicitly **NOT OPENED** (ruling of 2026-09-04, same day).

Build v1 MAIA-side. Note the portability; do not architect for it. Extraction is a later,
separately authorized act — exactly the sequencing the naming ruling was written to protect.

### 8.8 Controls, and one constraint on the onboarding pattern

Channel · cadence · timing · source permission · tone, each independent, with **pause / less
often / change / stop reachable from inside every delivered message** — accepted in full.
Reachable-from-the-message is the load-bearing one; a control that requires returning to the
app to disable is a retention mechanism.

The in-context ask (*"Would you like support staying with this?"* after a meaningful keep) is
accepted, with **F5 pinned**: the offer may follow a member's authoring act, never a distress
signal. Offering support at a detected low point is the manipulation pattern this whole ruling
exists to prevent, and it would feel like care while doing it.

**Channel note**: F8 restricted v1 to email as the pull-shaped channel. The directive's
per-mode channel control supersedes the blanket restriction *provided* push/SMS are
member-selected per mode, off by default, and quiet hours are honored — Apple's provisional
delivery is a reasonable model for quiet trial. The reasoning F8 encoded still holds and
belongs in the copy: push enters the body's attention wherever the person is.

### 8.9 Status after directive

**Lane `SELF-ADDRESSED-RETURN-01` OPENED** for **Remember for me (Tier 1) only**, on the
directive's build order. Gentle rhythm and Walk-with-my-practice: designed and graded
constitutional, not yet authorized to build. Responsive companion: authorized in shape only
under the 8.3 structural line. Human connection: separate lane, Co-Lab-governed. Absence
trigger: **not amended, not built** — revisit on evidence per 8.5. Setting name **My Support
Rhythm** accepted; *"between visits"* framing accepted and load-bearing, because it treats
absence as ordinary rather than as a lapse.
