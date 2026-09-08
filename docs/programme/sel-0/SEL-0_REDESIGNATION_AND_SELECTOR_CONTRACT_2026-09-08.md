# SEL-0 redesignation + Writer's Studio developmental-selector product contract

**Founder ruling, 2026-09-08** — recorded verbatim, then the DESIGN act it opens.

---

## 1 · Founder ruling — SEL-0 redesignated

> SEL-0 is hereby redesignated as a pre-build acceptance standard for Writer's Studio
> developmental selection.
>
> Writer's Studio presently lacks the required capability: MAIA cannot yet decide which
> lawful developmental observation is most useful to raise now. That remains an open
> product gap until an actual Writer's Studio runtime path implements the capability and
> passes SEL-0.
>
> SEL-0 may define the acceptance standard before implementation, but the benchmark
> evaluator is not the product capability. No evaluation-only ranking prompt, script,
> agent, or offline scorer may be treated as satisfying the gap.
>
> The capability is satisfied only when a named Writer's Studio runtime component performs
> developmental selection under the same substantive contract that SEL-0 evaluates.
>
> The existing exact-key behavior remains valid for member-addressed observations. When the
> writer explicitly names an observation, the system resolves exactly that observation and
> does not substitute another. Developmental selection is a separate capability governing
> what MAIA may choose to raise when the writer has not already chosen the observation.
>
> SEL-0's acceptance rules must be frozen before the selector is implemented or tuned
> against the frozen corpus.
>
> After the acceptance standard is frozen, the smallest real Studio selector may be
> implemented on a branch. It must be part of the actual Writer's Studio developmental
> path, not a benchmark-only path.
>
> The selector implementation must then be locked before founder ranking or selector
> measurement is revealed to its implementer. SEL-0 is run once against that locked
> implementation.
>
> Passing SEL-0 establishes acceptance eligibility for the developmental-selection
> capability. It does not itself authorize merge or deploy.
>
> Failing SEL-0 leaves the product gap open. The acceptance threshold may not be weakened
> to accommodate the implementation.

### Manifest C reclassified

```text
BEFORE     native surface available to the deployed selector
DISCOVERY  deployed selector DOES NOT EXIST
NOW        frozen candidate production-surface evidence
           NOT YET the selector input contract
```

The new selector's input contract is specified as product design first. Manifest C is then
checked structurally — without exposing stimulus — for exact or superset match. Match →
benchmark input derived deterministically from frozen C, no production re-read. No match →
STOP and resolve the fixture explicitly. *The benchmark fixture does not get to define the
product architecture by accident.*

### Two kinds of selection, permanently separate

```text
WRITER SELECTS   "I want to discuss o7."
                 exact-key resolution · no substitution · writer authority governs

MAIA SELECTS     "What is most useful to raise now?"
                 developmental selector · lawful candidates only
                 writer intention + scope + Work evidence govern
```

`"Never a nearest match"` survives untouched. The selector never overrides an explicit address.

### Frozen sequence

```text
1  record redesignation                      ← this document
2  specify selector PRODUCT CONTRACT         ← §2 below, PROPOSED
3  freeze SEL-0 instrument  R1 · R2 · R3 · response-format symmetry
4  verify fixture against contract, no stimulus exposure
5  lock acceptance standard — NO threshold changes after this point
6  implement smallest REAL Studio selector — actual path, no benchmark substitute
7  lock selector implementation + model/config
8  founder opens Manifest B for the first time · ranks · locks
9  run locked selector once against frozen lawful native fixture
10 compare against frozen SEL-0 rule

PASS → gap eligible to close → proceed to F-7
FAIL → gap remains open · diagnose implementation · the benchmark does not move
```

---

## 2 · Product contract — Q1–Q6 INCORPORATED

**Status: RATIFIED — founder act, 2026-09-08. Q1–Q8 ruled and incorporated.**

> **Adoption, explicit.** *"I adopt Q1–Q6 as recorded in `676aa8e59` as my founder
> rulings."* — founder, 2026-09-08.
>
> **Provenance, kept rather than erased.** The Q1–Q6 wording originated as a recommendation
> and was adopted afterwards by the explicit act above, not by implication from the
> instruction to incorporate it. Q7 and Q8 were ruled directly. The record of how each
> became authoritative is retained.

### 2.1 Invocation condition — Q2 RULED

Selection is permitted **only** when all hold:

```text
a  a frozen developmental reading is open in the Develop room
b  the lawful candidate set is non-empty                  (>= 1, see note)
c  not every lawful candidate has already been offered in this commission
d  the writer has NOT named an observation in this act
e  the route receives an EXPLICIT writer-originating selection commission
```

