# P2-00 · AMENDMENT 1 — `EXISTS` restored · `CONSEQUENTIAL` defined · semantic kinds made explicit

```text
AMENDS       P2-00 charter, authoritative draft ab070551
AUTHORIZED   founder, 2026-09-14 — BOUNDED amendment, ratification HELD
SCOPE        add EXISTS · add CONSEQUENTIAL · classify by semantic kind ·
             update affected cross-references · retain FD-1…FD-12 with numbering
             adjustments made explicit
STATE        DRAFT · ⛔ NOT RATIFIED · ⛔ no mapping · ⛔ no implementation
```

> ⭐ **The defect was in the primitive set, not in the draft's reading of it.** A charter that
> cannot determine its own jurisdiction cannot be ratified — `CONSEQUENTIAL` scoped every
> governance requirement in the ruling and was undefined. And `EXISTS ≠ CAPABILITY` is the
> correction that keeps dormant substrate from acquiring conceptual power by being present.

⛔ **Out of scope, and not touched:** FD-3 · FD-4 · FD-5 · FD-6 · FD-7 · FD-8 · FD-9 · FD-10 ·
FD-11 · FD-12 remain undecided. ⛔ No component assignment. ⛔ No Phase 1 reinterpretation.

---

## 1 · Semantic kinds — explicit, and ⛔ not one ladder

```text
KIND 1 · ORDERED RELATIONAL RUNGS         a part's position toward a consequential act
  PARTICIPATES · KNOWS · CONSIDERS · CONTRIBUTES · CONCLUDES · DECIDES · HAS AUTHORITY
  ⚠️ Listing is NOT succession. The position and relationship of CONCLUDES remain OPEN
  until FD-3. ⛔ This kind does not yet assert one continuous ladder.

KIND 2 · CAPACITY / GOVERNED ACT
  CAPABILITY   (capacity — the architecture's `can`)
  REFUSES      (a governed ACT, ⛔ NOT the bottom of any ladder)

KIND 3 · AUTHORITY RELATION
  GOVERNING SOURCE — holds BETWEEN a source and an authority; ⛔ not a property of a part

KIND 4 · EPISTEMIC STATES OF CLAIMS
  CONTESTED · UNKNOWN — borne by CLAIMS, ⛔ never assigned to components

KIND 5 · ONTOLOGICAL STANDING                                        ⭐ NEW (§2)
  EXISTS — presence in the organism, ⛔ not functional capacity

KIND 6 · SCOPE PREDICATE                                             ⭐ NEW (§3)
  CONSEQUENTIAL — whether an act falls inside the governed set at all
```

⭐⭐ **GOVERNING RULE, as ruled: do not infer ordering merely because terms are presented
together. An architecture diagram must not manufacture semantic succession.** Neither of the two
new kinds is a rung, and ⛔ neither is inserted into KIND 1.

⚠️ **Six kinds, not four — declared, not assumed.** The ruling named four; `EXISTS` is neither a
rung, a capacity, a relation, nor a state of a claim, and `CONSEQUENTIAL` is explicitly *"a scope
predicate, not another rung or capability."* Both therefore need homes the four do not offer.
⛔ Whether six is the right count is **FD-13** — ⛔ not settled here, and ⛔ not a fifth *question*
(the four questions of the charter §1 are untouched).

---

## 2 · `EXISTS` — restored as its own primitive · KIND 5

```text
DEFINITION        ontological standing in the organism: the artifact is PRESENT at a named
                  subject. ⭐ Existence is standing, ⛔ not functional capacity.
DOES NOT MEAN     ⛔ reachable · ⛔ wired · ⛔ enabled · ⛔ live · ⛔ capable · ⛔ participating
                  · ⛔ intended · ⛔ supported · ⛔ deserving of any rung
GRANTED BY        presence in the named subject. Nothing else — ⛔ not a design document
                  promising it, ⛔ not an interface describing it
REVOKED BY        removal from the subject
EVIDENCE          the artifact located at a named path at a named subject
MUST NOT COLLAPSE INTO
                  ⭐⭐ CAPABILITY. This is the whole point of the primitive.
                  A VALID TARGET STATE IS:   EXISTS yes · CAPABILITY no · PARTICIPATES no
```

⭐ **Phase 1 supplied the counterexample rather than the argument.** Seven nodes were established
at the `EXISTS` rung *and were present-and-unreachable*; 39 carried `DORMANT` and 20 `ORPHANED`.
An unreachable artifact has **no `CAPABILITY` at all** — so collapsing the two would let dormant
substrate read as latent authority merely by being in the repository.

⚠️ **Cross-reference correction to the charter.** Charter §3.1 gives `CAPABILITY`'s
`MUST NOT COLLAPSE INTO` as *"PARTICIPATES · any `may` term."* Amended to also name **`EXISTS`
below it**: the three states are distinct, and `CAPABILITY`'s grant condition is *reachable*
implementation, which `EXISTS` does not supply.

---

## 3 · `CONSEQUENTIAL` — defined as a scope predicate · KIND 6

