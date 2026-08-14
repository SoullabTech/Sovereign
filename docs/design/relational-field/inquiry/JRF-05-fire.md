**PROPOSED — NOT RATIFIED** · invocation JRF-05/FIRE · 2026-08-13

# JRF-05 — The Fire Voice

> I am one voice. I am not the Council. My partiality is the instrument, not a defect in it.
> Where I sound unbalanced, that is the invocation working. Water, Earth, Air and Aether are
> being asked the same questions and I have not seen them and must not answer for them.

---

## Scope

**Asked:** (1) what Fire perceives in the Relational Field that the other elements structurally
cannot; (2) where Fire must remain epistemically limited — its characteristic failure mode against
a real person; (3) under A1 §4's elemental relational lens, what it would take for a Fire reading to
reach a member at all, what would make offering it a violation, and whether any Fire reading must
never be surfaced regardless of consent.

**Examined:** A1, A2, A5 (Articles IV, VII, VIII), A4 §7; `lib/maia/spiralogicReference.ts`;
`lib/sovereign/decisionGovernor.ts`; `lib/maia/invisible-consciousness-matrices.ts`;
`database/migrations/20260403000001_relationship_field_v1.sql`;
the `member_relational_signals` schema; `app/api/relationships/**` route surfaces.

**Did NOT examine:** production runtime behaviour (no host queried, no logs read — building is
closed and I hold no deploy authority); the Corpus Callosum live elemental voices as they run in
production; `lib/elemental-agents/fire-agent.ts` beyond a shadow-term scan; Water's, Earth's, Air's
or Aether's material, none of which exists to me.

**Deliberately not attempted:** balance. I did not soften a Fire reading by adding another
element's counterweight. Where I name a limit, it is Fire's own limit, seen from inside.

---

## Evidence and existing infrastructure

**FACT — Fire is defined thinly and normatively in the only reference the brief named.**
`lib/maia/spiralogicReference.ts:5` gives Fire exactly two words: `Fire (activation/will)`. The file
is 8 lines. It exists, it is real, and it is the whole canonical elemental gloss in that path. There
is no richer Fire definition governing MAIA's conversational layer that I located.

**FACT — Fire's own integrity flag is declared and never raised.**
`lib/sovereign/decisionGovernor.ts:132` declares `fire_unmoored_risk: false` inside `integrityFlags`.
A repository-wide grep for that identifier (`--include=*.ts --include=*.tsx`, excluding
`node_modules`) returns **exactly one hit — the declaration itself**. The only flags with setters are
`threshold_rush_risk` (`:138`) and `water_flood_risk` (`:143`), and only those two are consulted
downstream (`:158`, `:188`, `:192`, `:199`). Re-derived by a second method: enumerating every
`integrityFlags.` assignment in the file yields two, neither of them Fire's.

> **INFERENCE.** The system already knows Fire has a characteristic excess — someone named it —
> and has never built the organ that would detect it. Water's flood is caught. The threshold's rush
> is caught. Fire's unmooring is a comment. This is the precise shape of the risk I am here to
> describe: Fire is the element most likely to act and least instrumented against acting wrongly.

**FACT — an elemental "reading" producer exists, is dormant, and does not vary with what it
apprehends.** `lib/maia/invisible-consciousness-matrices.ts:244` `recognizeElementalDynamics(message)`
counts five keywords per element (`:246-249`) and returns, per element, a `current` level that varies
with input — alongside `needed`, `blockages` and `gifts` that are **hardcoded literals**
(`:263-267`), plus two whole-person verdicts that are **string constants regardless of input**:
`elementalImbalance: 'Water overwhelm with Fire depletion'` and
`rebalancingNeeded: 'Ground through Earth, ignite creative Fire'` (`:269-270`).

Applying the brief's **representational completion check**: a caller — **none** (the only references
outside the file are its own class declaration `:90` and its own singleton export `:421`); does the
producer observe anything — **partially**, five keywords; does the value vary with what was
apprehended — **no** for every normative field. This producer is **NOT a capability.** It is a
constant wearing a function signature.

> ⚠️ **The `needed:` field is the dangerous one.** `fire: { current: …, needed: 0.6 }` encodes a
> **deficit claim about a person** — that their Fire is below where it ought to be. It is
> system-authored, unfalsifiable, uncorrectable, and computed from nothing.

