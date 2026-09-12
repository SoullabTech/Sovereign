# FOCUS-W3 — a passage offset names its coordinate space

**Lane** JARVIS — DEVELOPMENTAL CREATIVE INTELLIGENCE 01 · Writer's Studio / Focus
**Repair** `e44e43728` — accepted by founder act, 2026-09-12
**Instrument** `73e385006` — read-only frozen-anchor confirmation
**Antecedent** `docs/programme/WS-THREE-ACT-FOUNDER-WITNESS_RESULT_2026-09-12.md`
**Ruling of record** founder, 2026-09-12: *repair first; the later "spend Act 3
now" instruction is superseded by the W3 evidence.*

```text
FOCUS-W3   coordinate space         REPAIRED · ACCEPTED
FOCUS-W4   range_precedes_body      REAL FINDING · refusal is the law
           confirmation instrument  FAILED then REPAIRED · see §5d
FOCUS-W2   act-record conflation    CONFIRMED LIVE · §5b · not repaired
FOCUS-W5   withheld member spoken   RULED + REPAIRED · §5c · W5-1…W5-10 green
FOCUS-W4   confirmation at source   PASS · 4 of 5 · §5e
new Act 3                           UNSPENT · act count still 1
production                          UNTOUCHED
```

> **An identifier is meaningless without its namespace.**
> **An offset is meaningless without its text.**

---

## 1. What FOCUS-W3 was

Developmental passage anchors are Unicode code points into the section **as
read** — the stored text, heading prefix included. The Focus crossing applied
them to the **projected body**, which is that same text with the prefix removed.

Measured on the founder's own manuscript during the Act 3 witness:

| section | stored | prefix | body | anchor | outcome |
|---|---|---|---|---|---|
| §56 | 1692 | 23 | 1669 | 22–1692 | overflowed → **refused** |
| §45 | 2874 | 41 | 2833 | 60–1700 | **fit** → handed over shifted 41 |
| §62 |  887 | 20 |  867 | 22–400  | **fit** → handed over shifted 20 |

⭐ **The dangerous cases are the two that fit.** A successful slice in the wrong
space returns text of the right length, from the right section, and is the wrong
text — and nothing anywhere says it happened. The overflow was the safe failure;
it is the only reason the defect was visible at all.

MAIA's Act 3 answer is therefore **UNSCOREABLE on craft**: two of the four bodies
she reasoned from were mis-framed.

## 2. What was repaired, and what was refused as a repair

⛔ **Not** `start - heading.length - 2` at the call site. That arithmetic is wrong
twice: it assumes the separator is exactly `\n\n` when the projector also accepts
`\n`, and `.length` is UTF-16 where these offsets are code points — so a heading
with one astral character would reintroduce the very drift through the fix.

Instead:

- **`lib/manuscript/sections/coordinateSpace.ts`** — three named spaces
  (`stored_section_text`, `projected_section_body`, `revision_content`), one
  shape, **no default anywhere**. A default would reintroduce the defect the
  moment someone constructed a range without thinking about it.
- **`lib/writers-studio/focusPassage.ts`** — one authority on passage geometry.
  It takes the prefix from what `splitStoredSection` actually returned and
  measures it with the project's own `codePointLength`. It computes no prefix of
  its own.