```text
DEFINITION        a property of an ACT: the act falls inside the set for which explicit
                  authority and a governing source are REQUIRED.
                  ⭐ It answers jurisdiction — "is this governed at all?" — and ⛔ nothing
                  about position, capacity, or legitimacy.
DOES NOT MEAN     ⛔ important · ⛔ high impact · ⛔ affecting the member · ⛔ expensive
                  · ⛔ frequent · ⛔ slow · ⛔ sophisticated · ⛔ model-mediated
                  · ⛔ hard to remove · ⛔ visible to developers · ⛔ prominently named
GRANTED BY        n/a — ⭐ it is not granted. It is DETERMINED by the boundary test below,
                  from the act's own definition. A predicate that could be granted would be
                  a permission, and the governed set would become optional.
REVOKED BY        n/a — it changes only when the ACT changes. ⛔ An act does not become
                  non-consequential because governing it is inconvenient.
EVIDENCE          the completed boundary test, with each predicate answered and each
                  UNDETERMINABLE answer named
MUST NOT COLLAPSE INTO
                  ⛔ any KIND 1 rung — a non-consequential act may still be performed by a
                  part at any rung, and a consequential act may be performed by a part whose
                  rung is not established
                  ⛔ CAPABILITY — consequence is a property of the act, capacity of the part
                  ⛔ HAS AUTHORITY — consequence says authority is REQUIRED, ⛔ never that
                  it is held
COMPOSITION       a CAPABILITY is consequential iff it can perform at least one consequential
                  act. ⭐ The predicate applies to ACTS; it reaches parts only through this
                  rule, which is what lets the ruling's "every consequential capability" and
                  "consequential authority" mean the same thing.
```

### 3.1 · The boundary test — seven predicates, two-reader decidable

An act is **CONSEQUENTIAL** if **any** predicate answers YES.

```text
C-a  DISCLOSURE      Does it read, transmit or disclose material a person AUTHORED, to any
                     reader other than that person?
C-b  ASSERTION       Does it assert something ABOUT a person that the person did not author
                     — a characterization, trajectory, forecast or evaluation?
C-c  DURABILITY      Does it create, mutate or delete state that OUTLIVES the turn and that
                     a later act can read?
C-d  PERMISSION      Does it grant, widen, narrow or revoke any permission, admission or
                     authority — its own or another's?
C-e  ORGANISM SPEECH Does its output reach a person as the ORGANISM'S OWN WORD, rather than
                     as their own material returned to them?
C-f  IRREVERSIBILITY Is it un-undoable by the person acting alone within the organism?
C-g  THIRD PARTY     Does it affect a person other than the one performing it and the one
                     whose material it concerns?
```

**Procedure.** Answer all seven from the act's own definition.

```text
any YES                        → CONSEQUENTIAL
all NO                         → NON-CONSEQUENTIAL
any UNDETERMINABLE, rest NO    → PROVISIONALLY CONSEQUENTIAL
                                 ⭐ record WHICH predicate was undeterminable and why
```

⭐⭐ **The undeterminable branch is the reason this is operational rather than rhetorical.** Two
readers who disagree about an act's importance will still agree on *which predicate they cannot
answer* — and therefore reach the same classification. ⛔ Disagreement is converted into a named
gap, never into a coin flip.

⚠️ **The default is deliberate and it has a cost, stated rather than hidden:** *fail toward
governed* widens the governed set whenever the act's definition is incomplete. The alternative —
defaulting to ungoverned — would make an under-specified act escape governance by being
under-specified, which is the failure mode this project has repeatedly found in its own history.
⛔ Whether the default stands is **FD-15**.

### 3.2 · What the predicates deliberately do NOT do

```text
⛔ They do not rank. A consequential act is not "more important" than a non-consequential one;
   it is inside jurisdiction. Governance is not a compliment.
⛔ They do not measure. No threshold, score, frequency or volume appears in any predicate.
⛔ They do not read intent. An act's consequence follows from what it does, ⛔ not from what
   it was for.
⛔ They do not decide who may perform it. That is KIND 1 and KIND 3, and it comes after.
```

---

## 4 · Preserved, unchanged, and re-affirmed as ratification candidates

