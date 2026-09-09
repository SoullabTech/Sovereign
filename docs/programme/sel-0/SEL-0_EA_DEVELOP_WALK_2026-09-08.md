# EA-DEVELOP-WALK-01 — Develop Room founder walk · PREPARED · NOT WALKED

**Authorized by** the founder ruling of 2026-09-08 retiring SEL-0 corpus 01 as confirmatory
(`SEL-0_CORPUS_01_RETIREMENT_2026-09-08.md`). Elemental Alchemy is no longer protected material,
because there is no longer a confirmatory benchmark to protect.

⛔ **Nobody has walked this.** `experience_verification` in `docs/design/contracts/develop-room.md`
remains empty and is the founder's to write afterwards, in the founder's own words.

---

## Identity

```text
source                  published Elemental Alchemy — the KDP final manuscript on the founder's
                        Desktop, copied and NOT modified
chapter                 Chapter 4 — The Elements of Wholeness   (17,635 chars, 19 headings)
visible sections        17
read sections           17
section identity        PASS      visible = draft = read topology = bodyScope = 17
evidence refs           PASS      44 section references · 16 distinct · 0 unresolved
entire chapter visible  YES
fixture                 EA-DEVELOP-WALK-01
production              UNTOUCHED
```

⚠️ **16 of 17 sections carry evidence, not 17.** One section is cited by no observation. That is
MAIA's reading, not a defect — she is not obliged to reference every section.

⚠️ **An earlier count of `16/17 unresolved` was my query's error, not the fixture's**, and is
recorded rather than quietly corrected: `section-run` refs carry `sectionIds` (an array), not
`sectionId`, so a NULL was counted as an unresolved section. Counting both ref shapes: 0 unresolved.

## How it was built — the real path, every step

```text
1  chapter copied from the published source        source file unmodified; epub markers
                                                   (ch010.xhtml) trimmed from the tail
2  POST /api/sovereign/manuscripts                 preview → save. 17 Source sections.
                                                   THIS is the step WALK-FIXTURE-01 skipped
3  POST /api/sovereign/manuscripts/[id]/draft      working draft, section-addressable, 17
                                                   draft sections, revision 1 with partition
4  POST /api/sovereign/manuscripts/[id]/readings   A REAL COMMISSION. MAIA read the chapter:
                                                   58s, 201, outcome `reading`, 8 observations,
                                                   DEVELOPMENTAL-READER-05, contract v2
```

**Nothing about the reading is hand-authored.** The eight observations are MAIA's, produced by the
deployed reader over exactly the text the founder can see.

### The chapter is readable, and this was verified rather than assumed

The Studio's writing surface is section-native: the outline lists all 17 sections and opening one
loads its prose into the editor. Probed in a real browser through a real sign-in:

```text
"1. My Morning Ritual"           editor 1,770 chars
"4. The Story of the Four Yogis" editor 2,158 chars
"14. The Fifth Element: Aether"  editor   331 chars   (genuinely a short section)
"15. Timeless Wisdom"            editor 1,046 chars
```

⭐ **This is the check WALK-FIXTURE-01 failed**, and it is why that fixture was retired as a
preparation defect rather than repaired: there, `manuscript_sections` was never populated, so no
Studio surface could render the Work at all.

## ⛔ The one thing that is instrumented, stated plainly

```text
lib/manuscript/boundary/candidateEligibility.ts   verdictFor()
gate       process.env.SEL0_WALK_F7_INSTRUMENTATION === '1'
effect     `unestablished` is treated as `eligible`
scope      the disposable walk worktree ONLY — never committed, absent from the main checkout
```

No F-7 adjudicator exists, so every real reading freezes `unestablished` for every observation and
the boundary correctly admits none. That is the truth about production, and it makes the offer path
unreachable — the founder could not experience the room at all.

⛔ **This instrumentation fabricates permission, never a verdict.** An explicitly recorded
`ineligible` is still refused. It says only: for one local walk, treat *not yet adjudicated* as
admissible so the surface can be seen.

⚠️ **So the walk demonstrates the ROOM, not that a production reading would offer anything today.**
In production this chapter would return `NO_LAWFUL_CANDIDATE`.

## Everything else is the real path

```text
ask route          app/api/sovereign/manuscripts/[id]/ask/route.ts   unmodified
boundary seam      the locked seam, plus the disclosed env-gated line above
selector           ws2-sel0-selector-01, locked at 64e439f66, unmodified
model              the real provider call
database           maia_sel0_walk — local, disposable
Develop surface    the held patch, applied in the disposable worktree only
```

## Clean arrival

```text
ask_threads                             0
ask_turns                               0
developmental_observation_standing_events  0
```

⛔ **The selector has NOT been run against this reading.** No offer has been produced, and I do not
know what MAIA will choose. That was deliberate: a scripted sequence would have primed the founder
before the walk.

## The walk

```text
sign in    http://localhost:3111/signin            walker / sel0walk
read       http://localhost:3111/writers-studio/canvas?m=68f73c0a-4aae-4455-9b1b-06758384af09
           open OUTLINE, read the chapter section by section
develop    http://localhost:3111/writers-studio/develop?m=68f73c0a-4aae-4455-9b1b-06758384af09
           arrive · ask MAIA what is worth looking at · what else? · leave it
```

Falsifiers W1–W10 are in `docs/design/contracts/develop-room.md`. W1 (arrival unchanged) and W8
(an ending reads as an answer) are the two that need a person.

## Standing

```text
EA-DEVELOP-WALK-01      PREPARED · NOT WALKED
reading                 REAL — MAIA's own, 8 observations, over the visible chapter
identity checks         PASS
F-7                     INSTRUMENTED · disclosed above · worktree only
selector                LOCKED · NOT RUN against this reading
WALK-FIXTURE-01         preserved as the preparation-defect record
SEL-0 corpus 01         RETIRED unrun · no test occurred
production              UNTOUCHED · migration UNAPPLIED there
MERGE / DEPLOY          NOT AUTHORIZED · none performed
```