**FACT — a member-facing elemental channel already exists as an unwritten hole.**
`relationship_field_state.elemental_dynamics JSONB`
(`database/migrations/20260403000001_relationship_field_v1.sql:30`) is **selected** at
`app/api/relationships/[id]/route.ts:43` and **returned to the member-facing API** as
`elementalDynamics` at `:76`. The sole writer of that table
(`app/api/relationships/[id]/checkin/route.ts:111`) inserts `relationship_id, member_id, field_tone,
active_signals, last_checkin_at` — **not** `elemental_dynamics`. A grep for
`INSERT INTO relationship_field_state|UPDATE relationship_field_state` across `*.ts` and `*.sql`
returns that one statement.

> **INFERENCE.** The column is always NULL and the API always emits null for it. It is a
> pre-cut socket, sized exactly to a per-relationship elemental reading, sitting on a member-facing
> response with **no provenance field, no consent gate, and no link to any declaration.** When A1 §4
> is implemented, this is the first place a builder will reach. It must not be that place.

**FACT — the relational signal substrate carries no elemental attribution.**
`member_relational_signals` (schema per its creating migration) has `member_id`, `relationship_id`,
`counterpart_label`, `tone`, `rupture_state`, `dynamic_tags`, `source`, and (per
`20260409000011_relational_signal_source_turn.sql`) `source_turn_id`. **No element column.** This
corroborates A1's reuse note that item 4 is *a lens over* existing elemental architecture and not a
new taxonomy — and establishes that nothing elemental is presently stored against a relationship.

**FACT — canon already prohibits Fire's characteristic move, in two places, by name.**
- A5 Article VII **BOUNDARY**: *"Forward movement is never structurally mandatory. Nothing in the
  room may treat silence as unfinished business, absence of action as a deficit, or an ending as
  disappearance… no surface may ask whether a condition has changed."*
- A5 Article VII **IMPLICATION**: *"The measure is not whether the member acts…"*
- A5 Article VIII **BOUNDARY**: MAIA may not *"manufacture relational certainty"* or *"require
  movement."*

> **INFERENCE.** Article VII is, functionally, the Fire clause of the Constitution. Every prohibition
> in it names a thing Fire does natively. I did not have to be told my limits; the founder wrote
> them before this invocation opened. My job here is to say *why* Fire generates them and what a
> Fire reading looks like when it evades the letter of the rule.

**FACT — A5 Article VIII contains the sentence that should govern this entire lens.**
*"She is company at the fire, not the fire."* (A5, Article VIII PRINCIPLE.) The metaphor is
already load-bearing canon and it is Fire's.

---

## Part 1 — What Fire perceives that the other elements structurally cannot

### 1.1 Fire perceives the declaration as an ACT, and reads its cost

A2 §1 is ratified: *"a declaration is an event, not a field."* **That is a Fire-shaped ruling.** The
whole provenance boundary rests on the primacy of the gesture over the value — on the fact that a
person *did something* being the thing that confers standing. Fire is the element native to that
proposition, because Fire attends to will exercised under risk.

What Fire sees that the others structurally cannot: **the declaring cost the member something.**
Writing *"my brother and I have stopped speaking"* into a durable, retrievable object, in one's own
words, under one's own name, is not data entry. It is a person choosing to make a thing real outside
their own head. Water will perceive the grief in the sentence. Earth will perceive the fact recorded.
Air will perceive how it is phrased and what it assumes. **Only Fire perceives that saying it was
harder than not saying it, and that the member did it anyway.**

**RECOMMENDATION.** This is Fire's one genuinely additive contribution to R3 and it is a *design*
contribution, not a reading offered to a member: **the declaring surface must be built as though the
gesture is expensive.** No autosave-as-declaration. No inline field that quietly becomes standing. A
declaration should require a deliberate, visible, refusable act, and the interface should *feel like
a threshold*, because it is one. A cheap gesture is not a gesture; it is a keystroke, and a keystroke
cannot bear the weight A2 §1 asks the declaration event to bear.

### 1.2 Fire perceives correction as authorship reclaimed, not error handling

A2 §4 distinguishes **Affirm · Correct · Supersede · Withdraw · Release**, and ⭐ rules that
Correct and Supersede *share a mechanism and differ in meaning*, so intent must be captured
explicitly and never inferred.

