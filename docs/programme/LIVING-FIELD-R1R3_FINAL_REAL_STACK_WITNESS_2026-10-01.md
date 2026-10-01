# LIVING FIELD R1R3 — Final Real-Stack Witness

**Date:** 2026-10-01
**Canonical witnessed:** `f7f53dee9`
**Route:** `/maia/living-field?from=house`
**Origin:** `http://127.0.0.1:3145`
**Member:** existing non-sensitive local test member `qa-soulportrait-test`
**Standing:** final real-stack witness PASS for the mounted R1R3 instrument and House circulation repairs

## 1. Why this witness exists

The post-#1539 real-stack walk did not simply pass. It found member-visible defects in the mounted R1R3 experience:

1. the recursive SVG looked interactive but its regions were not clickable because `app/icon-fix.css` globally sets `svg { pointer-events: none }`;
2. the whole-field state exposed too many nested labels at once, making the field difficult to read;
3. a House arrival showed two competing explicit home actions: the House threshold `Return Home →` and the dashboard's ordinary `← Home`.

Those findings were repaired in separate changes rather than being erased from the historical record.

## 2. Repairs now in canonical

### #1563 — recursive interaction + progressive disclosure

Merge commit: `bde0f6590`

- the interactive Living Field SVG opts back into pointer events;
- whole-field labels disclose only the five elemental regions;
- entering a region reveals only its immediate children;
- the focused node is spoken once by the center overlay rather than duplicated inside its circle.

### #1564 — House return convergence

Merge commit: `dbc3036f2`

- House arrivals retain the threshold's `Return Home →`;
- the dashboard's ordinary `← Home` is suppressed only for `from=house` arrivals;
- non-House Living Field entry keeps its ordinary Home return.

## 3. Canonical context crossed after those merges

The final witness was not run on the repair branches alone. It was rerun on canonical `f7f53dee9`, after later canonical changes including:

- Living Field auth convergence and dynamic-param repairs;
- H1 cohort-gate changes;
- explicit Living Field MAIA-entry work;
- later JARVIS programme records.

The focused Living Field test population on this exact canonical state passes:

- `livingFieldInstrumentInteraction.test.ts`
- `livingFieldClarity.test.ts`
- `livingFieldAuthConvergence.test.ts`
- `livingFieldDynamicParams.test.ts`

**Result: 4 suites, 38 tests, all pass.**

## 4. Real-stack witness

The witness used a real `next dev` server, the real local PostgreSQL database, the repository's development-only authenticated login path, a real browser session, and the non-sensitive test member named above. No production content was used.

### Arrival / House circulation

Observed at `/maia/living-field?from=house`:

- House threshold present: **PASS**
- `Return Home →` present: **PASS**
- competing dashboard `← Home` absent: **PASS**
- Living Field doorway present: **PASS**
- explicit MAIA exploration affordance present: **PASS**

### R1R3 recursive instrument

Observed sequence:

`Living Field → Fire → Creation → Expression → Wider → Creation`

At the whole-field state, visible SVG labels are only:

`Water · Air · Fire · Earth · Aether`

At Fire, visible child labels are only:

`Beginning · Vision · Creation`

At Creation, visible child labels are only:

`Prototype · Expression · Experiment`

At Expression:

- the focused node is rendered as the single center voice;
- no duplicate SVG text label remains;
- `Back into Creation` is visible.

`Wider` returns from Expression to Creation correctly.

## 5. Mobile witness already paired with the repair

At `390×844` on the repaired real stack:

- document width remained exactly 390px — no horizontal overflow;
- whole-field progressive disclosure remained intact;
- Fire touch entry worked;
- Fire revealed only Beginning / Vision / Creation.

## 6. Admission statement

The original post-#1539 walk should remain recorded as the walk that found the defects. This record does not rewrite it as a pass.

This later canonical witness establishes that the specific member-visible failures it exposed — recursive SVG non-interaction, whole-field label overload, and duplicate House return — are repaired and remain repaired on canonical `f7f53dee9` after the later Living Field auth/runtime changes.

**Final standing: mounted R1R3 real-stack witness PASS.**

This record does not admit any unmounted R2 presentation and does not widen EARLY-FIELD cohort exposure by itself.
