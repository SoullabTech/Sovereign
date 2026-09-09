# WS-WHOLE-MANUSCRIPT-01 · §4b HUMAN WITNESS

**Performed:** 2026-09-09, by the founder, against the real book.
**Result: 7 PASS · 1 FAIL. §4b ACCEPTANCE NOT PASSING.**
**Production deploy: ⛔ HOLD.**

---

## 1 · The subject

```
implementation    e20e3270453b3be9bdb1718486b178124549fa0d   (H2, frozen)
canonical merge   d73ce1f24f71edfdec599eb4923a32742fea6577
witness tooling   f37979e2e8baca3e99a0e22c44b28c378fda29c3   (PR #1272, Class A, draft)
product drift     none — verified against canonical at run time
Work              ELEMENTAL_ALCHEMY · 848bbd74-d1ad-41a4-bfe0-238c34763e03
                  262 source sections · 262 addressable draft sections
runtime           isolated ephemeral cluster · loopback :3118 · NOT production
```

⚠️ **The Work identity does not adjudicate the duplicate question.** A second
record, `55742458-be2c-406a-a158-d0438cf02892`, is identical in title, section
counts and addressability. Selecting one for this witness decided nothing about
the other. `19039a86-4582-47f1-a847-84820f2471b5` — asserted earlier in the lane
as the subject — **matched no production row and is withdrawn.**

---

## 2 · The witness, verbatim

Recorded observation by observation, verdict and reaction kept separate.
Reactions are the founder's words and are not paraphrased.

```
1   PASS   "it works well. It'd be nice if the slider bar on right side was
            there to move quickly through and if I clicked on a section in
            manuscript it would show up in the manuscript sections area."

2   PASS   (no reaction recorded)

3   PASS   (no reaction recorded)

4   PASS   (no reaction recorded)

5   FAIL   "It lights up but I had to scroll to find it."

6a  PASS   (no reaction recorded)

6b  PASS   (no reaction recorded)

7   PASS   "I had to scroll but it is there."
```

**Observation 5 is the blocking failure.** The criterion is not that the rail row
lights up; it is that clicking a far section brings that section into view. The
row highlighted, the manuscript did not arrive, and the navigation request did
not complete.

**Observation 7's PASS is nuanced and the nuance is kept.** The section identity
survived the Whole → Section transition — which is what 7 asks — but the place
within it did not land under the reader's eye. The reaction stays in the record
and does not alter the verdict.

**Observation 1's reaction is a feature request, not a failure.** The book kept
flowing, which is what 1 asks. A fast positional scrubber, and rail selection
that reveals the section in the manuscript, are wants the witness surfaced. They
are recorded here and authorize nothing.

---

## 3 · FINDING B — a regression, surfaced during the same act

```
"The panel jumps up when I select something in Manuscript.
 It did that in the past and we fixed it but it is back."
```

Observed: selecting a manuscript section scrolls the whole field upward, pushing
the studio header to the top edge.

⛔ **A regression is a worse class than a new defect.** It means a fix existed,
was lost, and nothing guarded it. That is a finding about the repository's
memory, not only about this surface.

**Hypothesis, NOT a finding, and not to be acted on without its own
investigation:** both this and observation 5 involve `scrollIntoView`, which
scrolls *every* scrollable ancestor including the window unless constrained.
That would produce both symptoms from one cause. It has not been verified and no
repair is authorized here.

---

## 4 · ⭐ THE MACHINE PASSED CHECK 5. THE HUMAN FAILED IT.

This is the substantive result of the whole lane, and it must not be smoothed.

The committed runtime falsifier passed all twelve checks on `H2`, **including
check 5** — it clicked rail row 217, asserted the destination arrived within
120px of the scroll position, and asserted it stayed there. It passed against a
**synthetic corpus of 262 uniform six-line sections.**

On the real book — real section lengths, real chapter rhythm — the same gesture
leaves the writer hunting.

> A machine PASS makes the runtime mechanics eligible for human witnessing.
> It does not promote the human witness.

That ruling was written before anyone knew it would be needed. It was needed.
A synthetic fixture can establish that a mechanism *fires*; only a real
manuscript can establish whether the mechanism *arrives*.

**The falsifier is not wrong and is not to be weakened.** Its check 5 asks a
question that its corpus can answer. What this witness establishes is that the
question was too small — which is a finding about the instrument's reach, not
about its honesty.

---

## 5 · Machine evidence, for completeness

```
runtime falsifier on H2   12/12 PASS · 0 console errors · clean tree
CI on H2                  8/8 success · Docker completed 13:36:33Z
merge                     13:36:39Z — six seconds after the machine
                          conjunction was satisfied
```

⚠️ **Merge preceded this witness.** The machine gate was satisfied before the
merge; the constitution's pre-merge *human*-witness ordering was not. §4b was
performed afterwards, against the same frozen implementation. Recorded as it
happened rather than tidied: the ordering breach is a real finding with its own
standing, and acceptance now does not retroactively authorize it.

**Witness tooling history:** twelve tooling defects and one environment defect
were found and repaired before the first observation could be made. **Zero were
in Whole Manuscript.** Custody ordering was reversed mid-lane on founder ruling —
*real member text crosses the custody boundary only after every failure
discoverable without it has been eliminated* — after four real copies of the book
had been spent on failures that had nothing to do with the book.

---

## 6 · Standing

```
§4b human witness       ✅ COMPLETE
observations            7 PASS · 1 FAIL
§4b acceptance          ❌ NOT PASSING
blocking                observation 5 — far rail navigation does not arrive
also recorded           FINDING B — field jumps upward on section selection
                        (regression)

H2                      e20e32704… FROZEN
canonical               d73ce1f24… unchanged
production deploy       ⛔ HOLD
```

⛔ **Not authorized by this record:** any repair to observation 5; any repair to
Finding B; any change to the falsifier; production deploy; adjudication of the
ELEMENTAL_ALCHEMY duplicate; the positional scrubber or rail-reveal requests from
observation 1's reaction.

Each of those is its own lane, with its own classification, its own SHA, and its
own qualification. ⛔ **The observation-5 repair in particular must not be folded
into the witness tooling** — that would make "which subject was witnessed"
unanswerable for every claim that follows.

---

*This record asserts what was observed. It does not promote a FAIL to a PASS, and
it does not soften a reaction into a summary.*
