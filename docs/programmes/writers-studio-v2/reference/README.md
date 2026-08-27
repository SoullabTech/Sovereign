# Reference screens — the visual specification

These are **visual acceptance targets**, not inspiration. Every field is judged
against its image, at the same viewport, beside a screenshot of the running
implementation. Functional green tests alone are not acceptance for this
programme.

## Drop the files here, with these exact names

```text
01-work-home.png              WS-HOME     Work Home
02-writing-field.png          WS-WRITE    Writing Field  ← canonical variant:
                                          the one with the MATERIALS strip
                                          along the bottom
03-structure-versions.png     WS-STRUCTURE Structure & Versions
04-developmental-review.png   WS-DEVELOP  Developmental Review ← canonical
                                          variant: the one showing the finding
                                          disposition controls (Discuss / Keep /
                                          Unresolved / Dismiss)
05-materials-studio.png       WS-GATHER   Materials Studio
```

Variants of 02 and 04 were also supplied. Keep them if useful, named
`02b-…` / `04b-…`; the canonical file is what acceptance compares against.

**Why they are not already here:** they were shown in a Claude Code
conversation. Conversation attachments do not reach the filesystem — Claude Code
can see them in the transcript and cannot write them to the repository. Only a
person with the files can put them here. Until that happens
`DESIGN-CONTRACT.md` stays DERIVED and WS2-00 stays blocked, because a design
contract whose source material exists only in chat is not frozen.

## What lands beside them, per build

```text
walk/<field>-implementation-<sha>.png    the running surface, same viewport
```

## The convergence loop

For each field, per build pass:

1. Render the running surface at the reference's viewport.
2. Capture the screenshot into `walk/`.
3. Compare, in this order — the earlier a divergence sits, the more it costs:
   `composition · hierarchy · proportion · density · spacing rhythm ·
    typography scale · palette + gold emphasis · states · interaction`
4. Name the **largest** divergence. Repair that one.
5. Repeat until the two read as the same product.

Not pixel cloning. The test is whether an old Press screen could be shipped and
called the new Studio. If it could, the pass is not finished.

## Binding rules while recreating

- Real data and real components. **Never hard-code the screenshot's content** —
  "Elemental Alchemy", "7,842 words", "Dr. Elena Maris" are the reference's
  fixtures, not the product's.
- Never a generic placeholder card where a real component exists.
- Never ship a number from a reference that is a judgment wearing the costume of
  measurement (`86% Movement Health`, `Coherence: Strong`, `High Priority`).
  DECISIONS D-003 governs, and it outranks the image. Where the reference shows
  such a number, the implementation shows what MAIA actually noticed with the
  passage it noticed it in.

That last rule is the one place the images are **not** authoritative. Everywhere
else they are.
