# WS2-05B-8B-02b — the real reading, witnessed

**Head:** `4c6da816c`, verified in the worktree by `git rev-parse` before the run.
**Book:** Elemental Alchemy, `a3ae67fd-a21e-4948-8766-4c397d2e4712`, 174 sections.
**Proposal:** `e6cabcc4-a506-4ea7-aa89-9b23b450ca74`
**Run:** 2026-08-31, Mac Studio, Kelly's act, one call.

**What this record claims:** that the reading arrived COMMUNICABLE — the
distinction a reader needs was available to MAIA when she was asked for it
explicitly, and it stayed on her side of the adoption seam. **It does not claim
the reading is right.** That is 05B-8b, and it is a founder judgment.

---

## Preflight — PASS on the real Work

```text
DERIVED — read out of live code in this process
  promptContractHash             a1825a7c2f50…
  readerVersion                  REAL-STRUCTURE-READER-01
  editorialLabel required        true
  editorialSynthesis required    true
    its fields                   thesis · strongestFindings · questionsForAuthor
  ceilings                       4/request · 8/read · 60,000 chars

SENTINEL — a textual test on the request
  pass 1 bodies                  0 (no requested-sections block)

DISPLAYED — enforced in the host loop and its tests, not here
  no truncation                  whole section or no section
  Materials                      out of scope
```

The pass-1 request was read rather than trusted to the sentinel: 174 rows of
`position → uuid → heading`, 24 mechanical observations whose only quoted
strings are headings and single tokens, and the closing instruction. No
`SECTIONS YOU REQUESTED, IN FULL` block; no prose from the book.

**Two operator failures preceded it, and neither cost a call.** A trailing
`# → sha` comment ran the DRY_RUN against a four-commit-stale worktree (zsh does
not treat `#` as a comment interactively); the missing `PREFLIGHT` block is what
caught it, because a stale build cannot print a block it does not have. Then two
attempts ran from the main checkout, where the script does not exist —
`ERR_MODULE_NOT_FOUND`, loud and free. Chaining `cd … &&` into the same command
closed it.

---

## The run

```text
model           claude-opus-5
readerVersion   REAL-STRUCTURE-READER-01
promptHash      a1825a7c2f50

pass 1          request_sections     in 21,254 / out   316 · 0 bodies
pass 2          propose_structure    in 23,721 / out 7,926 · 4 bodies

coverage        requested-full · 4/8 sections · 5,614/60,000 chars
                truncated false · 2 passes
form            stable
unaccounted     0 of 174
uncertain       4 regions
divisions       22, three levels deep

elapsed         121.5s
proposal        e6cabcc4-a506-4ea7-aa89-9b23b450ca74
```

---

## OBSERVED READER BEHAVIOR

**Not founder acceptance of the interpretation.** Properties of the instrument
working as specified, checkable from the output without judging the reading.

### The five siblings — the shape 8B failed on

```text
kind      title   editorialLabel
element   null    Fire      42–69
element   null    Water     70–82
element   null    Earth     83–96
element   null    Air       97–108
element   null    Aether    109–122
```

**This is the strong outcome.** The distinction was genuinely available to the
reader when asked for it explicitly. In the 8B failure these same five rows read
`element` five times with nothing to tell them apart; the titles are still null,
because the Work does not name them, and the labels now carry what she can see.

The two null-vs-label states behaved as designed on the rest of the tree too:
untitled divisions at every level carry a label (`awakening and the call`,
`spiral, torus and trinity framing`, `the turn toward the four elements`), and
titled ones carry a label that describes rather than repeats.

### Label discipline held

```text
labels                    22 given · 0 declined (null) · 0 absent · of 22
label leaked into title   none
```

**Zero declines is worth naming rather than celebrating.** The contract makes
`null` lawful precisely so a label is not manufactured, and on this Work she
grounded one every time. That is consistent with a book whose divisions are
nameable; it is not evidence that she would decline where she should. Only a
Work where the grounding is genuinely absent can test that, and this run does
not.

### The letter

```text
editorialSynthesis   5 findings · 5 questions
```

The thesis stands on its own without the account — *"a finished book with a
three-part architecture that it declares in its own contents list… what needs
attention is the seams between parts and the fact that several apparatus
sections currently read as though they were chapters."*

