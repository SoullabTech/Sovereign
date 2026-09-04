# WS2-07C-F1 — PHENOMENON CLASSIFICATION COVERAGE

> **Bounded follow-up, opened by founder act 2026-09-04. DIAGNOSIS ONLY.**
>
> **CLOSED 2026-09-04 — founder determination: C.** Not A; B rejected for v1. The repair is opened
> as `WS2-07-F1_SEMANTIC_BOUNDARY_REPAIR_2026-09-04.md`. This lane authorized no repair and made
> none.

```text
LANE              WS2-07C-F1 · PHENOMENON CLASSIFICATION COVERAGE
PARENT            JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01
STATE             OPEN · DIAGNOSIS ONLY · no determination made

TRIGGER           07D Gate B measured `classifier_unclassifiable` on 3 of 5 commissioned acts
                  over the same invented Work

AUTHORIZES        inspect the exact failing claim(s)
                  compare them against the closed eight phenomena
                  compare successful classifications from the same fixture
                  determine A / B / C below

DOES NOT AUTHORIZE  prompt tuning
                    vocabulary expansion
                    changing refuse-whole semantics
                    changing 07B
                    changing 07D
```

## The measurement that opened this

Five commissioned acts, one invented Work (*The Lantern Road*), lens `development`, classifier
`DEVELOPMENTAL-PHENOMENON-01`, model `claude-opus-5`:

```text
07C Gate B run 3   act 1 frozen (7 observations) · act 2 unclassifiable · act 3 frozen
07D Gate B run 1   act 1 unclassifiable · act 2 unclassifiable
                   ────────────────────────────────────────────────────────
                   2 froze · 3 refused at classify
```

Founder, 2026-09-04: *"That is no longer a one-off stochastic curiosity. It is a measured product
dependency. But it still does not tell us which thing is wrong."*

## The three possibilities — the determination this lane exists to make

```text
A. EXISTING FAMILY COVERS THE CLAIM
   the classifier failed to map it
   → 07C classifier / prompt reliability defect
   → repair implementation, family unchanged

B. EXISTING FAMILY DOES NOT COVER THE CLAIM
   → the eight-value phenomenon vocabulary is incomplete
   → founder ruling required before anything is added

C. THE CLAIM IS NOT A DEVELOPMENTAL PHENOMENON AT ALL
   → reader / classifier boundary problem
   → the correct behaviour may be to drop or refuse that claim, but that is a
     contract ruling and is not invented here
```

The test the founder set: *if a reasonable editor can point to one of the existing eight without
stretching its meaning* → A. *If none fits* → B. *If the claim exceeds what a phenomenon classifier
should receive at all* → C.

## What was NOT recoverable, and why this lane needed an instrument

The founder's sequence was: read the `history` array → identify the failing claim indexes → recover
those exact `ReaderClaimDraft`s from the Gate B record → determine A / B / C.

**The third step is not possible against any existing record.** Confirmed in the code
(`lib/manuscript/developmentalReading/classify.ts`):

```text
the refusal detail   `claim ${index} does not fit the v1 phenomenon family; the freeze is
                      refused rather than a category invented`
                      → the INDEX survives. The claim TEXT does not.
the persistence      a refused commission stores NOTHING (07C §10) — there is no row to read
the witness          records the route's JSON response only: {refusal, stage, detail}
and one more         `parseClassifierBlocks` refuses on the FIRST unclassifiable index it meets,
                      which is right for a freeze and blind for a census: three failing claims
                      are reported as one
```

So the failing claim text exists nowhere after the act that produced it. Recovering it is the
mechanically necessary first step of the diagnosis this lane authorizes, and it takes an
instrument.

## The instrument — `scripts/ws2-07c-f1-classification-diagnosis.ts`

```bash
cd "/Volumes/T7 Shield/maia-07c-gate-b" || exit 1
git fetch origin claude/writer-author-studios-roadmap-b2tqf5 || exit 1
git checkout -q <branch tip> || exit 1
test -n "${ANTHROPIC_API_KEY:-}" || { echo "STOP: no ANTHROPIC_API_KEY in this shell"; exit 1; }
DATABASE_URL="postgresql://soullab@localhost:5432/maia_07a_witness" \
  npx tsx scripts/ws2-07c-f1-classification-diagnosis.ts \
    --acts 3 --scope whole --lens development \
    --out ~/maia-witness-logs/ws2-07c-f1-whole.json
```

**What it is.** Fixture through the real draft route (the same invented Work as both Gate B
witnesses, so the runs are comparable) → 07A capture → 07A recover → the real 07B reader → the
production classifier request through the production seam. For each claim it prints the full text,
its evidence refs, its non-conclusions, and the classifier's verdict for that index.

**What it is not.** Not a commission. It never calls `commissionReading`, never calls the store,
and writes no row — the *one commission, one reading* rule governs commissions; this is an
observation, and running it cannot produce, retry or repair a reading. Its fixture member,
manuscript and session are removed at the end.

