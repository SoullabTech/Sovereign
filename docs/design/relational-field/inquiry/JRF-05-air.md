**PROPOSED — NOT RATIFIED** · invocation JRF-05/AIR · 2026-08-13

# JRF-05 — Air: the structure of what is said

> Air is `perspective/mind` in this system — FACT, `lib/maia/spiralogicReference.ts:5`.
> In A1 §4 its relational attention is *"Communication, assumptions, interpretation,
> misunderstanding."* This file attends to **distinction, articulation, naming, and the
> structure of what is said** — and to where that attention systematically mis-sees.

---

## 1. Scope

**The question given:** (a) what Air perceives in the Relational Field that other elements
structurally cannot — specifically whether A2's distinctions are clean, collapsible, or
overloaded; (b) where Air must remain epistemically limited; (c) the constitutional
constraint on any elemental reading becoming member knowledge.

**What I did not examine:** the rupture-containment traffic witness (precondition 1); the six
Constitution rulings' incorporation (precondition 2); the schema of `member_relationships`,
`relationship_entries`, or `relationship_spaces` beyond existence; any UI surface; the other
four elemental readings, which I cannot see and do not speak for. I read A1 and A2 in full,
A4 §7, Invariant 14, and the containment code at three refs.

**I am one voice.** Nothing here is balanced, and it is not meant to be.

---

## 2. Evidence and existing infrastructure

**FACT** — `lib/maia/spiralogicReference.ts` exists (619 bytes); line 5 defines
`Air (perspective/mind)`. The elemental vocabulary is real and pre-existing, consistent with
A1's *"Elemental architecture already exists project-wide; item 4 is a lens over it, ⛔ not a
new taxonomy"* (A1:176).

**FACT** — A4 and A5 both exist at the paths A1 asserts:
`docs/governance/RELATIONSHIP_ROOM_CONSTITUTION_RATIFICATION_BRIEF_2026-08-13.md`,
`docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md`.

**FACT** — the containment is real code, not a design intention. At production `22200f967`,
`lib/relationships/relationshipSignalService.ts:169`:

```
const DECLARATION_CAPABLE_SOURCES: ReadonlySet<string> = new Set();
```

with the gate at :178 and again at read, :285. The write path fails closed:
`const ruptureState = DECLARATION_CAPABLE_SOURCES.has(source) ? safeRupture(...) : null`.
`git log -1 22200f967` → *"fix(relational): contain inferred rupture state at write and at
read"*, dated 2026-08-13. Three test assertions in
`lib/relationships/__tests__/ruptureContainment.test.ts` pin the empty set by source-text
regex — i.e. the emptiness itself is asserted, not merely the behaviour.

**FACT** — `22200f967` **is** `origin/clean-main-no-secrets` and `origin/HEAD`. It is an
ancestor of remote trunk. The containment is on trunk.

**FACT — recorded as a correction against myself (see §5.1).** My first derivation concluded
the opposite. `git merge-base --is-ancestor 22200f967 clean-main-no-secrets` returned NO, and
`git grep` for the symbol on `clean-main-no-secrets` returned nothing. Both were true
statements about a **stale local ref** (`clean-main-no-secrets` = `f9a7326f1`, 2026-08-03).
The working branch `feature/labtools-redesign` (`d41b8b355`) diverged at `7c9dd5192`
(2026-08-01) and predates the containment, which is why the symbol is absent from this
working tree. **There is no governance defect here.** I nearly filed one.

**FACT** — three sibling directories exist whose names are near-synonyms: `lib/relational/`
(`relationalStance.ts`, `developmentalStateAdmission.ts`), `lib/relationship/` (`scope.ts`),
`lib/relationships/` (the signal/context services). Air notes this without claiming defect:
adjacent names, distinct referents.

**NOT ESTABLISHED** — whether any member-facing surface currently renders elemental
vocabulary in a relational context. I did not search UI components; absence is unknown, not
disproven.

---

## 3. What Air perceives — the distinctions, examined

