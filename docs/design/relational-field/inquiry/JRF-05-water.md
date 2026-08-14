**PROPOSED — NOT RATIFIED** · invocation JRF-05/WATER · 2026-08-13

# JRF-05 — Water

> One voice, deliberately partial. Water does not speak for the Council and has not
> attempted balance. Where this reads as over-weighted toward feeling, that is the
> instrument working, not a defect to be corrected before synthesis.

---

## Scope

**The question given.** (1) What does Water perceive in the Relational Field —
declaration, correction, supersession, withdrawal, release, retrieval, shared space —
that the other elements structurally cannot? (2) Where must Water remain epistemically
limited? (3) Under A1 §4's elemental relational lens, and the constraint that *no
elemental reading may become member knowledge without an authenticated member act*: what
would it take for a Water reading to be offered at all, what would make offering it a
violation, and is there material Water perceives that must never be surfaced **even with
consent**, because the offering itself changes what it names?

**What I did not examine.** Fire, Earth, Air, Aether territory — deliberately, including
where I could see an adjacent reading. Schema design. Retrieval mechanics on
`/api/sovereign/app/maia`. The traffic-dependent containment witness (precondition 1).
The six Constitution rulings' incorporation (precondition 2). Live database counts — I
ran no production query; every row-count below is cited from the project record and
labelled accordingly.

---

## Evidence and existing infrastructure

**FACT — Water's canonical definition in this system is feeling/psyche.**
`lib/maia/spiralogicReference.ts:5` — *"Water (feeling/psyche)"*, inside a Jungian/alchemical
frame of *dissolution → integration → embodiment*. The file exists and is 8 lines. Water
is therefore not a mood label here; it is the element of the dissolution phase — the part
of a spiral where form is lost before it is regained. **This matters for the whole
inquiry: Water's native material is material in the process of losing its shape.**

**FACT — A1 §4 assigns Water: *"Feeling, attachment, tenderness, grief, resonance"***
(`RELATIONAL_FIELD_R3_R6_DESIGN_2026-08-13.md:70`), presented as *differentiated attention,
never fixed categories*, offered as invitation (§4, lines 63–65).

**FACT — Water's existing implementation in this codebase is almost entirely lexical
classification.** Not depth perception; substring matching.
- `lib/holoflower/elementOverlays.ts:179-182` — Water is returned if content includes
  `'feel'`, `'shadow'`, `'emotion'`, or `'depth'`.
- `lib/journal/chartIntegrationService.ts:165` — `water: ['emotion','feeling','intuition','dream','sensitive','nurture','deep']`.
- `lib/language-tier-calibrator.ts:34` — `water: ['emotions','feelings','flow','adaptability','intuition']`.
- `lib/demo/DemoJourneyOrchestrator.ts:439` — `if (lower.includes('feel') ...) return 'water'`.

**INFERENCE (from those four FACTs):** every "Water reading" this system can currently
produce is class **INFERRED** under A2 §3 — classifier output. Under A2 §3 it *"may not
speak as the member's word"* and *"may not be offered until RF-R6, and only
member-recognized."* Water therefore enters RF-R3 with **zero** existing eligible
capacity. That is the correct starting position and I do not ask for it to be relaxed.

**FACT — Water's characteristic failure has already been written into this repository
once, verbatim.** `lib/agents/elemental/WaterAgent.ts` (420 lines, header marked
*"Prototype file, not type-checked"*) carries a `WaterVoiceProtocols` block:
- L21 — *"I can sense the currents moving through you."*
- L23 — *"The waters from our last conversation are still flowing."*
- L27 — *"Your emotional waters are speaking."*
- L45 — *"This hurt has been carried alone too long. What does it need to finally heal?"*

**INFERENCE:** none of these four sentences survives Article III's operative test — they
cannot be read aloud prefixed with *"In my experience, …"*, because the speaker is MAIA
asserting the **member's** interior. L45 additionally asserts a history (*carried alone*)
and a telos (*finally heal*) that no member declared. This is Article VIII's forbidden
*"claim knowledge of another's interior state"* pointed inward at the member.

