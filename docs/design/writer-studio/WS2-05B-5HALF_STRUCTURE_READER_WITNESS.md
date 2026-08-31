# WS2-05B-5½ — REAL-STRUCTURE-READER-01 Witness Record

**Head:** `710c4e3d5`
**Book:** Elemental Alchemy, `a3ae67fd-a21e-4948-8766-4c397d2e4712`, 174 sections,
local dev against `maia_consciousness`. Kelly's own manuscript, not a fixture.
**Status:** **PASS · real-Work witnessed.** Closed 2026-08-31.

**What this record does NOT claim.** That MAIA read the book well. 5½'s job was
to prove that a real Work can be read under the governed protocol and arrive as
a valid, frozen proposal without becoming canonical structure. Whether she
perceived the organizing grammar of *this* book is **05B-8**, and it is a
founder judgment, not a test result.

Both real runs are recorded. The first one failed, and it is not deleted because
the second one passed: it established three things the passing run could not.

---

## The lane, complete

```text
real Work · 174 sections
      ↓
mechanical evidence · 24 observations
      ↓
PASS 1 · headings only · 0 bodies
      ↓
MAIA: request_sections — did not manufacture a tree
      ↓
host grants exactly 4 full sections · 5,122 chars
   within 4/request · 8/reading · 60,000 chars · no truncation
      ↓
PASS 2 · propose_structure
      ↓
host validates
      ↓
mixed StructureInterpretation · 0 unaccounted · 3 uncertain regions
      ↓
frozen proposal · reader provenance attached
      ↓
canonical fingerprint 86f8ae098e16 → 86f8ae098e16
```

---

## Run A — first real reading · REFUSED

```text
promptHash      239a1e0eaee7…
model           claude-opus-5
readerVersion   REAL-STRUCTURE-READER-01

pass 1          request_sections
  input         17,976 tokens
  output        350
  bodies        0

pass 2          propose_structure
  input         20,477
  output        4,413
  bodies        4

result          REFUSED
reason          child-outside-parent (THE SACRED FLAME, position 42)
storage         none
canonical       untouched
```

**What it established.**

1. **MAIA asked rather than guessed.** 174 headings and 24 observations did not
   settle the reading, and she used the read request instead of manufacturing a
   tree. This is the epistemic posture the whole lane exists to protect, and it
   was proven on the first real Work the reader ever saw.
2. **The host correctly rejected an invalid hierarchy.** A child whose range
   escapes its parent is not a tree 05A can hold. Nothing was stored.
3. **The refusal path had an evidence-custody defect.** The rejected reading was
   DISCARDED. That refusal cost a real call and four sections of the member's
   prose leaving their machine, and taught nothing: there was no way to see
   whether one stray boundary had spoiled a sound reading, or whether the
   validator had misread what she was expressing. **A guard that destroys the
   evidence it rejects cannot itself be checked.**

**Repair — `27433a5fa`.** `InterpretResult` carries `refusedReading` on a
validation refusal; the runner writes it to a local file and prints the form and
division count. It is not a proposal, no caller stores it, and it holds no body —
the host never gave the reading one to carry, which is asserted. The refusal
detail gained the numbers: `THE FLAME 0-1 sits outside PART 1-2` rather than a
bare name, which is the difference between one boundary to fix and a hierarchy
to rethink.

**Then — `710c4e3d5`.** The containment rule was TAUGHT, and the guard left
alone. Containment is part of the output language MAIA is asked to speak, not
interpretive guidance: the host knew `child range ⊆ parent range` and the reader
had never been told. Stated in both places she learns the contract — the
standing instructions and the `children` schema at every depth — with the
load-bearing second sentence:

> Never widen, shrink, or invent a boundary merely to satisfy this rule. If your
> reading cannot be expressed as a valid hierarchy, use siblings, uncertainty,
> an alternative reading, "partial", "ambiguous", or "none" instead.

Without it a mechanical constraint becomes pressure to alter the reading.
**Teaching did not replace enforcement**, and a falsifier pins that: the
instructions state the rule AND the host still refuses `child-outside-parent`.

The prompt hash moved `239a1e0eaee7 → 7d4e27cfa81d`. That is correct provenance:
Run B was made by a different reader from Run A, and the frozen rows say so.