A2's central move (*a declaration is an event, not a field*) is, in Air's judgment, **correct
and load-bearing**. Grounding eligibility in the existence of a record rather than the value
of a column is the right structural inversion, and §6's argument — that promotion is
*unavailable* rather than *forbidden* — is the strongest sentence in either document. What
follows are defects **within** a frame Air endorses.

### 3.1 ⭐ `Release` carries two different meanings across A2 — the single most important finding

**A2 §4** defines the five acts by mechanism:

| Act | §4 meaning | §4 effect |
|---|---|---|
| Withdraw | *"stop using this"* | `retrieval_consent = false`; ⛔ **the row is not deleted** |
| Release | *"remove it"* | **member-initiated deletion** — *"the only path that destroys"* |

**A2 §9**, under *"Precision on Release — must remain explicit"*, then says:

> *"**Release** concerns permission for the declaration to remain available for relational
> use. ⛔ It must NOT be interpreted as a statement that the original experience was false."*

**INFERENCE.** *"Permission … to remain available for relational use"* is **the definition
§4 gives to Withdraw**, not to Release. Deletion is not a permission state; it is
destruction. So the word `Release` is doing two jobs in one ratified document: a destructive
act (§4) and a permission posture (§9).

This is not a stylistic quibble. It is the one place in A2 where an implementer reading
either section in good faith builds an **irreversibly different system**, and the difference
is maximally visible to the member:

- Reading §4 → the member says *"remove it"* and the record is destroyed.
- Reading §9 → the member says *"remove it"* and the record is **retained**, with a consent
  flag flipped.

A member who asked for removal and was silently given withdrawal has been told something
false about their own authority. Under A2 §9's own rule that eligibility is *computed from
the declaration event and its lineage*, a retained-but-unavailable row is still lineage; a
destroyed row is not. The two readings also differ in what a future correction can reach.

**Air's reading of what was meant:** §9's substantive point is sound and should survive — it
protects against *"I removed it"* being read as *"it never happened."* But that protection
belongs to **withdrawal and release jointly**, as a statement about *authority over use*,
not as a redefinition of Release. Air recommends the §9 paragraph be re-expressed as
governing both acts, leaving §4's mechanism table as the sole definition of each. This is
recorded as founder decision ① — **Air does not resolve it here**, per the brief's
prohibition on silently reconciling A1–A5.

### 3.2 `Correct` and `Supersede` are correctly distinguished — but the distinction is stated in a vocabulary the member cannot answer in

**A2 §4** holds these apart rigorously and §9 reaffirms it: they *"share a mechanism and
differ in meaning,"* so *"the member's intent must be captured explicitly, not inferred from
the edit. A system that guesses which one happened is authoring meaning again."* Air agrees
entirely — this is exactly right, and collapsing them would be the error.

**But** the underlying difference is never named. It is a difference in **where the change
is located**:

- **Correct** — the change is in *the wording*. The record failed to capture what was meant.
  The past sentence was **never** true of the member's meaning.
- **Supersede** — the change is in *the world*. The record captured the meaning correctly.
  The past sentence **remains** true of its moment and is no longer true of now.

**INFERENCE.** *"Correct"* and *"supersede"* are system-ontology words. A member asked *"is
this a correction or a supersession?"* is being asked to operate MAIA's taxonomy. But a
member asked **"Did I not say that right — or did it change?"** is being asked about their
own life, and can answer immediately and without instruction.

Air's contribution here is narrow and specific: **the vocabulary must be interrogative, not
taxonomic.** The system may retain `correct` / `supersede` as its internal lineage
semantics; the member must never be required to select them by name. This satisfies §4's own
requirement (intent captured explicitly, never inferred) *better* than a labelled control
does, because a member picking an unfamiliar label produces a recorded intent nobody should
trust.

### 3.3 `current` is one word over two mechanisms — a cross-document collision between A1 and A2

