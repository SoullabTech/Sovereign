# WS2-07-F1 — RATIFIED DEVELOPMENTAL SEMANTICS

> **Canon. Founder act 2026-09-04, ratifying WS2-07-F1 act 1 with two refinements, on the
> WS2-07C-F1 determination (C — reader / classifier boundary).**
>
> This document is the meaning contract the 07B reader and the 07C classifier implement. Where it
> and an implementation disagree, this governs.

```text
DETERMINATION   C — reader / classifier boundary.  NOT A.  B rejected for v1.
FAMILY          eight. No ninth phenomenon. No structural-uniformity category.
PRESERVED       unclassifiable · refuse-whole · one classifier call · lens ⇄ phenomenon independence
LANE            WS2-07-F1 · DEVELOPMENTAL SEMANTIC BOUNDARY REPAIR
```

## Why a meaning contract had to exist

`UNDERSTAND §4` named eight phenomena and said its list was **illustrative**, leaving the semantics
to DECIDE. DECIDE defined none. The 07C opening act correctly froze UNDERSTAND verbatim and thereby
closed a family whose meanings had never been fixed. In parallel, the reader received its
commissioned lens as a bare token. Both model acts were supplying semantics from the words
themselves at exactly the boundary where reproducibility is required.

WS2-07C-F1 measured the cost: over three acts on one fixture the reader produced the same
structural-uniformity claim each time, and the classifier labelled it `positional-asymmetry` twice
and `unclassifiable` once. The label it reached for means the opposite of what the claim said, and
its own prompt forbids stretching a category. The refusal was the compliant act.

## 1 · The seven lenses — RATIFIED

Source of truth: `DEVELOPMENTAL_EDITOR_CAPABILITY.md` §"The lenses", verbatim. Rendered to the 07B
reader as the meaning of the **commissioned** lens only.

| Lens | Asks |
|---|---|
| **Structure** | Does this belong here? Does the sequence work? What is missing? What repeats? |
| **Development** | Which ideas are underdeveloped · sufficiently developed · overexplained · introduced too late · abandoned · repeated without advancing? |
| **Continuity** | Prospective language where later has already happened. Requires chronology across the Work, not phrase search. |
| **Arc** | What journey does this chapter take the reader through, and what journey has the whole book taken? |
| **Voice** | Where does this depart from the established voice of this Work — the manuscript itself is the reference, never an external standard. |
| **Coherence** | Internally consistent? Has a term changed meaning? Does this contradict an earlier chapter? |
| **Reader** | What does the reader already know here? Where might they lose orientation? |

**Two riders, ratified with the meanings.** Neither is a new lens semantic; each stops a lens
smuggling a higher epistemic layer downward.