```text
CAPABILITY ≠ CONCLUDES          `can` ≠ `may`. CAPABILITY is available technical or
                                functional capacity; CONCLUDES is GOVERNED PERMISSION to
                                perform the architectural act of conclusion.
                                ⭐ CAPABILITY: yes · CONCLUDES: no is coherent and important.
                                ⛔ Technical ability never implies permission.

REFUSES ≠ failure               a governed ACT performed under a condition. Its causes may
                                include lack of authority · epistemic insufficiency ·
                                constitutional prohibition · safety boundary · member choice
                                · role boundary · other explicitly governed cause —
                                ⚠️ and that list is NOT yet a settled taxonomy.
                                ⭐ RETAINED: a refusal that cannot be distinguished from an
                                answer, silence, an error or a system failure has NOT been
                                architecturally represented as a refusal.

GOVERNING SOURCE is relational  ⛔ not `component.governingSource = constitution`.
                                It is:  SOURCE —grants / bounds / revokes→ AUTHORITY
                                ⭐ The architecture must eventually represent at least:
                                  grant · scope · conditions · revocation · supersession
                                The citable-grant-AND-effective-revocation requirement stands
                                as a RATIFICATION CANDIDATE, ⛔ not yet final law. Its
                                principle: authority whose source cannot actually constrain or
                                revoke it may be PROVENANCE, but is not yet GOVERNANCE.

CONTESTED / UNKNOWN on CLAIMS   ⭐ CLAIM X · standing = CONTESTED
                                ⭐ CLAIM Y · standing = UNKNOWN(...)
                                ⛔ never  component = contested
                                unless some later architecture deliberately defines a
                                different meaning.

UNKNOWN, two questions kept apart
                                (1) WHICH epistemic conditions must be representable —
                                    directionally accepted, eight drafted in charter §3.12
                                (2) WHETHER they form one ordered axis — ⛔ OPEN, FD-5
                                ⛔ No axis is created because an enum, column, diagram or UI
                                would become easier.
```

## 5 · FD register after Amendment 1 — numbering adjustments explicit

```text
FD-1   CONSEQUENTIAL      ⭐ ADDRESSED BY AMENDMENT 1 §3 — definition DRAFTED.
                          ⛔ Not ratified. FD-1 stays OPEN as a ratification item, and is
                          no longer a blocker to returning the charter for ratification.
FD-2   EXISTS             ⭐ ADDRESSED BY AMENDMENT 1 §2 — definition DRAFTED. Same standing.
FD-3 … FD-12              UNCHANGED, UNDECIDED, ⛔ not touched by this amendment.
                          ⭐ FD-5 (is there an epistemic axis) and FD-12 (does MAIA hold any
                          HAS AUTHORITY) are GENUINELY UNDECIDED — neither "MAIA must
                          ultimately hold authority" nor "MAIA can never hold authority" is
                          asserted anywhere in the charter or this amendment.

NEW, raised by the amendment and ⛔ flagged rather than answered:
FD-13  Are there SIX semantic kinds, or should KIND 5 / KIND 6 be folded differently?
FD-14  Does the C-a…C-g predicate set CLOSE? Is any predicate missing, or over-broad?
       ⚠️ C-c (durability) is the widest: on a plain reading, almost every write is
       consequential. That may be correct — it is not assumed to be.
FD-15  Does "any UNDETERMINABLE ⇒ PROVISIONALLY CONSEQUENTIAL" stand as the default?
FD-16  ⚠️ TERMS THE TWO NEW DEFINITIONS LEAN ON AND DO NOT DEFINE — flagged per the
       amendment's own scope rule, ⛔ NOT recursively expanded here:
         "material a person AUTHORED"     (C-a)
         "state that OUTLIVES the turn"   (C-c)   — and what a TURN is
         "the ORGANISM'S OWN WORD"        (C-e)
         "un-undoable BY THE PERSON ALONE"(C-f)
         "a PERSON other than"            (C-g)   — who counts as a person here
         "PRESENT at a named subject"     (EXISTS) — what a SUBJECT is, architecturally
```

⭐ **FD-16 is the honest outcome of the scope rule**: defining two primitives exposed six terms
they depend on. ⛔ Defining those now would recursively expand a charter the founder bounded —
so they are named, and a future act may take them.

## 6 · Stop condition — discharged item by item

```text
EXISTS defined                                    ✅ §2
CONSEQUENTIAL defined                             ✅ §3, with a two-reader boundary test
semantic kinds explicit                           ✅ §1, six kinds, declared not assumed
⛔ no artificial master ladder                     ✅ KIND 1 lists without asserting succession;
                                                     CONCLUDES' position stays open (FD-3)
CAPABILITY ≠ CONCLUDES intact                     ✅ §4
REFUSES ≠ failure                                 ✅ §4, observable-refusal requirement kept
GOVERNING SOURCE relational                       ✅ §4, plus grant·scope·conditions·
                                                     revocation·supersession
epistemic states remain properties of claims      ✅ §4
FD-5 and FD-12 genuinely undecided                ✅ §5, stated in both directions
⛔ no component mapping begun                      ✅ nothing in this amendment names a component
                                                     as an instance of any primitive
```

```text
P2-00           DRAFT — amended, returned for term-by-term ratification
ratification    HELD — founder act
mapping         BLOCKED until ratification
implementation  BLOCKED
```

## 7 · `AUTH-EXPOSURE-01` — independent and unchanged

```text
W-1 production ACCESS_CONTROL_MODE unset  AND  W-3 affected routes served → containment event
```

⛔ Neither condition alone spends the trigger. ⛔ No Phase 2 primitive, predicate or preference
may weaken, satisfy, supersede or reinterpret it — including `CONSEQUENTIAL`, which ⛔ does not
reclassify any Flow B finding.

---
_Amendment 1. Two primitives added, six semantic kinds declared, four founder decisions raised,
⛔ ten left undecided. Ratification remains the founder's, term by term._