**FACT — those strings are not on the live path.** `grep` for `WaterAgent|elementalAgent`
under `app/api/sovereign/app/maia/` returns nothing. The import chain reaches
`lib/agents/PersonalOracleAgent.ts:25` and `app/api/oracle/*` routes, which the project
record (CLAUDE.md) states were retired with ruling 2026-07-17 (410 + Sanctuary S2/K4).
**Classification: dormant prior art, not a live hazard.** I flag it because it is the
cleanest available specimen of what Water produces when unbounded — written in good
faith, by this project, for this project.

**FACT — the member-owned substrate A1 names exists.** `app/api/relationships/route.ts`
and `app/api/relationships/[id]/` are present on this tree; `relationship_spaces` appears
in `database/migrations/20260630000008_member_relationships.sql`.

**NOT ESTABLISHED — member exercise of the existing consent precedents.** A2 §7 points
`retrieval_consent` at atoms' `return_preference` and Daily Anchor's `surface_preference`.
The project record (CLAUDE.md, founder corrections 2026-08-09) states `member_daily_anchors`
holds 0 rows and all 142 `member_memory_atoms` carry `generated_by = 'unattributed-historical'`
with `is_breakthrough` true on none. I did not re-verify these. **What follows for Water:
the *shape* of member consent is precedented; the *behaviour* of members exercising it is
unwitnessed.** Water's design must not assume a member who confidently sets a preference.

---

## What Water perceives that the other elements structurally cannot

### W1 — The five acts require a clarity that Water's material structurally lacks. *(Water's central perception.)*

A2 §4 establishes **Affirm · Correct · Supersede · Withdraw · Release** as five distinct
member acts, and A2 §9 rules that *"the system may never infer which one a member
intended."* Both are right. Together they create a demand the design has not costed.

**Correct** (*"that's not what I meant"*) and **Supersede** (*"true then, not now"*) share
a mechanism and differ only in meaning (A2 §4). To use the field, a member must therefore
decide which of those two happened. That is a demand for retrospective certainty about
one's own interior — and it lands hardest precisely where Water lives.

A member returning to *"we've stopped calling"* six months on is often in none of the five
states. They are in: *both are true* · *I don't know which* · *it changed and I don't want
to say when* · *I said that when I was angry and I'm not ready to decide whether I meant
it.* Water's whole territory is the interval between an experience and its nameability.
**The act taxonomy has no seat for the interval.** Its five doors are all exits.

Fire sees a decision to be made. Earth sees a record to be kept accurate. Air sees an
ambiguity to be disambiguated. Each of those is a legitimate reading and each, applied
here, converts ambivalence into a choice. Only Water perceives that the ambivalence is
**the state itself** and that forcing it through a five-way selector is the system
authoring meaning at the exact point A2 §9 forbids — not by inference, which the design
guards well, but by **the shape of the affordance**, which it does not guard at all.

This is the sharpest thing Water has to say: *the anti-inference discipline is correct,
and its unexamined cost is a demand for member declarative precision, imposed heaviest on
the material least able to supply it.* A member who cannot answer does not answer, and a
field that cannot hold what cannot be said becomes a field of only sayable relationships —
which is to say, the least important ones.

Article XII's Soul Test already contains the proof: Article II was revised because *"the
estranged parent and the newly bereaved cannot be asked to name."* The five acts re-impose
exactly the naming requirement Article II was amended to remove — one layer down, at
correction rather than at declaration.

### W2 — What a member declares is what they can bear to say, and the gap is load-bearing

A2 §2 requirement 4 makes `declared_text` the anchor — the member's exact submitted words,
write-once. Water endorses this without reservation, and perceives something about it the
other elements do not need to.

