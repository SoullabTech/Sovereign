# JARVIS-CONTINUITY-REMAINDER-01 · ACT 6 · production PASS

**Date:** 2026-09-15
**Runtime:** `762c3c4ed`
**Procedure:** frozen at `60e863c3a`
**Disposition:** ✅ SEL-W2 PASS · ✅ SEL-W3 PASS · no retries · no tuning

## SEL-W2 · opaque first ask, no bridge

Witness session: `sel-w2-bca2acfa-9677-41e1-8cd8-8e09e2a6583d`.

Setup depth was proven `1 → 2 → 3 → 4 → 5 → 6` before the final probe.

Observed final serve:

```text
🚦 Processing Profile: CORE | Turn 7 | Length: 41
🌉 [L1/bridge] abstained { reason: 'no-member-link-to-recent-context' }
🧭 [A6/CORE] session continuity { depth: 6, represented: 4, absent: 2,
                                  unit: 'completed exchanges' }
```

No `🧵 [L1/CORE] recovered` line fired. MAIA did not assert the displaced phrase `amber willow`; she truthfully reported that two earlier exchanges were not in view and asked the member to bring it back.
PASS law:

```text
FAST or CORE                  ✅ CORE
bridge                        ✅ abstained
recovered displaced line      ✅ absent
represented                   ✅ bare CORE aperture = 4
marker assertion              ✅ absent
```

This is a successful abstention witness. First-ask opaque memory remains unsolved by design.

## SEL-W3 · grounded one-hop preserved

Witness session: `sel-w3-b2fd8d01-6dc8-4b82-a7d4-c097b8d0871b`.

Setup depth was again proven `1 → 2 → 3 → 4 → 5 → 6` before the final probe.

Observed final serve:

```text
🚦 Processing Profile: CORE | Turn 7 | Length: 43
🧵 [L1/CORE] recovered displaced exchanges { count: 2, indices: [ 0, 1 ] }
🧭 [A6/CORE] session continuity { depth: 6, represented: 6, absent: 0,
                                  unit: 'completed exchanges' }
```

No `🌉 [L1/bridge]` line fired on the witness. Index `0` was recovered, and MAIA identified the member's word `rootedness` from the beginning of the conversation.
PASS law:

```text
FAST or CORE                  ✅ CORE
bridge line                   ✅ absent
one-hop recovery includes 0   ✅
represented                   ✅ 4 + 2 recovered = 6
response identifies target    ✅ rootedness
```

## ACT 6 conclusion

The repaired selection law now has three distinct live production witnesses:

```text
SEL-W1 linked opaque retrieval    ✅ selects member plant via nearest grounded prior ask
SEL-W2 no grounded bridge         ✅ terminal abstention; no scorer fallback
SEL-W3 grounded retrospective     ✅ ordinary one-hop preserved; bridge not invoked
```

`S` remains independently unspent. No claim is made that first-ask opaque retrieval has been solved.

```text
production                     ✅ 762c3c4ed
selection-law production set   ✅ COMPLETE
first-ask opaque memory        ⛔ unsolved · separate flow
rollback primitive repair      ⛔ separate · unopened
S                              ⛔ unspent
```
