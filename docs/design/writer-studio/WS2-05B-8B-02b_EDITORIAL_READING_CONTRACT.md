# WS2-05B-8B-02b — EDITORIAL READING CONTRACT

**Status:** **BUILT AND OFFLINE-WITNESSED. Steps 1–5 done; step 6 is Kelly's act
and has not been taken.**
**Opened by:** `WS2-05B-8B_EDITORIAL_REVIEW_SURFACE_02.md` — *BLOCKING DISCOVERY:
the labels do not exist anywhere.*
**Governing sentence, from the authorisation:**

> Don't make the surface smarter to compensate for an under-specified reading.
> Make MAIA's reading communicable at the moment she makes it, then keep the
> surface deliberately dumb and faithful.

```text
02b  editorial reading contract   BUILT · awaiting one real reading
02a  editorial surface            HOLD, behind 02b's real-reading witness
02c  Ask MAIA                     SEPARATE UNIT · not designed
05B-8b founder judgment           HOLD
05B-6  adoption                   HOLD
```

---

## The doctrinal line this unit rests on

> "Do not invent manuscript titles" does not mean "MAIA may not describe what she
> perceives."

| | whose words | may be null | ends up in the Work |
|---|---|---|---|
| `title` | the **Work's** | yes, and null is honest | yes, on adoption |
| `editorialLabel` | **MAIA's**, describing | yes, and null stays lawful | **never** |

---

## What was added

**`ProposedUnitDraft.editorialLabel?: string \| null`** — MAIA's own short
description of a division, for writing to the member *about* their book.

Three states, and they are not the same fact:

```text
absent   this reading predates editorial labels
null     MAIA considered it and could not honestly ground one
string   MAIA's description, offered as commentary
```

**`EditorialSynthesis` on every reading**, frozen with the interpretation:

```ts
thesis              what she thinks the Work is doing, in one or two sentences
strongestFindings   the few claims she would stand behind
questionsForAuthor  { label, explanation, sectionIds? } — a doubt turned outward
```

`account` is untouched. The synthesis does not replace it; it is the same
reading said to the person who wrote the book rather than about it.

---

## Where each rule is actually enforced, and why there

**`editorialSynthesis` is optional in TypeScript and required of MAIA.** That is
deliberate, and the asymmetry is the point. `StructureReader` is an interface —
fixtures implement it, and a fixture forced to invent an editorial letter to
satisfy a compiler proves nothing about the contract. The real contract is
enforced where the untrusted value arrives:

```text
tool schema        required: ['form', 'account', 'editorialSynthesis']
                   unit required: [... 'editorialLabel' ...]
parseReaderOutput  refuses a reading without a well-formed letter
                   refuses a division with no label field at all
interpretStructure refuses a question naming a section this draft does not hold
toReviewed         does not copy the label — it cannot reach the member's copy
```

Making the field non-optional in TypeScript would move the check to the one
place it cannot run: a boundary the model does not compile against.

**Absent and `null` are different answers, and only one is a reading.** A reader
that omitted the field never considered whether it could describe the division;
a reader that answered `null` considered it and declined. Defaulting absence to
`null` erases that difference and quietly restores the five-identical-rows
failure this unit exists to close. `title` and `kind` already refuse on absence;
the label is held to the same rule.

**Null stays lawful.** Nothing makes a label mechanically non-null. That would
move the invention pressure out of `title` and into a new field — the same
fabrication, one column over.

**A question's places are checked like a division's range.** The surface will
offer to show the member what a question is about, so an id the draft does not
hold would arrive there as a doorway onto nothing. The refusal names it as
`editorialSynthesis question: <id>` — structural, no prose.

**No migration.** `interpretation` is `jsonb NOT NULL` and already frozen by the
immutability trigger, so the letter and the labels are frozen by the same rule
as the rest of the reading, in the same column, on day one. What did need
checking is that they survive `assertNoProse` — `thesis`, `explanation` and
`strongestFindings` are MAIA's words *about* the Work, and a guard that read
them as the Work would refuse every reading made under the new contract. It
does not, and it still catches prose smuggled in beside them.

---

## The label cannot reach the Work

This is the claim 02b has to make good on, because a label that could become a
title would be exactly the invention the programme has refused throughout.

`toReviewed` enumerates its fields rather than spreading, so the label is not
copied. The member's `reviewed` copy is the only thing 6 could ever adopt from,
so a label that cannot reach `reviewed` cannot reach a manuscript by any path,
present or future.

Asserted on the **value** as well as the key — a future `toReviewed` that
renamed the field while still copying it would pass a key-only check — and
asserted again after the member has edited the copy and after
`choose-alternative`, which is the one operation that re-enters the member's
half *from* the interpretation.