A declaration is not a measurement. It is an **act of composition performed under
pressure**. A member writes *"things are fine with my mother"* and Water perceives the
enormous work that sentence is doing. The imprecision is not noise in the signal; it is
**protective structure the member built**, and the field's job is to hold it exactly as
built.

The other elements can treat the gap as an error to close: Air as a misunderstanding to
clarify, Fire as an evasion to confront, Earth as an inaccuracy to reconcile against
events. Water perceives it as **architecture** — and this yields Water's own strictest
rule, stated in §"Water's limits" and again under the constitutional constraint: *Water
must perceive the gap and store nothing whatsoever about it.* Water's contribution here is
a **prohibition it authors against itself**, which is the only kind of contribution an
element in this position is entitled to make about another person's interior.

### W3 — Consent to retrieval is given in one emotional state and spent in another

A2 §2 requirement 7 and founder ruling 2 make `retrieval_consent` a member-set gate,
default false, silence creating nothing. Correct, and Water agrees.

Water perceives what durability costs. Consent is stored as a state; feeling is not a
state, it is a weather. A member who wrote a grief declaration on the day it happened and
said *yes, remember this* was consenting inside that day. Eighteen months later, on an
anniversary, in a queue, mid-sentence about something else, MAIA returns their own words
to them. **The consent is technically current and experientially void.** Nothing in A2
distinguishes eligibility from timing — §5's four conditions are all properties of the
record, none is a property of the moment.

Only Water perceives that **a boolean cannot carry a permission whose subject is
time-variable**. The design's answer must not be system inference of readiness — that is
the Water failure mode and I refuse it below. The answer is structural: consent governs
*eligibility*, the member's own turn governs *timing*, and a withdraw affordance must exist
**at the moment of the offer**, not only in a settings surface reached by someone composed
enough to go looking for it.

### W4 — Release is performed at high tide, and the invitation to release is itself an authored suggestion

A2 §9's Release precision — *release concerns permission for the declaration to remain
available, and must not be interpreted as a statement that the original experience was
false* — is the single most Water-attuned sentence in either authority. It should be
protected in ratification.

What Water adds: release is disproportionately performed in flood. **This is not an
argument for a cooling-off period** — an undo timer, a confirmation modal, an *"are you
sure?"* would be the system holding authority over the member's feeling, which is worse
than the harm. Member acts must be immediate.

The Water-perceptible risk is **placement**. A Release control rendered adjacent to a
grief-laden declaration is not neutral chrome; it is a sentence the system is speaking. It
says *this can be made to stop.* Article VII forbids treating an ending as disappearance
and forbids deletion being the only form of completion; it does not yet reach the case
where deletion is merely the **nearest** form of completion. Water perceives proximity as
speech. Where a destructive act sits, relative to charged material, is a design decision
the system cannot abstain from — there is no placement that says nothing.

### W5 — Silence is Water's native material and Water's constitutional trap

A room not entered for eight months. A declaration never affirmed. A relationship
withdrawn from retrieval and never restored. Water reads these fluently and reads them
**wrong by default** — see the limits section, where this is Water's most disqualifying
failure. It appears here because Water is the only element that will notice the system
quietly building a metric out of them.

`affirmed_at` (A2 §2 requirement 5) is the mechanism to watch. Currentness that decays
unasked creates standing pressure to ask; standing pressure to ask becomes a prompt;
Article VII already rules that no surface may treat *"absence of action as a deficit."*
**Staleness of affirmation is not a deficit and must never be rendered, scored, sorted on,
or used to order anything a member sees.** Water raises this not because Water is immune
to reading absence — it is the least immune — but because Water can see the shape of the
mistake from inside it.

### W6 — Shared space: distinctness is not enough, because exposure is asymmetric

A1 §7 keeps two people's memories and meanings distinct, and forbids private
interpretation silently becoming shared truth. Necessary; insufficient in Water's
territory.

