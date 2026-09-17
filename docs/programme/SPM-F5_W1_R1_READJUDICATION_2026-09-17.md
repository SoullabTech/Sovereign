# SPM-F5 W1 — R1 Re-adjudication — 2026-09-17

**Standing:** P7 W1 RE-ADJUDICATION COMPLETE · R1 PASSES ON W1 SOURCE TREE · NOT YET CANONICALIZED

## Bound subject

- Governing law: `SPM-FC-01`
- Governing contract blob: `b52c53eae03851fb6bf21dbc41a1f38fe3a003d1`
- Prior ratified conformance record: `bbb1672d5e454f1f9051bdca76b8f71e681e88d8`
- Prior accepted organism: `89b79a4a59f42a1cd5951d6a9686d3a47772ddef`
- W1 implementation under re-adjudication: `13fcbc049a4f8c8c1e4d2908fa3e3c3832804bb0`
- W1 evidence: `docs/programme/SPM-F5_W1_LEGACY_SOVEREIGNTY_RETIREMENT_EVIDENCE_2026-09-17.md`

Only the six R1 laws are re-adjudicated here:

`I-1 · I-2 · I-3 · I-25 · I-30 · I-31`

All other FC-01 dispositions remain unchanged by this act.

## Method

P7 asks whether new executable evidence satisfies the original FC-01 law and adversarial test. It does not award PASS for implementation effort, naming, comments, or retirement intent.

Retirement is accepted only where the prohibited crossing is actually non-executable and no surviving surface makes the old promise.
# I-1 — PASS

**Law:** the subject of a destructive act is resolved from verified server-side identity; a caller-supplied identifier may not select the target.

### Prior failure

The legacy delete-memory corridor took `body.userId` as the destructive subject.

### W1 evidence

There is no destructive legacy act to target.

- the Next route accepts no request argument and performs no deletion;
- the standalone legacy delete handler returns 410 before reading `req.body` for subject selection or touching PostgreSQL;
- the Lab Tools surface has no destructive invocation;
- the previously conforming modern account-closure path is unchanged and continues to derive its subject from `getMemberIdFromRequest`.

### Adversarial case

Supply any foreign/caller-selected `userId` to the independently launched legacy service.

Observed outcome: HTTP 410, `success:false`, `accountChanged:false`, zero PostgreSQL calls.

**Disposition: PASS on W1 source tree.**
# I-2 — PASS

**Law:** a fixed public confirmation phrase may establish deliberateness; it may never establish authority.

### Prior failure

The legacy corridor's fixed phrase was the only barrier before a caller-selected destructive subject.

### W1 evidence

The destructive legacy route and service no longer inspect a confirmation phrase at all.

The phrase `DELETE ALL MY CONSCIOUSNESS DATA` is absent from executable W1 surfaces; it remains only in regression assertions that forbid its return.

The modern account-closure path is unchanged: its server-derived member identity is established before username confirmation.

### Adversarial case

Retain/submit a phrase without session authority.

Legacy result: 410 retirement, no act.

**Disposition: PASS on W1 source tree.**

# I-3 — PASS

**Law:** a surface's authority must be declared for that surface; authority may not arrive from a neighboring name/prefix/directory.

### Prior failure

`/api/sovereignty/delete-my-memory` matched the generic `/api/sovereign` rule only because `sovereignty`.startsWith(`sovereign`).

### W1 evidence

The access matrix now explicitly declares:
- exact `/api/sovereignty/delete-my-memory`;
- prefix `/api/sovereignty/my-data-summary/`.

The behavioral regression test proves `matchRule()` returns those W1 rules rather than the generic sovereign prefix.

The effective authenticated/free posture is unchanged; the authority source is no longer lexical accident.

**Disposition: PASS on W1 source tree.**
# I-25 — PASS

**Law:** where erasure is promised, absence is observed rather than assumed.

### Prior failure

The legacy corridor could report deletion success/completion without an observed successful erasure, including a service-unavailable branch.

### W1 evidence

W1 removes the legacy erasure promise and executable legacy erasure entirely:

- no destructive SQL remains in the legacy sovereignty corridor;
- the Next and standalone endpoints return 410 / no-change;
- the UI states that this legacy panel performs no memory deletion;
- no failure branch can claim that deletion occurred or was queued.

