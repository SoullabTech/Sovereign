# SPM-F5 Conformance Ratification — 2026-09-17

**Standing:** RATIFIED CONFORMANCE RECORD · F5 CONFORMANCE FAIL / STOP · REPAIR CLOSED

## Authority

- Ratified governing law: `SPM-FC-01`
- Governing contract blob: `b52c53eae03851fb6bf21dbc41a1f38fe3a003d1`
- Examined organism: `89b79a4a59f42a1cd5951d6a9686d3a47772ddef`
- Ratified record: `docs/programme/SPM-F5_CONFORMANCE_RECORD_2026-09-17.md`
- Record SHA-256: `a6fc0750944c907b2ceabc462d6771927bae90f9e3eaa55a883cb0a9a397ed62`

## Founder act

At J7 the founder was presented the post-falsification conformance record and issued the exact ruling:

> **ACCEPT CONFORMANCE RECORD**

That act is the authority for J8. Green CI, repository state, or technical evidence alone would not confer ratification.

## Ratified result

For the 31 locally earned FC-01 laws:

- PASS: 6
- FAIL: 25
- UNKNOWN: 0
- NOT APPLICABLE: 0

I-19 remains a declared GAP and is not adjudicated. I-33 remains an imported prior law, FAIL, and is excluded from the 31-law local count.
## Ratification effect

J8 ratifies the conformance record as the accepted description of the examined organism at the bound commit. It does not alter the organism and it does not convert any FAIL into repair authority.

The five accepted root discontinuities are:

1. legacy destructive authority;
2. participation authority not organism-wide;
3. custody and lineage not governed as one graph;
4. origin laundering at intake; and
5. truth/provenance loss after a correctly known boundary.

## Unchanged stop conditions

```text
F5 CONFORMANCE          FAIL / STOP
F5 REPAIR               CLOSED
IMPLEMENTATION          CLOSED
SCHEMA / MIGRATION      NOT AUTHORIZED
UI / ROUTE REPAIR       NOT AUTHORIZED
PRODUCTION              UNTOUCHED
```

## Gate transition

```text
J7  Founder witness              CLOSED — ACCEPTED
J8  Conformance ratification     CLOSED — RATIFIED
J9  Repair decision              OPEN AS DECISION GATE ONLY
```

J9 does not itself authorize repair. A separate founder ruling must choose `OPEN F5 REPAIR` or `DO NOT OPEN F5 REPAIR`. Until that act exists, no implementation work may begin.