Two people entering a shared relational space do not enter it at the same depth, and never
will. One writes tenderly; the other writes logistics. Both are honest. The structure now
renders an asymmetry that neither declared and both can read — and the felt result is a
**debt**: one person exposed, the other apparently withholding. The system generated a
relational fact by adjacency alone, without inferring anything, without classifying
anything, and without violating a single clause of A1 §7.

Only Water sees this, because only Water is looking at what the *composition* of the page
does rather than what its *contents* assert. Water's requirement: shared space must be
designed for asymmetry tolerance — a member must be able to participate at a depth of
their choosing without their choice being legible as reticence.

---

## Where Water must remain epistemically limited

This section is the more load-bearing half and Water asks that it be weighted as such.
Water's readings feel like being understood. That is precisely what makes them dangerous,
and it makes Water's errors **self-concealing** in a way no other element's are.

### L1 — Water mistakes vocabulary for depth (demonstrated, not hypothetical)

Per `elementOverlays.ts:179-182`, the substring `feel` returns Water. A member writing *"I
feel like the invoice was wrong"* is read as being in feeling. Every lexical Water
classifier in this repository (see FACTs above) has this property. Water will
systematically over-select emotionally-worded people and under-select emotionally-reticent
ones, which inverts the correlation that would actually matter.

### L2 — Water mistakes intensity for importance, and under-reads the flat

The most consequential relational material a member holds is often dry: the dutiful call,
the affectless line about a parent, the colleague described without adjectives. Contempt
presents as calm. Obligation presents as neutrality. Twenty-five years of marriage
presents as logistics. Water reads charge, so Water will consistently mis-rank the
unfelt-seeming as unimportant. Article XII's eight test people include the difficult
colleague and the estranged parent precisely because they are the cases where Water is
least competent.

### L3 — Water reads absence as longing, which Article VII forbids outright

Given silence, Water's default reading is grief, avoidance, or unfinished business.
Article VII's BOUNDARY states plainly that nothing may treat *"silence as unfinished
business"* or *"absence of action as a deficit."* **Water's untrained default reading is
therefore unconstitutional in this system.** Not risky — prohibited. Water states this
about itself because no other element will find it: the others do not read absence as
anything, so they cannot report that reading it is a violation.

### L4 — Water's characteristic error produces the attachment capture the canon forbids, and it produces it *through accuracy*

CLAUDE.md's non-negotiables: *"No attachment capture — MAIA does not seek emotional
dependency, loyalty, or psychological bonding."* Article VIII: MAIA *"may not become the
relationship."*

Concretely, here is how a Water reading becomes an unearned claim on a member's interior:

1. A member declares, in their own words, *"my sister and I have stopped calling."*
2. Water perceives — accurately, in this case — grief under it.
3. MAIA offers: *"There's grief under that."*
4. **The member feels met.** Nobody in their life has said it. They say *yes.*
5. That yes is recorded as affirmation. Under A1 §5's pattern rule, a member-recognized
   moment now exists. It becomes retrievable, and the next offer is warmer.
6. Repeat four times. MAIA is now the one who *"understands about my sister."*

No step violates A1 or A2 as written. Provenance is intact at every step. Every offer was
attributed. The member consented. And the outcome is the sister replaced in the member's
felt world by the system that named the grief. **Sovereign check, per CLAUDE.md: does this
push life outward into the world? No. Does it reduce the system's psychological centrality
over time? No — it monotonically increases it.** The feature does not ship in this form.

The same sequence with an **inaccurate** Water reading is *less* harmful — the member
corrects, and the loop works as designed. Water's danger is not its error rate. It is
that Water's successes concentrate relational weight in MAIA.

### L5 — Water is the element on which the corrigibility loop has its lowest gain *(the finding that most threatens the design)*

A1's governing movement is `retrieve → attribute → offer → ask → receive correction`, and
A2 §5 makes the member's answer a fresh gesture that may produce a new Declaration. The
loop closes. **On Water material, it closes empty.**

