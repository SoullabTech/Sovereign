# P2-00 · AMENDMENT 2 — REFERENTIAL DEFINITIONS

```text
AMENDS       P2-00 charter draft ab070551 · Amendment 1 at 41378a5d (structurally accepted)
AUTHORIZED   founder, 2026-09-14 — BOUNDED amendment, ratification HELD
SCOPE        define PERSON · SUBJECT · PERSON-AUTHORED MATERIAL ·
             ARCHITECTURALLY DURABLE STATE · THE ORGANISM'S OWN WORD ·
             UNILATERAL REVERSIBILITY · remove the dependency on TURN ·
             update predicate wording only as those definitions require
STATE        DRAFT · ⛔ NOT RATIFIED · ⛔ no mapping · ⛔ no implementation
```

> ⭐ **The predicates were sound and not yet executable.** A predicate whose referents are
> undefined can be argued but not applied, and a boundary test that cannot be applied
> reproducibly is not a boundary test.

⛔ **Out of scope and untouched:** FD-12 (MAIA and authority) · FD-14 (predicate closure) ·
FD-3 (`CONCLUDES`'s placement) · FD-5 (epistemic axis) · FD-6 · FD-7 · FD-8 · FD-9 · FD-10 ·
FD-11. ⛔ No component named as an instance of any primitive. ⛔ No new consequential predicate.

---

## 0 · Founder decisions recorded — labelled as such, permanently

⭐ Per the standing rule, these read **`FOUNDER DECISION`** and ⛔ never `PHASE 1 FOUND`.

```text
FOUNDER DECISION · FD-13 · SIX KINDS — ACCEPTED, WITH ONE BOUNDARY
  The six kinds are SUFFICIENT FOR THE PRESENT CHARTER. They are ⛔ NOT declared a
  complete ontology of the organism. ⛔ No seventh kind may be invented for symmetry or
  completeness; ⛔ nor is a genuinely irreducible kind prohibited from being discovered
  later. ⭐ The kinds classify SEMANTICS; they ⛔ do not create architectural succession.
  CONCLUDES remains UNPLACED pending FD-3.
  KIND 1 is henceforth written "ordered / potentially ordered relational rungs".

FOUNDER DECISION · FD-15 · UNDETERMINABLE BRANCH — ACCEPTED
  all NO → NON-CONSEQUENTIAL · any YES → CONSEQUENTIAL ·
  no YES but ≥1 UNDETERMINABLE → PROVISIONALLY CONSEQUENTIAL, predicate NAMED.
  ⭐⭐ It is a GOVERNANCE RULE, ⛔ not an inference that the predicate is true:
     PROVISIONALLY CONSEQUENTIAL  ≠  predicate proven YES
     PROVISIONALLY CONSEQUENTIAL  =  govern as consequential until the named scope
                                     uncertainty is resolved
  ⭐⭐ ADDITIONAL GUARD, now constitutional: provisional consequentiality determines only
  that AUTHORITY IS REQUIRED. It ⛔ NEVER grants authority.
     uncertain scope → stronger governance requirement
     uncertain scope ↛ permission     uncertain scope ↛ authority
  ⭐ The asymmetry is the property worth having: uncertainty can raise the requirement for
  governance and can never raise authority.

FOUNDER DECISION · EXISTS — ACCEPTED AS DRAFTED
  EXISTS ≠ CAPABILITY. It grants no participation, no capability, no authority, and
  ⭐ NO FUTURE ENTITLEMENT. `EXISTS yes · CAPABILITY no · PARTICIPATES no` is
  constitutionally coherent. ⛔ Dormant, orphaned, unreachable, deprecated or disconnected
  substrate must not acquire conceptual authority merely by being present.

FOUNDER DECISION · CONSEQUENTIAL (FORM) — ACCEPTED AS A SCOPE PREDICATE
  ⛔ not a permission · ⛔ not an authority · ⛔ not a rung · ⛔ not a property granted to a
  component. Composition stands PROVISIONALLY, in two matched halves:
    a CAPABILITY is consequential iff it CAN PERFORM at least one consequential act
    CONSEQUENTIAL AUTHORITY is authority whose SCOPE INCLUDES at least one consequential act
  ⭐ Both expressions reach the same governed act-set ⛔ without making capability and
  authority equivalent.

FD-14 · PREDICATE CLOSURE — NOT SETTLED
  seven predicates = CANDIDATE MINIMUM SET · closure NOT SETTLED ·
  ⛔ new-predicate search NOT AUTHORIZED. Make each existing predicate semantically
  executable first; only then can a real gap be told from an undefined boundary.
```

---

## 1 · PERSON

```text
DEFINITION        a natural human individual whose data, agency, representation, access,
                  relationship or interests may be affected by an act.
INCLUDES          member · practitioner · guest · third party — where applicable
DOES NOT MEAN     ⛔ model · ⛔ service account · ⛔ organization · ⛔ software process
                  — unless another definition explicitly uses a broader actor class
IDENTIFIABILITY   ⭐ NOT required. An act affecting a person the organism cannot currently
                  identify still affects a PERSON. ⛔ "We cannot identify them" is not a
                  finding that no person is affected.
MUST NOT COLLAPSE INTO
                  ⛔ `authenticated user` · ⛔ `account` · ⛔ `the requester` · ⛔ `the actor`
```

⚠️ **`PERSON` is the AFFECTED class in every predicate that uses it.** The *acting* class is not
defined by this amendment, and ⛔ is not assumed to be a person. Consequence, applied as a wording
update: predicate **`C-g`** now reads *"affects a person other than the person, if any, who
performed the act and the person whose material it concerns."* ⚠️ Whether the acting class needs
its own primitive is **FD-17**, flagged and ⛔ not answered.

---

## 2 · SUBJECT — and a namespace collision, resolved by writing both in full

```text
REFERENTIAL SUBJECT (the constitutional sense)
DEFINITION        the architectural referent that an act, claim, record, permission or
                  relationship is ABOUT.
MAY BE            a person · a relationship · a session · a group · an artifact ·
                  a capability · the organism itself
DOES NOT MEAN     ⛔ `authenticated user` · ⛔ the actor · ⛔ the requester ·
                  ⛔ the record's owner
MUST NOT COLLAPSE INTO
                  ⭐ the PERSON. A claim about a relationship has a subject that is not a
                  person, and the persons in that relationship are not thereby its subject.
```

⚠️⚠️ **COLLISION, DECLARED NOT RENAMED.** Phase 1 and both P2-00 documents already use
**`SUBJECT`** in a different sense — *the named commit under examination* (`SUBJECT
1a5554300e855…`). That is the **EVIDENTIARY SUBJECT**. Applying the standing namespace rule from
P1-05 (*write it in full wherever ambiguity could alter meaning*) rather than inventing a
decision:

```text
EVIDENTIARY SUBJECT   a named repository state under examination — Phase 1's sense
REFERENTIAL SUBJECT   what a claim, act or permission is about — the constitutional sense
```

⭐ **Clarification required by this definition:** `EXISTS`'s *"present at a named subject"* uses
the **EVIDENTIARY** sense. ⛔ `EXISTS` is not redefined; the sense is named so a ratified charter
does not carry a two-sense word in a load-bearing definition. ⚠️ Confirmation of that reading is
**FD-18**.

---

## 3 · PERSON-AUTHORED MATERIAL

```text
DEFINITION        material whose SEMANTIC SUBSTANCE was supplied by a person's own
                  expression.
GOVERNING QUESTION
                  ⭐ Did the person's expression supply the substance being acted upon?
OPERATIONAL TEST  remove the person's expression — DOES THE SUBSTANCE SURVIVE?
                    it does not survive  → PERSON-AUTHORED MATERIAL
                    it survives          → not person-authored; the substance came from
                                           elsewhere (and may be the organism's own word, §5)
AUTHORSHIP IS NOT TRANSFERRED BY
                  ⛔ copying · ⛔ storing · ⛔ quoting · ⛔ transforming · ⛔ routing ·
                  ⛔ encrypting · ⛔ indexing · ⛔ summarizing
MUST NOT COLLAPSE INTO
                  ⛔ material ABOUT a person (that is predicate C-b's domain, and it is
                  organism-supplied substance however much it concerns them)
                  ⛔ material a person merely TRANSPORTED or selected
```

⭐ **Consequence that follows from the definition rather than being added to it:** a derived
artifact — a summary, an extract, an embedding, a digest — **remains person-authored material**,
because removing the person's expression removes its substance. Disclosure predicate `C-a`
therefore reaches derived artifacts. ⚠️ That consequence is large enough to want confirmed rather
than assumed: **FD-20**.

---

## 4 · ARCHITECTURALLY DURABLE STATE — the correction to `C-c`

```text
DEFINITION        state is ARCHITECTURALLY DURABLE when it survives the ORIGINATING ACT and
                  its execution context, AND remains available to be retrieved, relied upon,
                  disclosed, or used to alter a later organism act, relationship, permission,
                  representation or decision.
GOVERNING PRINCIPLE
                  ⭐⭐ determined by what the state can SUBSEQUENTLY DO — ⛔ never by its
                  storage mechanism. *A database write is an implementation fact;
                  durability, constitutionally, means that something can matter later.*
OPERATIONAL TEST  D-1  does it survive the originating act's execution context?
                  D-2  can any later organism act retrieve it and, as a result, behave
                       differently — or alter a person's representation, relationship,
                       permission or standing?
                    D-1 and D-2 YES         → ARCHITECTURALLY DURABLE
                    D-2 NO                  → constitutionally TRANSIENT, even if
                                              physically persisted
                    D-2 UNDETERMINABLE      → PROVISIONALLY DURABLE
                                              (FD-15's asymmetry, inherited)
CATEGORY RULE     ⛔ No storage category is exempted ad hoc. Operational logs, caches,
                  telemetry and audit records are in or out by the test above — ⛔ by what
                  they can subsequently do, ⛔ not by what they are called.
MUST NOT COLLAPSE INTO
                  ⛔ "a write happened" · ⛔ "it is in a database" · ⛔ "it is only a log"
```

⭐ **Predicate `C-c` is amended to remove the `turn` dependency**, as ruled:

```text
BEFORE   Does it create, mutate or delete state that OUTLIVES THE TURN and that a later act
         can read?
AFTER    Does it create, mutate or delete ARCHITECTURALLY DURABLE STATE (§4)?
```

⭐ **`TURN` is no longer a constitutional primitive of this charter.** Both of its uses are
removed — `C-c` above, and its FD-16 flag, discharged by this section. ⭐ A conversational unit
does not govern the semantics of background jobs, imports, scheduled processes or other
non-conversational acts; **`ORIGINATING ACT` and its execution context** carry that work, and both
are concepts the charter already required. ⛔ `TURN` is not re-flagged, because the dependency is
gone rather than deferred.

⚠️ **This NARROWS `C-c` relative to its literal Amendment-1 reading** — which was FD-14's stated
worry — and ⛔ **it does not close FD-14.** Whether the seven predicates form a sufficient set is
still open, and narrowing one of them is not evidence that the set is complete.

---

## 5 · THE ORGANISM'S OWN WORD

```text
DEFINITION        expression presented to a person as originating from the organism's own
                  interpretive, relational, advisory or declarative voice.
OPERATIONAL TEST  S-1  is the expression PRESENTED AS THE ORGANISM'S, rather than attributed
                       to a person or to a named source?
                  S-2  did the ORGANISM supply the semantic substance?
                       (the inverse of §3's authorship test)
                    S-1 and S-2 YES     → THE ORGANISM'S OWN WORD
                    either NO           → not organism speech, unless the architecture
                                          DELIBERATELY DECLARES it to be
                    either UNDETERMINABLE → treat predicate C-e as UNDETERMINABLE, which
                                          under FD-15 yields PROVISIONALLY CONSEQUENTIAL
MUST BE DISTINGUISHABLE FROM
                  quoted person-authored material · retrieved source text · literal
                  transcription · mechanical transformation · navigation and UI labels ·
                  protocol and status messages
                  — ⛔ unless the architecture deliberately declares one of those to BE
                  organism speech
MUST NOT COLLAPSE INTO
                  ⛔ "the model produced the characters" — a transcription is model output
                  and is not the organism's word
                  ⛔ "a person's words passed through the organism" — §3 governs that
```

⚠️ **The hard case, named rather than smoothed over: SELECTION.** Where the organism supplies no
words but chooses which source passage appears, `S-2` is arguable. Phase 1 recorded the discipline
that answers it — a system that keeps the member's words, a computed artifact and house text in
**three separate blocks** because they *"do not share an author"*, noting that one merged block
*"would collapse three authorships into one scalar."*

```text
DRAFTED SUB-RULE, ⛔ NOT DECIDED (FD-19)
  selection alone is NOT organism speech WHILE the selected material stays ATTRIBUTED to
  its source;
  selection BECOMES organism speech when attribution is COLLAPSED, or when the selection
  itself asserts something — ranking by salience, "this is the relevant one", ordering
  presented as significance.
```

---

## 6 · UNILATERAL REVERSIBILITY — predicate `C-f`

```text
DEFINITION        an act is UNILATERALLY REVERSIBLE when the affected person can restore the
                  relevant prior state through an ORDINARY AUTHORIZED MECHANISM AVAILABLE TO
                  THAT PERSON, without discretionary action by another actor or authority.
OPERATIONAL TEST  R-1  is there a mechanism that person is authorized to use?
                  R-2  does using it restore the RELEVANT prior state?
                  R-3  does it require another actor's or authority's DISCRETION?
                    R-1 YES · R-2 YES · R-3 NO   → reversible → C-f answers NO
                    otherwise                     → C-f answers YES (irreversible)
MUST NOT COLLAPSE INTO
                  ⛔ difficulty · ⛔ cost · ⛔ delay · ⛔ needing to read documentation ·
                  ⛔ "an administrator could fix it" — that IS discretionary action by
                  another actor, and therefore NOT unilateral reversibility
                  ⭐ The distinction is inconvenience versus actual loss of unilateral
                  reversibility.
```

⚠️ **One structural consequence, stated:** a disclosure cannot be un-disclosed, so acts satisfying
`C-a` will ordinarily also satisfy `C-f`. ⭐ Overlapping predicates are not redundant — *any YES*
suffices, and the two diverge on acts that are reversible but disclosing, or irreversible without
disclosing. ⛔ Neither is removed.

---

## 7 · FD register after Amendment 2

```text
DECIDED    FD-13 (six kinds, sufficient not exhaustive) · FD-15 (fail toward governed,
           with the no-authority guard) · EXISTS accepted · CONSEQUENTIAL form accepted
DISCHARGED FD-16 — all six referential dependencies defined above, and the TURN dependency
           REMOVED rather than deferred
OPEN       FD-3 CONCLUDES placement · FD-5 epistemic axis · FD-6 · FD-7 · FD-8 ratification ·
           FD-9 · FD-10 · FD-11 governing-source taxonomy and termination ·
           FD-12 does MAIA hold any HAS AUTHORITY · FD-14 predicate closure
NEW, flagged and ⛔ not answered:
  FD-17  the ACTING class — must a performer be a PERSON? (C-g wording now says "if any")
  FD-18  confirm EXISTS's "named subject" is the EVIDENTIARY SUBJECT
  FD-19  the selection sub-rule for organism speech (§5)
  FD-20  confirm that derived artifacts remain PERSON-AUTHORED MATERIAL (§3)
```

⛔ **FD-12 was not answered through examples while these primitives were defined** — no definition
above names MAIA as holding or lacking authority, and none uses MAIA as an illustration.

## 8 · Stop condition

```text
PERSON defined                                    ✅ §1, with identifiability guard
SUBJECT defined                                   ✅ §2, and a two-sense collision declared
PERSON-AUTHORED MATERIAL defined                  ✅ §3, with a removal test
ARCHITECTURALLY DURABLE STATE defined             ✅ §4, by future standing not storage
THE ORGANISM'S OWN WORD defined                   ✅ §5, with the selection case named
UNILATERAL REVERSIBILITY defined                  ✅ §6
TURN dependency removed                           ✅ §4 — removed, ⛔ not re-flagged
predicate wording updated only as required        ✅ C-c (§4) and C-g (§1)
⛔ no components · no mapping · no FD-12 · no FD-14 closure · no CONCLUDES placement ·
⛔ no new predicates · no implementation          ✅
further indispensable terms flagged, ⛔ not expanded  ✅ FD-17 … FD-20
```

```text
P2-00           DRAFT — amended twice, returned for term-by-term ratification
ratification    HELD          mapping  BLOCKED          implementation  BLOCKED
```

## 9 · `AUTH-EXPOSURE-01` — independent and unchanged

```text
W-1 production ACCESS_CONTROL_MODE unset  AND  W-3 affected routes served → containment event
```

⛔ Neither alone spends it. ⛔ No definition in this amendment — `PERSON`,
`PERSON-AUTHORED MATERIAL` and `ARCHITECTURALLY DURABLE STATE` included — reclassifies,
satisfies, or reinterprets any Flow B finding.

---
_Amendment 2. Six referents defined, one dependency removed, four decisions recorded, four new
questions raised, ⛔ ten left open._