**What it may not change, and how that is held.** It **imports** `CLASSIFIER_SYSTEM` and
`classifierTool()` verbatim rather than restating them, and prints `classifierPromptHash()` so a
run whose prompt differs from production's by one byte is visible immediately. Prompt, family and
refuse-whole semantics are untouched.

**The one deliberate difference.** It reads the RAW tool blocks so it can report a verdict for
**every** index, then runs production's own `parseClassifierBlocks` over those same blocks and
records that it agrees. Production semantics are observed, never bypassed.

**Wiring proved** 2026-09-04 in the remote session against the scratch database with a deliberately
invalid key: fixture, structure, capture, recover, reader call, seam, refusal handling, record and
cleanup all exercised; the run ended at `provider_unavailable — 401`, exactly as a refused reader
should. Only the model call itself awaits the founder's key.

## The scope hypothesis — recorded as a question, not a diagnosis

07C Gate B read four sections at body depth (`w1 w2 w3 w5`). The 07D route derives the scope the
07D opening act specifies: the **whole** addressable draft, six sections, structure supplied. More
sections → more claims → and 07C refuses the whole freeze if **any** claim is unclassifiable, so a
single classification miss costs the entire reading.

Founder, 2026-09-04: *"Don't use whole-section scope as the diagnosis yet… right now that is only a
hypothesis."* The instrument therefore takes `--scope whole | 07c` so the two can be **measured**
side by side on the same fixture. Measuring it settles nothing on its own; the failing claim text is
still the first evidence.

## Run 1 — 2026-09-04, founder-run, checkout `0e3924b33`, whole scope, 3 acts

Model `claude-opus-5`. Every act: 8 claims from the 07B reader, one classifier call.

```text
act 1   parse ok        · no unclassifiable
act 2   parse REFUSED   · unclassifiable [7]
act 3   parse ok        · no unclassifiable
        ─────────────────────────────────────
        24 claims classified · 1 unclassifiable · 1 of 3 acts refused
```

### The failing claim, and the same claim in the acts that passed

The instrument recovered what no record held. In all three acts the reader produced, as its LAST
claim, one structural observation about the Work's regularity — same evidence refs each time
(`section-run` + `structure-topology`):

```text
act 3  [7] → positional-asymmetry
  "All six sections open with a spelled-out numeral heading line ("One" through "Six") and fall
   within a narrow length band of 196 to 267 code points; the two member-authored parts each hold
   exactly three of them, in sequence order."

act 2  [7] → UNCLASSIFIABLE
  "Each of the six sections read opens with a spelled-out ordinal on its own line ('One' through
   'Six'), and each is between 196 and 267 code points long. The member's two divisions each hold
   three consecutive sections, splitting the sequence at the boundary between position 2 and
   position 3."

act 1  [6] → positional-asymmetry
  "Each section carries a spelled-out numeral heading in its first line ('One' through 'Six'), and
   the six sections are close in length (196-267 code points), the longest being position 2 and the
   shortest position 0. The member's structure divides them three and three at the point where the
   river rises."
```

Acts 2 and 3 are the clean comparison: materially the same claim, opposite verdicts.

### What the claim actually says, against the label that was used

The claim states **uniformity**: every section opens the same way, all six sit in a narrow length
band, each authored part holds exactly three. The only label reached for is
`positional-asymmetry`, whose word names the opposite. Act 1's variant carries a faint asymmetry
("the longest being position 2 and the shortest position 0"); act 3's does not, and was labelled
`positional-asymmetry` anyway.

The classifier's own instruction, verbatim from `CLASSIFIER_SYSTEM`:

> *If a claim does not notice any phenomenon in this family, answer "unclassifiable" for that claim.
> **Do not stretch a category to fit.** Do not invent one.*

By that instruction **act 2 is the prompt-compliant act** and acts 1 and 3 are the deviation. This
inverts the naive reading of the symptom: the refusals are not obviously the error.

### The condition underneath all three acts: the family reaches the classifier UNDEFINED

`UNDERSTAND §4` names the eight phenomena and **defines none of them** — the ratified list is eight
bare labels (`WS2-07-UNDERSTAND_DEVELOPMENTAL_READING_SEMANTICS.md` §"The ruling"). `CLASSIFIER_SYSTEM`
renders those labels verbatim with no gloss, which is correct fidelity to the ratified vocabulary
and leaves the classifier mapping free prose onto eight words whose meaning it must supply itself.
That is the condition under which one claim gets two different answers, and it is neither a prompt
defect nor a vocabulary gap on its own — it is the absence of a definition the vocabulary never had.

### The scope hypothesis — DISCONFIRMED without spending the comparison run

The `--scope 07c` run is unnecessary; the 07C Gate B record is already the four-section data point:

