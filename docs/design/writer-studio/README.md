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

Committed 2026-08-27 in `1493c28c0`. Contents verified by reading the images,
not inferred from the filenames.

| File | Screen | Unit |
|---|---|---|
| `references/01-work-home.png` | Work Home | WS-HOME |
| `references/02-structure-versions.png` | Structure & Versions | WS-STRUCTURE |
| `references/03-developmental-review.png` | Developmental Review | WS-DEVELOP |
| `references/04-writing-field-wide.png` | Writing Field — **CANONICAL** | WS-WRITE |
| `references/05-materials-studio.png` | Materials Studio | WS-GATHER |
| `references/08-writing-field-compact.png` | Writing Field, second architecture | WS-WRITE |

**`06-` and `07-` are byte-identical to `03-`** — same md5, three copies of one
image. Six distinct references, not eight. Kept as committed; no unit may read
them as variants carrying extra information.

### 04 vs 08 — and a correction

An earlier note in this programme said 04 was canonical because it puts the
Materials strip along the bottom. **That was wrong, and it described 08.**

- **04 (canonical)** — five-mode top nav (WRITE · DEVELOP · EXPLORE · REVIEW ·
  PUBLISH), left rail split WORK SPACE / MAIA / TOOLS, MAIA adjacent to the
  manuscript, **Materials as a right rail**, bottom band with Versions,
  Outline/Threads/Timeline/Word Web, Goals, Statistics.
- **08** — no five-mode nav; flat left rail of fields; editor toolbar with
  find-in-chapter and Focus; **Materials as a horizontal strip along the
  bottom**; and MAIA's insights carry inline **disposition controls**
  (Discuss / Keep / Unresolved / Dismiss).

04 is canonical because the five-mode navigation is the shell the programme is
built around, and only 04 shows it. What 08 contributes is the disposition row
inside MAIA — the member-adjudicates rule appearing in the writing field, not
only in Developmental Review. Both carry forward.

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