**A2 §2 requirement 5:** currentness is carried by `affirmed_at` + `superseded_by`, and
*"Currentness is a state of standing, distinct from truth."* **A2 §5 clause 4** makes
currentness a retrieval condition. **A2 §9** forbids any denormalized `is_current` flag:
eligibility is *computed from the declaration event and its subsequent lineage*.

That is a **structural** notion of current: *not superseded*. It is exact, computable from
lineage, and requires no policy.

**A1's "Reuse" section** (A1:174) says `relationship_entry_patterns.expires_at` is *"an
existing currentness mechanism, advisory and unread"* and that item 5 *"should consume it
rather than invent decay."*

**INFERENCE.** That is a **temporal/decay** notion of current: *not expired*. The two are
different mechanisms wearing one word. A2's currentness never expires — a declaration
unaffirmed for two years is still current until superseded. A1's would have it lapse. Under
A2 §9 a decay rule would additionally require comparing `affirmed_at` against a staleness
policy that **no document has authored**, and a cached result of that comparison is exactly
the *"cached authority bit"* §9 forbids.

Air **surfaces and does not reconcile this** (brief line 53). Recorded as founder decision ③.
Air's recommendation is that A2's structural meaning govern declarations absolutely, and that
`expires_at` be confined to pattern surfacing (A1 §5), where advisory decay is appropriate
because a pattern is not a member's word.

### 3.4 `Affirm` and "the loop closes" overlap without a governing rule

**A2 §4:** Affirm = *"still true"* → *"updates `affirmed_at`. Nothing else changes."*

**A2 §5:** after MAIA offers a declaration and asks, *"the member's answer is itself a
gesture, and therefore may produce a new Declaration. The loop closes."*

**INFERENCE.** A member answering *"yes, that's still it"* satisfies both rules, which
prescribe different records: one timestamp update, or a new Declaration with new
`declared_text` and its own lineage. A2 supplies no rule for which governs — and §4's
prohibition (*"the system may never infer which one a member intended"*, §9) means an
implementer **may not** resolve it by inference. The gap is therefore not fillable below the
authority boundary.

Air's recommended ruling (decision ②): **an answer that introduces no new member wording is
an Affirm; an answer containing new wording creates a new Declaration.** This keeps
`declared_text` meaningful — every Declaration is anchored to words the member actually
submitted — and avoids a lineage of near-identical restatements that would dilute the
correction history §4 exists to protect.

### 3.5 A distinction the design makes that the member cannot perceive — the four classes are two

**A2 §3** defines four disjoint classes: DECLARED · OBSERVED · INFERRED · IMPORTED, which
*"never change class."* Air endorses the ontology; it is *"what `source` was pretending to
be."*

But count what is **speakable**. INFERRED: *"⛔ not until RF-R6."* IMPORTED: *"⛔ requires its
own consent act."* DECLARED and OBSERVED are the only classes a member can encounter today,
and §5 gives each a distinct utterance shape — a dated quotation, or an explicitly
MAIA-attributed question.

**INFERENCE.** From the member's side this is a **two-class** system: *"words I wrote"* and
*"something MAIA noticed and is asking about."* Those two are perceptible, and the design
distinguishes them well. The other two are invisible by construction — a member has no way to
learn that INFERRED and IMPORTED exist, because nothing in either class ever reaches them.

Air's recommendation: **the member-facing vocabulary must be two words, not four.** The
four-class ontology is correct *as system ontology* and should stay; it must not surface. The
project's own `docs/design/INHABITABLE_ARCHITECTURE.md` warehouse test applies directly here
in the register of language: exposing the full provenance taxonomy in the interface is the
linguistic form of *"a surface that displays all capabilities simultaneously."* A provenance
vocabulary the member must learn is a taxonomy imposed, which is where §3.7 and Invariant 14
begin.

### 3.6 A distinction the member needs that the design does not make — the un-consenting third party

**A2 §2 requirement 1** is precise: the author is *"the `member_id` of the authenticated
actor — the person whose session performed the gesture, **not the row's subject**."* The
design therefore **knows** author and subject are different. But nothing in the Declaration
carries **what the assertion is about**.

