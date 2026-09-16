# JARVIS-CONTINUITY-REMAINDER-01 · ACT 3 · Selection-law oracles

**Date:** 2026-09-15
**Law:** ACT 2 at `446fc2d36`
**Production:** `e57ca1baa` · unchanged
**Rule:** acceptance frozen before replacement bridge implementation.

## 1. Construction discipline

The suite is `tests/constitutional/lane1/c1-selection-law-acceptance.ts`.

Every corpus derives from the authoritative content-free production freeze. Serving cases use **pre-turn history**: the current probe is never inserted into its own history. P1 uses the recorded FAST-style aperture `3`; P2/P3 and their derivatives use the production W1 CORE aperture `4`.

The test contains a reference model only to prove the ACT 2 law is internally satisfiable before implementation. It is not production code and grants no implementation authority by itself.

## 2. Frozen positive oracles

- **P1 · faithful original bridge:** pre-turn history `0..39`; original probe; must recover member plant `22`.
- **P2 · production paraphrase:** W1 probe `what was that phrase I mentioned earlier?`; must recover `22` and must reject assistant-carried echo exchange `27`.
- **P3 · nearest grounded prior ask:** a nearer grounded retrieval ask identifies a different member target `13`; must recover `13` and not fall back to older `22`.
## 3. Frozen negative oracles

- **N1 · assistant-only object anchors:** the marker anchors are moved from the prior member ask into MAIA's reply. Correct result is full abstention; assistant language may not substitute for member object provenance.
- **N2 · single opaque ask:** prior asks are replaced by ordinary exchanges from the same corpus. No bridge exists; correct result is abstention.
- **N3 · interrupted retrieval episode:** an ordinary member turn sits between the current ask and older retrieval asks. Correct result is abstention; the bridge may not jump across it.
- **N4 · unresolved ambiguity:** more maximum-coverage member targets exist than bounded capacity. Correct result is abstention, not positional truncation.

## 4. Construction assertions

The suite asserts P1 active prefix is `[37,38,39]`, not the old post-turn `[38,39,40]` shape.

It asserts P2 active prefix is `[37,38,39,40]`, matching CORE aperture `4` at the later production witness.

It also asserts the W1 probe has **zero exact HOP-1 token overlap** with prior grounded source `39`. That preserves the production condition that killed the first bridge rather than accidentally making the new oracle easier.

## 5. Reference-law result

```text
P1  [22,24]  ✅
P2  [22,24]  ✅ · 27 absent
P3  [13]     ✅
N1  []       ✅
N2  []       ✅
N3  []       ✅
N4  []       ✅
```

## 6. Defeat-candidate lethality

The suite kills every deliberately wrong rule presented to it:

- always abstain → dies on positives;
- current exact-token bridge → reproduces production P2 failure `[5,15,27]` and dies;
- source-origin blind → dies, including directly on N1;
- target-origin blind → dies when assistant text is allowed to establish recovered content;
- bridge with fallback → dies on N2/N3;
- ambiguity cut by position → dies on N4 with `[20,21,22]`;
- oldest-grounded-source selection → dies on positives/P3.

The old production implementation's P2 output is therefore a property the frozen suite specifically rejects, not merely a historical anecdote.

## 7. Standing

```text
ACT 1 census        ✅ complete
ACT 2 law           ✅ complete
ACT 3 oracles       ✅ FROZEN · reference coherent · defeat set lethal
implementation      ⛔ untouched at freeze point
production          ✅ e57ca1baa · untouched
W2 / W3 / S         ⛔ unspent
```

ACT 4 may now implement only the law already frozen here.