- **The preflight and the Ask consume that resolver.** The witness produced
  `panel: 5 ready · actual: 4 read` because two places answered two different
  questions — currency ("does the historical anchor still correspond?") and
  projectability ("can those coordinates be mapped into the body MAIA will
  read?"). Readiness is now both, decided once.
- The space is stamped where the knowledge is — at the lift out of evidence —
  is part of the anchor's dedup identity, and the `work with this` door
  **throws** rather than encode a space its URL format cannot carry.

## 3. FOCUS-W4 — current but not projectable

⭐ **A passage can be current and not projectable, and projectability cannot be
rescued by convenience.**

§56's prefix is 23; an anchor beginning at 22 starts on the separator and
translates to −1. It is refused (`range_precedes_body`), **not clamped and not
nudged**. A one-character tolerance is clamping with a smaller number, and a rule
with a tolerance is a rule that gets widened.

> If the historical coordinates begin outside the text MAIA is authorized to
> treat as the writer's passage, the right answer is *"I cannot faithfully locate
> this passage"*, not *"close enough."*

⛔ **Whether the Develop producer should ever emit an anchor beginning in a
heading separator is a separate upstream question. It is not solved inside
Focus.**

⚠️ **A 3-of-5 prediction was made in this lane and is WITHDRAWN.** §56 was
already the withheld member before this repair; W3 changes what f1 and f5 are
*handed*, not how many cross. On an unchanged Work the expected shape is
**5 declared · 4 readable · 1 withheld**.

### Expected §56 state at the new witness

```text
membership   retained
content      withheld
reason       needs_confirmation / range_precedes_body
boundary     not established
receipt      none
```

⛔ **If the durable act record still writes `unavailable` for §56, FOCUS-W2 is
live at the act-record layer** even though the preflight and the crossing now
know the sharper truth. **Do not normalize that discrepancy away.**

## 4. Gates

```text
focusPassage.test.ts              37 / 37   (R0–R13)
Focus + Studio suites             44 suites · 950 tests · 0 failed
npm run typecheck                 229 vs baseline 239 · 0 regressions
npm run check:no-supabase         clean
```

Mutation-proofed against six known-bad implementations — all red, control green:

| # | known-bad implementation | failures |
|---|---|---|
| M1 | FOCUS-W3 itself — no translation | 15 |
| M2 | `heading.length + 2` | 4 |
| M3′ | a default coordinate space | 2 |
| M4 | clamp a start that precedes the body | 4 |
| M5 | currency drops projectability | 2 |
| M6 | the preflight re-implements the geometry | 3 |

⚠️ **Scoped gates green is not a whole-repository claim.** `lib/manuscript/ask/bodyGate/__tests__/canonicalFidelity.test.ts` is **red at `HEAD` with this
work stashed** — a baseline-known independent red, not a regression from
`e44e43728`. Ruling: attribution **no** · repair here **not authorized** ·
suppression **not allowed**. Its subject is claim → disclosure-boundary
ordering; it must not be casually waived at integration, and Focus must not
absorb it to make CI green. It belongs to the bodyGate/disclosure lane.

## 5. ⭐⭐ Candidate cross-programme law — instrument calibration

Found by running the falsifiers, not by reasoning about them: **the first fixture
could not have detected the defect it was written to detect.** Bodies were
`'x'.repeat(n)`, and in homogeneous text every offset returns the same string, so
the displacement mutation passed against FOCUS-W3. The fixture had the **right
dimensions and the wrong information content**.

> **Instrument-calibration candidate.** Before a falsifier is admissible, its
> fixture must be demonstrated to detect the canonical defect it claims to
> expose. For displacement-sensitive properties — coordinate, ordering,
> identity, routing, alignment — the fixture must contain position-distinguishing
> information; dimensional validity or homogeneous content is insufficient.

Operationally:

```text
target defect
→ inject canonical known-bad mutation
→ fixture MUST distinguish bad from good
→ only then may the fixture test the implementation
```

```text
STATUS      candidate cross-programme law
ORIGIN      FOCUS-W3 / R0
SCOPE       prospective only
PROMOTION   canon only after:
            (a) an independent lane reproduces the class, or
            (b) founder explicitly ratifies it as programme-wide methodology
```

⛔ **No repo-wide sweep is authorized from this finding, and canon is not
amended.** The progression is `finding → lane law → independent recurrence or
explicit methodological ratification → canon`. This is the second step and no
further. R0 in `lib/writers-studio/__tests__/focusPassage.test.ts` is its local
expression; the law is recorded here so it is neither buried as an
implementation detail nor promoted on a single observation.

## 5b. FOCUS-W2 — CONFIRMED LIVE, and worse than recorded

Read from the witness database, act `d7cb7317` (`working_draft_version 34`,
created 12:53:37, the **pre-repair** crossing):

```text
ordinal  member  currency_state  body_available  has_receipt
   1       f1     current             t              t
   2       f2     unavailable         f              f
   3       f3     current             t              t
   4       f4     current             t              t
   5       f5     current             t              t
```

⭐ **Five receipts exist for that act, not four.** One was established and never
crossed, and the position query names it:

```text
.347968  crossed    cd816b2b   position 44  →  §45
.383418  attempted  1e58bb81   position 55  →  §56   ⛔ never crossed
.438133  crossed    c9234752   position 56  →  §57
.444455  crossed    6313036b   position 57  →  §58
.447127  crossed    70f8c7fd   position 61  →  §62
```

⛔ **So §56 REACHED a disclosure boundary, and the read then failed.**
`currency_state = 'unavailable'` was written *from that read failure* — for a
section that is plainly still in the Work, at position 55, and that had just
been given a boundary. `unavailable` means *the section is no longer in the
Work*; the truth was `range_out_of_bounds`, the pre-repair overflow.

Two durable records also disagree: the act says f2 `has_receipt = f`, while a
receipt row for f2's attempt exists. **The act record cannot answer "was a
boundary established for f2?"**

⚠️ `position` is 0-indexed — the writer's §45 is position 44. The confirmation
instrument now prints `§N` as the writer names it, for the same reason.

## 5c. FOCUS-W5 — a withheld member is absent from disclosure and present in the conversation

**RULED AND REPAIRED, founder act 2026-09-12.** The finding as observed is kept
below unchanged; the ruling and the repair follow it.

In the same pre-repair act, MAIA received **no character of §56** (`f2` above).
In the conversation seeded by that crossing she nonetheless wrote:

> *"Section 56 gives the same sequence again and attaches meanings to it —
> dampness as spiritual distraction, the flames as a change in energy under
> challenge…"*

and, of the Focus Set:

> *"the five places I actually saw"*

She saw four. The panel correctly said four. The run's load-bearing
recommendation — *what section 56 is for* — rests on the member she was not
given.

⭐ **The defect is not that she mentioned §56.** Membership MUST reach her: she
has to know a place is in focus and withheld, or she cannot say so. The defect
is that content claims about a withheld member are indistinguishable, to the
writer, from content claims about a disclosed one — and she narrates both in the
voice of having read them.

Whether that paragraph was drawn from the observation text (grounded in the
finding) or invented cannot be told from the surface, and **that
indistinguishability is the finding.**

⛔ This is a cognition-surface finding, not a geometry one. It will survive the
FOCUS-W3 repair and reappear in the new witness unless something changes
upstream of the prompt. It is recorded here awaiting a founder ruling; nothing
is designed around it.

## 5d. Candidate lane law — the authoritative read seam

The FOCUS-W4 confirmation instrument **failed on its first run**, and failed
instructively. It issued its own SELECT over
`manuscript_draft_sections JOIN manuscript_working_drafts JOIN manuscripts` and
asked for `s.heading`. Three things were wrong at once: there is no
`manuscripts` table, `manuscript_draft_sections` has no `heading` column (the
heading is on the Source row, through `source_section_id`), and ownership is
`manuscript_working_drafts.member_id`.

⛔ **The wrong SQL is the small half.** Founder, 2026-09-12:

> **If an authoritative read seam already exists, a witness that reimplements
> the read is itself a new source of disagreement.**

`loadEditableSections` already owns the member-scoped current-draft read and the
Source-heading join, and Canvas, the preflight and the Ask all go through it.
The repair was therefore not better SQL — it was **no SQL**. The instrument now
consumes that seam, loading only the anchored sections.

```text
STATUS      candidate lane law
ORIGIN      FOCUS-W4 instrument failure, 2026-09-12
SCOPE       prospective only
PROMOTION   canon only after:
            (a) an independent lane reproduces the class, or
            (b) founder explicitly ratifies it as programme-wide methodology
```

⭐ Same family as §5's calibration law and as FOCUS-W3 itself: **a second
implementation of a thing that must agree is a defect generator.** Three
instances now — the geometry, the fixture, the read. None is promoted to canon
on that basis; recorded so the pattern is visible when a fourth arrives.

## 5e. FOCUS-W4 — CONFIRMED AT SOURCE

Run by the founder on the repaired instrument at `77b4fef98`, twice, identically:

```text
READING   3f692e22   REVISION 7   DRAFT 48ccfc89   DRAFT VER 34

§45  60–1700   stored 2874 · prefix 41 · body 2833   →  19–1659   PROJECTABLE
§56  22–1692   stored 1692 · prefix 23 · body 1669   →  -1–1669   REFUSED range_precedes_body
§57  whole section                                                 digest unchanged
§58  whole section                                                 digest unchanged
§62  22–400    stored  887 · prefix 20 · body  867   →   2–380    PROJECTABLE

DECLARED 5 · EXPECTED READABLE 4 of 5 · withheld §56 range_precedes_body
```

⭐ Every number matches the session reconstruction exactly, so the reconstruction
is now evidence. §56's frozen anchor really does begin one code point inside its
separator.

⭐⭐ **ALL FIVE DIGESTS UNCHANGED, AT DRAFT VERSION 34 — the same version as the
failed act.** The Work has not moved since revision 7, so the new witness is a
CONTROLLED comparison: same Work, same anchors, same digests, and the repairs as
the only delta. That property is rare and should not be spent casually.

## 5f. FOCUS-W5 — the ruling, and the structural repair

> **A withheld Focus member may remain present as attention, but Focus may not
> supply enough identity or semantics for MAIA to present claims about its
> current content as though she read it.**

⛔ **Stronger prose in the prompt is NOT an adequate repair.** The pre-W5 prompt
already told her a member with no passage was material she had not been given.
She did it anyway. So the repair is structural.

For a withheld member, Focus cognition may carry `focus-local identity ·
ordinal · state · active false · bodyAvailable false`. It may not carry
`current body · range · summary · semantic description · digest-derived
description · current-content claim` — **and, per the Q1 authority rule, not the
section identity either.** Section identity travels only under a lawful
structure authority; Focus membership does not confer it.

```text
READABLE MEMBER   F1 + section identity + authorized body
WITHHELD MEMBER   F2 + ordinal + withheld state
                  NO section identity from the Focus producer · NO body
```

⛔ The server and the durable act still hold the real identity for provenance.
This governs what enters response-producing cognition.

**Prior lawful knowledge is not erased.** If a separately admitted source — an
earlier developmental reading — bears on the withheld place, MAIA may say so,
**with the provenance explicit**: *the earlier reading described it as X, and I
could not check that against the current passage.* The defect W5 names is
**source collapse**, not recall.

Implemented as: `sectionRef` present **iff** `status === 'readable'`, enforced in
`focusParticipation()` in both directions (a withheld member carrying one is
refused; a readable member lacking one is refused, because an unattributed
passage is what F7 forbids), the crossing supplying it only on the readable
branch, and the membership sentence carrying the attribution instruction.

```text
W5-1   withheld member reaches cognition as membership              PASS
W5-2   no Focus-authorized sectionRef · id appears nowhere          PASS
W5-3   no body / range / summary / semantic description             PASS
W5-4   readable members keep distinct identity and bodies           PASS
W5-5   rendering still states total 5 and readable 4                PASS
W5-6   removing the withheld member entirely FAILS                  PASS
W5-7   reintroducing its sectionRef FAILS                           PASS
W5-8   separately admitted material stays attributable              PASS
W5-9   withheld material not described as current, unsourced        PASS
W5-10  MUTATION · identity without a body → RED                     PASS
```

Mutation-proofed — all red, control green:

| # | known-bad implementation | failures |
|---|---|---|
| N1 | FOCUS-W5 itself — withheld member keeps its identity | 4 |
| N3 | absence as the repair — withheld members dropped | 10 |
| N4 | the source-attribution instruction removed | 3 |

⚠️ **N1 first scored 3, and the gap was my own instrument.** The pure-contract
falsifiers build compliant members, so they cannot notice a PRODUCER that hands
the identity over unconditionally — the gate was calibrated against itself. A
producer-level obligation now runs the real crossing and inspects what it built
(`focusSetCrossing.test.ts`, P13 section). **The §5 calibration law, applied to
the instrument written to enforce §5c.**

⭐ **A pre-existing falsifier asserted the defect.** `focusSetCrossing.test.ts`
F1 required EVERY member's section id to appear in the rendered text, withheld
included — naming a withheld place was a passing condition. Migrated in place
with the supersession recorded: all five members are still named, by the
identity each one HAS.

## 5g. W2 as a free acceptance check

Under the repair the chain is: §56 is present and unprojectable → currency
`needs_confirmation` (R11) → not `mayDisclose` → **no boundary, no receipt** →
status `unverified` → act row `currency_state = 'unverified'`. The table's CHECK
already admits exactly `current | unverified | unavailable`, so no migration.

The old act's `unavailable` came from the last branch — a member that WAS
authorized, got a boundary, and whose read then failed. That path is now
unreachable for §56.

```text
NEW ACT 3 · §56 ACCEPTANCE
f2.currency_state      unverified          ⛔ if 'unavailable', W2 remains live
f2.body_available      false
f2.receipted           false
receipts for the act   exactly 4, all crossed
                       ⛔ ZERO attempted-never-crossed rows
```

⛔ The old act `d7cb7317` stays untouched as historical evidence of the defect.

## 6. Next

```text
1  DONE · read-only confirmation of the frozen anchors — PASS, 4 of 5
     DATABASE_URL=… npx tsx scripts/witness/focus-w4-frozen-anchor-confirm.ts \
       --work <manuscriptId> --reading <readingId> --member <memberId> --observation o1
   every statement a SELECT · no act · no receipt · no model call
   no member prose printed — ids, code-point lengths, booleans, refusal names
   the verdict comes from resolveFocusPassage itself, never a second copy

2  new Act 3 witness
     act count            1 → 2 · delta exactly +1
     active target        must persist if clicked
     triple press         must still produce ONE new act
     §45 / §62            must now be correctly framed
     §56                  must not cross if 22–1692 is confirmed
     MAIA cognition       now scoreable
```

⛔ The live server preflight gets the final word if the Work has changed. No
acceptance count is predeclared.

```text
HELD   RevisionProposal · staged diff · manuscript mutation · write authority
       production activation · WRITERS_STUDIO_FOCUS_ENABLED off in production
OWED   access-matrix treatment for /api/writers-studio/focus and /focus/currency
       (both pass today only because unmapped routes are allowed)
```