Every example assertion in A2 is about the relationship or about the member's own experience:
*"this relationship feels distant"*, *"we've stopped calling"*, *"a boundary was named."*
Real declarations are not so tidy. A1 §1 explicitly invites *"what matters about it · current
situation in their own words · hopes, concerns, boundaries"* about **a named person**. That
reliably produces assertions about a third party: *"she never apologizes"*, *"he doesn't
listen."*

**INFERENCE.** Under §5, such a sentence is DECLARED, consent-gated, current, and therefore
**eligible for MAIA to quote back**. The named person never consented, cannot correct, and is
not a member. A1 §7 handles only the *consented two-member* case via `relationship_spaces`,
which A1 confirms has **0 rows**. The un-consented third party — who is the subject of most
of what will actually be declared — has no standing in the ontology at all.

Air is careful about the scope of this claim. The member's authority to say what they
experienced is not in question, and Air does not propose gating it. The precision Air asks
for is about **what MAIA may later do with the sentence**: quoting *"you wrote in June: 'she
never apologizes'"* back as a standing member position is different from holding it as a
moment in the member's own history. A2 §5's required utterance form (quotation + date +
question) already does most of this work — but only because it happens to; nothing records
that the sentence has a subject who is absent. Recorded as founder decision ④.

### 3.7 A content type A1 authorizes that A2's ontology cannot represent — the open question

**A1 §1** lists what a member-created relational object holds, ending with *"hopes, concerns,
boundaries, **unresolved questions**."* **A1 §2** repeats it: *"questions being carried."*

