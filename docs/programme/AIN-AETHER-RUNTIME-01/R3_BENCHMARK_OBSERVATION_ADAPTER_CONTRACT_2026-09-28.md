# AIN-AETHER-RUNTIME-01R3 — Synthetic Event → Benchmark Observation Adapter Contract

Date: 2026-09-28

Parent runtime R2: `8a6286cce0953b60af9689ad755212b57c1c5463`

## Purpose

R3 converts only admitted synthetic runtime events into the closed Aether benchmark observation shape.

> **Translation may change representation; it may not strengthen standing.**

## Admission prerequisite

R3 does not accept arbitrary input.

The source event must already satisfy the R2 synthetic event membrane.

## Standing mapping

Synthetic member-authored events map to:

> `member_named`

Synthetic system-observed and imported events map to:

> `source_observed`

They do not become:

> `maia_hypothesis`

through translation.

## Temporal fidelity law

When the source temporal standing is one of:

- `has_been`;
- `is_being`;
- `may_become`;

R3 preserves it exactly.

The runtime envelope also permits `unknown`.

The closed benchmark observation type does not.

Therefore R3 refuses `unknown` rather than coercing it into a stronger temporal claim.

> **Unrepresentable uncertainty is a conversion stop, not permission to guess.**

## Confidence custody

The benchmark observation has no confidence field.

R3 therefore keeps source confidence in a provenance sidecar.

It does not convert confidence into benchmark uncertainty or any stronger epistemic standing.

## Consent custody

Explicit synthetic consent also remains in provenance rather than being discarded.

## Content fidelity

The adapter preserves:

- event reference;
- domain/facet reference;
- observation text;
- temporal standing where representable;
- source standing;
- original observation and domain in provenance.

No new qualities are inferred during R3.

## Authority non-escalation

Every successful adaptation declares:

- authority escalated: false;
- confidence increased: false;
- temporal standing strengthened: false;
- persistence authority: false;
- final meaning authority: member.

## No-live-data boundary

R3 remains synthetic.

No live member data.
No persistence.
No MAIA prompt binding.
No production route.
No runtime field derivation.

## Next boundary

> **AIN-AETHER-RUNTIME-01R4 — SYNTHETIC OBSERVATION BATCH → MEMBER FIELD DERIVATION · BENCHMARK ENGINE REUSE + ZERO PERSISTENCE ONLY**

R4 should feed a bounded batch of adapted synthetic observations into the existing benchmark field derivation engine, without any storage or live member binding, and verify the resulting field preserves all constitutional authority limits.
