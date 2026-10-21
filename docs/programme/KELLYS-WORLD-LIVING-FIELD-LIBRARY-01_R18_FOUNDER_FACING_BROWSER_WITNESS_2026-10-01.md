# KELLY'S WORLD — LIVING FIELD LIBRARY 01 · R18 Founder-Facing Browser Witness · 2026-10-01

## Purpose

Witness the actual Kelly's World Field Library renderer as one integrated founder-facing surface rather than accepting component/unit evidence as sufficient.

R18 uses the real `index.html`, CSS, generated Library corpus, renderer, Grokker modules, orientation modules, recovery shelf, and governed-work projections.

Only the Electron bridge is stubbed with read-only witness data so no provider, repository mutation, lifecycle mutation, or production authority can occur.

## Viewports

The final browser witness runs at:

- desktop: **1440 × 1100**
- narrow: **390 × 844**

The harness verifies the browser's actual `window.innerWidth` and fails if content creates horizontal overflow.

## Interaction witness

Both viewports prove:

- **What am I holding?** renders;
- Unfinished threads / recovery candidates render;
- Governed work renders;
- Needs Kelly / In motion / Watching are present;
- **Reset view** is present;
- Grokker query accepts ordinary text;
- **Trace this** returns indexed traces;
- a source packet can be prepared;
- no page-level JavaScript error occurs.

## Falsifier bites and repairs

### F1 — false narrow witness

The first harness used Playwright's wrong option name (`viewportSize`) and therefore both runs silently used the default 1280px width.

The witness refused that result.

Repair:
- use Playwright `viewport`;
- record actual browser width in the witness output.

### F2 — true 390px horizontal overflow

The first real 390px run exposed **17px page overflow**.

Repairs:
- header/nav may wrap;
- main/flex children may shrink;
- Grokker input row wraps;
- long source/label/excerpt text may break safely.

The next run removed page-level overflow but exposed **9px internal main overflow**.

### F3 — malformed recent projection

The overflow diagnostics exposed binary PNG bytes rendered as recent programme text.

Cause:
- full canonical programme corpus indexes only top-level programme records;
- recent Git-history projection had admitted nested screenshot files under `docs/programme/**`.

Repair:
- recent activity is now restricted to the same top-level text-record population as the canonical programme corpus;
- nested screenshot/evidence binaries remain in repository custody but do not masquerade as programme prose.

Recent activity therefore changed from **78 mixed Git paths** to **65 programme records**.

## Final witness

Final desktop result:

- `window.innerWidth = 1440`
- body scroll width = 1440
- main scroll width = 1440
- internal overflow offenders = 0
- renderer page errors = 0

Final narrow result:

- `window.innerWidth = 390`
- body scroll width = 390
- main scroll width = 390
- internal overflow offenders = 0
- renderer page errors = 0

Recovery shelf standing remained:

`12 candidates · RECOVERY_CANDIDATE_UNREVIEWED`

## Evidence artifacts

- `docs/design/contracts/screenshots/kellys-world-field-library-r18-wide.png`
- `docs/design/contracts/screenshots/kellys-world-field-library-r18-narrow.png`
- `jarvis-desktop/test/field-library-r18-browser-witness.mjs`

## Standing

**R18 MECHANICAL BROWSER WITNESS: PASS**

**Founder visual/aesthetic acceptance: PENDING.**

This record does not claim that the screenshots are aesthetically accepted by Kelly. The current remote tooling cannot present those Mac Studio screenshots back to the model for a trustworthy visual judgment.

No merge or deploy is authorized.

## Exact next boundary

**R19 — Founder visual walk / admission.**

Open the actual screenshots or run the branch locally in Kelly's World, then adjudicate:
- legibility;
- density;
- section ordering;
- language;
- whether the page feels like one coherent orientation field;
- whether any surface is too technical or too visually heavy.

Only after that should this branch move toward merge.
