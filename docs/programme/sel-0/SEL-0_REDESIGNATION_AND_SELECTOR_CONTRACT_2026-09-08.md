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

**Status: Q1–Q6 ruled and incorporated. NOT RATIFIED — two new questions returned (§3).**

> **Provenance of the Q1–Q6 rulings, kept rather than erased.** The ruling text was drafted
> as a recommendation and delivered as a founder ruling in the same message. It is recorded
> here as a founder act of 2026-09-08. If a separate adoption act was intended, this block
> flips to PROPOSED on request; nothing downstream depends on the distinction yet.

### 2.1 Invocation condition — Q2 RULED

Selection is permitted **only** when all hold:

```text
a  a frozen developmental reading is open in the Develop room
b  the reading holds >= 2 lawful candidates
c  the writer has NOT named an observation in this act
d  the route receives an EXPLICIT writer-originating selection commission
```

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
ORDERING over the lawful candidates + declared confidence
        OR
DECLINE_TO_SELECT
```

**No forced pick.** Decline is a first-class product outcome, not an error path. The
founder-side SEL-0 protocol must carry the corresponding *"none warrants raising now"*, or
the instrument would force both sides to manufacture preference where the correct
developmental act is restraint. Scoring of decline combinations is R1/R2 and is **not**
ruled here.

Confidence is internal. It is **not surfaced as a number** — a percentage beside a
developmental observation reads as authority, which §2.8 forbids.

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

## 3 · Q1–Q6 CLOSED · two genuinely new questions returned

Q1–Q6 are ruled and incorporated above. Working through their consequences surfaced two
questions that did not exist before those rulings and that cannot be safely defaulted.

### Q7 · An empty lawful candidate set is not the same as a decline

Q3 and Q5 together can empty the candidate set — every observation dismissed, or every one
superseded. §2.6 then yields `DECLINE_TO_SELECT`, and MAIA says she has no clear one. **But
that is not what happened.** Two different states collapse into one utterance:

```text
DECLINE     candidates exist; confidence insufficient
EMPTY       no lawful candidate exists at all
```

Saying "I don't have a clear one" when the truth is "you have dismissed all of them" is a
false account of MAIA's own state, and this project treats that as a defect rather than a
kindness.

The follow-on is why this is an authority question, not a wording one: **if MAIA discloses
that the set is empty because the writer dismissed everything, is that pressure to
un-dismiss?** Q5 gives the writer lifecycle authority; a system that reports the
consequence of exercising it may erode that authority while formally respecting it.

```text
a  EMPTY is a distinct outcome, disclosed plainly
b  EMPTY is a distinct outcome, disclosed without naming the cause
c  EMPTY collapses into DECLINE   (rejected in the draft as dishonest — needs a ruling)
```

### Q8 · Is a MAIA offer recorded, and if so does that create authority?

Q4 permits "what else?" to advance to the next candidate. Standings are `keep | dismiss |
unresolved`, plus UNSET. **An observation MAIA offered and the writer simply ignored stays
UNSET** — indistinguishable from one never offered. §2.4 permits reading which observations
have open `ask_threads`, but an offer that produced no thread leaves no trace at all.

```text
NO RECORD   MAIA may re-offer the same observation every session — nagging,
            and it makes "what else?" non-monotonic within a session

RECORD      new persisted state describing MAIA's own past behaviour toward
            this writer — which is precisely the kind of accumulated memory
            the programme is careful not to let acquire authority
```

Neither is obviously right. Recording is the smaller technical change and the larger
constitutional one. **A middle form exists — offers retained for the life of the
commission and discarded after, so "what else?" is monotonic within a conversation and
carries nothing across sessions** — but choosing it is a founder act, since it decides how
much MAIA is permitted to remember about her own conduct.

---

## Standing

```text
SEL-0                  PRE-BUILD ACCEPTANCE STANDARD (redesignated)
product gap            OPEN — Studio lacks developmental selection
selector contract      Q1–Q6 INCORPORATED · Q7–Q8 RETURNED · NOT RATIFIED
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