Retirement does not itself pretend to prove erasure. It removes the sole R1 counterexample that promised an unobserved erasure.

The previously adjudicated positive erasure specimen — manuscript vault destruction with explicit absence observation — is unchanged.

### Adversarial case

Make the legacy service unavailable or call the retired endpoint directly.

There is no erasure promise to falsify: the endpoint is a truthful retirement refusal.

**Disposition: PASS on W1 source tree.**
# I-30 — PASS

**Law:** a path that did not perform an act may not report that it did.

### Prior failure

The Next route's service-error branch returned `success:true`, “processed successfully”, and “queued” even though no queue write occurred. The UI treated `success` as completion.

### W1 evidence

- Next route: 410, no `success:true`, `accountChanged:false`;
- standalone delete handler: 410, `success:false`, `accountChanged:false`;
- Lab Tools surface has no completion state or destructive request;
- old processed/queued/completion strings are absent from executable W1 sources.

The HTTP standalone witness independently exercised the formerly dangerous service entry and received 410.

**Disposition: PASS on W1 source tree.**

# I-31 — PASS

**Law:** member-facing declared scope may not exceed executable scope.

### Prior failure

The legacy UI promised all data across all systems, permanently and immediately, while the service targeted five obsolete tables and could enter the completion UI through a false-success branch.

### W1 evidence

The retired UI now says only:
- the legacy panel no longer reads account data;
- it performs no memory deletion;
- the previous workflow is retired;
- current supported account controls live elsewhere.

The legacy summary no longer fabricates data state or deletion capabilities.
The retired APIs claim only retirement/no change, exactly matching executable behavior.

No legacy all-data/permanent/immediate/complete scope claim remains executable.

**Disposition: PASS on W1 source tree.**
# R1 result

All six laws that constituted R1 now pass on the changed W1 source tree:

```text
I-1   PASS
I-2   PASS
I-3   PASS
I-25  PASS
I-30  PASS
I-31  PASS
```

Therefore:

> **R1 — Legacy destructive authority is CLOSED on the W1 source tree at `13fcbc049a4f8c8c1e4d2908fa3e3c3832804bb0`.**

This closure is by retirement/containment of the legacy corridor. It does not establish complete member erasure, which remains governed by RC-3/S3.

## Updated branch conformance matrix

Prior ratified matrix:

```text
PASS   6
FAIL  25
```

W1 source-tree re-adjudication:

```text
PASS  12
FAIL  19
```
### PASS on W1 source tree

`I-1 I-2 I-3 I-6 I-7 I-8 I-9 I-16 I-18 I-25 I-30 I-31`

### Remaining local FAIL

`I-4 I-5 I-10 I-11 I-12 I-13 I-14 I-15 I-17 I-20 I-21 I-22 I-23 I-24 I-26 I-27 I-28 I-29 I-32`

### Separate standing

- I-19 remains GAP.
- I-33 remains IMPORTED PRIOR LAW — FAIL, outside the local denominator.

The overall F5 result therefore remains **FAIL / STOP** even on the W1 source tree.

## Canonical-status boundary

The **12 PASS / 19 FAIL** matrix is a P7 result for the W1 branch source tree.

It does not silently amend the already-ratified canonical conformance record.

Until a separate P8 canonicalization/merge act lands W1 into the canonical organism:

```text
RATIFIED CANONICAL RECORD     6 PASS / 25 FAIL
W1 CANDIDATE SOURCE TREE     12 PASS / 19 FAIL
```

No production claim follows from branch re-adjudication.
## Gate standing

```text
W1 / S1 implementation             COMPLETE
W1 evidence                        COMPLETE
P7 R1 re-adjudication              COMPLETE — 6/6 PASS on W1 tree

R1                                 CLOSED on W1 tree

P8 W1 canonicalization / merge     CLOSED — NOT AUTHORIZED
DEPLOYMENT                         NOT AUTHORIZED
PRODUCTION                         UNTOUCHED

W2 / S2                            NOT OPEN
W3–W9                              NOT OPEN
```

No later repair wave is opened by this record.

The only next programme decision is whether W1 should proceed to its separate P8 canonicalization/merge gate. That decision is not taken here.