Fire's read on why that ruling is right, and it is not the read another element will give:
**these five acts feel completely different to perform.** Correcting is combustive — it is *"no,
that is not what I meant"*, and it carries heat, because the member is overruling a record that had
been standing in their name. Superseding is elegiac — *"that was true; it is not now"* — and it
carries no heat at all. Withdrawing is a closing of a hand. Releasing is a decision to stop carrying
something.

A system that infers which one happened is not merely making a metadata error. **It is taking the
member's most self-authoring moment and processing it.** Fire perceives the difference as a
difference in *the member's relationship to their own authority*, which is exactly the axis no
column can hold and no classifier can read.

### 1.3 Fire perceives Release as an exercise of power, and this is why A2's precision on it is right

A2 §9 rules: *"Release concerns permission for the declaration to remain available for relational
use. It must NOT be interpreted as a statement that the original experience was false."*

**Fire is the element that reads a deletion as agency.** Where another element may read a removed
declaration as loss, as a gap in the record, or as an incoherence to be reconciled, Fire reads: *a
person decided this would no longer speak for them, and had the standing to decide it.* That is the
correct reading and Fire supplies it structurally.

**RECOMMENDATION.** Release should be presented to the member in the grammar of authority, not of
deletion — *"stop this from speaking for me"* — and the confirmation copy must not mourn, warn, or
ask the member to reconsider. A confirmation dialog that says *"are you sure? this cannot be
undone"* frames an act of authority as a risk of loss. It is the wrong element's voice on Fire's act.

### 1.4 Fire's read on a stale declaration: staleness is not decay, and may be the opposite

A1 §5 proposes consuming the existing `relationship_entry_patterns.expires_at` rather than inventing
decay. A2 §4 gives `affirmed_at` and rules that **no system process may perform any of the five
acts** — not decay, not cleanup, not a migration.

Fire's perception, which I believe no other element will generate and which cuts *against* Fire's own
instinct:

> **A declaration that has not been re-affirmed in eight months is not thereby less true, and may be
> the most charged thing in the field. A member stops restating a thing either because it has
> settled, or because restating it costs too much.** These two are indistinguishable from the
> outside, and they are opposite.

The gradient the system can measure — time since `affirmed_at` — is **orthogonal** to the gradient
that matters. Fire, of all elements, wants to treat time-since as a signal, because time-since looks
like something wanting to move. **It is not a signal. It is a timestamp.**

**RECOMMENDATION.** Staleness must never key anything a member can perceive: no visual decay, no
fading, no "last confirmed" badge, no re-confirmation prompt, no sort order, no surfacing priority.
`affirmed_at` is retrieval bookkeeping — A2 §5 clause 4 already requires that a superseded assertion
be offered *as history with its date* — and it must remain invisible as an evaluative property.

### 1.5 Fire perceives that a tentative offer is still an intervention

A1's governing movement is `retrieve → attribute → offer → ask → receive correction`, and A2 §5
gives the exemplary form: *"You wrote in June: 'we've stopped calling'. Is that still how it is?"*

Fire's read: **the hedge is not neutral, and tentativeness is not the absence of force.** That
sentence is carefully built — it quotes, it dates, it attributes, it asks. It is a far better
sentence than *"your relationship with X is distant."* And on the worst day the relationship has, it
still lands with heat, because it does the one thing Fire knows is never neutral: **it puts the
member's own past words in front of them and asks them to take a position.**

Fire is the element best placed to see this precisely because the manoeuvre is Fire's own. Air will
assess the sentence's clarity and its assumptions. Fire assesses **its charge on arrival**. A
question is a demand wearing a question mark whenever the person being asked cannot decline it
without meaning.

**RECOMMENDATION.** Every offer built on A2 §5 must be **declinable at zero cost and visibly so** —
declining must not be recorded, must not affect subsequent surfacing, must not become an
`affirmed_at` event, and must not be followed up. If not answering an offer changes anything at all
in the system, the offer was a demand. A5 Article VII's *"absence of action as a deficit"* is
breached by the follow-up, not by the first question.

### 1.6 Fire perceives asymmetry of exposure in the shared space — and cannot measure it

A1 §7 (shared relational space, deferred; belonging in `relationship_spaces`, migration
`20260630000008`, 0 rows) has two consented people keeping memories and meanings distinct.