⚠️ **(b) was `>= 2` in the pre-ruling draft; corrected to `>= 1`.** That threshold was my
drafting, and Q6 contradicts it: at exactly one lawful candidate a `>= 2` gate would skip
the selector entirely and force the sole observation to be offered, making
`DECLINE_TO_SELECT` unreachable precisely where restraint may be the correct developmental
act. With one candidate there is nothing to order, but there is still something to judge —
whether it is worth raising at all. Applying Q6, not defaulting a new question; reversible
if that reading is wrong.

⛔ **(c) is necessary but not sufficient.** Absence of `observationKey` never confers
permission to choose — that would convert missing specificity into authority.

```text
COMMISSIONS      an explicit writer act asking MAIA what is worth raising
                 ("what do you notice?" · "what feels worth looking at?" ·
                  "help me develop this" · a later explicit "what else?")

DOES NOT COMMISSION
                 room load · scope selection · navigation · a timer ·
                 completion of another dialogue · ambiguous free text
```

UI copy is a later design act. The contract is that the **signal is explicit and
writer-originating**, carried to the route as its own field — not inferred from the shape
of the request. It must not be added to `SUPPORTED_ANCHORS` or to either anchor parser:
those two boundaries stay frozen and non-interchangeable, and a commission is not an anchor.

### 2.2 Writer-selected-observation precedence — Q1, absolute

```text
if anchor.observationKey is present  ->  selectObservation() resolves it exactly
                                         the selector IS NOT INVOKED
```

Structural, not advisory. `parseDevelopmentalAnchor` and `"never a nearest match"` unchanged.

### 2.3 Lawful candidate-set boundary — Q3, Q5 RULED

```text
INCLUDED   observations in the open frozen reading
           F-7 eligible
           standing != 'dismiss'
           not superseded

EXCLUDED   F-7 ineligible          (ineligible, not low-ranked)
           dismissed by the writer  (Q5 — sticky, writer-reversible only)
           superseded               (Q3 — visible, writer-addressable, not MAIA-selectable)
           any other reading
```

**Q3.** Supersession operationally means: `VISIBLE yes · HISTORICALLY TRUE yes ·
WRITER-ADDRESSABLE yes · MAIA-SELECTABLE no`. MAIA may not autonomously resurrect a
superseded observation as current guidance. A genuinely new observation in a later reading
is a new object, governed on its own terms.

**Q5.** `dismiss` is sticky for that observation identity. It does not expire through time,
session change, revision, or MAIA inference. Re-eligibility requires an explicit
writer-authored standing change (`dismiss → unresolved` or `dismiss → keep`). **MAIA may not
decide a dismissal has expired.** Lifecycle authority belongs to the writer.

### 2.4 Permitted selector inputs

```text
the lawful candidate observations themselves
the writer's present turn and stated intention
the commissioned lens and reading scope
the frozen read_state (revision, section topology, coverage)
member-authored standings: keep | dismiss | unresolved
which observations already have open ask_threads
evidentiary strength carried by the observation itself
```

Each is the Work, the writer's own act, or the reading's own provenance.

### 2.5 Prohibited inputs

```text
engagement, dwell, retention, any usage-derived signal
inferred member psychology, state, or developmental level
cross-member or aggregate patterns
any signal created by or for the benchmark
anything post-dating the frozen reading's snapshot
the founder's SEL-0 ranking, the threshold, any benchmark annotation
```

### 2.6 Output form — Q6 RULED

```text
GATES — determined BEFORE the selector is invoked, deterministically
        EVALUATED IN THIS ORDER

  1 SELECTION_BOUNDARY_UNMEASURED         the lawful candidate boundary cannot be
                                          established — supersession assessed as
                                          `unmeasured` (live Work could not be loaded)
  2 NO_LAWFUL_CANDIDATE                   zero lawful candidates exist
  3 NO_REMAINING_CANDIDATE_THIS_COMMISSION  lawful candidates exist, but all have
                                          already been offered in this commission

SELECTOR OUTCOMES — only reached when a lawful, not-yet-offered candidate exists

  ORDERING over those candidates + declared confidence
  DECLINE_TO_SELECT                       candidates exist, confidence insufficient
```

### Amendment — Q12, founder act 2026-09-08

⛔ **`SELECTION_BOUNDARY_UNMEASURED` is a new operational state added to this ratified
contract by explicit founder act.** Recorded as an amendment rather than folded in silently;
the contract's ratification at `ebcb46d0d` stands and this is the first change to it.

