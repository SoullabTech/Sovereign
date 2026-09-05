# WS2-07-F1 · PHENOMENON-04 — FIXED-21 STRESS WITNESS · 2026-09-04

**Founder-run.** Classifier `DEVELOPMENTAL-PHENOMENON-04`, candidate `bdc41ef99`.
**STATE: PHENOMENON-04 NOT YET ADJUDICATED · #1194 NOT CLOSED · MENTOR WITHHELD.**

Not "not accepted." Not yet adjudicated — the reason is in §4.

---

## 1 · The run

```text
classifier        DEVELOPMENTAL-PHENOMENON-04
promptHash        1116c66c0dd7c4c07925691a136339ea318c8e67842fcdddbee9e641c99daf3e
request digest    db34432096fdcb66027c8c489c6a5f97e9f9b8568787217c079a4b5e4d9772eb
reader            DEVELOPMENTAL-READER-02 · NOT CALLED
model             claude-opus-5 · lens development
doesNotEstablish  editorial-consequence, identical for all 21
acts              3 · one classifier call each · no retry · no database
gates             7 / 0
stable            20 / 21
```

## 2 · Resolved

**The `recurrence` / `movement` discriminant did its work.** All three Ines
claims — unstable under `-03` at `movement, recurrence, recurrence` — are now
`movement` in all three acts:

```text
act1/o5   movement · movement · movement
act2/o4   movement · movement · movement
act3/o5   movement · movement · movement
```

**`recurrence` narrowed to exactly three claims**, and they are the three
gesture claims the founder ruled admissible under the gesture clause: Mara's
motive twice declined, Mara's non-disclosure twice, the narration twice
pre-empting the lantern's significance. Each stable across all three acts.

`term-drift` drew zero placements across all 63. `unclassifiable` none.
No `unresolved-thread` / `movement` disagreement within any claim.

## 3 · Remaining

One claim varied:

```text
act1/o3  eleven-council
    act 1   unresolved-thread
    act 2   register-shift
    act 3   unresolved-thread
```

## 4 · New limitation discovered — and it governs how §3 may be read

**The 21-claim synthetic request combines claims from three independent
readings that never coexist in a production classifier call.**

In production one commission produces one reader result, and the classifier
receives only that reading's claims, in one call. This witness batched all 21
claims from three separate historical readings into a single request and
repeated it. `act1/o3` was therefore classified alongside two sibling readings
of the same manuscript material:

```text
act1/o3   "picked up once ... developed by naming its transformation ..."
act2/o3   "... and the council does not appear again in the two sections ..."
act3/o4   "... it does not recur in the two later sections read ..."
```

`act1/o3` carries no non-recurrence clause of its own. The other two do, and
both are stable at `unresolved-thread` — defensibly, since their own predicates
state non-recurrence. Those three claims would never share a real
classification call.

## 5 · NOT established

- **That `PHENOMENON-04` fails `act1/o3` under production-shaped input.**
- **That cross-claim contamination caused the observed divergence.**

The condition under which contamination is structurally possible was created by
the measurement. That is real evidence about the measurement, and it is not
evidence that the classifier semantics fail. An earlier in-session summary
recorded `unresolved-thread NOT RESOLVED`; that inference asserted more than
the run supports and is withdrawn here.

## 6 · Consequence — change the measurement, not the model

```text
-04 semantics     FROZEN · classify.ts NOT to be edited
-05               NOT AUTHORIZED
next              production-shaped fixed-batch witness
#1194             OPEN · NOT CLOSED
mentor            WITHHELD
07E               UNOPENED · UNAUTHORIZED
```

The frozen 21 are split back into the three actual reader outputs — batch A
(act 1, 7 claims), batch B (act 2, 7), batch C (act 3, 7) — and each seven-claim
request is classified three times identically. Nine calls, each with the shape
production actually has: one reading, its claims, one classifier call. When
`act1/o3` is tested, its two "does not recur later" siblings are not in context.

Machine gates only — K0 three frozen 7-claim batches · K1 classifier `-04` ·
K2 reader `-02`, not called · K3 family exactly eight · K4 each batch's request
byte-identical across its three repetitions · K5 no malformed / provider /
index / model-seam failure · K6 no retries. `unclassifiable` is measured, never
mechanically failed. No expected-label gates.

**The decision point that run creates, for `act1/o3` in batch A:**

| result | reading |
| --- | --- |
| `register-shift` ×3 | very strong acceptance evidence |
| `register-shift` mixed with `movement` | semantic ambiguity, possibly acceptable if both are defensible from that exact predicate |
| any `unresolved-thread` | `-04` has failed the explicit boundary under production-shaped input |

Instrument for this run: `scripts/ws2-07-f1-act3-fixed-claim-witness.ts`.
Fixture: `lib/manuscript/developmentalReading/__fixtures__/ws2-07-f1-claims.ts`.
Prior evidence: `WS2-07-F1_ACT3_FIXED_CLAIM_WITNESS_2026-09-04.md` (`-03`, 18/21).