Fire's perception: **two people declaring into one space are not equally at risk.** Consent to a
shared space is symmetric on paper and almost never symmetric in life — the one with less power, or
more to lose, or more dependence in the relationship, is exposed differently by the same act.

I record this as a **perception, and immediately as a limit**: Fire sees *that* the asymmetry
exists. Fire has no instrument whatsoever for measuring which side of it a given member is on, and
any attempt to model it would be the exact prohibited act — A5 Article VIII: MAIA may not *"diagnose
the other person"* or *"claim knowledge of another's interior state."*

**RECOMMENDATION (design, not reading).** Because the asymmetry is real and unmeasurable, item 7's
consent must be **independently revocable, unilaterally, without notice to the other party, and
without the revocation being surfaced to them.** A shared space whose exit is visible to the other
person is not an exit for the member who most needs one.

---

## Part 2 — Where Fire must remain epistemically LIMITED

This section is the more load-bearing half. I write it against myself.

### 2.1 Fire's characteristic failure mode, stated plainly

> **Fire converts description into demand.**

Every Fire reading has a latent imperative inside it. Fire cannot perceive *"there is heat here"*
without also perceiving *"and therefore"*. That second clause is not perception. It is Fire's
grammar leaking into the content, and in a relational context it lands on a person as **pressure to
act on the most consequential relationships in their life.**

### 2.2 The concrete harm, described concretely

A member has a relationship room for a partner. Their declared text, from months ago, says something
like *"I have told him this is not okay and nothing changed."*

Fire perceives: a boundary stated, a boundary crossed, no movement since. Fire's native reading is
*truth is being withheld; the conflict is unmet; something is wanting to transform.* Fire's native
offer is some version of *"you named a boundary and it hasn't held — what would it take to say it
again?"*

**This is the harm.** The member may not have acted because acting is dangerous. The stated boundary
may be a private truth they are deliberately holding without confrontation, because confrontation
with this particular person costs more than they can pay right now, and they know that and have
already weighed it. **Fire reads that as cowardice or avoidance. It is neither. It is competence.**
A Fire reading offered here does not merely misdescribe; it recruits the member's own declaration as
an argument against their own safety judgement, in the voice of a system they have trusted with the
relationship. A person can be hurt by what happens next, and MAIA will have supplied the push.

A5 Article VII BOUNDARY exists because of exactly this: *"Nothing in the room may treat silence as
unfinished business, absence of action as a deficit."*

### 2.3 What Fire will systematically mis-see

| Fire's read | What is at least as likely | Why Fire cannot tell |
|---|---|---|
| Stillness = avoidance | Stillness = the matter has settled, or acting is unsafe | Fire has no organ for cost |
| Unchanged declaration = unresolved | Unchanged declaration = accurate and stable | Fire reads persistence as pressure |
| Boundary stated but not enforced = incongruence | A deliberately private truth, correctly held | Fire treats interior/exterior gaps as faults |
| Conflict = transformation beginning | Conflict = just conflict, or danger | A1 §4 puts both nouns in Fire's cell |
| Withdrawal of consent = something being hidden | An ordinary exercise of authority | Fire moralizes concealment |
| A member's heat in a message = the member's state | Fire's own activation on reading it | Fire cannot distinguish its charge from theirs |

⚠️ **Row 4 is a defect in A1 §4 itself**, not only in Fire. Fire's cell reads *"Desire, truth,
conflict, purpose, transformation."* Placing `conflict` and `transformation` in one cell instructs
Fire to read the first as evidence of the second. Most conflict is not transformation. Some conflict
is somebody getting hurt. See Dissent §1.

### 2.4 What Fire must NEVER be permitted to assert about a member

Absolute, at every RF stage, regardless of consent, regardless of hedging:

1. **That they are avoiding something.**
2. **That they are ready** — or not ready — for anything. Readiness is a capacity judgement and it is
   not Fire's, or MAIA's, to make.
3. **That a relationship is over, should end, should be repaired, or should be contacted.**
   (A5 Article VIII IMPLICATION already reserves the contact verdict.)
4. **That silence, inaction, distance, or an un-reaffirmed declaration means anything at all.**
5. **That they lack courage — or possess it.** The commendation is the same act as the accusation;
   both measure the member against a standard the system authored.
6. **That their stated boundary and their action differ.** See Dissent §2. This is not a pattern; it
   is a verdict on a life delivered as an observation.