Supersession is three-state (`assess.ts`), and the third state is not a judgment:

```text
current      supersession predicate PASSES
superseded   candidate EXCLUDED
unmeasured   BOUNDARY NOT ESTABLISHED -> selection must not run
```

*An inability to load or measure the live Work must never masquerade as a substantive
candidate decision.* Converting `unmeasured` into either inclusion or exclusion would turn
not-knowing into knowing — all-lawful or all-excluded on an infrastructure fault.

**It is NOT** `NO_LAWFUL_CANDIDATE`, **not** `DECLINE_TO_SELECT`, **not** a dismissal, and
**not** supersession. It says only: *the system cannot currently establish the lawful
candidate boundary.* Member-facing wording may stay quiet and human; **the internal state
must remain exact.**

⚠️ **Gate order is load-bearing.** The boundary gate is evaluated FIRST. Evaluating
`NO_LAWFUL_CANDIDATE` while supersession is unmeasured would compute a candidate set from an
unestablished boundary and return a confident answer built on it — precisely the error the
amendment forbids.

**The two gates are structural, not judgments.** Q7 rules `NO_LAWFUL_CANDIDATE` is
determined before invocation — when the set is empty the selector is **not invoked**.
`NO_REMAINING_CANDIDATE_THIS_COMMISSION` is determined the same way and for the same
reason: it is mechanical set arithmetic over Q8's commission-scoped offer record, carrying
no interpretation. Neither gate is a member of the comparative ranking statistic; both
belong in SEL-0 as deterministic product-contract gates.

**`DECLINE_TO_SELECT` is terminal within its commission.** The inputs are unchanged by a
decline, so re-invoking on a subsequent "what else?" would deterministically decline again.
This is mechanical, not a further authority question.

**No forced pick.** Decline is a first-class product outcome, not an error path. The
founder-side SEL-0 protocol must carry the corresponding *"none warrants raising now"*, or
the instrument would force both sides to manufacture preference where the correct
developmental act is restraint. Scoring of decline combinations is R1/R2 and is **not**
ruled here.

Confidence is internal. It is **not surfaced as a number** — a percentage beside a
developmental observation reads as authority, which §2.8 forbids.

### 2.6a Disclosure on an empty set — Q7 RULED

```text
DEFAULT     state neutrally that there is no observation currently available
            to raise; do NOT volunteer that the writer dismissed everything,
            and never frame the writer's lifecycle choices as a problem

ON REQUEST  if the writer explicitly asks why, disclose the structural
            provenance truthfully and neutrally (dismissed · superseded),
            WITHOUT recommending that a dismissal be reversed
```

*Transparency on request is not authority to reopen lifecycle decisions.* Q5 gives the
writer lifecycle authority; a system that volunteers the cost of exercising it would erode
that authority while formally respecting it.

### 2.7 Product surface — Q4 RULED

```text
selector internally      ordered candidates
Studio conversationally  ONE observation, offered
```

Writer's Studio does **not** display a ranked list. On rejection or an explicit "what else?",
the next lawful candidate may be offered. This keeps development a conversation rather than
a "top 5 things wrong with your manuscript" report, and leaves alternatives available
without confronting the writer with an authoritative-looking menu.

### 2.8 Authority and uncertainty — Q1 posture binding

```text
selection is an OFFER, never a redirection of the session
the writer may accept, reject, correct, redirect, deepen, or ignore
low confidence -> DECLINE_TO_SELECT, stated plainly
never presented as diagnosis, priority, instruction, or ranking
no selection is recorded as authority over the Work
```

**The anti-steering posture of the room's `⛔` survives Q1 intact.** MAIA may not choose the
writer's scope, preselect on load, ambiently recommend a starting place, override a
writer-addressed observation, or turn selection into instruction. The selector operates
*after and beneath* that rule, inside a scope the writer already chose, only on explicit
commission.

### 2.8a Offer memory — Q8 RULED

MAIA may retain which observations she has offered **only for the life of the current
explicit selection commission**, solely so `"what else?"` advances monotonically.

```text
offered_this_commission
  MAY   prevent re-offering inside THIS commission
  MAY NOT  alter standing
  MAY NOT  imply keep | dismiss | unresolved
  MAY NOT  affect later commissions
  MAY NOT  become longitudinal Work understanding
```

**Ignoring an offer is not a dismissal. Rejecting one and asking "what else?" is not a
dismissal.** When the commission ends, prior offers confer no authority on future selection.

