# RELATIONAL-GEOMETRY-INTEGRATION-01 — R31 / H7e Query-Conditioned Projection

**Status:** EXECUTED · FROZEN CRITERION PASS  
**Date:** 2026-09-17  
**Authority:** offline projection-mechanism research only

## Question

Given the same earlier relational substrate, does allowing a selector to see the current member demand preserve the evidence relevant to that demand better than a demand-blind global selector?

The corpus, features, projection mechanism, and pass criterion were frozen in R30 before substrate or selector generation.

## Mechanism

```text
history before current turn
        ↓
shared relational substrate
        ├─ GLOBAL selector — no current turn
        └─ QUERY selector — same substrate + current member turn
                 ↓
        exact selected lines only
                 ↓
          blind feature decoder
```

Selectors returned IDs only, maximum four. Projection was deterministic concatenation of those exact substrate lines. Selectors could not create prose, relations, standing, or evidence.
## Result

| Condition | Later-relevant features | Recall | Perfect events | Mean words | Features / 100 words |
| --- | ---: | ---: | ---: | ---: | ---: |
| GLOBAL | 9/15 | 60.0% | 0/5 | 88.2 | 2.04 |
| QUERY | **12/15** | **80.0%** | **3/5** | 85.6 | **2.80** |

Frozen acceptance:

- QUERY aggregate recall strictly greater than GLOBAL: **PASS**
- QUERY worse than GLOBAL on no more than one event: **PASS — exactly 1/5**
- QUERY best or tied-best on at least four events: **PASS — 4/5**

**Frozen verdict: PASS.**

## Event detail

| Event | GLOBAL | QUERY |
| --- | ---: | ---: |
| Q1 desktop Keep correction | 2/3 | **3/3** |
| Q2 strategic assumption reframe | 2/3 | **3/3** |
| Q3 switch voice → text | 2/3 | 2/3 |
| Q4 iOS frustration | **2/3** | 1/3 |
| Q5 “give desktop MAIA a voice” | 1/3 | **3/3** |
## Strong positive case

At Q5, the demand-blind selector spent three of four slots on recurring upstream input-loop defects. It preserved only the generic desktop-MAIA goal.

The query-conditioned selector instead activated:

- desktop MAIA as the current product context;
- text interaction now working;
- prosody / voice quality already present in the field.

That moved later-relevant preservation from **1/3 to 3/3** without changing the relational substrate.

This is direct support for the proposition that present demand can reorganize cognitive foreground over a governed field without rewriting that field.

## Falsifier

Q4 shows the opposite hazard. The current member turn expressed frustration that the iOS defect was still unresolved.

QUERY correctly foregrounded the persistent duplicate-send defect, but it dropped a countervailing admitted fact preserved by GLOBAL:

> text messages were coming through clearly despite the double-send glitch.

The result fell from **2/3 to 1/3**.

The failure is not relation acquisition. The necessary line was already present in the shared substrate. It is a projection failure: current-turn relevance narrowed attention enough to omit materially countervailing structure.
## Interpretation

H7e supports a narrower architecture than persistent Gestalt:

> **Useful continuity can be produced by selective reactivation of an admitted relational field under the pressure of the present member act.**

The current turn acts as an **attention signal**, not an authority signal.

It may influence which lawful evidence becomes foregrounded. It may not:
- change standing;
- invent a relation;
- rewrite provenance;
- promote inference into member meaning;
- delete contradictory or countervailing evidence from the field.

This resembles ordinary human continuity more closely than transcript-total cognition: the full past need not be token-resident when the relational organization needed by the present encounter can be selectively reactivated.

This is a computational hypothesis about continuity, not a neuroscientific claim about how human memory literally works.

## New law

> **Present relevance may steer attention; it may not erase materially countervailing structure already admitted in the relational field.**

Query-conditioned projection therefore needs a non-collapse safeguard: a highly relevant projection may still owe a counterweight when the field contains an admitted fact that materially qualifies the apparent current frame.
## Architectural consequence

The accumulating ecological architecture is now:

```text
PRIMARY EVIDENCE
       ↓
ADMITTED RELATIONAL FIELD
standing · provenance · process · temporal geometry
       ↓
CURRENT MEMBER ACT
       ↓
QUERY-CONDITIONED ATTENTION
       ↓
SMALL DISPOSABLE PROJECTION
       ↓
FREE SYNTHESIS
```

No projection becomes memory. No projection becomes standing-bearing evidence.

## Successor falsifier

A successor **H7f — Contrast-Preserving Projection** should test whether a query-conditioned selector can preserve H7e's relevance gain while retaining one materially countervailing line when such a line exists.

The safeguard must be structural, not another instruction to “be balanced.” Candidate rule:

```text
query-selected evidence
        +
material qualifier / contradiction / correction
when one exists
```

H7f requires a new held-out corpus. H7e authorizes no live cognition exposure, serving integration, schema migration, memory write, or production response change.
