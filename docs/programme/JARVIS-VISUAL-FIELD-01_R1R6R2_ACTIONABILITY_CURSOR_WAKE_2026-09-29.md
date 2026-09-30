# JARVIS-VISUAL-FIELD-01 · R1R6R2 — Actionability + Cursor Wake

**Parent:** R1R6 Cellular Living Field
**Reason opened:** Founder witness: opening shows physics, but nothing else feels actionable and cursor-over effect is not apparent.
**Current subject:** `52ba0ea3fc396d8cef1631d8478329ddab6e7f23`

## Founder finding

The field is directionally more alive at rest, but the interaction affordance remains too weak.

The problem is not absence of attention logic. The problem is that the field does not visibly announce:
- where interaction begins;
- which cells are interactive;
- that approaching a cell is already affecting the field.

## Law

> **Actionability should be felt before it is explained.**

## Required repair

1. Each visible cell gets a larger invisible pointer halo.
2. Entering the halo triggers proximity wake before the cursor reaches the membrane.
3. The nearby cell:
   - brightens clearly;
   - grows slightly;
   - shows a visible local halo;
   - reveals its name with stronger contrast.
4. Direct neighbors respond at low amplitude.
5. Cross-world bridges wake visibly enough to be noticed.
6. Cursor becomes pointer/grab appropriately.
7. Clicking the cell clearly enters deeper focus.
8. The rest state remains calm.

## Falsifier

If a founder can move the cursor over the field and still reasonably report “nothing happens,” R1R6R2 fails.

## Exit

Founder witness:
> **Does the field now unmistakably wake around the cursor and make interaction obvious without instructions?**


## Verification evidence

Real mouse-path witness against a cold local runtime:
- scoped TypeScript compile: PASS;
- halo approach before visible membrane: PASS;
- attention state at halo: **proximity**;
- Air membrane attention at proximity: **0.34**;
- visible-cell entry: **Glance**;
- sustained hover: **Attend**;
- continued hover: **Dwell**;
- Air ↔ Earth bridge activity at Dwell: **1.00**;
- browser page errors: **0**.

The defect was confirmed in code: the visible cell render had lost the exact-hover handlers even though the attention engine still existed.

R1R6R2 restores those handlers and adds larger interaction halos so the field wakes before precision hover is required.

## Current standing

**R1R6R2 IMPLEMENTED CANDIDATE — READY FOR FOUNDER CURSOR-WAKE WITNESS**