**Persistence and authority are not the same thing.** If `ask_threads` / `ask_turns`
physically persists offer provenance for transcript or audit purposes, that persistence is
permitted — the selector is contractually forbidden from consuming it outside the
originating commission. *Persistence of MAIA's conduct does not confer future selection
authority.*

### 2.9 Runtime integration point — the actual Studio path

```text
component   lib/manuscript/ask/  (new module, sibling of developmentalAnchor.ts)
invoked by  app/api/sovereign/manuscripts/[id]/ask/route.ts  POST,
            on the branch carrying an explicit selection commission
consumed by the MAIA turn of the ask thread — the existing
            ask_threads / ask_turns surface
surfaced in app/writers-studio/develop/DevelopRoom.tsx
```

⛔ Not a script, agent, offline scorer, or benchmark harness. If the selector cannot be
reached from the ask route, the gap is not closed.

### 2.10 Downstream consumer

The MAIA turn of an ask thread. Selection determines *what MAIA raises*; the existing
developmental dialogue determines *how*. Nothing else consumes it in v1 — no rendering, no
ordering, no derived persisted state.

---

## 3 · Consistency review — Q1–Q8 · RESULT: no unresolved product-authority question

Contract-only review. Nothing implemented, no provider called, Manifest B/C and the source
snapshot not opened, R1/R2/R3 not opened.

### One real contradiction, found and resolved by applying an existing ruling

**`>= 2` lawful candidates as an invocation condition contradicted Q6.** At exactly one
lawful candidate, that gate skipped the selector and forced the sole observation to be
offered — making `DECLINE_TO_SELECT` unreachable at the precise point where restraint is
most likely to be the correct developmental act. Corrected to `>= 1` (§2.1b).

The threshold was **my drafting, not a founder ruling**, and Q6 decides it: decline must be
reachable wherever a candidate exists. So this applies Q6 rather than defaulting a new
question. At n=1 there is nothing to order but there is still something to judge — whether
it is worth raising at all. Reversible if that reading is wrong.

### Two mechanical specifications, carrying no interpretation

```text
NO_REMAINING_CANDIDATE_THIS_COMMISSION   specified as a GATE before invocation,
                                         matching Q7's treatment of the empty set —
                                         set arithmetic over Q8's commission record

DECLINE_TO_SELECT                        terminal within its commission: inputs are
                                         unchanged by a decline, so re-invoking would
                                         deterministically decline again
```

Both follow the founder's own framing of these as mechanical rather than interpretive.

### One tension recorded, resolved, not escalated

§2.4 permits the selector to read **which observations already have open `ask_threads`**,
and threads persist across commissions. Q8 confines *offer* memory to one commission. Since
an engaged offer typically produces a thread, thread-presence is a **partial proxy** for
past offers, so some cross-commission trace of MAIA's conduct survives.

Resolved on the distinction the founder already drew: a **thread records the writer's act of
engaging** — writer-authored, permitted, and durable; an **offer records MAIA's act** —
which is what Q8 confines. The proxy is imperfect (an ignored offer leaves no thread) and
the authority basis differs. Recorded rather than escalated; reversible by narrowing §2.4.

### Checks that came back clean

```text
writer precedence vs selection      no overlap — selector not consulted when a key is named
Q3 superseded vs Q5 dismissed       independent exclusions, no interaction
Q7 gates vs Q6 decline              disjoint by construction; gates precede invocation
Q4 one-at-a-time vs ORDERING        internal ordering, single surfaced offer, no conflict
Q8 scope vs longitudinal memory      no path from offer memory to Work understanding
anchor boundaries                    commission is a field, not an anchor; both frozen
                                     parsers and SUPPORTED_ANCHORS untouched
anti-steering posture (Q1)           preserved in §2.8; selector operates after and beneath
```

**No genuine unresolved product-authority question remains.**

---

## Standing

```text
SEL-0                  PRE-BUILD ACCEPTANCE STANDARD (redesignated)
product gap            OPEN — Studio lacks developmental selection
selector contract      RATIFIED — founder act, 2026-09-08 · Q1–Q8 incorporated
Manifest C             frozen production-surface evidence, NOT the input contract
R1 · R2 · R3           NOT OPENED
threshold              UNSET
founder ranking        NOT STARTED
MAIA ranking           NOT STARTED
Manifest B             NOT OPENED
selector                NOT IMPLEMENTED
```

Nothing was inspected in Manifest B, Manifest C or the source snapshot to produce this
document; no provider was called; nothing was ranked.