```text
07C Gate B run 3   4 body sections → 7 claims → 1 of 3 acts refused at classify
WS2-07C-F1 run 1   6 body sections → 8 claims → 1 of 3 acts refused at classify
```

Whole-draft scope adds **one** claim, not a materially larger refuse-whole exposure, and the
per-act refusal rate is the same in both. Scope is not the driver. What refuse-whole does do is
convert a small per-claim miss into a large per-reading refusal: 1 unclassifiable in 24 claims is
about 4% per claim, which over 8 claims is roughly a 28% chance of losing the entire reading —
matching the 1-in-3 observed, and matching 07C's own rate.

### Every act refused so far names the tail claim

```text
07D Gate B act 1   claim 7 of 8      (text not recoverable — the refusal predates this instrument)
07D Gate B act 2   claim 7 of 8
WS2-07C-F1 act 2   claim 7 of 8      = the uniformity claim above
```

In act 1 the same uniformity claim sat at index 6 and passed; in act 3 it sat at index 7 and
passed. So tail position does not by itself determine the outcome — but the reader reliably places
its most marginal claim last, and that is the claim at issue every time.

## Determination — proposed, for founder ruling

**Not A.** An existing phenomenon does not cover the claim *without stretching its meaning*, which
is the founder's own test. The two acts that classified it stretched a word meaning asymmetry to
cover an observation of uniformity, against the prompt's explicit instruction not to. The
inconsistency is real, but treating it as a reliability defect would authorize repairing the
classifier into stretching *more* consistently.

**Between C and B, and the evidence leans C.** The claim is about heading format, length band and
even division — the Work's typographic and structural regularity. Under a `development` lens, that
is at or over the boundary of what a phenomenon classifier should be asked to place. If such
noticing is legitimate developmental reading, then the family lacks a value for structural
uniformity and that is B, requiring a founder vocabulary ruling before anything is added.

**And a condition neither A, B nor C names:** the eight labels are undefined in the ratified
vocabulary and therefore undefined in the prompt. Whatever is ruled, an undefined family will keep
producing unstable placements at its edges.

Nothing here is authorized as a repair. The determination is the founder's; this lane produced the
evidence and stops.

## Sequence

```text
1  run the instrument                                          DONE — run 1 above
2  read the failing claims beside the successful ones           DONE — recovered and recorded
   (--scope 07c NOT needed: 07C Gate B is already the 4-section point, and it disconfirms scope)
3  founder determines A / B / C                                 ← HERE. Proposal recorded above.
4  only then is a repair or a ruling authorized — in its own act, in its own lane
```

## Founder determination — 2026-09-04 — **C**

> **C.** The failing claim is on the wrong side of the developmental boundary. It is mechanically
> true, but it is not a developmental phenomenon under the commissioned Development lens.
>
> The recovered claim is heading pattern, code-point length band and an even 3/3 authored division —
> all re-derivable directly from the Work and its state without a reader. `UNDERSTAND §1` places
> that in **MECHANICAL EVIDENCE**; a developmental observation is the next epistemic layer up. The
> canonical Development lens asks whether ideas are underdeveloped, sufficiently developed,
> overexplained, introduced too late, abandoned or repeated without advancing. The uniformity claim
> says none of those things.
>
> **The reader should not have advanced that mechanical regularity into a `ReaderClaimDraft` under
> the Development lens.**

**Not A**, as this lane proposed: the `unclassifiable` answer followed the classifier's contract,
and the two `positional-asymmetry` answers stretched a category the prompt forbids stretching.
Making that stretch reliable is the wrong repair.

**B rejected for v1**: no `structural-uniformity` ninth phenomenon. That would promote an
essentially mechanical fact into the developmental ontology. If a legitimate developmental
observation whose phenomenon genuinely is structural uniformity appears later, it returns as its own
evidence-driven vocabulary question; this fixture does not establish one.

**The undefined-family finding is ratified as a second finding**, and made a required semantic
repair rather than a fourth answer beside A/B/C. Two vocabularies are underdefined at runtime: 07B
receives the commissioned lens as a bare token, and 07C receives eight phenomenon names, not
definitions. Both model acts supply semantics from the words themselves at exactly the boundary
where reproducibility is needed.

**The refusal rule stands.** Once the family is defined, a mechanical-uniformity claim reaching the
classifier *should* produce `unclassifiable → refuse freeze` — correct fail-closed behaviour. The
repair is upstream at 07B.

**Repair opened:** `WS2-07-F1_SEMANTIC_BOUNDARY_REPAIR_2026-09-04.md`. This lane is CLOSED.

## What this lane does not do

It does not reopen BUILD-07C, whose closure stands. It does not touch BUILD-07D, which is
structurally proved and not closed. It proposes no phenomenon, tunes no prompt, and relaxes no
refuse-whole rule. It produces evidence and stops.