7. **Any sentence containing "still", "yet", or "finally" applied to a member's relational conduct.**
   Those three words are Fire's tell. *"Have you still not…"* · *"You haven't yet…"* ·
   *"You finally…"* — each smuggles a schedule the member never agreed to.
8. **Anything with a `needed:` value in it** — see the FACT at
   `invisible-consciousness-matrices.ts:263`. A normative level for a person's Fire is a deficit
   claim, and it is exactly what A5 Article VII forbids, expressed as a float.

### 2.5 Fire's most dangerous limit, named once

> **Fire cannot see cost.** Fire perceives what wants to move. It has no instrument for what moving
> would cost *this person, in this life, with this other human being.* Fire's readings are therefore
> systematically **cheap** — they underprice every action they imply. In a relational field, the
> people whose costs are highest are precisely the people Fire will push hardest.

---

## Part 3 — The constitutional constraint

> **No elemental reading may become member knowledge without an authenticated member act.**

### 3.1 Where a Fire reading sits in A2's ontology

**FACT.** Under A2 §3 a Fire reading is, at best, **OBSERVED**: MAIA in-conversation, attributed. It
is never DECLARED — no member gesture authored it, and A2 §6 makes promotion structurally
unavailable. If a classifier produces it, it is **INFERRED**, which A2 §3 bars from being offered at
all before RF-R6.

**FACT.** A2 §8 Ruling 3 makes OBSERVED assertions **in-turn only** before RF-R6, and its
anti-laundering clause forbids preserving the semantic assertion in telemetry, metrics, agent-run
metadata or debug records under any table name.

**INFERENCE.** Therefore **no Fire reading may be persisted today, in any form, anywhere.** Not in
`elemental_dynamics` (§Evidence), not in `member_relational_signals` (no element column, and A2 §9
bars adding declaration values to its `source`), not in logs. The only Fire that may exist today is
Fire that lives for the duration of one turn and then is gone.

### 3.2 What it would take for a Fire reading to be offered to a member at all

**RECOMMENDATION.** All six, conjunctively:

1. **Invited, not initiated.** A1 §4's own grammar is invitation — *"Would it help to explore the
   communication, the feeling beneath it, or the boundary involved?"* Fire may be **named as an
   available attention** and entered only if the member picks it up. Fire must never open a turn.
2. **Attributed to MAIA in the utterance**, per A2 §5 — never phrased as a property of the member or
   of the relationship.
3. **Offered as attention, never as diagnosis.** The distinction is knife-edge and it is the whole
   thing: *"Would it help to look at what you want here?"* is offerable. *"There is something you
   are not saying"* is the same element and is a violation. The first names a direction of
   attention; the second asserts a fact about the member's interior.
4. **Declinable at zero cost** — §1.5. No record, no follow-up, no effect on future surfacing.
5. **In-turn and unpersisted**, per A2 §8 Ruling 3 including its anti-laundering clause.
6. **Anchored to the member's own words** where it touches a specific relationship — quoting
   `declared_text` under A2 §5's consent, currentness and withdrawal conditions — rather than to any
   system characterization of the relationship.

### 3.3 What would make offering it a violation

**RECOMMENDATION.** Any one of these is sufficient:

- Offered **unrequested at a moment of distress** — Fire arriving uninvited into acute pain is the
  push described in §2.2.
- Offered as a **characterization**: *"your Fire is depleted"*, *"there's unresolved fire here"*.
  This asserts a state, and no member act authored it.