The findings are selective rather than a restatement of the tree: five claims,
not twenty-two. Three are checkable assertions about the book (163 headed
`CHAPTER 1` contains only citations; 151–157 are the promised per-type chapter
summaries; the Earth conclusion at 82 stands before the Earth introduction at
83), and two are absences she noticed (the Preface has no section of its own;
the Four Grades appendix has Water, Earth and Air but no Fire and no Aether).

The questions are doubts turned outward, each naming its places, and each states
what turns on the answer rather than logging a tag:

```text
Does Part Two begin at the Sacred Flame, or earlier?            35,36,41,42
Is 'Conclusion: Embarking on the Journey of Earth' misplaced?   82,83
Does 'Integrated Reflection' close Aether or open Part Three?   122,123
Is the Elemental Astrology material appendix or body?           158,159,160
Where is the Four Grades of Fire?                               148,149,150
```

### Sovereignty

```text
canonical fingerprint   86f8ae098e16  →  86f8ae098e16   NONE
bodies that left        4 sections · 5,614 chars · 9.4% of the character budget
proposal                stored, frozen, reader provenance attached
```

The Work held one canonical unit before the run — Kelly's authored Fire division
— and holds the same one after. Before == after over units AND memberships.

**"The old proposal is untouched" is structural here, not measured.** The runner
imports the proposal store and calls `createProposal`, which inserts; no path in
it updates or deletes another row, and `interpretation` is immutable at the
database. That is a stronger guarantee than an observation, but it is a
different KIND of claim, and this record says which. To measure it:

```sql
SELECT id, review_revision, left(interpretation_input_hash, 12), created_at
  FROM manuscript_structure_proposals
 WHERE manuscript_id = 'a3ae67fd-a21e-4948-8766-4c397d2e4712'
 ORDER BY created_at;
```

---

## The reading MOVED, and that is a finding in itself

Not only its presentation. Against Run B — `2a427a6f-86b5-4ba3-a901-267710977f25`,
prompt `7d4e27cfa81d`, the same book and the same model:

```text
                    Run B (7d4e27cfa81d)      this run (a1825a7c2f50)
form                mixed                     stable
divisions           11, two levels            22, three levels
titles              9 of 11 null              10 of 22 null
part vocabulary     refused Part/Chapter      adopted the Work's own PART names
Fire                43–69                     42–69
Water               70–81                     70–82
uncertain regions   3                         4
output tokens       4,110                     7,926
elapsed             73.0s                     121.5s
```

Run B said the Work's three-part scheme *"exists only in the contents list and
cannot be laid over the body without inventing seams."* This run reads the same
apparatus and reaches the opposite conclusion: the PART labels are *"real to the
book's architecture but the sections carrying them are apparatus, not the parts
themselves"* — and then lays them over the body.

**Two explanations fit, and one run cannot separate them.**

1. The editorial contract changed the reading. Being asked to say what she can
   see may have licensed committing to a declared architecture she previously
   held at arm's length.
2. Ordinary run-to-run variance on a genuinely hard Work, where Run B's own
   account already named these seams as its least secure part.

**Recorded as an open question, not resolved by assertion.** Separating them
needs a second reading under one of the two contracts, which is a new
authorisation and not part of 02b.

**A judgment call inside it, flagged for 8b rather than called a defect.** She
holds that sections 1–4 are contents-list apparatus AND uses their text as the
titles of the body's parts. The titles are the Work's own words, so nothing is
invented, and the account states the distinction explicitly. Whether that is the
right call about this book is the founder's to make.

---

## Board

```text
02b types/parser/schema       PASS
02b commentary/adoption seam  PASS
02b adversarial fixture       PASS
02b contract witness          PASS
02b real-Work DRY_RUN         PASS
02b real reading              OBSERVED — communicable · labels grounded ·
                              no leak · fingerprint unchanged
02b founder ruling            PENDING
02a editorial surface         HOLD, behind that ruling
02c Ask MAIA                  HOLD
05B-8b semantic judgment      HOLD
05B-6 adoption                HOLD
```

**What 02a now has that it did not.** A frozen row carrying labels on every
division, a structured letter with a thesis and five answerable questions, and
an adversarial fixture that reproduces the five-identical-siblings shape. The
room can be designed against a reading that can be communicated — which is what
the whole unit was for.

**What is still not settled.** Whether MAIA perceived *this* book. The reading
makes checkable claims — that 163 is bibliography, that 151–157 are per-type
summaries, that 82 is displaced — and it moved substantially from the previous
one. **05B-8b, and it is a founder judgment, not a test result.**