- **Development.** *abandoned* is an **interpretation** and is not available at the observation
  layer. The reader may notice that something is introduced and not taken up again; it may not say
  it was abandoned, or why. (`UNDERSTAND §4` places `unresolved` at observation and `abandoned` at
  interpretation. The capability spec's word stands where the spec uses it.)
- **Arc.** Scope-sensitive exactly as UNDERSTAND states: a bounded passage has a shape regardless of
  declared structure; a division-level arc requires authored division identity; a whole-Work arc
  requires authoritative structure and coverage actually read.

## 2 · The reader boundary — RATIFIED

> **A `ReaderClaimDraft` may not consist solely of content that can be re-derived mechanically from
> the Work or the member's declared structure. Pure measurements belong to mechanical evidence. A
> valid `ReaderClaimDraft` must add a developmental noticing whose falsity requires reading the
> Work, not merely rerunning a count, length, position, heading, topology, or other container
> measurement. Mechanical facts may appear in support of that noticing; they may not be the noticing
> itself.**

The precision matters. `UNDERSTAND §1`'s own worked example depends on an observation resting on
measurements:

```text
EVIDENCE     X appears in 18-21 and not again until 47      ← measurement
OBSERVATION  the thread disappears for a substantial stretch ← rests on it, is not it
```

So the rule is not *"no measurements in a claim"*. It is *"not **only** measurements"*. That
excludes the Lantern Road claim — numeral headings, a 196–267 code-point band, each authored part
holding exactly three — every clause of which is a measurement, and which answers none of the six
questions the Development lens asks.

## 3 · The eight phenomena — RATIFIED

Rendered to the 07C classifier, and to nothing else.

| Phenomenon | IS | IS NOT |
|---|---|---|
| **recurrence** | an element — word, phrase, image, figure, named entity or attribute — appears at two or more **separated** points in what was read | a property holding uniformly across every unit read; a whole-Work pattern from partial coverage |
| **unresolved-thread** | something is introduced and not taken up again within what was read; or the text marks something as still withheld | that the author abandoned it, or why — that is interpretation |
| **register-shift** | the claim's content is directly a change in the **manner of telling** — tense, person, distance, diction, register, mode of presentation | a departure from a standard outside this Work; a broader trajectory in which a change of telling is only one part |
| **prospective-reference** | the text points **forward** to something it defers | a verdict on whether the forward reference is satisfied where the span it points into was not read |
| **re-explanation-first-mention** | something is introduced as new after being established, or explained again after being explained; or used as known without being introduced | what a reader actually experiences |
| **movement** | a tracked element or quality changes state **across a span** — intensity, orientation, disclosure, relation, placement — the change stated in the text | the journey's meaning or value; a claim fully expressed by the change in telling; uneven distribution with nothing tracked as changing |
| **term-drift** | one specific term or phrase carries a **different sense** at different points read | the same term recurring unchanged; different words for one thing with no change of sense |
| **positional-asymmetry** | an element, quality, mode or kind of material is meaningfully **unevenly distributed** across comparable positions or member-authored divisions — present, direct, concentrated or explicit in one region and absent, indirect, sparse or disclaimed in another | uniformity or regularity; mechanical container properties (heading format, lengths, counts, division sizes); one tracked thing changing through sequence; merely an unresolved thread |

**Provenance.** `unresolved-thread` and `movement` are UNDERSTAND §4 verbatim. `recurrence` is its
Repetition ruling. `prospective-reference`, `re-explanation-first-mention` and `term-drift` come from
the Continuity, Reader and Coherence lenses of the capability spec. `register-shift` from the
crossings plus the Voice lens. **`positional-asymmetry` had no source anywhere in the corpus** and
was defined by the founder from the sound uses in the WS2-07C-F1 fixture — of which the clearest is
Mara's interiority given directly across *Before the water* and withheld or disclaimed across
*After*.

### Precedence, where two could apply

```text
register-shift / movement       register-shift when the claim's content is FULLY EXPRESSED by the
                                change in the manner of telling; movement only where the claim
                                describes a broader tracked trajectory the change participates in
movement / positional-asymmetry movement is change THROUGH a sequence;
                                positional-asymmetry is uneven DISTRIBUTION ACROSS positions
recurrence / term-drift         sense changes → term-drift; recurs unchanged → recurrence
```

And, closing the family: a claim whose whole content is a measurement of the container notices no
phenomenon here, however true it is.

## 4 · What act 2 implemented

```text
07B  lib/manuscript/developmentalReader/contract.ts   LENS_MEANING (capability spec, verbatim) + LENS_RIDER
     lib/manuscript/developmentalReader/render.ts     the commissioned lens rendered WITH its meaning
                                                      and rider; the claim boundary as system rule 3
                                                      (rules renumbered 3-7); READER_VERSION → -02
     the reader is NOT given the phenomenon taxonomy — asserted, not assumed

07C  lib/manuscript/developmentalReading/contract.ts  PHENOMENON_DEFINITION (is / isNot) for all eight
     lib/manuscript/developmentalReading/classify.ts  the family rendered WITH definitions and
                                                      exclusions; the precedence rules; the
                                                      measurement exclusion; CLASSIFIER_VERSION → -02
     the classifier is NOT given the lens meanings and NOT given manuscript prose — asserted

UNCHANGED  unclassifiable · refuse-whole · one classifier call · the tool schemas · the eight-value
           family · every 07A/07C persistence path · BUILD-07D
```

Both prompt hashes move because both system prompts moved. That is the provenance bump the
authorization requires: a reading frozen before this repair is historical fact, not an invalid one,
and nothing in the reading unit compares a version against a constant.

## 5 · How it is proved

**Structurally, without a model** — `lib/manuscript/__tests__/developmentalSemanticContract.test.ts`:
every lens meaning is quoted from the capability spec (the test reads the document and matches);
the commissioned lens reaches the reader with its meaning and no other lens's; the riders ride; the
boundary rule names every container measurement the Lantern Road claim used; the reader is never
given a phenomenon name; the classifier is never given a lens meaning; all sixteen IS / IS NOT
strings render; the precedence rules render; `unclassifiable` and refuse-to-stretch are intact; the
tool still expresses exactly eight phenomena plus `unclassifiable`; both versions are `-02`.

**Live** — `scripts/ws2-07-f1-semantic-witness.ts`, on the same fixture that failed:

```bash
DATABASE_URL="postgresql://soullab@localhost:5432/maia_07a_witness" \
  npx tsx scripts/ws2-07-f1-semantic-witness.ts --acts 3 --out ~/maia-witness-logs/ws2-07-f1.json
```

It asserts only what a machine can settle — the commission freezes, the frozen reading carries the
`-02` provenance, and no claim carries the Lantern Road signature (a code-point band together with
heading or numeral uniformity). Every claim and its phenomenon are **printed for founder
adjudication and never auto-judged**: whether a register-only claim went to `register-shift`, a
trajectory to `movement`, and a genuine uneven distribution to `positional-asymmetry` is a semantic
reading, not an assertion a script may make.

Founder instruction, honoured: the regression does not rest on stochastic behaviour alone.

## 6 · What this does not do

It does not reopen 07A, 07B or 07C as units; it changes their prompts and versions under this lane's
authority and nothing else. It does not touch BUILD-07D — candidate `d005d59eb` and PR #1192 are
untouched, and 07D is refreshed against this repair only after it is canonical. It does not open
BUILD-07E. It adds no phenomenon, weakens no refusal, permits no partial freeze, and gives no model
a vocabulary that belongs to the other.
