# Writer's Studio — Visual Reference Pack

The reference images are the **visual specification** for the Writer's Studio
rebuild. Not moodboards, not inspiration: acceptance targets. A field is
finished when its reference and a screenshot of the running product, at the same
viewport, read as the same designed product.

Stable paths so a session can address them without re-uploading:

```text
docs/design/writer-studio/
├── README.md                       this file — manifest, mapping, rules
├── CLAUDE_CODE_PROMPT.md           the starter prompt for a build pass
├── references/                     the specification (drop the pack here)
└── implementations/                screenshots of the running product
```

## Manifest — which image specifies which field

| File | Field | Unit |
|---|---|---|
| `references/01-work-home.png` | Work Home | WS-HOME |
| `references/02-structure-versions.png` | Structure & Versions | WS-STRUCTURE |
| `references/03-developmental-review.png` | Developmental Review | WS-DEVELOP |
| `references/04-writing-field-wide.png` | Writing Field | **WS-WRITE — canonical** |
| `references/05-materials-studio.png` | Materials Studio | WS-GATHER |
| `references/06-developmental-review-alt.png` | variant | WS-DEVELOP |
| `references/07-developmental-review-alt2.png` | variant | WS-DEVELOP |
| `references/08-writing-field-compact.png` | variant | WS-WRITE |

`04` is canonical for WS-WRITE: the Materials strip along the bottom makes
source material proximate without confusing it with manuscript. Among the
Developmental Review images, the canonical one is whichever shows the finding
disposition controls (Discuss / Keep / Unresolved / Dismiss) — that row is the
field's whole argument, that the writer adjudicates and MAIA does not.

## The build loop

```text
REFERENCE IMAGE → REPO CENSUS → REUSE/RECOMPOSE/EXTEND/NEW → IMPLEMENT
   → RUN APP → CAPTURE SAME-SIZE SCREENSHOT → COMPARE → FIX LARGEST → REPEAT
```

The census is done: `docs/programmes/writers-studio-v2/FIELD-MAP.md`, 71
capabilities, 38 already working.

Capture, wherever the app is running:

```bash
node scripts/capture-studio-field.mjs writing-field --url=http://localhost:3000 --sha=$(git rev-parse --short HEAD)
# → docs/design/writer-studio/implementations/writing-field-<sha>.png
```

Viewport is fixed at **1680×1050 @2x** inside the script, so two captures are
always comparable. Do not pass a viewport per run.

**Where this runs matters.** A remote Claude Code session has no database and no
env files — there is nothing for a browser to point at, so it cannot capture.
It *can* read both PNGs from the repository and do the comparison. So the
division is: build and compare in session; capture where the stack runs, and
commit the PNG.

## Comparison order

Earliest divergence costs the most. Work down, not around:

```text
composition · hierarchy · proportion · density · spacing rhythm ·
typography scale · palette + gold emphasis · states · interaction
```

Name the largest divergence, repair that one, capture again. One repair per
pass beats five speculative ones.

The test is not "does it have the right components". It is: could an old Press
screen be shipped and called this? If yes, the pass is not finished.

## Binding rules

- **Real data, real components.** Never hard-code the reference's content —
  "Elemental Alchemy", "7,842 words", "Dr. Elena Maris", "256 items" are its
  fixtures, not the product's.
- **Never a placeholder card where a real component exists.** The point of the
  census is that 38 capabilities already work.
- **Never degrade the design into generic Tailwind cards.** Dark Soullab ground,
  gold as emphasis and not decoration, generous type, manuscript-first priority,
  whitespace as load-bearing, MAIA as companion rather than chatbot.

## The one place the images are NOT authoritative

The references show `86% Movement Health`, `76% Overall Cohesion`,
`Coherence: Strong`, `Balance: Good`, `High Priority`, `87% Complete`.

**None of these ship as measurements.** They are judgments wearing the costume
of measurement. DECISIONS D-003 and DESIGN-CONTRACT §4 govern and they outrank
the image. Where a reference shows such a number, the implementation shows what
MAIA actually noticed, with the passage it noticed it in — and the writer
assigns the importance.

Everywhere else, the images are authoritative.