---

## Run B — accepted real reading · PASS

```text
promptHash      7d4e27cfa81d…
model           claude-opus-5
readerVersion   REAL-STRUCTURE-READER-01

pass 1
  bodies        0
  result        request_sections
  requested     4 ids
  input         18,862 tokens
  output        329

pass 2
  result        propose_structure
  input         21,152
  output        4,110

coverage
  mode          requested-full
  sections      4 / 8
  chars         5,122 / 60,000
  truncated     false
  passes        2

interpretation
  form          mixed
  unaccounted   0 / 174
  uncertain     3 regions
  divisions     11 (2 levels)

proposal
  2a427a6f-86b5-4ba3-a901-267710977f25

canonical fingerprint
  before        86f8ae098e16
  after         86f8ae098e16
  mutation      NONE

elapsed         73.0s
```

The Work held **one** canonical unit before the run — Kelly's authored Fire
division — and holds the same one after. The negative witness is before == after
over units AND memberships, not a count and not an assertion of zero: on a Work
with authored structure, zero would have been the wrong question.

---

## OBSERVED READER BEHAVIOR

**Not founder acceptance of the interpretation.** These are properties of the
instrument working as specified, checkable from the output without judging
whether the reading is right.

**Null over invention.** Nine of eleven divisions carry no title. The
instructions say a null title is honest and an invented one is writing the
member's book; she took null nine times rather than manufacture names.

**The Work's vocabulary, not ours.** `front matter · body · opening movement ·
element · applied movement · back matter · references`. Not Part/Chapter — and
the account says why: the Work's own three-part scheme "exists only in the
contents list and cannot be laid over the body without inventing seams."

**Uncertainty populated, not decorative.** Nine of eleven units carry tags, and
the account names specific seams: 82/83 as a possibly disordered Water/Earth
join, 123–147 as perhaps a fourth movement rather than an applied part, and 42
as able to "open Fire or close the ground".

**The taught rule did not become pressure.** Position 42 is the same section
whose placement was refused in Run A. Told the containment rule, she did not
move a boundary to satisfy the model: 42 sits inside `p3` and the doubt is
carried in the uncertainty channel and the account. That is precisely what the
second sentence asked for, and it was the thing most at risk of going wrong.

**Four sections, spent on the open question.** She requested the material that
would settle whether 0–4 and 161–173 were writing or apparatus — the question
the mechanics flagged (`suspected-scaffold` at 1–4, 161–164, 166–173) and
explicitly could not answer. 8.5% of the character budget.

---

## What 5½ does NOT close

- **Whether the reading is correct.** The account makes checkable claims about
  the book — that 151 is a reader's-guide entry, that 161 titled PREFACE is a
  bibliography keyed by chapter, that several one-word headings are fragments
  split mid-passage. She read four sections in full and inferred the rest.
  **05B-8, and it is openable now that a proposal exists.**
- **Adoption.** There is no endpoint. 6 stays HOLD, and 5½ passing is not a
  reason to open it.
- **A production trigger.** Nothing in the app creates a reading. The lawful
  invitation for this witness was an explicit founder act naming one Work after
  inspecting the DRY_RUN request, which is what the runner is. No automatic
  reading, no import-triggered reading, no ambient re-reading after edits, no
  scheduled re-proposal.

---

## Reproduction

```bash
DRY_RUN=1 \
DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness \
MEMBER_ID=<the member who owns the Work> \
MANUSCRIPT=a3ae67fd-a21e-4948-8766-4c397d2e4712 \
npx tsx scripts/ws2-05b-reader-run.ts
```

Prints the entire pass-1 request — system and user both — and sends nothing.
Drop `DRY_RUN` and set `ANTHROPIC_API_KEY` to read. `SHOW_READING=1` adds the
account and titles, opt-in because titles are drawn from the member's own words.
Bodies are never printed, under any flag.

## Offline falsifiers

57 tests in `lib/manuscript/structure/__tests__/maiaReader.test.ts`, none needing
a key: what leaves the machine on each pass, the six forms, variant-incompatible
fields, the malformed-detail refusals, the body-scope ceilings, refused-reading
custody, and the taught-and-enforced containment pair.
