# FOCUS-ASSEMBLER-CONTRACT-01B · WHOLE-WORK FIDELITY

**Implemented and locally verified 2026-09-09.** ⛔ No merge · no deploy · no
production migration · no flag · no witness · `#1275` FROZEN.

> ⭐⭐ **The whole Work handed to MAIA must contain exactly the characters the
> writer authored — no fewer, no more.**

## The repair

```text
whole_work → ordered draft sections → join('')      (was join('\n\n'))
```

One line, plus the reasoning kept beside it. `section` and `passage` are untouched.

**Why it is not cosmetic.** The database states the system's own contract: once a
draft is section-addressable, `content` MUST equal
`string_agg(s.text, '' ORDER BY s.position)` — every character belongs to a
section (`manuscript_working_drafts_round_trip()`). At this seam the returned
string **represents itself as the Work**, so two manufactured characters per
boundary make it a different Work.

⭐ And the decisive form: **a synthesized `\n\n` is indistinguishable from authored
text.** A writer whose section genuinely ends in a blank line could not be told
apart from the assembler's invention — the Work's own structure becomes unreadable
at exactly the boundary where structure matters.

> ⭐ **Structure may describe boundaries. It may not manufacture characters.**

Boundaries reach MAIA through `computed.writer_structure`, as structure — never as
invisible punctuation inside `retrieved.writer_work_context`.

⛔ **Not** solved by reading `manuscript_working_drafts.content`, by trimming, by
normalising whitespace, or by any other separator. The ruled read authority stays
section-native draft truth; the database invariant only says how those sections
lawfully flatten. Falsifiers hold each of those doors shut.

## The three obligations — proved

⭐ **Exact comparison, byte for byte.** A test that trims or canonicalises before
comparing would erase the very defect 01B exists to detect.

| | | |
|---|---|---|
| **O1** | whole Work `===` the canonical flattening | PASS |
| **O2** | whole Work `===` `manuscript_working_drafts.content` | PASS |
| **O3** | no character manufactured at a boundary (UTF-8 byte count) | PASS |

⭐ **The fixture carries the trap it is testing for**: `DRAFT ONE` **ends in a
blank line the writer authored**. If the assembler synthesized its own, the two
would be indistinguishable — so the fixture makes indistinguishability the thing
under test rather than a hypothetical.

**Contract gate: `13 passed · 0 failed`**, from an empty database through
`npm run gate:focus-assembler` (bootstrap → migrate → real SQL).

## Mutations — the required one, and the four it must not have broken

| mutation | verdict |
|---|---|
| ⭐ **`join('')` → `join('\n\n')`** | **3 failed** (O1 · O2 · O3) |
| `member_manuscripts` → `manuscripts` | 8 failed |
| Source substituted for draft | 6 failed |
| addressability predicate removed | 1 failed |
| code-point slicing restored | 1 failed |
| unmutated | **13 passed · 0 failed** |

⭐ The required mutation fails on **all three** obligations at once, and on nothing
else — the instrument locates the defect rather than merely reacting to it.

**Gates:** contract gate 13/13 · 5 mutations red · **208 unit tests · 0 failed** ·
typecheck 228 vs baseline 239 · 0 regressions · `check:no-supabase` clean.

## ⛔ Standing

```text
implementation subject   this commit          (whole_work fidelity)
DB instrument subject    edf6352f9adcc73b68ce688de9a97c835833b58e
schema input             baseline 0001_baseline_2026-09-01 + manifest
                         + database/migrations (529 ledger entries)

section / passage        UNCHANGED
01A instrument           UNCHANGED
merge · deploy · production migration · flag · witness      NOT AUTHORIZED
live DB schema state     STILL NOT ESTABLISHED
#1275                    FROZEN
```

Before any human witness, both runtime identities are still owed: the serving code
SHA, and a serving database proved to carry `manuscript_draft_sections`,
`section_addressable_at`, and `20260830000001` in its ledger. ⛔ **Do not apply the
migration to production to manufacture those conditions.**
