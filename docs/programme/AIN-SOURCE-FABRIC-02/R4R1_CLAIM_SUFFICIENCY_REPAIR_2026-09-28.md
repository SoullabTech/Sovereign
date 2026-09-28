# AIN-SOURCE-FABRIC-02R4R1 — Claim-Sufficiency Generalization Repair

**Date:** 28 September 2026
**Parent evidence:** Blind Validation A at `e038d2499d85ed591cfeb027635ad61d570ed2fe`

## Defect

Blind Validation A falsified the narrow R3 claim detector.

Three unsupported claims passed evidence-strength checks because semantically relevant material existed:

- future certainty framed as proof;
- external revelation framed as confirmation;
- diagnostic identity framed as proof.

The repair therefore targets **claim shape**, not retrieval score.

No retrieval threshold, fusion weight, corpus, chunking rule, or embedding model changes in this act.
## Generalized unsupported claim classes

The repair distinguishes:

- **prediction** — certainty-framed future outcome / destiny;
- **external_revelation** — symbolic or imaginal material claimed as proof of external communication;
- **diagnostic_identity** — source material claimed as proof of a totalizing diagnostic identity;
- **third_party_interiority** — claims to know hidden motives or secret inner states;
- **symbolic_causation** — Astrology, Dream, Divination, or oracle material claimed as causal proof;
- **symbolic_directive** — symbolic material claimed to command or require member action.

A question *about* prediction, causation, diagnosis, Dream similarity, or symbolic standing remains conceptual orientation.

The classifier is therefore claim-form sensitive rather than topic-blocking.
## Regression standing

Repair tests:

> **4 / 4 PASS**

Existing R3 claim tests remain:

> **7 / 7 PASS**

Original supported gold population:

> **66 supported inquiries checked · 0 reclassified as unsupported**

The repair therefore addresses the blind claim-standing failure without broad suppression of legitimate epistemic inquiry.

## Next gate

The repair must be frozen before Blind Validation B is authored and executed.

Blind B must include:

- new future-certainty language;
- new external-revelation language;
- new diagnostic identity language;
- new third-party interiority language;
- new symbolic causation / directive forms;
- supported questions about those exact boundaries.

Graph expansion remains closed until Blind B is run.