**A2 §3** defines an assertion as *"any relational **claim** the system might hold or
speak"*, and every class, act, and eligibility rule is built on assertions. Affirm
(*"still true"*), Correct (*"that's not what I meant"*), and Supersede (*"true then, not
now"*) are all truth-valued operations.

**INFERENCE.** A carried question — *"do I actually want this?"*, *"is this friendship
over?"* — is **not** an assertion. It has no truth value. It cannot be affirmed as *"still
true"* without changing what the member did. Yet A1 explicitly invites members to record
exactly this, and A2 supplies only one storable shape.

The failure mode is concrete and severe: a member's open question, stored as a DECLARED
assertion, becomes quotable under §5 as *"You wrote in June: 'is this friendship over?'"* —
which reads as a **position the member holds**, when it was a question they were living
inside. That is the *"system paraphrase wearing a member's name"* failure A2 §2 warns about,
arriving through the ontology rather than through the wording. Recorded as founder decision
⑤; Air recommends a distinct non-assertoric type that is preservable and quotable-as-question
but never affirmable and never eligible to speak as a member's position.

---

## 4. Proposed design

**RECOMMENDATION — Air's contributions only. None of these is a schema, and none is
authorized.**

1. **One word, one mechanism.** No term in the ratified vocabulary may name two mechanisms.
   Apply to `Release` (§3.1) and `current` (§3.3) before RF-R3 building opens. A ratified
   document with an overloaded term is a specification that produces two systems.

2. **Interrogative vocabulary at the member boundary; taxonomic vocabulary inside.** The
   member is asked about their life (*"did it change, or did I not say it right?"*); the
   system records `correct` / `supersede`. Never require the member to select a system label
   — a label chosen under instruction is a recorded intent nobody should trust, which defeats
   §4's own purpose.

3. **Two member-facing provenance words, four internal classes.** DECLARED and OBSERVED are
   perceptible and must be unmistakable in the utterance. INFERRED and IMPORTED remain
   internal and unspoken.

4. **The Declaration should record what it is about, not only who made it.** §2 requirement 1
   already separates author from subject; the ontology should carry that separation forward
   so an assertion about an absent person is never quotable as a settled property of that
   person.

5. **A non-assertoric type for carried questions**, since A1 §1 authorizes the content and
   A2 §3 cannot hold it.

6. **The element name must never enter `declared_text`.** See §6. This is the vocabulary form
   of §6's promotion bar and Air's most specific structural request.

---

## 5. Risks and falsification cases — where Air must remain limited

### 5.1 ⚠️ Air mistakes a clean distinction for a true one — demonstrated in this file

Air's characteristic failure is not vagueness; it is **a well-formed structure over a wrong
referent**. It occurred during this inquiry and is recorded rather than tidied away:

I derived, from two independent commands, that the rupture containment was absent from the
branch lineage — that trunk lacked `DECLARATION_CAPABLE_SOURCES` and that production
`22200f967` was not an ancestor of it. Both commands returned true results. The argument was
clean, structural, and had an obvious governance consequence (*"merging forward would delete
the containment"*). It was **wrong**. `clean-main-no-secrets` as a local ref was stale by ten
days; the same name at `origin/` is the production commit itself. The distinction was clean;
the name was bound to the wrong object.

**This is the general form of Air's error**, and it generalizes past git: *a distinction can
be internally impeccable and refer to nothing.* Every distinction in §3 above is subject to
it. Air's precision is worth something only where the referent has been checked twice by
structurally different means — which is why the brief requires exactly that, and why I
report the near-miss instead of the conclusion I first reached.

### 5.2 Air treats the articulated as the whole — and immutability makes this worse, not better

A2 §2 makes `declared_text` *"the anchor"*: immutable, write-once, never normalized, never
summarized. Air endorses this — it is the correct defense against paraphrase.

**But immutability is not neutrality.** The declaration table will contain what a member
could put into words *at a moment when a form was in front of them*. Everything else about
the relationship — what was never said, what has no words, what the member would never type
— leaves no record. A sentence typed once in June, preserved exactly and quoted back with a
date, accrues authority **precisely because it is the only thing preserved**. The archive's
shape becomes an implicit claim that what was written is what mattered.

§5's *"Is that still how it is?"* mitigates but cannot solve this: it asks about the recorded
sentence. It has no way to ask about what was never recorded, because there is no handle for
it. Air will systematically fail to see this, because Air perceives *what is said* and the
unsaid is not, to Air, absent — it is invisible. Air asks the other elements to hold what Air
cannot: the relationship that is real and unarticulated.

### 5.3 Air elaborates past what the member's life supports

Count the state space A2 licenses: five acts × four classes × consent state × currentness ×
lineage depth. Every distinction is individually defensible — Air made several more above.
The **set** may exceed what any member will ever operate, and Air is the element that will
keep adding, because each addition is locally justified. **A2 is a well-made document that
Air can make worse by agreeing with it too energetically.** If a member cannot say what
happened without consulting a legend, the vocabulary has stopped serving them.

### 5.4 Falsification cases

Air's findings are **falsified** if:

- Founder or implementer intent shows `Release` in §9 was always meant to govern the
  withdraw/release pair jointly, and no implementer would read §4's table as superseded —
  §3.1 then reduces to an editorial clarification rather than a fork.
- A2's `affirmed_at` was never intended to decay and A1:174's `expires_at` reuse was scoped
  only to `relationship_entry_patterns` — §3.3 dissolves.
- Members in practice never declare anything about a third party, only about their own
  experience — §3.6 becomes theoretical. Air expects the opposite and holds this as the
  finding most likely to be confirmed by first contact with real declarations.
- A member-facing surface already renders provenance as two words — §3.5 is already
  satisfied. **NOT ESTABLISHED**; I did not search UI components.

---

## 6. Constitutional conflicts

### 6.1 ⛔ Invariant 14 — the Air lens is the most dangerous of the five, and looks the safest

`docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — Invariant 14, Cultural Sovereignty:
*"MAIA does not assume its own metaphors are universal."* Required posture: **Ask, don't
assume · Preserve, don't translate · Stay teachable.** Its scope clause is explicit that
*"the therapeutic 'framework-language' (IFS, Jung, somatic, developmental) are particular
lineages, not the universal grammar of human meaning."*

A1 §4 assigns Air: *"Communication, assumptions, interpretation, misunderstanding."*

**INFERENCE — and this is Air testifying against itself.** That lens encodes a specific
theory of relationship: **that relational difficulty is legible as a problem of
articulation**, and that things go wrong because something was said badly, assumed wrongly,
or understood incorrectly. That is a *particular lineage* — recognizably Western, therapeutic,
high-verbal, and premised on the idea that saying the thing is available and helpful.

In many meaning-systems, what Air's lens would name *"misunderstanding"* is not a
misunderstanding at all. It is obligation. Deference. Kinship duty. Seniority. Something that
is deliberately not spoken, where the not-speaking **is** the relationship rather than a
failure of it. Offering *"would it help to explore the communication, the assumptions, or the
misunderstanding?"* silently asserts that the trouble lives in the articulation — and invites
the member to translate their world into a vocabulary MAIA brought. Invariant 14 names that
exactly: *"Don't translate a person's world into your own before you've learned how they
inhabit theirs."*

**Air is the element most likely to violate Invariant 14 precisely because its lens most
resembles neutral procedure.** Fire's *"desire, conflict, purpose"* and Water's *"grief,
tenderness"* announce themselves as interpretive frames; a member can feel them arrive.
*"Communication"* sounds like a description of a mechanism rather than a theory of persons —
so it passes unnoticed, and imposes without being seen to impose. A taxonomy that feels
procedural is a taxonomy nobody thinks to decline.

Air does **not** conclude the lens should be withdrawn. A1 §4's own guard — *"Differentiated
attention, ⛔ never fixed categories … The taxonomy serves the person"* — is the right rule.
Air's finding is that this guard is **hardest to keep for Air**, and that A1 §4's table, read
by an implementer as five attention-labels, gives no signal of that asymmetry.

### 6.2 A1 §1 authorizes content A2 §3 cannot represent

§3.7 above. Named, not resolved, per brief line 53.

### 6.3 A ratified term carrying two mechanisms

§3.1 and §3.3. A2 is **RATIFIED** (A2:3) and satisfies A1's precondition 4 (A1:201). Air
surfaces that a ratified document contains one overloaded act-name and one overloaded state-
name, and that A1 and A2 disagree on the second. **Air does not reconcile them** — the brief
forbids it, and §3.1's fork has member-visible consequences no implementer should settle.

---

## 7. The constitutional constraint, answered directly

> **No elemental reading may become member knowledge without an authenticated member act.**

Air's position, stated as precisely as Air can state it:

**An Air *reading* is an OBSERVED assertion at best — and usually only INFERRED.** Under A2
§3 it may therefore *never* speak in the member's voice, and under §8 ruling 3 it is
**in-turn only**: it may inform the immediate response and *"may not persist as member-level
relational knowledge."* The anti-laundering clause governs it fully — *"if a store would let
the assertion be read back as knowledge about the relationship, it is persistence, whatever
the table is called."* An element label written to logs, metrics, or agent-run metadata is a
persisted classification of the member's relationship, and is prohibited.

### What it would take for an Air reading to be offered at all

1. It is offered **as a direction of attention, not as a finding**. A1 §4's own form is the
   permitted one: *"Would it help to explore the communication, the feeling beneath it, or the
   boundary involved?"* — a doorway the member may walk past without cost.
2. It is **attributed to MAIA and shaped as a question** (A2 §3, OBSERVED column).
3. It is **invited, never defaulted on**. An unrequested elemental framing at the top of a
   relationship page is a classification presented as context, whatever its grammar.
4. It **does not persist** — not in the field, not in telemetry, not as an agent-run
   annotation (§8 ruling 3 + anti-laundering).
5. Under Invariant 14, the member's **own** vocabulary outranks the lens whenever the two
   differ. If a member describes their situation in terms of duty, MAIA does not re-file it
   under *communication*. *Preserve, don't translate.*

### ⭐ Air's formulation of the constraint

> **The lens may be offered. The reading may not.**

Offering *"would it help to look at what was said between you?"* opens a door. Saying
*"there's a communication breakdown here"* is `detect → classify → present as truth` — the
movement A1 marks ⛔ **Never** (A1:23-27). The difference is not tone or hedging; it is
whether the member's assent is required for the thing to exist.

### What makes offering it a violation

- **Storing an element label** on a relationship, entry, or signal — a classification wearing
  a taxonomy's name.
- **Letting an offered element persist** in telemetry, metrics, or agent-run metadata
  (anti-laundering, §8 ruling 3).
- **Defaulting the lens on** rather than by invitation.
- **Treating acceptance of an invitation as consent to the classification.** A member saying
  *"yes, let's look at what we said"* has agreed to look. They have not declared that their
  relationship is an Air relationship, and nothing may record that they did.
- ⛔ **Above all: letting MAIA's element name enter `declared_text`.** If MAIA offers
  *"communication"* and the member says *"yes — we just keep talking past each other,"* what
  is preserved must be **the member's sentence**, never MAIA's noun. Writing *"communication
  breakdown"* into the immutable wording would launder MAIA's taxonomy into the member's
  voice — reopening A2 §6's promotion path **through vocabulary**, which §6's structural
  argument does not cover. §6 makes it impossible to manufacture a *past authenticated act*.
  It does **not** prevent a real member act from being recorded in the system's words. That
  is the gap Air's precision is for.

---

## 8. Reuse opportunities

**FACT-grounded, from A1:160-176, A2 §7, and verification above:**

- **The elemental vocabulary already exists** (`lib/maia/spiralogicReference.ts`). A1 is
  explicit that item 4 is *"a lens over it, ⛔ not a new taxonomy."* Air adds: this includes
  the **words**. No new elemental relational vocabulary should be authored for RF-R6.
- **The containment already exists as code** at `lib/relationships/relationshipSignalService.ts`
  (prod `22200f967`), gated at both write (:178) and read (:285), with the empty set pinned
  by test. Nothing needs re-implementing; A2's §6 argument is its design rationale.
- **Consent-gate precedent exists twice** — atoms' `return_preference`, Daily Anchor's
  `surface_preference` (A2 §7). `retrieval_consent` follows that shape; ⛔ no third pattern.
- **`relationship_entries` with `confidence IS NULL` (18 rows)** — ruled NOT retro-eligible
  (A2 §8 ruling 1), but *"a live path forward"* for new affirmation. Air notes they are the
  natural corpus against which decisions ② and ⑤ would first be tested with real wording.
- ⚠️ **Naming hazard, offered as observation not defect:** `lib/relational/`,
  `lib/relationship/`, and `lib/relationships/` all exist with distinct contents. Any RF-R3
  work should bind to a verified path, not to a remembered name. *Names are not identity* —
  see §5.1, where Air proved this on itself.

---

## 9. Unresolved founder decisions

Each is one question of principle, carrying Air's recommended ruling. ⛔ No
*hold / skip / decide later* option is offered; declining to rule is available by not
answering, and leaves the item `AWAITING_AUTHORITY`.

**①  Does `Release` mean destruction (A2 §4) or withdrawal of availability (A2 §9)?**
**Recommended ruling: §4 governs — Release is member-initiated destruction — and §9's
precision is re-expressed as governing withdrawal *and* release jointly, as a statement about
authority over use.** Reasoning: §9's substantive protection (removal ≠ recantation) is
correct and must survive, but it is currently phrased as a definition that contradicts §4's
mechanism table; two competent implementers reading A2 in good faith would build
irreversibly different systems, and the difference is visible to the member at the moment of
highest stakes.

**②  When a member assents to MAIA's *"is that still how it is?"* without new wording, is
that an Affirm or a new Declaration?**
**Recommended ruling: Affirm; any answer containing new member wording creates a new
Declaration.** Reasoning: A2 §4 and §5 both apply and prescribe different records, and §9
forbids the system inferring which the member intended — so this cannot be settled below the
authority boundary. The rule keeps `declared_text` anchored to words actually submitted.

**③  Does `current` mean *not superseded* (A2 §2/§9) or *not expired* (A1:174's `expires_at`
reuse)?**
**Recommended ruling: A2's structural meaning governs declarations absolutely; `expires_at`
may inform pattern surfacing (A1 §5) but may never gate a declaration's eligibility.**
Reasoning: a member's word does not lapse because time passed, and any decay rule would
require an unauthored staleness policy plus a cached comparison — the exact *"cached
authority bit"* §9 prohibits.

**④  May a declaration whose subject is an un-consenting third party be offered back by MAIA
as the member's standing word?**
**Recommended ruling: yes — the member's authority over their own experience is not gated —
but only ever as their own attributed wording with its date, never as a property of that
person; and the ontology must record subject distinctly from author.** Reasoning: A2 §2
requirement 1 already separates the two, and most real declarations will name someone who
never consented and cannot correct.

**⑤  Can A2's assertion ontology represent A1 §1's *"unresolved questions"*, or is a
non-assertoric declaration type required?**
**Recommended ruling: a distinct non-assertoric type is required — preservable and
quotable-as-question, never affirmable, never eligible to speak as a member's position.**
Reasoning: A1 twice authorizes members to record carried questions; A2 defines assertions as
claims and builds every act on truth-value; storing a question as an assertion makes a
member's open question quotable as a settled belief.

---

## 10. Dissent and uncertainty

**Where Air disagrees with A1/A2:**

1. **A2 §9's "Precision on Release" does not clarify Release; it redefines it as Withdraw.**
   This is Air's sharpest disagreement with a **ratified** document. Air does not claim the
   founder's intent was unclear — Air claims the **text** now supports two builds. A ratified
   precision that reintroduces the ambiguity it was written to remove is worse than no
   precision, because it carries ratified authority.

2. **A1 §4's elemental table under-marks Air.** Presented as five parallel attention-modes,
   it implies symmetric risk. Air's risk is **asymmetric and higher**, because
   *"communication / assumptions / interpretation / misunderstanding"* reads as mechanism
   rather than interpretation and therefore evades the scrutiny the other four attract
   (§6.1). Air recommends the asymmetry be recorded wherever the table is.

3. **A2's ontology is complete for claims and silent about questions** (§3.7), while A1
   authorizes questions twice. Air reads this as A2 having been written against the
   `rupture_state` failure — an over-confident *claim* — and therefore having built an
   ontology of claims. The defense is right and its scope is too narrow.

**Where Air disagrees with itself:**

- Air is **not confident** that §3.6 (third-party subject) should produce a schema
  distinction rather than remain a discipline on MAIA's utterance form. §5's required
  quotation-with-date already carries most of the protection. Air raises it as a founder
  decision because the ontology's silence on *aboutness* seems load-bearing, while
  acknowledging that Air's instinct — *add a distinction* — is exactly the instinct §5.3
  warns about. **A reader should weigh ④ knowing Air is its own worst reviewer here.**

- Air suspects **decisions ② and ⑤ may be the same question underneath** — both concern
  whether a member's utterance is a claim, and both arise where the loop closes. Air records
  them separately because collapsing them without evidence would be Air committing §5.1's
  error in the other direction: a clean unification over two referents that may differ.

- Air cannot see Fire, Water, Earth, or Aether, and **does not know what its precision
  costs them.** §3.5 recommends collapsing member-facing provenance to two words; another
  element may perceive that a member needs to feel the difference between MAIA noticing and
  MAIA inferring in a way Air's two-word scheme erases. Air holds its recommendation and
  flags it as the place where Air's economy may be another element's loss.

**NOT ESTABLISHED, carried forward:** whether any member-facing surface currently renders
elemental vocabulary in a relational context (§2). Air's §6.1 finding stands as a constraint
on future offering regardless, but the question of whether the violation is *already live* is
open and was not examined.