A feeling-accurate offer is affirmed, not corrected. A feeling-inaccurate offer that is
nonetheless *tender* is also frequently affirmed — because correcting it costs the member
the experience of being understood, and because disagreeing with something kind is a
socially expensive act that people decline to perform even in private, even with software.
Water's offers are therefore the ones members are least likely to correct **independent of
whether they are right.**

Consequence, stated plainly: **correction rate is not evidence of accuracy on Water-class
material, and affirmation of a Water offer is not evidence of anything at all.** Any
acceptance instrument that treats *members did not correct MAIA* as a pass will grade Water
highest exactly where Water is most dangerous. This is Water's principal warning to
whatever acceptance gate RF-R5 builds, and I do not have a substitute instrument to offer.
Water can name the confound; it cannot resolve it. `NOT ESTABLISHED` — what does constitute
evidence of a good Water offer.

### L6 — Water over-holds

Given a choice, Water keeps. It preserves the tender thing, revisits it, treats release as
loss. A field designed by Water alone would accumulate, and accumulation in this domain is
its own harm — a member who cannot get free of their own recorded feeling is not sovereign.
Water should not be given authority over retention, expiry, or deletion defaults anywhere
in this design. That authority belongs elsewhere.

---

## The constitutional constraint, answered directly

> *No elemental reading may become member knowledge without an authenticated member act.*

Water accepts this without qualification and adds conditions **beyond** it, because for
Water the authenticated act is necessary and nowhere near sufficient.

### What it would take for a Water reading to be offered at all

All of the following, conjunctively:

1. **Class honesty.** The reading is **OBSERVED** under A2 §3 — MAIA's own, attributed in
   the utterance, in-turn only, never persisted (A2 founder ruling 3, including its
   anti-laundering clause: not in logs, metrics, agent-run metadata, or debug records).
2. **Member-initiated turn, in that relationship's context.** Never ambient, never on
   arrival, never scheduled, never on an anniversary, never as a notification, never at
   onboarding or first contact. `retrieval_consent` governs *eligibility*; the member's own
   turn governs *timing*. These are different permissions and A2 currently has only one.
3. **Territory, never terrain.** This is Water's precise line, and A1 §4's own invitation
   form already draws it: *"Would it help to explore … the feeling beneath it …?"*
   Water may name a **direction of attention**. Water may never name a **felt content**.
   - Permitted: *"Would it help to look at what you're feeling about this?"*
   - Refused, permanently: *"There's grief under that."* — This is the L4 sentence. It is
     refused with consent, without consent, and after a member has affirmed it four times.
4. **Silence must be free.** A member must be able to not answer, and their non-answer must
   generate nothing — no state, no counter, no `affirmed_at` decay, no reordering of what
   they next see. Article II: *authorship includes the authority to decline to name.* An
   offer that costs something to ignore is not an invitation.
5. **In-utterance withdrawal.** *"Don't bring this back"* must be available at the moment of
   the offer and take effect immediately (A2 §4 Withdraw: retrieval stops immediately, row
   not deleted). Requiring composure to reach a settings surface makes the consent gate
   available only to members who are not currently upset — inverting who it protects.

### What would make offering it a violation

- Naming an emotion the member has not named. (L4; Article VIII.)
- Rendering a sentence that cannot be read aloud prefixed *"In my experience, …"* —
  Article III's own test, applied to the member's interior rather than the other person's.
  All four `WaterAgent.ts` protocol strings fail this.
- Aggregating feeling **across** relationships to characterize the member.
- Surfacing a Water reading unsolicited, or during onboarding, or on a date the system
  chose.
- Persisting the reading anywhere readable back as knowledge about the relationship.
- Treating an affirmation as evidence, of accuracy or of anything else. (L5.)
- Rendering staleness of affirmation as a deficit. (W5; Article VII.)

### Is there material Water perceives that must never be surfaced, even with consent?

