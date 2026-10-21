# JARVIS-MAIA-FREE-SYNTHESIS-01 · A4 — Model-Facing Render Identity · ACT 4

**Date:** 2026-09-16
**Mode:** OFFLINE R&D ONLY
**Production authority:** NONE

## Purpose

Before A5 spends model replay, prove that Narrative Gestalt and Relational Gestalt conditions can differ in **organization** without secretly differing in **evidence membership**.

If the two conditions receive different primary source material, a response-quality difference cannot be attributed cleanly to representation.

## Render contract

Both candidate renderers:
- start from the same validated A4 field and the same Gestalt id;
- carry an explicit derived/provisional warning;
- preserve member vs MAIA authorship;
- append the exact same primary-evidence block;
- exclude UI-generated shift labels;
- expose evidence ids and a SHA-256 digest of the exact evidence appendix.

They differ only in derived organization:

### Narrative Gestalt
A compact developmental projection: current Gestalt + configuration/temporal-development prose + the shared evidence appendix.

### Relational Gestalt
Typed observations + relations + configurations + temporal changes + current Gestalt + the shared evidence appendix.

## Falsifier

`A4-RI-F1 · REPRESENTATION-IDENTITY`

FAIL if:
- evidence ids differ;
- evidence digest differs;
- source-standing markers differ;
- one renderer admits material the other does not;
- UI/system interpretation is silently inserted as primary evidence.

PASS does **not** mean the conditions are equally compact or equally useful. It means later differences can be studied without a hidden evidence-selection confound.

## Standing

The renderer proof is executable at:

`scripts/research/free-synthesis/a4-context-render-proof.ts`

Reusable renderers live at:

`scripts/research/free-synthesis/a4-context-renderers.ts`

A4 stops after this proof. A5 may import these renderers for controlled replay; it may not wire them into serving cognition.