---

## The adversarial fixture

`adversarialReading` in `lib/manuscript/structure/fixtures.ts`. Five untitled
siblings, all `kind: "element"`, distinguished only by their labels — Fire,
Water, Earth, Air, Aether.

**Why it had to be written.** The readability witness passed mechanically and
failed the moment a person read the page, and the fixture is how it got that
far: it copied the real reading's SHAPE — nested, mostly null titles, tags on
most divisions, three uncertain regions — and gave every division a DIFFERENT
kind. The real reading has `element` five times. Shape was the wrong property to
copy.

```text
test execution   ≠ type validation
script execution ≠ inclusion in ship program
gate identity    ≠ diagnostic identity
render fidelity  ≠ intelligibility
fixture shape    ≠ fixture content
```

It reproduces the adversarial **properties** of a real reading and is **not** a
reading of that book: the ranges are synthetic, the account is not MAIA's, and
nothing in the interpreter is fitted to it. It is a target for the SURFACE — the
one shape a review room must be able to draw legibly, and the shape every
earlier fixture let it dodge. Its own test asserts it stays adversarial, so a
later tidy-up cannot quietly return it to a shape every surface can already
draw. It refuses to run on fewer than 14 sections rather than folding the five
together.

It is kept **out** of `allReadings`, which is one reading per form: it is a
second `mixed`, and adding it would silently turn "each form once" into "each
form once, except mixed twice" in every consumer that iterates that map.

---

## The contract moved, and the row will say so

```text
READER_VERSION      REAL-STRUCTURE-READER-01     unchanged
promptContractHash  7d4e27cfa81d…  →  a1825a7c2f50…
```

**The version is deliberately unchanged.** It names the reader UNIT; the hash is
what distinguishes one contract from another, and it moved once already when the
containment rule was taught after Run A. Two proposals bearing this version and
different hashes were made by different readers, and the rows say so. Whether a
proposal carries an editorial letter is also answerable directly — from the
presence of `editorialSynthesis` in the row — so a version bump would add a
second way to ask a question the row already answers. **Flagged rather than
assumed: bump it if you would rather the version carried this.**

---

## Inspecting the contract without spending a run

```bash
CONTRACT_ONLY=1 npx tsx scripts/ws2-05b-reader-run.ts
```

Prints the standing instructions, both tool schemas and the hash. No database,
no manuscript, no key, nothing sent. It is the smaller half of `DRY_RUN=1`,
separated because the contract is the half that changes between readers, and
`DRY_RUN` also prints this Work's 174 headings and its observations — a lot of
scrolling when what you are checking is what MAIA was *asked*.

---

## Offline witness

```text
lib/manuscript/structure   8 suites · 193 tests · all green
lib/manuscript + lib/writersStudio  30 suites · 486 tests · all green
npm run typecheck          no regressions against the baseline
```

New falsifiers, by what they would catch:

```text
asks for a label on every division, and the letter on every reading
  → a schema that stopped requiring either

accepts an honest null label
  → a parser that made labels mechanically non-null

refuses a division with no label at all, rather than defaulting it to null
  → the silent restoration of five identical rows

refuses a reading with no editorial letter, on every form including none
  → a reading that arrives uncommunicated

refuses malformed editorial fields rather than normalising them
  → a blank thesis or a blank finding rendered as a line to read

accepts a letter that finds little and asks nothing
  → a parser that forced her to have opinions

carries the letter through to the interpretation, verbatim
  → the host editing MAIA's words on the way past

refuses a question naming a section this draft does not hold
  → a doorway onto nothing on the surface

editorial labels do not travel into the member's copy, by key or by value
  → the label becoming a title by any path, now or at 6
```

---

## What is NOT closed

**Step 6 — one new real reading of Elemental Alchemy.** Not taken. It needs
Kelly's key and is his act, on his machine, after inspecting the contract above.
Nothing in the app creates a reading; there is still no trigger, no
import-triggered reading, no ambient re-reading, no scheduled re-proposal.

**Whether the labels are any good.** Whether MAIA can honestly ground `Fire` on
that book — rather than declining to `null` five times, which the contract
explicitly permits — is a fact about the next reading, not about this code. If
she returns five nulls, the finding is real and 02a is still blocked; that would
be worth knowing, and is exactly what a real reading is for.

**02a, the surface.** HOLD behind that reading. The 02 spec's own warning
stands: doing the easy half first and calling it progress would repeat this
unit's mistake.

**The existing frozen proposal.** `2a427a6f-86b5-4ba3-a901-267710977f25` predates
the contract and carries no labels and no letter. It is not migrated, not
back-filled, and not re-read: an interpretation is immutable, and a letter
written for it now would be a second reading wearing the first one's date.