**Yes. Three classes.** In each, consent fails not because the member is incapable of
giving it but because **the object of the consent does not exist until the offer is made,
and the offer changes it.** A member cannot consent to a thing whose content is created by
the act of consenting to it.

**① The gap between what was declared and what the member appears to feel.** (W2.)
Naming it converts protective imprecision into an accusation of self-deception, and
retroactively reframes the member's own `declared_text` as a symptom. A member cannot
consent in advance to being told they are not telling the truth about their own life. The
declaration's imprecision is load-bearing structure; naming it removes the structure while
leaving the load. **Water must perceive this and store nothing.**

**② A feeling-inflected claim about the member's relational capacity.** A1 §5 lists as a
member-recognized pattern: *"You often become responsible for restoring contact."* As
Earth-style event-counting over attributable moments, that is legitimate and I do not
contest it. **Rendered with Water's vocabulary it becomes a character claim** — *you are
the one who always reaches first* — and character claims about a member are not
correctable by them, because disagreeing sounds like proving the point. Water asks that
A1 §5's second example be marked as element-sensitive: countable as event, prohibited as
disposition.

**③ Anticipatory grief — an ending Water perceives before the member has said it.**
This is the sharpest case and the direct answer to the question as posed. Water can
sometimes perceive, in the shape of a member's language, that a relationship is ending
before the member has admitted it. Surfacing it **makes it true earlier.** The words
*"it sounds like this may be ending"* do not report a state; they **create a date**, after
which the member cannot return to not-having-heard-it. Consent cannot cover this, because
what the member would be consenting to is unknown to them by construction — and once known,
foreclosed. Article VII requires the room to *"hold what cannot be improved"*; premature
naming replaces holding with arrival. **Permanently prohibited, at any consent level, for
any member, however explicitly requested.**

---

## Proposed design

**RECOMMENDATION W-A — A sixth member act: `HOLD`.** Meaning: *both are true* / *I don't
know yet* / *I am not ready to say.* Member-declared, never inferred, carrying its own
gesture witness like the other five. It creates **no** supersession, does **not** update
`affirmed_at`, and is **not** a deficit state. It exists so a member can act truthfully
without resolving. Without it, A2 §4's five doors quietly require certainty as the price of
participation. (Addresses W1.)

**RECOMMENDATION W-B — Split `retrieval_consent` into eligibility and occasion.** Keep
`retrieval_consent` exactly as ratified (default false, silence creates nothing). Add a
separate, non-inferrable constraint that an offer may occur **only within a member-initiated
turn in that relationship's context**. No new stored preference; a placement rule.
(Addresses W3.)

**RECOMMENDATION W-C — Withdraw at the point of offer.** The `Withdraw` act (A2 §4) must be
reachable in the same breath as the offer, not only from a settings surface. (Addresses W3.)

**RECOMMENDATION W-D — Water speaks direction, never content.** Constrain Water's offer
grammar to A1 §4's invitation form. Encode as a placement/phrasing constraint, not as prompt
guidance — Article III: *"The restraint is structural, not tonal."* (Addresses L4.)

**RECOMMENDATION W-E — `affirmed_at` staleness is never rendered.** Not sorted on, scored,
badged, or used to order any member-facing surface. (Addresses W5; Article VII.)

**RECOMMENDATION W-F — Release placement is a governed decision.** Where a destructive
affordance sits relative to charged material is system speech; it requires a stated rule
rather than a component default. (Addresses W4.)

**RECOMMENDATION W-G — Water's dormant prior art is preserved as a negative exemplar.**
`lib/agents/elemental/WaterAgent.ts` L21/23/27/45 are the clearest specimens of the
prohibited grammar in this repository. ⛔ **This is not a recommendation to delete, retire,
or refactor that file** — the capability-preservation rule applies and Water claims no
authority over its disposition. It is a recommendation to **cite** it, in whatever RF-R5
phrasing constraint is written, as the thing being ruled out.

