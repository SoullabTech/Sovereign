# DESKTOP ↔ WRITER'S STUDIO CONTINUITY

**Status:** ratified contract · executable as `maia-desktop/test/dws01-writers-studio-seam.test.mjs`
**Date:** 2026-08-30

## The problem this exists to prevent

Writer's Studio develops on its own programme. Desktop converges on canonical `/maia`
and the canonical platform routes. That is a normal moving-target situation: Desktop can
be green against WS2-03C today and WS2-04 can change a route or a contract tomorrow.

The answer is **not** to stop Writer's Studio, and **not** to finish Desktop against a
pinned Studio snapshot and call it done.

> **Pin SHAs for evidence. Do not pin the product architecture to them.**

## The model

```
Writer's Studio programme
        │  develops independently
        ▼
canonical Studio capabilities
        │  presented through canonical platform routes
        ▼
MAIA Desktop container
```

Desktop **integrates the seam, not the snapshot.**

## Three standing rules

1. Writer's Studio keeps building on its own programme/branch. **Desktop work does not
   sequence or constrain WS2.**
2. Desktop consumes canonical Writer's Studio surfaces and state. It does **not** copy
   Studio components, Work models, routes, or conversation logic into `maia-desktop/`.
3. Desktop compatibility is **continuously checked**. When WS2 changes something
   load-bearing — Work identity, `/maia` handoff, route ownership, permissions, return
   semantics — the Desktop integration test is updated alongside it.

## The seven seams

Desktop must always be able to:

| # | Seam | Guard |
|---|---|---|
| 1 | open the current Writer's Studio from House | route asserted as a **House destination**, never as a literal in Desktop policy (`dh01:115` forbids the literal) |
| 2 | see the same canonical Work | Desktop's only knowledge of Studio is the **generated** `house-allowlist.json` |
| 3 | open canonical `/maia` situated in that Work | `isMaiaSurface` + navigable Studio→MAIA hop |
| 4 | preserve the same conversation identity | canonical `TURNS_PATH`/`MAIA_PATH`; **no surface-scoped thread id** |
| 5 | return to that same Work | the full walk asserted in both directions |
| 6 | respect current Studio permissions | Studio is navigable and holds **no microphone**; Desktop decides no audience |
| 7 | require no Desktop-specific Studio implementation | **the load-bearing guard** — no Studio route, Work model, or domain noun anywhere in `maia-desktop/src/` |

Seam 7 is the one that cannot be repaired later. Everything else here is fixable by
editing a route; a copy of Studio inside `maia-desktop/` would be green the day it was
written and silently diverge forever after.

## The milestone question

Every meaningful WS2 milestone answers one extra question:

> **Did this change alter any of those seven seams?**

- **No** → Desktop does nothing.
- **Yes** → the Studio lane records the changed contract; the **Desktop lane adapts its
  container/navigation boundary** — never the Studio implementation.

## Why parallel is now preferable

Because Desktop is converging around canonical `/maia` and the canonical platform
surfaces, improvements to Writer's Studio **flow into Desktop** rather than waiting for a
later port. Keeping both programmes moving is the better arrangement, not a risk to be
managed.
