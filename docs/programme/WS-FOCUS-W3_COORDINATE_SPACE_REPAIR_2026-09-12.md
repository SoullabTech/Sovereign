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
FOCUS-W2   act-record conflation    OPEN · not repaired · not normalized
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

## 6. Next

```text
1  one read-only confirmation of the frozen anchors
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