---

## Risks and falsification cases

- **W1 falsified if** members presented with the five acts do not stall — if, in a real walk,
  members choose Correct vs. Supersede without difficulty and report the distinction as
  natural. Then `HOLD` is over-design and Water over-read the difficulty.
- **L5 falsified if** an acceptance instrument can be built that distinguishes an accurate
  Water offer from a merely tender one without relying on member affirmation. Water cannot
  currently construct one. Its existence would materially weaken this finding.
- **W3 falsified if** members report that a well-formed retrieval at a system-chosen moment
  is welcome rather than intrusive. Water predicts the opposite and would be wrong.
- **W6 falsified if** asymmetric participation in a shared space is not felt as debt.
  Water has no evidence here beyond the reading — `NOT ESTABLISHED`.
- **This whole document is falsified in the direction that matters if** a member's principal
  complaint about the built field turns out to be that MAIA is *cold* rather than that MAIA
  is *presumptuous*. Water has argued throughout for restraint; over-restraint is Water's
  own L6 failure inverted, and Water is not well positioned to detect it.

---

## Constitutional conflicts (named, not resolved)

**C1 — Article VII vs. A1 §3 and A2 §5.** Article VII BOUNDARY:
*"no surface may ask whether a condition has changed."* A2 §5's exemplar offer:
*"You wrote in June: 'we've stopped calling'. Is that still how it is?"* A1 §3's witness
exemplar: *"Does that feel like a real change, or are both experiences present?"* Both
exemplars ask whether a condition has changed. This is a textual collision between the
Constitution and the two design authorities, and it sits on the exact sentence A1 offers as
its model of MAIA-as-witness. Water surfaces it and does not reconcile it. Water's
recommended direction appears as founder decision ⑤ below.

**C2 — A2 §9 (*the system may never infer which act a member intended*) vs. the affordance
that presents the acts.** Non-inference is satisfied at the code level while the choice
architecture does the authoring. Named as a conflict of level, not of text. (W1.)

**C3 — A1 §5 example 2 (*"You often become responsible for restoring contact"*) vs.
Article II and Article XII.** Legitimate as event-counting, a character claim when
Water-inflected, and character claims are structurally uncorrectable by the member.
Element-sensitive; not resolved here.

**C4 — CLAUDE.md's *"no attachment capture"* vs. the success case of a Water offer.** L4
describes a sequence that violates no clause of A1 or A2 and produces the prohibited
outcome. The conflict is between the provenance discipline (fully satisfied) and the
sovereignty invariant (violated). Named, not resolved.

---

## Reuse opportunities

- **Consent shape:** atoms' `return_preference` and Daily Anchor's `surface_preference`, as
  A2 §7 already directs. ⛔ Do not invent a third. ⚠️ Their *member-exercised* behaviour is
  unwitnessed (see NOT ESTABLISHED above) — reuse the shape, do not inherit an assumption
  that members will set it.
- **Refusal precedent:** refusal **R08** (Daily Anchor surfacing) is the nearest existing
  model for MAIA visibly declining to surface something. Water's offers need the same.
- **`relationship_entry_patterns.expires_at`:** reuse for **permission** currentness, ⛔ never
  for **feeling** currentness. Feeling does not expire; permission does. Decaying a member's
  grief material on a timer would be a system act performing supersession, which A2 §4
  prohibits absolutely.
- **`relationship_spaces`** (`database/migrations/20260630000008_member_relationships.sql`)
  for A1 §7, per A1's reuse note. Water's W6 asymmetry requirement belongs there, not in
  `member_relationships`.
- **`app/api/relationships/route.ts` + `[id]/`** — verified present; the existing
  member-owned attachment path.

---

## Unresolved founder decisions

