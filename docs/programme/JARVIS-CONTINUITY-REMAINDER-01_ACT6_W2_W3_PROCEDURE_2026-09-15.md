# JARVIS-CONTINUITY-REMAINDER-01 · ACT 6 · W2/W3 production procedure

**Date:** 2026-09-15
**Runtime precondition:** `762c3c4ed` remains live.
**Transport:** running production service seam with fresh synthetic witness UUIDs, as corrected in ACT 5.
**Depth guard:** every setup response must increase `durableCompletedExchanges` by exactly one; final probe is forbidden unless depth is `6`.

## SEL-W2 · opaque first ask, no bridge

Fresh session / fresh synthetic witness identity. Serve exactly:

```text
0  Amber willow is an image that's been on my mind today.
1  The room feels quiet this evening.
2  I'm noticing the weight of my feet on the floor.
3  There is a soft hum from the computer beside me.
4  I want to stay with this simple moment for a little while.
5  The evening feels settled now.
```

Then, once durable depth is exactly `6`, serve once:

> What was that phrase I mentioned earlier?

This is deliberately a first opaque retrieval ask. No recent grounded retrieval episode exists.PASS requires:

```text
Processing Profile           FAST or CORE
L1/bridge                    abstained
L1 recovered line            ABSENT
A6 represented               bare tier aperture only (FAST=3, CORE=4)
MAIA response                must NOT assert "amber willow"
```

Any recovered displaced exchange is a FAIL. This witness explicitly validates terminal abstention at composition level; it does not ask MAIA to solve first-ask opaque memory.

## SEL-W3 · grounded one-hop preservation

Only if SEL-W2 passes. Use another fresh session and fresh synthetic witness identity. Serve exactly:

```text
0  Rootedness is the word that's been on my mind today.
1  The room feels quiet this evening.
2  I'm noticing the weight of my feet on the floor.
3  There is a soft hum from the computer beside me.
4  I want to stay with this simple moment for a little while.
5  The evening feels settled now.
```
Then, once durable depth is exactly `6`, serve once:

> What was I saying earlier about rootedness?

PASS requires:

```text
Processing Profile           FAST or CORE
L1/bridge line               ABSENT
L1 recovered                 includes index 0
A6 represented               tier aperture + recovered count
MAIA response                identifies rootedness
```

This proves the bridge classifier has not swallowed grounded retrieval. Index `0` is displaced under either supported aperture.

## Stop law

Any failure stops ACT 6 immediately. No retry, rephrase, tuning, repair, or `S` act. `S` remains independently unspent throughout. First-ask opaque memory remains a separate unsolved lane even when SEL-W2 passes by abstaining.