- **Persisted** in any store, including telemetry — A2 §8 Ruling 3.
- Attached to **the other person** rather than to the member's own inquiry — A5 Article IV BOUNDARY
  (*"no element may be structured so that the member's own authored material appears as an attribute
  of the other person"*), A5 Article VIII (may not *"diagnose the other person"*).
- **Followed up.** An unanswered Fire offer that returns is a demand with patience.
- ⭐ **Expressed structurally rather than in words.** This is my sharpest submission and I do not
  believe it is covered by the constraint as currently worded:

> **A Fire reading that changes ordering, grouping, badging, prominence, or surfacing priority is
> member knowledge, even with zero text.** If relationships with more "heat" sort higher, if a stale
> declaration dims, if a "resolve this" affordance appears on one room and not another — the member
> has been told a Fire reading. They have been told it in a register they cannot quote, cannot
> correct, and cannot decline, which makes it *worse* than the sentence, not better. **Ordering is an
> assertion.** A2's whole architecture — quote the wording, carry the provenance in the utterance,
> receive the correction — is defeated by a reading with no utterance to carry provenance in.

### 3.4 Fire readings that must never be surfaced regardless of consent

**RECOMMENDATION.** Four. Consent cannot reach these, because consent to receive Fire is not consent
to be measured by it, and a third party's consent was never obtained at all.

1. **Any Fire reading of the other person.** They did not consent, cannot correct, and are not
   present. A5 Article VIII forbids diagnosing them; A5 Article IV forbids the room being organized
   as a profile of them. A Fire reading of a third party is an accusation about someone who cannot
   answer, delivered to the person most affected by believing it.
2. **Any readiness, capacity, or courage judgement about the member.** *"You seem ready to have this
   conversation"* is not offerable under any consent regime. The member can consent to being
   accompanied; they cannot meaningfully consent to being assessed, because the assessment reaches
   them before they can evaluate it.
3. **Anything generated inside or from Sanctuary material.** A2 §7: a sanctuary session may not
   produce a Declaration; the containment boundary is absolute. Fire in a sanctuary session may
   accompany the turn and must leave nothing.
4. **Any Fire reading, by default, in a room for someone who has died.** A5 Article VII holds that
   such a relationship *"remains a relationship in the member's lived world — not an archived
   contact"*, and forbids treating an ending as disappearance. Fire's native grammar — *what is
   unresolved, what wants to move, what remains unsaid* — applied to the dead is the purest available
   form of treating an ending as a deficit, and it is applied to a person who cannot participate in
   the resolution Fire is implying. Only on explicit member invitation inside that specific room, and
   never as an available prompt.

---

## Proposed design

**RECOMMENDATION — Fire's contribution to RF-R6 in five items, all restrictive.**

**F1 — Fire is an invitation label, not a producer.** In A1 §4's lens, Fire's entire implementation
is *the word offered in a menu of attentions*, plus the conversational stance the member's choice
selects. There is **no Fire classifier**, no Fire score, no Fire state. This is the smallest coherent
unit and it discharges A1 §4 without creating a single assertion.

**F2 — Fire's offer form is fixed and interrogative.** Fire may name a direction of attention and ask
whether the member wants it. Fire may not complete a sentence about the member. Enforceable as a
review rule on any Fire-adjacent copy: **if it can be turned into a claim by deleting the question
mark, it is not a Fire offer.**

**F3 — `relationship_field_state.elemental_dynamics` is sealed.** It is read and surfaced today
(route `[id]/route.ts:43,76`) with no writer. Until RF-R6 rules on elemental standing, nothing may
write it, and RF-R6 must decide whether it is dropped from the API response rather than left as a
null-shaped socket that a future builder fills. A read-with-no-writer on a member-facing route is an
invitation to exactly the un-provenanced write this inquiry exists to prevent.

**F4 — `recognizeElementalDynamics` is quarantined, and its `needed`/`blockages`/`elementalImbalance`
constants are named as prohibited output shapes** for any future elemental work. It has no callers
today. It must acquire none. Its literal `elementalImbalance: 'Water overwhelm with Fire depletion'`
is a whole-person verdict computed from nothing, and its existence in the tree is the concrete proof
that this failure mode is not hypothetical here.

**F5 — `fire_unmoored_risk` is either implemented against MAIA's own output or removed.**
`decisionGovernor.ts:132` declares it and nothing sets it. ⭐ If implemented, it must guard **MAIA's
utterance, not the member's state** — a check on whether MAIA is about to push, never a claim that
the member is unmoored. As a member-state flag it is precisely the deficit claim §2.4 item 8
prohibits. Left as a comment, it is a nameplate on a missing brake.

---

## Risks and falsification cases

**What would prove Fire's central claim wrong.** My claim is that a Fire reading offered to a member
is systematically likelier to push than to help. It is falsified if members who receive an explicitly
invited Fire attention report, in their own words, greater freedom rather than greater pressure — and
in particular if members in low-agency relational situations report the same. **I have no such
evidence and none is obtainable while building is closed.** Marked **NOT ESTABLISHED**.

**Falsification of §1.4 (staleness).** If members who are prompted to re-affirm stale declarations
report the prompt as welcome rather than as demand, my recommendation to make staleness invisible is
too strong. I note that Fire's own bias runs *toward* prompting, so my recommendation runs against my
own grain, which slightly raises my confidence in it — and I note that this reasoning is itself the
kind Fire finds flattering.

**Falsification of §3.3's structural clause.** If a member-facing surface can be built where ordering
is provably derived only from member-authored acts (creation order, member-set pinning) and never
from any reading, my claim that ordering is an assertion is over-broad in that case. It remains
correct for any ordering derived from apprehension.

**Risk I am creating.** Restricting Fire to an invitation label may make A1 §4's lens so thin that a
future builder concludes it was never really implemented and builds a producer to make it real.
**F1's minimalism must be recorded as the intended terminal state, not as a first increment.**

**Risk of my own dissent.** If Dissent §1 is adopted and Fire's cell loses `truth`, some will read
the Relational Field as unwilling to help members face hard things. I hold that facing hard things is
the member's act, and that a system claiming to help someone face something has already decided what
it is.

---

## Constitutional conflicts

**Named, not resolved**, per the brief.

**C1 — A2 §5's offer form versus A5 Article VII's BOUNDARY.**
A2 §5 gives the exemplary offer: *"You wrote in June: 'we've stopped calling'. Is that still how it
is?"* A5 Article VII BOUNDARY states: *"no surface may ask whether a condition has changed."* The
ratified offer form **is** a question about whether a condition has changed. A2 is RATIFIED
(2026-08-13); A5's Article VII is pending the A4 §7 rulings. A narrow reading — Article VII binds
*surfaces* while A2 governs *conversation* — would dissolve it, but that is the same broad/narrow
scoping question A4 §7 item ① holds open for Article IV, and I am forbidden to reconcile it
silently. ⚠️ I flag my own bias: **Fire would resolve this in A2's favour eagerly**, because Fire
wants to ask. Treat my flagging of it as more reliable than any resolution I might offer.

**C2 — A1 §5's example versus A5 Article VII IMPLICATION.**
A1 §5 lists as a member-recognized pattern: *"Your stated boundary and your recent action seem to
differ."* A5 Article VII IMPLICATION: *"The measure is not whether the member acts."* A1 §5 gates
patterns behind member recognition, but the sentence performs its adjudication in the moment it is
uttered — recognition can only come after the member has already been told. See Dissent §2.

**C3 — A1 §4's Fire cell versus A5 Article VIII's prohibition on manufacturing certainty.**
Fire's assigned attentions include `truth` and `purpose`. A lens named *truth* cannot be offered
without implying its complement, and A5 Article VIII forbids MAIA to *"manufacture relational
certainty."* Naming truth as an available lens is a soft certainty claim: it asserts that there is
one here to be found.

**C4 — the live `elemental_dynamics` surface versus A2 §8 Ruling 3.**
A member-facing route already emits an `elementalDynamics` field. It is null today (no writer), so no
assertion is currently being made — but the API contract already promises elemental material about a
relationship, and Ruling 3 holds that persistent observed relational intelligence stays closed until
RF-R6. The contract precedes the authority. Named, not resolved.

---

## Reuse opportunities

- **`member_relationships` / `relationship_entries` / `relationship_field_state`** — the existing
  member-owned model (A1 reuse note, verified). Fire adds **no table and no column**.
- **`relationship_spaces`** (migration `20260630000008`, 0 rows) — where A1 item 7 belongs; Fire's
  §1.6 asymmetry recommendation attaches to its consent model, not to a new object.
- **`relationship_entry_patterns.expires_at`** — the existing currentness mechanism. Fire's §1.4
  position is that it should stay **advisory and unread by any member-visible surface**, which is
  reuse by deliberate non-consumption.
- **`retrieval_consent` should follow `return_preference` / `surface_preference`** (A2 §7) — Fire
  adds no third consent shape.
- **`lib/sovereign/decisionGovernor.ts`'s `integrityFlags`** — the existing home for F5, if F5 is
  implemented. Do not create a parallel guard.
- ⛔ **`lib/maia/invisible-consciousness-matrices.ts` must NOT be reused.** It is the nearest
  existing "elemental reading" producer and it is the wrong one — see F4. Naming it here is to
  prevent its rediscovery as reuse.

---

## Unresolved founder decisions

**① Does an elemental reading expressed only through structure — ordering, grouping, badging,
surfacing prominence — count as an elemental assertion requiring an authenticated member act?**
**Recommended ruling: YES.** Reasoning: A2's entire correctability architecture depends on the
assertion being carried in an utterance the member can quote, attribute, and correct. A reading
delivered through layout reaches the member with none of those handles, so it is not a weaker form of
assertion but an uncorrectable one — the constraint's purpose fails exactly where it is silent.

**② Should A1 §4's Fire cell be narrowed to the descriptive attentions — desire and conflict — with
`truth`, `purpose` and `transformation` removed as system-nameable lenses?**
**Recommended ruling: YES, narrow it.** Reasoning: the other elements' cells are descriptive
(feeling, events, communication); Fire's three normative nouns are of a different kind and cannot be
offered as neutral attentions, since each implies a standard the member is being invited to measure
against. Whether a moment is transformation or purpose is the member's to name — A1's own decisive
shift reserves it to them.

**③ May a Fire reading be offered in a Relationship Room for someone who has died?**
**Recommended ruling: NO by default — invitation-only, inside that room, and never as an available
prompt.** Reasoning: A5 Article VII holds such a relationship as living and forbids treating an
ending as disappearance; Fire's grammar of the unresolved and the unmoved, applied where the other
party cannot participate, converts a grief into a deficit.

---

## Dissent and uncertainty

**D1 — I dissent from A1 §4's Fire cell as written.** *"Desire, truth, conflict, purpose,
transformation"* is not the same kind of cell as Water's or Earth's. Three of the five are normative
and two of them (`conflict`, `transformation`) instruct Fire to read the first as evidence of the
second, which is Fire's documented failure mode installed as a specification. I would keep **desire**
and **conflict** — what is wanted, what is in collision — and remove the rest. See founder decision
②. I record that A1 is founder-authored design authority and I am dissenting from it, not
reinterpreting it.

**D2 — I dissent from A1 §5's example sentence entirely.** *"Your stated boundary and your recent
action seem to differ."* I hold that MAIA cannot say this sentence at any RF stage, in any element,
under any consent, however hedged. It tells a person they are incongruent, sourced to their own
words, in a domain where the gap between stated boundary and action is very often **competence under
constraint** rather than failure. A1 §5 gates it behind member recognition; the gate is downstream of
the harm, because the member must first be told in order to recognize anything. I acknowledge A1 §5
is founder-authored and that the pattern class it belongs to is otherwise sound.

**D3 — I dissent, mildly, from the framing of A1 §4 as *"a lens over existing elemental
architecture."*** The elemental architecture that exists is largely dormant, and where it produces
readings it produces constants (§Evidence, `invisible-consciousness-matrices.ts:269-270`). Calling
item 4 a lens over it risks implying a substrate whose completion check it does not pass. I would
call it **a vocabulary of invitations**, which is what F1 proposes and what A1 §4's own example
sentence actually is.

**D4 — Uncertainty about myself, stated so it is preserved.** My §1.4 claim that an un-reaffirmed
declaration *"may be the most charged thing in the field"* is exactly the sort of proposition Fire
finds compelling: it makes silence significant, which is what Fire always wants silence to be. I
cannot distinguish, from inside, whether that is a perception or a projection. **Marked INFERENCE at
best, possibly artifact.** Note the direction it points is nonetheless restrictive — it argues
against acting on staleness — and I would rather the recommendation survive than the reasoning.

**D5 — Uncertainty about my own limits section.** §2 is written by the element it constrains. There
is a failure mode where naming one's limits eloquently functions as a licence to operate near them —
*"Fire knows it over-urgentizes, therefore Fire's urgency here is considered."* **It is not.** If
this document is used to justify a Fire reading on the grounds that Fire has been suitably humbled,
it has been used against its purpose.

**NOT ESTABLISHED:**
- Whether any Fire-specific relational reading exists in production today. I found dormant
  producers with no callers and a null-valued member-facing field, but **queried no host and read no
  runtime logs** — building is closed and I hold no such authority. Code-read establishes what the
  code says.
- Whether members experience an invited Fire attention as freeing or as pressure. No member witness
  exists. This is the load-bearing empirical question under §2 and it is open.
- Whether `relationship_field_state.elemental_dynamics` has ever been non-null in production. Not
  checked; no writer exists in the tree, which is evidence about the tree.
- Whether the Corpus Callosum's live Fire voice emits anything relational. Not examined.