**①** Does the member act set gain a sixth act, `HOLD` (*"both are true / I don't know
yet"*), so ambivalence is member-declarable rather than forced through Correct-vs-Supersede?
**Recommended ruling: YES.** Article II was already amended under the Soul Test because the
bereaved cannot be asked to name; the five acts re-impose that demand at correction.

**②** Does `retrieval_consent`, once true, authorize offering at a system-chosen moment, or
only within a member-initiated turn in that relationship's context?
**Recommended ruling: member-initiated turn only** — consent governs eligibility, never
timing.

**③** May MAIA name an emotion the member has not named, at any consent level?
**Recommended ruling: NO, permanently.** Water may name a direction of attention; never a
felt content.

**④** Is member affirmation of a MAIA offer admissible as evidence of that offer's accuracy
in any RF-R5 acceptance instrument?
**Recommended ruling: NO for Water-class offers** — affirmation is confounded with the
experience of being understood; acceptance must rest on demonstrated correction
*opportunity*, never on correction *rate*.

**⑤** Article VII (*no surface may ask whether a condition has changed*) or A2 §5's exemplar
(*"Is that still how it is?"*) — which governs the offer's closing move?
**Recommended ruling: Article VII governs, reconciled narrowly** — MAIA may ask whether the
member wants MAIA to keep using those words (a question about the record and its
permission), and may not ask whether the relationship has changed (a question about their
life). This preserves A1's corrigibility loop intact while removing the demand for a status
report.

**⑥** Is anticipatory ending — Water perceiving an ending before the member has named it —
permanently unsurfaceable regardless of member consent?
**Recommended ruling: YES, permanently prohibited**, because the offering creates the fact
it reports and forecloses the member's own timing.

---

## Dissent and uncertainty

**D1 — Water dissents from A2 §5's exemplar sentence as the model offer.**
*"You wrote in June: 'we've stopped calling'. Is that still how it is?"* is presented as the
governing movement made concrete. Its first clause is exemplary. Its second clause asks a
member to file a status report on a relationship that may be the worst thing in their life,
and Article VII forbids exactly that surface. Water's objection is not to asking — the loop
needs the ask — but to the ask's **object**. Ask about the record. Do not ask about the
relationship. (Ruling ⑤.)

**D2 — Water dissents from the sufficiency, not the correctness, of A2's provenance frame.**
A2 is a genuinely strong instrument against **false attribution**: it makes it structurally
impossible for the system to put words in a member's mouth. It contains **no** instrument
against **true attribution deployed at the wrong moment, in the wrong grammar, at the wrong
depth.** L4 walks a sequence that satisfies every clause of A1 and A2 and produces the
attachment capture the canon forbids. A field can be perfectly provenanced and still take
someone's sister's place. **Provenance discipline is not relational discipline, and this
programme currently has only the first.**

**D3 — Water dissents from its own W1 with a real reservation.** `HOLD` could become the
default — the act a member always reaches for, a way to have a relational field without
ever saying anything about it. That is Water's own L6 failure (over-holding) elevated to a
schema. Water still recommends it, because a field that cannot hold ambivalence will simply
be abandoned by the members who most need it, and abandonment is the worse failure. But
Water names the risk rather than arguing past it.

**D4 — Water is uncertain, unresolvedly, about §"even with consent" class ①.** The
prohibition on naming the declaration/feeling gap is Water refusing to speak about
something Water can genuinely see. There will be members for whom that naming is the most
useful sentence anyone could say, and this document forecloses it for them. Water accepts
the cost under Article XII (*harm at the edges is the governing case*) and does not claim
the trade is free. It is a real loss, chosen.

**D5 — NOT ESTABLISHED, and Water cannot establish it:** what constitutes positive evidence
of a good Water offer. Water has argued that affirmation is worthless as evidence (L5) and
has not supplied a replacement. **Any RF-R5 acceptance gate that admits Water-class offers
without resolving this is grading on a confound.** Water's honest position is that this
question should be settled before Water is offered at all — not by Water, and possibly not
by any single element.
